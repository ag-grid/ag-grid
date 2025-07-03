export type SyntaxCategory =
    | 'GROUP_START'
    | 'GROUP_END'
    | 'ARRAY_START'
    | 'ARRAY_END'
    | 'ARRAY_SEPARATOR'
    | 'IDENTIFIER'
    | 'STRING'
    | 'NUMBER'
    | 'BOOLEAN'
    | 'OPERATOR'
    | 'COMPARATOR'
    | 'FUNCTION_START'
    | 'FUNCTION_END'
    | 'STRUCTURAL'
    | 'UNKNOWN';

export const CLOSING_CATEGORIES: Set<SyntaxCategory> = new Set([
    'GROUP_END',
    'ARRAY_END',
    'ARRAY_SEPARATOR',
    'FUNCTION_END',
]);

export const OPENING_CATEGORIES: Set<SyntaxCategory> = new Set([
    'GROUP_START',
    'ARRAY_START',
    'ARRAY_SEPARATOR',
    'FUNCTION_START',
]);

export interface TextRange {
    start: number;
    end: number;
}

export interface SyntaxConfig<
    TKind extends string = 'unknown' | 'test',
    TModel extends { kind: TKind } = { kind: TKind },
> {
    model: TModel;
    kinds: TKind[];
}

export type KindOf<TSyntaxConfig extends SyntaxConfig> = TSyntaxConfig['kinds'][number];
export type NodeOf<TSyntaxConfig extends SyntaxConfig, TKind extends KindOf<TSyntaxConfig>> = Extract<
    TSyntaxConfig['model'],
    { kind: TKind }
>;
