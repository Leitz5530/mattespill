import type { ArithmeticQuestion, MathOperator, TallkaosSettings } from '../../types';

// ── Number ranges per difficulty ─────────────────────────────────────────────

interface Range { min: number; max: number }

const OPERAND_RANGES: Record<
  TallkaosSettings['difficulty'],
  Record<MathOperator, { left: Range; right: Range }>
> = {
  easy: {
    add:      { left: { min: 0, max: 10 }, right: { min: 0, max: 10 } },
    subtract: { left: { min: 2, max: 10 }, right: { min: 0, max: 9  } },
    multiply: { left: { min: 1, max: 5  }, right: { min: 1, max: 5  } },
    divide:   { left: { min: 1, max: 5  }, right: { min: 1, max: 5  } },
  },
  normal: {
    add:      { left: { min: 0, max: 20  }, right: { min: 0, max: 20  } },
    subtract: { left: { min: 2, max: 20  }, right: { min: 0, max: 19  } },
    multiply: { left: { min: 1, max: 10  }, right: { min: 1, max: 10  } },
    divide:   { left: { min: 1, max: 10  }, right: { min: 1, max: 10  } },
  },
  hard: {
    add:      { left: { min: 0, max: 100  }, right: { min: 0, max: 100  } },
    subtract: { left: { min: 2, max: 100  }, right: { min: 0, max: 99   } },
    multiply: { left: { min: 1, max: 12   }, right: { min: 1, max: 12   } },
    divide:   { left: { min: 1, max: 12   }, right: { min: 1, max: 12   } },
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function operatorSymbol(op: MathOperator): string {
  return { add: '+', subtract: '−', multiply: '×', divide: '÷' }[op];
}

function pickOperator(operators: MathOperator[]): MathOperator {
  return operators[Math.floor(Math.random() * operators.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Operand generation ────────────────────────────────────────────────────────

function makeOperands(
  op: MathOperator,
  difficulty: TallkaosSettings['difficulty'],
): { left: number; right: number } {
  const { left: lr, right: rr } = OPERAND_RANGES[difficulty][op];

  if (op === 'subtract') {
    // Ensure answer >= 1: pick left first, then right < left
    const a = randInt(lr.min, lr.max);
    const b = randInt(rr.min, Math.min(a - 1, rr.max));
    return { left: a, right: b };
  }

  if (op === 'divide') {
    // Guaranteed whole-number result: pick divisor and quotient, compute dividend
    const divisor = randInt(rr.min, rr.max);
    const quotient = randInt(lr.min, lr.max);
    return { left: divisor * quotient, right: divisor };
  }

  return { left: randInt(lr.min, lr.max), right: randInt(rr.min, rr.max) };
}

// ── Distractor generation ─────────────────────────────────────────────────────

function makeChoices(answer: number, count: number): number[] {
  const chosen = new Set<number>([answer]);

  // Nearby offsets scaled to answer magnitude for plausible distractors
  const spread = Math.max(5, Math.ceil(answer * 0.2));
  let attempts = 0;
  while (chosen.size < count && attempts < 200) {
    attempts++;
    const offset = randInt(1, spread) * (Math.random() < 0.5 ? 1 : -1);
    const candidate = answer + offset;
    if (candidate > 0) chosen.add(candidate);
  }

  // Sequential fallback if not enough unique positive distractors
  let fill = 1;
  while (chosen.size < count) {
    if (!chosen.has(answer + fill)) chosen.add(answer + fill);
    if (chosen.size < count && answer - fill > 0 && !chosen.has(answer - fill)) {
      chosen.add(answer - fill);
    }
    fill++;
  }

  return shuffle([...chosen]);
}

// ── Public API ────────────────────────────────────────────────────────────────

export function generateArithmeticQuestion(settings: TallkaosSettings): ArithmeticQuestion {
  const operator = pickOperator(settings.operators);
  const { left, right } = makeOperands(operator, settings.difficulty);

  const answer =
    operator === 'add'      ? left + right :
    operator === 'subtract' ? left - right :
    operator === 'multiply' ? left * right :
    left / right;

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    operator,
    left,
    right,
    answer,
    prompt: `${left} ${operatorSymbol(operator)} ${right} = ?`,
    choices: makeChoices(answer, settings.numberOfChoices),
  };
}
