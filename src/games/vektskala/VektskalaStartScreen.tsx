import { useState } from 'react';
import type { VektskalaLevel } from './vektskalaTypes';
import styles from './VektskalaStartScreen.module.css';

const COUNT_OPTIONS = [3, 5, 10] as const;

const LEVELS: { value: VektskalaLevel; label: string; desc: string }[] = [
  { value: 'easy',   label: 'Lett',      desc: 'Vektskåla hjelper deg.' },
  { value: 'normal', label: 'Normal',    desc: 'Sett inn tallet.' },
  { value: 'hard',   label: 'Vanskelig', desc: 'Større tall og gange.' },
];

interface Props {
  initialCount?: number;
  initialLevel?: VektskalaLevel;
  onStart: (count: number, level: VektskalaLevel) => void;
}

export default function VektskalaStartScreen({ initialCount = 5, initialLevel = 'easy', onStart }: Props) {
  const [count, setCount] = useState(initialCount);
  const [level, setLevel] = useState<VektskalaLevel>(initialLevel);

  const selectedLevel = LEVELS.find(l => l.value === level)!;

  return (
    <div className={styles.container}>
      <span className={styles.emoji}>⚖️</span>
      <h2 className={styles.heading}>Vektskåla</h2>

      <div className={styles.levelSelector}>
        <p className={styles.selectorLabel}>Nivå:</p>
        <div className={styles.levelButtons}>
          {LEVELS.map(l => (
            <button
              key={l.value}
              className={`${styles.levelBtn} ${level === l.value ? styles.levelBtnActive : ''}`}
              onClick={() => setLevel(l.value)}
              aria-pressed={level === l.value}
            >
              {l.label}
            </button>
          ))}
        </div>
        <p className={styles.levelDesc}>{selectedLevel.desc}</p>
      </div>

      <div className={styles.countSelector}>
        <p className={styles.selectorLabel}>Antall oppgaver:</p>
        <div className={styles.countButtons}>
          {COUNT_OPTIONS.map(n => (
            <button
              key={n}
              className={`${styles.countBtn} ${count === n ? styles.countBtnActive : ''}`}
              onClick={() => setCount(n)}
              aria-pressed={count === n}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <button className={styles.startBtn} onClick={() => onStart(count, level)}>
        Start
      </button>
    </div>
  );
}
