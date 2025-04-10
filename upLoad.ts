import { ref } from 'vue'
import { genFileId, ElMessage } from 'element-plus'
import type { UploadInstance, UploadProps, UploadRawFile, UploadUserFile, UploadFile } from 'element-plus'
import { getCookie } from '@/utils/index'

export default function useUpload(type: any[], size: number) {
    const uploadRef = ref<UploadInstance>()
    const headers = {
        Authorization: getCookie('access_token') || null
    }
    const url = import.meta.env.VITE_APP_BASE_URL || '/api/'
    const action = ref(`${url}usercenter/oss/upload`)
    const uploadData = ref()
    const fileList = ref<UploadUserFile[]>([
        {
            name: 'food1.jpeg',
            url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'
        }
    ])
    const uploadDataList = ref<any>([])
    const dialogImageUrl = ref<any>('')
    const dialogVisible = ref(false)
    const disabled = ref(false)
    const handleExceed: UploadProps['onExceed'] = (files) => {
        uploadRef.value?.clearFiles()
        const file = files[0] as UploadRawFile
        file.uid = genFileId()
        uploadRef.value?.handleStart(file)
        uploadRef.value?.submit()
    }
    const handleBeforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
        if (type.indexOf(rawFile.type) === -1) {
            ElMessage.error(`请上传文件类型为：jpg/jpeg/png的文件`)
            return false
        }
        if (size && rawFile.size / 1024 / 1024 > size) {
            ElMessage.error(`文件大小不能超过 ${size}MB!`)
            return false
        }
        return true
    }
    const handleSuccess: UploadProps['onSuccess'] = (response) => {
        if (response.success) {
            uploadData.value = response.data
            uploadDataList.value.push(response.data)
        }
    }
    const handleChange: UploadProps['onChange'] = (v) => {
        if (v) {
            uploadRef.value?.submit()
        }
    }
    const handleDownload = (file: UploadFile) => {
        window.open(file.url)
    }
    const handleRemove: UploadProps['onRemove'] = (uploadFile, uploadFiles) => {
        console.log(uploadFile, uploadFiles)
    }
    const handlePictureCardPreview: UploadProps['onPreview'] = (uploadFile) => {
        dialogImageUrl.value = uploadFile.url
        dialogVisible.value = true
    }
    return {
        url,
        uploadRef,
        headers,
        action,
        handleExceed,
        handleSuccess,
        handleBeforeUpload,
        uploadData,
        handleChange,
        uploadDataList,
        handleDownload,
        dialogImageUrl,
        dialogVisible,
        handleRemove,
        handlePictureCardPreview,
        disabled,
        fileList
    }
}
