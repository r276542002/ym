/*
小程序:霖久智服
变量名:G_ljzfhd
格式:手机号&手机号 或 换行分隔
*/

const $ = new Env("霖久智服");
const notify = $.isNode() ? require('./sendNotify') : '';
let G_ljzfhd = process.env.G_ljzfhd || "";

// 统计变量
let statistics = {
    totalAccounts: 0,
    successAccounts: 0,
    failedAccounts: 0,
    totalPoints: 0,
    signInPoints: 0,
    taskPoints: 0,
    adPoints: 0,
    accountDetails: []
};

let message = "";

!(async () => {
    if (!G_ljzfhd) {
        console.log("❌ 请先设置环境变量 G_ljzfhd");
        return;
    }

    console.log("🚀 开始执行霖久智服任务\n");
    
    // 处理多账号
    let accounts = [];
    if (G_ljzfhd.includes("&")) {
        accounts = G_ljzfhd.split("&");
    } else if (G_ljzfhd.includes("\n")) {
        accounts = G_ljzfhd.split("\n");
    } else {
        accounts = [G_ljzfhd];
    }
    
    // 过滤空值
    accounts = accounts.map(acc => acc.trim()).filter(acc => acc);
    
    statistics.totalAccounts = accounts.length;
    console.log(`📱 共找到 ${statistics.totalAccounts} 个账号\n`);
    
    for (let i = 0; i < accounts.length; i++) {
        let phone = accounts[i];
        console.log(`\n============== 第 ${i + 1} 个账号 ==============`);
        console.log(`📞 手机号: ${phone}`);
        
        // 初始化账号统计
        const accountStat = {
            phone: phone,
            status: 'success',
            signInPoints: 0,
            taskPoints: 0,
            adPoints: 0,
            totalPoints: 0,
            finalPoints: 0,
            error: ''
        };
        
        try {
            await processAccount(phone, accountStat);
            statistics.successAccounts++;
        } catch (e) {
            console.log(`❌ 账号 ${phone} 处理失败: ${e.message}`);
            accountStat.status = 'failed';
            accountStat.error = e.message;
            statistics.failedAccounts++;
        }
        
        statistics.accountDetails.push(accountStat);
        
        if (i < accounts.length - 1) {
            await $.wait(2000); // 账号间延迟
        }
    }
    
    // 生成统计报告
    await generateStatisticsReport();
    
    // 发送通知
    if (message) {
        await sendNotify("霖久智服任务完成", message);
    }
    
    console.log("\n🎉 所有账号处理完成");
})()
.catch((e) => {
    console.log(`❌ 脚本执行失败: ${e.message}`);
})
.finally(() => {
    $.done();
});

// 处理单个账号
async function processAccount(phone, accountStat) {
    // 1. 获取token
    const token = await getToken(phone);
    if (!token) {
        throw new Error('获取token失败');
    }
    
    // 2. 签到
    const signInPoints = await signIn(token);
    accountStat.signInPoints = signInPoints;
    statistics.signInPoints += signInPoints;
    
    // 3. 获取并执行任务
    const taskPoints = await doTasks(token, phone);
    accountStat.taskPoints = taskPoints;
    statistics.taskPoints += taskPoints;
    
    // 4. 看广告
    const adPoints = await watchAds(token);
    accountStat.adPoints = adPoints;
    statistics.adPoints += adPoints;
    
    // 5. 查询积分
    const finalPoints = await queryPoints(phone);
    accountStat.finalPoints = finalPoints;
    
    // 计算本次获得的总积分
    accountStat.totalPoints = signInPoints + taskPoints + adPoints;
    statistics.totalPoints += accountStat.totalPoints;
    
    console.log(`📊 账号统计: 签到${signInPoints} + 任务${taskPoints} + 广告${adPoints} = 本次获得${accountStat.totalPoints}积分，当前总积分: ${finalPoints}`);
}

// 获取token
async function getToken(phone) {
    const url = "https://linjiucloud-api.ysservice.com.cn/mc/member/autoMember";
    const body = {
        channel: "CHARGE_PLATFORM",
        tenantId: "10111",
        mobile: phone
    };
    
    try {
        const response = await makeRequest('POST', url, body);
        if (response && response.code === 0) {
            console.log("✅ 获取token成功");
            return response.data;
        } else {
            console.log(`❌ 获取token失败: ${response ? response.message : '未知错误'}`);
            return null;
        }
    } catch (e) {
        console.log(`❌ 获取token异常: ${e.message}`);
        return null;
    }
}

// 签到 - 返回获得的积分
async function signIn(token) {
    const url = "https://linjiucloud-api.ysservice.com.cn/mt/web/action/add";
    const body = {
        actionRecordCO: {
            actionType: "SIGN_IN",
            actionUnit: "1",
            channel: "LJZF",
            createdBy: token,
            unitCount: "1"
        },
        tenantId: "10111"
    };
    
    try {
        const response = await makeRequest('POST', url, body);
        if (response && response.code === 0) {
            const points = parseInt(response.data.pointCount) || 0;
            console.log(`✅ 签到成功，获得 ${points} 积分`);
            return points;
        } else {
            console.log(`❌ 签到失败: ${response ? response.message : '未知错误'}`);
            return 0;
        }
    } catch (e) {
        console.log(`❌ 签到异常: ${e.message}`);
        return 0;
    }
}

