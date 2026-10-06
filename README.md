# Type Sprint · 打字飞驰

A neon arcade typing trainer that runs entirely in the browser. Four game modes turn boring typing practice into a night-city sprint: escape the chase, shoot down falling words, race a 60-second clock, or drill your finger placement.

**Live demo:** https://keta1930.github.io/type-sprint/

## Game Modes

| Mode | Description |
| --- | --- |
| **Career Escape** (闯关模式) | 12 levels across a neon city. You are the runner up front — every correct keystroke pushes you forward, every typo lets the chaser close in by 1.2 m. Finish the text before getting caught. Earn up to 3 stars per level (clear / ≥96% accuracy / target WPM). |
| **Word Rain** (单词雨防线) | Words fall from the night sky. Type them before they breach the defense line. Golden words score ×3, combos raise the multiplier, endless ramping speed. |
| **Time Attack** (极速 60 秒) | Score as much as you can in 60 seconds. Submit each word with Space; combos stack a ×1–×5 multiplier and any typo resets the streak. |
| **Finger Drill** (指法训练场) | Zone-based practice (home row, top row, bottom row, numbers, full alphabet) with an on-screen keyboard that highlights the next key and tells you which finger to use. |

## Features

- Pixel-art night city rendered on Canvas 2D — three parallax skyline layers, street lamps, moon, sirens, dust and burst particles
- Real-time HUD: WPM, accuracy, distance gap, combo, escape/defense progress
- Synthesized sound effects via WebAudio (no audio assets), mutable
- Cross-platform input: physical keyboards on desktop, system keyboard on mobile
- Fully responsive (desktop ≥1024px and mobile 375–430px)
- Local records: stars, best WPM/scores, total keystrokes (stored in `localStorage`)

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS 3
- Canvas 2D for all game scenes (no image assets)
- WebAudio API for sound

## Run Locally

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build

```bash
npm run build      # outputs static files to dist/
```

The build uses `base: './'`, so `dist/` can be hosted from any sub-path (GitHub Pages project sites included).

## Deployment

This repository ships with a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds the app and publishes `dist/` to GitHub Pages on every push to `main`.

## Notes

- Records live in the browser's `localStorage`; clearing site data or switching devices resets progress.
- Desktop with a physical keyboard gives the best experience; mobile is fully playable via the on-screen/system keyboard.

## License

[MIT](LICENSE)
