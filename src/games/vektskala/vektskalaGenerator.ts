import type { EquationType, VektskalaLevel, VektskalaQuestion } from './vektskalaTypes';

let idCounter = 0;

function uid(): string {
  return `vs-${++idCounter}`;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function makeChoices(correct: number): number[] {
  const candidates = new Set<number>([correct]);
  const offsets = shuffle([-3, -2, -1, 1, 2, 3, -4, 4]);
  for (const d of offsets) {
    if (candidates.size >= 5) break;
    const v = correct + d;
    if (v >= 1 && v <= 20) candidates.add(v);
  }
  let extra = 1;
  while (candidates.size < 4 && extra < 20) {
    const vPos = correct + extra;
    const vNeg = correct - extra;
    if (vPos <= 20 && !candidates.has(vPos)) candidates.add(vPos);
    else if (vNeg >= 1 && !candidates.has(vNeg)) candidates.add(vNeg);
    extra++;
  }
  return shuffle([...candidates]);
}

function generateEasyNormalQuestion(): VektskalaQuestion {
  const types: EquationType[] = ['add-left', 'add-right', 'sub-left', 'sub-right'];
  const equationType = types[Math.floor(Math.random() * types.length)];

  let missing = 1;
  let known = 1;
  let target = 2;

  switch (equationType) {
    case 'add-left':
    case 'add-right': {
      missing = randInt(1, 10);
      known = randInt(1, Math.min(10, 20 - missing));
      target = missing + known;
      break;
    }
    case 'sub-right': {
      const c = randInt(1, 9);
      missing = randInt(1, Math.min(9, 19 - c));
      known = missing + c;
      target = c;
      break;
    }
    case 'sub-left': {
      const c = randInt(1, 6);
      known = randInt(1, Math.min(4, 10 - c));
      missing = c + known;
      target = c;
      break;
    }
  }

  return { id: uid(), equationType, knownOperand: known, target, missingValue: missing, choices: makeChoices(missing) };
}

function generateHardQuestion(): VektskalaQuestion {
  // 40 % multiplication, 60 % add/sub with larger numbers
  if (Math.random() < 0.4) {
    const equationType: EquationType = Math.random() < 0.5 ? 'mul-left' : 'mul-right';
    const known = randInt(2, 5);   // multiplier 2–5
    const missing = randInt(2, 9); // ? = 2–9
    const target = known * missing;
    return { id: uid(), equationType, knownOperand: known, target, missingValue: missing, choices: makeChoices(missing) };
  }

  const types: EquationType[] = ['add-left', 'add-right', 'sub-left', 'sub-right'];
  const equationType = types[Math.floor(Math.random() * types.length)];

  let missing = 1;
  let known = 1;
  let target = 2;

  switch (equationType) {
    case 'add-left':
    case 'add-right': {
      missing = randInt(4, 15);
      known = randInt(4, Math.min(15, 30 - missing));
      target = missing + known;
      break;
    }
    case 'sub-right': {
      const c = randInt(2, 12);
      missing = randInt(3, Math.min(12, 25 - c));
      known = missing + c;
      target = c;
      break;
    }
    case 'sub-left': {
      const c = randInt(2, 10);
      known = randInt(2, Math.min(8, 15 - c));
      missing = c + known;
      target = c;
      break;
    }
  }

  return { id: uid(), equationType, knownOperand: known, target, missingValue: missing, choices: makeChoices(missing) };
}

export function generateVektskalaQuestion(level: VektskalaLevel = 'easy'): VektskalaQuestion {
  if (level === 'hard') return generateHardQuestion();
  return generateEasyNormalQuestion();
}

export function computeLeftValue(q: VektskalaQuestion, selected: number): number {
  switch (q.equationType) {
    case 'add-left':  return selected + q.knownOperand;
    case 'add-right': return q.knownOperand + selected;
    case 'sub-left':  return selected - q.knownOperand;
    case 'sub-right': return q.knownOperand - selected;
    case 'mul-left':  return selected * q.knownOperand;
    case 'mul-right': return q.knownOperand * selected;
  }
}
