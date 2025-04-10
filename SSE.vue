<script lang="ts" setup>
import { ArrowLeft, Loading } from '@element-plus/icons-vue'
import { reactive, ref, watch, onUnmounted, onMounted } from 'vue'
import chatModal from '../layout/chatModal.vue'
import { api_get_message } from '@/api/chat'
const chatBox = ref(null)
const inputMessage = ref('')
const messages = ref([])
const currentAiMessage = ref(null) // 当前正在处理的 AI 消息

// 建立 SSE 连接
let eventSource
onMounted(() => {
    // eventSource = new EventSource('http://localhost:8060/sse-endpoint')
    // eventSource.onmessage = (event) => {
    //   const data = JSON.parse(event.data)
    //   if (data.message) {
    //     // 如果是新的 AI 消息，初始化 currentAiMessage
    //     if (!currentAiMessage.value) {
    //       currentAiMessage.value = { type: 'ai', text: '' }
    //       messages.value.push(currentAiMessage.value)
    //     }
    //     // 拼接新的 SSE 数据
    //     currentAiMessage.value.text += data.message
    //     // 启动打字机效果
    //     typeWriterEffect(currentAiMessage.value, data.message)
    //     scrollToBottom()
    //   }
    // }
    // eventSource.onerror = () => {
    //   console.error('SSE connection error')
    // }
})

// 组件卸载时关闭 SSE 连接
onUnmounted(() => {
    // if (eventSource) {
    //   eventSource.close()
    // }
})

// 发送用户消息
const sendMessage = async () => {
    const message = inputMessage.value.trim()
    if (message) {
        // 添加用户消息到消息列表
        messages.value.push({ type: 'user', text: message })
        scrollToBottom()
        // 发送消息到后端
        await api_get_message({ message })
        inputMessage.value = '' // 清空输入框
        currentAiMessage.value = null // 重置当前 AI 消息
    }
}
// 处理键盘事件
const handleEnterKey = (event) => {
    if (!event.shiftKey) {
        // 如果按下的是单独的 Enter 键
        event.preventDefault() // 阻止换行
        sendMessage() // 发送消息
    }
}
// 打字机效果
const typeWriterEffect = (messageObj, newText) => {
    let index = 0
    const renderNextChar = () => {
        if (index < newText.length) {
            const char = newText.charAt(index)
            // 处理换行符和段落
            if (char === '\n') {
                // 如果是连续的两个 \n，则认为是段落
                if (index > 0 && newText.charAt(index - 1) === '\n') {
                    messageObj.text += '</p><p>' // 结束当前段落并开始新段落
                } else {
                    messageObj.text += '<br>' // 单行换行
                }
            } else {
                messageObj.text += char // 逐字添加
            }

            scrollToBottom()
            index++
            setTimeout(renderNextChar, 30) // 控制打字速度（50ms/字）
        } else {
            // 打字结束后，确保段落标签闭合
            if (messageObj.text.startsWith('<p>') && !messageObj.text.endsWith('</p>')) {
                messageObj.text += '</p>'
            }
        }
    }
    renderNextChar()
}
// 滚动到底部
const scrollToBottom = () => {
    if (chatBox.value) {
        chatBox.value.scrollTop = chatBox.value.scrollHeight
    }
}
</script>
<template>
    <chatModal title="运价查询">
        <div class="chat">
            <div class="chat-container">
                <div ref="chatBox" class="chat-box">
                    <div v-for="(msg, index) in messages" :key="index" :class="msg.type">
                        <!-- 用户消息 -->
                        <div v-if="msg.type === 'user'" class="user-message">
                            <el-card class="message-content">
                                <div v-html="msg.text"></div>
                            </el-card>
                            <div
                                class="w-32px h-32px bg-#EF865B flex items-center justify-center m-l-10px rounded-[4px]"
                            >
                                <img class="user-avatar" src="@/assets/img/user.png" alt="User Avatar" />
                            </div>
                        </div>

                        <!-- AI 消息 -->
                        <div v-else class="ai-message">
                            <div
                                class="w-32px h-32px bg-#4899D8 flex items-center justify-center m-r-10px rounded-[4px]"
                            >
                                <img class="ai-avatar" src="@/assets/img/ai.png" alt="AI Avatar" />
                            </div>
                            <el-card class="message-content">
                                <!-- 加载态 -->
                                <div v-if="!msg.text" class="loading-state">
                                    <el-icon class="is-loading">
                                        <Loading />
                                    </el-icon>
                                    <span>AI 正在思考...</span>
                                </div>
                                <!-- AI 消息内容 -->
                                <div v-else v-html="msg.text"></div>
                            </el-card>
                        </div>
                    </div>
                </div>
                <div class="chat-input">
                    <el-input
                        v-model="inputMessage"
                        type="textarea"
                        placeholder="请输入消息"
                        :rows="6"
                        resize="none"
                        :maxlength="2000"
                        show-word-limit
                        :autosize="false"
                        class="input-style"
                        @keydown.enter.native="handleEnterKey"
                    >
                    </el-input>
                    <div class="send-btn">
                        <span>Enter 发送/Shift+Enter 换行</span>
                        <el-button :disabled="inputMessage.length === 0" type="primary" @click="sendMessage"
                            >发送</el-button
                        >
                    </div>
                </div>
            </div>
        </div>
    </chatModal>
</template>
<style scoped lang="less">
.chat {
    width: 100%;
    height: calc(100vh - 140px);
}
.chat-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    margin: 0 auto;
}
.chat-box {
    flex: 1;
    overflow-y: auto;
    padding: 20px 12px;
}
.chat-input {
    position: relative;
    .input-style {
        border-top: 1px solid rgba(0, 0, 0, 0.1);
        :deep(.el-textarea__inner) {
            border: none !important;
            outline: none;
            box-shadow: none;
            background: #f2f6f8;
        }
        :deep(.el-input__count) {
            background: #f2f6f8;
        }
    }
}
.send-btn {
    position: absolute;
    display: flex;
    align-items: center;
    right: 4px;
    bottom: -30px;
    z-index: 999;
    span {
        margin-right: 10px;
        font-size: 12px;
        color: #999;
    }
}
.user-message {
    display: flex;
    align-items: center; /* 使头像和消息内容水平排列 */
    font-size: 14px;
    text-align: right;
    margin-bottom: 10px;
    justify-content: flex-end; /* 将用户消息内容对齐到右边 */
}
.user-avatar {
    width: 20px;
    height: 20px;
    border-radius: 50%;
}
.ai-message {
    display: flex;
    align-items: flex-start;
    margin-bottom: 10px;
    font-size: 14px;
    justify-content: flex-start; /* 将 AI 消息内容对齐到左边 */
}
.ai-avatar {
    width: 26px;
    height: 26px;
    border-radius: 50%;
}
.message-content {
    display: inline-block;
    max-width: 60%;
    box-shadow: unset !important;
    border: unset;
    :deep(.el-card__body) {
        padding: 12px !important;
    }
}
.user-message .message-content {
    background-color: #dceff7;
}

.ai-message .message-content {
    background-color: #fff;
}
.el-textarea {
    margin-top: 10px;
}
.loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
}

.loading-state .el-icon {
    margin-right: 8px;
    animation: rotating 2s linear infinite;
}
@keyframes rotating {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>
