---
title: Linux内核阅读片段
date: 2020-07-08 17:33:39
intro: RTFS
featured_image: https://s2.ax1x.com/2019/08/21/mtTvPP.md.png
category: 技术
---

终于还是从Linux-2.6.35起步了...
祝自己好运吧

## 内核的配置宏归纳
***
* CONFIG_THUMB2_KERNEL

## ARM指令相关
***
总结一些不太熟悉的指令

### mrc和mcr指令
MRC指令将协处理器的寄存器中的数据传到ARM处理器的寄存器中。如果协处理器不能成功地执行该操作，将产生未定义的指令异常中断。

MCR指令将ARM处理器的寄存器中的数据传送到协处理器的寄存器中。

### 伪指令.align
在ARM模式下，前面的数据如果没有四字节对齐，那么后面的标号可能会存在不四字节对齐的情况。因为ARM是四字节取指运行。所以，如果没有对齐，那么取指令会取到错误的地方。

### 伪指令.type
.type:指定符号的类型，“.type main,%function”表示main为函数

### 伪指令.rept
作用：重复执行后面的命令
格式：
```C
.rept count      /*count 表示重复次数*/
commands     /*重复的commands命令体*/
.endr
```

### mrs和msr  
在ARM处理器中，只有MRS（Move to Register from State register）指令可以对状态寄存器CPSR和SPSR进行读操作。通过读CPSR可以获得当前处理器的工作状态。读SPSR寄存器可以获得进入异常前的处理器状态（因为只有异常模式下有SPSR寄存器）。

例如：

MRS    R1，CPSR   ; 将CPSR状态寄存器读取，保存到R1中
MRS    R2，SPSR    ; 将SPSR状态寄存器读取，保存到R2中

### 伪指令adr
adr    r0, _start 
将指定地址赋到r0中，ADR是小范围的地址读取伪指令.ADR 指令将基于PC 相对偏移的地址值读取到寄存器中.在汇编编译源程序时,ADR 伪指令被编译器替换成一条合适的指令

## 内核代码段分析
***
### _HEAD宏
位于./include/linux/init.h +102
```C
#define __HEAD		.section	".head.text","ax"
```
将这段代码链接到.head.text这个区域中，.head.text在链接脚本中指定。
"ax" 表示该节区可分配并且可执行。
"ax" 是allocation和execute的缩写。

### .section ".start", #alloc, #execinstr
`#allac`:表示该section可分配
`#execinstr`:表示该section可执行
总体来看和上述和__HEAD宏一样

### setmode宏实现
位于`./arch/arm/include/asm/assembler.h +170`，实现如下
```c
#ifdef CONFIG_THUMB2_KERNEL
	.macro	setmode, mode, reg
	mov	\reg, #\mode
	msr	cpsr_c, \reg
	.endm
#else
	.macro	setmode, mode, reg
	msr	cpsr_c, #\mode
	.endm
#endif
```
如果是Thumb2指令编译的内核的话，需要先把值放入一个寄存器，再写入cpsr（程序状态寄存器）。该宏的作用是用于设置ARM CPU的模式。

```
知识点1: 
在ARM处理器中，只有MSR指令可以对状态寄存器CPSR和SPSR进行写操作。

知识点2: 
cpsr_c代表的是这32位中的低8位，也就是控制位，分别是I、F、T、M[4:0]。
当异常发生时这些位产生变化。在特权级的处理器模式下，软件可以修改这些位。

其中当I=1时禁止IRQ中断，当F=1时禁止FIQ中断。

ARM版本 < ARMv3 && ((ARM版本 == ARMv4) && 不包含T系列版本处理器)时
T=0，表示ARM指令
T=1，表示Thumb指令
ARM版本 > ARMv5 && 不包含T系列版本处理器 时
T=0，表示ARM指令
T=1，表示强制下一条执行的指令产生未定义指令中断

M[4:0]=0b10000，User模式
M[4:0]=0b10001，FIQ模式
M[4:0]=0b10010，IRQ模式
M[4:0]=0b10011，Supervisor模式（SVC）
M[4:0]=0b10111，Abord模式
M[4:0]=0b11011，Undefined模式
M[4:0]=0b11011，System模式
```

## 寄存器记录
```c
/* 由bootloader传入这三个参数 */
r1 = arch ID
r2 = atags pointor
r3 = phy offset

/* 寄存器记录 */
r1  = LC0
r2  = __bss_start
r3  = _end
r4  = zreladdr
r5  = _start
r6  = _image_size
r7  = arch ID
r8  = atags pointor
r9  = phy offset
r11 = _got_start
ip  = _got_end
sp  = user_stack + 4096

```

## 内核初始化步骤
1. 保存bootloader由r1-r3传入的三个参数，分别是arch ID、atags pointor、phy offset。

2. 判断CPU是否运行在SVC模式，如果不在就用软件中断方式进入SVC模式，并关闭所有中断。

3. 重定位代码，调整zImage基地址，GOT的起点，GOT的终点，清除BSS段（可选），重定位GOT中的函数地址。

4. 清除BSS段



## 参考文献
***
1.Linux内核源码 Linux 2.6.35
1.杜春雷,《ARM体系结构与编程》，清华大学出版社，2003