#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#变量名：‘DD_auth’
#变量格式：‘Authorization（去掉开头的Bearer ）#备注’，多账号换行
#微信小程序---壹心易购
# ============================================
# 授权密钥（请勿修改此密钥）
# ============================================
AUTH_KEY = "🐧1067957630"
# ============================================

import base64
import zlib
import hashlib
import hmac
import sys
import os

# 加密数据
_ENCRYPTED_DATA = (
        "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"
    )
_HMAC_SIGNATURE = "eWSm1ZdFRMKjKwqqrsbQDHvYuQzjpC/ymEzzIMcMxCQ="


def _verify_key(data: bytes, signature: str, key: str) -> bool:
    """验证密钥和数据完整性"""
    try:
        expected_hmac = base64.b64decode(signature)
        hmac_obj = hmac.new(key.encode('utf-8'), data, hashlib.sha256)
        calculated_hmac = hmac_obj.digest()
        return hmac.compare_digest(calculated_hmac, expected_hmac)
    except Exception:
        return False


def _load_and_run():
    try:
        auth_key = AUTH_KEY
        
        encrypted_bytes = base64.b64decode(_ENCRYPTED_DATA)
        
        if not _verify_key(encrypted_bytes, _HMAC_SIGNATURE, auth_key):
            print("❌ 授权验证失败：密钥错误或数据已被篡改")
            sys.exit(1)
        
        decompressed = zlib.decompress(encrypted_bytes)
        
        code = decompressed.decode('utf-8')
        
        exec(code, globals())
        
    except ValueError as e:
        print(f"❌ 参数错误: {e}")
        sys.exit(1)
    except zlib.error:
        print("❌ 解密失败：数据损坏")
        sys.exit(1)
    except Exception as e:
        print(f"❌ 运行出错: {e}")
        sys.exit(1)


if __name__ == "__main__":
    _load_and_run()
