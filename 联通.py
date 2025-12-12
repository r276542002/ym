# -*- coding: utf-8 -*-
import requests
import execjs
import hashlib
import json
import os
import sys
import time
from typing import Optional, Dict, List
from datetime import datetime

# ================= 环境变量配置 =================
# 变量名: UNICOM_ACCOUNTS
# 格式: 手机号#密码@手机号#密码
# 示例: 13812345678#123456@13987654321#654321

# @Date: 2025-12-11
# @LastEditTime: 2025-12-11
#From:yaohuo28507
ENV_VAR_NAME = "UNICOM_ACCOUNTS"
# ===============================================

# 加密脚本常量
RSA_ENCRYPTION_SCRIPT = """
const crypto=require("crypto");const PUBLIC_KEY_BASE64="MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDc+CZK9bBA9IU+gZUOc6FUGu7yO9WpTNB0PzmgFBh96Mg1WrovD1oqZ+eIF4LjvxKXGOdI79JRdve9NPhQo07+uqGQgE4imwNnRx7PFtCRryiIEcUoavuNtuRVoBAm6qdB0SrctgaqGfLgKvZHOnwTjyNqjBUxzMeQlEC2czEMSwIDAQAB";const DEFAULT_SPLIT="#PART#";const max_block_size=117;function rsa_encrypt(plaintext,public_key_base64){const publicKey=Buffer.from(public_key_base64,"base64");const pemPublicKey=`-----BEGIN PUBLIC KEY-----\\n${publicKey.toString("base64").match(/.{1,64}/g).join("\\n")}\\n-----END PUBLIC KEY-----`;if(plaintext.length<=max_block_size){return crypto.publicEncrypt({key:pemPublicKey,padding:crypto.constants.RSA_PKCS1_PADDING},Buffer.from(plaintext))}const encrypted_blocks=[];for(let i=0;i<plaintext.length;i+=max_block_size){const block=plaintext.slice(i,i+max_block_size);const encrypted_block=crypto.publicEncrypt({key:pemPublicKey,padding:crypto.constants.RSA_PKCS1_PADDING},Buffer.from(block));if(i>0){encrypted_blocks.push(Buffer.from(DEFAULT_SPLIT))}encrypted_blocks.push(encrypted_block)}return Buffer.concat(encrypted_blocks)}function mobile_encrypt(data){const encrypted_bytes=rsa_encrypt(data,PUBLIC_KEY_BASE64);return encrypted_bytes.toString("base64").replace(/\\n/g,"")}function password_encrypt(password,random_str="000000"){const combined=password+random_str;return mobile_encrypt(combined)}
"""

