import { useState } from 'react';
import { generatePizzaBrokTask, PIECE_VALUE, WHOLE } from './pizzaBrokGenerator';
import type { Piece, PieceType, PizzaBrokRoundResult } from './pizzaBrokTypes';
import PizzaSlice from './PizzaSlice';
import CompletedPizzaDisplay from './CompletedPizzaDisplay';
import styles from './PizzaBrokPlayScreen.module.css';

const DRAG_THRESHOLD = 8;

interface DragState {
  pieceId: number;
  sourceArea: 'available' | 'plate';
  currentX: number;
  currentY: number;
  isDragging: boolean;
}

interface GameState {
  available: Piece[];
  plate: Piece[];
}

type Feedback = 'none' | 'correct' | 'wrong';

function findDropZone(x: number, y: number): 'plate' | 'available' | null {
  const elements = document.elementsFromPoint(x, y);
  for (const el of elements) {
    if (el instanceof HTMLElement) {
      const dz = el.dataset.dropzone;
      if (dz === 'plate' || dz === 'available') return dz as 'plate' | 'available';
    }
  }
  return null;
}


interface Props {
  totalQuestions: number;
  onRoundComplete: (result: PizzaBrokRoundResult) => void;
}

export default function PizzaBrokPlayScreen({ totalQuestions, onRoundComplete }: Props) {
  const [tasks] = useState(() =>
    Array.from({ length: totalQuestions }, generatePizzaBrokTask)
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>(() => ({
    available: [...tasks[0].pieces],
    plate: [],
  }));

  const [hadMistakeOnCurrent, setHadMistakeOnCurrent] = useState(false);
  const [firstTryCorrectCount, setFirstTryCorrectCount] = useState(0);
  const [hadMistakesCount, setHadMistakesCount] = useState(0);

  const [feedback, setFeedback] = useState<Feedback>('none');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [drag, setDrag] = useState<DragState | null>(null);
  const [hoverZone, setHoverZone] = useState<'plate' | 'available' | null>(null);

  const task = tasks[questionIndex];
  const { available, plate } = gameState;

  function movePiece(pieceId: number, targetArea: 'available' | 'plate') {
    setGameState(prev => {
      const piece = [...prev.available, ...prev.plate].find(p => p.id === pieceId);
      if (!piece) return prev;
      const cleanAvailable = prev.available.filter(p => p.id !== pieceId);
      const cleanPlate = prev.plate.filter(p => p.id !== pieceId);
      return {
        available: targetArea === 'available' ? [...cleanAvailable, piece] : cleanAvailable,
        plate: targetArea === 'plate' ? [...cleanPlate, piece] : cleanPlate,
      };
    });
    setFeedback('none');
  }

  function handlePointerDown(e: React.PointerEvent, pieceId: number, sourceArea: 'available' | 'plate') {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    let currentlyDragging = false;

    setDrag({ pieceId, sourceArea, currentX: startX, currentY: startY, isDragging: false });

    function onMove(me: PointerEvent) {
      const dx = me.clientX - startX;
      const dy = me.clientY - startY;
      if (!currentlyDragging && dx * dx + dy * dy > DRAG_THRESHOLD * DRAG_THRESHOLD) {
        currentlyDragging = true;
      }
      if (currentlyDragging) {
        me.preventDefault();
        setDrag(prev =>
          prev ? { ...prev, currentX: me.clientX, currentY: me.clientY, isDragging: true } : null
        );
        setHoverZone(findDropZone(me.clientX, me.clientY));
      }
    }

    function onUp(ue: PointerEvent) {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);

      if (currentlyDragging) {
        const zone = findDropZone(ue.clientX, ue.clientY);
        if (zone && zone !== sourceArea) {
          movePiece(pieceId, zone);
        }
      } else {
        // Tap: toggle piece between zones
        movePiece(pieceId, sourceArea === 'available' ? 'plate' : 'available');
      }

      setDrag(null);
      setHoverZone(null);
    }

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }

  function checkAnswer() {
    const plateValue = plate.reduce((sum, p) => sum + PIECE_VALUE[p.type], 0);
    const target = task.targetAmount;
    if (plateValue === target) {
      setFeedbackMsg(task.successMsg);
      setFeedback('correct');
    } else {
      setHadMistakeOnCurrent(true);
      const underMsg = target === WHOLE
        ? 'Du trenger litt mer pizza.'
        : 'Du trenger litt mer.';
      const overMsg = target === WHOLE
        ? 'Nå ble det mer enn én hel pizza.'
        : 'Nå ble det for mye.';
      setFeedbackMsg(
        plateValue === 0
          ? 'Tallerkenen er tom. Dra noen pizzastykker dit.'
          : plateValue < target
          ? underMsg
          : overMsg
      );
      setFeedback('wrong');
    }
  }

  function handleNext() {
    const newFirstTry = firstTryCorrectCount + (hadMistakeOnCurrent ? 0 : 1);
    const newHadMistakes = hadMistakesCount + (hadMistakeOnCurrent ? 1 : 0);

    if (questionIndex + 1 >= totalQuestions) {
      onRoundComplete({
        totalQuestions,
        firstTryCorrect: newFirstTry,
        hadMistakes: newHadMistakes,
      });
      return;
    }

    const nextTask = tasks[questionIndex + 1];
    setQuestionIndex(prev => prev + 1);
    setFirstTryCorrectCount(newFirstTry);
    setHadMistakesCount(newHadMistakes);
    setHadMistakeOnCurrent(false);
    setGameState({ available: [...nextTask.pieces], plate: [] });
    setFeedback('none');
    setFeedbackMsg('');
    setDrag(null);
    setHoverZone(null);
  }

  const isDraggingActive = drag?.isDragging ?? false;
  const isLastQuestion = questionIndex + 1 >= totalQuestions;
  const draggedPieceType: PieceType | undefined = drag
    ? [...available, ...plate].find(p => p.id === drag.pieceId)?.type
    : undefined;

  const isPlateDropTarget = isDraggingActive && hoverZone === 'plate' && drag?.sourceArea !== 'plate';
  const isAvailableDropTarget = isDraggingActive && hoverZone === 'available' && drag?.sourceArea !== 'available';

  function renderPiece(piece: Piece, sourceArea: 'available' | 'plate') {
    const isDraggingThis = isDraggingActive && drag?.pieceId === piece.id;
    return (
      <button
        key={piece.id}
        className={`${styles.piece} ${isDraggingThis ? styles.pieceDragging : ''}`}
        onPointerDown={e => handlePointerDown(e, piece.id, sourceArea)}
        onClick={e => e.stopPropagation()}
        aria-label={`${piece.type} pizzastykke`}
      >
        <PizzaSlice type={piece.type} size={72} />
        <span className={styles.pieceFraction}>{piece.type}</span>
      </button>
    );
  }

  const plateClass = [
    styles.plate,
    feedback === 'correct' ? styles.plateCorrect : '',
    isPlateDropTarget ? styles.plateDropTarget : '',
  ].join(' ');

  return (
    <div className={styles.container}>

      {/* Progress */}
      <div className={styles.roundProgress}>
        <div className={styles.progressDots}>
          {Array.from({ length: totalQuestions }, (_, i) => (
            <span
              key={i}
              className={`${styles.dot} ${
                i < questionIndex
                  ? styles.dotDone
                  : i === questionIndex
                  ? hadMistakeOnCurrent
                    ? styles.dotCurrentMistake
                    : styles.dotCurrent
                  : styles.dotFuture
              }`}
            />
          ))}
        </div>
        <div className={styles.progressCounts}>
          {firstTryCorrectCount > 0 && (
            <span className={styles.correctCount}>✓ {firstTryCorrectCount}</span>
          )}
          {hadMistakesCount > 0 && (
            <span className={styles.mistakeCount}>~ {hadMistakesCount}</span>
          )}
        </div>
      </div>

      {/* Task prompt */}
      <p className={styles.prompt}>{task.prompt}</p>

      {/* Plate — drop zone */}
      <div
        data-dropzone="plate"
        className={plateClass}
        role="region"
        aria-label="Tallerkenen"
      >
        <span className={styles.zoneLabel}>Tallerkenen</span>

        {feedback === 'correct' ? (
          /* Illustration matching the target fraction */
          <div className={styles.plateDone}>
            <CompletedPizzaDisplay targetAmount={task.targetAmount} size={128} />
          </div>
        ) : plate.length === 0 && !isPlateDropTarget ? (
          <span className={styles.plateEmpty}>Dra pizzastykker hit</span>
        ) : (
          <div className={styles.plateItems}>
            {plate.map(piece => renderPiece(piece, 'plate'))}
          </div>
        )}
      </div>

      {/* Available pieces — drop zone (hidden while correct to keep focus on the pizza) */}
      {feedback !== 'correct' && (
        <div
          data-dropzone="available"
          className={`${styles.available} ${isAvailableDropTarget ? styles.availableDropTarget : ''}`}
          role="region"
          aria-label="Tilgjengelige pizzastykker"
        >
          <span className={styles.zoneLabel}>Pizzastykker</span>
          <div className={styles.availableItems}>
            {available.length === 0 ? (
              <span className={styles.availableEmpty}>Alle biter er på tallerkenen</span>
            ) : (
              available.map(piece => renderPiece(piece, 'available'))
            )}
          </div>
        </div>
      )}

      {/* Action area */}
      <div className={styles.actions}>
        {feedback === 'none' && (
          <button className={styles.checkBtn} onClick={checkAnswer}>
            Sjekk svar ✓
          </button>
        )}

        {feedback === 'correct' && (
          <div className={styles.feedbackCorrect}>
            <p className={styles.feedbackText}>{feedbackMsg}</p>
            <button className={styles.nextBtn} onClick={handleNext}>
              {isLastQuestion ? 'Se resultater →' : 'Neste oppgave →'}
            </button>
          </div>
        )}

        {feedback === 'wrong' && (
          <div className={styles.feedbackWrong}>
            <p className={styles.feedbackText}>{feedbackMsg} 🤔</p>
            <button className={styles.retryBtn} onClick={() => setFeedback('none')}>
              Prøv igjen
            </button>
          </div>
        )}
      </div>

      {/* Drag ghost — mirrors the piece being dragged */}
      {isDraggingActive && drag && draggedPieceType && (
        <div
          className={styles.dragGhost}
          style={{ left: drag.currentX, top: drag.currentY }}
          aria-hidden="true"
        >
          <PizzaSlice type={draggedPieceType} size={72} />
          <span className={styles.pieceFraction}>{draggedPieceType}</span>
        </div>
      )}
    </div>
  );
}
