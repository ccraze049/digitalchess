import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GeminiChessAI } from "./gemini-ai";

export async function registerRoutes(app: Express): Promise<Server> {
  let geminiAI: GeminiChessAI;
  
  try {
    geminiAI = new GeminiChessAI();
  } catch (error) {
    console.error('Failed to initialize Gemini AI:', error);
  }

  // AI Chess Routes
  app.post('/api/ai/move', async (req, res) => {
    try {
      if (!geminiAI) {
        return res.status(500).json({ error: 'Gemini AI not initialized' });
      }

      const { board, color, moveHistory, difficulty = 'medium' } = req.body;
      const result = await geminiAI.getBestMove(board, color, moveHistory, difficulty);
      res.json(result);
    } catch (error) {
      console.error('AI move generation failed:', error);
      res.status(500).json({ error: 'Failed to generate AI move' });
    }
  });

  app.post('/api/ai/analyze', async (req, res) => {
    try {
      if (!geminiAI) {
        return res.status(500).json({ error: 'Gemini AI not initialized' });
      }

      const { board, moveHistory } = req.body;
      const analysis = await geminiAI.analyzePosition(board, moveHistory);
      res.json({ analysis });
    } catch (error) {
      console.error('Position analysis failed:', error);
      res.status(500).json({ error: 'Failed to analyze position' });
    }
  });

  app.post('/api/ai/explain', async (req, res) => {
    try {
      if (!geminiAI) {
        return res.status(500).json({ error: 'Gemini AI not initialized' });
      }

      const { move, board, moveHistory } = req.body;
      const explanation = await geminiAI.explainMove(move, board, moveHistory);
      res.json({ explanation });
    } catch (error) {
      console.error('Move explanation failed:', error);
      res.status(500).json({ error: 'Failed to explain move' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
