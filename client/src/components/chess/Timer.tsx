import React from 'react';
import { useChess } from '@/lib/stores/useChess';

export const Timer: React.FC = () => {
  const { timer, currentPlayer } = useChess();

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-bold mb-3 text-center">Game Timer</h3>
      
      <div className="space-y-3">
        {/* White Timer */}
        <div className={`
          p-3 rounded-lg border-2 transition-all duration-300
          ${currentPlayer === 'white' && timer.isRunning
            ? 'border-blue-400 bg-blue-900/30 shadow-blue-400/20 shadow-lg' 
            : 'border-gray-600 bg-gray-700/50'
          }
        `}>
          <div className="flex justify-between items-center">
            <span className="font-semibold">White</span>
            <span className={`
              text-xl font-mono
              ${timer.whiteTime <= 60 ? 'text-red-400' : 'text-white'}
            `}>
              {formatTime(timer.whiteTime)}
            </span>
          </div>
          {currentPlayer === 'white' && timer.isRunning && (
            <div className="w-full bg-gray-600 rounded-full h-1 mt-2">
              <div className="bg-blue-400 h-1 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>

        {/* Black Timer */}
        <div className={`
          p-3 rounded-lg border-2 transition-all duration-300
          ${currentPlayer === 'black' && timer.isRunning
            ? 'border-blue-400 bg-blue-900/30 shadow-blue-400/20 shadow-lg' 
            : 'border-gray-600 bg-gray-700/50'
          }
        `}>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Black</span>
            <span className={`
              text-xl font-mono
              ${timer.blackTime <= 60 ? 'text-red-400' : 'text-white'}
            `}>
              {formatTime(timer.blackTime)}
            </span>
          </div>
          {currentPlayer === 'black' && timer.isRunning && (
            <div className="w-full bg-gray-600 rounded-full h-1 mt-2">
              <div className="bg-blue-400 h-1 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
      </div>

      {/* Timer status */}
      <div className="mt-3 text-center text-sm text-gray-400">
        {timer.isRunning ? (
          <span className="text-green-400">⏰ Running</span>
        ) : (
          <span>⏸️ Paused</span>
        )}
      </div>
    </div>
  );
};
