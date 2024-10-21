/*
昆仑健康小程序
一天3次   
cron: 59 9,12,18 * * * 昆仑健康.js
jksh.kunlunhealth.com.cn请求体的openid#token
kljk=openid#token
*/
//process.env.kljk = ''
const $ = Env('昆仑健康')
const envSplit = ['\n', '@']     //支持多种分割，但要保证变量里不存在这个字符
const ckNames = ['kljk'] //可以支持多变量

//====================================================================================================
let DEFAULT_RETRY = 3           // 默认重试次数
//====================================================================================================
async function userTasks() {

    let list = []
    for (let user of $.userList) {
        list.push(user.list())
    }
    await Promise.all(list)

    list = []
    for (let user of $.userList) {
        list.push(user.dtlist())
    }
    await Promise.all(list)

}
class UserClass {
    constructor(ck) {
        this.idx = `账号[${++$.userIdx}]`
        this.ckFlog = true
        this.ck = ck.split('#')
        this.openid = this.ck[0]
        this.token = this.ck[1]
    }

    async list() {
        let options = {
            fn: 'info',
            method: 'post',
            url: `https://jksh.kunlunhealth.com.cn/stage-api/abutment/getTaskList`,
            headers: {
                "Host": "jksh.kunlunhealth.com.cn",
                "req_sn": this.token,
                "ContentOrigin": "true",
                "Accept-Encoding": "gzip,compress,br,deflate",
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d38) NetType/WIFI Language/zh_CN",
                "Referer": "https://servicewechat.com/wxeb2eb33c531125ce/70/page-frame.html"
            },
            json: {
                "openId": this.openid,
                "token": this.token,
                "activityType": "0"
            }

        }
        //    $.log(options)
        let resp = await $.request(options)

        if (resp.code == 200) {
            if (resp.data.solarTask.length == 5) {
                if (resp.data.solarTask[0].todayStatus == 1) {
                    $.log(this.idx + `昨日任务可领取，去领取...`)
                    await this.insertAnswerSolar(resp.data.solarTask[0].taskId)
                }
            } else if (resp.data.solarTask.length == 4) {
                $.log(this.idx + `今日任务未领取，去领取...`)
                await this.insertSolar(resp.data.solarTask[0].taskId)
            } else if (resp.data.solarTask.length == 1) {
                $.log(this.idx + `今日任务已领取：${resp.data.solarTask[0].taskName}`)

            }

        } else {
            $.log(JSON.stringify(resp))
        }
    }
    async insertSolar(a) {
        let options = {
            fn: 'insertSolar',
            method: 'post',
            url: `https://jksh.kunlunhealth.com.cn/stage-api/abutment/insertSolar`,
            headers: {
                "Host": "jksh.kunlunhealth.com.cn",
                "req_sn": this.token,
                "ContentOrigin": "true",
                "Accept-Encoding": "gzip,compress,br,deflate",
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d38) NetType/WIFI Language/zh_CN",
                "Referer": "https://servicewechat.com/wxeb2eb33c531125ce/70/page-frame.html"
            },
            json: {
                "openId": this.openid,
                "token": this.token,
                "activityType": "0",
                "taskId": a
            }

        }
        //    $.log(options)
        let resp = await $.request(options)

        if (resp.code == 200) {

            $.log(this.idx + `今日奖励领取成功`)

        } else {
            $.log(JSON.stringify(resp))
        }
    }


    async insertAnswerSolar(a) {
        let bd = jm2(this.token, this.openid, a)
        let options = {
            fn: 'insertAnswerSolar',
            method: 'post',
            url: `https://jksh.kunlunhealth.com.cn/stage-api/abutment/insertAnswerSolar`,
            headers: {
                "Host": "jksh.kunlunhealth.com.cn",
                "req_sn": this.token,
                "ContentOrigin": "true",
                "Accept-Encoding": "gzip,compress,br,deflate",
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d38) NetType/WIFI Language/zh_CN",
                "Referer": "https://servicewechat.com/wxeb2eb33c531125ce/70/page-frame.html"
            },
            json: bd

        }

        let resp = await $.request(options)

        if (resp.code == 200) {

            $.log(this.idx + `昨日奖励领取成功`)
            //  $.log(JSON.stringify(resp))
        } else {
            $.log(JSON.stringify(resp))
        }
    }
    async dtlist() {
        let options = {
            fn: 'dtlist',
            method: 'post',
            url: `https://jksh.kunlunhealth.com.cn/stage-api/abutment/getTaskList`,
            headers: {
                "Host": "jksh.kunlunhealth.com.cn",
                "req_sn": this.token,
                "ContentOrigin": "true",
                "Accept-Encoding": "gzip,compress,br,deflate",
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d38) NetType/WIFI Language/zh_CN",
                "Referer": "https://servicewechat.com/wxeb2eb33c531125ce/70/page-frame.html"
            },
            json: {
                "token": this.token,
                "activityType": 1,
                "openId": this.openid
            }

        }
        //    $.log(options)
        let resp = await $.request(options)

        if (resp.code == 200) {
            //  $.log(this.idx+JSON.stringify(resp))
            this.activityType = resp.data.activityType
            this.id = resp.data.rumourList[0].id
            this.answer = resp.data.rumourList[0].userAnswer
            if (resp.data.rumourList[0].status == 0) {
                $.log(this.idx + `今日未答题，去答题...`)
                if($.time('mm') == '59'){
                    $.log(`到答题准备时间,开始等待..`)  
                    while (true) { if ($.time('ss') + $.time('S') >= 59800) break; }
                    await this.insertAnswerRumour()
                }else{
                    $.log(`未到答题时间`)  
                }
            } else if (resp.data.rumourList[0].status == 1) {
                $.log(this.idx + `今日已参与答题 \n累计答题：${resp.data.totalNumber} 答对题数：${resp.data.correctNumber}`)
              //  $.log($.time('hmm'))
            }

        } else {
            $.log(JSON.stringify(resp))
        }
    }
    async insertAnswerRumour() {
        let bd = jm(this.token, this.openid, this.id, '1')
        let options = {
            fn: 'insertAnswerRumour',
            method: 'post',
            url: `https://jksh.kunlunhealth.com.cn/stage-api/abutment/insertAnswerRumour`,
            headers: {
                "Host": "jksh.kunlunhealth.com.cn",
                "req_sn": this.token,
                "ContentOrigin": "true",
                "Accept-Encoding": "gzip,compress,br,deflate",
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.29(0x18001d38) NetType/WIFI Language/zh_CN",
                "Referer": "https://servicewechat.com/wxeb2eb33c531125ce/70/page-frame.html"
            },
            json: bd

        }

        let resp = await $.request(options)

        if (resp.code == 200) {

            $.log(this.idx + `答题成功`, { time: true })

        } else {
            $.log(this.idx + JSON.stringify(resp), { time: true })
        }
    }
}


