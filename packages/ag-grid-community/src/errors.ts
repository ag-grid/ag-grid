export type ErrorCode = keyof typeof ERRORS;
export type ErrorFunction = (params: undefined | Record<string, any>) => string | string[];

export const ERRORS: Record<number, ErrorFunction> = {
    1: () => '`rowData` must be an array' as const,
    2: ({ nodeId }: { nodeId: string | undefined }) =>
        `Duplicate node id '${nodeId}' detected from getRowId callback, this could cause issues in your grid.` as const,
    5: ({ data }: { data: any }) =>
        [
            `Could not find data item as object was not found.`,
            data,
            ' Consider using getRowId to help the Grid find matching row data',
        ] as const,
    10: ({ val1, val2 }: { val1: string | undefined; val2: string | undefined }) =>
        `val1 is ${val1}, val2 is ${val2}` as const,
} as const;
