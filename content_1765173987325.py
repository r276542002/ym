#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
#变量名：'DD_auth'
#变量格式：'Authorization（去掉开头的Bearer ）#备注'，多账号换行
#微信小程序---壹心易购
 ____       _      _   _ 
|  _ \     / \    | \ | |
| | | |   / _ \   |  \| |
| |_| |  / ___ \  | |\  |
|____/  /_/   \_\ |_| \_|

本工具仅用于学习 Python 加密与逆向工程技术，供研究和教学用途。
请勿将其用于任何非法用途，包括但不限于： 加密恶意脚本 | 逃避安全审计 | 攻击他人系统 | 商业软件加壳绕过
任何使用本工具所造成的直接或间接后果，包括但不限于法律责任、安全问题、数据损失，均由使用者自行承担，作者不对此承担任何责任。
如果您不同意此免责声明，请立即停止使用并删除本文件。

项目: 银鱼v3.2 - 壹心唯亦
"""
# ============================================
# 授权密钥（请勿修改此密钥）
# ============================================
AUTH_KEY = "🐧1067957630"
# ============================================

import sys as _GGb274n1
import base64 as decode_AC6ni9eq1
import zlib as decode_AC6ni9eq2
import hashlib as verify_UJ0zds1
import hmac as verify_UJ0zds2

# 核心加密层（请勿修改）
def decrypt_ZLzzh8f_init():
    try:
        from Crypto.Cipher import AES as _XAadmft6se
        from Crypto.Protocol.KDF import PBKDF2 as _GGb274n2
    except ImportError:
        print("=" * 60)
        print("❌ 运行环境缺少必要组件：pycryptodome")
        print("=" * 60)
        print("请在青龙面板中添加依赖：")
        print("1. 进入青龙面板 → 依赖管理")
        print("2. 点击右上角 '新建依赖'")
        print("3. 选择类型：Python3")
        print("4. 输入依赖名称：pycryptodome")
        print("5. 点击确定，等待安装完成")
        print("6. 安装完成后重新运行本脚本")
        print("=" * 60)
        _GGb274n1.exit(1)
    return _XAadmft6se, _GGb274n2

_XAadmft6se, _GGb274n2 = decrypt_ZLzzh8f_init()

# 加密数据块
_YGa9s4o = (
        "dD1AyHwiArleR4b1gfBrYg+P9NMVTd8lgee2vnt8JbkT3Jx1KfEngJ9oT4u1JgUV1DD5fxKBder48R6EJJHeWFcmN92s8EKjJvur" + \
        "RqIKExHfGmwc8LOk79EWRHrUH2geVYwdwEuQfp02gBY0Rr+gl/PZnZ8oCGVJcmnBdPyAGQxxczcRJTc+aIlFVlCMUTdWagr1clVZ" + \
        "FsG/d3oP2tNvr/xK27STyTq7OZNcn51Vp4VcIGlsbvZJwi5CrCgMwxGZ92yaK0qR+Z6kFsOr1CsaFYpN3DVmWwetxQmxihpQezBh" + \
        "d7rYWvik5SNI4tQqF23o42X2p3k/a2OxG9oMKSRk2aQJv0OCWoYs7yBfaIcWsOqUIHQP2fGj3jKdU5of6RMU6r5jVKllSfHrr2Lb" + \
        "hxJvJb7L58dujrJfuO6BwgLdIThuCK6p4JoScBZbdPk9Sj1+6T+SRcPgX0IHvAo3/DlwHgGUVh3xCpJfGDyt48KXmt/y4PThOgNF" + \
        "eTM6rLeDQyqWEMGdzVoh4KYLKsfMmrTuwh80afwOTCA/wh2tDEEP+N9lRkFY6yhyKhv0OhLIjCm8PtD0XTL+vQUdzB413OqGdM0I" + \
        "Y8t5PV5+1QUrfPjq08uLIdySAX5qoCF/8/nJyjDkdxXWXDY4ozvP5yd106xGptN2pbtRZNOsQNPnNYr6XGttmHy3FFBioEUSTt5M" + \
        "IcO9aIWVlCvMHgDZPAS5zIZZZzjyQvFYpiBml9Tg3Sof+06RG9I8Ee+Vh7JCZR4OGy0cZ2Z3RgIPmvY5+aMuGNQUhfFtqP4TrYmu" + \
        "HaFK3Gtv3JiwvJ+rrmBAT0vHwJEzUWSS2110xGMmHDAVpjsF9pz8a1LsmRYCOoGluOKlnUy9uLveBz23KmblIecT3UqivO9aJJRd" + \
        "Rg/n1rbmPAsIpW3UaLA8a+PUkJFm5YvXllYoN+GMCYtrhWxucU6G9JMi1S/oDXVtCi94k8VZb+HmnzqR75AR+iIoRLP942SWrBha" + \
        "dx8Xb8JnJ8ot/6rhv1FlH5gSJOh2D04DiiBgkaliwtRFVOX1svZ3577guQRVFcqC1x4PUTaPRPEU8A7jtBRLo7jqxk/tddFvM460" + \
        "pmlGw2OppIJFseiLFwPUqJ5nqkgwcoHyOsmQ8osIN+++vWdMUvcrdyO/nItS8CwDmbQYSzBI2zBtXRWlHFrw9iNzLqyWg+z/Y7ws" + \
        "cV4T9blw+UlsewZZAMc6galradFDyZI8NeqtBXUqudTzB0ycwlZVJ6jUId4k9iXbDyysqYDHGwdikrO16s43hvFn/hICzU4iG48b" + \
        "lhyqdEar7v3k4QKHWCU4W4jECoViwPtbiS1J/MxdnNINjycxJR9eAti/oFhwh51P99hJvDPSgu0ex76bfCF10Br+6s5KiXEvRvu2" + \
        "sq3bb4SCmmBwdysZq0Mh0up47Vxa8MY26/mwEjvMz77KQbpGtCmhcsa20kUS4m4hpozAFYIDMt1dqR6c7zCkvJufa6BS3+Krsat2" + \
        "TixriU0PcLQSoQdN05nJuyk6qE27m/d7L7ln9nH7eABUuNv6Qdk/97NmmbvQ8aI9LVfnRUcLVK035TAO9UAitIFD3COt47FcmL64" + \
        "UmQR2iObEq42VXYWDsj8/yQPaaoV8JU9CTwf449mDCos/JVLg4yVKLYo3OVltNM9/aJi2oxhbXLo7pradsg5DHsWEQfrhUlKIJPP" + \
        "TW8CawZy/KszV1CxVs+ZUuAqQhJbawu2UgNpLe734G5o3tNdOdojt08nvlsVXrBM7cRrivXUvAm+uJEaKZpOX2ZA6JzFPTAWolvY" + \
        "Db3mB6028R367mafP5FuWPUnabwgQ+BqC6s1IdyUbVKSV0atTv5xFHnJWyhQlX1gqundxeRDlEEWUUJRjM16xKHJv5nFPiD6dWUL" + \
        "YALf96NwqcdDcL5w+R6fL7AWkY5JP0bPgGoiI6oXDbJ914qlSf+Ysv4qxD9N4/sTnTPXP8AzTZE1TWzBpW+CVmB7Q9RrkRxME/gu" + \
        "viAvTGUC1VhwThhVcvxVOvp6g7hlm7xqOR1j0svqZs8AZNAbkDM1yPlFRbc6dudnegm+dAyEpoN8sRlKb++OomZaEuuUSSYMY06o" + \
        "dZlOmNZP9rKjvLoHgBXq61BWZ2VWaqb+1hamLH2iD2yHhaCVEym/j6j8pE8oz+wXyI2NY4saX7M2HJh/GFQnPhvSpnu0z6UX8UkX" + \
        "0mUcfGGoBHLG2vqeFTEY0s8paBKfQOe+6k6rz+A540JeDzqscNLioxSh2VAZU5a4tpXFjSGS87+z6kmDvMbeKOUR1c/oPsGlj0VK" + \
        "hcDCMxpzVaVSNxLlp6LOv9e34RT3CAYhXghbQk/2heHOGk3Ii9B0RLb29c9SXC2jdgT72h4J/oOLsgUWTIt+uZnZP2I1N+JWss2j" + \
        "uX2NUlIzPnmttSgxXDJDfmo374lOKQiFjDPH7a3aL4vvV+4/z9Pa+sRuDTXU8yOCxN3NemUJD4BlgKyNbW7JxCQeh9ynh9S3ujGD" + \
        "ZaNu7tT8AezWTxFfHoIM0ru4OKy1t/ARSUx2mjcaTNmFAMlF5UWntINJG0GJJnC3ZdXYy7HwzbsqCa0A4OOW8t/tJct/cvR27Pwl" + \
        "KA+E+OMEsJ3waJ4vrHvQO675Ml5BJ53duApYoVDaakq7Ykp2Pree+RspqYCHuqJojf6qpEtDs8FjTE6x2nNqNdk+uH5TPCWNuWnF" + \
        "PGWM1B4oyeTLS00nJnJKq1PLKyxfUwFvKo5+B3MZxFAzj4jFPlG0Ij5H5f0BfTZngayQxrdhKYR6UlhxT7heuV8G7F5NH6tK2M0n" + \
        "/3xEHwOdKH72Z2QxTggBz7c7HnglIZXQv6FSyTQxx7X7k7ezIvZsGshj27/2pFgkZ4hLtDb+gIbbayrtT+dPiUXt8UJwUQX/4rcL" + \
        "EUjLKznCXMFqgVIa7OJpnEvOrz1abh1KNpozmZZrF3CWw6RbDO5mT53BEG6TBWjAvsZUGsmkdOfeffEyuibCKDtQf4U5DoBa2aOH" + \
        "HUKJZ84CoqbgieYd1GzyBUZJMgTo2C4prXOkZ2Q8fCFA3xIXSlDAFxRm7lblMfz4yKRnpWcOiPSmzu+vQB8SNkPWu+9sXXfu0E4h" + \
        "2Rl8jqpbfMzYFvMwRcXBLla4MP27dKuTTKsxXB2c3+8ZzVYTkx6gGWUajBUSmIkmMgTVJoUY61us3pySCJNha4C8sqTd1egZOmhm" + \
        "kW7shTnywBSaCMwVuJdXLvnW7u0xTMYOiqLep7OQQg3x5ePsLkikt/s87wpDynH5yymP/yLnktxRblNy1rD6LE6ts9Lw3qgh+BQj" + \
        "DtBZLhACi6k3R/BOKLfNcQ0FTq+Avq+9rQCkUQ5oS1bTTfvLPpch2l46WCgOBZ8sL50Ul+3BTbzmiVOvmlX9TkhHTdeUglqaUXbi" + \
        "EIilg/K9m3OpdobvX6A1ovCA41/VeQGovMwu97BxqufwKS+5GtLOHApguhSBfnlcLOWIsJcdB7uJsELPTDpzFeXYopAFOVJFb31v" + \
        "peISa7zM34VLfGR16deDWFFZVg59jDFa9d9DWPNhs58l8VERaej5W3JkBgR59QmWPLrGdrl1O5rLCf3uYxC84afMmgYgoXKfL0lc" + \
        "QEpN1lUdX5Nhc+hbldkdc1tcEkrqg1sY3ATPjRgtrjH+Z2jACw86mbVDcd3AGPt2WRDlVZeB7cLIL8mGc6SITxWd+AL1n6vqbRjG" + \
        "SirBJuM4WPo9OXuCXzzJaQaf3xqD/u1xIZJTTXNPYSLsqk6jjzrPQ54ZE0bLVH9MYzb2EEQszaK/0+rDL0AwrlOFBs5jExeEB4Ru" + \
        "mFygROqNbgLb0KGgfrL7rAQV+hu+HivmJxwwLHFMajpLxlJricJc7Fmm1QgXTBB5ETWtWItFMVuf2qHI5Gyn+sRvCBvHaao4tReR" + \
        "195lqsXpERWSRgmB5+EMUabar/Bb5d1AY2bW/EOL+CWD2TqV4hvfngKyvmlkN8W4tI2IMdQfVZfdbUec2tXkkkX0wbTVu54tN/2i" + \
        "c/P9fU7avFRyBYtJM5h9RiJ4c7USRdHyH0O5vpul+zIPlg1597RJUoxW9apcfLTam5N5XKhqHF25a9hkiKxSWN8x8OoZHgTuwAka" + \
        "OfEN6cx3XGBxHHypNtQLUgOiInKk0N0XcelBR+Ax4YiKS21GMSXHfdN+55o83Rw2uvsMSL9LH5ItNuA8qNUs1g3R95yubbYJpHJk" + \
        "IuAHpu6tovAnhKO37XtK8p8+Lh7e4YSX6jMtx1WK59tOAK5URI4iJ8rlMCdZ3PtGcbGqXfpWphlK5xI90XvGaVEcyoa3tZSUm9i2" + \
        "K215M23ZgHnmGq17aggJIPDh/sBYVXIQAr9jMTD2d2PgzJnbT0PFjbA9T5mlK5/C0WAK4+UQ6kGqn4Gy67bM0eKG1RR0El+npPJd" + \
        "squ3njCQIy9+VCRoeZBhnhDAwQdP1/ayjqKz8MqyKLcx546N6rKGPHJlBzqyQ9FY4gsrxtwl8y2UByfdC6w8pHKsp55iEAyedrUB" + \
        "NZoqzywfvdVkRB7W8HQcMwXaG/3TKSbCAbU2XEwCxAazyLiw8Sn0xqITPoLg9CHNtueLwM0+GqyroMDbG0vPHCeg9AOphKHn50gs" + \
        "pAu0KhfSMtlJ0Cd/SpujdWqt6rPQpMzkZCXtymo73TY+LrtANboYIem5qGCQnuipRgeyTtWUbEFQlcWZaOLLJoLaJffpb0faAkRb" + \
        "ziYLcJidFY1nzxDqfDp1+S3T1uJiVTjU70zuoobzcsZ72h+IQsf8feF6rqHDHN81aBbXAUZwewClyQFVYerhXKACt+3WLUsomctM" + \
        "ruw/t8FuQyqusCuGgAMYgM9+C/zrGr1i1hTFoCiZR71dcWCONOkeRK47Jx644ex9QQP76gPbxL5cwDrBCLCr4E4IypgGNKFTCOub" + \
        "sUrRLsGLotPbPg36GN3OgUrouCdr8S0MsZzLKr/ezsKoMgKj3fPVaBeuWjN0tCesV/WNQWpMq3q2pfDYbUJ332yVY3m8Lay+DTlV" + \
        "/4VH6wDB5UvOUFFMWnXWJl1m4Bhzl02l/OX3DvfciX4STQiZbHIPgw+hvMP3guPY4+avjiARxjYjGbqeWD0wYCapD7JYEJWugU2z" + \
        "SHvAEQdoBSxFU6NTU8aGI8DWhoA7AdvVDCBqKvu8deRP1ZZnzibF4VWLhQ3mmm0p2zDjTbQXxGaaI8kaIGa1Ag4wQyNCJSmDgN5Z" + \
        "QxY8gekJmLGuBsZqxJZ5isaOU47WeCEXZzqlCoPaWY8e9esWvMchvCMJYoIYmZ2j1h85KayppAS0YIUSnSwetKBNGjGKNXHZM70W" + \
        "guI9v/oRzO7Rk+U4E9sH5/ATW0MeelPWWQG0jrRwiN5aVaZjeX6PyoB0Vc7keZYaHbFhZO31oP55pgtvVFBQnx1tHmhlN84SiYPn" + \
        "xDUxPyBB8mCKd1zvio/I0Ylb1u2VWGLjI96UFWH8GnMJOh8/6Bun1cGV2XxAHQXkjdNBFnWnR4dVspw15PGrNN4OPaXQvvT+5W+m" + \
        "VIrechN5WP+KWUOD/JUU5d4IzdZuzEH+6OIBwCa8LoYiP7AFeXpq+6LOy+/HXQRFBvHyUW09KVxOlxqXVf8Ekqc6CSxJo9FIyZrI" + \
        "zWN/dTFHukkDrfDJ1OTfrlXL1avOpTAcIh6z3pak8gIfkLTIw64NbSUjtNIglI/L/Zj2t/UDkkB39oY8klbisy0cSzk04If/bA2Q" + \
        "AlB12fpHBV34Uw2GsMgcDSBJvT2SxI95AE3IpdBMvWGxKpyBv7dy+1Wo/yrWWbbKLNMS4OqhDp9Hs+zzWCEyheKBMonujIRGLi6I" + \
        "AHfSJJjgtkbopvHKYP2w5C8PKVLDM4wBCAB4Tvd/+FnhiPYzp75f8oI5Xl7Ah4PTPhyNpDTHth6La99mIN4oc0bB9Fptnyessom0" + \
        "6iomGHUkHg=="
    )
_TH2lyqomi = "2xmJpHHu7CbHGlDchnem6g=="
_PRgie20 = "m1a4Jum9jSv6Yd7z68PIsFokW/ORsDTEwWFA2pqluGE="
_VUer19utc = "hvU9nS5zz68IZXDmv5iMqtcYQmbM7iF/Q8vsRX8alR8="
_MRd79oil = 137160

def verify_UJ0zds_integrity(_YGa9s4o_raw, _VUer19utc_expected, _GGb274n_material, _PRgie20_raw):
    """完整性验证"""
    _GGb274n_hmac = _GGb274n2(_GGb274n_material, _PRgie20_raw + b'hmac', dkLen=32, count=_MRd79oil)
    _VUer19utc_calc = verify_UJ0zds2.new(_GGb274n_hmac, _YGa9s4o_raw, verify_UJ0zds1.sha256).digest()
    return verify_UJ0zds2.compare_digest(_VUer19utc_calc, _VUer19utc_expected)

def decrypt_ZLzzh8f_payload():
    """解密执行"""
    try:
        # 使用固定授权密钥
        _GGb274n_input = AUTH_KEY
        if not _GGb274n_input:
            raise ValueError("授权密钥未设置")
        
        # Base64解码
        _YGa9s4o_raw = decode_AC6ni9eq1.b64decode(_YGa9s4o)
        _TH2lyqomi_raw = decode_AC6ni9eq1.b64decode(_TH2lyqomi)
        _PRgie20_raw = decode_AC6ni9eq1.b64decode(_PRgie20)
        _VUer19utc_raw = decode_AC6ni9eq1.b64decode(_VUer19utc)
        
        # HMAC完整性验证
        if not verify_UJ0zds_integrity(_YGa9s4o_raw, _VUer19utc_raw, _GGb274n_input.encode(), _PRgie20_raw):
            print("❌ 授权验证失败")
            _GGb274n1.exit(1)
        
        # 派生解密密钥
        _GGb274n_aes = _GGb274n2(_GGb274n_input.encode(), _PRgie20_raw + b'aes', dkLen=32, count=_MRd79oil)
        _GGb274n_xor = _GGb274n2(_GGb274n_input.encode(), _PRgie20_raw + b'xor', dkLen=32, count=_MRd79oil)
        
        # AES解密
        _XAadmft6se_obj = _XAadmft6se.new(_GGb274n_aes, _XAadmft6se.MODE_CBC, _TH2lyqomi_raw)
        decrypt_ZLzzh8f_aes = _XAadmft6se_obj.decrypt(_YGa9s4o_raw)
        
        # 移除PKCS7 padding
        pad_len = decrypt_ZLzzh8f_aes[-1]
        decrypt_ZLzzh8f_unpad = decrypt_ZLzzh8f_aes[:-pad_len]
        
        # XOR解密
        decrypt_ZLzzh8f_xor = bytes([decrypt_ZLzzh8f_unpad[i] ^ _GGb274n_xor[i % len(_GGb274n_xor)] for i in range(len(decrypt_ZLzzh8f_unpad))])
        
        # 解压缩
        decrypt_ZLzzh8f_decomp = decode_AC6ni9eq2.decompress(decrypt_ZLzzh8f_xor)
        
        # UTF-8解码
        decrypt_ZLzzh8f_code = decrypt_ZLzzh8f_decomp.decode('utf-8')
        
        # 执行代码
        exec(decrypt_ZLzzh8f_code, globals())
        
    except ValueError as e:
        print(f"❌ 参数错误: {e}")
        _GGb274n1.exit(1)
    except Exception as e:
        print(f"❌ 解密失败: {e}")
        _GGb274n1.exit(1)

if __name__ == "__main__":
    decrypt_ZLzzh8f_payload()
