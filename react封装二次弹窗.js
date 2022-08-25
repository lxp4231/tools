
// 1
// // 调用弹窗
// import { Button, } from 'antd'
// import React, { useRef, useState } from 'react'
// import ImportModal from '../ImportModal'

// const Main: React.FC<any> = () => {
//     const refImportModal = useRef<any>(null)
//     const ttl = [7, 14, 30, 60, 90, 120, 150, 180, 270, 360, 720, -1]
//     const showModal = () => {
//         refImportModal.current?.show({
//             ttl: ttl,
//         })
//     }
//     return (
//         <div>
//             <Button onClick={showModal} >弹出弹窗</Button>
//             < ImportModal ref={refImportModal} />
//         </div>
//     )
// }
// export default Main


// 2
// // 弹窗文件ImportModal.tsx`
// import React, { useState, useImperativeHandle } from 'react'
// import { Form, Modal, Select } from 'antd'
// type TParams = { ttl: any[] }

// const ImportModal = React.forwardRef<any>(
//     (props, ref) => {
//         const [params, setParams] = useState<any>()
//         const [isModalVisible, setIsModalVisible] = useState(false);
//         const handleOk = () => {
//             setIsModalVisible(false);
//         };

//         const handleCancel = () => {
//             setIsModalVisible(false);
//         };
//         useImperativeHandle(
//             ref,
//             () => ({
//                 show: (params: TParams) => {
//                     // 保存参数
//                     setParams(params)
//                     /** 改变状态 */
//                     setIsModalVisible(true)
//                 },
//             }),
//             []
//         )

//         return (
//             <Modal
//                 title='弹窗'
//                 visible={isModalVisible}
//                 onOk={handleOk}
//                 onCancel={handleCancel}
//             >
//                 <div>弹窗内容</div>
//             </Modal>
//         )
//     }
// )
// export default ImportModal


