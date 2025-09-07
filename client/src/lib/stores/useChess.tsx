import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { ChessEngine } from '../chess/ChessEngine';
import { ChessAI } from '../chess/AI';
import { GameState, Move, Position, PieceColor, ChessPiece, TimerState } from '../chess/types';
import { geminiAIService } from '../services/geminiAI';

interface ChessStore extends GameState {
  timer: TimerState;
  ai: ChessAI | null;
  useGeminiAI: boolean;
  aiCoaching: string | null;
  lastMoveExplanation: string | null;
  isAnalyzing: boolean;
  
  // Actions
  initializeGame: (mode: 'single' | 'multi', difficulty?: 'easy' | 'medium' | 'hard') => void;
  selectSquare: (position: Position) => void;
  makeMove: (from: Position, to: Position) => void;
  resetGame: () => void;
  undoMove: () => void;
  setGameMode: (mode: 'single' | 'multi') => void;
  setAIDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void;
  toggleGeminiAI: () => void;
  
  // AI Analysis actions
  analyzePosition: () => Promise<void>;
  explainLastMove: () => Promise<void>;
  
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
    useGeminiAI: false,
    aiCoaching: null,
    lastMoveExplanation: null,
    isAnalyzing: false,

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
      if (gameMode === 'single' && nextPlayer === 'black' && !isCheckmate && !isStalemate) {
        const currentState = get();
        console.log('AI turn - useGeminiAI:', currentState.useGeminiAI, 'ai exists:', !!ai);
        
        if (currentState.useGeminiAI) {
          // Use Gemini AI
          setTimeout(async () => {
            try {
              console.log('Calling Gemini AI for move...');
              const response = await geminiAIService.getAIMove(
                newBoard, 
                'black', 
                [...moveHistory, move], 
                currentState.aiDifficulty
              );
              
              console.log('Gemini AI response:', response);
              
              if (response.move) {
                const parsedMove = geminiAIService.parseAlgebraicMove(
                  response.move, 
                  newBoard, 
                  'black'
                );
                
                if (parsedMove) {
                  console.log('Making AI move:', parsedMove);
                  get().makeMove(parsedMove.from, parsedMove.to);
                  
                  // Set AI coaching message
                  if (response.coaching) {
                    set({ aiCoaching: response.coaching });
                  }
                } else {
                  console.log('Failed to parse Gemini move, trying local AI fallback');
                  // Fallback to local AI if move parsing fails
                  const localAI = get().ai;
                  if (localAI) {
                    const aiMove = localAI.getBestMove(newBoard, 'black');
                    if (aiMove) {
                      console.log('Local AI fallback move:', aiMove);
                      get().makeMove(aiMove.from, aiMove.to);
                    }
                  }
                }
              }
            } catch (error) {
              console.error('Gemini AI move failed, falling back to local AI:', error);
              // Fallback to local AI
              const localAI = get().ai;
              if (localAI) {
                const aiMove = localAI.getBestMove(newBoard, 'black');
                if (aiMove) {
                  console.log('Local AI error fallback move:', aiMove);
                  get().makeMove(aiMove.from, aiMove.to);
                }
              }
            }
          }, 1000);
        } else if (ai) {
          // Use local AI
          console.log('Using local AI...');
          setTimeout(() => {
            const aiMove = ai.getBestMove(newBoard, 'black');
            if (aiMove) {
              console.log('Local AI move:', aiMove);
              get().makeMove(aiMove.from, aiMove.to);
            } else {
              console.log('Local AI returned no move');
            }
          }, 500);
        } else {
          console.log('No AI available for move');
        }
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
        isStalemate,
        timer: { ...get().timer, currentTurn: currentPlayer }
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

    toggleGeminiAI: () => {
      const state = get();
      set({ useGeminiAI: !state.useGeminiAI });
    },

    analyzePosition: async () => {
      const state = get();
      set({ isAnalyzing: true });
      
      try {
        const analysis = await geminiAIService.analyzePosition(
          state.board,
          state.moveHistory
        );
        set({ aiCoaching: analysis });
      } catch (error) {
        console.error('Position analysis failed:', error);
        set({ aiCoaching: 'Analysis unavailable at the moment.' });
      } finally {
        set({ isAnalyzing: false });
      }
    },

    explainLastMove: async () => {
      const state = get();
      if (state.moveHistory.length === 0) return;
      
      set({ isAnalyzing: true });
      
      try {
        const lastMove = state.moveHistory[state.moveHistory.length - 1];
        const explanation = await geminiAIService.explainMove(
          lastMove,
          state.board,
          state.moveHistory
        );
        set({ lastMoveExplanation: explanation });
      } catch (error) {
        console.error('Move explanation failed:', error);
        set({ lastMoveExplanation: 'Move explanation unavailable.' });
      } finally {
        set({ isAnalyzing: false });
      }
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
