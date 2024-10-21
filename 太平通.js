/*
APP：太平通
抓ecustomer.cntaiping.com域名下的随便一个x-ac-token-ticket
cron: 14 6,18 * * * 太平通.js

*/
const axios = require('axios');
let request = require("request");
const $ = new Env('太平通');

let tpthd = ($.isNode() ? process.env.tpthd : $.getdata("tpthd")) || ``
let tpthdArr = [];
var timestamp = Math.round(new Date().getTime() / 1000).toString();


request = request.defaults({
  jar: true
});

const {
  log
} = console;
let msg = '';
const debug = 0; //0为关闭调试，1为打开调试,默认为0
const Notify = 0; //0为关闭通知,1为打开通知,默认为1

const plugInId = '701b3099297148a8ba979ad9c982b561'  //插件id
let news = []  //文章列表

!(async () => {
  if (typeof $request !== "undefined") {
    await GetRewrite();
  } else {
    if (!(await Envs()))
      return;
    else {

      log(`\n\n=============================================    \n脚本执行 - 北京时间(UTC+8)：${new Date(
        new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000 +
        8 * 60 * 60 * 1000).toLocaleString()} \n=============================================\n`);
      log(`\n=================== 微信公众号：柠檬Plus ===================\n`)
      log(`\n=================== 共找到 ${tpthdArr.length} 个账号 ===================`)
      if (debug) {
        log(`【debug】 这是你的全部账号数组:\n ${tpthdArr}`);
      }
      for (let index = 0; index < tpthdArr.length; index++) {

        let num = index + 1
        log(`\n==== 开始【第 ${num} 个账号】====\n`)
        tpthd = tpthdArr[index];

        for (let k = 1; k < 5; k++) {
          await getNewsList(k)
        }

        await sign()  //签到

        await share()  //分享

        await receiveShare()  //领取分享

        for (let i = 0; i < news.length; i++) {
          const element = news[i];
          console.log('开始阅读', element.cell[0][0].title);
          await ready(element.cell[0][0].contentId)
          await $.wait(randomInt(5000, 5200))
          await ready4(element.cell[0][0].contentId)
          // await getGold()
          // return
        }
        // await getGold()

      }

    }
  }
})()
  .catch((e) => log(e))
  .finally(() => $.done())


// 推送信息
async function queayMsg () {
  await getTaskList()
  await init(tpthd)
  uinfo.phone = uinfo.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  msg += `\n【${uinfo.phone}】 当前蛋白值:   ${uinfo.extInfo.data.proteinBalance}   当前积分:   ${uinfo.extInfo.data.pointsBalance}\n`
  msg += `========任务完成概况========\n`
  taskListArr.forEach(element => {
    msg += `${element.taskName} ==== ${element.taskFinishNumber} / ${element.taskStage}\n`
  });
  log(`当前蛋白值:   ${uinfo.extInfo.data.proteinBalance}`)
  log(`当前积分:   ${uinfo.extInfo.data.pointsBalance}`)
}


// 阅读
async function ready (item) {
  return new Promise((resolve) => {
    var options = {
      method: "post",
      url: `https://ecustomer.cntaiping.com/informationms/app/v2/article/web/detail`,
      headers: {
        "Host": "ecustomer.cntaiping.com",
        "Connection": "keep-alive",
        "x-ac-mc-type": "gateway.user",
        "User-Agent": getRandomUA(),
        "content-type": "application/json",
        "Accept-Encoding": "gzip,compress,br,deflate",
        "accept": "application/json",
        "Referer": "hhttps://ecustomercdn.itaiping.com/",
        "Origin": "https://ecustomercdn.itaiping.com",
        "x-ac-token-ticket": tpthd
      },
      // data: { "articleId": "f3f28ac6955f43189566a6a6e2cd9aba", "source": "TPT" },
      data: { "articleId": item, "source": "TPT", "detailUrl": `https://ecustomercdn.itaiping.com/static/newscontent/#/info?articleId=${item}&source=TPT&x_utmId=10013&x_businesskey=articleId`, "deviceId": "", "version": "V2" }


    };
    if (debug) {
      log(`\n【debug】=============== 这是  请求 url =============== `);
      log(JSON.stringify(options));
    }
    axios.request(options).then(async function (response) {
      try {
        if (debug) {
          log(`\n\n【debug】=============== 这是 返回data ============== `);
          log(JSON.stringify(response.data));
        }
        const data = response.data
        if (data.code == '0000') {
          log(`阅读成功`)
        }
        else
          log(data.msg)
      } catch (e) {
        log(`异常：${e}，原因：${e.msg} `)
      }
    }).catch(function (error) {
      console.error(error);
    }).then(res => {
      resolve()
    })
  })

}

