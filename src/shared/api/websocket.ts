import { API_CONFIG }   from './config';
import { useAuthStore } from '../../features/auth/store';

type WSHandler = (payload: any) => void;
type Unsubscribe = () => void;

class WanasaSocket {
  private ws:            WebSocket | null = null;
  private handlers:      Map<string, Set<WSHandler>> = new Map();
  private reconnDelay  = 3_000;
  private maxDelay     = 30_000;
  private reconnTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionalClose = false;
  private pingTimer:   ReturnType<typeof setInterval> | null = null;

  // ── connect ──
  connect() {
    const token = useAuthStore.getState().token;
    if (!token || this.ws?.readyState === WebSocket.OPEN) return;

    this.intentionalClose = false;
    this.ws = new WebSocket(`${API_CONFIG.WS_URL}?token=${token}`);

    this.ws.onopen = () => {
      console.log('🔌 WS connected');
      this.reconnDelay = 3_000;
      this.startPing();
    };

    this.ws.onmessage = ({ data }) => {
      try {
        const { type, payload } = JSON.parse(data);
        this.emit(type, payload);
      } catch {}
    };

    this.ws.onclose = () => {
      this.stopPing();
      if (!this.intentionalClose) {
        console.log(`🔌 WS closed — reconnecting in ${this.reconnDelay}ms`);
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => this.ws?.close();
  }

  disconnect() {
    this.intentionalClose = true;
    this.stopPing();
    if (this.reconnTimer) clearTimeout(this.reconnTimer);
    this.ws?.close();
    this.ws = null;
  }

  // ── subscribe ──
  on(event: string, handler: WSHandler): Unsubscribe {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
    return () => this.handlers.get(event)?.delete(handler);
  }

  // ── join room (challenge, feed, etc.) ──
  joinRoom(room: string) {
    this.send('join', { room });
  }

  leaveRoom(room: string) {
    this.send('leave', { room });
  }

  // ── send ──
  send(type: string, payload?: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // ── private ──
  private emit(event: string, payload: any) {
    this.handlers.get(event)?.forEach(h => h(payload));
    this.handlers.get('*')?.forEach(h => h({ event, payload }));
  }

  private scheduleReconnect() {
    this.reconnTimer = setTimeout(() => {
      this.reconnDelay = Math.min(this.reconnDelay * 1.5, this.maxDelay);
      this.connect();
    }, this.reconnDelay);
  }

  private startPing() {
    this.pingTimer = setInterval(() => {
      this.send('ping');
    }, 25_000);
  }

  private stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }
}

export const socket = new WanasaSocket();
