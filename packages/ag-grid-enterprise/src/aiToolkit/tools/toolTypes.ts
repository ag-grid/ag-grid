import type { AiToolName, AiToolResult, AiToolkitParams, BeanCollection } from 'ag-grid-community';

import type { JSONSchema } from '../schemaTypes';

/**
 * A single AI tool: a stable name + description, a schema builder that reflects live grid
 * capabilities, and an executor that applies a tool call. `build` returns `undefined` when the
 * tool is unavailable for the current grid (e.g. its feature/service is not present), which omits
 * it from `getTools`. `kind` orders batch application — `config` tools (which change the column
 * set) run before `state` tools so the latter can reference newly-created columns.
 */
export interface AiTool {
    readonly name: AiToolName;
    readonly kind: 'state' | 'config';
    readonly description: string;
    build(beans: BeanCollection, params?: AiToolkitParams): JSONSchema | undefined;
    execute(beans: BeanCollection, args: unknown): AiToolResult;
}
