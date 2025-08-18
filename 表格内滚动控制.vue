<script lang="ts" setup>
import { nextTick, reactive, ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import { Message } from '@/utils/message'
import { Search, RefreshRight, Edit } from '@element-plus/icons-vue'
import ReSubscribe from '@/views/subscriptionList/components/ReSubscribe.vue'
import UploadDialog from '@/views/subscriptionList/components/UploadDialog.vue'
import AddUser from '@/views/subscriptionList/components/AddUser.vue'
import SubscribeCancelTip from '@/components/fixed-dialog/SubscribeCancelTip.vue'
import {
    export_excel,
    subscribe_list,
    sub_count,
    sub_count_beta,
    sub_edit,
    sub_edit_beta,
    sub_edit_gw,
    export_excel_sea,
    export_excel_sea_beta,
    sub_edit_port
} from '@/api/saas'
import PushSetting from '@/views/subscriptionList/components/PushSetting.vue'
import PushSettingPort from '@/views/subscriptionList/components/PushSettingPort.vue'
import NodeSetting from '@/views/subscriptionList/components/NodeSetting.vue'
import PushSettingGw from '@/views/subscriptionList/components/PushSettingGw.vue'
import useCommon from '@/use/useCommon'
import { useHomeAndResultSearch } from '@/use/useHomeAndResultSearch'
import {
    subscribeCancel,
    subscribeCancel_beta,
    subscribeCancel_gw,
    port_subscribe_list,
    port_subscribe_cancel,
    export_excel_port,
    sea_subscribe_list,
    sea_subscribe_list_beta,
    subscribe_list_update_sea,
    subscribe_list_update_sea_beta,
    get_sea_stateStatistics,
    get_sea_stateStatistics_beta,
    port_subscribe
} from '@/api/subscribe'
import NodeCanvas from '@/views/subscriptionList/components/NodeCanvas.vue'
import NodeCanvasGw from '@/views/subscriptionList/components/NodeCanvasGw.vue'
import NodeCanvasPort from '@/views/subscriptionList/components/NodeCanvasPort.vue'
import useIndexStore from '@/store'
import { storeToRefs } from 'pinia'
import { useCompany } from '@/use/useCompany'
import SubContentItem from './SubContentItem.vue'
import NoData from '@/views/subscriptionList/components/NoData.vue'
import InfoNull from '@/views/subscriptionList/components/InfoNull.vue'
import InfoError from '@/views/subscriptionList/components/InfoError.vue'
import ReSub from '@/components/fixed-dialog/ReSub.vue'
import ReSubGw from '@/components/fixed-dialog/ReSubGw.vue'
import useSubListRefresh from '@/use/useSubListRefresh'
import useEdit from '@/views/subscriptionList/components/useEdit'
import useSubscriptionNode from '@/store/subscription'
import { onBeforeRouteLeave } from 'vue-router'
import { sendGio } from '@/utils'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import useColumns from '@/views/subscriptionList/components/useColumns'
import useSearchPort from '@/use/useSearchPort'
import dayjs from 'dayjs'
import { sea_pre_check } from '@/api/search'
import BatchSubApplyDialog from '@/components/fixed-dialog/BatchSubApplyDialog.vue'
const { searchPort } = useSearchPort()
const activeSearch = ref('0')
const { search, resultCompanyList } = useHomeAndResultSearch(activeSearch)
const { route, replace } = useCommon()
const store = useIndexStore()
const { role, portData, user, showPay, showPayType, isWhiteListbeta } = storeToRefs(store)
const { addLoadingGif, subLoadingGif } = store
const nodeStore = useSubscriptionNode()
const { customsImportNode, customsExitNode, activeName: active } = storeToRefs(nodeStore)
const { nodeObj } = nodeStore
const { getWebsite } = useCompany()
const { editFormRef, editFormRules, editForm, canEditBiNo, handleEdit, showEdit } = useEdit()
interface ITabItem {
    name: string
    icon: any
    active: boolean
    num?: number
    disabled?: boolean
    gio?: string
    isbeta?: boolean
}
let timer
const tabs = reactive<ITabItem[]>([
    {
        name: '物流单号',
        icon: new URL('../../../assets/img/subscriptionList/saas/icon_wuliu@2x.png', import.meta.url).href,
        active: true
    },
    {
        name: '归档单号',
        icon: new URL('../../../assets/img/subscriptionList/saas/icon_guidang@2x.png', import.meta.url).href,
        active: false,
        disabled: true,
        gio: 'subResult_guidang'
    }
])
const popoverRefs = new Map()
const referenceRefs = new Map()
const changeActiveTabs = (item: ITabItem) => {
    if (item.disabled) {
        sendGio('subResult_guidang')
        Message.showWarning('功能正在开发中')
        return
    }
    tabs.forEach((i) => {
        i.active = false
    })
    item.active = true
}
const activeNameObj = {
    '0': '船司单号',
    '1': '关务单号',
    '2': '港区出口',
    '3': '海运单号'
}
const activeNameObjGio = {
    '0': 'hy',
    '1': 'gw',
    '2': 'gq',
    '3': 'hy'
}
const types = reactive<ITabItem[]>([
    {
        name: '船司单号',
        icon: '',
        active: true,
        num: 0
    },
    {
        name: '关务单号',
        icon: '',
        active: false,
        num: 0
    },
    {
        name: '港区出口',
        icon: '',
        active: false,
        num: 0
    },
    {
        name: '海运单号',
        icon: '',
        active: true,
        num: 0,
        isbeta: true
    }
])
const portTypeOption = ref<any>({})
const getResultPortList = (v) => {
    portTypeOption.value = v
}
const form = reactive({
    time: '',
    queryNo: '',
    subscribeTimeStart: '',
    subscribeTimeEnd: '',
    companyName: '',
    remark: '',
    page: 1,
    pageSize: 10,
    vesselName: '',
    voyage: '',
    carrierCodeList: [], // 船司
    stateList: [], // 状态
    transitStateList: [] // 中转单
})
const total = ref(0)
const list = ref<any[]>([])
const portList = ref<any[]>([])
const activeName = ref(active.value)
const emit = defineEmits(['showWechat'])
const seaOption = ref<any>({})
const showBatchSubApplyDialog = ref(false)
const stateObj = {
    nodata: '暂无数据',
    done: '已完成',
    shipping: '进行中',
    abnormal: '异常'
}
const transitStateObj = {
    nodata: '暂无数据',
    through: '非中转单',
    transit: '中转单'
}
const showWechat = () => {
    emit('showWechat')
}
//异常
const getSeaStateStatistics = () => {
    const fun: any = activeName.value === 0 ? get_sea_stateStatistics : get_sea_stateStatistics_beta
    fun().then((res) => {
        if (res.success && res.data) {
            seaOption.value = res.data
        }
    })
}
const getSeaUpdataData = () => {
    // 轮询获取sea数据
    const fun = activeName.value === 0 ? subscribe_list_update_sea : subscribe_list_update_sea_beta
    fun(form).then((res) => {
        if (res.success && res?.data.length) {
            if (list.value.length) {
                list.value.forEach((item, index) => {
                    res.data.forEach((it, idx) => {
                        if (item.subscribeId === it.subscribeId) {
                            list.value[index] = transformItem(res.data[idx])
                        }
                    })
                })
            }
        }
    })
}
const { handleList } = useSubListRefresh(ref(''), form, activeName, getSeaUpdataData)

const selectRows = ref<any[]>([])
const selectRow = ref<any>()
// 转换函数：对 item 进行转换操作
function transformItem(item) {
    if (item?.containerList && Object.keys(item.containerList).length) {
        item.cartonNoList = Object.keys(item.containerList) // 所有箱号list
        item.currentContainer = item.containerList[item.cartonNoList[0]] // 当前箱所在对象
        item.cartonNo = item.cartonNoList[0] // 当前箱号
        item.currentNodeObj = getCurrentNodeNameAndTime(item.currentContainer) // 当前箱的点亮节点
        item.biNo = item?.billNo
    } else {
        item.cartonNoList = []
        // item.currentContainer = null
        item.cartonNo = ''
        item.currentNodeObj = null
        item.biNo = item?.billNo
    }
    return item
}
const handleSearch = (showLoading = true) => {
    if (form.time) {
        form.subscribeTimeStart = form.time[0]
        form.subscribeTimeEnd = form.time[1]
    } else {
        form.subscribeTimeStart = ''
        form.subscribeTimeEnd = ''
    }
    form.remark = form.remark ? form.remark.trim() : ''
    selectRows.value = []
    selectRow.value = null
    if (showLoading) addLoadingGif()
    sub_count().then((res) => {
        if (res.success && res.data) {
            types[0].num = res.data.seaCount
            types[1].num = res.data.customCount
            types[2].num = res.data.portCount
            // types[3].num = res.data.seaCount
        }
    })
    if (isWhiteListbeta.value) {
        sub_count_beta().then((res) => {
            if (res.success && res.data) {
                types[3].num = res.data.seaCount
            }
        })
    }
    // 海运查询
    if (activeName.value === 0 || activeName.value === 3) {
        const fun = activeName.value === 0 ? sea_subscribe_list : sea_subscribe_list_beta
        fun({ ...form, source: 0 }) // activeName.value
            .then((res) => {
                if (res.success && res.data) {
                    total.value = res.data.total
                    // 处理list
                    list.value = res.data.list
                    list.value.forEach((item) => {
                        transformItem(item)
                    })
                    // handleList(list.value)
                    initDriver()
                }
            })
            .finally(() => {
                if (showLoading) subLoadingGif()
            })
    }
    // 关务查询
    if (activeName.value === 1) {
        subscribe_list({ ...form, source: activeName.value })
            .then((res) => {
                if (res.success && res.data) {
                    total.value = res.data.total
                    list.value = res.data.list
                    handleList(list.value)
                    initDriver()
                }
            })
            .finally(() => {
                if (showLoading) subLoadingGif()
            })
    }
    // 港区查询
    if (activeName.value === 2) {
        const params: any = {
            portType: '',
            page: form.page,
            pageSize: form.pageSize,
            vesselName: form.vesselName,
            voyage: form.voyage
        }
        if (form.queryNo) {
            params.billNo = form.queryNo
        }
        if (form.time) {
            params.startTime = form.time[0]
            params.endTime = form.time[1]
        }
        port_subscribe_list(params)
            .then((res) => {
                if (res.success && res.data) {
                    total.value = res.data.total
                    if (res.data?.list.length) {
                        const newList = res.data.list
                        newList.forEach((item) => {
                            if (!item.type) {
                                if (item.containers && item.containers?.length > 0) {
                                    item.currentCartonNum = item.containers[0].containerNo
                                    item.currentContainer = item.containers[0]
                                    item.containers.forEach((it) => {
                                        const currentEventCode = it.currentEventCode || ''
                                        if (it?.events?.length && currentEventCode) {
                                            const r = it?.events.filter((i) => {
                                                return currentEventCode === i.eventCode
                                            })
                                            if (r.length) {
                                                item.portCurrentNode = {
                                                    eventCname: r[0].eventCname,
                                                    eventTime: r[0].eventTime
                                                }
                                            } else {
                                                item.portCurrentNode = {
                                                    eventCname: '',
                                                    eventTime: ''
                                                }
                                            }
                                        }
                                    })
                                } else {
                                    item.currentCartonNum = ''
                                }
                            }
                        })
                        portList.value = newList
                        getPortUpdataData()
                    } else {
                        portList.value = []
                    }
                    initDriverP()
                }
            })
            .finally(() => {
                if (showLoading) subLoadingGif()
            })
    }
}
let num = 0
const initDriver = () => {
    if (route.query.isSearch) {
        if (num === 0) {
            num++
            showWechat()
        }
        return
    }
    const hasDriver = localStorage.getItem('hasDriver')
    if (hasDriver) {
        if (num === 0) showWechat()
        num++
        return
    }
    nextTick(() => {
        num++
        const stepHz = [
            {
                element: '#export',
                popover: {
                    title: '导出',
                    description: '支持一键导出订阅单号信息，包括：提单号、箱号、最新物流节点、异常情况等。'
                }
            },
            {
                element: '.setPush',
                popover: {
                    title: '推送设置',
                    description: '用户可对所有提单设置不同节点消息的推送对象、推送内容和推送方式。'
                }
            },
            {
                element: '#setNode',
                popover: {
                    title: '设置重要节点',
                    description: '用户可自定义查看提单号下的多个重要节点发生时间，进行实时信息推送。'
                }
            }
        ]
        const stepHd = [
            {
                element: '#export',
                popover: {
                    title: '导出',
                    description: '支持一键导出订阅单号信息，包括：提单号、箱号、最新物流节点、异常情况等。'
                }
            },
            {
                element: '#setUser',
                popover: {
                    title: '批量设置客户',
                    description: '支持对单号设置客户信息，方便推送单号信息至客户。'
                }
            },
            {
                element: '.setPush',
                popover: {
                    title: '推送设置',
                    description: '用户可对所有提单设置不同节点消息的推送对象、推送内容和推送方式。'
                }
            },
            {
                element: '#setNode',
                popover: {
                    title: '设置重要节点',
                    description: '用户可自定义查看提单号下的多个重要节点发生时间，进行实时信息推送。'
                }
            }
        ]
        if (list.value.length > 0) {
            const lastStep = {
                element: '.setEdit',
                popover: {
                    title: '编辑',
                    description: '用户可对备注等相关信息进行编辑。    '
                }
            }
            stepHd.push(lastStep)
            stepHz.push(lastStep)
        }
        const driverObj = driver({
            allowClose: false,
            showButtons: ['next', 'previous'],
            popoverClass: 'driverjs-theme',
            nextBtnText: '下一步',
            prevBtnText: '上一步',
            showProgress: true,
            doneBtnText: '立即体验',
            stagePadding: 10,
            steps: role.value === '货代' ? stepHd : stepHz,
            progressText: '{{current}}/{{total}}',
            onDestroyed: () => {
                localStorage.setItem('hasDriver', '1')
                showWechat()
            },
            onPopoverRender: (popover, { config, state }) => {
                const firstButton = document.createElement('span')
                firstButton.classList.add('driverSpanText')
                firstButton.innerText = '跳过'
                popover.footerButtons.prepend(firstButton)

                firstButton.addEventListener('click', () => {
                    driverObj.destroy()
                })
            }
        })
        driverObj.drive()
    })
}
const initDriverP = () => {
    if (route.query.isSearch) {
        if (num === 0) {
            num++
            showWechat()
        }
        return
    }
}
const handleQuerySearch = (showLoading = true) => {
    form.page = 1
    handleSearch(showLoading)
}
onMounted(() => {
    if (route.query.t) {
        activeName.value = parseInt(route.query.t as string)
    }
    if (route.query.activeName && route.query.portType && route.query.billNo) {
        const { activeName: active, portType, billNo, containerNo } = route.query
        activeName.value = parseInt(active as string)
        const p: any = {
            billNo: billNo,
            portType: portType
        }
        if (containerNo) {
            p.containerNo = containerNo
        }
        port_subscribe(p)
            .then((res) => {
                if (res.success) {
                    Message.shortSuccess('操作成功')
                }
                replace('subscription')
            })
            .finally(() => {
                handleQuerySearch(true)
            })
    } else {
        handleQuerySearch(true)
    }
})

const handleCheckChange = (v: any[]) => {
    selectRows.value = v
}
const handleSpanMethod = ({ row, columnIndex }) => {
    if (row?.message || (row?.oceanNoData && !row?.currentNodeObj)) {
        let length = 0
        for (let i = 2; i >= 1; i--) {
            if (!tabThList.value[i].checked) length++
        }
        if (columnIndex === 4 - length) {
            return [1, 3 - length]
        } else if (columnIndex >= 2 && columnIndex < 4 - length) {
            return [0, 0]
        }
    }
}
const handleSpanMethodPort = ({ row, column, rowIndex, columnIndex }) => {
    // 什么数据都没有时
    if ((!row.containers && !row?.subscriptionType) || (row?.subscriptionType && row.hasOwnProperty('noDataReason'))) {
        if (columnIndex === 3) {
            return [1, 2]
        } else if (columnIndex === 2) {
            return [0, 0] // 隐藏第三列
        }
    }
    return [1, 1]
}
const showUpload = ref(false)
const showAddUser = ref(false)
const showCancel = ref(false)
const showPushSetting = ref(false)
const showPushSettingGw = ref(false)
const showPushSettingPort = ref(false)
const portPushSettingType = ref('')
const showNodeSetting = ref(false)
const showReSubscribe = ref(false)
const handleSelectValue = (): any[] => {
    const arr: any[] = []
    selectRows.value.forEach((item: any) => {
        arr.push(item.subscribeId)
    })
    return arr
}

const handlePortSelectValue = (): any[] => {
    const arr: any[] = []
    selectRows.value.forEach((item: any) => {
        arr.push(item.subscribeId)
    })
    return arr
}

const exportExcel = () => {
    if (selectRows.value.length === 0) {
        Message.shortError('请选择单号')
        return
    }
    sendGio('subResult_export', { type: activeNameObjGio[activeName.value] })
    const arr: any[] = []
    if (activeName.value) {
        tabThList1.value.forEach((item) => {
            if (item.checked) arr.push(item.name)
        })
    } else {
        tabThList.value.forEach((item) => {
            if (item.checked) arr.push(item.name)
        })
    }
    addLoadingGif()
    if (activeName.value === 0 || activeName.value === 3) {
        const fun = activeName.value === 0 ? export_excel_sea : export_excel_sea_beta
        fun({ subscribeIdList: handleSelectValue(), source: activeName.value, subscribeParamList: arr })
            .then((res) => {
                if (res.success && res.data) {
                    window.open(res.data)
                }
            })
            .finally(() => {
                subLoadingGif()
            })
    } else {
        export_excel({ subscribeIdList: handleSelectValue(), source: activeName.value, subscribeParamList: arr })
            .then((res) => {
                if (res.success && res.data) {
                    window.open(res.data)
                }
            })
            .finally(() => {
                subLoadingGif()
            })
    }
}
const exportExcelPort = () => {
    if (selectRows.value.length === 0) {
        Message.shortError('请选择单号')
        return
    }
    addLoadingGif()
    export_excel_port({ ids: handlePortSelectValue() })
        .then((res) => {
            if (res.success && res.data) {
                window.open(res.data)
            }
        })
        .finally(() => {
            subLoadingGif()
        })
}
const handleShowAddUser = () => {
    if (selectRows.value.length === 0) {
        Message.shortError('请选择单号')
        return
    }
    sendGio('customerSet_mass', { type: activeNameObjGio[activeName.value] })
    showAddUser.value = true
}
const cancelId = ref<any[]>([])
const portIds = ref<any[]>([])
const chooseCancelRow = ref()
const showPayTip = ref(false)
const handleShowCancel = (row?: any) => {
    cancelId.value = []
    showPayTip.value = false
    if (row) {
        cancelId.value = [row.subscribeId]
        chooseCancelRow.value = [row]
        if (dayjs().valueOf() - dayjs(row.subscribeTime).valueOf() < 24 * 60 * 60 * 1000) {
            showPayTip.value = true
        }
    } else {
        if (selectRows.value.length === 0) {
            Message.shortError('请选择单号')
            return
        }
        chooseCancelRow.value = selectRows.value
        cancelId.value = handleSelectValue()
        showPayTip.value = true
    }
    sendGio('cancelSub', { type: activeNameObjGio[activeName.value] })
    showCancel.value = true
}
const handleShowCancelPort = (row?: any) => {
    portIds.value = []
    showPayTip.value = false
    if (row) {
        portIds.value = [row.subscribeId]
        if (dayjs().valueOf() - dayjs(row.createTime).valueOf() < 24 * 60 * 60 * 1000) {
            showPayTip.value = true
        }
    } else {
        if (selectRows.value.length === 0) {
            Message.shortError('请选择单号')
            return
        }
        portIds.value = handlePortSelectValue()
        showPayTip.value = true
    }
    showCancel.value = true
}
// 港区取消订阅
const confirmCancelPort = async () => {
    const res = await port_subscribe_cancel({ ids: portIds.value })
    // 取消订阅成功
    if (res.success) {
        total.value = total.value - portIds.value.length
        if (total.value > 0 && total.value % form.pageSize === 0 && form.page > 1) {
            form.page = form.page - 1
        }
        handleSearch()
        showCancel.value = false
    }
}
const handleShowPushSetting = (row?: any) => {
    if (row) {
        selectRow.value = row
    } else {
        selectRow.value = null
    }
    sendGio('pushSet', { type: activeNameObjGio[activeName.value] })
    if (activeName.value === 0 || activeName.value === 3) {
        showPushSetting.value = true
    } else {
        showPushSettingGw.value = true
    }
}
const handleShowPushSettingPort = (row?: any) => {
    sendGio('pushSet', { type: 'gq' })
    if (row) {
        selectRow.value = row
        if (row?.billNo) {
            portPushSettingType.value = 'billNo'
        } else if (row?.vesselName) {
            portPushSettingType.value = 'vessel'
        }
    } else {
        selectRow.value = null
        if (!selectRows.value.length) {
            portPushSettingType.value = 'billNo'
        } else {
            const arr = selectRows.value.filter((item) => item?.billNo).map((item) => item.billNo)
            if (arr.length) {
                portPushSettingType.value = 'billNo'
            } else {
                portPushSettingType.value = 'vessel'
            }
        }
    }
    showPushSettingPort.value = true
}
const handleSetNode = () => {
    selectRow.value = null
    showNodeSetting.value = true
}
const showServer = () => {
    store.onShowFixedDialog()
}
const handleShowRoute = (row) => {
    const currentDomain = window.location.protocol + '//' + window.location.host
    const url =
        currentDomain +
        '/#/containerTrajectory?' +
        `carrierCode=${row?.carrierCode || ''}&billNo=${row.biNo || ''}&sailingId=${row.sailingId || ''}&containerNo=${
            row.cartonNo === '全量' ? row.cartonNoList[1] : row.cartonNo || ''
        }&sub_containerNo=${row.containerNo ? row.containerNo : ''}&activeName=${activeName.value}`
    window.open(url, '_blank')
}
const handleShowRoutePort = () => {
    store.onShowFixedDialog()
}
const confirmCancel = async () => {
    const fun: any =
        activeName.value === 0 ? subscribeCancel : activeName.value === 3 ? subscribeCancel_beta : subscribeCancel_gw
    const res = await fun({ subscriptionIds: cancelId.value })
    chooseCancelRow.value.forEach((item: any) => {
        sendGio('cancelSub_upsSubmit', {
            bino: item.biNo,
            cartonNo: item.cartonNo,
            shipCompany: item?.carrierCode,
            point: item.lightenNode || item.currentNode,
            pointTime: item.lightenNodeTime || item.currentNodeTime,
            type: activeNameObjGio[activeName.value]
        })
    })
    // 取消订阅成功
    if (res.success) {
        total.value = total.value - cancelId.value.length
        if (total.value > 0 && total.value % form.pageSize === 0 && form.page > 1) {
            form.page = form.page - 1
        }
        handleSearch()
        showCancel.value = false
    }
}

const handleSaveEdit = () => {
    if (activeName.value === 2) {
        editFormRef.value?.validate((v) => {
            if (v) {
                sub_edit_port({
                    subscribeId: editForm.subscribeId,
                    remark: editForm.remark
                }).then((res) => {
                    if (res.success && res.data) {
                        Message.shortSuccess('操作成功')
                        showEdit.value = false
                        handleSearch()
                    }
                })
            }
        })
    } else if (activeName.value === 1) {
        sendGio('item_edit_submit', { type: 'gw' })
        editFormRef.value?.validate((v) => {
            if (v) {
                sub_edit_gw(editForm).then((res) => {
                    if (res.success && res.data) {
                        Message.shortSuccess('操作成功')
                        showEdit.value = false
                        handleSearch()
                    }
                })
            }
        })
    } else {
        handleSeaEdit()
    }
}
const handleSeaEdit = () => {
    sendGio('item_edit_submit', { type: activeNameObjGio[activeName.value] })
    editFormRef.value?.validate((v) => {
        if (v) {
            const fun = activeName.value === 0 ? sub_edit : sub_edit_beta
            fun(editForm).then((res) => {
                if (res.success && res.data) {
                    Message.shortSuccess('操作成功')
                    showEdit.value = false
                    handleSearch()
                }
            })
        }
    })
}
const goDetail = (params: any) => {
    switch (activeName.value) {
        // 海运
        case 0:
            activeSearch.value = '0'
            const param: any = {
                biNo: params.biNo,
                carrierCode: params?.carrierCode,
                type: '0',
                sailingId: params.sailingId,
                isFrom: 'sub',
                isCartonNoList: 'true'
            }
            if (params.containerNo) {
                param.cartonNo = params.containerNo
                param.sub_containerNo = params.containerNo
            }
            if (params?.cartonNoList?.length) {
                param.activeCartonNo = params.cartonNo
            }
            search(param)
            break
        // 关务
        case 1:
            params.type = '2'
            delete params.source
            activeSearch.value = '2'
            search({
                biNo: params.biNo,
                type: '2',
                sailingId: params.sailingId,
                isFrom: 'sub',
                isExport: params.ieid,
                entryId: params.entryId,
                isList: 'list'
            })
            break
        case 3:
            activeSearch.value = '7'
            const p: any = {
                biNo: params.biNo,
                carrierCode: params?.carrierCode,
                type: '7',
                sailingId: params.sailingId,
                isFrom: 'sub',
                isCartonNoList: 'true'
            }
            if (params.containerNo) {
                p.cartonNo = params.containerNo
                p.sub_containerNo = params.containerNo
            }
            if (params?.cartonNoList?.length) {
                p.activeCartonNo = params.cartonNo
            }
            search(p)
            break
        default:
    }
}
const goDetailPort = (row: any) => {
    activeSearch.value = '1'
    const params: any = {
        billNo: row.billNo || '',
        portType: row.portType,
        vesselName: row.vesselName || '',
        voyage: row.voyage || ''
    }
    if (row?.containerNo) {
        params.containerNo = row.containerNo
    }
    searchPort({
        params,
        isFrom: 'sub',
        searchType: 'searchBar'
    })
}
// 判断form表单是否有参数
function validateFormFields(form) {
    const excludedKeys = ['page', 'pageSize']
    for (const key in form) {
        if (!excludedKeys.includes(key)) {
            const value = form[key]
            if ((Array.isArray(value) && value.length > 0) || (typeof value === 'string' && value.trim() !== '')) {
                return true
            }
        }
    }
    return false
}
const handleSizeChange = (v: number) => {
    form.pageSize = v
    handleQuerySearch()
}
const handleCurrentChange = (v: number) => {
    form.page = v
    // if (validateFormFields(form)) {
    //     form.page = 1
    // }
    handleSearch()
}
const handleReset = () => {
    form.companyName = ''
    form.queryNo = ''
    form.time = ''
    form.subscribeTimeStart = ''
    form.subscribeTimeEnd = ''
    form.remark = ''
    form.voyage = ''
    form.vesselName = ''
    form.carrierCodeList = []
    form.stateList = []
    form.transitStateList = []
    handleSearch()
}

const showReSub = ref(false)
const showReSubGw = ref(false)
const reSubData = ref<any>()
const reSubDataGw = ref<any>()
const noDataReason = {
    1: '提单号输入错误，请修改订阅',
    3: '箱号输入错误，请修改订阅',
    5: '船司选择错误，请修改订阅',
    9: '暂无相关信息'
}
const goWrite = (item: any) => {
    showReSub.value = true
    reSubData.value = { ...item }
    reSubData.value['reasonMessage'] = noDataReason[item.noDataReason] || item.message + '，请修改订阅'
}
const goWriteGw = (item: any) => {
    showReSubGw.value = true
    reSubDataGw.value = { ...item }
    reSubDataGw.value['reasonMessage'] = item.message + '，请修改订阅'
}
// const handleQuerySearchFirst = () => {
//     sendGio('subResult_search', { type: activeName.value ? 'gw' : 'hy' })
//     handleQuerySearch()
// }
watch(activeName, () => {
    list.value = []
    portList.value = []
    total.value = 0
    selectRows.value = []
    selectRow.value = null
    // handleQuerySearch(true)
})
onBeforeRouteLeave((to) => {
    if (to.name === 'searchResult') {
        active.value = activeName.value
    } else {
        active.value = 0
    }
})
const { tabThList, tabThList1, changeChecked, multipleTableRef } = useColumns(role)

const cellClickSea = (row, column) => {
    if (row.message || row?.currentNodeObj?.currentNodeCode === 'CSNH' || row?.oceanNoData) return
    if (['船舶信息', '离港/抵港时间', '重要节点', '客户信息', '订阅时间'].includes(column.label)) goDetail(row)
}
const cellClick = (row, column) => {
    if (row.message || !row.currentNode || row.currentNode === 'CSNH' || row?.oceanNoData) return
    if (['船舶信息', '离港/抵港时间', '重要节点', '客户信息', '订阅时间'].includes(column.label)) goDetail(row)
}
const cellClickPort = (row, column) => {
    if (!row?.subscriptionType) {
        if (!row.containers) return
        if (['船舶信息', '节点详情'].includes(column.label)) goDetailPort(row)
    } else {
        if (row.hasOwnProperty('noDataReason')) return
        if (['船舶信息', '节点详情'].includes(column.label)) goDetailPort(row)
    }
}
const disabledDate = (date: Date) => {
    const sixMonthsAgo = dayjs().subtract(6, 'month')
    return date.getTime() < sixMonthsAgo.valueOf()
}
const getHeaderCellStyle = () => {
    return {
        height: '50px',
        background: '#F4F7FB',
        color: '#2F303D',
        fontSize: '16px'
    }
}
const getShowNodeCanvas = (currentCartonNum, containers) => {
    const res = containers.filter((item) => {
        return item && Object.keys(item).length > 0 && item.containerNo === currentCartonNum
    })
    return res?.length && res[0]?.events?.length > 0
}
const isnoDataReason = (value) => {
    return value
}
const getPortList = () => {
    const params: any = {
        portType: '',
        page: form.page,
        pageSize: form.pageSize
    }
    if (form.queryNo) {
        params.billNo = form.queryNo
    }
    if (form.time) {
        params.startTime = form.time[0]
        params.endTime = form.time[1]
    }
    port_subscribe_list(params).then((res) => {
        if (res.success && res.data) {
            total.value = res.data.total
            const newList = res.data.list || []
            newList.forEach((newItem) => {
                if (newItem.containers && newItem.containers.length > 0) {
                    newItem.currentCartonNum = newItem.containers[0].containerNo
                    newItem.currentContainer = newItem.containers[0]
                    newItem.containers.forEach((it) => {
                        const currentEventCode = it.currentEventCode || ''
                        if (it.events?.length && currentEventCode) {
                            const matchedEvent = it.events.find((i) => i.eventCode === currentEventCode)
                            newItem.portCurrentNode = matchedEvent
                                ? { eventCname: matchedEvent.eventCname, eventTime: matchedEvent.eventTime }
                                : { eventCname: '', eventTime: '' }
                        }
                    })
                } else {
                    newItem.currentCartonNum = ''
                }
                const index = portList.value.findIndex((item) => item.subscribeId === newItem.subscribeId)
                if (index !== -1) {
                    const oldItem = portList.value[index]
                    Object.assign(oldItem, newItem)
                    // 如果 oldItem 有 countdown 或 noDataReason，但 newItem 没有，就从 oldItem 中删除它们
                    const z: any = ['countdown', 'noDataReason']
                    z.forEach((key) => {
                        if (key in oldItem && !(key in newItem)) {
                            delete oldItem[key]
                        }
                    })
                } else {
                    // 新增项直接添加
                    portList.value.push(newItem)
                }
            })
        }
    })
}
const getPortUpdataData = () => {
    if (portList.value.length) {
        timer = setInterval(() => {
            const r = portList.value.filter((item) => {
                return item.hasOwnProperty('countdown')
            })
            if (r.length) {
                getPortList()
            }
        }, 15000)
    }
}
const getCurrentNodeNameAndTime = (val: any) => {
    if (val?.majorCodeSet && Object.keys(val.majorCodeSet).length) {
        let o: any = null
        Object.keys(val.majorCodeSet).forEach((item) => {
            if (val.majorCodeSet[item]?.lighten) {
                o = {
                    name: val.majorCodeSet[item].name,
                    nodeTime: val.majorCodeSet[item].nodeTime,
                    currentNodeCode: item
                }
            }
        })
        return o
    }
    return null
}
const changeCurrentCartonNum = (containerNo: any, row: any) => {
    row.cartonNo = containerNo
    row.currentContainer = row.containerList[containerNo]
    row.currentNodeObj = getCurrentNodeNameAndTime(row.currentContainer)
    row.visibleContainerNoPop = false
}
const onContainerNoPopShow = (row: any) => {
    row.visibleContainerNoPop = true
}
const getOptionClass = (item: any, row: any) => {
    // 根据条件返回不同的类名
    if (item === row?.standerContainerNo && row?.exceptions?.length) {
        return 'highlight-option'
    } else {
        return ''
    }
}

const onTabChange = () => {
    form.page = 1
    handleReset()
}
const handleVisibleChange = (isVisible) => {
    if (isVisible) {
        getSeaStateStatistics()
    }
}
const getPort = (v: any) => {
    if (!v) return '-'
    const r = portData.value.filter((item) => {
        return item.code === v
    })
    if (r.length) {
        return r[0].name
    }
}
watch(showCancel, (v) => {
    if (!v) showPayTip.value = false
})
const setPopoverRef = (row, el) => {
    if (el) {
        popoverRefs.set(row.id, el)
    }
}
const setReferenceRef = (row, el) => {
    if (el) {
        referenceRefs.set(row.id, el)
    }
}
const togglePopover = (row) => {
    if (event) event.stopPropagation()
    row.visibleContainerNoPop = !row.visibleContainerNoPop
    nextTick(() => {
        if (row.visibleContainerNoPop) {
            document.addEventListener('click', (event) => handleClickOutside(event, row))
        } else {
            document.removeEventListener('click', (event) => handleClickOutside(event, row))
        }
    })
}
const handleClickOutside = (event, row) => {
    const popoverInstance = popoverRefs.get(row.id)
    const popoverEl = popoverInstance?.popperRef?.contentRef // 关键修改点，获取 Popover DOM
    const referenceEl = referenceRefs.get(row.id)
    if (popoverEl?.contains(event.target) || referenceEl?.contains(event.target)) {
        return
    }
    row.visibleContainerNoPop = false
    document.removeEventListener('click', (ev) => handleClickOutside(ev, row))
}
onBeforeUnmount(() => {
    clearInterval(timer)
    document.removeEventListener('click', (event) => handleClickOutside(event, null))
})
const currentCartonNumPortChange = (containerNo: any, row: any) => {
    const matchingContainer = row.containers.find((item) => item.containerNo === containerNo)
    if (matchingContainer) {
        row.currentContainer = matchingContainer
    }
}
const visibleTypesList = computed(() => {
    return types.filter((item) => {
        if (item?.isbeta) {
            if (user.value.loginStatus === 1) return false
            if (!isWhiteListbeta.value) return false
        }
        return true
    })
})
const onBatch = () => {
    if (user.value.loginStatus !== 1 && activeName.value === 0) {
        showBatchSubApplyDialog.value = true
        return
    }
    showUpload.value = true
}

const isR = (row: any) => {
    const { portType, etd, atd, etdPort, atdPort } = row
    const isTargetPort = ['CNTXG', 'CNSHA'].includes(portType) //是否为上海港或天津港
    if (!isTargetPort) return false

    // 若预计离港（etdPort）有值或实际离港有值（atdPort），则页面展示预计抵港、实际抵港、预计离港、实际离港四个字段；
    const hasDeparturePortTime = !!etdPort || !!atdPort
    // 若预计离港和实际离港都没有值，且预计/实际 离泊有值，则页面展示预计靠泊、实际靠泊、预计离泊、实际离泊四个字段。
    const hasBerthTime = !etdPort && !atdPort && (!!etd || !!atd)
    // 若预计离港和实际离港都没有值，且预计/实际 离泊无值，则页面展示预计抵港、实际抵港、预计离港、实际离港四个字段；
    const noTimesAvailable = !etdPort && !atdPort && !etd && !atd

    return hasDeparturePortTime || noTimesAvailable || !hasBerthTime
}
// 获取滚动容器（不是 tableWrapper，而是中间可滚部分）
function getScrollWrap() {
    return multipleTableRef.value?.$el.querySelector('.el-scrollbar__wrap')
}

// 横向滚动
const scrollLeft = () => {
    const wrap = getScrollWrap()
    if (wrap) wrap.scrollLeft -= 200
}

const scrollRight = () => {
    const wrap = getScrollWrap()
    if (wrap) wrap.scrollLeft += 200
}
</script>
<template>
    <layout-container style="overflow: auto">
        <layout-scroll class="content">
            <layout-container>
                <div class="tabs" style="margin: 0 80px 20px">
                    <layout-flex between center class="tabs-top">
                        <layout-flex class="tabs-top-item">
                            <layout-flex
                                v-for="item in tabs"
                                :key="item.name"
                                center
                                :class="{ active: item.active }"
                                @click="changeActiveTabs(item)"
                            >
                                <img class="mr10" :src="item.icon" alt="" />
                                <div>{{ item.name }}</div>
                            </layout-flex>
                        </layout-flex>
                        <layout-flex class="pr20">
                            <el-button v-gio-track="{ type: 'sub_add' }" type="primary" @click="showReSubscribe = true"
                                >添加订阅</el-button
                            >
                            <el-button
                                v-if="activeName === 0 || activeName === 3"
                                v-gio-track="{ type: 'search_mass' }"
                                class="ml20"
                                @click="onBatch"
                                >批量订阅</el-button
                            >
                        </layout-flex>
                    </layout-flex>
                    <div v-if="tabs[0].active" class="pl20 pr20 pb15" style="padding-top: 9px">
                        <el-tabs v-model="activeName" @tab-change="onTabChange">
                            <el-tab-pane v-for="(item, index) in visibleTypesList" :key="item.name" :name="index">
                                <template #label>
                                    <span class="custom-tabs-label pr fs14">
                                        <span>{{ `${item.name}(${item.num})` }}</span>
                                    </span>
                                </template>
                            </el-tab-pane>
                        </el-tabs>
                        <el-form class="ml10" label-width="84px" label-position="left" inline label-suffix="：">
                            <el-form-item label="单号查询">
                                <el-input
                                    v-model="form.queryNo"
                                    clearable
                                    style="width: 200px; height: 32px"
                                    placeholder="请输入单号信息"
                                ></el-input>
                            </el-form-item>
                            <el-form-item label="订阅时间">
                                <el-date-picker
                                    v-model="form.time"
                                    style="width: 400px; height: 32px"
                                    clearable
                                    type="datetimerange"
                                    range-separator="至"
                                    :disabled-date="disabledDate"
                                    start-placeholder="开始时间"
                                    end-placeholder="结束时间"
                                    value-format="YYYY-MM-DD HH:mm:ss"
                                />
                            </el-form-item>
                            <el-form-item v-if="role === '货代' && activeName !== 2" label="客户">
                                <el-input
                                    v-model="form.companyName"
                                    clearable
                                    style="width: 200px; height: 32px"
                                    placeholder="请输入客户"
                                ></el-input>
                            </el-form-item>
                            <el-form-item v-if="activeName === 2" label="船名">
                                <el-input
                                    v-model="form.vesselName"
                                    clearable
                                    style="width: 200px; height: 32px"
                                    placeholder="请输入船名"
                                ></el-input>
                            </el-form-item>
                            <el-form-item v-if="activeName === 2" label="航次">
                                <el-input
                                    v-model="form.voyage"
                                    clearable
                                    style="width: 200px; height: 32px"
                                    placeholder="请输入航次"
                                ></el-input>
                            </el-form-item>
                            <el-form-item v-if="activeName !== 2" label="备注">
                                <el-input
                                    v-model="form.remark"
                                    clearable
                                    style="width: 200px; height: 32px"
                                    placeholder="请输入备注"
                                ></el-input>
                            </el-form-item>
                            <el-form-item v-if="activeName === 0 || activeName === 3" label="船司">
                                <el-select
                                    v-model.trim="form.carrierCodeList"
                                    clearable
                                    multiple
                                    collapse-tags
                                    collapse-tags-tooltip
                                    :max-collapse-tags="2"
                                    style="width: 200px"
                                    class="w100p sea-select"
                                    suffix-icon=""
                                    filterable
                                    size="large"
                                    placeholder="请选择"
                                    @visible-change="handleVisibleChange"
                                >
                                    <template
                                        v-for="[key, value] in Object.entries(seaOption?.carrierState || {})"
                                        :key="key"
                                    >
                                        <el-option :label="key + ' ' + value" :value="key">
                                            <template #default>
                                                <layout-flex between center>
                                                    <span>{{ key }}</span>
                                                    <span style="margin-left: 5px"> {{ value || '无名称' }}</span>
                                                </layout-flex>
                                            </template>
                                        </el-option>
                                    </template>
                                </el-select>
                            </el-form-item>
                            <el-form-item v-if="activeName === 0 || activeName === 3" label="状态">
                                <el-select
                                    v-model.trim="form.stateList"
                                    clearable
                                    multiple
                                    collapse-tags
                                    collapse-tags-tooltip
                                    :max-collapse-tags="2"
                                    style="width: 200px"
                                    class="w100p sea-select"
                                    suffix-icon=""
                                    filterable
                                    size="large"
                                    placeholder="请选择"
                                    @visible-change="handleVisibleChange"
                                >
                                    <template v-for="[key, value] in Object.entries(seaOption?.state || {})" :key="key">
                                        <el-option :label="stateObj[key] + ' ' + value" :value="key">
                                            <template #default>
                                                <layout-flex between center>
                                                    <span>{{ stateObj[key] }}</span>
                                                    <span style="margin-left: 5px"> {{ value || '' }}</span>
                                                </layout-flex>
                                            </template>
                                        </el-option>
                                    </template>
                                </el-select>
                            </el-form-item>
                            <el-form-item v-if="activeName === 0 || activeName === 3" label="中转单">
                                <el-select
                                    v-model.trim="form.transitStateList"
                                    clearable
                                    multiple
                                    collapse-tags
                                    collapse-tags-tooltip
                                    :max-collapse-tags="2"
                                    style="width: 210px"
                                    class="w100p sea-select"
                                    suffix-icon=""
                                    filterable
                                    size="large"
                                    placeholder="请选择"
                                    @visible-change="handleVisibleChange"
                                >
                                    <template
                                        v-for="[key, value] in Object.entries(seaOption?.transitState || {})"
                                        :key="key"
                                    >
                                        <el-option :label="transitStateObj[key] + ' ' + value" :value="key">
                                            <template #default>
                                                <layout-flex between center>
                                                    <span>{{ transitStateObj[key] }}</span>
                                                    <span style="margin-left: 5px"> {{ value || '' }}</span>
                                                </layout-flex>
                                            </template>
                                        </el-option>
                                    </template>
                                </el-select>
                            </el-form-item>
                            <el-form-item>
                                <el-button
                                    v-gio-track="{
                                        type: 'subResult_search',
                                        value: {
                                            type:
                                                activeName === 0
                                                    ? 'hy'
                                                    : activeName === 1
                                                    ? 'gw'
                                                    : activeName === 2
                                                    ? 'gqck'
                                                    : 'hy'
                                        }
                                    }"
                                    class="fs14"
                                    style="height: 32px"
                                    type="primary"
                                    :icon="Search"
                                    @click="handleQuerySearch"
                                    >查询</el-button
                                >
                                <el-button
                                    class="fs14"
                                    style="height: 32px"
                                    type="primary"
                                    plain
                                    :icon="RefreshRight"
                                    @click="handleReset"
                                    >重置</el-button
                                >
                            </el-form-item>
                        </el-form>
                    </div>
                </div>
                <layout-scroll class="box" style="background: #f2f7ff">
                    <div
                        style="margin: 0 80px; background: #fff; padding: 20px; border-radius: 8px; position: relative"
                    >
                        <layout-flex between center class="top-buttons">
                            <layout-flex center class="fs16 fw500">
                                {{ activeNameObj[activeName] }}
                                <span v-if="activeName === 0 || activeName === 3" class="fs12 --red-text"
                                    >（仅展示近6个月订阅单）</span
                                >
                            </layout-flex>
                            <layout-flex center class="buttons">
                                <el-button
                                    id="export"
                                    type="primary"
                                    plain
                                    @click="activeName === 2 ? exportExcelPort() : exportExcel()"
                                >
                                    <img src="@/assets/img/subscriptionList/saas/icon_daochu@2x.png" alt="" />
                                    导出
                                </el-button>
                                <el-button
                                    v-if="activeName !== 1"
                                    @click="activeName === 2 ? handleShowCancelPort() : handleShowCancel()"
                                >
                                    <img src="@/assets/img/subscriptionList/saas/icon_quxiao@2x.png" alt="" />
                                    批量取消订阅
                                </el-button>
                                <el-button
                                    v-if="role === '货代' && activeName !== 2"
                                    id="setUser"
                                    @click="handleShowAddUser"
                                >
                                    <img src="@/assets/img/subscriptionList/saas/icon_yonghu@2x.png" alt="" />
                                    批量设置客户
                                </el-button>
                                <el-button v-if="activeName !== 2" class="setPush" @click="handleShowPushSetting()">
                                    <img src="@/assets/img/subscriptionList/saas/icon_tuisong@2x.png" alt="" />
                                    推送设置
                                </el-button>
                                <el-button v-if="activeName === 2" class="setPush" @click="handleShowPushSettingPort()">
                                    <img src="@/assets/img/subscriptionList/saas/icon_tuisong@2x.png" alt="" />
                                    推送设置
                                </el-button>
                                <el-button
                                    v-if="activeName === 0 || activeName === 3"
                                    id="setNode"
                                    v-gio-track="{ type: 'pointSet', value: { type: activeNameObjGio[activeName] } }"
                                    @click="handleSetNode()"
                                >
                                    <img src="@/assets/img/subscriptionList/saas/icon_jiedian@2x.png" alt="" />
                                    设置重要节点
                                </el-button>
                                <el-popover v-if="activeName !== 2" placement="bottom-end" :width="140" trigger="click">
                                    <template #reference>
                                        <el-button>
                                            <img src="@/assets/img/subscriptionList/saas/icon_lie@2x.png" alt="" />
                                            自定义列
                                        </el-button>
                                    </template>
                                    <div v-if="activeName === 0 || activeName === 3">
                                        <div>
                                            <el-checkbox
                                                v-for="item in tabThList"
                                                :key="item.name"
                                                v-model="item.checked"
                                                :disabled="item.disabled"
                                                class="checkbox"
                                                :label="item.name"
                                                @change="changeChecked"
                                            />
                                        </div>
                                    </div>
                                    <div v-if="activeName === 1">
                                        <div>
                                            <el-checkbox
                                                v-for="item in tabThList1"
                                                :key="item.name"
                                                v-model="item.checked"
                                                :disabled="item.disabled"
                                                class="checkbox"
                                                :label="item.name"
                                                @change="changeChecked"
                                            />
                                        </div>
                                    </div>
                                </el-popover>
                            </layout-flex>
                        </layout-flex>
                        <div
                            style="
                                margin-bottom: 10px;
                                position: sticky;
                                top: 0;
                                z-index: 100;
                                background: white;
                                padding: 6px 0;
                            "
                        >
                            <el-button @click="scrollLeft">← 向左滚动</el-button>
                            <el-button @click="scrollRight">→ 向右滚动</el-button>
                        </div>
                        <el-table
                            v-if="list.length > 0 && (activeName === 0 || activeName === 3)"
                            ref="multipleTableRef"
                            :data="list"
                            class="table _contentTable"
                            :span-method="handleSpanMethod"
                            style="width: 100%"
                            :header-cell-style="getHeaderCellStyle()"
                            @cell-click="cellClickSea"
                            @selection-change="handleCheckChange"
                        >
                            <el-table-column :key="1" type="selection" width="45" />
                            <el-table-column :key="2" label="基本信息" width="423">
                                <template #default="scope">
                                    <div class="color6D7280 fs13 row">
                                        <layout-flex center style="width: 100%">
                                            <layout-flex center class="flex1 pr15" style="width: 219px">
                                                备注：
                                                <el-icon
                                                    v-gio-track="{ type: 'subResult_beizhu' }"
                                                    class="edit-icon pointer setEdit"
                                                    :size="15"
                                                    color="#1d79ff"
                                                    @click="handleEdit(scope.row)"
                                                >
                                                    <Edit /> </el-icon
                                                ><el-tooltip
                                                    :content="scope.row?.remark || '-'"
                                                    placement="bottom-start"
                                                >
                                                    <span class="--gray-text flex1 ellipsis">{{
                                                        scope.row?.remark || '-'
                                                    }}</span>
                                                </el-tooltip>
                                            </layout-flex>
                                            <div class="width180">
                                                船司：<span class="--gray-text"
                                                    >{{ scope.row?.carrierCode
                                                    }}<a
                                                        v-if="getWebsite(scope.row?.carrierCode)"
                                                        v-gio-track="{ type: 'shipWeb' }"
                                                        class="website --blue-text pointer"
                                                        :href="getWebsite(scope.row?.carrierCode)"
                                                        target="_blank"
                                                        >[官网]</a
                                                    >
                                                </span>
                                            </div>
                                        </layout-flex>
                                        <layout-flex center>
                                            <div class="flex1">
                                                提单号：<span class="--gray-text">{{
                                                    scope.row?.biNoRemark || scope.row?.biNo
                                                }}</span
                                                ><span v-if="scope.row?.containerNum && scope.row?.containerNum > 1"
                                                    >（{{ scope.row?.containerNum }}箱）</span
                                                >
                                            </div>
                                            <layout-flex center class="width180">
                                                轨迹：<span
                                                    v-if="scope.row?.showTrack"
                                                    v-gio-track="{
                                                        type: 'subResult_shipLine',
                                                        value: {
                                                            bino: scope.row?.biNo,
                                                            shipCompany: scope.row?.carrierCode,
                                                            cartonNo: scope.row?.cartonNo
                                                        }
                                                    }"
                                                    class="route"
                                                    @click="handleShowRoute(scope.row)"
                                                >
                                                    <i class="iconfont icon-icon_route" />轨迹详情
                                                </span>
                                                <span
                                                    v-else
                                                    v-gio-track="{
                                                        type: 'subResult_shipLine',
                                                        value: {
                                                            bino: scope.row?.biNo,
                                                            shipCompany: scope.row?.carrierCode,
                                                            cartonNo: scope.row?.cartonNo
                                                        }
                                                    }"
                                                    class="route route1"
                                                    @click="showServer"
                                                >
                                                    <i class="iconfont icon-icon_route" />暂无数据
                                                </span>
                                            </layout-flex>
                                        </layout-flex>
                                        <layout-flex center>
                                            <div class="flex1">
                                                船名：<span class="--gray-text">{{
                                                    scope.row?.currentContainer?.vessel || '-'
                                                }}</span>
                                            </div>
                                            <div class="width180">
                                                船次：<span class="--gray-text">{{
                                                    scope.row?.currentContainer?.voyage || '-'
                                                }}</span>
                                            </div>
                                        </layout-flex>
                                        <layout-flex center>
                                            <div class="flex1 cartonNo-flex">
                                                <span>箱号：</span>
                                                <div class="cartonNum-selece cartonNum-selece-sea">
                                                    <div v-if="scope.row?.cartonNoList?.length">
                                                        <el-popover
                                                            :ref="(el) => setPopoverRef(scope.row, el)"
                                                            :visible="scope.row.visibleContainerNoPop"
                                                            placement="bottom"
                                                            trigger="click"
                                                            :inert="!scope.row.visibleContainerNoPop"
                                                            :popper-style="{ minWidth: '200px', width: 'auto' }"
                                                            @show="onContainerNoPopShow(scope.row)"
                                                        >
                                                            <el-scrollbar max-height="274px">
                                                                <div
                                                                    v-for="(item, index) in scope.row?.cartonNoList"
                                                                    :key="index"
                                                                    class="custom-option"
                                                                    @click="changeCurrentCartonNum(item, scope.row)"
                                                                >
                                                                    <div class="option-item">{{ item }}</div>
                                                                    <div
                                                                        v-if="
                                                                            scope.row?.containerList[item]?.exception
                                                                                ?.length
                                                                        "
                                                                        class="exception-container"
                                                                    >
                                                                        <layout-flex
                                                                            v-for="(it, i) in scope.row?.containerList[
                                                                                item
                                                                            ]?.exception"
                                                                            :key="i"
                                                                            center
                                                                            class="mr5"
                                                                        >
                                                                            <i
                                                                                style="
                                                                                    color: #f2301c;
                                                                                    margin-right: 4px;
                                                                                    font-size: 12px;
                                                                                "
                                                                                class="iconfont icon-icon_warning_red"
                                                                            ></i>
                                                                            <span style="color: #f2301c">{{ it }}</span>
                                                                        </layout-flex>
                                                                    </div>
                                                                </div>
                                                            </el-scrollbar>
                                                            <template #reference>
                                                                <div
                                                                    :ref="(el) => setReferenceRef(scope.row, el)"
                                                                    class="pointer ellipsis flex"
                                                                    style="
                                                                        min-width: 120px;
                                                                        max-width: 180px;
                                                                        justify-content: space-between;
                                                                    "
                                                                    @click="togglePopover(scope.row)"
                                                                >
                                                                    {{ scope.row.currentContainer?.containerNo }}
                                                                    <span class="ml5">
                                                                        <el-icon
                                                                            v-if="scope.row.visibleContainerNoPop"
                                                                            style="color: #999999; font-size: 10px"
                                                                            ><ArrowUpBold
                                                                        /></el-icon>
                                                                        <el-icon
                                                                            v-else
                                                                            style="color: #999999; font-size: 10px"
                                                                            ><ArrowDownBold
                                                                        /></el-icon>
                                                                    </span>
                                                                </div>
                                                            </template>
                                                        </el-popover>
                                                    </div>
                                                    <div v-else-if="scope.row?.containerNo">
                                                        {{ scope.row.containerNo }}
                                                    </div>
                                                    <div
                                                        v-else-if="
                                                            scope.row?.standerContainerNo &&
                                                            scope.row?.exceptions?.length
                                                        "
                                                    >
                                                        {{ scope.row.standerContainerNo }}
                                                    </div>
                                                    <div v-else>-</div>
                                                </div>
                                            </div>
                                            <div class="width180">
                                                订阅：<span class="--gray-text">{{ scope.row?.subscribeTime }}</span>
                                            </div>
                                        </layout-flex>
                                        <layout-flex
                                            v-if="
                                                scope.row?.currentContainer &&
                                                scope.row?.currentContainer?.currentNode !== 'CSNH'
                                            "
                                            center
                                            class="--blue-text"
                                        >
                                            最新：<span class="--orange-text"
                                                >【{{ scope.row?.currentContainer?.currentNodeName || '-' }}】</span
                                            >
                                            <span class="fw500">{{
                                                scope.row?.currentContainer?.currentNodeTime
                                            }}</span>
                                        </layout-flex>
                                        <layout-flex v-else center> 最新：- </layout-flex>
                                        <!-- 异常处理 -->
                                        <layout-flex
                                            v-if="scope.row?.exceptions && scope.row?.exceptions?.length > 0"
                                            center
                                        >
                                            <layout-flex
                                                v-for="item in scope.row?.exceptions"
                                                :key="scope.$index + item"
                                                center
                                                class="warning-item mr5"
                                            >
                                                <i
                                                    style="color: #fff; margin-right: 4px"
                                                    class="iconfont icon-icon_warning_red"
                                                ></i>
                                                {{ item }}
                                            </layout-flex>
                                        </layout-flex>
                                        <!-- <span class="warning-item-standerContainerNo">
                                        异常箱号：{{ scope.row.standerContainerNo }}</span
                                    > -->
                                        <!-- <layout-flex
                                        v-if="
                                            scope.row?.standerContainerNo &&
                                            scope.row?.exceptions?.length &&
                                            scope.row?.cartonNoList.length > 1
                                        "
                                        center
                                    >
                                        <layout-flex center class="warning-item-standerContainerNo mr5">
                                            异常箱号：{{ scope.row?.standerContainerNo }}
                                        </layout-flex>
                                    </layout-flex> -->
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column
                                v-if="tabThList[1] && tabThList[1].checked"
                                :key="3"
                                prop="name"
                                label="船舶信息"
                                width="230"
                            >
                                <template #default="scope">
                                    <div class="color6D7280 fs13 row">
                                        <div v-if="scope.row?.currentContainer?.openTime">
                                            开港：<span class="--gray-text">{{
                                                scope.row?.currentContainer.openTime
                                            }}</span>
                                        </div>
                                        <div v-if="scope.row?.currentContainer?.closeTime">
                                            截港：<span class="--gray-text">{{
                                                scope.row?.currentContainer.closeTime
                                            }}</span>
                                        </div>
                                        <layout-flex v-if="scope.row?.currentContainer?.terminalAta" center>
                                            靠泊：<span class="--gray-text">{{
                                                scope.row?.currentContainer.terminalAta
                                            }}</span>
                                            <span class="tip tip1">实</span>
                                        </layout-flex>
                                        <layout-flex v-else-if="scope.row?.currentContainer?.terminalEta" center>
                                            靠泊：
                                            <span class="--gray-text">{{
                                                scope.row?.currentContainer.terminalEta
                                            }}</span>
                                            <span class="tip tip2">预</span>
                                        </layout-flex>
                                        <layout-flex v-if="scope.row?.currentContainer?.terminalAtd" center>
                                            离泊：<span class="--gray-text">{{
                                                scope.row?.currentContainer.terminalAtd
                                            }}</span>
                                            <span class="tip tip1">实</span>
                                        </layout-flex>
                                        <layout-flex v-else-if="scope.row?.currentContainer?.terminalEtd" center>
                                            离泊：<span class="--gray-text">{{
                                                scope.row?.currentContainer.terminalEtd
                                            }}</span>
                                            <span class="tip tip2">预</span>
                                        </layout-flex>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column
                                v-if="tabThList[2] && tabThList[2].checked"
                                :key="4"
                                prop="amount1"
                                label="离港/抵港时间"
                                width="230"
                            >
                                <template #default="scope">
                                    <div class="color6D7280 fs13 row" style="margin-top: 6px">
                                        <div v-if="scope.row?.currentContainer?.startPortAtd" class="mb38">
                                            <div class="mb10">
                                                离港：<span class="--gray-text">{{
                                                    scope.row?.currentContainer.startPortAtd
                                                }}</span>
                                                <span class="tip tip1 tip-tip">实</span>
                                            </div>
                                            <div class="flex">
                                                <div>地点：</div>
                                                <el-tooltip
                                                    class="box-item"
                                                    effect="dark"
                                                    :content="scope.row?.currentContainer.startPortName"
                                                    placement="top-start"
                                                >
                                                    <div class="--gray-text ellipsis" style="max-width: 160px">
                                                        {{ scope.row?.currentContainer.startPortName || '-' }}
                                                    </div>
                                                </el-tooltip>
                                            </div>
                                        </div>
                                        <div
                                            v-else-if="
                                                scope.row?.currentContainer?.startPortEtd &&
                                                !scope.row?.currentContainer?.startPortAtd
                                            "
                                            class="mb38"
                                        >
                                            <div class="mb10">
                                                离港：<span class="--gray-text">{{
                                                    scope.row?.currentContainer.startPortEtd
                                                }}</span>
                                                <span class="tip tip2 tip-tip">预</span>
                                            </div>
                                            <div class="flex">
                                                <div>地点：</div>
                                                <el-tooltip
                                                    class="box-item"
                                                    effect="dark"
                                                    :content="scope.row?.currentContainer.startPortName"
                                                    placement="top-start"
                                                >
                                                    <div class="--gray-text ellipsis" style="max-width: 160px">
                                                        {{ scope.row?.currentContainer.startPortName || '-' }}
                                                    </div>
                                                </el-tooltip>
                                            </div>
                                        </div>
                                        <div v-if="scope.row?.currentContainer?.endPortAta" class="mb38">
                                            <div class="mb10">
                                                抵港：<span class="--gray-text">{{
                                                    scope.row?.currentContainer.endPortAta
                                                }}</span>
                                                <span class="tip tip1 tip-tip">实</span>
                                            </div>
                                            <div class="flex">
                                                <div>地点：</div>
                                                <el-tooltip
                                                    class="box-item"
                                                    effect="dark"
                                                    :content="scope.row?.currentContainer.endPortName"
                                                    placement="top-start"
                                                >
                                                    <div class="--gray-text ellipsis" style="max-width: 160px">
                                                        {{ scope.row?.currentContainer.endPortName || '-' }}
                                                    </div>
                                                </el-tooltip>
                                            </div>
                                        </div>
                                        <div
                                            v-else-if="
                                                scope.row?.currentContainer?.endPortEta &&
                                                !scope.row?.currentContainer?.endPortAta
                                            "
                                            class="mb38"
                                        >
                                            <div class="mb10">
                                                抵港：<span class="--gray-text">{{
                                                    scope.row?.currentContainer.endPortEta
                                                }}</span>
                                                <span class="tip tip2 tip-tip">预</span>
                                            </div>
                                            <div class="flex">
                                                <div>地点：</div>
                                                <el-tooltip
                                                    class="box-item"
                                                    effect="dark"
                                                    :content="scope.row?.currentContainer.endPortName"
                                                    placement="top-start"
                                                >
                                                    <div class="--gray-text ellipsis" style="max-width: 160px">
                                                        {{ scope.row?.currentContainer.endPortName || '-' }}
                                                    </div>
                                                </el-tooltip>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column :key="5" label="重要节点" min-width="600">
                                <template #default="scope">
                                    <layout-center
                                        v-if="
                                            !scope.row?.oceanNoData &&
                                            scope.row?.currentNodeObj?.currentNodeCode === 'CSNH'
                                        "
                                    >
                                        <info-null
                                            :key="scope.$index"
                                            :message="'箱动态暂未发生，节点发送后消息推送给您'"
                                        ></info-null>
                                    </layout-center>
                                    <div v-else-if="scope.row?.currentContainer?.majorCodeSet" style="height: 180px">
                                        <node-canvas
                                            v-if="scope.row?.currentContainer?.majorCodeSet"
                                            :key="scope.row?.subscribeId"
                                            :current-container="scope.row?.currentContainer"
                                        />
                                    </div>
                                    <layout-center v-else>
                                        <info-null
                                            v-if="scope.row?.message === '其他'"
                                            :key="scope.$index + '_2'"
                                        ></info-null>
                                        <info-error v-else-if="scope.row?.message">
                                            {{ scope.row?.message
                                            }}{{ scope.row?.message.indexOf('拥堵') > -1 ? '' : '，请修改订阅' }}
                                        </info-error>
                                        <sub-content-item
                                            v-else-if="scope.row?.timeLeft > 0"
                                            :key="scope.row?.subscribeId"
                                            :time="scope.row?.timeLeft"
                                        />
                                        <info-null
                                            v-else-if="
                                                scope.row?.hasOwnProperty('currentContainer') &&
                                                !scope.row?.currentContainer?.majorCodeSet
                                            "
                                            :key="scope.$index + '-'"
                                            :message="'请点击【详情】查看具体节点信息'"
                                        ></info-null>
                                        <info-null v-else :key="scope.$index + '_'"></info-null>
                                    </layout-center>
                                </template>
                            </el-table-column>
                            <el-table-column
                                v-if="role === '货代' && tabThList[4] && tabThList[4].checked"
                                :key="6"
                                label="客户信息"
                                width="220"
                            >
                                <template #default="scope">
                                    <div class="color6D7280 fs13 row">
                                        <layout-flex center>
                                            <i class="iconfont icon-icon_qiye"></i>
                                            <el-tooltip
                                                placement="bottom-start"
                                                :content="scope.row?.companyName || '-'"
                                            >
                                                <span class="ellipsis flex1">{{
                                                    scope.row?.companyName || '-'
                                                }}</span></el-tooltip
                                            >
                                        </layout-flex>
                                        <layout-flex center>
                                            <i class="iconfont icon-icon_call"></i>
                                            {{ scope.row?.phoneNumber || '-' }}
                                        </layout-flex>
                                        <layout-flex center>
                                            <i class="iconfont icon-icon-message"></i>
                                            <el-tooltip placement="bottom-start" :content="scope.row?.email || '-'">
                                                <span class="ellipsis flex1">{{
                                                    scope.row?.email || '-'
                                                }}</span></el-tooltip
                                            >
                                        </layout-flex>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column :key="7" fixed="right" label="操作" width="100">
                                <template #default="scope">
                                    <layout-flex column class="btns">
                                        <el-button
                                            v-if="!scope.row?.message || scope.row?.message === '其他'"
                                            v-gio-track="{
                                                type: 'subResult_detail',
                                                value: { type: activeNameObjGio[activeName] }
                                            }"
                                            :disabled="
                                                scope.row?.oceanNoData ||
                                                scope.row?.currentNodeObj?.currentNodeCode === 'CSNH' ||
                                                scope.row?.message === '其他'
                                            "
                                            type="primary"
                                            @click="goDetail(scope.row)"
                                            >详情</el-button
                                        >
                                        <el-button
                                            v-if="scope.row?.message && scope.row?.message !== '其他'"
                                            v-gio-track="{
                                                type: 'modifySub',
                                                value: { type: activeNameObjGio[activeName] }
                                            }"
                                            type="primary"
                                            @click="goWrite(scope.row)"
                                            >修改订阅</el-button
                                        >
                                        <el-button
                                            v-gio-track="{
                                                type: 'item_edit',
                                                value: { type: activeNameObjGio[activeName] }
                                            }"
                                            class="setEdit"
                                            @click="handleEdit(scope.row)"
                                            >编辑</el-button
                                        >
                                        <el-button
                                            v-gio-track="{
                                                type: 'pushSet',
                                                value: { type: activeNameObjGio[activeName] }
                                            }"
                                            class="setPush"
                                            @click="handleShowPushSetting(scope.row)"
                                            >推送设置</el-button
                                        >
                                        <el-button
                                            v-gio-track="{
                                                type: 'cancelSub',
                                                value: { type: activeNameObjGio[activeName] }
                                            }"
                                            @click="handleShowCancel(scope.row)"
                                            >取消订阅</el-button
                                        >
                                    </layout-flex>
                                </template>
                            </el-table-column>
                        </el-table>
                        <el-table
                            v-if="list.length > 0 && activeName === 1"
                            ref="multipleTableRef"
                            :data="list"
                            class="table _contentTable"
                            style="width: 100%"
                            :header-cell-style="getHeaderCellStyle()"
                            @cell-click="cellClick"
                            @selection-change="handleCheckChange"
                        >
                            <el-table-column :key="8" type="selection" width="45" />
                            <el-table-column :key="9" label="基本信息" width="400">
                                <template #default="scope">
                                    <div class="color6D7280 fs13 row" style="width: 260px">
                                        <layout-flex center>
                                            <layout-flex center class="ellipsis flex1 pr15">
                                                备注：
                                                <el-icon
                                                    v-gio-track="{ type: 'subResult_beizhu' }"
                                                    class="edit-icon pointer"
                                                    :size="15"
                                                    color="#1d79ff"
                                                    @click="handleEdit(scope.row)"
                                                >
                                                    <Edit /> </el-icon
                                                ><el-tooltip
                                                    :content="scope.row.remark || '-'"
                                                    placement="bottom-start"
                                                >
                                                    <span class="--gray-text">{{ scope.row.remark || '-' }}</span>
                                                </el-tooltip>
                                            </layout-flex>
                                        </layout-flex>
                                        <layout-flex center>
                                            <div class="flex1">
                                                提（运）单号：<span class="--gray-text">{{
                                                    scope.row.biNo || '-'
                                                }}</span
                                                ><span v-if="scope.row.cartonNum && scope.row.cartonNum > 1"
                                                    >（{{ scope.row.cartonNum }}箱）</span
                                                >
                                            </div>
                                        </layout-flex>
                                        <layout-flex center>
                                            <div class="flex1">
                                                报关单号：<span class="--gray-text">{{
                                                    scope.row.entryId || '-'
                                                }}</span>
                                            </div>
                                        </layout-flex>
                                        <layout-flex center>
                                            <div class="flex1">
                                                进出口方式：<span class="--gray-text">{{
                                                    scope.row.ieid === 'E'
                                                        ? '出口'
                                                        : scope.row.ieid === 'I'
                                                        ? '进口'
                                                        : '-'
                                                }}</span>
                                            </div>
                                        </layout-flex>
                                        <layout-flex v-if="scope.row.currentNode" center class="--blue-text">
                                            最新：<span class="--orange-text"
                                                >【{{ nodeObj[scope.row.currentNode] || '-' }}】</span
                                            >
                                            <span class="fw500">{{ scope.row.currentNodeTime }}</span>
                                        </layout-flex>
                                        <layout-flex v-else center> 最新：- </layout-flex>
                                        <layout-flex
                                            v-if="
                                                scope.row.processorExceptions &&
                                                scope.row.processorExceptions.length > 0
                                            "
                                            center
                                        >
                                            <layout-center
                                                v-for="item in scope.row.processorExceptions"
                                                :key="scope.$index + item"
                                                class="warning-item mr5"
                                            >
                                                <i
                                                    style="color: #fff; margin-right: 4px"
                                                    class="iconfont icon-icon_warning_red"
                                                ></i
                                                >{{ item }}
                                            </layout-center>
                                        </layout-flex>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column :key="10" label="重要节点" min-width="600">
                                <template #default="scope">
                                    <div v-if="scope.row.currentNode" style="height: 160px">
                                        <node-canvas-gw
                                            :key="scope.row.subscribeId"
                                            :major-code="scope.row.ieid === 'I' ? customsImportNode : customsExitNode"
                                            :major-code-lighten="scope.row.currentNode"
                                            :major-code-lighten-time="scope.row.currentNodeTime"
                                        />
                                    </div>
                                    <layout-center v-else-if="scope.row.message">
                                        <info-error>{{ scope.row.message }}</info-error>
                                    </layout-center>
                                    <layout-center v-else>
                                        <info-null></info-null>
                                    </layout-center>
                                </template>
                            </el-table-column>
                            <el-table-column
                                v-if="role === '货代' && tabThList1[2] && tabThList1[2].checked"
                                :key="11"
                                label="客户信息"
                                width="300"
                            >
                                <template #default="scope">
                                    <div class="color6D7280 fs13 row">
                                        <layout-flex center>
                                            <i class="iconfont icon-icon_qiye"></i>
                                            <el-tooltip
                                                placement="bottom-start"
                                                :content="scope.row.companyName || '-'"
                                            >
                                                <span class="ellipsis flex1">{{
                                                    scope.row.companyName || '-'
                                                }}</span></el-tooltip
                                            >
                                        </layout-flex>
                                        <layout-flex center>
                                            <i class="iconfont icon-icon_call"></i>
                                            {{ scope.row.phoneNumber || '-' }}
                                        </layout-flex>
                                        <layout-flex center>
                                            <i class="iconfont icon-icon_qiye"></i>
                                            <el-tooltip placement="bottom-start" :content="scope.row.email || '-'">
                                                <span class="ellipsis flex1">{{
                                                    scope.row.email || '-'
                                                }}</span></el-tooltip
                                            >
                                        </layout-flex>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column
                                v-if="
                                    (role === '货主' && tabThList1[2] && tabThList1[2].checked) ||
                                    (role === '货代' && tabThList1[3] && tabThList1[3].checked)
                                "
                                :key="12"
                                label="订阅时间"
                                prop="subscribeTime"
                                width="300"
                            >
                            </el-table-column>
                            <el-table-column :key="13" fixed="right" label="操作" width="100">
                                <template #default="scope">
                                    <layout-flex column class="btns">
                                        <el-button
                                            v-if="!scope.row.message"
                                            v-gio-track="{ type: 'subResult_detail', value: { type: 'gw' } }"
                                            :disabled="!scope.row.currentNode"
                                            type="primary"
                                            @click="goDetail(scope.row)"
                                            >详情</el-button
                                        >
                                        <el-button
                                            v-if="scope.row.message"
                                            v-gio-track="{ type: 'modifySub', value: { type: 'gw' } }"
                                            type="primary"
                                            @click="goWriteGw(scope.row)"
                                            >修改订阅</el-button
                                        >
                                        <el-button
                                            v-gio-track="{ type: 'item_edit', value: { type: 'gw' } }"
                                            @click="handleEdit(scope.row)"
                                            >编辑</el-button
                                        >
                                        <el-button
                                            v-gio-track="{ type: 'pushSet', value: { type: 'gw' } }"
                                            class="setPush"
                                            @click="handleShowPushSetting(scope.row)"
                                            >推送设置</el-button
                                        >
                                        <el-button
                                            v-gio-track="{ type: 'cancelSub', value: { type: 'gw' } }"
                                            @click="handleShowCancel(scope.row)"
                                            >取消订阅</el-button
                                        >
                                    </layout-flex>
                                </template>
                            </el-table-column>
                        </el-table>
                        <!-- 港区 -->
                        <el-table
                            v-if="portList.length > 0 && activeName === 2"
                            ref="multipleTableRef"
                            :data="portList"
                            class="table _contentTable"
                            style="width: 100%"
                            :span-method="handleSpanMethodPort"
                            :header-cell-style="getHeaderCellStyle()"
                            @cell-click="cellClickPort"
                            @selection-change="handleCheckChange"
                        >
                            <el-table-column :key="1" type="selection" width="45" />
                            <el-table-column :key="2" label="基本信息" width="480">
                                <template #default="scope">
                                    <div class="color6D7280 fs13 row" style="margin-bottom: 11px">
                                        <layout-flex center>
                                            <layout-flex center class="ellipsis flex1 pr15">
                                                备注：
                                                <el-icon
                                                    v-gio-track="{ type: 'subResult_beizhu' }"
                                                    class="edit-icon pointer"
                                                    :size="15"
                                                    color="#1d79ff"
                                                    @click="handleEdit(scope.row)"
                                                >
                                                    <Edit /> </el-icon
                                                ><el-tooltip
                                                    :content="scope.row.remark || '-'"
                                                    placement="bottom-start"
                                                >
                                                    <span class="--gray-text">{{ scope.row.remark || '-' }}</span>
                                                </el-tooltip>
                                            </layout-flex>
                                            <div class="width180">
                                                码头：<span class="--gray-text">{{
                                                    scope.row.terminalName || '-'
                                                }}</span>
                                            </div>
                                        </layout-flex>
                                    </div>
                                    <div v-if="!scope.row?.subscriptionType" class="color6D7280 fs13 row">
                                        <layout-flex center>
                                            <div class="flex1">
                                                提单号：<span class="--gray-text">{{ scope.row.billNo || '-' }}</span>
                                            </div>
                                            <div class="width180">
                                                订阅：<span class="--gray-text">{{ scope.row.createTime || '-' }}</span>
                                            </div>
                                        </layout-flex>
                                        <layout-flex center>
                                            <div class="flex1">
                                                港区：<span class="--gray-text">{{ getPort(scope.row.portType) }}</span>
                                            </div>
                                            <!-- <span class="--gray-text">-</span> -->
                                            <div class="cartonNo-flex width180">
                                                <span>箱号：</span>
                                                <div v-if="scope.row?.containers?.length" class="cartonNum-selece">
                                                    <el-select
                                                        v-if="scope.row?.containers?.length"
                                                        v-model="scope.row.currentCartonNum"
                                                        placeholder=""
                                                        style="width: 130px"
                                                        :disabled="!scope.row.currentCartonNum"
                                                        @change="(e) => currentCartonNumPortChange(e, scope.row)"
                                                    >
                                                        <el-option
                                                            v-for="(item, index) in scope.row.containers"
                                                            :key="index"
                                                            :label="item.containerNo"
                                                            :value="item.containerNo"
                                                        />
                                                    </el-select>
                                                    <div v-else>-</div>
                                                </div>
                                                <div v-else>{{ scope.row?.containerNo || '-' }}</div>
                                            </div>
                                        </layout-flex>
                                        <layout-flex center>
                                            <div class="flex1">
                                                最新：<span v-if="scope.row?.portCurrentNode">
                                                    <span
                                                        v-if="scope.row.portCurrentNode?.eventCname"
                                                        class="--orange-text"
                                                        >【{{ scope.row.portCurrentNode.eventCname }}】</span
                                                    >
                                                    <span v-else>-</span>
                                                    <span
                                                        v-if="scope.row.portCurrentNode?.eventTime"
                                                        class="fw500"
                                                        :class="{ colorCurrent: !!scope.row.portCurrentNode.eventTime }"
                                                        >{{ scope.row?.portCurrentNode.eventTime }}</span
                                                    >
                                                </span>
                                                <span v-else>-</span>
                                            </div>
                                            <layout-flex class="width180">
                                                轨迹：<span class="route-kache route" @click="handleShowRoutePort">
                                                    <!-- <i class="iconfont icon-icon_track2" /> -->
                                                    <img
                                                        style="width: 15px; height: 12px; margin-right: 2px"
                                                        src="@/assets/img/searchResult/port/icon_track@2x.png"
                                                        alt=""
                                                    />
                                                    <span>集卡轨迹</span>
                                                </span>
                                            </layout-flex>
                                        </layout-flex>
                                        <layout-flex v-if="scope.row?.currentContainer?.exception?.length > 0" center>
                                            <layout-center
                                                v-for="item in scope.row.currentContainer.exception"
                                                :key="scope.$index + item"
                                                class="warning-item mr5"
                                            >
                                                <i
                                                    style="color: #fff; margin-right: 4px"
                                                    class="iconfont icon-icon_warning_red"
                                                ></i
                                                >{{ item }}
                                            </layout-center>
                                        </layout-flex>
                                    </div>
                                    <div v-else class="color6D7280 fs13 row">
                                        <layout-flex center>
                                            <div class="flex1">
                                                船名：<span class="--gray-text">{{ scope.row.vesselName || '-' }}</span>
                                            </div>
                                            <div class="width180">
                                                航次：<span class="--gray-text">{{ scope.row.voyage || '-' }}</span>
                                            </div>
                                        </layout-flex>
                                        <layout-flex center>
                                            <div class="flex1">
                                                订阅：<span class="--gray-text">{{ scope.row.createTime || '-' }}</span>
                                            </div>
                                            <div class="width180">
                                                港区：<span class="--gray-text">{{ getPort(scope.row.portType) }}</span>
                                            </div>
                                        </layout-flex>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column :key="3" prop="name" label="船舶信息" min-width="230">
                                <template #default="scope">
                                    <div class="color6D7280 fs13 row portInfo">
                                        <template v-if="scope.row.openTime">
                                            <div>
                                                开港：<span class="--gray-text">{{ scope.row.openTime }}</span>
                                            </div>
                                        </template>
                                        <template v-if="scope.row.closeTime">
                                            <div>
                                                截港：<span class="--gray-text">{{ scope.row.closeTime }}</span>
                                            </div>
                                        </template>

                                        <template v-if="isR(scope.row)">
                                            <layout-flex v-if="scope.row.atAnchor" center>
                                                抵港：<span class="--gray-text">{{ scope.row.atAnchor }}</span>
                                                <span class="tip tip1">实</span>
                                            </layout-flex>
                                            <layout-flex v-else-if="scope.row.etAnchor" center>
                                                抵港：<span class="--gray-text">{{ scope.row.etAnchor }}</span>
                                                <span class="tip tip2">预</span>
                                            </layout-flex>

                                            <layout-flex v-if="scope.row.atdPort" center>
                                                离港：<span class="--gray-text">{{ scope.row.atdPort }}</span>
                                                <span class="tip tip1">实</span>
                                            </layout-flex>
                                            <layout-flex v-else-if="scope.row.etdPort" center>
                                                离港：<span class="--gray-text">{{ scope.row.etdPort }}</span>
                                                <span class="tip tip2">预</span>
                                            </layout-flex>
                                        </template>
                                        <template v-else>
                                            <layout-flex v-if="scope.row.ata" center>
                                                靠泊：<span class="--gray-text">{{ scope.row.ata }}</span>
                                                <span class="tip tip1">实</span>
                                            </layout-flex>
                                            <layout-flex v-else-if="scope.row.eta" center>
                                                靠泊：<span class="--gray-text">{{ scope.row.eta }}</span>
                                                <span class="tip tip2">预</span>
                                            </layout-flex>

                                            <layout-flex v-if="scope.row.atd" center>
                                                离泊：<span class="--gray-text">{{ scope.row.atd }}</span>
                                                <span class="tip tip1">实</span>
                                            </layout-flex>
                                            <layout-flex v-else-if="scope.row.etd" center>
                                                离泊：<span class="--gray-text">{{ scope.row.etd }}</span>
                                                <span class="tip tip2">预</span>
                                            </layout-flex>
                                        </template>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column :key="4" label="节点详情" min-width="560">
                                <template #default="scope">
                                    <!-- 正常有数据时 -->
                                    <div v-if="isnoDataReason(!scope.row.hasOwnProperty('noDataReason'))" class="h160">
                                        <div v-if="scope.row?.containers?.length">
                                            <node-canvas-port
                                                v-if="
                                                    getShowNodeCanvas(scope.row.currentCartonNum, scope.row.containers)
                                                "
                                                :key="scope.row.id"
                                                :current-carton-num="scope.row.currentCartonNum"
                                                :containers="scope.row.containers"
                                            />
                                            <layout-center v-else class="h160">
                                                <info-null></info-null>
                                            </layout-center>
                                        </div>
                                        <layout-center v-else class="h160">
                                            <info-null></info-null>
                                        </layout-center>
                                    </div>
                                    <!-- 数据都没有时 -->
                                    <layout-center v-else class="h160">
                                        <sub-content-item
                                            v-if="scope.row?.countdown > 0"
                                            :key="scope.row.id"
                                            :time="scope.row.countdown"
                                        />
                                        <info-null v-else :message="scope.row?.noDataReason"></info-null>
                                    </layout-center>
                                </template>
                            </el-table-column>
                            <el-table-column :key="5" fixed="right" label="操作" width="100">
                                <template #default="scope">
                                    <layout-flex column class="btns">
                                        <div v-if="!scope.row?.subscriptionType">
                                            <el-button
                                                :disabled="!scope.row.containers"
                                                type="primary"
                                                @click="goDetailPort(scope.row)"
                                                >详情</el-button
                                            >
                                            <el-button @click="handleShowCancelPort(scope.row)">取消订阅</el-button>
                                        </div>
                                        <div v-else>
                                            <el-button
                                                type="primary"
                                                :disabled="scope.row.hasOwnProperty('noDataReason')"
                                                @click="goDetailPort(scope.row)"
                                                >详情</el-button
                                            >
                                            <el-button @click="handleShowCancelPort(scope.row)">取消订阅</el-button>
                                        </div>
                                        <div>
                                            <el-button
                                                v-gio-track="{ type: 'pushSet', value: { type: 'gq' } }"
                                                class="mt8"
                                                @click="handleShowPushSettingPort(scope.row)"
                                                >推送设置</el-button
                                            >
                                            <el-button
                                                v-gio-track="{ type: 'item_edit', value: { type: 'gq' } }"
                                                @click="handleEdit(scope.row)"
                                                >编辑</el-button
                                            >
                                        </div>
                                    </layout-flex>
                                </template>
                            </el-table-column>
                        </el-table>
                        <div v-if="list.length > 0 || portList.length > 0" class="mt20 end">
                            <el-pagination
                                v-model:current-page="form.page"
                                v-model:page-size="form.pageSize"
                                :page-sizes="[10, 20, 50, 100, 200]"
                                layout="total, sizes, prev, pager, next, jumper"
                                :total="total"
                                @size-change="handleSizeChange"
                                @current-change="handleCurrentChange"
                            />
                        </div>
                        <no-data v-else />
                    </div>
                    <div>
                        <BottomInfo class="bottomInfo" />
                    </div>
                </layout-scroll>
            </layout-container>
        </layout-scroll>
        <re-subscribe
            v-model="showReSubscribe"
            :active-name="activeName"
            @confirm="handleQuerySearch"
            @resultPortList="getResultPortList"
        />
        <!-- active : '7':海运综合，'0':船司跟踪，'1':港区出口查询，'2':关务跟踪 -->
        <upload-dialog v-model="showUpload" :active="activeName === 0 ? '0' : '7'" @confirm="handleQuerySearch" />
        <add-user v-model="showAddUser" :active-name="activeName" :select-rows="selectRows" @confirm="handleSearch" />
        <push-setting
            v-model="showPushSetting"
            :type="activeName"
            :select-rows="selectRows"
            :select-row="selectRow"
        ></push-setting>
        <push-setting-port
            v-model="showPushSettingPort"
            :select-rows="selectRows"
            :select-row="selectRow"
            :port-push-setting-type="portPushSettingType"
        ></push-setting-port>
        <push-setting-gw
            v-model="showPushSettingGw"
            :type="activeName"
            :select-rows="selectRows"
            :select-row="selectRow"
        ></push-setting-gw>
        <subscribe-cancel-tip
            v-model="showCancel"
            :show-pay-tip="showPayTip"
            @cancel="activeName === 2 ? confirmCancelPort() : confirmCancel()"
        />
        <node-setting
            v-model="showNodeSetting"
            :select-rows="selectRows"
            :select-row="selectRow"
            :type="activeName"
            @confirm="handleSearch"
        />
        <el-drawer v-model="showEdit" title="订阅编辑" direction="rtl" :size="480">
            <div>
                <el-form
                    ref="editFormRef"
                    label-suffix="："
                    :model="editForm"
                    :rules="editFormRules"
                    label-width="100px"
                    label-position="left"
                >
                    <layout-flex v-if="activeName === 0 || activeName === 3" center class="push-title">
                        <img src="@/assets/img/home/saas/icon_title@2x.png" alt="" />
                        <div>单号</div>
                    </layout-flex>
                    <el-form-item
                        v-if="activeName === 0 || activeName === 3"
                        label="提单号"
                        class="mb10"
                        prop="biNoRemark"
                    >
                        <el-input
                            v-model="editForm.biNoRemark"
                            :disabled="!canEditBiNo"
                            placeholder="请输入提单号"
                        ></el-input>
                    </el-form-item>
                    <el-form-item v-if="editForm.cartN && (activeName === 0 || activeName === 3)" label="箱号">
                        <el-input v-model="editForm.cartN" disabled placeholder="请输入箱号"></el-input>
                    </el-form-item>
                    <layout-flex v-if="role === '货代' && activeName !== 2" center class="push-title mt20">
                        <img src="@/assets/img/home/saas/icon_title@2x.png" alt="" />
                        <div>客户信息</div>
                    </layout-flex>
                    <el-form-item
                        v-if="role === '货代' && activeName !== 2"
                        class="mb10"
                        label="公司名称"
                        prop="customInfo.companyName"
                    >
                        <el-input v-model="editForm.customInfo.companyName" placeholder="请输入公司名称"></el-input>
                    </el-form-item>
                    <el-form-item
                        v-if="role === '货代' && activeName !== 2"
                        class="mb10"
                        label="联系方式"
                        prop="customInfo.phoneNumber"
                    >
                        <el-input v-model="editForm.customInfo.phoneNumber" placeholder="请输入手机号"></el-input>
                    </el-form-item>
                    <el-form-item v-if="role === '货代' && activeName !== 2" label="邮箱" prop="customInfo.email">
                        <el-input v-model="editForm.customInfo.email" placeholder="请输入邮箱"></el-input>
                    </el-form-item>
                    <layout-flex center class="push-title mt20">
                        <img src="@/assets/img/home/saas/icon_title@2x.png" alt="" />
                        <div>备注</div>
                    </layout-flex>
                    <el-form-item label="备注信息">
                        <el-input
                            v-model="editForm.remark"
                            placeholder="请输入备注信息"
                            type="textarea"
                            show-word-limit
                            maxlength="500"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="">
                        <layout-flex class="edit-btn">
                            <el-button @click="showEdit = false">取消</el-button>
                            <el-button type="primary" @click="handleSaveEdit">保存</el-button>
                        </layout-flex>
                    </el-form-item>
                </el-form>
            </div>
        </el-drawer>
        <re-sub v-model="showReSub" :active-name="activeName" :form-data="reSubData" @confirm="handleQuerySearch" />
        <re-sub-gw v-model="showReSubGw" :form-data="reSubDataGw" @confirm="handleQuerySearch" />
        <BatchSubApplyDialog v-model="showBatchSubApplyDialog" />
    </layout-container>
