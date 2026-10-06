import { jsx, jsxs } from "react/jsx-runtime";
function ArcadeButton({
  children,
  onClick,
  color = "blue",
  size = "md",
  disabled,
  className = ""
}) {
  const colors = {
    blue: "bg-[#3834ff] hover:bg-[#4a47ff] text-white border-[#6c6aff] shadow-[0_4px_0_#1a18a8,0_0_18px_rgba(56,52,255,0.45)]",
    gold: "bg-[#f6cd29] hover:bg-[#ffd94a] text-[#231d00] border-[#ffe270] shadow-[0_4px_0_#a8870e,0_0_18px_rgba(246,205,41,0.35)]",
    coral: "bg-[#ff624d] hover:bg-[#ff7a67] text-white border-[#ff9a8b] shadow-[0_4px_0_#b3301f,0_0_18px_rgba(255,98,77,0.4)]",
    ghost: "bg-[rgba(37,37,104,0.4)] hover:bg-[rgba(88,87,255,0.3)] text-[#b9b8ff] border-[#3d3d7d] shadow-[0_4px_0_#14143c]"
  };
  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base"
  };
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick,
      disabled,
      className: `rounded-lg border-b-4 font-bold tracking-wider transition-all active:translate-y-[3px] active:shadow-none disabled:opacity-40 disabled:pointer-events-none min-h-[44px] ${colors[color]} ${sizes[size]} ${className}`,
      children
    }
  );
}
function Panel({
  children,
  className = "",
  glow
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: `rounded-xl border border-[#33336b] bg-[rgba(9,9,42,0.78)] backdrop-blur-sm ${glow ? "shadow-[0_0_40px_rgba(56,52,255,0.25)]" : ""} ${className}`,
      children
    }
  );
}
function Stat({
  label,
  value,
  unit,
  color = "text-white"
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center min-w-[64px]", children: [
    /* @__PURE__ */ jsx("span", { className: "font-pixel text-[8px] text-[#6f6fb0] tracking-wider", children: label }),
    /* @__PURE__ */ jsxs("span", { className: `font-typing text-xl sm:text-2xl font-extrabold tabular-nums ${color}`, children: [
      value,
      unit && /* @__PURE__ */ jsx("span", { className: "ml-0.5 text-xs font-normal text-[#6f6fb0]", children: unit })
    ] })
  ] });
}
function Stars({ n, size = "text-2xl" }) {
  return /* @__PURE__ */ jsx("span", { className: `${size} tracking-widest`, children: [0, 1, 2].map((i) => /* @__PURE__ */ jsx("span", { className: i < n ? "text-[#f6cd29] text-glow-gold" : "text-[#33336b]", children: "\u2605" }, i)) });
}
function ResultModal({
  title,
  titleColor,
  children,
  actions
}) {
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-[rgba(2,2,20,0.8)] backdrop-blur-sm p-4", children: /* @__PURE__ */ jsxs(Panel, { glow: true, className: "pop-in w-full max-w-md p-6 sm:p-8 text-center", children: [
    /* @__PURE__ */ jsx("h2", { className: `font-pixel text-sm sm:text-base leading-relaxed ${titleColor}`, children: title }),
    /* @__PURE__ */ jsx("div", { className: "mt-5", children }),
    /* @__PURE__ */ jsx("div", { className: "mt-7 flex flex-wrap justify-center gap-3", children: actions })
  ] }) });
}
export {
  ArcadeButton,
  Panel,
  ResultModal,
  Stars,
  Stat
};
