const wpmOf = (correct, elapsedSec) => elapsedSec > 0 ? Math.round(correct / 5 / (elapsedSec / 60)) : 0;
const accOf = (correct, wrong) => correct + wrong === 0 ? 100 : Math.round(correct / (correct + wrong) * 100);
export {
  accOf,
  wpmOf
};
