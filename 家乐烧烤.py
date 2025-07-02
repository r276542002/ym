#入口:https://i.postimg.cc/KjhJxwbS/mmexport1751427278198.jpg
#抓包bbq2025.unileverfoodsolutions.com.cn域名下的aid值填到环境变量JLSK中，多账号&分割
import os
import requests
import json
import random
import time

def get_proclamation():
    primary_url = "https://github.com/3288588344/toulu/raw/refs/heads/main/tl.txt"
    backup_url = "https://tfapi.cn/TL/tl.json"
    
    try:
        response = requests.get(primary_url, timeout=10)
        if response.status_code == 200:
            print("📢 公告信息")
            print("=" * 45)
            print(response.text)
            print("=" * 45 + "\n")
            print("公告获取成功，开始执行任务...\n")
            return
    except requests.exceptions.RequestException as e:
        print(f"获取公告时发生错误: {e}, 尝试备用链接...")
    
    try:
        response = requests.get(backup_url, timeout=10)
        if response.status_code == 200:
            
            print("📢 公告信息")
            print("=" * 45)
            print(response.text)
            print("=" * 45 + "\n")
            print("公告获取成功，开始执行任务...\n")
        else:
            print(f"⚠️ 获取公告失败，状态码: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"⚠️ 获取公告时发生错误: {e}, 可能是网络问题或链接无效。")


def get_account_info(aid):
    # 获取用户信息API URL
    info_url = "https://bbq2025.unileverfoodsolutions.com.cn/api/wechat/member/user-info"
    
    headers = {
        "Host": "bbq2025.unileverfoodsolutions.com.cn",
        "Content-Type": "application/json",
        "Client-Type": "minProgram",
        "Referer": "https://servicewechat.com/wxb273ef37bf49a359/27/page-frame.html",
        "Accept-Encoding": "gzip, deflate, br"
    }
    
    # 请求体
    data = {
        "aid": aid
    }
    
    try:
        # 发送获取用户信息请求
        response = requests.post(info_url, headers=headers, json=data)
        
        if response.status_code == 200:
            result = response.json()
            if result.get('code') == '200' and result.get('success'):
                data_info = result.get('data', {})
                nickname = data_info.get('nickname', '未知')
                mobile = data_info.get('mobile', '未知')
                
                # 处理手机号，只显示前3位和后4位
                if len(mobile) >= 7:
                    processed_mobile = mobile[:3] + "****" + mobile[-4:]
                else:
                    processed_mobile = mobile
                
                return nickname, processed_mobile
            else:
                print(f"获取用户信息失败，原因：{result.get('message')}")
        else:
            print(f"获取用户信息请求失败，状态码: {response.status_code}")
        
        return None, None
    except Exception as e:
        print(f"获取用户信息时发生错误: {e}")
        return None, None

def perform_tasks(aid, nickname, mobile):
    headers = {
        "Host": "bbq2025.unileverfoodsolutions.com.cn",
        "Content-Type": "application/json",
        "Client-Type": "minProgram",
        "Referer": "https://servicewechat.com/wxb273ef37bf49a359/27/page-frame.html",
        "Accept-Encoding": "gzip, deflate, br"
    }
    
    base_data = {
        "aid": aid,
        "param": {"abGroup": "B"},
        "abGroup": "B"
    }
    
    # 签到API URL
    sign_url = f"https://bbq2025.unileverfoodsolutions.com.cn/api/task/sign/{aid}"
    # 领取签到积分API URL
    grant_url = "https://bbq2025.unileverfoodsolutions.com.cn/api/task/grant"
    # 浏览菜谱API URL
    view_recipe_url = "https://bbq2025.unileverfoodsolutions.com.cn/api/recipe/view/save"
    # 转发任务API URL
    share_task_url = "https://bbq2025.unileverfoodsolutions.com.cn/api/task/completeTask"
    # 订阅任务API URL
    subscribe_url = "https://bbq2025.unileverfoodsolutions.com.cn/api/min/sub"
    
    tasks = [
        ("签到任务", sign_url, base_data),
        ("领取签到积分", grant_url, {"taskId": 4, **base_data}),
        ("浏览菜谱任务", view_recipe_url, None),
        ("领取浏览菜谱积分", grant_url, {"taskId": 5, **base_data}),
        ("转发任务", share_task_url, {"taskId": 6, **base_data}),
        ("领取转发任务积分", grant_url, {"taskId": 6, **base_data}),
        ("订阅任务", subscribe_url, {"aid": aid, "subType": 2, "yaoyue": 0, "huodong": 1, "yuyue": 1, "dingyuewenzhang": 1}),
        ("领取订阅任务积分", grant_url, {"taskId": 7, **base_data})
    ]
    
    for task_name, url, data in tasks:
        print(f"{task_name}:")
        print(f"{'=' * 45}")
        
        if task_name == "浏览菜谱任务":
            # 浏览两次不同的菜谱
            for i in range(2):
                recipe_id = random.randint(5000, 6000)
                view_data = {
                    "aid": aid,
                    "id": 75,
                    "recipeId": recipe_id,
                    "param": {"abGroup": "B"},
                    "abGroup": "B"
                }
                try:
                    response = requests.post(view_recipe_url, headers=headers, json=view_data)
                    response.raise_for_status()  # 检查请求是否成功
                    result = response.json()
                    if result.get('code') == '200' and result.get('success'):
                        print(f"浏览菜谱 {recipe_id} 成功")
                    else:
                        print(f"浏览菜谱 {recipe_id} 失败，原因：{result.get('message')}")
                except requests.exceptions.RequestException as e:
                    print(f"浏览菜谱 {recipe_id} 请求失败：{e}")
        elif data is not None:
            try:
                response = requests.post(url, headers=headers, json=data)
                response.raise_for_status()  # 检查请求是否成功
                result = response.json()
                if result.get('code') == '200' and result.get('success'):
                    print(f"{task_name}成功！")
                else:
                    print(f"{task_name}失败，原因：{result.get('message')}")
            except requests.exceptions.RequestException as e:
                print(f"{task_name}请求失败：{e}")
        else:
            print(f"{task_name}没有提供数据")
        
        print(f"{'-' * 45}")
        
        # 在任务之间加入1到5秒的随机延迟
        delay = random.randint(1, 5)
        print(f"等待 {delay} 秒...")
        time.sleep(delay)

def main():
    jl_sk = os.getenv("JLSK")
    if not jl_sk:
        print("环境变量JLSK未找到")
        return
    
    aid_list = jl_sk.split('&')
    for index, aid in enumerate(aid_list):
        if not aid.strip():
            continue
        
        print(f"{'=' * 45}")
        
        # 获取账号信息
        nickname, mobile = get_account_info(aid)
        if nickname and mobile:
            print(f"账号名: {nickname}, 手机号: {mobile}")
            print(f"{'-' * 45}")
            
            # 执行任务
            perform_tasks(aid, nickname, mobile)
        
        # 在账号之间加入随机延迟
        if index != len(aid_list) - 1:
            account_delay = random.randint(5, 10)
            print(f"账号切换，等待 {account_delay} 秒...")
            time.sleep(account_delay)
        
        print(f"{'=' * 45}\n")

if __name__ == "__main__":
    get_proclamation()
    main()
