import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CityScene } from "../game/cityScene.js";
import { genLevelText, LEVELS } from "../game/content.js";
import { sfx } from "../game/audio.js";
import { loadRecords, saveRecords } from "../game/storage.js";
import { accOf, wpmOf } from "../game/types.js";
import { useTypingInput } from "../game/useTypingInput.js";
import GameShell from "../components/GameShell.js";
import TypingText from "../components/TypingText.js";
import VirtualKeyboard from "../components/VirtualKeyboard.js";
import { ArcadeButton, Panel, ResultModal, Stars, Stat } from "../components/ui-kit.js";
function ChaseGame({
  levelId,
  onBack,
  onNext
}) {
  const lv = LEVELS[levelId - 1];
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const [phase, setPhase] = useState("ready");
  const [count, setCount] = useState(3);
  const [text, setText] = useState(() => genLevelText(lv));
  const [index, setIndex] = useState(0);
  const [errors, setErrors] = useState(/* @__PURE__ */ new Set());
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [pressed, setPressed] = useState(null);
  const [wrongFlash, setWrongFlash] = useState(null);
  const [hud, setHud] = useState({ gap: lv.thiefLead, wpm: 0, acc: 100, escapePct: 0, time: 0 });
  const [newBest, setNewBest] = useState(false);
  const g = useRef({
    copX: 0,
    thiefX: lv.thiefLead,
    correct: 0,
    wrong: 0,
    startAt: 0,
    time: 0,
    shake: 0,
    finished: false,
    caught: false,
    escaped: false,
    phase: "ready"
  });
  const balance = useMemo(() => {
    const cps = lv.targetWpm * 5 / 60;
    const expected = text.length / cps;
    const thiefStep = (lv.thiefSpeed * expected + lv.thiefLead * 0.5) / text.length;
    return { thiefStep };
  }, [lv, text]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!sceneRef.current) sceneRef.current = new CityScene(canvas);
    const scene = sceneRef.current;
    let raf = 0;
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1e3);
      last = now;
      const s = g.current;
      if (s.phase === "run" && !s.finished) {
        s.time += dt;
        s.copX += lv.thiefSpeed * dt;
        s.thiefX = lv.thiefLead + s.correct * balance.thiefStep;
        if (s.copX >= s.thiefX) {
          s.finished = true;
          s.caught = true;
          sfx.lose();
          finish("lose");
        }
      }
      s.shake = Math.max(0, s.shake - dt * 4);
      scene.render(
        {
          copX: s.copX,
          thiefX: s.thiefX,
          running: s.phase === "run" && !s.finished,
          time: s.time + performance.now() / 1e5,
          shake: s.shake,
          caught: s.caught,
          escaped: s.escaped
        },
        dt
      );
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [balance, lv]);
  useEffect(() => {
    if (phase !== "run") return;
    const t = setInterval(() => {
      const s = g.current;
      setHud({
        gap: Math.max(0, s.thiefX - s.copX),
        wpm: wpmOf(s.correct, s.time),
        acc: accOf(s.correct, s.wrong),
        escapePct: s.correct / text.length,
        time: s.time
      });
    }, 120);
    return () => clearInterval(t);
  }, [phase, text.length]);
  const finish = useCallback(
    (result) => {
      const s = g.current;
      setPhase(result);
      const wpm = wpmOf(s.correct, s.time || 1);
      const acc = accOf(s.correct, s.wrong);
      const rec2 = loadRecords();
      if (result === "win") {
        const stars2 = 1 + (acc >= 96 ? 1 : 0) + (wpm >= lv.targetWpm ? 1 : 0);
        const prev = rec2.levels[lv.id];
        setNewBest(!prev || wpm > prev.bestWpm);
        rec2.levels[lv.id] = {
          stars: Math.max(prev?.stars ?? 0, stars2),
          bestWpm: Math.max(prev?.bestWpm ?? 0, wpm),
          bestAcc: Math.max(prev?.bestAcc ?? 0, acc)
        };
        rec2.unlockedLevel = Math.max(rec2.unlockedLevel, Math.min(lv.id + 1, LEVELS.length));
      }
      rec2.totalKeys += s.correct + s.wrong;
      saveRecords(rec2);
    },
    [lv]
  );
  const start = useCallback(() => {
    setPhase("count");
    g.current.phase = "count";
    sfx.siren();
    let n = 3;
    setCount(3);
    const t = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(t);
        setCount(0);
        sfx.countGo();
        g.current.phase = "run";
        g.current.startAt = performance.now();
        setPhase("run");
      } else {
        setCount(n);
        sfx.key();
      }
    }, 750);
  }, []);
  const restart = useCallback(() => {
    const s = g.current;
    const newText = genLevelText(lv);
    setText(newText);
    setIndex(0);
    setErrors(/* @__PURE__ */ new Set());
    setCombo(0);
    setMaxCombo(0);
    setNewBest(false);
    Object.assign(s, {
      copX: 0,
      thiefX: lv.thiefLead,
      correct: 0,
      wrong: 0,
      time: 0,
      shake: 0,
      finished: false,
      caught: false,
      escaped: false,
      phase: "ready"
    });
    setHud({ gap: lv.thiefLead, wpm: 0, acc: 100, escapePct: 0, time: 0 });
    setPhase("ready");
  }, [lv]);
  const onChar = useCallback(
    (ch) => {
      const s = g.current;
      if (s.phase === "ready") {
        start();
      }
      if (s.finished) return;
      if (g.current.phase === "count") return;
      setPressed(ch);
      setTimeout(() => setPressed(null), 90);
      const expected = text[index];
      if (ch === expected) {
        s.correct += 1;
        setIndex((i) => i + 1);
        setCombo((c) => {
          const nc = c + 1;
          setMaxCombo((m) => Math.max(m, nc));
          if (nc > 0 && nc % 15 === 0) sfx.combo(nc);
          return nc;
        });
        if (ch === " ") sfx.word();
        else sfx.key();
        if (index + 1 >= text.length && !s.finished) {
          s.finished = true;
          s.escaped = true;
          sfx.win();
          finish("win");
        }
      } else {
        s.wrong += 1;
        s.shake = 1;
        s.copX += 1.2;
        sfx.error();
        setCombo(0);
        setWrongFlash(ch);
        setTimeout(() => setWrongFlash(null), 180);
        setErrors((prev) => {
          const nx = new Set(prev);
          nx.add(index);
          return nx;
        });
      }
    },
    [finish, index, start, text]
  );
  const { focus, HiddenInput } = useTypingInput(onChar, phase !== "win" && phase !== "lose");
  useEffect(() => {
    focus();
  }, [focus]);
  const nextKey = text[index] ?? null;
  const rec = loadRecords().levels[lv.id];
  const finalWpm = wpmOf(g.current.correct, g.current.time || 1);
  const finalAcc = accOf(g.current.correct, g.current.wrong);
  const stars = 1 + (finalAcc >= 96 ? 1 : 0) + (finalWpm >= lv.targetWpm ? 1 : 0);
  return /* @__PURE__ */ jsxs(
    GameShell,
    {
      title: `\u7B2C ${lv.id} \u5173 \xB7 ${lv.name}`,
      codename: `MISSION ${lv.codename}`,
      onBack,
      right: rec ? /* @__PURE__ */ jsxs("div", { className: "hidden sm:flex items-center gap-1 text-xs text-[#8a8ac0]", children: [
        "\u6700\u4F73 ",
        /* @__PURE__ */ jsx(Stars, { n: rec.stars, size: "text-sm" }),
        " ",
        rec.bestWpm,
        " WPM"
      ] }) : void 0,
      children: [
        HiddenInput,
        /* @__PURE__ */ jsxs("div", { className: "mx-auto w-full max-w-5xl flex-1 flex flex-col gap-3 px-3 sm:px-4 py-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden rounded-xl border border-[#33336b]", children: [
            /* @__PURE__ */ jsx(
              "canvas",
              {
                ref: canvasRef,
                className: "block h-[240px] sm:h-[300px] w-full",
                onClick: focus
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "absolute inset-x-0 top-0 flex items-center justify-between gap-2 bg-gradient-to-b from-[rgba(2,2,20,0.85)] to-transparent px-3 sm:px-5 py-2.5", children: [
              /* @__PURE__ */ jsx(Stat, { label: "WPM", value: hud.wpm, color: "text-[#9d9bff]" }),
              /* @__PURE__ */ jsx(Stat, { label: "\u51C6\u786E\u7387", value: hud.acc, unit: "%", color: hud.acc >= 96 ? "text-[#c6d32d]" : "text-white" }),
              /* @__PURE__ */ jsx(
                Stat,
                {
                  label: "\u8FFD\u8D76\u8DDD\u79BB",
                  value: hud.gap.toFixed(1),
                  unit: "m",
                  color: hud.gap < 5 ? "text-[#ff624d] text-glow-coral blink-soft" : "text-white"
                }
              ),
              /* @__PURE__ */ jsx(Stat, { label: "\u8FDE\u51FB", value: combo, color: combo >= 15 ? "text-[#f6cd29] text-glow-gold" : "text-white" }),
              /* @__PURE__ */ jsxs("div", { className: "hidden sm:flex flex-col items-center min-w-[90px]", children: [
                /* @__PURE__ */ jsx("span", { className: "font-pixel text-[8px] text-[#6f6fb0]", children: "\u9003\u8131\u8FDB\u5EA6" }),
                /* @__PURE__ */ jsx("div", { className: "mt-1.5 h-2 w-24 overflow-hidden rounded-full bg-[#14143c]", children: /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "h-full rounded-full bg-gradient-to-r from-[#5857ff] to-[#c6d32d] transition-all duration-200",
                    style: { width: `${hud.escapePct * 100}%` }
                  }
                ) })
              ] })
            ] }),
            (phase === "ready" || phase === "count") && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex flex-col items-center justify-center bg-[rgba(2,2,20,0.55)] backdrop-blur-[2px]", children: phase === "ready" ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs("p", { className: "font-pixel text-[10px] sm:text-xs text-[#f6cd29] text-glow-gold", children: [
                "MISSION ",
                lv.codename
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "mt-2 text-sm text-[#b9b8ff]", children: [
                lv.desc,
                " \xB7 \u76EE\u6807 ",
                lv.targetWpm,
                " WPM"
              ] }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-[#6f6fb0]", children: "\u4F60\u5728\u524D\u65B9\u9003\u8DD1!\u6253\u5B57\u8D8A\u5FEB\u8DD1\u5F97\u8D8A\u8FDC,\u6253\u9519\u4F1A\u88AB\u8FFD\u4E0A \u2014\u2014 \u6253\u5B8C\u6587\u672C\u5373\u9003\u8131" }),
              /* @__PURE__ */ jsx(ArcadeButton, { color: "gold", size: "lg", className: "mt-5", onClick: () => {
                focus();
                start();
              }, children: "\u5F00\u59CB\u9003\u8DD1" }),
              /* @__PURE__ */ jsx("p", { className: "mt-3 text-xs text-[#6f6fb0] blink-soft", children: "\u4E5F\u53EF\u4EE5\u76F4\u63A5\u6572\u952E\u76D8\u5F00\u59CB" })
            ] }) : /* @__PURE__ */ jsx("div", { className: "font-pixel text-5xl sm:text-7xl text-[#f6cd29] text-glow-gold pop-in", children: count > 0 ? count : "GO!" }, count) })
          ] }),
          /* @__PURE__ */ jsx(Panel, { className: `p-4 sm:p-6 ${wrongFlash ? "shake" : ""}`, glow: true, children: /* @__PURE__ */ jsx(
            TypingText,
            {
              text,
              index,
              errors,
              fontSize: typeof window !== "undefined" && window.innerWidth < 640 ? 19 : 25,
              className: "max-h-[130px] sm:max-h-[150px]"
            }
          ) }),
          /* @__PURE__ */ jsx("div", { onClick: focus, className: "cursor-pointer", children: /* @__PURE__ */ jsx(VirtualKeyboard, { nextKey, pressedKey: pressed, wrongKey: wrongFlash, compact: typeof window !== "undefined" && window.innerWidth < 640 }) })
        ] }),
        phase === "win" && /* @__PURE__ */ jsxs(ResultModal, { title: "ESCAPED!", titleColor: "text-[#c6d32d] text-glow-blue", actions: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(ArcadeButton, { color: "ghost", onClick: onBack, children: "\u8FD4\u56DE\u9009\u5173" }),
          /* @__PURE__ */ jsx(ArcadeButton, { color: "coral", onClick: restart, children: "\u518D\u9003\u4E00\u6B21" }),
          levelId < LEVELS.length && /* @__PURE__ */ jsx(ArcadeButton, { color: "gold", onClick: () => onNext(levelId + 1), children: "\u4E0B\u4E00\u5173 \u2192" })
        ] }), children: [
          /* @__PURE__ */ jsx(Stars, { n: stars, size: "text-4xl" }),
          newBest && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-[#f6cd29] text-glow-gold pop-in", children: "\u65B0\u7EAA\u5F55!" }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 grid grid-cols-3 gap-2", children: [
            /* @__PURE__ */ jsx(Stat, { label: "WPM", value: finalWpm, color: "text-[#9d9bff]" }),
            /* @__PURE__ */ jsx(Stat, { label: "\u51C6\u786E\u7387", value: finalAcc, unit: "%", color: "text-[#c6d32d]" }),
            /* @__PURE__ */ jsx(Stat, { label: "\u6700\u5927\u8FDE\u51FB", value: maxCombo, color: "text-[#f6cd29]" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-4 text-xs text-[#6f6fb0]", children: stars >= 3 ? "\u5B8C\u7F8E\u8131\u8EAB!\u5BF9\u624B\u8FDE\u4F60\u7684\u80CC\u5F71\u90FD\u6CA1\u770B\u5230" : stars === 2 ? "\u6210\u529F\u9003\u8131!\u518D\u5FEB\u4E00\u70B9\u5C31\u662F\u4E09\u661F" : "\u9003\u6389\u4E86!\u63D0\u9AD8\u51C6\u786E\u7387\u4E0E\u901F\u5EA6\u62FF\u66F4\u591A\u661F" })
        ] }),
        phase === "lose" && /* @__PURE__ */ jsxs(ResultModal, { title: "BUSTED!", titleColor: "text-[#ff624d] text-glow-coral", actions: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(ArcadeButton, { color: "ghost", onClick: onBack, children: "\u8FD4\u56DE\u9009\u5173" }),
          /* @__PURE__ */ jsx(ArcadeButton, { color: "gold", onClick: () => {
            restart();
          }, children: "\u518D\u6B21\u9003\u8DD1" })
        ] }), children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-[#b9b8ff]", children: "\u88AB\u8FFD\u4E0A\u4E86\u2026\u6253\u5F97\u66F4\u5FEB\u3001\u66F4\u5C11\u5931\u8BEF\u624D\u80FD\u7529\u5F00\u5BF9\u624B" }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 grid grid-cols-3 gap-2", children: [
            /* @__PURE__ */ jsx(Stat, { label: "WPM", value: finalWpm, color: "text-[#9d9bff]" }),
            /* @__PURE__ */ jsx(Stat, { label: "\u51C6\u786E\u7387", value: finalAcc, unit: "%", color: "text-white" }),
            /* @__PURE__ */ jsx(Stat, { label: "\u9003\u8131\u8FDB\u5EA6", value: `${Math.round(index / text.length * 100)}%`, color: "text-[#f6cd29]" })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "mt-4 text-xs text-[#6f6fb0]", children: [
            "\u63D0\u793A:\u76EE\u6807 ",
            lv.targetWpm,
            " WPM \xB7 \u6BCF\u6B21\u6253\u9519\u90FD\u4F1A\u88AB\u62C9\u8FD1 1.2 \u7C73"
          ] })
        ] })
      ]
    }
  );
}
export {
  ChaseGame as default
};