// 执行任务 - 返回获得的总积分
async function doTasks(token, phone) {
    let totalTaskPoints = 0;
    
    // 先获取任务列表
    const taskListUrl = "https://linjiucloud-api.ysservice.com.cn/mt/mini/task/list";
    const taskListBody = {
        memberId: phone,
        tenantId: "10111"
    };
    
    try {
        const response = await makeRequest('POST', taskListUrl, taskListBody);
        if (response && response.code === 0 && response.data) {
            console.log(`📋 找到 ${response.data.length} 个任务`);
            
            for (let task of response.data) {
                const points = await doSingleTask(token, task.tmplType);
                totalTaskPoints += points;
                await $.wait(1000); // 任务间延迟1秒
            }
        }
        console.log(`📊 任务总计获得: ${totalTaskPoints} 积分`);
    } catch (e) {
        console.log(`❌ 获取任务列表异常: ${e.message}`);
    }
    
    return totalTaskPoints;
}

// 执行单个任务 - 返回获得的积分
async function doSingleTask(token, taskType) {
    const url = "https://linjiucloud-api.ysservice.com.cn/mt/web/action/add";
    const body = {
        actionRecordCO: {
            actionType: taskType,
            actionUnit: "1",
            channel: "LJZF",
            createdBy: token,
            unitCount: "1",
            week: ""
        },
        tenantId: "10111"
    };
    
    try {
        const response = await makeRequest('POST', url, body);
        if (response && response.code === 0) {
            const points = parseInt(response.data.pointCount) || 0;
            console.log(`✅ 任务完成，获得 ${points} 积分`);
            return points;
        } else {
            console.log(`❌ 任务失败: ${response ? response.message : '未知错误'}`);
            return 0;
        }
    } catch (e) {
        console.log(`❌ 任务异常: ${e.message}`);
        return 0;
    }
}

// 看广告 - 返回获得的总积分
async function watchAds(token) {
    console.log("📺 开始看广告任务");
    let totalAdPoints = 0;
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 1; i <= 9; i++) {
        const points = await watchSingleAd(token, i);
        totalAdPoints += points;
        if (points > 0) {
            successCount++;
        } else {
            failCount++;
        }
        if (i < 9) {
            await $.wait(30000); // 广告间延迟30秒
        }
    }
    
    console.log(`📊 广告完成: 成功${successCount}个，失败${failCount}个，总计获得: ${totalAdPoints} 积分`);
    return totalAdPoints;
}

// 看单个广告 - 返回获得的积分
async function watchSingleAd(token, index) {
    const url = "https://linjiucloud-api.ysservice.com.cn/mt/web/action/add";
    const body = {
        actionRecordCO: {
            actionType: "AD",
            actionUnit: "1",
            channel: "LJZF",
            createdBy: token,
            unitCount: "1",
            week: ""
        },
        tenantId: "10111"
    };
    
    try {
        const response = await makeRequest('POST', url, body);
        if (response && response.code === 0) {
            const points = parseInt(response.data.pointCount) || 0;
            console.log(`✅ 第 ${index} 个广告完成，获得 ${points} 积分`);
            return points;
        } else {
            console.log(`❌ 第 ${index} 个广告失败: ${response ? response.message : '未知错误'}`);
            return 0;
        }
    } catch (e) {
        console.log(`❌ 第 ${index} 个广告异常: ${e.message}`);
        return 0;
    }
}

// 查询积分 - 返回当前积分
async function queryPoints(phone) {
    const url = `https://linjiucloud-api.ysservice.com.cn/mc/member/memberPoint?mobile=${phone}&tenantId=10111`;
    
    try {
        const response = await makeRequest('GET', url);
        if (response && response.code === 0) {
            const points = parseInt(response.data.availablePoints) || 0;
            console.log(`💰 当前积分: ${points}`);
            return points;
        } else {
            console.log(`❌ 查询积分失败: ${response ? response.message : '未知错误'}`);
            return 0;
        }
    } catch (e) {
        console.log(`❌ 查询积分异常: ${e.message}`);
        return 0;
    }
}

