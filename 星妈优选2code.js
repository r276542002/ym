/*
青龙脚本：星妈会自动任务 + 自动获取 cuk（通用 code_url）
作者：ChatGPT 整合最终版

环境变量：
soy_wxid_data   → 多个 wxid，换行分隔
soy_codeurl_data → 通用 code 获取地址

流程：
wxid → 请求 code → 请求 autologin → 得到 cuk →
构造 XMH_COOKIE 内容执行星妈会任务
*/

const axios = require("axios");
const notify = require('./sendNotify');

// =======================
//  工具
// =======================
function sleep(ms){ return new Promise(res => setTimeout(res, ms)); }

function parseEnvList(name) {
    const raw = process.env[name] || "";
    return raw.split("\n").map(x => x.trim()).filter(x => x);
}

function parseEnvStr(name) {
    return (process.env[name] || "").trim();
}

// =======================
// 第1步：读取环境变量
// =======================
const wxidList = parseEnvList("soy_wxid_data");
const codeUrl = parseEnvStr("soy_codeurl_data");

if (wxidList.length === 0 || !codeUrl) {
    console.log("❌ 环境变量为空，请检查 soy_wxid_data 或 soy_codeurl_data");
    process.exit(0);
}

console.log(`🟢 读取到 ${wxidList.length} 个账号`);
console.log(`🟢 通用 code_url: ${codeUrl}`);

// =======================
// 第2步：获取 code
// =======================
async function getCode(wxid) {
    try {
        const body = { appid: "wxc83b55d61c7fc51d", wxid };
        const res = await axios.post(codeUrl, body, { timeout: 10000 });
        if (res.data?.status && res.data?.Data?.code) {
            console.log(`⭐ 获取 code 成功: ${wxid}`);
            return res.data.Data.code;
        }
    } catch (e) {
        console.log(`❌ 获取 code 失败：${wxid} →`, e.message);
    }
    return null;
}

// =======================
// 第3步：code → cuk
// =======================
async function getCuk(code){
    const api = `https://momclub.feihe.com/pmall/c/login/autologin?code=${code}`;
    try {
        const res = await axios.get(api, {
            headers: {
                "cuk": "undefined",
                "User-Agent": "Mozilla/5.0",
                "Content-Type": "application/json"
            },
            timeout: 10000
        });
        if (res.data?.code === "000000") {
            const cuk = res.data.data.cuk;
            console.log(`🎉 cuk 获取成功`);
            return cuk;
        }
    } catch (e) {
        console.log(`❌ cuk 获取失败：`, e.message);
    }
    return null;
}

// =======================
// 构造最终 XMH_COOKIE 列表
// =======================
async function buildCookieList() {
    const result = [];
    for (let i=0;i<wxidList.length;i++){
        const wxid = wxidList[i];
        console.log(`\n========== 账号 ${i+1} ==========`);

        const code = await getCode(wxid);
        if (!code) continue;

        await sleep(1500);

        const cuk = await getCuk(code);
        if (!cuk) continue;

        result.push(`${cuk}#${wxid}`);
        await sleep(2000);
    }
    return result;
}

// =======================
// 星妈会任务类
// =======================
const API_HOST = "https://momclub.feihe.com";

function init() {
    return {
        isNode: () => true,
        http: axios,
        wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
        log: console.log
    };
}
const $ = init();

class XingMaHui {
    constructor(cuk, index, remark='') {
        this.cuk = cuk;
        this.index = index;
        this.remark = remark;
        this.accountName = remark ? `账号${index}(${remark})` : `账号${index}`;
        this.creditsEarned = 0;
        this.taskResults = [];
        this.userInfo = null;
        this.initialPoints = 0;
        this.finalPoints = 0;
    }

    getHeaders(){
        return {
            'Host': 'momclub.feihe.com',
            'cuk': this.cuk,
            'User-Agent': 'Mozilla/5.0',
            'Content-Type': 'application/json'
        };
    }

    async request(url, method="GET", data=null){
        try {
            const config = { headers: this.getHeaders(), timeout: 10000 };
            let res = null;
            if (method === "GET") {
                res = await $.http.get(url, config);
            } else {
                res = await $.http.post(url, data, config);
            }
            return res.data;
        } catch (e) {
            console.log("❌ 请求异常:", e.message);
            return null;
        }
    }

