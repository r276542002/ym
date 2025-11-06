#!/usr/bin/python3
# -- coding: utf-8 --
# -------------------------------
# cron "5 11 * * *" script-path=xxx.py,tag=匹配cron用
# 自行替换关键词变量
# HXEK=memberId@enterpriseId
# 多个账号
# HXEK=memberId@enterpriseId#memberId@enterpriseId
# const $ = new Env('鸿星尔克官方会员中心小程序')

import os
import random
import time
import hashlib
import json
from datetime import datetime, time as times
import requests
from requests.packages.urllib3.exceptions import InsecureRequestWarning

# 禁用安全请求警告
requests.packages.urllib3.disable_warnings(InsecureRequestWarning)

IS_DEV = False
if os.path.isfile('DEV_ENV.py'):
    import DEV_ENV
    IS_DEV = True

# 导入通知功能
try:
    from sendNotify import send
    print("加载通知服务成功！")
except:
    print("加载通知服务失败!")

send_msg = ''
one_msg = ''

def Log(cont=''):
    global send_msg, one_msg
    print(cont)
    if cont:
        one_msg += f'{cont}\n'
        send_msg += f'{cont}\n'

class RUN:
    def __init__(self, info, index):
        global one_msg
        one_msg = ''
        # memberId @ enterpriseId @ unionid @ openid @ wxOpenid
        split_info = info.split('@')
        len_split_info = len(split_info)
        if len_split_info < 2:
            print('变量长度不足，请检查变量')
            return False
        self.memberId = split_info[0]
        self.enterpriseId = split_info[1]

        last_info = split_info[len_split_info - 1]
        self.send_UID = None
        if len_split_info > 0 and "UID_" in last_info:
            print('检测到设置了UID')
            print(last_info)
            self.send_UID = last_info
        self.index = index + 1
        self.s = requests.session()
        self.s.verify = False
        self.headers = {
            'Host': 'hope.demogic.com',
            'xweb_xhr': '1',
            'channelEntrance': 'wx_app',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090a13) XWEB/9129',
            'sign': self.enterpriseId,
            'Accept': '*/*',
            'Sec-Fetch-Site': 'cross-site',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Referer': 'https://servicewechat.com/wxa1f1fa3785a47c7d/55/page-frame.html',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Content-Type': 'application/x-www-form-urlencoded',
        }
        self.appid = 'wxa1f1fa3785a47c7d'
        self.defualt_parmas = {
            'memberId': self.memberId,
            'cliqueId': '-1',
            'cliqueMemberId': '-1',
            'useClique': '0',
            'enterpriseId': self.enterpriseId,
            'appid': self.appid,
            'gicWxaVersion': '3.9.16'
        }
        self.baseUrl = 'https://hope.demogic.com/gic-wx-app/'
        self.use_power_max = False

    def make_request(self, url, method='post', headers={}, data={}, params=None):
        if headers == {}:
            headers = self.headers
        try:
            if method.lower() == 'get':
                response = self.s.get(url, headers=headers, verify=False, params=params)
            elif method.lower() == 'post':
                response = self.s.post(url, headers=headers, json=data, params=params, verify=False)
            else:
                raise ValueError("不支持的请求方法❌: " + method)
            return response.json()
        except requests.exceptions.RequestException as e:
            print("请求异常❌：", e)
        except ValueError as e:
            print("值错误或不支持的请求方法❌：", e)
        except Exception as e:
            print("发生了未知错误❌：", e)

    def hxek_sign(self, memberId, appid):
        secret = 'damogic8888'
        # 获取GMT+8的当前时间戳
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        # 生成随机数
        random_int = random.randint(1000000, 9999999)
        # 构建待加密字符串
        raw_string = f"timestamp={timestamp}transId={appid}{timestamp}secret={secret}random={random_int}memberId={memberId}"
        # 使用MD5进行加密
        md5_hash = hashlib.md5(raw_string.encode())
        sign = md5_hash.hexdigest()
        return sign, random_int, timestamp

    def gen_sign(self):
        sign, random_int, timestamp = self.hxek_sign(self.memberId, self.appid)
        self.defualt_parmas['random'] = random_int
        self.defualt_parmas['sign'] = sign
        self.defualt_parmas['timestamp'] = timestamp
        self.defualt_parmas['transId'] = self.appid + timestamp

    def get_member_grade_privileg(self):
        act_name = '获取用户信息'
        Log(f'\n====== {act_name} ======')
        self.gen_sign()
        self.defualt_parmas['launchOptions'] = '{"path":"pages/points-mall/member-task/member-task","query":{},"scene":1256,"referrerInfo":{},"apiCategory":"default"}'

        url = f"{self.baseUrl}get_member_grade_privileg.json"
        response = self.make_request(url,'post',params=self.defualt_parmas)
        if response.get('errcode', -1) == 0:
            data = response.get('response', {})
            member = data.get('member', {})
            if member:
                phoneNumber = member.get('phoneNumber', '')
                phone = phoneNumber[:4]+'***'+phoneNumber[-4:]
                wxOpenid = member.get('openId', '')
                unionid = member.get('thirdUnionid', '')
                self.defualt_parmas['wxOpenid'] = wxOpenid
                self.defualt_parmas['unionid'] = unionid
                Log(f'{act_name}成功！✅')
                Log(f'> 当前用户：【{phone}】')
            return True
        elif response.get('errcode', -1) == 900001:
            Log(f'> 今天已签到✅')
            return False
        else:
            print(f'{act_name}失败❌：{response}')
            return False

    def get_member_asset(self):
        """获取用户资产信息，包括积分"""
        act_name = '获取用户资产'
        Log(f'\n====== {act_name} ======')
        self.gen_sign()
        
        # 添加资产查询参数
        asset_params = self.defualt_parmas.copy()
        asset_params['dataIconKeyList'] = 'D007,D010'  # D007代表可用积分
        asset_params['launchOptions'] = '{"path":"pages/authorize/authorize","query":{},"scene":1256,"referrerInfo":{},"apiCategory":"default"}'

        url = f"{self.baseUrl}get-member-asset.json"
        response = self.make_request(url, 'get', params=asset_params)
        
        if response.get('code') == '0':
            result = response.get('result', {})
            available_points = result.get('D007', 0)  # D007代表可用积分
            Log(f'{act_name}成功！✅')
            Log(f'> 当前可用积分：【{available_points}】')
            return available_points
        else:
            Log(f'{act_name}失败❌：{response}')
            return 0

    def member_sign(self):
        act_name = '签到'
        Log(f'\n====== {act_name} ======')
        self.gen_sign()
        self.defualt_parmas['launchOptions'] = '{"path":"pages/points-mall/member-task/member-task","query":{},"scene":1256,"referrerInfo":{},"apiCategory":"default"}'

        url = f"{self.baseUrl}member_sign.json"
        response = self.make_request(url,'post',params=self.defualt_parmas)
        if response.get('errcode', -1) == 0:
            res = response.get('response', {})
            memberSign = res.get('memberSign', {})
            integralCount = memberSign.get('integralCount', '')
            continuousCount = memberSign.get('continuousCount', '')
            points = res.get('points', '')
            Log(f'{act_name}成功！✅')
            Log(f'> 签到获得积分：【{integralCount}】 连续签到：【{continuousCount}】天')
            return True, integralCount, continuousCount
        elif response.get('errcode', -1) == 900001:
            Log(f'> 今天已签到✅')
            return False, 0, None
        else:
            print(f'{act_name}失败❌：{response}')
            return False, 0, None

    def main(self):
        Log(f"\n开始执行第{self.index}个账号--------------->>>>>")
        if self.get_member_grade_privileg():
            sign_result, integralCount, continuous_count = self.member_sign()
            # 获取当前可用积分
            available_points = self.get_member_asset()
            return sign_result, integralCount, continuous_count, available_points
        else:
            return False, 0, None, 0

