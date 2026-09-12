export type AlgebraTaskType =
  | 'x_plus_a'
  | 'x_minus_a'
  | 'ax'
  | 'ax_plus_c'
  | 'ax_minus_c';

export interface AlgebraTask {
  type: AlgebraTaskType;
  coefficient: number;
  constant: number;
  rightSide: number;
  solution: number;
}

export interface AlgebraRoundResult {
  totalQuestions: number;
  solvedClean: number;
  hadMistakes: number;
}
