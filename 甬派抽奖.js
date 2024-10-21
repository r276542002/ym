/*
cron: 19 9,16 * * * 甬派抽奖.js
APP:甬派
ypcj='账号&密码'
dxpay='支付宝号&姓名'
多号换行
脚本通过搜索返回json 出现内容“转盘”二字 获得newsId
有时返回json内容没有转盘得手动抓包修改
开启了消息推送
*/

const $ = new Env('甬派抽奖');
const axios = require('axios');
let request = require("request");
const { read } = require('fs');
const uglifyjs = require("uglify-js");
const parser = require("@babel/parser");
const fs = require('fs');
const path = require('path');
const xpath = require('xpath')
const os = require('os')
    , XmldomParser = require('xmldom').DOMParser;

const domParser = new XmldomParser({
    errorHandler: {}
})
const { JSDOM } = require('jsdom');
var qs = require('qs');
request = request.defaults({
    jar: true
});
window = {}
const { log } = console;
const Notify = 1; //0为关闭通知，1为打开通知,默认为1
const debug = 0; //0为关闭调试，1为打开调试,默认为0
let ypcj = ($.isNode() ? process.env.ypcj : $.getdata("ypcj")) || ""
let dxpay = ($.isNode() ? process.env.dxpay : $.getdata("dxpay")) || ""
let dxpayArr = [];
let ypcjArr = [];
let data = '';
let msg = '';
var hours = new Date().getMonth();
var timestamp = Math.round(new Date().getTime()).toString();
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
            log(`\n============ 柠檬教程 ============`)
            log(`\n=================== 共找到 ${ypcjArr.length} 个账号 ===================`)
            if (debug) {
                log(`【debug】 这是你的全部账号数组:\n ${ypcjArr}`);
            }
            for (let index = 0; index < ypcjArr.length; index++) {
                let num = index + 1
                addNotifyStr(`\n==== 开始【第 ${num} 个账号】====`, true)
                ypcj = ypcjArr[index].split('&')
                dxpay = dxpayArr[index].split('&')
                //登陆APP
                await Login()
                await $.wait(200);

                await hdnewsid();
                await $.wait(1000);
                //获取活动id
                await hdid()
                await $.wait(200);
                //获取对吧url
                await autologin()
                //获取抽奖次数
                await ajaxElement()
                await $.wait(1000);
                if (freeLimit != 0) {
                    //获取consumerId
                    await consumerId()
                    //获取抽奖的token
                    await gettoken()
                    //抽奖
                    await doJoin()
                }else{
                    log('抽奖次数已用完')
                    msg += '\n' + '结果：' + '抽奖次数已用完';
                }


            }
            await SendMsg(msg);
        }
    }
})()
    .catch((e) => log(e))
    .finally(() => $.done())



