export declare const Logger: {
    log(...logContent: any[]): void;
    warn(message: string, ...logContent: any[]): void;
    error(message: any, ...logContent: any[]): void;
    table(...logContent: any[]): void;
    warnOnce(message: any, ...logContent: any[]): void;
    errorOnce(message: any, ...logContent: any[]): void;
};