</template>
<style scoped lang="less">
.content {
    min-width: 1300px;
}
.bgf4f7fb {
    background: #f4f7fb;
}
.sticky {
    position: sticky;
    z-index: 2;
}
.shadow-left {
    box-shadow: -5px 0 5px -4px rgba(0, 0, 0, 0.1);
}
.shadow-right {
    box-shadow: 5px 0 5px -4px rgba(0, 0, 0, 0.1);
}
.sticky-right {
    right: 0px;
}
.sticky-left {
    left: 0px;
}
.tabs {
    border-radius: 8px;
    background: #ffffff;
    .tabs-top {
        height: 50px;
        background: #f5f5f5;
        .tabs-top-item {
            font-size: 16px;
            font-weight: 500;
            > div {
                img {
                    width: 20px;
                }
                transition: all 0.15s ease-out;
                cursor: pointer;
                width: 180px;
                height: 50px;
                line-height: 50px;
                justify-content: center !important;
            }
            .active {
                border-radius: 4px 4px 0 0;
                background: #fff;
                color: var(--blue-color);
            }
        }
    }
    :deep(.el-tabs__nav-wrap) {
        padding-bottom: 5px;
    }
    :deep(.el-tabs__nav-wrap::after) {
        height: 1px;
        background: rgba(177, 186, 194, 0.2);
    }
    :deep(.el-tabs__active-bar) {
        background-color: var(--blue-color);
    }
    :deep(.el-tabs__item.is-active) {
        color: var(--blue-color);
    }
    :deep(.el-tabs__nav-scroll) {
        padding-left: 6px;
    }
    :deep(.el-form-item__label) {
        color: var(--text-color);
        height: 36px;
        line-height: 36px;
    }
}
.box {
    background: #fff;
    border-radius: 8px;
    box-sizing: border-box;

    .top-buttons {
        padding: 0 0 0 10px;
    }
    .buttons {
        height: 62px;
        button {
            height: 30px;
            font-size: 12px;
        }
        img {
            max-width: 13px;
            height: 12px;
            margin-right: 3px;
        }
    }
}
.table {
    table-layout: fixed;
    box-sizing: border-box;
    display: block;
    border-collapse: collapse;
    border-spacing: 0;
    width: 100%;
    overflow: auto;
    border: none;
    tr {
        border: none;
    }
    td {
        border: none;
    }
}
.table-header {
    border: 1px solid #eaeaea !important;
    line-height: 60px;
    height: 60px;
    background: #f4f7fb;
    font-weight: bold;
    overflow: auto;
    font-size: 16px;
}
.table-body {
    border: 1px solid #eaeaea !important;
    td {
        box-sizing: content-box;
        padding-top: 10px;
        padding-bottom: 10px;
        > div {
            height: 100%;
            display: block;
        }
    }
}
:deep(.el-form-item) {
    margin-top: 6px !important;
    margin-bottom: 6px !important;
}
.row {
    & > div {
        width: 100%;
        height: 23px;
        line-height: 23px;
        margin-bottom: 11px;
        &:last-child {
            margin-bottom: 0;
        }
    }
    i {
        color: #b1bac2;
        margin-right: 8px;
    }
    .edit-icon {
        color: #1d79ff;
        font-size: 16px;
        margin-right: 4px;
    }
}
.tip {
    width: 20px;
    height: 20px;
    border-radius: 1px;
    font-size: 12px;
    text-align: center;
    line-height: 20px;
    margin-left: 4px;
}
.tip-tip {
    display: inline-block;
}
.tip1 {
    background: rgba(29, 121, 255, 0.08);
    color: #1d79ff;
}
.tip2 {
    background: rgba(0, 178, 119, 0.08);
    color: #00b277;
}
.btns {
    button {
        width: 66px;
        height: 30px;
        margin-left: 5px;
    }
    button + button {
        margin-top: 8px;
    }
}
.push-title {
    margin-bottom: 20px;
    img {
        width: 14px;
        height: 14px;
        margin-right: 4px;
    }
    &:not(:first-child) {
        padding-top: 20px;
        border-top: 1px solid #f3f3f3;
    }
}

