<script lang="ts" setup>
import { ref, watch, onMounted, reactive } from 'vue'
import type { Ref } from 'vue'
import { storeToRefs } from 'pinia'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import useCommon from '@/use/useCommon'
import NavBar from '@/components-business/navBar/navBar.vue'
import useAdminStore from '@/store/adminBusiness'
import { getCookie } from '@/utils/cookie'
const cachedComponents = ref<string[]>([])
const defaultActive = ref<string>()
const locale = zhCn
const store = useAdminStore()
const { showMenu, menu, tabRoutes, selectMenuIndex, isAdmin, allRoutes } = storeToRefs(store) as {
    showMenu: Ref<boolean>
    menu: Ref<any[]>
    tabRoutes: Ref<any[]>
    selectMenuIndex: Ref<any>
    isAdmin: Ref<any>
    allRoutes: Ref<any[]>
}
const { push, route, router, toMiddlePlatformFn } = useCommon()
const navName = ref()
const menuTitle = ref<any>('')
const getDefaultActive = (value: any) => {
    allRoutes.value.forEach((item: any) => {
        if (item.name === value) {
            defaultActive.value = item.index
        } else if (item.name !== value && item.children && item.children.length) {
            item.children.forEach((it: any) => {
                if (it.name === value) {
                    defaultActive.value = it.index
                }
            })
        }
    })
}
const getMenu = (arr: any) => {
    if (!arr?.length) return
    // 一次性排序，将企业中心，消息中心,将智能订舱放在最后
    const sortedArr = [...arr].sort((a, b) => {
        // 需要放在最后的特殊项
        const specialItems = ['companyCenter', 'news', 'toMiddlePlatform']
        if (specialItems.includes(a.name) && !specialItems.includes(b.name)) return 1
        if (!specialItems.includes(a.name) && specialItems.includes(b.name)) return -1
        return 0
    })
    sortedArr.forEach((item: any, index: number) => {
        if (item.children && item.children.length > 0) {
            item.index = `${index}`
            item.children.forEach((it: any, itIndex: number) => {
                it.index = `${index}-${itIndex}`
            })
        } else {
            item.index = `${index}`
        }
    })
    getDefaultActive(route.name)
    menu.value = sortedArr
}
onMounted(() => {
    if (tabRoutes.value.length === 2) {
        navName.value = tabRoutes.value[0]?.name
        getDefaultActive(tabRoutes.value[0]?.name)
    }
})
const getTitleByRouteName = (routeName: any, routes: any): any => {
    for (let route of routes) {
        if (route.name === routeName) {
            let titles = [route.meta.title]
            if (route.parentTitle) {
                titles.unshift(route.parentTitle)
            }
            return titles.join('/')
        }
        if (route.children) {
            for (let child of route.children) {
                child.parentTitle = route.meta.title
            }
            const result: any = getTitleByRouteName(routeName, route.children)
            if (result) return result
        }
    }
    return ''
}
watch(
    () => route,
    (v) => {
        getDefaultActive(v.name)
        menuTitle.value = getTitleByRouteName(v.name, allRoutes.value)
    },
    {
        immediate: true,
        deep: true
    }
)
watch(
    () => allRoutes.value,
    (v) => {
        getMenu(v)
    },
    {
        immediate: true,
        deep: true
    }
)
const removeTab = (targetName: any) => {
    const tabs = tabRoutes.value
    let activeName = navName.value
    if (activeName === targetName) {
        tabs.forEach((tab: any, index: any) => {
            if (tab.name === targetName) {
                const nextTab = tabs[index + 1] || tabs[index - 1]
                if (nextTab) {
                    activeName = nextTab.name
                }
            }
        })
    }
    getDefaultActive(activeName)
    navName.value = activeName
    tabRoutes.value = tabs.filter((tab) => tab.name !== targetName)
    // 销毁缓存的组件
    cachedComponents.value.push(targetName) // 将目标组件添加到排除列表
    push(activeName)

    // 一段时间后从排除列表中移除，以便再次访问时可以重新创建
    setTimeout(() => {
        cachedComponents.value = cachedComponents.value.filter((name) => name !== targetName)
    }, 500)
}
// 根据路由meta决定是否缓存
const getCachedComponent = (route: any): string[] => {
    const allRoutes = router.getRoutes()
    const matched = allRoutes.filter((item) => item?.meta?.keepAlive)
    const result = matched.map((item) => item?.name).filter(Boolean)
    // 过滤掉已经被排除的组件
    const res = result.filter((name) => !cachedComponents?.value?.includes(name as string)) as string[]
    return res
}
const tabClick = (v: any) => {
    getDefaultActive(v.paneName)
    push(v.paneName)
}
const onclickMenu = (item: any, index: any) => {
    // a. 未提交：弹窗提示-请先提交企业信息，审核通过后解锁其他模块。
    // b. 审核中：弹窗提示-审核通过后，可解锁其他模块。
    // c. 已提交审核驳回：弹窗提示-请修改企业入驻信息，审核通过后解锁其他模块。
    // d. 已提交审核通过：直接跳转到对应模块。
    if (item.name === 'toMiddlePlatform') {
        toMiddlePlatformFn()
        // router.go(0)
        return
    }
    defaultActive.value = index
    push(item.name)
}
watch(
    route,
    (v) => {
        navName.value = v.name
    },
    {
        deep: true,
        immediate: true
    }
)
watch(
    selectMenuIndex,
    (v) => {
        if (v) {
            defaultActive.value = v
        }
    },
    {
        deep: true,
        immediate: true
    }
)
</script>
<template>
    <sgLayoutContainerAdmin style="flex-direction: inherit">
        <el-menu
            class="relative el-menu-vertical-demo menu-bg"
            :class="[showMenu ? 'el-menu-vertical-demo-show' : 'el-menu-vertical-demo-hidden']"
            :collapse="!showMenu"
            :collapse-transition="false"
            :default-active="defaultActive"
        >
            <div class="border-bottom">
                <img v-if="showMenu" class="logo" src="@/assets/img/icon_logo@2x.png" alt="" />
                <img v-else class="logo_collapse" src="@/assets/img/icon_logo_collapse@2x.png" alt="" />
            </div>
            <div class="pl-12px pr-12px">
                <template v-for="item in menu" :key="item.index">
                    <el-sub-menu v-if="item.children && item.children.length > 0" :index="item.index">
                        <template #title>
                            <el-icon>
                                <component :is="item.meta.icon" class="icons"></component>
                            </el-icon>
                            <span>{{ item.meta.title }}</span>
                        </template>
                        <el-menu-item
                            v-for="it in item.children"
                            :key="it.index"
                            :index="it.index"
                            @click="onclickMenu(it, it.index)"
                        >
                            <template #title>{{ it.meta.title }}</template>
                        </el-menu-item>
                    </el-sub-menu>
                    <el-menu-item v-else :index="item.index" @click="onclickMenu(item, item.index)">
                        <el-icon>
                            <component :is="item.meta.icon" class="icons"></component>
                        </el-icon>
                        <template #title>
                            <span>{{ item.meta.title }}</span>
                        </template>
                    </el-menu-item>
                </template>
            </div>
        </el-menu>
        <sgLayoutContainerAdmin class="flex-1 bg" style="min-width: 0">
            <NavBar :menu-title="menuTitle"></NavBar>
            <sgLayoutScrollAdmin class="flex-1 pl-20px pr-20px pb-20px">
                <sgLayoutContainerAdmin>
                    <div class="top-tabs">
                        <el-tabs
                            v-model="navName"
                            type="card"
                            class="demo-tabs"
                            closable
                            @tab-remove="removeTab"
                            @tab-click="tabClick"
                        >
                            <el-tab-pane
                                v-for="item in tabRoutes"
                                :key="item.path"
                                :label="item.meta.title"
                                :name="item.name"
                            ></el-tab-pane>
                        </el-tabs>
                    </div>
                    <sgLayoutScrollAdmin>
                        <el-config-provider :locale="locale">
                            <router-view v-slot="{ Component, route }">
                                <keep-alive :include="getCachedComponent(route)" :exclude="cachedComponents" :max="10">
                                    <component :is="Component" :key="route.fullPath" />
                                </keep-alive>
                            </router-view>
                        </el-config-provider>
                    </sgLayoutScrollAdmin>
                </sgLayoutContainerAdmin>
            </sgLayoutScrollAdmin>
        </sgLayoutContainerAdmin>
    </sgLayoutContainerAdmin>
