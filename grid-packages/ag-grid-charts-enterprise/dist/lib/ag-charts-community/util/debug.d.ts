type DebugLogger = ((...logContent: any[]) => void) & {
    check(): boolean;
};
export declare const Debug: {
    create(...debugSelectors: Array<boolean | string>): DebugLogger;
    check(...debugSelectors: Array<boolean | string>): boolean;
};
export {};
