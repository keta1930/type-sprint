import { useCallback, useEffect, useRef, useState } from "react";
import { genRainWord } from "../game/content";
import { sfx } from "../game/audio";
import { loadRecords, saveRecords } from "../game/storage";
import { accOf, wpmOf } from "../game/types";
import { useTypingInput } from "../game/useTypingInput";
import GameShell from "../components/GameShell";
import { ArcadeButton, ResultModal, Stat } from "../components/ui-kit";

interface Word {
  id: number;
  text: string;
  x: number; // 0-1 归一化
  y: number; // 像素
  speed: number;
  glow: boolean;
}

interface Boom {
  x: number;
  y: number;
  t: number;
  color: string;
}

type Phase = "ready" | "run" | "over";

const LIVES = 5;

export default function WordRain({ onBack }: { onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [buffer, setBuffer] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);
  const [finalStats, setFinalStats] = useState({ score: 0, wpm: 0, acc: 100, destroyed: 0 });

  const g = useRef({
    words: [] as Word[],
    booms: [] as Boom[],
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
    best: loadRecords().rainBest,
  });

  const difficulty = (t: number) => {
    const lv = 1 + Math.floor(t / 22);
    return {
      lv,
      fall: 26 + lv * 7 + Math.min(40, t * 0.4),
      spawn: Math.max(0.9, 2.4 - lv * 0.22),
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
      destroyed: s.destroyed,
    });
    setPhase("over");
  }, []);

  /* ---------- 主循环 ---------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
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
        // 生成
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
            glow: Math.random() > 0.82,
          });
        }
        // 下落 & 触线
        const lineY = H - 46;
        for (let i = s.words.length - 1; i >= 0; i--) {
          const w = s.words[i];
          w.y += w.speed * dt;
          if (w.y > lineY) {
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

      /* ---- 绘制 ---- */
      // 背景:夜空渐变 + 远景楼群剪影
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#05051e");
      bg.addColorStop(0.75, "#12124a");
      bg.addColorStop(1, "#1c1c58");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(90,90,180,0.5)";
      for (let i = 0; i < 40; i++) {
        const sx = ((i * 97.3) % 100) / 100;
        const sy = ((i * 57.7) % 60) / 100;
        ctx.fillRect(sx * W, sy * H * 0.5, 1.5, 1.5);
      }

      // 警戒线
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

      // 受击红闪
      if (g.current.flash > 0) {
        g.current.flash -= dt;
        ctx.fillStyle = `rgba(255,60,40,${g.current.flash * 0.18})`;
        ctx.fillRect(0, 0, W, H);
      }

      // 单词
      ctx.textAlign = "left";
      for (const w of s.words) {
        const x = w.x * W;
        const matched = s.buffer && w.text.startsWith(s.buffer);
        const prefix = matched ? s.buffer : "";
        const fontSize = w.glow ? 21 : 18;
        ctx.font = `${w.glow ? "800" : "600"} ${fontSize}px 'JetBrains Mono', monospace`;
        // 光晕底座
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
        // 危险:接近警戒线变红
        if (w.y > lineY - 70) {
          ctx.fillStyle = `rgba(255,98,77,${0.4 + 0.4 * Math.sin(now / 90)})`;
          ctx.fillRect(x - 4, w.y - fontSize - 2, ctx.measureText(w.text).width + 8, 2);
        }
      }

      // 爆炸粒子
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
          const a = (k / 8) * Math.PI * 2 + b.t;
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

  /* ---------- 输入 ---------- */
  const onChar = useCallback(
    (ch: string) => {
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
          // 击毁
          const canvas = canvasRef.current!;
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
        // 首字符就不匹配 → 尝试新目标
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

  return (
    <GameShell title="单词雨 · 城市防线" codename="WORD RAIN DEFENSE" onBack={onBack}
      right={<div className="hidden sm:block text-xs text-[#8a8ac0]">最佳 <span className="text-[#f6cd29] font-bold">{best}</span></div>}
    >
      {HiddenInput}
      <div className="mx-auto w-full max-w-5xl flex-1 flex flex-col gap-3 px-3 sm:px-4 py-3">
        <div className="relative h-[min(72dvh,660px)] min-h-[440px] overflow-hidden rounded-xl border border-[#33336b]" onClick={focus}>
          <canvas ref={canvasRef} className="block h-full w-full" />
          {/* HUD */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-[rgba(2,2,20,0.85)] to-transparent px-3 sm:px-5 py-2.5">
            <Stat label="得分" value={score} color="text-[#f6cd29] text-glow-gold" />
            <Stat label="等级" value={level} color="text-[#9d9bff]" />
            <Stat label="连击" value={combo} color={combo >= 8 ? "text-[#c6d32d]" : "text-white"} />
            <div className="flex flex-col items-center">
              <span className="font-pixel text-[8px] text-[#6f6fb0]">防线</span>
              <span className="text-lg tracking-widest">
                {Array.from({ length: LIVES }).map((_, i) => (
                  <span key={i} className={i < lives ? "text-[#ff624d]" : "text-[#33336b]"}>♥</span>
                ))}
              </span>
            </div>
          </div>

          {/* 输入缓冲 */}
          {phase === "run" && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-lg border border-[#33336b] bg-[rgba(9,9,42,0.85)] px-4 py-2 font-typing text-lg">
              {buffer ? (
                <span className="text-[#f6cd29]">{buffer}<span className="caret-blink text-[#5857ff]">▌</span></span>
              ) : (
                <span className="text-[#6f6fb0] text-sm">直接敲键盘,击毁下落单词…</span>
              )}
            </div>
          )}

          {phase === "ready" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[rgba(2,2,20,0.6)] backdrop-blur-[2px] p-6 text-center">
              <p className="font-pixel text-xs sm:text-sm text-[#9d9bff] text-glow-blue">WORD RAIN</p>
              <p className="mt-3 text-sm text-[#b9b8ff]">单词从夜空坠落,在它们突破防线前敲出它们</p>
              <p className="mt-1 text-xs text-[#6f6fb0]">金色单词 = 3 倍分数 · 连击提升倍率 · 你有 {LIVES} 点防线</p>
              <ArcadeButton color="gold" size="lg" className="mt-6" onClick={() => { start(); focus(); }}>
                启动防线
              </ArcadeButton>
            </div>
          )}
        </div>
      </div>

      {phase === "over" && (
        <ResultModal title="LINE BREACHED" titleColor="text-[#ff624d] text-glow-coral" actions={<>
          <ArcadeButton color="ghost" onClick={onBack}>返回主页</ArcadeButton>
          <ArcadeButton color="gold" onClick={() => { start(); focus(); }}>再来一局</ArcadeButton>
        </>}>
          <p className="font-pixel text-3xl text-[#f6cd29] text-glow-gold">{finalStats.score}</p>
          {isNewBest && <p className="mt-2 text-xs text-[#f6cd29] pop-in">★ 新纪录 ★</p>}
          <div className="mt-5 grid grid-cols-3 gap-2">
            <Stat label="击毁" value={finalStats.destroyed} color="text-[#9d9bff]" />
            <Stat label="WPM" value={finalStats.wpm} color="text-white" />
            <Stat label="准确率" value={finalStats.acc} unit="%" color="text-[#c6d32d]" />
          </div>
          <p className="mt-4 text-xs text-[#6f6fb0]">生存越久,单词落得越快 —— 你能撑到第几级?</p>
        </ResultModal>
      )}
    </GameShell>
  );
}
