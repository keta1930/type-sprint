const METER = 16;
function makeBuildings(seed, count, wMin, wMax, hMin, hMax, hues) {
  let s = seed;
  const rnd = () => {
    s = s * 16807 % 2147483647;
    return (s - 1) / 2147483646;
  };
  const list = [];
  let x = -200;
  for (let i = 0; i < count; i++) {
    const w = wMin + rnd() * (wMax - wMin);
    const h = hMin + rnd() * (hMax - hMin);
    const windows = [];
    for (let wy = 12; wy < h - 8; wy += 14) {
      for (let wx = 6; wx < w - 6; wx += 11) {
        if (rnd() > 0.35) windows.push({ x: wx, y: wy, lit: rnd() > 0.45 });
      }
    }
    list.push({ x, w, h, windows, hue: hues[Math.floor(rnd() * hues.length)] });
    x += w + 8 + rnd() * 40;
  }
  return { list, span: x + 400 };
}
class CityScene {
  canvas;
  ctx;
  stars = [];
  far = makeBuildings(7, 60, 40, 90, 40, 110, ["#0c0c33", "#101040", "#0a0a2e"]);
  mid = makeBuildings(21, 50, 50, 110, 60, 150, ["#141448", "#181858", "#101040"]);
  near = makeBuildings(42, 40, 60, 130, 80, 190, ["#1c1c58", "#22226a", "#181858"]);
  particles = [];
  lastDust = 0;
  constructor(canvas) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no ctx");
    this.ctx = ctx;
    let s = 99;
    const rnd = () => {
      s = s * 16807 % 2147483647;
      return (s - 1) / 2147483646;
    };
    for (let i = 0; i < 90; i++) {
      this.stars.push({ x: rnd(), y: rnd() * 0.55, r: rnd() * 1.4 + 0.4, tw: rnd() * Math.PI * 2 });
    }
  }
  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { clientWidth: w, clientHeight: h } = this.canvas;
    if (this.canvas.width !== w * dpr || this.canvas.height !== h * dpr) {
      this.canvas.width = w * dpr;
      this.canvas.height = h * dpr;
    }
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  spawnDust(x, y, color = "#8a8ac0") {
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y,
        vx: -20 - Math.random() * 30,
        vy: -10 - Math.random() * 25,
        life: 0.5 + Math.random() * 0.3,
        color,
        size: 2 + Math.random() * 2
      });
    }
  }
  burst(x, y, color, n = 18) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 40 + Math.random() * 90;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 30,
        life: 0.6 + Math.random() * 0.5,
        color,
        size: 2 + Math.random() * 3
      });
    }
  }
  render(st, dt) {
    this.resize();
    const c = this.ctx;
    const W = this.canvas.clientWidth;
    const H = this.canvas.clientHeight;
    const groundY = H * 0.78;
    const midX = (st.copX + st.thiefX) / 2;
    const camX = midX * METER - W / 2;
    c.save();
    if (st.shake > 0.01) {
      c.translate((Math.random() - 0.5) * 8 * st.shake, (Math.random() - 0.5) * 6 * st.shake);
    }
    const sky = c.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, "#03031c");
    sky.addColorStop(0.7, "#0b0b3a");
    sky.addColorStop(1, "#191958");
    c.fillStyle = sky;
    c.fillRect(-20, -20, W + 40, groundY + 20);
    for (const stt of this.stars) {
      const a = 0.4 + 0.6 * Math.abs(Math.sin(st.time * 1.5 + stt.tw));
      c.fillStyle = `rgba(220,220,255,${a * 0.8})`;
      c.fillRect(stt.x * W, stt.y * groundY, stt.r, stt.r);
    }
    c.fillStyle = "#f6ecd0";
    c.beginPath();
    c.arc(W * 0.86, H * 0.24, 20, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "rgba(246,236,208,0.12)";
    c.beginPath();
    c.arc(W * 0.86, H * 0.24, 32, 0, Math.PI * 2);
    c.fill();
    this.drawLayer(this.far, camX * 0.2, groundY, 0.55, st.time);
    this.drawLayer(this.mid, camX * 0.45, groundY, 0.8, st.time);
    this.drawLayer(this.near, camX * 0.7, groundY, 1, st.time);
    const roadG = c.createLinearGradient(0, groundY, 0, H);
    roadG.addColorStop(0, "#1a1a3e");
    roadG.addColorStop(0.15, "#10102c");
    roadG.addColorStop(1, "#07071c");
    c.fillStyle = roadG;
    c.fillRect(-20, groundY, W + 40, H - groundY + 20);
    c.fillStyle = "#2c2c66";
    c.fillRect(-20, groundY, W + 40, 4);
    c.fillStyle = "#f6cd29";
    c.fillRect(-20, groundY + 2, W + 40, 1.5);
    const dashY = groundY + (H - groundY) * 0.55;
    c.fillStyle = "rgba(246,205,41,0.55)";
    const dashW = 34;
    const gap = 26;
    const off = -(camX % (dashW + gap));
    for (let x = off - dashW; x < W + dashW; x += dashW + gap) {
      c.fillRect(x, dashY, dashW, 4);
    }
    const lampSpan = 340;
    const lampOff = -(camX % lampSpan);
    for (let x = lampOff - lampSpan; x < W + lampSpan; x += lampSpan) {
      const lx = x;
      c.fillStyle = "#2c2c50";
      c.fillRect(lx, groundY - 92, 4, 92);
      c.fillRect(lx, groundY - 92, 26, 4);
      c.fillStyle = "#f6cd29";
      c.fillRect(lx + 20, groundY - 90, 9, 6);
      c.save();
      c.beginPath();
      c.arc(lx + 24, groundY - 55, 58, 0, Math.PI * 2);
      c.clip();
      const lg = c.createRadialGradient(lx + 24, groundY - 82, 2, lx + 24, groundY - 58, 58);
      lg.addColorStop(0, "rgba(246,205,41,0.28)");
      lg.addColorStop(1, "rgba(246,205,41,0)");
      c.fillStyle = lg;
      c.fillRect(lx - 36, groundY - 90, 122, 92);
      c.restore();
    }
    const sx = (mx) => mx * METER - camX;
    if (st.running && st.time - this.lastDust > 0.12) {
      this.lastDust = st.time;
      this.spawnDust(sx(st.thiefX) - 6, groundY - 2, "#6a6a9a");
      this.spawnDust(sx(st.copX) - 6, groundY - 2, "#5857ff");
    }
    const bobT = st.running ? Math.abs(Math.sin(st.time * 11)) * 3 : 0;
    const bobC = st.running ? Math.abs(Math.sin(st.time * 11 + 0.9)) * 3 : 0;
    this.drawThief(sx(st.thiefX), groundY - bobT, st.time, st.running, st.escaped);
    this.drawCop(sx(st.copX), groundY - bobC, st.time, st.running, st.caught);
    if (st.caught) {
      const x = sx(st.thiefX);
      c.fillStyle = "rgba(255,98,77,0.95)";
      c.font = "bold 13px 'JetBrains Mono', monospace";
      c.textAlign = "center";
      c.fillText("\u2605 BUSTED \u2605", x, groundY - 74 + Math.sin(st.time * 6) * 3);
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 60 * dt;
      c.globalAlpha = Math.min(1, p.life * 2);
      c.fillStyle = p.color;
      c.fillRect(p.x, p.y, p.size, p.size);
      c.globalAlpha = 1;
    }
    if (st.running) {
      const phase = Math.floor(st.time * 3.5) % 2;
      const g = c.createLinearGradient(0, 0, W, 0);
      const col = phase === 0 ? "255,60,60" : "70,90,255";
      g.addColorStop(0, `rgba(${col},0)`);
      g.addColorStop(0.5, `rgba(${col},0.06)`);
      g.addColorStop(1, `rgba(${col},0)`);
      c.fillStyle = g;
      c.fillRect(0, 0, W, groundY);
    }
    c.restore();
    const vg = c.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(2,2,16,0.55)");
    c.fillStyle = vg;
    c.fillRect(0, 0, W, H);
  }
  drawLayer(layer, offset, groundY, alpha, time) {
    const c = this.ctx;
    const W = this.canvas.clientWidth;
    c.save();
    c.globalAlpha = alpha;
    const span = layer.span;
    const base = -((offset % span + span) % span);
    for (let rep = base - span; rep < W + span; rep += span) {
      for (const b of layer.list) {
        const x = rep + b.x;
        if (x > W + 140 || x + b.w < -140) continue;
        const y = groundY - b.h;
        c.fillStyle = b.hue;
        c.fillRect(x, y, b.w, b.h);
        c.fillStyle = "rgba(120,120,220,0.25)";
        c.fillRect(x, y, b.w, 2);
        for (const wn of b.windows) {
          const flicker = wn.lit && Math.sin(time * 0.7 + wn.x * 3 + wn.y) > -0.92;
          c.fillStyle = flicker ? "rgba(246,205,41,0.75)" : "rgba(60,60,110,0.5)";
          c.fillRect(x + wn.x, y + wn.y, 4, 6);
        }
      }
    }
    c.restore();
  }
  drawRunner(x, footY, time, running, colors, flip, scale = 2.4) {
    const c = this.ctx;
    const u = scale;
    const frame = running ? Math.floor(time * 10) % 2 : 0;
    const px = (dx, dy, w, h, col) => {
      c.fillStyle = col;
      c.fillRect(x + (flip ? -dx - w : dx) * u, footY + dy * u, w * u, h * u);
    };
    if (frame === 0) {
      px(-3, -6, 2.2, 6, colors.pants);
      px(1, -5, 2.2, 5, colors.pants);
    } else {
      px(-4.2, -5, 2.2, 5, colors.pants);
      px(2, -6, 2.2, 6, colors.pants);
    }
    px(-3.2, -13, 6.4, 7.5, colors.body);
    if (colors.stripe) {
      px(-3.2, -11.4, 6.4, 1.6, colors.stripe);
      px(-3.2, -8.6, 6.4, 1.6, colors.stripe);
    }
    if (frame === 0) {
      px(-5, -12.4, 2, 5.4, colors.body);
      px(3, -11, 2, 5.4, colors.body);
    } else {
      px(-5, -11, 2, 5.4, colors.body);
      px(3, -12.4, 2, 5.4, colors.body);
    }
    px(-2.6, -18.6, 5.2, 5.6, colors.head);
    px(-3, -20.4, 6, 2.4, colors.hat);
    px(flip ? -5 : 1.4, -18.8, 3.6, 1.2, colors.hat);
  }
  drawThief(x, footY, time, running, escaped) {
    this.drawRunner(
      x,
      footY,
      time,
      running,
      { hat: "#22222e", head: "#e8b98a", body: "#d8d8e8", stripe: "#2a2a3a", pants: "#3a3a4a" },
      true
    );
    const c = this.ctx;
    const sway = Math.sin(time * 10) * 2;
    c.fillStyle = "#8a6b3a";
    c.beginPath();
    c.arc(x - 14, footY - 22 + sway * 0.4, 7, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#6b5230";
    c.fillRect(x - 17, footY - 30 + sway * 0.4, 6, 4);
    c.fillStyle = "#f6cd29";
    c.font = "bold 8px monospace";
    c.textAlign = "center";
    c.fillText("$", x - 14, footY - 19 + sway * 0.4);
    if (escaped) {
      c.font = "bold 11px 'JetBrains Mono', monospace";
      c.fillStyle = "#ff624d";
      c.fillText("ESCAPED!", x, footY - 56);
    }
  }
  drawCop(x, footY, time, running, caught) {
    this.drawRunner(
      x,
      footY,
      time,
      running,
      { hat: "#1c2a6e", head: "#e8b98a", body: "#2b3fbf", pants: "#141c4a" },
      false
    );
    const c = this.ctx;
    c.fillStyle = "#f6cd29";
    c.fillRect(x - 2, footY - 47, 4, 3);
    const phase = Math.floor(time * 6) % 2;
    c.fillStyle = phase === 0 ? "#ff4040" : "#4060ff";
    c.fillRect(x - 3, footY - 52, 6, 4);
    c.fillStyle = phase === 0 ? "rgba(255,64,64,0.35)" : "rgba(64,96,255,0.35)";
    c.beginPath();
    c.arc(x, footY - 50, 12 + Math.sin(time * 12) * 2, 0, Math.PI * 2);
    c.fill();
    if (caught) {
      c.fillStyle = "#e8e8ff";
      c.fillRect(x + 12, footY - 30, 5, 3);
      c.fillRect(x + 18, footY - 30, 5, 3);
    }
  }
}
export {
  CityScene
};
