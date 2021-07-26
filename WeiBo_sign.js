// ==UserScript==
// @name         微博超话一键签到
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  微博超话添加一键签到按钮（https://m.weibo.cn/p/tabbar?containerid=100803_-_followsuper&page_type=tabbar）
// @author       坂鱼寿司@kenty227
// @include      *://m.weibo.cn/p/tabbar*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_log
// @grant        GM_notification
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
    'use strict';

    GM_log('加载【微博超话一键签到】脚本 ...')

    // 起始签到列表页URL
    var indexUrl = 'https://m.weibo.cn/api/container/getIndex?containerid=100803_-_followsuper'

    // 设置定时任务（待页面加载完毕后添加按钮）
    var timer = setInterval(addButton, 1000);

    // 添加签到按钮
    function addButton() {
        var box = document.getElementsByClassName('box-right m-box-center-a')

        if (box.length > 0) {
            var button = document.createElement("button");
            button.id = "one-click-sign";
            button.textContent = "一键签到";
            button.type = "button"
            button.style.cssText = 'width: 80px; height: 35px; border-radius: 8px; ';
            button.onclick = function () {
                GM_log('一键签到 ...')
                goSign(indexUrl)
            }
            // 添加按钮
            box[0].appendChild(button)
            // 清除定时任务
            window.clearInterval(timer)
        }
    }

    // 签到一页
    function goSign(url, since_id = "") {
        if (since_id !== "") {
            url = url + "&since_id=" + since_id
        }
        GM_log("本页URL：" + url)

        // 获取关注列表
        GM_xmlhttpRequest({
            url: url,
            method: "GET",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "MWeibo-Pwa": "1",
                "X-Requested-With": "XMLHttpRequest",
                "Referer": window.location.href,
                "X-XSRF-TOKEN": getCookie('XSRF-TOKEN')
            },
            responseType: 'json',
            onload: function (response) {
                if (response.status !== 200) {
                    return error('请求关注列表接口失败：' + response.status)
                }
                if (response.response.ok !== 1) {
                    GM_log(response)
                    return error('请求关注列表接口失败')
                }

                var data = response.response.data;
                // GM_log(data)

                // 遍历签到列表
                data.cards[0].card_group.forEach(function (v) {
                    if (Object.keys(v).indexOf('buttons') === -1) {
                        return
                    }
                    if (v.buttons[0].scheme === false) {
                        return GM_log(v.title_sub + '：已签到')
                    }
                    // 获取签到API
                    var url = window.location.origin + v.buttons[0].scheme
                    // GM_log(url)

                    GM_xmlhttpRequest({
                        url: url,
                        method: "GET",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            "MWeibo-Pwa": "1",
                            "X-Requested-With": "XMLHttpRequest",
                            "Referer": window.location.href,
                            "X-XSRF-TOKEN": getCookie('XSRF-TOKEN')
                        },
                        responseType: 'json',
                        onload: function (response) {
                            if (response.status !== 200) {
                                return error(v.title_sub + ' ×')
                            }
                            if (response.response.ok !== 1) {
                                error(v.title_sub + ' ×')
                            } else {
                                GM_log(v.title_sub + ' √')
                            }
                        }
                    })
                })

                // 签到下一页
                if (data.cardlistInfo.since_id !== "") {
                    goSign(indexUrl, data.cardlistInfo.since_id)
                }
            }
        })
    }

    // 打印错误信息&发送通知
    function error(msg, notify = true) {
        GM_log(msg)
        if (notify) {
            GM_notification({
                text: msg,
                title: 'Error',
                timeout: 5000
            })
        }
    }

    // 获取Cookie
    function getCookie(name) {
        var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        if (arr = document.cookie.match(reg)) {
            return unescape(arr[2]);
        }
        return null;
    }
})();
