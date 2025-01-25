"""
name: 公共方法
Author: 铁臂阿童木
version: 1.0.2

v1.0.0 2024-10-21 铁臂阿童木 新增推送
v1.0.1 2024-11-19 铁臂阿童木 新增获取时间戳
v1.0.2 2024-12-10 铁臂阿童木 优化推送
"""

import time

send_list = []

def log(str):
    print(f"{str}\n")
    send_list.append(f"{str}\n")

# 发送通知消息
def send(title=''):
    if len(send_list) == 0:
        print('推送内容为空！')
        return
    try:
        from notify import send

        send(title, ''.join(send_list))
    except Exception as e:
        if e:
            print('发送通知消息失败！')

# 获取时间戳
def getTimestamp():
    return int(time.time())

# 获取13位时间戳
def getTimestampMS():
    return int(round(time.time() * 1000))