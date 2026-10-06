const WORDS_EASY = [
  "cat",
  "dog",
  "sun",
  "run",
  "map",
  "red",
  "big",
  "top",
  "box",
  "car",
  "day",
  "eat",
  "fly",
  "get",
  "hat",
  "ice",
  "jam",
  "key",
  "leg",
  "man",
  "net",
  "oil",
  "pen",
  "quiz",
  "rat",
  "sit",
  "ten",
  "use",
  "van",
  "win",
  "yes",
  "zoo",
  "apple",
  "house",
  "water",
  "happy",
  "green",
  "music",
  "table",
  "light",
  "smile",
  "world",
  "night",
  "dream",
  "cloud",
  "star"
];
const WORDS_MID = [
  "brave",
  "chase",
  "crime",
  "siren",
  "urban",
  "radar",
  "swift",
  "alarm",
  "pursuit",
  "suspect",
  "highway",
  "midnight",
  "detective",
  "evidence",
  "keyboard",
  "monitor",
  "capture",
  "justice",
  "officer",
  "mission",
  "thunder",
  "window",
  "garden",
  "planet",
  "rocket",
  "silver",
  "tunnel",
  "bridge",
  "castle",
  "danger",
  "engine",
  "forest",
  "harbor"
];
const WORDS_HARD = [
  "investigation",
  "surveillance",
  "headquarters",
  "identification",
  "extraordinary",
  "unbelievable",
  "neighborhood",
  "understand",
  "development",
  "environment",
  "performance",
  "achievement",
  "Fingerprint",
  "Patrol-7",
  "Code-Blue",
  "Wanted!",
  "S.W.A.T.",
  "siren#12",
  "block_9",
  "911-call",
  "GPS:lock",
  "x2_speed"
];
const SENTENCES = [
  "the quick brown fox jumps over the lazy dog",
  "pack my box with five dozen liquor jugs",
  "how vexingly quick daft zebras jump",
  "a good officer never gives up the chase",
  "the night city shines with neon lights",
  "practice every day and you will improve",
  "speed is nothing without accuracy",
  "keep your fingers on the home row",
  "the suspect was last seen near the harbor",
  "typing fast is a skill anyone can learn",
  "stay calm and focus on the next word",
  "every expert was once a beginner"
];
const SENTENCES_MIXED = [
  "Call 911! The thief stole 2 bags at 9:45 PM.",
  "Unit-7 reports: suspect heading EAST on 5th Ave.",
  "Reward: $5,000 for tips \u2014 dial 555-0134 now!",
  "Case #2026 opened @ 10:30; status = ACTIVE.",
  "He typed 120 WPM & never missed a key. Wow!",
  "GPS locked: 40.71N, 74.00W \u2014 move in (quietly).",
  "Password hint: Blue*Fox*2026 \u2014 don't tell anyone!",
  "Backup arrives in ~3 min; hold position A/B."
];
const FINGER_ZONES = [
  { id: "home", name: "\u57FA\u51C6\u952E\u4F4D", desc: "A S D F \xB7 J K L ;", keys: "asdfghjkl;" },
  { id: "top", name: "\u4E0A\u6392\u952E\u4F4D", desc: "Q W E R \xB7 U I O P", keys: "qwertyuiop" },
  { id: "bottom", name: "\u4E0B\u6392\u952E\u4F4D", desc: "Z X C V \xB7 B N M", keys: "zxcvbnm,." },
  { id: "number", name: "\u6570\u5B57\u952E\u4F4D", desc: "1 2 3 \xB7 7 8 9 0", keys: "1234567890" },
  { id: "all", name: "\u7EFC\u5408\u5B57\u6BCD", desc: "26 \u4E2A\u5B57\u6BCD\u6DF7\u5408", keys: "abcdefghijklmnopqrstuvwxyz" }
];
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
function genKeysText(length, keys) {
  const pool = keys ?? "asdfghjkl";
  const chars = [];
  let last = "";
  while (chars.join("").length < length) {
    let c = rand(pool.split(""));
    if (c === last) c = rand(pool.split(""));
    chars.push(c);
    last = c;
    if (chars.length % (4 + Math.floor(Math.random() * 3)) === 0) chars.push(" ");
  }
  return chars.join("").trim().slice(0, length);
}
function genWordsText(length, hard = false) {
  const pool = hard ? [...WORDS_MID, ...WORDS_HARD] : [...WORDS_EASY, ...WORDS_MID];
  let out = "";
  while (out.length < length) out += (out ? " " : "") + rand(pool);
  return out;
}
function genSentenceText(mixed = false) {
  return rand(mixed ? SENTENCES_MIXED : SENTENCES);
}
function genRainWord(level) {
  if (level < 3) return rand(WORDS_EASY);
  if (level < 6) return rand(WORDS_MID);
  return rand([...WORDS_MID, ...WORDS_HARD]);
}
function genAttackWord() {
  return rand([...WORDS_EASY, ...WORDS_EASY, ...WORDS_MID]);
}
const LEVELS = [
  { id: 1, name: "\u70ED\u8EAB\u8D77\u8DD1", codename: "WARMUP", desc: "\u57FA\u51C6\u952E\u70ED\u8EAB,\u719F\u6089\u6307\u6CD5", kind: "keys", length: 60, thiefSpeed: 3.2, targetWpm: 15, thiefLead: 14 },
  { id: 2, name: "\u8857\u533A\u5DE1\u903B", codename: "PATROL", desc: "\u5168\u5B57\u6BCD\u6162\u901F\u6DF7\u5408", kind: "keys", length: 90, thiefSpeed: 3.8, targetWpm: 20, thiefLead: 15 },
  { id: 3, name: "\u7535\u53F0\u547C\u53EB", codename: "RADIO", desc: "\u7B80\u5355\u77ED\u8BCD\u51FA\u73B0", kind: "words", length: 80, thiefSpeed: 4.4, targetWpm: 25, thiefLead: 16 },
  { id: 4, name: "\u591C\u5E02\u8FFD\u5F71", codename: "NEON", desc: "\u77ED\u8BCD\u63D0\u901F,\u522B\u7728\u773C", kind: "words", length: 100, thiefSpeed: 5, targetWpm: 30, thiefLead: 17 },
  { id: 5, name: "\u9AD8\u67B6\u98DE\u9A70", codename: "HIGHWAY", desc: "\u4E2D\u7B49\u8BCD\u6C47\u4E0A\u9635", kind: "words", length: 120, thiefSpeed: 5.6, targetWpm: 34, thiefLead: 18 },
  { id: 6, name: "\u7801\u5934\u56F4\u5835", codename: "HARBOR", desc: "\u5B8C\u6574\u53E5\u5B50\u767B\u573A", kind: "sentence", length: 0, thiefSpeed: 6, targetWpm: 36, thiefLead: 18 },
  { id: 7, name: "\u96E8\u591C\u65E0\u7EBF\u7535", codename: "STORM", desc: "\u957F\u8BCD\u4E0E\u590D\u5408\u8BCD", kind: "words", length: 140, thiefSpeed: 6.5, targetWpm: 40, thiefLead: 19 },
  { id: 8, name: "\u5730\u94C1\u672B\u73ED\u8F66", codename: "SUBWAY", desc: "\u53E5\u5B50\u8FDE\u6253,\u4FDD\u6301\u8282\u594F", kind: "sentence", length: 0, thiefSpeed: 7, targetWpm: 44, thiefLead: 20 },
  { id: 9, name: "\u5929\u53F0\u5BF9\u5CD9", codename: "ROOFTOP", desc: "\u6DF7\u5408\u5927\u5C0F\u5199\u4E0E\u6570\u5B57", kind: "mixed", length: 0, thiefSpeed: 7.6, targetWpm: 46, thiefLead: 20 },
  { id: 10, name: "\u8DE8\u6D77\u5927\u6865", codename: "BRIDGE", desc: "\u9AD8\u901F\u957F\u6587\u672C\u51B2\u523A", kind: "words", length: 170, thiefSpeed: 8.2, targetWpm: 50, thiefLead: 21 },
  { id: 11, name: "\u603B\u90E8\u89E3\u5BC6", codename: "CIPHER", desc: "\u7B26\u53F7\u5BC6\u7801\u5168\u6DF7\u5408", kind: "mixed", length: 0, thiefSpeed: 8.8, targetWpm: 54, thiefLead: 22 },
  { id: 12, name: "\u7EC8\u6781\u51B2\u523A", codename: "FINALE", desc: "\u4F20\u5947\u8DD1\u8005\u7684\u8BD5\u70BC", kind: "mixed", length: 0, thiefSpeed: 9.6, targetWpm: 60, thiefLead: 24 }
];
function genLevelText(lv) {
  switch (lv.kind) {
    case "keys":
      return genKeysText(lv.length, lv.id === 1 ? "asdfghjkl" : void 0);
    case "words":
      return genWordsText(lv.length, lv.id >= 7);
    case "sentence":
      return genSentenceText(false);
    case "mixed":
      return genSentenceText(true);
  }
}
export {
  FINGER_ZONES,
  LEVELS,
  genAttackWord,
  genKeysText,
  genLevelText,
  genRainWord,
  genSentenceText,
  genWordsText
};
