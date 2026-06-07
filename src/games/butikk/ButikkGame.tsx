import { useState } from 'react';
import type { ButikkLevel, ButikkRoundResult } from './butikkTypes';
import ButikkStartScreen from './ButikkStartScreen';
import ButikkPlayScreen from './ButikkPlayScreen';
import ButikkResultScreen from './ButikkResultScreen';

interface Props {
  onGoHome: () => void;
}

type Phase = 'start' | 'playing' | 'result';

export default function ButikkGame({ onGoHome }: Props) {
  const [phase, setPhase] = useState<Phase>('start');
  const [questionCount, setQuestionCount] = useState(5);
  const [level, setLevel] = useState<ButikkLevel>('easy');
  const [roundResult, setRoundResult] = useState<ButikkRoundResult | null>(null);

  function handleStart(count: number, newLevel: ButikkLevel) {
    setQuestionCount(count);
    setLevel(newLevel);
    setPhase('playing');
  }

  function handleRoundComplete(result: ButikkRoundResult) {
    setRoundResult(result);
    setPhase('result');
  }

  function handlePlayAgain(count: number) {
    setQuestionCount(count);
    setPhase('start');
  }

  if (phase === 'playing') {
    return (
      <ButikkPlayScreen
        totalQuestions={questionCount}
        level={level}
        onRoundComplete={handleRoundComplete}
      />
    );
  }

  if (phase === 'result' && roundResult) {
    return (
      <ButikkResultScreen
        result={roundResult}
        onPlayAgain={handlePlayAgain}
        onGoHome={onGoHome}
      />
    );
  }

  return (
    <ButikkStartScreen
      initialCount={questionCount}
      initialLevel={level}
      onStart={handleStart}
    />
  );
}
