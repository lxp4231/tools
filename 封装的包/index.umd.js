!(function (e, t) {
    'object' == typeof exports && 'undefined' != typeof module
        ? t(exports)
        : 'function' == typeof define && define.amd
        ? define(['exports'], t)
        : t(((e = 'undefined' != typeof globalThis ? globalThis : e || self).Sgld = {}))
})(this, function (e) {
    'use strict'
    ;(e.add = function (e, t) {
        return e + t
    }),
        Object.defineProperty(e, '__esModule', { value: !0 })
})
