import type { WeaponMode } from '../domain/exploration/types';

let context: AudioContext | undefined;

function audio(): AudioContext | undefined {
  try {
    context ??= new AudioContext();
    if (context.state === 'suspended') void context.resume();
    return context;
  } catch { return undefined; }
}

function tone(ctx: AudioContext, frequency: number, duration: number, volume: number, type: OscillatorType = 'sine', glideTo?: number, delay = 0): void {
  const start = ctx.currentTime + delay;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  if (glideTo) oscillator.frequency.exponentialRampToValueAtTime(glideTo, start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + Math.min(0.025, duration * 0.2));
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

export function playWeaponSound(weapon: WeaponMode): void {
  const ctx = audio();
  if (!ctx) return;
  if (weapon === 'broadside') {
    [0, 0.075, 0.15].forEach((delay, index) => tone(ctx, 155 - index * 12, 0.16, 0.075, 'square', 58, delay));
  } else if (weapon === 'rail') {
    tone(ctx, 720, 0.18, 0.05, 'sine', 1_450);
    tone(ctx, 190, 0.42, 0.105, 'sawtooth', 54, 0.14);
  } else if (weapon === 'torpedo') {
    tone(ctx, 92, 0.52, 0.095, 'sawtooth', 34);
    tone(ctx, 460, 0.19, 0.04, 'triangle', 170, 0.04);
  } else {
    tone(ctx, 240, 0.46, 0.07, 'sine', 720);
    tone(ctx, 480, 0.32, 0.04, 'triangle', 210, 0.08);
  }
}
