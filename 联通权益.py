#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# 中国联通权益超市自动任务脚本（修复版）
# 账号变量格式: UNICOM_ACCOUNTS=手机号1#ecs_token1\n手机号2#ecs_token2\n...
# 或者: UNICOM_ACCOUNTS=手机号1#token_online1#appid1\n手机号2#token_online2#appid2\n...

import os
import io
import re
import sys
import time
import json
import base64
import random
import logging
import binascii
import requests
import threading
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from typing import Optional
from notify import send
from threading import Event
from collections import deque
from datetime import datetime
from datetime import datetime, timedelta
from prettytable import PrettyTable
from typing import List, Optional
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad
from urllib.parse import urlparse, parse_qs
from requests.exceptions import ReadTimeout
from requests.exceptions import RequestException, ConnectionError, Timeout, HTTPError
from urllib3.exceptions import NameResolutionError, NewConnectionError
from requests.exceptions import RequestException, HTTPError
from urllib3.exceptions import NewConnectionError, MaxRetryError, NameResolutionError

# 配置开关
GrantPrize = True  # 权益超市自动领奖：启用True/禁用False

# ================================================
# 日志配置
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(message)s'
)

class MillisecondFormatter(logging.Formatter):
    def formatTime(self, record, datefmt=None):
        if datefmt is None:
            datefmt = "%Y-%m-%d %H:%M:%S.%f"
        dt = datetime.fromtimestamp(record.created)
        s = dt.strftime(datefmt)
        return s[:-3]  # 毫秒精度

# 应用毫秒格式到控制台 handler
console_handler = logging.getLogger().handlers[0]
console_handler.setFormatter(MillisecondFormatter('[%(asctime)s] %(message)s'))

# 线程安全封装打印
def log_with_time(message: str, proxy: Optional[str] = None):
    if proxy:
        message = f"[代理：{proxy}] {message}"
    logging.info(message)

# 全局会话
shared_session = requests.Session()
adapter = HTTPAdapter(pool_connections=100, pool_maxsize=100, max_retries=Retry(total=3, backoff_factor=0.3))
shared_session.mount("http://", adapter)
shared_session.mount("https://", adapter)

# ================================================
# 代理管理类
class ProxyManager:
    def __init__(self, get_proxy_func, limit=10):
        self.get_proxy_func = get_proxy_func
        self.limit = limit
        self.request_count = 0
        self.current_proxy = self.get_proxy_func()
        self.lock = threading.Lock()
        self.recent_proxies = deque(maxlen=5)

    def get_proxy(self):
        with self.lock:
            if self.current_proxy is None:
                return None

            if self.request_count >= self.limit:
                self.switch_proxy()

            proxy_to_use = self.current_proxy
            self.request_count += 1

            return {"http": f"http://{proxy_to_use}", "https": f"http://{proxy_to_use}"}

    def switch_proxy(self):
        old = self.current_proxy
        new_proxy = None

        for _ in range(5):
            candidate = self.get_proxy_func()
            if candidate and candidate not in self.recent_proxies:
                new_proxy = candidate
                break
            time.sleep(0.1)

        if not new_proxy:
            new_proxy = self.get_proxy_func()

        self.recent_proxies.append(new_proxy)
        self.current_proxy = new_proxy
        self.request_count = 0
        if self.current_proxy:
            log_with_time(f"🔁 切换代理：{old} ➡️ {self.current_proxy}")

# ================================================
# 代理IP获取函数
def get_proxyIP(max_retries=3):
    proxy_url = os.getenv("ProxyIP")
    if not proxy_url:
        return None

    for attempt in range(max_retries):
        try:
            response = requests.get(proxy_url, timeout=5)
            proxy_ip = response.text.strip()
            if re.match(r'^\d+\.\d+\.\d+\.\d+:\d+$', proxy_ip):
                return proxy_ip

            res = response.json()
            if res.get('code') == -1:
                print(f"[代理异常] {res.get('message', '未知错误')}")
                return None

        except Exception as e:
            print(f"[提取代理失败] 第 {attempt + 1} 次重试: {e}")
            time.sleep(1)
    return None

