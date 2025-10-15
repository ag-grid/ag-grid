import type { GridApi } from 'ag-grid-community';

export const BASE_URL = 'https://openai-proxy-nine-flame.vercel.app/v1';

export async function callChatGPT(userRequest: string, currentState: any, gridApi: GridApi): Promise<any> {
    const schema = gridApi.getStructuredSchema({
        columns: {
            sport: {
                includeSetValues: true,
            },
            country: {
                includeSetValues: true,
            },
        },
    });

    const systemPrompt = `
You are an assistant for a table displaying Olympic medal results. You help users modify grid configuration to fit there needs.

The schema provided can be used to manipulate multiple features of the table to help the user with their query.

Current grid state: ${JSON.stringify(currentState)}

Respond with only the necessary state changes, not the complete state. Provide a clear explanation of what you changed.

Any unchanged properties that are present in the current state must be included in \`propertiesToIgnore\`. Otherwise they will be removed from the state.

Important: Only modify the properties that the user specifically requested. If they ask to "hide the age column", only include columnVisibility in your response, not other unrelated properties.
Where possible, augment the provided state `;

    try {
        const result = await generateObject({
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
                                'aggregation',
                                'filter',
                                'sort',
                                'pivot',
                                'columnVisibility',
                                'columnSizing',
                                'rowGroup',
                            ],
                        },
                        description: 'List of grid state properties to ignore when applying the new state',
                    },
                    explanation: {
                        type: 'string',
                        description: 'Human-readable explanation of the changes made to the grid state',
                    },
                },
                required: ['gridState', 'explanation', 'propertiesToIgnore'],
                additionalProperties: false,
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

        return result;
    } catch (error: any) {
        throw new Error(`OpenAI API error: ${error.message || 'Unknown error'}`);
    }
}

async function generateObject(options: any): Promise<any> {
    const { model = 'gpt-4o-mini', schema, messages, temperature = 0.1, maxTokens = 4096, stream = false } = options;

    const requestBody = {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        response_format: schema
            ? {
                  type: 'json_schema',
                  json_schema: {
                      name: 'grid_state_response',
                      schema: schema,
                  },
              }
            : { type: 'json_object' },
        stream,
    };

    const url = `${BASE_URL}/chat/completions`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
        throw new Error('No content received from OpenAI API');
    }

    let parsedObject;
    try {
        parsedObject = JSON.parse(content);
    } catch (error) {
        throw new Error(`Failed to parse JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return parsedObject;
}
