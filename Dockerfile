
# 需要先在本地执行yarn install && yarn build

# docker build -t nanjiren01/aichat-web:0.8 ../AIChatWeb
# docker push nanjiren01/aichat-web:0.8
# docker tag nanjiren01/aichat-web:0.8 nanjiren01/aichat-web:latest
# docker push nanjiren01/aichat-web:latest

FROM node:18-alpine

WORKDIR /app

COPY ./public ./public
COPY ./node_modules ./node_modules
COPY ./.next/standalone ./
COPY ./.next/static ./.next/static
COPY ./.next/server ./.next/server
# 这里写你的oneapi后端地址
ENV BASE_URL=http://127.0.0.1:3001

EXPOSE 3000

CMD node /app/server.js;
