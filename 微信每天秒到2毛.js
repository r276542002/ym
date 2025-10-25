// 当前脚本来自于http://script.345yun.cn脚本库下载！
/**
 * #小程序://银愉壹品/V50Gu7uZZrQZKqq
 * 批量刷视频+自动提现+每天秒到2毛
 * 环境变量名称: AUTH
 * 环境变量值: 抓小程序的token值（多个账号的token值用&分隔）

* 另一个项目-支付宝每天秒到3毛
* 首先登录一键获取token: http://ks.345yun.cn/hb

* APP下载地址: https://s.wisediag.com/9fhaj145

* 或者: https://www.wisediag.com/app/download?shareCode=nc5zfdbd&isLogin=1

* 进APP登录后 点我的 绑定一下自己的支付宝

* 然后使用脚本库中的脚本自动到账3毛，也可以自己手动假分享获取3次抽奖次数
 */

const axios = require("axios");

// 控制变量：是否只提现
const onlyWithdraw = false; // true=只提现，false=刷视频+提现

// 读取多账号token
const tokens = process.env.AUTH ? process.env.AUTH.split("&") : [];
if (tokens.length === 0) {
  console.log("未配置 AUTH 环境变量");
  process.exit(0);
}

// 主流程
!(async () => {
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i].trim();
    if (!token) continue;
    console.log(`\n====== 开始账号${i + 1} ======\n`);
    try {
      if (onlyWithdraw) {
        await doWithdraw(token, i + 1);
      } else {
        const ids = await getVideoIds(token, i + 1);
        if (ids.length === 0) {
          console.log("⚠️ 无视频可刷");
        } else {
          await startVideoLoop(token, ids, i + 1);
        }
        await doWithdraw(token, i + 1);
      }
    } catch (e) {
      console.log(`账号${i + 1} 脚本异常: ${e.message}`);
    }
  }
})();

// 获取视频ID列表
async function getVideoIds(token, idx) {
  try {
    const res = await axios.get("https://n03.sentezhenxuan.com/api/video/list?page=1&limit=10&status=1&source=0&isXn=1", {
      headers: baseHeaders(token),
      timeout: 10000,
    });
    const obj = res.data;
    // console.log(`账号${idx} 原始返回:`, JSON.stringify(obj)); // 可调试
    let ids = Array.isArray(obj?.data)
      ? obj.data.map(item => item.id).filter(id => typeof id === "number")
      : [];
    console.log(`账号${idx} 获取到 ${ids.length} 个视频ID`);
    return ids;
  } catch (e) {
    console.log(`账号${idx} 获取视频ID失败: ${e.message}`);
    return [];
  }
}

// 刷视频
async function startVideoLoop(token, ids, idx) {
  for (let i = 0; i < ids.length; i++) {
    const vid = ids[i];
    const now = Date.now();
    const body = {
      vid: vid,
      startTime: now - 80000,
      endTime: now,
      baseVersion: "3.5.8",
      playMode: 0,
    };
    try {
      await axios.post("https://n05.sentezhenxuan.com/api/video/videoJob", body, {
        headers: baseHeaders(token),
        timeout: 10000,
      });
      console.log(`账号${idx} 视频${vid} 刷完 (${i + 1}/${ids.length})`);
    } catch (e) {
      console.log(`账号${idx} 视频${vid} 刷失败: ${e.message}`);
    }
    await sleep(800);
  }
}

// 提现
async function doWithdraw(token, idx) {
  try {
    const res = await axios.get("https://n03.sentezhenxuan.com/api/userTx", {
      headers: withdrawHeaders(token),
      timeout: 10000,
    });
    console.log(`账号${idx} 提现结果: ${res.data ? JSON.stringify(res.data) : res.status}`);
  } catch (e) {
    console.log(`账号${idx} 提现失败: ${e.message}`);
  }
}

// 公共Headers
function baseHeaders(token) {
  return {
    "Accept-Encoding": "gzip,compress,br,deflate",
    "Content-Type": "application/json",
    "Connection": "keep-alive",
    "Referer": "https://servicewechat.com/wx5b82dfe3747e533f/5/page-frame.html",
    "Host": "n05.sentezhenxuan.com",
    "Authori-zation": token, // 注意是 Authori-zation
    "User-Agent":
      "Mozilla/5.0 (iPhone; CPU iPhone OS 15_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.50 NetType/WIFI Language/zh_CN",
    "Cb-lang": "zh-CN",
    "Form-type": "routine-zhixiang",
  };
}
function withdrawHeaders(token) {
  return {
    "Accept": "*/*",
    "Accept-Language": "zh-CN,zh;q=0.9",
    "Accept-Encoding": "gzip,compress,br,deflate",
    "Connection": "keep-alive",
    "Content-Type": "application/json",
    "Referer": "https://servicewechat.com/wx5b82dfe3747e533f/5/page-frame.html",
    "Host": "n05.sentezhenxuan.com",
    "Authori-zation": token, // 注意是 Authori-zation
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.50(0x1800323d) NetType/WIFI Language/zh_CN",
    "Cb-lang": "zh-CN",
    "Form-type": "routine-zhixiang"
  };
}

// 工具函数
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
// 当前脚本来自于http://script.345yun.cn脚本库下载！