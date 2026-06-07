import { useState } from 'react';
import type { ButikkLevel } from './butikkTypes';
import styles from './ButikkStartScreen.module.css';

interface Props {
  initialCount?: number;
  initialLevel?: ButikkLevel;
  onStart: (count: number, level: ButikkLevel) => void;
}

const COUNT_OPTIONS = [3, 5, 10];

const LEVEL_OPTIONS: { value: ButikkLevel; label: string; description: string }[] = [
  { value: 'easy',   label: 'Lett',       description: 'Én vare og lave priser.' },
  { value: 'normal', label: 'Normal',     description: 'Litt høyere priser, noen ganger to varer.' },
  { value: 'hard',   label: 'Vanskelig', description: 'Flere varer og høyere priser.' },
];

export default function ButikkStartScreen({ initialCount = 5, initialLevel = 'easy', onStart }: Props) {
  const [count, setCount] = useState(initialCount);
  const [level, setLevel] = useState<ButikkLevel>(initialLevel);

  const currentLevelOption = LEVEL_OPTIONS.find(o => o.value === level)!;

  return (
    <div className={styles.container}>
      <span className={styles.emoji}>🛒</span>
      <h2 className={styles.heading}>Butikk</h2>
      <p className={styles.description}>
        Velg penger som passer til prisen.
      </p>

      <div className={styles.countSelector}>
        <p className={styles.countLabel}>Antall oppgaver:</p>
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

      <div className={styles.levelSelector}>
        <p className={styles.levelLabel}>Vanskelighetsgrad:</p>
        <div className={styles.levelButtons}>
          {LEVEL_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`${styles.levelBtn} ${level === opt.value ? styles.levelBtnActive : ''}`}
              onClick={() => setLevel(opt.value)}
              aria-pressed={level === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className={styles.levelDescription}>{currentLevelOption.description}</p>
      </div>

      <button className={styles.startBtn} onClick={() => onStart(count, level)}>
        Start
      </button>
    </div>
  );
}
