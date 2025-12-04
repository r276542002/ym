# -*- coding: utf-8 -*-
# @Time     : 2025-11-28
# @Author   : chmodxxoo（整合版本）
# @Version  ：4.1
# @Desc     : 蒙娜丽莎小程序：自动获取token → 自动签到，一体化脚本（日志调试 + 精简推送）

import os
import time
import random
import requests

try:
    from notify import send
except ImportError:
    print("未找到 notify.py，将仅在控制台输出日志。")
    def send(title, content):
        print(f"--- 通知 ---\n{title}\n{content}\n-------------")


# ======================================================
#                 第 1 部分：获取 code → tokenStr
# ======================================================
ENV_NAMES = {
    "wxid": "soy_wxid_data",
    "code_url": "soy_codeurl_data"
}

message_list = []

def get_env(name):
    v = os.getenv(name, "").strip()
    if not v:
        message_list.append(f"❌ 环境变量[{name}]为空！")
        return None
    #message_list.append(f"✅ 成功读取环境变量[{name}]")
    return v

def get_wxid_list():
    data = get_env(ENV_NAMES["wxid"])
    if not data:
        return []
    return [x.strip() for x in data.split("\n") if x.strip()]

def get_code(wxid, code_url):
    """用 wxid 换取 code"""
    headers = {"Content-Type": "application/json"}
    payload = {"appid": "wxce6a8f654e81b7a4", "wxid": wxid}
    try:
        r = requests.post(code_url, json=payload, headers=headers, timeout=15).json()
        if r.get("status") is True:
            code = r.get("Data", {}).get("code")
            if code:
                print(f"[INFO] wxid[{wxid}] 获取 code 成功")
                return code
    except Exception as e:
        print(f"[ERROR] wxid[{wxid}] 获取 code 失败：{e}")
    return None

def get_customer_token(code):
    """调用 doAction 获取 CustomerID + tokenStr"""
    url = "https://mcs.monalisagroup.com.cn/member/doAction"
    headers = {
        'Accept-Encoding': 'gzip,compress,br,deflate',
        'content-type': 'application/x-www-form-urlencoded',
        'Connection': 'keep-alive',
        'Referer': 'https://servicewechat.com/wxce6a8f654e81b7a4/462/page-frame.html',
        'Host': 'mcs.monalisagroup.com.cn',
        'User-Agent': 'Mozilla/5.0'
    }

    data = (
        f"brand=MON&webChatName=%E5%BE%AE%E4%BF%A1%E7%94%A8%E6%88%B7&telephone=&code={code}&remarks=&action=addCustomer"
        f"&customerName=%E5%BE%AE%E4%BF%A1%E7%94%A8%E6%88%B7&storeID=&address=-&Province=&City=&Region="
    )

    try:
        r = requests.post(url, headers=headers, data=data, timeout=15).json()
        if "tokenStr" in r and r.get("resultInfo"):
            customer_id = r["resultInfo"][0]["CustomerID"]
            tokenStr = r["tokenStr"]
            print(f"[INFO] 获取成功：CustomerID={customer_id} tokenStr={tokenStr}")
            return f"{customer_id}#{tokenStr}"
    except Exception as e:
        print(f"[ERROR] 获取 tokenStr 失败：{e}")

    return None


# ======================================================
#                   第 2 部分：签到模块
# ======================================================
class MNLS:
    def __init__(self, index, account):
        self.index = index
        self.customerId, self.tokenStr = account.split("#")
        self.mobile = ""
        self.score = 0
        self.msg = ""

        self.headers = {
            "Host": "mcs.monalisagroup.com.cn",
            "Connection": "keep-alive",
            "User-Agent": "Mozilla/5.0",
            "Content-Type": "application/x-www-form-urlencoded",
            "Referer": "https://servicewechat.com/wxce6a8f654e81b7a4/462/page-frame.html",
            "Accept-Encoding": "gzip,compress,br,deflate"
        }

    def hide_phone(self, phone):
        if not phone or len(phone) != 11:
            return phone
        return phone[:3] + "****" + phone[7:]

    def get_info(self):
        url = "https://mcs.monalisagroup.com.cn/member/doAction"
        data = f"brand=MON&customerID={self.customerId}&action=getCustInfoByID"
        try:
            r = requests.post(url, headers=self.headers, data=data).json()
            if r.get("status") == 0:
                info = r["resultInfo"][0]
                self.mobile = self.hide_phone(info["Telephone"])
                self.score = info["Integral"]
                print(f"[INFO] 账号{self.index} 信息获取成功：手机号={self.mobile} 积分={self.score}")
                return True
        except Exception as e:
            print(f"[ERROR] 账号{self.index} 获取信息失败：{e}")
        return False

    def sign(self):
        url = "https://mcs.monalisagroup.com.cn/member/doAction"
        data = (
            f"brand=MON&action=sign&CustomerID={self.customerId}&CustomerName=%E5%BE%AE%E4%BF%A1%E7%94%A8%E6%88%B7&"
            f"StoreID=0&OrganizationID=0&ItemType=002&Brand=MON&tokenStr={self.tokenStr}"
        )
        try:
            r = requests.post(url, headers=self.headers, data=data).json()
            if r.get("status") == 0:
                self.msg = f"签到成功，获得积分：{r.get('resultInfo')}"
            elif r.get("status") == 7:
                self.msg = "今天已经签到过了"
            else:
                self.msg = f"签到失败：{r}"
            print(f"[INFO] 账号{self.index} 签到状态：{self.msg}")
        except Exception as e:
            self.msg = f"签到异常：{e}"
            print(f"[ERROR] 账号{self.index} 签到异常：{e}")

    def run(self):
        self.get_info()
        self.sign()
        self.get_info()  # 更新积分
        return f"账号{self.index} → {self.msg}，积分：{self.score}"


# ======================================================
#                   主流程整合
# ======================================================
if __name__ == "__main__":
    code_url = get_env(ENV_NAMES["code_url"])
    wxid_list = get_wxid_list()

    if not code_url or not wxid_list:
        print("\n".join(message_list))
        exit(0)

    account_list = []

    print("\n===== 开始获取 CustomerID#tokenStr =====")
    for wxid in wxid_list:
        code = get_code(wxid, code_url)
        if not code:
            continue
        account = get_customer_token(code)
        if account:
            account_list.append(account)
        time.sleep(random.uniform(1, 2))

    if not account_list:
        print("❌ 未获取到任何账号 tokenStr")
        exit(0)

    # ======================================================
    #                     进入自动签到
    # ======================================================
    print("\n===== 开始签到 =====")
    msg_final = []
    for idx, acc in enumerate(account_list, start=1):
        result = MNLS(idx, acc).run()
        msg_final.append(result)
        time.sleep(random.uniform(2, 4))

    # 控制台输出完整日志
    output = "\n".join(message_list + msg_final)
    print(output)

    # 最终推送：只包含签到结果和积分
    send("蒙娜丽莎自动签到结果", "\n".join(msg_final))
