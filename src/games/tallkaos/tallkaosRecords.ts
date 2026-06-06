import type { TallkaosSettings } from '../../types';

export function getBestTimeKey(settings: TallkaosSettings): string {
  return `tallkaos:bestTime:${settings.operators[0]}:${settings.questionCount}:${settings.difficulty}`;
}

export function getBestTime(settings: TallkaosSettings): number | null {
  const raw = localStorage.getItem(getBestTimeKey(settings));
  if (raw === null) return null;
  const parsed = Number(raw);
  return isNaN(parsed) ? null : parsed;
}

export function saveBestTime(settings: TallkaosSettings, durationMs: number): void {
  localStorage.setItem(getBestTimeKey(settings), String(durationMs));
}
