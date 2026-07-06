import type { AiToolSchema, GridApi } from 'ag-grid-community';

export const BASE_URL = '{{EXAMPLE_ENV:AI_API_URL}}';
export const AI_API_TOKEN = '{{EXAMPLE_ENV:AI_API_TOKEN}}';

const CHATGPT_MODEL = 'gpt-5-mini';
const MAX_ITERATIONS = 6;

const SYSTEM_PROMPT = `
You are an assistant for a table displaying Olympic medal results. Help the user by calling the
provided tools to change the grid — sorting, filtering, grouping, aggregating, hiding columns, or
adding a calculated column. Only call the tools needed for the request.

If a request needs a new calculated column that a later change references (e.g. "add a total medals
column and sort by it"), call add_calculated_column first, then the tool that uses it.

When you have finished, reply with a short plain-text summary of what you changed.`;

// Map the grid's tools into the OpenAI function-calling format. The grid describes each tool with
// its live capabilities (available columns, functions, etc.), so nothing here is grid-specific.
function toOpenAiTools(tools: AiToolSchema[]) {
    return tools.map((tool) => ({
        type: 'function',
        function: { name: tool.name, description: tool.description, parameters: tool.parameters },
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

    const messages: any[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userRequest },
    ];

    for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
        const message = await sendRequest(messages, tools);
        messages.push(message);

        const toolCalls = message.tool_calls ?? [];
        if (toolCalls.length === 0) {
            return message.content ?? '';
        }

        // Apply each requested tool call to the grid and feed the outcome back so the model can
        // react to failures (an unavailable column, an invalid expression, ...) and self-correct.
        for (const toolCall of toolCalls) {
            const args = JSON.parse(toolCall.function.arguments);
            const result = gridApi.applyToolCall(toolCall.function.name, args);
            messages.push({ role: 'tool', tool_call_id: toolCall.id, content: JSON.stringify(result) });
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
