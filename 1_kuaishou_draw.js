// 快手 每日免费抽奖
const axios = require('axios');

const AUTHS = process.env.kuaishou_draw;
const notify = require('./sendNotify');
if (!AUTHS) {
    console.error('请通过环境变量 kuaishou_draw 传入，格式：ck#sign#UA#用户名 用 \\n  分隔多账户');
    process.exit(1);
}

const authArray = AUTHS.split('\n').map(s => s.trim()).filter(s => s.length > 0);
let notifyStr = ''

function addNotify(msg) {
    notifyStr += msg + `\n`;
}

async function draw(COOKIE, SIGN, USERNAME, UA) {
    const url = `https://encourage.kuaishou.com/rest/ug-regular/turntable/draw?__NS_sig4=${SIGN}&sigCatVer=1`;

    const headers = {
        'User-Agent': UA,
        'Host': 'encourage.kuaishou.com',
        'Accept': 'application/json',
        'Sec-Fetch-Site': 'same-origin',
        'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/json',
        'Origin': 'https://encourage.kuaishou.com',
        'Referer': 'https://encourage.kuaishou.com/turntable/school?layoutType=4&bizId=turntable&source=task',
        'ktrace-str': '3|My40NTgzNzM3MTc4NDU3Mzc4LjI3NjcyODg1LjE3NTA5MjQxOTMzNTQuMTAwNw==|My40NTgzNzM3MTc4NDU3Mzc4LjM2NTI2OTM5LjE3NTA5MjQxOTMzNTMuMTAwNg==|0|usergrowth-activity-huge-sign-in|webservice|true|src:Js,seqn:5813,rsi:22436d93-9c70-4f37-a1e0-bc4ba8dc81ed,path:/huge-sign-in/home,rpi:c198403627',
        'X-Requested-With': 'com.kuaishou.nebula',
        'Connection': 'keep-alive',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        'Cookie': COOKIE
    };

    const body = '{}';

    const res = await axios.post(url, body, {headers});

    try {
        if (res.data.result === 1) {
            console.log(`【${USERNAME}】` + '抽奖成功 : ' + res.data.data.title);
            addNotify(`【${USERNAME}】` + '抽奖成功 : ' + res.data.data.title);
        } else if (res.data.result === 119001) {
            addNotify(`【${USERNAME}】` + '免费抽奖次数已经用了 ');
        } else {
            console.log(`【${USERNAME}】` + '抽奖成功失败: ' + JSON.stringify(res.data));
            addNotify(`【${USERNAME}】` + '抽奖成功失败 : ' + JSON.stringify(res.data));
        }
    } catch (error) {
        console.log(`【${USERNAME}】抽奖: 出错了，原因：${error.message}`);
    }
}


(async () => {
    for (let i = 0; i < authArray.length; i++) {
        try {
            const auth = authArray[i];
            const parts = auth.split('#');
            if (parts.length < 4) {
                console.warn(`第${i + 1}条格式错误，应为 格式：ck#sign#UA#用户名 用 \\n 分隔多账户`);
                continue;
            }

            let [COOKIE, SIGN, UA, USERNAME] = parts;

            console.log(`\n 📣📣📣 用户:${USERNAME} 开始执行 📣📣📣`);
            addNotify(`\n 📣📣📣 用户:${USERNAME} 开始执行 📣📣📣`);

            if (UA.length <= 2) {
                console.log(`【${USERNAME}】未配置UA 使用默认UA `);
                UA = "Mozilla/5.0 (Linux; Android 11; 220233L2C Build/RP1A.200720.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/90.0.4430.226 KsWebView/1.8.90.754 (rel;rg;low) Mobile Safari/537.36 Yoda/3.2.9-rc1 ksNebula/12.11.30.9265 OS_PRO_BIT/32 MAX_PHY_MEM/3779 KDT/PHONE AZPREFIX/az2 ICFO/0 StatusHT/29 TitleHT/43 NetType/WIFI ISLP/1 ISDM/0 ISLB/0 locale/zh-cn DPS/2.427 DPP/5 SHP/1513 SWP/720 SD/2.0 CT/0 ISLM/0";
            }
            await draw(COOKIE, SIGN, USERNAME, UA);
            const sleep = async () => await new Promise(res => setTimeout(res, Math.floor(Math.random() * 20000) + 30000));
            // await sleep();
        } catch (error) {
            console.error(`【第${i + 1}条】请求出错:`, error.message || error);
        }
    }

    if (notifyStr.length > 2048) {
        maxLength = 2048;
        for (let i = 0; i < notifyStr.length; i += maxLength) {
            await notify.sendNotify(`快手每日免费抽奖 通知${i}`, notifyStr.substring(i, i + maxLength));
        }
    } else {
        await notify.sendNotify('快手每日免费抽奖', notifyStr);
    }
})();