# ================================================
# 主要API类
class ChinaunicomAPI:
    def __init__(self, account_list: List[str]):
        self.GrantPrize = GrantPrize
        self.phone_list = []
        self.ecs_token_list = []  # 存储ecs_token
        self.online_token_list = []  # 存储token_online
        self.appid_list = []  # 存储appid
        self.user_data: List[Optional[dict]] = []
        self.proxies = {}
        
        # 解析账号信息（支持两种格式）
        for entry in account_list:
            entry = entry.strip()
            if not entry:
                continue

            parts = entry.split('#')
            if len(parts) == 2:
                # 格式1: 手机号#ecs_token
                self.phone_list.append(parts[0])
                self.ecs_token_list.append(parts[1])
                self.online_token_list.append(None)
                self.appid_list.append(None)
            elif len(parts) >= 3:
                # 格式2: 手机号#token_online#appid
                self.phone_list.append(parts[0])
                self.ecs_token_list.append(None)
                self.online_token_list.append(parts[1])
                self.appid_list.append(parts[2])

        # 为每个手机号创建代理管理器
        for phone in self.phone_list:
            masked_phone = f"{phone[:3]}****{phone[-4:]}"
            self.proxies[masked_phone] = ProxyManager(get_proxyIP)

    # ============================================
    # 请求头封装
    def get_headers(self, Isheaders=None):
        if Isheaders == 1:
            headers={
                "User-Agent": "Mozilla/5.0 (Linux; Android 11; Redmi Note 10 Pro Build/RP1A.201005.004; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/92.0.4515.159 Mobile Safari/537.36",
                "Accept": "application/json, text/plain, */*",
                "Accept-Encoding": "gzip, deflate, br, zstd",
                "Pragma": "no-cache",
                "Cache-Control": "no-cache",
                "sec-ch-ua": '"Android WebView";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
                "accesstoken": "ODZERTZCMjA1NTg1MTFFNDNFMThDRDYw",
                "Content-Type": "application/json;charset=UTF-8",
                "Origin": "https://10010.woread.com.cn",
                "X-Requested-With": "com.sinovatech.unicom.ui",
                "Referer": "https://10010.woread.com.cn/ng_woread/",
                "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7"
            }
        elif Isheaders == 2:
            headers={
                'User-Agent': "Dalvik/2.1.0 (Linux; U; Android 12; leijun Pro Build/SKQ1.22013.001);unicom{version:android@11.0702}",
                'Connection': "Keep-Alive",
                'Accept-Encoding': "gzip"
            }
        else:
            headers = {
                "User-Agent": "Mozilla/5.0 (Linux; Android 11; Redmi Note 10 Pro Build/RP1A.201005.004; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/92.0.4515.159 Mobile Safari/537.36",
                "Accept": "application/json, text/plain, */*",
                "Accept-Encoding": "gzip, deflate, br, zstd",
                "Cache-Control": "no-cache",
                "Pragma": "no-cache",
                "sec-ch-ua": '"Android WebView";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
                "Content-Type": "application/json;charset=UTF-8",
                "Origin": "https://10010.woread.com.cn",
                "X-Requested-With": "com.sinovatech.unicom.ui",
                "Referer": "https://10010.woread.com.cn/ng_woread/",
                "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7"
            }

        return headers

    # ============================================
    # 请求封装
    def do_send(self, url: str, method: str = "GET", data: Optional[dict] = None, 
                headers: Optional[dict] = None, timeout: float = 10, max_retries: int = 3, 
                show_resp: bool = False, proxy_manager: Optional[ProxyManager] = None, 
                allow_redirects: bool = True) -> requests.Response:
        
        for attempt in range(1, max_retries + 1):
            try:
                proxies = proxy_manager.get_proxy() if proxy_manager else None
                
                if method.upper() == "GET":
                    if data:
                        params = data
                        resp = shared_session.get(url, params=params, headers=headers, timeout=timeout, 
                                                proxies=proxies, allow_redirects=allow_redirects)
                    else:
                        resp = shared_session.get(url, headers=headers, timeout=timeout, 
                                                proxies=proxies, allow_redirects=allow_redirects)
                else:
                    if data and isinstance(data, dict):
                        if "token_online" in data:
                            resp = shared_session.request(method=method.upper(), url=url, data=data, 
                                                        headers=headers, timeout=timeout, 
                                                        proxies=proxies, allow_redirects=allow_redirects)
                        else:
                            resp = shared_session.request(method=method.upper(), url=url, json=data, 
                                                        headers=headers, timeout=timeout, 
                                                        proxies=proxies, allow_redirects=allow_redirects)
                    else:
                        resp = shared_session.request(method=method.upper(), url=url, headers=headers, 
                                                    timeout=timeout, proxies=proxies, 
                                                    allow_redirects=allow_redirects)

                if show_resp:
                    print(f"[Response][{resp.status_code}] {resp.text}")

                resp.raise_for_status()
                
                if resp.status_code == 302:
                    return resp
                else:
                    return resp.json()
                
            except requests.exceptions.HTTPError as e:
                raise

            except ConnectionError as e:
                if isinstance(e.args[0], NewConnectionError):
                    print(f"🔴 连接失败，第{attempt}次重试")

            except requests.exceptions.ConnectionError as e:
                if hasattr(e, 'args') and len(e.args) > 0 and isinstance(e.args[0], NameResolutionError):
                    print(f"🔴 DNS解析失败: 第{attempt}次重试")

            except ReadTimeout as e:
                print(f"🔴 请求超时，第{attempt}次重试")

            except requests.exceptions.RequestException as e:
                print(f"🔴 请求失败，第{attempt} 次重试: {e}")
                if attempt == max_retries:
                    print("🔴 已达最大重试次数")
                    raise

    # ============================================
    # 权益超市相关方法
    
    # 获取Ticket
    def get_ticket(self, ecs_token):
        url = "https://m.client.10010.com/mobileService/openPlatform/openPlatLineNew.htm?to_url=https://contact.bol.wo.cn/market"
        headers = self.get_headers(Isheaders=2)
        headers['Cookie'] = 'ecs_token=' + ecs_token
        
        try:
            resp = self.do_send(url, method="GET", headers=headers, allow_redirects=False, show_resp=False)
            if hasattr(resp, 'status_code') and resp.status_code == 302:
                location = resp.headers.get("Location", "")
                parsed_url = urlparse(location)
                query_params = parse_qs(parsed_url.query)
                ticket_list = query_params.get("ticket")
                ticket = ticket_list[0] if ticket_list else None
                if ticket:
                    return ticket

        except Exception as e:
            print(f"获取Ticket异常: {str(e)}")
            return None

    # 获取userToken
    def get_userToken(self, ticket):
        url = f"https://backward.bol.wo.cn/prod-api/auth/marketUnicomLogin?ticket={ticket}"
        headers = self.get_headers(Isheaders=2)
        
        try:
            resp = self.do_send(url, method="POST", headers=headers, show_resp=False)
            userToken = resp.get("data", {}).get("token")
            if userToken:
                return userToken
        
        except Exception as e:
            print(f"获取userToken异常: {str(e)}")
            return None

    # 获取所有活动任务
    def get_AllActivityTasks(self, ecs_token, userToken):
        url = "https://backward.bol.wo.cn/prod-api/promotion/activityTask/getAllActivityTasks?activityId=12"
        headers = self.get_headers(Isheaders=2)
        headers['Cookie'] = 'ecs_token=' + ecs_token
        headers['Authorization'] = 'Bearer ' + userToken
        shareList = []
        
        try:
            resp = self.do_send(url, method="GET", headers=headers, show_resp=False)
            active_id_listarr = resp.get("data", {})
            for item in active_id_listarr.get("activityTaskUserDetailVOList", []):
                share_info = {
                    "param": item.get("param1"),
                    "activityId": item.get("activityId"),
                    "name": item.get("name"),
                    "triggerTime": item.get("triggerTime"),
                    "triggeredTime": item.get("triggeredTime")
                }
                shareList.append(share_info)

            return shareList

        except Exception as e:
            print(f"❌ 权益超市查询任务异常: {str(e)}")
            return None

    # 执行任务
    def do_ShareList(self, shareList, userToken):
        try:
            for task in shareList:
                share_name = task.get("name")
                share_param = task.get("param")
                target_count = int(task.get("triggerTime", 1))
                current_count = int(task.get("triggeredTime", 0))
                
                if ("购买" in share_name or "秒杀" in share_name):
                    print(f"🚫 {share_name} [PASS]")
                    continue
                    
                if current_count >= target_count:
                    print(f"✅ {share_name} 已完成")
                    continue

                url = ""
                if share_param:
                    if "浏览" in share_name or "查看" in share_name:
                        url = f"https://backward.bol.wo.cn/prod-api/promotion/activityTaskShare/checkView?checkKey={share_param}"
                    elif "分享" in share_name:
                        url = f"https://backward.bol.wo.cn/prod-api/promotion/activityTaskShare/checkShare?checkKey={share_param}"

                if url:
                    headers = self.get_headers(Isheaders=2)
                    headers['Authorization'] = 'Bearer ' + userToken
                    resp = self.do_send(url, method="POST", headers=headers, show_resp=False)
                    if resp and resp.get("code") == 200:
                        print(f"✅ {share_name} 执行成功")

        except Exception as e:
            print(f"❌ 权益超市任务执行异常: {str(e)}")

    # 查询抽奖池
    def get_Raffle(self, userToken):
        url = "https://backward.bol.wo.cn/prod-api/promotion/home/raffleActivity/prizeList?id=12"
        headers = self.get_headers(Isheaders=2)
        headers['Authorization'] = 'Bearer ' + userToken
        
        try:
            resp = self.do_send(url, method="POST", headers=headers, show_resp=False)
            
            keywords = ['月卡', '月会员', '月度', 'VIP月', '一个月']
            live_prizes = []
            
            if 'data' in resp and isinstance(resp['data'], list):
                for prize in resp['data']:
                    name = prize.get('name', '')
                    if not any(kw in name for kw in keywords):
                        continue
                    try:
                        daily_limit = int(prize.get('dailyPrizeLimit', 0))
                        quantity = int(prize.get('quantity', 0))
                        prob = float(prize.get('probability', 0))
                    except:
                        daily_limit = 0
                        quantity = 0
                        prob = 0.0

                    if daily_limit > 0 and quantity > 0:
                        live_prizes.append({
                            'name': name,
                            'daily': daily_limit,
                            'total': quantity,
                            'prob': prob
                        })
            
            if live_prizes:
                print("📢 当前已放水！可抽有库存奖品👇👇👇")
                for item in live_prizes:
                    print(f"    {item['name']}")
                    print(f"    └─ 今日投放: {item['daily']} | 总库存: {item['total']} | 概率: {item['prob'] * 100:.1f}%")
                
                return True
            else:
                print("📢 当前未放水！终止抽奖😡😡😡")
                return False

        except Exception as e:
            print(f"❌ 权益超市抽奖查询异常: {str(e)}")
            return False

    # 查询抽奖次数
    def get_raffle_count(self, userToken):
        url = "https://backward.bol.wo.cn/prod-api/promotion/home/raffleActivity/getUserRaffleCount?id=12"
        headers = self.get_headers(Isheaders=2)
        headers['Authorization'] = 'Bearer ' + userToken
        
        try:
            resp = self.do_send(url, method="POST", headers=headers, show_resp=False)
            count = resp.get("data", 0)
            print(f"✅ 当前抽奖次数：{count}")
            
            while count > 0:
                print(f"🎯 第{abs(count - resp.get('data', 0)) + 1}次抽奖")
                success = self.get_userRaffle(userToken)
                if not success:
                    break
                count -= 1
                print(f"剩余抽奖次数: {count}")

        except Exception as e:
            print(f"❌ 权益超市查询抽奖次数异常: {str(e)}")

    # 执行抽奖
    def get_userRaffle(self, userToken):
        url = "https://backward.bol.wo.cn/prod-api/promotion/home/raffleActivity/userRaffle?id=12&channel="
        headers = self.get_headers(Isheaders=2)
        headers['Authorization'] = 'Bearer ' + userToken
        
        try:
            resp = self.do_send(url, method="POST", headers=headers, show_resp=False)
            if resp.get("code") == 200:
                if resp.get("data"):
                    lotteryRecordId = resp.get("data").get("lotteryRecordId")
                    prizesName = resp.get("data").get("prizesName")
                    message = resp.get("data").get("message")
                    
                    if prizesName:
                        print(f"✅ 抽奖成功 {prizesName}")
                    else:
                        print(f"⚠️ 抽奖成功,但是{message}")
                    
                    if self.GrantPrize:
                        print(f"✅ 已配置自动领奖")
                        self.get_grantPrize(userToken, lotteryRecordId, prizesName)

                    return True
            
            if resp.get("code") == 500:
                return self.get_validateCaptcha(userToken)

        except Exception as e:
            print(f"❌ 权益超市抽奖异常: {str(e)}")
            return False

    # 人机验证
    def get_validateCaptcha(self, userToken):
        url = "https://backward.bol.wo.cn/prod-api/promotion/home/raffleActivity/validateCaptcha?id=12"
        headers = self.get_headers(Isheaders=2)
        headers['Authorization'] = 'Bearer ' + userToken
        
        try:
            resp = self.do_send(url, method="POST", headers=headers, show_resp=False)
            if resp.get("code") == 200:
                return self.get_userRaffle(userToken)

        except Exception as e:
            print(f"❌ 权益超市人机验证异常: {str(e)}")
            return False

    # 查询我的奖品
    def get_MyPrize(self, userToken):
        url = "https://backward.bol.wo.cn/prod-api/promotion/home/raffleActivity/getMyPrize"
        headers = self.get_headers(Isheaders=2)
        headers['Authorization'] = 'Bearer ' + userToken
        data = {
            "id": 12,
            "type": 0,
            "page": 1,
            "limit": 100
        }
        
        try:
            resp = self.do_send(url, method="POST", data=data, headers=headers, show_resp=False)
            lists = resp.get("data", {}).get("list", [])
            table = PrettyTable()
            lottery_record_ids = []
            
            if lists:
                table.title = f"未领取奖品信息"
                table.field_names = ["商品名称", "商品ID", "获得时间", "失效时间"]
                
                for item in lists:
                    lotteryRecordId = item.get("id")
                    prizesName = item.get("prizesName")
                    createTime = item.get("createTime")
                    deadline = item.get("deadline")
                    table.add_row([prizesName, lotteryRecordId, createTime, deadline])
                    lottery_record_ids.append((lotteryRecordId, prizesName))
                
                print(table)

                if self.GrantPrize:
                    print(f"✅ 已配置自动领奖")
                    for lottery_id, prizesName in lottery_record_ids:
                        self.get_grantPrize(userToken, lottery_id, prizesName)

        except Exception as e:
            print(f"❌ 权益超市待领奖品查询异常: {str(e)}")

    # 领取奖品
    def get_grantPrize(self, userToken, lotteryRecordId, prizesName):
        url = "https://backward.bol.wo.cn/prod-api/promotion/home/raffleActivity/grantPrize?activityId=12"
        headers = self.get_headers(Isheaders=2)
        headers['Accept'] = "application/json, text/plain, */*"
        headers['Accept-Encoding'] = "gzip, deflate, br, zstd"
        headers['Content-Type'] = "application/json"
        headers['Authorization'] = 'Bearer ' + userToken
        data = {"recordId": lotteryRecordId}
        
        try:
            resp = self.do_send(url, method="POST", data=data, headers=headers, show_resp=False)
            if resp.get("code") == 200:
                print(f"✅ {prizesName} 领取成功")

        except Exception as e:
            print(f"❌ 权益超市领奖异常: {str(e)}")

    # ============================================
    # 权益超市主任务流程
    def QYCS_task(self, phone: str, idx: int):
        masked_phone = f"{phone[:3]}****{phone[-4:]}"
        
        # 获取账号信息
        ecs_token = self.ecs_token_list[idx]
        online_token = self.online_token_list[idx]
        appid = self.appid_list[idx]
        
        print(f"📱 账号: {masked_phone}")
        
        # 根据登录凭证类型选择登录方式
        if ecs_token:
            # 方式1: 使用ecs_token
            print(f"🔑 使用ecs_token登录方式")
            final_ecs_token = ecs_token
        elif online_token and appid:
            # 方式2: 使用token_online和appid
            print(f"🔑 使用token_online+appid登录方式")
            final_ecs_token = self.login_with_token(phone, online_token, appid, masked_phone)
            if not final_ecs_token:
                print(f"❌ {masked_phone} 登录失败")
                return
        else:
            print(f"❌ {masked_phone} 未提供有效登录凭证")
            return
        
        print(f"✅ {masked_phone} 登录凭证获取成功，开始执行任务...")
        
        # 步骤1: 获取ticket
        ticket = self.get_ticket(final_ecs_token)
        if not ticket:
            print(f"❌ {masked_phone} 获取ticket失败")
            return
        
        print(f"✅ {masked_phone} 获取ticket成功")
        
        # 步骤2: 获取userToken
        userToken = self.get_userToken(ticket)
        if not userToken:
            print(f"❌ {masked_phone} 获取用户令牌失败")
            return
        
        print(f"✅ {masked_phone} 获取userToken成功")
        
        # 步骤3: 获取任务列表并执行
        shareList = self.get_AllActivityTasks(final_ecs_token, userToken)
        if shareList:
            print(f"📋 {masked_phone} 获取到 {len(shareList)} 个任务")
            self.do_ShareList(shareList, userToken)
        else:
            print(f"⚠️ {masked_phone} 未获取到任务列表")
        
        # 步骤4: 检查抽奖池并抽奖
        print(f"🎲 {masked_phone} 检查抽奖池...")
        if self.get_Raffle(userToken):
            self.get_raffle_count(userToken)
        
        # 步骤5: 查询并领取奖品
        print(f"🎁 {masked_phone} 查询待领奖品...")
        self.get_MyPrize(userToken)
        
        print(f"✅ {masked_phone} 所有任务执行完成")

    # 使用token_online登录
    def login_with_token(self, phone: str, token_online: str, appid: str, masked_phone: str):
        try:
            url = "https://m.client.10010.com/mobileService/onLine.htm"
            headers = self.get_headers(Isheaders=2)
            data = {
                "isFirstInstall": "1",
                "reqtime": str(int(time.time() * 1000)),
                "netWay": "Wifi",
                "version": "android@11.0000",
                "token_online": token_online,
                "provinceChanel": "general",
                "appId": appid,
                "deviceModel": "23013RK75C",
                "step": "welcom",
                "androidId": "caaa7b5f2b58b3eb",
                "deviceBrand": "Xiaomi",
                "flushkey": "1"
            }
            resp = self.do_send(url, method="POST", data=data, headers=headers, show_resp=False)
            ecs_token = resp.get("ecs_token")
            if ecs_token:
                print(f"✅ {masked_phone} token登录成功")
                return ecs_token
            else:
                print(f"❌ {masked_phone} token登录失败: {resp}")
                return None

        except Exception as e:
            print(f"❌ {masked_phone} token登录异常: {str(e)}")
            return None

    # ============================================
    # 主程序入口
    def TASK(self):
        if not self.phone_list:
            print("❌ 未检测到有效账号")
            return
            
        print(f"✅ 检测到 {len(self.phone_list)} 个账号")
        
        for idx, phone in enumerate(self.phone_list, 1):
            print(f"\n{'='*60}")
            print(f"========== 第 {idx} 个账号 ==========")
            print(f"{'='*60}")
            
            self.QYCS_task(phone, idx - 1)
            
            # 账号间延迟
            if idx < len(self.phone_list):
                print(f"⏳ 等待 5 秒后执行下一个账号...")
                time.sleep(5)

# ================================================
# 程序入口
if __name__ == "__main__":
    # 读取环境变量
    raw = os.getenv("UNICOM_ACCOUNTS", "").strip()
    if not raw:
        print("❌ 未检测到 UNICOM_ACCOUNTS 环境变量")
        print("💡 请设置环境变量，支持以下格式：")
        print("   格式1: 手机号1#ecs_token1")
        print("   格式2: 手机号1#token_online1#appid1")
        print("   多账号用换行分隔")
        sys.exit(1)

    # 解析账号列表
    account_list = [line for line in raw.splitlines() if line.strip()]
    if not account_list:
        print("❌ 未检测到有效账号信息")
        sys.exit(1)

    # 创建API实例并运行
    api = ChinaunicomAPI(account_list)
    api.TASK()
    
    print(f"\n{'='*60}")
    print("✅ 所有账号任务执行完成！")
    print(f"{'='*60}")
