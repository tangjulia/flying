# 在 iPhone 上安装 WEBHEAD

本项目按 iPhone Safari 可安装的网页应用（PWA）配置：独立窗口显示、主屏幕图标、适配手机宽度与安全区域，并缓存页面外壳以便离线打开。它不需要从 App Store 下载。

## 添加到主屏幕

1. 确保网站已通过 HTTPS 发布。
2. 在 iPhone 的 Safari 打开网站。
3. 点“分享”→“添加到主屏幕”。
4. 打开“作为 Web App 打开”选项，再点“添加”。
5. 从主屏幕点 WEBHEAD 图标启动。

饮食、运动和身体指标目前保存在各自设备的浏览器本地，不会自动与电脑同步。拍照识别需要配置好豆包服务端接口并保持联网。

如果目标改为提交 Apple App Store 的原生安装包，则需要另外用 Capacitor 包装并在 macOS/Xcode 环境构建；PWA 不等于 App Store 原生应用。
