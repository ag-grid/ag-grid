/**
 * Wrap a function in debouncing trigger function. A requestAnimationFrame() is scheduled
 * after the first schedule() call, and subsequent schedule() calls will be ignored until the
 * animation callback executes.
 */
export declare function debouncedAnimationFrame(cb: (params: {
    count: number;
}) => void): {
    schedule(): void;
};
export declare function debouncedCallback(cb: (params: {
    count: number;
}) => void): {
    schedule(): void;
};
