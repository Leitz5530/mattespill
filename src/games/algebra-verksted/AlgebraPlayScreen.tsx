import { useState, useEffect, useRef } from 'react';
import { generateAlgebraTask } from './algebraGenerator';
import type { AlgebraTask, AlgebraTaskType, AlgebraRoundResult } from './algebraTypes';
import styles from './AlgebraPlayScreen.module.css';

interface Props {
  totalQuestions: number;
  onRoundComplete: (result: AlgebraRoundResult) => void;
}

// ─── Animation state machine ─────────────────────────────────────────────────
// idle          → show equation, user acts
// const_mid     → intermediate step (gray → strikethrough → advance), 1300ms total
// divide_choose → user picks which number to divide by
// divide_mid    → fraction step (gray → strikethrough → advance), 1300ms total
// solved        → x = answer
type AnimMode = 'idle' | 'const_mid' | 'divide_choose' | 'divide_mid' | 'solved';

interface EqState {
  coefficient: number;
  constant: number;
  rightSide: number;
}

// ─── Drag state ───────────────────────────────────────────────────────────────
interface DragState {
  started: boolean;   // pointerdown is active
  active: boolean;    // moved past threshold → showing ghost
  startX: number;
  startY: number;
  x: number;         // current pointer x
  y: number;         // current pointer y
  crossed: boolean;  // ghost has crossed the equals sign
  tileW: number;     // tile dimensions for centering ghost
  tileH: number;
}

const INIT_DRAG: DragState = {
  started: false, active: false,
  startX: 0, startY: 0,
  x: 0, y: 0,
  crossed: false,
  tileW: 0, tileH: 0,
};

const DRAG_THRESHOLD = 6; // px before drag activates

// ─── Helpers ──────────────────────────────────────────────────────────────────
function coeffX(coeff: number): string {
  return coeff === 1 ? 'x' : `${coeff}x`;
}

function fmtConst(c: number): string {
  return c >= 0 ? `+${c}` : `−${Math.abs(c)}`;
}

