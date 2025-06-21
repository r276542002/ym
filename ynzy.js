/*
招商信诺App: 原 完美人生

变量：捉包小程序https://member.cignacmb.com/mini/member/interface/login请求体 多账号换行隔开

参考:
param={"unionid":"xxx-gJ8XfM","miniOpenId":"xxx","mobile":"xxxx","miniOpenid":"xxx","sensorDeviceId":"xxxx"}

格式：export zsxn=‘body=param={"unionid":"xxx-gJ8XfM","miniOpenId":"xxx","mobile":"xxxx","miniOpenid":"xxx","sensorDeviceId":"xxxx"}’

注意: 变量内含双引号,如果放配置文件需要用 "单引号" 括起来否则冲突报错

*/

const $ = new Env("招商信诺");
let httpResult, httpReq, httpResp
const jwt = require('jsonwebtoken');
const moment = require('moment');

let debug = false  // ✅ 开启调试

let envSplitor = ['\n']     //多账号隔开方式
let strSplitor = '#'        //变量分割方式
let userCookie = ($.isNode() ? process.env.zsxn : $.getdata('zsxn')) || ''; //CK
let userList = []
let userIdx = 0
let userCount = 0
let nm = Math.floor(Math.random() * 14 + 1);    //随机数
let defaultUA = [
    "Mozilla/5.0 (Linux; Android 10; ONEPLUS A5010 Build/QKQ1.191014.012; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
    "Mozilla/5.0 (Linux; Android 9; Mi Note 3 Build/PKQ1.181007.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/045131 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 10; GM1910 Build/QKQ1.190716.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 9; 16T Build/PKQ1.190616.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/532.0 (KHTML, like Gecko) CriOS/43.0.823.0 Mobile/65M532 Safari/532.0",
    "Mozilla/5.0 (iPod; U; CPU iPhone OS 3_1 like Mac OS X; rw-RW) AppleWebKit/531.9.3 (KHTML, like Gecko) Version/4.0.5 Mobile/8B118 Safari/6531.9.3",
    "Mozilla/5.0 (Linux; Android 9; MI 6 Build/PKQ1.190118.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 11; Redmi K30 5G Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045511 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 10; ONEPLUS A6000 Build/QKQ1.190716.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045224 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 9; MHA-AL00 Build/HUAWEIMHA-AL00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 8.0.0; HTC U-3w Build/OPR6.170623.013; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 10; LYA-AL00 Build/HUAWEILYA-AL00L; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 8.1.0; MI 8 Build/OPM1.171019.026; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/045131 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 10; Redmi K20 Pro Premium Edition Build/QKQ1.190825.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045227 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 8.1.0; 16 X Build/OPM1.171019.026; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 10; M2006J10C Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 13_7 like Mac OS X) AppleWebKit/532.0 (KHTML, like Gecko) FxiOS/18.2n0520.0 Mobile/50C216 Safari/532.0",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148"
 ]
