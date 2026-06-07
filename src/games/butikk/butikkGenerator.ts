import type { ButikkLevel, ButikkItem, ButikkTask } from './butikkTypes';

const ALL_ITEMS = [
  { name: 'Eple', emoji: '🍎' },
  { name: 'Banan', emoji: '🍌' },
  { name: 'Is', emoji: '🍦' },
  { name: 'Juice', emoji: '🧃' },
  { name: 'Bolle', emoji: '🥐' },
  { name: 'Bok', emoji: '📚' },
  { name: 'Ball', emoji: '⚽' },
  { name: 'Blyant', emoji: '✏️' },
];

const EASY_PRICES   = [3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 15, 17, 18, 20];
const NORMAL_PRICES = [10, 12, 14, 15, 17, 18, 20, 22, 24, 25, 27, 30];
const HARD_PRICES   = [10, 12, 14, 15, 17, 18, 20, 22, 24, 25, 28, 30, 35, 40];

function rnd<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickFromPool(pool: number[], recentTotals: number[]): number {
  const recent = recentTotals.slice(-2);
  const filtered = pool.filter(p => !recent.includes(p));
  return rnd(filtered.length > 0 ? filtered : pool);
}

function pickItem(usedNames: string[]): { name: string; emoji: string } {
  const available = ALL_ITEMS.filter(i => !usedNames.includes(i.name));
  return rnd(available.length > 0 ? available : ALL_ITEMS);
}

function buildTask(items: ButikkItem[], denoms: number[]): ButikkTask {
  return {
    items,
    totalPrice: items.reduce((s, it) => s + it.price, 0),
    availableDenominations: denoms,
  };
}

export function generateButikkTask(level: ButikkLevel, recentTotals: number[] = []): ButikkTask {
  if (level === 'easy') {
    const price = pickFromPool(EASY_PRICES, recentTotals);
    const { name, emoji } = pickItem([]);
    return buildTask([{ name, emoji, price }], [1, 5, 10, 20]);
  }

  if (level === 'normal') {
    // Always two items — the challenge is to sum them mentally
    const { name: n1, emoji: e1 } = pickItem([]);
    const { name: n2, emoji: e2 } = pickItem([n1]);
    const p1 = rnd(NORMAL_PRICES);
    const p2Pool = NORMAL_PRICES.filter(p => p !== p1 && p1 + p <= 50 && p1 + p >= 10);
    const p2 = rnd(p2Pool.length > 0 ? p2Pool : NORMAL_PRICES);
    const total = p1 + p2;
    const denoms = total > 30 ? [1, 5, 10, 20, 50] : [1, 5, 10, 20];
    return buildTask(
      [{ name: n1, emoji: e1, price: p1 }, { name: n2, emoji: e2, price: p2 }],
      denoms,
    );
  }

  // hard: 2–3 items, total roughly 25–100 kr
  const numItems = Math.random() < 0.4 ? 2 : 3;
  const usedNames: string[] = [];
  const items: ButikkItem[] = [];
  let runningTotal = 0;

  for (let i = 0; i < numItems; i++) {
    const { name, emoji } = pickItem(usedNames);
    usedNames.push(name);
    const isLast = i === numItems - 1;
    let price: number;
    if (isLast) {
      const minNeeded = Math.max(5, 25 - runningTotal);
      const maxNeeded = Math.min(50, 100 - runningTotal);
      const valid = HARD_PRICES.filter(p => p >= minNeeded && p <= maxNeeded);
      price = rnd(valid.length > 0 ? valid : HARD_PRICES);
    } else {
      const maxRoom = 100 - runningTotal - (numItems - i - 1) * 5;
      const valid = HARD_PRICES.filter(p => p <= maxRoom);
      price = rnd(valid.length > 0 ? valid : HARD_PRICES);
    }
    items.push({ name, emoji, price });
    runningTotal += price;
  }

  return buildTask(items, [1, 5, 10, 20, 50, 100]);
}
