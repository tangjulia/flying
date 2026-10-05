# WEBHEAD CAMPUS · 桌面版豆包识餐部署

校园主页的本次新增模块按桌面网页使用设计。饮食、零食、运动、身体指标和目标记录保存在当前浏览器中；不提供账户同步。

当前公开地址是 GitHub Pages 项目页。GitHub Pages 只托管静态文件，无法执行 `functions/api/meal-analyze.js`。为保留原来的主页地址，需要单独部署图片识别 API：

1. 将本项目根目录部署为一个 Cloudflare Pages 项目，Framework preset 选 `None`，Build command 留空，Build output directory 填 `.`。它会给出一个 `*.pages.dev` 地址。
2. 在 Cloudflare Pages 项目的 **Settings → Variables and Secrets** 配置 Secret：
   - `ARK_API_KEY`：火山方舟 API Key。
   - `ARK_MODEL`：已开通且支持图片输入的 Seed 2.0 模型 ID；接口默认 `doubao-seed-2-0-pro-260428`。
   - `GRADE_ACCESS_CODE`：高强度个人访问码。
3. 把 `config.js` 中的空字符串替换成 `https://你的项目名.pages.dev/api/meal-analyze`，然后将更新的静态文件发布到 GitHub Pages 原站。
4. 打开原站，拍摄餐食照片并输入访问码识别。

接口仅允许 `https://tangjulia.github.io` 发起跨域请求。照片限 JPG、PNG、WebP 且不超过 8 MB，只在请求期间转发给方舟，不写入服务端存储。输出营养数值是粗略估算，请核对份量后保存。方舟调用可能计费，建议设置用量告警和 API 频率限制。

如果改为把整个主页托管在 Cloudflare Pages，则不需要编辑 `config.js`；留空会请求同源 `/api/meal-analyze`，但访问地址将使用 Cloudflare Pages 域名。


## 创意实验室 AI 分析（可选）

如果要让 `orbit-atlas.html` 中的“让 AI 拆解这个想法”直接连接模型，需由支持 Cloudflare Pages Functions 的同源地址提供 `/api/idea-review`，并在该 Pages 项目配置 Secret `ARK_API_KEY`、`IDEA_ACCESS_CODE`，可选配置 `ARK_MODEL`。访问码由页面使用者输入，只在当前页面内存中保留；模型调用会把所选想法文本发送给火山方舟。普通静态托管/本地 `http.server` 不会运行 Pages Function，页面会改为提供可复制的提示词，不会泄露 API Key。
