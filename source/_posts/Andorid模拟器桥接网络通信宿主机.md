---
title: Andorid模拟器桥接网络通信宿主机
date: 2020-01-09 23:03:01
intro: Andorid模拟器非google所介绍的第三种隐藏网络接入方法
featured_image: https://s2.ax1x.com/2020/01/09/lfNm26.md.jpg
tags: 
    - Android
    - Emulator
---

最近研究的项目，是以一个需要Andorid模拟器与宿主机通信的案例。其中通过查阅[google官方文档](https://developer.android.google.cn/studio/run/emulator-networking?hl=zh-cn)发现了两种进行网络通信的方式。正常情况下，andorid模拟器有自带一个网关，产生了一个局域网。andorid躲在这个网关背后。所以无法正常获取到与宿主机相同的网段ip，也就无法正常与宿主机。google提供的方法有两种方法：
* 通过模拟器控制台设置重定向，即将andorid的网络端口按照`tcp/udp:andorid`机端口:宿主机端口进行重定向。各自使用对应的localhost端口进行通信。

* 通过adb进行网络端口转发，使用`adb forward tcp:6100 tcp:7100`进行端口转发，和模拟器控制台进行重定向差不多，但是......
> “除了通过终止adb服务器来移除重定向以外，adb目前不提供任何移除重定向的方法。”

google官方文档这样写着。

其实这两种有种很大的弊端，google官方从应用设计的角度去考虑了，但不能满足应用开发者所要用到所有要求。即，当应用需要使用10+以上数量端口的时候，使用端口映射或许会使使用者变得焦虑无比，从而放弃。但庆幸，qemu的设计者并没有这么愚顿。emulator存在一个`-nap-tap`选项，用于满足使用tap的情形。也就是说，这将成为第三种给Andorid系统接入网络的方式。

## 进行准备工作
***
使用的实验环境：
* Ubuntu18.04
* Android emulator version 29.3.4.0 (build_id 6110076) (CL:N/A)
* Android10(Q)

查看系统支持：
qemu 支持多种网络链接方式，其中最常用的就是桥接(bridge)。 这需要依赖内核的 tun/tap 模块的支持，输入如下命令查看`/dev/net/tun`文件。

```bash
ls -l /dev/net/tun 
crw-rw-rwT 1 root root 10, 200 Apr 15 02:23 /dev/net/tun
```
如果存在，说明内核已经支持

安装必须的工具：
```bash
# 虚拟网桥工具
sudo apt-get install uml-utilities
# UML（User-mode linux）工具
sudo apt-get install bridge-utils
```
## 创建网桥
***
针对创建网桥的方式，根据如图所示

<img src="https://s2.ax1x.com/2020/01/09/lfN5dJ.png" class="img-shadow" />

eth0为所使用的物理网卡,tap0为使用的虚拟网卡，br0为搭建在eth0上的网桥。需要注意的是，eth0在你的PC上可能为其他的名字，比如ens9等等。还有一点，创建网桥必须在有线网卡之上，否则不能将接口添加到br0中。（经过我的测试，无线网卡不支持，如果有办法添加，再更新此篇）。

下面以一个脚本up.sh来说明创建过程
```bash
#!/bin/bash

sudo ifconfig ens9 down # 除能有线网卡
sudo brctl addbr br0    # 添加网桥
sudo brctl addif br0 ens9 # 添加有线网卡到网桥
sudo brctl stp br0 off # 不需要STP(生成树协议)
sudo brctl setfd br0 1 # 设置网桥转发延迟
sudo brctl sethello br0 1 # 设置网桥hello时间
sudo ifconfig br0 0.0.0.0 promisc up  # 混杂模式启动网桥
sudo ifconfig ens9 0.0.0.0 promisc up # 混杂模式启动有线网卡
sudo dhclient br0 # 自动获取网桥ip
sudo ifconfig br0 192.168.31.22 netmask 255.255.255.0 # 配置网桥的ip地址和掩码
sudo route add -net 0.0.0.0 netmask 0.0.0.0 gw 192.168.31.1 # 添加网关信息
# 这里的ip地址和gateway，需要根据实际情况进行设置

# 创建tap
sudo tunctl -t tap0 -u user # 为用户user添加tap0，此处的user，填写自己的linux账户名
sudo brctl addif br0 tap0 # 添加tap0到网桥
sudo ifconfig tap0 0.0.0.0 promisc up # 混杂模式启动tap0
sudo brctl showstp br0 # 打印一下网桥的信息
```

下面以一个脚本down.sh来说明反创建过程
```bash
#!/bin/bash 

# adb会占用/dev/net/tun，导致后面的步骤失效，先杀掉
kill -9 $(pidof adb) 
sudo ifconfig tap0 down 
sudo tunctl -d tap0 # 删除tap0
sudo ifconfig ens9 down
sudo ifconfig br0 down
sudo brctl delbr br0 # 删除网桥
sudo ifconfig ens9 up

```

## 启动模拟器
***
仍然以脚本start_emulator来说明
```bash
#!/bin/bash

# 设置环境
export LD_LIBRARY_PATH=/home/user/Android/Sdk/emulator/lib64/qt/lib:/home/user/Android/Sdk/emulator/lib64


/home/user/Android/Sdk/emulator/qemu/linux-x86_64/qemu-system-x86_64 \
	-netdelay none \
	-netspeed full \
	-avd Lark_API_29 \
	-net-tap tap0 
```

其中`-net-tap0`即为使用刚刚创建好的tap0，这样进入android系统的时候，使用`adb shell`打开shell后，`ifconfig -a`，查看ip地址的时候，就可以发现，已经和宿主机是相同的ip地址了。互相ping一下，也能ping通。说明，andorid模拟器已经成为与宿主机同级网络下的一个终端机了。

上述环境所使用的android镜像是通过android studio下载安装的andorid镜像。

## 但是
***
很不幸运，上面所说的，在自己下载android源码并编译的系统镜像下，并不完全适用。需要修改的是以下几点。

* 默认关闭wifi网卡
* 使用刚刚创建好的脚本自动执行虚拟网卡的创建与删除
* 打通内外ip

首先，默认关闭wifi网卡。在模拟器启动参数中添加：
```bash
-feature -Wifi
```
这样android模拟器才会使用所指定的tap0，否则获取到的ip为192.168.200.2这样一个奇怪的ip。是一个二级网络中的ip。

使用创建好的up.sh和down.sh，在模拟器启动参数中添加：
```bash
	-net-tap-script-up $scriptsdir/up.sh \
	-net-tap-script-down $scriptsdir/down.sh
```
此处的`$scriptsdir`为这两个脚本存在的目录。

这样启动模拟器后，可能还是会存在一个问题，就是无法与外界ping通，但是ip是正确被设置了。
```
tcpdump -i eth0 # eth0为andorid系统内的网卡
```
这样看应该能够看到一些在滚动的数据，这个时候只需要在adb shell中执行
```
ip rule add from all lookup main pref 0
```

这样即可达到互相ping一下，也能ping通的效果了，也就完成了Andorid模拟器与宿主机通信的问题了。


