/* =========================================================
   BrainLeech · 个人主页
   交互脚本 + 数字分身逻辑
   ========================================================= */

/* ---------------------------------------------------------
   1. 数字分身资料（想改内容，只改这里就行）
   --------------------------------------------------------- */
const TWIN_PROFILE = {
  name: "BrainLeech",
  identity: "大学生、独立学习者",
  doing: "学习制作 AI 产品，整理自己的作品集",
  skills: "AI 应用、编程、设计，以及把复杂问题讲清楚",
  contact: "可以发邮件到 brainleech198@foxmail.com，或者去 GitHub / Gitee 找我",
};

/* 预设问答：matches 里任意关键词命中即算匹配 */
const TWIN_QA = [
  {
    matches: ["你好", "hi", "hello", "在吗", "在么", "嗨"],
    answer: "你好，我是 " + TWIN_PROFILE.name + " 的数字分身 👋 关于我，年龄、爱好、在做什么，都可以随便问。",
  },
  {
    matches: ["你是谁", "介绍一下", "介绍", "你是"],
    answer:
      "我是 " + TWIN_PROFILE.name + " 的数字分身。真身是一个" + TWIN_PROFILE.identity + "，现在主要在" + TWIN_PROFILE.doing + "。",
  },
  {
    matches: ["现在", "在做什么", "做什么", "干嘛", "忙什么", "最近"],
    answer: "最近主要在做两件事：一是学习用 AI 做产品，二是把自己做过的东西整理成作品集——这个个人主页就是其中之一。",
  },
  {
    matches: ["做什么的", "身份", "职业", "专业", "学什么", "学生"],
    answer: "身份上是" + TWIN_PROFILE.identity + "，方向更偏 AI 应用和产品。比起背概念，我更喜欢先把东西做出来。",
  },
  {
    matches: ["作品", "做过", "项目", "portfolio"],
    answer:
      "已经开源的作品里，一个是「Claude 启动器」——给 Claude Code 做的 Windows 图形启动器，用 Python 写的；另一个就是你现在看到的这个个人主页 + 数字分身。两个都能在我的 GitHub / Gitee 上找到。",
  },
  {
    matches: ["擅长", "会什么", "技能", "能力", "技术"],
    answer: "我比较擅长的是" + TWIN_PROFILE.skills + "。简单说，就是能把想法变成一个能跑、能看、能用的东西。",
  },
  {
    matches: ["兴趣", "爱好", "喜欢", "平时"],
    answer: "兴趣主要围绕 AI 应用、编程和设计，平时也喜欢琢磨怎么把复杂的事讲成人话。",
  },
  {
    matches: ["特点", "记忆点", "特别", "不一样"],
    answer: "我一个比较有记忆点的特点是：喜欢把复杂问题讲成人话。不太爱堆术语，更愿意把事情说明白。",
  },
  {
    matches: ["年龄", "多大", "几岁", "出生", "生日"],
    answer: "具体的年龄信息我先留个悬念——你可以在占位内容里把它补上，真身会自己告诉你 😄",
  },
  {
    matches: ["联系", "方式", "邮箱", "email", "加微信", "怎么找"],
    answer: TWIN_PROFILE.contact + "。想聊合作、交流，或者单纯认识一下，都很欢迎。",
  },
  {
    matches: ["你好厉害", "厉害", "加油", "支持", "棒"],
    answer: "谢谢你 🙌 我还在路上，能被人看到就是最大的鼓励。",
  },
];

/* 快捷问题按钮 */
const QUICK_CHIPS = ["你现在在做什么？", "你有哪些作品？", "你擅长什么？", "怎么联系你？"];

/* 兜底回答 */
const FALLBACK =
  "这个问题我暂时还没被教到 😅 你可以换个问法，或者直接问：在做什么、有哪些作品、擅长什么、怎么联系。";

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
      "你好，我是 " + TWIN_PROFILE.name + " 的数字分身 👋 关于我，你可以随便问——在做什么、有哪些作品、怎么联系都行。",
      "ai"
    );
  }

  /* 暴露给控制台调试用 */
  window.appChat = send;
});
