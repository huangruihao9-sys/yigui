# 双人共享衣橱

基于 [Lazztech/Libre-Closet](https://github.com/Lazztech/Libre-Closet) 0.6.0（08f66dd）的中文扩展。保留原作者版权，按 AGPL-3.0 提供完整修改源码，许可证见 LICENSE。

目标功能：衣物照片、共享归属与可穿者、干净/待洗/清洗/晾晒、两人每日穿搭、服务端冲突检查。两端通过同一网站同步，不需要注册或登录。

## 本地运行

使用 Node 22，执行 `npm ci`、`npm run build`，然后设置环境变量启动：

```sh
DATABASE_TYPE=sqlite AUTH_ENABLED=false TZ=Asia/Shanghai node dist/main.js
```

默认端口3000，数据位于 `data/`。测试：`npm test -- --runInBand`。浏览器测试：`npx playwright test --project=chromium`（需要本地服务运行）。

## 容器部署

`docker compose up -d` 使用构建后的公开镜像，见 compose.yaml。必须将持久卷挂到 `/app/data`，其中包含 SQLite 数据库和照片。单个实例即可；SQLite 不支持多个服务副本共用一个数据目录。

Cloady 的费用和免费资格以提交部署前的控制台报价为准：本项目约束为0.5 vCPU、1GB内存、持久卷不超过既有免费额度，不启用付费备份，不绑定支付卡。现有无卷应用不能直接覆盖更新：先导出数据，确认备份可恢复，再安排迁移。

## 数据与访问

该网站按要求关闭登录。知道网址的人可以访问和修改衣橱，请只在两人之间使用。手机通过服务器读写；离线页面不提供写入或后台同步，联网刷新后看到最新状态。

备份需要同时保留 SQLite 和照片。不要只在写入过程中复制 sqlite3.db：SQLite 可能还有 WAL 内容。先暂停写入，使用 SQLite 在线备份功能导出数据库，然后连同照片保存到服务器之外。卷可防止重启丢失数据，但不能替代独立备份。

明日按中国时间计算。人员“我”和“女朋友”是两个人的固定标签，不代表登录身份；每次安排可选择实际穿着者和搭配者。
