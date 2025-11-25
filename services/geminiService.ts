import { GoogleGenAI, Type, Schema } from "@google/genai";
import { RetroItem, AIAnalysisResult, Category, BrainstormResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A concise executive summary of the retrospective board.",
    },
    sentiment: {
      type: Type.STRING,
      description: "Overall team sentiment (e.g., Optimistic, Frustrated, Focused).",
    },
    topActionItems: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3-5 high impact action items based on the feedback.",
    },
    categoryInsights: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          insight: { type: Type.STRING, description: "Specific analysis for this category." },
        },
        required: ["category", "insight"],
      },
    },
  },
  required: ["summary", "sentiment", "topActionItems", "categoryInsights"],
};

const brainstormSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    [Category.KEEP]: { type: Type.ARRAY, items: { type: Type.STRING } },
    [Category.IMPROVE]: { type: Type.ARRAY, items: { type: Type.STRING } },
    [Category.START]: { type: Type.ARRAY, items: { type: Type.STRING } },
    [Category.STOP]: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: [Category.KEEP, Category.IMPROVE, Category.START, Category.STOP],
};

export const analyzeBoard = async (items: RetroItem[], goal: string = ""): Promise<AIAnalysisResult> => {
  if (items.length === 0) {
    throw new Error("Board is empty. Add some items before analyzing.");
  }

  // Group items for the prompt
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item.text);
    return acc;
  }, {} as Record<Category, string[]>);

  const prompt = `
    Analyze this "Keep, Improve, Start, Stop" retrospective board.
    
    ${goal ? `CONTEXT / TEAM GOAL: The main goal or focus for this period was: "${goal}". Please evaluate the feedback in the context of this goal.` : ''}

    Here is the data:
    ${JSON.stringify(groupedItems, null, 2)}
    
    Provide a constructive, forward-looking analysis useful for an agile team.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are an expert Agile Coach helping a team analyze their retrospective.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AIAnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze board. Please try again.");
  }
};

export const suggestIdeas = async (goal: string, context: string = ""): Promise<BrainstormResult> => {
  if (!goal.trim()) {
    throw new Error("Goal is required for suggestions.");
  }

  const prompt = `
    The user has a specific goal for their Retrospective/Planning session: "${goal}".
    
    ${context ? `ADDITIONAL CONTEXT / CONSTRAINTS: "${context}"` : ''}
    
    Generate a list of 3-4 specific, actionable, and realistic ideas for each category of the KISS (Keep, Improve, Start, Stop) method that would help achieve this goal.
    ${context ? 'Ensure the suggestions are strictly aligned with the provided context and constraints.' : ''}
    
    - KEEP: What positive habits should continue?
    - IMPROVE: What existing actions need to be tweaked or increased?
    - START: What new strategies should be introduced?
    - STOP: What blockers or bad habits should be eliminated?
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: brainstormSchema,
        systemInstruction: "You are a helpful coach and strategist providing specific ideas to help the user achieve their goal.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as BrainstormResult;
  } catch (error) {
    console.error("Gemini Brainstorm Error:", error);
    throw new Error("Failed to generate suggestions. Please try again.");
  }
};