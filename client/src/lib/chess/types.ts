export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  id: string;
  hasMoved?: boolean;
}

export interface Position {
  x: number;
  y: number;
}

export interface Move {
  from: Position;
  to: Position;
  piece: ChessPiece;
  capturedPiece?: ChessPiece;
  isEnPassant?: boolean;
  isCastling?: boolean;
  promotion?: PieceType;
  notation?: string;
}

export interface GameState {
  board: (ChessPiece | null)[][];
  currentPlayer: PieceColor;
  moveHistory: Move[];
  selectedSquare: Position | null;
  possibleMoves: Position[];
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  gameMode: 'single' | 'multi';
  aiDifficulty: 'easy' | 'medium' | 'hard';
}

export interface TimerState {
  whiteTime: number;
  blackTime: number;
  isRunning: boolean;
  currentTurn: PieceColor;
}