.edit-btn {
    margin-top: 20px;
    width: 100%;
    justify-content: flex-end !important;
    padding-top: 20px;
    > button {
        width: 88px;
        height: 40px;
    }
}
.end {
    display: flex;
    justify-content: flex-end;
}
.border {
    border-left: 1px solid #e3e6e8;
    border-right: 1px solid #e3e6e8;
}
.el-table {
    --el-table-border-color: #e3e6e8 !important;
}
.warning-item {
    padding: 0 4px;
    background: #f2301c;
    color: #fff;
    font-size: 12px;
    border-radius: 2px;
    i {
        font-size: 12px;
    }
}
.highlight-option {
    color: #f2301c; /* 根据需要设置颜色 */
}
.warning-item-standerContainerNo {
    padding: 0 4px;
    color: #f2301c;
    font-size: 12px;
    border-radius: 2px;
    i {
        color: #f2301c !important;
        font-size: 12px;
    }
}
.width180 {
    width: 180px;
}
.width170 {
    width: 170px;
}
.website {
    margin-left: 5px;
    text-decoration: none;
    font-weight: bold;
}
.route {
    background: #00b277;
    width: 81px;
    height: 23px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    border-radius: 2px;
    cursor: pointer;
    i {
        font-size: 12px;
        color: #fff;
        margin-right: 3px;
    }
}
.route-kache {
    background: #1d79ff !important;
}
.route1 {
    background: rgba(29, 121, 255, 0.1);
    color: rgba(29, 121, 255, 1);
    i {
        color: rgba(29, 121, 255, 1);
    }
}
.table {
    :deep(.cell) {
        padding: 0 12px;
    }
    :deep(tr td:not(:first-child)) {
        position: relative;
        &:before {
            width: 1px;
            height: 113px;
            top: 50%;
            content: '';
            left: 0;
            background: rgba(177, 186, 194, 0.2);
            position: absolute;
            transform: translateY(-50%);
        }
    }
    :deep(tr td:last-child) {
        position: relative;
        &:after {
            width: 1px;
            height: 100%;
            top: 0;
            content: '';
            right: 0;
            background: rgba(177, 186, 194, 0.2);
            position: absolute;
        }
    }
    :deep(tbody .el-table-column--selection) {
        position: relative;
        &:before {
            width: 1px;
            height: 100%;
            top: 0;
            content: '';
            left: 0;
            background: rgba(177, 186, 194, 0.2);
            position: absolute;
        }
    }
}
.checkbox {
    font-size: 14px;
    font-weight: normal;
    color: #2f303d;
}
.cartonNum-selece {
    max-width: 106px;
}
.cartonNum-selece-sea {
    :deep(.el-input__inner) {
        font-size: 13px !important;
    }
}
.cartonNo-flex {
    display: flex;
    align-items: center;
}
.colorCurrent {
    color: #1d79ff;
}
.portInfo {
    width: 200px;
    margin: 0 auto;
}
.atd-line {
    width: 100%;
    height: 1px !important;
    margin-top: 8px;
    margin-bottom: 8px !important;
    background-color: rgba(222, 224, 226, 0.2);
}
.mb10 {
    margin-bottom: 10px !important;
}
.mb38 {
    margin-bottom: 38px !important;
}
.sea-select {
    :deep(.el-input) {
        height: 32px !important;
    }
    :deep(input) {
        height: 32px !important;
    }
}
.custom-option {
    width: 100%;
    height: 30px;
    cursor: pointer;
    display: flex;
    align-items: center;
    white-space: nowrap;
    justify-content: space-between;
    padding-left: 5px;
    &:hover {
        background-color: #f5f7fa;
        .option-item {
            color: #1d79ff;
        }
    }
}
.exception-container {
    display: flex;
    flex-wrap: nowrap;
    white-space: nowrap;
    span {
        font-weight: 400;
        font-size: 12px;
        color: #f2301c;
    }
}
.option-item {
    min-width: 100px;
    font-weight: 400;
    font-size: 13px;
    color: #6d7280;
}
.custom-tabs-label {
    img {
        width: 37px;
        height: 17px;
        right: -27.5px;
        top: -8.5px;
    }
}
.bottomInfo {
    padding-top: 43px;
    background-color: #fff;
    margin: 30px auto 0;
}
</style>
