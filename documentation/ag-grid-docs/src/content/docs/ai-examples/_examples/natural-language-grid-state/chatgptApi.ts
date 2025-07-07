import type { GridApi } from 'ag-grid-community';

import { generateChatGPTSchema } from './chatgptSchema';
import type { ChatGPTGridStateResponse } from './gridStateSchema';

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/responses';
const MODEL = 'gpt-4.1-mini';

/**
 * Calls ChatGPT API to process natural language requests for grid state changes
 * Returns a Promise that resolves to the ChatGPT response
 */
export function callChatGPT(
    userRequest: string,
    currentState: any,
    gridApi: GridApi
): Promise<ChatGPTGridStateResponse> {
    return new Promise((resolve, reject) => {
        const columnDefs = gridApi.getColumnDefs();
        if (!columnDefs) {
            reject(new Error('Column definitions not available'));
            return;
        }

        const schema = generateChatGPTSchema(columnDefs);

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

        const requestBody = {
            model: MODEL,
            input: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
                {
                    role: 'user',
                    content: userRequest,
                },
            ],
            max_output_tokens: 2048,
            text: {
                format: {
                    type: 'json_schema',
                    name: 'grid_state_response',
                    strict: true,
                    schema,
                },
            },
        };

        fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify(requestBody),
        })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((error) => {
                        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
                    });
                }
                return response.json();
            })
            .then((data) => {
                console.log(data);
                if (!data.output[0]?.content[0]) {
                    throw new Error('Unknown Error');
                }

                const content = data.output[0].content[0];

                if (!content) {
                    throw new Error('No response content received');
                }

                try {
                    const parsedResponse = JSON.parse(content.text);
                    resolve(parsedResponse);
                } catch (e) {
                    throw new Error('Invalid JSON response from OpenAI');
                }
            })
            .catch((error) => {
                reject(error);
            });
    });
}
