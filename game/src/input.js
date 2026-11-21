// Borneo Spot Hunt — pointer (click/tap on either panel) and keyboard.
// A click on a panel is converted to relative panel coordinates and
// hit-tested against the scene's unfound differences.
import { GAME } from './config.js';
import { SCENES } from './scenes.js';
import { sfxClick } from './audio.js';

function inRect(x, y, r) {
  return r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function canvasPos(canvas, ev) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = GAME.width / rect.width;
  const scaleY = GAME.height / rect.height;
  return { x: (ev.clientX - rect.left) * scaleX, y: (ev.clientY - rect.top) * scaleY };
}

function panelAt(x, y) {
  if (y < GAME.panelY || y > GAME.panelY + GAME.panelHeight) return null;
  if (x >= GAME.leftX && x <= GAME.leftX + GAME.panelWidth) return 0;
  if (x >= GAME.rightX && x <= GAME.rightX + GAME.panelWidth) return 1;
  return null;
}

export function attachInput(canvas, api) {
  canvas.addEventListener('pointerdown', (ev) => {
    const pos = canvasPos(canvas, ev);
    handleClick(pos.x, pos.y, api);
  });

  window.addEventListener('keydown', (ev) => {
    const key = ev.key.toLowerCase();
    const state = api.state;
    if (key === 'm') { api.toggleMute(); return; }
    if (key === 'escape') {
      if (state.screen === 'play') api.pauseGame();
      else if (state.screen === 'pause') api.resumeGame();
      else if (state.screen === 'how') state.screen = 'title';
      else if (state.screen === 'map') state.screen = 'title';
      return;
    }
    if (key >= '1' && key <= '8') {
      const level = Number(key) - 1;
      if (state.screen === 'map' || state.screen === 'title') api.selectLevel(level);
      return;
    }
    if (state.screen !== 'play') return;
    if (key === 'h') api.useHint();
    if (key === 'r') api.restartLevel();
  });
}

function handleClick(x, y, api) {
  const state = api.state;
  sfxClick();
  if (state.screen === 'title') {
    for (const b of state.titleButtons || []) {
      if (inRect(x, y, b)) {
        if (b.id === 'play') api.startLevel(Math.min(state.progress.unlocked - 1, 7));
        if (b.id === 'map') state.screen = 'map';
        if (b.id === 'how') state.screen = 'how';
        return;
      }
    }
    return;
  }
  if (state.screen === 'how') {
    if (inRect(x, y, state.howButton)) state.screen = 'title';
    return;
  }
  if (state.screen === 'map') {
    if (inRect(x, y, state.mapBack)) { state.screen = 'title'; return; }
    for (const c of state.mapCards || []) {
      if (inRect(x, y, c) && !c.locked) api.startLevel(c.level);
    }
    return;
  }
  if (state.screen === 'pause') {
    for (const b of state.pauseButtons || []) {
      if (!inRect(x, y, b)) continue;
      if (b.id === 'resume') api.resumeGame();
      if (b.id === 'restart') api.restartLevel();
      if (b.id === 'map') { state.screen = 'map'; }
      return;
    }
    return;
  }
  if (state.screen === 'leveldone') {
    for (const b of state.doneButtons || []) {
      if (!inRect(x, y, b)) continue;
      if (b.id === 'replay') api.restartLevel();
      if (b.id === 'next') api.nextLevel();
      if (b.id === 'map') state.screen = 'map';
      return;
    }
    return;
  }
  if (state.screen === 'gameover') {
    for (const b of state.overButtons || []) {
      if (!inRect(x, y, b)) continue;
      if (b.id === 'retry') api.restartLevel();
      if (b.id === 'map') state.screen = 'map';
      return;
    }
    return;
  }
  if (state.screen === 'win') {
    for (const b of state.winButtons || []) {
      if (!inRect(x, y, b)) continue;
      if (b.id === 'again') { state.totalScore = 0; api.startLevel(0); }
      if (b.id === 'map') state.screen = 'map';
      return;
    }
    return;
  }
  if (state.screen !== 'play') return;
  // HUD buttons first
  for (const b of state.hudButtons || []) {
    if (!inRect(x, y, b)) continue;
    if (b.id === 'hint') api.useHint();
    if (b.id === 'pause') api.pauseGame();
    if (b.id === 'mute') api.toggleMute();
    if (b.id === 'menu') state.screen = 'map';
    return;
  }
  // panel click: hit-test differences
  const side = panelAt(x, y);
  if (side === null) return;
  const px = side === 0 ? GAME.leftX : GAME.rightX;
  const relX = (x - px) / GAME.panelWidth;
  const relY = (y - GAME.panelY) / GAME.panelHeight;
  const scene = SCENES[state.level];
  let best = -1;
  let bestDist = Infinity;
  scene.diffs.forEach((d, i) => {
    if (state.found.has(i)) return;
    const dx = (relX - d.x) * GAME.panelWidth;
    const dy = (relY - d.y) * GAME.panelHeight;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < d.r + 14 && dist < bestDist) { best = i; bestDist = dist; }
  });
  if (best >= 0) api.foundDiff(best);
  else api.wrongClick(side, relX, relY);
}
