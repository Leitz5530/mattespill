export type EquationType = 'add-left' | 'add-right' | 'sub-left' | 'sub-right' | 'mul-left' | 'mul-right';

export type VektskalaLevel = 'easy' | 'normal' | 'hard';

export interface VektskalaQuestion {
  id: string;
  equationType: EquationType;
  knownOperand: number;
  target: number;
  missingValue: number;
  choices: number[];
}

export interface VektskalaRoundResult {
  totalQuestions: number;
  firstTryCorrect: number;
  hadMistakes: number;
}
