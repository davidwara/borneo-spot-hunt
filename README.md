# Borneo Spot Hunt

[![make.fun bounty](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![make.fun rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/davidwara/borneo-spot-hunt/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![make.fun reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/davidwara/borneo-spot-hunt/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

A complete, original spot-the-difference game set in Borneo. Two
near-identical pictures sit side by side — left is the original, right is
changed. Find all 7 differences in each scene before the 90-second timer
runs out. Every scene is drawn procedurally with Canvas 2D vector art;
there are no image or audio files, and all sound is WebAudio.

## How to play

- Click (or tap) a difference on either panel — left or right, both count.
- Find all **7 differences** to finish a level and unlock the next one.
- Correct finds in a row build a **combo** that raises your score.
- A wrong click costs **5 seconds** and resets your combo.
- **Hint (H)** pulses a ring around one difference you have not found yet
  (3 per level, −50 points each).
- Finish fast and clean for **1–3 stars** per level; progress, stars and
  your best score are saved in localStorage.

## Controls

| Input | Action |
|---|---|
| Click / tap | Find a difference (either panel) |
| H | Hint |
| R | Restart level |
| M | Mute / unmute sound |
| Esc | Pause / menu |
| 1–8 | Pick a level from the map |

## Scenes

1. **Kanopi Hutan Hujan** — proboscis monkey in the rainforest canopy
2. **Pasar Terapung** — floating market boats and fruit
3. **Perahu Klotok** — a klotok boat on the Barito river
4. **Api Unggun Malam** — campfire under the stars
5. **Suaka Orangutan** — morning feeding at the sanctuary
6. **Terumbu Karang** — diving the Derawan reef
7. **Festival Rumah Panjang** — Dayak longhouse festival
8. **Matahari Terbit Pegunungan** — sunrise over the Meratus mountains

Each scene has 7 differences: missing objects, colour changes, added
objects, moved objects, size changes, missing shadows and pattern changes.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network requests — static files under `game/` only.
Screenshots are staged deterministically with `?shot=1..4&seed=1`
(see `shots.json`).

## Entry

Built for the make.fun bounty
[best-spot-the-difference-game-20261121-0451](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451).
