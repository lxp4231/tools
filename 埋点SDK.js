!(function () {
    'use strict'
    function e() {
        e = function () {
            return t
        }
        var r,
            t = {},
            n = Object.prototype,
            i = n.hasOwnProperty,
            o =
                Object.defineProperty ||
                function (e, r, t) {
                    e[r] = t.value
                },
            a = 'function' == typeof Symbol ? Symbol : {},
            c = a.iterator || '@@iterator',
            u = a.asyncIterator || '@@asyncIterator',
            s = a.toStringTag || '@@toStringTag'
        function d(e, r, t) {
            return Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }), e[r]
        }
        try {
            d({}, '')
        } catch (r) {
            d = function (e, r, t) {
                return (e[r] = t)
            }
        }
        function f(e, r, t, n) {
            var i = r && r.prototype instanceof m ? r : m,
                a = Object.create(i.prototype),
                c = new P(n || [])
            return o(a, '_invoke', { value: B(e, t, c) }), a
        }
        function l(e, r, t) {
            try {
                return { type: 'normal', arg: e.call(r, t) }
            } catch (e) {
                return { type: 'throw', arg: e }
            }
        }
        t.wrap = f
        var p = 'suspendedStart',
            h = 'suspendedYield',
            g = 'executing',
            w = 'completed',
            v = {}
        function m() {}
        function x() {}
        function y() {}
        var O = {}
        d(O, c, function () {
            return this
        })
        var $ = Object.getPrototypeOf,
            b = $ && $($(D([])))
        b && b !== n && i.call(b, c) && (O = b)
        var S = (y.prototype = m.prototype = Object.create(O))
        function E(e) {
            ;['next', 'throw', 'return'].forEach(function (r) {
                d(e, r, function (e) {
                    return this._invoke(r, e)
                })
            })
        }
        function I(e, r) {
            function t(n, o, a, c) {
                var u = l(e[n], e, o)
                if ('throw' !== u.type) {
                    var s = u.arg,
                        d = s.value
                    return d && 'object' == typeof d && i.call(d, '__await')
                        ? r.resolve(d.__await).then(
                              function (e) {
                                  t('next', e, a, c)
                              },
                              function (e) {
                                  t('throw', e, a, c)
                              }
                          )
                        : r.resolve(d).then(
                              function (e) {
                                  ;(s.value = e), a(s)
                              },
                              function (e) {
                                  return t('throw', e, a, c)
                              }
                          )
                }
                c(u.arg)
            }
            var n
            o(this, '_invoke', {
                value: function (e, i) {
                    function o() {
                        return new r(function (r, n) {
                            t(e, i, r, n)
                        })
                    }
                    return (n = n ? n.then(o, o) : o())
                }
            })
        }
        function B(e, t, n) {
            var i = p
            return function (o, a) {
                if (i === g) throw new Error('Generator is already running')
                if (i === w) {
                    if ('throw' === o) throw a
                    return { value: r, done: !0 }
                }
                for (n.method = o, n.arg = a; ; ) {
                    var c = n.delegate
                    if (c) {
                        var u = M(c, n)
                        if (u) {
                            if (u === v) continue
                            return u
                        }
                    }
                    if ('next' === n.method) n.sent = n._sent = n.arg
                    else if ('throw' === n.method) {
                        if (i === p) throw ((i = w), n.arg)
                        n.dispatchException(n.arg)
                    } else 'return' === n.method && n.abrupt('return', n.arg)
                    i = g
                    var s = l(e, t, n)
                    if ('normal' === s.type) {
                        if (((i = n.done ? w : h), s.arg === v)) continue
                        return { value: s.arg, done: n.done }
                    }
                    'throw' === s.type && ((i = w), (n.method = 'throw'), (n.arg = s.arg))
                }
            }
        }
        function M(e, t) {
            var n = t.method,
                i = e.iterator[n]
            if (i === r)
                return (
                    (t.delegate = null),
                    ('throw' === n &&
                        e.iterator.return &&
                        ((t.method = 'return'), (t.arg = r), M(e, t), 'throw' === t.method)) ||
                        ('return' !== n &&
                            ((t.method = 'throw'),
                            (t.arg = new TypeError("The iterator does not provide a '" + n + "' method")))),
                    v
                )
            var o = l(i, e.iterator, t.arg)
            if ('throw' === o.type) return (t.method = 'throw'), (t.arg = o.arg), (t.delegate = null), v
            var a = o.arg
            return a
                ? a.done
                    ? ((t[e.resultName] = a.value),
                      (t.next = e.nextLoc),
                      'return' !== t.method && ((t.method = 'next'), (t.arg = r)),
                      (t.delegate = null),
                      v)
                    : a
                : ((t.method = 'throw'),
                  (t.arg = new TypeError('iterator result is not an object')),
                  (t.delegate = null),
                  v)
        }
        function L(e) {
            var r = { tryLoc: e[0] }
            1 in e && (r.catchLoc = e[1]),
                2 in e && ((r.finallyLoc = e[2]), (r.afterLoc = e[3])),
                this.tryEntries.push(r)
        }
        function C(e) {
            var r = e.completion || {}
            ;(r.type = 'normal'), delete r.arg, (e.completion = r)
        }
        function P(e) {
            ;(this.tryEntries = [{ tryLoc: 'root' }]), e.forEach(L, this), this.reset(!0)
        }
        function D(e) {
            if (e || '' === e) {
                var t = e[c]
                if (t) return t.call(e)
                if ('function' == typeof e.next) return e
                if (!isNaN(e.length)) {
                    var n = -1,
                        o = function t() {
                            for (; ++n < e.length; ) if (i.call(e, n)) return (t.value = e[n]), (t.done = !1), t
                            return (t.value = r), (t.done = !0), t
                        }
                    return (o.next = o)
                }
            }
            throw new TypeError(typeof e + ' is not iterable')
        }
        return (
            (x.prototype = y),
            o(S, 'constructor', { value: y, configurable: !0 }),
            o(y, 'constructor', { value: x, configurable: !0 }),
            (x.displayName = d(y, s, 'GeneratorFunction')),
            (t.isGeneratorFunction = function (e) {
                var r = 'function' == typeof e && e.constructor
                return !!r && (r === x || 'GeneratorFunction' === (r.displayName || r.name))
            }),
            (t.mark = function (e) {
                return (
                    Object.setPrototypeOf
                        ? Object.setPrototypeOf(e, y)
                        : ((e.__proto__ = y), d(e, s, 'GeneratorFunction')),
                    (e.prototype = Object.create(S)),
                    e
                )
            }),
            (t.awrap = function (e) {
                return { __await: e }
            }),
            E(I.prototype),
            d(I.prototype, u, function () {
                return this
            }),
            (t.AsyncIterator = I),
            (t.async = function (e, r, n, i, o) {
                void 0 === o && (o = Promise)
                var a = new I(f(e, r, n, i), o)
                return t.isGeneratorFunction(r)
                    ? a
                    : a.next().then(function (e) {
                          return e.done ? e.value : a.next()
                      })
            }),
            E(S),
            d(S, s, 'Generator'),
            d(S, c, function () {
                return this
            }),
            d(S, 'toString', function () {
                return '[object Generator]'
            }),
            (t.keys = function (e) {
                var r = Object(e),
                    t = []
                for (var n in r) t.push(n)
                return (
                    t.reverse(),
                    function e() {
                        for (; t.length; ) {
                            var n = t.pop()
                            if (n in r) return (e.value = n), (e.done = !1), e
                        }
                        return (e.done = !0), e
                    }
                )
            }),
            (t.values = D),
            (P.prototype = {
                constructor: P,
                reset: function (e) {
                    if (
                        ((this.prev = 0),
                        (this.next = 0),
                        (this.sent = this._sent = r),
                        (this.done = !1),
                        (this.delegate = null),
                        (this.method = 'next'),
                        (this.arg = r),
                        this.tryEntries.forEach(C),
                        !e)
                    )
                        for (var t in this)
                            't' === t.charAt(0) && i.call(this, t) && !isNaN(+t.slice(1)) && (this[t] = r)
                },
                stop: function () {
                    this.done = !0
                    var e = this.tryEntries[0].completion
                    if ('throw' === e.type) throw e.arg
                    return this.rval
                },
                dispatchException: function (e) {
                    if (this.done) throw e
                    var t = this
                    function n(n, i) {
                        return (
                            (c.type = 'throw'), (c.arg = e), (t.next = n), i && ((t.method = 'next'), (t.arg = r)), !!i
                        )
                    }
                    for (var o = this.tryEntries.length - 1; o >= 0; --o) {
                        var a = this.tryEntries[o],
                            c = a.completion
                        if ('root' === a.tryLoc) return n('end')
                        if (a.tryLoc <= this.prev) {
                            var u = i.call(a, 'catchLoc'),
                                s = i.call(a, 'finallyLoc')
                            if (u && s) {
                                if (this.prev < a.catchLoc) return n(a.catchLoc, !0)
                                if (this.prev < a.finallyLoc) return n(a.finallyLoc)
                            } else if (u) {
                                if (this.prev < a.catchLoc) return n(a.catchLoc, !0)
                            } else {
                                if (!s) throw new Error('try statement without catch or finally')
                                if (this.prev < a.finallyLoc) return n(a.finallyLoc)
                            }
                        }
                    }
                },
                abrupt: function (e, r) {
                    for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                        var n = this.tryEntries[t]
                        if (n.tryLoc <= this.prev && i.call(n, 'finallyLoc') && this.prev < n.finallyLoc) {
                            var o = n
                            break
                        }
                    }
                    o && ('break' === e || 'continue' === e) && o.tryLoc <= r && r <= o.finallyLoc && (o = null)
                    var a = o ? o.completion : {}
                    return (
                        (a.type = e),
                        (a.arg = r),
                        o ? ((this.method = 'next'), (this.next = o.finallyLoc), v) : this.complete(a)
                    )
                },
                complete: function (e, r) {
                    if ('throw' === e.type) throw e.arg
                    return (
                        'break' === e.type || 'continue' === e.type
                            ? (this.next = e.arg)
                            : 'return' === e.type
                            ? ((this.rval = this.arg = e.arg), (this.method = 'return'), (this.next = 'end'))
                            : 'normal' === e.type && r && (this.next = r),
                        v
                    )
                },
                finish: function (e) {
                    for (var r = this.tryEntries.length - 1; r >= 0; --r) {
                        var t = this.tryEntries[r]
                        if (t.finallyLoc === e) return this.complete(t.completion, t.afterLoc), C(t), v
                    }
                },
                catch: function (e) {
                    for (var r = this.tryEntries.length - 1; r >= 0; --r) {
                        var t = this.tryEntries[r]
                        if (t.tryLoc === e) {
                            var n = t.completion
                            if ('throw' === n.type) {
                                var i = n.arg
                                C(t)
                            }
                            return i
                        }
                    }
                    throw new Error('illegal catch attempt')
                },
                delegateYield: function (e, t, n) {
                    return (
                        (this.delegate = { iterator: D(e), resultName: t, nextLoc: n }),
                        'next' === this.method && (this.arg = r),
                        v
                    )
                }
            }),
            t
        )
    }
    function r(e, r, t, n, i, o, a) {
        try {
            var c = e[o](a),
                u = c.value
        } catch (e) {
            return void t(e)
        }
        c.done ? r(u) : Promise.resolve(u).then(n, i)
    }
    function t(e) {
        return function () {
            var t = this,
                n = arguments
            return new Promise(function (i, o) {
                var a = e.apply(t, n)
                function c(e) {
                    r(a, i, o, c, u, 'next', e)
                }
                function u(e) {
                    r(a, i, o, c, u, 'throw', e)
                }
                c(void 0)
            })
        }
    }
    let n
    const i = new Uint8Array(16)
    function o() {
        if (
            !n &&
            ((n = 'undefined' != typeof crypto && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)), !n)
        )
            throw new Error(
                'crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported'
            )
        return n(i)
    }
    const a = []
    for (let e = 0; e < 256; ++e) a.push((e + 256).toString(16).slice(1))
    var c,
        u = { randomUUID: 'undefined' != typeof crypto && crypto.randomUUID && crypto.randomUUID.bind(crypto) }
    function s(e, r, t) {
        if (u.randomUUID && !r && !e) return u.randomUUID()
        const n = (e = e || {}).random || (e.rng || o)()
        if (((n[6] = (15 & n[6]) | 64), (n[8] = (63 & n[8]) | 128), r)) {
            t = t || 0
            for (let e = 0; e < 16; ++e) r[t + e] = n[e]
            return r
        }
        return (function (e, r = 0) {
            return (
                a[e[r + 0]] +
                a[e[r + 1]] +
                a[e[r + 2]] +
                a[e[r + 3]] +
                '-' +
                a[e[r + 4]] +
                a[e[r + 5]] +
                '-' +
                a[e[r + 6]] +
                a[e[r + 7]] +
                '-' +
                a[e[r + 8]] +
                a[e[r + 9]] +
                '-' +
                a[e[r + 10]] +
                a[e[r + 11]] +
                a[e[r + 12]] +
                a[e[r + 13]] +
                a[e[r + 14]] +
                a[e[r + 15]]
            )
        })(n)
    }
    ;((c = function (e) {
        ;(this.options = e || {}), this.init()
    }).variableLibrary = {
        navigator: void 0 !== window.navigator ? window.navigator : {},
        infoMap: {
            engine: ['WebKit', 'Trident', 'Gecko', 'Presto'],
            browser: [
                'Safari',
                'Chrome',
                'Edge',
                'IE',
                'Firefox',
                'Firefox Focus',
                'Chromium',
                'Opera',
                'Vivaldi',
                'Yandex',
                'Arora',
                'Lunascape',
                'QupZilla',
                'Coc Coc',
                'Kindle',
                'Iceweasel',
                'Konqueror',
                'Iceape',
                'SeaMonkey',
                'Epiphany',
                '360',
                '360SE',
                '360EE',
                'UC',
                'QQBrowser',
                'QQ',
                'Baidu',
                'Maxthon',
                'Sogou',
                'LBBROWSER',
                '2345Explorer',
                'TheWorld',
                'XiaoMi',
                'Quark',
                'Qiyu',
                'Wechat',
                ,
                'WechatWork',
                'Taobao',
                'Alipay',
                'Weibo',
                'Douban',
                'Suning',
                'iQiYi'
            ],
            os: [
                'Windows',
                'Linux',
                'Mac OS',
                'Android',
                'Ubuntu',
                'FreeBSD',
                'Debian',
                'iOS',
                'Windows Phone',
                'BlackBerry',
                'MeeGo',
                'Symbian',
                'Chrome OS',
                'WebOS'
            ],
            device: ['Mobile', 'Tablet', 'iPad']
        }
    }),
        (c.getMatchMap = function (e) {
            return {
                Trident: e.indexOf('Trident') > -1 || e.indexOf('NET CLR') > -1,
                Presto: e.indexOf('Presto') > -1,
                WebKit: e.indexOf('AppleWebKit') > -1,
                Gecko: e.indexOf('Gecko/') > -1,
                Safari: e.indexOf('Safari') > -1,
                Chrome: e.indexOf('Chrome') > -1 || e.indexOf('CriOS') > -1,
                IE: e.indexOf('MSIE') > -1 || e.indexOf('Trident') > -1,
                Edge: e.indexOf('Edge') > -1,
                Firefox: e.indexOf('Firefox') > -1 || e.indexOf('FxiOS') > -1,
                'Firefox Focus': e.indexOf('Focus') > -1,
                Chromium: e.indexOf('Chromium') > -1,
                Opera: e.indexOf('Opera') > -1 || e.indexOf('OPR') > -1,
                Vivaldi: e.indexOf('Vivaldi') > -1,
                Yandex: e.indexOf('YaBrowser') > -1,
                Arora: e.indexOf('Arora') > -1,
                Lunascape: e.indexOf('Lunascape') > -1,
                QupZilla: e.indexOf('QupZilla') > -1,
                'Coc Coc': e.indexOf('coc_coc_browser') > -1,
                Kindle: e.indexOf('Kindle') > -1 || e.indexOf('Silk/') > -1,
                Iceweasel: e.indexOf('Iceweasel') > -1,
                Konqueror: e.indexOf('Konqueror') > -1,
                Iceape: e.indexOf('Iceape') > -1,
                SeaMonkey: e.indexOf('SeaMonkey') > -1,
                Epiphany: e.indexOf('Epiphany') > -1,
                360: e.indexOf('QihooBrowser') > -1 || e.indexOf('QHBrowser') > -1,
                '360EE': e.indexOf('360EE') > -1,
                '360SE': e.indexOf('360SE') > -1,
                UC: e.indexOf('UC') > -1 || e.indexOf(' UBrowser') > -1,
                QQBrowser: e.indexOf('QQBrowser') > -1,
                QQ: e.indexOf('QQ/') > -1,
                Baidu: e.indexOf('Baidu') > -1 || e.indexOf('BIDUBrowser') > -1,
                Maxthon: e.indexOf('Maxthon') > -1,
                Sogou: e.indexOf('MetaSr') > -1 || e.indexOf('Sogou') > -1,
                LBBROWSER: e.indexOf('LBBROWSER') > -1 || e.indexOf('LieBaoFast') > -1,
                '2345Explorer': e.indexOf('2345Explorer') > -1,
                TheWorld: e.indexOf('TheWorld') > -1,
                XiaoMi: e.indexOf('MiuiBrowser') > -1,
                Quark: e.indexOf('Quark') > -1,
                Qiyu: e.indexOf('Qiyu') > -1,
                Wechat: e.indexOf('MicroMessenger') > -1,
                WechatWork: e.indexOf('wxwork/') > -1,
                Taobao: e.indexOf('AliApp(TB') > -1,
                Alipay: e.indexOf('AliApp(AP') > -1,
                Weibo: e.indexOf('Weibo') > -1,
                Douban: e.indexOf('com.douban.frodo') > -1,
                Suning: e.indexOf('SNEBUY-APP') > -1,
                iQiYi: e.indexOf('IqiyiApp') > -1,
                DingTalk: e.indexOf('DingTalk') > -1,
                Vivo: e.indexOf('VivoBrowser') > -1,
                Huawei:
                    e.indexOf('HuaweiBrowser') > -1 ||
                    e.indexOf('HUAWEI/') > -1 ||
                    e.indexOf('HONOR') > -1 ||
                    e.indexOf('HBPC/') > -1,
                Windows: e.indexOf('Windows') > -1,
                Linux: e.indexOf('Linux') > -1 || e.indexOf('X11') > -1,
                'Mac OS': e.indexOf('Macintosh') > -1,
                Android: e.indexOf('Android') > -1 || e.indexOf('Adr') > -1,
                Ubuntu: e.indexOf('Ubuntu') > -1,
                FreeBSD: e.indexOf('FreeBSD') > -1,
                Debian: e.indexOf('Debian') > -1,
                'Windows Phone': e.indexOf('IEMobile') > -1 || e.indexOf('Windows Phone') > -1,
                BlackBerry: e.indexOf('BlackBerry') > -1 || e.indexOf('RIM') > -1,
                MeeGo: e.indexOf('MeeGo') > -1,
                Symbian: e.indexOf('Symbian') > -1,
                iOS: e.indexOf('like Mac OS X') > -1,
                'Chrome OS': e.indexOf('CrOS') > -1,
                WebOS: e.indexOf('hpwOS') > -1,
                Mobile: e.indexOf('Mobi') > -1 || e.indexOf('iPh') > -1 || e.indexOf('480') > -1,
                Tablet: e.indexOf('Tablet') > -1 || e.indexOf('Nexus 7') > -1,
                iPad: e.indexOf('iPad') > -1
            }
        }),
        (c.matchInfoMap = function () {
            c.static = {}
            var e = c.variableLibrary.navigator.userAgent || {},
                r = c.getMatchMap(e)
            for (var t in c.variableLibrary.infoMap)
                for (var n = 0; n < c.variableLibrary.infoMap[t].length; n++) {
                    var i = c.variableLibrary.infoMap[t][n]
                    r[i] && (c.static[t] = i)
                }
        }),
        (c.getUserId = function () {
            var e = localStorage.getItem('userId')
            return e || ''
        }),
        (c.getCanvasId = function () {
            if (!localStorage.getItem('SgMonitor_getCanvasId2')) {
                var e = s()
                localStorage.setItem('SgMonitor_getCanvasId2', e)
            }
        }),
        (c.getVisitorId = function () {
            return localStorage.getItem('SgMonitor_getCanvasId2')
        }),
        (c.getParams = function (e) {
            var r = window.location.href
            return -1 === r.indexOf('?') ? '' : new URLSearchParams(r.split('?')[1]).get(e) || ''
        }),
        (c.getDeviceType = function () {
            return c.static.device || 'PC'
        }),
        (c.getScreenSize = function () {
            return window.screen.height + '*' + window.screen.width
        }),
        (c.getOsVersion = function () {
            var e = window.navigator.userAgent || {},
                r = {
                    Windows: function () {
                        var r = e.replace(/^.*Windows NT ([\d.]+);.*$/, '$1')
                        return (
                            {
                                10: '10 || 11',
                                6.3: '8.1',
                                6.2: '8',
                                6.1: '7',
                                '6.0': 'Vista',
                                5.2: 'XP 64-Bit',
                                5.1: 'XP',
                                '5.0': '2000',
                                '4.0': 'NT 4.0',
                                '3.5.1': 'NT 3.5.1',
                                3.5: 'NT 3.5',
                                3.1: 'NT 3.1'
                            }[r] || r
                        )
                    },
                    Android: function () {
                        return e.replace(/^.*Android ([\d.]+);.*$/, '$1')
                    },
                    iOS: function () {
                        return e.replace(/^.*OS ([\d_]+) like.*$/, '$1').replace(/_/g, '.')
                    },
                    Debian: function () {
                        return e.replace(/^.*Debian\/([\d.]+).*$/, '$1')
                    },
                    'Windows Phone': function () {
                        return e.replace(/^.*Windows Phone( OS)? ([\d.]+);.*$/, '$2')
                    },
                    'Mac OS': function () {
                        return e.replace(/^.*Mac OS X ([\d_]+).*$/, '$1').replace(/_/g, '.')
                    },
                    WebOS: function () {
                        return e.replace(/^.*hpwOS\/([\d.]+);.*$/, '$1')
                    }
                }
            return (
                r[c.static.os] &&
                    ((c.static.osVersion = r[c.static.os]()), c.static.osVersion == e && (c.static.osVersion = '')),
                c.static.osVersion
            )
        }),
        (c.getLanguage = function () {
            var e
            return (
                (c.static.language =
                    ((e = (window.navigator.browserLanguage || window.navigator.language).split('-'))[1] &&
                        (e[1] = e[1].toUpperCase()),
                    e.join('_'))),
                c.static.language
            )
        }),
        (c.getBrowserInfo = function () {
            var e = window.navigator.userAgent || {},
                r = function (e, r) {
                    var t = window.navigator.mimeTypes
                    for (var n in t) if (t[n][e] == r) return !0
                    return !1
                },
                t = c.getMatchMap(e),
                n = !1
            if (c.static.chrome) {
                var i = e.replace(/^.*Chrome\/([\d]+).*$/, '$1')
                i > 36 ? (n = !0) : i > 45 && (n = r('type', 'application/vnd.chromium.remoting-viewer'))
            }
            if (
                (t.Baidu && t.Opera && (t.Baidu = !1),
                t.Mobile && (t.Mobile = !(e.indexOf('iPad') > -1)),
                n &&
                    (r('type', 'application/gameplugin') ||
                    (window.navigator && void 0 === window.navigator.connection.saveData)
                        ? (t['360SE'] = !0)
                        : (t['360EE'] = !0)),
                t.IE || t.Edge)
            )
                switch (window.screenTop - window.screenY) {
                    case 71:
                    case 74:
                    case 99:
                    case 75:
                    case 105:
                        break
                    case 102:
                        t['360EE'] = !0
                        break
                    case 104:
                        t['360SE'] = !0
                }
            var o = {
                Safari: function () {
                    return e.replace(/^.*Version\/([\d.]+).*$/, '$1')
                },
                Chrome: function () {
                    return e.replace(/^.*Chrome\/([\d.]+).*$/, '$1').replace(/^.*CriOS\/([\d.]+).*$/, '$1')
                },
                IE: function () {
                    return e.replace(/^.*MSIE ([\d.]+).*$/, '$1').replace(/^.*rv:([\d.]+).*$/, '$1')
                },
                Edge: function () {
                    return e.replace(/^.*Edge\/([\d.]+).*$/, '$1')
                },
                Firefox: function () {
                    return e.replace(/^.*Firefox\/([\d.]+).*$/, '$1').replace(/^.*FxiOS\/([\d.]+).*$/, '$1')
                },
                'Firefox Focus': function () {
                    return e.replace(/^.*Focus\/([\d.]+).*$/, '$1')
                },
                Chromium: function () {
                    return e.replace(/^.*Chromium\/([\d.]+).*$/, '$1')
                },
                Opera: function () {
                    return e.replace(/^.*Opera\/([\d.]+).*$/, '$1').replace(/^.*OPR\/([\d.]+).*$/, '$1')
                },
                Vivaldi: function () {
                    return e.replace(/^.*Vivaldi\/([\d.]+).*$/, '$1')
                },
                Yandex: function () {
                    return e.replace(/^.*YaBrowser\/([\d.]+).*$/, '$1')
                },
                Arora: function () {
                    return e.replace(/^.*Arora\/([\d.]+).*$/, '$1')
                },
                Lunascape: function () {
                    return e.replace(/^.*Lunascape[\/\s]([\d.]+).*$/, '$1')
                },
                QupZilla: function () {
                    return e.replace(/^.*QupZilla[\/\s]([\d.]+).*$/, '$1')
                },
                'Coc Coc': function () {
                    return e.replace(/^.*coc_coc_browser\/([\d.]+).*$/, '$1')
                },
                Kindle: function () {
                    return e.replace(/^.*Version\/([\d.]+).*$/, '$1')
                },
                Iceweasel: function () {
                    return e.replace(/^.*Iceweasel\/([\d.]+).*$/, '$1')
                },
                Konqueror: function () {
                    return e.replace(/^.*Konqueror\/([\d.]+).*$/, '$1')
                },
                Iceape: function () {
                    return e.replace(/^.*Iceape\/([\d.]+).*$/, '$1')
                },
                SeaMonkey: function () {
                    return e.replace(/^.*SeaMonkey\/([\d.]+).*$/, '$1')
                },
                Epiphany: function () {
                    return e.replace(/^.*Epiphany\/([\d.]+).*$/, '$1')
                },
                360: function () {
                    return e.replace(/^.*QihooBrowser\/([\d.]+).*$/, '$1')
                },
                '360SE': function () {
                    return (
                        { 63: '10.0', 55: '9.1', 45: '8.1', 42: '8.0', 31: '7.0', 21: '6.3' }[
                            e.replace(/^.*Chrome\/([\d]+).*$/, '$1')
                        ] || ''
                    )
                },
                '360EE': function () {
                    return (
                        { 69: '11.0', 63: '9.5', 55: '9.0', 50: '8.7', 30: '7.5' }[
                            e.replace(/^.*Chrome\/([\d]+).*$/, '$1')
                        ] || ''
                    )
                },
                Maxthon: function () {
                    return e.replace(/^.*Maxthon\/([\d.]+).*$/, '$1')
                },
                QQBrowser: function () {
                    return e.replace(/^.*QQBrowser\/([\d.]+).*$/, '$1')
                },
                QQ: function () {
                    return e.replace(/^.*QQ\/([\d.]+).*$/, '$1')
                },
                Baidu: function () {
                    return e.replace(/^.*BIDUBrowser[\s\/]([\d.]+).*$/, '$1')
                },
                UC: function () {
                    return e.replace(/^.*UC?Browser\/([\d.]+).*$/, '$1')
                },
                Sogou: function () {
                    return e.replace(/^.*SE ([\d.X]+).*$/, '$1').replace(/^.*SogouMobileBrowser\/([\d.]+).*$/, '$1')
                },
                Liebao: function () {
                    var r = ''
                    e.indexOf('LieBaoFast') > -1 && (r = e.replace(/^.*LieBaoFast\/([\d.]+).*$/, '$1'))
                    var t = e.replace(/^.*Chrome\/([\d]+).*$/, '$1')
                    return (
                        r ||
                        { 57: '6.5', 49: '6.0', 46: '5.9', 42: '5.3', 39: '5.2', 34: '5.0', 29: '4.5', 21: '4.0' }[t] ||
                        ''
                    )
                },
                LBBROWSER: function () {
                    var r = ''
                    e.indexOf('LieBaoFast') > -1 && (r = e.replace(/^.*LieBaoFast\/([\d.]+).*$/, '$1'))
                    var t = e.replace(/^.*Chrome\/([\d]+).*$/, '$1')
                    return (
                        r ||
                        { 57: '6.5', 49: '6.0', 46: '5.9', 42: '5.3', 39: '5.2', 34: '5.0', 29: '4.5', 21: '4.0' }[t] ||
                        ''
                    )
                },
                '2345Explorer': function () {
                    return e.replace(/^.*2345Explorer\/([\d.]+).*$/, '$1')
                },
                '115Browser': function () {
                    return e.replace(/^.*115Browser\/([\d.]+).*$/, '$1')
                },
                TheWorld: function () {
                    return e.replace(/^.*TheWorld ([\d.]+).*$/, '$1')
                },
                XiaoMi: function () {
                    return e.replace(/^.*MiuiBrowser\/([\d.]+).*$/, '$1')
                },
                Vivo: function () {
                    return e.replace(/^.*VivoBrowser\/([\d.]+).*$/, '$1')
                },
                Quark: function () {
                    return e.replace(/^.*Quark\/([\d.]+).*$/, '$1')
                },
                Qiyu: function () {
                    return e.replace(/^.*Qiyu\/([\d.]+).*$/, '$1')
                },
                Wechat: function () {
                    return e.replace(/^.*MicroMessenger\/([\d.]+).*$/, '$1')
                },
                WechatWork: function () {
                    return e.replace(/^.*wxwork\/([\d.]+).*$/, '$1')
                },
                Taobao: function () {
                    return e.replace(/^.*AliApp\(TB\/([\d.]+).*$/, '$1')
                },
                Alipay: function () {
                    return e.replace(/^.*AliApp\(AP\/([\d.]+).*$/, '$1')
                },
                Weibo: function () {
                    return e.replace(/^.*weibo__([\d.]+).*$/, '$1')
                },
                Douban: function () {
                    return e.replace(/^.*com.douban.frodo\/([\d.]+).*$/, '$1')
                },
                Suning: function () {
                    return e.replace(/^.*SNEBUY-APP([\d.]+).*$/, '$1')
                },
                iQiYi: function () {
                    return e.replace(/^.*IqiyiVersion\/([\d.]+).*$/, '$1')
                },
                DingTalk: function () {
                    return e.replace(/^.*DingTalk\/([\d.]+).*$/, '$1')
                },
                Huawei: function () {
                    return e
                        .replace(/^.*Version\/([\d.]+).*$/, '$1')
                        .replace(/^.*HuaweiBrowser\/([\d.]+).*$/, '$1')
                        .replace(/^.*HBPC\/([\d.]+).*$/, '$1')
                }
            }
            ;(c.static.browserVersion = ''),
                o[c.static.browser] &&
                    ((c.static.browserVersion = o[c.static.browser]()),
                    c.static.browserVersion == e && (c.static.browserVersion = '')),
                'Chrome' == c.static.browser &&
                    e.match(/\S+Browser/) &&
                    ((c.static.browser = e.match(/\S+Browser/)[0]),
                    (c.static.version = e.replace(/^.*Browser\/([\d.]+).*$/, '$1'))),
                'Edge' == c.static.browser &&
                    (c.static.version > '75' ? (c.static.engine = 'Blink') : (c.static.engine = 'EdgeHTML')),
                (('Chrome' == c.static.browser && parseInt(c.static.browserVersion) > 27) ||
                    (t.Chrome && 'WebKit' == c.static.engine && parseInt(o.Chrome()) > 27) ||
                    ('Opera' == c.static.browser && parseInt(c.static.version) > 12) ||
                    'Yandex' == c.static.browser) &&
                    (c.static.engine = 'Blink')
        }),
        (c.initXhr = function () {
            var e = ''
            ;(e =
                window.location.href.indexOf('https://tracking.4portun.com') > -1
                    ? 'https://prod-api.4portun.com/'
                    : 'https://test-api.4portun.com/'),
                (c.url = e += 'wlb/gio/eventTracking')
            var r = new XMLHttpRequest()
            r.open('POST', e, !0),
                r.setRequestHeader('Content-Type', 'text/plain;charset=utf-8'),
                (r.onreadystatechange = function () {
                    4 === r.readyState && 200 === r.status
                        ? console.log('数据已成功发送')
                        : console.log('发送数据时出现错误')
                }),
                (c.xhr = r)
        }),
        (c.prototype.init = t(
            e().mark(function r() {
                return e().wrap(
                    function (e) {
                        for (;;)
                            switch ((e.prev = e.next)) {
                                case 0:
                                    c.matchInfoMap(),
                                        c.getBrowserInfo(),
                                        c.initXhr(),
                                        c.getCanvasId(),
                                        (this.sendData = {
                                            visiteInfo: {
                                                visitorId: c.getVisitorId(),
                                                userId: c.getUserId(),
                                                domain: window.location.host,
                                                page: window.location.hash || window.location.pathname,
                                                referrer: document.referrer,
                                                traceId: '',
                                                ts: '',
                                                eventName: ''
                                            },
                                            advertising: {
                                                utmSource: c.getParams('utm_source'),
                                                utmMedium: c.getParams('utm_medium'),
                                                utmCampaign: c.getParams('utm_campaign'),
                                                utmTerm: c.getParams('utm_term'),
                                                utmContent: c.getParams('utm_content')
                                            },
                                            device: {
                                                deviceBrand: '',
                                                deviceModel: '',
                                                deviceType: c.getDeviceType(),
                                                screenSize: c.getScreenSize()
                                            },
                                            system: {
                                                operatingSystem: c.static.os,
                                                osVersion: c.getOsVersion(),
                                                osLanguage: c.getLanguage(),
                                                browser: c.static.browser,
                                                browserVersion: c.static.browserVersion
                                            },
                                            eventVariables: {}
                                        })
                                case 5:
                                case 'end':
                                    return e.stop()
                            }
                    },
                    r,
                    this
                )
            })
        )),
        (c.prototype.setUserId = function (e) {
            localStorage.setItem('userId', e)
        }),
        (c.prototype.clearUserId = function () {
            localStorage.removeItem('userId'), (this.sendData.visiteInfo.userId = '')
        }),
        (c.prototype.getUserId = function (e) {
            var r = localStorage.getItem('userId')
            return r || ''
        }),
        (c.prototype.reGetData = function () {
            ;(this.sendData.visiteInfo.userId = c.getUserId()),
                (this.sendData.advertising.utmSource = c.getParams('utm_source')),
                (this.sendData.advertising.utmMedium = c.getParams('utm_medium')),
                (this.sendData.advertising.utmCampaign = c.getParams('utm_campaign')),
                (this.sendData.advertising.utmTerm = c.getParams('utm_term')),
                (this.sendData.advertising.utmContent = c.getParams('utm_content')),
                (this.sendData.visiteInfo.ts = Date.now()),
                (this.sendData.visiteInfo.page = window.location.hash || window.location.pathname),
                (this.sendData.visiteInfo.referrer = document.referrer),
                (this.sendData.visiteInfo.eventName = 'click')
        }),
        (c.prototype.send = function (e, r, t) {
            try {
                this.reGetData(),
                    t && (this.sendData.visiteInfo.eventName = t),
                    (this.sendData.visiteInfo.eventDes = e),
                    (this.sendData.eventVariables = r || {})
                var n = JSON.stringify(this.sendData)
                navigator.sendBeacon ? navigator.sendBeacon(c.url, n) : c.xhr.send(n)
            } catch (e) {
                console.log(e)
            }
        }),
        (window.sgMonitor = new c()),
        window.addEventListener('beforeunload', function (e) {
            window.sgMonitor.send('', '', 'reload')
        }),
        window.addEventListener('load', function (e) {
            window.sgMonitor.send('', '', 'load')
        })
})()
