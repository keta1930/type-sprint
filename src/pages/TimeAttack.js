import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from "react";
import { genAttackWord } from "../game/content.js";
import { sfx } from "../game/audio.js";
import { loadRecords, saveRecords } from "../game/storage.js";
import { accOf, wpmOf } from "../game/types.js";
import { useTypingInput } from "../game/useTypingInput.js";
import GameShell from "../components/GameShell.js";
import { ArcadeButton, Panel, ResultModal, Stat } from "../components/ui-kit.js";
const DURATION = 60;
function TimeAttack({ onBack }) {
  const [phase, setPhase] = useState("ready");
  const [words, setWords] = useState(() => Array.from({ length: 8 }, genAttackWord));
  const [wi, setWi] = useState(0);
  const [ci, setCi] = useState(0);
  const [wordErr, setWordErr] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);
  const [finals, setFinals] = useState({ score: 0, wpm: 0, acc: 100, words: 0, maxCombo: 0 });
  const s = useRef({ correct: 0, wrong: 0, combo: 0, maxCombo: 0, words: 0, score: 0, startAt: 0 });
  const timerRef = useRef(0);
  const pushWords = useCallback(() => {
    setWords((w) => [...w, ...Array.from({ length: 8 }, genAttackWord)]);
  }, []);
  const endGame = useCallback(() => {
    window.clearInterval(timerRef.current);
    const st = s.current;
    const wpm = wpmOf(st.correct, DURATION);
    const acc = accOf(st.correct, st.wrong);
    const rec = loadRecords();
    const nb = st.score > rec.attackBest;
    setIsNewBest(nb);
    if (nb) rec.attackBest = st.score;
    rec.attackBestWpm = Math.max(rec.attackBestWpm, wpm);
    rec.totalKeys += st.correct + st.wrong;
    saveRecords(rec);
    setFinals({ score: st.score, wpm, acc, words: st.words, maxCombo: st.maxCombo });
    sfx.win();
    setPhase("over");
  }, []);
  const start = useCallback(() => {
    s.current = { correct: 0, wrong: 0, combo: 0, maxCombo: 0, words: 0, score: 0, startAt: Date.now() };
    setWords(Array.from({ length: 8 }, genAttackWord));
    setWi(0);
    setCi(0);
    setWordErr(false);
    setCombo(0);
    setScore(0);
    setTimeLeft(DURATION);
    setIsNewBest(false);
    setPhase("run");
    sfx.countGo();
    window.clearInterval(timerRef.current);
    const t0 = Date.now();
    timerRef.current = window.setInterval(() => {
      const left = Math.max(0, DURATION - (Date.now() - t0) / 1e3);
      setTimeLeft(Math.ceil(left * 10) / 10);
      if (left <= 0) endGame();
    }, 100);
  }, [endGame]);
  useEffect(() => () => window.clearInterval(timerRef.current), []);
  const onChar = useCallback(
    (ch) => {
      if (phase !== "run") return;
      const st = s.current;
      const word = words[wi];
      if (ch === " ") {
        if (ci === 0) return;
        if (ci === word.length && !wordErr) {
          const mult2 = 1 + Math.min(4, Math.floor(st.combo / 10));
          st.score += word.length * 10 * mult2;
          st.words += 1;
          st.combo += 1;
          st.maxCombo = Math.max(st.maxCombo, st.combo);
          setCombo(st.combo);
          setScore(st.score);
          sfx.word();
          if (st.combo % 10 === 0) sfx.combo(st.combo);
        } else {
          st.combo = 0;
          setCombo(0);
          sfx.error();
        }
        const nwi = wi + 1;
        setWi(nwi);
        setCi(0);
        setWordErr(false);
        if (words.length - nwi < 5) pushWords();
        return;
      }
      if (ci >= word.length) return;
      if (ch === word[ci]) {
        st.correct += 1;
        setCi(ci + 1);
        sfx.key();
      } else {
        st.wrong += 1;
        setWordErr(true);
        sfx.error();
      }
    },
    [ci, phase, pushWords, wi, wordErr, words]
  );
  const { focus, HiddenInput } = useTypingInput(onChar, phase === "run");
  useEffect(() => {
    if (phase === "run") focus();
  }, [phase, focus]);
  const best = loadRecords().attackBest;
  const pct = timeLeft / DURATION;
  const mult = 1 + Math.min(4, Math.floor(combo / 10));
  const current = words[wi] ?? "";
  return /* @__PURE__ */ jsxs(
    GameShell,
    {
      title: "\u6781\u901F 60 \u79D2",
      codename: "TIME ATTACK 60S",
      onBack,
      right: /* @__PURE__ */ jsxs("div", { className: "hidden sm:block text-xs text-[#8a8ac0]", children: [
        "\u6700\u4F73 ",
        /* @__PURE__ */ jsx("span", { className: "text-[#f6cd29] font-bold", children: best })
      ] }),
      children: [
        HiddenInput,
        /* @__PURE__ */ jsxs("div", { className: "mx-auto w-full max-w-4xl flex-1 flex flex-col justify-center gap-4 px-4 py-6", onClick: focus, children: [
          /* @__PURE__ */ jsx("div", { className: "relative h-3 overflow-hidden rounded-full bg-[#14143c] border border-[#33336b]", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: `h-full rounded-full transition-[width] duration-100 ${pct > 0.5 ? "bg-gradient-to-r from-[#3834ff] to-[#5857ff]" : pct > 0.2 ? "bg-gradient-to-r from-[#f6cd29] to-[#ffd94a]" : "bg-gradient-to-r from-[#ff624d] to-[#ff9478]"}`,
              style: { width: `${pct * 100}%` }
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-1", children: [
            /* @__PURE__ */ jsx(Stat, { label: "\u5F97\u5206", value: score, color: "text-[#f6cd29] text-glow-gold" }),
            /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsx("div", { className: `font-pixel text-2xl sm:text-4xl tabular-nums ${timeLeft <= 10 ? "text-[#ff624d] text-glow-coral blink-soft" : "text-white"}`, children: Math.ceil(timeLeft) }),
              /* @__PURE__ */ jsx("div", { className: "font-pixel text-[8px] text-[#6f6fb0] mt-1", children: "SECONDS" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsx(Stat, { label: "\u8FDE\u51FB", value: combo, color: combo >= 10 ? "text-[#c6d32d]" : "text-white" }),
              /* @__PURE__ */ jsxs("div", { className: "mt-1 text-[10px] text-[#f6cd29] font-bold", children: [
                "\xD7",
                mult,
                " \u500D\u7387"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Panel, { glow: true, className: "p-5 sm:p-8 min-h-[220px] flex flex-col justify-center", children: phase === "run" ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("div", { className: "text-center font-typing font-extrabold tracking-wider", style: { fontSize: "clamp(30px,7vw,52px)" }, children: current.split("").map((ch, i) => /* @__PURE__ */ jsxs(
              "span",
              {
                className: i < ci ? "text-[#9d9bff]" : i === ci ? "rounded-md bg-[rgba(246,205,41,0.25)] text-[#f6cd29]" : wordErr ? "text-[#ff8a7a]" : "text-[#4a4a85]",
                children: [
                  i === ci && /* @__PURE__ */ jsx("span", { className: "caret-blink absolute-ml" }),
                  ch
                ]
              },
              i
            )) }),
            /* @__PURE__ */ jsx("div", { className: "mt-6 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[#4a4a85] font-typing text-lg", children: words.slice(wi + 1, wi + 6).map((w, i) => /* @__PURE__ */ jsx("span", { children: w }, `${wi}-${i}`)) }),
            /* @__PURE__ */ jsx("p", { className: "mt-6 text-center text-xs text-[#6f6fb0]", children: wordErr ? /* @__PURE__ */ jsx("span", { className: "text-[#ff624d]", children: "\u6709\u9519\u5B57!\u6309\u7A7A\u683C\u8DF3\u8FC7\u4F1A\u6E05\u7A7A\u8FDE\u51FB" }) : "\u6572\u5B8C\u5355\u8BCD\u6309\u7A7A\u683C\u63D0\u4EA4 \xB7 \u8FDE\u51FB\u8D8A\u9AD8\u500D\u7387\u8D8A\u9AD8" })
          ] }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-6", children: [
            /* @__PURE__ */ jsx("p", { className: "font-pixel text-xs sm:text-sm text-[#f6cd29] text-glow-gold", children: "TIME ATTACK" }),
            /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-[#b9b8ff]", children: "60 \u79D2\u6781\u9650\u51B2\u5206:\u6B63\u786E\u6572\u5B8C\u5355\u8BCD \u2192 \u7A7A\u683C\u63D0\u4EA4" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-[#6f6fb0]", children: "\u8FDE\u51FB \xD72 \xD73 \xD74 \xD75 \u500D\u7387\u9012\u589E \xB7 \u9519\u8BCD\u4F1A\u6E05\u7A7A\u8FDE\u51FB" }),
            /* @__PURE__ */ jsx(ArcadeButton, { color: "gold", size: "lg", className: "mt-6", onClick: () => {
              start();
              focus();
            }, children: "\u5F00\u59CB\u51B2\u523A" })
          ] }) })
        ] }),
        phase === "over" && /* @__PURE__ */ jsxs(ResultModal, { title: "TIME UP!", titleColor: "text-[#f6cd29] text-glow-gold", actions: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(ArcadeButton, { color: "ghost", onClick: onBack, children: "\u8FD4\u56DE\u4E3B\u9875" }),
          /* @__PURE__ */ jsx(ArcadeButton, { color: "gold", onClick: () => {
            start();
            focus();
          }, children: "\u518D\u51B2\u4E00\u6B21" })
        ] }), children: [
          /* @__PURE__ */ jsx("p", { className: "font-pixel text-3xl text-[#f6cd29] text-glow-gold", children: finals.score }),
          isNewBest && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-[#f6cd29] pop-in", children: "\u2605 \u65B0\u7EAA\u5F55 \u2605" }),
          /* @__PURE__ */ jsxs("div", { className: "mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4", children: [
            /* @__PURE__ */ jsx(Stat, { label: "\u5B8C\u6210\u5355\u8BCD", value: finals.words, color: "text-[#9d9bff]" }),
            /* @__PURE__ */ jsx(Stat, { label: "WPM", value: finals.wpm, color: "text-white" }),
            /* @__PURE__ */ jsx(Stat, { label: "\u51C6\u786E\u7387", value: finals.acc, unit: "%", color: "text-[#c6d32d]" }),
            /* @__PURE__ */ jsx(Stat, { label: "\u6700\u5927\u8FDE\u51FB", value: finals.maxCombo, color: "text-[#f6cd29]" })
          ] })
        ] })
      ]
    }
  );
}
export {
  TimeAttack as default
};
