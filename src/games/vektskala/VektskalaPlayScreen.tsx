import { useState } from 'react';
import { generateVektskalaQuestion, computeLeftValue } from './vektskalaGenerator';
import type { VektskalaLevel, VektskalaQuestion, VektskalaRoundResult } from './vektskalaTypes';
import styles from './VektskalaPlayScreen.module.css';

type Feedback = 'none' | 'correct' | 'too-low' | 'too-high' | 'no-selection';

// ---- Balance scale SVG (Lett only) ----

function BalanceScale({ beamAngle, isBalanced }: { beamAngle: number; isBalanced: boolean }) {
  const panFill = isBalanced ? '#4caf50' : '#daa520';
  const panRim  = isBalanced ? '#2e7d32' : '#c8960c';

  return (
    <svg
      viewBox="0 0 300 175"
      className={`${styles.scaleSvg} ${isBalanced ? styles.scaleSvgBalanced : ''}`}
      aria-hidden="true"
    >
      <rect x="146" y="68" width="8" height="88" rx="3" fill="#795548" />
      <rect x="105" y="150" width="90" height="14" rx="6" fill="#795548" />
      <circle cx="150" cy="68" r="10" fill="#4e342e" />

      <g
        className={styles.beam}
        style={{ transform: `rotate(${beamAngle}deg)`, transformOrigin: '150px 68px' }}
      >
        <rect x="40" y="64" width="220" height="8" rx="4" fill="#4e342e" />
        <line x1="75"  y1="68" x2="75"  y2="108" stroke="#bdbdbd" strokeWidth="2.5" />
        <line x1="100" y1="68" x2="100" y2="108" stroke="#bdbdbd" strokeWidth="2.5" />
        <ellipse cx="87"  cy="116" rx="40" ry="13" fill={panRim} />
        <ellipse cx="87"  cy="112" rx="38" ry="10" fill={panFill} />
        <line x1="200" y1="68" x2="200" y2="108" stroke="#bdbdbd" strokeWidth="2.5" />
        <line x1="225" y1="68" x2="225" y2="108" stroke="#bdbdbd" strokeWidth="2.5" />
        <ellipse cx="212" cy="116" rx="40" ry="13" fill={panRim} />
        <ellipse cx="212" cy="112" rx="38" ry="10" fill={panFill} />
      </g>
    </svg>
  );
}

// ---- Equation builder ----

function buildEquation(q: VektskalaQuestion, selected: number | null, equStyles: typeof styles) {
  const slot =
    selected !== null ? (
      <span className={equStyles.slot}>{selected}</span>
    ) : (
      <span className={equStyles.slotEmpty}>?</span>
    );

  switch (q.equationType) {
    case 'add-right':
      return (<><span className={equStyles.equNum}>{q.knownOperand}</span><span className={equStyles.equOp}>+</span>{slot}<span className={equStyles.equEquals}>=</span><span className={equStyles.equNum}>{q.target}</span></>);
    case 'add-left':
      return (<>{slot}<span className={equStyles.equOp}>+</span><span className={equStyles.equNum}>{q.knownOperand}</span><span className={equStyles.equEquals}>=</span><span className={equStyles.equNum}>{q.target}</span></>);
    case 'sub-right':
      return (<><span className={equStyles.equNum}>{q.knownOperand}</span><span className={equStyles.equOp}>−</span>{slot}<span className={equStyles.equEquals}>=</span><span className={equStyles.equNum}>{q.target}</span></>);
    case 'sub-left':
      return (<>{slot}<span className={equStyles.equOp}>−</span><span className={equStyles.equNum}>{q.knownOperand}</span><span className={equStyles.equEquals}>=</span><span className={equStyles.equNum}>{q.target}</span></>);
    case 'mul-right':
      return (<><span className={equStyles.equNum}>{q.knownOperand}</span><span className={equStyles.equOp}>×</span>{slot}<span className={equStyles.equEquals}>=</span><span className={equStyles.equNum}>{q.target}</span></>);
    case 'mul-left':
      return (<>{slot}<span className={equStyles.equOp}>×</span><span className={equStyles.equNum}>{q.knownOperand}</span><span className={equStyles.equEquals}>=</span><span className={equStyles.equNum}>{q.target}</span></>);
  }
}

// ---- Play screen ----

interface Props {
  totalQuestions: number;
  level: VektskalaLevel;
  onRoundComplete: (result: VektskalaRoundResult) => void;
}

