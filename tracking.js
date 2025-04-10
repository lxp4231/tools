;(function (global) {
    'use strict'
    function TrackingSDK(options) {
        this.options = options || {}
        this.init()
    }

    TrackingSDK.prototype = {
        init: function () {
            this.bindEvents()
            this.collectStaticData()
            this.sendVisitData()
        },

        // 绑定事件
        bindEvents: function () {
            document.addEventListener('click', this.handleEvent.bind(this))
            document.addEventListener('mousemove', this.handleEvent.bind(this))
        },

        // 事件处理
        handleEvent: function (event) {
            const eventData = {
                type: event.type,
                target: event.target.tagName,
                timestamp: Date.now()
            }
            this.sendData(eventData)
        },

        // 收集静态数据
        collectStaticData: function () {
            const staticData = {
                userAgent: navigator.userAgent,
                language: navigator.language,
                screenResolution: `${window.screen.width}x${window.screen.height}`
            }
            localStorage.setItem('staticData', JSON.stringify(staticData))
        },

        // 发送访问数据
        sendVisitData: function () {
            const visitData = {
                event: 'page_visit',
                timestamp: Date.now(),
                staticData: JSON.parse(localStorage.getItem('staticData'))
            }
            this.sendData(visitData)
        },

        // 发送数据到服务器
        sendData: function (data) {
            const xhr = new XMLHttpRequest()
            xhr.open('POST', this.options.endpoint, true)
            xhr.setRequestHeader('Content-Type', 'application/json')
            xhr.send(JSON.stringify(data))
        }
    }

    global.TrackingSDK = TrackingSDK
})(window)

// 初始化埋点SDK
// new TrackingSDK({ endpoint: 'https://your-server.com/track' }) // 页面中初始化
