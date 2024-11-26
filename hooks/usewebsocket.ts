// src/hooks/useWebSocket.ts
import { useEffect, useState } from 'react';
import { webSocketService } from '@/services/websocket';

interface Notification {
    message: string;
    timestamp?: number;  // Made optional since our backend might not send it
}

export function useWebSocket() {
    const [messages, setMessages] = useState<Notification[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const initializeWebSocket = () => {
            webSocketService.initialize();

            const checkConnection = () => {
                setIsConnected(webSocketService.isConnected());
            };

            const intervalId = setInterval(checkConnection, 1000);

            const unsubscribe = webSocketService.onMessage((message) => {
                const notificationWithTimestamp = {
                    ...message,
                    timestamp: message.timestamp || Date.now()
                };
                setMessages(prev => [...prev, notificationWithTimestamp]);
            });

            return () => {
                clearInterval(intervalId);
                unsubscribe();
                webSocketService.disconnect();
            };
        };

        const cleanup = initializeWebSocket();
        return () => cleanup();
    }, []);

    return { messages, isConnected };
}