const KEY = "ttz-records-v1";
const DEFAULTS = {
  unlockedLevel: 1,
  levels: {},
  rainBest: 0,
  attackBest: 0,
  attackBestWpm: 0,
  practiceSessions: 0,
  totalKeys: 0
};
function loadRecords() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}
function saveRecords(r) {
  try {
    localStorage.setItem(KEY, JSON.stringify(r));
  } catch {
  }
}
export {
  loadRecords,
  saveRecords
};
