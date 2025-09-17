#!/usr/bin/python3
# -*- coding: utf-8 -*-
# @Date: 2025-09-17
# @LastEditTime: 2025-09-17

"""
妖火：白衣
SFSY - 2025中秋活动独立脚本

本脚本从 sf0917.py 中提取，专注于执行2025年中秋节的特定活动任务。
功能包括：
1. 账号登录
2. 检查活动状态
3. 自动完成活动任务 (包括游戏)
4. 领取任务奖励

请在青龙面板的环境变量中设置 `SFSY` 或 `sfsyUrl`，值为您的账号URL，多个账号用换行分隔。
"""

import os
import random
import time
from datetime import datetime
from typing import Optional, Dict
import requests
import urllib3
from urllib3.exceptions import InsecureRequestWarning

# 禁用HTTPS警告
urllib3.disable_warnings(InsecureRequestWarning)

# 全局日志变量
send_msg = ''

def log(message: str = '') -> None:
    """统一日志处理"""
    global send_msg
    print(message)
    if message:
        send_msg += f'{message}\n'

class SFMidAutumnBot:
    """顺丰2025中秋活动自动化机器人"""

    BASE_URL = 'https://mcs-mimp-web.sf-express.com'

    def __init__(self, account_url: str, index: int):
        """
        初始化账号实例
        :param account_url: 从环境变量读取的账号URL
        :param index: 账号序号
        """
        self.index = index + 1
        self.account_url = account_url.split('@')[0]
        self.session = requests.Session()
        self.session.verify = False  # 禁用SSL证书验证

        # 基础请求头
        self.headers = {
            'host': 'mcs-mimp-web.sf-express.com',
            'accept': 'application/json, text/plain, */*',
            'content-type': 'application/json',
            'accept-language': 'zh-CN,zh-Hans;q=0.9',
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.53(0x18003531) NetType/WIFI Language/zh_CN miniProgram/wxd4185d00bf7e08ac'
        }

        # 账号信息
        self.user_id = ''
        self.mobile = ''
        self.phone = ''
        
        # 任务相关属性
        self.taskName = ''
        self.taskCode = ''
        self.taskType = ''

        log(f"\n{'=' * 15} 账号 {self.index} [中秋活动] {'=' * 15}")

    def get_signature(self) -> None:
        """生成请求签名所需参数"""
        timestamp = str(int(time.time() * 1000))
        sys_code = 'MCS-MIMP-CORE'
        # 更新请求头中的时间戳和系统代码
        self.headers.update({
            'sysCode': sys_code,
            'timestamp': timestamp,
        })

    def request(self, url: str, data: Dict = None, method: str = 'POST') -> Optional[Dict]:
        """
        统一请求方法
        :param url: 请求URL
        :param data: POST请求的数据体 (JSON)
        :param method: 请求方法 (GET/POST)
        :return: JSON响应或None
        """
        self.get_signature()
        try:
            if method.upper() == 'GET':
                response = self.session.get(url, headers=self.headers, timeout=10)
            else:
                response = self.session.post(url, headers=self.headers, json=data or {}, timeout=10)
            response.raise_for_status() # 如果请求失败则抛出异常
            return response.json()
        except Exception as e:
            print(f"请求异常: {e}")
            return None

    def login(self) -> bool:
        """通过访问账号URL实现登录，并获取Cookie"""
        try:
            response = self.session.get(self.account_url, headers=self.headers, timeout=10)
            cookies = self.session.cookies.get_dict()

            # 从Cookie中提取关键信息
            self.user_id = cookies.get('_login_user_id_', '')
            self.phone = cookies.get('_login_mobile_', '')

            if self.phone:
                self.mobile = self.phone[:3] + "*" * 4 + self.phone[7:]
                log(f'✓ 用户【{self.mobile}】登录成功')
                return True
            else:
                log('✗ 登录失败：无法从Cookie获取用户信息')
                return False
        except Exception as e:
            log(f'✗ 登录请求异常: {e}')
            return False

    def dragon_midAutumn2025_index(self) -> bool:
        """检查2025中秋活动是否有效"""
        log('\n====== 🥮 中秋活动检查 ======')
        self.headers.update({
            'channel': '25zqxcxty3',
            'platform': 'MINI_PROGRAM',
            'referer': f'https://mcs-mimp-web.sf-express.com/origin/a/mimp-activity/midAutumn2025?mobile={self.mobile}&userId={self.user_id}',
        })
        url = f'{self.BASE_URL}/mcs-mimp/commonNoLoginPost/~memberNonactivity~midAutumn2025IndexService~index'
        response = self.request(url)
        if response and response.get('success'):
            end_time_str = response.get('obj', {}).get('acEndTime')
            if end_time_str and datetime.now() < datetime.strptime(end_time_str, "%Y-%m-%d %H:%M:%S"):
                log('✓ 中秋活动进行中...')
                return True
        log('ℹ️ 中秋活动已结束或无法参与')
        return False

    def dragon_midAutumn2025_tasklist(self):
        """获取并执行2025中秋活动任务列表"""
        log('📖 获取中秋活动任务列表')
        url = f'{self.BASE_URL}/mcs-mimp/commonPost/~memberNonactivity~activityTaskService~taskList'
        data = {"activityCode": "MIDAUTUMN_2025", "channelType": "MINI_PROGRAM"}
        response = self.request(url, data)
        if response and response.get('success'):
            for task in response.get('obj', []):
                self.taskName = task['taskName']
                self.taskCode = task.get('taskCode')
                self.taskType = task['taskType']
                if task['status'] == 3:
                    print(f'> ✅ 任务【{self.taskName}】已完成')
                    continue

                print(f'> 执行任务【{self.taskName}】')
                if self.taskType == 'PLAY_ACTIVITY_GAME':
                    # 玩游戏任务
                    self.dragon_midAutumn2025_game_init()
                elif self.taskName == '看看生活服务':
                    # 通用浏览/点击任务
                    self.dragon_midAutumn2025_finish_task()
                time.sleep(random.uniform(2, 4))
        else:
            log('❌ 获取中秋任务列表失败')

    def dragon_midAutumn2025_game_init(self) -> None:
        """初始化中秋活动游戏，并开始闯关"""
        print('🎮 初始化中秋游戏...')
        url = f'{self.BASE_URL}/mcs-mimp/commonPost/~memberNonactivity~midAutumn2025GameService~init'
        self.headers.update(
            {'referer': 'https://mcs-mimp-web.sf-express.com/origin/a/mimp-activity/midAutumn2025Game'})
        response = self.request(url)
        if response and response.get('success'):
            obj = response.get('obj', {})
            if not obj.get('alreadyDayPass', False):
                current_index = obj.get('currentIndex', 0)
                print(f'今日未通关，从第【{current_index}】关开始...')
                self.dragon_midAutumn2025_game_win(current_index)
            else:
                print('今日已通关，跳过游戏！')
        else:
            print('❌ 游戏初始化失败')

    def dragon_midAutumn2025_game_win(self, start_level: int):
        """模拟游戏胜利，从指定关卡开始"""
        url = f'{self.BASE_URL}/mcs-mimp/commonPost/~memberNonactivity~midAutumn2025GameService~win'
        for i in range(start_level, 5):  # 游戏总共4关，索引0-3，循环到4即可
            print(f'闯关...第【{i}】关')
            response = self.request(url, {"levelIndex": i})
            if response and response.get('success'):
                award = response.get('obj', {}).get('currentAward', {})
                if award:
                    print(f'> 🎉 获得：【{award.get("currency")}】x{award.get("amount")}')
                else:
                    print('> 本关无即时奖励')
                time.sleep(random.uniform(2, 4))
            else:
                error_msg = response.get("errorMessage", "未知错误") if response else "请求失败"
                print(f'❌ 第【{i}】关闯关失败: {error_msg}')
                break  # 失败则停止

    def dragon_midAutumn2025_finish_task(self):
        """完成通用的中秋活动任务 (如浏览)"""
        url_map = {
            'BROWSE_VIP_CENTER': f'{self.BASE_URL}/mcs-mimp/commonPost/~memberEs~taskRecord~finishTask',
            'default': f'{self.BASE_URL}/mcs-mimp/commonRoutePost/memberEs/taskRecord~finishTask'
        }
        url = url_map.get(self.taskType, url_map['BROWSE_VIP_CENTER'])
        response = self.request(url, {"taskCode": self.taskCode})
        if response and response.get('success'):
            print(f'> ✅ 完成任务【{self.taskName}】成功')
        else:
            print(f'> ❌ 完成任务【{self.taskName}】失败')

    def dragon_midAutumn2025_Reward(self):
        """领取倒计时奖励"""
        url = f'{self.BASE_URL}/mcs-mimp/commonPost/~memberNonactivity~midAutumn2025BoxService~receiveCountdownReward'
        response = self.request(url)
        if response and response.get('success'):
            received_list = response.get('obj', {}).get('receivedAccountList', [])
            if received_list:
                for item in received_list:
                    print(f'> 🎉 领取倒计时奖励：【{item.get("currency")}】x{item.get("amount")}')
        else:
            error_msg = response.get("errorMessage", "未知错误") if response else "请求失败"
            print(f'❌ 领取倒计时奖励失败: {error_msg}')

    def dragon_midAutumn2025_fetchTasksReward(self):
        """领取任务奖励次数，并查询剩余次数"""
        url = f'{self.BASE_URL}/mcs-mimp/commonPost/~memberNonactivity~midAutumn2025TaskService~fetchTasksReward'
        data = {"activityCode": "MIDAUTUMN_2025", "channelType": "MINI_PROGRAM"}
        response = self.request(url, data)
        if response and response.get('success'):
            log('✅ 任务奖励次数领取成功')
            # 领取成功后，查询一下剩余次数
            status_url = f'{self.BASE_URL}/mcs-mimp/commonPost/~memberNonactivity~midAutumn2025BoxService~boxStatus'
            status_response = self.request(status_url, {})
            if status_response and status_response.get('success'):
                remain_chance = status_response.get('obj', {}).get('remainBoxChance')
                log(f'ℹ️ 当前剩余抽奖次数：【{remain_chance}】')
            else:
                error_msg = status_response.get("errorMessage", "未知错误") if status_response else "请求失败"
                print(f'❌ 查询抽奖次数失败: {error_msg}')
        else:
            error_msg = response.get("errorMessage", "未知错误") if response else "请求失败"
            print(f'❌ 领取任务奖励次数失败: {error_msg}')
            
    def run(self):
        """执行中秋活动的完整流程"""
        # 步骤 1: 登录
        if not self.login():
            log('❌ 账号登录失败，跳过后续任务')
            return

        time.sleep(random.uniform(2, 4))

        # 步骤 2: 检查活动是否有效，如果有效则执行所有相关任务
        # 注意：原代码的 if self.dragon_midAutumn2025_index 是错误的，方法需要调用 ()
        if self.dragon_midAutumn2025_index():
            # 先领取一次奖励，确保游戏次数等已就绪
            self.dragon_midAutumn2025_fetchTasksReward()
            # 执行任务列表（包含游戏）
            self.dragon_midAutumn2025_tasklist()
            # 领取倒计时奖励
            self.dragon_midAutumn2025_Reward()
            # 所有任务完成后，再次领取奖励，确保所有任务奖励都已领取
            self.dragon_midAutumn2025_fetchTasksReward()
        
        log(f'✅ 账号 {self.index} 中秋活动任务执行完毕')

