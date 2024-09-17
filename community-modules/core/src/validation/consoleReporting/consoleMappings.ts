const consoleMessages = {
    1: () => 'rowData must be an array!',
    3: () => 'rowData must be an!',
    22: (test: string) => `rowData must be an array! ${test}`,
    2: (rowId: string, data: string) => `rowData must be an array! ${rowId} ${data}`,
} as const;

export type ConsoleID = keyof typeof consoleMessages;
export type ConsoleMessages = typeof consoleMessages;

export type ConsoleMessageParams<TId extends ConsoleID> = TId extends keyof ConsoleMessages
    ? Parameters<ConsoleMessages[TId]>
    : [never];

export function getConsoleMessage<TId extends ConsoleID>(consoleID: TId, ...args: ConsoleMessageParams<TId>): string {
    const msgOrFunc: ConsoleMessages[TId] = consoleMessages[consoleID];

    if (!msgOrFunc) {
        console.error(`Console Message for ID ${consoleID} not found`);
        return '';
    }

    return (msgOrFunc as any)(...args);
}
