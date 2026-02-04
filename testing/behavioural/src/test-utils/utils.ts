import { setTimeout as __asyncSetTimeout } from 'timers/promises';
import util from 'util';
import { vitest } from 'vitest';

const log = console.log;
const info = console.info;

export { log, info };

export const asyncSetTimeout = __asyncSetTimeout;

export async function flushFakeTimers() {
    vitest.advanceTimersByTime(10000);
    vitest.useRealTimers();
    await asyncSetTimeout(2);
}

export function escapeQuotes(value: string): string {
    return value.replaceAll(/(['"])/g, '\\$1');
}

const cachedJSONObjectsMap = new Map<string, any>();

export const cachedJSONObjects = {
    /** Clears the cache of JSON objects. */
    clear() {
        cachedJSONObjectsMap.clear();
    },

    /**
     * This is useful for writing test code without having to store in variables the objects that are created.
     * This JSON stringify the object to use as a key in a global map, and if the object is already in the map, it returns the cached object.
     * You can call cachedJSONObjects.clear() to clear the cache on beforeEach() call.
     */
    object<T>(obj: T): T {
        if (typeof obj !== 'object' || obj === null) {
            return obj;
        }
        const key = JSON.stringify(obj);
        const found = cachedJSONObjectsMap.get(key);
        if (found !== undefined) {
            return found;
        }

        if (obj instanceof Date) {
            return obj;
        }

        let newObj: any;

        if (Array.isArray(obj)) {
            newObj = obj.map(cachedJSONObjects.object);
            cachedJSONObjectsMap.set(key, newObj);
            return newObj;
        }

        newObj = {};
        for (const key of Object.keys(obj)) {
            newObj[key] = cachedJSONObjects.object(obj[key]);
        }
        return newObj;
    },

    /** return array.map(cachedJSONObjects.object) */
    array<T>(array: T[]): T[] {
        return array.map(cachedJSONObjects.object);
    },
};

export const printDataSnapshot = (data: any, pretty = false) => {
    if (typeof data === 'string') {
        console.log('\nsnapshot:\n' + JSON.stringify(data) + '\n');
    }
    console.log(
        '\nsnapshot:\n' +
            util.inspect(data, {
                colors: false,
                depth: 0xfffff,
                breakLength: pretty ? 120 : 0xfffff,
                maxArrayLength: 0xfffff,
                compact: true,
                getters: false,
                maxStringLength: 0xfffff,
                showHidden: false,
                showProxy: false,
                sorted: false,
                customInspect: false,
                numericSeparator: false,
            }) +
            '\n'
    );
};

export function unindentText(text: TemplateStringsArray | string | string[] | null | undefined): string {
    let lines: string[];
    if (Array.isArray(text)) {
        if ('raw' in text) {
            lines = String(text).split('\n');
        } else {
            lines = text;
        }
    } else {
        lines = String(text).split('\n');
    }
    lines = lines.filter((line) => line.trim().length > 0).map((line) => line.trimEnd());
    const minIndent = Math.min(...lines.map((line) => line.match(/^\s*/)?.[0].length ?? 0));
    if (minIndent > 0) {
        lines = lines.map((line) => line.slice(minIndent));
    }
    return lines.join('\n');
}

let consoleLicenseKeyErrorInitialized = false;

/**
 * Queries an element by test ID, including within shadow roots.
 * This is necessary because @testing-library/dom's getByTestId doesn't search inside shadow roots.
 */
export function queryByTestIdDeep(container: Element | Document | ShadowRoot, testId: string): HTMLElement | null {
    // First try the container itself
    const directResult = container.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
    if (directResult) {
        return directResult;
    }

    // Search in shadow roots
    const searchInShadowRoots = (root: Element | Document | ShadowRoot): HTMLElement | null => {
        const elements = root.querySelectorAll('*');
        for (const element of elements) {
            const shadowRoot = (element as Element).shadowRoot;
            if (shadowRoot) {
                const found = shadowRoot.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
                if (found) {
                    return found;
                }
                const nested = searchInShadowRoots(shadowRoot);
                if (nested) {
                    return nested;
                }
            }
        }
        return null;
    };

    return searchInShadowRoots(container);
}

/**
 * Gets an element by test ID, including within shadow roots.
 * Throws an error if the element is not found.
 */
export function getByTestIdDeep(container: Element | Document | ShadowRoot, testId: string): HTMLElement {
    const result = queryByTestIdDeep(container, testId);
    if (!result) {
        throw new Error(`Unable to find an element with data-testid="${testId}" (including shadow roots)`);
    }
    return result;
}

export function ignoreConsoleLicenseKeyError() {
    if (consoleLicenseKeyErrorInitialized) {
        return;
    }

    consoleLicenseKeyErrorInitialized = true;

    const originalConsoleError = console.error;

    // We want to ignore the missing license error message during tests.
    function consoleErrorImpl(...args: unknown[]) {
        if (
            args.length === 1 &&
            typeof args[0] === 'string' &&
            args[0].startsWith('*') &&
            args[0].endsWith('*') &&
            args[0].length === 124
        ) {
            return; // This is a license error message
        }
        return originalConsoleError.apply(console, args);
    }

    consoleErrorImpl.original = originalConsoleError;

    console.error = consoleErrorImpl;
}
