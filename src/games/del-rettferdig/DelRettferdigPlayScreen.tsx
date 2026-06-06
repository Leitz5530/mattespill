import { useState } from 'react';
import { generateFairShareTask } from './fairShareGenerator';
import type { FairShareTask } from './fairShareGenerator';
import { getFairShareHint } from './fairShareHints';
import type { RoundResult } from './fairShareTypes';
import styles from './DelRettferdigPlayScreen.module.css';

// ---- Success messages ----

const SUCCESS_FIRST_TRY = [
  '🎉 Riktig fordelt!',
  '⭐ Bra jobbet!',
  '🌟 Supert!',
  '🎊 Flott løst!',
  '✅ Perfekt!',
];

const SUCCESS_AFTER_MISTAKE = [
  '✨ Der satt den!',
  '💪 Nå fikk du det til!',
  '👍 Bra, nå stemmer det!',
  '🎯 Flott, du fant løsningen!',
  '⭐ Yes, riktig til slutt!',
];

function getFairShareSuccessMessage(hadMistake: boolean): string {
  const pool = hadMistake ? SUCCESS_AFTER_MISTAKE : SUCCESS_FIRST_TRY;
  return pool[Math.floor(Math.random() * pool.length)];
}

interface GameState {
  task: FairShareTask;
  pile: number[];
  baskets: Record<string, number[]>;
}

interface DragState {
  itemId: number;
  sourceKey: string; // 'pile' or person name
  currentX: number;
  currentY: number;
  isDragging: boolean;
}

type Feedback = 'none' | 'correct' | 'wrong';

const DRAG_THRESHOLD = 8;

function createGameState(): GameState {
  const task = generateFairShareTask();
  let idCounter = 0;

  const pile: number[] = [];
  for (let i = 0; i < task.initialPile; i++) pile.push(idCounter++);

  const baskets: Record<string, number[]> = {};
  for (const name of task.personNames) {
    baskets[name] = [];
    const count = task.initialCounts[name] ?? 0;
    for (let i = 0; i < count; i++) baskets[name].push(idCounter++);
  }

  return { task, pile, baskets };
}

function findDropZone(x: number, y: number): string | null {
  const elements = document.elementsFromPoint(x, y);
  for (const el of elements) {
    if (el instanceof HTMLElement && el.dataset.dropzone) {
      return el.dataset.dropzone;
    }
  }
  return null;
}

interface Props {
  totalQuestions: number;
  onRoundComplete: (result: RoundResult) => void;
}

