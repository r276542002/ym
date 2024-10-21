import requests, base64, json, sys, datetime
# 设置输出编码为UTF-8
sys.stdout.reconfigure(encoding='utf-8')


def get_url(token,ts):
    response = requests.get(
        url=f"https://passport.youzan.com/api/captcha/get-behavior-captcha-data.json?token={token}&captchaType=1&t={ts}")
    result = response.json()
    cy = result['data']['captchaObtainInfoResult']['cy']
    # 下载并保存bigUrl对应的图片
    big_url = result['data']['captchaObtainInfoResult']['bigUrl']
    big_response = requests.get(big_url)
    with open('bg.png', 'wb') as f:
        f.write(big_response.content)

    # 下载并保存smallUrl对应的图片
    small_url = result['data']['captchaObtainInfoResult']['smallUrl']
    small_response = requests.get(small_url)
    with open('tg.png', 'wb') as f:
        f.write(small_response.content)
        return cy


def ocr(target_b64str, bg_b64str):
    """使用自有ocr识别滑块坐标"""
    url = 'http://123.249.33.163:9898/slide/match/b64/json'
    jsonstr = json.dumps({'target_img': bg_b64str, 'bg_img': target_b64str})
    response = requests.post(url, data=base64.b64encode(jsonstr.encode()).decode())
    return response.json()


if __name__ == '__main__':
# 开始联动 用token获取滑块图片并存在本地
    token = sys.argv[1]
    ts = int(datetime.datetime.now().timestamp() * 1000)
    get_url(token,ts)
# 读取图片并base64
    target_file = open(r'bg.png', 'rb').read()
    bg_file = open(r'tg.png', 'rb').read()

    target_b64str = base64.b64encode(target_file).decode()
    bg_b64str = base64.b64encode(bg_file).decode()
# 调用ocr识别坐标
    result = ocr(target_b64str, bg_b64str)
    res = result['result']['target']
    stdout = int(round(res[0]/2))
    print(stdout,int(round(res[1]/2)))