// 生成统计报告
async function generateStatisticsReport() {
    console.log(`\n📈 ============ 任务统计报告 ============`);
    console.log(`📊 账号统计: 总计${statistics.totalAccounts}个，成功${statistics.successAccounts}个，失败${statistics.failedAccounts}个`);
    console.log(`💰 积分统计: 总计获得${statistics.totalPoints}积分`);
    console.log(`   ├─ 签到积分: ${statistics.signInPoints}`);
    console.log(`   ├─ 任务积分: ${statistics.taskPoints}`);
    console.log(`   └─ 广告积分: ${statistics.adPoints}`);
    
    // 添加到消息中用于通知
    message += `📈 任务统计报告\n`;
    message += `📊 账号统计: 总计${statistics.totalAccounts}个，成功${statistics.successAccounts}个，失败${statistics.failedAccounts}个\n`;
    message += `💰 积分统计: 总计获得${statistics.totalPoints}积分\n`;
    message += `   ├─ 签到积分: ${statistics.signInPoints}\n`;
    message += `   ├─ 任务积分: ${statistics.taskPoints}\n`;
    message += `   └─ 广告积分: ${statistics.adPoints}\n\n`;
    
    // 详细账号统计
    if (statistics.accountDetails.length > 0) {
        message += `📋 账号详情:\n`;
        statistics.accountDetails.forEach((account, index) => {
            if (account.status === 'success') {
                message += `${index + 1}. ${account.phone}: 获得${account.totalPoints}积分 (当前:${account.finalPoints})\n`;
            } else {
                message += `${index + 1}. ${account.phone}: 失败 - ${account.error}\n`;
            }
        });
    }
    
    // 成功率计算
    const successRate = statistics.totalAccounts > 0 ? 
        ((statistics.successAccounts / statistics.totalAccounts) * 100).toFixed(2) : 0;
    console.log(`📈 成功率: ${successRate}%`);
    message += `\n📈 成功率: ${successRate}%`;
    
    // 平均积分
    const avgPoints = statistics.successAccounts > 0 ? 
        (statistics.totalPoints / statistics.successAccounts).toFixed(2) : 0;
    console.log(`📊 平均每个成功账号获得: ${avgPoints}积分`);
    message += `\n📊 平均每个成功账号获得: ${avgPoints}积分`;
}

// 通用请求函数
async function makeRequest(method, url, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            url: url,
            method: method,
            headers: {
                'X-Client-Id': '64',
                'X-Tenant-Id': '10111',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.12(0x17000c33) NetType/WIFI Language/zh_CN'
            },
            timeout: 10000
        };
        
        if (body && method === 'POST') {
            options.body = JSON.stringify(body);
        }
        
        // 根据环境使用不同的请求方法
        if ($.isNode()) {
            const http = require('http');
            const https = require('https');
            const { URL } = require('url');
            
            const parsedUrl = new URL(url);
            const requestOptions = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
                path: parsedUrl.pathname + parsedUrl.search,
                method: method,
                headers: options.headers
            };
            
            const client = parsedUrl.protocol === 'https:' ? https : http;
            
            const req = client.request(requestOptions, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const jsonData = JSON.parse(data);
                        resolve(jsonData);
                    } catch (e) {
                        reject(new Error('解析响应数据失败'));
                    }
                });
            });
            
            req.on('error', (error) => {
                reject(error);
            });
            
            req.setTimeout(10000, () => {
                req.destroy();
                reject(new Error('请求超时'));
            });
            
            if (body && method === 'POST') {
                req.write(JSON.stringify(body));
            }
            
            req.end();
            
        } else if ($.isQuanX()) {
            options.method = method;
            $task.fetch(options).then(
                response => {
                    try {
                        const data = JSON.parse(response.body);
                        resolve(data);
                    } catch (e) {
                        reject(new Error('解析响应数据失败'));
                    }
                },
                error => reject(error)
            );
        } else if ($.isSurge() || $.isLoon()) {
            options.method = method;
            $httpClient[method.toLowerCase()](options, (error, response, data) => {
                if (error) {
                    reject(error);
                } else {
                    try {
                        const jsonData = JSON.parse(data);
                        resolve(jsonData);
                    } catch (e) {
                        reject(new Error('解析响应数据失败'));
                    }
                }
            });
        } else {
            reject(new Error('不支持的运行环境'));
        }
    });
}

// 发送通知
async function sendNotify(title, content) {
    if ($.isNode() && notify) {
        try {
            await notify.sendNotify(title, content);
        } catch (e) {
            console.log(`❌ 发送通知失败: ${e.message}`);
        }
    } else {
        console.log(`\n📢 ${title}\n${content}`);
    }
}

// 简化的Env类
function Env(name, opts) {
    return new class {
        constructor(name, opts) {
            this.name = name;
            this.logs = [];
            this.startTime = new Date().getTime();
            Object.assign(this, opts);
            console.log(`🔔 ${this.name} 开始执行`);
        }

        isNode() {
            return typeof process !== 'undefined' && process.versions && process.versions.node;
        }

        isQuanX() {
            return typeof $task !== 'undefined';
        }

        isSurge() {
            return typeof $httpClient !== 'undefined' && typeof $loon === 'undefined';
        }

        isLoon() {
            return typeof $loon !== 'undefined';
        }

        wait(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        done(result = {}) {
            const cost = ((new Date().getTime() - this.startTime) / 1000).toFixed(2);
            console.log(`🔔 ${this.name} 执行完毕，耗时 ${cost} 秒`);
            if (this.isQuanX() || this.isSurge() || this.isLoon()) {
                $done(result);
            }
        }
    }(name, opts);
}
