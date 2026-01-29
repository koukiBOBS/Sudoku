import React from 'react';
import { Grid, CellData } from '../types';

interface BoardProps {
  grid: Grid;
  selectedCell: { r: number; c: number } | null;
  onCellClick: (r: number, c: number) => void;
  highlightNumber: number | null;
}

const Board: React.FC<BoardProps> = ({ grid, selectedCell, onCellClick, highlightNumber }) => {
  return (
    <div className="w-full max-w-md aspect-square bg-slate-800 p-2 sm:p-3 rounded-xl shadow-2xl mx-auto select-none">
      <div className="grid grid-cols-9 grid-rows-[repeat(9,1fr)] h-full w-full bg-slate-300 gap-[1px] border-[2px] border-slate-800">
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const isSelected = selectedCell?.r === r && selectedCell?.c === c;
            
            // Logic for visual groupings
            const isSameRow = selectedCell?.r === r;
            const isSameCol = selectedCell?.c === c;
            const isSameBox = selectedCell && 
              Math.floor(selectedCell.r / 3) === Math.floor(r / 3) &&
              Math.floor(selectedCell.c / 3) === Math.floor(c / 3);
            
            const isRelated = !isSelected && (isSameRow || isSameCol || isSameBox);
            
            // Highlight all cells with the same number as selected (if selected has a value)
            const isSameValue = highlightNumber !== null && cell.value === highlightNumber;

            // Border logic for 3x3 blocks
            const borderRight = (c + 1) % 3 === 0 && c !== 8 ? 'border-r-2 border-r-slate-800' : '';
            const borderBottom = (r + 1) % 3 === 0 && r !== 8 ? 'border-b-2 border-b-slate-800' : '';

            let bgClass = "bg-white"; // Default
            if (!cell.isValid) bgClass = "bg-red-200"; // Error
            else if (isSelected) bgClass = "bg-indigo-500 text-white"; // Selected
            else if (isSameValue) bgClass = "bg-indigo-200"; // Same number match
            else if (isRelated) bgClass = "bg-indigo-50"; // Related row/col/box

            const textClass = isSelected 
                ? "text-white" 
                : cell.isInitial 
                    ? "text-slate-900 font-bold" 
                    : !cell.isValid 
                        ? "text-red-600" 
                        : "text-indigo-600";

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => onCellClick(r, c)}
                className={`
                  relative flex items-center justify-center cursor-pointer transition-colors duration-75
                  ${bgClass}
                  ${borderRight} ${borderBottom}
                `}
                style={{
                    // Small visual hack to ensure borders between 3x3 grids look thick within the gap system
                    boxShadow: isSelected ? 'inset 0 0 0 2px rgba(255,255,255,0.4)' : 'none'
                }}
              >
                {cell.value !== null ? (
                  <span className={`text-xl sm:text-3xl ${textClass}`}>
                    {cell.value}
                  </span>
                ) : (
                  // Render Notes
                  <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-[1px]">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <div key={n} className="flex items-center justify-center">
                        {cell.notes.has(n) && (
                          <span className="text-[8px] sm:text-[10px] leading-none text-slate-500 font-medium">
                            {n}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Board;