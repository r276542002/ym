# 当前脚本来自于http://script.345yun.cn脚本库下载！

import requests
import json
import os  # 用于文件读写（保存上次计数器）
import time
import random
'''#
无需抓包！先一键注册获取token入口1: 

https://ga1ily.nocode.host

无需抓包！先一键注册获取token入口2: 

http://ks.345yun.cn/hb

APP软件下载链接:

https://s.wisediag.com/9fhaj145

APP软件备用下载链接:

https://www.wisediag.com/app/download?shareCode=8hq6mclg&isLogin=1

#'''
# 手机浏览器打开，下载安装后登录让后首页右上角红包分享后返回即可抽奖，绑定支付宝即可
# 从环境变量 HBA_TK 获取 token，多个token用回车分隔
# 就抓包那个token
# 域名是api.wisediag.com
# 可以用这个链接一键获取token，无需抓包！
# http://ks.345yun.cn/hb
# 秒到0.6什么呢 手机号 邮箱填写
# 我测试了一下 提现完成后再注销再抽奖，还可以到账
# 怎么绑定支付宝呢 需要你在app里 先自己分享一次(假分享)抽奖一次 如果中奖了，它会提示你填写支付宝账号 如果你没填写，直接运行脚本了，如果没有次数 直接注销账号重新来

# 从环境变量 HBA_TK 获取 token，多个token用回车分隔
# 就抓包那个token
# 域名是api.wisediag.com
# 【免责声明】
# 本脚本仅供学习和交流使用，严禁用于任何商业用途或非法用途。
# 使用本脚本所带来的一切后果由使用者本人承担，作者不对因使用本脚本造成的任何损失或法律责任负责。
# 请遵守相关法律法规，尊重目标平台的服务条款。
# 若您不同意本声明，请立即停止使用并删除本脚本。
# -------------------------- 核心自定义配置 --------------------------
INVITE_CODE_GET_COUNT = 4  # 抽奖次数(只可以抽三次)
DELAY_RANGE = (1, 3)  # 每次接口请求延迟范围（想快的话直接填1，1最好慢点）
SHORT_URL_PER_CODE_COUNT = 1  # 不要改动
# -------------------------- 核心自定义配置 --------------------------
# 计数器记录文件路径（本地保存上次运行次数）
COUNTER_FILE = "counter_record.json"


# -------------------------- 计数器优化：新增差值计算与历史保存 --------------------------

