<script lang="ts" setup>
import { ref, toRefs } from 'vue'
interface IProps {
    step: any[]
}
const props = defineProps<IProps>()
const { step } = toRefs(props)
console.log(step)
</script>
<template>
    <el-timeline class="step-line-comp">
        <el-timeline-item
            v-for="item in step"
            :key="item.eventCode"
            :class="{
                old: item.now === -1,
                now: item.now === 0,
                feature: item.now === 1
            }"
            class="old"
        >
            <layout-flex between center>
                <layout-flex center>
                    <div class="fw500 node">到达：2321</div>
                    <!-- <LayoutCenter v-if="item.now === 0" class="ml10 fs12 is-new --white-text">最新 </LayoutCenter> -->
                </layout-flex>
                <div class="fs13 time">2024-05-12</div>
            </layout-flex>
            <div class="place fs12 mt10">距离：3232</div>
        </el-timeline-item>
    </el-timeline>
</template>
<style scoped lang="less">
.step-line-comp {
    padding-left: 8px;
    .el-timeline-item {
        padding-bottom: 20px !important;
    }
    :deep(.el-timeline-item__node--normal) {
        left: 0;
        width: 7px;
        height: 7px;
        top: 4px;
    }
    :deep(.el-timeline-item__wrapper) {
        padding-left: 18px;
    }
    :deep(.el-timeline-item__tail) {
        left: 3px !important;
        top: 4px;
        border-left-color: rgba(170, 170, 170, 0.5);
    }
    .old {
        .node {
            color: #2f303d;
        }
        .time {
            color: #006716;
        }
        .place {
            color: rgba(47, 48, 61, 0.7);
        }
        :deep(.el-timeline-item__node--normal) {
            background: #73acff;
        }
        :deep(.el-timeline-item__tail) {
            left: 3px !important;
            border-left-style: solid !important;
            border-left-color: rgba(16, 121, 255, 0.2);
        }
    }
    .now {
        .time,
        .node {
            color: #ff7221;
        }
        .place {
            color: rgba(47, 48, 61, 0.7);
        }
        :deep(.el-timeline-item__node--normal) {
            background: #ff7221;
        }
    }
    .feature {
        .node,
        .time,
        .place {
            color: #999999;
        }
        :deep(.el-timeline-item__node--normal) {
            background: #b1bac2;
        }
    }
}
.is-new {
    width: 32px;
    height: 22px;
    background: #ff7221;
    border-radius: 11px;
    line-height: 22px;
}
</style>
