/* =========================================================
   Mr. 赖 · 个人主页
   交互脚本 + 数字分身逻辑
   ========================================================= */

/* ---------------------------------------------------------
   1. 数字分身资料（想改内容，只改这里就行）
   --------------------------------------------------------- */
const TWIN_PROFILE = {
  name: "Mr. 赖",
  identity: "正在学习 AI 开发的学生",
  doing: "学 AI 开发，做游戏和小工具，最近准备上手 Godot",
  skills: "AI 开发、游戏框架与内容设计、写小工具",
  contact: "可以发邮件到 brainleech198@foxmail.com，或者去 GitHub / Gitee 找我",
};

/* 预设问答：matches 里任意关键词命中即算匹配 */
const TWIN_QA = [
  {
    matches: ["你好", "hi", "hello", "在吗", "在么", "嗨"],
    answer: "你好，我是 " + TWIN_PROFILE.name + " 的数字分身 👋 关于我，在学什么、做什么游戏、平时玩什么、年龄爱好，都可以随便问。",
  },
  {
    matches: ["你是谁", "介绍一下", "介绍", "你是"],
    answer:
      "我是 " + TWIN_PROFILE.name + " 的数字分身。真身是一个" + TWIN_PROFILE.identity + "，现在主要在" + TWIN_PROFILE.doing + "。",
  },
  {
    matches: ["现在", "在做什么", "做什么", "干嘛", "忙什么", "最近"],
    answer:
      "最近主要在做两件事：一是学 AI 开发，二是自己动手做游戏、设计游戏框架和内容。这个个人主页就是其中之一；接下来打算学 Godot 引擎，做点休闲治愈风的小游戏。",
  },
  {
    matches: ["做什么的", "身份", "职业", "专业", "学什么", "学生"],
    answer: "身份上是" + TWIN_PROFILE.identity + "，方向是 AI 开发和游戏开发。比起背概念，我更喜欢自己动手把东西做出来。",
  },
  {
    matches: ["作品", "做过", "项目", "portfolio"],
    answer:
      "已经开源的作品里，一个是「Claude 启动器」——给 Claude Code 做的 Windows 图形启动器，用 Python 写的；另一个就是你现在看到的这个个人主页 + 数字分身。两个都能在我的 GitHub / Gitee 上找到。",
  },
  {
    matches: ["擅长", "会什么", "技能", "能力", "技术"],
    answer: "我比较擅长" + TWIN_PROFILE.skills + "。简单说，就是能把想法变成一个能跑、能看、能玩的东西。",
  },
  {
    matches: ["游戏", "godot", "引擎", "做游戏", "开发游戏"],
    answer:
      "游戏是我很喜欢的方向。我喜欢自己设计游戏框架和内容，也会做些小工具玩。接下来打算学 Godot 引擎，做一些休闲治愈风格的游戏，做出来会公开给朋友们玩。",
  },
  {
    matches: ["兴趣", "爱好", "喜欢", "平时"],
    answer: "兴趣主要围绕 AI 应用、编程和游戏开发；业余喜欢打乒乓球、打 CS，也喜欢和 AI 一起设计点有意思的程序——比如用物理沙盒去模拟乒乓球。",
  },
  {
    matches: ["特点", "记忆点", "特别", "不一样"],
    answer: "我比较有记忆点的特点：喜欢把复杂问题讲成人话，不太爱堆术语；也爱和 AI 一起折腾点好玩的东西，想到什么就想做出来试试。",
  },
  {
    matches: ["年龄", "多大", "几岁", "出生", "生日"],
    answer: "具体的年龄就先不公开啦，留点神秘感 😄 想知道别的，可以问我学习、游戏或者爱好。",
  },
  {
    matches: ["联系", "方式", "邮箱", "email", "加微信", "怎么找"],
    answer: TWIN_PROFILE.contact + "。想聊交流，或者单纯认识一下，都很欢迎。",
  },
  {
    matches: ["你好厉害", "厉害", "加油", "支持", "棒"],
    answer: "谢谢你 🙌 我还在路上，能被人看到就是最大的鼓励。",
  },
];

