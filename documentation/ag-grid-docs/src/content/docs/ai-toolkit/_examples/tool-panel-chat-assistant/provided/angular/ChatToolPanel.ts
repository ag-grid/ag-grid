import { Component, ElementRef, afterRenderEffect, signal, viewChild } from '@angular/core';

import { IToolPanelAngularComp } from 'ag-grid-angular';
import { GridApi, IToolPanelParams } from 'ag-grid-community';

import { callChatGPT } from './chatgptApi';
import { ChatMessage } from './types';

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

// Store conversation history outside the component to persist across grid state changes
let conversationHistory: ChatMessage[] = [];

@Component({
    selector: 'chat-tool-panel',
    standalone: true,
    styles: [
        `
            :host {
                display: block;
                width: 100%;
                height: 100%;
                overflow: hidden;
            }
            .chat-tool-panel {
                width: 100% !important;
                max-width: 100% !important;
                overflow: hidden;
            }
            .chat-messages {
                min-width: 0;
                overflow-x: hidden;
            }
            .chat-message {
                min-width: 0;
                max-width: 85%;
            }
            .message-bubble {
                word-break: break-word;
                overflow-wrap: break-word;
            }
            .chat-input-form {
                min-width: 0;
            }
            .chat-input {
                min-width: 0;
            }
        `,
    ],
    template: `
        <div class="chat-tool-panel">
            <div class="chat-header">
                <div class="chat-title-row">
                    <h3 class="chat-title">AI Assistant</h3>
                    <div class="chat-actions">
                        <button class="icon-btn reset-btn" title="Reset" aria-label="Reset" (click)="reset()">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                                <path d="M21 3v5h-5" />
                                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                                <path d="M8 16H3v5" />
                            </svg>
                        </button>
                    </div>
                </div>
                <p class="chat-subtitle">
                    This example demonstrates the AI Toolkit with conversation history, embedded in a custom tool panel.
                </p>
            </div>

            <div class="chat-messages" #chatMessages>
                @for (message of messages(); track $index) {
                    <div class="chat-message" [class]="message.role + '-message'">
                        <div class="message-bubble">{{ message.content }}</div>
                    </div>
                }
                @if (isLoading()) {
                    <div class="chat-message assistant-message loading-message">
                        <div class="message-bubble">
                            <span class="loading-dots">Thinking<span>.</span><span>.</span><span>.</span></span>
                        </div>
                        <div class="loading-disclaimer">
                            <span class="info-icon">i</span> This demo uses a proxy, so responses may take up to 30
                            seconds
                        </div>
                    </div>
                }
            </div>

            <form class="chat-input-form" (submit)="handleSubmit($event)">
                <textarea
                    #inputRef
                    rows="4"
                    class="chat-input"
                    placeholder='Ask me anything, e.g. "show only failed transactions"...'
                    autocomplete="off"
                    [value]="inputValue()"
                    (input)="inputValue.set(inputRef.value)"
                    (keydown)="handleKeyDown($event)"
                    [disabled]="isLoading()"
                ></textarea>
                <button type="submit" class="chat-submit" [disabled]="isLoading()">→</button>
            </form>
        </div>
    `,
})
export class ChatToolPanel implements IToolPanelAngularComp {
    private readonly chatMessagesRef = viewChild<ElementRef<HTMLDivElement>>('chatMessages');
    private gridApi!: GridApi;
    messages = signal<ChatMessage[]>([]);
    inputValue = signal('');
    isLoading = signal(false);

    constructor() {
        afterRenderEffect({
            write: () => {
                this.messages();
                this.isLoading();

                // Scroll to bottom after render
                const element = this.chatMessagesRef()?.nativeElement;
                if (element) {
                    element.scrollTop = element.scrollHeight;
                }
            },
        });
    }

    agInit(params: IToolPanelParams): void {
        this.gridApi = params.api;
        // Sync local state with conversation history on init
        this.messages.set([...conversationHistory]);
    }

    refresh(): void {
        // Sync messages when refreshed
        this.messages.set([...conversationHistory]);
    }

    async handleSubmit(event: Event): Promise<void> {
        event.preventDefault();

        const userMessage = this.inputValue().trim();
        if (!userMessage || this.isLoading()) return;

        // Render user message
        this.messages.set([...this.messages(), { role: 'user', content: userMessage }]);
        this.inputValue.set('');
        this.isLoading.set(true);

        try {
            const response = await callChatGPT(userMessage, this.gridApi, conversationHistory);

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

            // Apply grid state changes if any (this will destroy and recreate the tool panel)
            // Messages will be automatically added when the tool panel reloads
            if (response.gridState && Object.keys(response.gridState).length > 0) {
                this.gridApi.setState(response.gridState, response.propertiesToIgnore);
            } else {
                // If no state change, manually update messages
                this.messages.set([...conversationHistory]);
            }
        } catch (error) {
            const errorMessage = `Error: ${error instanceof Error ? error.message : String(error)}`;
            this.messages.set([...this.messages(), { role: 'assistant', content: errorMessage }]);
        } finally {
            this.isLoading.set(false);
        }
    }

    // Send message on Enter, allow new lines with Shift+Enter
    handleKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.handleSubmit(event);
        }
    }

    reset(): void {
        // Reset conversation
        conversationHistory = [];
        this.messages.set([]);
        this.inputValue.set('');

        // Reset grid state
        this.gridApi.setState({
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
    }
}
