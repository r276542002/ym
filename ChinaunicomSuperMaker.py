'''
不想抽奖后自动领取的就注释掉isGrantPrize = True
isGrantPrize = True
isGrantPrize = True  是否抽奖完成自动领取
draw_before= True
draw_before= True  是否领取以前的权益
变量:
    青龙变量为
        chinaUnicomCookie
    本地运行替换
        token1&token2&token3
至于多token格式支持多种并且可混用   & ^  %  回车  如果想自己添加其他自己改。

登录失败也会有,自己加同ip下appid 或者同ip下登录app再运行。多次失败或者502那就换个时间段运行吧。


    &方式:token1&token2&token3

    %方式:token1%token2%token3
    
    ^方式:token1^token2^token3

    回车方式:
    token1
    token2
    token3

加其他接口也可参考(https://contact.bol.wo.cn/market-act/js/app.js)

by:翼城

'''
import os
import re
import json
import certifi
import httpx
import asyncio
import logging
from prettytable import PrettyTable
from urllib.parse import urlparse, parse_qs
import ssl
class Config:
    def __init__(self, draw_before=False,isGrantPrize=False, allOrSingle=False):
        self.draw_before = draw_before #领取以前的权益 True  开启 False  关闭
        self.isGrantPrize = isGrantPrize #抽奖完成自动领取
        self.allOrSingle = allOrSingle #是否许愿全部默认单个---->许愿全部上面:allOrSingle=True,许愿单个:allOrSingle=False
        self.split_pattern=  r'[\n&^@%]+'
    def toggle_draw_before(self):
        self.draw_before = not self.draw_before
        self.isGrantPrize = not self.isGrantPrize
        self.allOrSingle = not self.allOrSingle


class AsyncSessionManager:
    def __init__(self, timeout=None, verify=True, ca_certs=None):
        self.client = None
        self.timeout = timeout
        self.verify = verify
        self.ca_certs = ca_certs

    async def __aenter__(self):
        if self.timeout:
            self.client = httpx.AsyncClient(
                limits=httpx.Limits(max_connections=1000),
                timeout=self.timeout,
                verify=self._get_verify(self.verify, self.ca_certs)
            )
        else:
            self.client = httpx.AsyncClient(
                limits=httpx.Limits(max_connections=1000),
                verify=self._get_verify(self.verify, self.ca_certs)
            )
        return self.client

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()

    def _get_verify(self, verify, ca_certs):
        if verify:
            if ca_certs:
                return ca_certs
            else:
                return True
        else:
            return False

async def mask_middle_four(value):
    if isinstance(value, str):
        if len(value) >= 11:
            return value[:3] + "####" + value[-4:]
        else:
            raise ValueError("输入的字符串长度不足以截取中间四位")
    else:
        raise TypeError("输入类型错误，应为字符串")
config = Config()  
class NoDuplicatesFilter(logging.Filter):
    def __init__(self):
        self._logged = set()

    def filter(self, record):
        msg = record.getMessage()
        if msg in self._logged:
            return False
        self._logged.add(msg)
        return True

