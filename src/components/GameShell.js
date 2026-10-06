import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { isMuted, toggleMute } from "../game/audio.js";
function GameShell({
  title,
  codename,
  onBack,
  children,
  right
}) {
  const [muted, setMuted] = useState(isMuted());
  return /* @__PURE__ */ jsxs("div", { className: "bg-night bg-dotgrid min-h-dvh flex flex-col relative", children: [
    /* @__PURE__ */ jsx("header", { className: "sticky top-0 z-40 border-b border-[#26265c] bg-[rgba(2,2,25,0.85)] backdrop-blur", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex h-14 max-w-5xl items-center gap-3 px-4", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: onBack,
          className: "flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[#33336b] bg-[rgba(37,37,104,0.4)] px-3 text-[#b9b8ff] hover:bg-[rgba(88,87,255,0.3)] active:scale-95",
          "aria-label": "\u8FD4\u56DE",
          children: [
            "\u2190 ",
            /* @__PURE__ */ jsx("span", { className: "ml-1 hidden sm:inline text-sm", children: "\u8FD4\u56DE" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx("div", { className: "truncate text-sm font-bold tracking-widest", children: title }),
        codename && /* @__PURE__ */ jsx("div", { className: "font-pixel text-[8px] text-[#6f6fb0] tracking-wider", children: codename })
      ] }),
      right,
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setMuted(toggleMute()),
          className: "flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[#33336b] bg-[rgba(37,37,104,0.4)] text-lg hover:bg-[rgba(88,87,255,0.3)] active:scale-95",
          "aria-label": "\u97F3\u6548\u5F00\u5173",
          children: muted ? "\u{1F507}" : "\u{1F50A}"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("main", { className: "flex-1 flex flex-col", children })
  ] });
}
export {
  GameShell as default
};
