'use client';

import Game from './components/Game';

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <Game />
    </div>
  );
}