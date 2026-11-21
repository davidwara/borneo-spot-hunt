// Borneo Spot Hunt — bootstrap, game state, scoring and the main loop.
// ?shot=1..4 stages a deterministic frame for screenshots and freezes the
// timer; without it the game runs interactively.
import { GAME, starsFor } from './config.js';
import { SCENES } from './scenes.js';
import { render } from './render.js';
import { attachInput } from './input.js';
import { applyShot } from './shots.js';
import { sfxCorrect, sfxWrong, sfxHint, sfxWin, sfxLose, sfxUnlock, setMuted } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

function defaultProgress() {
  return { unlocked: 1, stars: {}, best: 0 };
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(GAME.storageKey);
    if (!raw) return defaultProgress();
    const p = JSON.parse(raw);
    if (!p || typeof p.unlocked !== 'number') return defaultProgress();
    p.stars = p.stars || {};
    p.best = p.best || 0;
    return p;
  } catch {
    return defaultProgress();
  }
}

function saveProgress(state) {
  try {
    localStorage.setItem(GAME.storageKey, JSON.stringify(state.progress));
  } catch {
    // storage unavailable (private mode): progress just does not persist
  }
}

const state = {
  screen: 'title',
  level: 0,
  found: new Set(),
  score: 0,
  totalScore: 0,
  combo: 0,
  bestCombo: 0,
  mistakes: 0,
  hintsLeft: GAME.hintsPerLevel,
  timeLeft: GAME.timeLimit,
  timeLimit: GAME.timeLimit,
  muted: false,
  hintDiff: null,
  hintUntil: 0,
  wrongMarks: [],
  lastNote: '',
  starsEarned: 0,
  levelScore: 0,
  timeBonus: 0,
  progress: loadProgress(),
  now: 0,
  shotMode: false,
  titleButtons: [],
  hudButtons: [],
  mapCards: [],
};

function setStatus() {
  if (!statusEl) return;
  const scene = SCENES[state.level];
  if (state.screen === 'play') {
    statusEl.textContent = 'Level ' + (state.level + 1) + ': ' + scene.name +
      ' — ditemukan ' + state.found.size + ' dari 7, sisa ' + (7 - state.found.size) +
      ', waktu ' + Math.ceil(state.timeLeft) + ' detik, skor ' + state.score + '.';
  } else if (state.screen === 'title') {
    statusEl.textContent = 'Borneo Spot Hunt — cari 7 perbedaan di setiap scene Borneo. Tekan Main untuk mulai.';
  } else if (state.screen === 'map') {
    statusEl.textContent = 'Peta level — ' + state.progress.unlocked + ' dari 8 level terbuka.';
  } else if (state.screen === 'leveldone') {
    statusEl.textContent = 'Level selesai dengan ' + state.starsEarned + ' bintang, skor level ' + state.levelScore + '.';
  } else if (state.screen === 'gameover') {
    statusEl.textContent = 'Waktu habis. Kamu menemukan ' + state.found.size + ' dari 7 perbedaan.';
  } else if (state.screen === 'win') {
    statusEl.textContent = 'Semua 8 level selesai! Total skor ' + state.totalScore + '.';
  }
}

