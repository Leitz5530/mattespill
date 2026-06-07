import type { PieceType } from './pizzaBrokTypes';

const FRACTION: Record<PieceType, number> = { '1/2': 0.5, '1/3': 1 / 3, '1/4': 0.25 };

// Wedge path: apex at (cx,cy) near the top, arc opens downward.
// Uses "clock angle" system: 0°=up, 180°=straight down.
// The slice is symmetric around 180° (straight down) with ±halfDeg spread.
function wedgePath(cx: number, cy: number, r: number, halfDeg: number): string {
  const safe = Math.min(halfDeg, 89.95); // prevent 180° arc degeneracy
  const toRad = (d: number) => (d * Math.PI) / 180;
  const startClock = 180 - safe;
  const endClock   = 180 + safe;
  const sx = (cx + r * Math.sin(toRad(startClock))).toFixed(2);
  const sy = (cy - r * Math.cos(toRad(startClock))).toFixed(2);
  const ex = (cx + r * Math.sin(toRad(endClock))).toFixed(2);
  const ey = (cy - r * Math.cos(toRad(endClock))).toFixed(2);
  const largeArc = halfDeg * 2 > 180 ? 1 : 0;
  // sweep=1 (CW): arc from right-side endpoint goes through the bottom to left-side endpoint
  return `M ${cx} ${cy} L ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey} Z`;
}

interface Props {
  type: PieceType;
  size?: number;
}

export default function PizzaSlice({ type, size = 80 }: Props) {
  const halfDeg = (FRACTION[type] * 360) / 2;
  const cx = 50, cy = 8;

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      {/* Three concentric sectors: crust → sauce → cheese */}
      <path d={wedgePath(cx, cy, 44, halfDeg)} fill="#b56820" />
      <path d={wedgePath(cx, cy, 37, halfDeg)} fill="#e84040" />
      <path d={wedgePath(cx, cy, 27, halfDeg)} fill="#f5d442" />
      {/* Toppings — on/near the center line so they stay inside even the smallest 1/4 slice */}
      <circle cx="50" cy="22" r="3.5" fill="#c0392b" opacity="0.85" />
      <circle cx="44" cy="34" r="2.8" fill="#c0392b" opacity="0.80" />
      <circle cx="57" cy="37" r="2.5" fill="#c0392b" opacity="0.75" />
    </svg>
  );
}
