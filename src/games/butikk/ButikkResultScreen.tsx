import type { ButikkRoundResult } from './butikkTypes';
import styles from './ButikkResultScreen.module.css';

interface Props {
  result: ButikkRoundResult;
  onPlayAgain: (count: number) => void;
  onGoHome: () => void;
}

const LEVEL_LABELS: Record<string, string> = {
  easy: 'Lett',
  normal: 'Normal',
  hard: 'Vanskelig',
};

export default function ButikkResultScreen({ result, onPlayAgain, onGoHome }: Props) {
  const { totalQuestions, firstTryCorrect, hadMistakes, level } = result;
  const perfectRound = hadMistakes === 0;
  const percent = Math.round((firstTryCorrect / totalQuestions) * 100);

  return (
    <div className={styles.container}>
      <span className={styles.emoji}>{perfectRound ? '🏆' : '⭐'}</span>

      <h2 className={styles.heading}>
        {perfectRound ? 'Perfekt handletur!' : 'Bra jobbet!'}
      </h2>

      <p className={styles.subtext}>
        {perfectRound
          ? 'Alle riktige på første forsøk!'
          : 'Du fant riktig betaling til slutt.'}
      </p>

      <div className={styles.stats}>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Nivå</span>
          <span className={`${styles.statValue} ${styles.valueLevel}`}>{LEVEL_LABELS[level]}</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Antall oppgaver</span>
          <span className={styles.statValue}>{totalQuestions}</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Riktig på første forsøk</span>
          <span className={`${styles.statValue} ${styles.valueCorrect}`}>{firstTryCorrect}</span>
        </div>
        {hadMistakes > 0 && (
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Trengte flere forsøk</span>
            <span className={`${styles.statValue} ${styles.valueMistake}`}>{hadMistakes}</span>
          </div>
        )}
        <div className={`${styles.statRow} ${styles.statRowTotal}`}>
          <span className={styles.statLabel}>Treffprosent</span>
          <span className={`${styles.statValue} ${styles.valuePercent}`}>{percent} %</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.playAgainBtn} onClick={() => onPlayAgain(totalQuestions)}>
          Spill igjen
        </button>
        <button className={styles.homeBtn} onClick={onGoHome}>
          Hovedmeny
        </button>
      </div>
    </div>
  );
}
