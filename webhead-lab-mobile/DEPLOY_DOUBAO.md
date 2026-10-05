# WEBHEAD LAB · 手机部署与豆包批改

该目录是独立的 Cloudflare Pages 项目，只发布本学习网页和 `/api/grade` 函数，不会把同一工作区的旧主页作为站点首页。

## 接入方舟视觉模型

1. 将 `webhead-lab-mobile` 作为 Cloudflare Pages 的项目根目录连接到 Git 仓库。Framework preset 选 `None`，Build command 留空，Build output directory 填 `.`。
2. 在 Cloudflare Pages 项目的 **Settings → Variables and Secrets** 添加：
   - `ARK_API_KEY`：火山方舟 API Key，类型选 Secret。
   - `ARK_MODEL`：你在方舟已开通、支持图片输入的模型 ID / Endpoint ID。接口代码默认使用 `doubao-seed-2-1-pro-260628`；如账号控制台分配了不同 Endpoint ID，以控制台显示为准。
   - `GRADE_ACCESS_CODE`：自己生成的高强度访问码，类型选 Secret。网页每次批改时输入此码。
3. 部署后打开 `https://你的项目名.pages.dev/`，在手机浏览器中允许使用相机或选择照片，填入访问码后提交。可以将此网址加入手机主屏幕。

接口使用豆包方舟 Chat Completions 的图片 Base64 输入。照片只在请求期间由函数转发到方舟，不写入项目文件或持久存储；限制 JPG、PNG、WebP，最大 8 MB。API Key 和访问码都保留在服务端环境变量，不放进网页源码。

上线前在 Cloudflare 为 `/api/grade` 加一条请求频率限制规则，并在方舟控制台设置用量告警。访问码是个人站点的基础门槛，勿在公开场合分享。方舟调用会按账号套餐计费。

## 本地开发

在该目录运行 `npx wrangler pages dev .`，并用 Wrangler Secret / 本地 `.dev.vars` 注入上述三个变量；不要把真实密钥提交到 Git。打开 Wrangler 打印出的本地 HTTPS 地址测试。

静态文件直接以 `file://` 打开时，拍照预览可用，但豆包请求不可用；必须经 Cloudflare Pages Functions 或支持同一 `/api/grade` 协议的 HTTPS 服务部署。
