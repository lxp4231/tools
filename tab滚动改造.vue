<script lang="ts" setup>
import useIndexStore from '@/store/index'
import { storeToRefs } from 'pinia'
import useCommon from '@/use/useCommon'
import { ref, watch, nextTick, onMounted, reactive, computed } from 'vue'
import ImgSubFixedDialog from '@/components/fixed-dialog/ImgSubFixedDialog.vue'
import useGzh from '@/use/useGzh'
import LayoutCenter from '@/components/layout/LayoutCenter.vue'
import { useStepsPort } from '@/use/useStepsPort'
import type { TabsPaneContext, TabPaneName } from 'element-plus'

const { stepPortImgObj, overNode } = useStepsPort()
const store = useIndexStore()
const { searchInfo, searchParams } = storeToRefs(store)
const { route, push } = useCommon()
const { qrcodeUrl, isSubGzh, showSubGzh } = useGzh()
const containers = ref<any>([])
const containerNoObject = ref<any>({})
const containerStep = ref<any>([])
const isTooltipVisible = ref(false)
const isShowPopover = ref<any>(false)
const activeLeftCtn = ref<any>('') // 左边点击的tab
const activeRightCtn = ref<any>('') // 右边点击的tab
const rightCtnList = ref<string[]>([])
const vesselNameContent = ref<HTMLElement | null>(null)
const eflCodeType = ref<any>({
    空: '空箱',
    重: '重箱',
    拼: '拼箱'
    // E: '空箱',
    // F: '重箱',
    // L: '拼箱'
})
const basicData = ref<any>([])
const VGMData = ref<any>([])
const certificateData = ref<any>([])
const gridStyleBasic = computed(() => ({
    display: 'grid',
    gridTemplateColumns: `100px auto 115px auto 100px auto 100px auto 100px auto`
}))
const gridStyleVGM = computed(() => ({
    display: 'grid',
    gridTemplateColumns: `110px auto 115px auto 100px auto 110px auto 108px auto`
}))

const truckNo = ref<any>('')
const imgPath = (name: string) => {
    return `https://pro-tracking-frontend.oss-cn-hangzhou.aliyuncs.com/image/shipComplay/${name}.png`
}
const tableData = ref<any>([])
const tableDataHG = ref<any>([])
const getResult = (value) => {
    const o = {
        '00': 'OK',
        '01': 'RECORDS ERROR',
        '02': 'RECORS 00 LOST',
        '03': 'RECORS 99 LOST',
        '04': 'M DATA ELEMNT LOST',
        '05': 'M DATA ELEMNT ERROR'
    }
    if (!value) return '-'
    return o[value]
}
const getHeaderCellStyle = () => {
    return {
        background: '#F4F7FB',
        color: '#2F303D',
        fontSize: '14px',
        height: '50px',
        borderColor: '#E6F2FF'
    }
}
const handleClick = (tab: TabsPaneContext) => {
    activeLeftCtn.value = tab.props.name
    getCurrentNodeAndHandleEveryContainerNo()
}
const getTruckNo = () => {
    const truck = containerNoObject.value.events.filter((item) => {
        return item.eventCname === '进港'
    })
    if (truck.length) {
        truckNo.value = truck[0].truckNo
    }
}
const getcontainerSize = (containerSize, containerType) => {
    if (!containerSize && !containerType) {
        return '-'
    }
    if (!containerSize && containerType) {
        return containerType
    }
    if (containerSize && !containerType) {
        return containerSize
    }
    return `${containerNoObject.value?.containerSize}${containerNoObject.value?.containerType}`
}

