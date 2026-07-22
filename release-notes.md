# v2.0.0-beta — 动画系统的优化和 Header 的升级

## 概述

本次版本对博客的导航系统进行了全面重构，引入了 Apple 风格的导航交互体验。主要围绕两个方向：**Header 交互升级** 和 **动画系统重构**。

---

## 新增功能

### 1. Header 扩展面板（HeaderAnimationController）

当鼠标 hover 导航项（随笔/笔记/经验/标签）时，从 header 下方展开一个 400px 的扩展面板，总视觉高度从 72px → 472px。

- 实时从 API 加载分类标签，最多显示 4 个
- 标签以大号加粗字体垂直排列
- 面板背景与 header 一致的玻璃效果（backdrop-filter: blur）
- 搜索按钮点击也可触发面板（内容待配置）

### 2. 页面毛玻璃遮罩（PageDimOverlay）

面板展开时，页面主体覆盖毛玻璃效果：

- 背景极轻微暗化 + ackdrop-filter: blur
- <main> 区域直接 ilter: blur(8px) 确保兼容性
- 点击遮罩区域可收起面板

### 3. 滚动入场动画优化

- .reveal 元素的入场动画从 	ransform 改为 	ranslate 属性
- 修复了 ackdrop-filter 无法穿透 GPU 合成层的问题

---

## 动画系统

### 进入动画

| 场景 | 动画 | 时长 | 缓动 |
|------|------|------|------|
| 面板展开 | height 0 → 400px | 0.5s | cubic-bezier(0.16,1,0.3,1) |
| 标签出现 | opacity 0→1 | 0.5s | same |
| 标签 Stagger | 从上到下依次淡入 | 间隔 80ms | same |
| 遮罩淡入 | opacity 0→1 | 0.5s | same |

### 退出动画

| 场景 | 动画 | 时长 |
|------|------|------|
| 标签消失 | 自下而上淡出 | 0.5s + stagger |
| 面板收起 | height 400→0 | 0.5s |
| 遮罩淡出 | opacity 1→0 | 0.5s |

退出时面板和标签动画**同步进行**。

### 切换动画（左右滑动导航项）

- 旧标签 0.02s 快速淡出
- 10ms 后新标签 0.02s 快速淡入
- 两者同时完成，呼应切换动作

首次打开时使用完整的 Stagger 进入动画，后续切换仅触发快速交叉淡入淡出。

---

## 文件变更

### 新增

- public/js/header.js — 整合了 Header 渲染 + 扩展面板 + 遮罩（取代原先的独立模块）

### 删除

- public/js/HeaderAnimationController.js — 功能合并进 header.js
- public/js/PageDimOverlay.js — 功能合并进 header.js
- public/js/mega-menu/ — 整目录删除

### 修改

- public/css/style.css — .reveal 动画从 	ransform 改为 	ranslate
- public/index.html — 统一使用 header.js，移除旧内联脚本
- public/article.html — 同上
- public/tags.html — 同上
- public/category.html — 同上
- public/categories.html — 替换内联 header 为统一 header
- public/search.html — 同上

### 原来就有的文件（未修改）

| 文件 | 说明 |
|------|------|
| public/tag.html | 哈希完全匹配 HEAD |
| public/admin.html | 单页应用，未参与本次变更 |

---

## 修复的 Bug

1. **IIFE 分号缺失** — 两个 (function(){...})() 之间缺少 ;，导致 Uncaught TypeError: (intermediate value) is not a function
2. **编码损坏** — PowerShell Set-Content 默认 ANSI/GBK 写入，UTF-8 中文乱码 → 使用 [System.Text.UTF8Encoding]False 无 BOM 编码
3. **合成层冲突** — .reveal 的 	ransform 触发 GPU 独立合成层，ackdrop-filter 无法穿透 → 改用 	ranslate 属性
4. **CATEGORY_MAP 键不匹配** — 繁简体中文混用导致标签查找失败
5. **文件重复 IIFE** — 多次文件重建导致内层 IIFE 重复 → 最终文件仅有 2 个独立 IIFE

---

## 后续可优化方向

- [ ] 搜索按钮点击面板内容
- [ ] 标签字体样式微调
- [ ] 键盘导航支持
- [ ] prefers-reduced-motion 无障碍适配
- [ ] 添加「关于」页面及相关导航

---

*发布日期：2026-07-22*