# 双人共享衣橱实施计划

Goal: 在现有 Libre-Closet 原型上交付中文、免登录、两人共用的衣橱，并在免费 Cloady 环境持久部署。

Architecture: 保留 NestJS、SQLite、Handlebars 和现有 DaisyUI 组件。在衣物上增加清洁状态、主要归属、可穿者；日历增加实际穿者、搭配者。所有写入在服务端校验。数据库只增加字段，保留原衣物、照片、搭配。照片和 SQLite 同放 /app/data 持久卷。

Tech Stack: Node 22, NestJS 11, MikroORM 6, SQLite, Handlebars/HTMX, existing Tailwind/DaisyUI, GitHub Actions, Cloady.

Spec: ../../../../../outputs/衣橱项目交接.md（本会话用户已授权完成其所列事项）。

Global Constraints: 免费、不绑卡；不新增账号系统；保留 AGPL 许可证并公开修改源码；不得在代码、输出或 Git 中写入凭据；更新前核实线上数据并备份；不可逆删除另行确认。保留原有布局，只添加必要的表单与两人卡片。日期按中国日历日计算；人员默认“我 / 女朋友”，双方均可编辑。

Review Focus: 两端并发预约同件衣物；编辑已安排的搭配能否绕过冲突检查；穿过后状态变化和撤销；无登录数据归属过滤；旧数据库迁移及照片存续；恶意日期/人员/状态参数；中文覆盖；云平台真实费用和重建后的持久性。

## Task 1: 导入完整上游并建立可运行基线

Files: package*.json, src/, views/, public/, patches/, LICENSE, Dockerfile, .github/workflows/build-image.yml.
Interfaces: 保留上游路由与持久化目录；用源代码构建镜像，镜像标签继续原地址。
Steps: 导入上游 08f66dd；安装 Node22 依赖；运行原测试并记录基线；本地构建。
Expected: 原项目可构建，预先存在的失败被区分记录。Commit: chore: import Libre-Closet source for shared wardrobe.

## Task 2: 衣物状态与双人属性

Files: garment.entity.ts, garment.service.ts, wardrobe.controller.ts, create/update-garment DTOs, wardrobe form/show/index, SQLite/Postgres additive migrations, service/migration tests.
Interfaces: laundryStatus=clean|dirty|washing|drying；primaryOwner=me|partner|both；wearableBy=me|partner|both。旧记录默认干净/共用/都可穿。
Steps: 先写状态校验和旧数据保留测试并看到失败；实现字段、服务端枚举校验与表单、详情状态操作、状态过滤；运行定向测试与构建。
Expected: 无效状态返回中文错误，更新旧记录不丢照片，筛选和状态变更两端刷新可见。Commit: feat: track shared garment ownership and laundry.

## Task 3: 两人明日穿搭与冲突校验

Files: calendar.service/controller, outfit.service/controller, calendar DTO/entity, calendar/outfit forms, new together view/controller as needed, integration tests.
Interfaces: wearer=me|partner，plannedBy=me|partner；首页默认明天两张卡，可切日期、挑现有搭配、创建搭配、替换/取消计划。只安排干净、未归档且可穿的衣物；同人同日一套，同件同日不得重复。数据库事务内完成检查和写入；SQLite 单写串行化。已安排的搭配在改衣物前提示先取消安排，避免绕过冲突。穿过进入待洗；撤销穿过不自动变干净。
Steps: 真实内存 SQLite 集成测试先失败，覆盖交叉穿衣、重复预约、脏衣、非法日期、归属隔离、并发、穿后待洗；实现中央校验和双人卡；原日历和创建搭配入口传递人员；运行集成测试和全套测试。
Expected: 两个独立客户端得到同一服务端状态，冲突明确提示且不覆盖另一人的计划。Commit: feat: plan two-person outfits with garment reservations.

## Task 4: 全中文与端到端验收

Files: src/i18n/zh/lang.json, app.module.ts, layout/views/public user-visible strings, browser tests, README.md.
Interfaces: 默认 zh，英文浏览器也显示中文；页面导航、提示、错误、空态、状态、日期均中文。保留项目名、技术标识和许可证原文。
Steps: 逐页检查硬编码英文；补齐词典；本地真实浏览器验证上传照片、共享筛选、两人安排、冲突、洗涤状态、重启保留；运行构建、单元/集成/浏览器测试；整分支独立审查。
Expected: 390px 手机宽度无横向溢出，主要操作可触达；截图可供用户审阅。Commit: feat: finish Chinese wardrobe experience.

## Task 5: 免费持久部署并验证

Files: Dockerfile, compose.yaml, workflow, deployment/backup instructions, outputs 验收记录。
Interfaces: /app/data 持久卷，服务3000，AUTH_ENABLED=false，TZ=Asia/Shanghai，PWA_ENABLED=true；不启用付费备份。
Steps: 先检查旧数据和现有账单/卷；导出一致性备份；提交公开修改源码并构建可拉取镜像；在免费额度内部署，必要的删除/新安全凭据在具体动作前确认；访问线上验收并重启检查持久性。
Expected: 真实在线中文双人衣橱，照片与记录重启不丢、费用$0、无需登录。凭据或平台限制若阻塞部署，继续完成全部本地可验证工作并明确指出具体缺口。
