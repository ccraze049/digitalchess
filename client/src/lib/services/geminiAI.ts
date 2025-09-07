import { ChessPiece, Move, PieceColor } from '../chess/types';

interface GeminiResponse {
  move?: string;
  explanation?: string;
  coaching?: string;
  analysis?: string;
}

export class GeminiAIService {
  private baseUrl = '/api/ai';

  async getAIMove(
    board: (ChessPiece | null)[][],
    color: PieceColor,
    moveHistory: Move[],
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<GeminiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          board,
          color,
          moveHistory,
          difficulty
        })
      });

      if (!response.ok) {
        throw new Error(`AI move request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get AI move:', error);
      throw error;
    }
  }

  async analyzePosition(
    board: (ChessPiece | null)[][],
    moveHistory: Move[]
  ): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          board,
          moveHistory
        })
      });

      if (!response.ok) {
        throw new Error(`Position analysis failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.analysis;
    } catch (error) {
      console.error('Failed to analyze position:', error);
      throw error;
    }
  }

  async explainMove(
    move: Move,
    board: (ChessPiece | null)[][],
    moveHistory: Move[]
  ): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/explain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          move,
          board,
          moveHistory
        })
      });

      if (!response.ok) {
        throw new Error(`Move explanation failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.explanation;
    } catch (error) {
      console.error('Failed to explain move:', error);
      throw error;
    }
  }

  // Helper method to parse algebraic notation and convert to Move object
  parseAlgebraicMove(
    moveString: string,
    board: (ChessPiece | null)[][],
    color: PieceColor
  ): Move | null {
    try {
      // Handle basic format like "e2-e4"
      const basicMatch = moveString.match(/([a-h][1-8])-([a-h][1-8])/);
      if (basicMatch) {
        const [, fromSquare, toSquare] = basicMatch;
        
        const fromPos = this.algebraicToPosition(fromSquare);
        const toPos = this.algebraicToPosition(toSquare);
        
        const piece = board[fromPos.x][fromPos.y];
        const capturedPiece = board[toPos.x][toPos.y];
        
        if (piece && piece.color === color) {
          return {
            from: fromPos,
            to: toPos,
            piece,
            capturedPiece: capturedPiece || undefined
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Failed to parse move:', error);
      return null;
    }
  }

  private algebraicToPosition(square: string): { x: number; y: number } {
    const file = square.charCodeAt(0) - 97; // 'a' = 0, 'b' = 1, etc.
    const rank = 8 - parseInt(square[1]); // '8' = 0, '7' = 1, etc.
    return { x: rank, y: file };
  }
}

export const geminiAIService = new GeminiAIService();