# -*- coding: utf-8 -*-
"""
cron: 1 9,18 * * * picc农场.py
new Env('picc农场');

wx小程序: picc爱心农场
捉包 https://nongchang.maxrocky.com 域名请求头 或 请求体里的 skey

青龙变量 export piccnongchang="skey" 多账号@隔开
"""
import requests
import logging
import json
from datetime import datetime
import time
import os
from notify import send

# 忽略TLS证书验证警告
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
# 创建日志记录器
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(message)s')
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

cookies = []
try:
    if "piccnongchang" in os.environ:
        cookies = os.environ["piccnongchang"].split("@")
        if len(cookies) > 0:
            logger.info(f"共找到{len(cookies)}个账号 已获取并使用Env环境Cookie")
            logger.info("声明：本脚本为学习python 请勿用于非法用途")
    else:
        logger.info("【提示】变量格式: skey的值\n环境变量添加: piccnongchang")
        exit(3)
except Exception as e:
    logger.error(f"发生错误：{e}")
    exit(3)


# -------------------------分割线-----------\-------------
class miniso:
    @staticmethod
    def setHeaders():
        headers = {
            "Host": "nongchang.maxrocky.com",
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; OPPO R9s Build/NZH54D; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/111.0.5563.116 Mobile Safari/537.36 XWEB/5235 MMWEBSDK/20230701 MMWEBID/1571 MicroMessenger/8.0.40.2420(0x28002855) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 MiniProgramEnv/android",
            "Content-Type": "application/json",
            "Referer":"https://servicewechat.com/wx05f44f40535eada7/96/page-frame.html"
        }
        return headers

    @staticmethod
    def my(headers,i):
        try:
            url = f'https://nongchang.maxrocky.com/index.php?s=index/index/getUserInfo'
            data = {
            "skey": cookies[i]
            }
            response = requests.post(url, headers=headers, json=data)
            return response.json()
        except Exception as e:
            pass

    # 获取任务参数
    @staticmethod
    def getlist(headers, i):
        try:
            url = 'https://nongchang.maxrocky.com/index.php?s=index/index/userConfig'
            data = {
                "skey": cookies[i]
            }
            response = requests.post(url, headers=headers, json=data)
            result = response.json()
            for key, value in result.items():
                miniso.setUserLog(headers, i, key, value["type_name"])
        except Exception as e:
            print(e)
    # 完成任务
    @staticmethod
    def setUserLog(headers, i, key, name):
        try:
            url = f'https://nongchang.maxrocky.com/index.php?s=index/index/setUserLog'
            data = {
                "type": f"{key}",
                "skey": cookies[i]
            }
            response = requests.post(url, headers=headers, json=data)
            result = response.json()
            if result['errCode'] == 0:
                res = f"{name}: 获得{result['getBalance']}公益值"
                logger.info(res)
                log_list.append(res)
            else:
                res = f"{name}: {result['errMsg']}"
                logger.info(res)
                log_list.append(res)
        except Exception as e:
            print(e)

    # 获取地种植情况
    @staticmethod
    def getUserSeed(headers, i):
        try:
            url = 'https://nongchang.maxrocky.com/index.php?s=index/index/getUserSeed'
            data = {
                "skey": cookies[i]
            }
            response = requests.post(url, headers=headers, json=data)
            result = response.json()
            groups = result['data']
            level = result['user']['level']
            if len(groups) > 0:
                current_time = time.time()
                for group in groups.values():
                    for item in group:
                        vname = item['vname']
                        landId = int(item['landId'])
                        collect_time = item['collectTime']
                        formatted_time = datetime.fromtimestamp(collect_time).strftime('%Y-%m-%d %H:%M:%S')
                        logger.info(f'{landId}号田: {vname}')
                        logger.info(f'成熟时间: {formatted_time}')
                        log_list.append(f'{landId}号田: {vname}')
                        log_list.append(f'成熟时间: {formatted_time}')
                        if int(collect_time) < int(current_time):
                            logger.info("已成熟可以收割了！")
                            log_list.append(res)
                            time.sleep(5)
                            miniso.harvest(headers, i, landId, level)
                        else:
                            pass
            else:
                for num in range(1, 3):
                    miniso.getShop(headers, i, num, level)
                    time.sleep(5)
        except Exception as e:
            print(e)

    # 收割
    @staticmethod
    def harvest(headers, i, landId, level):
        try:
            url = f'https://nongchang.maxrocky.com/index.php?s=index/index/setUserLog'
            data = {
                  "type": "harvestFruit",
                  "skey": cookies[i],
                  "lid": f"{landId}",
                  "order_id": landId
                }
            response = requests.post(url, headers=headers, json=data)
            result = response.json()
            if result['errCode'] == 0:
                res = f"收取: 获得{result['type_name']}"
                logger.info(res)
                log_list.append(res)
                time.sleep(10)
                miniso.eradicate(headers, i, landId, level)
            else:
                logger.info(result['errMsg'])
                time.sleep(10)
                miniso.eradicate(headers, i, landId, level)
        except Exception as e:
            print(e)

    # 铲除
    @staticmethod
    def eradicate(headers, i, landId, level):
        try:
            url = f'https://nongchang.maxrocky.com/index.php?s=index/index/shovelFruit'
            data = {
                "skey": cookies[i],
                "lid": f"{landId}",
            }
            response = requests.post(url, headers=headers, json=data)
            result = response.json()
            logger.info(f"铲除: {result['errMsg']}")
            log_list.append(res)
            time.sleep(6)
            miniso.getShop(headers, i, landId, level)
        except Exception as e:
            print(e)

    # 种子商店
    @staticmethod
    def getShop(headers, i, landId, level):
        try:
            url = f'https://nongchang.maxrocky.com/index.php?s=index/index/getShop'
            data = {
                "skey": cookies[i],
                "type": "seeds",
            }
            response = requests.post(url, headers=headers, json=data)
            result = response.json()
            items = [item for item in result['data'] if item['level'] == level]
            max_item = max(items, key=lambda x: x['buyBalance'])
            miniso.buyGoods(headers, i, max_item['id'], max_item['vname'], landId, level)
        except Exception as e:
            print(e)

    # 购买
    @staticmethod
    def buyGoods(headers, i, id, vname, landId, level):
        try:
            url = f'https://nongchang.maxrocky.com/index.php?s=index/index/buyGoods'
            data = {
                "skey": cookies[i],
                "type": "seeds",
                "buyId": id,
                "num": 1
            }
            response = requests.post(url, headers=headers, json=data)
            result = response.json()
            if result['errCode'] == 0:
                res = f"买种: {vname} 花费公益值{result['buyBalance']}"
                logger.info(res)
                log_list.append(res)
                time.sleep(5)
                miniso.userCrops(headers, i, id, landId)
            else:
                time.sleep(5)
                miniso.getShop(headers, i, landId, level-1)
        except Exception as e:
            print(e)

    # 播种
    @staticmethod
    def userCrops(headers, i, id, landId):
        try:
            url = f'https://nongchang.maxrocky.com/index.php?s=index/index/userCrops'
            data = {
                "skey": cookies[i],
                "seedId": id,
                "lid": f"{landId}"
            }
            response = requests.post(url, headers=headers, json=data)
            result = response.json()
            res = f"播种: {result['errMsg']}"
            logger.info(res)
            log_list.append(res)
            time.sleep(5)
            miniso.wateringCrops(headers, i, landId)
        except Exception as e:
            print(e)

    # 浇水
    @staticmethod
    def wateringCrops(headers, i, landId):
        try:
            url = f'https://nongchang.maxrocky.com/index.php?s=index/index/setUserLog'
            data = {
                "type": "wateringCrops",
                "skey": cookies[i],
                "lid": f"{landId}"
            }
            response = requests.post(url, headers=headers, json=data)
            result = response.json()
            if result['errCode'] == 0:
                res = f"浇水: {result['type_name']}"
                logger.info(res)
                log_list.append(res)
            else:
                res = f"浇水: {result['errMsg']}"
                logger.info(res)
        except Exception as e:
            print(e)

    # 获取仓库
    @staticmethod
    def getUserWarehouse(headers, i):
        try:
            url = f'https://nongchang.maxrocky.com/index.php?s=index/index/getUserWarehouse'
            data = {
                "skey": cookies[i],
                "type": "fruit",
                "parentType": "warehouse"
            }
            response = requests.post(url, headers=headers, json=data)
            result = response.json()
            if len(result['data']) > 0:
                for item in result['data']:
                    res = f"仓库: {item['vname']} {item['num']}个"
                    logger.info(res)
                miniso.userSell(headers, i)
            else:
                logger.info('当前仓库为空')
        except Exception as e:
            print(e)

    # 出售
    @staticmethod
    def userSell(headers, i):
        try:
            url = f'https://nongchang.maxrocky.com/index.php?s=index/index/userSell'
            data = {
              "sellType": "fruit",
              "type": "all",
              "skey": cookies[i]
            }
            response = requests.post(url, headers=headers, json=data)
            result = response.json()
            res = f"出售： {result['errMsg']} 获得公益值{result['sellBalance']}"
            logger.info(res)
            log_list.append(res)
        except Exception as e:
            print(e)


