import type { GridApi, IToolPanel, IToolPanelParams } from 'ag-grid-community';

import { callChatGPT } from './chatgptApi';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

// Store conversation history outside the component to persist across grid state changes
let conversationHistory: ChatMessage[] = [];

export class ChatToolPanel implements IToolPanel {
    private eGui!: HTMLElement;
    private gridApi!: GridApi;
    private chatMessagesContainer!: HTMLElement;
    private inputElement!: HTMLInputElement;
    private submitButton!: HTMLButtonElement;

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
                <h3 class="chat-title">AI Assistant</h3>
                <h4 class="chat-subtitle">Ask me to apply grid configurations, including pivoting, filtering, grouping and more...</h4>
                <div class="chat-actions">
                    <button class="reset-btn reset-chat" title="Reset conversation only">
                        <span>Reset Chat</span>
                    </button>
                    <button class="reset-btn reset-grid" title="Reset Grid State">
                        <span>Reset Grid</span>
                    </button>
                </div>
            </div>
            <div class="chat-messages"></div>
            <form class="chat-input-form">
                <input
                    type="text"
                    class="chat-input"
                    placeholder='Ask me anything, e.g. "hide age column"...'
                    autocomplete="off"
                />
                <button type="submit" class="chat-submit">→</button>
            </form>
        `;

        this.chatMessagesContainer = container.querySelector('.chat-messages')!;
        this.inputElement = container.querySelector('.chat-input')!;
        this.submitButton = container.querySelector('.chat-submit')!;

        const form = container.querySelector('.chat-input-form')!;
        form.addEventListener('submit', (e) => this.handleSubmit(e));

        const resetChatBtn = container.querySelector('.reset-chat')!;
        resetChatBtn.addEventListener('click', () => this.resetConversation());

        const resetGridBtn = container.querySelector('.reset-grid')!;
        resetGridBtn.addEventListener('click', () => this.resetGrid());

        return container;
    }

    private async handleSubmit(event: Event): Promise<void> {
        event.preventDefault();

        const userMessage = this.inputElement.value.trim();
        if (!userMessage) return;

        // Add user message to conversation
        conversationHistory.push({
            role: 'user',
            content: userMessage,
        });

        // Render user message
        this.renderMessage('user', userMessage);

        // Clear input and disable form
        this.inputElement.value = '';
        this.inputElement.disabled = true;
        this.submitButton.disabled = true;

        // Show loading indicator
        const loadingId = this.showLoadingMessage();

        try {
            const currentState = this.gridApi.getState();
            const response = await callChatGPT(userMessage, currentState, this.gridApi, conversationHistory);

            // Remove loading indicator
            this.removeLoadingMessage(loadingId);

            // Add assistant response to conversation BEFORE setState
            conversationHistory.push({
                role: 'assistant',
                content: response.explanation,
            });

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
        disclaimer.innerHTML = '<span class="info-icon">ⓘ</span> This demo uses a proxy, so responses may take up to 30 seconds';

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

    private resetConversation(): void {
        conversationHistory = [];
        this.chatMessagesContainer.innerHTML = '';
        this.inputElement.value = '';
        this.inputElement.focus();
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

    private resetGrid(): void {
        // Reset grid state
        this.gridApi.setState({
            columnVisibility: { hiddenColIds: [] },
            columnPinning: { leftColIds: [], rightColIds: [] },
            sort: { sortModel: [] },
            filter: { filterModel: {} },
            rowGroup: { groupColIds: [] },
            pagination: { page: 0, pageSize: 20 },
        });
    }
}