// 阅读  可有可无
async function ready2 (item) {
  return new Promise((resolve) => {
    var options = {
      method: "post",
      url: `https://ecustomer.cntaiping.com/informationms/app/v2/share/getShareInfo`,
      headers: {
        "Host": "ecustomer.cntaiping.com",
        "Connection": "keep-alive",
        "x-ac-mc-type": "gateway.user",
        "User-Agent": "Mozilla/5.0 (Linux; Android 13; Mi 10 Pro Build/TKQ1.221114.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/108.0.5359.128 Mobile Safari/537.36;yuangongejia#android#kehutong;webank/h5face;webank/1.0;netType:NETWORK_WIFI;appVersion:338;packageName:com.cntaiping.tpapp",
        "content-type": "application/json",
        "Accept-Encoding": "gzip,compress,br,deflate",
        "accept": "application/json",
        "Referer": "hhttps://ecustomercdn.itaiping.com/",
        "Origin": "https://ecustomercdn.itaiping.com",
        "x-ac-token-ticket": tpthd
      },
      // data: { "articleId": "f3f28ac6955f43189566a6a6e2cd9aba", "source": "TPT" },
      data: { "articleId": "96fa4060f8e04df6897aca28c57ff8e9", "source": "TPT", "shareImage": "", "x_agentcode": "3061031250032205824", "x_utmId": "10013", "share_userid": "", "userId": "", "shareFlag": false, "enviroment": "1", "sp_code": "TPT" }


    };
    if (debug) {
      log(`\n【debug】=============== 这是  请求 url =============== `);
      log(JSON.stringify(options));
    }
    axios.request(options).then(async function (response) {
      try {
        if (debug) {
          log(`\n\n【debug】=============== 这是 返回data ============== `);
          log(JSON.stringify(response.data));
        }
        const data = response.data
        console.log(data);
      } catch (e) {
        log(`异常：${e}，原因：${e.msg} `)
      }
    }).catch(function (error) {
      console.error(error);
    }).then(res => {
      resolve()
    })
  })

}

// 阅读    可有可无
async function ready3 (item) {
  return new Promise((resolve) => {
    var options = {
      method: "get",
      url: `https://ecustomer.cntaiping.com/informationms/app/v2/article/advertDetail?articleId=96fa4060f8e04df6897aca28c57ff8e9`,
      headers: {
        "Host": "ecustomer.cntaiping.com",
        "Connection": "keep-alive",
        "x-ac-mc-type": "gateway.user",
        "User-Agent": "Mozilla/5.0 (Linux; Android 13; Mi 10 Pro Build/TKQ1.221114.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/108.0.5359.128 Mobile Safari/537.36;yuangongejia#android#kehutong;webank/h5face;webank/1.0;netType:NETWORK_WIFI;appVersion:338;packageName:com.cntaiping.tpapp",
        "content-type": "application/json",
        "Accept-Encoding": "gzip,compress,br,deflate",
        "accept": "application/json",
        "Referer": "hhttps://ecustomercdn.itaiping.com/",
        "Origin": "https://ecustomercdn.itaiping.com",
        "x-ac-token-ticket": tpthd
      },
      // data: { "articleId": "f3f28ac6955f43189566a6a6e2cd9aba", "source": "TPT" },
      // data: { "articleId": "f3f28ac6955f43189566a6a6e2cd9aba", "source": "TPT", "detailUrl": "https://ecustomercdn.itaiping.com/static/newscontent/#/info?articleId=8171df484519468588cf30c2c4c7f447&source=TPT&x_utmId=10013&x_businesskey=articleId", "deviceId": "", "version": "V2" }


    };
    if (debug) {
      log(`\n【debug】=============== 这是  请求 url =============== `);
      log(JSON.stringify(options));
    }
    axios.request(options).then(async function (response) {
      try {
        if (debug) {
          log(`\n\n【debug】=============== 这是 返回data ============== `);
          log(JSON.stringify(response.data));
        }
        const data = response.data
        console.log(data);
      } catch (e) {
        log(`异常：${e}，原因：${e.msg} `)
      }
    }).catch(function (error) {
      console.error(error);
    }).then(res => {
      resolve()
    })
  })

}

