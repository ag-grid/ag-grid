export type ConsoleMessage = string | ((...args: string[]) => string);
// a map from error codes to console messages
const consoleMappings = {
    1: 'rowData must be an array!',
    3: 'rowData must be an!',
    22: (test: string) => `rowData must be an array! ${test}`,
    2: (rowId: string, data: string) => `rowData must be an array! ${rowId} ${data}`,
} as const;

// type of number keys from consoleMappings
// 1 | 2
// const i: ConsoleID = 13;
export type ConsoleID = keyof typeof consoleMappings;
export type ConsoleMessages = typeof consoleMappings;

type ss = ConsoleMessages[2];
type p = Parameters<ConsoleMessages[22]>;

export type ConsoleMessageParams<TId extends ConsoleID> = ConsoleMessages[TId] extends (...args: infer P) => string
    ? P
    : never;
const i: ConsoleID = 1;

const mmd: ConsoleMessageParams<2> = ['a', 'b'];

export function getConsoleMessage<TId extends ConsoleID, TParams extends ConsoleMessageParams<TId>>(
    consoleID: TId,
    ...args: TParams
): string {
    const msgOrFunc: ConsoleMessages[TId] = consoleMappings[consoleID];

    if (!msgOrFunc) {
        console.error(`Console Message for ID ${consoleID} not found`);
        return '';
    }

    if (typeof msgOrFunc === 'string') {
        return msgOrFunc;
    }

    return (msgOrFunc as any)(args);
}
