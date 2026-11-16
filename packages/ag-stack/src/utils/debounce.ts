// Kept out of `function.ts`, which imports `./dom` and would pull the DOM into `ag-stack/core`.
/**
 * Creates a debounced function, and attach it to a bean for lifecycle
 * @param {Function} func The function to be debounced
 * @param {number} delay The time in ms to debounce
 * @returns {Function} The debounced function
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _debounce<TArgs extends any[], TContext>(
    bean: { isAlive(): boolean },
    func: (this: TContext, ...args: TArgs) => void,
    delay: number
): (this: TContext, ...args: TArgs) => ReturnType<typeof setTimeout> {
    let timeout: ReturnType<typeof setTimeout>;

    // Calling debounce returns a new anonymous function
    return function (this: TContext, ...args: TArgs): ReturnType<typeof setTimeout> {
        const context = this as any;
        clearTimeout(timeout);

        // Set the new timeout
        timeout = setTimeout(function () {
            // at the moment we just check if the bean is still alive, in the future the bean stub should
            // another option is to manage a list of active timers and clear them when the bean is destroyed.
            if (bean.isAlive()) {
                func.apply(context, args);
            }
        }, delay);

        return timeout;
    };
}
