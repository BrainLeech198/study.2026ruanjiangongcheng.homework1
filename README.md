# 软件工程 · 作业 1 — 个人主页 + 数字分身

这是「软件工程」课程作业 1 的交付仓库，对应 [VibeVibe 基础篇](https://www.vibevibe.cn/Basic/) **第 0 ~ 2 章** 的实践成果：

> 从零做出一个「个人主页 + 数字分身」作品，带回本地，用 Git 管理，并上线成别人可以访问的网页。

- 线上地址（GitHub Pages）：`https://brainleech198.github.io/study.2026ruanjiangongcheng.homework1/`
- Gitee 仓库：`https://gitee.com/Mr_brainleech/study.2026ruanjiangongcheng.homework1`
- 推送方式：**只推送 Gitee**，由 Gitee 自动镜像到 GitHub，再由 GitHub Pages 发布 `/docs`。

---

## 一、对应教程章节

| 章节 | 教程解决的问题 | 本仓库的落地 |
| --- | --- | --- |
| 第 0 章 开始前 | 知道要学什么、怎么学、卡住怎么办 | 学习地图见本文档「四、踩坑与求助」 |
| 第 1 章 第一个版本 | 做出能预览、能展示、能聊天的原型 | `docs/index.html` + 数字分身聊天区 |
| 第 2 章 从平台到本地 | 项目拉回本地、可运行、可修改、可回退 | 本地静态站点 + Git 分阶段提交 |

## 二、目录结构

```
作业1/
├─ docs/                 # 静态网页（GitHub Pages 发布目录）
│  ├─ index.html         # 主页：首屏 / 关于我 / 作品 / 数字分身 / 联系
│  ├─ .nojekyll          # 告诉 GitHub Pages 别用 Jekyll
│  └─ assets/
│     ├─ styles.css      # 深色科技感样式
│     ├─ app.js          # 交互 + 数字分身逻辑
│     ├─ avatar.png      # 头像（替换成你自己的照片即可）
│     └─ favicon.svg     # 站点图标
├─ README.md
└─ .gitignore
```

## 三、本地运行

这是一个纯静态站点，不需要构建、不需要依赖。

**方式一：直接打开**
双击 `docs/index.html` 即可在浏览器预览。

**方式二：本地起一个静态服务（推荐）**
```bash
cd docs
python -m http.server 8080
# 然后浏览器打开 http://localhost:8080
```

> 说明：用本地服务打开，字体、图标等资源加载更完整，效果和线上更接近。

## 四、怎么改成「你自己」的内容

占位信息集中在几处，替换即可：

1. **主页文案**：编辑 `docs/index.html`，搜索 `BrainLeech`、`brainleech198@foxmail.com`、占位介绍文字。
2. **头像**：把你的照片命名为 `avatar.png` 覆盖 `docs/assets/avatar.png` 即可（无需改代码）。
3. **数字分身内容**：编辑 `docs/assets/app.js` 顶部的 `TWIN_PROFILE`、`TWIN_QA`、`QUICK_CHIPS`
   三个常量，就能改人设、改问答、改快捷问题。
4. **社交链接**：`index.html` 里的 GitHub / Gitee / 邮箱链接换成你自己的。

## 五、数字分身：从「预设」到「真实大模型」

当前版本是 **前端预设问答**（关键词匹配，无需后端，静态托管即可），并且**已经预留了真实大模型接口**。

以后要接真实模型，只需要注入一个处理函数：

```js
window.DigitalTwin.setReplyHandler(async (message) => {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  const data = await res.json();
  return data.reply; // 返回字符串即可
});
```

注入后，聊天窗口会自动切换为「实时模式」，前端逻辑无需再改。

> 安全提示：真实 API Key 不能写在前端页面里。正式接入时，需要一个后端代理来保管密钥。

## 六、部署说明

1. 本地提交并推送到 Gitee。
2. Gitee 仓库开启「镜像到 GitHub」，自动同步到 GitHub。
3. GitHub 仓库 → Settings → Pages → Source 选择 `main` 分支的 `/docs` 目录。
4. 等待构建完成，访问 `https://brainleech198.github.io/study.2026ruanjiangongcheng.homework1/`。

## 七、录制 / 截图建议

- 首屏（姓名 + 一句话介绍 + 头像）
- 关于我信息卡
- 数字分身聊一轮（证明能对话）
- 手机端宽度下浏览正常

## 八、踩坑与求助

遇到报错时的统一流程（对应第 0 章）：

1. 先截图或复制完整报错信息。
2. 说清楚「我在做哪一步」「期望结果」「实际结果」。
3. 把上下文一起交给 AI，让它先定位、再给最小修改。
4. 一次只改一类问题，改完立即刷新验证。

---

用 AI 做出来的第一个作品 · 2026
