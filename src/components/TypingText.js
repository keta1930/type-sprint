import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
function TypingText({ text, index, errors, fontSize = 26, className = "" }) {
  const caretRef = useRef(null);
  const boxRef = useRef(null);
  useEffect(() => {
    const caret = caretRef.current;
    const box = boxRef.current;
    if (!caret || !box) return;
    const cTop = caret.offsetTop;
    const target = cTop - box.clientHeight / 2;
    box.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
  }, [index]);
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: boxRef,
      className: `overflow-hidden leading-[2] break-all whitespace-pre-wrap ${className}`,
      style: { fontSize },
      children: text.split("").map((ch, i) => {
        const done = i < index;
        const current = i === index;
        const err = errors.has(i);
        return /* @__PURE__ */ jsxs(
          "span",
          {
            ref: current ? caretRef : void 0,
            className: current ? "relative rounded-[3px] bg-[rgba(246,205,41,0.22)] text-[#f6cd29]" : done ? err ? "rounded-[3px] bg-[rgba(255,98,77,0.25)] text-[#ff8a7a]" : "text-[#9d9bff]" : "text-[#4a4a85]",
            children: [
              current && /* @__PURE__ */ jsx("span", { className: "caret-blink absolute -left-[1px] top-[12%] bottom-[12%] w-[2px] bg-[#f6cd29]" }),
              ch === " " ? done && err ? "\xB7" : " " : ch
            ]
          },
          i
        );
      })
    }
  );
}
export {
  TypingText as default
};
