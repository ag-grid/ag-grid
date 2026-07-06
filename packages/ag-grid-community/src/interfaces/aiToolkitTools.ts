import type { StructuredSchemaColumnParams } from './structuredSchemaParams';

export type AiToolName =
    | 'update_aggregation'
    | 'update_filter'
    | 'update_sort'
    | 'update_pivot'
    | 'update_column_visibility'
    | 'update_column_sizing'
    | 'update_row_group'
    | 'create_calculated_column';

/**
 * Wire-format description of a single tool sent to an LLM. Matches the OpenAI/Anthropic
 * function-calling shape (`{ name, description, parameters }`); the developer adapts it to their
 * provider's request format.
 */
export interface AiToolSchema {
    /** Stable tool name the LLM references in a tool call. */
    name: string;
    /** Human-readable description for the LLM. */
    description: string;
    /** JSON Schema describing the tool's arguments. */
    parameters: object;
}

/** A single tool call parsed from an LLM response, ready to apply. */
export interface AiToolCall {
    name: string;
    args: unknown;
}

/** Outcome of applying a tool call. `error` is safe to feed back to the LLM for self-correction. */
export interface AiToolResult {
    ok: boolean;
    error?: string;
    summary?: string;
}

export type AiToolkitParams = {
    /** Tool names to omit from the returned set. */
    exclude?: AiToolName[];
    /** When set, only these tools are returned (applied after `exclude`). */
    include?: AiToolName[];
    /** Per-column context passed through to tool schemas (descriptions, set-filter values). */
    columns?: Record<string, StructuredSchemaColumnParams>;
};
