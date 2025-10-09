import type { GridApi } from 'ag-grid-community';
import { createOpenAI, generateObject } from './ai';

import type { ChatGPTGridStateResponse } from './gridStateSchema';

/**
 * Calls ChatGPT API to process natural language requests for grid state changes
 * Returns a Promise that resolves to the ChatGPT response
 */
export async function callChatGPT(
    userRequest: string,
    currentState: any,
    gridApi: GridApi,
    apiKey: string
): Promise<ChatGPTGridStateResponse> {
    if (!apiKey || apiKey.trim() === '') {
        throw new Error('OpenAI API key is required');
    }

    const openai = createOpenAI({
        apiKey: apiKey,
    });

    const schema = gridApi.getStructuredSchema();

    const systemPrompt = `You are an AG-Grid state management assistant. You help users modify grid configuration using natural language commands.

The schema defines which columns can be used in different contexts based on their configuration:
- Only sortable columns can be used in sort operations
- Only groupable columns can be used for row grouping
- Only pivotable columns can be used for pivoting
- Only aggregatable columns can be used for aggregation
- Only resizable columns can have their width/flex changed
- Only pinnable columns can be pinned

Current grid state: ${JSON.stringify(currentState)}

Respond with only the necessary state changes, not the complete state. Provide a clear explanation of what you changed.

Any unchanged properties that are present in the current state must be included in \`propertiesToIgnore\`. Otherwise they will be removed from the state.

Important: Only modify the properties that the user specifically requested. If they ask to "hide the age column", only include columnVisibility in your response, not other unrelated properties.`;

    try {
        const result = await generateObject(openai, {
            model: 'gpt-4o-mini',
            schema: schema,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
                {
                    role: 'user',
                    content: userRequest,
                },
            ],
        });

        return result.object as ChatGPTGridStateResponse;
    } catch (error: any) {
        throw new Error(`OpenAI API error: ${error.message || 'Unknown error'}`);
    }
}
