import type { AiToolCall, AiToolResult, AiToolSchema, AiToolkitParams, BeanCollection } from 'ag-grid-community';

import { stateTools } from './tools/stateTools';
import type { AiTool } from './tools/toolTypes';

const TOOLS: AiTool[] = [...stateTools];

const toolByName: Map<string, AiTool> = new Map(TOOLS.map((tool) => [tool.name, tool]));

export function getTools(beans: BeanCollection, params?: AiToolkitParams): AiToolSchema[] {
    const result: AiToolSchema[] = [];
    for (let i = 0, len = TOOLS.length; i < len; ++i) {
        const tool = TOOLS[i];
        if (params?.exclude?.includes(tool.name)) {
            continue;
        }
        if (params?.include && !params.include.includes(tool.name)) {
            continue;
        }
        const parameters = tool.build(beans, params);
        if (parameters) {
            result.push({ name: tool.name, description: tool.description, parameters });
        }
    }
    return result;
}

export function applyToolCall(beans: BeanCollection, name: string, args: unknown): AiToolResult {
    const tool = toolByName.get(name);
    if (!tool) {
        return { ok: false, error: `Unknown tool: ${name}` };
    }
    return tool.execute(beans, args);
}

export function applyToolCalls(beans: BeanCollection, calls: AiToolCall[]): AiToolResult[] {
    const results = new Array<AiToolResult>(calls.length);

    // Config tools (e.g. creating a column) run first so state tools can reference new columns.
    // Two ordered passes over the input preserve each call's index in the returned array.
    const applyKind = (applyConfig: boolean) => {
        for (let i = 0, len = calls.length; i < len; ++i) {
            const isConfig = toolByName.get(calls[i].name)?.kind === 'config';
            if (isConfig === applyConfig) {
                results[i] = applyToolCall(beans, calls[i].name, calls[i].args);
            }
        }
    };
    applyKind(true);
    applyKind(false);

    return results;
}
