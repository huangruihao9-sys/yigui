# Libre-Closet 中文版（原型镜像）
# 在官方镜像的基础上，只加一个中文翻译文件，不改任何代码。
FROM ghcr.io/lazztech/libre-closet:latest

# 中文翻译文件，放到官方镜像 dist 下的 i18n 目录。
COPY lang.json /app/dist/i18n/zh/lang.json

# 与已部署原型一致的默认环境变量（部署平台上设置的环境变量会覆盖这里）：
# 直接访问，无需注册/登录；PWA 开启；数据存 /app/data；端口 3000。
ENV AUTH_ENABLED=false
ENV PWA_ENABLED=true
ENV DATA_PATH=/app/data

EXPOSE 3000