// 获取basicData和VGMData和certificateData数据
const getBvcData = () => {
    basicData.value = [
        { label: '箱号', value: containerNoObject.value?.containerNo || '-' },
        { label: '铅封号', value: containerNoObject.value?.sealNo || '-' },
        { label: '卸货港', value: containerNoObject.value?.podCode || '-' },
        {
            label: '箱型尺寸',
            value: getcontainerSize(containerNoObject.value?.containerSize, containerNoObject.value?.containerType)
        },
        { label: '持箱人', value: containerNoObject.value?.containerOwner || '-' },
        {
            label: '空拼箱类型',
            value: containerNoObject.value?.eflCode ? eflCodeType.value[containerNoObject.value.eflCode] : '-',
            highlight: true
        },
        {
            label: '箱货重',
            value: containerNoObject.value?.containerWeight ? containerNoObject.value.containerWeight : '-'
        },
        { label: '箱皮重', value: containerNoObject.value?.ctnTareWeight || '-' },
        { label: '箱高度', value: containerNoObject.value?.containerHeight || '-' },
        { label: 'VGM重量', value: containerNoObject.value?.vgmWeight || '-' },
        { label: '进港集卡车牌', value: truckNo.value || '-' },
        { label: '箱状态', value: '-' },
        { label: '进场方式', value: containerNoObject.value?.approachMode || '-' }
    ]
    if (searchInfo.value.portType === 'CNSHA') {
        basicData.value.push(
            { label: '目的港', value: containerNoObject.value?.podCode || '-' },
            { label: '起运港', value: containerNoObject.value?.polCode || '-' }
            // { label: '拖车号', value: containerNoObject.value?.carNumber || '-' }
        )
    } else {
        basicData.value.push({ label: '装货港', value: containerNoObject.value?.polCode || '-' })
    }
    VGMData.value = [
        { label: '发送方', value: containerNoObject.value?.vgmDetails?.senderCode || '-' },
        { label: '接收方', value: containerNoObject.value?.vgmDetails?.receiverCode || '-' },
        { label: '申报人', value: containerNoObject.value?.vgmDetails?.vgmSignature || '-' },
        { label: '报文接收时间', value: containerNoObject.value?.vgmDetails?.terminalOperateTime || '-' },
        { label: '码头接收时间', value: containerNoObject.value?.vgmDetails?.portReceiverTime || '-' },
        {
            label: '码头接收情况',
            value: getResult(containerNoObject.value?.vgmDetails?.resultCode || '-'),
            highlight: true
        },
        {
            label: '重量',
            value: containerNoObject.value?.vgmDetails?.vgmWeight
                ? containerNoObject.value?.vgmDetails?.vgmWeight + ''
                : '-'
        },
        { label: '称重方式', value: containerNoObject.value?.vgmDetails?.vgmMethod || '-' }
    ]
    certificateData.value = containerNoObject.value?.bills
}
const handleEveryContainerNo = () => {
    const arr: any = []
    let isHandle = false
    const currentEventCode = containerNoObject.value.currentEventCode
    if (containerNoObject.value?.events?.length) {
        containerNoObject.value.events.forEach((item) => {
            const imgObj =
                item.eventCname && stepPortImgObj[item.eventCname] ? stepPortImgObj[item.eventCname] : overNode
            if (!currentEventCode) {
                arr.push({ ...item, now: 1, ...imgObj })
            } else if (currentEventCode === item.eventCode) {
                isHandle = true
                arr.push({ ...item, now: 0, ...imgObj })
            } else if (!isHandle) {
                arr.push({ ...item, now: -1, ...imgObj })
            } else if (isHandle) {
                arr.push({ ...item, now: 1, ...imgObj })
            }
        })
        getTruckNo()
    }
    if (arr.length) {
        arr.forEach((item) => {
            item.isCollapse = true
        })
    }
    containerStep.value = arr
    getBvcData()
    getTableDataHG()
}
const onCollapse = (item) => {
    item.isCollapse = !item.isCollapse
}
const getTableData = () => {
    const { openTime, closeTime, terminalCloseTime, cvCloseTime, eta, etd, ata, atd } = searchInfo.value
    tableData.value[0] = {
        openTime: openTime,
        closeTime: closeTime,
        terminalCloseTime: terminalCloseTime,
        cvCloseTime: cvCloseTime,
        eta: eta,
        etd: etd,
        ata: ata,
        atd: atd
    }
}
const getEventTimePass = (events) => {
    if (events && events?.length) {
        const passEvent = events.find((event) => event.eventCode === 'PASS')
        return passEvent ? passEvent.eventTime : ''
    }
    return ''
}
const getEventEdiStatus = (events) => {
    if (events && events?.length) {
        const passEvent = events.find((event) => event.eventCode === 'TMPS')
        return passEvent ? passEvent.ediStatus : ''
    }
    return ''
}
const getEventEdiRemark = (events) => {
    if (events && events?.length) {
        const passEvent = events.find((event) => event.eventCode === 'TMPS')
        return passEvent ? passEvent.ediRemark : ''
    }
    return ''
}
const getTableDataHG = () => {
    const billNo = searchInfo.value.billNo || '' // 提单号
    const eventTime = getEventTimePass(containerNoObject.value?.events) // 海放时间
    const ediStatus = getEventEdiStatus(containerNoObject.value?.events) // 码头放行
    const ediRemark = getEventEdiRemark(containerNoObject.value?.events) // 码头反馈
    if (containerNoObject.value?.paperlessDTOList?.length) {
        let arr: any = containerNoObject.value.paperlessDTOList ?? []
        tableDataHG.value = arr.map((item) => ({
            ...item,
            billNo,
            eventTime,
            ediStatus,
            ediRemark
        }))
    } else {
        tableDataHG.value = [
            {
                billNo, //
                eventTime,
                ediStatus,
                ediRemark
            }
        ]
    }
}
const checkWidth = () => {
    if (vesselNameContent.value) {
        isTooltipVisible.value = vesselNameContent.value?.clientWidth > 160
    } else {
        isTooltipVisible.value = false
    }
}
const getTime = (item) => {
    if (!item?.eventTime) return ''
    if (item.status === 'N') {
        return '' + item.eventTime
    } else if (item.status === 'Y') {
        return '预：' + item.eventTime
    } else {
        return item.eventTime
    }
}
const getDateTimePart = (time, type) => {
    if (!time) return '-'
    const [date, dateTime] = time.split(' ')
    if (type === 0) {
        return date
    } else if (type === 1) {
        return dateTime
    } else {
        return ''
    }
}
const getcurrentNode = () => {
    if (containerNoObject.value) {
        const { currentEventCode, events } = containerNoObject.value
        if (currentEventCode && events.length) {
            const r = events.filter((item) => {
                return item.eventCode === currentEventCode
            })
            if (r.length) {
                if (!r[0]?.eventCname && !r[0]?.eventTime) {
                    return `【最新节点：-】`
                }
                return `【最新节点：${r[0]?.eventCname ? r[0]?.eventCname : ''} ${
                    r[0]?.eventTime ? r[0]?.eventTime : ''
                }】`
            } else {
                return ''
            }
        } else {
            return ''
        }
    }
    return ''
}
const getCtnCurrentNode = (item) => {
    const { currentEventCode, events } = item
    if (currentEventCode && events.length) {
        const r = events.filter((item) => {
            return item.eventCode === currentEventCode
        })
        if (r.length) {
            if (!r[0]?.eventCname && !r[0]?.eventTime) {
                return `-`
            }
            return `${r[0]?.eventCname ? r[0]?.eventCname : ''} ${r[0]?.eventTime ? r[0]?.eventTime : ''}`
        } else {
            return ''
        }
    } else {
        return ''
    }
}
const getStatus = (item) => {
    if (item.ediStatus) {
        return item.ediStatus
    } else {
        return ''
    }
    return ''
}
const getRemark = (item) => {
    if (item.eventCname === '运抵回执') {
        if (item?.ediRemark) {
            return `<span style='font-weight: 500;font-size: 13px;color: #2f303d;'>描述：</span><span style='font-weight: 400;font-size: 13px;color: #2f303d;'>${item.ediRemark}</span>`
        } else {
            return ''
        }
    } else {
        if (item?.ediRemark) {
            return `<span style='font-weight: 500;font-size: 13px;color: #2f303d;'>备注：</span><span style='font-weight: 400;font-size: 13px;color: #2f303d;'>${item.ediRemark}</span>`
        } else {
            return ''
        }
    }
}
const getOther = (item) => {
    if (item.eventCname === '进港') {
        if (item?.truckNo) {
            return `<span style='font-weight: 500;font-size: 13px;color: #2f303d;'>车牌号：</span><span  style='font-weight: 400;font-size: 13px;color: #2f303d;'>${item.truckNo}</span>`
        } else {
            return ''
        }
    }
    if (item.eventCname === '运抵回执') {
        if (item?.applyType) {
            return `<span style='font-weight: 500;font-size: 13px;color: #2f303d;'>申报类型：</span><span style='font-weight: 400;font-size: 13px;color: #2f303d;'>${item.applyType}</span>`
        } else {
            return ''
        }
    }
    if (item.eventCname === '码头放行') {
        if (item?.compareFlag) {
            return `<span style='font-weight: 500;font-size: 13px;color: #2f303d;'>对比结果：</span><span style='font-weight: 400;font-size: 13px;color: #2f303d;'>${item.compareFlag}</span>`
        } else {
            return ''
        }
    }
}
const getCurrentNodeAndHandleEveryContainerNo = () => {
    containerNoObject.value = searchInfo.value.containers.find((item) => item.containerNo === activeLeftCtn.value)
    getcurrentNode()
    handleEveryContainerNo()
}
const getInit = () => {
    containers.value = searchInfo.value.containers // 所有的containers信息list
    activeRightCtn.value = searchInfo.value.containers[0].containerNo // 右边初始化箱号
    activeLeftCtn.value = searchInfo.value.containers[0].containerNo // 左边tab点亮箱号
    rightCtnList.value = [searchInfo.value.containers[0].containerNo]
    getCurrentNodeAndHandleEveryContainerNo()
}
watch(
    searchInfo,
    () => {
        if (searchInfo.value?.containers?.length) {
            getInit()
        }
        if (searchInfo.value) {
            isSubGzh()
            getTableData()
        }
    },
    {
        immediate: true,
        deep: true
    }
)
onMounted(() => {
    nextTick(() => {
        checkWidth()
    })
})
const onVessel = (name: string) => {
    push('shipTrajectory', { type: '4', keyword: name })
}
const onLeftCtnTabs = (item) => {
    activeLeftCtn.value = item.containerNo
    activeRightCtn.value = item.containerNo
    if (!rightCtnList.value.includes(item.containerNo)) {
        rightCtnList.value.push(item.containerNo)
    }
    getCurrentNodeAndHandleEveryContainerNo()
}
const handleTabsEdit = (targetName: TabPaneName | undefined) => {
    if (!targetName) return
    const tabs = rightCtnList.value
    let activeName = activeRightCtn.value
    const index = tabs.findIndex((tab) => tab === targetName)
    // 如果当前激活的是要删除的 tab，则切换到前一个或后一个
    if (activeName === targetName) {
        const nextTab = tabs[index + 1] || tabs[index - 1]
        if (nextTab) {
            activeName = nextTab
        }
    }
    activeRightCtn.value = activeName
    activeLeftCtn.value = activeName
    rightCtnList.value = tabs.filter((tab) => tab !== targetName)
    getCurrentNodeAndHandleEveryContainerNo()
}
watch(
    () => rightCtnList.value.length,
    (v) => {
        if (v === 0) {
            getInit()
        }
    },
    {
        deep: true
    }
)
</script>
<template>
    <LayoutContentBoxPort>
        <div>
            <div v-if="searchInfo">
                <LayoutFlex
                    v-if="searchInfo.subscriptionType === '0'"
                    between
                    center
                    class="mt10 h66 pl12 pr20 bg-select"
                >
                    <LayoutCenter>
                        <el-avatar class="bs204 mr16" :size="40" :src="imgPath(searchInfo.terminalCode)">
                            <img
                                style="width: 20px; height: 20px"
                                src="@/assets/img/searchResult/port/icon_task.png"
                                alt=""
                            />
                        </el-avatar>
                        <LayoutFlex class="fw500 w281"
                            ><span class="space">提单号</span>：{{ searchInfo.billNo }}</LayoutFlex
                        >
                    </LayoutCenter>
                </LayoutFlex>
                <div center class="mt10 pl22 pt17 pb14 pr20 bg-select">
                    <LayoutFlex center>
                        <div class="p1">
                            <LayoutFlex class="p1-t">
                                <img src="@/assets/img/searchResult/port/icon_chuanbo@2x.png" alt="" />
                                <div class="ml8 p1-t-t">船舶计划</div>
                            </LayoutFlex>
                            <div class="p1-c">
                                <el-row :gutter="20">
                                    <el-col :span="5">
                                        <LayoutFlex center class="h-full">
                                            <div class="g-t">船舶名称：</div>
                                            <div v-if="searchInfo?.vesselName" ref="vesselNameContent">
                                                <el-tooltip
                                                    v-if="searchInfo?.vesselName.length > 17"
                                                    effect="dark"
                                                    :content="searchInfo.vesselName"
                                                    placement="top-start"
                                                >
                                                    <div class="g-c vesselName ellipsis">
                                                        {{ searchInfo.vesselName }}
                                                    </div>
                                                </el-tooltip>
                                                <div v-else>{{ searchInfo.vesselName }}</div>
                                            </div>
                                            <div v-else class="g-c">暂无数据</div>
                                        </LayoutFlex>
                                    </el-col>
                                    <el-col v-if="searchInfo.vesselName" :span="5">
                                        <LayoutFlex center class="h-full pointer">
                                            <img
                                                class="w123 h30"
                                                src="@/assets/img/searchResult/port/location.png"
                                                alt=""
                                                @click="onVessel(searchInfo.vesselName)"
                                            />
                                        </LayoutFlex>
                                    </el-col>
                                    <el-col :span="5">
                                        <LayoutFlex center class="h-full">
                                            <div class="g-t">出行航次：</div>
                                            <div class="g-c">{{ searchInfo.voyage || '暂无数据' }}</div>
                                        </LayoutFlex>
                                    </el-col>
                                    <el-col :span="5">
                                        <LayoutFlex center class="h-full">
                                            <div class="g-t">停靠码头：</div>
                                            <div class="g-c">
                                                {{ searchInfo.terminalName || searchInfo.terminalCode || '暂无数据' }}
                                            </div></LayoutFlex
                                        >
                                    </el-col>
                                </el-row>
                                <div class="p1-c-table">
                                    <el-table
                                        border
                                        stripe
                                        size="small"
                                        class="table"
                                        :header-cell-style="getHeaderCellStyle()"
                                        :data="tableData"
                                        :cell-style="{ borderColor: '#E6F2FF' }"
                                        :row-style="{ height: '60px' }"
                                    >
                                        <el-table-column align="center" label="进港开始时间">
                                            <template #default="scope">
                                                <div v-if="scope.row?.openTime">
                                                    <div>
                                                        <span class="tip tip1">始</span
                                                        >{{ getDateTimePart(scope.row.openTime, 0) }}
                                                    </div>
                                                    <div>
                                                        {{ getDateTimePart(scope.row.openTime, 1) }}
                                                    </div>
                                                </div>
                                                <div v-else>-</div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column align="center" show-overflow-tooltip label="进港截止时间">
                                            <template #default="scope">
                                                <div v-if="scope.row.closeTime">
                                                    <div>
                                                        <span class="tip tip2">止</span
                                                        >{{ getDateTimePart(scope.row.closeTime, 0) }}
                                                    </div>
                                                    <div>
                                                        {{ getDateTimePart(scope.row.closeTime, 1) }}
                                                    </div>
                                                </div>
                                                <div v-else>-</div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column align="center" show-overflow-tooltip label="码头截单时间">
                                            <template #default="scope">
                                                <div v-if="scope.row.terminalCloseTime">
                                                    <div>
                                                        <span class="tip tip1">始</span
                                                        >{{ getDateTimePart(scope.row.terminalCloseTime, 0) }}
                                                    </div>
                                                    <div>
                                                        {{ getDateTimePart(scope.row.terminalCloseTime, 1) }}
                                                    </div>
                                                </div>
                                                <div v-else>-</div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column align="center" show-overflow-tooltip label="截关时间">
                                            <template #default="scope">
                                                <div v-if="scope.row.cvCloseTime">
                                                    <div>
                                                        <span class="tip tip2">止</span
                                                        >{{ getDateTimePart(scope.row.cvCloseTime, 0) }}
                                                    </div>
                                                    <div>
                                                        {{ getDateTimePart(scope.row.cvCloseTime, 1) }}
                                                    </div>
                                                </div>
                                                <div v-else>-</div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column align="center" show-overflow-tooltip label="计划抵港时间">
                                            <template #default="scope">
                                                <div v-if="scope.row.etAnchor">
                                                    <div>
                                                        <span class="tip tip1">始</span
                                                        >{{ getDateTimePart(scope.row.etAnchor, 0) }}
                                                    </div>
                                                    <div>
                                                        {{ getDateTimePart(scope.row.etAnchor, 1) }}
                                                    </div>
                                                </div>
                                                <div v-else>-</div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column align="center" show-overflow-tooltip label="计划离港时间">
                                            <template #default="scope">
                                                <div v-if="scope.row.etdPort">
                                                    <div>
                                                        <span class="tip tip2">止</span
                                                        >{{ getDateTimePart(scope.row.etdPort, 0) }}
                                                    </div>
                                                    <div>
                                                        {{ getDateTimePart(scope.row.etdPort, 1) }}
                                                    </div>
                                                </div>
                                                <div v-else>-</div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column align="center" show-overflow-tooltip label="实际抵港时间">
                                            <template #default="scope">
                                                <div v-if="scope.row.atAnchor">
                                                    <div>
                                                        <span class="tip tip1">始</span
                                                        >{{ getDateTimePart(scope.row.atAnchor, 0) }}
                                                    </div>
                                                    <div>
                                                        {{ getDateTimePart(scope.row.atAnchor, 1) }}
                                                    </div>
                                                </div>
                                                <div v-else>-</div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column align="center" show-overflow-tooltip label="实际离港时间">
                                            <template #default="scope">
                                                <div v-if="scope.row.atdPort">
                                                    <div>
                                                        <span class="tip tip2">止</span
                                                        >{{ getDateTimePart(scope.row.atdPort, 0) }}
                                                    </div>
                                                    <div>
                                                        {{ getDateTimePart(scope.row.atdPort, 1) }}
                                                    </div>
                                                </div>
                                                <div v-else>-</div>
                                            </template>
                                        </el-table-column>
                                    </el-table>
                                </div>
                            </div>
                        </div>
                    </LayoutFlex>
                    <div v-if="searchInfo.subscriptionType === '1'" style="height: 464px"></div>
                </div>
                <!-- 内容区 -->
                <div v-if="searchInfo.subscriptionType === '0'" class="mt10 mb10 ctn-box">
                    <div class="ctn-left">
                        <LayoutFlex class="p2-t">
                            <img src="@/assets/img/searchResult/port/icon_xiangdongtai@2x.png" alt="" />
                            <div class="ml9 p2-t-t">箱动态信息</div>
                        </LayoutFlex>
                        <el-scrollbar class="ctns" max-height="876px">
                            <div
                                v-for="(item, index) in searchInfo?.containers"
                                :key="index"
                                class="ctns-item pointer"
                                :class="{ 'ctns-item-active': activeLeftCtn === item.containerNo }"
                                @click="onLeftCtnTabs(item)"
                            >
                                <div class="item-top center-align-items">
                                    <img
                                        v-if="activeLeftCtn === item.containerNo"
                                        src="@/assets/img/searchResult/port/icon_box_1.png"
                                        alt=""
                                    />
                                    <img v-else src="@/assets/img/searchResult/port/icon_box_0.png" alt="" />
                                    <div>{{ item.containerNo }}</div>
                                    <span>{{ `(${getcontainerSize(item.containerSize, item.containerType)})` }}</span>
                                </div>
                                <div class="item-bottom flex">
                                    <span>最新节点：</span>
                                    <div>{{ getCtnCurrentNode(item) }}</div>
                                </div>
                                <div v-if="activeLeftCtn === item.containerNo" class="active-arrow">
                                    <img src="@/assets/img/searchResult/port/icon_arrow_white@2x.png" alt="" />
                                </div>
                            </div>
                        </el-scrollbar>
                    </div>
                    <div class="bg o-h ctn-right">
                        <div>
                            <div class="p2">
                                <el-tabs
                                    v-model="activeRightCtn"
                                    closable
                                    class="p2-tabs"
                                    @tab-click="handleClick"
                                    @edit="handleTabsEdit"
                                >
                                    <el-tab-pane
                                        v-for="(item, index) in rightCtnList"
                                        :key="index"
                                        :label="item"
                                        :name="item"
                                    ></el-tab-pane>
                                </el-tabs>
                                <div class="nodes-tables">
                                    <LayoutFlex class="p2-b">
                                        <div class="p-left"></div>
                                        <div class="ml8 p2-b-t">
                                            <span>集装箱基本信息({{ containerNoObject.containerNo }})</span>
                                            <span>&nbsp;</span>
                                            <span v-if="getcurrentNode()" class="currentNode">{{
                                                getcurrentNode()
                                            }}</span>
                                        </div>
                                    </LayoutFlex>
                                    <div class="mt20 mb20 nodes">
                                        <div class="basic-info-content">
                                            <LayoutFlex v-if="containerStep.length" class="content-basic">
                                                <LayoutCenter
                                                    v-for="(item, index) in containerStep"
                                                    :key="index"
                                                    column
                                                    class="flex1 pr item-after"
                                                    :class="{ itemOld: item.now === -1 }"
                                                >
                                                    <el-popover
                                                        placement="bottom"
                                                        :width="351"
                                                        :trigger="getStatus(item) ? 'hover' : ''"
                                                        @hide="onCollapse(item)"
                                                        @show="onCollapse(item)"
                                                    >
                                                        <template #reference>
                                                            <div
                                                                class="flex"
                                                                style="
                                                                    flex-direction: column;
                                                                    align-items: center;
                                                                    cursor: pointer;
                                                                "
                                                            >
                                                                <div class="img" style="height: 44px">
                                                                    <img
                                                                        v-if="item.now === 0"
                                                                        :src="item.activeIcon"
                                                                        alt=""
                                                                    />
                                                                    <img
                                                                        v-if="item.now === -1"
                                                                        :src="item.oldIcon"
                                                                        alt=""
                                                                    />
                                                                    <img
                                                                        v-if="item.now === 1"
                                                                        :src="item.featIcon"
                                                                        alt=""
                                                                    />
                                                                </div>
                                                                <div
                                                                    class="flex mt12 mb6 pr pointer"
                                                                    :class="{ '--orange-text': item.now === 0 }"
                                                                >
                                                                    <div class="eventCname">{{ item.eventCname }}</div>
                                                                    <div v-if="getStatus(item)" class="pa arrow">
                                                                        <el-icon
                                                                            v-if="!item.isCollapse"
                                                                            style="color: #999999; font-size: 10px"
                                                                            ><ArrowDownBold
                                                                        /></el-icon>
                                                                        <el-icon
                                                                            v-else
                                                                            style="color: #999999; font-size: 10px"
                                                                            ><ArrowRightBold
                                                                        /></el-icon>
                                                                    </div>
                                                                </div>
                                                                <div class="time fs12">
                                                                    {{ getTime(item) }}
                                                                </div>
                                                                <div v-if="getStatus(item)" class="status">
                                                                    <LayoutFlex center>
                                                                        <span class="s1">状态：</span>
                                                                        <img
                                                                            v-if="
                                                                                getStatus(item) === '成功' ||
                                                                                getStatus(item) === '已放行'
                                                                            "
                                                                            style="width: 14px; height: 14px"
                                                                            src="@/assets/img/searchResult/port/icon_success.png"
                                                                            alt=""
                                                                        />
                                                                        <img
                                                                            v-else-if="getStatus(item) === '未知'"
                                                                            style="width: 14px; height: 14px"
                                                                            src="@/assets/img/searchResult/port/questionFilled.png"
                                                                            alt=""
                                                                        />
                                                                        <img
                                                                            v-else-if="
                                                                                getStatus(item) === '失败' ||
                                                                                getStatus(item) === '未放行'
                                                                            "
                                                                            style="width: 14px; height: 14px"
                                                                            src="@/assets/img/searchResult/port/icon_fail.png"
                                                                            alt=""
                                                                        />
                                                                        <img
                                                                            v-else-if="getStatus(item) === '取消放行'"
                                                                            style="width: 14px; height: 14px"
                                                                            src="@/assets/img/searchResult/port/quxiaofangxing.png"
                                                                            alt=""
                                                                        />
                                                                        <img
                                                                            v-else-if="getStatus(item) === '转人工审核'"
                                                                            style="width: 14px; height: 14px"
                                                                            src="@/assets/img/searchResult/port/rengongshenhe.png"
                                                                            alt=""
                                                                        />
                                                                        <img
                                                                            v-else
                                                                            style="width: 14px; height: 14px"
                                                                            src="@/assets/img/searchResult/port/other.png"
                                                                            alt=""
                                                                        />
                                                                        <span class="s2" style="margin-left: 4px">{{
                                                                            getStatus(item)
                                                                        }}</span>
                                                                    </LayoutFlex>
                                                                </div>
                                                            </div>
                                                        </template>
                                                        <el-row :gutter="20">
                                                            <el-col :span="12">
                                                                <LayoutFlex center>
                                                                    <span class="s1">状态：</span>
                                                                    <img
                                                                        v-if="
                                                                            getStatus(item) === '成功' ||
                                                                            getStatus(item) === '已放行'
                                                                        "
                                                                        style="width: 14px; height: 14px"
                                                                        src="@/assets/img/searchResult/port/icon_success.png"
                                                                        alt=""
                                                                    />
                                                                    <img
                                                                        v-else-if="getStatus(item) === '未知'"
                                                                        style="width: 14px; height: 14px"
                                                                        src="@/assets/img/searchResult/port/questionFilled.png"
                                                                        alt=""
                                                                    />
                                                                    <img
                                                                        v-else-if="
                                                                            getStatus(item) === '失败' ||
                                                                            getStatus(item) === '未放行'
                                                                        "
                                                                        style="width: 14px; height: 14px"
                                                                        src="@/assets/img/searchResult/port/icon_fail.png"
                                                                        alt=""
                                                                    />
                                                                    <img
                                                                        v-else-if="getStatus(item) === '取消放行'"
                                                                        style="width: 14px; height: 14px"
                                                                        src="@/assets/img/searchResult/port/quxiaofangxing.png"
                                                                        alt=""
                                                                    />
                                                                    <img
                                                                        v-else-if="getStatus(item) === '转人工审核'"
                                                                        style="width: 14px; height: 14px"
                                                                        src="@/assets/img/searchResult/port/rengongshenhe.png"
                                                                        alt=""
                                                                    />
                                                                    <img
                                                                        v-else
                                                                        style="width: 14px; height: 14px"
                                                                        src="@/assets/img/searchResult/port/other.png"
                                                                        alt=""
                                                                    />
                                                                    <span class="s2" style="margin-left: 4px">{{
                                                                        getStatus(item)
                                                                    }}</span>
                                                                </LayoutFlex>
                                                            </el-col>
                                                            <el-col v-if="getOther(item)" :span="12">
                                                                <LayoutFlex center>
                                                                    <span v-html="getOther(item)"></span>
                                                                </LayoutFlex>
                                                            </el-col>
                                                        </el-row>
                                                        <el-row
                                                            v-if="item.eventCname === '进港' && searchInfo.terminalName"
                                                            style="margin-top: 6px"
                                                            :gutter="20"
                                                        >
                                                            <el-col :span="12">
                                                                <LayoutFlex center>
                                                                    <span class="s1">进港码头：</span>
                                                                    <span class="s2">{{
                                                                        searchInfo.terminalName
                                                                    }}</span>
                                                                </LayoutFlex>
                                                            </el-col>
                                                        </el-row>
                                                        <el-row
                                                            v-if="getRemark(item)"
                                                            style="margin-top: 6px"
                                                            :gutter="20"
                                                        >
                                                            <el-col :span="20">
                                                                <LayoutFlex center>
                                                                    <span v-html="getRemark(item)"></span>
                                                                </LayoutFlex>
                                                            </el-col>
                                                        </el-row>
                                                    </el-popover>
                                                </LayoutCenter>
                                            </LayoutFlex>
                                            <div class="content-b">
                                                <div class="table-container" :style="gridStyleBasic">
                                                    <template v-for="(item, index) in basicData" :key="index">
                                                        <div class="table-cell-label">{{ item.label }}</div>
                                                        <div class="table-cell">
                                                            <span v-if="!item.highlight">{{ item.value }}</span>
                                                            <div
                                                                v-if="item.highlight && item.value"
                                                                :class="{ k: item.highlight && item.value !== '-' }"
                                                            >
                                                                {{ item.value }}
                                                            </div>
                                                        </div>
                                                    </template>
                                                </div>
                                            </div>
                                            <div v-if="searchInfo.portType === 'CNNGB'" class="content-vgm">
                                                <LayoutFlex center class="mb12">
                                                    <img
                                                        style="width: 14px; height: 14px"
                                                        src="@/assets/img/port/icon_vgm@2x.png"
                                                        alt=""
                                                    />
                                                    <span class="fw500 fs14 ml3" style="color: #2f303d">VGM数据</span>
                                                </LayoutFlex>
                                                <div class="table-container" :style="gridStyleVGM">
                                                    <template v-for="(item, index) in VGMData" :key="index">
                                                        <div class="table-cell-label">{{ item.label }}</div>
                                                        <div
                                                            class="table-cell"
                                                            :class="{
                                                                highlight: item.highlight && item.value === 'OK'
                                                            }"
                                                        >
                                                            {{ item.value }}
                                                        </div>
                                                    </template>
                                                </div>
                                            </div>
                                            <div class="content-certificate">
                                                <LayoutFlex center class="mb12">
                                                    <img
                                                        style="width: 15px; height: 15px"
                                                        src="@/assets/img/port/danzheng.png"
                                                        alt=""
                                                    />
                                                    <span class="fw500 fs14 ml3" style="color: #2f303d">单证信息</span>
                                                </LayoutFlex>
                                                <div>
                                                    <el-table
                                                        border
                                                        stripe
                                                        size="small"
                                                        class="table"
                                                        :header-cell-style="getHeaderCellStyle()"
                                                        :data="certificateData"
                                                        :cell-style="{ borderColor: '#E6F2FF' }"
                                                        :row-style="{ height: '50px' }"
                                                    >
                                                        <el-table-column align="center" label="分单号">
                                                            <template #default="scope">
                                                                {{
                                                                    scope.row.billNo === '' ||
                                                                    scope.row.billNo === null ||
                                                                    scope.row.billNo === undefined
                                                                        ? '-'
                                                                        : scope.row.billNo
                                                                }}
                                                            </template>
                                                        </el-table-column>
                                                        <el-table-column
                                                            align="center"
                                                            show-overflow-tooltip
                                                            label="件数"
                                                        >
                                                            <template #default="scope">
                                                                {{
                                                                    scope.row.packageNum === '' ||
                                                                    scope.row.packageNum === null ||
                                                                    scope.row.packageNum === undefined
                                                                        ? '-'
                                                                        : scope.row.packageNum
                                                                }}
                                                            </template>
                                                        </el-table-column>
                                                        <el-table-column
                                                            align="center"
                                                            show-overflow-tooltip
                                                            label="重量"
                                                        >
                                                            <template #default="scope">
                                                                {{
                                                                    scope.row.weight === '' ||
                                                                    scope.row.weight === null ||
                                                                    scope.row.weight === undefined
                                                                        ? '-'
                                                                        : scope.row.weight
                                                                }}
                                                            </template>
                                                        </el-table-column>
                                                        <el-table-column
                                                            align="center"
                                                            show-overflow-tooltip
                                                            label="体积"
                                                        >
                                                            <template #default="scope">
                                                                {{
                                                                    scope.row.measure === '' ||
                                                                    scope.row.measure === null ||
                                                                    scope.row.measure === undefined
                                                                        ? '-'
                                                                        : scope.row.measure
                                                                }}
                                                            </template>
                                                        </el-table-column>
                                                    </el-table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="containerNoObject?.paperlessDTOList?.length" class="tables-paperless">
                                    <LayoutFlex class="p2-b">
                                        <div class="p-left"></div>
                                        <div class="ml8 p2-b-t">
                                            <span>海关放行信息</span>
                                        </div>
                                    </LayoutFlex>
                                    <div class="mt20 mb20 nodes">
                                        <div class="basic-info-content">
                                            <el-table
                                                border
                                                stripe
                                                size="small"
                                                class="table"
                                                :header-cell-style="getHeaderCellStyle()"
                                                :data="tableDataHG"
                                                :cell-style="{ borderColor: '#E6F2FF' }"
                                                :row-style="{ height: '50px' }"
                                            >
                                                <el-table-column align="center" label="提单号">
                                                    <template #default="scope">
                                                        <div>
                                                            {{ scope.row.billNo || '-' }}
                                                        </div>
                                                    </template>
                                                </el-table-column>
                                                <el-table-column align="center" show-overflow-tooltip label="海放时间">
                                                    <template #default="scope">
                                                        <div>
                                                            {{ scope.row.eventTime || '-' }}
                                                        </div>
                                                    </template>
                                                </el-table-column>
                                                <el-table-column
                                                    align="center"
                                                    show-overflow-tooltip
                                                    label="清洁舱单状态"
                                                >
                                                    <template #default="scope">
                                                        <div v-if="scope.row.ifcsumFlag === 'Y'" class="center">
                                                            <img
                                                                style="width: 20px; height: 20px"
                                                                src="@/assets/img/searchResult/port/icon_success.png"
                                                                alt=""
                                                            />
                                                        </div>
                                                        <div v-else-if="scope.row.ifcsumFlag === 'N'" class="center">
                                                            <img
                                                                style="width: 20px; height: 20px"
                                                                src="@/assets/img/searchResult/port/icon_fail.png"
                                                                alt=""
                                                            />
                                                        </div>
                                                        <div v-else>-</div>
                                                    </template>
                                                </el-table-column>
                                                <el-table-column
                                                    align="center"
                                                    show-overflow-tooltip
                                                    label="码头运抵状态"
                                                >
                                                    <template #default="scope">
                                                        <div v-if="scope.row.cpcodeFlag === 'Y'" class="center">
                                                            <img
                                                                style="width: 20px; height: 20px"
                                                                src="@/assets/img/searchResult/port/icon_success.png"
                                                                alt=""
                                                            />
                                                        </div>
                                                        <div v-else-if="scope.row.cpcodeFlag === 'N'" class="center">
                                                            <img
                                                                style="width: 20px; height: 20px"
                                                                src="@/assets/img/searchResult/port/icon_fail.png"
                                                                alt=""
                                                            />
                                                        </div>
                                                        <div v-else>-</div>
                                                    </template>
                                                </el-table-column>
                                                <el-table-column align="center" show-overflow-tooltip label="海放状态">
                                                    <template #default="scope">
                                                        <div v-if="scope.row.customFlag === 'Y'" class="center">
                                                            <img
                                                                style="width: 20px; height: 20px"
                                                                src="@/assets/img/searchResult/port/icon_success.png"
                                                                alt=""
                                                            />
                                                        </div>
                                                        <div v-else-if="scope.row.customFlag === 'N'" class="center">
                                                            <img
                                                                style="width: 20px; height: 20px"
                                                                src="@/assets/img/searchResult/port/icon_fail.png"
                                                                alt=""
                                                            />
                                                        </div>
                                                        <div v-else>-</div>
                                                    </template>
                                                </el-table-column>
                                                <el-table-column
                                                    align="center"
                                                    show-overflow-tooltip
                                                    label="三联单状态"
                                                >
                                                    <template #default="scope">
                                                        <div v-if="scope.row.sldFlag === 'Y'" class="center">
                                                            <img
                                                                style="width: 20px; height: 20px"
                                                                src="@/assets/img/searchResult/port/icon_success.png"
                                                                alt=""
                                                            />
                                                        </div>
                                                        <div v-else-if="scope.row.sldFlag === 'N'" class="center">
                                                            <img
                                                                style="width: 20px; height: 20px"
                                                                src="@/assets/img/searchResult/port/icon_fail.png"
                                                                alt=""
                                                            />
                                                        </div>
                                                        <div v-else>-</div>
                                                    </template>
                                                </el-table-column>
                                                <el-table-column align="center" show-overflow-tooltip label="码头放行">
                                                    <template #default="scope">
                                                        <div>{{ scope.row.ediStatus || '-' }}</div>
                                                    </template>
                                                </el-table-column>
                                                <el-table-column align="center" show-overflow-tooltip label="码头反馈">
                                                    <template #default="scope">
                                                        <div>{{ scope.row.ediRemark || '-' }}</div>
                                                    </template>
                                                </el-table-column>
                                            </el-table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="h800"></div>
        </div>
        <ImgSubFixedDialog v-if="!route.query?.isFromAdmin" v-model="showSubGzh" :url="qrcodeUrl" />
    </LayoutContentBoxPort>
