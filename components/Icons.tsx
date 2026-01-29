import React from 'react';
import { Eraser, RotateCcw, Lightbulb, Play, Plus, Pencil, Trophy, Languages } from 'lucide-react';

export const IconEraser = () => <Eraser size={20} />;
export const IconUndo = () => <RotateCcw size={20} />;
export const IconHint = () => <Lightbulb size={20} />;
export const IconPlay = () => <Play size={20} />;
export const IconPlus = () => <Plus size={20} />;
export const IconPencil = ({active}: {active: boolean}) => <Pencil size={20} className={active ? "fill-current" : ""} />;
export const IconTrophy = () => <Trophy size={24} />;
export const IconLanguage = () => <Languages size={20} />;
