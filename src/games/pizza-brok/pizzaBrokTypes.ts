export type PieceType = '1/2' | '1/3' | '1/4';

export interface Piece {
  id: number;
  type: PieceType;
}

export interface PizzaBrokTask {
  id: string;
  prompt: string;
  pieces: Piece[];
  targetAmount: number;  // in 12ths: 6=half, 9=¾, 12=whole, 24=two whole
  successMsg: string;
}

export interface PizzaBrokRoundResult {
  totalQuestions: number;
  firstTryCorrect: number;
  hadMistakes: number;
}
