import { useState } from 'react';
import type { AlgebraRoundResult } from './algebraTypes';
import AlgebraStartScreen from './AlgebraStartScreen';
import AlgebraPlayScreen from './AlgebraPlayScreen';
import AlgebraResultScreen from './AlgebraResultScreen';

interface Props {
  onGoHome: () => void;
}

type Phase = 'start' | 'playing' | 'result';

export default function AlgebraGame({ onGoHome }: Props) {
  const [phase, setPhase] = useState<Phase>('start');
  const [questionCount, setQuestionCount] = useState(5);
  const [roundResult, setRoundResult] = useState<AlgebraRoundResult | null>(null);

  function handleStart(count: number) {
    setQuestionCount(count);
    setPhase('playing');
  }

  function handleRoundComplete(result: AlgebraRoundResult) {
    setRoundResult(result);
    setPhase('result');
  }

  function handlePlayAgain(count: number) {
    setQuestionCount(count);
    setPhase('playing');
  }

  if (phase === 'playing') {
    return (
      <AlgebraPlayScreen
        totalQuestions={questionCount}
        onRoundComplete={handleRoundComplete}
      />
    );
  }

  if (phase === 'result' && roundResult) {
    return (
      <AlgebraResultScreen
        result={roundResult}
        onPlayAgain={handlePlayAgain}
        onGoHome={onGoHome}
      />
    );
  }

  return (
    <AlgebraStartScreen
      initialCount={questionCount}
      onStart={handleStart}
    />
  );
}
