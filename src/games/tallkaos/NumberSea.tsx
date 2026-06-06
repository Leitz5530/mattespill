import { memo, useMemo } from 'react';
import type { Difficulty } from '../../types';
import styles from './NumberSea.module.css';

// ── Per-difficulty configs ────────────────────────────────────────────────────

interface TileConfig {
  size:    string; // CSS value for height and min-width
  font:    string; // CSS value for font-size
  padding: string; // CSS value for horizontal padding
}

interface LayoutConfig {
  cols:   number;
  rows:   number;
  jitter: number; // fraction of half-cell used for random offset
}

const TILE: Record<Difficulty, TileConfig> = {
  easy:   { size: 'clamp(72px, 17vw, 92px)',  font: 'clamp(1.5rem, 6.5vw, 2rem)',    padding: 'clamp(16px, 4vw, 24px)'   },
  normal: { size: 'clamp(64px, 14vw, 80px)',  font: 'clamp(1.3rem, 5.5vw, 1.75rem)', padding: 'clamp(14px, 3vw, 20px)'   },
  hard:   { size: 'clamp(56px, 11vw, 70px)',  font: 'clamp(1.1rem, 4.5vw, 1.5rem)',  padding: 'clamp(12px, 2.5vw, 18px)' },
};

// Grid and jitter per difficulty.
// easy  → 3×3 = 9 cells for 8 tiles: wider cells fit the larger bricks.
// normal → 4×3 = 12 cells for 12 tiles.
// hard   → 4×4 = 16 cells for 16 tiles: tighter, jitter reduced to limit overlap.
const LAYOUT: Record<Difficulty, LayoutConfig> = {
  easy:   { cols: 3, rows: 3, jitter: 0.35 },
  normal: { cols: 4, rows: 3, jitter: 0.45 },
  hard:   { cols: 4, rows: 4, jitter: 0.38 },
};

// ── Layout generation ─────────────────────────────────────────────────────────

interface TileLayout {
  left:   number; // % — tile centre X
  top:    number; // % — tile centre Y
  rotate: number; // degrees
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateLayouts(
  count: number,
  maxRotation: number,
  difficulty: Difficulty,
): TileLayout[] {
  const { cols, rows, jitter } = LAYOUT[difficulty];

  // Safe centre range keeps tiles away from container edges
  const L_MIN = 13, L_MAX = 87;
  const T_MIN = 8,  T_MAX = 90;

  const cellW = (L_MAX - L_MIN) / cols;
  const cellH = (T_MAX - T_MIN) / rows;

  const cells: { cx: number; cy: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({
        cx: L_MIN + cellW * c + cellW / 2,
        cy: T_MIN + cellH * r + cellH / 2,
      });
    }
  }

  return shuffle(cells)
    .slice(0, count)
    .map(({ cx, cy }) => ({
      left:   cx + (Math.random() - 0.5) * cellW * jitter,
      top:    cy + (Math.random() - 0.5) * cellH * jitter,
      rotate: (Math.random() * 2 - 1) * maxRotation,
    }));
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  questionKey:  string;
  choices:      number[];
  wrongPresses: ReadonlySet<number>;
  answered:     boolean;
  correctAnswer: number;
  onChoice:     (n: number) => void;
  maxRotation:  number;
  difficulty:   Difficulty;
}

export default memo(function NumberSea({
  questionKey,
  choices,
  wrongPresses,
  answered,
  correctAnswer,
  onChoice,
  maxRotation,
  difficulty,
}: Props) {
  const layouts = useMemo(
    () => generateLayouts(choices.length, maxRotation, difficulty),
    // difficulty and choices.length are stable within a game session;
    // questionKey is the primary trigger for regeneration.
    [questionKey, choices.length, maxRotation, difficulty],
  );

  const tile = TILE[difficulty];

  return (
    <div className={styles.sea} role="group" aria-label="Velg et svar">
      {choices.map((choice, i) => {
        const { left, top, rotate } = layouts[i];
        const isWrong    = wrongPresses.has(choice);
        const isCorrect  = answered && choice === correctAnswer;
        const isDisabled = answered || isWrong;

        return (
          <button
            key={choice}
            aria-label={`Velg ${choice}`}
            className={[
              styles.tile,
              isCorrect ? styles.correct : '',
              isWrong   ? styles.wrong   : '',
            ].join(' ')}
            style={{
              left:      `${left}%`,
              top:       `${top}%`,
              transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
              '--tile-size':    tile.size,
              '--tile-font':    tile.font,
              '--tile-padding': tile.padding,
            } as React.CSSProperties}
            onClick={() => onChoice(choice)}
            disabled={isDisabled}
          >
            {choice}
          </button>
        );
      })}
    </div>
  );
});