    async getUserInfo(){
        const url = `${API_HOST}/pmall/c/user/memberInfo`;
        const r = await this.request(url);
        if (r?.code === "000000") {
            this.userInfo = r.data;
            return r.data;
        }
        return null;
    }

    async getTaskList(){
        const url = `${API_HOST}/pmall/c/activity/todo/list?mockTime=${Date.now()}`;
        const r = await this.request(url);
        if (r?.code === "000000") return r.data;
        return null;
    }

    async queryTaskCredits(name){
        const url = `${API_HOST}/pmall/c/activity/todo/queryTodoResult`;
        const r = await this.request(url);
        if (r?.code === "000000") {
            const t = r.data.find(x => x.taskName === name);
            return t?.actualCredits || 0;
        }
        return 0;
    }

    async doCheckIn(id, name){
        const url = `${API_HOST}/pmall/c/activity/todo/checkIn`;
        const data = { activityId:id, mockTime: Date.now() };
        console.log(`➡ 签到：${name}`);
        const r = await this.request(url, "POST", data);
        if (r?.code === "000000") {
            const c = r.data.credits || 1;
            this.creditsEarned += c;
            this.taskResults.push(`签到 ${name} +${c}`);
        }
    }

    async doNormalTask(id, name){
        console.log(`➡ 普通任务：${name}`);
        const r1 = await this.request(`${API_HOST}/pmall/c/activity/todo/receive`, "POST",
            {activityId:id, mockTime:Date.now()}
        );
        if (r1?.code !== "000000") return;

        await $.wait(1000);

        const r2 = await this.request(`${API_HOST}/pmall/c/activity/todo/complete`, "POST",
            {activityId:id, mockTime:Date.now()}
        );
        if (r2?.code !== "000000") return;

        await $.wait(1000);
        const credits = await this.queryTaskCredits(name);
        this.creditsEarned += credits;
        this.taskResults.push(`${name} +${credits}`);
    }

    async doAllTasks(){
        console.log(`\n⭐ 开始执行 ${this.accountName}`);

        await this.getUserInfo();
        if (this.userInfo) this.initialPoints = this.userInfo.points;

        const list = await this.getTaskList();
        if (!list) return;

        if (list.checkInTodo) await this.doCheckIn(list.checkInTodo.id, list.checkInTodo.name);

        if (list.taskTodo) {
            for (const t of list.taskTodo) {
                const type = t.taskTodoExtra?.type;
                if (type === "AddQw" || type === "FirstOrder") continue;
                await this.doNormalTask(t.id, t.name);
            }
        }

        await this.getUserInfo();
        if (this.userInfo) this.finalPoints = this.userInfo.points;
    }

    getResults(){
        return {
            account: this.accountName,
            initial: this.initialPoints,
            final: this.finalPoints,
            gained: this.creditsEarned,
            tasks: this.taskResults,
            user: this.userInfo
        };
    }
}

// =======================
// 主执行
// =======================
(async () => {
    console.log("\n🚀 开始获取 cuk ...\n");

    const cookieList = await buildCookieList();
    if (cookieList.length === 0) {
        console.log("❌ 无法获取任何 cuk，退出");
        return;
    }

    console.log(`\n⭐ 总共获取 ${cookieList.length} 个 cuk\n`);

    const allAccounts = [];
    let totalCredits = 0;

    for (let i=0;i<cookieList.length;i++){
        const [cuk, remark] = cookieList[i].split("#");
        const acc = new XingMaHui(cuk, i+1, remark);
        allAccounts.push(acc);
    }

    console.log("🚀 开始执行星妈会任务...\n");

    for (const acc of allAccounts){
        await acc.doAllTasks();
        totalCredits += acc.creditsEarned;
        await sleep(3000);
    }

    // 汇总结果
    let msg = "🎉 星妈会任务完成\n\n";
    for (const acc of allAccounts){
        const r = acc.getResults();
        msg += `📍 ${r.account}
手机号：${r.user?.mobile || "未知"}
初始积分：${r.initial}
最终积分：${r.final}
本次获得：${r.gained}

任务：
${r.tasks.map(t=>" - "+t).join("\n")}

-------------------\n`;
    }
    msg += `\n⭐ 今日总积分：${totalCredits}`;

    console.log(msg);
    await notify.sendNotify("星妈会任务完成", msg);

})();
