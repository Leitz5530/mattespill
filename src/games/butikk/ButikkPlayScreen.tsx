import { useState } from 'react';
import { generateButikkTask } from './butikkGenerator';
import type { ButikkLevel, ButikkTask, ButikkRoundResult } from './butikkTypes';
import styles from './ButikkPlayScreen.module.css';

const COIN_DENOMS = new Set([1, 5, 10, 20]);

type Feedback = 'none' | 'correct' | 'tooLow' | 'tooHigh' | 'empty';

interface Props {
  totalQuestions: number;
  level: ButikkLevel;
  onRoundComplete: (result: ButikkRoundResult) => void;
}

export default function ButikkPlayScreen({ totalQuestions, level, onRoundComplete }: Props) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [recentTotals, setRecentTotals] = useState<number[]>([]);
  const [task, setTask] = useState<ButikkTask>(() => generateButikkTask(level));
  const [selectedCoins, setSelectedCoins] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<Feedback>('none');
  const [hadMistakeOnCurrent, setHadMistakeOnCurrent] = useState(false);
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [hadMistakesCount, setHadMistakesCount] = useState(0);

  const selectedSum = selectedCoins.reduce((a, b) => a + b, 0);
  const isLastQuestion = questionIndex + 1 >= totalQuestions;
  const isCorrect = feedback === 'correct';
  const multiItem = task.items.length > 1;

  function addCoin(denom: number) {
    if (isCorrect) return;
    setSelectedCoins(prev => [...prev, denom]);
    setFeedback('none');
  }

  function removeCoin(index: number) {
    if (isCorrect) return;
    setSelectedCoins(prev => prev.filter((_, i) => i !== index));
    setFeedback('none');
  }

  function checkPayment() {
    if (selectedCoins.length === 0) {
      setFeedback('empty');
      return;
    }
    if (selectedSum === task.totalPrice) {
      setFeedback('correct');
    } else {
      if (!hadMistakeOnCurrent) setHadMistakeOnCurrent(true);
      setFeedback(selectedSum < task.totalPrice ? 'tooLow' : 'tooHigh');
    }
  }

  function handleNextQuestion() {
    const newFirstTry = firstTryCorrect + (hadMistakeOnCurrent ? 0 : 1);
    const newHadMistakes = hadMistakesCount + (hadMistakeOnCurrent ? 1 : 0);

    if (isLastQuestion) {
      onRoundComplete({ totalQuestions, firstTryCorrect: newFirstTry, hadMistakes: newHadMistakes, level });
      return;
    }

    const newRecentTotals = [...recentTotals, task.totalPrice].slice(-3);
    setRecentTotals(newRecentTotals);
    setTask(generateButikkTask(level, newRecentTotals));
    setQuestionIndex(prev => prev + 1);
    setFirstTryCorrect(newFirstTry);
    setHadMistakesCount(newHadMistakes);
    setHadMistakeOnCurrent(false);
    setSelectedCoins([]);
    setFeedback('none');
  }

  function dotClass(i: number) {
    if (i < questionIndex) return styles.dotDone;
    if (i === questionIndex) return hadMistakeOnCurrent ? styles.dotCurrentMistake : styles.dotCurrent;
    return styles.dotFuture;
  }

  return (
    <div className={styles.container}>
      {/* Progress */}
      <div className={styles.progress}>
        <div className={styles.progressDots}>
          {Array.from({ length: totalQuestions }, (_, i) => (
            <span key={i} className={`${styles.dot} ${dotClass(i)}`} />
          ))}
        </div>
        <div className={styles.progressCounts}>
          {firstTryCorrect > 0 && <span className={styles.correctCount}>✓ {firstTryCorrect}</span>}
          {hadMistakesCount > 0 && <span className={styles.mistakeCount}>~ {hadMistakesCount}</span>}
        </div>
        <p className={styles.progressText}>Oppgave {questionIndex + 1} av {totalQuestions}</p>
      </div>

      {/* Item display */}
      {multiItem ? (
        <div className={styles.shopList}>
          <p className={styles.shopListTitle}>Handleliste</p>
          {task.items.map((item, i) => (
            <div key={i} className={styles.shopListRow}>
              <span className={styles.shopListEmoji}>{item.emoji}</span>
              <span className={styles.shopListName}>{item.name}</span>
              <span className={styles.shopListPrice}>{item.price} kr</span>
            </div>
          ))}
          <p className={styles.shopListHint}>Tell sammen varene og betal riktig.</p>
        </div>
      ) : (
        <div className={styles.itemCard}>
          <span className={styles.itemEmoji}>{task.items[0].emoji}</span>
          <p className={styles.itemName}>{task.items[0].name}</p>
          <p className={styles.itemPrice}>{task.totalPrice} kr</p>
        </div>
      )}

      {/* Payment area */}
      <div className={styles.paymentArea}>
        <p className={styles.paymentLabel}>Du har valgt:</p>
        <div className={styles.selectedCoins}>
          {selectedCoins.length === 0 ? (
            <span className={styles.emptyPayment}>Trykk på penger for å betale.</span>
          ) : (
            selectedCoins.map((denom, i) => (
              <button
                key={i}
                className={`${styles.selectedCoin} ${COIN_DENOMS.has(denom) ? styles.selectedIsCoin : styles.selectedIsNote}`}
                onClick={() => removeCoin(i)}
                aria-label={`Fjern ${denom} kr`}
                disabled={isCorrect}
              >
                {denom} kr
              </button>
            ))
          )}
        </div>
      </div>

      {/* Available money */}
      <div className={styles.moneyArea}>
        <p className={styles.moneyLabel}>Velg penger:</p>
        <div className={styles.moneyGrid}>
          {task.availableDenominations.map(denom => (
            <button
              key={denom}
              className={`${styles.moneyBtn} ${COIN_DENOMS.has(denom) ? styles.moneyCoin : styles.moneyNote}`}
              onClick={() => addCoin(denom)}
              aria-label={`Legg til ${denom} kr`}
              disabled={isCorrect}
            >
              {denom}<span className={styles.krLabel}>kr</span>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        {feedback === 'none' && (
          <button className={styles.checkBtn} onClick={checkPayment}>
            Sjekk betaling ✓
          </button>
        )}

        {(feedback === 'empty' || feedback === 'tooLow' || feedback === 'tooHigh') && (
          <div className={styles.feedbackWrong}>
            <p className={styles.feedbackText}>
              {feedback === 'empty'   && 'Velg penger først.'}
              {feedback === 'tooLow'  && 'Du trenger litt mer penger. 💰'}
              {feedback === 'tooHigh' && 'Du har valgt litt for mye. 🤔'}
            </p>
            <button className={styles.retryBtn} onClick={() => setFeedback('none')}>
              Prøv igjen
            </button>
          </div>
        )}

        {feedback === 'correct' && (
          <div className={styles.feedbackCorrect}>
            <p className={styles.feedbackText}>Riktig! Du betalte akkurat nok. 🎉</p>
            <button className={styles.nextBtn} onClick={handleNextQuestion}>
              {isLastQuestion ? 'Se resultater →' : 'Neste oppgave →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
