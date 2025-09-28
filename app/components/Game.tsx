'use client';

import { useEffect, useRef, useState } from 'react';
import GameEngine from './GameEngine';
import CharacterSelection from './CharacterSelection';
import { PlayerCharacter } from './CharacterData';

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [playerCharacter, setPlayerCharacter] = useState<PlayerCharacter | null>(null);
  const [showCharacterSelection, setShowCharacterSelection] = useState(true);

  const handleCharacterSelected = (character: PlayerCharacter) => {
    setPlayerCharacter(character);
    setShowCharacterSelection(false);
  };

  useEffect(() => {
    if (canvasRef.current && !gameEngineRef.current && playerCharacter && !showCharacterSelection) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Set canvas size
        canvas.width = 800;
        canvas.height = 600;

        // Enable pixel-perfect rendering
        ctx.imageSmoothingEnabled = false;

        // Initialize game engine with character data
        gameEngineRef.current = new GameEngine(canvas, ctx, playerCharacter);
        gameEngineRef.current.start();
        setIsLoaded(true);

        // Make game engine accessible for debugging
        if (typeof window !== 'undefined') {
          (window as any).gameEngine = gameEngineRef.current;
          console.log('🎮 Game engine available as window.gameEngine for debugging');
          console.log('🧪 Use window.gameEngine.testQuestProgression() to test quests');
        }

        // Focus canvas for keyboard input
        canvas.focus();
      }
    }

    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.stop();
      }
    };
  }, [playerCharacter, showCharacterSelection]);

  if (showCharacterSelection) {
    return <CharacterSelection onCharacterSelected={handleCharacterSelected} />;
  }

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
    </div>
  );
};

export default Game;
