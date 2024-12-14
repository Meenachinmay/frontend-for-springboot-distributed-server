// src/components/Notifications.tsx
'use client';

import { useEffect, useState } from 'react';
import { useWebSocket } from '../hooks/usewebsocket';
import { NotificationType } from '@/services/websocket';
import LoadingState from './LoadingState';

export default function Notifications() {
    const [mounted, setMounted] = useState(false);
    const [activeChannels, setActiveChannels] = useState<NotificationType[]>([]);
    const { messages, connectionStatus, connectToChannel, disconnectFromChannel } = useWebSocket(activeChannels);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <LoadingState />;
    }

    const handleChannelToggle = (type: NotificationType) => {
        if (activeChannels.includes(type)) {
            setActiveChannels(prev => prev.filter(t => t !== type));
            disconnectFromChannel(type);
        } else {
            setActiveChannels(prev => [...prev, type]);
            connectToChannel(type);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            {/* Channel subscription buttons */}
            <div className="flex gap-4 mb-6">
                {Object.values(NotificationType).map((type) => (
                    <button
                        key={type}
                        onClick={() => handleChannelToggle(type)}
                        className={`px-4 py-2 rounded-md ${
                            activeChannels.includes(type)
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700'
                        }`}
                    >
                        {activeChannels.includes(type) ? 'Disconnect' : 'Connect'} {type}
                    </button>
                ))}
            </div>

            {/* Connection status indicators */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {Object.entries(connectionStatus).map(([type, isConnected]) => (
                    <div
                        key={type}
                        className={`p-4 rounded-md ${
                            isConnected
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                        }`}
                    >
                        {type} Status: {isConnected ? 'Connected' : 'Disconnected'}
                    </div>
                ))}
            </div>

            {/* Message displays */}
            <div className="grid grid-cols-2 gap-4">
                {Object.entries(messages).map(([type, channelMessages]) => (
                    <div key={type} className="border rounded-lg h-[400px] overflow-y-auto bg-white">
                        <div className="bg-gray-100 p-2 font-semibold">{type} Messages</div>
                        {!activeChannels.includes(type as NotificationType) ? (
                            <div className="text-gray-500 text-center p-4">
                                Not subscribed to {type} channel
                            </div>
                        ) : channelMessages.length === 0 ? (
                            <div className="text-gray-500 text-center p-4">
                                No messages in {type} channel
                            </div>
                        ) : (
                            <div className="divide-y">
                                {channelMessages.map((msg, index) => (
                                    <div key={index} className="p-4">
                                        <div className="text-gray-800">{msg.message}</div>
                                        <div className="text-sm text-gray-500">
                                            {new Date(msg.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Testing instructions */}
            <div className="bg-gray-50 p-6 rounded-lg text-gray-400 mt-6">
                {/* ... (testing instructions remain the same) ... */}
                <div className="bg-gray-50 p-6 rounded-lg text-gray-400 mt-6">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">How to test:</h3>
                    <p className="mb-2 text-gray-600">Send POST requests to:</p>
                    <code className="bg-gray-100 p-2 rounded block mb-2">
                        General: http://localhost:8081/api/notifications/publish
                        <br/>
                        Payment Failures: http://localhost:8081/api/notifications/publish?type=PAYMENT_FAILURE
                    </code>
                    <p className="text-sm text-gray-600 mt-4">
                        Example curl commands:
                    </p>
                    <code className="bg-gray-100 p-2 rounded block mt-2 whitespace-pre">
                        {`# General notification
curl -X POST http://localhost:8081/api/notifications/publish \\
-H "Content-Type: application/json" \\
-d '"Your general message here"'

# Payment failure notification
curl -X POST "http://localhost:8081/api/notifications/publish?type=PAYMENT_FAILURE" \\
-H "Content-Type: application/json" \\
-d '"Payment failed for transaction XYZ"'`}
                    </code>
                </div>
            </div>
        </div>
    );
}