</template>

<style scoped lang="less">
.ml3 {
    margin-left: 3px;
}
.mb12 {
    margin-bottom: 12px;
}
.mr7 {
    margin-right: 7px;
}
.pr27 {
    padding-right: 27px;
}
.pl12 {
    padding-left: 12px;
}
.pr12 {
    padding-right: 12px;
}
.bg {
    height: auto;
    background-color: #ffffff;
    // padding: 30px 40px 20px 40px;
    border-radius: 2px;
}
.bg-select {
    border-radius: 4px;
    background: #ffffff;
    // background-image: url('../../../assets/img/searchResult/bg_main_select.png');
}
.tip {
    width: 20px;
    height: 20px;
    display: inline-block;
    border-radius: 1px;
    font-size: 12px;
    text-align: center;
    line-height: 20px;
    margin-right: 2px;
}
.tip1 {
    background: rgba(29, 121, 255, 0.08);
    color: #1d79ff;
}
.tip2 {
    background: rgba(0, 178, 119, 0.08);
    color: #00b277;
}
.w281 {
    width: 281px;
}
.h66 {
    height: 66px;
}
.content {
    height: auto;
    min-height: 648px;
    padding: 20px;
}
.w330 {
    width: 330px;
}
.pt26 {
    padding-top: 26px;
}
.line {
    border-bottom: 1px dashed #f3f3f3;
    > div {
        text-align: center;
    }
}
.space {
    width: 46px;
    text-align: justify;
    text-align-last: justify;
}
.website {
    text-decoration: none;
}
.h800 {
    height: 800px;
}
.base-info {
    //word-break: break-all;
    > div {
        line-height: 20px;
    }
}
.lh20 {
    line-height: 20px;
}
.g-t {
    font-size: 14px;
    color: rgba(47, 48, 61, 0.7);
}
.g-c {
    font-size: 14px;
    color: #2f303d;
}
.p1 {
    width: 100%;
    .p1-t {
        align-items: center !important;
        img {
            width: 20px;
            height: 16px;
        }
    }
    .p1-t-t {
        font-weight: 500;
        font-size: 16px;
        color: #2f303d;
    }
    .p1-c {
        margin-top: 20px;
        .table {
            margin-top: 14px;
            border-radius: 4px;
            :deep(.cell) {
                font-size: 13px;
                color: #2f303d;
            }
        }
    }
}
.line {
    width: 100%;
    height: 1px;
    margin-top: 20px;
    margin-bottom: 30px;
    background: #f3f3f3;
}
.p2-t-t {
    font-weight: 500;
    font-size: 16px;
    color: #2f303d;
}
.p2-t {
    margin-bottom: 14px;
    align-items: center !important;
    img {
        width: 18px;
        height: 14px;
    }
}
.p2-tabs {
    margin-bottom: 20px;
    background-color: #f7f8f8;
    border-radius: 4px;
    height: 44px;
    :deep(.el-tabs__nav-wrap::after) {
        display: none !important;
    }
    :deep(.el-tabs__nav) {
        display: flex;
        flex-direction: row;
        .el-tabs__item {
            display: flex;
            flex-direction: row;
            align-items: center;
        }
    }
    :deep(.el-tabs__item) {
        position: relative;
        box-sizing: border-box;
        color: #6d7280;
        height: 44px !important;
        line-height: 44px !important;
        padding: 0 15px !important;
        &:hover {
            color: #1d79ff !important;
        }
        border-right: 1px solid rgba(177, 186, 194, 0.2);
        line-height: 1;
        .el-icon {
            display: inline-block;
            margin-bottom: 5px !important;
        }
    }
    :deep(.el-tabs__item.is-active) {
        color: #1d79ff !important;
        background-color: #ffffff;
        &::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background-color: #1d79ff;
        }
    }
    :deep(.el-tabs__active-bar) {
        display: none !important;
    }
    :deep(.el-tabs__nav-next),
    :deep(.el-tabs__nav-prev) {
        &:hover {
            background-color: #f8f9fa !important;
        }
        line-height: 47px !important;
    }
}
.p2-b {
    align-items: center !important;
}
.p2-b-t {
    font-weight: 500;
    font-size: 14px;
    color: #2f303d;
}
.p-left {
    width: 3px;
    height: 14px;
    background: #1d79ff;
}
.fwn {
    font-weight: normal;
}
.eflCode {
    width: 34px;
    height: 20px;
    background: rgba(0, 178, 119, 0.1);
    border-radius: 2px;
    font-size: 12px;
    color: #00b277;
    text-align: center;
    line-height: 20px;
}
.vesselName {
    max-width: 162px;
    // overflow: hidden;
    // white-space: nowrap;
    // text-overflow: ellipsis;
}
.currentNode {
    font-family: PingFangSC, PingFang SC;
    font-weight: 500;
    font-size: 12px;
    color: #ff7221;
}
.nodes {
    // background: url('@/assets/img/searchResult/port/node_background.png') no-repeat;
    // background-size: 100%;
}
.status {
    margin-top: 7px;
}
.s1 {
    font-weight: 500;
    font-size: 13px;
    color: #2f303d;
}
.s2 {
    font-weight: 400;
    font-size: 13px;
    color: #2f303d;
}
.basic-info-content {
    .item-after {
        &:not(:last-child):after {
            position: absolute;
            content: '';
            right: calc(-50% + 39px);
            top: 20px;
            height: 2px;
            width: calc(100% - 78px);
            border-bottom: 2px dashed #ddd;
        }
        .eventCname {
            font-weight: 500;
            font-size: 14px;
            color: #000000;
        }
        img {
            width: 44px;
            height: 44px;
        }
        .arrow {
            right: -14px;
        }
        .time {
            font-weight: 400;
            font-size: 12px;
            color: #2f303d;
            text-align: center;
        }
    }
    .itemOld {
        &:after {
            border-bottom: 2px dashed rgba(29, 121, 255, 0.4) !important;
        }
    }
    .content-basic {
        padding: 17px 0 13px 0;
    }
    .content-b {
        margin-top: 24px;
    }
    .content-vgm {
        margin-top: 24px;
    }
    .content-certificate {
        margin-top: 24px;
    }
}
.color00b277 {
    color: #00b277;
}
.w123 {
    width: 123px;
}
.h30 {
    height: 30px;
}
.h-full {
    height: 100%;
}
.table-container {
    border-radius: 0px 0px 0px 0px;
    padding: 1px;
}
.table-cell-label {
    width: 130px;
    background: #f4f7fb;
    padding: 15px 8px;
    display: flex;
    align-items: center;
    font-weight: 500;
    font-size: 14px;
    color: #2f303d;
}
.table-cell {
    background: #fff;
    padding: 16px 15px;
    display: flex;
    align-items: center;
    flex-grow: 1;
    font-weight: 400;
    font-size: 13px;
    color: #2f303d;
    // 换行
    white-space: normal;
    word-break: break-word;
    overflow-wrap: break-word;
}
.table-cell-label,
.table-cell {
    box-sizing: border-box;
    border: 1px solid #e6f2ff;
    border-right: none;
    border-bottom: none;
    height: 50px;
}
.table-container > *:nth-child(10n) {
    border-right: 1px solid #e6f2ff;
}

