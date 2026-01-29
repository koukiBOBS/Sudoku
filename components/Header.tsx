import React, { useState } from 'react';
import { Difficulty, Language } from '../types';
import { IconPlus, IconLanguage } from './Icons';
import { getTranslation } from '../translations';

interface HeaderProps {
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  timer: number;
  onNewGame: () => void;
  mistakes: number;
  status: 'playing' | 'won' | 'lost' | 'setup';
  language: Language;
  setLanguage: (l: Language) => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const Header: React.FC<HeaderProps> = ({ difficulty, setDifficulty, timer, onNewGame, mistakes, status, language, setLanguage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = getTranslation(language);

  return (
    <div className="w-full max-w-md mx-auto px-4 py-2">
      {/* Top Bar: Title/Difficulty and Actions */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex flex-col">
            <h1 className="text-xl font-bold text-slate-800 leading-tight">{t.title}</h1>
            <span className="text-xs text-slate-500 font-medium">{t.modes[difficulty]} {t.modeLabel}</span>
        </div>

        <div className="flex items-center gap-2">
             {/* Timer / Status Pill */}
             <div className={`text-sm sm:text-base font-mono font-medium px-2 py-1 sm:px-3 rounded-full ${
                status === 'setup' 
                ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                : 'text-slate-700 bg-slate-100 border border-slate-200'
            }`}>
                {status === 'setup' ? t.status.setup : formatTime(timer)}
            </div>

            {/* Language Toggle */}
            <button 
                onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 active:bg-slate-200 transition-colors"
                aria-label="Toggle Language"
            >
               {language === 'en' ? <span className="font-bold text-xs">CN</span> : <span className="font-bold text-xs">EN</span>}
            </button>

            {/* New Game Button */}
            <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 active:bg-indigo-200 transition-colors"
                aria-label="Menu"
            >
                <IconPlus />
            </button>
        </div>
      </div>

      {/* Difficulty Dropdown/Menu (Collapsible) */}
      {isMenuOpen && (
          <div className="absolute top-16 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur shadow-lg border-y border-slate-100 animate-in slide-in-from-top-2">
              <div className="max-w-md mx-auto">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{t.newGameTitle}</p>
                <div className="grid grid-cols-3 gap-2">
                    {(['Easy', 'Medium', 'Hard', 'Expert', 'Custom'] as Difficulty[]).map((level) => (
                    <button
                        key={level}
                        onClick={() => {
                            setDifficulty(level);
                            setIsMenuOpen(false);
                        }}
                        className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
                        difficulty === level
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                        }`}
                    >
                        {t.modes[level]}
                    </button>
                    ))}
                </div>
              </div>
          </div>
      )}
      
       {/* Info Bar */}
       <div className="flex justify-between text-xs sm:text-sm font-medium text-slate-500">
           {status !== 'setup' ? (
             <span className={`flex items-center gap-1 ${mistakes > 2 ? 'text-red-500' : ''}`}>
                {t.mistakes}: <span className="text-slate-700">{mistakes}/3</span>
             </span>
           ) : (
             <span className="text-amber-600">{t.setupPrompt}</span>
           )}
           <span>
             {status === 'playing' ? t.gameInProgress : 
              status === 'won' ? t.status.won : 
              status === 'lost' ? t.status.lost : t.setup}
           </span>
       </div>
    </div>
  );
};

export default Header;
