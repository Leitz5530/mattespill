import { useEffect, useMemo, useState } from 'react';
import type { RoundResult, TallkaosSettings } from '../../types';
import { formatDuration } from '../../utils/time';
import { getBestTime, saveBestTime } from './tallkaosRecords';
import { playNewRecordSound, playRoundCompleteSound } from './tallkaosSounds';
import styles from './TallkaosResultScreen.module.css';

const PERFECT_MESSAGES = [
  'Perfekt runde!',
  'Knallbra! Du traff på første forsøk hver gang.',
  'Superrunde! Ingen bom.',
  'Full pott! Dette satt skikkelig bra.',
  'Imponerende! Alle svarene var riktige.',
];

const MISTAKE_MESSAGES = [
  'Bra jobbet! Du fullførte runden, men bommet litt underveis.',
  'God innsats! Noen små bom, men du kom i mål.',
  'Fint jobbet! Du fant svarene til slutt.',
  'Du klarte hele runden! Litt mer øving, så sitter det enda bedre.',
  'Bra gjennomført! Neste runde kan bli enda bedre.',
];

const SPEED_FAST = [
  'Lynraskt tempo!',
  'Dette gikk skikkelig fort!',
  'Du svarte i turbofart!',
  'Full fart fra start til mål!',
];

const SPEED_GOOD = [
  'God fart gjennom hele runden.',
  'Du holdt et fint tempo.',
  'Raskt og stødig jobbet.',
  'Dette var en effektiv runde.',
];

const SPEED_STEADY = [
  'Rolig og stødig gjennomført.',
  'Du tok deg tid og kom godt i mål.',
  'Fint tempo for god øving.',
  'Stødig jobbing hele veien.',
];

const SPEED_SLOW = [
  'Bra at du tok deg tid til å tenke.',
  'God øving! Tempoet kommer etter hvert.',
  'Du jobbet deg fint gjennom runden.',
  'Fortsett å øve, så går det raskere etter hvert.',
];

function pick(list: string[]): string {
  return list[Math.floor(Math.random() * list.length)];
}

function speedComment(secondsPerQuestion: number): string {
  if (secondsPerQuestion < 2.5) return pick(SPEED_FAST);
  if (secondsPerQuestion < 5)   return pick(SPEED_GOOD);
  if (secondsPerQuestion < 8)   return pick(SPEED_STEADY);
  return pick(SPEED_SLOW);
}

interface Props {
  result: RoundResult;
  settings: TallkaosSettings;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

function trophy(pct: number): string {
  if (pct === 100) return '🏆';
  if (pct >= 80)  return '🌟';
  if (pct >= 60)  return '👍';
  return '💪';
}

export default function TallkaosResultScreen({ result, settings, onPlayAgain, onGoHome }: Props) {
  const { totalQuestions, correctFirstTry, withMistakes, durationMs } = result;
  const pct = Math.round((correctFirstTry / totalQuestions) * 100);
  const isPerfect = withMistakes === 0;

  // Read previous best and determine new record — once on mount.
  const [{ prevBest, isNewRecord }] = useState(() => {
    const prev = getBestTime(settings);
    const isNew = isPerfect && (prev === null || durationMs < prev);
    return { prevBest: prev, isNewRecord: isNew };
  });

  // Save new record and play sound exactly once on mount.
  useEffect(() => {
    if (isNewRecord) {
      saveBestTime(settings, durationMs);
      playNewRecordSound(settings.soundEnabled);
    } else {
      playRoundCompleteSound(settings.soundEnabled);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const message = useMemo(
    () => pick(isPerfect ? PERFECT_MESSAGES : MISTAKE_MESSAGES),
  // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const speed = useMemo(
    () => speedComment(durationMs / 1000 / totalQuestions),
  // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className={styles.container}>
      <span className={styles.trophy}>{trophy(pct)}</span>

      <h2 className={styles.heading}>Runden er ferdig!</h2>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{totalQuestions}</span>
          <span className={styles.statLabel}>oppgaver</span>
        </div>
        <div className={`${styles.stat} ${styles.green}`}>
          <span className={styles.statValue}>{correctFirstTry}</span>
          <span className={styles.statLabel}>riktig på første forsøk</span>
        </div>
        <div className={`${styles.stat} ${styles.red}`}>
          <span className={styles.statValue}>{withMistakes}</span>
          <span className={styles.statLabel}>med feilforsøk</span>
        </div>
        <div className={`${styles.stat} ${styles.highlight}`}>
          <span className={styles.statValue}>{pct} %</span>
          <span className={styles.statLabel}>treffprosent</span>
        </div>
        <div className={`${styles.stat} ${styles.fullWidth}`}>
          <span className={styles.statValue}>{formatDuration(durationMs)}</span>
          <span className={styles.statLabel}>tid brukt</span>
        </div>
      </div>

      <p className={`${styles.message} ${isPerfect ? styles.messagePerfect : ''}`}>
        {message}
      </p>
      <p className={styles.speedComment}>{speed}</p>

      <div className={styles.bestTimeSection}>
        {isNewRecord && (
          <>
            <p className={styles.newRecord}>🏅 Ny personlig rekord!</p>
            {prevBest !== null && (
              <p className={styles.prevRecord}>Forrige rekord: {formatDuration(prevBest)}</p>
            )}
          </>
        )}
        {isPerfect && !isNewRecord && prevBest !== null && (
          <p className={styles.bestTimeNote}>Bestetid: {formatDuration(prevBest)}</p>
        )}
        {!isPerfect && (
          <>
            <p className={styles.bestTimeNote}>
              Bestetid settes kun ved ren runde.
            </p>
            {prevBest !== null && (
              <p className={styles.bestTimeNote}>Gjeldende bestetid: {formatDuration(prevBest)}</p>
            )}
          </>
        )}
      </div>

      <div className={styles.actions}>
        <button className={styles.primaryBtn} onClick={onPlayAgain}>
          Spill igjen
        </button>
        <button className={styles.secondaryBtn} onClick={onGoHome}>
          Hovedmeny
        </button>
      </div>
    </div>
  );
}
