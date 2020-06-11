## Ubunut下使用

安装npm
```bash
sudo apt-get install npm
```

安装需要的组件
```bash
sudo npm install hexo-cli -g
sudo npm install 
sudo npm install --save hexo-helper-live2d
cd node_modules/live2d-widget-model-haru/
cp package.json 02/package.json
```

回到顶层目录执行
```
hexo g
hexo s
```