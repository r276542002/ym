/*
cron: 59 0,8,16 * * * 有道词典.js
目标:  有道词典  #自带提现，需提现绑定过微信

变量：捉包https://dict.youdao.com域名headers里的cookie

格式：export ydcd="ck=xxxx"  多账号换行隔开

*/

const $ = new Env("有道词典");
const md5 = require('md5-node');    //引入md5-node
let envSplitor = ['\n']  //多账号隔开方式，默认换行可自定义
let money = '1'        //默认提现额度

let httpResult, httpReq, httpResp
let userCookie = ($.isNode() ? process.env.ydcd : $.getdata('ydcd')) || '';
let userList = []
let userIdx = 0
let userCount = 0
let h = local_hours();
let m = local_minutes();
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
    
    async my() {
        try {
            let time = (new Date()).getTime()
            let key = `abtest=1&appVersion=9.2.38&client=android&dev_name=V1824A&imei=8dde6fb7-d0e9-442d-8786-4a73ad9872f9&keyfrom=mdict.9.2.38.android&keyid=dict-usertask-key&mid=10&model=V1824A&mysticTime=${time}&network=wifi&newImei=CQllOTFmODdiYTdjNjA1MWUxCXVua25vd24%3D&product=mdict&screen=1080x2400&vendor=vivo&yduuid=8dde6fb7-d0e9-442d-8786-4a73ad9872f9&key=ttfMFaa7tiPyAc3DanKeIMzEejm`
            let sign = md5(key)
            let url = `https://dict.youdao.com/dictusertask/withdraw/account?pointParam=dev_name,product,appVersion,keyfrom,mid,screen,keyid,mysticTime,network,abtest,yduuid,vendor,client,imei,model,newImei&sign=${sign}&keyid=dict-usertask-key&mysticTime=${time}&dev_name=V1824A&product=mdict&appVersion=9.2.38&keyfrom=mdict.9.2.38.android&mid=10&screen=1080x2400&ssid=&network=wifi&abtest=1&yduuid=8dde6fb7-d0e9-442d-8786-4a73ad9872f9&vendor=vivo&client=android&imei=8dde6fb7-d0e9-442d-8786-4a73ad9872f9&model=V1824A&newImei=CQllOTFmODdiYTdjNjA1MWUxCXVua25vd24%253D`
            let body = ``
            let ck = `${this.param.ck}`
            let urlObject = populateUrlObject(url,ck,body)
            await httpRequest('get',urlObject)
            let result = httpResult;
            if(!result) return
            if(result.code==0){
            $.logAndNotify(`账号[${this.name}]${result.data.wechatName} 可提现余额:${result.data.amount}元`)
            this.valid = true
            this.canRead = true
            if(h==0 && m < 1 &&result.data.amount >= 1){
            await this.pay();
            }
            }else{
            $.logAndNotify(`账号[${this.name}]${result.msg}`)
            }
        } catch(e) {
            //console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }
   
    async box() {
        try {
            let time = (new Date()).getTime()
            let key = `abtest=1&appVersion=9.2.38&client=android&dev_name=V1824A&imei=8dde6fb7-d0e9-442d-8786-4a73ad9872f9&keyfrom=mdict.9.2.38.android&keyid=dict-usertask-key&mid=10&model=V1824A&mysticTime=${time}&network=wifi&newImei=CQllOTFmODdiYTdjNjA1MWUxCXVua25vd24%3D&product=mdict&screen=1080x2400&vendor=vivo&yduuid=8dde6fb7-d0e9-442d-8786-4a73ad9872f9&key=ttfMFaa7tiPyAc3DanKeIMzEejm`
            let sign = md5(key)
            let url = `https://dict.youdao.com/dictusertask/lottery/info?pointParam=dev_name,product,appVersion,keyfrom,mid,screen,keyid,mysticTime,network,abtest,yduuid,vendor,client,imei,model,newImei&sign=${sign}&keyid=dict-usertask-key&mysticTime=${time}&dev_name=V1824A&product=mdict&appVersion=9.2.38&keyfrom=mdict.9.2.38.android&mid=10&screen=1080x2400&ssid=&network=wifi&abtest=1&yduuid=8dde6fb7-d0e9-442d-8786-4a73ad9872f9&vendor=vivo&client=android&imei=8dde6fb7-d0e9-442d-8786-4a73ad9872f9&model=V1824A&newImei=CQllOTFmODdiYTdjNjA1MWUxCXVua25vd24%253D`
            let body = ``
            let ck = `${this.param.ck}`
            let urlObject = populateUrlObject(url,ck,body)
            await httpRequest('get',urlObject)
            let result = httpResult;
            if(!result) return
            if(result.data.lotteryInfo.freeTimes==1){
            $.logAndNotify(`账号[${this.name}]盲盒还未开启`)
            await this.openbox();
            }else{
            $.logAndNotify(`账号[${this.name}]盲盒已开启`)
            }
        } catch(e) {
            //console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }
    
    async openbox() {
        try {
            let time = (new Date()).getTime()
            let key = `abtest=1&appVersion=9.2.38&client=android&dev_name=V1824A&imei=8dde6fb7-d0e9-442d-8786-4a73ad9872f9&keyfrom=mdict.9.2.38.android&keyid=dict-usertask-key&lotteryType=0&mid=10&model=V1824A&mysticTime=${time}&network=wifi&newImei=CQllOTFmODdiYTdjNjA1MWUxCXVua25vd24%3D&product=mdict&screen=1080x2400&vendor=vivo&yduuid=8dde6fb7-d0e9-442d-8786-4a73ad9872f9&key=ttfMFaa7tiPyAc3DanKeIMzEejm`
            let sign = md5(key)
            let url = `https://dict.youdao.com/dictusertask/lottery/execute?dev_name=V1824A&product=mdict&appVersion=9.2.38&keyfrom=mdict.9.2.38.android&mid=10&screen=1080x2400&ssid=&network=wifi&abtest=1&yduuid=8dde6fb7-d0e9-442d-8786-4a73ad9872f9&vendor=vivo&client=android&imei=8dde6fb7-d0e9-442d-8786-4a73ad9872f9&model=V1824A&newImei=CQllOTFmODdiYTdjNjA1MWUxCXVua25vd24%253D`
            let body = `pointParam=dev_name%2Cproduct%2CappVersion%2Ckeyfrom%2Cmid%2Cscreen%2Ckeyid%2CmysticTime%2ClotteryType%2Cnetwork%2Cabtest%2Cyduuid%2Cvendor%2Cclient%2Cimei%2Cmodel%2CnewImei&sign=${sign}&keyid=dict-usertask-key&mysticTime=${time}&lotteryType=0`
            let ck = `${this.param.ck}`
            let urlObject = populateUrlObject(url,ck,body)
            await httpRequest('post',urlObject)
            let result = httpResult;
            if(!result) return
            if(result.code==0){
            $.logAndNotify(`账号[${this.name}]开盲盒活动:${result.data.goldInfo.num}芝士币`)
            }else{
            $.logAndNotify(`账号[${this.name}]开盲盒活动:${result.msg}`)
            }
        } catch(e) {
            //console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }
    
    async sigin() {
        try {
            let time = (new Date()).getTime()
            let key = `abtest=1&appVersion=9.2.38&client=android&dev_name=V1824A&imei=8dde6fb7-d0e9-442d-8786-4a73ad9872f9&keyfrom=mdict.9.2.38.android&keyid=dict-usertask-key&mid=10&missionId=8888&model=V1824A&mysticTime=${time}&network=unknown&newImei=CQllOTFmODdiYTdjNjA1MWUxCXVua25vd24%3D&product=mdict&screen=1080x2400&vendor=vivo&yduuid=8dde6fb7-d0e9-442d-8786-4a73ad9872f9&key=ttfMFaa7tiPyAc3DanKeIMzEejm`
            let sign = md5(key)
            let url = `https://dict.youdao.com/dictusertask/cheese/collect?pointParam=dev_name,product,appVersion,missionId,keyfrom,mid,screen,keyid,mysticTime,network,abtest,yduuid,vendor,client,imei,model,newImei&sign=${sign}&keyid=dict-usertask-key&missionId=8888&mysticTime=${time}&dev_name=V1824A&product=mdict&appVersion=9.2.38&keyfrom=mdict.9.2.38.android&mid=10&screen=1080x2400&ssid=&network=unknown&abtest=1&yduuid=8dde6fb7-d0e9-442d-8786-4a73ad9872f9&vendor=vivo&client=android&imei=8dde6fb7-d0e9-442d-8786-4a73ad9872f9&model=V1824A&newImei=CQllOTFmODdiYTdjNjA1MWUxCXVua25vd24%253D`
            let body = ``
            let ck = `${this.param.ck}`
            let urlObject = populateUrlObject(url,ck,body)
            await httpRequest('get',urlObject)
            let result = httpResult;
            if(!result) return
            if(result.code==0){
            $.logAndNotify(`账号[${this.name}]签到成功`)
            }else{
            $.logAndNotify(`账号[${this.name}]今日已签到`)
            }
        } catch(e) {
            //console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }
    
    async hb() {
        try {
            let time = (new Date()).getTime()
            let key = `abtest=1&appVersion=9.2.38&client=android&dev_name=V1824A&imei=8dde6fb7-d0e9-442d-8786-4a73ad9872f9&isFinished=1&keyfrom=mdict.9.2.38.android&keyid=dict-usertask-key&mid=10&model=V1824A&mysticTime=${time}&network=wifi&newImei=CQllOTFmODdiYTdjNjA1MWUxCXVua25vd24%3D&product=mdict&screen=1080x2400&vendor=vivo&yduuid=8dde6fb7-d0e9-442d-8786-4a73ad9872f9&key=ttfMFaa7tiPyAc3DanKeIMzEejm`
            let sign = md5(key)
            let url = `https://dict.youdao.com/dictusertask/withdraw/redpacket?pointParam=dev_name,product,appVersion,keyfrom,mid,screen,keyid,mysticTime,isFinished,network,abtest,yduuid,vendor,client,imei,model,newImei&sign=${sign}&keyid=dict-usertask-key&mysticTime=${time}&isFinished=1&dev_name=V1824A&product=mdict&appVersion=9.2.38&keyfrom=mdict.9.2.38.android&mid=10&screen=1080x2400&ssid=&network=wifi&abtest=1&yduuid=8dde6fb7-d0e9-442d-8786-4a73ad9872f9&vendor=vivo&client=android&imei=8dde6fb7-d0e9-442d-8786-4a73ad9872f9&model=V1824A&newImei=CQllOTFmODdiYTdjNjA1MWUxCXVua25vd24%253D`
            let body = ``
            let ck = `${this.param.ck}`
            let urlObject = populateUrlObject(url,ck,body)
            await httpRequest('get',urlObject)
            let result = httpResult;
            if(!result) return
            if(result.data.getRedPacketTimes <= 3){
            $.logAndNotify(`账号[${this.name}]开红包获得:${result.data.redPacketAmount}元`)
            await $.wait(30000);
            await this.hb();
            }else{
            $.logAndNotify(`账号[${this.name}]红包已开完`)
            }
        } catch(e) {
            //console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }
    
    async pay() {
        try {
            let time = (new Date()).getTime()
            let key = `abtest=1&appVersion=9.2.38&client=android&dev_name=V1824A&imei=8dde6fb7-d0e9-442d-8786-4a73ad9872f9&keyfrom=mdict.9.2.38.android&keyid=dict-usertask-key&mid=10&model=V1824A&money=${money}&mysticTime=${time}&network=unknown&newImei=CQllOTFmODdiYTdjNjA1MWUxCXVua25vd24%3D&product=mdict&screen=1080x2400&vendor=vivo&yduuid=8dde6fb7-d0e9-442d-8786-4a73ad9872f9&key=ttfMFaa7tiPyAc3DanKeIMzEejm`
            let sign = md5(key)
            let url = `https://dict.youdao.com/dictusertask/withdraw/execute?pointParam=dev_name,product,appVersion,keyfrom,mid,screen,keyid,mysticTime,network,abtest,yduuid,money,vendor,client,imei,model,newImei&sign=${sign}&keyid=dict-usertask-key&mysticTime=${time}&money=${money}&dev_name=V1824A&product=mdict&appVersion=9.2.38&keyfrom=mdict.9.2.38.android&mid=10&screen=1080x2400&ssid=&network=unknown&abtest=1&yduuid=8dde6fb7-d0e9-442d-8786-4a73ad9872f9&vendor=vivo&client=android&imei=8dde6fb7-d0e9-442d-8786-4a73ad9872f9&model=V1824A&newImei=CQllOTFmODdiYTdjNjA1MWUxCXVua25vd24%253D`
            let body = ``
            let ck = `${this.param.ck}`
            let urlObject = populateUrlObject(url,ck,body)
            await httpRequest('get',urlObject)
            let result = httpResult;
            if(!result) return
            if(result.code==0){
            $.logAndNotify(`账号[${this.name}提现成功:剩余${result.data.account}元`)
            }if(result.code==1007){
            $.logAndNotify(`账号[${this.name}]${result.msg}`)
            if(m < 1){
            await $.wait(1000);
            await this.pay();
            }
            }else{
            $.logAndNotify(`账号[${this.name}]${result.msg}`)
            }
        } catch(e) {
            //console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }





}!(async () => {
    if (typeof $request !== "undefined") {
        //await GetRewrite()
    }else {
        if(!(await checkEnv())) return;
        
        let taskall = []
        let validList = userList.filter(x => x.ckValid)
        
        $.logAndNotify(`\n通知区：\n变得是霓裳 不变的是初心 不是谁都生来优秀 但我有颗执着向上的心️`)
        
        if(validList.length > 0) {
            $.logAndNotify('\n-------------- 账号检测 --------------')
            taskall = []
            for(let user of validList) {
                taskall.push(user.my())
            }
            await Promise.all(taskall)
            validList = validList.filter(x => x.valid)
            
        if(validList.length > 0) {
                $.logAndNotify('\n-------------- 每日任务 --------------')
                taskall = []
                for(let user of validList.filter(x => x.canRead)) {
                   taskall.push(user.sigin())
                   await $.wait(5000);
                   taskall.push(user.box())
                   await $.wait(5000);
                   taskall.push(user.hb())
                }
                await Promise.all(taskall)
            }
        }
        
        await $.showmsg();
    }
})()



.catch((e) => console.log(e))
.finally(() => $.done())

///////////////////////////////////////////////////////////////////
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
        console.log('未找到CK 请阅读脚本说明')
        return;
    }
    
    console.log(`共找到${userCount}个账号`)
    return true
}
////////////////////////////////////////////////////////////////////
function populateUrlObject(url,ck,body=''){
    let host = url.replace('//','/').split('/')[1]
    let urlObject = {
        url: url,
        headers: {
            'Host': host,
            'Cookie': ck,
            'User-Agent': 'youdao_dict_android'
        },
        timeout: 5000,
    }
    if(body) {
        urlObject.body = body
        urlObject.headers['content-type'] =  'application/x-www-form-urlencoded;charset=utf-8'
        urlObject.headers['Content-Length'] = urlObject.body ? urlObject.body.length : 0
    }
    return urlObject;
}

async function httpRequest(method,url) {
    httpResult = null, httpReq = null, httpResp = null;
    return new Promise((resolve) => {
        $.send(method, url, async (err, req, resp) => {
            try {
                httpReq = req;
                httpResp = resp;
                if (err) {
                    httpResult = JSON.parse(req.body);
                } else {
                    if(resp.body) {
                        if(typeof resp.body == "object") {
                            httpResult = resp.body;
                        } else {
                            try {
                                httpResult = JSON.parse(resp.body);
                            } catch (e) {
                                httpResult = resp.body;
                            }
                        }
                    }
                }
            } catch (e) {
                console.log(e);
            } finally {
                resolve();
            }
        });
    });
}





////////////////////////////////////////////////////////////////////
function local_hours() {
	 let myDate = new Date();
	 let h = myDate.getHours();
	 return h;
 }
function local_minutes() {
	 let myDate = new Date();
	 let m = myDate.getMinutes();
	 return m;
 }
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
                delete t.headers["content-type"];
                delete t.headers["Content-Length"];
            } else if(t.body && t.headers) {
                if(!t.headers["content-type"]) t.headers["content-type"] = "application/json";
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
                this.instance = this.got.extend({
                    followRedirect: false
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
        str2json(str,decodeUrl=false) {
            let ret = {}
            for(let item of str.split('&')) {
                if(!item) continue;
                let idx = item.indexOf('=')
                if(idx == -1) continue;
                let k = item.substr(0,idx)
                let v = item.substr(idx+1)
                if(decodeUrl) v = decodeURIComponent(v)
                ret[k] = v
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