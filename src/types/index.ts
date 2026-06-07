export type GameId = 'tallkaos' | 'del-rettferdig' | 'pizza-brok' | 'vektskala' | 'butikk';

export interface Game {
  id: GameId;
  title: string;
  emoji: string;
  description: string;
  color: string;
}

export type MathOperator = 'add' | 'subtract' | 'multiply' | 'divide';
export type PlayMode = 'fixedQuestions' | 'fixedTime' | 'challenge' | 'practice';
export type Difficulty = 'easy' | 'normal' | 'hard';

export interface TallkaosSettings {
  operators: MathOperator[];
  playMode: PlayMode;
  questionCount: number;
  timeLimitSeconds: number;
  difficulty: Difficulty;
  soundEnabled: boolean;
  calmMode: boolean;
  numberOfChoices: number;
  maxRotationDegrees: number;
}

export interface ArithmeticQuestion {
  id: string;
  operator: MathOperator;
  left: number;
  right: number;
  answer: number;
  prompt: string;
  choices: number[];
}

export interface RoundResult {
  totalQuestions: number;
  correctFirstTry: number;
  withMistakes: number;
  durationMs: number;
}
