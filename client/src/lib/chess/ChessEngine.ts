import { ChessPiece, Position, Move, PieceType, PieceColor, GameState } from './types';

export class ChessEngine {
  static initializeBoard(): (ChessPiece | null)[][] {
    const board: (ChessPiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // Initialize pieces
    const pieceOrder: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    
    // Black pieces (top)
    for (let i = 0; i < 8; i++) {
      board[0][i] = { type: pieceOrder[i], color: 'black', id: `black-${pieceOrder[i]}-${i}` };
      board[1][i] = { type: 'pawn', color: 'black', id: `black-pawn-${i}` };
    }
    
    // White pieces (bottom)
    for (let i = 0; i < 8; i++) {
      board[7][i] = { type: pieceOrder[i], color: 'white', id: `white-${pieceOrder[i]}-${i}` };
      board[6][i] = { type: 'pawn', color: 'white', id: `white-pawn-${i}` };
    }
    
    return board;
  }

  static isValidPosition(pos: Position): boolean {
    return pos.x >= 0 && pos.x < 8 && pos.y >= 0 && pos.y < 8;
  }

  static getPossibleMoves(board: (ChessPiece | null)[][], piece: ChessPiece, position: Position): Position[] {
    const moves: Position[] = [];
    
    switch (piece.type) {
      case 'pawn':
        moves.push(...this.getPawnMoves(board, piece, position));
        break;
      case 'rook':
        moves.push(...this.getRookMoves(board, piece, position));
        break;
      case 'knight':
        moves.push(...this.getKnightMoves(board, piece, position));
        break;
      case 'bishop':
        moves.push(...this.getBishopMoves(board, piece, position));
        break;
      case 'queen':
        moves.push(...this.getQueenMoves(board, piece, position));
        break;
      case 'king':
        moves.push(...this.getKingMoves(board, piece, position));
        break;
    }
    
    return moves.filter(move => this.isValidPosition(move));
  }

  static getPawnMoves(board: (ChessPiece | null)[][], piece: ChessPiece, pos: Position): Position[] {
    const moves: Position[] = [];
    const direction = piece.color === 'white' ? -1 : 1;
    const startRow = piece.color === 'white' ? 6 : 1;
    
    // Forward move
    const frontPos = { x: pos.x + direction, y: pos.y };
    if (this.isValidPosition(frontPos) && !board[frontPos.x][frontPos.y]) {
      moves.push(frontPos);
      
      // Double move from start
      if (pos.x === startRow) {
        const doublePos = { x: pos.x + 2 * direction, y: pos.y };
        if (this.isValidPosition(doublePos) && !board[doublePos.x][doublePos.y]) {
          moves.push(doublePos);
        }
      }
    }
    
    // Captures
    const capturePositions = [
      { x: pos.x + direction, y: pos.y - 1 },
      { x: pos.x + direction, y: pos.y + 1 }
    ];
    
    capturePositions.forEach(capturePos => {
      if (this.isValidPosition(capturePos)) {
        const target = board[capturePos.x][capturePos.y];
        if (target && target.color !== piece.color) {
          moves.push(capturePos);
        }
      }
    });
    
    return moves;
  }

  static getRookMoves(board: (ChessPiece | null)[][], piece: ChessPiece, pos: Position): Position[] {
    const moves: Position[] = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    
    for (const [dx, dy] of directions) {
      for (let i = 1; i < 8; i++) {
        const newPos = { x: pos.x + dx * i, y: pos.y + dy * i };
        if (!this.isValidPosition(newPos)) break;
        
        const target = board[newPos.x][newPos.y];
        if (!target) {
          moves.push(newPos);
        } else {
          if (target.color !== piece.color) {
            moves.push(newPos);
          }
          break;
        }
      }
    }
    
    return moves;
  }

  static getKnightMoves(board: (ChessPiece | null)[][], piece: ChessPiece, pos: Position): Position[] {
    const moves: Position[] = [];
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    
    knightMoves.forEach(([dx, dy]) => {
      const newPos = { x: pos.x + dx, y: pos.y + dy };
      if (this.isValidPosition(newPos)) {
        const target = board[newPos.x][newPos.y];
        if (!target || target.color !== piece.color) {
          moves.push(newPos);
        }
      }
    });
    
    return moves;
  }

  static getBishopMoves(board: (ChessPiece | null)[][], piece: ChessPiece, pos: Position): Position[] {
    const moves: Position[] = [];
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    
    for (const [dx, dy] of directions) {
      for (let i = 1; i < 8; i++) {
        const newPos = { x: pos.x + dx * i, y: pos.y + dy * i };
        if (!this.isValidPosition(newPos)) break;
        
        const target = board[newPos.x][newPos.y];
        if (!target) {
          moves.push(newPos);
        } else {
          if (target.color !== piece.color) {
            moves.push(newPos);
          }
          break;
        }
      }
    }
    
    return moves;
  }

  static getQueenMoves(board: (ChessPiece | null)[][], piece: ChessPiece, pos: Position): Position[] {
    return [
      ...this.getRookMoves(board, piece, pos),
      ...this.getBishopMoves(board, piece, pos)
    ];
  }

  static getKingMoves(board: (ChessPiece | null)[][], piece: ChessPiece, pos: Position): Position[] {
    const moves: Position[] = [];
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];
    
    directions.forEach(([dx, dy]) => {
      const newPos = { x: pos.x + dx, y: pos.y + dy };
      if (this.isValidPosition(newPos)) {
        const target = board[newPos.x][newPos.y];
        if (!target || target.color !== piece.color) {
          moves.push(newPos);
        }
      }
    });
    
    return moves;
  }

