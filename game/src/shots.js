// Borneo Spot Hunt — deterministic screenshot staging.
// ?shot=1..4&seed=1 freezes the game in the exact frame each screenshot
// needs, so the cover and the other shots are reproducible byte for byte
// in spirit (same state, same seed) on every run.
import { GAME } from './config.js';

// Staging is pure state: no timers tick and no randomness is involved.
export function applyShot(state, shot) {
  state.shotMode = true;
  state.now = 1200; // fixed clock so the hint pulse never moves
  if (shot === '1') {
    // Cover: Level 1 mid-play, 3 of 7 found, SISA: 4, timer running.
    state.screen = 'play';
    state.level = 0;
    state.found = new Set([0, 2, 4]);
    state.score = 375;
    state.combo = 3;
    state.bestCombo = 3;
    state.mistakes = 0;
    state.hintsLeft = 3;
    state.timeLeft = 62;
    state.hintDiff = null;
    state.wrongMarks = [];
    state.lastNote = '✓ Burung di langit ketemu!  •  ✓ Jamur di dahan ketemu!';
  } else if (shot === '2') {
    // Level map: 8 scenes, stars earned on the first four levels.
    state.screen = 'map';
    state.progress = {
      unlocked: 5,
      stars: { 0: 3, 1: 2, 2: 3, 3: 1 },
      best: 4860,
    };
    state.totalScore = 4860;
  } else if (shot === '3') {
    // Another scene mid-play: coral reef, 2 found, markers elsewhere.
    state.screen = 'play';
    state.level = 5;
    state.found = new Set([0, 5]);
    state.score = 210;
    state.combo = 2;
    state.bestCombo = 2;
    state.mistakes = 1;
    state.hintsLeft = 2;
    state.timeLeft = 48;
    state.hintDiff = 3;
    state.wrongMarks = [];
    state.lastNote = '✓ Ikan kuning ketemu!  •  HINT: lihat dekat penyu…';
  } else if (shot === '4') {
    // Level complete with 3 stars and a score.
    state.screen = 'leveldone';
    state.level = 0;
    state.found = new Set([0, 1, 2, 3, 4, 5, 6]);
    state.score = 1240;
    state.levelScore = 1240;
    state.timeBonus = 620;
    state.timeLeft = 62;
    state.mistakes = 0;
    state.starsEarned = 3;
    state.totalScore = 1240;
    state.hintsLeft = 3;
    state.wrongMarks = [];
  }
  state.timeLimit = GAME.timeLimit;
}
