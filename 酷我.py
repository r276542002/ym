'''
new Env('酷我音乐')
酷我音乐做日常任务
变量名：kwyy，格式：备注#账号#密码，多个账号新建环境变量或者用&隔开
cron: 0 12 * * *
'''
import os
import re
import sys
import json
import time
import random
import hashlib
import requests

# CK 设置 #####################################################################################################
kwyys = os.getenv("kwyy")
if kwyys is None:
    print(f'不存在青龙变量 kwyy，请检查！')
    exit(0)

kwyy_list = []
if '&' in kwyys:
    kwyy_list = kwyys.split('&')
elif '\n' in kwyys:
    kwyy_list = kwyys.split('\n')
else:
    kwyy_list = [kwyys]

# 请求头 #####################################################################################################
headers = {
    'User-Agent': 'Android_n_com.kuwo.music_v10.6.6.0_x0000_x0000_toutiao_x0000',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Charset': 'UTF-8',
}
###############################################################################################################
# 通用函数 ###################################################################################################
def md5_encrypt(text):
    md5 = hashlib.md5()
    md5.update(text.encode('utf-8'))
    encrypted_text = md5.hexdigest()
    return encrypted_text

def print_error_and_exit(error_message):
    print(f"程序出错：\n{error_message}")
    exit(0)