.table-container > *:nth-last-child(-n + 10) {
    border-bottom: 1px solid #e6f2ff;
}
.table-cell:last-child {
    border-right: 1px solid #e6f2ff;
}
.k {
    width: 34px;
    height: 18px;
    background: rgba(0, 178, 119, 0.1);
    border-radius: 2px 2px 2px 2px;
    font-weight: 400;
    font-size: 13px;
    color: #00b277;
    line-height: 18px;
    text-align: center;
}
.highlight {
    color: #00b277;
}
.ctn-box {
    display: flex;
    align-items: flex-start;
    // .ctns {
    //     max-height: 876px;
    //     overflow-y: scroll;
    // }
    .ctn-left {
        width: 320px;
        background: #ffffff;
        border-radius: 4px;
        padding: 21px 18px 16px 22px;
        margin-right: 10px;
        .ctns-item {
            position: relative;
            display: flex;
            justify-content: space-between;
            flex-direction: column;
            width: 100%;
            height: 73px;
            padding: 15px 20px 15px;
            border-radius: 4px;
            border: 1px solid transparent; // 默认四边框透明
            border-bottom-color: rgba(177, 186, 194, 0.3); // 只显示底边框
            .active-arrow {
                position: absolute;
                right: 5px;
                top: 50%;
                transform: translate(0, -50%);
                img {
                    width: 10px;
                    height: 10px;
                }
            }
            .item-top {
                color: #2f303d;
                display: flex;
                align-items: center;
                img {
                    width: 15px;
                    height: 14px;
                    margin-right: 5px;
                }
                div {
                    font-weight: 500;
                    font-size: 14px;
                    margin-right: 5px;
                }
                span {
                    font-weight: 400;
                    font-size: 12px;
                }
            }
            .item-bottom {
                font-weight: 500;
                display: flex;
                align-items: center;
                span {
                    color: #2f303d;
                    font-size: 12px;
                }
                div {
                    color: #ff7221;
                    font-size: 12px;
                }
            }
        }
        .ctns-item-active {
            background: #f9fbff;
            border: 1px solid rgba(29, 121, 255, 0.5);
        }
        // .ctns-item:last-child:not(.ctns-item-active) {
        //     border: 1px solid transparent;
        // }
    }
    .ctn-right {
        flex: 1;
        border-radius: 4px;
    }
    .nodes-tables {
        padding: 0 40px 0 30px;
    }
    .tables-paperless {
        padding: 0px 40px 20px 30px;
    }
}
</style>
