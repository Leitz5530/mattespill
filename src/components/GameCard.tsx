import { gameArt, type CatalogGame } from '../gameCatalog';
import styles from './GameCard.module.css';
export default function GameCard({ game, onClick }: { game: CatalogGame; onClick: (id: CatalogGame['id']) => void }) {
  return <button className={styles.card} style={{ '--card-color': game.color, '--card-tint': game.tint } as React.CSSProperties} onClick={() => onClick(game.id)}>
    <span className={styles.art}><img src={gameArt(game.id)} alt="" loading="lazy" /><span className={styles.skill}>{game.skill}</span></span>
    <span className={styles.copy}><span className={styles.title}>{game.title}</span><span className={styles.description}>{game.description}</span><span className={styles.action}>{game.action}<span className={styles.arrow} aria-hidden="true">↗</span></span></span>
  </button>;
}
