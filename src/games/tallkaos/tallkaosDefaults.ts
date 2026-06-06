import type { TallkaosSettings } from '../../types';

export const defaultSettings: TallkaosSettings = {
  operators: ['multiply'],
  playMode: 'fixedQuestions',
  questionCount: 10,
  timeLimitSeconds: 60,
  difficulty: 'normal',
  soundEnabled: true,
  calmMode: false,
  numberOfChoices: 12,
  maxRotationDegrees: 30,
};
