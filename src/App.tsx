import { useState } from 'react';
import type { GameId } from './types';
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';

type Screen = { name: 'home' } | { name: 'game'; gameId: GameId };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' });

  if (screen.name === 'game') {
    return (
      <GameScreen
        gameId={screen.gameId}
        onBack={() => setScreen({ name: 'home' })}
      />
    );
  }

  return (
    <HomeScreen
      onSelectGame={(id) => setScreen({ name: 'game', gameId: id })}
    />
  );
}
