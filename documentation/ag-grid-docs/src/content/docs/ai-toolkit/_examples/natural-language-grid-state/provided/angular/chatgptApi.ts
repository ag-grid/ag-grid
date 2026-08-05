import type { GridApi } from 'ag-grid-community';

const BASE_URL = '{{EXAMPLE_ENV:AI_API_URL}}';
const AI_API_TOKEN = '{{EXAMPLE_ENV:AI_API_TOKEN}}';

const ajv = new ajv7({
    validateSchema: true, // Validate schemas against meta-schema
    strict: true,
});

export async function callChatGPT(userRequest: string, currentState: any, gridApi: GridApi): Promise<any> {
    const { $defs, ...structuredSchema } = gridApi.getStructuredSchema({
        columns: {
            sport: {
                includeSetValues: true,
            },
            country: {
                includeSetValues: true,
            },
        },
    });

    // Driving both the current state and the ignore list off the schema keeps them in step with
    // whichever features the toolkit surfaced for this grid.
    const schemaFeatures = Object.keys(structuredSchema.properties);
    const state = Object.fromEntries(schemaFeatures.map((feature) => [feature, currentState[feature]]));

    const schema = {
        type: 'object',
        $defs,
        properties: {
            gridState: structuredSchema,
            propertiesToIgnore: {
                type: 'array',
                items: {
                    type: 'string',
                    enum: schemaFeatures,
                },
                description: 'List of grid state properties to ignore when applying the new state',
            },
            columnDefOperations: {
                type: 'array',
                items: {
                    anyOf: [
                        {
                            type: 'object',
                            properties: {
                                operation: {
                                    type: 'string',
                                    enum: ['addCalculatedColumn'],
                                    description: 'Add a new Calculated Column to the grid',
                                },
                                colId: {
                                    type: 'string',
                                    description: 'Stable unique column ID, for example weightedTotal',
                                },
                                headerName: {
                                    type: 'string',
                                    description: 'Column header shown to users',
                                },
                                calculatedExpression: {
                                    type: 'string',
                                    description:
                                        'Calculated Column formula. Reference other columns with bracketed column IDs, for example [gold] * 3 + [silver] * 2 + [bronze], and wrap literal text in double quotes, for example "Hello"',
                                },
                                cellDataType: {
                                    type: 'string',
                                    enum: ['text', 'number', 'date', 'boolean'],
                                    description: 'Cell data type for the calculated result',
                                },
                                aggFunc: {
                                    type: 'string',
                                    enum: ['sum', 'avg', 'min', 'max', 'count', 'first', 'last'],
                                    description: 'Aggregation function for grouped rows',
                                },
                                width: {
                                    type: 'number',
                                    minimum: 20,
                                    description: 'Column width in pixels',
                                },
                                hide: {
                                    type: 'boolean',
                                    description: 'Whether the new column should be hidden',
                                },
                            },
                            required: ['operation', 'colId', 'headerName', 'calculatedExpression'],
                            additionalProperties: false,
                        },
                    ],
                },
                description:
                    'Column definition operations that cannot be represented as Grid State. Use this for Calculated Columns.',
            },
            explanation: {
                type: 'string',
                description: 'Human-readable explanation of the changes made to the grid state',
            },
        },
        required: ['gridState', 'explanation', 'propertiesToIgnore', 'columnDefOperations'],
        additionalProperties: false,
    };

    const systemPrompt = `
You are an assistant for a table displaying Olympic medal results. You help users modify grid configuration to fit their needs.

The schema provided can be used to manipulate multiple features of the table to help the user with their query.

Current grid state: ${JSON.stringify(state)}

Respond with only the necessary state changes and column definition operations, not the complete state. Provide a clear explanation of what you changed.

Any unchanged properties that are present in the current state must be included in \`propertiesToIgnore\`. Otherwise they will be removed from the state.

\`showValuesAs\` is a separate section from \`aggregation\`, holding each value column's display mode (e.g. percentOfGrandTotal). Only include it when the user asks to change a display mode, and add it to \`propertiesToIgnore\` when leaving an existing mode untouched.

Use \`columnDefOperations\` for Calculated Columns. Calculated Columns use formula syntax: reference other columns with bracketed column IDs, for example \`[gold] * 3 + [silver] * 2 + [bronze]\`, and wrap literal text in double quotes, for example \`"Hello"\`. Do not use valueGetter syntax for Calculated Columns.
If no column definition operations are needed, return an empty \`columnDefOperations\` array.

Important: Only modify the properties that the user specifically requested. If they ask to "hide the age column", only include columnVisibility in your response, not other unrelated properties.
Where possible, augment the provided state `;

    let result;
    try {
        result = await generateObject({
            model: 'gpt-5-mini',
            schema,
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
    } catch (error: any) {
        throw new Error(`OpenAI API error: ${error.message || 'Unknown error'}`);
    }

    return result;
}

async function generateObject(options: any): Promise<any> {
    const { model = 'gpt-4o-mini', schema, messages, maxTokens = 4096, stream = false } = options;

    const requestBody = {
        model,
        messages,
        max_completion_tokens: maxTokens,
        response_format: schema
            ? {
                  type: 'json_schema',
                  json_schema: {
                      name: 'grid_state_response',
                      schema,
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
            ...(AI_API_TOKEN ? { Authorization: `Bearer ${AI_API_TOKEN}` } : {}),
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const error =
            errorData.error?.code === 'rate_limit_exceeded'
                ? 'OpenAI Rate Limit Exceeded'
                : `OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`;
        throw new Error(error);
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
