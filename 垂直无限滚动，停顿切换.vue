<template>
    <div v-if="displayList.length" class="notice-container" @mouseenter="stopScrolling" @mouseleave="startScrolling">
        <div class="notice-img">
            <img class="img" src="@/assets/img/home/new/message.png" alt="公告图标" />
            <div class="notice">公告</div>
        </div>
        <div class="notice-list">
            <div ref="noticeContent" class="notice-content" :style="{ transform: `translateY(${offset}px)` }">
                <div v-for="(item, index) in displayList" :key="index" class="notice-item">
                    <el-tooltip effect="light" :content="item.content" placement="bottom-start">
                        {{ item.content }}
                    </el-tooltip>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { api_get_notice } from '@/api/index'

const notices = ref<any[]>([])
const displayList = ref<any[]>([])
const noticeContent = ref<HTMLElement | null>(null)
const offset = ref(0)
const currentIndex = ref(0)
const itemHeight = ref(0)
const isPaused = ref(false)

let scrollTimer: ReturnType<typeof setTimeout> | null = null

const getNoticeList = async () => {
    try {
        const res = await api_get_notice()
        if (res.success && res.data) {
            notices.value = res.data
            // 如果只有一条，不复制
            if (res.data.length > 1) {
                displayList.value = [...res.data, ...res.data]
            } else {
                displayList.value = [...res.data]
            }
            await nextTick()
            initScroll()
        }
    } catch (error) {
        console.error('获取公告失败', error)
    }
}

const initScroll = () => {
    if (!noticeContent.value || displayList.value.length <= 1) return
    const firstItem = noticeContent.value.querySelector('.notice-item') as HTMLElement
    if (firstItem) {
        itemHeight.value = firstItem.offsetHeight
        offset.value = 0
    }
    startScrolling()
}

const startScrolling = () => {
    isPaused.value = false // ✅ 这里是关键
    if (scrollTimer || displayList.value.length <= 1 || notices.value.length <= 1) return
    scrollTimer = setTimeout(() => {
        scrollTimer = null
        scrollToNext()
    }, 3000)
}

const scrollToNext = () => {
    if (isPaused.value || !noticeContent.value) return

    currentIndex.value += 1
    offset.value = -currentIndex.value * itemHeight.value

    // 如果滚动接近末尾，就复制追加数据
    if (currentIndex.value >= displayList.value.length - 2) {
        displayList.value = [...displayList.value, ...notices.value]
    }

    startScrolling()
}

const stopScrolling = () => {
    isPaused.value = true
    clearTimeout(scrollTimer!)
    scrollTimer = null
}

onMounted(() => {
    getNoticeList()
})

onUnmounted(() => {
    stopScrolling()
})
</script>

<style scoped lang="less">
.notice-container {
    display: flex;
    align-items: center;
    overflow: hidden;
    position: relative;
    width: 818px;
    height: 38px;
    background: rgba(255, 255, 255, 0.85);
    border-radius: 64px;
    padding: 0 16px 0 0;
    border: 2px solid #ffffff;
}

.notice-list {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
    padding-left: 83px;
}

.notice-content {
    display: flex;
    flex-direction: column;
    position: absolute;
    will-change: transform;
    transition: transform 0.5s ease-in-out;
}

.notice-item {
    line-height: 34px;
    cursor: pointer;
    font-weight: 400;
    font-size: 14px;
    color: #3b3f4a;
    width: 100%;
    max-width: 714px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.notice-img {
    width: 69px;
    height: 30px;
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(97deg, #ff662b 0%, #ff8431 100%);
    border-radius: 70px;
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
