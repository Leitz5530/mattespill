let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function playTone(
  audioCtx: AudioContext,
  frequency: number,
  type: OscillatorType,
  startTime: number,
  duration: number,
  peakGain: number,
): void {
  try {
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, startTime);
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
  } catch {
    // silently ignore audio errors
  }
}

export function playCorrectSound(soundEnabled: boolean): void {
  if (!soundEnabled) return;
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  playTone(c, 660, 'triangle', t,        0.12, 0.25);
  playTone(c, 880, 'triangle', t + 0.09, 0.18, 0.25);
}

export function playWrongSound(soundEnabled: boolean): void {
  if (!soundEnabled) return;
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  playTone(c, 180, 'sine', t, 0.22, 0.18);
}

// C5 E5 G5 C6
export function playNewRecordSound(soundEnabled: boolean): void {
  if (!soundEnabled) return;
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  [523, 659, 784, 1047].forEach((freq, i) => {
    playTone(c, freq, 'triangle', t + i * 0.10, 0.16, 0.22);
  });
}

export function playRoundCompleteSound(soundEnabled: boolean): void {
  if (!soundEnabled) return;
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  playTone(c, 523, 'triangle', t,        0.14, 0.2);
  playTone(c, 784, 'triangle', t + 0.11, 0.20, 0.2);
}
