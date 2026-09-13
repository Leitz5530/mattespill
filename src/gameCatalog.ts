import type { Game, GameId } from './types';
export type GameCategory = 'Alle spill' | 'Tall og regning' | 'Deling og brøk' | 'Likhet og algebra';
export interface CatalogGame extends Game { category: GameCategory; skill: string; action: string; tint: string; }
export const games: CatalogGame[] = [
  { id: 'tallkaos', title: 'Tallkaos', emoji: '🔢', description: 'Finn svaret i et hav av tall. Klar for en ny personlig rekord?', color: '#bb4931', tint: '#fff0e8', category: 'Tall og regning', skill: 'Hoderegning', action: 'Finn riktig tall' },
  { id: 'del-rettferdig', title: 'Del rettferdig', emoji: '🍎', description: 'Litt til deg, litt til meg. Dra og fordel så alle får riktig mengde.', color: '#237b65', tint: '#eaf7ef', category: 'Deling og brøk', skill: 'Mengder og deling', action: 'Dra og fordel' },
  { id: 'pizza-brok', title: 'Pizza-brøk', emoji: '🍕', description: 'Små biter, store oppdagelser. Sett sammen riktig mengde pizza.', color: '#95621c', tint: '#fff7df', category: 'Deling og brøk', skill: 'Brøkforståelse', action: 'Bygg med brøker' },
  { id: 'vektskala', title: 'Vektskåla', emoji: '⚖️', description: 'Hva mangler på den andre siden? Utforsk tall som er i balanse.', color: '#7952a7', tint: '#f3edfb', category: 'Likhet og algebra', skill: 'Likhet og ukjente', action: 'Finn balansen' },
  { id: 'butikk', title: 'Butikk', emoji: '🛒', description: 'Velkommen til nærbutikken! Tell varene og betal akkurat nok.', color: '#237b65', tint: '#eaf7ef', category: 'Tall og regning', skill: 'Penger og summer', action: 'Handle og tell' },
  { id: 'algebra-verksted', title: 'Algebra-verksted', emoji: '🧮', description: 'Flytt, del og oppdag. Løs ligningen ett lite steg om gangen.', color: '#386bb0', tint: '#eaf2fe', category: 'Likhet og algebra', skill: 'Ligninger', action: 'Få x alene' },
];
export const gameArt = (id: GameId) => `/art/${id}.webp`;
