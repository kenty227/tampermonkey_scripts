// ==UserScript==
// @name         微博消息实时推送
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  实时推送最新分组微博消息至WINDOWS桌面通知
// @author       坂鱼寿司@kenty227
// @include      *://m.weibo.cn/?standalone=1
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_log
// @grant        GM_notification
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_openInTab
// ==/UserScript==

(function () {
    'use strict';

    GM_log('Start script ...')

    // GM_setValue('since_id', '') // 清空最新ID

    // getLatest()
    window.setInterval(getLatest, 20 * 1000);

    function getLatest() {
        GM_xmlhttpRequest({
            // 指定分组，按需修改
            url: 'https://m.weibo.cn/feed/group?gid=4033415499592879',
            method: "GET",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            responseType: 'json',
            onload: function (response) {
                if (response.status !== 200) {
                    GM_log('接口异常')
                    return GM_log(response)
                }

                var data = response.response.data;
                // GM_log(data)

                // 本次ID
                GM_log('since_id: ' + data.since_id)

                // 上次ID
                var last_since_id = GM_getValue('since_id')
                GM_log('last_since_id: ' + last_since_id)

                // 第一次进入，仅保存最新ID
                if (last_since_id == undefined) {
                    return GM_setValue('since_id', data.since_id)
                }
                // 无更新（本次ID = 上次ID）
                if (last_since_id == data.since_id) {
                    return
                }

                // 更新最新ID
                GM_setValue('since_id', data.since_id)

                // 获取最新消息
                try {
                    data.statuses.forEach(function (v, idnex) {
                        // 获取至上次最新内容，退出
                        if (v.id == last_since_id) {
                            throw new Error("break");
                        }
                        // GM_log(v)
                        // 发送桌面通知
                        GM_notification({
                            text: v.text.replace(/<[^>]+>/g, ''),
                            title: v.user.screen_name,
                            timeout: 7000,
                            onclick: function () {
                                GM_openInTab("https://m.weibo.cn/detail/" + v.id, {
                                    active: true
                                })
                            }
                        })
                    })
                } catch (e) {
                    if (e.message !== 'break') {
                        GM_log(e.message)
                    }
                }
            }
        })
    }
})();