def random_delay(min_delay=1, max_delay=5):
    delay = random.uniform(min_delay, max_delay)
    print(f">本次随机延迟： {delay:.2f} 秒.....")
    time.sleep(delay)

def send_notification(title, content):
    """发送通知"""
    try:
        # 尝试从sendNotify导入send函数
        from sendNotify import send
        send(title, content)
        print("通知发送成功！")
    except Exception as e:
        print(f"发送通知失败: {e}")

if __name__ == '__main__':
    APP_NAME = '鸿星尔克官方会员中心小程序'
    ENV_NAME = 'HXEK'
    
    # 简化环境变量处理
    ENV = os.environ.get(ENV_NAME, '')
    
    local_script_name = os.path.basename(__file__)
    local_version = '2025.11.06'
    
    token = ENV if ENV else ''
    if not token:
        print(f"未填写{ENV_NAME}变量")
        exit()
    
    # 简化的环境变量分割
    if '#' in token:
        tokens = token.split('#')
    elif '&' in token:
        tokens = token.split('&')
    else:
        tokens = [token]
    
    # 统计信息
    success_count = 0
    fail_count = 0
    total_accounts = len(tokens)
    account_details = []
    total_points = 0  # 总积分
    
    if len(tokens) > 0:
        print(f"\n>>>>>>>>>>共获取到{total_accounts}个账号<<<<<<<<<<")
        for index, infos in enumerate(tokens):
            run_result, integralCount, continuous_count, available_points = RUN(infos, index).main()
            if run_result:
                success_count += 1
                account_details.append(f"账号{index+1}: 签到成功 ✅ | 本次获得: {integralCount}积分 | 连续签到: {continuous_count}天 | 总积分: {available_points}")
                total_points += available_points
            else:
                fail_count += 1
                account_details.append(f"账号{index+1}: 签到失败 ❌ | 总积分: {available_points}")
                total_points += available_points
            
            # 如果不是最后一个账号，添加延迟
            if index < len(tokens) - 1:
                random_delay(2, 5)
        
        # 汇总结果
        summary = f"""
【{APP_NAME}签到结果】
执行时间: {time.strftime("%Y-%m-%d %H:%M:%S")}
总账号数: {total_accounts}
成功: {success_count} 个
失败: {fail_count} 个
总积分: {total_points}

【账号详情】
""" + "\n".join(account_details)
        
        print(summary)
        
        # 发送通知
        title = f"{APP_NAME}签到通知"
        content = summary
        
        try:
            from sendNotify import send
            send(title, content)
            print("通知发送成功！")
        except Exception as e:
            print(f"发送通知失败: {e}")