# 账号类 ######################################################################################################
class KuWo:
    def __init__(self, account, password):
        self.account = account
        self.password = password
        self.token = ''

    # 登录
    def login(self):
        url = 'https://user.kuwo.cn/user/logins'
        params = {
            'password': self.password,
            'loginName': self.account,
            'phone': '',
            'type': 'kuwo',
            'source': 'kwplayer_ar_10.6.6.0_toutiao.apk',
            'loginType': 'name',
            'userName': self.account,
            'rid': '0'
        }
        try:
            response = requests.post(url, headers=headers, data=params)
            response.raise_for_status()
            data = response.json()
            #print(data)
            if data.get('success') == 'true':
                self.token = data['data']['token']
                print(f"账号 [{self.account}] 登录成功！")
                return True
            else:
                print(f"账号 [{self.account}] 登录失败：{data.get('message', '未知错误')}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"登录请求异常: {e}")
            return False
        except json.JSONDecodeError:
            print(f"登录响应JSON解析错误: {response.text}")
            return False

    # 获取Cookie（用于签到）
    def get_cookie(self):
        url = "https://user.kuwo.cn/user/getCookie"
        params = {'token': self.token}
        try:
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            # print(data)
            if data.get('code') == 200:
                return data.get('hm', '')
            else:
                print(f"获取Cookie失败：{data.get('msg', '未知错误')}")
                return None
        except requests.exceptions.RequestException as e:
            print(f"获取Cookie请求异常: {e}")
            return None
        except json.JSONDecodeError:
            print(f"获取Cookie响应JSON解析错误: {response.text}")
            return None

    # 签到
    def sign_in(self):
        cookie = self.get_cookie()
        if not cookie:
            return

        url = 'https://vip.kuwo.cn/vip/v2/user/signin'
        current_headers = headers.copy()
        current_headers['Cookie'] = cookie
        try:
            response = requests.get(url, headers=current_headers)
            response.raise_for_status()
            data = response.json()
            # print(data)
            if data.get('code') == 200:
                if data['data'].get('hasSign') is True:
                     print("今天已签到！")
                else:
                     print(f"签到成功！获得积分: {data['data'].get('w musicallyCoin', 'N/A')}")
            elif data.get('code') == 1000:
                print("今天已签到！")
            else:
                print(f"签到失败：{data.get('msg', '未知错误')}")
        except requests.exceptions.RequestException as e:
            print(f"签到请求异常: {e}")
        except json.JSONDecodeError:
            print(f"签到响应JSON解析错误: {response.text}")

    # 获取任务列表
    def get_task_list(self):
        url = 'https://hot H5.kuwo.cn/h5app/api/task/list'
        params = {'token': self.token}
        try:
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            # print(data)
            if data.get('code') == 200:
                return data.get('data', [])
            else:
                print(f"获取任务列表失败：{data.get('msg', '未知错误')}")
                return []
        except requests.exceptions.RequestException as e:
            print(f"获取任务列表请求异常: {e}")
            return []
        except json.JSONDecodeError:
            print(f"获取任务列表响应JSON解析错误: {response.text}")
            return []

    # 完成任务
    def complete_task(self, task_id):
        url = 'https://hot H5.kuwo.cn/h5app/api/task/done'
        params = {'token': self.token, 'id': task_id}
        try:
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            # print(data)
            if data.get('code') == 200:
                print(f"任务 [{task_id}] 完成成功！")
                return True
            else:
                print(f"任务 [{task_id}] 完成失败：{data.get('msg', '未知错误')}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"完成任务请求异常: {e}")
            return False
        except json.JSONDecodeError:
            print(f"完成任务响应JSON解析错误: {response.text}")
            return False

    # 领取任务奖励
    def claim_task_reward(self, task_id):
        url = 'https://hot H5.kuwo.cn/h5app/api/task/receive'
        params = {'token': self.token, 'id': task_id}
        try:
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            # print(data)
            if data.get('code') == 200:
                print(f"任务 [{task_id}] 奖励领取成功！")
                return True
            else:
                print(f"任务 [{task_id}] 奖励领取失败：{data.get('msg', '未知错误')}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"领取任务奖励请求异常: {e}")
            return False
        except json.JSONDecodeError:
            print(f"领取任务奖励响应JSON解析错误: {response.text}")
            return False


    # 执行所有任务
    def do_all_tasks(self):
        tasks = self.get_task_list()
        if not tasks:
            print("没有获取到任务列表或任务列表为空。")
            return

        print("\n--- 开始执行日常任务 ---")
        for task_group in tasks:
            for task in task_group.get('list', []):
                task_id = task.get('id')
                task_name = task.get('taskName')
                task_status = task.get('status') # 0-未完成, 1-已完成未领取, 2-已领取

                if task_id is None or task_name is None or task_status is None:
                    print(f"任务信息不完整，跳过此任务：{task}")
                    continue

                print(f"\n正在处理任务：{task_name} (ID: {task_id})")

                if task_status == 0: # 未完成
                    print("任务状态：未完成。正在尝试完成...")
                    if self.complete_task(task_id):
                        time.sleep(random.randint(2, 5)) # 模拟操作延迟
                        print("任务完成后，尝试领取奖励...")
                        if self.claim_task_reward(task_id):
                             print(f"任务 [{task_name}] 已成功完成并领取奖励。")
                        else:
                             print(f"任务 [{task_name}] 完成后领取奖励失败。")
                    else:
                        print(f"任务 [{task_name}] 未能完成。")
                elif task_status == 1: # 已完成未领取
                    print("任务状态：已完成，未领取。正在尝试领取奖励...")
                    if self.claim_task_reward(task_id):
                        print(f"任务 [{task_name}] 奖励已成功领取。")
                    else:
                        print(f"任务 [{task_name}] 领取奖励失败。")
                elif task_status == 2: # 已领取
                    print(f"任务 [{task_name}] 状态：已领取。")
                else:
                    print(f"未知任务状态 [{task_status}]，跳过任务 [{task_name}]。")
                time.sleep(random.randint(3, 7)) # 每个任务之间的间隔

        print("\n--- 所有日常任务处理完毕 ---")


# 主程序 #####################################################################################################
if __name__ == '__main__':
    print("===> 酷我音乐日常任务开始 <===\n")
    if not kwyy_list:
        print("未找到有效的账号信息，请检查环境变量 kwyy 设置。")
        exit(0)

    for index, ck_item in enumerate(kwyy_list):
        parts = ck_item.split('#')
        if len(parts) < 3:
            print(f"账号 [{index + 1}] 格式不正确，应为：备注#账号#密码。跳过此账号。")
            continue

        remark = parts[0]
        account_val = parts[1]
        password_val = md5_encrypt(parts[2]) # 密码需要MD5加密

        print(f"-----------> 开始处理账号：{remark} <-----------")
        kuwo_instance = KuWo(account_val, password_val)
        if kuwo_instance.login():
            kuwo_instance.sign_in()
            time.sleep(random.randint(2, 5))
            kuwo_instance.do_all_tasks()
        else:
            print(f"账号 [{remark}] 登录失败，无法执行后续操作。")
        print(f"-----------> 账号：{remark} 处理完毕 <-----------\n")
        if index < len(kwyy_list) - 1:
            print("等待10-20秒后处理下一个账号...\n")
            time.sleep(random.randint(10, 20))

    print("===> 所有账号任务执行完毕 <===")