export default function DelRettferdigPlayScreen({ totalQuestions, onRoundComplete }: Props) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [hadMistakeOnCurrent, setHadMistakeOnCurrent] = useState(false);
  const [firstTryCorrectCount, setFirstTryCorrectCount] = useState(0);
  const [hadMistakesCount, setHadMistakesCount] = useState(0);

  const [gameState, setGameState] = useState<GameState>(createGameState);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback>('none');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [drag, setDrag] = useState<DragState | null>(null);
  const [hoverZone, setHoverZone] = useState<string | null>(null);
  const [showQuick, setShowQuick] = useState(false);

  const { task, pile, baskets } = gameState;

  // ---- Generic move helpers ----

  function moveItemToBasket(itemId: number, targetName: string) {
    setGameState(prev => {
      const newPile = prev.pile.filter(x => x !== itemId);
      const newBaskets = Object.fromEntries(
        Object.entries(prev.baskets).map(([name, items]) => [
          name,
          name === targetName
            ? [...items.filter(x => x !== itemId), itemId]
            : items.filter(x => x !== itemId),
        ])
      );
      return { ...prev, pile: newPile, baskets: newBaskets };
    });
    setFeedback('none');
  }

  function moveItemToPile(itemId: number) {
    setGameState(prev => {
      const newBaskets = Object.fromEntries(
        Object.entries(prev.baskets).map(([name, items]) => [
          name,
          items.filter(x => x !== itemId),
        ])
      );
      const newPile = prev.pile.includes(itemId) ? prev.pile : [...prev.pile, itemId];
      return { ...prev, pile: newPile, baskets: newBaskets };
    });
    setFeedback('none');
  }

  // ---- Tap / selection handlers ----

  function selectItem(id: number) {
    setSelected(prev => (prev === id ? null : id));
    setFeedback('none');
  }

  function handleBasketClick(personName: string) {
    if (selected !== null) {
      moveItemToBasket(selected, personName);
      setSelected(null);
    }
  }

  function handlePileClick() {
    if (selected !== null) {
      moveItemToPile(selected);
      setSelected(null);
    }
  }

  // ---- Quick-move helpers (used in collapsed panel) ----

  function giveFromPile(personName: string, count: number) {
    setGameState(prev => {
      const toMove = prev.pile.slice(0, count);
      if (toMove.length === 0) return prev;
      return {
        ...prev,
        pile: prev.pile.slice(count),
        baskets: { ...prev.baskets, [personName]: [...prev.baskets[personName], ...toMove] },
      };
    });
    setSelected(null);
    setFeedback('none');
  }

  function returnToPile(personName: string) {
    setGameState(prev => {
      const personItems = prev.baskets[personName];
      const last = personItems.at(-1);
      if (last === undefined) return prev;
      return {
        ...prev,
        pile: [...prev.pile, last],
        baskets: { ...prev.baskets, [personName]: personItems.slice(0, -1) },
      };
    });
    setSelected(null);
    setFeedback('none');
  }

  // ---- Drag (Pointer Events) ----

  function handleItemPointerDown(e: React.PointerEvent, id: number, sourceKey: string) {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    let currentlyDragging = false;

    setDrag({ itemId: id, sourceKey, currentX: startX, currentY: startY, isDragging: false });

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
        if (zone && zone !== sourceKey) {
          if (zone === 'pile') moveItemToPile(id);
          else moveItemToBasket(id, zone);
        }
        setSelected(null);
      } else {
        selectItem(id);
      }

      setDrag(null);
      setHoverZone(null);
    }

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  }

  // ---- Game logic ----

  function checkAnswer() {
    const pileEmpty = pile.length === 0;
    const allMatch = task.personNames.every(
      name => baskets[name].length === (task.targetCounts[name] ?? 0)
    );
    if (pileEmpty && allMatch) {
      setFeedbackMsg(getFairShareSuccessMessage(hadMistakeOnCurrent));
      setFeedback('correct');
    } else {
      setHadMistakeOnCurrent(true);
      setFeedbackMsg(getFairShareHint(task, baskets, pile.length));
      setFeedback('wrong');
    }
  }

  function handleNextQuestion() {
    const newFirstTry = firstTryCorrectCount + (hadMistakeOnCurrent ? 0 : 1);
    const newHadMistakes = hadMistakesCount + (hadMistakeOnCurrent ? 1 : 0);

    if (questionIndex + 1 >= totalQuestions) {
      onRoundComplete({ totalQuestions, firstTryCorrect: newFirstTry, hadMistakes: newHadMistakes });
      return;
    }

    setQuestionIndex(prev => prev + 1);
    setFirstTryCorrectCount(newFirstTry);
    setHadMistakesCount(newHadMistakes);
    setHadMistakeOnCurrent(false);
    setGameState(createGameState());
    setSelected(null);
    setFeedback('none');
    setFeedbackMsg('');
    setDrag(null);
    setHoverZone(null);
    setShowQuick(false);
  }

  // ---- Derived ----

  const hasSelection = selected !== null;
  const isDraggingActive = drag?.isDragging ?? false;
  const isLastQuestion = questionIndex + 1 >= totalQuestions;

  function hintText() {
    if (isDraggingActive) return 'Slipp på den som skal få den.';
    if (hasSelection) return `${task.itemEmoji} valgt – trykk på en person for å gi`;
    return 'Dra til en person, eller trykk for å velge.';
  }

  return (
    <div className={styles.container}>

      {/* Round progress */}
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

      {/* Task */}
      <p className={styles.taskText}>{task.taskPrompt}</p>
      <p className={styles.hint}>{hintText()}</p>

      {/* Person cards */}
      <div className={styles.baskets}>
        {task.personNames.map(name => {
          const isDropHovered = isDraggingActive && hoverZone === name && drag?.sourceKey !== name;
          const isSelectionTarget = hasSelection && !isDraggingActive;
          return (
            <div
              key={name}
              data-dropzone={name}
              className={`${styles.basket} ${isSelectionTarget || isDropHovered ? styles.basketDropTarget : ''}`}
              onClick={() => handleBasketClick(name)}
              role="button"
              tabIndex={0}
              aria-label={`Gi til ${name}`}
              onKeyDown={e => e.key === 'Enter' && handleBasketClick(name)}
            >
              <span className={styles.personName}>{name}</span>

              <div className={styles.basketItems}>
                {baskets[name].map(id => (
                  <button
                    key={id}
                    className={`${styles.item}
                      ${selected === id && !isDraggingActive ? styles.itemSelected : ''}
                      ${isDraggingActive && drag?.itemId === id ? styles.itemDragging : ''}`}
                    onPointerDown={e => handleItemPointerDown(e, id, name)}
                    onClick={e => e.stopPropagation()}
                    aria-label={`${task.itemName} – trykk eller dra`}
                  >
                    {task.itemEmoji}
                  </button>
                ))}
                {baskets[name].length === 0 && (
                  <span className={styles.emptyBasket}>Tom</span>
                )}
              </div>

              <span className={styles.basketCount}>{baskets[name].length} stk</span>
            </div>
          );
        })}
      </div>

      {/* Pile */}
      <div
        data-dropzone="pile"
        className={`${styles.pileArea}
          ${(hasSelection && !isDraggingActive)
            || (isDraggingActive && hoverZone === 'pile' && drag?.sourceKey !== 'pile')
            ? styles.pileDropTarget : ''}`}
        onClick={handlePileClick}
        role="button"
        tabIndex={0}
        aria-label="Legg tilbake i haugen"
        onKeyDown={e => e.key === 'Enter' && handlePileClick()}
      >
        <span className={styles.pileLabel}>
          Haug ({pile.length}){hasSelection && !isDraggingActive ? ' – trykk for å legge tilbake' : ''}
        </span>
        <div className={styles.pile}>
          {pile.map(id => (
            <button
              key={id}
              className={`${styles.item}
                ${selected === id && !isDraggingActive ? styles.itemSelected : ''}
                ${isDraggingActive && drag?.itemId === id ? styles.itemDragging : ''}`}
              onPointerDown={e => handleItemPointerDown(e, id, 'pile')}
              onClick={e => e.stopPropagation()}
              aria-label={`${task.itemName} – trykk eller dra`}
            >
              {task.itemEmoji}
            </button>
          ))}
          {pile.length === 0 && <span className={styles.emptyPile}>Tom</span>}
        </div>
      </div>

      {/* Hurtigflytt toggle */}
      <button
        className={styles.quickToggle}
        onClick={() => setShowQuick(prev => !prev)}
        aria-expanded={showQuick}
      >
        ⚡ Hurtigflytt {showQuick ? '▲' : '▼'}
      </button>

      {/* Hurtigflytt panel */}
      {showQuick && (
        <div className={styles.quickPanel} onClick={e => e.stopPropagation()}>
          {task.personNames.map(name => (
            <div key={name} className={styles.quickPerson}>
              <span className={styles.quickPersonName}>{name}</span>
              <div className={styles.quickButtons}>
                <button
                  className={styles.giveBtn}
                  onClick={() => giveFromPile(name, 1)}
                  disabled={pile.length < 1}
                  aria-label={`Gi 1 til ${name}`}
                >
                  +1
                </button>
                <button
                  className={styles.returnBtn}
                  onClick={() => returnToPile(name)}
                  disabled={baskets[name].length === 0}
                  aria-label={`Gi tilbake 1 fra ${name}`}
                >
                  -1
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Check / feedback */}
      <div className={styles.actions}>
        {feedback === 'none' && (
          <button className={styles.checkBtn} onClick={checkAnswer}>
            Sjekk svar ✓
          </button>
        )}

        {feedback === 'correct' && (
          <div className={styles.feedbackCorrect}>
            <p className={styles.feedbackText}>{feedbackMsg}</p>
            <button className={styles.newTaskBtn} onClick={handleNextQuestion}>
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

      {/* Drag ghost */}
      {isDraggingActive && drag && (
        <div
          className={styles.dragGhost}
          style={{ left: drag.currentX, top: drag.currentY }}
          aria-hidden="true"
        >
          {task.itemEmoji}
        </div>
      )}
    </div>
  );
}
