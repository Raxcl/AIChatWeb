
# 此分叉版本的主要变更

1. 完美接入 oneapi，实现 oneapi 代替 原后端的所有接口，且完全开源免费
2. 修复各种bug，项目原作者由于开启了圈钱模式，已经不维护bug了。欢迎体验此二开分支
3. 接入 chat-next-web，不断迭代各种功能（进行中）

# 本项目部署（oneapi自行部署）
1. 修改 Dockerfile 的 BASE_URL 为 opeapi的后端地址
2. 服务器安装nodejs环境
3. 上传本项目至服务器（需移除.env文件）
4. 构建docker镜像

```shell
npm install -g yarn
yarn install
yarn add --dev cross-env
yarn build
docker build -t aichat-web:latest .
```
5. 运行项目
```shell
docker run -p 3000:3000 aichat-web
```

# 本地测试 （oneapi自行启动）
```shell
yarn
yarn dev
```