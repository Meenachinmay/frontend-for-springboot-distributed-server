// src/services/websocket.ts
class WebSocketService {
    private ws: WebSocket | null = null;
    private messageHandlers: ((message: any) => void)[] = [];
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private isConnecting: boolean = false;

    initialize() {
        if (this.ws || this.isConnecting) return;
        this.connect();
    }

    private connect() {
        this.isConnecting = true;
        this.ws = new WebSocket('ws://localhost:8080/ws');

        this.ws.onopen = () => {
            console.log('Connected to WebSocket');
            this.isConnecting = false;
            if (this.reconnectTimeout) {
                clearTimeout(this.reconnectTimeout);
                this.reconnectTimeout = null;
            }
        };

        this.ws.onmessage = (event) => {
            try {
                const notification = JSON.parse(event.data);
                this.messageHandlers.forEach(handler => handler(notification));
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        this.ws.onclose = () => {
            console.log('WebSocket connection closed');
            this.isConnecting = false;
            // Attempt to reconnect after 5 seconds
            this.reconnectTimeout = setTimeout(() => {
                this.connect();
            }, 5000);
        };
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
    }

    onMessage(handler: (message: any) => void) {
        this.messageHandlers.push(handler);
        return () => {
            this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
        };
    }

    isConnected() {
        return this.ws?.readyState === WebSocket.OPEN;
    }
}

const webSocketService = new WebSocketService();
export { webSocketService };