/* 快捷问题按钮 */
const QUICK_CHIPS = ["你现在在做什么？", "你想做什么样的游戏？", "你平时喜欢玩什么？", "怎么联系你？"];

/* 兜底回答 */
const FALLBACK =
  "这个问题我暂时还没被教到 😅 你可以换个问法，或者直接问：在学什么、想做什么游戏、平时玩什么、怎么联系。";

/* ---------------------------------------------------------
   2. 数字分身「预留接口」
   ---------------------------------------------------------
   现在默认走本地预设问答（localReply）。
   以后要接真实大模型，只需在页面里注入一个处理函数，例如：

     window.DigitalTwin.setReplyHandler(async (message) => {
       const res = await fetch("/api/chat", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ message }),
       });
       const data = await res.json();
       return data.reply; // 返回字符串即可
     });

   注入后，数字分身会自动改用真实模型回答，前端逻辑无需再改。
   --------------------------------------------------------- */
const DigitalTwin = {
  _handler: null,
  setReplyHandler(fn) {
    this._handler = typeof fn === "function" ? fn : null;
  },
  get isLive() {
    return typeof this._handler === "function";
  },
  async reply(message) {
    if (this._handler) {
      try {
        const out = await this._handler(message);
        if (typeof out === "string" && out.trim()) return out.trim();
      } catch (err) {
        console.warn("[DigitalTwin] 真实模型调用失败，回退到预设问答：", err);
      }
    }
    return localReply(message);
  },
};
window.DigitalTwin = DigitalTwin;

/* 本地预设问答：关键词匹配 */
function localReply(message) {
  const text = String(message).toLowerCase().replace(/\s+/g, "");
  for (const item of TWIN_QA) {
    if (item.matches.some((k) => text.includes(k.toLowerCase()))) {
      return item.answer;
    }
  }
  return FALLBACK;
}

