import { useState } from 'react';
import styles from './PizzaBrokStartScreen.module.css';

const COUNT_OPTIONS = [3, 5, 10] as const;

interface Props {
  initialCount?: number;
  onStart: (count: number) => void;
}

export default function PizzaBrokStartScreen({ initialCount = 5, onStart }: Props) {
  const [count, setCount] = useState(initialCount);

  return (
    <div className={styles.container}>
      <span className={styles.emoji}>🍕</span>
      <h2 className={styles.heading}>Pizza-brøk</h2>
      <p className={styles.description}>
        Dra pizzastykker til tallerkenen og lag én hel pizza.
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

      <button className={styles.startBtn} onClick={() => onStart(count)}>
        Start
      </button>
    </div>
  );
}
