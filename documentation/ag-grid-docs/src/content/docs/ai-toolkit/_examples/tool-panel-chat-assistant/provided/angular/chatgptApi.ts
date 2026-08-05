import { GridApi } from 'ag-grid-community';

import { ChatMessage } from './ChatToolPanel';
import { generateSystemPrompt } from './systemPrompt';

const CHATGPT_MODEL = 'gpt-5-mini';
const BASE_URL = '{{EXAMPLE_ENV:AI_API_URL}}';
const AI_API_TOKEN = '{{EXAMPLE_ENV:AI_API_TOKEN}}';

export const callChatGPT = async (
    userRequest: string,
    gridApi: GridApi,
    conversationHistory: ChatMessage[] = []
): Promise<any> => {
    // Extract relevant parts of the current grid state
    const { aggregation, showValuesAs, rowGroup, columnSizing, columnVisibility, sort, filter, pivot } =
        gridApi.getState();
    const currentState = { aggregation, showValuesAs, rowGroup, columnSizing, columnVisibility, sort, filter, pivot };

    // Build LLM Schema from Grid API Structured Schema
    const schema = buildLLMSchema(gridApi);

    // Build conversation history with system prompt, previous messages, and user request
    const messages: ChatMessage[] = [
        { role: 'system', content: generateSystemPrompt(currentState) },
        ...conversationHistory,
        { role: 'user', content: userRequest },
    ];

    // Send request to ChatGPT API
    let result;
    try {
        result = await sendRequest({
            model: CHATGPT_MODEL,
            schema,
            messages,
        });
    } catch (error: any) {
        throw new Error(`OpenAI API error: ${error.message || 'Unknown error'}`);
    }

    return result;
};

const buildLLMSchema = (gridApi: GridApi): any => {
    // Generate structured schema from grid API
    const { $defs, ...structuredSchema } = gridApi.getStructuredSchema({
        columns: {
            category: {
                includeSetValues: true,
            },
            merchant: {
                includeSetValues: true,
            },
            status: {
                includeSetValues: true,
            },
            currency: {
                includeSetValues: true,
            },
            country: {
                includeSetValues: true,
            },
            accountType: {
                includeSetValues: true,
            },
            type: {
                includeSetValues: true,
            },
        },
    });

    // Return LLM compatible JSON Schema from AI Toolkit structured schema
    return {
        type: 'object',
        $defs,
        properties: {
            gridState: structuredSchema,
            propertiesToIgnore: {
                type: 'array',
                items: {
                    type: 'string',
                    enum: [
                        'aggregation',
                        'showValuesAs',
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
                                    description: 'Stable unique column ID, for example profitMargin',
                                },
                                headerName: {
                                    type: 'string',
                                    description: 'Column header shown to users',
                                },
                                calculatedExpression: {
                                    type: 'string',
                                    description:
                                        'Calculated Column formula. Reference other columns with bracketed column IDs, for example [amount] * 1.2, and wrap literal text in double quotes, for example "Hello"',
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
};

export const sendRequest = async (options: any): Promise<any> => {
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
};
