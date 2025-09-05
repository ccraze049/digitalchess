import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { useAudio } from "./lib/stores/useAudio";
import { useChess } from "./lib/stores/useChess";
import { ChessBoard } from "./components/chess/ChessBoard";
import { GameUI } from "./components/chess/GameUI";
import "@fontsource/inter";

// 3D Scene for potential future 3D board
const Scene: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      {/* 3D elements can be added here later */}
    </>
  );
};

function App() {
  const { initializeGame } = useChess();
  const { setHitSound, setSuccessSound } = useAudio();
  const [showGame, setShowGame] = useState(false);

  useEffect(() => {
    // Initialize the chess game
    initializeGame('single', 'medium');
    
    // Load audio files
    const hitAudio = new Audio('/sounds/hit.mp3');
    const successAudio = new Audio('/sounds/success.mp3');
    
    setHitSound(hitAudio);
    setSuccessSound(successAudio);
    
    // Show the game after initialization
    setShowGame(true);
  }, [initializeGame, setHitSound, setSuccessSound]);

  if (!showGame) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-200">
        <div className="text-center p-8">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-amber-300 border-t-amber-800 mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">♔</span>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-amber-900 mb-2">डिजिटल शतरंज लोड हो रहा है...</h2>
          <p className="text-amber-700 text-sm">कृपया प्रतीक्षा करें</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-amber-50 to-amber-200 relative">
      {/* Background 3D Scene (hidden for now, can be enabled for 3D effects) */}
      <div className="absolute inset-0 opacity-0 pointer-events-none">
        <Canvas
          camera={{
            position: [0, 5, 10],
            fov: 45,
            near: 0.1,
            far: 1000
          }}
          gl={{
            antialias: true,
            powerPreference: "default"
          }}
        >
          <color attach="background" args={["#f3f4f6"]} />
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>

      {/* Mobile-first responsive layout */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* Title - Mobile friendly */}
        <div className="lg:absolute lg:top-4 lg:left-4 z-20 p-4 lg:p-0">
          <h1 className="text-2xl lg:text-4xl font-bold text-amber-900 drop-shadow-lg text-center lg:text-left">
            डिजिटल शतरंज
          </h1>
          <p className="text-amber-800 mt-1 text-center lg:text-left text-sm lg:text-base">
            एक व्यापक शतरंज अनुभव
          </p>
        </div>

        {/* Main game area */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
          <div className="flex items-center justify-center w-full max-w-lg lg:max-w-none">
            <ChessBoard />
          </div>
        </div>

        {/* Game UI - Mobile responsive */}
        <div className="lg:absolute lg:top-4 lg:right-4 lg:w-80 p-4 lg:p-0">
          <GameUI />
        </div>
      </div>
    </div>
  );
}

export default App;
