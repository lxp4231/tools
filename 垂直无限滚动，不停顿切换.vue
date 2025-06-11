<template>
    <div v-if="notices.length" class="notice-container" @mouseenter="stopScrolling" @mouseleave="startScrolling">
        <div class="notice-img">
            <img class="img" src="@/assets/img/home/new/message.png" alt="" />
            <div class="notice">公告</div>
        </div>
        <div class="notice-list">
            <div ref="noticeContent" class="notice-content" :style="{ transform: `translateY(${offset}px)` }">
                <div v-for="(item, index) in notices" :key="index" class="notice-item">
                    <el-tooltip effect="light" :content="item.content" placement="bottom-start">
                        {{ item.content }}
                    </el-tooltip>
                </div>
                <!-- clone一份，实现无缝滚动 -->
                <div v-for="(item, index) in notices" :key="'clone-' + index" class="notice-item">
                    <el-tooltip effect="light" :content="item.content" placement="bottom-start">
                        {{ item.content }}
                    </el-tooltip>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { api_get_notice } from '@/api/index'
const notices = ref<any>([])

const offset = ref(0)
const speed = 0.2 // 控制滚动速度
let scrollAnimationFrame: any = null
let isScrolling = false
const startScrolling = () => {
    if (isScrolling) return
    // if (!notices.value.length || notices.value.length === 1) {
    //     return
    // }
    isScrolling = true
    const step = () => {
        offset.value -= speed
        const noticeContent = document.querySelector('.notice-content')
        if (noticeContent instanceof HTMLElement) {
            const contentHeight = noticeContent.offsetHeight / 2
            if (Math.abs(offset.value) >= contentHeight) {
                offset.value = 0
            }
        }
        scrollAnimationFrame = requestAnimationFrame(step)
    }
    scrollAnimationFrame = requestAnimationFrame(step)
}
const stopScrolling = () => {
    isScrolling = false
    cancelAnimationFrame(scrollAnimationFrame)
}
const getNoticeList = () => {
    api_get_notice().then((res) => {
        if (res.success && res.data) {
            notices.value = res.data
            startScrolling()
        }
    })
}
onMounted(() => {
    getNoticeList()
})
onUnmounted(() => {
    stopScrolling()
})
</script>
<style lang="less" scoped>
.notice-container {
    display: flex;
    align-items: center;
    overflow: hidden;
    position: relative;
    // 610px
    width: 818px;
    height: 38px;
    background: rgba(255, 255, 255, 0.85);
    border-radius: 64px 64px 64px 64px;
    padding: 0 16px 0 0;
    border: 2px solid #ffffff;
}
.notice-list {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
    padding-left: 83px;
    /* 调整渐变，使文字进入和离开时更清晰 */
    // mask-image: linear-gradient(
    //     to bottom,
    //     transparent 10%,
    //     rgba(0, 0, 0, 1) 40%,
    //     rgba(0, 0, 0, 1) 55%,
    //     transparent 90%
    // );
    // -webkit-mask-image: linear-gradient(
    //     to bottom,
    //     transparent 10%,
    //     rgba(0, 0, 0, 1) 40%,
    //     rgba(0, 0, 0, 1) 55%,
    //     transparent 90%
    // );
}
.notice-content {
    display: flex;
    flex-direction: column;
    position: absolute;
    will-change: transform;
}
.notice-item {
    line-height: 34px;
    // white-space: wrap;
    cursor: pointer;
    font-weight: 400;
    font-size: 14px;
    color: #3b3f4a;
    width: 100%;
    max-width: 714px;
    white-space: wrap;
    // overflow: hidden;
    // text-overflow: ellipsis; // 超出部分显示省略号
}
.notice-img {
    width: 69px;
    height: 30px;
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(97deg, #ff662b 0%, #ff8431 100%);
    border-radius: 70px 70px 70px 70px;
    padding: 0 10px;
    .img {
        width: 15.95px;
        height: 16px;
    }
    .notice {
        font-weight: 500;
        font-size: 14px;
        color: #ffffff;
        margin-left: 4px;
    }
}
</style>
