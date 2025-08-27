<template>
    <div v-show="show" style="height: 100%">
        <div class="card-container">
            <div
                v-for="(card, index) in cards"
                :key="card.id"
                class="card"
                :style="getCardStyle(index)"
                @touchstart="onTouchStart($event)"
                @touchmove="onTouchMove($event)"
                @touchend="onTouchEnd($event)"
            >
                {{ card.text }}
            </div>
        </div>
    </div>
    <div @click="show = true">显示</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const show = ref(false)
const cards = ref([
    { id: 1, text: '卡片1' },
    { id: 2, text: '卡片2' },
    { id: 3, text: '卡片3' }
])

const startX = ref(0)
const deltaX = ref(0)

const cardWidth = ref(0) // 卡片宽度
const leftGap = ref(10) // 左边留白

const updateSize = () => {
    const screenW = window.innerWidth
    // 375比例缩放
    cardWidth.value = screenW * (202 / 375)
}

onMounted(() => {
    updateSize()
    window.addEventListener('resize', updateSize)
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', updateSize)
})

const onTouchStart = (e: TouchEvent) => {
    startX.value = e.touches[0].clientX
    deltaX.value = 0
}

const onTouchMove = (e: TouchEvent) => {
    deltaX.value = e.touches[0].clientX - startX.value
}

const onTouchEnd = () => {
    if (deltaX.value < -80) {
        const first = cards.value.shift()
        if (first) cards.value.push(first)
    } else if (deltaX.value > 80) {
        const last = cards.value.pop()
        if (last) cards.value.unshift(last)
    }
    deltaX.value = 0
}
const getCardStyle = (index: number) => {
    let offset = 0
    if (index === 1) {
        offset = cardWidth.value * 0.5 // 第二张向右偏移 50%，只显示50%内容
    } else if (index >= 2) {
        offset = cardWidth.value * 0.9 // 第三张往后向右偏移 90%，只显示10%内容
    }
    const zIndex = cards.value.length - index
    const topOffset = index * 5 // 每张卡片向下偏移 5px
    const common = {
        left: leftGap.value + offset + 'px',
        top: topOffset + 'px',
        zIndex,
        width: cardWidth.value + 'px'
    }
    if (index === 0) {
        return {
            ...common,
            transform: `translateX(${deltaX.value}px)`
        }
    }
    return common
}
</script>

<style scoped>
.card-container {
    position: relative;
    width: 100%;
    height: 480px;
    margin-top: 12px;
    overflow: hidden;
}
.card {
    position: absolute;
    height: 463px;
    background: pink;
    color: #fff;
    font-size: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 12px;
    transition: transform 0.5s ease, left 0.3s ease;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.05);
}
</style>
