import type { AiToolSchema, GridApi } from 'ag-grid-community';

export const BASE_URL = '{{EXAMPLE_ENV:AI_API_URL}}';
export const AI_API_TOKEN = '{{EXAMPLE_ENV:AI_API_TOKEN}}';

const CHATGPT_MODEL = 'gpt-5-mini';
const MAX_ITERATIONS = 6;

const SYSTEM_PROMPT = `
You are an assistant for a table displaying Olympic medal results. Help the user by calling the
provided tools to change the grid. Only call the tools needed for the request.

Each tool replaces the whole of its part of the grid, so when a request builds on the current
settings (e.g. adding another filter or sort), include the existing values as well as the new ones.

Make all the tool calls needed to satisfy the request in a single step, and include a one-sentence
summary of the changes in your message content.`;

// Map the grid's tools into the OpenAI function-calling format. The grid describes each tool with
// its live capabilities (available columns, functions, etc.), so nothing here is grid-specific.
function toOpenAiTools(tools: AiToolSchema[]) {
    return tools.map(({ name, description, parameters }) => ({
        type: 'function',
        function: { name, description, parameters },
    }));
}

export async function callChatGPT(userRequest: string, gridApi: GridApi): Promise<string> {
    const tools = toOpenAiTools(
        gridApi.getTools({
            columns: {
                sport: { includeSetValues: true },
                country: { includeSetValues: true },
            },
        })
    );

    // Give the model the current state (the parts the tools manage) so it can build on existing
    // settings — each tool replaces its whole slice, so augmenting means re-sending current values.
    const { aggregation, rowGroup, columnSizing, columnVisibility, sort, filter, pivot } = gridApi.getState();
    const currentState = { aggregation, rowGroup, columnSizing, columnVisibility, sort, filter, pivot };

    const messages: any[] = [
        { role: 'system', content: `${SYSTEM_PROMPT}\n\nThe current grid state is:\n${JSON.stringify(currentState)}` },
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
}

async function sendRequest(messages: any[], tools: any[]): Promise<any> {
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
}