/* ---------------------------------------------------------
   3. 页面交互
   --------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* 年份 */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* --- 导航滚动状态 --- */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 20);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* --- 移动端菜单 --- */
  const navToggle = $("#navToggle");
  const navMenu = $("#navMenu");
  if (navToggle && navMenu) {
    const setMenu = (open) => {
      navMenu.classList.toggle("is-open", open);
      navToggle.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
    };
    navToggle.addEventListener("click", () => setMenu(!navMenu.classList.contains("is-open")));
    navMenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
    window.addEventListener("resize", () => {
      if (window.innerWidth > 880) setMenu(false);
    });
  }

  /* --- 导航当前区块高亮 --- */
  const navLinks = $$(".nav__links a[data-nav]");
  const sections = navLinks
    .map((a) => $(a.getAttribute("href")))
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            navLinks.forEach((l) =>
              l.classList.toggle("is-active", l.getAttribute("href") === "#" + e.target.id)
            );
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* --- 滚动出现动画 --- */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            e.target.style.transitionDelay = Math.min(i * 60, 240) + "ms";
            e.target.classList.add("is-visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* --- 鼠标光斑 --- */
  const spot = $("#spotlight");
  if (spot && window.matchMedia("(pointer:fine)").matches) {
    let raf = null;
    window.addEventListener("pointermove", (e) => {
      spot.style.opacity = "1";
      if (raf) return;
      raf = requestAnimationFrame(() => {
        spot.style.left = e.clientX + "px";
        spot.style.top = e.clientY + "px";
        raf = null;
      });
    });
    document.addEventListener("pointerleave", () => (spot.style.opacity = "0"));
  }

  /* --- 数字分身聊天 --- */
  const chatBody = $("#chatBody");
  const chatForm = $("#chatForm");
  const chatText = $("#chatText");
  const chipsBox = $("#chips");
  const modeEl = $(".chat__mode");

  if (modeEl) modeEl.textContent = DigitalTwin.isLive ? "实时模式" : "预设模式";

  function addMessage(text, who) {
    const wrap = document.createElement("div");
    wrap.className = "msg msg--" + (who === "me" ? "me" : "ai");
    const avatar = document.createElement("div");
    avatar.className = "msg__avatar";
    avatar.textContent = who === "me" ? "我" : "分";
    const bubble = document.createElement("div");
    bubble.className = "msg__bubble";
    bubble.textContent = text;
    wrap.append(avatar, bubble);
    chatBody.appendChild(wrap);
    chatBody.scrollTop = chatBody.scrollHeight;
    return wrap;
  }

  function addTyping() {
    const wrap = document.createElement("div");
    wrap.className = "msg msg--ai";
    wrap.innerHTML =
      '<div class="msg__avatar">分</div>' +
      '<div class="msg__bubble"><span class="msg__typing"><i></i><i></i><i></i></span></div>';
    chatBody.appendChild(wrap);
    chatBody.scrollTop = chatBody.scrollHeight;
    return wrap;
  }

  async function send(message) {
    const text = message.trim();
    if (!text) return;
    addMessage(text, "me");
    const typing = addTyping();
    const delay = new Promise((r) => setTimeout(r, 420 + Math.random() * 420));
    const reply = await DigitalTwin.reply(text);
    await delay;
    typing.remove();
    addMessage(reply, "ai");
  }

  if (chatForm) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const v = chatText.value;
      chatText.value = "";
      send(v);
    });
  }

  if (chipsBox) {
    QUICK_CHIPS.forEach((q) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.textContent = q;
      b.addEventListener("click", () => send(q));
      chipsBox.appendChild(b);
    });
  }

  /* 开场白 */
  if (chatBody) {
    addMessage(
      "你好，我是 " + TWIN_PROFILE.name + " 的数字分身 👋 关于我，你可以随便问——在学什么、做什么游戏、有哪些作品、怎么联系都行。",
      "ai"
    );
  }

  /* --- 阅读进度条 --- */
  const progress = $("#progress");
  if (progress) {
    const updateProgress = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? (window.scrollY / h) * 100 : 0;
      progress.style.width = Math.min(100, Math.max(0, p)) + "%";
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
  }

  /* --- 回到顶部 --- */
  const toTop = $("#toTop");
  if (toTop) {
    const onScrollTop = () => toTop.classList.toggle("is-show", window.scrollY > 620);
    onScrollTop();
    window.addEventListener("scroll", onScrollTop, { passive: true });
    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- 首屏打字机 --- */
  /* 不随 prefers-reduced-motion 关闭：省电/无障碍设置会打开该媒体查询，
     若在此降级成静态词，打字效果在这些浏览器里就不显示了。 */
  const typer = $("#typer");
  if (typer) {
    const words = ["AI 开发", "游戏开发", "独立小工具", "物理沙盒实验", "Godot 游戏"];
    let wi = 0, ci = 0, deleting = false;
    const tick = () => {
      const w = words[wi];
      ci += deleting ? -1 : 1;
      typer.textContent = w.slice(0, ci);
      let delay = deleting ? 45 : 95;
      if (!deleting && ci === w.length) { deleting = true; delay = 1400; }
      else if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % words.length; delay = 350; }
      setTimeout(tick, delay);
    };
    tick();
  }

  /* --- 关键词跑马灯：复制一份实现无缝滚动 --- */
  const marqueeTrack = $("#marqueeTrack");
  if (marqueeTrack) marqueeTrack.innerHTML += marqueeTrack.innerHTML;

  /* --- 作品卡片：跟随光标高光 + 3D 倾斜 --- */
  if (window.matchMedia("(pointer:fine)").matches && !reduceMotion) {
    $$(".work-card").forEach((card) => {
      card.classList.add("is-tilt");
      let raf = null;
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
        card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const rx = ((0.5 - py) * 7).toFixed(2);
          const ry = ((px - 0.5) * 9).toFixed(2);
          card.style.transform =
            "perspective(800px) translateY(-6px) rotateX(" + rx + "deg) rotateY(" + ry + "deg)";
          raf = null;
        });
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
        card.style.setProperty("--mx", "50%");
        card.style.setProperty("--my", "0%");
      });
    });
  }

  /* ---------------------------------------------------------
     Lightbox（作品封面点击放大）
     --------------------------------------------------------- */
  const lightbox = $("#lightbox");
  const lightboxArt = $("#lightboxArt");
  const lightboxTitle = $("#lightboxTitle");
  const lightboxText = $("#lightboxText");
  const LIGHTBOX_DATA = [
    {
      art: "Claude",
      cls: "work-card__cover--1",
      title: "Claude 启动器",
      text: "Windows 上 Claude Code 的图形启动器：工作区管理、一键切换模型、跨工具共享记忆、权限等级与 AI 托管，纯 Python 标准库实现，可打包成免安装的安装程序。独立开发 · 桌面工具 · 2026。",
    },
    {
      art: "Twin",
      cls: "work-card__cover--2",
      title: "个人主页 + 数字分身",
      text: "用 AI 从零生成的第一个作品，从平台原型到本地、再到上线，走完一次完整闭环。你现在正在看的这个页面就是它。独立开发 · 全栈小品 · 2026。",
    },
    {
      art: "Soon",
      cls: "work-card__cover--3",
      title: "更多作品整理中",
      text: "这里会陆续放上新的小工具和实验记录，敬请期待。持续更新 · 2026。",
    },
  ];

  function openLightbox(idx) {
    const d = LIGHTBOX_DATA[idx];
    if (!d || !lightbox) return;
    lightboxArt.textContent = d.art;
    lightboxArt.className = "lightbox__art " + d.cls;
    lightboxTitle.textContent = d.title;
    lightboxText.textContent = d.text;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  $$("[data-lightbox]").forEach((el) => {
    const idx = Number(el.getAttribute("data-lightbox"));
    el.addEventListener("click", () => openLightbox(idx));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(idx);
      }
    });
  });
  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    $("#lightboxClose")?.addEventListener("click", closeLightbox);
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLightbox();
    });
  }

  /* ---------------------------------------------------------
     游戏 1 · 乒乓弹球（Canvas 物理）
     --------------------------------------------------------- */
  const pongCanvas = $("#pongCanvas");
  if (pongCanvas) {
    const ctx = pongCanvas.getContext("2d");
    const W = pongCanvas.width;
    const H = pongCanvas.height;
    const overlay = $("#pongOverlay");
    const scoreEl = $("#pongScore");
    const bestEl = $("#pongBest");
    const bestKey = "pongBest";

    const state = {
      running: false,
      score: 0,
      best: Number(localStorage.getItem(bestKey) || 0),
      ball: { x: W / 2, y: H / 2, vx: 3.2, vy: -3.2, r: 6 },
      paddle: { x: W / 2, w: 72, h: 9 },
    };
    bestEl.textContent = state.best;

    function resetBall() {
      state.ball.x = W / 2;
      state.ball.y = H / 2;
      const angle = (-Math.PI / 3) * (0.6 + Math.random() * 0.4);
      const speed = 3.4 + state.score * 0.08;
      state.ball.vx = Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1);
      state.ball.vy = Math.sin(angle) * speed;
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      // 台面
      ctx.fillStyle = "rgba(255,255,255,0.03)";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(0, H * 0.42);
      ctx.lineTo(W, H * 0.42);
      ctx.stroke();
      ctx.setLineDash([]);
      // 球拍
      const p = state.paddle;
      const px = Math.max(0, Math.min(W - p.w, p.x - p.w / 2));
      const grad = ctx.createLinearGradient(px, H - 22, px + p.w, H - 22);
      grad.addColorStop(0, "#22d3ee");
      grad.addColorStop(1, "#5b8cff");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(px, H - 22, p.w, p.h, 5);
      ctx.fill();
      // 球
      const b = state.ball;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.shadowColor = "rgba(91,140,255,0.9)";
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    function step() {
      if (!state.running) return;
      const b = state.ball;
      const p = state.paddle;
      b.x += b.vx;
      b.y += b.vy;
      // 左右墙
      if (b.x < b.r) { b.x = b.r; b.vx *= -1; }
      if (b.x > W - b.r) { b.x = W - b.r; b.vx *= -1; }
      // 顶
      if (b.y < b.r) { b.y = b.r; b.vy *= -1; }
      // 球拍
      const px = Math.max(0, Math.min(W - p.w, p.x - p.w / 2));
      if (
        b.vy > 0 &&
        b.y + b.r >= H - 22 &&
        b.y - b.r <= H - 22 + p.h &&
        b.x >= px - b.r &&
        b.x <= px + p.w + b.r
      ) {
        // 击中位置 → 反弹角（物理沙盒核心）
        const hit = (b.x - (px + p.w / 2)) / (p.w / 2); // -1 ~ 1
        const angle = hit * (Math.PI / 3); // 最大 60°
        const speed = Math.min(8.5, Math.hypot(b.vx, b.vy) * 1.04 + 0.06);
        b.vx = Math.sin(angle) * speed;
        b.vy = -Math.abs(Math.cos(angle) * speed);
        b.y = H - 22 - b.r;
        state.score += 1;
        scoreEl.textContent = state.score;
      }
      // 底 → 结束
      if (b.y > H + 12) {
        state.running = false;
        if (state.score > state.best) {
          state.best = state.score;
          localStorage.setItem(bestKey, String(state.best));
          bestEl.textContent = state.best;
        }
        overlay.classList.remove("is-hidden");
        overlay.querySelector("p").textContent = "本局得分 " + state.score;
        overlay.querySelector("button").textContent = "再来一局";
      }
      draw();
      if (state.running) requestAnimationFrame(step);
    }

    function startPong() {
      state.score = 0;
      scoreEl.textContent = "0";
      resetBall();
      state.running = true;
      overlay.classList.add("is-hidden");
      requestAnimationFrame(step);
    }

    $("#pongStart")?.addEventListener("click", startPong);
    $("#pongReset")?.addEventListener("click", () => {
      state.running = false;
      startPong();
    });

    const movePaddle = (clientX) => {
      const r = pongCanvas.getBoundingClientRect();
      state.paddle.x = ((clientX - r.left) / r.width) * W;
    };
    pongCanvas.addEventListener("pointermove", (e) => movePaddle(e.clientX));
    pongCanvas.addEventListener("pointerdown", (e) => {
      movePaddle(e.clientX);
      if (!state.running) startPong();
    });

    draw();
  }

  /* ---------------------------------------------------------
     游戏 2 · 反应力测试
     --------------------------------------------------------- */
  const reaction = $("#reaction");
  if (reaction) {
    const label = $("#reactionLabel");
    const value = $("#reactionValue");
    const hint = $("#reactionHint");
    let state = "idle";
    let timer = null;
    let goAt = 0;

    const setState = (s) => {
      state = s;
      reaction.dataset.state = s;
    };

    function startReaction() {
      clearTimeout(timer);
      setState("waiting");
      label.textContent = "等变绿…";
      value.textContent = "";
      hint.textContent = "别急，变绿再点";
      timer = setTimeout(() => {
        setState("go");
        goAt = performance.now();
        label.textContent = "点！";
        hint.textContent = "就是现在";
      }, 1200 + Math.random() * 2600);
    }

    function finishReaction() {
      const ms = Math.round(performance.now() - goAt);
      setState("result");
      value.textContent = ms + " ms";
      let rating = "还可以";
      if (ms < 200) rating = "闪电手！";
      else if (ms < 280) rating = "比 87% 的人快";
      else if (ms < 380) rating = "中等偏上";
      label.textContent = rating;
      hint.textContent = "再测一次，看看能不能更快";
    }

    function onReact() {
      if (state === "idle" || state === "result" || state === "early") {
        startReaction();
      } else if (state === "waiting") {
        clearTimeout(timer);
        setState("early");
        label.textContent = "抢跑啦！";
        value.textContent = "";
        hint.textContent = "还没变绿就点了，再试一次";
      } else if (state === "go") {
        finishReaction();
      }
    }

    reaction.addEventListener("click", onReact);
    reaction.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onReact();
      }
    });
  }

  /* ---------------------------------------------------------
     游戏 3 · 猜猜我是谁
     --------------------------------------------------------- */
  const quizBody = $("#quizBody");
  if (quizBody) {
    const quizBar = $("#quizBar");
    const QUESTIONS = [
      {
        q: "Mr. 赖 现在主要在学什么？",
        opts: ["AI 开发", "建筑设计", "影视后期", "金融工程"],
        a: 0,
        note: "方向是 AI 开发和游戏开发，比起背概念更喜欢动手做出来。",
      },
      {
        q: "他接下来打算学哪个游戏引擎？",
        opts: ["Unity", "Unreal", "Godot", "Cocos"],
        a: 2,
        note: "准备用 Godot 做一些休闲治愈风格的小游戏。",
      },
      {
        q: "以下哪个是他的开源作品？",
        opts: ["Claude 启动器", "某购物 App", "某外卖平台", "某社交软件"],
        a: 0,
        note: "Claude 启动器：Windows 上 Claude Code 的图形启动器，纯 Python 写的。",
      },
      {
        q: "他业余喜欢做什么运动？",
        opts: ["篮球", "乒乓球", "游泳", "跑步"],
        a: 1,
        note: "打乒乓球、打 CS，还喜欢用物理沙盒模拟乒乓球。",
      },
      {
        q: "想联系他，最直接的方式是？",
        opts: ["发邮件到 brainleech198@foxmail.com", "去微博私信", "打 114 查号", "在游戏里蹲他"],
        a: 0,
        note: "邮件最稳；也可以去 GitHub / Gitee 找他。",
      },
    ];

    let qi = 0;
    let score = 0;

    function renderQuiz() {
      if (qi >= QUESTIONS.length) {
        quizBar.style.width = "100%";
        const pct = score / QUESTIONS.length;
        let comment = "";
        if (pct === 1) comment = "全对！你简直比数字分身还了解我 🎉";
        else if (pct >= 0.6) comment = "了解得不少！还有几道题可以去问数字分身补补课。";
        else comment = "看来还不够熟～去右边和数字分身聊聊，再来挑战一次吧。";
        quizBody.innerHTML =
          '<div class="quiz__result">' +
          '<div class="quiz__score">' + score + " / " + QUESTIONS.length + "</div>" +
          '<p class="quiz__comment">' + comment + "</p>" +
          '<button class="game-btn quiz__restart" id="quizRestart" type="button">再玩一次</button>' +
          "</div>";
        $("#quizRestart")?.addEventListener("click", () => {
          qi = 0;
          score = 0;
          quizBar.style.width = "0%";
          renderQuiz();
        });
        return;
      }

      const item = QUESTIONS[qi];
      quizBar.style.width = (qi / QUESTIONS.length) * 100 + "%";
      quizBody.innerHTML =
        '<div class="quiz__q">' + (qi + 1) + ". " + item.q + "</div>" +
        '<div class="quiz__opts"></div>' +
        '<div class="quiz__feedback" id="quizFeedback"></div>';
      const optsBox = quizBody.querySelector(".quiz__opts");
      const feedback = quizBody.querySelector("#quizFeedback");

      item.opts.forEach((opt, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "quiz__opt";
        b.textContent = opt;
        b.addEventListener("click", () => {
          optsBox.querySelectorAll(".quiz__opt").forEach((x) => (x.disabled = true));
          const btns = [...optsBox.querySelectorAll(".quiz__opt")];
          btns[item.a].classList.add("is-correct");
          if (i === item.a) {
            score += 1;
            feedback.textContent = "答对了！" + item.note;
          } else {
            b.classList.add("is-wrong");
            feedback.textContent = "答错了～" + item.note + " 不清楚的话，去问数字分身吧。";
          }
          setTimeout(() => {
            qi += 1;
            renderQuiz();
          }, 1400);
        });
        optsBox.appendChild(b);
      });
    }

    renderQuiz();
  }

  /* 暴露给控制台调试用 */
  window.appChat = send;
});