let User_Agent = defaultUA[nm]
///////////////////////////////////////////////////////////////////
class UserInfo {
    constructor(str) {
        this.index = ++userIdx
        this.name = this.index
        this.valid = false
        this.canRead = false
        try {
            this.param = $.str2json(str)
            this.ckValid = true
        } catch (e) {
            this.ckValid = false
            $.logAndNotify(`账号[${this.index}]CK格式错误`)
        }
    }
    
   
    async userLogin() {
        try {
            let url = `https://member.cignacmb.com/mini/member/interface/login`
            let body = `${this.param.body}`
            let urlObject = populateUrlObject(url, body)
            await httpRequest('post',urlObject)
            let result = httpResult;
            if(!result) return
            if(httpResp.headers.token){
            $.logAndNotify(`账号[${this.name}]刷新token成功`)
              this.token=httpResp.headers.token
              const decoded = jwt.decode(this.token, { complete: true });
              this.openid = decoded.payload.userId
              await this.queryScoreStatisticsMonth();
            }
        } catch(e) {
            console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }
    
    async queryScoreStatisticsMonth() {
        try {
            let url = `https://member.cignacmb.com/shop/member/interface/queryScoreStatisticsMonth`
            let body = `param=e30=`
            let urlObject = populateUrlObject(url, body)
            urlObject.headers['Authorization'] = "Bearer_" + this.token
            await httpRequest('post',urlObject)
            let result = httpResult;
            if(!result) return
            if(result.respCode=='00'){
                this.valid = true
                this.canRead = true
                $.logAndNotify(`账号[${this.name}]现有诺米：${result.respData.totalScore}`)
            }
        } catch(e) {
            console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }
    
    async getInfo() {
        try {
            let url = `https://m.cignacmb.com/projects/we_media/index.php/Signin2025/getInfo`
            let body = `code=${this.openid}&token=${this.token}&channel=APP&version=5001`
            let urlObject = populateUrlObject(url, body)
            await httpRequest('post',urlObject)
            let result = httpResult;
            if(!result) return
            if(result.code == 200){
                if(result.data.isSignin == 0){
                    await this.doSigninTask(result.data.cTime, result.data.sign)
                }
                $.logAndNotify(`账号[${this.name}]已签到：${result.data.continuousSignDays} 天`)
                for(let task of result.data.tasks){
                    let status = task.status == 0 ? '未完成' : '已完成'
                    $.logAndNotify(`账号[${this.name}]${task.title} -- ${task.reward_rule}次/${task.reward_amount}诺米 -- ${status}`)
                    this.title = task.title
                    if(task.status == 0){
                    await this.doBrowseTask(result.data.cTime, result.data.sign, task.id)
                    }
                }
            }
        } catch(e) {
            console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }
    
    async doBrowseTask(cTime, sign, taskid) {
        try {
            let url = `https://m.cignacmb.com/projects/we_media/index.php/Signin2025/doBrowseTask`
            let body = `openid=${this.openid}&channel=APP&cTime=${cTime}&sign=${sign}&taskid=${taskid}`
            let urlObject = populateUrlObject(url, body)
            await httpRequest('post',urlObject)
            let result = httpResult;
            if(!result) return
            $.logAndNotify(`账号[${this.name}]完成：${this.title}`)
        } catch(e) {
            console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }
    
    async doSigninTask(cTime, sign) {
        try {
            let url = `https://m.cignacmb.com/projects/we_media/index.php/Signin2025/doSigninTask`
            let body = `openid=${this.openid}&channel=APP&cTime=${cTime}&sign=${sign}&sign_time=${moment().format('YYYY-MM-DD')}`
            let urlObject = populateUrlObject(url, body)
            await httpRequest('post',urlObject)
            let result = httpResult;
            if(!result) return
            $.logAndNotify(`账号[${this.name}]签到第：${result.data.continuousSignDays} 天 获得:${result.data.points} 诺米`)
        } catch(e) {
            console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }
    
    async userTask() {
        $.logAndNotify(`\n====== 账号[${this.index}] ======`)
        await this.userLogin()
        if(!this.valid) return;

        $.logAndNotify(`\n----------- 任务列表 -----------`)
        await this.getInfo();


    }

    

    
    
}!(async () => {
    if (typeof $request !== "undefined") {
        //await GetRewrite()
    }else {

        if(!(await checkEnv())) return;

        for(let user of userList) {
            await user.userTask();
        }

        await $.showmsg();
    }
})()
.catch((e) => console.log(e))
.finally(() => $.done())

///////////////////////////////////////////////////////////////////
async function sc() {
        try {
            let url = `https://v1.jinrishici.com/all.json`
            let body = ``
            let urlObject = populateUrlObject(url,body)
            await httpRequest('get',urlObject)
            let result = httpResult;
            if(!result) return
           $.logAndNotify(`\n${result.content}  \n      ————《${result.origin}》${result.author}`)
        } catch(e) {
            console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }

async function checkEnv() {
    if(userCookie) {
        let splitor = envSplitor[0];
        for(let sp of envSplitor) {
            if(userCookie.indexOf(sp) > -1) {
                splitor = sp;
                break;
            }
        }
        for(let userCookies of userCookie.split(splitor)) {
            if(userCookies) userList.push(new UserInfo(userCookies))
        }
        userCount = userList.length
    } else {
        console.log('\n未找到CK 请阅读脚本说明')
        return;
    }

    console.log(`\n共找到${userCount}个账号`)
    return true
}

////////////////////////////////////////////////////////////////////
function populateUrlObject(url, body='', proxy = ''){
    let host = url.replace('//','/').split('/')[1]
    let urlObject = {
        url: url,
        headers: {
            'Host': host,
            'User-Agent': User_Agent,
        },
        timeout: 30000,
    }
    if(body) {
        urlObject.body = body
        urlObject.headers['Content-Type'] =  'application/x-www-form-urlencoded'
        urlObject.headers['Content-Length'] = urlObject.body ? Buffer.byteLength(body, 'utf8') : 0;
    }
        if (proxy) urlObject.proxy = proxy;
    return urlObject;
}


async function httpRequest(method, url) {
    httpResult = null, httpReq = null, httpResp = null;
   
    let maxRetries = 1;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        let result = await new Promise((resolve) => {
            $.send(method, url, async (err, req, resp) => {
                try {
                    httpReq = req;
                    httpResp = resp;
                    if (err) {
                        httpResult = resp ?? resp?.body ?? err;
                        return resolve(false);
                    }
                    if (resp.body) {
                        if (typeof resp.body == "object") {
                            httpResult = resp.body;
                        } else {
                            try {
                                httpResult = JSON.parse(resp.body);
                            } catch {
                                httpResult = resp.body;
                            }
                        }
                    }
                    return resolve(true);
                } catch (e) {
                    httpResult = { error: e };
                    return resolve(false);
                }
            });
        });

        if (debug) {
            console.log(`第 ${attempt} 次请求:`, url);
            if (typeof httpResult === 'object') {
                console.log(`响应体: ${JSON.stringify(httpResult, null, 2)}\n`);
            } else {
                console.log(`响应体: ${httpResult}\n`);
            }
        }
                    
        if (result) break;
        if (attempt < maxRetries) {
            await new Promise(r => setTimeout(r, 1000 * attempt));
        }
    }
}

////////////////////////////////////////////////////////////////////
function Env(name,env) {
    "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);
    return new class {
        constructor(name,env) {
            this.name = name
            this.notifyStr = ''
            this.startTime = (new Date).getTime()
            Object.assign(this,env)
            console.log(`${this.name} 开始运行：\n`)
        }
        isNode() {
            return "undefined" != typeof module && !!module.exports
        }
        isQuanX() {
            return "undefined" != typeof $task
        }
        isSurge() {
            return "undefined" != typeof $httpClient && "undefined" == typeof $loon
        }
        isLoon() {
            return "undefined" != typeof $loon
        }
        getdata(t) {
            let e = this.getval(t);
            if (/^@/.test(t)) {
                const[, s, i] = /^@(.*?)\.(.*?)$/.exec(t),
                r = s ? this.getval(s) : "";
                if (r)
                    try {
                        const t = JSON.parse(r);
                        e = t ? this.lodash_get(t, i, "") : e
                    } catch (t) {
                        e = ""
                    }
            }
            return e
        }
        setdata(t, e) {
            let s = !1;
            if (/^@/.test(e)) {
                const[, i, r] = /^@(.*?)\.(.*?)$/.exec(e),
                o = this.getval(i),
                h = i ? "null" === o ? null : o || "{}" : "{}";
                try {
                    const e = JSON.parse(h);
                    this.lodash_set(e, r, t),
                    s = this.setval(JSON.stringify(e), i)
                } catch (e) {
                    const o = {};
                    this.lodash_set(o, r, t),
                    s = this.setval(JSON.stringify(o), i)
                }
            }
            else {
                s = this.setval(t, e);
            }
            return s
        }
        getval(t) {
            return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null
        }
        setval(t, e) {
            return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null
        }
        send(m, t, e = (() => {})) {
            if(m != 'get' && m != 'post' && m != 'put' && m != 'delete') {
                console.log(`无效的http方法：${m}`);
                return;
            }
            if(m == 'get' && t.headers) {
                delete t.headers["Content-Type"];
                delete t.headers["Content-Length"];
            } else if(t.body && t.headers) {
                if(!t.headers["Content-Type"]) t.headers["Content-Type"] = "application/x-www-form-urlencoded";
            }
            if(this.isSurge() || this.isLoon()) {
                if(this.isSurge() && this.isNeedRewrite) {
                    t.headers = t.headers || {};
                    Object.assign(t.headers, {"X-Surge-Skip-Scripting": !1});
                }
                let conf = {
                    method: m,
                    url: t.url,
                    headers: t.headers,
                    timeout: t.timeout,
                    data: t.body
                };
                if(m == 'get') delete conf.data
                $axios(conf).then(t => {
                    const {
                        status: i,
                        request: q,
                        headers: r,
                        data: o
                    } = t;
                    e(null, q, {
                        statusCode: i,
                        headers: r,
                        body: o
                    });
                }).catch(err => console.log(err))
            } else if (this.isQuanX()) {
                t.method = m.toUpperCase(), this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
                        hints: !1
                    })),
                $task.fetch(t).then(t => {
                    const {
                        statusCode: i,
                        request: q,
                        headers: r,
                        body: o
                    } = t;
                    e(null, q, {
                        statusCode: i,
                        headers: r,
                        body: o
                    })
                }, t => e(t))
            } else if (this.isNode()) {
                this.got = this.got ? this.got : require("got");
                const {
                    url: s,
                    ...i
                } = t;
                
                let agent = null;
                if (t.proxy && typeof t.proxy === 'string') {
                    const { SocksProxyAgent } = require("socks-proxy-agent");
                    const { HttpsProxyAgent } = require("https-proxy-agent");
                    if (t.proxy.startsWith("socks://")) {
                        agent = new SocksProxyAgent(t.proxy);
                    } else if (t.proxy.startsWith("http://")) {
                        agent = new HttpsProxyAgent(t.proxy);
                    }
                }
                this.instance = this.got.extend({
                    followRedirect: false,
                    agent: agent ? { http: agent, https: agent } : undefined
                });

                this.instance[m](s, i).then(t => {
                    const {
                        statusCode: i,
                        request: q,
                        headers: r,
                        body: o
                    } = t;
                    e(null, q, {
                        statusCode: i,
                        headers: r,
                        body: o
                    })
                }, t => {
                    const {
                        message: s,
                        response: i
                    } = t;
                    e(s, i, i && i.body)
                })
            }
        }
        time(t) {
            let e = {
                "M+": (new Date).getMonth() + 1,
                "d+": (new Date).getDate(),
                "h+": (new Date).getHours(),
                "m+": (new Date).getMinutes(),
                "s+": (new Date).getSeconds(),
                "q+": Math.floor(((new Date).getMonth() + 3) / 3),
                S: (new Date).getMilliseconds()
            };
            /(y+)/.test(t) && (t = t.replace(RegExp.$1, ((new Date).getFullYear() + "").substr(4 - RegExp.$1.length)));
            for (let s in e)
                new RegExp("(" + s + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? e[s] : ("00" + e[s]).substr(("" + e[s]).length)));
            return t
        }
        async showmsg() {
            if(!this.notifyStr) return;
            let notifyBody = this.name + " 运行通知\n\n" + this.notifyStr
            if($.isNode()){
                var notify = require('./sendNotify');
                console.log('\n============== 推送 ==============')
                await notify.sendNotify(this.name, notifyBody);
            } else {
                this.msg(notifyBody);
            }
        }
        logAndNotify(str) {
            console.log(str)
            this.notifyStr += str
            this.notifyStr += '\n'
        }
        msg(e = t, s = "", i = "", r) {
            const o = t => {
                if (!t)
                    return t;
                if ("string" == typeof t)
                    return this.isLoon() ? t : this.isQuanX() ? {
                        "open-url": t
                    }
                 : this.isSurge() ? {
                    url: t
                }
                 : void 0;
                if ("object" == typeof t) {
                    if (this.isLoon()) {
                        let e = t.openUrl || t.url || t["open-url"],
                        s = t.mediaUrl || t["media-url"];
                        return {
                            openUrl: e,
                            mediaUrl: s
                        }
                    }
                    if (this.isQuanX()) {
                        let e = t["open-url"] || t.url || t.openUrl,
                        s = t["media-url"] || t.mediaUrl;
                        return {
                            "open-url": e,
                            "media-url": s
                        }
                    }
                    if (this.isSurge()) {
                        let e = t.url || t.openUrl || t["open-url"];
                        return {
                            url: e
                        }
                    }
                }
            };
            this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r)));
            let h = ["", "============== 系统通知 =============="];
            h.push(e),
            s && h.push(s),
            i && h.push(i),
            console.log(h.join("\n"))
        }
        getMin(a,b){
            return ((a<b) ? a : b)
        }
        getMax(a,b){
            return ((a<b) ? b : a)
        }
        padStr(num,length,padding='0') {
            let numStr = String(num)
            let numPad = (length>numStr.length) ? (length-numStr.length) : 0
            let retStr = ''
            for(let i=0; i<numPad; i++) {
                retStr += padding
            }
            retStr += numStr
            return retStr;
        }
        json2str(obj,c,encodeUrl=false) {
            let ret = []
            for(let keys of Object.keys(obj).sort()) {
                let v = obj[keys]
                if(v && encodeUrl) v = encodeURIComponent(v)
                ret.push(keys+'='+v)
            }
            return ret.join(c);
        }
        str2json(str, decodeUrl = false) {
            let ret = {};
            for(let item of str.split(strSplitor)) {
                if (!item) continue;
                let idx = item.indexOf('=');
                if (idx == -1) {
                    throw new Error(`格式错误: ${str}`);
                }
                let k = item.substr(0, idx);
                let v = item.substr(idx + 1);
                if (decodeUrl) v = decodeURIComponent(v);
                ret[k] = v;
            }
            return ret;
        }
        randomString(len,charset='abcdef0123456789') {
            let str = '';
            for (let i = 0; i < len; i++) {
                str += charset.charAt(Math.floor(Math.random()*charset.length));
            }
            return str;
        }
        randomList(a) {
            let idx = Math.floor(Math.random()*a.length)
            return a[idx]
        }
        wait(t) {
            return new Promise(e => setTimeout(e, t))
        }
        done(t = {}) {
            const e = (new Date).getTime(),
            s = (e - this.startTime) / 1e3;
            console.log(`\n${this.name} 运行结束，共运行了 ${s} 秒！`)
            if(this.isSurge() || this.isQuanX() || this.isLoon()) $done(t)
        }
    }(name,env)
}
