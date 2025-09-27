'use client';

import { useEffect, useRef, useState } from 'react';
import GameEngine from './GameEngine';

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (canvasRef.current && !gameEngineRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Set canvas size
        canvas.width = 800;
        canvas.height = 600;
        
        // Enable pixel-perfect rendering
        ctx.imageSmoothingEnabled = false;
        
        // Initialize game engine
        gameEngineRef.current = new GameEngine(canvas, ctx);
        gameEngineRef.current.start();
        setIsLoaded(true);
        
        // Focus canvas for keyboard input
        canvas.focus();
      }
    }

    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="relative game-ui">
      <canvas
        ref={canvasRef}
        className="pixel-border pixelated"
        tabIndex={0}
        style={{
          imageRendering: 'pixelated',
          outline: 'none',
        }}
        onFocus={() => console.log('Canvas focused - keyboard controls active')}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center loading-screen text-white">
          <div className="text-center">
            <div className="text-xl mb-2">LOADING...</div>
            <div className="text-sm">Initializing pixel world...</div>
          </div>
        </div>
      )}
      <div className="mt-4 text-white text-center game-ui">
        <div className="bg-black bg-opacity-80 p-4 rounded border border-white inline-block">
          <p className="text-sm mb-1">🎮 VIRGINIA TECH CAMPUS</p>
          <p className="text-xs">WASD or Arrow Keys to move around campus</p>
          <p className="text-xs">Explore Burruss Hall, Newman Library & more!</p>
          <p className="text-xs mt-2">Click canvas first, then use keyboard</p>
        </div>
      </div>
    </div>
  );
};

export default Game;
