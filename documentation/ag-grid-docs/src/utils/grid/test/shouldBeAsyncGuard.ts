/**
 * List of known async assertion methods that require await
 */
const ASYNC_ASSERTION_METHODS = new Set([
    'toBeAttached',
    'toBeChecked',
    'toBeDisabled',
    'toBeEditable',
    'toBeEmpty',
    'toBeEnabled',
    'toBeFocused',
    'toBeHidden',
    'toBeInViewport',
    'toBeVisible',
    'toContainText',
    'toHaveAccessibleDescription',
    'toHaveAccessibleName',
    'toHaveAttribute',
    'toHaveClass',
    'toHaveCount',
    'toHaveCSS',
    'toHaveId',
    'toHaveJSProperty',
    'toHaveRole',
    'toHaveScreenshot',
    'toHaveText',
    'toHaveTitle',
    'toHaveURL',
    'toHaveValue',
    'toHaveValues',
]);
/**
 * Simple wrapper that protects async assertion methods from being used without await.
 */
export function shouldBeAsyncGuard<T>(playwrightExpect: T): T {
    return function protectedExpect(...actual: any[]) {
        const expectResult = (playwrightExpect as any)(...actual);

        return new Proxy(expectResult, {
            get(target, prop) {
                const value = target[prop as keyof typeof target];

                // Only wrap known async assertion methods
                if (typeof prop === 'string' && ASYNC_ASSERTION_METHODS.has(prop) && typeof value === 'function') {
                    return function (...args: any[]) {
                        // Capture the current stack to find the actual test line
                        const stackCapture = new Error();
                        let fullTestLine = '';

                        if (stackCapture.stack) {
                            const lines = stackCapture.stack.split('\n');
                            // Look for the first line that contains this file but isn't in our proxy code
                            const testLine = lines.find((line, index) => {
                                return (
                                    line.includes('.spec.ts:') &&
                                    index > 1 && // Skip the first couple of stack frames
                                    !line.includes('shouldBeAsyncGuard') &&
                                    !line.includes('protectedExpect') &&
                                    !line.includes('Proxy.') &&
                                    line.includes(' at ')
                                ); // Make sure it's a proper stack line
                            });

                            if (testLine) {
                                fullTestLine = testLine.trim();
                            }
                        }

                        const result = (value as any).call(target, ...args);

                        // If it returns a promise, protect it from being used without await
                        if (result && typeof result === 'object' && typeof result.then === 'function') {
                            let isAwaited = false;

                            // Wrap the promise with a proxy that detects property access
                            const wrappedPromise = new Proxy(result, {
                                get(promiseTarget, promiseProp) {
                                    // If someone accesses .then, .catch, or .finally, mark as awaited
                                    if (
                                        promiseProp === 'then' ||
                                        promiseProp === 'catch' ||
                                        promiseProp === 'finally'
                                    ) {
                                        isAwaited = true;
                                        const method = promiseTarget[promiseProp as keyof typeof promiseTarget];
                                        return typeof method === 'function' ? method.bind(promiseTarget) : method;
                                    }

                                    // Any other property access means they're not awaiting properly
                                    if (!isAwaited) {
                                        const errorMessage = `Missing await before expect(...).${prop}(). Use: await expect(...).${prop}()`;
                                        const fullError = fullTestLine
                                            ? `${errorMessage}\n    ${fullTestLine}`
                                            : errorMessage;
                                        throw new Error(fullError);
                                    }

                                    return promiseTarget[promiseProp as keyof typeof promiseTarget];
                                },
                            });

                            // Also check for synchronous completion (statement ends without await)
                            setTimeout(() => {
                                if (!isAwaited) {
                                    const errorMessage = `Missing await before expect(...).${prop}(). Use: await expect(...).${prop}()`;
                                    const fullError = fullTestLine
                                        ? `${errorMessage}\n    ${fullTestLine}`
                                        : errorMessage;
                                    throw new Error(fullError);
                                }
                            }, 0);

                            return wrappedPromise;
                        }

                        return result;
                    };
                }

                // For all other properties, return as-is
                return value;
            },
        });
    } as T;
}
