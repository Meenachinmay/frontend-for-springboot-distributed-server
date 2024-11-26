// src/components/Notifications.tsx
'use client';

import { useEffect, useState } from 'react';
import { useWebSocket } from '../hooks/usewebsocket';
import LoadingState from './LoadingState';

export default function Notifications() {
    const [mounted, setMounted] = useState(false);
    const { messages, isConnected } = useWebSocket();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <LoadingState />;
    }

    // @ts-ignore
    return (
        <div className="max-w-3xl mx-auto p-6">
            <div
                className={`p-4 mb-6 rounded-md ${
                    isConnected
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                }`}
            >
                Status: {isConnected ? 'Connected' : 'Disconnected'}
            </div>

            <div className="border rounded-lg h-[400px] overflow-y-auto mb-6 bg-white">
                {messages.length === 0 ? (
                    <div className="text-gray-500 text-center p-4">
                        No messages yet
                    </div>
                ) : (
                    <div className="divide-y">
                        {messages.map((msg, index) => (
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

            <div className="bg-gray-50 p-6 rounded-lg text-gray-400">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">How to test:</h3>
                <p className="mb-2 text-gray-600">Send a POST request to:</p>
                <code className="bg-gray-100 p-2 rounded block mb-2">
                    http://localhost:8081/api/notifications/publish
                </code>
                <p className="text-sm text-gray-600">
                    with a JSON body using Postman or curl:
                </p>
                <code className="bg-gray-100 p-2 rounded block mt-2">
                    curl -X POST http://localhost:8081/api/notifications/publish \
                    -H "Content-Type: application/json" \
                    -d '"Your message here"'
                </code>
            </div>
        </div>
    );
}