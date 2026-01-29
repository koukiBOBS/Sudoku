import { Language } from './types';

export const translations = {
  en: {
    title: "Zenith",
    modes: { Easy: "Easy", Medium: "Medium", Hard: "Hard", Expert: "Expert", Custom: "Custom" },
    status: { setup: "SETUP", playing: "Playing", won: "Complete", lost: "Game Over" },
    controls: { undo: "Undo", erase: "Erase", notes: "Notes", notesOn: "Notes On", hint: "Hint", thinking: "Thinking...", clear: "Clear", start: "Start Game" },
    mistakes: "Mistakes",
    setupPrompt: "Enter puzzle numbers",
    newGameTitle: "New Game Difficulty",
    congrats: "Congratulations!",
    gameOver: "Game Over",
    solvedMsg: (diff: string, time: string) => `You solved the ${diff} puzzle in ${time}!`,
    lostMsg: "You made 3 mistakes. Keep practicing!",
    close: "Close",
    tryAgain: "Try Again",
    newGameBtn: "New Game",
    hintTitle: "Smart Hint",
    modeLabel: "Mode",
    gameInProgress: "Game in Progress",
    setup: "Setup"
  },
  zh: {
    title: "巅峰数独",
    modes: { Easy: "简单", Medium: "中等", Hard: "困难", Expert: "专家", Custom: "自定义" },
    status: { setup: "设置", playing: "进行中", won: "完成", lost: "结束" },
    controls: { undo: "撤销", erase: "擦除", notes: "笔记", notesOn: "笔记开启", hint: "提示", thinking: "思考中...", clear: "清空", start: "开始游戏" },
    mistakes: "错误",
    setupPrompt: "请输入谜题数字",
    newGameTitle: "新游戏难度",
    congrats: "恭喜！",
    gameOver: "游戏结束",
    solvedMsg: (diff: string, time: string) => `你在 ${time} 内完成了 ${diff} 难度的谜题！`,
    lostMsg: "你犯了3个错误。请继续练习！",
    close: "关闭",
    tryAgain: "再试一次",
    newGameBtn: "新游戏",
    hintTitle: "智能提示",
    modeLabel: "模式",
    gameInProgress: "游戏进行中",
    setup: "设置模式"
  }
};

export const getTranslation = (lang: Language) => translations[lang];
