import type { Game } from '../types';
import styles from './GameCard.module.css';

interface Props {
  game: Game;
  onClick: (id: Game['id']) => void;
}

export default function GameCard({ game, onClick }: Props) {
  return (
    <button
      className={styles.card}
      style={{ '--card-color': game.color } as React.CSSProperties}
      onClick={() => onClick(game.id)}
    >
      <span className={styles.emoji}>{game.emoji}</span>
      <span className={styles.title}>{game.title}</span>
      <span className={styles.description}>{game.description}</span>
    </button>
  );
}
