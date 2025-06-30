<template>
    <div class="text-marquee-wrapper" @mouseenter="pauseAnimation" @mouseleave="resumeAnimation">
        <div class="img">
            <img src="@/assets/img/home/gonggao.png" alt="" />
        </div>
        <div class="text-marquee" :style="marqueeStyle">
            <span class="text-item">{{ message }}</span>
            <span class="text-item">{{ message }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { get_customerReach_list } from '@/api/index'
import { storeToRefs } from 'pinia'
import useIndexStore from '@/store'
const indexStore = useIndexStore()
const { user } = storeToRefs(indexStore)
const isShowAd = ref<any>(false)
const message = ref(
    '尊敬的客户，非常感谢您对物流宝产品的支持，产品免费体验阶段即将结束。为了不影响您的正常使用，请联系专属客户经理王健枫（13205918562），期待能继续为您提供优质的服务！'
)

// 动画持续时间（秒），增加持续时间以减慢速度
const animationDuration = 26 // 根据文本长度和需求调整
const animationPlayState = ref('running')

const marqueeStyle = ref({
    '--animation-duration': `${animationDuration}s`,
    '--animation-play-state': animationPlayState.value
})

// 暂停动画
const pauseAnimation = () => {
    animationPlayState.value = 'paused'
    marqueeStyle.value['--animation-play-state'] = animationPlayState.value
}

// 恢复动画
const resumeAnimation = () => {
    animationPlayState.value = 'running'
    marqueeStyle.value['--animation-play-state'] = animationPlayState.value
}

const customerReach_list = () => {
    // get_customerReach_list({ type: 'customerReachUserId' })
    //     .then((res) => {
    //         if (res.success) {
    //             isShowAd.value = res.data
    //         }
    //     })
    //     .catch(() => {
    //         isShowAd.value = false
    //     })
}
// watch(
//     () => storeToRefs(indexStore).isLogin.value,
//     (v) => {
//         if (v) {
//             customerReach_list()
//         }
//     }
// )
// onMounted(() => {
//     if (storeToRefs(indexStore).isLogin.value) {
//         customerReach_list()
//     }
// })
</script>

<style lang="less" scoped>
.text-marquee-wrapper {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    position: relative;
    background-color: #fdf4e3;
    color: #c6764f;
    font-size: 14px;
    height: 32px;
    display: flex;
    align-items: center;
    border-radius: 50px;
    .img {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 40px;
        z-index: 99;
        background-color: #fdf4e3;
        img {
            width: 20px;
            height: 20px;
        }
    }
}
.text-marquee {
    display: flex;
    animation: marquee linear infinite;
    animation-duration: var(--animation-duration);
    animation-play-state: var(--animation-play-state, running);
}
.text-item {
    margin-right: 3rem;
    white-space: nowrap;
}

@keyframes marquee {
    0% {
        transform: translateX(0);
    }
    100% {
        transform: translateX(-50%);
    }
}
</style>
