import { GridApi } from 'ag-grid-community';

import { ChatMessage } from './types';

export const BASE_URL = 'https://ai-api.ag-grid.com/api/openai/v1';

export async function callChatGPT(
    userRequest: string,
    currentState: any,
    gridApi: GridApi,
    conversationHistory: ChatMessage[] = []
): Promise<any> {
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
            account_type: {
                includeSetValues: true,
            },
            type: {
                includeSetValues: true,
            },
            month: {
                includeSetValues: true,
            },
        },
    });

    const { aggregation, rowGroup, columnSizing, columnVisibility, sort, filter, pivot } = currentState;
    const state = { aggregation, rowGroup, columnSizing, columnVisibility, sort, filter, pivot };

    const schema = {
        type: 'object',
        $defs,
        properties: {
            gridState: structuredSchema,
            propertiesToIgnore: {
                type: 'array',
                items: {
                    type: 'string',
                    enum: ['aggregation', 'filter', 'sort', 'pivot', 'columnVisibility', 'columnSizing', 'rowGroup'],
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
    };

    const systemPrompt = `
You are an assistant for a table displaying financial transaction data. You help users modify grid configuration to fit their needs.

The data includes transactions with the following fields:
- transaction_id: Unique identifier for each transaction
- account_id, account_name, account_type: Account details (Checking, Savings, Credit Card)
- transaction_date, settlement_date: When the transaction occurred and settled
- amount: Absolute value of the transaction
- signed_amount: Positive for credits (income), negative for debits (expenses)
- currency: GBP, EUR, or USD
- type: Debit or Credit
- category: Groceries, Rent, Utilities, Dining, Transport, Shopping, Travel, Health, Salary, Transfers, Insurance, Entertainment
- merchant: The business or entity involved
- status: Completed, Pending, or Failed
- country: GB, IE, FR, DE, ES, NL, US
- month: Year-month string (e.g., "2024-06")
- year: Transaction year

The schema provided can be used to manipulate multiple features of the table to help the user with their query.

Current grid state: ${JSON.stringify(state)}

Respond with only the necessary state changes, not the complete state. Provide a clear explanation of what you changed.

Any unchanged properties that are present in the current state must be included in \`propertiesToIgnore\`. Otherwise they will be removed from the state.

You are not able to make any changes to the grids configuration, e.g. enabling features, you are only able to modify state.

Important: Only modify the properties that the user specifically requested. If they ask to "filter by category", only include filter in your response, not other unrelated properties.
Where possible, augment the provided state `;

    // Build messages array with conversation history
    const messages: any[] = [
        {
            role: 'system',
            content: systemPrompt,
        },
    ];

    // Add conversation history (excluding the current message which is already in userRequest)
    for (let i = 0; i < conversationHistory.length - 1; i++) {
        messages.push({
            role: conversationHistory[i].role,
            content: conversationHistory[i].content,
        });
    }

    // Add current user request
    messages.push({
        role: 'user',
        content: userRequest,
    });

    let result;
    try {
        result = await generateObject({
            model: 'gpt-5-mini',
            schema,
            messages,
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
