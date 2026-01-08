import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IToolPanelAngularComp } from 'ag-grid-angular';
import { GridApi, IToolPanelParams } from 'ag-grid-community';

import { callChatGPT } from './chatgptApi';
import { ChatMessage } from './types';

// Store conversation history outside the component to persist across grid state changes
let conversationHistory: ChatMessage[] = [];

@Component({
    selector: 'chat-tool-panel',
    standalone: true,
    imports: [CommonModule, FormsModule],
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
                        <button
                            class="icon-btn reset-chat"
                            title="Clear Chat"
                            aria-label="Clear Chat"
                            (click)="resetConversation()"
                        >
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
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                <line x1="10" x2="10" y1="11" y2="17" />
                                <line x1="14" x2="14" y1="11" y2="17" />
                            </svg>
                        </button>
                        <button
                            class="icon-btn reset-grid"
                            title="Reset Grid"
                            aria-label="Reset Grid"
                            (click)="resetGrid()"
                        >
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
                <div *ngFor="let message of messages()" class="chat-message {{ message.role }}-message">
                    <div class="message-bubble">{{ message.content }}</div>
                </div>
                <div *ngIf="isLoading()" class="chat-message assistant-message loading-message">
                    <div class="message-bubble">
                        <span class="loading-dots">Thinking<span>.</span><span>.</span><span>.</span></span>
                    </div>
                    <div class="loading-disclaimer">
                        <span class="info-icon">i</span> This demo uses a proxy, so responses may take up to 30 seconds
                    </div>
                </div>
            </div>

            <form class="chat-input-form" (ngSubmit)="handleSubmit($event)">
                <textarea
                    rows="4"
                    class="chat-input"
                    placeholder='Ask me anything, e.g. "show only failed transactions"...'
                    autocomplete="off"
                    [ngModel]="inputValue()"
                    (ngModelChange)="inputValue.set($event)"
                    (keydown)="handleKeyDown($event)"
                    [disabled]="isLoading()"
                    name="chatInput"
                ></textarea>
                <button type="submit" class="chat-submit" [disabled]="isLoading()">→</button>
            </form>
        </div>
    `,
})
export class ChatToolPanel implements IToolPanelAngularComp {
    @ViewChild('chatMessages') chatMessagesRef!: ElementRef<HTMLDivElement>;

    private gridApi!: GridApi;

    messages = signal<ChatMessage[]>([]);
    inputValue = signal('');
    isLoading = signal(false);

    agInit(params: IToolPanelParams): void {
        this.gridApi = params.api;
        // Sync local state with conversation history on init
        this.messages.set([...conversationHistory]);
    }

    refresh(): void {
        // Sync messages when refreshed
        this.messages.set([...conversationHistory]);
    }

    async handleSubmit(event?: Event): Promise<void> {
        event?.preventDefault();

        const userMessage = this.inputValue().trim();
        if (!userMessage || this.isLoading()) return;

        // Add user message to conversation
        conversationHistory.push({
            role: 'user',
            content: userMessage,
        });
        this.messages.set([...conversationHistory]);
        this.inputValue.set('');
        this.isLoading.set(true);
        this.scrollToBottom();

        try {
            const currentState = this.gridApi.getState();
            const response = await callChatGPT(userMessage, currentState, this.gridApi, conversationHistory);

            // Log the LLM response
            console.log('Explanation:', response.explanation);
            if (response.gridState && Object.keys(response.gridState).length > 0) {
                console.log('New Grid State: ', response.gridState);
            }
            if (response.propertiesToIgnore?.length > 0) {
                console.log('Properties Ignored:', response.propertiesToIgnore);
            }

            // Add assistant response to conversation BEFORE setState
            conversationHistory.push({
                role: 'assistant',
                content: response.explanation,
            });
            this.messages.set([...conversationHistory]);

            // Apply grid state changes if any
            if (response.gridState && Object.keys(response.gridState).length > 0) {
                this.gridApi.setState(response.gridState, response.propertiesToIgnore);
            }
        } catch (error) {
            const errorMessage = `Error: ${error instanceof Error ? error.message : String(error)}`;
            conversationHistory.push({
                role: 'assistant',
                content: errorMessage,
            });
            this.messages.set([...conversationHistory]);
        } finally {
            this.isLoading.set(false);
            this.scrollToBottom();
        }
    }

    handleKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.handleSubmit();
        }
    }

    resetConversation(): void {
        conversationHistory = [];
        this.messages.set([]);
        this.inputValue.set('');
    }

    resetGrid(): void {
        this.gridApi.setState({
            columnVisibility: { hiddenColIds: [] },
            columnPinning: { leftColIds: [], rightColIds: [] },
            sort: { sortModel: [] },
            filter: { filterModel: {} },
            rowGroup: { groupColIds: [] },
            pagination: { page: 0, pageSize: 20 },
        });
    }

    private scrollToBottom(): void {
        setTimeout(() => {
            if (this.chatMessagesRef?.nativeElement) {
                this.chatMessagesRef.nativeElement.scrollTop = this.chatMessagesRef.nativeElement.scrollHeight;
            }
        }, 0);
    }
}
