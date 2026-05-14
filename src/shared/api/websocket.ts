import { API_CONFIG } from './config';

class WanasaSocket {
  private ws:    WebSocket | null = null;
  private _token: string | null   = null;
  private handlers = new Map<string, Set<Function>>();
  private intentionalClose = false;
  private delay = 3000;
  private ping: ReturnType<typeof setInterval> | null = null;

  setToken(t: string | null) { this._token = t; }

  connect() {
    if (!this._token || this.ws?.readyState === WebSocket.OPEN) return;
    this.intentionalClose = false;
    try {
      this.ws = new WebSocket(`${API_CONFIG.WS_URL}?token=${this._token}`);
      this.ws.onopen    = () => {
        this.delay = 3000;
        this.ping = setInterval(() => this.ws?.send(JSON.stringify({type:'ping'})), 25000);
      };
      this.ws.onmessage = ({ data }) => {
        try {
          const { type, payload } = JSON.parse(data);
          this.handlers.get(type)?.forEach(h => h(payload));
        } catch {}
      };
      this.ws.onclose = () => {
        if (this.ping) clearInterval(this.ping);
        if (!this.intentionalClose) {
          setTimeout(() => { this.delay = Math.min(this.delay * 1.5, 30000); this.connect(); }, this.delay);
        }
      };
    } catch {}
  }

  disconnect() {
    this.intentionalClose = true;
    if (this.ping) clearInterval(this.ping);
    this.ws?.close();
    this.ws = null;
  }

  on(event: string, handler: Function) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler);
    return () => this.handlers.get(event)?.delete(handler);
  }

  get isConnected() { return this.ws?.readyState === WebSocket.OPEN; }
}

export const socket = new WanasaSocket();
