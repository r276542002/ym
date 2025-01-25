"""
name: 北京96156-社服活动
Author: 铁臂阿童木
Date: 2025-01-22
export bjsfxh="x-token" 多账号&分割 或创建同名变量 抓取接口 header 头里的 x-token
cron: 0 10 * * * 答题时间每天 10 点才开始，别早于这个时间
version: 2.1.0

注意：需要加企业微信才能答题
入口：北京96156-社服活动 小程序
拒绝商用

"""
import requests, os, sys, time, random
import threading
import lpzl

ckName = 'bjsfxh'
baseUrl = "https://sfapi.bjsfxh.com"

api = {
	"getUserInfo": baseUrl + "/api/getUserInfo",
	"home": baseUrl + "/api/home",
	"startAnswer": baseUrl + "/api/startAnswer",
	"submitAnswer": baseUrl + "/api/submitAnswer",
	"getQuestion": baseUrl + "/api/getQuestion",
	"submitExam": baseUrl + "/api/submitExam",
	"examResult": baseUrl + "/api/examResult",
	"lottery": baseUrl + "/api/lottery",
	"userSign": baseUrl + "/api/userSign",
	"getLevelRedPacket": baseUrl + "/api/getLevelRedPacket",
	"receiveLevelRedPacket": baseUrl + "/api/receiveLevelRedPacket",
}

