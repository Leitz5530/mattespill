export type ButikkLevel = 'easy' | 'normal' | 'hard';

export interface ButikkItem {
  name: string;
  emoji: string;
  price: number;
}

export interface ButikkTask {
  items: ButikkItem[];
  totalPrice: number;
  availableDenominations: number[];
}

export interface ButikkRoundResult {
  totalQuestions: number;
  firstTryCorrect: number;
  hadMistakes: number;
  level: ButikkLevel;
}