!(async () => {
    if ($.read_env(UserClass)) {
        await userTasks()
    }


})()
    .catch((e) => $.log(e))
    .finally(() => $.exitNow())


//===============================================================

function Env(name) {
    return new class {
        constructor(name) {
            this.name = name
            this.startTime = Date.now()
            this.log(`[${this.name}]开始运行`, { time: true })

            this.notifyStr = []
            this.notifyFlag = true

            this.userIdx = 0
            this.userList = []
            this.userCount = 0
        }

        async request(opt) {
            const got = require('got')
            let DEFAULT_TIMEOUT = 8000      // 默认超时时间
            let resp = null, count = 0
            let fn = opt.fn || opt.url
            let resp_opt = opt.resp_opt || 'body'
            opt.timeout = opt.timeout || DEFAULT_TIMEOUT
            opt.retry = opt.retry || { limit: 0 }
            opt.method = opt?.method?.toUpperCase() || 'GET'
            while (count++ < DEFAULT_RETRY) {
                try {
                    resp = await got(opt)
                    break
                } catch (e) {
                    if (e.name == 'TimeoutError') {
                        this.log(`[${fn}]请求超时，重试第${count}次`)
                    } else {
                        this.log(`[${fn}]请求错误(${e.message})，重试第${count}次`)
                    }
                }
            }
            if (resp == null) return Promise.resolve({ statusCode: 'timeout', headers: null, body: null })
            let { statusCode, headers, body } = resp
            if (body) try {
                body = JSON.parse(body)
            } catch {
            }
            if (resp_opt == 'body') {
                return Promise.resolve(body)
            } else if (resp_opt == 'hd') {
                return Promise.resolve(headers)
            } else if (resp_opt == 'statusCode') {
                return Promise.resolve(statusCode)
            }

        }

        log(msg, options = {}) {
            let opt = { console: true }
            Object.assign(opt, options)

            if (opt.time) {
                let fmt = opt.fmt || 'hh:mm:ss:S'
                msg = `[${this.time(fmt)}]` + msg
            }
            if (opt.notify) {
                this.notifyStr.push(msg)
            }
            if (opt.console) {
                console.log(msg)
            }
            if (opt.sp) {
                console.log(`\n-------------- ${msg} --------------`)
            }
        }

        read_env(Class) {
            let envStrList = ckNames.map(x => process.env[x])
            for (let env_str of envStrList.filter(x => !!x)) {
                let sp = envSplit.filter(x => env_str.includes(x))
                let splitor = sp.length > 0 ? sp[0] : envSplit[0]
                for (let ck of env_str.split(splitor).filter(x => !!x)) {
                    this.userList.push(new Class(ck))
                }
            }
            this.userCount = this.userList.length
            if (!this.userCount) {
                this.log(`未找到变量，请检查变量${ckNames.map(x => '[' + x + ']').join('或')}`, { notify: true })
                return false
            }
            this.log(`共找到${this.userCount}个账号`)
            return true
        }

        async taskThread(taskName, conf, opt = {}) {
            while (conf.idx < $.userList.length) {
                let user = $.userList[conf.idx++]
                await user[taskName](opt)
            }
        }

        async threadManager(taskName, thread) {
            let taskAll = []
            let taskConf = { idx: 0 }
            while (thread--) {
                taskAll.push(this.taskThread(taskName, taskConf))
            }
            await Promise.all(taskAll)
        }

        time(t, x = null) {
            let xt = x ? new Date(x) : new Date
            let e = {
                "Y": xt.getFullYear(),
                "M+": xt.getMonth() + 1,
                "d+": xt.getDate(),
                "h+": xt.getHours(),
                "m+": xt.getMinutes(),
                "s+": xt.getSeconds(),
                "q+": Math.floor((xt.getMonth() + 3) / 3),
                S: this.padStr(xt.getMilliseconds(), 3)
            };
            /(y+)/.test(t) && (t = t.replace(RegExp.$1, (xt.getFullYear() + "").substr(4 - RegExp.$1.length)))
            for (let s in e)
                new RegExp("(" + s + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? e[s] : ("00" + e[s]).substr(("" + e[s]).length)))
            return t
        }

        async showmsg() {
            if (!this.notifyFlag) return;
            if (!this.notifyStr.length) return;
            var notify = require('./sendNotify');
            this.log('\n============== 推送 ==============')
            await notify.sendNotify(this.name, this.notifyStr.join('\n'));
        }

        padStr(num, length, opt = {}) {
            let padding = opt.padding || '0'
            let mode = opt.mode || 'l'
            let numStr = String(num)
            let numPad = (length > numStr.length) ? (length - numStr.length) : 0
            let pads = ''
            for (let i = 0; i < numPad; i++) {
                pads += padding
            }
            if (mode == 'r') {
                numStr = numStr + pads
            } else {
                numStr = pads + numStr
            }
            return numStr
        }

        json2str(obj, c, encode = false) {
            let ret = []
            for (let keys of Object.keys(obj).sort()) {
                let v = obj[keys]
                if (v && encode) v = encodeURIComponent(v)
                ret.push(keys + '=' + v)
            }
            return ret.join(c)
        }

        str2json(str, decode = false) {
            let ret = {}
            for (let item of str.split('&')) {
                if (!item) continue
                let idx = item.indexOf('=')
                if (idx == -1) continue
                let k = item.substr(0, idx)
                let v = item.substr(idx + 1)
                if (decode) v = decodeURIComponent(v)
                ret[k] = v
            }
            return ret
        }

        phoneNum(phone_num) {
            if (phone_num.length == 11) {
                let data = phone_num.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")
                return data
            } else {
                return phone_num
            }
        }

        randomInt(min, max) {
            return Math.round(Math.random() * (max - min) + min)
        }

        async yiyan() {
            const got = require('got')
            return new Promise((resolve) => {
                (async () => {
                    try {
                        const response = await got('https://v1.hitokoto.cn')
                        // console.log(response.body)
                        let data = JSON.parse(response.body)
                        let data_ = `[一言]: ${data.hitokoto}  by--${data.from}`
                        // console.log(data_)
                        resolve(data_)
                    } catch (error) {
                        console.log(error.response.body)
                    }
                })()
            })
        }

        ts(type = false, _data = "") {
            let myDate = new Date()
            let a = ""
            switch (type) {
                case 10:
                    a = Math.round(new Date().getTime() / 1000).toString()
                    break
                case 13:
                    a = Math.round(new Date().getTime()).toString()
                    break
                case "h":
                    a = myDate.getHours()
                    break
                case "m":
                    a = myDate.getMinutes()
                    break
                case "y":
                    a = myDate.getFullYear()
                    break
                case "h":
                    a = myDate.getHours()
                    break
                case "mo":
                    a = myDate.getMonth()
                    break
                case "d":
                    a = myDate.getDate()
                    break
                case "ts2Data":
                    if (_data != "") {
                        time = _data
                        if (time.toString().length == 13) {
                            let date = new Date(time + 8 * 3600 * 1000)
                            a = date.toJSON().substr(0, 19).replace("T", " ")
                        } else if (time.toString().length == 10) {
                            time = time * 1000
                            let date = new Date(time + 8 * 3600 * 1000)
                            a = date.toJSON().substr(0, 19).replace("T", " ")
                        }
                    }
                    break
                default:
                    a = "未知错误,请检查"
                    break
            }
            return a
        }

        randomPattern(pattern, charset = 'abcdef0123456789') {
            let str = ''
            for (let chars of pattern) {
                if (chars == 'x') {
                    str += charset.charAt(Math.floor(Math.random() * charset.length))
                } else if (chars == 'X') {
                    str += charset.charAt(Math.floor(Math.random() * charset.length)).toUpperCase()
                } else {
                    str += chars
                }
            }
            return str
        }

        randomString(len, charset = 'abcdef0123456789') {
            let str = ''
            for (let i = 0; i < len; i++) {
                str += charset.charAt(Math.floor(Math.random() * charset.length))
            }
            return str
        }

        randomList(a) {
            let idx = Math.floor(Math.random() * a.length)
            return a[idx]
        }

        wait(t) {
            return new Promise(e => setTimeout(e, t * 1000))
        }

        async exitNow() {
            await this.showmsg()
            let e = Date.now()
            let s = (e - this.startTime) / 1000
            this.log(`[${this.name}]运行结束，共运行了${s}秒`)
            process.exit(0)
        }
    }(name)
}
function jm(tk, openid, taskid, a) {
    const CryptoJS = require('crypto-js')
    function insertAnswerRumour(token, openId, taskId, activityType, userAnswer) {
        var n = ''
        var c = parseInt(10 * Math.random())
        var u = parseInt(10 * Math.random())
        var f = parseInt(new Date().getTime() / 1e3)
        var h =
            parseInt(10 * Math.random()) +
            '' +
            parseInt(10 * Math.random()) +
            parseInt(10 * Math.random()) +
            parseInt(10 * Math.random())
        var l = parseInt(1e3 * Math.random())
        var d = {
            token: token,
            openId: openId,
            activityType: activityType,
            taskId: taskId,
            userAnswer: userAnswer
        }
        n = JSON.stringify(d)
        var p = h + f + c + u + l + '',
            g = 'e8' + f + c + u + 'B',
            v = '7@' + f + c + u + '9'
        let b = encrypt(n, g + '$', v + 'p')
        return {
            body: b,
            code: p
        }
    }
    function encrypt(e, t, r) {
        var o = CryptoJS.enc.Utf8.parse('1234567890123456'),
            a = CryptoJS.enc.Utf8.parse('1234567890123456')
        var n = o,
            s = a
        t && ((n = CryptoJS.enc.Utf8.parse(t)), (s = CryptoJS.enc.Utf8.parse(r)))
        var c = CryptoJS.enc.Utf8.parse(e),
            u = CryptoJS.AES.encrypt(c, n, {
                iv: s,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.ZeroPadding
            })
        return CryptoJS.enc.Base64.stringify(u.ciphertext)
    }
    let o = {
        "token": tk,
        "openId": openid,
        "activityType": a,
        "taskId": taskid,
        "userAnswer": "0"
    }
    return insertAnswerRumour(o.token, o.openId, o.taskId, o.activityType, o.userAnswer)
}
function jm2(tk, openid, taskid) {
    const CryptoJS = require('crypto-js')
    function insertAnswerRumour(token, openId, taskId, taskStatus) {
        var n = ''
        var c = parseInt(10 * Math.random())
        var u = parseInt(10 * Math.random())
        var f = parseInt(new Date().getTime() / 1e3)
        var h =
            parseInt(10 * Math.random()) +
            '' +
            parseInt(10 * Math.random()) +
            parseInt(10 * Math.random()) +
            parseInt(10 * Math.random())
        var l = parseInt(1e3 * Math.random())
        var d = {
            token: token,
            openId: openId,
            activityType: 0,
            taskId: taskId,
            taskStatus: taskStatus
        }
        n = JSON.stringify(d)
        var p = h + f + c + u + l + '',
            g = 'e8' + f + c + u + 'B',
            v = '7@' + f + c + u + '9'
        let b = encrypt(n, g + '$', v + 'p')
        return {
            body: b,
            code: p
        }
    }
    function encrypt(e, t, r) {
        var o = CryptoJS.enc.Utf8.parse('1234567890123456'),
            a = CryptoJS.enc.Utf8.parse('1234567890123456')
        var n = o,
            s = a
        t && ((n = CryptoJS.enc.Utf8.parse(t)), (s = CryptoJS.enc.Utf8.parse(r)))
        var c = CryptoJS.enc.Utf8.parse(e),
            u = CryptoJS.AES.encrypt(c, n, {
                iv: s,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.ZeroPadding
            })
        return CryptoJS.enc.Base64.stringify(u.ciphertext)
    }
    let o = {
        "token": tk,
        "openId": openid,
        "activityType": 0,
        "taskId": taskid,
        "taskStatus": 1
    }
    return insertAnswerRumour(o.token, o.openId, o.taskId, o.taskStatus)
}