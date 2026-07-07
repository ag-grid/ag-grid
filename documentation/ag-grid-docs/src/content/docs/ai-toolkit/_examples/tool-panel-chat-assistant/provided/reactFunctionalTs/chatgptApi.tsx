import type { AiToolSchema, GridApi } from 'ag-grid-community';

import type { ChatMessage } from './ChatToolPanel';
import { generateSystemPrompt } from './systemPrompt';

const CHATGPT_MODEL = 'gpt-5-mini';
const BASE_URL = '{{EXAMPLE_ENV:AI_API_URL}}';
const AI_API_TOKEN = '{{EXAMPLE_ENV:AI_API_TOKEN}}';
const MAX_ITERATIONS = 6;

const SET_VALUE_COLUMNS = ['category', 'merchant', 'status', 'currency', 'country', 'accountType', 'type'];

// Map the grid's tools into the OpenAI function-calling format. Nothing here is grid-specific — the
// grid describes each tool (name, description, argument schema) from its live capabilities.
function toOpenAiTools(tools: AiToolSchema[]) {
    return tools.map((tool) => ({
        type: 'function',
        function: { name: tool.name, description: tool.description, parameters: tool.parameters },
    }));
}

export const callChatGPT = async (
    userRequest: string,
    gridApi: GridApi,
    conversationHistory: ChatMessage[] = []
): Promise<string> => {
    const columns = Object.fromEntries(SET_VALUE_COLUMNS.map((colId) => [colId, { includeSetValues: true }]));
    const tools = toOpenAiTools(gridApi.getTools({ columns }));

    // Give the model the current state (the parts the tools manage) so it can build on existing
    // settings — each tool replaces its whole slice, so augmenting means re-sending current values.
    const { aggregation, rowGroup, columnSizing, columnVisibility, sort, filter, pivot } = gridApi.getState();
    const currentState = { aggregation, rowGroup, columnSizing, columnVisibility, sort, filter, pivot };

    const messages: any[] = [
        { role: 'system', content: generateSystemPrompt(currentState) },
        ...conversationHistory,
        { role: 'user', content: userRequest },
    ];

    for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
        const message = await sendRequest(messages, tools);
        messages.push(message);

        const toolCalls = message.tool_calls ?? [];
        if (toolCalls.length === 0) {
            return message.content ?? '';
        }

        // Apply each requested tool call to the grid.
        const results = toolCalls.map((toolCall) => {
            const args = JSON.parse(toolCall.function.arguments);
            return { toolCall, result: gridApi.applyToolCall(toolCall.function.name, args) };
        });
        for (const { toolCall, result } of results) {
            messages.push({ role: 'tool', tool_call_id: toolCall.id, content: JSON.stringify(result) });
        }

        // Optimistic exit: if everything applied and the model already summarised what it did, show
        // that now instead of paying for another round-trip. Otherwise loop, so the model can react
        // to a failure (an invalid expression, ...) and self-correct, or supply an omitted summary.
        if (message.content && results.every(({ result }) => result.ok)) {
            return message.content;
        }
    }

    return 'Stopped after too many steps — please try a simpler request.';
};

const sendRequest = async (messages: any[], tools: any[]): Promise<any> => {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(AI_API_TOKEN ? { Authorization: `Bearer ${AI_API_TOKEN}` } : {}),
        },
        body: JSON.stringify({
            model: CHATGPT_MODEL,
            messages,
            tools,
            tool_choice: 'auto',
            max_completion_tokens: 4096,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const message =
            errorData.error?.code === 'rate_limit_exceeded'
                ? 'OpenAI Rate Limit Exceeded'
                : `OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`;
        throw new Error(message);
    }

    const data = await response.json();
    return data.choices[0].message;
};
