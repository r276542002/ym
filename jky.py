
import requests
import json
import re
import os
import sys

'''
地址：https://jikeq87.xyz/auth/register?code=UDjO

变量
export jky_email="邮箱"
export jky_pwd="密码"

烟雨阁
'''
session = requests.session()
# 配置用户名（一般是邮箱）
email = os.environ.get('jky_email')
# 配置用户名对应的密码 和上面的email对应上
passwd = os.environ.get('jky_pwd')

# 控制变量，用于控制是否发送通知
enable_notification = 1  # 0 不发送     1发送通知

# 如果需要发送通知，则尝试导入notify模块
if enable_notification:
    try:
        from notify import send
    except ModuleNotFoundError:
        print("警告：未找到notify.py模块。程序将退出。")
        sys.exit(1)


login_url = 'https://jikeq87.xyz/auth/login'
check_url = 'https://jikeq87.xyz/user/checkin'
info_url = 'https://jikeq87.xyz/user/profile'

header = {
    'origin': 'https://jikeq87.xyz',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
}
data = {
    'email': email,
    'passwd': passwd
}
print('欢迎使用jky签到脚本 by:烟雨阁')
print('正在进行登录...')

# 登录
response = json.loads(session.post(
    url=login_url, headers=header, data=data).text)
print(response['msg'])

# 获取账号名称
print('邮箱地址：'+email+'\n开始签到...')

# 进行签到
result = json.loads(session.post(url=check_url, headers=header).text)
print(result['msg'])
content = result['msg']

output_content = 'jky签到通知\n邮箱地址：'+email+'\n签到结果：'+content
if enable_notification:
    try:
        from notify import send
        send("jky签到通知", output_content)   # 发送通知
    except ModuleNotFoundError:
        print("通知模块未找到。")
