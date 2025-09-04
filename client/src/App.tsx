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
      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Loading Chess Game...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-amber-50 to-amber-200 relative overflow-hidden">
      {/* Background 3D Scene (hidden for now, can be enabled for 3D effects) */}
      <div className="absolute inset-0 opacity-0">
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

      {/* 2D Chess Game */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
        <div className="flex items-center justify-center">
          <ChessBoard />
        </div>
      </div>

      {/* Game UI */}
      <GameUI />
      
      {/* Title */}
      <div className="absolute top-4 left-4 z-20">
        <h1 className="text-4xl font-bold text-amber-900 drop-shadow-lg">
          Digital Chess
        </h1>
        <p className="text-amber-800 mt-1">
          A comprehensive chess experience
        </p>
      </div>
    </div>
  );
}

export default App;