function generateDivisorChoices(correct: number): number[] {
  const nearby = [correct - 2, correct - 1, correct + 1, correct + 2, correct * 2];
  const fallback = [2, 3, 4, 5, 6, 7, 8, 10];
  const candidates = [...nearby, ...fallback].filter(n => n > 1 && n !== correct);
  const seen = new Set<number>();
  const wrongs: number[] = [];
  for (const c of candidates) {
    if (!seen.has(c) && wrongs.length < 3) { seen.add(c); wrongs.push(c); }
  }
  const choices = [correct, ...wrongs];
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return choices;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AlgebraPlayScreen({ totalQuestions, onRoundComplete }: Props) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [recentTypes, setRecentTypes] = useState<AlgebraTaskType[]>([]);
  const [task, setTask] = useState<AlgebraTask>(() => generateAlgebraTask());
  const [eq, setEq] = useState<EqState>(() => ({
    coefficient: task.coefficient,
    constant: task.constant,
    rightSide: task.rightSide,
  }));
  const [animMode, setAnimMode] = useState<AnimMode>('idle');
  const [pendingEq, setPendingEq] = useState<EqState | null>(null);
  // strikeActive: false = show terms grayed (no line), true = show red strikethrough
  const [strikeActive, setStrikeActive] = useState(false);
  const [divisorChoices, setDivisorChoices] = useState<number[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const [hadMistakeOnCurrent, setHadMistakeOnCurrent] = useState(false);
  const [solvedClean, setSolvedClean] = useState(0);
  const [hadMistakesCount, setHadMistakesCount] = useState(0);
  const [drag, setDrag] = useState<DragState>(INIT_DRAG);

  // Ref for the equals sign element (used to detect crossing during drag)
  const equalsRef = useRef<HTMLSpanElement>(null);
  // Prevents onClick from double-firing after a successful drag
  const wasDraggedRef = useRef(false);

  const isLastQuestion = questionIndex + 1 >= totalQuestions;

  // ─── Two-phase intermediate animation ────────────────────────────────────
  // Phase 1 (0–350ms): terms appear gray, no strikethrough — child sees what's happening
  // Phase 2 (350–1300ms): red strikethrough visible — child sees the cancellation
  // After 1300ms: advance to the simplified state
  useEffect(() => {
    const isConst = animMode === 'const_mid';
    const isDivide = animMode === 'divide_mid';
    if ((!isConst && !isDivide) || !pendingEq) return;

    const next = pendingEq;

    const t1 = setTimeout(() => setStrikeActive(true), 350);

    const t2 = setTimeout(() => {
      setStrikeActive(false);
      setEq(next);
      if (isConst) {
        setAnimMode(next.coefficient === 1 ? 'solved' : 'idle');
      } else {
        setAnimMode('solved');
      }
      setPendingEq(null);
    }, 1300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [animMode, pendingEq]);

  // ─── Constant move ────────────────────────────────────────────────────────
  function commitConstantMove() {
    setHint(null);
    setPendingEq({
      coefficient: eq.coefficient,
      constant: 0,
      rightSide: eq.rightSide - eq.constant,
    });
    setAnimMode('const_mid');
  }

  // ─── Drag / drop handlers (Pointer Events) ────────────────────────────────
  function handlePointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    if (animMode !== 'idle') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    wasDraggedRef.current = false;
    const rect = e.currentTarget.getBoundingClientRect();
    setDrag({
      started: true, active: false,
      startX: e.clientX, startY: e.clientY,
      x: e.clientX, y: e.clientY,
      crossed: false,
      tileW: rect.width, tileH: rect.height,
    });
  }

  function handlePointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (!drag.started) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    const nowActive = drag.active || Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD;
    const crossed = equalsRef.current
      ? e.clientX > equalsRef.current.getBoundingClientRect().right
      : false;
    setDrag(prev => ({ ...prev, active: nowActive, x: e.clientX, y: e.clientY, crossed }));
  }

  function handlePointerUp(e: React.PointerEvent<HTMLButtonElement>) {
    if (!drag.started) return;
    const wasDrag = drag.active;
    setDrag(INIT_DRAG);

    if (!wasDrag) {
      // Short tap — let onClick handle it
      wasDraggedRef.current = false;
      return;
    }

    // Actual drag — prevent onClick from also firing
    wasDraggedRef.current = true;

    // Valid drop: pointer is to the right of the equals sign
    const droppedRight = equalsRef.current
      ? e.clientX > equalsRef.current.getBoundingClientRect().right
      : false;

    if (droppedRight) {
      commitConstantMove();
    }
    // else: tile snaps back (drag state already reset)
  }

  function handlePointerCancel() {
    setDrag(INIT_DRAG);
  }

  // Tap fallback (also handles keyboard activation via button)
  function handleTileClick() {
    if (wasDraggedRef.current) {
      wasDraggedRef.current = false;
      return; // Already handled in pointerup
    }
    commitConstantMove();
  }

  // ─── Division step ────────────────────────────────────────────────────────
  function handleDivideClick() {
    if (animMode !== 'idle') return;
    if (eq.constant !== 0) {
      if (!hadMistakeOnCurrent) setHadMistakeOnCurrent(true);
      setHint('Fjern tallet som er lagt til x først.');
      return;
    }
    setHint(null);
    setDivisorChoices(generateDivisorChoices(eq.coefficient));
    setAnimMode('divide_choose');
  }

  function handleDivisorChoice(n: number) {
    if (n !== eq.coefficient) {
      if (!hadMistakeOnCurrent) setHadMistakeOnCurrent(true);
      setHint('Se på tallet som er foran x.');
      return;
    }
    setHint(null);
    setPendingEq({
      coefficient: 1,
      constant: 0,
      rightSide: eq.rightSide / eq.coefficient,
    });
    setAnimMode('divide_mid');
  }

  function handleCancelDivide() {
    setAnimMode('idle');
    setHint(null);
  }

  // ─── Advance to next question / finish round ──────────────────────────────
  function handleNextQuestion() {
    const newSolvedClean = solvedClean + (hadMistakeOnCurrent ? 0 : 1);
    const newHadMistakes = hadMistakesCount + (hadMistakeOnCurrent ? 1 : 0);

    if (isLastQuestion) {
      onRoundComplete({ totalQuestions, solvedClean: newSolvedClean, hadMistakes: newHadMistakes });
      return;
    }

    const newTypes = [...recentTypes, task.type];
    const nextTask = generateAlgebraTask(newTypes);
    setRecentTypes(newTypes);
    setTask(nextTask);
    setEq({ coefficient: nextTask.coefficient, constant: nextTask.constant, rightSide: nextTask.rightSide });
    setQuestionIndex(prev => prev + 1);
    setSolvedClean(newSolvedClean);
    setHadMistakesCount(newHadMistakes);
    setHadMistakeOnCurrent(false);
    setAnimMode('idle');
    setHint(null);
    setPendingEq(null);
    setStrikeActive(false);
    setDivisorChoices([]);
  }

  // ─── Derived display values ───────────────────────────────────────────────
  const absConst = Math.abs(eq.constant);
  const constMoveDesc = eq.constant > 0
    ? `Vi trekker fra ${absConst} på begge sider.`
    : `Vi legger til ${absConst} på begge sider.`;

  // Ghost tile label changes sign after crossing the equals sign
  const ghostLabel = drag.crossed ? fmtConst(-eq.constant) : fmtConst(eq.constant);

  // CSS class for cancelled terms: gray first, then red strikethrough
  function cancelClass() {
    return strikeActive ? styles.termStrike : styles.termGray;
  }

  function dotClass(i: number) {
    if (i < questionIndex) return styles.dotDone;
    if (i === questionIndex) return hadMistakeOnCurrent ? styles.dotCurrentMistake : styles.dotCurrent;
    return styles.dotFuture;
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className={styles.container}>

      {/* ── Progress ── */}
      <div className={styles.progress}>
        <div className={styles.progressDots}>
          {Array.from({ length: totalQuestions }, (_, i) => (
            <span key={i} className={`${styles.dot} ${dotClass(i)}`} />
          ))}
        </div>
        <div className={styles.progressCounts}>
          {solvedClean > 0 && <span className={styles.correctCount}>✓ {solvedClean}</span>}
          {hadMistakesCount > 0 && <span className={styles.mistakeCount}>~ {hadMistakesCount}</span>}
        </div>
        <p className={styles.progressText}>Oppgave {questionIndex + 1} av {totalQuestions}</p>
      </div>

      {/* ── Equation display ── */}
      <div className={styles.equationArea}>

        {/* IDLE — draggable constant tile + optional divide button */}
        {animMode === 'idle' && (
          <div className={styles.equationRow}>
            <div className={styles.eqLeft}>
              <span className={styles.xTerm}>{coeffX(eq.coefficient)}</span>
              {eq.constant !== 0 && (
                <button
                  className={`${styles.constTile} ${drag.active ? styles.constTileDragging : ''}`}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerCancel}
                  onClick={handleTileClick}
                  style={{ touchAction: 'none' }}
                  aria-label={`Flytt ${fmtConst(eq.constant)} over likhetstegnet`}
                >
                  {fmtConst(eq.constant)}
                </button>
              )}
            </div>
            <span ref={equalsRef} className={styles.equalsSign}>=</span>
            <div className={`${styles.eqRight} ${drag.active && drag.crossed ? styles.eqRightActive : ''}`}>
              <span className={styles.rightNum}>{eq.rightSide}</span>
            </div>
          </div>
        )}

        {/* CONST_MID — intermediate with gray → strikethrough */}
        {animMode === 'const_mid' && (
          <div className={styles.midBlock}>
            <div className={`${styles.equationRow} ${styles.equationRowSm}`}>
              <div className={styles.eqLeft}>
                <span className={styles.xTerm}>{coeffX(eq.coefficient)}</span>
                <span className={cancelClass()}>{fmtConst(eq.constant)}</span>
                <span className={cancelClass()}>{fmtConst(-eq.constant)}</span>
              </div>
              <span className={styles.equalsSign}>=</span>
              <div className={styles.eqRight}>
                <span className={styles.rightNum}>{eq.rightSide}</span>
                <span className={styles.opNum}>{fmtConst(-eq.constant)}</span>
              </div>
            </div>
            <p className={styles.midDesc}>{constMoveDesc}</p>
          </div>
        )}

        {/* DIVIDE_CHOOSE — equation shown while user picks divisor */}
        {animMode === 'divide_choose' && (
          <div className={styles.equationRow}>
            <div className={styles.eqLeft}>
              <span className={styles.xTerm}>{coeffX(eq.coefficient)}</span>
            </div>
            <span className={styles.equalsSign}>=</span>
            <div className={styles.eqRight}>
              <span className={styles.rightNum}>{eq.rightSide}</span>
            </div>
          </div>
        )}

        {/* DIVIDE_MID — fraction with gray → strikethrough on coefficients */}
        {animMode === 'divide_mid' && (
          <div className={styles.midBlock}>
            <div className={`${styles.equationRow} ${styles.equationRowSm}`}>
              <div className={styles.eqLeft}>
                <span className={styles.fraction}>
                  <span className={styles.fracTop}>
                    <span className={cancelClass()}>{eq.coefficient}</span>
                    <span className={styles.xOnly}>x</span>
                  </span>
                  <span className={styles.fracLine} />
                  <span className={`${styles.fracBot} ${cancelClass()}`}>{eq.coefficient}</span>
                </span>
              </div>
              <span className={styles.equalsSign}>=</span>
              <div className={styles.eqRight}>
                <span className={styles.fraction}>
                  <span className={styles.fracTop}>{eq.rightSide}</span>
                  <span className={styles.fracLine} />
                  <span className={styles.fracBot}>{eq.coefficient}</span>
                </span>
              </div>
            </div>
            <p className={styles.midDesc}>Vi deler begge sider på {eq.coefficient}.</p>
          </div>
        )}

        {/* SOLVED — x = answer with green glow */}
        {animMode === 'solved' && (
          <div className={`${styles.equationRow} ${styles.solvedRow}`}>
            <div className={styles.eqLeft}>
              <span className={styles.xTerm}>x</span>
            </div>
            <span className={styles.equalsSign}>=</span>
            <div className={styles.eqRight}>
              <span className={`${styles.rightNum} ${styles.solutionNum}`}>{task.solution}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Ghost tile — follows pointer during drag ── */}
      {drag.active && eq.constant !== 0 && (
        <div
          className={`${styles.ghostTile} ${drag.crossed ? styles.ghostCrossed : ''}`}
          style={{
            left: `${drag.x - drag.tileW / 2}px`,
            top: `${drag.y - drag.tileH / 2}px`,
          }}
          aria-hidden="true"
        >
          {ghostLabel}
        </div>
      )}

      {/* ── Actions ── */}
      <div className={styles.actionsArea}>

        {animMode === 'idle' && (
          <>
            {eq.constant !== 0 && (
              <p className={styles.tapHint}>
                Dra {fmtConst(eq.constant)} over likhetstegnet, eller trykk på brikken.
              </p>
            )}
            {eq.coefficient > 1 && (
              <button className={styles.divideBtn} onClick={handleDivideClick}>
                Del begge sider
              </button>
            )}
          </>
        )}

        {animMode === 'divide_choose' && (
          <div className={styles.divisorSection}>
            <p className={styles.divisorPrompt}>Del begge sider på:</p>
            <div className={styles.divisorGrid}>
              {divisorChoices.map(n => (
                <button key={n} className={styles.divisorBtn} onClick={() => handleDivisorChoice(n)}>
                  {n}
                </button>
              ))}
            </div>
            <button className={styles.cancelBtn} onClick={handleCancelDivide}>Avbryt</button>
          </div>
        )}

        {hint && (
          <div className={styles.hintBox}>
            <p className={styles.hintText}>{hint}</p>
          </div>
        )}

        {animMode === 'solved' && (
          <div className={styles.solvedFeedback}>
            <p className={styles.solvedMsg}>Riktig! x er alene.</p>
            <button className={styles.nextBtn} onClick={handleNextQuestion}>
              {isLastQuestion ? 'Se resultater →' : 'Neste oppgave →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
