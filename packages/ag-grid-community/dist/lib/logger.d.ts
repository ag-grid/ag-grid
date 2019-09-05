// Type definitions for ag-grid-community v21.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export declare class LoggerFactory {
    private logging;
    private setBeans;
    create(name: string): Logger;
    isLogging(): boolean;
}
export declare class Logger {
    private isLoggingFunc;
    private name;
    constructor(name: string, isLoggingFunc: () => boolean);
    isLogging(): boolean;
    log(message: string): void;
}
