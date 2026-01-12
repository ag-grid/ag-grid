import type { GridApi, IToolPanel, IToolPanelParams } from 'ag-grid-community';

import { callChatGPT } from './chatgptApi';
import type { ChatMessage } from './types';

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

// Store conversation history outside the component to persist across grid state changes
let conversationHistory: ChatMessage[] = [];

export class ChatToolPanel implements IToolPanel {
    private eGui!: HTMLElement;
    private gridApi!: GridApi;
    private chatMessagesContainer!: HTMLElement;
    private inputElement!: HTMLTextAreaElement;
    private submitButton!: HTMLButtonElement;
    private formElement!: HTMLFormElement;
    private resetButton!: HTMLButtonElement;

    // Event handler references for cleanup
    private handleSubmitBound = (e: Event) => this.handleSubmit(e);
    private handleKeydownBound = (e: KeyboardEvent) => this.handleKeydown(e);
    private resetBound = () => this.reset();

    init(params: IToolPanelParams): void {
        this.gridApi = params.api;
        this.eGui = this.createGui();
        // Re-render existing messages when tool panel is re-created
        this.renderExistingMessages();
    }

    getGui(): HTMLElement {
        return this.eGui;
    }

    refresh(_params: IToolPanelParams): boolean {
        return false;
    }

    private createGui(): HTMLElement {
        const container = document.createElement('div');
        container.className = 'chat-tool-panel';
        container.innerHTML = `
            <div class="chat-header">
                <div class="chat-title-row">
                    <h3 class="chat-title">AI Assistant</h3>
                    <div class="chat-actions">
                        <button class="icon-btn reset-btn" title="Reset" aria-label="Reset">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
                        </button>
                    </div>
                </div>
                <p class="chat-subtitle">This example demonstrates the AI Toolkit with conversation history, embedded in a custom tool panel.</p>
            </div>
            <div class="chat-messages"></div>
            <form class="chat-input-form">
                <textarea
                    id="chat-input"
                    rows="4"
                    class="chat-input"
                    placeholder='Ask me anything, e.g. "show only failed transactions"...'
                    autocomplete="off"
                ></textarea>
                <button type="submit" class="chat-submit">→</button>
            </form>
        `;

        this.chatMessagesContainer = container.querySelector('.chat-messages')!;
        this.inputElement = container.querySelector('.chat-input')!;
        this.submitButton = container.querySelector('.chat-submit')!;
        this.formElement = container.querySelector('.chat-input-form')!;
        this.resetButton = container.querySelector('.reset-btn')!;

        // Add event listeners using bound handlers for cleanup
        this.formElement.addEventListener('submit', this.handleSubmitBound);
        this.inputElement.addEventListener('keydown', this.handleKeydownBound);
        this.resetButton.addEventListener('click', this.resetBound);

        return container;
    }

    private handleKeydown(event: KeyboardEvent): void {
        // Enter sends message, Shift+Enter adds newline
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.formElement.dispatchEvent(new Event('submit', { cancelable: true }));
        }
    }

    private async handleSubmit(event: Event): Promise<void> {
        event.preventDefault();

        const userMessage = this.inputElement.value.trim();
        if (!userMessage) return;

        // Render user message
        this.renderMessage('user', userMessage);

        // Clear input and disable form
        this.inputElement.value = '';
        this.inputElement.disabled = true;
        this.submitButton.disabled = true;

        // Show loading indicator
        const loadingId = this.showLoadingMessage();

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

            // Remove loading indicator
            this.removeLoadingMessage(loadingId);

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
                // If no state change, manually render the response
                this.renderMessage('assistant', response.explanation);
            }
        } catch (error) {
            this.removeLoadingMessage(loadingId);
            const errorMessage = `Error: ${error instanceof Error ? error.message : String(error)}`;
            this.renderMessage('assistant', errorMessage, true);
        } finally {
            // Re-enable form
            this.inputElement.disabled = false;
            this.submitButton.disabled = false;
            this.inputElement.focus();
        }
    }

    private renderMessage(role: 'user' | 'assistant', content: string, isError = false): void {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${role}-message${isError ? ' error-message' : ''}`;

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = content;

        messageDiv.appendChild(bubble);
        this.chatMessagesContainer.appendChild(messageDiv);

        this.scrollToBottomOfChat();
    }

    private showLoadingMessage(): string {
        const loadingId = `loading-${Date.now()}`;
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message assistant-message loading-message';
        messageDiv.id = loadingId;

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.innerHTML = '<span class="loading-dots">Thinking<span>.</span><span>.</span><span>.</span></span>';

        const disclaimer = document.createElement('div');
        disclaimer.className = 'loading-disclaimer';
        disclaimer.innerHTML =
            '<span class="info-icon">ⓘ</span> This demo uses a proxy, so responses may take up to 30 seconds';

        messageDiv.appendChild(bubble);
        messageDiv.appendChild(disclaimer);
        this.chatMessagesContainer.appendChild(messageDiv);

        this.scrollToBottomOfChat();

        return loadingId;
    }

    private removeLoadingMessage(loadingId: string): void {
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    private renderExistingMessages(): void {
        // Re-render all messages from conversation history when tool panel is recreated
        for (const message of conversationHistory) {
            this.renderMessage(message.role, message.content);
        }
        this.scrollToBottomOfChat();
    }

    // Scroll to bottom
    private scrollToBottomOfChat = () => {
        this.chatMessagesContainer.scrollTop = this.chatMessagesContainer.scrollHeight;
    };

    private reset(): void {
        // Reset conversation
        conversationHistory = [];
        this.chatMessagesContainer.innerHTML = '';
        this.inputElement.value = '';
        this.inputElement.focus();

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

    destroy(): void {
        // Clean up event listeners
        this.formElement.removeEventListener('submit', this.handleSubmitBound);
        this.inputElement.removeEventListener('keydown', this.handleKeydownBound);
        this.resetButton.removeEventListener('click', this.resetBound);
    }
}
