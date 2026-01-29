import { CellData, Grid, Difficulty } from '../types';

const BLANK = 0;

// Helper to check if a number is valid in a specific position
const isValidMove = (board: number[][], row: number, col: number, num: number): boolean => {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }

  // Check col
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false;
  }

  // Check 3x3 box
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) return false;
    }
  }

  return true;
};

// Solves the board using backtracking. Returns true if solved.
const solveBoard = (board: number[][]): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === BLANK) {
        // Try numbers 1-9 (shuffled for randomness if generating)
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        // Note: For deterministic solving, don't shuffle. For generation, we shuffle outside.
        
        for (const num of nums) {
          if (isValidMove(board, row, col, num)) {
            board[row][col] = num;
            if (solveBoard(board)) return true;
            board[row][col] = BLANK;
          }
        }
        return false;
      }
    }
  }
  return true;
};

// Generates a new Sudoku board
export const generateSudoku = (difficulty: Difficulty): Grid => {
  // Return empty grid for Custom (Setup) mode
  if (difficulty === 'Custom') {
    return Array.from({ length: 9 }, () => Array(9).fill(null).map(() => ({
      value: null,
      isInitial: false,
      notes: new Set<number>(),
      isValid: true,
    })));
  }

  // 1. Create empty board
  const board: number[][] = Array.from({ length: 9 }, () => Array(9).fill(BLANK));

  // 2. Fill diagonal 3x3 matrices (independent of each other) to ensure valid start
  for (let i = 0; i < 9; i = i + 3) {
    fillBox(board, i, i);
  }

  // 3. Solve the rest to get a complete valid board
  solveBoard(board);

  // 4. Remove elements based on difficulty
  // Easy: ~36-40 clues removed
  // Medium: ~46-50 clues removed
  // Hard: ~52-56 clues removed
  // Expert: ~58-62 clues removed
  let attempts = 5;
  switch (difficulty) {
    case 'Easy': attempts = 30; break;
    case 'Medium': attempts = 45; break;
    case 'Hard': attempts = 54; break;
    case 'Expert': attempts = 60; break;
  }

  const puzzleBoard = board.map(row => [...row]); // Copy solved board
  
  while (attempts > 0) {
    let row = Math.floor(Math.random() * 9);
    let col = Math.floor(Math.random() * 9);
    while (puzzleBoard[row][col] === 0) {
      row = Math.floor(Math.random() * 9);
      col = Math.floor(Math.random() * 9);
    }
    
    // Backup incase removing makes it unsolvable (shouldn't happen with standard removal but good practice)
    // Actually simpler logic: just remove. 
    // A true generator ensures unique solution, but for this simplified app, random removal is usually sufficient for playability.
    puzzleBoard[row][col] = BLANK;
    attempts--;
  }

  // Convert to CellData structure
  return puzzleBoard.map((row) =>
    row.map((val) => ({
      value: val === 0 ? null : val,
      isInitial: val !== 0,
      notes: new Set<number>(),
      isValid: true,
    }))
  );
};

const fillBox = (board: number[][], row: number, col: number) => {
  let num: number;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      do {
        num = Math.floor(Math.random() * 9) + 1;
      } while (!isSafeInBox(board, row, col, num));
      board[row + i][col + j] = num;
    }
  }
};

const isSafeInBox = (board: number[][], row: number, col: number, num: number) => {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[row + i][col + j] === num) return false;
    }
  }
  return true;
};

// Check for conflicts in the current state (visual validation)
export const validateGridState = (grid: Grid): Grid => {
  const newGrid = grid.map(row => row.map(cell => ({ ...cell, isValid: true })));
  
  // Rows
  for (let r = 0; r < 9; r++) {
    const seen = new Map<number, number[]>();
    for (let c = 0; c < 9; c++) {
      const val = newGrid[r][c].value;
      if (val !== null) {
        if (!seen.has(val)) seen.set(val, []);
        seen.get(val)!.push(c);
      }
    }
    seen.forEach((indices) => {
      if (indices.length > 1) indices.forEach(c => newGrid[r][c].isValid = false);
    });
  }

  // Cols
  for (let c = 0; c < 9; c++) {
    const seen = new Map<number, number[]>();
    for (let r = 0; r < 9; r++) {
      const val = newGrid[r][c].value;
      if (val !== null) {
        if (!seen.has(val)) seen.set(val, []);
        seen.get(val)!.push(r);
      }
    }
    seen.forEach((indices) => {
      if (indices.length > 1) indices.forEach(r => newGrid[r][c].isValid = false);
    });
  }

  // Boxes
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      const seen = new Map<number, {r: number, c: number}[]>();
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const r = br * 3 + i;
          const c = bc * 3 + j;
          const val = newGrid[r][c].value;
          if (val !== null) {
             if (!seen.has(val)) seen.set(val, []);
             seen.get(val)!.push({r, c});
          }
        }
      }
      seen.forEach((cells) => {
        if (cells.length > 1) cells.forEach(pos => newGrid[pos.r][pos.c].isValid = false);
      });
    }
  }

  return newGrid;
};

export const checkWin = (grid: Grid): boolean => {
  for(let r=0; r<9; r++){
    for(let c=0; c<9; c++){
      if(grid[r][c].value === null || !grid[r][c].isValid) return false;
    }
  }
  return true;
};