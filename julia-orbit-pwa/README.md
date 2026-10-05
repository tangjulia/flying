# Julia Tang · 远航档案 PWA

这是一份可以部署为手机主屏幕网页应用的静态网页包。无需 Appbun：Appbun/electrobun 主要用于桌面应用封装，本项目用 PWA 更适合 iPhone 和 Android。

## 发布后安装

必须先把此目录里的内容部署到 HTTPS 网站（例如 Cloudflare Pages；可使用 GitHub Pages 发布静态版）。目前的 `localhost` 预览地址只在电脑上有效，手机不能直接把它当作公开安装地址。

- iPhone：用 Safari 打开 HTTPS 地址 → 分享 → 添加到主屏幕 → 添加。
- Android：用 Chrome 打开 HTTPS 地址 → 菜单 → 安装应用/添加到主屏幕。

## 页面功能与数据

- manifest、192/512 图标和独立窗口配置已准备好；service worker 缓存核心页面，可离线打开页面外壳。
- 任务勾选、创意和记录保存在当前浏览器的本地存储；更换设备不会自动同步。
- 图片与字体来自远程来源，离线时可能不显示；页面内容和外链资讯需要联网更新。
- AI 创意分析的 Cloudflare Pages Function 位于 `functions/api/idea-review.js`。如需启用直接分析，在 Pages 项目配置 `ARK_API_KEY` 与 `IDEA_ACCESS_CODE` 环境变量；API 访问码不要写进网页源文件。没有配置时可继续使用页面提供的 AI 提示词手动分析。

## 文件

- `orbit-atlas.html`：网页主体
- `orbit-atlas.webmanifest`：手机应用名称、启动页与图标
- `orbit-sw.js`：离线页面壳缓存
- `orbit-icon-192.png` / `orbit-icon-512.png`：应用图标
- `functions/api/idea-review.js`：可选的 Cloudflare Pages AI 接口