if __name__ == '__main__':
    log_list = []  # 存储日志信息的全局变量
    for i in range(len(cookies)):
        head = f"\n------------开始第[{i + 1}]个账号------------"
        logger.info(head)
        log_list.append(head)
        headers = miniso.setHeaders()

        result = miniso.my(headers,i)

        if result is not None and result['errCode'] == 0:
            res = f"{result['data']['nickName']} 历史公益值:{result['data']['total_balance']} 现在公益值:{result['data']['balance']}"
            logger.info(res)
            log_list.append(res)

            head = f"\n------------日常任务------------"
            logger.info(head)
            log_list.append(head)
            now = datetime.now()
            if now.hour == 19:
                miniso.getlist(headers, i)
            else:
                logger.info("当前设置时间8点完成日常任务,请注意定时")
                log_list.append("当前设置时间8点完成日常任务,请注意定时")

            head = f"\n------------庄园详情------------"
            logger.info(head)
            log_list.append(head)
            miniso.getUserSeed(headers, i)
            head = f"\n------------仓库详情------------"
            logger.info(head)
            log_list.append(head)
            miniso.getUserWarehouse(headers, i)

        else:
            res = f"账号查询出错: 可能变量错误或已失效"
            logger.info(res)
            log_list.append(res)

    logger.info("\n============== 推送 ==============")
    send("picc农场", '\n'.join(log_list))