export declare const Logger: {
    debug(...logContent: any[]): void;
    warn(message: string, ...logContent: any[]): void;
    error(message: string, ...logContent: any[]): void;
    warnOnce(message: string, ...logContent: any[]): void;
    errorOnce(message: string, ...logContent: any[]): void;
};
