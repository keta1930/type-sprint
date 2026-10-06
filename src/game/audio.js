let ctx = null;
let muted = false;
try {
  muted = localStorage.getItem("ttz-muted") === "1";
} catch {
}
function isMuted() {
  return muted;
}
function toggleMute() {
  muted = !muted;
  try {
    localStorage.setItem("ttz-muted", muted ? "1" : "0");
  } catch {
  }
  return muted;
}
function ac() {
  if (muted) return null;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}
function blip(freq, dur, type, gain = 0.06, when = 0, slide = 0) {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + when;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(1e-4, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}
const sfx = {
  key() {
    blip(620 + Math.random() * 120, 0.05, "square", 0.035);
  },
  error() {
    blip(140, 0.14, "sawtooth", 0.06, 0, -60);
  },
  word() {
    blip(660, 0.07, "square", 0.05);
    blip(990, 0.09, "square", 0.05, 0.06);
  },
  combo(n) {
    const base = 520 + Math.min(n, 20) * 30;
    blip(base, 0.06, "triangle", 0.06);
    blip(base * 1.5, 0.08, "triangle", 0.06, 0.05);
  },
  hit() {
    blip(220, 0.1, "square", 0.08, 0, -120);
    blip(880, 0.06, "triangle", 0.05);
  },
  explosion() {
    blip(90, 0.3, "sawtooth", 0.1, 0, -50);
    blip(60, 0.4, "triangle", 0.1, 0.05, -30);
  },
  siren() {
    for (let i = 0; i < 4; i++) {
      blip(700, 0.12, "triangle", 0.05, i * 0.24);
      blip(950, 0.12, "triangle", 0.05, i * 0.24 + 0.12);
    }
  },
  win() {
    [523, 659, 784, 1047].forEach((f, i) => blip(f, 0.16, "square", 0.07, i * 0.13));
    blip(1319, 0.35, "square", 0.07, 0.55);
  },
  lose() {
    [400, 350, 300, 220].forEach((f, i) => blip(f, 0.2, "sawtooth", 0.06, i * 0.16));
  },
  countGo() {
    blip(880, 0.1, "square", 0.07);
    blip(1320, 0.25, "square", 0.08, 0.12);
  }
};
export {
  isMuted,
  sfx,
  toggleMute
};
