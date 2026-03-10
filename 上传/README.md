# 《昨日的世界》读书笔记

> 斯蒂芬·茨威格《昨日的世界——一个欧洲人的回忆》的交互式读书笔记网站。

## 预览

打开 `index.html` 或通过本地服务器访问：

```bash
python3 -m http.server 8080
# 浏览器访问 http://localhost:8080
```

## 功能

- **人物走马灯** — 3D 视差效果展示书中关键人物
- **时间线** — 按历史时期分组的大事记卡片，点击可展开原文侧边栏
- **金句** — 摘录的核心引文
- **想法** — 读书批注与思考
- **全文搜索** — 模糊搜索书籍原文、时间线、金句、想法，支持下拉滚动查看更多结果
- **原文侧边栏** — 点击时间线卡片，右侧滑出原文上下文，高亮匹配段落

## 文件结构

```
├── index.html            # 主页（首页 + 内容区）
├── people-magazine.html  # 人物详情杂志页
├── style.css             # 全局样式（间距系统、组件规范）
├── script.js             # 主脚本（GSAP 动画、Lenis 平滑滚动）
├── search.js             # 搜索模块（Fuse.js 模糊搜索）
├── book-content.json     # 书籍全文数据（按章节分段）
├── 设计规范.html          # 设计系统文档（色彩、字体、间距、组件）
└── images/
    ├── avatar.png
    ├── background-gradient.png
    └── people/           # 人物图片
```

## 技术栈

| 库 | 用途 |
|----|------|
| [GSAP](https://gsap.com/) + ScrollTrigger | 滚动动画、视差效果 |
| [Lenis](https://github.com/darkroomengineering/lenis) | Apple 风格平滑滚动 |
| [Fuse.js](https://fusejs.io/) | 前端模糊搜索 |
| Material Symbols Rounded | 图标 |
| Playfair Display / Inter / Noto Serif SC | 字体 |

## 设计规范

打开 `设计规范.html` 查看完整设计系统文档，包含：

- 色彩系统（背景层级、文字色阶、强调色、时代语义色）
- 字体系统（双字体族、字阶展示）
- 间距系统（4pt Grid：8 / 12 / 24 / 36 / 48 / 76 / 100px）
- 圆角、玻璃层级、组件规范、动效 token

## 注意

`book-content.json` 通过 `fetch()` 异步加载，需要通过 HTTP 服务器访问，直接用 `file://` 打开会导致全文搜索不可用。
