import GameCard from '../components/GameCard';
import type { Game, GameId } from '../types';
import styles from './HomeScreen.module.css';

const GAMES: Game[] = [
  {
    id: 'tallkaos',
    title: 'Tallkaos',
    emoji: '🔢',
    description: 'Finn riktig svar i tallhavet!',
    color: '#ff6b6b',
  },
  {
    id: 'del-rettferdig',
    title: 'Del rettferdig',
    emoji: '🍕',
    description: 'Del likt mellom venner!',
    color: '#4ecdc4',
  },
];

interface Props {
  onSelectGame: (id: GameId) => void;
}

export default function HomeScreen({ onSelectGame }: Props) {
  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Mattespill</h1>
        <p className={styles.subtitle}>Et lekent mattespill</p>
      </header>

      <section className={styles.games} aria-label="Velg spill">
        {GAMES.map((game) => (
          <GameCard key={game.id} game={game} onClick={onSelectGame} />
        ))}
      </section>
    </main>
  );
}
