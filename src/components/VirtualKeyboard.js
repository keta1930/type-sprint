import { jsx, jsxs } from "react/jsx-runtime";
const ROWS = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
  ["z", "x", "c", "v", "b", "n", "m", ",", "."]
];
const FINGER = {
  "1": "lp",
  q: "lp",
  a: "lp",
  z: "lp",
  "2": "lr",
  w: "lr",
  s: "lr",
  x: "lr",
  "3": "lm",
  e: "lm",
  d: "lm",
  c: "lm",
  "4": "li",
  r: "li",
  f: "li",
  v: "li",
  "5": "li",
  t: "li",
  g: "li",
  b: "li",
  "6": "ri",
  y: "ri",
  h: "ri",
  n: "ri",
  "7": "ri",
  u: "ri",
  j: "ri",
  m: "ri",
  "8": "rm",
  i: "rm",
  k: "rm",
  ",": "rm",
  "9": "rr",
  o: "rr",
  l: "rr",
  ".": "rr",
  "0": "rp",
  p: "rp",
  ";": "rp"
};
const FINGER_NAMES = {
  lp: "\u5DE6\u624B\u5C0F\u6307",
  lr: "\u5DE6\u624B\u65E0\u540D\u6307",
  lm: "\u5DE6\u624B\u4E2D\u6307",
  li: "\u5DE6\u624B\u98DF\u6307",
  ri: "\u53F3\u624B\u98DF\u6307",
  rm: "\u53F3\u624B\u4E2D\u6307",
  rr: "\u53F3\u624B\u65E0\u540D\u6307",
  rp: "\u53F3\u624B\u5C0F\u6307",
  space: "\u62C7\u6307"
};
function fingerOf(key) {
  if (key === " ") return "space";
  return FINGER[key.toLowerCase()] ?? "ri";
}
function VirtualKeyboard({ nextKey, pressedKey, wrongKey, compact }) {
  const h = compact ? "h-7 text-[10px]" : "h-9 sm:h-11 text-xs sm:text-sm";
  const target = nextKey?.toLowerCase() ?? null;
  return /* @__PURE__ */ jsx("div", { className: "select-none", "aria-hidden": true, children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1 sm:gap-1.5", children: [
    ROWS.map((row, ri) => /* @__PURE__ */ jsx("div", { className: "flex gap-1 sm:gap-1.5", children: row.map((k) => {
      const isNext = target === k;
      const isPressed = pressedKey?.toLowerCase() === k;
      const isWrong = wrongKey?.toLowerCase() === k;
      return /* @__PURE__ */ jsx(
        "div",
        {
          className: `${h} flex w-[clamp(22px,7vw,44px)] items-center justify-center rounded-md border font-typing font-semibold uppercase transition-all duration-100 ${isWrong ? "border-[#ff624d] bg-[rgba(255,98,77,0.3)] text-[#ff8a7a] scale-95" : isPressed ? "border-[#9d9bff] bg-[rgba(88,87,255,0.55)] text-white scale-95" : isNext ? "border-[#f6cd29] bg-[rgba(246,205,41,0.18)] text-[#f6cd29] shadow-[0_0_14px_rgba(246,205,41,0.45)]" : "border-[#33336b] bg-[rgba(37,37,104,0.35)] text-[#6f6fb0]"}`,
          children: k
        },
        k
      );
    }) }, ri)),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: `${h} mt-0.5 flex w-[min(60vw,300px)] items-center justify-center rounded-md border font-typing transition-all duration-100 ${target === " " ? "border-[#f6cd29] bg-[rgba(246,205,41,0.18)] text-[#f6cd29] shadow-[0_0_14px_rgba(246,205,41,0.45)]" : pressedKey === " " ? "border-[#9d9bff] bg-[rgba(88,87,255,0.55)] text-white" : "border-[#33336b] bg-[rgba(37,37,104,0.35)] text-[#6f6fb0]"}`,
        children: "SPACE"
      }
    )
  ] }) });
}
export {
  FINGER_NAMES,
  VirtualKeyboard as default,
  fingerOf
};
