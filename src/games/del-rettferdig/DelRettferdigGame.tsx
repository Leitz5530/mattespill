import { useState } from 'react';
import type { RoundResult } from './fairShareTypes';
import DelRettferdigStartScreen from './DelRettferdigStartScreen';
import DelRettferdigPlayScreen from './DelRettferdigPlayScreen';
import DelRettferdigResultScreen from './DelRettferdigResultScreen';

interface Props {
  onGoHome: () => void;
}

type Phase = 'start' | 'playing' | 'result';

export default function DelRettferdigGame({ onGoHome }: Props) {
  const [phase, setPhase] = useState<Phase>('start');
  const [questionCount, setQuestionCount] = useState(5);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);

  function handleStart(count: number) {
    setQuestionCount(count);
    setPhase('playing');
  }

  function handleRoundComplete(result: RoundResult) {
    setRoundResult(result);
    setPhase('result');
  }

  function handlePlayAgain(count: number) {
    setQuestionCount(count);
    setPhase('start');
  }

  if (phase === 'playing') {
    return (
      <DelRettferdigPlayScreen
        totalQuestions={questionCount}
        onRoundComplete={handleRoundComplete}
      />
    );
  }

  if (phase === 'result' && roundResult) {
    return (
      <DelRettferdigResultScreen
        result={roundResult}
        onPlayAgain={handlePlayAgain}
        onGoHome={onGoHome}
      />
    );
  }

  return (
    <DelRettferdigStartScreen
      initialCount={questionCount}
      onStart={handleStart}
    />
  );
}
