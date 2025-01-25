"""
name: 北京96156
Author: 铁臂阿童木
Date: 2024-11-28
export bj96156="x-token" 多账号&分割 或创建同名变量 抓取接口 header 头里的 x-token
cron: 0 11 * * * 答题时间每天 11 点才开始，别早于这个时间
version: 2.1.0

注意：需要加北京96156的企业微信才能答题
入口：北京96156 小程序
拒绝商用

v1.0.0 2024-11-29 铁臂阿童木
v1.1.0 2024-12-14 铁臂阿童木 增加签到
v1.2.0 2024-12-22 铁臂阿童木 增加自动领取等级红包奖励
v2.0.0 2025-01-14 铁臂阿童木 增加并发功能
v2.1.0 2025-01-15 铁臂阿童木 抽奖次数拉满
v3.0.0 2025-01-24 铁臂阿童木 1、新增自动领取邀请奖励功能 2、答题失败时跳过本轮答题 3、增加错题库
"""
import requests, os, sys, time, random
import threading
import lpzl
import json

ckName = 'bj96156'
baseUrl = "https://ylapi.luckystarpay.com"

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
	"getShareList": baseUrl + "/api/getShareList",
	"receiveShareRedPacket": baseUrl + "/api/receiveShareRedPacket",
}

# 定义存储文件的路径
wrong_questions_file = '96165_questions.json'

def load_wrong_questions():
	if os.path.exists(wrong_questions_file):
		with open(wrong_questions_file, 'r', encoding='utf-8') as file:
			content = file.read().strip()  # 读取文件并去除空白
			if content:  # 如果文件内容不为空
				return json.loads(content)  # 使用 loads 而不是 load
			else:
				return {}  # 如果文件为空，返回空字典
	return {}

def save_wrong_question(id,body, answer):
	wrong_questions = load_wrong_questions()
	wrong_questions[id] = {
		"body": body,
		"answer": answer
	}
	with open(wrong_questions_file, 'w', encoding='utf-8') as file:
		json.dump(wrong_questions, file, ensure_ascii=False, indent=4)
		print('问题录入成功')

class program():
	def __init__(self,ck):
		self.ck = ck
		self.header = {
			"authority": "ylapi.luckystarpay.com",
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
		self.shouldSkipActivity = False
		self.questionBody = ''
		self.questionId = 0

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
			self.questionBody = rs['data']['question']['body']
			self.questionId = rs['data']['question']['id']

			self.questionNum = rs['data']['questionNum']
			self.examId = rs['data']['examId']
			self.number = rs['data']['question']['number']
			self.checkAnswer(rs['data']['question']['id'])
			self.submitAnswer()
		else:
			print(f'开始答题失败：{rs["message"]}')

	def checkAnswer(self,id):
		wrong_questions = load_wrong_questions()

		print('开始查找答案')
		question = wrong_questions.get(str(id))
		if question:
			self.answer = question['answer']
			print(f'从题库找到答案{self.answer}')
			return

		print(f'该问题没有录入题库{id}')
		self.answer = "A"


	def saveQuestion(self,correctAnswer):
		save_wrong_question(self.questionId,self.questionBody, correctAnswer)

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
			print(f'提交第{self.number}题答案成功,答题结果：{rs["data"]["isCorrect"]}')
			if not rs["data"]["isCorrect"]:
				self.saveQuestion(rs['data']['correctAnswer'])
				self.shouldSkipActivity = True
		else:
			print(f'提交答案失败：{rs["message"]}')
			self.shouldSkipActivity = True

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
			self.questionBody = rs['data']['question']['body']
			self.questionId = rs['data']['question']['id']

			self.number = rs['data']['question']['number']
			self.checkAnswer(rs['data']['question']['id'])
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

	def getShareList(self):
		url = api['getShareList']
		data = {
			"page":1,
			"pageSize":20
		}
		rs = requests.post(url=url,headers=self.header,json=data).json()
		if rs['code'] == 0 and 'item' in rs['data']:
			if rs['data']['item'] is not None:
				if len(rs['data']['item']) > 0:
					for i in rs['data']['item']:
						if i["status"] == 1 and i["money"] > 0:
							time.sleep(random.randint(1,3))
							self.receiveShareRedPacket(i["red_id"],i["money"])

	def receiveShareRedPacket(self,redId,money):
		url = api['receiveShareRedPacket']
		data = {
			"redId":redId
		}
		rs = requests.post(url=url,headers=self.header,json=data).json()
		if rs['code'] == 0 and rs['message'] == 'ok':
			lpzl.log(f"邀请奖励领取成功：{money}")

	def task(self):
		self.home()
		self.getUserInfo(2)
		# 签到
		self.userSign()
		if len(self.activityList) > 0:
			for activity in self.activityList:
				for i in range(0,activity['leftTimes']):
					self.shouldSkipActivity = False
					self.activityId = activity['id']

					self.startAnswer()

					if self.shouldSkipActivity:
						print('答题错误，跳过本轮')
						break

					for i in range(1,self.questionNum):
						self.getQuestion()
						if self.shouldSkipActivity:
							break
						time.sleep(random.randint(1, 2))

					if self.shouldSkipActivity:
						print('答题错误，跳过本轮！')
						break

					time.sleep(random.randint(1, 2))
					self.submitExam()
					self.examResult()
					time.sleep(random.randint(30, 35))
					self.lottery()
					time.sleep(random.randint(2, 3))
		else:
			lpzl.log(f"【{self.nickname}】没有可参与的活动")
		# 领取等级奖励
		self.getLevelRedPacket()
		# 领取邀请奖励
		self.getShareList()
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

	lpzl.log(f"{' ' * 10}꧁༺ 北京༒96156 ༻꧂\n")

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
	lpzl.send('北京96156')
