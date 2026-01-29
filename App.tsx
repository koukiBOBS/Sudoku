import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Difficulty, Grid, GameState, Language } from './types';
import { generateSudoku, validateGridState, checkWin } from './services/sudokuLogic';
import { getSmartHint } from './services/geminiService';
import { getTranslation } from './translations';
import Board from './components/Board';
import Header from './components/Header';
import Controls from './components/Controls';
import NumberPad from './components/NumberPad';
import Modal from './components/Modal';
import { IconTrophy } from './components/Icons';

const App: React.FC = () => {
  // State
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [grid, setGrid] = useState<Grid>([]);
  const [history, setHistory] = useState<Grid[]>([]);
  const [selectedCell, setSelectedCell] = useState<{ r: number, c: number } | null>(null);
  const [isNoteMode, setIsNoteMode] = useState(false);
  const [timer, setTimer] = useState(0);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost' | 'setup'>('playing');
  const [mistakes, setMistakes] = useState(0);
  const [language, setLanguage] = useState<Language>('zh'); // Default to Chinese
  
  // Hint State
  const [hintModalOpen, setHintModalOpen] = useState(false);
  const [hintText, setHintText] = useState("");
  const [isHintLoading, setIsHintLoading] = useState(false);

  // Timer Ref
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Translations
  const t = getTranslation(language);

  // Initialize Game
  const startNewGame = useCallback((diff: Difficulty = difficulty) => {
    const newGrid = generateSudoku(diff);
    setGrid(newGrid);
    setHistory([]);
    setTimer(0);
    setMistakes(0);
    setSelectedCell(null);
    setHintModalOpen(false);

    if (diff === 'Custom') {
        setStatus('setup');
    } else {
        setStatus('playing');
    }
  }, [difficulty]);

  // Initial Load
  useEffect(() => {
    startNewGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer Logic
  useEffect(() => {
    if (status === 'playing') {
      timerRef.current = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  // Handle User Input (Number)
  const handleNumberInput = (num: number) => {
    if ((status !== 'playing' && status !== 'setup') || !selectedCell) return;
    const { r, c } = selectedCell;
    const currentCell = grid[r][c];

    // Cannot edit initial cells (unless in setup mode)
    if (currentCell.isInitial && status !== 'setup') return;

    const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
    const target = newGrid[r][c];

    // Push current state to history before mutation
    setHistory((prev) => [...prev, grid]); 
    // Optimization: In a real app, limit history depth (e.g., last 20 moves)

    if (isNoteMode && status === 'playing') {
      const newNotes = new Set(target.notes);
      if (newNotes.has(num)) newNotes.delete(num);
      else newNotes.add(num);
      target.notes = newNotes;
      target.value = null; // Clear value if taking notes
    } else {
      // If setting same value, clear it
      if (target.value === num) {
          target.value = null;
      } else {
          target.value = num;
          target.notes.clear(); // Clear notes if setting value
      }
    }

    // Validate
    const validatedGrid = validateGridState(newGrid);
    
    // Check for mistake (if not note mode and invalid, and not setup)
    if (status === 'playing' && !isNoteMode && validatedGrid[r][c].value !== null && !validatedGrid[r][c].isValid) {
        setMistakes(m => {
            const newM = m + 1;
            if (newM >= 3) {
                setStatus('lost');
            }
            return newM;
        });
    }

    setGrid(validatedGrid);

    // Check Win (only when playing)
    if (status === 'playing' && checkWin(validatedGrid)) {
      setStatus('won');
    }
  };

  // Handle Erase
  const handleErase = () => {
    if ((status !== 'playing' && status !== 'setup') || !selectedCell) return;
    const { r, c } = selectedCell;
    if (grid[r][c].isInitial && status !== 'setup') return;

    setHistory((prev) => [...prev, grid]);
    const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
    newGrid[r][c].value = null;
    newGrid[r][c].notes.clear();
    newGrid[r][c].isValid = true;
    
    setGrid(validateGridState(newGrid));
  };

  // Handle Undo
  const handleUndo = () => {
    if (history.length === 0 || (status !== 'playing' && status !== 'setup')) return;
    const previousGrid = history[history.length - 1];
    setGrid(previousGrid);
    setHistory((prev) => prev.slice(0, -1));
  };

  // Handle Start Custom Game
  const handleStartCustomGame = () => {
      // Check if board is valid (no red cells) and has at least some numbers (e.g. 17 is standard minimum for unique solution, but let's allow anything valid > 0)
      const hasInvalid = grid.some(row => row.some(cell => !cell.isValid));
      const hasNumbers = grid.some(row => row.some(cell => cell.value !== null));

      if (hasInvalid) {
          alert(language === 'zh' ? "棋盘存在错误，请先修正红色单元格。" : "The board contains errors. Please fix red cells before starting.");
          return;
      }
      if (!hasNumbers) {
          alert(language === 'zh' ? "请先输入一些数字。" : "Please enter some numbers first.");
          return;
      }

      // Lock current cells as initial
      const finalGrid = grid.map(row => row.map(cell => ({
          ...cell,
          isInitial: cell.value !== null,
          notes: new Set<number>() // Clear any notes that might have been made (unlikely but safe)
      })));

      setGrid(finalGrid);
      setHistory([]); // Clear history of setup
      setStatus('playing');
  };

  // Handle Hint (Gemini)
  const handleHint = async () => {
    if (status !== 'playing') return;
    setIsHintLoading(true);
    
    const result = await getSmartHint(grid, language);
    
    setHintText(result.text);
    if (result.cell) {
      setSelectedCell(result.cell);
    }
    setHintModalOpen(true);
    setIsHintLoading(false);
  };

  // Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if(status !== 'playing' && status !== 'setup') return;
        
        // Navigation
        if(selectedCell) {
            if(['ArrowUp', 'w'].includes(e.key)) setSelectedCell(p => ({...p!, r: Math.max(0, p!.r - 1)}));
            if(['ArrowDown', 's'].includes(e.key)) setSelectedCell(p => ({...p!, r: Math.min(8, p!.r + 1)}));
            if(['ArrowLeft', 'a'].includes(e.key)) setSelectedCell(p => ({...p!, c: Math.max(0, p!.c - 1)}));
            if(['ArrowRight', 'd'].includes(e.key)) setSelectedCell(p => ({...p!, c: Math.min(8, p!.c + 1)}));
        }

        // Numbers
        if (e.key >= '1' && e.key <= '9') handleNumberInput(parseInt(e.key));
        if (e.key === 'Backspace' || e.key === 'Delete') handleErase();
        if (e.key === 'n') setIsNoteMode(prev => !prev);
        if (e.key === 'z' && (e.ctrlKey || e.metaKey)) handleUndo();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, status, isNoteMode, grid, language]); // Deps needed for closures

  // Determine current selected number for highlighting
  const currentHighlight = selectedCell && grid[selectedCell.r][selectedCell.c].value;

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 overflow-hidden">
      
      {/* Header Section: Compact and Functional */}
      <div className="flex-none z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <Header 
          difficulty={difficulty} 
          setDifficulty={(d) => {
              setDifficulty(d);
              startNewGame(d);
          }}
          timer={timer}
          onNewGame={() => startNewGame(difficulty)}
          mistakes={mistakes}
          status={status}
          language={language}
          setLanguage={setLanguage}
        />
      </div>

      {/* Main Board Section: Flexible Height, Centered */}
      <div className="flex-grow flex items-center justify-center p-4 min-h-0 bg-slate-50/50">
        <div className="w-full max-w-[45vh] sm:max-w-md aspect-square shadow-xl rounded-xl overflow-hidden">
          <Board 
            grid={grid} 
            selectedCell={selectedCell} 
            onCellClick={(r, c) => setSelectedCell({ r, c })} 
            highlightNumber={currentHighlight}
          />
        </div>
      </div>

      {/* Controls & Input Section: Anchored Bottom */}
      <div className="flex-none bg-white border-t border-slate-100 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] pb-6 sm:pb-8 pt-2 z-20">
        <div className="w-full max-w-md mx-auto px-2 space-y-2">
            
          <Controls 
            onUndo={handleUndo}
            onErase={handleErase}
            onNoteToggle={() => setIsNoteMode(!isNoteMode)}
            isNoteMode={isNoteMode}
            onHint={handleHint}
            onNewGame={() => startNewGame(difficulty)}
            isHintLoading={isHintLoading}
            canUndo={history.length > 0}
            status={status}
            onStartCustomGame={handleStartCustomGame}
            language={language}
          />

          <NumberPad onNumberClick={handleNumberInput} />
          
        </div>
      </div>

      {/* Hint Modal */}
      <Modal 
        isOpen={hintModalOpen} 
        onClose={() => setHintModalOpen(false)}
        title={t.hintTitle}
        closeLabel={t.close}
      >
        <p>{hintText}</p>
      </Modal>

      {/* Game Over Modal (Win) */}
      <Modal 
        isOpen={status === 'won'} 
        onClose={() => {}} 
        title={t.congrats}
        actionButtonText={t.newGameBtn}
        onAction={() => startNewGame(difficulty)}
        closeLabel={t.close}
      >
        <div className="flex flex-col items-center text-center gap-4">
            <div className="p-4 bg-yellow-100 rounded-full text-yellow-600">
                <IconTrophy />
            </div>
            <p>{t.solvedMsg(t.modes[difficulty], `${Math.floor(timer/60)}m ${timer%60}s`)}</p>
        </div>
      </Modal>

      {/* Game Over Modal (Lost) */}
      <Modal 
        isOpen={status === 'lost'} 
        onClose={() => {}} 
        title={t.gameOver}
        actionButtonText={t.tryAgain}
        onAction={() => startNewGame(difficulty)}
        closeLabel={t.close}
      >
        <p className="text-center text-slate-600">{t.lostMsg}</p>
      </Modal>

    </div>
  );
};

export default App;