  static isSquareUnderAttack(board: (ChessPiece | null)[][], position: Position, attackingColor: PieceColor): boolean {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.color === attackingColor) {
          const moves = this.getPossibleMoves(board, piece, { x: row, y: col });
          if (moves.some(move => move.x === position.x && move.y === position.y)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  static findKing(board: (ChessPiece | null)[][], color: PieceColor): Position | null {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.type === 'king' && piece.color === color) {
          return { x: row, y: col };
        }
      }
    }
    return null;
  }

  static isInCheck(board: (ChessPiece | null)[][], color: PieceColor): boolean {
    const kingPosition = this.findKing(board, color);
    if (!kingPosition) return false;
    
    const oppositeColor = color === 'white' ? 'black' : 'white';
    return this.isSquareUnderAttack(board, kingPosition, oppositeColor);
  }

  static isValidMove(board: (ChessPiece | null)[][], from: Position, to: Position): boolean {
    const piece = board[from.x][from.y];
    if (!piece) return false;
    
    const possibleMoves = this.getPossibleMoves(board, piece, from);
    return possibleMoves.some(move => move.x === to.x && move.y === to.y);
  }

  static makeMove(board: (ChessPiece | null)[][], move: Move): (ChessPiece | null)[][] {
    const newBoard = board.map(row => [...row]);
    
    // Move piece
    newBoard[move.to.x][move.to.y] = move.piece;
    newBoard[move.from.x][move.from.y] = null;
    
    // Mark piece as moved
    if (newBoard[move.to.x][move.to.y]) {
      newBoard[move.to.x][move.to.y]!.hasMoved = true;
    }
    
    return newBoard;
  }

  static getAllValidMoves(board: (ChessPiece | null)[][], color: PieceColor): Move[] {
    const moves: Move[] = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.color === color) {
          const from = { x: row, y: col };
          const possibleMoves = this.getPossibleMoves(board, piece, from);
          
          possibleMoves.forEach(to => {
            const capturedPiece = board[to.x][to.y];
            const move: Move = {
              from,
              to,
              piece,
              capturedPiece: capturedPiece || undefined
            };
            
            // Check if move would leave king in check
            const testBoard = this.makeMove(board, move);
            if (!this.isInCheck(testBoard, color)) {
              moves.push(move);
            }
          });
        }
      }
    }
    
    return moves;
  }

  static isCheckmate(board: (ChessPiece | null)[][], color: PieceColor): boolean {
    return this.isInCheck(board, color) && this.getAllValidMoves(board, color).length === 0;
  }

  static isStalemate(board: (ChessPiece | null)[][], color: PieceColor): boolean {
    return !this.isInCheck(board, color) && this.getAllValidMoves(board, color).length === 0;
  }

  static evaluatePosition(board: (ChessPiece | null)[][]): number {
    const pieceValues = {
      pawn: 1,
      knight: 3,
      bishop: 3,
      rook: 5,
      queen: 9,
      king: 0
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
}
