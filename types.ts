export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Custom';

export type CellValue = number | null;

export interface CellData {
  value: CellValue;
  isInitial: boolean; // True if part of the puzzle start
  notes: Set<number>;
  isValid: boolean; // False if it conflicts with row/col/box
}

export type Grid = CellData[][];

export interface GameState {
  grid: Grid;
  status: 'playing' | 'won' | 'lost' | 'setup';
  difficulty: Difficulty;
  timeElapsed: number;
  history: Grid[]; // For undo functionality
  mistakes: number;
}

export interface HintResponse {
  text: string;
  cell?: { r: number, c: number };
}

export type Language = 'en' | 'zh';