def load_last_counter():
    """从本地文件加载上次保存的计数器值"""
    if os.path.exists(COUNTER_FILE):
        try:
            with open(COUNTER_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get("last_count", 0)
        except Exception:
            # 文件损坏或格式错误，返回0
            return 0
    # 文件不存在，首次运行，返回0
    return 0


def save_current_counter(current_count):
    """将本次计数器值保存到本地文件"""
    try:
        with open(COUNTER_FILE, 'w', encoding='utf-8') as f:
            json.dump({"last_count": current_count}, f)
    except Exception as e:
        # 保存失败不影响主流程，仅打印提示
        print(f"⚠️  计数器保存失败：{str(e)}")


# 提取本地注释代码
def get_local_code():
    with open(__file__, 'r', encoding='utf-8') as f:
        content = f.read()
    start = content.find("'''#") + 4
    end = content.find("#'''", start)
    return content[start:end].strip().replace('\r', '\n')


# 主逻辑
if __name__ == "__main__":

    print("【代码日志区】")
    # -------------------------- 自定义逻辑代码写在这里 --------------------------
    # -------------------------- 固定配置（共用headers+各接口地址） --------------------------
    # 新增：个人信息接口（POST请求，带指定payload）
    get_member_info_url = "https://api.wisediag.com/chatapi/member/members"
    member_info_payload = {"memberId": None}  # 个人信息接口请求体
    # 各接口地址
    bind_invite_url = "https://api.wisediag.com/chatapi/activity/bindInviteUser"  # 绑定邀请人接口
    get_code_url = "https://api.wisediag.com/chatapi/atShareLog/getInvitationCode"
    short_url = "https://api.wisediag.com/chatapi/shortUrl"
    lottery_url = "https://api.wisediag.com/chatapi/activity/lottery"  # 抽奖接口
    cashout_url = "https://api.wisediag.com/chatapi/cashout/rewardCashout"  # 提现接口
    # 各接口请求体
    phone_list = [""]
    # 随机选择一个手机号
    random_phone = random.choice(phone_list)
    # 构造请求体
    bind_payload = {"phone": random_phone}
    # print(bind_payload)
    # bind_payload = {"phone": "15755298975"}  # 绑定邀请人请求体
    code_payload = {"targetId": "app", "targetType": "app"}

    hba_tk = os.getenv('HBA_TK', '')
    if not hba_tk:
        print("❌ 未设置环境变量 HBA_TK")
        exit(1)

    # 将多个token按回车分割成列表
    tokens = [token.strip() for token in hba_tk.split('\n') if token.strip()]
    if not tokens:
        print("❌ 环境变量 HBA_TK 中未配置有效的token")
        exit(1)
    # 自定义逻辑执行
    print(f"✅ 成功加载 {len(tokens)} 个账号")

    # -------------------------- 主逻辑：多账号循环执行 --------------------------
    for account_idx, token in enumerate(tokens, 1):
        print(f"\n{'=' * 50}")
        print(f"📱 开始处理第 {account_idx} 个账号")
        print(f"{'=' * 50}")

        # 构建当前账号的请求头（共用）
        headers = {
            'User-Agent': "Dart/3.8 (dart:io)",
            'Accept-Encoding': "gzip",
            'Content-Type': "application/json",
            'version': "3.2.3",
            'x-environment': "prod",
            'clienttype': "android",
            'sentry-trace': "452353fca58e4af2813c13bef6ff7fe7-c0abaf51f5904150",
            'token': token  # 使用当前账号的token
        }

        # -------------------------- 新增：获取个人信息（POST请求，带payload，每个账号仅执行1次） --------------------------
        print("🔍 正在获取账号个人信息...")
        # 发起POST请求，携带JSON格式的payload
        member_info_resp = requests.post(
            get_member_info_url,
            data=json.dumps(member_info_payload),
            headers=headers
        )
        member_info_data = json.loads(member_info_resp.text)

        # 处理接口响应（区分成功/失败）
        if member_info_data.get("success") and len(member_info_data.get("data", [])) > 0:
            member_id = member_info_data["data"][0].get("id", "未知ID")
            member_name = member_info_data["data"][0].get("name", "未知名称")
            print(f"🔢 用户ID：{member_id}，\n👤 用户姓名：{member_name}")
        else:
            err_msg = member_info_data.get("errMessage", "未返回错误信息")
            print(f"❌ 个人信息获取失败，详情：errCode={member_info_data.get('errCode')}，errMessage={err_msg}")

        # -------------------------- 原有逻辑：绑定邀请人 --------------------------
        # 执行绑定请求（无延迟、无额外提示）
        bind_resp = requests.post(bind_invite_url, data=json.dumps(bind_payload), headers=headers)
        # print(bind_resp.text)
        # -------------------------- 原有逻辑：主流程（获取邀请码→生成短链接→抽奖→提现） --------------------------
        print(f"📋 任务开始：共执行{INVITE_CODE_GET_COUNT}次完整流程\n")

        for process_idx in range(INVITE_CODE_GET_COUNT):
            print(f"=== 第{process_idx + 1}次完整流程 ===")
            # 1. 获取邀请码（带延迟）
            delay_get_code = random.uniform(*DELAY_RANGE)
            print(f"1. 获取分享码：延迟 {delay_get_code:.1f} 秒")
            time.sleep(delay_get_code)

            code_resp = requests.post(get_code_url, data=json.dumps(code_payload), headers=headers)
            code_data = json.loads(code_resp.text)

            if not (code_data.get("success") and code_data.get("data", {}).get("invitationCode")):
                print(f"❌ 获取分享码失败，跳过本次后续流程\n失败详情：{code_resp.text}\n")
                continue
            invitation_code = code_data["data"]["invitationCode"]
            print(f"✅ 获取分享码成功：{invitation_code}")

            # 2. 生成短链接（带延迟，成功后显示"分享成功"）
            delay_short_url = random.uniform(*DELAY_RANGE)
            print(f"2. 开始分享：延迟 {delay_short_url:.1f} 秒")
            time.sleep(delay_short_url)

            long_url = f"https://www.wisediag.com/app/download?shareCode={invitation_code}&isLogin=1"
            short_payload = {"expire": 0, "longUrl": long_url}
            short_resp = requests.post(short_url, data=json.dumps(short_payload), headers=headers)
            if short_resp.json().get("success"):
                print(f"✅ 第{process_idx + 1}-1分享成功")
            else:
                print(f"❌ 分享失败，跳过本次后续流程\n失败详情：{short_resp.text}\n")
                continue

            # 3. 执行抽奖（带延迟，提取rewardDesc和rewardValue）
            delay_lottery = random.uniform(*DELAY_RANGE)
            print(f"3. 执行抽奖：延迟 {delay_lottery:.1f} 秒")
            time.sleep(delay_lottery)

            lottery_resp = requests.post(lottery_url, headers=headers)
            lottery_data = json.loads(lottery_resp.text)

            if not (lottery_data.get("success") and lottery_data.get("data")):
                print(f"❌ 抽奖失败，跳过本次提现流程\n失败详情：{lottery_resp.text}\n")
                continue
            # 提取并格式化显示抽奖结果
            reward_desc = lottery_data["data"].get("rewardDesc", "未知奖励")
            reward_value = lottery_data["data"].get("rewardValue", 0)
            print(f"✅ 抽奖结果：🧧{reward_desc}：{reward_value}")

            # 4. 执行提现（带延迟，共用headers）
            delay_cashout = random.uniform(*DELAY_RANGE)
            print(f"4. 执行提现：延迟 {delay_cashout:.1f} 秒")
            time.sleep(delay_cashout)

            cashout_resp = requests.post(cashout_url, headers=headers)
            cashout_data = json.loads(cashout_resp.text)

            if cashout_data.get("success"):
                print(f"✅ 提现请求提交成功\n")
            else:
                print(f"❌ 提现失败\n失败详情：{cashout_resp.text}\n")

        print(f"🎉 第 {account_idx} 个账号流程执行结束！")

    print(f"\n🏁 所有 {len(tokens)} 个账号处理完成！")

print("=" * 40)

# 当前脚本来自于http://script.345yun.cn脚本库下载！