// 获取文章列表
async function getNewsList (i) {
  return new Promise((resolve) => {
    var options = {
      method: "post",
      url: `https://ecustomer.cntaiping.com/informationms/app/config/get/${i}`,
      headers: {
        "Host": "ecustomer.cntaiping.com",
        "Connection": "keep-alive",
        "x-ac-mc-type": "gateway.user",
        "User-Agent": getRandomUA(),
        "content-type": "application/json",
        "Accept-Encoding": "gzip,compress,br,deflate",
        "accept": "application/json",
        "Referer": "hhttps://ecustomercdn.itaiping.com/",
        "Origin": "https://ecustomercdn.itaiping.com",
        "x-ac-token-ticket": ""
      },
      data: {
        "city": "1",
        "pageSize": 10,
        "type": "GENERAL_PLUGIN",
        "trackDesc": "赚金币任务",
        "plugInId": plugInId
      }


    };
    if (debug) {
      log(`\n【debug】=============== 这是  请求 url =============== `);
      log(JSON.stringify(options));
    }
    axios.request(options).then(async function (response) {
      try {
        if (debug) {
          log(`\n\n【debug】=============== 这是 返回data ============== `);
          log(JSON.stringify(response.data));
        }
        const data = response.data
        if (data.code == '0000') {
          data.data.forEach(element => {
            news.push(element)
          });
        }
      } catch (e) {
        log(`异常：${e}，原因：${e.msg} `)
      }
    }).catch(function (error) {
      console.error(error);
    }).then(res => {
      resolve()
    })
  })

}

// 阅读获取金币  重要
async function ready4 (item) {
  return new Promise((resolve) => {
    var options = {
      method: "post",
      url: `https://ecustomer.cntaiping.com/informationms/app/v2/read/gold`,
      headers: {
        "Host": "ecustomer.cntaiping.com",
        "Connection": "keep-alive",
        "x-ac-mc-type": "gateway.user",
        "User-Agent": getRandomUA(),
        "content-type": "application/json",
        "Accept-Encoding": "gzip,compress,br,deflate",
        "accept": "application/json",
        "Referer": "hhttps://ecustomercdn.itaiping.com/",
        "Origin": "https://ecustomercdn.itaiping.com",
        "x-ac-token-ticket": tpthd
      },
      // data: { "articleId": "f3f28ac6955f43189566a6a6e2cd9aba", "source": "TPT" },
      data: { "articleId": item, "source": "TPT" }


    };
    if (debug) {
      log(`\n【debug】=============== 这是  请求 url =============== `);
      log(JSON.stringify(options));
    }
    axios.request(options).then(async function (response) {
      try {
        if (debug) {
          log(`\n\n【debug】=============== 这是 返回data ============== `);
          log(JSON.stringify(response.data));
        }
        const data = response.data
        if (data.code == '0000') {
          log(`领取金币成功`)
        }
        else
          log(data.msg)
      } catch (e) {
        log(`异常：${e}，原因：${e.msg} `)
      }
    }).catch(function (error) {
      console.error(error);
    }).then(res => {
      resolve()
    })
  })

}

// share
async function share () {
  return new Promise((resolve) => {
    var options = {
      method: "post",
      url: `https://ecustomer.cntaiping.com/campaignsms/goldParty/task/finish`,
      headers: {
        "Host": "ecustomer.cntaiping.com",
        "Connection": "keep-alive",
        "x-ac-mc-type": "gateway.user",
        "User-Agent": getRandomUA(),
        "content-type": "application/json",
        "Accept-Encoding": "gzip,compress,br,deflate",
        "accept": "application/json",
        "Referer": "hhttps://ecustomercdn.itaiping.com/",
        "Origin": "https://ecustomercdn.itaiping.com",
        "x-ac-token-ticket": tpthd
      },
      data: { "taskIds": [23] }


    };
    if (debug) {
      log(`\n【debug】=============== 这是  请求 url =============== `);
      log(JSON.stringify(options));
    }
    axios.request(options).then(async function (response) {
      try {
        if (debug) {
          log(`\n\n【debug】=============== 这是 返回data ============== `);
          log(JSON.stringify(response.data));
        }
        const data = response.data
        if (data.code == "0000")
          log(`分享成功`)
        else
          log(data.msg)

      } catch (e) {
        log(`异常：${e}，原因：${e.msg} `)
      }
    }).catch(function (error) {
      console.error(error);
    }).then(res => {
      resolve()
    })
  })

}

