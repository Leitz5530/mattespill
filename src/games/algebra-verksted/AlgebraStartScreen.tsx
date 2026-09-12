import { useState } from 'react';
import styles from './AlgebraStartScreen.module.css';

interface Props {
  initialCount?: number;
  onStart: (count: number) => void;
}

const COUNT_OPTIONS = [3, 5, 10];

export default function AlgebraStartScreen({ initialCount = 5, onStart }: Props) {
  const [count, setCount] = useState(initialCount);

  return (
    <div className={styles.container}>
      <span className={styles.emoji}>🧮</span>
      <h2 className={styles.heading}>Algebra-verksted</h2>
      <p className={styles.description}>
        Flytt ledd og del begge sider for å få x alene.
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
