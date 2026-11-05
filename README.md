# yigui

Libre-Closet 官方镜像 + 中文翻译，两个人衣橱原型用的中文版镜像源（镜像名 `libre-closet-zh`）。

只改了一处：在官方镜像里加了中文翻译文件 `lang.json`，放到
`/app/dist/i18n/zh/lang.json`。不改任何代码、不改数据库、不改端口。
翻译共 309 个键，与英文原版一一对应。

## 镜像

`ghcr.io/huangruihao9-sys/libre-closet-zh:latest`

由 `.github/workflows/build-image.yml` 在 push 到 main 时自动构建并推送。

## 部署环境变量

| 变量 | 值 |
| --- | --- |
| `AUTH_ENABLED` | `false`（直接访问，无需注册/登录） |
| `PWA_ENABLED` | `true` |
| `DATA_PATH` | `/app/data` |
| 端口 | `3000` |

中文由浏览器语言决定：浏览器语言为中文（`Accept-Language` 含 `zh`）时显示中文，否则回退英文。
