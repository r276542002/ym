# !/usr/bin/python3
# -- coding: utf-8 --
# -------------------------------
# 乘龙之家  环境变量添加: clzj_token
# 抓包token
# -------------------------------
# cron 30 12 * * * 乘龙之家.py
import requests
import datetime
import time
import os
import sys
import logging
from os import path

# 创建日志记录器
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
# 创建控制台处理器
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.DEBUG)
# 创建日志格式器
formatter = logging.Formatter('%(message)s')
console_handler.setFormatter(formatter)
# 将处理器添加到日志记录器
logger.addHandler(console_handler)


def load_send():
    global send, mg
    cur_path = path.abspath(path.dirname(__file__))
    if path.exists(cur_path + "/notify.py"):
        try:
            from notify import send
            print("\n 🎉加载通知服务成功！")
        except:
            send = False
            print("\n ⚠️加载通知服务失败~")
    else:
        send = False
        print("\n 加载通知服务失败~")


load_send()
send_msg = ''


def Log(cont):
    global send_msg
    # print(cont)
    send_msg += f'{cont}\n'


# -------------------------分割线------------------------
def setHeaders():
    headers = {
        'Host': 'cvweixin-test.dflzm.com.cn',
        'User-Agent': 'okhttp/3.10.0',
        'Content-Type': 'application/json; charset=utf-8'
    }
    return headers


cookies = []
try:
    if "clzj_token" in os.environ:
        cookies = os.environ["clzj_token"].split("&")
        if len(cookies) > 0:
            logger.info(f"共找到{len(cookies)}个账号 已获取并使用Env环境Cookie")
            logger.info("声明：本脚本为学习python，请勿用于非法用途")
    else:
        logger.info("【提示】变量格式: xxxxx-xxxx-xxxx\n环境变量添加: clzj_token")
        exit(3)
except Exception as e:
    logger.error(f"发生错误：{e}")
    exit(3)


def findByOpenId(i):
    """查询积分"""
    data = cookies[i]
    url = "https://cvweixin-test.dflzm.com.cn/tg-cvcar-api/mini/carMasterVip/findByOpenId"
    response = requests.post(url, data=data, headers=headers)
    return response.json()


def signIn(i):
    """签到"""
    data = cookies[i]
    url = 'https://cvweixin-test.dflzm.com.cn/tg-cvcar-api/mini/integral_record/signIn'
    response = requests.post(url, data=data, headers=headers)
    result = response.json()
    logger.info(f" 账号[{i + 1}]签到: {result['data']}")
    Log(f" 账号[{i + 1}]签到: {result['data']}")


def findPage(i, openid):
    """帖子列表"""
    try:
        data = {
            "params": {
                "loginUserOpenid": f"{cookies[i]}",
                "showTag": "1"
            },
            "page": datetime.datetime.now().day,
            "size": 4
        }
        url = 'https://cvweixin-test.dflzm.com.cn/tg-cvcar-api/mini/news/findPage/'
        response = requests.post(url, json=data, headers=headers)
        result = response.json()
        for content in result['data']['content']:
            logger.info(f" 帖子: {content['title']}")
            news_id = content['id']
            addLikeBest('addLikeBest', news_id, '点赞', openid)
            time.sleep(1.5)
            addIntegral(openid)
            addLikeBest('reduceLikeBest', news_id, '取赞', openid)
    except Exception as err:
        logger.info(err)


def addLikeBest(ul, news_id, name, openid):
    """赞"""
    url = f'https://cvweixin-test.dflzm.com.cn/tg-cvcar-api/mini/news/{ul}?openid={openid}&newsId={news_id}'
    response = requests.post(url, headers=headers)
    result = response.json()
    logger.info(f' {name}: {result["data"]}')

def addIntegral(openid):
    """点赞后的一个请求"""
    data = {
     "openid":f"{openid}",
     "code":"1203"
    }
    url = 'https://cvweixin-test.dflzm.com.cn/tg-cvcar-api/mini/integral_record/addIntegral'
    response = requests.post(url, json=data, headers=headers)


def main(i):
    logger.info("-------------账号检测-------------")
    result = findByOpenId(i)
    data_object = result['data']
    if data_object is None:
        logger.info(f" 账号[{i + 1}]返回对象为空，可能token失效了")
        Log(f' 账号[{i + 1}]返回对象为空，可能token失效了')
    else:
        logger.info(f" 账号[{i + 1}]{result['data']['weChatNickName']} 积分: {result['data']['integral']}")
        openid = result['data']['openid']
        Log(f" 账号[{i + 1}]{result['data']['weChatNickName']} 积分: {result['data']['integral']}")

        if data_object:
            logger.info("\n-------------每日任务-------------")
            signIn(i)
            time.sleep(1.5)
            findPage(i, openid)
            send('乘龙之家通知', send_msg)
            sys.exit(0)


if __name__ == '__main__':
    for i in range(len(cookies)):
        logger.info(f"\n 开始第{i + 1}个账号")
        headers = setHeaders()
        main(i)



