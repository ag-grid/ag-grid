/**
 * Direct OpenAI API client with streaming support and structured output validation
 * No external dependencies except AJV for schema validation (loaded via Extras.tsx)
 */

interface OpenAIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface OpenAICompletionRequest {
    model: string;
    messages: OpenAIMessage[];
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
    response_format?: {
        type: 'json_object' | 'text' | 'json_schema';
        json_schema?: {
            name: string;
            schema: any;
        };
    };
}

interface OpenAICompletionResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

interface StreamingChunk {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        delta: {
            role?: string;
            content?: string;
        };
        finish_reason: string | null;
    }>;
}

interface AIClientOptions {
    baseURL?: string;
    timeout?: number;
}

interface GenerateObjectOptions<T> {
    model: string;
    schema: any; // JSON Schema object
    messages: OpenAIMessage[];
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
    onProgress?: (partial: string) => void;
}

interface GenerateObjectResult<T> {
    object: T;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export class OpenAIClient {
    private baseURL: string;
    private timeout: number;
    private ajvValidator: any;

    constructor(options?: AIClientOptions) {
        this.baseURL = options?.baseURL || 'https://openai-proxy-nine-flame.vercel.app/v1';
        this.timeout = options?.timeout || 30000;

        // Initialize AJV validator (loaded from CDN via Extras.tsx)
        if (typeof window !== 'undefined' && (window as any).Ajv) {
            this.ajvValidator = new (window as any).Ajv();
        } else if (typeof window !== 'undefined' && (window as any).ajv) {
            this.ajvValidator = new (window as any).ajv();
        } else {
            console.warn('AJV not available. Schema validation will be skipped.');
        }
    }

    /**
     * Generate a structured object using OpenAI API with schema validation
     */
    async generateObject<T>(options: GenerateObjectOptions<T>): Promise<GenerateObjectResult<T>> {
        const { model, schema, messages, temperature = 0.1, maxTokens = 4096, stream = false, onProgress } = options;

        // Compile schema for validation if AJV is available
        let validateSchema: any = null;
        if (this.ajvValidator && schema) {
            try {
                validateSchema = this.ajvValidator.compile(schema);
            } catch (error) {
                console.warn('Failed to compile schema:', error);
            }
        }

        // Add schema instructions to system message
        const enhancedMessages = this.addSchemaInstructions(messages, schema);

        const requestBody: OpenAICompletionRequest = {
            model,
            messages: enhancedMessages,
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

        if (stream) {
            return this.handleStreamingResponse<T>(requestBody, validateSchema, onProgress);
        } else {
            return this.handleNonStreamingResponse<T>(requestBody, validateSchema);
        }
    }

    /**
     * Add schema instructions to the system message
     */
    private addSchemaInstructions(messages: OpenAIMessage[], schema: any): OpenAIMessage[] {
        const schemaInstruction = schema
            ? `\n\nIMPORTANT: Respond with valid JSON that conforms to this schema:\n${JSON.stringify(schema, null, 2)}`
            : '\n\nIMPORTANT: Respond with valid JSON only.';

        return messages.map((message, index) => {
            if (index === 0 && message.role === 'system') {
                return {
                    ...message,
                    content: message.content + schemaInstruction,
                };
            }
            return message;
        });
    }

    /**
     * Handle non-streaming response
     */
    private async handleNonStreamingResponse<T>(
        requestBody: OpenAICompletionRequest,
        validateSchema: any
    ): Promise<any> {
        const response = await this.makeRequest('/chat/completions', {
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

        const data: OpenAICompletionResponse = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            throw new Error('No content received from OpenAI API');
        }

        // Parse JSON response
        let parsedObject: T;
        try {
            parsedObject = JSON.parse(content);
        } catch (error) {
            throw new Error(
                `Failed to parse JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }

        // Validate against schema if available
        if (validateSchema && !validateSchema(parsedObject)) {
            console.warn('Schema validation failed:', validateSchema.errors);
            console.warn('Response:', parsedObject);
            // Continue anyway, but log the validation failure
        }

        return parsedObject;
    }

    /**
     * Handle streaming response
     */
    private async handleStreamingResponse<T>(
        requestBody: OpenAICompletionRequest,
        validateSchema: any,
        onProgress?: (partial: string) => void
    ): Promise<any> {
        const response = await this.makeRequest('/chat/completions', {
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

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('Response body is not readable');
        }

        const decoder = new TextDecoder();
        let buffer = '';
        let fullContent = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        try {
                            const chunk: StreamingChunk = JSON.parse(data);
                            const content = chunk.choices[0]?.delta?.content;
                            if (content) {
                                fullContent += content;
                                onProgress?.(fullContent);
                            }
                        } catch (error) {
                            // Skip invalid JSON chunks
                            continue;
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }

        if (!fullContent) {
            throw new Error('No content received from streaming response');
        }

        // Parse final JSON response
        let parsedObject: T;
        try {
            parsedObject = JSON.parse(fullContent);
        } catch (error) {
            throw new Error(
                `Failed to parse JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }

        // Validate against schema if available
        if (validateSchema && !validateSchema(parsedObject)) {
            console.warn('Schema validation failed:', validateSchema.errors);
            console.warn('Response:', parsedObject);
            // Continue anyway, but log the validation failure
        }

        return parsedObject;
    }

    /**
     * Make HTTP request with timeout support
     */
    private async makeRequest(endpoint: string, options: RequestInit): Promise<Response> {
        const url = `${this.baseURL}${endpoint}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error(`Request timeout after ${this.timeout}ms`);
            }
            throw error;
        }
    }
}

/**
 * Create a new OpenAI client instance
 */
export function createOpenAI(options: AIClientOptions): OpenAIClient {
    return new OpenAIClient(options);
}

/**
 * Generate object using OpenAI client (simplified interface)
 */
export async function generateObject<T>(
    client: OpenAIClient,
    options: Omit<GenerateObjectOptions<T>, 'model'> & { model?: string }
): Promise<any> {
    return client.generateObject({
        model: 'gpt-4o-mini',
        ...options,
    });
}
