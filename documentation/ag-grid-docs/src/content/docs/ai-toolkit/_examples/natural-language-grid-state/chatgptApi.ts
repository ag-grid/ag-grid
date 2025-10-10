import type { GridApi } from 'ag-grid-community';

import { OpenAIClient, generateObject } from './ai';
import type { ChatGPTGridStateResponse } from './gridStateSchema';

/**
 * Calls ChatGPT API to process natural language requests for grid state changes
 * Returns a Promise that resolves to the ChatGPT response
 */
export async function callChatGPT(
    userRequest: string,
    currentState: any,
    gridApi: GridApi
): Promise<ChatGPTGridStateResponse> {
    const openai = new OpenAIClient();

    const schema = gridApi.getStructuredSchema();
    console.log('Using schema:', schema);

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
            schema: {
                type: 'object',
                properties: {
                    gridState: schema,
                    propertiesToIgnore: {
                        type: 'array',
                        items: {
                            type: 'string',
                            enum: [
                                'columnVisibility',
                                'columnPinning',
                                'sort',
                                'filter',
                                'rowGrouping',
                                'rowPivoting',
                                'aggregation',
                                'columnSizing',
                            ],
                        },
                        description: 'List of grid state properties to ignore when applying the new state',
                    },
                    explanation: {
                        type: 'string',
                        description: 'Human-readable explanation of the changes made to the grid state',
                    },
                },
                required: ['gridState', 'explanation'],
            },
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

        console.log(result.gridState);
        return result;
    } catch (error: any) {
        throw new Error(`OpenAI API error: ${error.message || 'Unknown error'}`);
    }
}
