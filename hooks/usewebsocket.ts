// src/hooks/useWebSocket.ts
import { useEffect, useState, useCallback } from 'react';
import { webSocketService, NotificationType } from '@/services/websocket';

// First, define what a single notification looks like
interface Notification {
    message: string;
    type: NotificationType;
    timestamp: number;
}

// Then, define the structure of our messages state
interface NotificationState {
    [NotificationType.GENERAL]: Notification[];
    [NotificationType.PAYMENT_FAILURE]: Notification[];
}

export function useWebSocket(types: NotificationType[] = []) {
    const [messages, setMessages] = useState<NotificationState>({
        [NotificationType.GENERAL]: [],
        [NotificationType.PAYMENT_FAILURE]: []
    });
    const [connectionStatus, setConnectionStatus] = useState<Record<NotificationType, boolean>>({
        [NotificationType.GENERAL]: false,
        [NotificationType.PAYMENT_FAILURE]: false
    });

    const connectToChannel = useCallback((type: NotificationType) => {
        webSocketService.initialize(type);
    }, []);

    const disconnectFromChannel = useCallback((type: NotificationType) => {
        webSocketService.disconnect(type);
        setConnectionStatus(prev => ({
            ...prev,
            [type]: false
        }));
    }, []);

    useEffect(() => {
        const cleanup = types.map(type => {
            const unsubscribe = webSocketService.onMessage(type, (message) => {
                const notificationWithTimestamp = {
                    ...message,
                    type,
                    timestamp: message.timestamp || Date.now()
                };
                setMessages(prev => ({
                    ...prev,
                    [type]: [...prev[type], notificationWithTimestamp]
                }));
            });

            const intervalId = setInterval(() => {
                setConnectionStatus(prev => ({
                    ...prev,
                    [type]: webSocketService.isConnected(type)
                }));
            }, 1000);

            return () => {
                clearInterval(intervalId);
                unsubscribe();
            };
        });

        return () => cleanup.forEach(cleanup => cleanup());
    }, [types]);

    return {
        messages,
        connectionStatus,
        connectToChannel,
        disconnectFromChannel
    };
}