</template>
<style scoped lang="less">
.logo {
    display: block;
    margin: 25px auto;
    width: 124px;
    height: 79px;
}
.logo_collapse {
    display: block;
    margin: 25px auto;
    width: 22px;
}
.el-menu-vertical-demo {
    &:not(.el-menu--collapse) {
        width: 200px;
    }
    // 折叠状态样式
    &.el-menu-vertical-demo-hidden {
        width: 64px !important;
        span {
            opacity: 0;
            width: 0;
            height: 0;
            display: inline-block;
            overflow: hidden;
        }
        .el-icon {
            margin-right: 0 !important;
        }
        :deep(.el-sub-menu__icon-arrow) {
            display: none !important;
        }
        :deep(.el-menu-item) {
            justify-content: center;
            padding: 0 !important;
        }
    }
}
.el-menu-vertical-demo-hidden {
    :deep(.el-sub-menu__title) {
        padding: 0 !important;
        justify-content: center;
    }
    :deep(.el-menu-tooltip__trigger) {
        padding: 0 !important;
        justify-content: center;
    }
}
.menu-bg {
    // :deep(.el-menu-item) {
    //   height: 42px;
    //   margin-bottom: 12px;
    //   margin-top: 12px;
    //   transition: all 0.2s;
    // }
    // :deep(.el-menu-item.is-active) {
    //   //padding-left: 20px;
    //   background: rgba(29, 121, 255, 1);
    //   color: #fff;
    //   width: 100%;
    //   height: 42px;
    //   border-radius: 4px 21px 4px 4px;
    // }
    :deep(.el-sub-menu.is-active .el-sub-menu__title) {
        color: rgba(29, 121, 255, 1);
    }
    .iconfont {
        margin-right: 10px;
    }
}
.pic {
    width: 147px;
    height: 97px;
    bottom: 23px;
    left: 26px;
}
.pr12 {
    padding-right: 12px;
}
.top-tabs {
    background: transparent;
    margin-bottom: 10px;
    .demo-tabs {
        padding-top: 12px;
        background: transparent;
        padding-right: 10px;
    }
    :deep(.el-tabs__header) {
        margin: 0;
        border: none;
        height: 28px;
    }
    :deep(.el-tabs__nav) {
        border: none;
    }
    :deep(.el-tabs--card > .el-tabs__header .el-tabs__item.is-active.is-closable) {
        padding-left: 10px !important;
        padding-right: 10px !important;
    }
    :deep(.el-tabs__item) {
        border: none;
        font-size: 12px;
        font-weight: normal;
    }
    :deep(.is-active) {
        background: rgb(29, 121, 255);
        color: #fff;
    }
    :deep(.el-tabs__item) {
        height: 26px;
        line-height: 26px;
        border-radius: 4px;
        transition: padding var(--el-transition-duration) var(--el-transition-function-ease-in-out-bezier);
    }
}
.border-bottom {
    margin: 0 20px;
    border-bottom: 1px solid #eaeaea;
}
.bg {
    background: RGBA(242, 246, 248, 1);
}
</style>
