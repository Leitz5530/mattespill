import { useState } from 'react';
import type { RoundResult, TallkaosSettings } from '../../types';
import { defaultSettings } from './tallkaosDefaults';
import TallkaosSettingsScreen from './TallkaosSettingsScreen';
import TallkaosPlayScreen from './TallkaosPlayScreen';
import TallkaosResultScreen from './TallkaosResultScreen';

interface Props {
  onGoHome: () => void;
}

type Phase = 'settings' | 'playing' | 'result';

export default function TallkaosGame({ onGoHome }: Props) {
  const [phase, setPhase]       = useState<Phase>('settings');
  const [settings, setSettings] = useState<TallkaosSettings>(defaultSettings);
  const [result, setResult]     = useState<RoundResult | null>(null);

  if (phase === 'playing') {
    return (
      <TallkaosPlayScreen
        settings={settings}
        onFinish={(r) => { setResult(r); setPhase('result'); }}
      />
    );
  }

  if (phase === 'result' && result) {
    return (
      <TallkaosResultScreen
        result={result}
        settings={settings}
        onPlayAgain={() => setPhase('settings')}
        onGoHome={onGoHome}
      />
    );
  }

  return (
    <TallkaosSettingsScreen
      initialSettings={settings}
      onStart={(s) => { setSettings(s); setPhase('playing'); }}
    />
  );
}
