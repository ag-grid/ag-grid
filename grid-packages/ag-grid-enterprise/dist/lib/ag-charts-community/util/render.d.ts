type Callback = (params: {
    count: number;
}) => Promise<void> | void;
/**
 * Wrap a function in debouncing trigger function. A requestAnimationFrame() is scheduled
 * after the first schedule() call, and subsequent schedule() calls will be ignored until the
 * animation callback executes.
 */
export declare function debouncedAnimationFrame(cb: Callback): {
    schedule(delayMs?: number): void;
    await(): Promise<void>;
};
export declare function debouncedCallback(cb: Callback): {
    schedule(delayMs?: number): void;
    await(): Promise<void>;
};
export {};
