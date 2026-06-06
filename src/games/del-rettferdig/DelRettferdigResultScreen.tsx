import type { RoundResult } from './fairShareTypes';
import styles from './DelRettferdigResultScreen.module.css';

interface Props {
  result: RoundResult;
  onPlayAgain: (count: number) => void;
  onGoHome: () => void;
}

export default function DelRettferdigResultScreen({ result, onPlayAgain, onGoHome }: Props) {
  const { totalQuestions, firstTryCorrect, hadMistakes } = result;
  const perfectRound = hadMistakes === 0;
  const percent = Math.round((firstTryCorrect / totalQuestions) * 100);

  return (
    <div className={styles.container}>
      <span className={styles.emoji}>{perfectRound ? '🏆' : '⭐'}</span>

      <h2 className={styles.heading}>
        {perfectRound ? 'Perfekt runde!' : 'Bra jobbet!'}
      </h2>

      <p className={styles.subtext}>
        {perfectRound
          ? 'Alle riktige på første forsøk!'
          : 'Du løste alle oppgavene til slutt.'}
      </p>

      <div className={styles.stats}>
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
          <span className={styles.statLabel}>Perfekte</span>
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
