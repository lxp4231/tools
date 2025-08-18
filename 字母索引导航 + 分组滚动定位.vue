<script lang="ts" setup>
import useSailingDate from '@/use/useSailingDate'
import useCommon from '@/use/useCommon'
import { nextTick, ref, watch } from 'vue'
import useEndPortActive from './useEndPortActive'
import { sendGio } from '@/utils'

const { route } = useCommon()
const { search, params, startPortList, endSortPortList, endPortList, remoteMethodStartPort, remoteMethodEndPort } =
    useSailingDate()
const { active, handleScroll, scrollRef } = useEndPortActive(endSortPortList)
const emit = defineEmits(['search'])
const chooseValue = ref('')
const popVisible = ref(false)
const filterItemRefs = ref<HTMLInputElement[]>([])

const inputRef = ref()
const placeholderStr = '请选择目的港'
const placeholder = ref(placeholderStr)
if (route.query.end) {
    const end = JSON.parse(route.query.end as string)
    chooseValue.value = end.name + ' ' + end.ename
}
const filterItem = (key: any, index: any) => {
    active.value = key
    ;(filterItemRefs.value[index] as any).scrollIntoView({ behavior: 'smooth' })
}
const chooseItem = (item: any) => {
    params.end = item
    chooseValue.value = item.name + ' ' + item.ename
    popVisible.value = false
    nextTick(() => {
        inputRef.value?.blur()
    })
}
const handleSearch = () => {
    emit('search', { start: params.start, end: params.end })
}
const clickOutSide = () => {
    if (params.end) {
        chooseValue.value = params.end.name + ' ' + params.end.ename
    } else {
        chooseValue.value = ''
        placeholder.value = placeholderStr
        remoteMethodEndPort(chooseValue.value)
    }
    popVisible.value = false
}
const getRef = (el: any, index: any) => {
    if (typeof index === 'number') {
        return (filterItemRefs.value[index] = el)
    }
}
const handleInputClick = () => {
    if (chooseValue.value) {
        placeholder.value = chooseValue.value
        chooseValue.value = ''
        remoteMethodEndPort(chooseValue.value)
    }
    popVisible.value = true
}
const handleInputClear = () => {
    chooseValue.value = ''
    placeholder.value = placeholderStr
    params.end = ''
    remoteMethodEndPort(chooseValue.value)
    popVisible.value = true
}
const changeValue = () => {
    chooseValue.value = chooseValue.value.replace(/[\[\]]/g, '')
    remoteMethodEndPort(chooseValue.value)
}
watch(chooseValue, (v) => {
    if (v === '') {
        popVisible.value = true
    }
})
</script>
<template>
    <LayoutContentBoxSmall v-if="route.path === '/sailing_date'" class="search">
        <img class="bg-ship" src="../../../assets/img/sailingDate/bg_ship@2x.png" alt="" />
        <LayoutFlex class="h104 fs18 pr br4 input search-rewrite">
            <div class="--white-bg first">
                <div class="fw500">起运港<span class="--red-text">*</span></div>
                <el-select
                    v-model="params.start"
                    clearable
                    remote
                    class="w100p"
                    suffix-icon=""
                    :remote-method="remoteMethodStartPort"
                    value-key="ename"
                    filterable
                    size="large"
                    placeholder="请选择起运港"
                    @input="(e) => (e.target.value = e.target.value.replace(/[\[\]]/g, ''))"
                >
                    <el-option
                        v-for="item in startPortList"
                        :key="item.ename"
                        :label="item.name + ' ' + item.ename"
                        :value="item"
                    />
                </el-select>
            </div>
            <div class="second center --white-bg">
                <img src="@/assets/img/sailingDate/icon_ship@2x.png" alt="" />
            </div>
            <div class="flex1 --white-bg third">
                <div class="fw500">目的港<span class="--red-text">*</span></div>
                <el-popover :visible="popVisible" placement="bottom-start" :width="690" trigger="click">
                    <template #reference>
                        <el-input
                            ref="inputRef"
                            v-model="chooseValue"
                            size="large"
                            :placeholder="placeholder"
                            clearable
                            @click="handleInputClick"
                            @input="changeValue"
                            @clear="handleInputClear"
                            @keydown.delete="popVisible = true"
                        >
                        </el-input>
                    </template>
                    <template #default>
                        <LayoutContainer
                            v-if="endPortList.length > 0"
                            v-click-out-side="clickOutSide"
                            class="pl20 pr20"
                            style="height: 370px; overflow: auto"
                        >
                            <LayoutFlex center class="category">
                                <div
                                    v-for="(item, key, index) in endSortPortList"
                                    :key="key"
                                    class="pointer ml10 fs12"
                                    :class="{ '--blue-text': key === active }"
                                    @click="filterItem(key, index)"
                                >
                                    {{ key }}
                                </div>
                            </LayoutFlex>
                            <LayoutScroll ref="scrollRef" @scroll="handleScroll">
                                <div v-for="(item, key, index) in endSortPortList" :key="'content' + key">
                                    <div
                                        :ref="(el) => getRef(el, index)"
                                        class="fs16 fw500 ml10 pt20 h42"
                                        :class="{ '--blue-text': key === active }"
                                    >
                                        {{ key }}
                                    </div>
                                    <LayoutFlex class="category-content">
                                        <LayoutFlex
                                            v-for="ii in item"
                                            :key="ii.ename"
                                            class="pointer"
                                            column
                                            @click="chooseItem(ii)"
                                        >
                                            <div class="fs14 fw500 mb6">{{ ii.ename }}</div>
                                            <div class="fs12">{{ ii.name }}</div>
                                        </LayoutFlex>
                                    </LayoutFlex>
                                </div>
                            </LayoutScroll>
                        </LayoutContainer>
                        <LayoutCenter v-else v-click-out-side="clickOutSide" class="fs12 --gray-light-text"
                            >无数据</LayoutCenter
                        >
                    </template>
                </el-popover>
            </div>
            <LayoutCenter
                v-gio-track="{
                    type: 'search_cq',
                    value: { pol: params.start?.code || '', pod: params.end?.code || '' }
                }"
                v-permission:open
                class="--white-text ml15 --blue-bg w128 h104 pointer btn usn br4"
                @click="search"
            >
                <i class="iconfont icon-icon_search_gray">
                    <span class="pl8">查询</span>
                </i>
            </LayoutCenter>
        </LayoutFlex>
    </LayoutContentBoxSmall>
    <LayoutContentBox v-else class="result-search center">
        <LayoutFlex class="fs14 search-rewrite input1">
            <div class="--white-bg first">
                <el-select
                    v-model="params.start"
                    clearable
                    remote
                    class="w100p"
                    suffix-icon=""
                    :remote-method="remoteMethodStartPort"
                    value-key="ename"
                    filterable
                    size="large"
                    placeholder="请选择起运港"
                >
                    <template #prefix>
                        <img class="h16" src="../../../assets/img/sailingDate/icon_gangkou@2x.png" alt="" />
                        <span class="--gray-text pl12 fw500 pr20">起运港</span>
                        <span class="--red-text pr20">*</span>
                    </template>
                    <el-option
                        v-for="item in startPortList"
                        :key="item.ename"
                        :label="item.name + ' ' + item.ename"
                        :value="item"
                    />
                </el-select>
            </div>
            <div class="--white-bg h42 center second"></div>
            <div class="flex1 --white-bg input1">
                <el-popover :visible="popVisible" placement="bottom-start" :width="690" trigger="click">
                    <template #reference>
                        <el-input
                            ref="inputRef"
                            v-model="chooseValue"
                            size="large"
                            :placeholder="placeholder"
                            clearable
                            @click="handleInputClick"
                            @input="changeValue"
                            @clear="handleInputClear"
                            @keydown.delete="popVisible = true"
                        >
                            <template #prefix>
                                <img class="h16" src="../../../assets/img/sailingDate/icon_gangkou@2x.png" alt="" />
                                <span class="--gray-text pl12 fw500 pr20">目的港</span>
                                <span class="--red-text pr20">*</span>
                            </template>
                        </el-input>
                    </template>
                    <template #default>
                        <LayoutContainer
                            v-if="endPortList.length > 0"
                            v-click-out-side="clickOutSide"
                            class="pl20 pr20"
                            style="height: 500px; overflow: auto"
                        >
                            <LayoutFlex center class="category">
                                <div
                                    v-for="(item, key, index) in endSortPortList"
                                    :key="key"
                                    class="pointer ml10 fs12"
                                    :class="{ '--blue-text': key === active }"
                                    @click="filterItem(key, index)"
                                >
                                    {{ key }}
                                </div>
                            </LayoutFlex>
                            <LayoutScroll ref="scrollRef" @scroll="handleScroll">
                                <div v-for="(item, key, index) in endSortPortList" :key="'content' + key">
                                    <div
                                        :ref="(el) => getRef(el, index)"
                                        class="fs16 fw500 ml10 pt20"
                                        :class="{ '--blue-text': key === active }"
                                    >
                                        {{ key }}
                                    </div>
                                    <LayoutFlex class="category-content">
                                        <LayoutFlex
                                            v-for="ii in item"
                                            :key="ii.ename"
                                            class="pointer"
                                            column
                                            @click="chooseItem(ii)"
                                        >
                                            <div class="fs14 fw500 mb6">{{ ii.ename }}</div>
                                            <div class="fs12">{{ ii.name }}</div>
                                        </LayoutFlex>
                                    </LayoutFlex>
                                </div>
                            </LayoutScroll>
                        </LayoutContainer>
                        <LayoutCenter v-else v-click-out-side="clickOutSide" class="fs12 --gray-light-text"
                            >无数据</LayoutCenter
                        >
                    </template>
                </el-popover>
            </div>
            <LayoutCenter class="--white-text --blue-bg w48 h42 pointer button btn usn" @click="handleSearch()">
                <i class="iconfont icon-icon_search_gray"> </i>
            </LayoutCenter>
        </LayoutFlex>
    </LayoutContentBox>
