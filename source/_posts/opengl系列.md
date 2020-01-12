---
title: OpenGL（一）
date: 2019-08-18 14:38:07
intro: 关于openGL的学习，包括安装配置编码等等
featured_image: https://s2.ax1x.com/2019/08/21/mtbNHH.md.jpg
tags: 
    - openGL
---
# 《安装GLFW》
***
## 安装cmake-qt-gui
```bash
sudo apt-get install cmake-qt-gui
```
这个命令会将cmake作为依赖一并安装上

## 用CMake命令行工具产生文件
产生一个内部编译环境, 进入GLFW的源码顶层目录(提示：不是src子目录)并运行CMake.把当前目录用作目标目录, 用提供的路径参数去寻找源码目录
```bash
cd <glfw-root-dir>
cmake .
```
产生一个外部编译环境, 创建一个源码外的目录, 进入这个刚创建的目录并运行CMake，源码的顶层目录的路径当作参数
```bash
mkdir glfw-build
cd glfw-build
cmake <glfw-root-dir>
```
一旦你为你选择的开发环境产生了工程文件或者makefile，就可以去编译了。

## 编译安装
然后在glfw-build中
```bash
make
make install
```

以下是install目录
```
-- Installing: /usr/local/include/GLFW
-- Installing: /usr/local/include/GLFW/glfw3.h
-- Installing: /usr/local/include/GLFW/glfw3native.h
-- Installing: /usr/local/lib/cmake/glfw3/glfw3Config.cmake
-- Installing: /usr/local/lib/cmake/glfw3/glfw3ConfigVersion.cmake
-- Installing: /usr/local/lib/cmake/glfw3/glfw3Targets.cmake
-- Installing: /usr/local/lib/cmake/glfw3/glfw3Targets-noconfig.cmake
-- Installing: /usr/local/lib/pkgconfig/glfw3.pc
-- Installing: /usr/local/lib/libglfw3.a
```

# 《安装GLAD》
***
[点击这里]( https://glad.dav1d.de/)使用glad的在线服务获取glad代码。

Language 选择C/C++

Specification 选择OpenGL

API - gl 选择 opengl3.3

gles1 选择 none

gles2 选择 none

gles3 选择 none

profile 选择 Core

Extentions保持原状

Options 勾选 Generate a loader

其他不勾选

最后选择按下GENERATE，就会下载到一个zip包，两个.h文件，一个.c文件

在工程源码的顶层目录新建一个名为glad的文件夹，将三个文件放入glad目录中。
```
src|__glad|__khrplatform.h
          |__glad.h
          |__glad.c
```

# 《使用QtCreator创建opengl工程》
***
## 创建Qt工程

打开QtCreator中新建项目，选择非Qt的C++工程，然后将glad添加到工程中

## 在pro文件中添加lib
```
LIBS += /usr/local/lib/libglfw3.a

LIBS += -L/usr/lib/x86_64-linux-gnu -lX11 \
		-L/usr/lib/x86_64-linux-gnu -lpthread \
		-L/usr/lib/x86_64-linux-gnu -lXrandr \
		-L/usr/lib/x86_64-linux-gnu -lXi \
		-L/usr/lib/x86_64-linux-gnu -lGLEW \
		-L/usr/lib/x86_64-linux-gnu -lGL \
		-L/usr/lib/x86_64-linux-gnu -ldl
```
## 添加代码

在main函数中添加
```c

#include <iostream>
#include <glad/glad.h>
#include <GLFW/glfw3.h>

using namespace std;

void framebuffer_size_callback(GLFWwindow* window, int width, int height)
{
	glViewport(0, 0, width, height);
}

int main()
{
	/* 初始化glfw */
	glfwInit();

	/* 设置使用的opengl版本 */
	glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
	glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);

	/* 设置使用核心模式 */
	glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

	/* MAC OS X需要添加下面这句话 */
	//glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);

	/* 创建窗口 */
	GLFWwindow* window = glfwCreateWindow(800, 600, "LearnOpenGL", nullptr, nullptr);
	if (window == nullptr)
	{
		std::cout << "Failed to create GLFW window" << std::endl;
		glfwTerminate();
		return -1;
	}

	/* 为这个window创建一个opengl的上下文 */
	glfwMakeContextCurrent(window);

	/* 使用glad将opengl的函数全部载入 */
	if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress))
	{
		std::cout << "Failed to initialize GLAD" << std::endl;
		return -1;
	}
	/* 告诉OpenGL渲染窗口的尺寸大小 */
	glViewport(0, 0, 800, 600);

	/* 如果发生了resize的时候，回调framebuffer_size_callback再次告诉OpenGL渲染窗口的尺寸大小 */
	glfwSetFramebufferSizeCallback(window, framebuffer_size_callback);

	/* 检查一次GLFW是否被要求退出 */
	while(!glfwWindowShouldClose(window))
	{
		/* 交换颜色缓冲（它是一个储存着GLFW窗口每一个像素颜色值的大缓冲），它在这一迭代中被用来绘制，并且将会作为输出显示在屏幕上。 */
		glfwSwapBuffers(window);
		/* 检查有没有触发什么事件（比如键盘输入、鼠标移动等）、更新窗口状态，并调用对应的回调函数 */
		glfwPollEvents();
	}
	/* 正确释放/删除之前的分配的所有资源 */
	glfwTerminate();
	return 0;
}
```

## 编译运行之后会出现一个漆黑的窗口

<img src="https://s2.ax1x.com/2019/08/18/mMLZ9J.md.png" class="img-shadow" />
