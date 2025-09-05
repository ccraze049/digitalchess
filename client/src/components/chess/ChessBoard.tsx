import React, { useState } from 'react';
import { ChessPiece } from './ChessPiece';
import { useChess } from '@/lib/stores/useChess';
import { Position, ChessPiece as ChessPieceType } from '@/lib/chess/types';

export const ChessBoard: React.FC = () => {
  const {
    board,
    selectedSquare,
    possibleMoves,
    selectSquare,
    makeMove,
    currentPlayer
  } = useChess();
  
  const [draggedPiece, setDraggedPiece] = useState<{
    piece: ChessPieceType;
    position: Position;
  } | null>(null);

  const handleSquareClick = (row: number, col: number) => {
    selectSquare({ x: row, y: col });
  };

  const handleDragStart = (e: React.DragEvent, piece: ChessPieceType, position: Position) => {
    if (piece.color !== currentPlayer) {
      e.preventDefault();
      return;
    }
    setDraggedPiece({ piece, position });
    selectSquare(position);
  };

  const handleDragEnd = () => {
    setDraggedPiece(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, row: number, col: number) => {
    e.preventDefault();
    if (draggedPiece) {
      const isValidMove = possibleMoves.some(
        move => move.x === row && move.y === col
      );
      if (isValidMove) {
        makeMove(draggedPiece.position, { x: row, y: col });
      }
    }
    setDraggedPiece(null);
  };

  const isSquareSelected = (row: number, col: number) => {
    return selectedSquare?.x === row && selectedSquare?.y === col;
  };

  const isSquarePossibleMove = (row: number, col: number) => {
    return possibleMoves.some(move => move.x === row && move.y === col);
  };

  const getSquareColor = (row: number, col: number) => {
    const isLight = (row + col) % 2 === 0;
    let baseColor = isLight ? 'bg-amber-100' : 'bg-amber-800';
    
    if (isSquareSelected(row, col)) {
      baseColor = 'bg-blue-400';
    } else if (isSquarePossibleMove(row, col)) {
      baseColor = isLight ? 'bg-green-300' : 'bg-green-600';
    }
    
    return baseColor;
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Board container */}
      <div className="grid grid-cols-8 gap-0 border-2 sm:border-4 border-amber-900 bg-amber-900 shadow-2xl aspect-square">
        {Array.from({ length: 64 }, (_, index) => {
          const row = Math.floor(index / 8);
          const col = index % 8;
          const piece = board[row][col];
          const squareId = `${row}-${col}`;

          return (
            <div
              key={squareId}
              className={`
                relative w-full aspect-square flex items-center justify-center cursor-pointer
                ${getSquareColor(row, col)}
                transition-colors duration-200
                hover:brightness-110
              `}
              onClick={() => handleSquareClick(row, col)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, row, col)}
            >
              {/* Square coordinates for debugging */}
              <div className="absolute top-0 left-0 text-xs opacity-30 pointer-events-none">
                {String.fromCharCode(97 + col)}{8 - row}
              </div>
              
              {/* Possible move indicator */}
              {isSquarePossibleMove(row, col) && !piece && (
                <div className="w-4 h-4 rounded-full bg-green-500 opacity-70"></div>
              )}
              
              {/* Piece */}
              {piece && (
                <ChessPiece
                  piece={piece}
                  position={{ x: row, y: col }}
                  isSelected={isSquareSelected(row, col)}
                  isDragging={draggedPiece?.position.x === row && draggedPiece?.position.y === col}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Board labels - Responsive */}
      <div className="absolute -bottom-4 sm:-bottom-6 left-0 right-0 flex justify-between px-1 sm:px-2">
        {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(letter => (
          <div key={letter} className="flex-1 text-center text-amber-800 font-bold text-sm sm:text-base">
            {letter}
          </div>
        ))}
      </div>
      
      <div className="absolute -left-4 sm:-left-6 top-0 bottom-0 flex flex-col justify-between py-1 sm:py-2">
        {[8, 7, 6, 5, 4, 3, 2, 1].map(number => (
          <div key={number} className="flex-1 flex items-center text-amber-800 font-bold text-sm sm:text-base">
            {number}
          </div>
        ))}
      </div>
    </div>
  );
};
