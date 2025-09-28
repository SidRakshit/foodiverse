'use client';

import { useState, useEffect } from 'react';
import { CHARACTER_OPTIONS, CharacterOption, PlayerCharacter, GENDER_OPTIONS, GenderOption } from './CharacterData';

interface CharacterSelectionProps {
  onCharacterSelected: (character: PlayerCharacter) => void;
}

const CharacterSelection: React.FC<CharacterSelectionProps> = ({ onCharacterSelected }) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [playerName, setPlayerName] = useState<string>('');
  const [isEnteringName, setIsEnteringName] = useState<boolean>(false);
  const [selectedGender, setSelectedGender] = useState<GenderOption | null>(null);
  const [selectedGenderIndex, setSelectedGenderIndex] = useState<number>(0);
  const [customPronouns, setCustomPronouns] = useState<string>('');
  const [isEnteringCustomPronouns, setIsEnteringCustomPronouns] = useState<boolean>(false);
  const [isSelectingGender, setIsSelectingGender] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isEnteringCustomPronouns) {
        if (e.key === 'Enter') {
          setIsEnteringCustomPronouns(false);
          setIsEnteringName(true);
        } else if (e.key === 'Escape') {
          setIsEnteringCustomPronouns(false);
          setCustomPronouns('');
          setIsSelectingGender(true);
        } else if (e.key === 'Backspace') {
          setCustomPronouns(prev => prev.slice(0, -1));
        } else if (e.key.length === 1 && customPronouns.length < 15) {
          setCustomPronouns(prev => prev + e.key);
        }
      } else if (isSelectingGender) {
        if (e.key === 'ArrowUp' || e.key === 'KeyW') {
          setSelectedGenderIndex(prev => (prev - 1 + GENDER_OPTIONS.length) % GENDER_OPTIONS.length);
        } else if (e.key === 'ArrowDown' || e.key === 'KeyS') {
          setSelectedGenderIndex(prev => (prev + 1) % GENDER_OPTIONS.length);
        } else if (e.key === 'Enter') {
          const selected = GENDER_OPTIONS[selectedGenderIndex];
          setSelectedGender(selected);
          if (selected.id === 'custom') {
            setIsSelectingGender(false);
            setIsEnteringCustomPronouns(true);
          } else {
            setIsSelectingGender(false);
            setIsEnteringName(true);
          }
        } else if (e.key === 'Escape') {
          setIsSelectingGender(false);
          setIsEnteringName(true);
        }
      } else if (isEnteringName) {
        if (e.key === 'Enter') {
          handleStartGame();
        } else if (e.key === 'Escape') {
          setIsEnteringName(false);
          setIsSelectingGender(true);
        } else if (e.key === 'Backspace') {
          setPlayerName(prev => prev.slice(0, -1));
        } else if (e.key.length === 1 && playerName.length < 20) {
          setPlayerName(prev => prev + e.key);
        }
      } else {
        if (e.key === 'ArrowRight' || e.key === 'KeyD') {
          setSelectedIndex(prev => (prev + 1) % CHARACTER_OPTIONS.length);
        } else if (e.key === 'ArrowLeft' || e.key === 'KeyA') {
          setSelectedIndex(prev => (prev - 1 + CHARACTER_OPTIONS.length) % CHARACTER_OPTIONS.length);
        } else if (e.key === 'ArrowDown' || e.key === 'KeyS') {
          setSelectedIndex(prev => (prev + 4) % CHARACTER_OPTIONS.length);
        } else if (e.key === 'ArrowUp' || e.key === 'KeyW') {
          setSelectedIndex(prev => (prev - 4 + CHARACTER_OPTIONS.length) % CHARACTER_OPTIONS.length);
        } else if (e.key === 'Enter') {
          setIsSelectingGender(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isEnteringName, playerName, isEnteringCustomPronouns, customPronouns, isSelectingGender, selectedGenderIndex, selectedGender]);

  const handleStartGame = () => {
    if (playerName.trim().length < 2) {
      return;
    }

    const characterData = {
      selectedCharacter: CHARACTER_OPTIONS[selectedIndex],
      playerName: playerName.trim(),
      selectedGender: selectedGender,
      customPronouns: selectedGender?.id === 'custom' ? customPronouns : undefined,
      showPronouns: selectedGender ? selectedGender.id !== 'prefer-not' : false
    };

    onCharacterSelected(characterData);
  };

  const renderCharacterPreview = (character: CharacterOption, scale: number = 6) => {
    return (
      <canvas
        width={48}
        height={48}
        style={{ imageRendering: 'pixelated' }}
        ref={(canvas) => {
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.imageSmoothingEnabled = false;
              drawCharacterSprite(ctx, character, 0, 0, scale);
            }
          }
        }}
      />
    );
  };

  const drawCharacterSprite = (
    ctx: CanvasRenderingContext2D,
    character: CharacterOption,
    x: number,
    y: number,
    scale: number
  ) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const spriteData = [
      [0, 1, 1, 1, 1, 1, 1, 0], // Hair
      [1, 2, 2, 2, 2, 2, 2, 1], // Head
      [0, 2, 2, 2, 2, 2, 2, 0], // Face
      [0, 3, 3, 3, 3, 3, 3, 0], // Shirt
      [0, 3, 3, 3, 3, 3, 3, 0], // Shirt
      [0, 4, 4, 4, 4, 4, 4, 0], // Pants
      [0, 4, 4, 0, 0, 4, 4, 0], // Legs
      [0, 2, 2, 0, 0, 2, 2, 0], // Feet
    ];

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x, y + 7 * scale, 8 * scale, scale);

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const pixel = spriteData[row][col];
        if (pixel !== 0) {
          ctx.fillStyle = getPixelColor(pixel, character);
          ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
        }
      }
    }
  };

  const getPixelColor = (pixelType: number, character: CharacterOption): string => {
    switch (pixelType) {
      case 1: return character.hairColor;
      case 2: return character.skinColor;
      case 3: return character.shirtColor;
      case 4: return character.pantsColor;
      default: return 'transparent';
    }
  };

  if (isEnteringCustomPronouns) {
    return (
      <div className="character-selection min-h-screen bg-black text-white flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="custom-pronouns-title">
        <div className="text-center">
          <h1 id="custom-pronouns-title" className="text-4xl font-bold mb-8 text-orange-400">ENTER CUSTOM PRONOUNS</h1>
          <div className="mb-8">
            {renderCharacterPreview(CHARACTER_OPTIONS[selectedIndex], 8)}
          </div>
          <div className="text-2xl mb-4" aria-live="polite">
            <span className="text-gray-400">Pronouns: </span>
            <span className="text-white">{customPronouns}</span>
            <span className="animate-pulse" aria-hidden>
              |
            </span>
          </div>
          <div className="text-gray-400 text-sm">
            <p>Enter your pronouns (e.g., xe/xir, ze/zir)</p>
            <p>Press ENTER to continue or ESCAPE to go back</p>
            <p>Maximum 15 characters</p>
          </div>
        </div>
      </div>
    );
  }

  if (isSelectingGender) {
    return (
      <div className="character-selection min-h-screen bg-black text-white flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="gender-title">
        <div className="text-center">
          <h1 id="gender-title" className="text-4xl font-bold mb-8 text-orange-400">CHOOSE GENDER (OPTIONAL)</h1>
          <div className="mb-8">
            {renderCharacterPreview(CHARACTER_OPTIONS[selectedIndex], 8)}
          </div>

          <div className="mb-6">
            <div className="grid grid-cols-1 gap-3 max-w-md mx-auto mb-6">
              {GENDER_OPTIONS.map((gender, index) => (
                <div
                  key={gender.id}
                  role="button"
                  aria-pressed={selectedGenderIndex === index}
                  tabIndex={0}
                  className={`p-3 border-2 rounded-lg transition-all text-left ${
                    selectedGenderIndex === index
                      ? 'border-orange-400 bg-orange-900 bg-opacity-20'
                      : 'border-gray-600'
                  }`}
                >
                  <div className="text-lg font-bold text-orange-300">{gender.name}</div>
                  {gender.pronouns && (
                    <div className="text-sm text-gray-400">{gender.pronouns}</div>
                  )}
                </div>
              ))}
            </div>

          </div>

          <div className="text-gray-400 text-sm">
            <p>Use ARROW KEYS or WS to select</p>
            <p>Press ENTER to confirm selection</p>
            <p>Press ESCAPE to skip gender selection</p>
            <p className="text-orange-300 mt-2">Pronouns will be shown automatically (except "Prefer not to specify")</p>
          </div>
        </div>
      </div>
    );
  }

  if (isEnteringName) {
    return (
      <div className="character-selection min-h-screen bg-black text-white flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="name-title">
        <div className="text-center">
          <h1 id="name-title" className="text-4xl font-bold mb-8 text-orange-400">ENTER YOUR NAME</h1>
          <div className="mb-8">
            {renderCharacterPreview(CHARACTER_OPTIONS[selectedIndex], 8)}
          </div>

          {selectedGender && (
            <div className="mb-4">
              <span className="text-gray-400">Gender: </span>
              <span className="text-orange-300">{selectedGender.name}</span>
              {selectedGender.id === 'custom' && customPronouns && (
                <>
                  <span className="text-gray-400"> (</span>
                  <span className="text-orange-300">{customPronouns}</span>
                  <span className="text-gray-400">)</span>
                </>
              )}
              {selectedGender.pronouns && selectedGender.id !== 'custom' && (
                <>
                  <span className="text-gray-400"> (</span>
                  <span className="text-orange-300">{selectedGender.pronouns}</span>
                  <span className="text-gray-400">)</span>
                </>
              )}
            </div>
          )}

          <div className="text-2xl mb-4" aria-live="polite">
            <span className="text-gray-400">Name: </span>
            <span className="text-white">{playerName}</span>
            <span className="animate-pulse" aria-hidden>
              |
            </span>
          </div>
          <div className="text-gray-400 text-sm">
            <p>Type your name and press ENTER to start</p>
            <p>Press ESCAPE to go back</p>
            <p>Minimum 2 characters required</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="character-selection min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8 text-orange-400">CHOOSE YOUR CHARACTER</h1>

        <div className="grid grid-cols-4 gap-8 mb-8">
          {CHARACTER_OPTIONS.map((character, index) => (
            <div
              key={character.id}
              role="button"
              aria-pressed={selectedIndex === index}
              tabIndex={0}
              className={`character-option p-4 border-2 rounded-lg transition-all ${
                selectedIndex === index
                  ? 'border-orange-400 bg-orange-900 bg-opacity-20'
                  : 'border-gray-600'
              }`}
            >
              <div className="flex flex-col items-center">
                {renderCharacterPreview(character)}
                <div className="text-lg font-bold mt-2 text-orange-300">
                  {character.number}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-orange-400">Selected Character</h2>
          <div className="flex justify-center mb-4">
            {renderCharacterPreview(CHARACTER_OPTIONS[selectedIndex], 8)}
          </div>
          <div className="text-xl text-orange-300">Character {CHARACTER_OPTIONS[selectedIndex].number}</div>
        </div>

        <div className="text-gray-400 text-sm" aria-live="polite">
          <p>Use ARROW KEYS or WASD to select a character</p>
          <p>Press ENTER to continue to gender selection</p>
        </div>
      </div>
    </div>
  );
};

export default CharacterSelection;