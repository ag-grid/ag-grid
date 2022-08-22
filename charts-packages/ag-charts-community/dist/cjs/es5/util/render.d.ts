declare type Callback = (params: {
    count: number;
}) => void;
/**
 * Wrap a function in debouncing trigger function. A requestAnimationFrame() is scheduled
 * after the first schedule() call, and subsequent schedule() calls will be ignored until the
 * animation callback executes.
 */
export declare function debouncedAnimationFrame(cb: Callback): {
    schedule(): void;
};
export declare function debouncedCallback(cb: Callback): {
    schedule(): void;
};
export {};
