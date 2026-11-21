// Borneo Spot Hunt — all sound effects are WebAudio oscillators.
// No audio files are loaded; mute is a single flag on the state.
let ctx = null;
let muted = false;

export function setMuted(value) {
  muted = !!value;
}

export function isMuted() {
  return muted;
}

function audioCtx() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}

function tone(freq, start, dur, type, vol) {
  if (muted) return;
  const ac = audioCtx();
  if (!ac) return;
  if (ac.state === 'suspended') ac.resume();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + start);
  gain.gain.setValueAtTime(0.0001, ac.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(vol, ac.currentTime + start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + dur);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + dur + 0.05);
}

export function sfxClick() {
  tone(620, 0, 0.07, 'triangle', 0.12);
}

export function sfxCorrect(combo) {
  const base = 520 + Math.min(combo, 8) * 40;
  tone(base, 0, 0.12, 'sine', 0.22);
  tone(base * 1.5, 0.09, 0.18, 'sine', 0.22);
}

export function sfxWrong() {
  tone(180, 0, 0.22, 'sawtooth', 0.14);
  tone(120, 0.05, 0.25, 'sawtooth', 0.12);
}

export function sfxHint() {
  tone(880, 0, 0.1, 'sine', 0.18);
  tone(1174, 0.1, 0.16, 'sine', 0.18);
}

export function sfxWin() {
  [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.13, 0.28, 'triangle', 0.22));
}

export function sfxLose() {
  [392, 330, 262, 196].forEach((f, i) => tone(f, i * 0.16, 0.3, 'triangle', 0.16));
}

export function sfxUnlock() {
  tone(784, 0, 0.12, 'sine', 0.2);
  tone(1046, 0.11, 0.2, 'sine', 0.2);
}
