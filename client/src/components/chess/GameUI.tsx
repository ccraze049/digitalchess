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
  Bot,
  Brain,
  MessageSquare,
  Lightbulb,
  Sparkles
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
    useGeminiAI,
    aiCoaching,
    lastMoveExplanation,
    isAnalyzing,
    resetGame,
    undoMove,
    setGameMode,
    setAIDifficulty,
    toggleGeminiAI,
    analyzePosition,
    explainLastMove,
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
    <div className="w-full lg:w-80 space-y-3 sm:space-y-4 z-20">
      {/* Game Status */}
      <Card className="bg-gray-900/95 backdrop-blur-sm border-gray-700 text-white shadow-xl">
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="flex items-center justify-between text-base sm:text-lg">
            <span>Chess Game</span>
            <Badge className={`${gameStatus.color} text-xs sm:text-sm px-2 py-1`}>
              {gameStatus.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3">
          <p className="text-center font-medium text-sm sm:text-base">{gameStatus.message}</p>
          
          {/* Game Mode Display */}
          <div className="flex items-center justify-center space-x-2 bg-gray-800/50 rounded-lg py-2 px-3">
            {gameMode === 'single' ? (
              <>
                <Bot className="w-4 h-4 text-blue-400" />
                <span className="text-xs sm:text-sm font-medium">vs AI ({aiDifficulty})</span>
              </>
            ) : (
              <>
                <Users className="w-4 h-4 text-green-400" />
                <span className="text-xs sm:text-sm font-medium">Two Players</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Game Controls */}
      <Card className="bg-gray-900/95 backdrop-blur-sm border-gray-700 text-white shadow-xl">
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-sm sm:text-base flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Game Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3">
          {/* Timer Controls */}
          <div className="flex space-x-2">
            <Button
              onClick={timer.isRunning ? pauseTimer : startTimer}
              variant="outline"
              size="sm"
              className="flex-1 bg-gray-800/50 hover:bg-gray-700 border-gray-600 text-xs sm:text-sm"
            >
              {timer.isRunning ? (
                <>
                  <Pause className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Pause</span>
                  <span className="sm:hidden">⏸</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Start</span>
                  <span className="sm:hidden">▶</span>
                </>
              )}
            </Button>
            <Button
              onClick={toggleMute}
              variant="outline"
              size="sm"
              className="bg-gray-800/50 hover:bg-gray-700 border-gray-600 px-2 sm:px-3"
            >
              {isMuted ? <VolumeX className="w-3 h-3 sm:w-4 sm:h-4" /> : <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />}
            </Button>
          </div>

          {/* Game Actions */}
          <div className="flex space-x-2">
            <Button
              onClick={undoMove}
              variant="outline"
              size="sm"
              className="flex-1 bg-gray-800/50 hover:bg-gray-700 border-gray-600 text-xs sm:text-sm"
              disabled={moveHistory.length === 0}
            >
              <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Undo</span>
              <span className="sm:hidden">↶</span>
            </Button>
            <Button
              onClick={resetGame}
              variant="outline"
              size="sm"
              className="flex-1 bg-gray-800/50 hover:bg-gray-700 border-gray-600 text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">New Game</span>
              <span className="sm:hidden">🎮</span>
            </Button>
          </div>

          {/* Game Mode Toggle */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-gray-300">Game Mode</label>
            <div className="flex space-x-1 sm:space-x-2">
              <Button
                onClick={() => setGameMode('single')}
                variant={gameMode === 'single' ? 'default' : 'outline'}
                size="sm"
                className={`flex-1 text-xs sm:text-sm ${
                  gameMode === 'single' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800/50 hover:bg-gray-700 border-gray-600'
                }`}
              >
                <Bot className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">vs AI</span>
                <span className="sm:hidden">AI</span>
              </Button>
              <Button
                onClick={() => setGameMode('multi')}
                variant={gameMode === 'multi' ? 'default' : 'outline'}
                size="sm"
                className={`flex-1 text-xs sm:text-sm ${
                  gameMode === 'multi' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-800/50 hover:bg-gray-700 border-gray-600'
                }`}
              >
                <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">2 Player</span>
                <span className="sm:hidden">2P</span>
              </Button>
            </div>
          </div>

          {/* AI Difficulty */}
          {gameMode === 'single' && (
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-300">AI Difficulty</label>
              <div className="flex space-x-1">
                {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
                  <Button
                    key={difficulty}
                    onClick={() => setAIDifficulty(difficulty)}
                    variant={aiDifficulty === difficulty ? 'default' : 'outline'}
                    size="sm"
                    className={`flex-1 text-xs transition-all ${
                      aiDifficulty === difficulty 
                        ? difficulty === 'easy' ? 'bg-green-600 hover:bg-green-700' 
                        : difficulty === 'medium' ? 'bg-yellow-600 hover:bg-yellow-700'
                        : 'bg-red-600 hover:bg-red-700'
                        : 'bg-gray-800/50 hover:bg-gray-700 border-gray-600'
                    }`}
                  >
                    <span className="hidden sm:inline">{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
                    <span className="sm:hidden">{difficulty.charAt(0).toUpperCase()}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Gemini AI Toggle */}
          {gameMode === 'single' && (
            <div className="space-y-2">
              <Button
                onClick={toggleGeminiAI}
                variant={useGeminiAI ? 'default' : 'outline'}
                size="sm"
                className={`w-full text-xs sm:text-sm transition-all ${
                  useGeminiAI 
                    ? 'bg-purple-600 hover:bg-purple-700 border-purple-500' 
                    : 'bg-gray-800/50 hover:bg-gray-700 border-gray-600'
                }`}
              >
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Gemini AI {useGeminiAI ? 'ON' : 'OFF'}</span>
                <span className="sm:hidden">AI {useGeminiAI ? '✓' : '✗'}</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timer */}
      <Timer />

      {/* AI Coach Panel */}
      {useGeminiAI && (
        <Card className="bg-gradient-to-br from-purple-900/95 to-blue-900/95 backdrop-blur-sm border-purple-600/50 text-white shadow-xl">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base flex items-center">
              <Brain className="w-4 h-4 mr-2 text-purple-300" />
              AI Coach
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            {/* Analysis Controls */}
            <div className="flex space-x-2">
              <Button
                onClick={analyzePosition}
                disabled={isAnalyzing}
                variant="outline"
                size="sm"
                className="flex-1 bg-purple-800/50 hover:bg-purple-700/70 border-purple-500/50 text-xs sm:text-sm"
              >
                <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{isAnalyzing ? 'Analyzing...' : 'Analyze'}</span>
                <span className="sm:hidden">{isAnalyzing ? '...' : '🔍'}</span>
              </Button>
              <Button
                onClick={explainLastMove}
                disabled={isAnalyzing || moveHistory.length === 0}
                variant="outline"
                size="sm"
                className="flex-1 bg-purple-800/50 hover:bg-purple-700/70 border-purple-500/50 text-xs sm:text-sm"
              >
                <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Explain Move</span>
                <span className="sm:hidden">💬</span>
              </Button>
            </div>

            {/* AI Coaching Messages */}
            {(aiCoaching || lastMoveExplanation) && (
              <div className="bg-purple-800/30 rounded-lg p-3 border border-purple-500/30">
                {lastMoveExplanation && (
                  <div className="mb-2">
                    <h4 className="text-xs font-medium text-purple-200 mb-1">Move Explanation:</h4>
                    <p className="text-xs sm:text-sm text-gray-100 leading-relaxed">{lastMoveExplanation}</p>
                  </div>
                )}
                {aiCoaching && (
                  <div>
                    <h4 className="text-xs font-medium text-purple-200 mb-1">AI Coach:</h4>
                    <p className="text-xs sm:text-sm text-gray-100 leading-relaxed">{aiCoaching}</p>
                  </div>
                )}
              </div>
            )}
            
            {!aiCoaching && !lastMoveExplanation && !isAnalyzing && (
              <div className="text-center text-xs sm:text-sm text-purple-200 py-2">
                Click buttons above for AI analysis and coaching tips!
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Move History */}
      <MoveHistory />
    </div>
  );
};
