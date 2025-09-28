'use client';

type EventHandler = (data: any) => void;

export class RealtimeService {
  private static instance: RealtimeService | null = null;
  private eventSource: EventSource | null = null;
  private isConnected = false;
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private baseUrl: string;

  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
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
    if (this.eventSource) return;
    try {
      this.eventSource = new EventSource(`${this.baseUrl}/events`);

      this.eventSource.onopen = () => {
        this.isConnected = true;
        this.emitLocal('connection', { connected: true });
      };

      this.eventSource.onerror = () => {
        this.isConnected = false;
        this.emitLocal('connection', { connected: false });
      };

      const subscribe = (evt: string) => {
        this.eventSource!.addEventListener(evt, (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            this.emitLocal(evt, data);
          } catch {
            this.emitLocal(evt, e.data);
          }
        });
      };

      ['ping', 'listing_created', 'fridge_updated', 'listing_deleted', 'leaderboard_updated']
        .forEach(subscribe);
    } catch (e) {
      // ignore
    }
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

