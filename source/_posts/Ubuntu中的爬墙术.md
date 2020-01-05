---
title: 爬墙術
date: 2019-08-16 21:37:12
intro: ubuntu中的浏览器、terminal、应用的shadowsocks使用方法
featured_image: https://s2.ax1x.com/2019/08/21/mtqyJ1.md.gif
tags: 
    - Ubuntu
    - 爬墙术
---

## 安装shadowsocks
```bash
sudo apt-get isntall shadowsocks
```

## 编辑本地配置文件
```bash
sudo vim /etc/shadowsocks/config.json 
```
内容如下
```json
{
	"server":"你的服务器IP",
	"server_port": "服务器暴露的端口",
	"local_address": "127.0.0.1",
	"local_port":1080,
	"password":"对应该端口的密码",
	"timeout":300,
	"method":"aes-256-cfb",
	"fast_open": false,
	"workers": 1,
	"prefer_ipv6": false
}
```

## 启动shadowsocks
```bash
sudo sslocal -c /etc/shadowsocks/config.json -d start
```
## 添加PAC模式

在浏览器里面添加switchyomega插件（扩展程序）

添加完成后，在SwitchyOmega的设置界面中，新建一个“情景模式”，代理服务器

该情景模式的名字随意起，这里取个名字“proxy”

### 代理服务器
代理协议：socks5
代理服务器： 127.0.0.1
代理端口： 1080

### 不代理的地址列表
使用默认的
127.0.0.1
::1
localhost

再新建一个“情景模式”，自动切换模式

### 规则列表设置
规则列表格式： AutoProxy
规则列表网址： https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt

点击立即更新情景模式

### 切换规则
规则列表规则：proxy
默认情景模式：直接连接

## 命令行中使用http代理


```bash
sudo apt-get install privoxy
```

在/etc/privoxy/config中添加
```bash
forward-socks5t   /               127.0.0.1:1080 .
```

注意最后的“.”不能省略

然后在.bashrc中添加
```bash
export http_proxy=http://127.0.0.1:8118
export https_proxy=http://127.0.0.1:8118
export ftp_proxy=http://127.0.0.1:8118
```

然后source一下.bashrc
```bash
source ~/.bashrc
```

## 其他应用
例如telegram

在setting中选择connect type

设置TCP with custon socks-proxy
Hostname：127.0.0.1
Port:127.0.0.1
Username:不填
Password:不填

取消Try connecting through IPv6勾选