</template>
<style scoped lang="less">
.search {
    height: 166px;
    background-image: url('../../../assets/img/sailingDate/bg_search_bottom@2x.png');
    background-repeat: no-repeat;
    background-position: center;
    background-size: 1284px 166px;
    margin-left: auto;
    margin-right: auto;
    margin-top: -83px;
    display: flex;
    align-items: center;
    > :deep(div) {
        padding: 0 38px;
    }
    position: relative;
    .bg-ship {
        position: absolute;
        width: 732px;
        height: 278px;
        right: 0;
        top: -177px;
    }
}

.h104 {
    height: 90px;
}
.w128 {
    width: 128px;
}
.button {
    border-radius: 4px;
}
.input {
    > div:not(:last-child) {
        height: 100%;
        padding-left: 35px;
        padding-top: 23px;
        padding-right: 35px;
    }
}
.input1 {
    > div {
        padding-left: 40px;
        &:first-child {
            padding-left: 30px;
        }
        &:last-child {
            padding-left: 0;
        }
    }
}
.first {
    border-radius: 4px 0 0 4px;
    width: 25%;
}
.third {
    border-radius: 0 4px 4px 0;
    :deep(input) {
        cursor: pointer;
    }
}
.h28 {
    height: 28px;
}
.mt12 {
    margin-top: 12px;
}
.w90 {
    width: 90px;
}
.second {
    padding: 0 !important;
    width: 102px;
    img {
        width: 46px;
        height: 27px;
        display: block;
    }
    position: relative;
    &:before {
        position: absolute;
        content: '';
        width: 102px;
        height: 1px;
        display: block;
        bottom: 20px;
        left: 0;
        background: rgba(16, 121, 255, 0.3);
    }
    &:after {
        position: absolute;
        content: '';
        width: 10px;
        height: 1px;
        display: block;
        bottom: 20px;
        right: 0;
        transform: rotateZ(30deg);
        transform-origin: right top;
        background: rgba(16, 121, 255, 0.3);
    }
}
.result-search {
    .second {
        width: 30px;
        &:before {
            width: 30px;
        }
        &:after {
            width: 4px;
        }
    }
}
@media only screen and (max-width: 1550px) {
    .search {
        height: 133px;
        background-size: 960px 133px;
        margin-top: -66px;
        .bg-ship {
            width: 547px;
            height: 208px;
            top: -132px;
        }
    }
    .h104 {
        height: 80px !important;
    }
    .input {
        > div:not(:last-child) {
            height: 100%;
            padding-left: 28px;
            padding-top: 13px;
            padding-right: 28px;
            font-size: 16px;
        }
    }
    .ml35 {
        margin-left: 29px;
        font-size: 12px;
    }
}
.result-search {
    height: 72px;
    background: url('../../../assets/img/searchResult/bg_top_search.png') no-repeat center;
}
.w48 {
    width: 48px;
}
.h42 {
    height: 42px;
}
.button {
    border-radius: 0 4px 4px 0;
}
.category {
    height: 50px;
    padding-bottom: 10px;
    font-weight: bold;
    border-bottom: 1px solid rgba(177, 186, 194, 0.2);
}
.category-content {
    flex-wrap: wrap;
    > div {
        width: 25%;
        height: 62px;
        padding-left: 10px;
        padding-top: 10px;
        padding-bottom: 10px;
        margin-bottom: 4px;
        border-radius: 4px;
        transition: all 0.3s;
        &:hover {
            background: rgba(29, 121, 255, 0.08);
        }
    }
}
a {
    text-decoration: none;
    color: var(--gray-color);
}
</style>