class UnicomAuth:
    """联通认证客户端"""
    
    API_URL = "https://m.client.10010.com/mobileService/login.htm"
    
    def __init__(self, mobile: str, password: str):
        self.mobile = mobile
        self.password = password
        self.session = requests.Session()
        self.js_context = self._compile_js()
        self.device_id = hashlib.md5(mobile.encode()).hexdigest()
        
    def _compile_js(self):
        try:
            return execjs.compile(RSA_ENCRYPTION_SCRIPT)
        except Exception as e:
            raise RuntimeError(f"Node.js 环境初始化失败: {e}")

    def _encrypt_data(self, data: str, is_password: bool = False) -> str:
        func_name = 'password_encrypt' if is_password else 'mobile_encrypt'
        try:
            return self.js_context.call(func_name, data)
        except Exception as e:
            raise ValueError(f"数据加密失败 ({func_name}): {e}")

    def _build_headers(self) -> Dict[str, str]:
        app_version = "iphone_c@12.0200"
        device_os = "15.8.3"
        return {
            "Host": "m.client.10010.com",
            "Accept-Encoding": "gzip, deflate, br",
            "Content-Type": "application/x-www-form-urlencoded",
            "Connection": "keep-alive",
            "Accept": "*/*",
            "User-Agent": f"ChinaUnicom4.x/12.2 (com.chinaunicom.mobilebusiness; build:44; iOS {device_os}) Alamofire/4.7.3 unicom{{version:{app_version}}}",
            "Accept-Language": "zh-CN,zh-Hans;q=0.9",
        }

    def _build_payload(self) -> Dict[str, str]:
        encrypted_mobile = self._encrypt_data(self.mobile)
        encrypted_password = self._encrypt_data(self.password, is_password=True)
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        return {
            "voipToken": "citc-default-token-do-not-push",
            "deviceBrand": "iPhone",
            "simOperator": "--,%E4%B8%AD%E5%9B%BD%E7%A7%BB%E5%8A%A8,--,--,--",
            "deviceId": self.device_id,
            "netWay": "wifi",
            "deviceCode": self.device_id,
            "deviceOS": "15.8.3",
            "uniqueIdentifier": self.device_id,
            "latitude": "",
            "version": "iphone_c@12.0200",
            "pip": "192.168.5.14",
            "isFirstInstall": "1",
            "remark4": "",
            "keyVersion": "2",
            "longitude": "",
            "simCount": "1",
            "mobile": encrypted_mobile,
            "isRemberPwd": "false",
            "appId": "06eccb0b7c2fd02bc1bb5e8a9ca2874175f50d8af589ecbd499a7c937a2fda7754dc135192b3745bd20073a687faee1755c67fab695164a090edd8e0da8771b83913890a44ec38e628cf2445bc476dfd",
            "reqtime": timestamp,
            "deviceModel": "iPhone8,2",
            "password": encrypted_password
        }

    def login_and_get_token(self) -> Optional[str]:
        """执行登录并提取 Token"""
        print(f"🔄 [账号: {self.mobile}] 正在尝试登录...")
        
        try:
            response = self.session.post(
                self.API_URL,
                data=self._build_payload(),
                headers=self._build_headers(),
                timeout=15
            )
            
            try:
                resp_json = response.json()
            except json.JSONDecodeError:
                print(f"❌ [账号: {self.mobile}] 响应解析失败，非 JSON 格式")
                return None

            code = str(resp_json.get("code"))
            
            # --- 结果判定逻辑 ---
            if code in ["0", "0000"]:
                token = resp_json.get("token_online")
                if token:
                    print(f"✅ [账号: {self.mobile}] 登录成功！")
                    return token
                else:
                    print(f"⚠️ [账号: {self.mobile}] 登录成功但未找到 'token_online'")
                    return None
            
            # 密码错误
            elif code == "2":
                print(f"❌ [账号: {self.mobile}] 密码错误！请检查您的登录专用密码。")
                return None
            
            # 未设置登录专用密码 (新增)
            elif code == "11":
                print(f"❌ [账号: {self.mobile}] 未设置登录专用密码！")
                print(f"   💡 建议：请前往联通APP设置或重置登录专用密码。")
                return None

            # 触发风控（验证码弹窗）
            elif code == "ECS99999":
                print(f"🛡️ [账号: {self.mobile}] 触发安全风控 (ECS99999)")
                print(f"   💡 建议：检测到验证码弹窗。请手动打开联通APP登录一次以解除风控，或等待一段时间后再试。")
                return None
                
            else:
                desc = resp_json.get("desc", "未知错误")
                print(f"❌ [账号: {self.mobile}] 登录失败: {desc} (Code: {code})")
                return None

        except Exception as e:
            print(f"❌ [账号: {self.mobile}] 发生错误: {e}")
            return None

def parse_env_accounts() -> List[Dict[str, str]]:
    """解析环境变量中的账号信息"""
    env_str = os.getenv(ENV_VAR_NAME)
    if not env_str:
        print(f"❌ 未找到环境变量: {ENV_VAR_NAME}")
        return []
    
    accounts = []
    account_list = env_str.split('@')
    
    for item in account_list:
        if not item.strip():
            continue
        if '#' in item:
            parts = item.split('#')
            if len(parts) >= 2:
                accounts.append({"mobile": parts[0].strip(), "password": parts[1].strip()})
            else:
                print(f"⚠️ 格式错误忽略: {item}")
        else:
            print(f"⚠️ 格式错误忽略 (缺少#): {item}")
            
    return accounts

# ================= 主程序入口 =================
if __name__ == "__main__":
    print("🚀 启动联通 Token 提取脚本 (v1)...")
    
    user_accounts = parse_env_accounts()
    
    if not user_accounts:
        print(f"💡 请设置环境变量 {ENV_VAR_NAME}，格式: 手机号#密码@手机号#密码")
        sys.exit(1)
        
    print(f"📋 共读取到 {len(user_accounts)} 个账号\n")
    
    results = []

    for idx, acc in enumerate(user_accounts):
        print("-" * 40)
        print(f"处理第 {idx + 1} 个账号...")
        
        client = UnicomAuth(mobile=acc["mobile"], password=acc["password"])
        token = client.login_and_get_token()
        
        if token:
            print(f"🎯 Token: {token}")
            results.append(f"账号 {acc['mobile']}: 成功")
        else:
            results.append(f"账号 {acc['mobile']}: 失败")
            
        if idx < len(user_accounts) - 1:
            time.sleep(3) 

    print("\n" + "=" * 40)
    print("🏁 执行完毕")
    print("=" * 40)