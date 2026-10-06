import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from "react";
import { genRainWord } from "../game/content.js";
import { sfx } from "../game/audio.js";
import { loadRecords, saveRecords } from "../game/storage.js";
import { accOf, wpmOf } from "../game/types.js";
import { useTypingInput } from "../game/useTypingInput.js";
import GameShell from "../components/GameShell.js";
import { ArcadeButton, ResultModal, Stat } from "../components/ui-kit.js";
const LIVES = 5;
function WordRain({ onBack }) {
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState("ready");
  const [buffer, setBuffer] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);
  const [finalStats, setFinalStats] = useState({ score: 0, wpm: 0, acc: 100, destroyed: 0 });
  const g = useRef({
    words: [],
    booms: [],
    buffer: "",
    score: 0,
    lives: LIVES,
    combo: 0,
    correct: 0,
    wrong: 0,
    destroyed: 0,
    time: 0,
    spawnTimer: 0,
    nextId: 1,
    flash: 0,
    running: false,
    best: loadRecords().rainBest
  });
  const difficulty = (t) => {
    const lv = 1 + Math.floor(t / 22);
    return {
      lv,
      fall: 26 + lv * 7 + Math.min(40, t * 0.4),
      spawn: Math.max(0.9, 2.4 - lv * 0.22)
    };
  };
  const endGame = useCallback(() => {
    const s = g.current;
    s.running = false;
    sfx.lose();
    const rec = loadRecords();
    const nb = s.score > rec.rainBest;
    setIsNewBest(nb);
    if (nb) {
      rec.rainBest = s.score;
    }
    rec.totalKeys += s.correct + s.wrong;
    saveRecords(rec);
    setFinalStats({
      score: s.score,
      wpm: wpmOf(s.correct, s.time || 1),
      acc: accOf(s.correct, s.wrong),
      destroyed: s.destroyed
    });
    setPhase("over");
  }, []);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf = 0;
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1e3);
      last = now;
      const s = g.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
        canvas.width = W * dpr;
        canvas.height = H * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (s.running) {
        s.time += dt;
        const d = difficulty(s.time);
        setLevel(d.lv);
        s.spawnTimer -= dt;
        if (s.spawnTimer <= 0) {
          s.spawnTimer = d.spawn;
          const text = genRainWord(d.lv);
          s.words.push({
            id: s.nextId++,
            text,
            x: 0.06 + Math.random() * 0.82,
            y: -30,
            speed: d.fall * (0.8 + Math.random() * 0.5),
            glow: Math.random() > 0.82
          });
        }
        const lineY2 = H - 46;
        for (let i = s.words.length - 1; i >= 0; i--) {
          const w = s.words[i];
          w.y += w.speed * dt;
          if (w.y > lineY2) {
            s.words.splice(i, 1);
            s.lives -= 1;
            s.combo = 0;
            s.flash = 1;
            sfx.hit();
            setLives(s.lives);
            setCombo(0);
            if (s.lives <= 0) {
              endGame();
            }
          }
        }
      }
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#05051e");
      bg.addColorStop(0.75, "#12124a");
      bg.addColorStop(1, "#1c1c58");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(90,90,180,0.5)";
      for (let i = 0; i < 40; i++) {
        const sx = i * 97.3 % 100 / 100;
        const sy = i * 57.7 % 60 / 100;
        ctx.fillRect(sx * W, sy * H * 0.5, 1.5, 1.5);
      }
      const lineY = H - 46;
      ctx.strokeStyle = g.current.flash > 0.3 ? "#ff624d" : "rgba(255,98,77,0.6)";
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 8]);
      ctx.beginPath();
      ctx.moveTo(0, lineY);
      ctx.lineTo(W, lineY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(255,98,77,0.08)";
      ctx.fillRect(0, lineY, W, H - lineY);
      ctx.font = "9px 'Press Start 2P', monospace";
      ctx.fillStyle = "rgba(255,138,122,0.8)";
      ctx.textAlign = "left";
      ctx.fillText("DEFENSE LINE", 10, lineY - 6);
      if (g.current.flash > 0) {
        g.current.flash -= dt;
        ctx.fillStyle = `rgba(255,60,40,${g.current.flash * 0.18})`;
        ctx.fillRect(0, 0, W, H);
      }
      ctx.textAlign = "left";
      for (const w of s.words) {
        const x = w.x * W;
        const matched = s.buffer && w.text.startsWith(s.buffer);
        const prefix = matched ? s.buffer : "";
        const fontSize = w.glow ? 21 : 18;
        ctx.font = `${w.glow ? "800" : "600"} ${fontSize}px 'JetBrains Mono', monospace`;
        if (matched || w.glow) {
          ctx.shadowColor = w.glow ? "#f6cd29" : "#5857ff";
          ctx.shadowBlur = 14;
        }
        if (prefix) {
          const pw = ctx.measureText(prefix).width;
          ctx.fillStyle = "#f6cd29";
          ctx.fillText(prefix, x, w.y);
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#e8e8ff";
          ctx.fillText(w.text.slice(prefix.length), x + pw, w.y);
        } else {
          ctx.fillStyle = w.glow ? "#f6cd29" : "#cfcfff";
          ctx.fillText(w.text, x, w.y);
          ctx.shadowBlur = 0;
        }
        ctx.shadowBlur = 0;
        if (w.y > lineY - 70) {
          ctx.fillStyle = `rgba(255,98,77,${0.4 + 0.4 * Math.sin(now / 90)})`;
          ctx.fillRect(x - 4, w.y - fontSize - 2, ctx.measureText(w.text).width + 8, 2);
        }
      }
      for (let i = s.booms.length - 1; i >= 0; i--) {
        const b = s.booms[i];
        b.t += dt;
        if (b.t > 0.55) {
          s.booms.splice(i, 1);
          continue;
        }
        const r = b.t * 130;
        ctx.globalAlpha = 1 - b.t / 0.55;
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
        ctx.stroke();
        for (let k = 0; k < 8; k++) {
          const a = k / 8 * Math.PI * 2 + b.t;
          ctx.fillStyle = b.color;
          ctx.fillRect(b.x + Math.cos(a) * r, b.y + Math.sin(a) * r, 3, 3);
        }
        ctx.globalAlpha = 1;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [endGame]);
  const onChar = useCallback(
    (ch) => {
      const s = g.current;
      if (!s.running) return;
      if (!/[a-zA-Z0-9!@#$%&*._:-]/.test(ch)) return;
      const next = (s.buffer + ch).toLowerCase();
      const hit = s.words.find((w) => w.text.toLowerCase().startsWith(next));
      if (hit) {
        s.correct += 1;
        s.buffer = next;
        setBuffer(next);
        if (hit.text.toLowerCase() === next) {
          const canvas = canvasRef.current;
          const bonus = hit.glow ? 3 : 1;
          const comboBonus = Math.min(5, 1 + Math.floor(s.combo / 8));
          s.score += hit.text.length * 10 * bonus * comboBonus;
          s.destroyed += 1;
          s.combo += 1;
          s.booms.push({ x: hit.x * canvas.clientWidth + 30, y: hit.y - 8, t: 0, color: hit.glow ? "#f6cd29" : "#5857ff" });
          s.words = s.words.filter((w) => w.id !== hit.id);
          s.buffer = "";
          setBuffer("");
          setScore(s.score);
          setCombo(s.combo);
          sfx.explosion();
          if (s.combo % 10 === 0) sfx.combo(s.combo);
        } else {
          sfx.key();
        }
      } else if (s.buffer === "") {
        const fresh = s.words.find((w) => w.text.toLowerCase().startsWith(ch.toLowerCase()));
        if (fresh) {
          s.correct += 1;
          s.buffer = ch.toLowerCase();
          setBuffer(s.buffer);
          sfx.key();
        } else {
          s.wrong += 1;
          sfx.error();
        }
      } else {
        s.wrong += 1;
        s.buffer = "";
        setBuffer("");
        sfx.error();
      }
    },
    []
  );
  const start = useCallback(() => {
    const s = g.current;
    s.words = [];
    s.booms = [];
    s.buffer = "";
    s.score = 0;
    s.lives = LIVES;
    s.combo = 0;
    s.correct = 0;
    s.wrong = 0;
    s.destroyed = 0;
    s.time = 0;
    s.spawnTimer = 0.5;
    s.flash = 0;
    s.running = true;
    s.best = loadRecords().rainBest;
    setBuffer("");
    setScore(0);
    setLives(LIVES);
    setCombo(0);
    setLevel(1);
    setIsNewBest(false);
    setPhase("run");
    sfx.countGo();
  }, []);
  const { focus, HiddenInput } = useTypingInput(onChar, phase === "run");
  useEffect(() => {
    if (phase === "run") focus();
  }, [phase, focus]);
  const best = Math.max(loadRecords().rainBest, score);
  return /* @__PURE__ */ jsxs(
    GameShell,
    {
      title: "\u5355\u8BCD\u96E8 \xB7 \u57CE\u5E02\u9632\u7EBF",
      codename: "WORD RAIN DEFENSE",
      onBack,
      right: /* @__PURE__ */ jsxs("div", { className: "hidden sm:block text-xs text-[#8a8ac0]", children: [
        "\u6700\u4F73 ",
        /* @__PURE__ */ jsx("span", { className: "text-[#f6cd29] font-bold", children: best })
      ] }),
      children: [
        HiddenInput,
        /* @__PURE__ */ jsx("div", { className: "mx-auto w-full max-w-5xl flex-1 flex flex-col gap-3 px-3 sm:px-4 py-3", children: /* @__PURE__ */ jsxs("div", { className: "relative h-[min(72dvh,660px)] min-h-[440px] overflow-hidden rounded-xl border border-[#33336b]", onClick: focus, children: [
          /* @__PURE__ */ jsx("canvas", { ref: canvasRef, className: "block h-full w-full" }),
          /* @__PURE__ */ jsxs("div", { className: "absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-[rgba(2,2,20,0.85)] to-transparent px-3 sm:px-5 py-2.5", children: [
            /* @__PURE__ */ jsx(Stat, { label: "\u5F97\u5206", value: score, color: "text-[#f6cd29] text-glow-gold" }),
            /* @__PURE__ */ jsx(Stat, { label: "\u7B49\u7EA7", value: level, color: "text-[#9d9bff]" }),
            /* @__PURE__ */ jsx(Stat, { label: "\u8FDE\u51FB", value: combo, color: combo >= 8 ? "text-[#c6d32d]" : "text-white" }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
              /* @__PURE__ */ jsx("span", { className: "font-pixel text-[8px] text-[#6f6fb0]", children: "\u9632\u7EBF" }),
              /* @__PURE__ */ jsx("span", { className: "text-lg tracking-widest", children: Array.from({ length: LIVES }).map((_, i) => /* @__PURE__ */ jsx("span", { className: i < lives ? "text-[#ff624d]" : "text-[#33336b]", children: "\u2665" }, i)) })
            ] })
          ] }),
          phase === "run" && /* @__PURE__ */ jsx("div", { className: "absolute bottom-3 left-1/2 -translate-x-1/2 rounded-lg border border-[#33336b] bg-[rgba(9,9,42,0.85)] px-4 py-2 font-typing text-lg", children: buffer ? /* @__PURE__ */ jsxs("span", { className: "text-[#f6cd29]", children: [
            buffer,
            /* @__PURE__ */ jsx("span", { className: "caret-blink text-[#5857ff]", children: "\u258C" })
          ] }) : /* @__PURE__ */ jsx("span", { className: "text-[#6f6fb0] text-sm", children: "\u76F4\u63A5\u6572\u952E\u76D8,\u51FB\u6BC1\u4E0B\u843D\u5355\u8BCD\u2026" }) }),
          phase === "ready" && /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center bg-[rgba(2,2,20,0.6)] backdrop-blur-[2px] p-6 text-center", children: [
            /* @__PURE__ */ jsx("p", { className: "font-pixel text-xs sm:text-sm text-[#9d9bff] text-glow-blue", children: "WORD RAIN" }),
            /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-[#b9b8ff]", children: "\u5355\u8BCD\u4ECE\u591C\u7A7A\u5760\u843D,\u5728\u5B83\u4EEC\u7A81\u7834\u9632\u7EBF\u524D\u6572\u51FA\u5B83\u4EEC" }),
            /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-[#6f6fb0]", children: [
              "\u91D1\u8272\u5355\u8BCD = 3 \u500D\u5206\u6570 \xB7 \u8FDE\u51FB\u63D0\u5347\u500D\u7387 \xB7 \u4F60\u6709 ",
              LIVES,
              " \u70B9\u9632\u7EBF"
            ] }),
            /* @__PURE__ */ jsx(ArcadeButton, { color: "gold", size: "lg", className: "mt-6", onClick: () => {
              start();
              focus();
            }, children: "\u542F\u52A8\u9632\u7EBF" })
          ] })
        ] }) }),
        phase === "over" && /* @__PURE__ */ jsxs(ResultModal, { title: "LINE BREACHED", titleColor: "text-[#ff624d] text-glow-coral", actions: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(ArcadeButton, { color: "ghost", onClick: onBack, children: "\u8FD4\u56DE\u4E3B\u9875" }),
          /* @__PURE__ */ jsx(ArcadeButton, { color: "gold", onClick: () => {
            start();
            focus();
          }, children: "\u518D\u6765\u4E00\u5C40" })
        ] }), children: [
          /* @__PURE__ */ jsx("p", { className: "font-pixel text-3xl text-[#f6cd29] text-glow-gold", children: finalStats.score }),
          isNewBest && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-[#f6cd29] pop-in", children: "\u2605 \u65B0\u7EAA\u5F55 \u2605" }),
          /* @__PURE__ */ jsxs("div", { className: "mt-5 grid grid-cols-3 gap-2", children: [
            /* @__PURE__ */ jsx(Stat, { label: "\u51FB\u6BC1", value: finalStats.destroyed, color: "text-[#9d9bff]" }),
            /* @__PURE__ */ jsx(Stat, { label: "WPM", value: finalStats.wpm, color: "text-white" }),
            /* @__PURE__ */ jsx(Stat, { label: "\u51C6\u786E\u7387", value: finalStats.acc, unit: "%", color: "text-[#c6d32d]" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-4 text-xs text-[#6f6fb0]", children: "\u751F\u5B58\u8D8A\u4E45,\u5355\u8BCD\u843D\u5F97\u8D8A\u5FEB \u2014\u2014 \u4F60\u80FD\u6491\u5230\u7B2C\u51E0\u7EA7?" })
        ] })
      ]
    }
  );
}
export {
  WordRain as default
};
