import { useState } from 'react';
import type { Difficulty, MathOperator, TallkaosSettings } from '../../types';
import { getBestTime } from './tallkaosRecords';
import { formatDuration } from '../../utils/time';
import styles from './TallkaosSettingsScreen.module.css';

const CHOICES_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy:   8,
  normal: 12,
  hard:   16,
};

interface Props {
  initialSettings: TallkaosSettings;
  onStart: (settings: TallkaosSettings) => void;
}

const OPERATORS: { value: MathOperator; symbol: string; label: string }[] = [
  { value: 'add',      symbol: '+', label: 'Addisjon'       },
  { value: 'subtract', symbol: '−', label: 'Subtraksjon'    },
  { value: 'multiply', symbol: '×', label: 'Multiplikasjon' },
  { value: 'divide',   symbol: '÷', label: 'Divisjon'       },
];

const QUESTION_COUNTS = [5, 10, 20] as const;

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'easy',   label: 'Lett'       },
  { value: 'normal', label: 'Normal'     },
  { value: 'hard',   label: 'Vanskelig'  },
];

export default function TallkaosSettingsScreen({ initialSettings, onStart }: Props) {
  const [operator, setOperator]           = useState<MathOperator>(initialSettings.operators[0]);
  const [questionCount, setQuestionCount] = useState(initialSettings.questionCount);
  const [difficulty, setDifficulty]       = useState<Difficulty>(initialSettings.difficulty);
  const [soundEnabled, setSoundEnabled]   = useState(initialSettings.soundEnabled);

  const currentSettings: TallkaosSettings = {
    ...initialSettings,
    operators: [operator],
    questionCount,
    difficulty,
    numberOfChoices: CHOICES_BY_DIFFICULTY[difficulty],
    soundEnabled,
  };

  const bestTime = getBestTime(currentSettings);

  function handleStart() {
    onStart(currentSettings);
  }

  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <h2 className={styles.label}>Regneart</h2>
        <div className={styles.operatorGrid}>
          {OPERATORS.map(({ value, symbol, label }) => (
            <button
              key={value}
              className={`${styles.operatorBtn} ${operator === value ? styles.selected : ''}`}
              onClick={() => setOperator(value)}
            >
              <span className={styles.symbol}>{symbol}</span>
              <span className={styles.opLabel}>{label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.label}>Antall oppgaver</h2>
        <div className={styles.row}>
          {QUESTION_COUNTS.map((n) => (
            <button
              key={n}
              className={`${styles.chipBtn} ${questionCount === n ? styles.selected : ''}`}
              onClick={() => setQuestionCount(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.label}>Vanskelighetsgrad</h2>
        <div className={styles.row}>
          {DIFFICULTIES.map(({ value, label }) => (
            <button
              key={value}
              className={`${styles.chipBtn} ${difficulty === value ? styles.selected : ''}`}
              onClick={() => setDifficulty(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.label}>Lyd</h2>
        <div className={styles.row}>
          <button
            className={`${styles.chipBtn} ${soundEnabled ? styles.selected : ''}`}
            onClick={() => setSoundEnabled(true)}
          >
            🔊 På
          </button>
          <button
            className={`${styles.chipBtn} ${!soundEnabled ? styles.selected : ''}`}
            onClick={() => setSoundEnabled(false)}
          >
            🔇 Av
          </button>
        </div>
      </section>

      <p className={styles.bestTimeInfo}>
        {bestTime !== null
          ? `Bestetid: ${formatDuration(bestTime)}`
          : 'Ingen bestetid ennå'}
      </p>

      <button className={styles.startBtn} onClick={handleStart}>
        Start!
      </button>
    </div>
  );
}