export default function VektskalaPlayScreen({ totalQuestions, level, onRoundComplete }: Props) {
  const [tasks] = useState<VektskalaQuestion[]>(() =>
    Array.from({ length: totalQuestions }, () => generateVektskalaQuestion(level))
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback>('none');
  const [hadMistakeOnCurrent, setHadMistakeOnCurrent] = useState(false);
  const [firstTryCorrectCount, setFirstTryCorrectCount] = useState(0);
  const [hadMistakesCount, setHadMistakesCount] = useState(0);

  const task = tasks[questionIndex];
  const isLastQuestion = questionIndex + 1 >= totalQuestions;
  const isEasy = level === 'easy';

  // Beam tilt — only computed for Lett
  let beamAngle = 10;
  if (isEasy && selectedValue !== null) {
    const diff = computeLeftValue(task, selectedValue) - task.target;
    beamAngle = diff === 0 ? 0 : diff < 0 ? 12 : -12;
  }

  const isBalanced = feedback === 'correct';

  function handleSelectChoice(val: number) {
    if (feedback === 'correct') return;
    setSelectedValue(val);
    setFeedback('none');
  }

  function handleCheck() {
    if (selectedValue === null) {
      setFeedback('no-selection');
      return;
    }
    const leftVal = computeLeftValue(task, selectedValue);
    if (leftVal === task.target) {
      setFeedback('correct');
    } else {
      if (!hadMistakeOnCurrent) setHadMistakeOnCurrent(true);
      setFeedback(leftVal < task.target ? 'too-low' : 'too-high');
    }
  }

  function handleNext() {
    const newFirstTry = firstTryCorrectCount + (hadMistakeOnCurrent ? 0 : 1);
    const newHadMistakes = hadMistakesCount + (hadMistakeOnCurrent ? 1 : 0);

    if (isLastQuestion) {
      onRoundComplete({ totalQuestions, firstTryCorrect: newFirstTry, hadMistakes: newHadMistakes });
      return;
    }

    setQuestionIndex(prev => prev + 1);
    setFirstTryCorrectCount(newFirstTry);
    setHadMistakesCount(newHadMistakes);
    setHadMistakeOnCurrent(false);
    setSelectedValue(null);
    setFeedback('none');
  }

  const prompt = isEasy ? 'Gjør begge sider like.' : 'Sett inn det manglende tallet.';
  const correctMsg = isEasy
    ? 'Riktig! Nå er vektskåla i balanse. ⚖️'
    : 'Riktig! Tallet passer i regnestykket. ✓';

  return (
    <div className={styles.container}>

      {/* Progress */}
      <div className={styles.progress}>
        <div className={styles.progressDots}>
          {Array.from({ length: totalQuestions }, (_, i) => (
            <span
              key={i}
              className={`${styles.dot} ${
                i < questionIndex
                  ? styles.dotDone
                  : i === questionIndex
                  ? hadMistakeOnCurrent ? styles.dotCurrentMistake : styles.dotCurrent
                  : styles.dotFuture
              }`}
            />
          ))}
        </div>
        <div className={styles.progressMeta}>
          <span className={styles.progressLabel}>
            Oppgave {questionIndex + 1} av {totalQuestions}
          </span>
          {firstTryCorrectCount > 0 && (
            <span className={styles.correctCount}>✓ {firstTryCorrectCount}</span>
          )}
          {hadMistakesCount > 0 && (
            <span className={styles.mistakeCount}>~ {hadMistakesCount}</span>
          )}
        </div>
      </div>

      {/* Task prompt */}
      <p className={styles.prompt}>{prompt}</p>

      {/* Equation */}
      <div
        className={`${styles.equation} ${!isEasy && feedback === 'correct' ? styles.equationCorrect : ''}`}
        aria-live="polite"
        aria-label="Likningen"
      >
        {buildEquation(task, selectedValue, styles)}
      </div>

      {/* Balance scale — Lett only */}
      {isEasy && <BalanceScale beamAngle={beamAngle} isBalanced={isBalanced} />}

      {/* Number choices */}
      <div className={styles.choices} role="group" aria-label="Velg et tall">
        {task.choices.map(val => (
          <button
            key={val}
            className={`${styles.choiceBtn} ${selectedValue === val ? styles.choiceBtnSelected : ''} ${feedback === 'correct' ? styles.choiceBtnDisabled : ''}`}
            onClick={() => handleSelectChoice(val)}
            aria-pressed={selectedValue === val}
            disabled={feedback === 'correct'}
          >
            {val}
          </button>
        ))}
      </div>

      {/* Action area */}
      <div className={styles.actions}>
        {feedback !== 'correct' ? (
          <>
            {feedback === 'no-selection' && (
              <p className={styles.hintNeutral}>Velg et tall først.</p>
            )}
            {feedback === 'too-low' && (
              <p className={styles.hintWrong}>Tallet er litt for lite. Prøv igjen!</p>
            )}
            {feedback === 'too-high' && (
              <p className={styles.hintWrong}>Tallet er litt for stort. Prøv igjen!</p>
            )}
            <button className={styles.checkBtn} onClick={handleCheck}>
              Sjekk svar ✓
            </button>
          </>
        ) : (
          <div className={styles.correctArea}>
            <p className={styles.correctMsg}>{correctMsg}</p>
            <button className={styles.nextBtn} onClick={handleNext}>
              {isLastQuestion ? 'Se resultater →' : 'Neste oppgave →'}
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
