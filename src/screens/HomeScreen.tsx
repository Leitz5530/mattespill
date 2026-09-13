import { useState } from 'react';
import GameCard from '../components/GameCard';
import { games, type GameCategory } from '../gameCatalog';
import type { GameId } from '../types';
import styles from './HomeScreen.module.css';
const categories: GameCategory[] = ['Alle spill', 'Tall og regning', 'Deling og brøk', 'Likhet og algebra'];
export default function HomeScreen({ onSelectGame }: { onSelectGame: (id: GameId) => void }) {
  const [category, setCategory] = useState<GameCategory>('Alle spill');
  const [help, setHelp] = useState(false);
  const visible = games.filter(game => category === 'Alle spill' || game.category === category);
  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <a className={styles.brand} href="#" aria-label="Mattespill startside"><span className={styles.brandIcon} aria-hidden="true">m<span>✦</span></span>matte<span>spill</span></a>
        <button className={styles.helpButton} onClick={() => setHelp(!help)} aria-expanded={help} aria-controls="grownup-help"><span aria-hidden="true">ⓘ</span> Til voksne</button>
      </header>
      {help && <aside id="grownup-help" className={styles.help}><h2>Små økter. Store oppdagelser.</h2><p>Velg et spill sammen, og tilpass nivå og antall oppgaver før dere starter. La barnet prøve selv og snakk om hvordan svaret ble til. Tallkaos har valg for lyd. Personlige rekorder lagres i denne nettleseren.</p><button onClick={() => setHelp(false)}>Lukk tips</button></aside>}
      <section className={styles.hero} aria-labelledby="welcome-title">
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}><span aria-hidden="true">✦</span> EN LITEN VERDEN AV MATTE</span>
          <h1 id="welcome-title">Lek deg til<br /><span>nye oppdagelser.</span></h1>
          <p>Tell, del og løs små mysterier.<br />Her vokser matteglede, ett spill om gangen.</p>
          <a className={styles.primary} href="#spill">Finn ditt spill <span aria-hidden="true">↗</span></a>
          <div className={styles.heroNote}><span aria-hidden="true">✓</span> Prøv selv. Ta din tid. Ha det gøy.</div>
        </div>
        <div className={styles.heroArt}><img src="/art/matteverden.webp" alt="En vennlig liten figur i en fargerik landsby med butikk, pizzakjøkken og verksted" fetchPriority="high" /><span className={styles.artBadge}><span aria-hidden="true">✦</span> Her er det lov å prøve!</span></div>
      </section>
      <section id="spill" className={styles.library} aria-labelledby="games-title">
        <div className={styles.sectionHeading}><div><span className={styles.eyebrow}>HVA VIL DU UTFORSKE I DAG?</span><h2 id="games-title">Finn din matteglede <span aria-hidden="true">✦</span></h2></div><span className={styles.gameCount}>6 små eventyr å velge mellom</span></div>
        <div className={styles.filters} aria-label="Filtrer spill etter tema">{categories.map(item => <button key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div>
        <div className={styles.games}>{visible.map(game => <GameCard key={game.id} game={game} onClick={onSelectGame} />)}</div>
        <p className={styles.resultCount} role="status">Viser {visible.length} av 6 spill</p>
      </section>
      <footer className={styles.footer}><span><strong>Små steg teller.</strong> Det er sånn vi lærer.</span><span>Laget for nysgjerrige hoder <span aria-hidden="true">♡</span></span></footer>
    </main>
  );
}

