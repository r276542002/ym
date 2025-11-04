#!/usr/bin/env python3

import os
import requests
import time
import json
import ssl
import random
from requests.adapters import HTTPAdapter
from urllib.parse import urlparse

class LegacyRenegotiationAdapter(HTTPAdapter):
    def init_poolmanager(self, *args, **kwargs):
        context = ssl.create_default_context(ssl.Purpose.SERVER_AUTH)
        context.options |= getattr(ssl, "OP_LEGACY_SERVER_CONNECT", 0x4)
        kwargs['ssl_context'] = context
        return super(LegacyRenegotiationAdapter, self).init_poolmanager(*args, **kwargs)

COMMON_PARAMS = {
    'apiVersion': '1.0', 'appKey': '5C6567E5-C48B-40C2-A7C4-65D361151543',
    'appVersion': '9.2.13', 'areaId': '500', 'channelCode': '0,1', 'cityName': '北京市',
    'consentStatus': '2', 'cpsId': 'appstore', 'deviceIdentify': '5C6567E5-C48B-40C2-A7C4-65D361151543',
    'deviceType': 'IPHONE', 'deviceTypeExtra': '0', 'equipmentType': 'iPhone 6s Plus',
    'netEnv': 'WIFI', 'pushToken': '9a6b0095130f0c8ab0863351669ebcefe66dbc8cc88170a943cfd40833cc33d4',
    'screenReslolution': '414.00x736.00', 'supportWebp': '1', 'sysVersion': '15.8.3',
}

NATIVE_HEADERS = {
    'User-Agent': 'jiuxian/9.2.13 (iPhone; iOS 15.8.3; Scale/3.00)',
    'Accept-Language': 'zh-Hans-US;q=1',
    'Accept': 'text/html; q=1.0, text/*; q=0.8, image/gif; q=0.6, image/jpeg; q=0.6, image/*; q=0.5, */*; q=0.1',
    'Connection': 'keep-alive'
}

WEBVIEW_USER_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_8_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko)  oadzApp suptwebp/2 jiuxianApp/9.2.13 from/iOS areaId/500'

