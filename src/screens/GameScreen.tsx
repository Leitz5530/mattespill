import type { GameId } from '../types';
import TallkaosGame from '../games/tallkaos/TallkaosGame';
import DelRettferdigGame from '../games/del-rettferdig/DelRettferdigGame';
import PizzaBrokGame from '../games/pizza-brok/PizzaBrokGame';
import VektskalaGame from '../games/vektskala/VektskalaGame';
import ButikkGame from '../games/butikk/ButikkGame';
import AlgebraGame from '../games/algebra-verksted/AlgebraGame';
import styles from './GameScreen.module.css';

interface Props {
  gameId: GameId;
  onBack: () => void;
}

const GAME_TITLES: Record<GameId, string> = {
  tallkaos: 'Tallkaos',
  'del-rettferdig': 'Del rettferdig',
  'pizza-brok': 'Pizza-brøk',
  vektskala: 'Vektskåla',
  butikk: 'Butikk',
  'algebra-verksted': 'Algebra-verksted',
};

function GameContent({ gameId, onGoHome }: { gameId: GameId; onGoHome: () => void }) {
  if (gameId === 'tallkaos') return <TallkaosGame onGoHome={onGoHome} />;
  if (gameId === 'del-rettferdig') return <DelRettferdigGame onGoHome={onGoHome} />;
  if (gameId === 'pizza-brok') return <PizzaBrokGame onGoHome={onGoHome} />;
  if (gameId === 'vektskala') return <VektskalaGame onGoHome={onGoHome} />;
  if (gameId === 'butikk') return <ButikkGame onGoHome={onGoHome} />;
  if (gameId === 'algebra-verksted') return <AlgebraGame onGoHome={onGoHome} />;
  return null;
}

export default function GameScreen({ gameId, onBack }: Props) {
  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Tilbake til startskjermen">
          ← Tilbake
        </button>
        <h1 className={styles.title}>{GAME_TITLES[gameId]}</h1>
      </header>

      <section className={styles.content}>
        <GameContent gameId={gameId} onGoHome={onBack} />
      </section>
    </main>
  );
}
