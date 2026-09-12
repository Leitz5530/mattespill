import type { AlgebraTask, AlgebraTaskType } from './algebraTypes';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const ALL_TYPES: AlgebraTaskType[] = [
  'x_plus_a',
  'x_minus_a',
  'ax',
  'ax_plus_c',
  'ax_minus_c',
];

export function generateAlgebraTask(recentTypes: AlgebraTaskType[] = []): AlgebraTask {
  const available = ALL_TYPES.filter(t => !recentTypes.slice(-2).includes(t));
  const pool = available.length > 0 ? available : ALL_TYPES;
  const type = pool[Math.floor(Math.random() * pool.length)];

  switch (type) {
    case 'x_plus_a': {
      const x = randInt(1, 10);
      const a = randInt(1, 10);
      return { type, coefficient: 1, constant: a, rightSide: x + a, solution: x };
    }
    case 'x_minus_a': {
      const x = randInt(2, 10);
      const a = randInt(1, x - 1);
      return { type, coefficient: 1, constant: -a, rightSide: x - a, solution: x };
    }
    case 'ax': {
      const x = randInt(1, 10);
      const a = randInt(2, 5);
      return { type, coefficient: a, constant: 0, rightSide: a * x, solution: x };
    }
    case 'ax_plus_c': {
      const a = randInt(2, 5);
      const x = randInt(1, 10);
      const c = randInt(1, 10);
      return { type, coefficient: a, constant: c, rightSide: a * x + c, solution: x };
    }
    case 'ax_minus_c': {
      const a = randInt(2, 5);
      const x = randInt(2, 10);
      const maxC = Math.min(10, a * x - 1);
      const c = randInt(1, maxC);
      return { type, coefficient: a, constant: -c, rightSide: a * x - c, solution: x };
    }
  }
}
