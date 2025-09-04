import React from 'react';
import { useChess } from '@/lib/stores/useChess';
import { Move } from '@/lib/chess/types';

export const MoveHistory: React.FC = () => {
  const { moveHistory } = useChess();

  const formatMove = (move: Move, moveNumber: number): string => {
    const fromSquare = `${String.fromCharCode(97 + move.from.y)}${8 - move.from.x}`;
    const toSquare = `${String.fromCharCode(97 + move.to.y)}${8 - move.to.x}`;
    
    let notation = '';
    
    // Piece notation (except for pawns)
    if (move.piece.type !== 'pawn') {
      notation += move.piece.type.charAt(0).toUpperCase();
    }
    
    // Capture notation
    if (move.capturedPiece) {
      if (move.piece.type === 'pawn') {
        notation += fromSquare.charAt(0); // pawn file for captures
      }
      notation += 'x';
    }
    
    notation += toSquare;
    
    return notation;
  };

  const groupedMoves = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    const whiteMove = moveHistory[i];
    const blackMove = moveHistory[i + 1];
    const moveNumber = Math.floor(i / 2) + 1;
    
    groupedMoves.push({
      number: moveNumber,
      white: whiteMove,
      black: blackMove
    });
  }

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-bold mb-3">Move History</h3>
      
      <div className="max-h-64 overflow-y-auto">
        {groupedMoves.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No moves yet</p>
        ) : (
          <div className="space-y-1">
            {groupedMoves.map(({ number, white, black }) => (
              <div key={number} className="flex items-center space-x-4 py-1 px-2 rounded hover:bg-gray-700 transition-colors">
                <span className="text-gray-400 w-6 text-sm">{number}.</span>
                <span className="w-16 text-sm font-mono">
                  {formatMove(white, number)}
                </span>
                {black && (
                  <span className="w-16 text-sm font-mono text-gray-300">
                    {formatMove(black, number)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {moveHistory.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-600 text-sm text-gray-400">
          Total moves: {moveHistory.length}
        </div>
      )}
    </div>
  );
};
