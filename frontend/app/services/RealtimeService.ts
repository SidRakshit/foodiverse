'use client';

type EventHandler = (data: any) => void;

export class RealtimeService {
  private static instance: RealtimeService | null = null;
  private eventSource: EventSource | null = null;
  private isConnected = false;
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private baseUrl: string;

  private constructor() {
    // Use relative paths for Vercel deployment, fallback to localhost for development
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.origin ? '/api' : 'http://localhost:8080');
    if (typeof window !== 'undefined') {
      console.log('🔗 RealtimeService using baseUrl:', this.baseUrl);
    }
  }

  static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService();
    }
    return RealtimeService.instance;
  }

  connect() {
    if (this.isConnected) return;
    
    // Use polling instead of SSE for serverless compatibility
    this.isConnected = true;
    this.emitLocal('connection', { connected: true });
    
    // Start polling for updates every 30 seconds
    this.startPolling();
  }

  private startPolling() {
    const poll = async () => {
      try {
        const response = await fetch(`${this.baseUrl}/events/ping`);
        if (response.ok) {
          const data = await response.json();
          this.emitLocal('ping', data);
        }
      } catch (error) {
        console.warn('Polling failed:', error);
        this.isConnected = false;
        this.emitLocal('connection', { connected: false });
      }
    };

    // Poll immediately, then every 30 seconds
    poll();
    setInterval(poll, 30000);
  }

  on(eventName: string, handler: EventHandler) {
    if (!this.handlers.has(eventName)) this.handlers.set(eventName, new Set());
    this.handlers.get(eventName)!.add(handler);
  }

  off(eventName: string, handler: EventHandler) {
    this.handlers.get(eventName)?.delete(handler);
  }

  getConnected(): boolean {
    return this.isConnected;
  }

  private emitLocal(eventName: string, data: any) {
    const hs = this.handlers.get(eventName);
    if (!hs) return;
    hs.forEach((h) => {
      try { h(data); } catch {}
    });
  }
}

export const realtimeService = RealtimeService.getInstance();

