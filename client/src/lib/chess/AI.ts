import { ChessEngine } from './ChessEngine';
import { ChessPiece, Position, Move, PieceColor } from './types';

export class ChessAI {
  private maxDepth: number;

  constructor(difficulty: 'easy' | 'medium' | 'hard') {
    switch (difficulty) {
      case 'easy':
        this.maxDepth = 2;
        break;
      case 'medium':
        this.maxDepth = 3;
        break;
      case 'hard':
        this.maxDepth = 4;
        break;
    }
  }

  getBestMove(board: (ChessPiece | null)[][], color: PieceColor): Move | null {
    const validMoves = ChessEngine.getAllValidMoves(board, color);
    if (validMoves.length === 0) return null;

    let bestMove: Move | null = null;
    let bestScore = color === 'white' ? -Infinity : Infinity;

    for (const move of validMoves) {
      const newBoard = ChessEngine.makeMove(board, move);
      const score = this.minimax(newBoard, this.maxDepth - 1, -Infinity, Infinity, color === 'black');

      if (color === 'white' && score > bestScore) {
        bestScore = score;
        bestMove = move;
      } else if (color === 'black' && score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  private minimax(
    board: (ChessPiece | null)[][],
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean
  ): number {
    if (depth === 0) {
      return this.evaluatePosition(board);
    }

    const color: PieceColor = isMaximizing ? 'black' : 'white';
    const validMoves = ChessEngine.getAllValidMoves(board, color);

    if (validMoves.length === 0) {
      if (ChessEngine.isInCheck(board, color)) {
        // Checkmate
        return isMaximizing ? -10000 + (this.maxDepth - depth) : 10000 - (this.maxDepth - depth);
      } else {
        // Stalemate
        return 0;
      }
    }

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (const move of validMoves) {
        const newBoard = ChessEngine.makeMove(board, move);
        const score = this.minimax(newBoard, depth - 1, alpha, beta, false);
        maxScore = Math.max(maxScore, score);
        alpha = Math.max(alpha, score);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (const move of validMoves) {
        const newBoard = ChessEngine.makeMove(board, move);
        const score = this.minimax(newBoard, depth - 1, alpha, beta, true);
        minScore = Math.min(minScore, score);
        beta = Math.min(beta, score);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
      return minScore;
    }
  }

  private evaluatePosition(board: (ChessPiece | null)[][]): number {
    let score = 0;

    // Material evaluation
    score += this.getMaterialScore(board);

    // Position evaluation
    score += this.getPositionScore(board);

    return score;
  }

  private getMaterialScore(board: (ChessPiece | null)[][]): number {
    const pieceValues = {
      pawn: 100,
      knight: 320,
      bishop: 330,
      rook: 500,
      queen: 900,
      king: 20000
    };

    let score = 0;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          const value = pieceValues[piece.type];
          score += piece.color === 'white' ? value : -value;
        }
      }
    }
    return score;
  }

  private getPositionScore(board: (ChessPiece | null)[][]): number {
    let score = 0;

    // Center control bonus
    const centerSquares = [
      { x: 3, y: 3 }, { x: 3, y: 4 },
      { x: 4, y: 3 }, { x: 4, y: 4 }
    ];

    centerSquares.forEach(pos => {
      const piece = board[pos.x][pos.y];
      if (piece) {
        score += piece.color === 'white' ? 10 : -10;
      }
    });

    // King safety
    const whiteKing = ChessEngine.findKing(board, 'white');
    const blackKing = ChessEngine.findKing(board, 'black');

    if (whiteKing) {
      score += this.getKingSafety(board, whiteKing, 'white');
    }
    if (blackKing) {
      score -= this.getKingSafety(board, blackKing, 'black');
    }

    return score;
  }

  private getKingSafety(board: (ChessPiece | null)[][], kingPos: Position, color: PieceColor): number {
    let safety = 0;

    // Penalty for king in center during opening/middlegame
    if (kingPos.x >= 2 && kingPos.x <= 5 && kingPos.y >= 2 && kingPos.y <= 5) {
      safety -= 20;
    }

    // Bonus for pawn shield
    const direction = color === 'white' ? -1 : 1;
    for (let dy = -1; dy <= 1; dy++) {
      const pawnPos = { x: kingPos.x + direction, y: kingPos.y + dy };
      if (ChessEngine.isValidPosition(pawnPos)) {
        const piece = board[pawnPos.x][pawnPos.y];
        if (piece && piece.type === 'pawn' && piece.color === color) {
          safety += 5;
        }
      }
    }

    return safety;
  }
}
