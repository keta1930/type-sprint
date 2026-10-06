import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { loadRecords } from "../game/storage.js";
import { LEVELS } from "../game/content.js";
import { isMuted, toggleMute, sfx } from "../game/audio.js";
import { Panel, Stars } from "../components/ui-kit.js";
const MODES = [
  {
    key: "career",
    title: "\u95EF\u5173\u6A21\u5F0F",
    en: "CAREER CHASE",
    desc: "\u591C\u5E55\u4E0B\u7684 12 \u5173\u9003\u4EA1:\u6253\u5B57\u9A71\u52A8\u9003\u8DD1,\u6253\u6162\u4E86\u5C31\u4F1A\u88AB\u8FFD\u4E0A\u3002\u6253\u5B8C\u6587\u672C\u5373\u9003\u8131,\u4E09\u661F\u8BC4\u4EF7\u7B49\u4F60\u62FF",
    icon: "\u{1F3C3}",
    accent: "text-[#f6cd29]",
    border: "hover:border-[#f6cd29] hover:shadow-[0_0_30px_rgba(246,205,41,0.25)]",
    go: { name: "levels" }
  },
  {
    key: "rain",
    title: "\u5355\u8BCD\u96E8\u9632\u7EBF",
    en: "WORD RAIN",
    desc: "\u5355\u8BCD\u4ECE\u591C\u7A7A\u5760\u843D,\u7A81\u7834\u9632\u7EBF\u524D\u6572\u51FA\u5B83\u4EEC\u3002\u65E0\u5C3D\u6A21\u5F0F,\u8D8A\u843D\u8D8A\u5FEB",
    icon: "\u2604\uFE0F",
    accent: "text-[#9d9bff]",
    border: "hover:border-[#5857ff] hover:shadow-[0_0_30px_rgba(88,87,255,0.35)]",
    go: { name: "rain" }
  },
  {
    key: "attack",
    title: "\u6781\u901F 60 \u79D2",
    en: "TIME ATTACK",
    desc: "\u4E00\u5206\u949F\u6781\u9650\u51B2\u5206:\u8FDE\u51FB\u53E0\u500D\u7387,\u9519\u8BCD\u6E05\u96F6\u3002\u51B2\u51FB\u4F60\u7684 WPM \u4E0A\u9650",
    icon: "\u26A1",
    accent: "text-[#c6d32d]",
    border: "hover:border-[#c6d32d] hover:shadow-[0_0_30px_rgba(198,211,45,0.25)]",
    go: { name: "attack" }
  },
  {
    key: "practice",
    title: "\u6307\u6CD5\u8BAD\u7EC3\u573A",
    en: "FINGER DRILL",
    desc: "\u57FA\u51C6\u952E\u5230\u6570\u5B57\u952E\u5206\u533A\u7279\u8BAD,\u5C4F\u5E55\u952E\u76D8\u5B9E\u65F6\u6307\u5F15\u624B\u6307,\u6253\u7262\u57FA\u672C\u529F",
    icon: "\u2328\uFE0F",
    accent: "text-[#ff8a7a]",
    border: "hover:border-[#ff624d] hover:shadow-[0_0_30px_rgba(255,98,77,0.25)]",
    go: { name: "practice" }
  }
];
function Home({ go }) {
  const rec = loadRecords();
  const [muted, setMuted] = useState(isMuted());
  const [typed, setTyped] = useState("");
  const slogan = "type fast. catch faster.";
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setTyped(slogan.slice(0, i));
      if (i >= slogan.length) clearInterval(t);
    }, 55);
    return () => clearInterval(t);
  }, []);
  const totalStars = Object.values(rec.levels).reduce((a, b) => a + b.stars, 0);
  const cleared = Object.keys(rec.levels).length;
  return /* @__PURE__ */ jsx("div", { className: "bg-night bg-dotgrid min-h-dvh relative scanlines", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-5xl px-4 pb-16 pt-10 sm:pt-16", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("div", { className: "font-pixel text-[9px] text-[#6f6fb0]", children: "TYPE SPRINT \xB7 TYPING TRAINER" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setMuted(toggleMute()),
          className: "flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[#33336b] bg-[rgba(37,37,104,0.4)] text-lg hover:bg-[rgba(88,87,255,0.3)] active:scale-95",
          "aria-label": "\u97F3\u6548\u5F00\u5173",
          children: muted ? "\u{1F507}" : "\u{1F50A}"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-10 sm:mt-14 text-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 rounded-full border border-[#33336b] bg-[rgba(9,9,42,0.7)] px-4 py-1.5 text-xs text-[#8a8ac0]", children: [
        /* @__PURE__ */ jsx("span", { className: "inline-block h-2 w-2 rounded-full bg-[#ff624d] blink-soft" }),
        "\u5728\u7EBF\u6253\u5B57\u7EC3\u4E60 \xB7 TYPING TRAINER"
      ] }),
      /* @__PURE__ */ jsxs("h1", { className: "mt-6 text-5xl sm:text-7xl font-black tracking-tight leading-tight", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[#f3f3f3]", children: "\u6253\u5B57" }),
        /* @__PURE__ */ jsx("span", { className: "text-[#f6cd29] text-glow-gold", children: "\u98DE\u9A70" })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "mt-3 font-pixel text-[10px] sm:text-xs text-[#9d9bff] text-glow-blue h-4", children: [
        typed,
        /* @__PURE__ */ jsx("span", { className: "caret-blink", children: "\u258C" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm text-[#8a8ac0] max-w-md mx-auto leading-relaxed", children: "\u9713\u8679\u591C\u8272\u4E2D\u7684\u6253\u5B57\u7EC3\u4E60\u573A:\u56DB\u79CD\u6A21\u5F0F,\u4ECE\u6307\u6CD5\u57FA\u672C\u529F\u5230\u6781\u9650\u901F\u5EA6,\u6572\u5F97\u8D8A\u5FEB\u8DD1\u5F97\u8D8A\u8FDC\u3002" })
    ] }),
    (cleared > 0 || rec.rainBest > 0 || rec.attackBest > 0) && /* @__PURE__ */ jsx(Panel, { className: "mx-auto mt-8 max-w-2xl px-5 py-3.5", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm", children: [
      /* @__PURE__ */ jsxs("span", { className: "text-[#8a8ac0]", children: [
        "\u751F\u6DAF ",
        /* @__PURE__ */ jsxs("span", { className: "text-[#f6cd29] font-bold", children: [
          cleared,
          "/",
          LEVELS.length
        ] }),
        " \u5173"
      ] }),
      /* @__PURE__ */ jsx(Stars, { n: Math.min(3, Math.floor(totalStars / Math.max(1, LEVELS.length))), size: "text-sm" }),
      /* @__PURE__ */ jsxs("span", { className: "text-[#8a8ac0]", children: [
        "\u603B\u661F ",
        /* @__PURE__ */ jsx("span", { className: "text-[#f6cd29] font-bold", children: totalStars })
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "text-[#8a8ac0]", children: [
        "\u96E8 ",
        /* @__PURE__ */ jsx("span", { className: "text-[#9d9bff] font-bold", children: rec.rainBest })
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "text-[#8a8ac0]", children: [
        "\u6781\u901F ",
        /* @__PURE__ */ jsx("span", { className: "text-[#c6d32d] font-bold", children: rec.attackBest })
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "text-[#8a8ac0]", children: [
        "\u51FB\u952E ",
        /* @__PURE__ */ jsx("span", { className: "text-white font-bold", children: rec.totalKeys })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "mt-10 grid gap-4 sm:grid-cols-2", children: MODES.map((m) => /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => {
          sfx.word();
          go(m.go);
        },
        className: `group relative overflow-hidden rounded-2xl border border-[#33336b] bg-[rgba(9,9,42,0.78)] p-6 text-left transition-all active:scale-[0.98] min-h-[44px] ${m.border}`,
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-3xl", children: m.icon }),
            /* @__PURE__ */ jsx("span", { className: `font-pixel text-[8px] mt-1 ${m.accent} opacity-70 group-hover:opacity-100`, children: m.en })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-4 text-xl font-black tracking-wide text-[#f3f3f3] group-hover:text-white", children: m.title }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-relaxed text-[#8a8ac0]", children: m.desc }),
          /* @__PURE__ */ jsx("div", { className: `mt-4 text-xs font-bold ${m.accent} opacity-0 transition-opacity group-hover:opacity-100`, children: "\u70B9\u51FB\u8FDB\u5165 \u2192" }),
          /* @__PURE__ */ jsx("div", { className: "absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-[rgba(88,87,255,0.08)] transition-transform group-hover:scale-150" })
        ]
      },
      m.key
    )) }),
    /* @__PURE__ */ jsx("div", { className: "mt-12 overflow-hidden border-y border-[#26265c] py-2 opacity-60", children: /* @__PURE__ */ jsx("div", { className: "marquee-x flex whitespace-nowrap font-pixel text-[8px] text-[#6f6fb0] gap-8", children: Array.from({ length: 2 }).map((_, r) => /* @__PURE__ */ jsx("span", { className: "flex gap-8", children: ["WPM = WORDS PER MINUTE", "\u51C6\u786E\u7387 \u2265 96% \u52A0\u661F", "F J \u662F\u57FA\u51C6\u952E", "\u773C\u775B\u770B\u5C4F\u5E55", "\u8FDE\u51FB\u8D8A\u9AD8\u500D\u7387\u8D8A\u9AD8", "\u901F\u5EA6\u4E0D\u4F1A\u7B49\u4F60", "\u6BCF\u5929 10 \u5206\u949F \u4E24\u5468\u89C1\u6548"].map((t) => /* @__PURE__ */ jsxs("span", { children: [
      "\u25C6 ",
      t
    ] }, t)) }, r)) }) }),
    /* @__PURE__ */ jsx("p", { className: "mt-6 text-center text-xs text-[#4a4a85]", children: "\u6218\u7EE9\u4FDD\u5B58\u5728\u672C\u6D4F\u89C8\u5668 \xB7 \u5EFA\u8BAE\u4F7F\u7528\u5B9E\u4F53\u952E\u76D8\u83B7\u5F97\u6700\u4F73\u4F53\u9A8C" })
  ] }) });
}
export {
  Home as default
};
