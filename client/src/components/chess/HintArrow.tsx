import React from 'react';
import { Move } from '@/lib/chess/types';

interface HintArrowProps {
  move: Move;
  boardSize?: number;
}

export const HintArrow: React.FC<HintArrowProps> = ({ move, boardSize = 100 }) => {
  // Calculate positions for the arrow
  const fromX = (move.from.y * (boardSize / 8)) + (boardSize / 16);
  const fromY = (move.from.x * (boardSize / 8)) + (boardSize / 16);
  const toX = (move.to.y * (boardSize / 8)) + (boardSize / 16);
  const toY = (move.to.x * (boardSize / 8)) + (boardSize / 16);

  // Calculate arrow angle and length
  const deltaX = toX - fromX;
  const deltaY = toY - fromY;
  const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

  return (
    <div
      className="absolute pointer-events-none z-10"
      style={{
        left: `${(fromX / boardSize) * 100}%`,
        top: `${(fromY / boardSize) * 100}%`,
        transform: `rotate(${angle}deg)`,
        transformOrigin: '0 50%',
        width: `${(length / boardSize) * 100}%`,
        height: '6px',
      }}
    >
      {/* Arrow body */}
      <div 
        className="absolute top-0 left-0 bg-red-500 opacity-80 rounded-full shadow-lg animate-pulse"
        style={{
          width: 'calc(100% - 12px)',
          height: '6px',
          marginLeft: '6px'
        }}
      />
      
      {/* Arrow head */}
      <div
        className="absolute top-0 right-0 w-0 h-0 opacity-80"
        style={{
          borderLeft: '12px solid #ef4444',
          borderTop: '6px solid transparent',
          borderBottom: '6px solid transparent',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
        }}
      />
      
      {/* Starting circle */}
      <div
        className="absolute top-0 left-0 w-3 h-3 bg-red-500 opacity-80 rounded-full shadow-lg animate-pulse"
        style={{
          transform: 'translate(-50%, -50%)',
          marginTop: '3px'
        }}
      />
    </div>
  );
};