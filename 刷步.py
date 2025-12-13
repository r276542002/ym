#!/usr/bin/env python3
# -*- coding: utf-8 -*-
 
import requests
import random
import time
import logging
from datetime import datetime
import os
 
# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
 
# 多账号配置
ACCOUNTS = [
    #{"username": "1111111111", "password": "111111111111"},
    {"username": "13290038886", "password": "wjf58549925"},
]
 
# 步数范围配置
STEP_RANGES = {
    6: {"min": 6000, "max": 10000},
    8: {"min": 10000, "max": 20000},
    10: {"min": 20000, "max": 30000},
    12: {"min": 30000, "max": 40000},
    14: {"min": 40000, "max": 50000},
    16: {"min": 50000, "max": 60000},
    18: {"min": 60000, "max": 70000},
    20: {"min": 70000, "max": 80000},
    22: {"min": 80000, "max": 90000},
}
 
# 默认步数（当不在指定时间段时使用）
DEFAULT_STEPS = 24465
 
# API配置 - 根据你的网络环境选择
# 局域网访问（脚本和API在同一网络）
API_BASE_URL = "http://step.cpolar.cn/index.php"
# 如果脚本和API在同一台机器上，也可以用localhost
# API_BASE_URL = "http://localhost:8080/index.php"
 
# 固定token（根据你的API设置）
TOKEN = "kEBLLYjyCq1I8IrFOufSfryrsYUtY7BO"
 
class StepSubmitter:
    def __init__(self):
        self.session = requests.Session()
        # 设置简单的请求头
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': '*/*'
        }
         
    def get_current_steps(self):
        """根据当前时间获取对应的步数范围"""
        current_hour = datetime.now().hour
        logger.info(f"当前时间: {datetime.now()}, 小时: {current_hour}")
         
        # 找到最接近的配置时间段
        closest_hour = None
        min_diff = float('inf')
         
        for hour in STEP_RANGES.keys():
            diff = abs(current_hour - hour)
            if diff < min_diff:
                min_diff = diff
                closest_hour = hour
         
        # 如果找到接近的配置且在合理范围内（2小时内），使用该配置
        if min_diff <= 2 and closest_hour in STEP_RANGES:
            step_config = STEP_RANGES[closest_hour]
            steps = random.randint(step_config['min'], step_config['max'])
            logger.info(f"使用 {closest_hour} 点配置，生成步数: {steps}")
        else:
            steps = DEFAULT_STEPS
            logger.info(f"使用默认步数: {steps}")
         
        return steps
     
    def submit_steps(self, username, password, steps):
        """直接提交步数到本地API"""
        try:
            # 构造请求URL
            params = {
                'user': username,
                'pwd': password,
                'step': steps,
                'token': TOKEN
            }
             
            logger.info(f"准备提交 - 账号: {username}, 步数: {steps}")
            logger.info(f"请求URL: {API_BASE_URL}?user={username}&pwd=***&step={steps}&token={TOKEN}")
             
            # 发送GET请求
            response = self.session.get(
                API_BASE_URL,
                params=params,
                headers=self.headers,
                timeout=30
            )
             
            # 解析响应
            if response.status_code == 200:
                try:
                    result = response.json()
                    logger.info(f"API响应: {result}")
                     
                    # 根据API实际返回格式判断成功
                    if (result.get('status') == 'success' or
                        result.get('code') == 200 or
                        result.get('success') is True or
                        '成功' in str(result.get('message', '')) or
                        'success' in str(result.get('message', '')).lower()):
                        return True, f"提交成功! 步数: {steps}, 消息: {result.get('message', '无详细消息')}"
                    else:
                        error_msg = result.get('msg', result.get('message', '未知错误'))
                        return False, f"提交失败: {error_msg}"
                except Exception as e:
                    # 如果返回的不是JSON，直接显示文本内容
                    text_response = response.text.strip()
                    logger.info(f"API文本响应: {text_response}")
                    if '成功' in text_response or 'success' in text_response.lower():
                        return True, f"提交成功! 步数: {steps}"
                    else:
                        return False, f"API返回: {text_response}"
            else:
                return False, f"HTTP错误: {response.status_code}"
                 
        except requests.exceptions.RequestException as e:
            return False, f"网络请求错误: {str(e)}"
        except Exception as e:
            return False, f"未知错误: {str(e)}"
     
    def run(self):
        """主执行函数"""
        logger.info("开始执行步数提交任务")
        logger.info(f"共有 {len(ACCOUNTS)} 个账号需要处理")
        logger.info(f"使用API地址: {API_BASE_URL}")
         
        success_count = 0
        fail_count = 0
         
        for i, account in enumerate(ACCOUNTS, 1):
            logger.info(f"处理第 {i}/{len(ACCOUNTS)} 个账号: {account['username']}")
             
            try:
                # 获取当前应提交的步数
                steps = self.get_current_steps()
                 
                # 提交步数
                success, message = self.submit_steps(
                    account['username'], 
                    account['password'], 
                    steps
                )
                 
                if success:
                    success_count += 1
                    logger.info(f"&#10003; 账号 {account['username']} - {message}")
                else:
                    fail_count += 1
                    logger.error(f"&#10007; 账号 {account['username']} - {message}")
                 
            except Exception as e:
                fail_count += 1
                logger.error(f"&#10007; 账号 {account['username']} - 处理异常: {str(e)}")
             
            # 账号间间隔（最后一个账号不需要等待）
            if i < len(ACCOUNTS):
                logger.info("等待3秒后处理下一个账号...")
                time.sleep(3)
         
        # 汇总结果
        logger.info(f"任务完成! 成功: {success_count}, 失败: {fail_count}")
         
        return success_count, fail_count
 
def main():
    """主函数（青龙面板入口）"""
    try:
        submitter = StepSubmitter()
        success_count, fail_count = submitter.run()
         
        # 返回结果给青龙面板
        if fail_count == 0:
            print("所有账号提交成功!")
            exit(0)
        else:
            print(f"部分账号提交失败，成功: {success_count}, 失败: {fail_count}")
            exit(1)
             
    except Exception as e:
        logger.error(f"脚本执行异常: {str(e)}")
        exit(1)
 
if __name__ == "__main__":
    main()
