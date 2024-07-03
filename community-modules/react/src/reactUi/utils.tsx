import { version } from 'react';
import ReactDOM from 'react-dom';

export const classesList = (...list: (string | null | undefined)[]): string => {
    const filtered = list.filter((s) => s != null && s !== '');

    return filtered.join(' ');
};

export class CssClasses {
    private classesMap: { [name: string]: boolean } = {};

    constructor(...initialClasses: string[]) {
        initialClasses.forEach((className) => {
            this.classesMap[className] = true;
        });
    }

    public setClass(className: string, on: boolean): CssClasses {
        // important to not make a copy if nothing has changed, so react
        // won't trigger a render cycle on new object instance
        const nothingHasChanged = !!this.classesMap[className] == on;
        if (nothingHasChanged) {
            return this;
        }

        const res = new CssClasses();
        res.classesMap = { ...this.classesMap };
        res.classesMap[className] = on;
        return res;
    }

    public toString(): string {
        const res = Object.keys(this.classesMap)
            .filter((key) => this.classesMap[key])
            .join(' ');
        return res;
    }
}

export const isComponentStateless = (Component: any) => {
    const hasSymbol = () => typeof Symbol === 'function' && Symbol.for;
    const getMemoType = () => (hasSymbol() ? Symbol.for('react.memo') : 0xead3);

    return (
        (typeof Component === 'function' && !(Component.prototype && Component.prototype.isReactComponent)) ||
        (typeof Component === 'object' && Component.$$typeof === getMemoType())
    );
};

const reactVersion = version.split('.')[0];
// Note we don't do numerical comparison to enable experimental React versions to work.
// See https://github.com/facebook/react/blob/main/ReactVersions.js
const isReactVersion17Minus = reactVersion === '16' || reactVersion === '17';

export function isReact17Minus(): boolean {
    return !isReactVersion17Minus;
}

let disableFlushSync = false;
/** Enable flushSync to be disabled for the callback and the next frame (via setTimeout 0) to prevent flushSync during an existing render.
 * Provides an alternative to the more fine grained useFlushSync boolean param to agFlushSync.
 */
export function runWithoutFlushSync<T>(func: () => T) {
    if (!disableFlushSync) {
        // We only re-enable flushSync asynchronously to avoid re-enabling it while React is still triggering renders related to the original call.
        setTimeout(() => (disableFlushSync = false), 0);
    }
    disableFlushSync = true;
    return func();
}

/**
 * Wrapper around flushSync to provide backwards compatibility with React 16-17
 * Also allows us to control via the `useFlushSync` param whether we want to use flushSync or not
 * as we do not want to use flushSync when we are likely to already be in a render cycle
 */
export const agFlushSync = (useFlushSync: boolean, fn: () => void) => {
    if (!isReactVersion17Minus && useFlushSync && !disableFlushSync) {
        (ReactDOM as any).flushSync(fn);
    } else {
        fn();
    }
};

/**
 * The aim of this function is to maintain references to prev or next values where possible.
 * If there are not real changes then return the prev value to avoid unnecessary renders.
 * @param maintainOrder If we want to maintain the order of the elements in the dom in line with the next array
 * @returns
 */
export function getNextValueIfDifferent<T extends { getInstanceId: () => string }>(
    prev: T[] | null,
    next: T[] | null,
    maintainOrder: boolean
): T[] | null {
    if (next == null || prev == null) {
        return next;
    }

    // If same array instance nothing to do.
    // If both empty arrays maintain reference of prev.
    if (prev === next || (next.length === 0 && prev.length === 0)) {
        return prev;
    }

    // If maintaining dom order just return next
    // If prev is empty just return next immediately as no previous order to maintain
    // If prev was not empty but next is empty return next immediately
    if (maintainOrder || (prev.length === 0 && next.length > 0) || (prev.length > 0 && next.length === 0)) {
        return next;
    }

    // if dom order not important, we don't want to change the order
    // of the elements in the dom, as this would break transition styles
    const oldValues: T[] = [];
    const newValues: T[] = [];
    const prevMap: Map<string, T> = new Map();
    const nextMap: Map<string, T> = new Map();

    for (let i = 0; i < next.length; i++) {
        const c = next[i];
        nextMap.set(c.getInstanceId(), c);
    }

    for (let i = 0; i < prev.length; i++) {
        const c = prev[i];
        prevMap.set(c.getInstanceId(), c);
        if (nextMap.has(c.getInstanceId())) {
            oldValues.push(c);
        }
    }

    for (let i = 0; i < next.length; i++) {
        const c = next[i];
        const instanceId = c.getInstanceId();

        if (!prevMap.has(instanceId)) {
            newValues.push(c);
        }
    }

    // All the same values exist just maybe in a different order so maintain the existing reference
    if (oldValues.length === prev.length && newValues.length === 0) {
        return prev;
    }

    // All new values so avoid spreading the new array to maintain the reference
    if (oldValues.length === 0 && newValues.length === next.length) {
        return next;
    }
    // Spread as required to combine the old and new values
    if (oldValues.length === 0) {
        return newValues;
    }

    if (newValues.length === 0) {
        return oldValues;
    }

    return [...oldValues, ...newValues];
}
