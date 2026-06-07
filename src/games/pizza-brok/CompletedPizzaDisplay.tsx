// Renders a "completed pizza" illustration that matches the target fraction.
// Uses sector paths (SVG arc + center) so all sizes share the same colour layers.

// SVG angle convention: 0° = 3 o'clock, clockwise (matches SVG sweep-flag=1)
function toXY(cx: number, cy: number, r: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function sectorPath(cx: number, cy: number, r: number, startDeg: number, spanDeg: number): string {
  const [sx, sy] = toXY(cx, cy, r, startDeg);
  const endDeg = startDeg + spanDeg;
  const [ex, ey] = toXY(cx, cy, r, endDeg);
  const largeArc = spanDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${sx.toFixed(2)} ${sy.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${ex.toFixed(2)} ${ey.toFixed(2)} Z`;
}

// Half pizza: centre near the top so the half-disc fills the viewBox top-to-mid.
// Sector from 0° (right) → 180° (left) CW, passing through 90° (bottom).
// Visual: flat cut-edge at top (y≈8), rounded crust filling downward.
function HalfPizzaSVG({ size }: { size: number }) {
  const cx = 50, cy = 8;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <path d={sectorPath(cx, cy, 44, 0, 180)} fill="#b56820" />
      <path d={sectorPath(cx, cy, 37, 0, 180)} fill="#e84040" />
      <path d={sectorPath(cx, cy, 26, 0, 180)} fill="#f5d442" />
      {/* toppings verified inside cheese layer and within bottom semicircle */}
      <circle cx="50" cy="28" r="3"   fill="#c0392b" opacity="0.85" />
      <circle cx="36" cy="26" r="2.8" fill="#c0392b" opacity="0.80" />
      <circle cx="64" cy="26" r="2.8" fill="#c0392b" opacity="0.80" />
    </svg>
  );
}

// Three-quarters pizza: centre at (50,50), sector from 0°→270° CW.
// Missing wedge is the top-right quarter (270°→360°).
function ThreeQuartersPizzaSVG({ size }: { size: number }) {
  const cx = 50, cy = 50;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <path d={sectorPath(cx, cy, 44, 0, 270)} fill="#b56820" />
      <path d={sectorPath(cx, cy, 37, 0, 270)} fill="#e84040" />
      <path d={sectorPath(cx, cy, 26, 0, 270)} fill="#f5d442" />
      {/* toppings avoid the missing top-right quadrant (SVG angle 270°–360°) */}
      <circle cx="38" cy="44" r="3"   fill="#c0392b" opacity="0.85" />
      <circle cx="50" cy="62" r="3"   fill="#c0392b" opacity="0.85" />
      <circle cx="36" cy="57" r="2.8" fill="#c0392b" opacity="0.80" />
      <circle cx="64" cy="58" r="2.8" fill="#c0392b" opacity="0.80" />
      <circle cx="40" cy="34" r="2.5" fill="#c0392b" opacity="0.75" />
    </svg>
  );
}

// Whole pizza: full circles + cross-cut lines.
function WholePizzaSVG({ size }: { size: number }) {
  const cx = 50, cy = 50, r = 44;
  const cuts = [0, 45, 90, 135];
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <circle cx={cx} cy={cy} r={r}      fill="#b56820" />
      <circle cx={cx} cy={cy} r={r - 7}  fill="#e84040" />
      <circle cx={cx} cy={cy} r={r - 18} fill="#f5d442" />
      {cuts.map(deg => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line
            key={deg}
            x1={(cx + r * Math.sin(rad)).toFixed(1)}
            y1={(cy - r * Math.cos(rad)).toFixed(1)}
            x2={(cx - r * Math.sin(rad)).toFixed(1)}
            y2={(cy + r * Math.cos(rad)).toFixed(1)}
            stroke="#b56820"
            strokeWidth="1.5"
            opacity="0.65"
          />
        );
      })}
      <circle cx="50" cy="34" r="3"   fill="#c0392b" opacity="0.85" />
      <circle cx="38" cy="44" r="2.8" fill="#c0392b" opacity="0.80" />
      <circle cx="63" cy="42" r="2.5" fill="#c0392b" opacity="0.80" />
      <circle cx="50" cy="62" r="3"   fill="#c0392b" opacity="0.85" />
      <circle cx="36" cy="57" r="2.5" fill="#c0392b" opacity="0.75" />
      <circle cx="64" cy="58" r="2.8" fill="#c0392b" opacity="0.80" />
    </svg>
  );
}

interface Props {
  targetAmount: number;  // 6=half, 9=¾, 12=whole, 24=two-whole
  size?: number;
}

export default function CompletedPizzaDisplay({ targetAmount, size = 128 }: Props) {
  if (targetAmount === 6)  return <HalfPizzaSVG size={size} />;
  if (targetAmount === 9)  return <ThreeQuartersPizzaSVG size={size} />;
  if (targetAmount === 24) {
    const pairSize = Math.round(size * 0.7);
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
        <WholePizzaSVG size={pairSize} />
        <WholePizzaSVG size={pairSize} />
      </div>
    );
  }
  return <WholePizzaSVG size={size} />;
}