def main():
    """主程序入口"""
    log("""
    本文件仅可用于交流编程技术心得, 请勿用于其他用途, 请在下载后24小时内删除本文件!
    如软件功能对个人或网站造成影响，请联系作者协商删除。
    一切因使用本文件而引致之任何意外、疏忽、合约毁坏、诽谤、版权或知识产权侵犯及其所造成的损失，脚本作者既不负责亦不承担任何法律责任。
    作者不承担任何法律责任，如作他用所造成的一切后果和法律责任由使用者承担！
    """)
    print("🚀 SFSY-2025中秋活动独立脚本启动")
    
    # 从环境变量读取账号URL
    env_name = 'SFSY'
    if env_name in os.environ:
        tokens = os.environ[env_name].split('\n')
    elif "sfsyUrl" in os.environ:
        tokens = os.environ["sfsyUrl"].split('\n')
    else:
        log('❌ 未找到环境变量 `SFSY` 或 `sfsyUrl`')
        return

    # 过滤空行
    tokens = [token.strip() for token in tokens if token.strip()]
    if not tokens:
        log('❌ 环境变量中没有找到有效的账号URL')
        return

    log(f'📊 共获取到 {len(tokens)} 个账号')

    # 循环执行每个账号的任务
    for index, token in enumerate(tokens):
        try:
            bot = SFMidAutumnBot(token, index)
            bot.run()
        except Exception as e:
            log(f'❌ 账号 {index + 1} 执行出现未知异常: {e}')

        if index < len(tokens) - 1:
            delay = random.uniform(5, 8)
            print(f'\n...等待 {delay:.1f} 秒后处理下一个账号...')
            time.sleep(delay)

    log('\n🎉 所有账号任务执行完毕')
    # 如果需要企业微信等通知，可以在这里添加 `send` 函数的调用
    # from notify import send
    # if send_msg:
    #     send('顺丰中秋活动通知', send_msg)

if __name__ == '__main__':
    main()

