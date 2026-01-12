import React, { useCallback, useEffect, useRef, useState } from 'react';

import type { IToolPanelParams } from 'ag-grid-community';
import type { CustomToolPanelProps } from 'ag-grid-react';

import { callChatGPT } from './chatgptApi';
import type { ChatMessage } from './types';

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

// Store conversation history outside the component to persist across grid state changes
let conversationHistory: ChatMessage[] = [];

export const ChatToolPanel = (props: CustomToolPanelProps & IToolPanelParams) => {
    const { api: gridApi } = props;
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatMessagesRef = useRef<HTMLDivElement>(null);

    // Sync local state with conversation history on mount
    useEffect(() => {
        setMessages([...conversationHistory]);
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();

            const userMessage = inputValue.trim();
            if (!userMessage || isLoading) return;

            // Render user message
            setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
            setInputValue('');
            setIsLoading(true);

            try {
                const response = await callChatGPT(userMessage, gridApi, conversationHistory);

                // Log the LLM response
                console.log('Explanation:', response.explanation);
                if (response.gridState && Object.keys(response.gridState).length > 0) {
                    console.log('New Grid State: ', response.gridState);
                }
                if (response.propertiesToIgnore?.length > 0) {
                    console.log('Properties Ignored:', response.propertiesToIgnore);
                }

                // Add both messages to history after successful response
                conversationHistory.push(
                    { role: 'user', content: userMessage },
                    { role: 'assistant', content: response.explanation }
                );

                // Always update messages state to render the assistant response
                setMessages([...conversationHistory]);

                // Apply grid state changes if any
                if (response.gridState && Object.keys(response.gridState).length > 0) {
                    gridApi.setState(response.gridState, response.propertiesToIgnore);
                }
            } catch (error) {
                const errorMessage = `Error: ${error instanceof Error ? error.message : String(error)}`;
                setMessages((prev) => [...prev, { role: 'assistant', content: errorMessage }]);
            } finally {
                setIsLoading(false);
            }
        },
        [inputValue, isLoading, gridApi]
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as unknown as React.FormEvent);
            }
        },
        [handleSubmit]
    );

    const reset = useCallback(() => {
        // Reset conversation
        conversationHistory = [];
        setMessages([]);
        setInputValue('');

        // Reset grid state
        gridApi.setState({
            columnVisibility: {
                hiddenColIds: [
                    'ag-Grid-HierarchyColumn-transactionDate-year',
                    'ag-Grid-HierarchyColumn-transactionDate-year',
                    'ag-Grid-HierarchyColumn-transactionDate-formattedMonth',
                    'ag-Grid-HierarchyColumn-transactionDate-formattedMonth',
                    'currency',
                ],
            },
            columnPinning: { leftColIds: [], rightColIds: [] },
            sort: { sortModel: [] },
            filter: { filterModel: {} },
            rowGroup: { groupColIds: [] },
            pagination: { page: 0, pageSize: 100 },
        });
    }, [gridApi]);

    return (
        <div className="chat-tool-panel" style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
            <div className="chat-header">
                <div className="chat-title-row">
                    <h3 className="chat-title">AI Assistant</h3>
                    <div className="chat-actions">
                        <button className="icon-btn reset-btn" title="Reset" aria-label="Reset" onClick={reset}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                                <path d="M21 3v5h-5" />
                                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                                <path d="M8 16H3v5" />
                            </svg>
                        </button>
                    </div>
                </div>
                <p className="chat-subtitle">
                    This example demonstrates the AI Toolkit with conversation history, embedded in a custom tool panel.
                </p>
            </div>

            <div className="chat-messages" ref={chatMessagesRef} style={{ minWidth: 0, overflowX: 'hidden' }}>
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`chat-message ${message.role}-message`}
                        style={{ minWidth: 0, maxWidth: '85%' }}
                    >
                        <div className="message-bubble" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                            {message.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div
                        className="chat-message assistant-message loading-message"
                        style={{ minWidth: 0, maxWidth: '85%' }}
                    >
                        <div className="message-bubble" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                            <span className="loading-dots">
                                Thinking<span>.</span>
                                <span>.</span>
                                <span>.</span>
                            </span>
                        </div>
                        <div className="loading-disclaimer">
                            <span className="info-icon">i</span> This demo uses a proxy, so responses may take up to 30
                            seconds
                        </div>
                    </div>
                )}
            </div>

            <form className="chat-input-form" onSubmit={handleSubmit} style={{ minWidth: 0 }}>
                <textarea
                    rows={4}
                    className="chat-input"
                    style={{ minWidth: 0 }}
                    placeholder='Ask me anything, e.g. "show only failed transactions"...'
                    autoComplete="off"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                />
                <button type="submit" className="chat-submit" disabled={isLoading}>
                    →
                </button>
            </form>
        </div>
    );
};
