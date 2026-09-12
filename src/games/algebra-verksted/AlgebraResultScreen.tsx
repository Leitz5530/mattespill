import type { AlgebraRoundResult } from './algebraTypes';
import styles from './AlgebraResultScreen.module.css';

interface Props {
  result: AlgebraRoundResult;
  onPlayAgain: (count: number) => void;
  onGoHome: () => void;
}

export default function AlgebraResultScreen({ result, onPlayAgain, onGoHome }: Props) {
  const { totalQuestions, solvedClean, hadMistakes } = result;
  const perfectRound = hadMistakes === 0;
  const percent = Math.round((solvedClean / totalQuestions) * 100);

  return (
    <div className={styles.container}>
      <span className={styles.emoji}>{perfectRound ? '🏆' : '⭐'}</span>

      <h2 className={styles.heading}>
        {perfectRound ? 'Perfekt algebra-runde!' : 'Bra jobbet!'}
      </h2>

      <p className={styles.subtext}>
        {perfectRound
          ? 'Du fikk x alene uten feil!'
          : 'Du fikk x alene til slutt.'}
      </p>

      <div className={styles.stats}>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Antall oppgaver</span>
          <span className={styles.statValue}>{totalQuestions}</span>
        </div>
        <div className={styles.statRow}>
          <span className={styles.statLabel}>Uten feilforsøk</span>
          <span className={`${styles.statValue} ${styles.valueCorrect}`}>{solvedClean}</span>
        </div>
        {hadMistakes > 0 && (
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Med feilforsøk</span>
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