// 签到
async function sign () {
  return new Promise((resolve) => {
    var options = {
      method: "post",
      url: `https://ecustomer.cntaiping.com/campaignsms/couponAndsign`,
      headers: {
        "Host": "ecustomer.cntaiping.com",
        "Connection": "keep-alive",
        "x-ac-mc-type": "gateway.user",
        "User-Agent": "Mozilla/5.0 (Linux; Android 13; Mi 10 Pro Build/TKQ1.221114.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/108.0.5359.128 Mobile Safari/537.36;yuangongejia#android#kehutong;webank/h5face;webank/1.0;netType:NETWORK_WIFI;appVersion:338;packageName:com.cntaiping.tpapp",
        "content-type": "application/json",
        "Accept-Encoding": "gzip,compress,br,deflate",
        "accept": "application/json",
        "Referer": "hhttps://ecustomercdn.itaiping.com/",
        "Origin": "https://ecustomercdn.itaiping.com",
        "x-ac-token-ticket": tpthd
      },
      data: {}


    };
    if (debug) {
      log(`\n【debug】=============== 这是  请求 url =============== `);
      log(JSON.stringify(options));
    }
    axios.request(options).then(async function (response) {
      try {
        if (debug) {
          log(`\n\n【debug】=============== 这是 返回data ============== `);
          log(JSON.stringify(response.data));
        }
        const data = response.data
        if (data.code == '0000') {
          log('当前有' + data.data.dailySignRsp.integral + '个金币')
        }
        else
          log(data.msg)

      } catch (e) {
        log(`异常：${e}，原因：${e.msg} `)
      }
    }).catch(function (error) {
      console.error(error);
    }).then(res => {
      resolve()
    })
  })

}

// 领取分享
async function receiveShare () {
  return new Promise((resolve) => {
    var options = {
      method: "post",
      url: `https://ecustomer.cntaiping.com/campaignsms/goldParty/goldCoin/add`,
      headers: {
        "Host": "ecustomer.cntaiping.com",
        "Connection": "keep-alive",
        "x-ac-mc-type": "gateway.user",
        "User-Agent": getRandomUA(),
        "content-type": "application/json",
        "Accept-Encoding": "gzip,compress,br,deflate",
        "accept": "application/json",
        "Referer": "hhttps://ecustomercdn.itaiping.com/",
        "Origin": "https://ecustomercdn.itaiping.com",
        "x-ac-token-ticket": tpthd
      },
      data: { "taskIds": [23] }


    };
    if (debug) {
      log(`\n【debug】=============== 这是  请求 url =============== `);
      log(JSON.stringify(options));
    }
    axios.request(options).then(async function (response) {
      try {
        if (debug) {
          log(`\n\n【debug】=============== 这是 返回data ============== `);
          log(JSON.stringify(response.data));
        }
        const data = response.data
        if (data.code == '0000') {

          log(`领取分享成功`)
        }
        else
          log(data.msg)

      } catch (e) {
        log(`异常：${e}，原因：${e.msg} `)
      }
    }).catch(function (error) {
      console.error(error);
    }).then(res => {
      resolve()
    })
  })

}


// 领取所有金币
async function getGold () {
  return new Promise((resolve) => {
    var options = {
      method: "post",
      url: `https://ecustomer.cntaiping.com/campaignsms/coinBubble/getAllCoins`,
      headers: {
        "Host": "ecustomer.cntaiping.com",
        "Connection": "keep-alive",
        "x-ac-mc-type": "gateway.user",
        "x-ac-channel-id": "KHT",
        // "x-ac-black-box": "tWPVX1694800093IiQbKgTMwewe",
        "Accept": "application/json;charset=UTF-8",
        "User-Agent": getRandomUA(),
        "x-ac-token-ticket": tpthd
      },
      data: {}


    };
    if (debug) {
      log(`\n【debug】=============== 这是  请求 url =============== `);
      log(JSON.stringify(options));
    }
    axios.request(options).then(async function (response) {
      try {
        if (debug) {
          log(`\n\n【debug】=============== 这是 返回data ============== `);
          log(JSON.stringify(response.data));
        }
        const data = response.data
        console.log(data);

      } catch (e) {
        log(`异常：${e}，原因：${e.msg} `)
      }
    }).catch(function (error) {
      console.error(error);
    }).then(res => {
      resolve()
    })
  })

}