class program():
	def __init__(self,ck):
		self.ck = ck
		self.header = {
			"authority": "sfapi.bjsfxh.com",
			"scheme": "https",
			"xweb_xhr": "1",
			"x-token": self.ck,
			"user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 MicroMessenger/6.8.0(0x16080000) NetType/WIFI MiniProgramEnv/Mac MacWechat/WMPF MacWechat/3.8.7(0x13080712) XWEB/1191",
			"content-type": "application/json;charset=UTF-8",
			"accept": "*/*",
			"sec-fetch-site": "cross-site",
			"sec-fetch-mode": "cors",
			"sec-fetch-dest": "empty",
			"referer": "https://servicewechat.com/wx7f4d0044a0d3e1c3/75/page-frame.html",
			"accept-encoding": "gzip, deflate",
			"accept-language": "zh-CN,zh;q=0.9",
			"Connection": "keep-alive"
		}
		self.userId = 0
		self.nickname = ''
		self.activityList = []
		self.activityId = 0
		self.examId = 0
		self.answer = ''
		self.number = 0
		self.questionNum = 10

	def getUserInfo(self,type=1):
		url = api['getUserInfo']
		rs = requests.post(url=url,headers=self.header,json={}).json()
		if rs['code'] == 0:
			print(f'获取用户信息成功')
			self.userId = rs['data']['userInfo']['id']
			self.nickname = rs['data']['userInfo']['nickname']
			if type == 1:
				lpzl.log(f"【{self.nickname}】累计中奖金额：{rs['data']['userInfo']['totalMoney']}")

		else:
			print(f'获取用户信息失败：{rs["message"]}')

	def home(self):
		url = api['home']
		rs = requests.post(url=url,headers=self.header).json()
		if rs['code'] == 0:
			for activity in rs['data']['activity']:
				if activity['status'] == 2 and activity['leftTimes'] > 0:
					self.activityList.append(activity)
		else:
			print(f'访问主页失败：{rs["message"]}')

	def startAnswer(self):
		url = api['startAnswer']
		data = {
			"id":self.activityId
		}
		rs = requests.post(url=url,headers=self.header,json=data).json()
		if rs['code'] == 0:
			print('开始答题')
			self.questionNum = rs['data']['questionNum']
			self.examId = rs['data']['examId']
			self.number = rs['data']['question']['number']
			if "A" in rs['data']['question']['explain']:
				self.answer = "A"
			else:
				self.answer = "B"
			self.submitAnswer()
		else:
			print(f'开始答题失败：{rs["message"]}')

	def submitAnswer(self):
		url = api['submitAnswer']
		data = {
			"examId": self.examId,
			"id": self.activityId,
			"answer": self.answer,
			"number": self.number
		}
		rs = requests.post(url=url,headers=self.header,json=data).json()
		if rs['code'] == 0:
			print(f'提交第{self.number}题答案成功')
		else:
			print(f'提交答案失败：{rs["message"]}')

	def getQuestion(self):
		url = api['getQuestion']
		data = {
			"id": self.activityId,
			"examId": self.examId,
			"number": self.number+1
		}
		rs = requests.post(url=url,headers=self.header,json=data).json()
		if rs['code'] == 0:
			print(f'获取第{self.number+1}题的题目成功')
			self.number = rs['data']['question']['number']
			if "A" in rs['data']['question']['explain']:
				self.answer = "A"
			else:
				self.answer = "B"
			time.sleep(random.randint(1,3))
			self.submitAnswer()
		else:
			print(f'获取第{self.number+1}题的题目失败：{rs["message"]}')

	def submitExam(self):
		url = api['submitExam']
		data = {
			"id": self.activityId,
			"examId": self.examId
		}
		rs = requests.post(url=url,headers=self.header,json=data).json()
		if rs['code'] == 0:
			print('提交问卷成功')
		else:
			print(f'提交问卷失败：{rs["message"]}')

	def examResult(self):
		url = api['examResult']
		data = {
			"id": self.activityId,
			"examId": self.examId
		}
		rs = requests.post(url=url,headers=self.header,json=data).json()
		if rs['code'] == 0:
			print('获取问卷结果成功')
			print(f'{rs["data"]["nickname"]}：成绩{rs["data"]["score"]}分，答对{rs["data"]["correctNum"]}题，答题时间{rs["data"]["totalTimeView"]}')
		else:
			print(f'获取问卷结果失败：{rs["message"]}')

	def lottery(self):
		url = api['lottery']
		data = {
			"id": self.activityId,
			"examId": self.examId
		}
		rs = requests.post(url=url,headers=self.header,json=data).json()
		if rs['code'] == 0:
			if rs['data']['isWin']:
				lpzl.log(f'【{self.nickname}】抽奖成功：{rs["data"]["money"]}元')
			else:
				print(rs)
			if rs['data']['isCanAgain']:
				time.sleep(random.randint(30, 35))
				self.lottery()
		else:
			print(f'【{self.nickname}】抽奖失败：{rs["message"]}')

	def userSign(self):
		url = api['userSign']
		data = {}
		rs = requests.post(url=url,headers=self.header,json=data).json()
		if rs['code'] == 0:
			lpzl.log(f'【{self.nickname}】签到成功：{rs["message"]}')
		else:
			lpzl.log(f'【{self.nickname}】签到失败：{rs["message"]}')

	def getLevelRedPacket(self):
		url = api['getLevelRedPacket']
		data = {}
		rs = requests.post(url=url,headers=self.header,json=data).json()
		if rs['code'] == 0 and len(rs['data']) > 0:
			for i in rs['data']:
				lpzl.log(f'【{self.nickname}】领取红包奖励【{i["level_desc"]}】,红包金额：{i["money"]}')
				self.receiveLevelRedPacket(i["red_id"])

	def receiveLevelRedPacket(self,redId):
		url = api['receiveLevelRedPacket']
		data = {
			"redId":redId
		}
		rs = requests.post(url=url,headers=self.header,json=data).json()
		if rs['code'] == 0:
			lpzl.log(f"【{self.nickname}】红包【{redId}】：领取成功")
		else:
			lpzl.log(f"【{self.nickname}】红包【{redId}】：领取失败")

	def task(self):
		self.home()
		self.getUserInfo(2)
		self.userSign()
		if len(self.activityList) > 0:
			for activity in self.activityList:
				for i in range(0,activity['leftTimes']):
					self.activityId = activity['id']
					self.startAnswer()
					for i in range(1,self.questionNum):
						self.getQuestion()
						time.sleep(random.randint(1, 2))
					time.sleep(random.randint(1, 2))
					self.submitExam()
					self.examResult()
					time.sleep(random.randint(30, 35))
					self.lottery()
					time.sleep(random.randint(2, 3))
		else:
			lpzl.log(f"【{self.nickname}】没有可参与的活动")
		self.getLevelRedPacket()
		self.getUserInfo()

def run_program(ck):
	main_program = program(ck)
	main_program.task()

if __name__ == '__main__':
	if os.environ.get(ckName):
		ck = os.environ.get(ckName)
	else:
		ck = ""
		if ck == "":
			lpzl.log("请设置变量")
			sys.exit()

	cks = ck.split('&')

	lpzl.log(f"{' ' * 10}꧁༺ 北京96156༒社服活动 ༻꧂\n")

	threads = []

	for i, ck in enumerate(cks):
		try:
			thread = threading.Thread(target=run_program, args=(ck,))
			threads.append(thread)
			thread.start()
		except Exception as e:
			lpzl.log(e)

	for thread in threads:
		thread.join()

	lpzl.log(f'\n----------- 🎊 执 行  结 束 🎊 -----------\n')
	lpzl.send('北京96156༒社服活动')