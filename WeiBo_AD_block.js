// ==UserScript==
// @name         微博屏蔽广告
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  屏蔽微博广告
// @author       坂鱼寿司@kenty227
// @include      *://m.weibo.cn/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_log
// @grant        GM_notification
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    GM_log('加载【微博屏蔽广告】脚本 ...')

    const app = document.getElementById('app')
    app.addEventListener('DOMNodeInserted', function (event) {
        if (event.target.className == 'lite-page-wrap') {
            // 设置定时任务（待页面加载完毕后添加按钮）
            var timer = setInterval(function () {
                var ad = document.getElementsByClassName('wrap')

                if (ad.length > 0) {
                    // 删除广告
                    ad[0].remove()

                    // 清除定时任务
                    window.clearInterval(timer)
                }
            }, 1000);
        }
    })
})();
