import React from 'react';

interface NumberPadProps {
  onNumberClick: (num: number) => void;
}

const NumberPad: React.FC<NumberPadProps> = ({ onNumberClick }) => {
  return (
    <div className="flex justify-between gap-1 sm:gap-2 w-full px-1 mt-2">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <button
          key={num}
          onClick={() => onNumberClick(num)}
          className="flex-1 aspect-[4/5] sm:aspect-square flex items-center justify-center text-2xl sm:text-3xl font-medium text-indigo-600 bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.05)] border border-indigo-100 hover:bg-indigo-50 hover:-translate-y-0.5 active:translate-y-0 active:bg-indigo-100 transition-all duration-150"
        >
          {num}
        </button>
      ))}
    </div>
  );
};

export default NumberPad;