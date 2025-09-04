import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { ChessEngine } from '../chess/ChessEngine';
import { ChessAI } from '../chess/AI';
import { GameState, Move, Position, PieceColor, ChessPiece, TimerState } from '../chess/types';

interface ChessStore extends GameState {
  timer: TimerState;
  ai: ChessAI | null;
  
  // Actions
  initializeGame: (mode: 'single' | 'multi', difficulty?: 'easy' | 'medium' | 'hard') => void;
  selectSquare: (position: Position) => void;
  makeMove: (from: Position, to: Position) => void;
  resetGame: () => void;
  undoMove: () => void;
  setGameMode: (mode: 'single' | 'multi') => void;
  setAIDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void;
  
  // Timer actions
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
}

const initialTimerState: TimerState = {
  whiteTime: 600, // 10 minutes in seconds
  blackTime: 600,
  isRunning: false,
  currentTurn: 'white'
};

export const useChess = create<ChessStore>()(
  subscribeWithSelector((set, get) => ({
    board: ChessEngine.initializeBoard(),
    currentPlayer: 'white',
    moveHistory: [],
    selectedSquare: null,
    possibleMoves: [],
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    isDraw: false,
    gameMode: 'single',
    aiDifficulty: 'medium',
    timer: initialTimerState,
    ai: null,

    initializeGame: (mode, difficulty = 'medium') => {
      const board = ChessEngine.initializeBoard();
      const ai = mode === 'single' ? new ChessAI(difficulty) : null;
      
      set({
        board,
        currentPlayer: 'white',
        moveHistory: [],
        selectedSquare: null,
        possibleMoves: [],
        isCheck: false,
        isCheckmate: false,
        isStalemate: false,
        isDraw: false,
        gameMode: mode,
        aiDifficulty: difficulty,
        ai,
        timer: { ...initialTimerState }
      });
    },

    selectSquare: (position) => {
      const state = get();
      const { board, currentPlayer, selectedSquare } = state;
      const piece = board[position.x][position.y];

      // If no square selected, select this square if it has a piece of current player
      if (!selectedSquare) {
        if (piece && piece.color === currentPlayer) {
          const possibleMoves = ChessEngine.getPossibleMoves(board, piece, position);
          // Filter moves that would leave king in check
          const validMoves = possibleMoves.filter(movePos => {
            const testMove: Move = {
              from: position,
              to: movePos,
              piece,
              capturedPiece: board[movePos.x][movePos.y] || undefined
            };
            const testBoard = ChessEngine.makeMove(board, testMove);
            return !ChessEngine.isInCheck(testBoard, currentPlayer);
          });
          
          set({
            selectedSquare: position,
            possibleMoves: validMoves
          });
        }
        return;
      }

      // If same square selected, deselect
      if (selectedSquare.x === position.x && selectedSquare.y === position.y) {
        set({
          selectedSquare: null,
          possibleMoves: []
        });
        return;
      }

      // If different square selected, try to make move
      const selectedPiece = board[selectedSquare.x][selectedSquare.y];
      if (selectedPiece) {
        const isValidMove = state.possibleMoves.some(
          move => move.x === position.x && move.y === position.y
        );
        
        if (isValidMove) {
          get().makeMove(selectedSquare, position);
        } else if (piece && piece.color === currentPlayer) {
          // Select new piece
          const possibleMoves = ChessEngine.getPossibleMoves(board, piece, position);
          const validMoves = possibleMoves.filter(movePos => {
            const testMove: Move = {
              from: position,
              to: movePos,
              piece,
              capturedPiece: board[movePos.x][movePos.y] || undefined
            };
            const testBoard = ChessEngine.makeMove(board, testMove);
            return !ChessEngine.isInCheck(testBoard, currentPlayer);
          });
          
          set({
            selectedSquare: position,
            possibleMoves: validMoves
          });
        } else {
          set({
            selectedSquare: null,
            possibleMoves: []
          });
        }
      }
    },

    makeMove: (from, to) => {
      const state = get();
      const { board, currentPlayer, moveHistory, ai, gameMode } = state;
      const piece = board[from.x][from.y];
      
      if (!piece || piece.color !== currentPlayer) return;

      const capturedPiece = board[to.x][to.y];
      const move: Move = {
        from,
        to,
        piece,
        capturedPiece: capturedPiece || undefined
      };

      const newBoard = ChessEngine.makeMove(board, move);
      const nextPlayer: PieceColor = currentPlayer === 'white' ? 'black' : 'white';
      
      const isCheck = ChessEngine.isInCheck(newBoard, nextPlayer);
      const isCheckmate = ChessEngine.isCheckmate(newBoard, nextPlayer);
      const isStalemate = ChessEngine.isStalemate(newBoard, nextPlayer);

      set({
        board: newBoard,
        currentPlayer: nextPlayer,
        moveHistory: [...moveHistory, move],
        selectedSquare: null,
        possibleMoves: [],
        isCheck,
        isCheckmate,
        isStalemate,
        timer: {
          ...state.timer,
          currentTurn: nextPlayer
        }
      });

      // AI move for single player mode
      if (gameMode === 'single' && nextPlayer === 'black' && !isCheckmate && !isStalemate && ai) {
        setTimeout(() => {
          const aiMove = ai.getBestMove(newBoard, 'black');
          if (aiMove) {
            get().makeMove(aiMove.from, aiMove.to);
          }
        }, 500); // Small delay for better UX
      }
    },

    resetGame: () => {
      const state = get();
      get().initializeGame(state.gameMode, state.aiDifficulty);
    },

    undoMove: () => {
      const state = get();
      if (state.moveHistory.length === 0) return;

      const newHistory = [...state.moveHistory];
      const lastMove = newHistory.pop()!;
      
      // For single player, undo two moves (player and AI)
      if (state.gameMode === 'single' && newHistory.length > 0) {
        newHistory.pop();
      }

      // Reconstruct board from history
      let board = ChessEngine.initializeBoard();
      let currentPlayer: PieceColor = 'white';
      
      for (const move of newHistory) {
        board = ChessEngine.makeMove(board, move);
        currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
      }

      const isCheck = ChessEngine.isInCheck(board, currentPlayer);
      const isCheckmate = ChessEngine.isCheckmate(board, currentPlayer);
      const isStalemate = ChessEngine.isStalemate(board, currentPlayer);

      set({
        board,
        currentPlayer,
        moveHistory: newHistory,
        selectedSquare: null,
        possibleMoves: [],
        isCheck,
        isCheckmate,
        isStalemate
      });
    },

    setGameMode: (mode) => {
      set({ gameMode: mode });
      get().resetGame();
    },

    setAIDifficulty: (difficulty) => {
      set({ 
        aiDifficulty: difficulty,
        ai: new ChessAI(difficulty)
      });
    },

    startTimer: () => {
      set(state => ({
        timer: { ...state.timer, isRunning: true }
      }));
    },

    pauseTimer: () => {
      set(state => ({
        timer: { ...state.timer, isRunning: false }
      }));
    },

    resetTimer: () => {
      set({ timer: initialTimerState });
    }
  }))
);

// Timer subscription to update time
let timerInterval: NodeJS.Timeout | null = null;

useChess.subscribe(
  (state) => state.timer.isRunning,
  (isRunning) => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    if (isRunning) {
      timerInterval = setInterval(() => {
        const state = useChess.getState();
        if (state.timer.isRunning) {
          const currentTurn = state.timer.currentTurn;
          const timeUpdate = currentTurn === 'white' 
            ? { whiteTime: Math.max(0, state.timer.whiteTime - 1) }
            : { blackTime: Math.max(0, state.timer.blackTime - 1) };

          useChess.setState({
            timer: { ...state.timer, ...timeUpdate }
          });

          // Check for time out
          if (timeUpdate.whiteTime === 0 || timeUpdate.blackTime === 0) {
            useChess.getState().pauseTimer();
          }
        }
      }, 1000);
    }
  }
);
