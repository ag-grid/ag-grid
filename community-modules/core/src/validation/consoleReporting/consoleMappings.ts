export type ConsoleID = number;

export type ConsoleMessage = string | ((...args: string[]) => string);
// a map from error codes to console messages
const consoleMappings: Record<ConsoleID, ConsoleMessage> = {
    1: 'rowData must be an array!',
};

export function getConsoleMessage(consoleID: ConsoleID, ...args: any[]): string {
    const msgOrFunc = consoleMappings[consoleID];

    if (!msgOrFunc) {
        console.error(`Console Message for ID ${consoleID} not found`);
        return '';
    }

    if (typeof msgOrFunc === 'string') {
        return msgOrFunc;
    }

    return msgOrFunc(...args);
}