class TaskProcessor:
    def __init__(self, ltToken):
        self.ltToken = ltToken
        self.userToken = None
        self.ecs_token = None
        self.share_name = None
        self.share_param = None
        self.currPhone = None
        self.Phones = None
        self.shareList = []
        self.userProbabilityList = []
        self.userProbability = []
        self.urls = {
            'onLine': "https://m.client.10010.com/mobileService/onLine.htm",
            'ticket': "https://m.client.10010.com/mobileService/openPlatform/openPlatLineNew.htm?to_url=https://contact.bol.wo.cn/market",
            'marketUnicomLogin': "https://backward.bol.wo.cn/prod-api/auth/marketUnicomLogin",
            'getAllActivityTasks': "https://backward.bol.wo.cn/prod-api/promotion/activityTask/getAllActivityTasks?activityId=12",
            'checkShare': "https://backward.bol.wo.cn/prod-api/promotion/activityTaskShare/checkShare",
            'checkView':   "https://backward.bol.wo.cn/prod-api/promotion/activityTaskShare/checkView",
            'checkHelp': "https://backward.bol.wo.cn/prod-api/promotion/activityTaskShare/checkHelp",
            'getUserRaffleCount': "https://backward.bol.wo.cn/prod-api/promotion/home/raffleActivity/getUserRaffleCount?id=12",
            'userRaffle': "https://backward.bol.wo.cn/prod-api/promotion/home/raffleActivity/userRaffle?id=12&channel=",
            'validateCaptcha': "https://backward.bol.wo.cn/prod-api/promotion/home/raffleActivity/validateCaptcha?id=12",
            'grantPrize': "https://backward.bol.wo.cn/prod-api/promotion/home/raffleActivity/grantPrize",
            'getMyPrize': "https://backward.bol.wo.cn/prod-api/promotion/home/raffleActivity/getMyPrize",
            'userProbability': "https://backward.bol.wo.cn/prod-api/promotion/home/raffleActivity/userProbability",
            'userProbabilityPrizeList': "https://backward.bol.wo.cn/prod-api/promotion/home/raffleActivity/userProbabilityPrizeList?configId=12",
            'xyprizeList': "https://backward.bol.wo.cn/prod-api/promotion/home/raffleActivity/prizeList?id=12",
        }
        self.headers = {
            'User-Agent': "Dalvik/2.1.0 (Linux; U; Android 12; leijun Pro Build/SKQ1.22013.001);unicom{version:android@11.0702}",
            'Connection': "Keep-Alive",
            'Accept-Encoding': "gzip",
        }
        self.common_value = None  

    async def get_ecstoken(self, session):
        payload = {
            'isFirstInstall': "1",
            'version': "android@11.0702",
            'token_online': self.ltToken
        }
        response_Value = await self.requestsPost('onLine', payload, session)
        try:
            valueJson=json.loads(response_Value)
            await asyncio.sleep(1)
            desmobile=valueJson.get("desmobile")
            if desmobile is None:
                print("未获取到手机号",valueJson.get("dsc"))
                return None
            self.currPhone=await mask_middle_four(desmobile);
            self.Phone=(desmobile);
            value=valueJson.get("ecs_token")
            self.ecs_token=value
            return value
        except  json.JSONDecodeError:
            print("get_ecstoken json error",response_Value)
            return None
    async def get_ticket(self, session):
        response_Value = await self.requestsGet('ticket',session)
        try:
            parsed_url = urlparse(response_Value)
            print(parsed_url)
            query_params = parse_qs(parsed_url.query)
            ticket = query_params.get('ticket', [None])[0] 
            self.ticket=ticket
            return ticket
        except  json.JSONDecodeError:
            print("get_ticket json error")
            return None
        except Exception as e:
            print(f"error: {e}")
            return None

    async def get_qycslogin(self, session):
        payload = {
            
        }
        response_Value = await self.requestsPost('marketUnicomLogin',payload,  session)
        try:
            token=json.loads(response_Value).get("data").get("token")
            self.userToken=token
            print(token)
            return token
        except  json.JSONDecodeError:
            print("get_qycslogin json error",response_Value)
            return None
        
    async def get_qycsxy(self, session,delay):
        xyList=[]
        if config.allOrSingle:
            await self.get_qycsxyprizeList(session)#查询所有许愿任务
            xyList=self.userProbabilityList
        else:
            await self.get_qycsuserProbabilityPrizeList(session)#查询单许愿任务
            xyList=self.userProbability
        await asyncio.sleep(delay)
        if xyList is not None and len(xyList)>0:
            for item in (xyList):
                await self.get_qycsuserProbability(session,item)#许愿任务
        await asyncio.sleep(delay)



    async def get_qycsgetMyPrize(self, session):
        payload = {
            "id": 12,
            "type": 0,
            "page": 1,
            "limit": 100,
        }
        payload=json.dumps(payload)
        response_Value = await self.requestsPost('getMyPrize',payload,  session)
        try:
            jsonValue = json.loads(response_Value)
            lists = jsonValue.get("data", {}).get("list", [])
            table = PrettyTable()
            if lists:
                table.title = f"开始统计{self.Phone}因太懒而未领取奖品信息"
                table.field_names = ["商品名称", "商品id", "领取时间", "失效时间"]
                for item in lists:
                    id =item.get("id")
                    prizesName =item.get("prizesName")
                    createTime =item.get("createTime")
                    deadline =item.get("deadline")
                    if config.draw_before:
                        await self.get_qycsgrantPrize(session,id,prizesName)
                    else:
                        table.add_row([item.get("prizesName"), id, createTime,deadline])
                
            else:
                table.field_names = [f"{self.currPhone}没有奖品待领取"]
            print(table)

            return lists
        except  json.JSONDecodeError:
            print("get_qycsgetMyPrize json error",response_Value)
            return None
    async def get_qycsgrantPrize(self, session,lotteryRecordId,name):
        payload = {
            "recordId": lotteryRecordId,
        }
        payload=json.dumps(payload)
        response_Value = await self.requestsPost('grantPrize',payload,  session)
        try:
            msg=json.loads(response_Value).get("msg")
            print(f"{name}领取->",msg)
        except  json.JSONDecodeError:
            print("get_qycsgrantPrize json error",response_Value)
            return None
    async def get_qycsuserRaffle(self, session,num=3):
        payload = {
            
        }
        response_Value = await self.requestsPost('userRaffle',payload,  session)
        try:
            response_Value=json.loads(response_Value)
            if response_Value.get("code")==200:
                num=0
                if response_Value.get("data"):
                    lotteryRecordId=response_Value.get("data").get("lotteryRecordId")
                    prizesName=response_Value.get("data").get("prizesName")
                    print(f"{self.currPhone}:抽奖成功:",prizesName)
                    if config.isGrantPrize==True:
                        print(f"{self.currPhone}:开始领取:",prizesName)
                        await self.get_qycsgrantPrize(session,lotteryRecordId,prizesName)
                    else:
                        print(f"{self.currPhone}:不执行领取:",prizesName)
                return response_Value
            elif response_Value.get("code")==500:
                await self.get_qycsvalidateCaptcha(session)
                if num > 1: 
                    await self.get_qycsuserRaffle(session, num - 1)
            else:
                print("没有更多的尝试次数")

        except  json.JSONDecodeError as e:
            print(f"get_qycsuserRaffle error: {e}")
            return None
        
    async def get_qycsvalidateCaptcha(self, session):
        payload = {
            
        }
        response_Value = await self.requestsPost('validateCaptcha',payload,  session)
        try:
            response_Value=json.loads(response_Value)
            if response_Value.get("code")==200:
                print(f"{self.currPhone}:人机验证成功")
            elif response_Value.get("code")==500:
                print(f"{self.currPhone}:人机验证失败")
        except  json.JSONDecodeError:
            print("get_qycsuserRaffle2 json error")
            return None
        

    async def get_qycscheckShareList(self, session):
        payload = {
            
        }
        shareLists=self.shareList;
        for shareList in shareLists:
            self.share_name=shareList.get("name")
            self.share_param=shareList.get("param")
            if self.share_param is not None:
                checkValue="checkShare"
                try:
                    if ("浏览") in shareList.get("name"):
                        checkValue="checkView"
                    else:
                        checkValue="checkShare"#留待后续接口补充

                    response_Value = await self.requestsPost(checkValue,payload,  session)
                    msg=json.loads(response_Value).get("msg")
                    code=json.loads(response_Value).get("code")
                    if code==200 or msg=="操作成功":
                        print(f"{self.currPhone}:{self.share_name}->:"+msg)

                except  json.JSONDecodeError:
                    print("get_qycscheckShare json error")
                    return None
            else:
                pass
    async def get_qycsUserRaffleCount(self, session):
        payload = {
            
        }
        response_Value = await self.requestsPost('getUserRaffleCount',payload,  session)
        try:
            data=json.loads(response_Value).get("data")

            return data
        except  json.JSONDecodeError:
            print("get_qycsUserRaffleCount json error",response_Value)
            return None
    async def get_qycsuserProbability(self, session,item):

        payload = {
        "id":item.get("id")or item.get("prizesId") or 3,
        "lotteryConfigId": item.get("lotteryConfigId") or 12,
        "prizeName": item.get("prizeName") or item.get("name") or item.get("prizesname") or "哔哩哔哩月度大会员",
        "prizeId":item.get("id")or item.get("prizesId") or 3,
        "sortOrder":item.get("sortOrder")or item.get("manualRedemptionMethod") or 2,
        "imageUrl":item.get("imageUrl")or 'https://contact.bol.wo.cn/contact-file/2024/06/11/e2cff84f6b1b418a89426bfaf1dcb6f8png',
        }
        # 下面放开是固定领某个,至于多个id,先改allOrSingle=True  再搜--->打印所有待许愿的奖品<----把日志放开就行了   
        # payload = {
        #     "id": 3,
        #     "lotteryConfigId": 12,
        #     "prizeId": 3,
        #     "sortOrder": 2,
        #     "prizeName": "哔哩哔哩月度大会员",
        #     "imageUrl": "https://contact.bol.wo.cn/contact-file/2024/06/11/e2cff84f6b1b418a89426bfaf1dcb6f8png",
        # }
        payload=json.dumps(payload)
        response_Value = await self.requestsPost('userProbability',payload,  session)
        try:
            jsonData=json.loads(response_Value)    
            data=jsonData.get("data")
            if jsonData.get("code")!=200:
                print(f"{self.currPhone}:许愿失败:{jsonData.get('msg')}")
                return None
            prizeName=item.get("prizeName") or item.get("name") or item.get("prizesname")
            print(f"{prizeName}:许愿成功!")
            return data
        except  json.JSONDecodeError:
            print("get_qycsUserRaffleCount json error",response_Value)
            return None
    async def get_qycsxyprizeList(self, session):
        payload = {

        }
        response_Value = await self.requestsPost('xyprizeList',payload,  session)
        try:
            data=json.loads(response_Value).get("data")
            if data is not None and len(data)>0:
                for item in data:
                    userProbability = {
                        "prizesname": item.get("name"),
                        "prizesId": item.get("prizesId"),
                        "type": item.get("type"),
                        "imageUrl": item.get("imageUrl"),
                        "manualRedemptionMethod": item.get("manualRedemptionMethod"),
                    }
                    self.userProbabilityList.append(userProbability)
            # print(data)#打印所有待许愿的奖品
            return data
        except  json.JSONDecodeError:
            print("get_qycsUserRaffleCount json error",response_Value)
            return None
    async def get_qycsuserProbabilityPrizeList(self, session):
        payload = {
            
        }
        response_Value = await self.requestsGet('userProbabilityPrizeList',  session)
        try:
            data=json.loads(response_Value).get("data")
            if data is not None and len(data)>0:
                for item in data:
                    userProbabilityV = {
                        "prizesname": item.get("prizeName"),
                        "prizesId": item.get("id"),
                        "lotteryConfigId": item.get("lotteryConfigId"),
                        "sortOrder": item.get("sortOrder"),
                        "imageUrl": item.get("imageUrl"),
                    }
                    self.userProbability.append(userProbabilityV)
            return data
        except  json.JSONDecodeError:
            print("get_qycsUserRaffleCount json error",response_Value)
            return None


    async def get_qycsAllActivityTasks(self, session):
        payload = {
            
        }
        response_Value = await self.requestsGet('getAllActivityTasks', session)
        try:
            active_id_listarr=json.loads(response_Value).get("data", [])
            for item in active_id_listarr.get("activityTaskUserDetailVOList"):
                share_info = {
                    "param": item.get("param1"),
                    "activityId": item.get("activityId"),
                    "name": item.get("name"),
                }
                self.shareList.append(share_info)

        except  json.JSONDecodeError:
            print("get_qycsAllActivityTasks json error",response_Value)
            return None
        except Exception as e:
            print(f"error: {e}")
            return None

    async def requestsPost(self, url_name, payload, session):
        try:
            url = self.urls.get(url_name)
            if url_name=='marketUnicomLogin':
                url+='?ticket='+self.ticket
            if url_name=='checkShare' and self.share_param:
                url+='?checkKey='+self.share_param
            if url_name=='checkView' and self.share_param:
                url+='?checkKey='+self.share_param
            headers = getattr(self, 'headers', None)
            if url_name in ('getUserRaffleCount','userRaffle','checkHelp','userProbability','userProbabilityPrizeList','xyprizeList','checkView'):
                if self.userToken:
                    headers['Authorization'] = 'Bearer '+self.userToken 
            if url_name in ('grantPrize','getMyPrize','userProbability'):
                headers['Accept'] = "application/json, text/plain, */*" 
                headers['Accept-Encoding'] = "gzip, deflate, br, zstd"
                headers['Content-Type'] =  "application/json"
            response=await session.post(url, headers=headers, data=payload)
            text = response.text
            return text
        except Exception as e:
            return f"Error: {e}"
    async def requestsGet(self, url_name,  session):
        try:

            url = self.urls.get(url_name)
            headers = self.headers.copy() 
            isredirect = False if url_name in "ticket" else True
            if self.ecs_token:
                headers['Cookie'] = 'ecs_token='+self.ecs_token 
            if self.userToken:
                headers['Authorization'] = 'Bearer '+self.userToken 
            response=await session.get(url, headers=headers, follow_redirects=isredirect)
            stauts=response.status_code 
            if not isredirect and stauts in (301, 302, 303, 307, 308):
                return response.headers.get('Location')
            text = response.text
            return text
        except Exception as e:
            return f"Error: {e}"

    async def process_task(self, session,delay):
        await self.get_ecstoken(session)
        ticket=await self.get_ticket(session)
        await asyncio.sleep(delay)
        token= await self.get_qycslogin(session)#登录
        if token:
            print(f"{self.currPhone}:登录成功")
        else:
            print(f"{self.currPhone}:登录失败")
            return None
        await self.get_qycsAllActivityTasks(session)#查询任务
        await asyncio.sleep(delay)
        await self.get_qycscheckShareList(session)#分享通用确认
        await asyncio.sleep(delay)
        print(f"{self.currPhone}:开始查询可抽奖次数")
        datanum= await self.get_qycsUserRaffleCount(session)#查抽奖次数
        print(f"{self.currPhone}:抽奖次数"+str(datanum))
        if datanum is not None and datanum > 0:
            for i in range(datanum):
                print(f"{self.currPhone}:开始抽奖第 {i + 1} 次")
                await self.get_qycsuserRaffle(session)
        else:
            print(f"{self.currPhone}:没有抽奖次数或者发生某种异常!")

        await asyncio.sleep(total_tasks)
        await self.get_qycsgetMyPrize(session)#查询奖品领取情况
        await asyncio.sleep(delay)
        await self.get_qycsxy(session,delay)#许愿

        return None

    async def main(self):
        delay = 0.6
        async with AsyncSessionManager(timeout=None, verify=False) as session:
            task = asyncio.create_task(self.process_task(session,delay))
            await task


async def main(tokens):
    processors = [TaskProcessor(token) for token in tokens]
    tasks = [processor.main() for processor in processors]
    await asyncio.gather(*tasks)

if __name__ == '__main__':
    if config.draw_before:
        print("开启领取以前的权益")
    else:
        print("关闭领取以前的权益")



    PHONES =os.environ.get('chinaUnicomCookie2') or '''token1@token2@token3'''
   
    ltTokens_list = re.split(config.split_pattern, PHONES)
    total_tasks = len(ltTokens_list)
    print("共有任务数："+str(total_tasks))
    asyncio.run(main(ltTokens_list))
