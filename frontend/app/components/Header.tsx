'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { realtimeService } from '../services/RealtimeService';

export default function Header() {
  const [connected, setConnected] = useState(false);
  

  useEffect(() => {
    const onConn = (d: any) => setConnected(!!d.connected);
    realtimeService.on('connection', onConn);
    realtimeService.connect();
    return () => realtimeService.off('connection', onConn);
  }, []);

  

  return (
    <header className="w-full flex items-center justify-between px-4 py-2 bg-black text-white border-b border-white">
      <nav className="flex gap-4 text-sm">
        <Link href="/" className="underline">Home</Link>
        <Link href="/about" className="underline">About</Link>
        <Link href="/accessibility" className="underline">Accessibility</Link>
        <Link href="/dei" className="underline">DEI</Link>
        <Link href="/help" className="underline">Help</Link>
      </nav>
      <div className="flex items-center gap-3">
        <div aria-live="polite" className="text-xs">
          {connected ? 'Realtime: Connected' : 'Realtime: Connecting...'}
        </div>
      </div>
    </header>
  );
}


