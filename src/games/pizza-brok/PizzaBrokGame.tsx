import { useState } from 'react';
import type { PizzaBrokRoundResult } from './pizzaBrokTypes';
import PizzaBrokStartScreen from './PizzaBrokStartScreen';
import PizzaBrokPlayScreen from './PizzaBrokPlayScreen';
import PizzaBrokResultScreen from './PizzaBrokResultScreen';

interface Props {
  onGoHome: () => void;
}

type Phase = 'start' | 'playing' | 'result';

export default function PizzaBrokGame({ onGoHome }: Props) {
  const [phase, setPhase] = useState<Phase>('start');
  const [questionCount, setQuestionCount] = useState(5);
  const [result, setResult] = useState<PizzaBrokRoundResult | null>(null);

  function handleStart(count: number) {
    setQuestionCount(count);
    setPhase('playing');
  }

  function handleRoundComplete(r: PizzaBrokRoundResult) {
    setResult(r);
    setPhase('result');
  }

  function handlePlayAgain(count: number) {
    setQuestionCount(count);
    setPhase('start');
  }

  if (phase === 'playing') {
    return (
      <PizzaBrokPlayScreen
        totalQuestions={questionCount}
        onRoundComplete={handleRoundComplete}
      />
    );
  }

  if (phase === 'result' && result) {
    return (
      <PizzaBrokResultScreen
        result={result}
        onPlayAgain={handlePlayAgain}
        onGoHome={onGoHome}
      />
    );
  }

  return (
    <PizzaBrokStartScreen
      initialCount={questionCount}
      onStart={handleStart}
    />
  );
}
