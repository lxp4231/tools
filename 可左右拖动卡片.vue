<template>
    <div class="drag-group-container">
        <!-- 卡片组容器 -->
        <div
            class="cards-groups-wrapper"
            ref="wrapperRef"
            @mousedown="startDrag"
            @touchstart="startDrag"
            @mouseleave="endDrag"
            @mouseup="endDrag"
            @touchend="endDrag"
        >
            <div
                class="cards-groups"
                :style="{
                    transform: `translateX(${translateX}px)`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease'
                }"
            >
                <!-- 每组卡片 -->
                <div v-for="(group, groupIndex) in groupedCards" :key="groupIndex" class="card-group">
                    <div v-for="card in group" :key="card.id" class="group-card">
                        <div class="card-content">
                            <p>{{ card.content }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 组指示器 -->
        <div v-if="cards.length > 4" class="group-indicator">
            <div
                v-for="n in groupedCards.length"
                :key="n"
                class="indicator-dot"
                :class="{ active: currentGroup === n - 1 }"
                @click="goToGroup(n - 1)"
            ></div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { User, Pointer, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

// 卡片数据
const cards = ref(
    Array.from({ length: 1 }, (_, i) => ({
        id: i + 1,
        title: `卡片 ${i + 1}`,
        content: `卡片 ${i + 1} `
    }))
)

// 每组的卡片数量
const cardsPerGroup = 4

// 将卡片按每组4个分组
const groupedCards = computed(() => {
    const groups = []
    for (let i = 0; i < cards.value.length; i += cardsPerGroup) {
        groups.push(cards.value.slice(i, i + cardsPerGroup))
    }
    return groups
})

// DOM 引用
const wrapperRef = ref(null)

// 拖拽状态
const isDragging = ref(false)
const startX = ref(0)
const startTranslate = ref(0)
const translateX = ref(0)
const currentGroup = ref(0)

const CARD_WIDTH = 292
const SWITCH_THRESHOLD = CARD_WIDTH / 2 // 146

// 拖拽提示
const showDragHint = ref(true)

// 获取容器宽度
const getWrapperWidth = () => {
    return wrapperRef.value?.clientWidth || 0
}
const startGroupIndex = ref(0)
// 开始拖拽
const startDrag = (e) => {
    isDragging.value = true
    startGroupIndex.value = currentGroup.value
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX
    startX.value = clientX
    startTranslate.value = translateX.value

    // 隐藏拖拽提示
    showDragHint.value = false

    // 阻止文本选中
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'grabbing'

    // 添加拖拽事件
    document.addEventListener('mousemove', onDrag)
    document.addEventListener('touchmove', onDrag, { passive: false })
    document.addEventListener('mouseup', endDrag)
    document.addEventListener('touchend', endDrag)

    e.preventDefault()
}

// 拖拽中
const onDrag = (e) => {
    if (!isDragging.value) return

    e.preventDefault()
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX
    const deltaX = clientX - startX.value

    // 计算新的位置
    let newTranslateX = startTranslate.value + deltaX

    // 限制边界
    const wrapperWidth = getWrapperWidth()
    const minTranslate = -(wrapperWidth * (groupedCards.value.length - 1))
    const maxTranslate = 0

    if (newTranslateX > maxTranslate) {
        newTranslateX = maxTranslate
    } else if (newTranslateX < minTranslate) {
        newTranslateX = minTranslate
    }

    translateX.value = newTranslateX

    // 实时更新当前组
    updateCurrentGroup()
}

// 结束拖拽
const endDrag = () => {
    if (!isDragging.value) return

    isDragging.value = false

    // 恢复文本选中
    document.body.style.userSelect = ''
    document.body.style.cursor = ''

    // 移除事件监听
    document.removeEventListener('mousemove', onDrag)
    document.removeEventListener('touchmove', onDrag)
    document.removeEventListener('mouseup', endDrag)
    document.removeEventListener('touchend', endDrag)

    // 对齐到最近的组
    snapToNearestGroup()
}

// 对齐到最近的组
const snapToNearestGroup = () => {
    const wrapperWidth = getWrapperWidth()
    if (wrapperWidth === 0) return

    // 实际拖动距离
    const delta = translateX.value - startTranslate.value

    // 向左拖（下一组）
    if (delta < -SWITCH_THRESHOLD) {
        goToGroup(startGroupIndex.value + 1)
        return
    }

    // 向右拖（上一组）
    if (delta > SWITCH_THRESHOLD) {
        goToGroup(startGroupIndex.value - 1)
        return
    }

    // 未达到阈值，回弹
    goToGroup(startGroupIndex.value)
}

// 跳转到指定组
const goToGroup = (index) => {
    if (index < 0) index = 0
    if (index >= groupedCards.value.length) index = groupedCards.value.length - 1

    const wrapperWidth = getWrapperWidth()
    translateX.value = -(wrapperWidth * index)
    currentGroup.value = index
}

// 更新当前组
const updateCurrentGroup = () => {
    const wrapperWidth = getWrapperWidth()
    if (wrapperWidth === 0) return

    const index = Math.round(-translateX.value / wrapperWidth)
    if (index >= 0 && index < groupedCards.value.length) {
        currentGroup.value = index
    }
}

// 下一组
const nextGroup = () => {
    if (currentGroup.value < groupedCards.value.length - 1) {
        goToGroup(currentGroup.value + 1)
    }
}

// 上一组
const prevGroup = () => {
    if (currentGroup.value > 0) {
        goToGroup(currentGroup.value - 1)
    }
}

// 键盘导航
const handleKeydown = (e) => {
    if (e.key === 'ArrowLeft') {
        nextGroup()
    } else if (e.key === 'ArrowRight') {
        prevGroup()
    }
}

// 鼠标滚轮切换
const handleWheel = (e) => {
    e.preventDefault()
    if (e.deltaY > 0) {
        nextGroup()
    } else {
        prevGroup()
    }
}

// 响应式处理
const handleResize = () => {
    // 重新计算位置
    goToGroup(currentGroup.value)
}

// 生命周期
onMounted(() => {
    // 初始化
    if (wrapperRef.value) {
        wrapperRef.value.addEventListener('wheel', handleWheel, { passive: false })
    }

    window.addEventListener('resize', handleResize)
    document.addEventListener('keydown', handleKeydown)

    // 3秒后隐藏拖拽提示
    setTimeout(() => {
        showDragHint.value = false
    }, 3000)
})

onUnmounted(() => {
    if (wrapperRef.value) {
        wrapperRef.value.removeEventListener('wheel', handleWheel)
    }

    window.removeEventListener('resize', handleResize)
    document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped lang="less">
.drag-group-container {
    position: relative;
    width: 1280px;
    overflow: hidden;
    margin: 0 auto;
}

.cards-groups-wrapper {
    position: relative;
    overflow: hidden;
    cursor: grab;
    padding: 20px 0;
    touch-action: pan-y pinch-zoom;
}

.cards-groups-wrapper:active {
    cursor: grabbing;
}

.cards-groups {
    display: flex;
    transition: transform 0.3s ease;
    will-change: transform;
}

.card-group {
    display: flex;
    flex: 0 0 100%;
    box-sizing: border-box;
    min-width: 0;
    padding-left: 40px;
    // justify-content: center;
}
.group-card {
    width: 292px;
    height: 321px;
    flex: 0 0 auto;
    margin-right: 10px;
    background: #ffffff;
    border-radius: 12px 12px 12px 12px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    // transition: transform 0.3s ease;
}

.group-card:hover {
    // transform: translateY(-10px);
}

/* 组指示器 */
.group-indicator {
    display: flex;
    justify-content: center;
    gap: 12px;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
}

.indicator-dot {
    width: 8px;
    height: 8px;
    background: #e4e7ed;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    overflow: hidden;
}

.indicator-dot:hover {
    background: #c8ccd3;
}

.indicator-dot.active {
    background: #c8ccd3;
}
</style>