class JXClient:
    def __init__(self, username, password):
        self.username = username
        self.password = password
        self.session = requests.Session()
        self.session.mount('https://', LegacyRenegotiationAdapter())
        self.session.headers.update(NATIVE_HEADERS)
        self.token = None

    def login(self):
        print(f"🔑 正在为账号【{self.username}】执行登录...")
        login_url = "https://newappuser.jiuxian.com/user/loginUserNamePassWd.htm"
        login_data = {**COMMON_PARAMS, 'userName': self.username, 'passWord': self.password, 'token': ''}
        headers = {**self.session.headers, 'Host': 'newappuser.jiuxian.com', 'Content-Type': 'application/x-www-form-urlencoded'}
        try:
            response = self.session.post(login_url, data=login_data, headers=headers, timeout=15)
            response.raise_for_status()
            result = response.json()
            if result.get("success") == "1":
                user_info = result.get("result", {}).get("userInfo", {})
                self.token = user_info.get("token")
                print(f"✅ 登录成功！你好，【{user_info.get('uname') or self.username}】")
                return True
            else:
                print(f"❌ 登录失败: {result.get('errMsg') or '未知错误'}")
                return False
        except Exception as e:
            print(f"❌ 登录请求异常: {e}")
            return False

    def query_balance(self, prefix=""):
        if not self.token: return
        url = "https://newappuser.jiuxian.com/user/myWinebibber.htm"
        params = {**COMMON_PARAMS, 'token': self.token}
        headers = {**self.session.headers, 'Host': 'newappuser.jiuxian.com'}
        try:
            response = self.session.get(url, params=params, headers=headers, timeout=15)
            result = response.json()
            if result.get("success") == "1":
                gold_money = result.get("result", {}).get("bibberInfo", {}).get("goldMoney", "查询失败")
                print(f"💰 {prefix}金币余额: {gold_money}")
        except Exception:
             print(f"⚠️ 查询余额失败。")

    def do_daily_tasks(self):
        if not self.token: return
        print("\n--- 🌟 开始执行日常任务 ---")
        self.query_balance(prefix="任务前")
        
        info_url = "https://newappuser.jiuxian.com/memberChannel/memberInfo.htm"
        params = {**COMMON_PARAMS, 'token': self.token}
        headers = {**self.session.headers, 'Host': 'newappuser.jiuxian.com'}
        try:
            response = self.session.get(info_url, params=params, headers=headers, timeout=15)
            response.raise_for_status()
            result = response.json().get("result", {})
            
            if not result.get("isSignTody"):
                print("📌 今日未签到，执行签到...")
                self.do_sign_in()
                time.sleep(random.randint(2, 4))
            else:
                print("👍 今日已签到。")

            response = self.session.get(info_url, params=params, headers=headers, timeout=15)
            result = response.json().get("result", {})
            task_info = result.get("taskChannel", {})
            task_token = task_info.get("taskToken")
            task_list = [task for task in task_info.get("taskList", []) if task.get("state") in [0, 1]]
            
            if not task_list or not task_token:
                print("📦 未发现可执行的任务或所有任务均已完成。")
                return

            print(f"📋 检测到 {len(task_list)} 个待办任务，准备执行...")
            for i, task in enumerate(task_list):
                task_name = task.get("taskName")
                task_state = task.get("state")
                
                print(f"\n▶️ 开始处理任务: 【{task_name}】")
                
                if task_state == 0:
                    if task.get("taskType") == 1:
                        self.do_browse_task(task, task_token)
                    elif task.get("taskType") == 2:
                        self.do_share_task(task, task_token)
                elif task_state == 1:
                    print("   - 任务状态为'已完成,待领取', 直接领取奖励...")
                    self.claim_task_reward(task.get("id"), task_token)

                if i < len(task_list) - 1:
                    delay = random.randint(3, 5)
                    print(f"⏳ 随机等待 {delay} 秒...")
                    time.sleep(delay)
        except Exception as e:
            print(f"❌ 获取任务列表失败: {e}")
        finally:
            print("\n--- ✅ 所有任务执行完毕 ---")
            self.query_balance(prefix="最终")

    def do_sign_in(self):
        url = "https://newappuser.jiuxian.com/memberChannel/userSign.htm"
        params = {**COMMON_PARAMS, 'token': self.token}
        headers = {**self.session.headers, 'Host': 'newappuser.jiuxian.com'}
        try:
            response = self.session.get(url, params=params, headers=headers, timeout=15)
            result = response.json()
            if result.get("success") == "1":
                gold_num = result.get("result", {}).get("receivedGoldNums", "未知")
                print(f"🎉 签到成功！获得 {gold_num} 金币。")
            else:
                print(f"❌ 签到失败: {result.get('errMsg')}")
        except Exception as e:
            print(f"❌ 签到请求异常: {e}")

    def do_browse_task(self, task, task_token):
        print("   - [第1步] 正在访问任务页面...")
        try:
            url, countdown = task.get("url"), task.get("countDown", 15)
            host = urlparse(url).netloc
            headers = {**NATIVE_HEADERS, 'Host': host, 'User-Agent': WEBVIEW_USER_AGENT}
            cookies = {'token': self.token}
            self.session.get(url, headers=headers, cookies=cookies, timeout=15)
            print(f"   - 页面访问成功，等待 {countdown} 秒...")
            for i in range(countdown, 0, -1):
                print(f"\r     倒计时: {i}秒 ", end="")
                time.sleep(1)
            print("\r     倒计时结束。")
        except Exception as e:
            print(f"   - ❌ 访问任务页面失败: {e}")
            return
        if self.mark_task_as_complete(task, task_token):
            time.sleep(random.randint(1, 3))
            self.claim_task_reward(task.get("id"), task_token)
            
    def do_share_task(self, task, task_token):
        print("   - [第1步] 模拟点击分享...")
        if self.mark_task_as_complete(task, task_token):
             time.sleep(random.randint(1, 3))
             self.claim_task_reward(task.get("id"), task_token)

    def mark_task_as_complete(self, task, task_token):
        print("   - [第2步] 正在标记任务为'已完成'...")
        url = "https://shop.jiuxian.com/show/wap/addJinBi.htm"
        data = {'taskId': task.get("id"), 'taskToken': task_token}
        headers = {'Host': 'shop.jiuxian.com', 'Accept': '*/*', 'X-Requested-With': 'XMLHttpRequest','Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8','Origin': 'https://shop.jiuxian.com', 'Referer': task.get("url"),'User-Agent': WEBVIEW_USER_AGENT}
        cookies = {'token': self.token}
        try:
            response = self.session.post(url, data=data, headers=headers, cookies=cookies, timeout=15)
            result = response.json()
            if result.get("code") == 1:
                print("     标记成功。")
                return True
        except Exception: pass
        print(f"   - ❌ 标记任务失败。")
        return False

    def claim_task_reward(self, task_id, task_token):
        print("   - [第3步] 💰 正在领取任务金币...")
        url = "https://newappuser.jiuxian.com/memberChannel/receiveRewards.htm"
        params = {**COMMON_PARAMS, 'token': self.token, 'taskId': task_id, 'taskToken': task_token}
        headers = {**self.session.headers, 'Host': 'newappuser.jiuxian.com'}
        try:
            response = self.session.get(url, params=params, headers=headers, timeout=15)
            result = response.json()
            if result.get("success") == "1":
                gold_num = result.get("result", {}).get("goldNum", "未知")
                print(f"     🎉 领取成功！获得 {gold_num} 金币。")
            else:
                print(f"   - ❌ 领取奖励失败: {result.get('errMsg')}")
        except Exception as e:
            print(f"   - ❌ 领取奖励请求异常: {e}")

    def run(self):
        if self.login():
            time.sleep(random.randint(1, 3))
            self.do_daily_tasks()

def main():
    print("====== 🚀 酒仙网全自动任务 🚀 ======")
    jx_cookie = os.environ.get("JX_COOKIE")
    if not jx_cookie:
        print("🛑 未找到环境变量 JX_COOKIE！")
        return
    accounts = jx_cookie.strip().split("\n")
    print(f"🔧 检测到 {len(accounts)} 个账号，准备执行...")
    for i, account in enumerate(accounts):
        if not account: continue
        print(f"\n--- 🌀 开始执行第 {i + 1} 个账号 🌀 ---")
        try:
            username, password = account.split("#")
            client = JXClient(username.strip(), password.strip())
            client.run()
        except Exception as e:
            print(f"❌ 执行第 {i + 1} 个账号时发生未知错误: {e}")
    print("\n====== 🎉 所有账号执行完毕 🎉 ======")

if __name__ == "__main__":
    main()