const api = {
  state,
  startLevel(level) {
    state.level = level;
    state.found = new Set();
    state.score = 0;
    state.combo = 0;
    state.bestCombo = 0;
    state.mistakes = 0;
    state.hintsLeft = GAME.hintsPerLevel;
    state.timeLeft = GAME.timeLimit;
    state.hintDiff = null;
    state.wrongMarks = [];
    state.lastNote = 'Level ' + (level + 1) + ': ' + SCENES[level].name + ' — cari 7 perbedaan!';
    state.screen = 'play';
    setStatus();
  },
  selectLevel(level) {
    if (level < state.progress.unlocked) api.startLevel(level);
  },
  foundDiff(i) {
    const scene = SCENES[state.level];
    if (state.found.has(i) || state.screen !== 'play') return;
    state.found.add(i);
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    const gained = GAME.basePoints + GAME.comboBonus * (state.combo - 1);
    state.score += gained;
    state.lastNote = '✓ ' + scene.diffs[i].note + '  (+' + gained + ')';
    state.hintDiff = null;
    sfxCorrect(state.combo);
    if (state.found.size >= GAME.diffsPerLevel) api.finishLevel();
    setStatus();
  },
  wrongClick(side, relX, relY) {
    if (state.screen !== 'play') return;
    state.mistakes += 1;
    state.combo = 0;
    state.timeLeft = Math.max(0, state.timeLeft - GAME.wrongPenalty);
    state.wrongMarks.push({ side, x: relX, y: relY, life: 1 });
    state.lastNote = '✗ Bukan itu — waktu −' + GAME.wrongPenalty + ' detik!';
    sfxWrong();
    if (state.timeLeft <= 0) api.timeUp();
    setStatus();
  },
  useHint() {
    if (state.screen !== 'play') return;
    if (state.hintsLeft <= 0) {
      state.lastNote = 'Hint habis! Selesaikan dengan matamu sendiri.';
      return;
    }
    const scene = SCENES[state.level];
    const remaining = scene.diffs.map((d, i) => i).filter((i) => !state.found.has(i));
    if (remaining.length === 0) return;
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    state.hintDiff = pick;
    state.hintUntil = state.now + 3000;
    state.hintsLeft -= 1;
    state.score = Math.max(0, state.score - GAME.hintCost);
    state.lastNote = '💡 Hint: lihat di sekitar ' + scene.diffs[pick].note.toLowerCase() + '  (−' + GAME.hintCost + ' poin)';
    sfxHint();
    setStatus();
  },
  restartLevel() {
    api.startLevel(state.level);
  },
  pauseGame() {
    if (state.screen === 'play') state.screen = 'pause';
    setStatus();
  },
  resumeGame() {
    if (state.screen === 'pause') state.screen = 'play';
    setStatus();
  },
  toggleMute() {
    state.muted = !state.muted;
    setMuted(state.muted);
  },
  finishLevel() {
    const timeBonus = Math.round(state.timeLeft) * GAME.timeBonusPerSecond;
    state.timeBonus = timeBonus;
    state.levelScore = state.score + timeBonus;
    state.starsEarned = starsFor(state.timeLeft, state.mistakes);
    state.totalScore += state.levelScore;
    const prev = state.progress.stars[state.level] || 0;
    state.progress.stars[state.level] = Math.max(prev, state.starsEarned);
    if (state.level + 1 < 8 && state.progress.unlocked <= state.level + 1) {
      state.progress.unlocked = state.level + 2;
      sfxUnlock();
    }
    state.progress.best = Math.max(state.progress.best, state.totalScore);
    saveProgress(state);
    state.screen = 'leveldone';
    sfxWin();
    setStatus();
  },
  timeUp() {
    state.screen = 'gameover';
    state.combo = 0;
    sfxLose();
    setStatus();
  },
  nextLevel() {
    if (state.level >= 7) {
      state.screen = 'win';
      setStatus();
      return;
    }
    api.startLevel(state.level + 1);
  },
};

attachInput(canvas, api);

// Test hook for automated play-testing (headless Chrome): exposes the live
// state and actions so a driver can click diffs and assert transitions.
window.__borneo = { state, api };

let lastTs = 0;
function frame(ts) {
  const dt = lastTs ? Math.min(0.1, (ts - lastTs) / 1000) : 0;
  lastTs = ts;
  state.now = ts;
  if (!state.shotMode) {
    if (state.screen === 'play') {
      state.timeLeft -= dt;
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        api.timeUp();
      }
    }
    if (state.hintDiff !== null && ts > state.hintUntil) state.hintDiff = null;
    state.wrongMarks.forEach((m) => { m.life -= dt * 0.7; });
    state.wrongMarks = state.wrongMarks.filter((m) => m.life > 0);
  }
  render(ctx, state);
  requestAnimationFrame(frame);
}

// Screenshot staging: freeze the exact frame the shot needs.
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  applyShot(state, shot);
  setStatus();
  render(ctx, state);
  document.title = 'Borneo Spot Hunt — shot ' + shot;
  window.__shotReady = true;
} else {
  setStatus();
  requestAnimationFrame(frame);
}