function randomInt (min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function getRandomUA () {
  // 定义 UA 中可选的组成部分
  const browsers = [
    "Chrome",
    "Firefox",
    "Safari",
    "Opera",
    "Edge",
    "Internet Explorer"
  ];

  const randomIndex = Math.floor(Math.random() * browsers.length);
  const browser = browsers[randomIndex];

  // 定义各个浏览器版本的 User-Agent 模版
  const userAgents = {
    "Chrome": "Mozilla/5.0 ({os_info}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{chrome_version} Safari/537.36;yuangongejia#android#kehutong;webank/h5face;webank/1.0;netType:NETWORK_WIFI;appVersion:338;packageName:com.cntaiping.tpapp",
    "Firefox": "Mozilla/5.0 ({os_info}) Gecko/20100101 Firefox/{firefox_version};yuangongejia#android#kehutong;webank/h5face;webank/1.0;netType:NETWORK_WIFI;appVersion:338;packageName:com.cntaiping.tpapp",
    "Safari": "Mozilla/5.0 ({os_info}) AppleWebKit/537.36 (KHTML, like Gecko) Version/{safari_version} Safari/537.36;yuangongejia#android#kehutong;webank/h5face;webank/1.0;netType:NETWORK_WIFI;appVersion:338;packageName:com.cntaiping.tpapp",
    "Opera": "Opera/9.80 ({os_info}) Presto/2.12.388 Version/{opera_version};yuangongejia#android#kehutong;webank/h5face;webank/1.0;netType:NETWORK_WIFI;appVersion:338;packageName:com.cntaiping.tpapp",
    "Edge": "Mozilla/5.0 ({os_info}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.{edge_version}.10563;yuangongejia#android#kehutong;webank/h5face;webank/1.0;netType:NETWORK_WIFI;appVersion:338;packageName:com.cntaiping.tpapp",
    "Internet Explorer": "Mozilla/5.0 (compatible; MSIE {ie_version}; {os_info}; Trident/{trident_version}; .NET CLR 3.5.30729; .NET CLR 4.0.30319; .NET CLR 4.5.21055);yuangongejia#android#kehutong;webank/h5face;webank/1.0;netType:NETWORK_WIFI;appVersion:338;packageName:com.cntaiping.tpapp"
  };

  let ua = userAgents[browser];

  // 随机生成操作系统信息
  const os = ["Windows", "Macintosh", "Linux"];
  const randomOS = os[Math.floor(Math.random() * os.length)];
  let osInfo;

  switch (randomOS) {
    case "Windows":
      const windowsVersions = ["NT 10.0; Win64; x64", "NT 6.3; WOW64", "NT 6.1; WOW64"];
      const randomWindowsVersion = windowsVersions[Math.floor(Math.random() * windowsVersions.length)];
      osInfo = `Windows ${randomWindowsVersion}`;
      break;

    case "Macintosh":
      const macVersions = ["10_15_4", "10_14_5", "10_13_5"];
      const randomMacVersion = macVersions[Math.floor(Math.random() * macVersions.length)];
      osInfo = `Macintosh; Intel Mac OS X ${randomMacVersion}`;
      break;

    case "Linux":
      osInfo = "X11; Linux x86_64";
      break;
  }

  // 随机生成各浏览器版本号
  let chromeVersion = Math.floor(Math.random() * 70) + 50;
  let firefoxVersion = Math.floor(Math.random() * 10) + 50;
  let safariVersion = Math.floor(Math.random() * 10) + 10;
  let operaVersion = Math.floor(Math.random() * 10) + 45;
  let edgeVersion = Math.floor(Math.random() * 30) + 80;
  let ieVersion = Math.floor(Math.random() * 4) + 9;
  let tridentVersion = "7.0";

  // 格式化 UA
  ua = ua.replace("{os_info}", osInfo);

  switch (browser) {
    case "Chrome":
      ua = ua.replace("{chrome_version}", chromeVersion);
      break;

    case "Firefox":
      ua = ua.replace("{firefox_version}", firefoxVersion);
      break;

    case "Safari":
      ua = ua.replace("{safari_version}", safariVersion);
      break;

    case "Opera":
      ua = ua.replace("{opera_version}", operaVersion);
      break;

    case "Edge":
      ua = ua.replace("{edge_version}", edgeVersion);
      break;

    case "Internet Explorer":
      ua = ua.replace("{ie_version}", ieVersion);
      ua = ua.replace("{os_info}", osInfo.split(";")[0]);
      ua = ua.replace("{trident_version}", tridentVersion);
      break;
  }

  return ua;
}



function addNotifyStr (str, is_log = true) {
  if (is_log) {
    log(`${str}\n`)
  }
  msg += `${str}\n`
}

async function SendMsg (message) {
  if (!message)
    return;

  if (Notify > 0) {
    if ($.isNode()) {
      var notify = require('./sendNotify');
      await notify.sendNotify($.name, message);
    } else {
      $.msg(message);
    }
  } else {
    log(message);
  }
}

// 检测变量
async function Envs () {
  if (tpthd) {
    if (tpthd.indexOf("@") != -1) {
      tpthd.split("@").forEach((item) => {
        tpthdArr.push(item);
      });
    } else if (tpthd.indexOf("\n") != -1) {
      tpthd.split("\n").forEach((item) => {
        tpthdArr.push(item);
      });
    } else {
      tpthdArr.push(tpthd);
    }
  } else {
    log(`\n 【${$.name}】：未填写变量 tpthd`)
    return;
  }

  return true;
}

function timestampToTime (time) {
  const dt = new Date(time);
  const y = dt.getFullYear();
  const m = (dt.getMonth() + 1 + "").padStart(2, "0");
  const d = (dt.getDate() + "").padStart(2, "0");

  const hh = (dt.getHours() + "").padStart(2, "0");
  const mm = (dt.getMinutes() + "").padStart(2, "0");
  const ss = (dt.getSeconds() + "").padStart(2, "0");

  return `${y}-${m}-${d}`;
}

function Env (t, e) {
  "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);

  class s {
    constructor(t) {
      this.env = t
    }

    send (t, e = "GET") {
      t = "string" == typeof t ? { url: t } : t;
      let s = this.get;
      return "POST" === e && (s = this.post), new Promise((e, i) => {
        s.call(this, t, (t, s, r) => {
          t ? i(t) : e(s)
        })
      })
    }

    get (t) {
      return this.send.call(this.env, t)
    }

    post (t) {
      return this.send.call(this.env, t, "POST")
    }
  }

  return new class {
    constructor(t, e) {
      this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`)
    }

    isNode () {
      return "undefined" != typeof module && !!module.exports
    }

    isQuanX () {
      return "undefined" != typeof $task
    }

    isSurge () {
      return "undefined" != typeof $httpClient && "undefined" == typeof $loon
    }

    isLoon () {
      return "undefined" != typeof $loon
    }

    toObj (t, e = null) {
      try {
        return JSON.parse(t)
      } catch {
        return e
      }
    }

    toStr (t, e = null) {
      try {
        return JSON.stringify(t)
      } catch {
        return e
      }
    }

    getjson (t, e) {
      let s = e;
      const i = this.getdata(t);
      if (i) try {
        s = JSON.parse(this.getdata(t))
      } catch {
      }
      return s
    }

    setjson (t, e) {
      try {
        return this.setdata(JSON.stringify(t), e)
      } catch {
        return !1
      }
    }

    getScript (t) {
      return new Promise(e => {
        this.get({ url: t }, (t, s, i) => e(i))
      })
    }

    runScript (t, e) {
      return new Promise(s => {
        let i = this.getdata("@chavy_boxjs_userCfgs.httpapi");
        i = i ? i.replace(/\n/g, "").trim() : i;
        let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
        r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r;
        const [o, h] = i.split("@"), n = {
          url: `http://${h}/v1/scripting/evaluate`,
          body: { script_text: t, mock_type: "cron", timeout: r },
          headers: { "X-Key": o, Accept: "*/*" }
        };
        this.post(n, (t, e, i) => s(i))
      }).catch(t => this.logErr(t))
    }

    loaddata () {
      if (!this.isNode()) return {};
      {
        this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
        const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile),
          s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e);
        if (!s && !i) return {};
        {
          const i = s ? t : e;
          try {
            return JSON.parse(this.fs.readFileSync(i))
          } catch (t) {
            return {}
          }
        }
      }
    }

    writedata () {
      if (this.isNode()) {
        this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
        const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile),
          s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data);
        s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r)
      }
    }

    lodash_get (t, e, s) {
      const i = e.replace(/\[(\d+)\]/g, ".$1").split(".");
      let r = t;
      for (const t of i) if (r = Object(r)[t], void 0 === r) return s;
      return r
    }

    lodash_set (t, e, s) {
      return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t)
    }

    getdata (t) {
      let e = this.getval(t);
      if (/^@/.test(t)) {
        const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : "";
        if (r) try {
          const t = JSON.parse(r);
          e = t ? this.lodash_get(t, i, "") : e
        } catch (t) {
          e = ""
        }
      }
      return e
    }

    setdata (t, e) {
      let s = !1;
      if (/^@/.test(e)) {
        const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i),
          h = i ? "null" === o ? null : o || "{}" : "{}";
        try {
          const e = JSON.parse(h);
          this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i)
        } catch (e) {
          const o = {};
          this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i)
        }
      } else s = this.setval(t, e);
      return s
    }

    getval (t) {
      return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null
    }

    setval (t, e) {
      return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null
    }

    initGotEnv (t) {
      this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar))
    }

    get (t, e = (() => {
    })) {
      t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => {
        !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
      })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => {
        const { statusCode: s, statusCode: i, headers: r, body: o } = t;
        e(null, { status: s, statusCode: i, headers: r, body: o }, o)
      }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => {
        try {
          if (t.headers["set-cookie"]) {
            const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
            s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar
          }
        } catch (t) {
          this.logErr(t)
        }
      }).then(t => {
        const { statusCode: s, statusCode: i, headers: r, body: o } = t;
        e(null, { status: s, statusCode: i, headers: r, body: o }, o)
      }, t => {
        const { message: s, response: i } = t;
        e(s, i, i && i.body)
      }))
    }

    post (t, e = (() => {
    })) {
      if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => {
        !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
      }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => {
        const { statusCode: s, statusCode: i, headers: r, body: o } = t;
        e(null, { status: s, statusCode: i, headers: r, body: o }, o)
      }, t => e(t)); else if (this.isNode()) {
        this.initGotEnv(t);
        const { url: s, ...i } = t;
        this.got.post(s, i).then(t => {
          const { statusCode: s, statusCode: i, headers: r, body: o } = t;
          e(null, { status: s, statusCode: i, headers: r, body: o }, o)
        }, t => {
          const { message: s, response: i } = t;
          e(s, i, i && i.body)
        })
      }
    }

    time (t, e = null) {
      const s = e ? new Date(e) : new Date;
      let i = {
        "M+": s.getMonth() + 1,
        "d+": s.getDate(),
        "H+": s.getHours(),
        "m+": s.getMinutes(),
        "s+": s.getSeconds(),
        "q+": Math.floor((s.getMonth() + 3) / 3),
        S: s.getMilliseconds()
      };
      /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length)));
      for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length)));
      return t
    }

    msg (e = t, s = "", i = "", r) {
      const o = t => {
        if (!t) return t;
        if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0;
        if ("object" == typeof t) {
          if (this.isLoon()) {
            let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"];
            return { openUrl: e, mediaUrl: s }
          }
          if (this.isQuanX()) {
            let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl;
            return { "open-url": e, "media-url": s }
          }
          if (this.isSurge()) {
            let e = t.url || t.openUrl || t["open-url"];
            return { url: e }
          }
        }
      };
      if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) {
        let t = ["", "==============📣系统通知📣=============="];
        t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t)
      }
    }

    log (...t) {
      t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator))
    }

    logErr (t, e) {
      const s = !this.isSurge() && !this.isQuanX() && !this.isLoon();
      s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t)
    }

    wait (t) {
      return new Promise(e => setTimeout(e, t))
    }

    done (t = {}) {
      const e = (new Date).getTime(), s = (e - this.startTime) / 1e3;
      this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t)
    }
  }(t, e)
}