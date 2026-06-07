import { useState } from 'react';
import type { VektskalaLevel, VektskalaRoundResult } from './vektskalaTypes';
import VektskalaStartScreen from './VektskalaStartScreen';
import VektskalaPlayScreen from './VektskalaPlayScreen';
import VektskalaResultScreen from './VektskalaResultScreen';

interface Props {
  onGoHome: () => void;
}

type Phase = 'start' | 'playing' | 'result';

export default function VektskalaGame({ onGoHome }: Props) {
  const [phase, setPhase] = useState<Phase>('start');
  const [questionCount, setQuestionCount] = useState(5);
  const [level, setLevel] = useState<VektskalaLevel>('easy');
  const [result, setResult] = useState<VektskalaRoundResult | null>(null);

  function handleStart(count: number, selectedLevel: VektskalaLevel) {
    setQuestionCount(count);
    setLevel(selectedLevel);
    setPhase('playing');
  }

  function handleRoundComplete(r: VektskalaRoundResult) {
    setResult(r);
    setPhase('result');
  }

  function handlePlayAgain(count: number) {
    setQuestionCount(count);
    setPhase('start');
  }

  if (phase === 'playing') {
    return (
      <VektskalaPlayScreen
        totalQuestions={questionCount}
        level={level}
        onRoundComplete={handleRoundComplete}
      />
    );
  }

  if (phase === 'result' && result) {
    return (
      <VektskalaResultScreen
        result={result}
        onPlayAgain={handlePlayAgain}
        onGoHome={onGoHome}
      />
    );
  }

  return (
    <VektskalaStartScreen
      initialCount={questionCount}
      initialLevel={level}
      onStart={handleStart}
    />
  );
}
