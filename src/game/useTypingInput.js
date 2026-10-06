import { jsx } from "react/jsx-runtime";
import { useCallback, useEffect, useRef } from "react";
function useTypingInput(onChar, active, onSpecial) {
  const inputRef = useRef(null);
  const cbRef = useRef(onChar);
  const spRef = useRef(onSpecial);
  cbRef.current = onChar;
  spRef.current = onSpecial;
  const focus = useCallback(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);
  useEffect(() => {
    if (!active) return;
    const kd = (e) => {
      if (e.key.length === 1) {
        e.preventDefault();
        cbRef.current(e.key);
      } else if (spRef.current) {
        spRef.current(e.key);
      }
    };
    window.addEventListener("keydown", kd);
    return () => window.removeEventListener("keydown", kd);
  }, [active]);
  const onInput = useCallback((e) => {
    const el = e.currentTarget;
    const v = el.value;
    if (v) {
      const ch = v[v.length - 1];
      el.value = "";
      if (ch) cbRef.current(ch);
    }
  }, []);
  const HiddenInput = /* @__PURE__ */ jsx(
    "input",
    {
      ref: inputRef,
      className: "absolute h-1 w-1 opacity-0 pointer-events-none",
      style: { top: 0, left: 0 },
      autoCapitalize: "off",
      autoCorrect: "off",
      autoComplete: "off",
      spellCheck: false,
      onInput,
      "aria-hidden": true,
      tabIndex: -1
    }
  );
  return { inputRef, focus, HiddenInput };
}
export {
  useTypingInput
};
