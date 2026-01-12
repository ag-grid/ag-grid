import { defineComponent, nextTick, onMounted, ref } from 'vue';

import { GridApi, IToolPanelParams } from 'ag-grid-community';

import { callChatGPT } from './chatgptApi';
import { ChatMessage } from './types';

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

// Store conversation history outside the component to persist across grid state changes
let conversationHistory: ChatMessage[] = [];

export const ChatToolPanel = defineComponent({
    props: {
        params: {
            type: Object as () => IToolPanelParams,
            required: true,
        },
    },
    setup(props) {
        const gridApi = ref<GridApi | null>(null);
        const messages = ref<ChatMessage[]>([]);
        const inputValue = ref('');
        const isLoading = ref(false);
        const chatMessagesRef = ref<HTMLDivElement | null>(null);

        onMounted(() => {
            gridApi.value = props.params.api;
            // Sync local state with conversation history on mount
            messages.value = [...conversationHistory];
        });

        const scrollToBottom = () => {
            nextTick(() => {
                if (chatMessagesRef.value) {
                    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
                }
            });
        };

        const handleSubmit = async () => {
            const userMessage = inputValue.value.trim();
            if (!userMessage || isLoading.value || !gridApi.value) return;

            // Render user message
            messages.value = [...messages.value, { role: 'user', content: userMessage }];
            inputValue.value = '';
            isLoading.value = true;
            scrollToBottom();

            try {
                const response = await callChatGPT(userMessage, gridApi.value, conversationHistory);

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
                    gridApi.value.setState(response.gridState, response.propertiesToIgnore);
                } else {
                    // If no state change, manually update messages
                    messages.value = [...conversationHistory];
                }
            } catch (error) {
                const errorMessage = `Error: ${error instanceof Error ? error.message : String(error)}`;
                messages.value = [...messages.value, { role: 'assistant', content: errorMessage }];
            } finally {
                isLoading.value = false;
                scrollToBottom();
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSubmit();
            }
        };

        const reset = () => {
            // Reset conversation
            conversationHistory = [];
            messages.value = [];
            inputValue.value = '';

            // Reset grid state
            if (!gridApi.value) return;
            gridApi.value.setState({
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
        };

        return {
            messages,
            inputValue,
            isLoading,
            chatMessagesRef,
            handleSubmit,
            handleKeyDown,
            reset,
        };
    },
    template: `
        <div class="chat-tool-panel">
            <div class="chat-header">
                <div class="chat-title-row">
                    <h3 class="chat-title">AI Assistant</h3>
                    <div class="chat-actions">
                        <button class="icon-btn reset-btn" title="Reset" aria-label="Reset" @click="reset">
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

            <div class="chat-messages" ref="chatMessagesRef">
                <div
                    v-for="(message, index) in messages"
                    :key="index"
                    :class="['chat-message', message.role + '-message']"
                >
                    <div class="message-bubble">{{ message.content }}</div>
                </div>
                <div v-if="isLoading" class="chat-message assistant-message loading-message">
                    <div class="message-bubble">
                        <span class="loading-dots">Thinking<span>.</span><span>.</span><span>.</span></span>
                    </div>
                    <div class="loading-disclaimer">
                        <span class="info-icon">i</span> This demo uses a proxy, so responses may take up to 30 seconds
                    </div>
                </div>
            </div>

            <form class="chat-input-form" @submit.prevent="handleSubmit">
                <textarea
                    rows="4"
                    class="chat-input"
                    placeholder="Ask me anything, e.g. &quot;show only failed transactions&quot;..."
                    autocomplete="off"
                    v-model="inputValue"
                    @keydown="handleKeyDown"
                    :disabled="isLoading"
                ></textarea>
                <button type="submit" class="chat-submit" :disabled="isLoading">→</button>
            </form>
        </div>
    `,
});
