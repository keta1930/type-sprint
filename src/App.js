import { jsx } from "react/jsx-runtime";
import { useState } from "react";
import Home from "./pages/Home.js";
import LevelSelect from "./pages/LevelSelect.js";
import ChaseGame from "./pages/ChaseGame.js";
import WordRain from "./pages/WordRain.js";
import TimeAttack from "./pages/TimeAttack.js";
import FingerPractice from "./pages/FingerPractice.js";
function App() {
  const [screen, setScreen] = useState({ name: "home" });
  switch (screen.name) {
    case "levels":
      return /* @__PURE__ */ jsx(LevelSelect, { onBack: () => setScreen({ name: "home" }), onPick: (lv) => setScreen({ name: "chase", level: lv }) });
    case "chase":
      return /* @__PURE__ */ jsx(
        ChaseGame,
        {
          levelId: screen.level,
          onBack: () => setScreen({ name: "levels" }),
          onNext: (lv) => setScreen({ name: "chase", level: lv })
        },
        screen.level
      );
    case "rain":
      return /* @__PURE__ */ jsx(WordRain, { onBack: () => setScreen({ name: "home" }) });
    case "attack":
      return /* @__PURE__ */ jsx(TimeAttack, { onBack: () => setScreen({ name: "home" }) });
    case "practice":
      return /* @__PURE__ */ jsx(FingerPractice, { onBack: () => setScreen({ name: "home" }) });
    default:
      return /* @__PURE__ */ jsx(Home, { go: setScreen });
  }
}
export {
  App as default
};
