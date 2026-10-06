import { jsx, jsxs } from "react/jsx-runtime";
import { LEVELS } from "../game/content.js";
import { loadRecords } from "../game/storage.js";
import GameShell from "../components/GameShell.js";
import { Stars } from "../components/ui-kit.js";
function LevelSelect({
  onBack,
  onPick
}) {
  const rec = loadRecords();
  const totalStars = Object.values(rec.levels).reduce((a, b) => a + b.stars, 0);
  return /* @__PURE__ */ jsx(
    GameShell,
    {
      title: "\u95EF\u5173\u6A21\u5F0F \xB7 \u75BE\u901F\u9003\u4EA1",
      codename: "CAREER MODE",
      onBack,
      right: /* @__PURE__ */ jsxs("div", { className: "text-xs text-[#8a8ac0]", children: [
        "\u2B50 ",
        /* @__PURE__ */ jsx("span", { className: "text-[#f6cd29] font-bold", children: totalStars }),
        "/",
        LEVELS.length * 3
      ] }),
      children: /* @__PURE__ */ jsxs("div", { className: "mx-auto w-full max-w-4xl px-4 py-6", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-[#8a8ac0] leading-relaxed", children: "\u6A2A\u8DE8 12 \u4E2A\u8857\u533A\u7684\u591C\u8DD1\u9003\u4EA1:\u6253\u5B57\u9A71\u52A8\u524D\u8FDB,\u6253\u5B8C\u6587\u672C\u5373\u51B2\u7EBF\u9003\u8131;\u6253\u5F97\u592A\u6162\u6216\u9519\u5F97\u592A\u591A,\u5C31\u4F1A\u88AB\u8FFD\u4E0A\u3002\u9AD8\u51C6\u786E\u7387 + \u9AD8\u901F\u5EA6\u53EF\u83B7\u4E09\u661F\u8BC4\u4EF7\u3002" }),
        /* @__PURE__ */ jsx("div", { className: "mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: LEVELS.map((lv) => {
          const locked = lv.id > rec.unlockedLevel;
          const r = rec.levels[lv.id];
          return /* @__PURE__ */ jsxs(
            "button",
            {
              disabled: locked,
              onClick: () => onPick(lv.id),
              className: `group relative overflow-hidden rounded-xl border p-4 text-left transition-all min-h-[44px] ${locked ? "border-[#22224e] bg-[rgba(9,9,42,0.4)] opacity-45 cursor-not-allowed" : "border-[#33336b] bg-[rgba(9,9,42,0.78)] hover:border-[#f6cd29] hover:shadow-[0_0_24px_rgba(246,205,41,0.25)] active:scale-[0.98]"}`,
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
                  /* @__PURE__ */ jsx("span", { className: `font-pixel text-lg ${locked ? "text-[#33336b]" : "text-[#5857ff] group-hover:text-[#f6cd29]"}`, children: String(lv.id).padStart(2, "0") }),
                  locked ? /* @__PURE__ */ jsx("span", { className: "text-lg", children: "\u{1F512}" }) : r ? /* @__PURE__ */ jsx(Stars, { n: r.stars, size: "text-sm" }) : /* @__PURE__ */ jsx("span", { className: "font-pixel text-[8px] text-[#c6d32d] blink-soft mt-1", children: "NEW" })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "mt-2 font-bold text-[#e8e8ff]", children: lv.name }),
                /* @__PURE__ */ jsx("div", { className: "font-pixel text-[7px] text-[#6f6fb0] mt-0.5", children: lv.codename }),
                /* @__PURE__ */ jsx("div", { className: "mt-2 text-xs text-[#8a8ac0]", children: lv.desc }),
                /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center gap-3 text-[10px] text-[#6f6fb0]", children: [
                  /* @__PURE__ */ jsxs("span", { children: [
                    "\u76EE\u6807 ",
                    lv.targetWpm,
                    " WPM"
                  ] }),
                  r && /* @__PURE__ */ jsxs("span", { className: "text-[#9d9bff]", children: [
                    "\u6700\u4F73 ",
                    r.bestWpm,
                    " WPM \xB7 ",
                    r.bestAcc,
                    "%"
                  ] })
                ] }),
                !locked && /* @__PURE__ */ jsx("div", { className: "absolute -right-4 -bottom-4 h-16 w-16 rounded-full bg-[rgba(88,87,255,0.12)] group-hover:bg-[rgba(246,205,41,0.15)] transition-colors" })
              ]
            },
            lv.id
          );
        }) })
      ] })
    }
  );
}
export {
  LevelSelect as default
};
