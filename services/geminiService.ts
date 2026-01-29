import { GoogleGenAI, Type } from "@google/genai";
import { Grid, HintResponse, Language } from "../types";

// Helper to convert grid to string representation
const gridToString = (grid: Grid): string => {
  return grid.map(row => 
    row.map(cell => cell.value === null ? 0 : cell.value).join(',')
  ).join('\n');
};

export const getSmartHint = async (grid: Grid, lang: Language): Promise<HintResponse> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return { text: lang === 'zh' ? "缺少 API 密钥。请配置您的环境。" : "API Key is missing. Please configure your environment." };
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const languageInstruction = lang === 'zh' 
      ? "You must provide the 'explanation' field in Simplified Chinese (zh-CN)." 
      : "You must provide the 'explanation' field in English.";

    const prompt = `
      You are a Grandmaster Sudoku Instructor.
      Analyze the following Sudoku board (0 represents empty cells).
      
      ${gridToString(grid)}

      Your task:
      1. Find the next logical move. Look for "Naked Singles", "Hidden Singles", or obvious constraints.
      2. If the board has mistakes (duplicate numbers in row/col/box), point that out.
      3. Explain the logic simply to a player. e.g. "In Row 3, the number 5 is missing and can only go in..."
      4. ${languageInstruction}
      5. Return the result in JSON format with two fields: "explanation" (string) and "targetCell" (object with 'row' and 'col' 0-indexed integers). If no specific move is found or the board is broken, targetCell can be null.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            targetCell: {
              type: Type.OBJECT,
              properties: {
                row: { type: Type.INTEGER },
                col: { type: Type.INTEGER }
              },
              nullable: true
            }
          },
          required: ["explanation"]
        }
      }
    });

    let jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");
    
    // Cleanup potential markdown code blocks if the model includes them
    jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    
    const result = JSON.parse(jsonText);
    
    return {
      text: result.explanation,
      cell: result.targetCell ? { r: result.targetCell.row, c: result.targetCell.col } : undefined
    };

  } catch (error) {
    console.error("Gemini Hint Error:", error);
    return { text: lang === 'zh' ? "暂时无法分析棋盘，请稍后再试。" : "I couldn't analyze the board right now. Please try again later." };
  }
};