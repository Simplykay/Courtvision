
import { GoogleGenAI, Type } from "@google/genai";
import { GameInput, PredictionResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const fetchLiveGames = async (date: string): Promise<GameInput[]> => {
  const prompt = `Search for major professional basketball games (NBA, Euroleague, ACB, LNB, etc.) scheduled for ${date}. 
  Identify 3-5 high-profile matchups. Include Round numbers for European leagues if available.
  For each matchup, you must find or estimate based on latest season data:
  1. League name
  2. Team A (Home) and Team B (Away) names
  3. Recent form (Last 5 games e.g. "W, W, L, W, L")
  4. Season PPG and Opponent PPG
  5. A Key Player and their current Availability status
  6. Contextual venue info
  
  Return the results ONLY as a JSON array of objects matching the GameInput structure.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            league: { type: Type.STRING },
            teamA: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                lastFive: { type: Type.STRING },
                ppg: { type: Type.NUMBER },
                oppPPG: { type: Type.NUMBER },
                keyPlayer: { type: Type.STRING },
                availability: { type: Type.STRING }
              },
              required: ["name", "lastFive", "ppg", "oppPPG", "keyPlayer", "availability"]
            },
            teamB: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                lastFive: { type: Type.STRING },
                ppg: { type: Type.NUMBER },
                oppPPG: { type: Type.NUMBER },
                keyPlayer: { type: Type.STRING },
                availability: { type: Type.STRING }
              },
              required: ["name", "lastFive", "ppg", "oppPPG", "keyPlayer", "availability"]
            },
            context: { type: Type.STRING }
          },
          required: ["league", "teamA", "teamB", "context"]
        }
      }
    },
  });

  try {
    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse live games:", e);
    return [];
  }
};

export const analyzeGame = async (gameData: GameInput): Promise<PredictionResult> => {
  const prompt = `
    Role: Senior Basketball Quantitative Analyst.
    Task: Analyze the game and provide a detailed prediction matching a professional scoreboard output.
    
    Data:
    League: ${gameData.league}
    Matchup: ${gameData.teamA.name} vs ${gameData.teamB.name}
    Context: ${gameData.context}

    Generate:
    1. Winner and total confidence.
    2. Projected Final Score.
    3. Projected Quarter Scores (4 quarters).
    4. Venue name and 3 hypothetical or real officials.
    5. Quantitative rationale.

    Return as JSON.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          matchup: { type: Type.STRING },
          league: { type: Type.STRING },
          round: { type: Type.STRING },
          winner: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          statisticalEdge: { type: Type.STRING },
          predictedScore: {
            type: Type.OBJECT,
            properties: {
              teamA: { type: Type.NUMBER },
              teamB: { type: Type.NUMBER }
            },
            required: ["teamA", "teamB"]
          },
          quarterScores: {
            type: Type.OBJECT,
            properties: {
              teamA: { type: Type.ARRAY, items: { type: Type.NUMBER } },
              teamB: { type: Type.ARRAY, items: { type: Type.NUMBER } }
            },
            required: ["teamA", "teamB"]
          },
          officials: { type: Type.ARRAY, items: { type: Type.STRING } },
          venue: { type: Type.STRING },
          attendance: { type: Type.STRING },
          totalPoints: { type: Type.NUMBER },
          overUnder: { type: Type.STRING },
          confidenceLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] }
        },
        required: ["matchup", "league", "winner", "confidence", "statisticalEdge", "predictedScore", "quarterScores", "totalPoints", "overUnder", "confidenceLevel"]
      }
    }
  });

  const resultStr = response.text || "{}";
  const result = JSON.parse(resultStr);
  
  return {
    ...result,
    teamAAvailability: gameData.teamA.availability,
    teamBAvailability: gameData.teamB.availability,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: Date.now(),
    isLive: false,
    currentClock: "12:00",
    currentPeriod: 1,
    liveEvents: []
  };
};
