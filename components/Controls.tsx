import React from 'react';
import { IconUndo, IconEraser, IconPencil, IconHint, IconPlay } from './Icons';
import { Language } from '../types';
import { getTranslation } from '../translations';

interface ControlsProps {
  onUndo: () => void;
  onErase: () => void;
  onNoteToggle: () => void;
  isNoteMode: boolean;
  onHint: () => void;
  onNewGame: () => void;
  isHintLoading: boolean;
  canUndo: boolean;
  status: 'playing' | 'won' | 'lost' | 'setup';
  onStartCustomGame: () => void;
  language: Language;
}

const Controls: React.FC<ControlsProps> = ({ 
  onUndo, 
  onErase, 
  onNoteToggle, 
  isNoteMode, 
  onHint, 
  isHintLoading,
  canUndo,
  status,
  onStartCustomGame,
  onNewGame,
  language
}) => {
  const t = getTranslation(language);
  const btnBase = "flex flex-col items-center justify-center gap-1 w-full h-14 rounded-xl transition-all duration-200 font-medium text-[10px] sm:text-xs active:scale-95";
  const btnInactive = "text-slate-500 hover:bg-slate-50 hover:text-indigo-600";
  const btnActive = "bg-indigo-600 text-white shadow-md shadow-indigo-200";

  // Special Setup Mode Controls
  if (status === 'setup') {
    return (
      <div className="flex gap-3 w-full px-2 mb-2">
         <button onClick={onNewGame} className={`${btnBase} ${btnInactive} bg-slate-50 border border-slate-200`}>
            <IconEraser /> 
            <span>{t.controls.clear}</span>
        </button>
        <button 
            onClick={onStartCustomGame}
            className={`${btnBase} bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700`}
        >
            <IconPlay />
            <span>{t.controls.start}</span>
        </button>
      </div>
    );
  }

  // Normal Gameplay Controls
  return (
    <div className="flex justify-between gap-1 sm:gap-4 w-full px-1">
      <button onClick={onUndo} disabled={!canUndo} className={`${btnBase} ${!canUndo ? 'opacity-40' : btnInactive}`}>
        <IconUndo />
        <span>{t.controls.undo}</span>
      </button>

      <button onClick={onErase} className={`${btnBase} ${btnInactive}`}>
        <IconEraser />
        <span>{t.controls.erase}</span>
      </button>

      <button onClick={onNoteToggle} className={`${btnBase} ${isNoteMode ? btnActive : btnInactive} ${isNoteMode ? '' : 'bg-slate-50/50'}`}>
        <IconPencil active={isNoteMode} />
        <span>{isNoteMode ? t.controls.notesOn : t.controls.notes}</span>
      </button>

      <button onClick={onHint} disabled={isHintLoading} className={`${btnBase} ${btnInactive} ${isHintLoading ? 'animate-pulse' : ''}`}>
        <IconHint />
        <span>{isHintLoading ? t.controls.thinking : t.controls.hint}</span>
      </button>
    </div>
  );
};

export default Controls;
