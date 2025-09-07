import { ChessPiece, Position, Move, PieceColor } from '../client/src/lib/chess/types';

interface GeminiResponse {
  move?: string;
  explanation?: string;
  coaching?: string;
  analysis?: string;
}

export class GeminiChessAI {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
  }

  private async callGemini(prompt: string): Promise<string> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': this.apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || '';
    } catch (error) {
      console.error('Gemini API call failed:', error);
      throw error;
    }
  }

  private boardToFEN(board: (ChessPiece | null)[][]): string {
    // Convert board to simplified FEN-like notation for AI
    const rows = board.map(row => 
      row.map(piece => {
        if (!piece) return '1';
        const symbol = this.pieceToSymbol(piece);
        return piece.color === 'white' ? symbol.toUpperCase() : symbol.toLowerCase();
      }).join('')
    );
    return rows.join('/');
  }

  private pieceToSymbol(piece: ChessPiece): string {
    const symbols = {
      'king': 'k',
      'queen': 'q',
      'rook': 'r',
      'bishop': 'b',
      'knight': 'n',
      'pawn': 'p'
    };
    return symbols[piece.type];
  }

  private formatMoveHistory(moves: Move[]): string {
    return moves.map((move, index) => {
      const moveNumber = Math.floor(index / 2) + 1;
      const from = `${String.fromCharCode(97 + move.from.y)}${8 - move.from.x}`;
      const to = `${String.fromCharCode(97 + move.to.y)}${8 - move.to.x}`;
      const moveNotation = `${from}-${to}`;
      
      if (index % 2 === 0) {
        return `${moveNumber}. ${moveNotation}`;
      } else {
        return moveNotation;
      }
    }).join(' ');
  }

  async getBestMove(
    board: (ChessPiece | null)[][],
    color: PieceColor,
    moveHistory: Move[],
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<GeminiResponse> {
    const boardFEN = this.boardToFEN(board);
    const history = this.formatMoveHistory(moveHistory);
    
    const difficultyPrompts = {
      easy: "Play at beginner level, occasionally make suboptimal moves, focus on basic tactics.",
      medium: "Play at intermediate level, use good tactics and strategy.",
      hard: "Play at advanced level, use complex tactics, positional play, and deep calculations."
    };

    const prompt = `
You are a chess AI assistant. Analyze this chess position and suggest the best move for ${color}.

Current board position (simplified FEN): ${boardFEN}
Move history: ${history || 'Game start'}
Difficulty level: ${difficulty} - ${difficultyPrompts[difficulty]}

Please provide:
1. Your recommended move in algebraic notation (e.g., "e2-e4" or "Nf3")
2. A brief explanation of why this move is good
3. A coaching tip for the human player

Respond in JSON format:
{
  "move": "suggested move",
  "explanation": "why this move is strong",
  "coaching": "helpful tip for the player"
}
`;

    try {
      const response = await this.callGemini(prompt);
      // Try to parse as JSON, fallback to text parsing if needed
      try {
        return JSON.parse(response);
      } catch {
        // Fallback parsing if JSON is malformed
        return this.parseTextResponse(response);
      }
    } catch (error) {
      console.error('Failed to get AI move:', error);
      throw error;
    }
  }

  async analyzePosition(
    board: (ChessPiece | null)[][],
    moveHistory: Move[]
  ): Promise<string> {
    const boardFEN = this.boardToFEN(board);
    const history = this.formatMoveHistory(moveHistory);

    const prompt = `
Analyze this chess position as an expert coach:

Current board position: ${boardFEN}
Move history: ${history || 'Game start'}

Provide a detailed analysis covering:
1. Material balance
2. Key tactical opportunities
3. Strategic themes
4. Suggested plans for both sides

Keep the analysis conversational and educational.
`;

    return await this.callGemini(prompt);
  }

  async explainMove(
    move: Move,
    board: (ChessPiece | null)[][],
    moveHistory: Move[]
  ): Promise<string> {
    const from = `${String.fromCharCode(97 + move.from.y)}${8 - move.from.x}`;
    const to = `${String.fromCharCode(97 + move.to.y)}${8 - move.to.x}`;
    const moveNotation = `${from}-${to}`;
    const boardFEN = this.boardToFEN(board);

    const prompt = `
Explain why the chess move "${moveNotation}" was played in this position.

Board position: ${boardFEN}
Move: ${moveNotation}

Provide a clear, educational explanation of:
1. The immediate purpose of this move
2. How it fits into the overall strategy
3. What threats or opportunities it creates/addresses

Keep it conversational and easy to understand.
`;

    return await this.callGemini(prompt);
  }

  private parseTextResponse(text: string): GeminiResponse {
    // Fallback parser for non-JSON responses
    const lines = text.split('\n').filter(line => line.trim());
    const result: GeminiResponse = {};

    for (const line of lines) {
      if (line.includes('move') && !result.move) {
        const match = line.match(/([a-h][1-8]-[a-h][1-8]|[NBRQK]?[a-h]?[1-8]?x?[a-h][1-8])/);
        if (match) result.move = match[1];
      }
      if (line.includes('explanation') || line.includes('because')) {
        result.explanation = line.replace(/.*?explanation:?\s*/i, '');
      }
      if (line.includes('coaching') || line.includes('tip')) {
        result.coaching = line.replace(/.*?coaching:?\s*/i, '');
      }
    }

    return result;
  }
}