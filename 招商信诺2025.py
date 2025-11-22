# -*- coding: utf-8 -*-
"""
作者：行止
cron: 10 7 * * *
new Env('招商信诺');
变量：捉包小程序https://member.cignacmb.com/mini/member/interface/login请求体 多账号换行隔开
格式：export zsxn_param=‘{"unionid":"xxxx-xxx","miniOpenId":"xxxx","mobile":"xxx","miniOpenid":"xxx","sensorDeviceId":"xxx"}’
只能放环境变量
"""
import requests
import logging
import time
import os
from datetime import datetime, date, timedelta
import json
from notify import send
import random
import jwt

# 创建日志记录器
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(message)s')
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)
#生成随机字符串
today = date.today()
formatted_date = today.strftime("%Y-%m-%d")
defaultUA = [
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
cookies = []
try:
    if "zsxn_param" in os.environ:
        cookies = os.environ["zsxn_param"].split("\n")
        if len(cookies) > 0:
            logger.info(f"共找到{len(cookies)}个账号 已获取并使用Env环境Cookie")
            logger.info("声明：本脚本为学习python 请勿用于非法用途")
    else:
        logger.info("【提示】变量格式: Bearer_;\n 环境变量添加: zsxn_token")
        exit(3)
except Exception as e:
    logger.error(f"发生错误：{e}")
    exit(3)


# -------------------------分割线------------------------
class zsxn:#函数家族
    def __init__(self, param, agent_i):
        self.ctime = None
        self.authorization = None
        self.sign = None
        self.openid = None
        self.token = None
        self.param = param
        self.agent = defaultUA[agent_i]

    def getauthorization(self):#获取Authorization
        try:
            headers = {
                "Host": "member.cignacmb.com",
                "Connection": "keep-alive",
                "authorization": "Bearer_",
                "charset": "utf-8",
                "requestchannel": "MINI",
                "User-Agent": self.agent,
                "content-type": "application/x-www-form-urlencoded",
                "Accept-Encoding": "gzip,compress,br,deflate",
                "Referer": "https://servicewechat.com/wxfdbf8b13d7468707/187/page-frame.html"
            }
            url = "https://member.cignacmb.com/mini/member/interface/login"
            data = {"param": self.param, "agent": self.agent}
            requests.packages.urllib3.disable_warnings()
            res = requests.post(url, headers=headers, data=data, verify=False)
            # print(res.json())
            Token = res.headers.get('token')
            # authorization = f'Bearer_{Token}'
            decoded_payload = jwt.decode(Token, options={"verify_signature": False})
            # print(decoded_payload)
            openid = decoded_payload["userId"]
            self.token = Token
            self.authorization = f'Bearer_{self.token}'
            self.openid = openid
        except Exception as e:
            print(e)
    def getInfo(self):#获取每个账号的数据头，不用初始化
        try:
            headers = {
                "Host": "m.cignacmb.com",
                "Connection": "keep-alive",
                "Content-Length": "388",
                "Origin": "https://m.cignacmb.com",
                "Sec-Fetch-Dest": "empty",
                "User-Agent": self.agent,
                "token": "",
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "*/*",
                "X-Requested-With": "com.cignacmb.hmsapp",
                "Sec-Fetch-Site": "same-origin",
                "Sec-Fetch-Mode": "cors",
                "Referer": "https://m.cignacmb.com/campaign/we_media/signin2025/index.html?appVersion=7.3.30&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzaWduRGF0YSI6IkVFRUJGNjZEOTg4NEFEODJBREM5QjcyQjYyNzYxRjAxODc0OTE3IiwibG9naW5UaW1lIjoiMTc2MzcwMDEyNDg0MSIsIm5iZiI6MTc2MzcwMDEyNCwiZXhwdCI6MTc2Mzc4NjUyNDg0MSwiaXNzIjoiSldUIiwiZnJvbSI6IkFQUCIsImV4cCI6MTc2NDkwOTcyNCwidXNlcklkIjoiNzE2Njg4NiIsImlhdCI6MTc2MzcwMDEyNH0.AnbqYHu-3C4STQA59yOKdonlrgenaBeFlayUouKPi14&__t=1763774463675&platform=app",
                "Accept-Encoding": "gzip, deflate",
                "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7"
            }
            cookies = {
                "sensorsdata2015jssdkcross": "%7B%22distinct_id%22%3A%227166886%22%2C%22first_id%22%3A%22%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E7%9B%B4%E6%8E%A5%E6%B5%81%E9%87%8F%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC_%E7%9B%B4%E6%8E%A5%E6%89%93%E5%BC%80%22%2C%22%24latest_referrer%22%3A%22%22%7D%2C%22identities%22%3A%22eyIkaWRlbnRpdHlfY29va2llX2lkIjoiMTlhYTRiODhmMDMzMC0wOTczNjRhNGU4NTRkNzgtMWQzOTdjMDYtMzQzMDg5LTE5YWE0Yjg4ZjA0MCIsIiRpZGVudGl0eV9hbm9ueW1vdXNfaWQiOiI3MTY2ODg2In0%3D%22%2C%22history_login_id%22%3A%7B%22name%22%3A%22%22%2C%22value%22%3A%22%22%7D%2C%22%24device_id%22%3A%2219aa4b88f0330-097364a4e854d78-1d397c06-343089-19aa4b88f040%22%7D",
                "WM_NI": "hm6CN2fu4qTc7Ih29CqZzogRbvHQxGFpbCDUd15ywJ986BFCfjwiG%2FlrIu7Db%2FoUL9hqch6f2D%2Bh7xlhkhvjruLHc6TJk%2BQjiJ2zAkbBjI4wL7TgDuBtJfKkAn2osS6wTk8%3D",
                "WM_NIKE": "9ca17ae2e6ffcda170e2e6eeb6d750f7f19ddad4799ceb8ab2d14e878a8badc2679ab9b98abb5dab95acd3e22af0fea7c3b92aacb3faa4cd3aa6abfc92d769f597a8d3bc49b386b690e65aa2aa88b2fb4d86b0aea4c75fa8effb9af642fbe8faa3c549a6b6b98ac625b0ae8796b650a2f1a1b6cf33acafad89b56ef29ce589b674b0b8a589f562b2ab84a9e23e9896a5ccd462ab96fe9bc461a29ea6aab77d90e99c88c77f82ac8687ca6183b2fe90f259f6a99c8cbb37e2a3",
                "WM_TID": "vmZANhLuqCdBABFEEUeSick1ytH3bIzd"
            }
            url = "https://m.cignacmb.com/projects/we_media/index.php/Signin2025/getInfo"
            data = {
                "code": self.openid,
                "token": self.token,
                "channel": "APP",
                "version": "5001"
            }
            res = requests.post(url, headers=headers,data=data).json()
            Info = res['data']
            sign = Info['sign']
            self.sign = sign
            self.ctime = Info['cTime']
            return res['data']
        except Exception as e:
            print(e)

    def doSignin(self):#签到
        try:
            headers = {
                "Host": "m.cignacmb.com",
                "Connection": "keep-alive",
                "Content-Length": "279",
                "Origin": "https://m.cignacmb.com",
                "Sec-Fetch-Dest": "empty",
                "User-Agent": self.agent,
                "token": "",
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "*/*",
                "X-Requested-With": "com.cignacmb.hmsapp",
                "Sec-Fetch-Site": "same-origin",
                "Sec-Fetch-Mode": "cors",
                "Referer": "https://m.cignacmb.com/campaign/we_media/signin2025/index.html?appVersion=7.3.30&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzaWduRGF0YSI6IkVFRUJGNjZEOTg4NEFEODJBREM5QjcyQjYyNzYxRjAxODc0OTE3IiwibG9naW5UaW1lIjoiMTc2MzcwMDEyNDg0MSIsIm5iZiI6MTc2MzcwMDEyNCwiZXhwdCI6MTc2Mzc4NjUyNDg0MSwiaXNzIjoiSldUIiwiZnJvbSI6IkFQUCIsImV4cCI6MTc2NDkwOTcyNCwidXNlcklkIjoiNzE2Njg4NiIsImlhdCI6MTc2MzcwMDEyNH0.AnbqYHu-3C4STQA59yOKdonlrgenaBeFlayUouKPi14&__t=1763774463675&platform=app",
                "Accept-Encoding": "gzip, deflate",
                "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7"
            }
            cookies = {
                "sensorsdata2015jssdkcross": "%7B%22distinct_id%22%3A%227166886%22%2C%22first_id%22%3A%22%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E7%9B%B4%E6%8E%A5%E6%B5%81%E9%87%8F%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC_%E7%9B%B4%E6%8E%A5%E6%89%93%E5%BC%80%22%2C%22%24latest_referrer%22%3A%22%22%7D%2C%22identities%22%3A%22eyIkaWRlbnRpdHlfY29va2llX2lkIjoiMTlhYTRiODhmMDMzMC0wOTczNjRhNGU4NTRkNzgtMWQzOTdjMDYtMzQzMDg5LTE5YWE0Yjg4ZjA0MCIsIiRpZGVudGl0eV9hbm9ueW1vdXNfaWQiOiI3MTY2ODg2In0%3D%22%2C%22history_login_id%22%3A%7B%22name%22%3A%22%22%2C%22value%22%3A%22%22%7D%2C%22%24device_id%22%3A%2219aa4b88f0330-097364a4e854d78-1d397c06-343089-19aa4b88f040%22%7D",
                "WM_TID": "vmZANhLuqCdBABFEEUeSick1ytH3bIzd",
                "WM_NI": "ugKI18KbcH3S2sktydM4w6lXJF1NUa6HNfh4d8mQhxf3%2Bmg9kFZek%2B0PKsz00VYMIfxTsWidibWAKbD6kVv3HXcs9IERtYILUeCCapJ9MAYVXt8nnjzZp78GpDS6twr%2Fa1o%3D",
                "WM_NIKE": "9ca17ae2e6ffcda170e2e6ee93fc25aaac8e8df36af69e8aa2c84b829e8eacc6729aed99a8d23a87b1a395b72af0fea7c3b92ab7b985aab43489beada9b259f2ada595fc708fecb9d7ef548a9affafd86bf6988287eb40a8e8a3b2eb74a6ede58ee633a99a9686ea21f4908594f93cf48a97aecc6ebc8cbdb8ec70abbe99a2ca6a88eaa5b7f5398c88ad94bc43878ebcbacc4897bb8da4e47c8ae783a2dc5e9cacf88fed62ba86c0d8bb4db49c9dd7f77db2f1afd2ee37e2a3"
            }
            url = "https://m.cignacmb.com/projects/we_media/index.php/Signin2025/doSigninTask"
            data = {
                "openid": self.openid,
                "channel": "APP",
                "cTime": self.ctime,
                "sign": self.sign,
                "sign_time": formatted_date,
                "token": self.token
            }
            res = requests.post(url, headers=headers, data=data).json()
            if res['code'] == 200:
                logger.info(f'签到 {res["message"]}')
                log_list.append(f'签到 {res["message"]}')
            else:
                logger.info(f'签到 {res}')
                log_list.append(f'签到 {res}')
        except Exception as e:
            print(e)

    def getscore(self):#获取诺米数
        try:
            headers = {
                "Host": "member.cignacmb.com",
                "Accept": "application/json, text/plain, */*",
                "Authorization": self.authorization,
                "X-Requested-With": "XMLHttpRequest",
                "Accept-Language": "zh-CN,zh-Hans;q=0.9",
                "Accept-Encoding": "gzip, deflate, br",
                "Content-Type": "application/x-www-form-urlencoded",
                "Origin": "https://member.cignacmb.com",
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;hmsapp/7.2.12;HMS_APP_SESSIONID/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzaWduRGF0YSI6IkVENUJFMjRGMzIwMDVBQjJDMzExRURERUVEODQyMzE1MTk3ODU2IiwidW5pb25JZCI6bnVsbCwibG9naW5UaW1lIjoiMTcyOTM4NzE4NzIxOSIsIm5iZiI6MTcyOTM4NzE4Nywic2Vzc2lvbktleSI6bnVsbCwiZXhwdCI6MTczMDU5Njc4NzIyNiwiaXNzIjoiSldUIiwiY3VzdG9tZXJDb2RlIjpudWxsLCJyZXF1ZXN0Q2hhbm5lbCI6bnVsbCwiZXhwIjoxNzMwNTk2Nzg3LCJ1c2VySWQiOiI3MTY2MjAwIiwiaWF0IjoxNzI5Mzg3MTg3fQ.S9VFbqruagJjPVhPVI7WjA-mQ38rqGf3RBrz7oAXO9Y;",
                "Referer": "https://member.cignacmb.com/mb-web/shop/mod/?appVersion=7.2.12",
                "Connection": "keep-alive"
            }
            cookies = {
                "sajssdk_2015_cross_new_user": "1",
                "sensorsdata2015jssdkcross": "%7B%22distinct_id%22%3A%22192b4420f1e122f-00cb2f44563f11c8-5a615a26-329160-192b4420f1f1644%22%2C%22first_id%22%3A%22%22%2C%22props%22%3A%7B%7D%2C%22identities%22%3A%22eyIkaWRlbnRpdHlfY29va2llX2lkIjoiMTkyYjQ0MjBmMWUxMjJmLTAwY2IyZjQ0NTYzZjExYzgtNWE2MTVhMjYtMzI5MTYwLTE5MmI0NDIwZjFmMTY0NCJ9%22%2C%22history_login_id%22%3A%7B%22name%22%3A%22%22%2C%22value%22%3A%22%22%7D%2C%22%24device_id%22%3A%22192b4420f1e122f-00cb2f44563f11c8-5a615a26-329160-192b4420f1f1644%22%7D",
                "requestChannel": "GHB"
            }
            url = "https://member.cignacmb.com/shop/member/interface/queryScoreStatisticsMonth"
            data = {
                "param": "e30%3D"
            }
            response = requests.post(url, headers=headers, cookies=cookies, data=data)
            res = response.json()
            Data = res['respData']
            TotalScore = Data['totalScore']
            put = f'总诺米数：{TotalScore}'
            logger.info(put)
            log_list.append(put)
        except Exception as e:
            print(e)
    def doBrowseTask(self, taskid):
        try:
            headers = {
                "Host": "m.cignacmb.com",
                "Connection": "keep-alive",
                "Content-Length": "90",
                "Origin": "https://m.cignacmb.com",
                "Sec-Fetch-Dest": "empty",
                "User-Agent": self.agent,
                "token": "",
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "*/*",
                "X-Requested-With": "com.cignacmb.hmsapp",
                "Sec-Fetch-Site": "same-origin",
                "Sec-Fetch-Mode": "cors",
                "Referer": "https://m.cignacmb.com/campaign/we_media/signin2025/index.html?appVersion=7.3.30&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzaWduRGF0YSI6IjAzM0ZERDFFNTBBQUM4NjJCNUZDMTdGMDBFRjQwNTRFODQzOTI3IiwibG9naW5UaW1lIjoiMTc2Mzc3NTcyNTIzMiIsIm5iZiI6MTc2Mzc3NTcyNSwiZXhwdCI6MTc2Mzg2MjEyNTIzMiwiaXNzIjoiSldUIiwiZnJvbSI6IkFQUCIsImV4cCI6MTc2NDk4NTMyNSwidXNlcklkIjoiNzE2Njg2MCIsImlhdCI6MTc2Mzc3NTcyNX0.Yfptv3Ubh2A3eEWHxRJlMSNp0CCwy7724slNjDn_jnI&__t=1763777755277&platform=app",
                "Accept-Encoding": "gzip, deflate",
                "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7"
            }
            cookies = {
                "sajssdk_2015_cross_new_user": "1",
                "sensorsdata2015jssdkcross": "%7B%22distinct_id%22%3A%2219aa93a053cb7-02f5e2ec67aa08e-1e512335-343089-19aa93a053df6%22%2C%22first_id%22%3A%22%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E7%9B%B4%E6%8E%A5%E6%B5%81%E9%87%8F%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC_%E7%9B%B4%E6%8E%A5%E6%89%93%E5%BC%80%22%2C%22%24latest_referrer%22%3A%22%22%7D%2C%22identities%22%3A%22eyIkaWRlbnRpdHlfY29va2llX2lkIjoiMTlhYTkzYTA1M2NiNy0wMmY1ZTJlYzY3YWEwOGUtMWU1MTIzMzUtMzQzMDg5LTE5YWE5M2EwNTNkZjYifQ%3D%3D%22%2C%22history_login_id%22%3A%7B%22name%22%3A%22%22%2C%22value%22%3A%22%22%7D%2C%22%24device_id%22%3A%2219aa93a053cb7-02f5e2ec67aa08e-1e512335-343089-19aa93a053df6%22%7D",
                "WM_NI": "m5YM%2B1YMmsOJTi8GnACpOSnaSJrf%2FOTaw1t2S4gVp8c8LKQlSPrMG2nUAm8bF5Hy2hxzpAQDyKcVlrckv0nDTqPnfS4lvJ79m8KHRcRYRH5GtSB3ZTIoi8Fs96vk8pFaSU8%3D",
                "WM_NIKE": "9ca17ae2e6ffcda170e2e6eeb0e75af59ba497e14ba6b08eb7d45b829e9a86c6739ba78caeee44b591a998c22af0fea7c3b92aafeb97aeaa3b9b93a394ce4298b7f8a8ed4b81b081b4ed6b9196be87ae4598bfb9d2f73a91eca9b7f334a1e884acd4689190beaec63aae8b8f8ebb6a86eb889ab164bca6c0a2d450bb95adb7ef7aa1b5bad1ed5098afa08fe559f8b4baabb633afe885a9d16992879ea9b84db88d8ed4d9608bb1a7d9c579fbeaba8cbb7c86bf9db6bb37e2a3",
                "WM_TID": "8uQ6gq3Yi6RAVEVVEROGzc3TM8C1LgxX"
            }
            url = "https://m.cignacmb.com/projects/we_media/index.php/Signin2025/doBrowseTask"
            data = {
                "openid": self.openid,
                "channel": "APP",
                "cTime": self.ctime,
                "sign": self.sign,
                "taskid": taskid
            }
            res = requests.post(url, headers=headers, cookies=cookies, data=data).json()
            return res
        except Exception as e:
            print(e)


if __name__ == '__main__':
    log_list = []  # 存储日志信息的全局变量
    for i in range(len(cookies)):
        logger.info(f"\n开始第{i + 1}个账号")
        log_list.append(f"\n开始第{i + 1}个账号")
        logger.info("-------------任务开始-------------")
        ck = cookies[i]
        random_number = random.randint(0, 21)
        ZSXN = zsxn(ck, random_number)
        ZSXN.getauthorization()
        ZSXN.getscore()
        Info = ZSXN.getInfo()
        continuousSignDays = Info['continuousSignDays']
        logger.info(f"连续签到天数{continuousSignDays}")
        log_list.append(f"连续签到天数{continuousSignDays}")
        ZSXN.doSignin()
        tasklist = []
        for task in Info['tasks']:
            if task['status'] == 0:
                tasklist.append(task)
        if len(tasklist) != 0:
            for task in tasklist:
                taskid = task['id']
                res = ZSXN.doBrowseTask(taskid)
                logger.info(f"{task['reward_copy']} {res['message']}")
                log_list.append(f"{task['reward_copy']} {res['message']}")
                time.sleep(5)
        else:
            logger.info("可执行任务已完成")
        time.sleep(5)

    logger.info("\n============== 推送 ==============")
    send("招商信诺", '\n'.join(log_list))
