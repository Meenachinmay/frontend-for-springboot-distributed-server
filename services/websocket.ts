// src/services/websocket.ts
export enum NotificationType {
    GENERAL = 'GENERAL',
    PAYMENT_FAILURE = 'PAYMENT_FAILURE'
}

class WebSocketService {
    private connections: Map<NotificationType, WebSocket> = new Map();
    private messageHandlers: Map<NotificationType, ((message: any) => void)[]> = new Map();
    private reconnectTimeouts: Map<NotificationType, NodeJS.Timeout> = new Map();
    private isConnecting: Map<NotificationType, boolean> = new Map();

    initialize(type: NotificationType = NotificationType.GENERAL) {
        if (this.connections.get(type) || this.isConnecting.get(type)) return;
        this.connect(type);
    }

    private connect(type: NotificationType) {
        this.isConnecting.set(type, true);
        const ws = new WebSocket(`ws://localhost:8080/ws?type=${type}`);
        this.connections.set(type, ws);

        ws.onopen = () => {
            console.log(`Connected to WebSocket channel: ${type}`);
            this.isConnecting.set(type, false);
            const timeout = this.reconnectTimeouts.get(type);
            if (timeout) {
                clearTimeout(timeout);
                this.reconnectTimeouts.delete(type);
            }
        };

        ws.onmessage = (event) => {
            try {
                const notification = JSON.parse(event.data);
                const handlers = this.messageHandlers.get(type) || [];
                handlers.forEach(handler => handler(notification));
            } catch (error) {
                console.error(`Error parsing message for ${type}:`, error);
            }
        };

        ws.onerror = (error) => {
            console.error(`WebSocket Error for ${type}:`, error);
        };

        ws.onclose = () => {
            console.log(`WebSocket connection closed for ${type}`);
            this.isConnecting.set(type, false);
            this.connections.delete(type);

            const timeout = setTimeout(() => {
                this.connect(type);
            }, 5000);
            this.reconnectTimeouts.set(type, timeout);
        };
    }

    disconnect(type?: NotificationType) {
        if (type) {
            // Disconnect specific channel
            const ws = this.connections.get(type);
            if (ws) {
                ws.close();
                this.connections.delete(type);
            }
            const timeout = this.reconnectTimeouts.get(type);
            if (timeout) {
                clearTimeout(timeout);
                this.reconnectTimeouts.delete(type);
            }
        } else {
            // Disconnect all channels
            this.connections.forEach(ws => ws.close());
            this.connections.clear();
            this.reconnectTimeouts.forEach(timeout => clearTimeout(timeout));
            this.reconnectTimeouts.clear();
        }
    }

    onMessage(type: NotificationType, handler: (message: any) => void) {
        if (!this.messageHandlers.has(type)) {
            this.messageHandlers.set(type, []);
        }
        this.messageHandlers.get(type)?.push(handler);

        return () => {
            const handlers = this.messageHandlers.get(type) || [];
            this.messageHandlers.set(type, handlers.filter(h => h !== handler));
        };
    }

    isConnected(type: NotificationType) {
        return this.connections.get(type)?.readyState === WebSocket.OPEN;
    }
}

const webSocketService = new WebSocketService();
export { webSocketService };