async function Login() {
    did = RandeCode();
    let tt = ts13();
    let encryptdata = 'globalDatetime' + tt + 'username' + ypcj[0] + 'test_123456679890123456'
    let sg = MD5Encrypt(encryptdata).toUpperCase();
    return new Promise((resolve) => {
        var options = {
            method: 'GET',
            url: 'http://ypapp.cnnb.com.cn/yongpai-user/api/login2/local?username=' + ypcj[0] + '&password=' + ypcj[1] + '&deviceId=' + did + '&globalDatetime=' + tt + '&sign=' + sg,
            headers: {
                'Host': 'ypapp.cnnb.com.cn',
                'User-Agent': 'okhttp/3.10.0'
            }
        };
        if (debug) {
            log(`\n【debug】=============== 这是  请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(async function (response) {
            try {
                let data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 返回data==============`);
                    log(JSON.stringify(response.data));
                }
                if (data.code == 0) {
                    nickname = data.data.nickname;
                    userId = data.data.userId;
                    log(`nickname:${nickname}`)
                    msg += '\n' + '用户名：' + data.data.nickname;
                    log(`userId：${userId}`)
                    msg += '\n' + 'userId' + data.data.userId;
                } else {
                    console.log(data);
                }
            } catch (e) {
                log(`异常：${JSON.stringify(response.data)}，原因：${data.message}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })
}





//获取活动newsid
async function hdnewsid() {
    return new Promise((resolve) => {
         const options = {
         method: 'GET',
         url: 'https://ypapp.cnnb.com.cn/yongpai-news/api/news/list',
         params: {channelId: '0', currentPage: '1', timestamp: '0'},
         headers: {'user-agent': 'okhttp/4.9.1', Host: 'ypapp.cnnb.com.cn'}
};
        if (debug) {
            log(`\n【debug】=============== 这是  请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(async function (response) {
            try {
                let data = response.data;
       // 定义递归函数用于在JSON中查找包含"转盘"内容的路径和内容
    function searchInJson(obj, path = []) {
      for (let key in obj) {
        // 如果当前属性值是对象，则递归调用函数
        if (typeof obj[key] === 'object') {
          let newPath = [...path, key];
          let result = searchInJson(obj[key], newPath);
          if (result) {
            return result; // 如果找到目标，直接返回结果
          }
        } else if (typeof obj[key] === 'string' && obj[key].includes('转盘')) {
          // 如果当前属性值是字符串且包含"转盘"，则返回路径和内容
          return { path: [...path, key], content: obj[key] };
        }
      }
      return null; // 如果未找到目标，返回null
    }

    // 调用递归函数并获取结果
    let searchResult = searchInJson(data);

    // 根据搜索结果进行处理
    if (searchResult) {
      log('原始路径内容:', searchResult.content);
      msg += '\n' + '活动内容:' + searchResult.content;
      log('原始路径:', searchResult.path.join('.'));

      // 替换路径的最后一个值为newsId
      let newsId = 'newsId'; 
      let newPath = [...searchResult.path.slice(0, -1), newsId];

      // 使用新路径在JSON中查找内容
      let newsContent = data;
      for (let key of newPath) {
        newsContent = newsContent[key];
      }
      
      log('新路径内容:', newsContent);
      log('新路径:', newPath.join('.'));
      msg += '\n' + 'newsId:' + newsContent;
      await hdid(newsContent);
    } else {
      log('未找到包含"转盘"的内容。');
      msg += '\n' + '未找到包含"转盘"的内容。请抓包获取newsId';
    }
     
            } catch (e) {
                log(`异常：${JSON.stringify(response.data)}，原因：${data.message}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })
}




//获取活动id
async function hdid(newsId_) {
    return new Promise((resolve) => {
        var options = {
            method: 'GET',
            url: `https://ypapp.cnnb.com.cn/yongpai-news/api/v2/news/detail/app?deviceId=${did}&isApp=1&newsId=${newsId_}&userId=${userId}`,
            headers: {
                'Host': 'ypapp.cnnb.com.cn',
                'User-Agent': 'okhttp/3.10.0'
            }
        };
        if (debug) {
            log(`\n【debug】=============== 这是  请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(async function (response) {
            try {
                let data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 返回data==============`);
                    log(JSON.stringify(response.data));
                }
                if (data.code == 0) {

                    var regex = /id=(\d+)/;
                    var match = data.data.body.match(regex);
                    idValue = match ? match[1] : null;

                } else {
                    console.log(data);
                }
            } catch (e) {
                log(`异常：${JSON.stringify(response.data)}，原因：${data.message}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })
}

async function autologin() {
    return new Promise((resolve) => {
        var options = {
            method: 'GET',
            url: `https://ypapp.cnnb.com.cn/yongpai-user/api/duiba/autologin?dbredirect=https://92722.activity-12.m.duiba.com.cn/hdtool/index?id=${idValue}&dbnewopen&userId=${userId}`,
            headers: {
                'Host': 'ypapp.cnnb.com.cn',
                'User-Agent': 'okhttp/3.10.0'
            }
        };
        if (debug) {
            log(`\n【debug】=============== 这是  请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(async function (response) {
            try {
                let data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 返回data==============`);
                    log(JSON.stringify(response.data));
                }
                if (data.code == 0) {
                    //获取ck
                    await hqck(data.data)
                } else {
                    console.log(data);
                }
            } catch (e) {
                log(`异常：${JSON.stringify(response.data)}，原因：${data.message}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })
}

async function hqck(a) {
    var options = {
        method: 'GET',
        url: a,
        headers: {
            'User-Agent': 'Apifox/1.0.0 (https://apifox.com)'
        }
    };
    if (debug) {
        log(`\n【debug】=============== 这是  请求 url ===============`);
        log(JSON.stringify(options));
    }
    return new Promise((resolve) => {
        request(options, async (error, response, data) => {
            try {
                //let result= JSON.parse(data);
                if (debug) {
                    log(`\n\n【debug】===============这是 返回result==============`);
                    log(data)
                }
                // log(data)
                cookies = response.request.headers.cookie;

            } catch (e) {
                log(`异常，原因：${e}，返回：${data}`)
            } finally {
                resolve();
            }
        })
    })
}

async function ajaxElement() {
    var data = qs.stringify({
        'hdType': 'dev',
        'hdToolId': '',
        'preview': 'false',
        'actId': idValue,
        'adslotId': ''
    });
    let tt = ts13();
    return new Promise((resolve) => {
        var options = {
            method: 'POST',
            url: `https://92722.activity-12.m.duiba.com.cn/hdtool/ajaxElement?_=${tt}`,
            headers: {
                'Host': '92722.activity-12.m.duiba.com.cn',
                'accept': 'application/json',
                'x-requested-with': 'XMLHttpRequest',
                'accept-language': 'zh-cn',
                'origin': 'https://92722.activity-12.m.duiba.com.cn',
                'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148   yongpai/10.0.3',
                'referer': 'https://92722.activity-12.m.duiba.com.cn/hdtool/index?id=251290574515381&dbnewopen&from=login&spm=92722.1.1.1',
                'Cookie': cookies,
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: data
        };
        if (debug) {
            log(`\n【debug】=============== 这是  请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(async function (response) {
            try {
                let data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 返回data==============`);
                    log(JSON.stringify(response.data));
                }
                freeLimit = data.element.freeLimit
            } catch (e) {
                log(`异常：${JSON.stringify(response.data)}，原因：${data.message}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })
}

async function consumerId() {
    var options = {
        method: 'GET',
        url: `https://92722.activity-12.m.duiba.com.cn/hdtool/index?id=${idValue}&dbnewopen&from=login&spm=92722.1.1.1`,
        headers: {
            'Host': '92722.activity-12.m.duiba.com.cn',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148          yongpai/10.0.3',
            'accept-language': 'zh-CN,zh-Hans;q=0.9',
            'Cookie': cookies
        }
    };
    if (debug) {
        log(`\n【debug】=============== 这是  请求 url ===============`);
        log(JSON.stringify(options));
    }
    return new Promise((resolve) => {
        request(options, async (error, response, data) => {
            try {
                //let result= JSON.parse(data);
                if (debug) {
                    log(`\n\n【debug】===============这是 返回result==============`);
                    log(data)
                }
                consumerId = data.match(/consumerId:'(.*?)'/)[1]
                key = ParseHtml(data, 5).defaultToken


            } catch (e) {
                log(`异常，原因：${e}，返回：${data}`)
            } finally {
                resolve();
            }
        })
    })
}

async function gettoken() {
    let tt = ts13();
    var options = {
        method: 'POST',
        url: 'https://92722.activity-12.m.duiba.com.cn/hdtool/ctoken/getTokenNew',
        headers: {
            'Host': '92722.activity-12.m.duiba.com.cn',
            'accept': 'application/json',
            'x-requested-with': 'XMLHttpRequest',
            'accept-language': 'zh-cn',
            'origin': 'https://92722.activity-12.m.duiba.com.cn',
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148   yongpai/10.0.3',
            'referer': `https://92722.activity-12.m.duiba.com.cn/hdtool/index?id=${idValue}&dbnewopen&from=login&spm=92722.1.1.1`,
            'content-type': 'application/x-www-form-urlencoded',
            'Cookie': cookies,
        },

        body: 'timestamp=' + tt + '&activityId=' + idValue + '&activityType=hdtool&consumerId=' + consumerId
    };
    if (debug) {
        log(`\n【debug】=============== 这是  请求 url ===============`);
        log(JSON.stringify(options));
    }
    return new Promise((resolve) => {
        request(options, async (error, response, data) => {
            try {
                let result = JSON.parse(data);
                if (debug) {
                    log(`\n\n【debug】===============这是 返回result==============`);
                    log(data)
                }
                if (result.success == true) {
                    token = uglifyjs.minify(result.token).code
                    token = eval(uglifyjs.minify('window={};' + token).code)
                    token = eval(key)
                } else log(result.message)


            } catch (e) {
                log(`异常，原因：${e}，返回：${data}`)
            } finally {
                resolve();
            }
        })
    })
}





async function doJoin() {
    var data = qs.stringify({
        'actId': idValue,
        'oaId': idValue,
        'activityType': 'hdtool',
        'consumerId': consumerId,
        'token': token
    });
    let tt = ts13();
    return new Promise((resolve) => {
        var options = {
            method: 'POST',
            url: `https://92722.activity-12.m.duiba.com.cn/hdtool/doJoin?dpm=92722.3.1.0&activityId=${idValue}&_=${tt}`,
            headers: {
                'Host': '92722.activity-12.m.duiba.com.cn',
                'accept': 'application/json',
                'x-requested-with': 'XMLHttpRequest',
                'accept-language': 'zh-cn',
                'origin': 'https://92722.activity-12.m.duiba.com.cn',
                'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148   yongpai/10.0.3',
                'referer': 'https://92722.activity-12.m.duiba.com.cn/hdtool/index?id=251290574515381&dbnewopen&from=login&spm=92722.1.1.1',
                'Cookie': cookies,
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: data
        };
        if (debug) {
            log(`\n【debug】=============== 这是  请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(async function (response) {
            try {
                let data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 返回data==============`);
                    log(JSON.stringify(response.data));
                }
                if (data.success == true) {
                    await $.wait(20000)
                    await getOrderStatus(data.orderId)

                } else {
                    console.log(data);
                }
            } catch (e) {
                log(`异常：${JSON.stringify(response.data)}，原因：${data.message}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })
}

async function getOrderStatus(orderId) {
    let tt = ts13();
    var data = qs.stringify({
        'orderId': orderId,
        'adslotId': ''
    });
    return new Promise((resolve) => {
        var options = {
            method: 'POST',
            url: `https://92722.activity-12.m.duiba.com.cn/hdtool/getOrderStatus?_=${tt}`,
            headers: {
                'Host': '92722.activity-12.m.duiba.com.cn',
                'accept': 'application/json',
                'x-requested-with': 'XMLHttpRequest',
                'accept-language': 'zh-cn',
                'origin': 'https://92722.activity-12.m.duiba.com.cn',
                'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148   yongpai/10.0.3',
                'referer': 'https://92722.activity-12.m.duiba.com.cn/hdtool/index?id=251290574515381&dbnewopen&from=login&spm=92722.1.1.1',
                'Cookie': cookies,
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: data
        };
        if (debug) {
            log(`\n【debug】=============== 这是  请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(async function (response) {
            try {
                let data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 返回data==============`);
                    log(JSON.stringify(response.data));
                }
                if (data.success == true) {
                    log(data.lottery.title)
                    let links = data.lottery.link
                    recordId = links.match(/recordId=(.*?)&/)[1]
                    //获取体现key
                    await txkey(data.lottery.link)
                } else {
                    console.log(data);
                }
            } catch (e) {
                log(`异常：${JSON.stringify(response.data)}，原因：${data.message}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })
}

//获取体现key
async function txkey(url) {
    var options = {
        method: 'GET',
        url: 'https:' + url,
        headers: {
            'Host': '92722.activity-12.m.duiba.com.cn',
            'accept': 'application/json',
            'x-requested-with': 'XMLHttpRequest',
            'accept-language': 'zh-cn',
            'origin': 'https://92722.activity-12.m.duiba.com.cn',
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148   yongpai/10.0.3',
            'referer': 'https://92722.activity-12.m.duiba.com.cn/hdtool/index?id=251290574515381&dbnewopen&from=login&spm=92722.1.1.1',
            'Cookie': cookies,
            'content-type': 'application/x-www-form-urlencoded'
        }
    };
    if (debug) {
        log(`\n【debug】=============== 这是  请求 url ===============`);
        log(JSON.stringify(options));
    }
    return new Promise((resolve) => {
        request(options, async (error, response, data) => {
            try {
                //let result= JSON.parse(data);
                if (debug) {
                    log(`\n\n【debug】===============这是 返回result==============`);
                    log(data)
                }
                keyss = ParseHtml(data, 2).defaultToken
                //log('key:' + keyss)

                //获取体现的token
                await gettoken1(url)

            } catch (e) {
                log(`异常，原因：${e}，返回：${data}`)
            } finally {
                resolve();
            }
        })
    })
}
async function gettoken1(url) {
    var options = {
        method: 'POST',
        url: 'https://92722.activity-12.m.duiba.com.cn/ctoken/getToken.do',
        headers: {
            'Host': '92722.activity-12.m.duiba.com.cn',
            'accept': 'application/json',
            'origin': 'https://92722.activity-12.m.duiba.com.cn',
            'referer': 'https:' + url,
            'accept-language': 'zh-cn',
            'x-requested-with': 'XMLHttpRequest',
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148   yongpai/10.0.3',
            'Cookie': cookies,
        },
        body: ''
    };
    if (debug) {
        log(`\n【debug】=============== 这是  请求 url ===============`);
        log(JSON.stringify(options));
    }
    return new Promise((resolve) => {
        request(options, async (error, response, data) => {
            try {
                let result = JSON.parse(data);
                if (debug) {
                    log(`\n\n【debug】===============这是 返回result==============`);
                    log(data)
                }
                if (result.success == true) {
                    tokens = uglifyjs.minify(result.token).code
                    tokens = eval(uglifyjs.minify('window={};' + tokens).code)
                    tokenss = eval(keyss)
                    //log('token:' + tokenss)
                    await doTakePrize(url)
                } else log(result.message)


            } catch (e) {
                log(`异常，原因：${e}`)
            } finally {
                resolve();
            }
        })
    })
}

async function doTakePrize(url) {

    return new Promise((resolve) => {
        var options = {
            method: 'POST',
            url: 'https://92261.activity-14.m.duiba.com.cn/activity/doTakePrize',
            headers: {
                'Host': '92722.activity-12.m.duiba.com.cn',
                'accept': 'application/json',
                'origin': 'https://92722.activity-12.m.duiba.com.cn',
                'referer': 'https:' + url,
                'accept-language': 'zh-cn',
                'x-requested-with': 'XMLHttpRequest',
                'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148   yongpai/10.0.3',
                'Cookie': cookies,
            },
            data: 'alipay=' + dxpay[0] + '&realname=' + encodeURIComponent(dxpay[1]) + '&recordId=' + recordId + '&token=' + tokenss

        };
        if (debug) {
            log(`\n【debug】=============== 这是  请求 url ===============`);
            log(JSON.stringify(options));
        }
        axios.request(options).then(async function (response) {
            try {
                data = response.data;
                if (debug) {
                    log(`\n\n【debug】===============这是 返回data==============`);
                    log(JSON.stringify(response.data));
                }

                if (data.success == true) {
                    log(data.message)
                    msg += '\n' + '结果:' + data.message;
                } else log(data.message)
            } catch (e) {
                log(`异常：${data}，原因：${data.message}`)
            }
        }).catch(function (error) {
            console.error(error);
        }).then(res => {
            //这里处理正确返回
            resolve();
        });
    })

}

function ParseHtml(html, i) {
    let doc = domParser.parseFromString(html);
    let nodes = xpath.select('//script', doc);
    let node = nodes[i].childNodes[0];
    let babelStr;

    let tdom = new JSDOM(`<script>${DealScriptStr(node.data)}</script>`, {
        runScripts: 'dangerously'
    })
    babelStr = tdom.window.getDuibaToken.toString();

    let tokenKey = babelStr.match(/var key = '(.*)?';/)[1];


    let defaultToken = 'window["' + tokenKey + '"]'

    tdom.window.close();
    return {


        defaultToken
    };
}
function DealScriptStr(str) {
    str = str.replace(/\/\*.*?\*\//g, ' ');
    str = str.replace(/\b0(\d+)/g, '0o$1');
    return str;
}


async function Envs() {
    if (ypcj) {
        if (ypcj.indexOf("@") != -1) {
            ypcj.split("@").forEach((item) => {

                ypcjArr.push(item);
            });
        } else if (ypcj.indexOf("\n") != -1) {
            ypcj.split("\n").forEach((item) => {
                ypcjArr.push(item);
            });
        } else {
            ypcjArr.push(ypcj);
        }
    } else {
        log(`\n 【${$.name}】：未填写变量 ypcj`)
        return;
    }
    if (dxpay) {
        if (dxpay.indexOf("\n") != -1) {
            dxpay.split("\n").forEach((item) => {
                dxpayArr.push(item);
            });
        } else {
            dxpayArr.push(dxpay);
        }
    } else {
        log(`\n 【${$.name}】：未填写提现变量 dxpay 将不会到账 一号一个收款支付宝`)

    }
    return true;

}
function addNotifyStr(str, is_log = true) {
    if (is_log) {
        log(`${str}\n`)
    }
    msg += `${str}\n`
}
function RandeCode() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
};
// md5
function MD5Encrypt(a) { function b(a, b) { return a << b | a >>> 32 - b } function c(a, b) { var c, d, e, f, g; return e = 2147483648 & a, f = 2147483648 & b, c = 1073741824 & a, d = 1073741824 & b, g = (1073741823 & a) + (1073741823 & b), c & d ? 2147483648 ^ g ^ e ^ f : c | d ? 1073741824 & g ? 3221225472 ^ g ^ e ^ f : 1073741824 ^ g ^ e ^ f : g ^ e ^ f } function d(a, b, c) { return a & b | ~a & c } function e(a, b, c) { return a & c | b & ~c } function f(a, b, c) { return a ^ b ^ c } function g(a, b, c) { return b ^ (a | ~c) } function h(a, e, f, g, h, i, j) { return a = c(a, c(c(d(e, f, g), h), j)), c(b(a, i), e) } function i(a, d, f, g, h, i, j) { return a = c(a, c(c(e(d, f, g), h), j)), c(b(a, i), d) } function j(a, d, e, g, h, i, j) { return a = c(a, c(c(f(d, e, g), h), j)), c(b(a, i), d) } function k(a, d, e, f, h, i, j) { return a = c(a, c(c(g(d, e, f), h), j)), c(b(a, i), d) } function l(a) { for (var b, c = a.length, d = c + 8, e = (d - d % 64) / 64, f = 16 * (e + 1), g = new Array(f - 1), h = 0, i = 0; c > i;)b = (i - i % 4) / 4, h = i % 4 * 8, g[b] = g[b] | a.charCodeAt(i) << h, i++; return b = (i - i % 4) / 4, h = i % 4 * 8, g[b] = g[b] | 128 << h, g[f - 2] = c << 3, g[f - 1] = c >>> 29, g } function m(a) { var b, c, d = "", e = ""; for (c = 0; 3 >= c; c++)b = a >>> 8 * c & 255, e = "0" + b.toString(16), d += e.substr(e.length - 2, 2); return d } function n(a) { a = a.replace(/\r\n/g, "\n"); for (var b = "", c = 0; c < a.length; c++) { var d = a.charCodeAt(c); 128 > d ? b += String.fromCharCode(d) : d > 127 && 2048 > d ? (b += String.fromCharCode(d >> 6 | 192), b += String.fromCharCode(63 & d | 128)) : (b += String.fromCharCode(d >> 12 | 224), b += String.fromCharCode(d >> 6 & 63 | 128), b += String.fromCharCode(63 & d | 128)) } return b } var o, p, q, r, s, t, u, v, w, x = [], y = 7, z = 12, A = 17, B = 22, C = 5, D = 9, E = 14, F = 20, G = 4, H = 11, I = 16, J = 23, K = 6, L = 10, M = 15, N = 21; for (a = n(a), x = l(a), t = 1732584193, u = 4023233417, v = 2562383102, w = 271733878, o = 0; o < x.length; o += 16)p = t, q = u, r = v, s = w, t = h(t, u, v, w, x[o + 0], y, 3614090360), w = h(w, t, u, v, x[o + 1], z, 3905402710), v = h(v, w, t, u, x[o + 2], A, 606105819), u = h(u, v, w, t, x[o + 3], B, 3250441966), t = h(t, u, v, w, x[o + 4], y, 4118548399), w = h(w, t, u, v, x[o + 5], z, 1200080426), v = h(v, w, t, u, x[o + 6], A, 2821735955), u = h(u, v, w, t, x[o + 7], B, 4249261313), t = h(t, u, v, w, x[o + 8], y, 1770035416), w = h(w, t, u, v, x[o + 9], z, 2336552879), v = h(v, w, t, u, x[o + 10], A, 4294925233), u = h(u, v, w, t, x[o + 11], B, 2304563134), t = h(t, u, v, w, x[o + 12], y, 1804603682), w = h(w, t, u, v, x[o + 13], z, 4254626195), v = h(v, w, t, u, x[o + 14], A, 2792965006), u = h(u, v, w, t, x[o + 15], B, 1236535329), t = i(t, u, v, w, x[o + 1], C, 4129170786), w = i(w, t, u, v, x[o + 6], D, 3225465664), v = i(v, w, t, u, x[o + 11], E, 643717713), u = i(u, v, w, t, x[o + 0], F, 3921069994), t = i(t, u, v, w, x[o + 5], C, 3593408605), w = i(w, t, u, v, x[o + 10], D, 38016083), v = i(v, w, t, u, x[o + 15], E, 3634488961), u = i(u, v, w, t, x[o + 4], F, 3889429448), t = i(t, u, v, w, x[o + 9], C, 568446438), w = i(w, t, u, v, x[o + 14], D, 3275163606), v = i(v, w, t, u, x[o + 3], E, 4107603335), u = i(u, v, w, t, x[o + 8], F, 1163531501), t = i(t, u, v, w, x[o + 13], C, 2850285829), w = i(w, t, u, v, x[o + 2], D, 4243563512), v = i(v, w, t, u, x[o + 7], E, 1735328473), u = i(u, v, w, t, x[o + 12], F, 2368359562), t = j(t, u, v, w, x[o + 5], G, 4294588738), w = j(w, t, u, v, x[o + 8], H, 2272392833), v = j(v, w, t, u, x[o + 11], I, 1839030562), u = j(u, v, w, t, x[o + 14], J, 4259657740), t = j(t, u, v, w, x[o + 1], G, 2763975236), w = j(w, t, u, v, x[o + 4], H, 1272893353), v = j(v, w, t, u, x[o + 7], I, 4139469664), u = j(u, v, w, t, x[o + 10], J, 3200236656), t = j(t, u, v, w, x[o + 13], G, 681279174), w = j(w, t, u, v, x[o + 0], H, 3936430074), v = j(v, w, t, u, x[o + 3], I, 3572445317), u = j(u, v, w, t, x[o + 6], J, 76029189), t = j(t, u, v, w, x[o + 9], G, 3654602809), w = j(w, t, u, v, x[o + 12], H, 3873151461), v = j(v, w, t, u, x[o + 15], I, 530742520), u = j(u, v, w, t, x[o + 2], J, 3299628645), t = k(t, u, v, w, x[o + 0], K, 4096336452), w = k(w, t, u, v, x[o + 7], L, 1126891415), v = k(v, w, t, u, x[o + 14], M, 2878612391), u = k(u, v, w, t, x[o + 5], N, 4237533241), t = k(t, u, v, w, x[o + 12], K, 1700485571), w = k(w, t, u, v, x[o + 3], L, 2399980690), v = k(v, w, t, u, x[o + 10], M, 4293915773), u = k(u, v, w, t, x[o + 1], N, 2240044497), t = k(t, u, v, w, x[o + 8], K, 1873313359), w = k(w, t, u, v, x[o + 15], L, 4264355552), v = k(v, w, t, u, x[o + 6], M, 2734768916), u = k(u, v, w, t, x[o + 13], N, 1309151649), t = k(t, u, v, w, x[o + 4], K, 4149444226), w = k(w, t, u, v, x[o + 11], L, 3174756917), v = k(v, w, t, u, x[o + 2], M, 718787259), u = k(u, v, w, t, x[o + 9], N, 3951481745), t = c(t, p), u = c(u, q), v = c(v, r), w = c(w, s); var O = m(t) + m(u) + m(v) + m(w); return O.toLowerCase() }
// ============================================发送消息============================================ \\
async function SendMsg(message) {
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

function DoubleLog(data) {
    if ($.isNode()) {
        if (data) {
            console.log(`    ${data}`);
            msg += `\n    ${data}`;
        }
    } else {
        console.log(`    ${data}`);
        msg += `\n    ${data}`;
    }

}
/**
 * 随机整数生成
 */
function randomInt(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}


/**
 * 时间戳 13位
 */
function ts13() {
    return Math.round(new Date().getTime()).toString();
}



function Env(t, e) {
    "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);

    class s {
        constructor(t) {
            this.env = t
        }

        send(t, e = "GET") {
            t = "string" == typeof t ? {
                url: t
            } : t;
            let s = this.get;
            return "POST" === e && (s = this.post), new Promise((e, i) => {
                s.call(this, t, (t, s, r) => {
                    t ? i(t) : e(s)
                })
            })
        }

        get(t) {
            return this.send.call(this.env, t)
        }

        post(t) {
            return this.send.call(this.env, t, "POST")
        }
    }

    return new class {
        constructor(t, e) {
            this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`)
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

        toObj(t, e = null) {
            try {
                return JSON.parse(t)
            } catch {
                return e
            }
        }

        toStr(t, e = null) {
            try {
                return JSON.stringify(t)
            } catch {
                return e
            }
        }

        getjson(t, e) {
            let s = e;
            const i = this.getdata(t);
            if (i) try {
                s = JSON.parse(this.getdata(t))
            } catch { }
            return s
        }

        setjson(t, e) {
            try {
                return this.setdata(JSON.stringify(t), e)
            } catch {
                return !1
            }
        }

        getScript(t) {
            return new Promise(e => {
                this.get({
                    url: t
                }, (t, s, i) => e(i))
            })
        }

        runScript(t, e) {
            return new Promise(s => {
                let i = this.getdata("@chavy_boxjs_userCfgs.httpapi");
                i = i ? i.replace(/\n/g, "").trim() : i;
                let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
                r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r;
                const [o, h] = i.split("@"), n = {
                    url: `http://${h}/v1/scripting/evaluate`,
                    body: {
                        script_text: t,
                        mock_type: "cron",
                        timeout: r
                    },
                    headers: {
                        "X-Key": o,
                        Accept: "*/*"
                    }
                };
                this.post(n, (t, e, i) => s(i))
            }).catch(t => this.logErr(t))
        }

        loaddata() {
            if (!this.isNode()) return {}; {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile),
                    e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t),
                    i = !s && this.fs.existsSync(e);
                if (!s && !i) return {}; {
                    const i = s ? t : e;
                    try {
                        return JSON.parse(this.fs.readFileSync(i))
                    } catch (t) {
                        return {}
                    }
                }
            }
        }

        writedata() {
            if (this.isNode()) {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile),
                    e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t),
                    i = !s && this.fs.existsSync(e),
                    r = JSON.stringify(this.data);
                s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r)
            }
        }

        lodash_get(t, e, s) {
            const i = e.replace(/\[(\d+)\]/g, ".$1").split(".");
            let r = t;
            for (const t of i)
                if (r = Object(r)[t], void 0 === r) return s;
            return r
        }

        lodash_set(t, e, s) {
            return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t)
        }

        getdata(t) {
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

        setdata(t, e) {
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

        getval(t) {
            return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null
        }

        setval(t, e) {
            return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null
        }

        initGotEnv(t) {
            this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar))
        }

        get(t, e = (() => { })) {
            t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
                "X-Surge-Skip-Scripting": !1
            })), $httpClient.get(t, (t, s, i) => {
                !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
            })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
                hints: !1
            })), $task.fetch(t).then(t => {
                const {
                    statusCode: s,
                    statusCode: i,
                    headers: r,
                    body: o
                } = t;
                e(null, {
                    status: s,
                    statusCode: i,
                    headers: r,
                    body: o
                }, o)
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
                const {
                    statusCode: s,
                    statusCode: i,
                    headers: r,
                    body: o
                } = t;
                e(null, {
                    status: s,
                    statusCode: i,
                    headers: r,
                    body: o
                }, o)
            }, t => {
                const {
                    message: s,
                    response: i
                } = t;
                e(s, i, i && i.body)
            }))
        }

        post(t, e = (() => { })) {
            if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {
                "X-Surge-Skip-Scripting": !1
            })), $httpClient.post(t, (t, s, i) => {
                !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
            });
            else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {
                hints: !1
            })), $task.fetch(t).then(t => {
                const {
                    statusCode: s,
                    statusCode: i,
                    headers: r,
                    body: o
                } = t;
                e(null, {
                    status: s,
                    statusCode: i,
                    headers: r,
                    body: o
                }, o)
            }, t => e(t));
            else if (this.isNode()) {
                this.initGotEnv(t);
                const {
                    url: s,
                    ...i
                } = t;
                this.got.post(s, i).then(t => {
                    const {
                        statusCode: s,
                        statusCode: i,
                        headers: r,
                        body: o
                    } = t;
                    e(null, {
                        status: s,
                        statusCode: i,
                        headers: r,
                        body: o
                    }, o)
                }, t => {
                    const {
                        message: s,
                        response: i
                    } = t;
                    e(s, i, i && i.body)
                })
            }
        }

        time(t, e = null) {
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

        msg(e = t, s = "", i = "", r) {
            const o = t => {
                if (!t) return t;
                if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? {
                    "open-url": t
                } : this.isSurge() ? {
                    url: t
                } : void 0;
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
            if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) {
                let t = ["", "==============📣系统通知📣=============="];
                t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t)
            }
        }

        log(...t) {
            t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator))
        }

        logErr(t, e) {
            const s = !this.isSurge() && !this.isQuanX() && !this.isLoon();
            s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t)
        }

        wait(t) {
            return new Promise(e => setTimeout(e, t))
        }

        done(t = {}) {
            const e = (new Date).getTime(),
                s = (e - this.startTime) / 1e3;
            this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t)
        }
    }(t, e)
}   