import type { Piece, PieceType, PizzaBrokTask } from './pizzaBrokTypes';

// 12ths as common denominator: 1/4=3, 1/3=4, 1/2=6, whole=12, two-whole=24
export const PIECE_VALUE: Record<PieceType, number> = {
  '1/2': 6,
  '1/3': 4,
  '1/4': 3,
};
export const WHOLE = 12;

interface TargetConfig {
  amount: number;
  prompt: string;
  successMsg: string;
  solutions: PieceType[][];
  maxDistractors: number;
}

const TARGETS: TargetConfig[] = [
  {
    amount: 6,
    prompt: 'Lag en halv pizza.',
    successMsg: 'Riktig! Det ble en halv pizza. 🎉',
    solutions: [
      ['1/2'],
      ['1/4', '1/4'],
    ],
    maxDistractors: 2,
  },
  {
    amount: 9,
    prompt: 'Lag tre fjerdedeler pizza.',
    successMsg: 'Riktig! Det ble tre fjerdedeler. 🎉',
    solutions: [
      ['1/2', '1/4'],
      ['1/4', '1/4', '1/4'],
    ],
    maxDistractors: 2,
  },
  {
    amount: 12,
    prompt: 'Lag én hel pizza.',
    successMsg: 'Riktig! Det ble én hel pizza. 🎉',
    solutions: [
      ['1/2', '1/2'],
      ['1/3', '1/3', '1/3'],
      ['1/4', '1/4', '1/4', '1/4'],
      ['1/2', '1/4', '1/4'],
    ],
    maxDistractors: 2,
  },
  {
    amount: 24,
    prompt: 'Lag to hele pizzaer.',
    successMsg: 'Riktig! Det ble to hele pizzaer. 🎉',
    solutions: [
      ['1/2', '1/2', '1/2', '1/2'],
      ['1/2', '1/2', '1/2', '1/4', '1/4'],
      ['1/2', '1/2', '1/4', '1/4', '1/4', '1/4'],
      ['1/3', '1/3', '1/3', '1/2', '1/2'],
    ],
    maxDistractors: 1,
  },
];

// Weights: [half=20%, three-quarters=20%, whole=45%, two-whole=15%]
const WEIGHTS = [0.20, 0.20, 0.45, 0.15];

// Total piece cap — keeps the board readable on mobile
const MAX_TOTAL_PIECES = 6;

const ALL_TYPES: PieceType[] = ['1/2', '1/3', '1/4'];

function pickWeighted<T>(items: T[], weights: number[]): T {
  const r = Math.random();
  let cumulative = 0;
  for (let i = 0; i < items.length; i++) {
    cumulative += weights[i];
    if (r < cumulative) return items[i];
  }
  return items[items.length - 1];
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let _nextId = 0;

export function generatePizzaBrokTask(): PizzaBrokTask {
  const config = pickWeighted(TARGETS, WEIGHTS);
  const solution = pick(config.solutions);

  // Cap distractors so total pieces never exceed MAX_TOTAL_PIECES
  const maxPossible = Math.min(config.maxDistractors, MAX_TOTAL_PIECES - solution.length);
  const numDistractors = maxPossible <= 0 ? 0 : Math.floor(Math.random() * (maxPossible + 1));
  const distractors: PieceType[] = Array.from({ length: numDistractors }, () => pick(ALL_TYPES));

  const pieces: Piece[] = shuffle([...solution, ...distractors]).map(type => ({
    id: _nextId++,
    type,
  }));

  return {
    id: `task-${_nextId}`,
    prompt: config.prompt,
    pieces,
    targetAmount: config.amount,
    successMsg: config.successMsg,
  };
}
