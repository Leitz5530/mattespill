export type TaskType =
  | 'shareFromPile'
  | 'shareFromPerson'
  | 'makeEqual'
  | 'giveOneMore'
  | 'doubleAmount';

export interface FairShareTask {
  taskType: TaskType;
  itemEmoji: string;
  itemName: string;
  personNames: string[];
  totalItems: number;
  initialPile: number;
  initialCounts: Record<string, number>;
  targetCounts: Record<string, number>;
  taskPrompt: string;
  wrongHint: string;
}

const PERSONS = ['Anne', 'Ola', 'Arne', 'Kari'];

const FRUITS = [
  { emoji: '🍎', name: 'epler' },
  { emoji: '🍐', name: 'pærer' },
  { emoji: '🍕', name: 'pizzastykker' },
];

function pickRandom<T>(arr: T[]): T {
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

function joinNames(names: string[]): string {
  if (names.length === 1) return names[0];
  return names.slice(0, -1).join(', ') + ' og ' + names[names.length - 1];
}

// ---- Task generators ----

function shareFromPile(): FairShareTask {
  const personCount = Math.random() < 0.7 ? 2 : 3;
  const fruit = pickRandom(FRUITS);
  const personNames = shuffle(PERSONS).slice(0, personCount);

  // Small totals only: 2p → 4/6/8/10, 3p → 6/9/12
  const perPerson = personCount === 2
    ? pickRandom([2, 3, 4, 5])
    : pickRandom([2, 3, 4]);
  const totalItems = personCount * perPerson;

  return {
    taskType: 'shareFromPile',
    itemEmoji: fruit.emoji,
    itemName: fruit.name,
    personNames,
    totalItems,
    initialPile: totalItems,
    initialCounts: Object.fromEntries(personNames.map(n => [n, 0])),
    targetCounts: Object.fromEntries(personNames.map(n => [n, perPerson])),
    taskPrompt: `Del ${totalItems} ${fruit.name} likt mellom ${joinNames(personNames)}.`,
    wrongHint: 'Ikke helt ennå. Alle må ha like mange, og haugen må være tom.',
  };
}

function shareFromPerson(): FairShareTask {
  const personCount = Math.random() < 0.7 ? 2 : 3;
  // Cap at 4 per person to keep totals ≤ 12
  const perPerson = personCount === 2 ? pickRandom([2, 3, 4]) : pickRandom([2, 3]);
  const totalItems = personCount * perPerson;
  const fruit = pickRandom(FRUITS);
  const personNames = shuffle(PERSONS).slice(0, personCount);
  const startPerson = pickRandom(personNames);

  return {
    taskType: 'shareFromPerson',
    itemEmoji: fruit.emoji,
    itemName: fruit.name,
    personNames,
    totalItems,
    initialPile: 0,
    initialCounts: Object.fromEntries(
      personNames.map(n => [n, n === startPerson ? totalItems : 0])
    ),
    targetCounts: Object.fromEntries(personNames.map(n => [n, perPerson])),
    taskPrompt: `${startPerson} har ${totalItems} ${fruit.name}. Del dem likt mellom ${joinNames(personNames)}.`,
    wrongHint: 'Ikke helt ennå. Alle må ha like mange, og haugen må være tom.',
  };
}

function makeEqual(): FairShareTask {
  const fruit = pickRandom(FRUITS);
  const [personA, personB] = shuffle(PERSONS);
  const target = pickRandom([2, 3, 4, 5, 6]);
  const totalItems = 2 * target;
  const wrongHint = 'Ikke helt ennå. Begge må ha like mange, og haugen må være tom.';
  const taskPrompt = `${personA} og ${personB} skal ha like mange ${fruit.name}.`;
  const base = {
    taskType: 'makeEqual' as const,
    itemEmoji: fruit.emoji,
    itemName: fruit.name,
    personNames: [personA, personB],
    totalItems,
    targetCounts: { [personA]: target, [personB]: target },
    taskPrompt,
    wrongHint,
  };

  const variant = Math.random();

  if (variant < 0.50) {
    // A at target, B has k fewer, pile has k  (k=1 or 2, but k < target)
    const k = target >= 3 ? pickRandom([1, 2]) : 1;
    return {
      ...base,
      initialPile: k,
      initialCounts: { [personA]: target, [personB]: target - k },
    };
  }

  if (variant < 0.80) {
    // Pile empty, A has too few and B has too many (A gives to B won't work — B must return to pile)
    // Actually: A needs excess items from B via pile: A=target-excess, B=target+excess
    const excess = Math.min(pickRandom([1, 2]), target - 1); // ensure A >= 1
    return {
      ...base,
      initialPile: 0,
      initialCounts: { [personA]: target - excess, [personB]: target + excess },
    };
  }

  // Both one below target, pile has 2
  return {
    ...base,
    initialPile: 2,
    initialCounts: { [personA]: target - 1, [personB]: target - 1 },
  };
}

function giveOneMore(): FairShareTask {
  const fruit = pickRandom(FRUITS);
  const [personA, personB] = shuffle(PERSONS); // A = fewer, B = more
  const lessCount = pickRandom([2, 3, 4]);
  const moreCount = lessCount + 1;
  const totalItems = lessCount + moreCount;
  const taskPrompt = `${personB} skal ha én mer enn ${personA}.`;
  const wrongHint = 'Ikke helt ennå. Sjekk hvem som skal ha én mer.';
  const base = {
    taskType: 'giveOneMore' as const,
    itemEmoji: fruit.emoji,
    itemName: fruit.name,
    personNames: [personA, personB],
    totalItems,
    targetCounts: { [personA]: lessCount, [personB]: moreCount },
    taskPrompt,
    wrongHint,
  };

  const variant = Math.random();

  if (variant < 0.30) {
    // B already at target, A needs 1 from pile
    return { ...base, initialPile: 1, initialCounts: { [personA]: lessCount - 1, [personB]: moreCount } };
  }
  if (variant < 0.55) {
    // Both one short of target, pile has 2
    return { ...base, initialPile: 2, initialCounts: { [personA]: lessCount - 1, [personB]: moreCount - 1 } };
  }
  if (variant < 0.80) {
    // A already at target, B needs 1 from pile
    return { ...base, initialPile: 1, initialCounts: { [personA]: lessCount, [personB]: moreCount - 1 } };
  }
  // All in pile
  return { ...base, initialPile: totalItems, initialCounts: { [personA]: 0, [personB]: 0 } };
}

function doubleAmount(): FairShareTask {
  const fruit = pickRandom(FRUITS);
  const [personA, personB] = shuffle(PERSONS); // A = single, B = double
  const singleCount = pickRandom([2, 3, 4]);
  const doubleCount = singleCount * 2;
  const totalItems = singleCount + doubleCount;
  const taskPrompt = `${personB} skal ha dobbelt så mange ${fruit.name} som ${personA}.`;
  const wrongHint = 'Ikke helt ennå. Dobbelt betyr to ganger så mange.';
  const base = {
    taskType: 'doubleAmount' as const,
    itemEmoji: fruit.emoji,
    itemName: fruit.name,
    personNames: [personA, personB],
    totalItems,
    targetCounts: { [personA]: singleCount, [personB]: doubleCount },
    taskPrompt,
    wrongHint,
  };

  const variant = Math.random();

  if (variant < 0.30) {
    // B already at target, A needs 1 from pile
    return { ...base, initialPile: 1, initialCounts: { [personA]: singleCount - 1, [personB]: doubleCount } };
  }
  if (variant < 0.55) {
    // Both one short of target, pile has 2
    return { ...base, initialPile: 2, initialCounts: { [personA]: singleCount - 1, [personB]: doubleCount - 1 } };
  }
  if (variant < 0.80) {
    // A already at target, B needs 1 from pile
    return { ...base, initialPile: 1, initialCounts: { [personA]: singleCount, [personB]: doubleCount - 1 } };
  }
  // All in pile
  return { ...base, initialPile: totalItems, initialCounts: { [personA]: 0, [personB]: 0 } };
}

// ---- Weighted picker ----

const TASK_TABLE: { gen: () => FairShareTask; cumulative: number }[] = (() => {
  const weights: { gen: () => FairShareTask; w: number }[] = [
    { gen: makeEqual,       w: 0.35 },
    { gen: giveOneMore,     w: 0.25 },
    { gen: doubleAmount,    w: 0.20 },
    { gen: shareFromPerson, w: 0.15 },
    { gen: shareFromPile,   w: 0.05 },
  ];
  let cum = 0;
  return weights.map(({ gen, w }) => { cum += w; return { gen, cumulative: cum }; });
})();

export function generateFairShareTask(): FairShareTask {
  const rand = Math.random();
  for (const { gen, cumulative } of TASK_TABLE) {
    if (rand < cumulative) return gen();
  }
  return makeEqual();
}
