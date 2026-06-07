import { useState, useEffect, useRef, useCallback } from 'react';
import type { ArithmeticQuestion, RoundResult, TallkaosSettings } from '../../types';
import { generateArithmeticQuestion } from './questionGenerator';
import { formatDuration } from '../../utils/time';
import { playCorrectSound, playWrongSound } from './tallkaosSounds';
import NumberSea from './NumberSea';
import styles from './TallkaosPlayScreen.module.css';

interface Props {
  settings: TallkaosSettings;
  onFinish: (result: RoundResult) => void;
}

export default function TallkaosPlayScreen({ settings, onFinish }: Props) {
  const [questions] = useState<ArithmeticQuestion[]>(() =>
    Array.from({ length: settings.questionCount }, () => generateArithmeticQuestion(settings))
  );

  const [currentIndex, setCurrentIndex]       = useState(0);
  const [wrongPresses, setWrongPresses]       = useState<ReadonlySet<number>>(new Set());
  const [answered, setAnswered]               = useState(false);
  const [hadMistake, setHadMistake]           = useState(false);
  const [correctFirstTry, setCorrectFirstTry] = useState(0);
  const [withMistakes, setWithMistakes]       = useState(0);
  const [displayMs, setDisplayMs]             = useState(0);

  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef    = useRef<number>(Date.now());
  const frozenMsRef     = useRef<number | null>(null);

  useEffect(() => {
    startTimeRef.current = Date.now();
    const intervalId = setInterval(() => {
      setDisplayMs(frozenMsRef.current ?? (Date.now() - startTimeRef.current));
    }, 100);
    return () => {
      clearInterval(intervalId);
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  const { soundEnabled } = settings; // stable for the whole game session

  const question = questions[currentIndex];
  const isLast   = currentIndex === questions.length - 1;

  const advance = useCallback(() => {
    const nextCorrect  = hadMistake ? correctFirstTry : correctFirstTry + 1;
    const nextMistakes = hadMistake ? withMistakes + 1 : withMistakes;

    if (isLast) {
      const durationMs = frozenMsRef.current ?? (Date.now() - startTimeRef.current);
      onFinish({ totalQuestions: questions.length, correctFirstTry: nextCorrect, withMistakes: nextMistakes, durationMs });
      return;
    }

    setCorrectFirstTry(nextCorrect);
    setWithMistakes(nextMistakes);
    setCurrentIndex((i) => i + 1);
    setWrongPresses(new Set());
    setAnswered(false);
    setHadMistake(false);
  }, [hadMistake, correctFirstTry, withMistakes, isLast, onFinish, questions.length]);

  const handleChoice = useCallback((choice: number) => {
    if (answered) return;

    if (choice === question.answer) {
      playCorrectSound(soundEnabled);
      if (isLast) {
        frozenMsRef.current = Date.now() - startTimeRef.current;
      }
      setAnswered(true);
      advanceTimerRef.current = setTimeout(advance, 700);
    } else {
      playWrongSound(soundEnabled);
      setWrongPresses((prev) => new Set(prev).add(choice));
      setHadMistake(true);
    }
  }, [answered, question.answer, isLast, advance, soundEnabled]);

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <span className={styles.progress}>
          Oppgave {currentIndex + 1} av {questions.length}
        </span>
        <span className={styles.timer}>{formatDuration(displayMs)}</span>
        <span
          className={styles.score}
          aria-label={`Riktig: ${correctFirstTry}, med feil: ${withMistakes}`}
        >
          ✅ {correctFirstTry}&nbsp;&nbsp;❌ {withMistakes}
        </span>
      </div>

      <p className={styles.prompt}>{question.prompt}</p>

      <p className={`${styles.feedback} ${answered ? styles.correct : wrongPresses.size > 0 ? styles.wrong : ''}`}>
        {answered ? '🎉 Riktig!' : wrongPresses.size > 0 ? '❌ Prøv igjen' : ' '}
      </p>

      <NumberSea
        questionKey={question.id}
        choices={question.choices}
        wrongPresses={wrongPresses}
        answered={answered}
        correctAnswer={question.answer}
        onChoice={handleChoice}
        maxRotation={settings.maxRotationDegrees}
        difficulty={settings.difficulty}
      />
    </div>
  );
}
