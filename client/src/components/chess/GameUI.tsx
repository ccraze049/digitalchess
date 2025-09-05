import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useChess } from '@/lib/stores/useChess';
import { useAudio } from '@/lib/stores/useAudio';
import { Timer } from './Timer';
import { MoveHistory } from './MoveHistory';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Volume2, 
  VolumeX,
  Users,
  Bot
} from 'lucide-react';

export const GameUI: React.FC = () => {
  const {
    currentPlayer,
    isCheck,
    isCheckmate,
    isStalemate,
    gameMode,
    aiDifficulty,
    moveHistory,
    timer,
    resetGame,
    undoMove,
    setGameMode,
    setAIDifficulty,
    startTimer,
    pauseTimer
  } = useChess();
  
  const { isMuted, toggleMute } = useAudio();

  const getGameStatus = () => {
    if (isCheckmate) {
      const winner = currentPlayer === 'white' ? 'Black' : 'White';
      return { status: 'Checkmate', message: `${winner} wins!`, color: 'bg-red-500' };
    }
    if (isStalemate) {
      return { status: 'Stalemate', message: 'Draw game', color: 'bg-yellow-500' };
    }
    if (isCheck) {
      return { status: 'Check', message: `${currentPlayer} king in check`, color: 'bg-orange-500' };
    }
    return { 
      status: 'Playing', 
      message: `${currentPlayer}'s turn`, 
      color: currentPlayer === 'white' ? 'bg-gray-100 text-black' : 'bg-gray-800 text-white' 
    };
  };

  const gameStatus = getGameStatus();

  return (
    <div className="w-full lg:w-80 space-y-4 z-20">
      {/* Game Status */}
      <Card className="bg-gray-900/95 border-gray-700 text-white">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>Chess Game</span>
            <Badge className={gameStatus.color}>
              {gameStatus.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-center font-medium">{gameStatus.message}</p>
          
          {/* Game Mode Display */}
          <div className="flex items-center justify-center space-x-2">
            {gameMode === 'single' ? (
              <>
                <Bot className="w-4 h-4" />
                <span className="text-sm">vs AI ({aiDifficulty})</span>
              </>
            ) : (
              <>
                <Users className="w-4 h-4" />
                <span className="text-sm">Two Players</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Game Controls */}
      <Card className="bg-gray-900/95 border-gray-700 text-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Game Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Timer Controls */}
          <div className="flex space-x-2">
            <Button
              onClick={timer.isRunning ? pauseTimer : startTimer}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              {timer.isRunning ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </>
              )}
            </Button>
            <Button
              onClick={toggleMute}
              variant="outline"
              size="sm"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>

          {/* Game Actions */}
          <div className="flex space-x-2">
            <Button
              onClick={undoMove}
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={moveHistory.length === 0}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Undo
            </Button>
            <Button
              onClick={resetGame}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              New Game
            </Button>
          </div>

          {/* Game Mode Toggle */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Game Mode</label>
            <div className="flex space-x-2">
              <Button
                onClick={() => setGameMode('single')}
                variant={gameMode === 'single' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
              >
                <Bot className="w-4 h-4 mr-2" />
                vs AI
              </Button>
              <Button
                onClick={() => setGameMode('multi')}
                variant={gameMode === 'multi' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
              >
                <Users className="w-4 h-4 mr-2" />
                2 Player
              </Button>
            </div>
          </div>

          {/* AI Difficulty */}
          {gameMode === 'single' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">AI Difficulty</label>
              <div className="flex space-x-1">
                {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
                  <Button
                    key={difficulty}
                    onClick={() => setAIDifficulty(difficulty)}
                    variant={aiDifficulty === difficulty ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timer */}
      <Timer />

      {/* Move History */}
      <MoveHistory />
    </div>
  );
};
