import React from 'react';
import { ChessPiece as ChessPieceType, Position } from '@/lib/chess/types';

interface ChessPieceProps {
  piece: ChessPieceType;
  position: Position;
  isSelected: boolean;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, piece: ChessPieceType, position: Position) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

const pieceSymbols = {
  white: {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙'
  },
  black: {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟'
  }
};

export const ChessPiece: React.FC<ChessPieceProps> = ({
  piece,
  position,
  isSelected,
  isDragging,
  onDragStart,
  onDragEnd
}) => {
  const symbol = pieceSymbols[piece.color][piece.type];

  return (
    <div
      className={`
        absolute inset-0 flex items-center justify-center cursor-pointer select-none
        text-2xl sm:text-3xl md:text-4xl font-bold transition-all duration-200 z-10
        ${isSelected ? 'transform scale-110 drop-shadow-lg' : ''}
        ${isDragging ? 'opacity-50 transform scale-110' : ''}
        ${piece.color === 'white' ? 'text-gray-100 drop-shadow-md' : 'text-gray-800'}
        hover:transform hover:scale-105
      `}
      draggable
      onDragStart={(e) => onDragStart(e, piece, position)}
      onDragEnd={onDragEnd}
      style={{
        filter: piece.color === 'white' 
          ? 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))' 
          : 'drop-shadow(1px 1px 2px rgba(255,255,255,0.3))',
      }}
    >
      {symbol}
    </div>
  );
};
