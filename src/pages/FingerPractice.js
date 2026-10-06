import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FINGER_ZONES } from "../game/content.js";
import { sfx } from "../game/audio.js";
import { loadRecords, saveRecords } from "../game/storage.js";
import { accOf, wpmOf } from "../game/types.js";
import { useTypingInput } from "../game/useTypingInput.js";
import GameShell from "../components/GameShell.js";
import TypingText from "../components/TypingText.js";
import VirtualKeyboard, { FINGER_NAMES, fingerOf } from "../components/VirtualKeyboard.js";
import { ArcadeButton, Panel, Stat } from "../components/ui-kit.js";
function FingerPractice({ onBack }) {
  const [phase, setPhase] = useState("pick");
  const [zoneId, setZoneId] = useState("home");
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [errors, setErrors] = useState(/* @__PURE__ */ new Set());
  const [pressed, setPressed] = useState(null);
  const [wrongFlash, setWrongFlash] = useState(null);
  const [stats, setStats] = useState({ correct: 0, wrong: 0, startAt: 0, endAt: 0 });
  const zone = useMemo(() => FINGER_ZONES.find((z) => z.id === zoneId) ?? FINGER_ZONES[0], [zoneId]);
  const gen = useCallback((keys, len = 72) => {
    const arr = [];
    let last = "";
    while (arr.join("").length < len) {
      let c = keys[Math.floor(Math.random() * keys.length)];
      if (c === last) c = keys[Math.floor(Math.random() * keys.length)];
      arr.push(c);
      last = c;
      if (arr.length % (3 + Math.floor(Math.random() * 4)) === 0) arr.push(" ");
    }
    return arr.join("").trim().slice(0, len);
  }, []);
  const begin = useCallback(
    (id) => {
      const z = FINGER_ZONES.find((x) => x.id === id) ?? FINGER_ZONES[0];
      setZoneId(z.id);
      setText(gen(z.keys));
      setIndex(0);
      setErrors(/* @__PURE__ */ new Set());
      setStats({ correct: 0, wrong: 0, startAt: 0, endAt: 0 });
      setPhase("run");
      sfx.countGo();
    },
    [gen]
  );
  const onChar = useCallback(
    (ch) => {
      if (phase !== "run") return;
      setPressed(ch);
      setTimeout(() => setPressed(null), 90);
      const expected = text[index];
      if (ch === expected) {
        sfx.key();
        setStats((s) => ({ ...s, correct: s.correct + 1, startAt: s.startAt || Date.now() }));
        const ni = index + 1;
        setIndex(ni);
        if (ni >= text.length) {
          setStats((s) => ({ ...s, endAt: Date.now() }));
          const rec = loadRecords();
          rec.practiceSessions += 1;
          saveRecords(rec);
          sfx.win();
          setPhase("done");
        }
      } else {
        sfx.error();
        setWrongFlash(ch);
        setTimeout(() => setWrongFlash(null), 180);
        setStats((s) => ({ ...s, wrong: s.wrong + 1 }));
        setErrors((prev) => new Set(prev).add(index));
      }
    },
    [index, phase, text]
  );
  const { focus, HiddenInput } = useTypingInput(onChar, phase === "run");
  useEffect(() => {
    if (phase === "run") focus();
  }, [phase, focus]);
  const nextKey = text[index] ?? null;
  const elapsed = stats.startAt ? ((stats.endAt || Date.now()) - stats.startAt) / 1e3 : 0;
  const acc = accOf(stats.correct, stats.wrong);
  const wpm = wpmOf(stats.correct, elapsed);
  return /* @__PURE__ */ jsxs(GameShell, { title: "\u6307\u6CD5\u8BAD\u7EC3\u573A", codename: "FINGER DRILL", onBack, children: [
    HiddenInput,
    /* @__PURE__ */ jsx("div", { className: "mx-auto w-full max-w-4xl flex-1 flex flex-col gap-4 px-4 py-5", onClick: focus, children: phase === "pick" ? /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col justify-center", children: [
      /* @__PURE__ */ jsx("p", { className: "font-pixel text-xs sm:text-sm text-center text-[#9d9bff] text-glow-blue", children: "FINGER DRILL" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-center text-sm text-[#b9b8ff]", children: "\u9009\u62E9\u8981\u8BAD\u7EC3\u7684\u952E\u533A,\u5C4F\u5E55\u952E\u76D8\u4F1A\u6307\u5F15\u4F60\u7528\u6B63\u786E\u7684\u624B\u6307" }),
      /* @__PURE__ */ jsxs("div", { className: "mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: [
        FINGER_ZONES.map((z) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => {
              begin(z.id);
              focus();
            },
            className: "group rounded-xl border border-[#33336b] bg-[rgba(9,9,42,0.78)] p-5 text-left transition-all hover:border-[#5857ff] hover:bg-[rgba(37,37,104,0.55)] hover:shadow-[0_0_24px_rgba(56,52,255,0.3)] active:scale-[0.98] min-h-[44px]",
            children: [
              /* @__PURE__ */ jsx("div", { className: "font-bold text-[#e8e8ff] group-hover:text-[#f6cd29]", children: z.name }),
              /* @__PURE__ */ jsx("div", { className: "mt-1 font-typing text-sm text-[#8a8ac0] tracking-widest", children: z.desc })
            ]
          },
          z.id
        )),
        /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-dashed border-[#33336b] p-5 text-xs text-[#6f6fb0] leading-relaxed", children: "\u8BAD\u7EC3\u8981\u9886:\u624B\u6307\u59CB\u7EC8\u56DE\u5230\u57FA\u51C6\u952E F J(\u6709\u51F8\u70B9),\u7528\u5BF9\u5E94\u624B\u6307\u591F\u4E0A\u4E0B\u6392,\u773C\u775B\u770B\u5C4F\u5E55\u4E0D\u770B\u952E\u76D8\u3002" })
      ] })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-1", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-[#6f6fb0]", children: "\u5F53\u524D\u952E\u533A" }),
          /* @__PURE__ */ jsx("div", { className: "font-bold text-[#e8e8ff]", children: zone.name })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-[#6f6fb0]", children: "\u4E0B\u4E00\u952E\u624B\u6307" }),
          /* @__PURE__ */ jsx("div", { className: "font-bold text-[#f6cd29] text-glow-gold", children: nextKey ? nextKey === " " ? "\u7A7A\u683C \xB7 \u62C7\u6307" : `${nextKey.toUpperCase()} \xB7 ${FINGER_NAMES[fingerOf(nextKey)]}` : "\u2014" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
          /* @__PURE__ */ jsx(Stat, { label: "\u51C6\u786E\u7387", value: acc, unit: "%", color: acc >= 95 ? "text-[#c6d32d]" : "text-white" }),
          /* @__PURE__ */ jsx(Stat, { label: "\u8FDB\u5EA6", value: `${Math.round(index / text.length * 100)}%`, color: "text-[#9d9bff]" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Panel, { glow: true, className: `p-5 sm:p-7 ${wrongFlash ? "shake" : ""}`, children: /* @__PURE__ */ jsx(TypingText, { text, index, errors, fontSize: 24, className: "text-center max-h-[150px]" }) }),
      /* @__PURE__ */ jsx(VirtualKeyboard, { nextKey, pressedKey: pressed, wrongKey: wrongFlash }),
      phase === "done" && /* @__PURE__ */ jsxs(Panel, { className: "pop-in p-5 text-center", children: [
        /* @__PURE__ */ jsx("p", { className: "font-pixel text-[10px] text-[#c6d32d]", children: "DRILL COMPLETE!" }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 flex justify-center gap-8", children: [
          /* @__PURE__ */ jsx(Stat, { label: "WPM", value: wpm, color: "text-[#9d9bff]" }),
          /* @__PURE__ */ jsx(Stat, { label: "\u51C6\u786E\u7387", value: acc, unit: "%", color: "text-[#c6d32d]" }),
          /* @__PURE__ */ jsx(Stat, { label: "\u7528\u65F6", value: `${Math.round(elapsed)}s`, color: "text-[#f6cd29]" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-5 flex flex-wrap justify-center gap-3", children: [
          /* @__PURE__ */ jsx(ArcadeButton, { color: "ghost", onClick: () => setPhase("pick"), children: "\u6362\u952E\u533A" }),
          /* @__PURE__ */ jsx(ArcadeButton, { color: "gold", onClick: () => {
            begin(zoneId);
            focus();
          }, children: "\u518D\u7EC3\u4E00\u7EC4" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  FingerPractice as default
};
