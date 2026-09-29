import { _areEqual } from 'ag-stack';
import React from 'react';
import ReactDOM from 'react-dom';

export const classesList = (...list: (string | null | undefined)[]): string => {
    const filtered = list.filter((s) => s != null && s !== '');

    return filtered.join(' ');
};

export class CssClasses {
    private classesMap: { [name: string]: boolean } = {};

    constructor(...initialClasses: string[]) {
        for (const className of initialClasses) {
            this.classesMap[className] = true;
        }
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

const reactVersion = React.version?.split('.')[0];
// Note we don't do numerical comparison to enable experimental React versions to work.
// See https://github.com/facebook/react/blob/main/ReactVersions.js
// We only want to disable flushSync and change rendering behaviour for React 16 and 17
const isReactVersion17Minus = reactVersion === '16' || reactVersion === '17';

export function isReact19(): boolean {
    return reactVersion === '19';
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
 * Wrapper around startTransition to provide backwards compatibility with React 16-17
 */
export const agStartTransition = (fn: () => void) => {
    if (!isReactVersion17Minus) {
        (React as any).startTransition(fn);
    } else {
        fn();
    }
};

/**
 * Wrapper around useSyncExternalStore to provide backwards compatibility with React 16-17
 */
export function agUseSyncExternalStore<T>(
    subscribe: (onStoreChange: () => void) => () => void,
    getSnapshot: () => T,
    defaultSnapshot: T
): T {
    if ((React as any).useSyncExternalStore) {
        return React.useSyncExternalStore(subscribe, getSnapshot);
    } else {
        // Do nothing as this value cannot be used
        return defaultSnapshot;
    }
}

/**
 * The aim of this function is to maintain references to prev or next values where possible.
 * If there are not real changes then return the prev value to avoid unnecessary renders.
 * @param maintainOrder If we want to maintain the order of the elements in the dom in line with the next array
 * @param placeNewInOrder Put each new value before the kept value that follows it in `next`, not last
 * @returns
 */
export function getNextValueIfDifferent<T extends { instanceId: string }>(
    prev: T[] | null,
    next: T[] | null,
    maintainOrder: boolean,
    placeNewInOrder = false
): T[] | null {
    if (next == null || prev == null) {
        return next;
    }
    const prevLen = prev.length;
    const nextLen = next.length;

    // If same array instance nothing to do.
    // If both empty arrays maintain reference of prev.
    if (prev === next || (nextLen === 0 && prevLen === 0)) {
        return prev;
    }

    // If maintaining dom order just return next
    // If either side is empty there is no previous order to maintain
    if (maintainOrder || prevLen === 0 || nextLen === 0) {
        return next;
    }

    if (_areEqual(prev, next)) {
        return prev;
    }

    // if dom order not important, we don't want to change the order
    // of the elements in the dom, as this would break transition styles
    const prevIndexes = new Map<string, number>();
    for (let i = 0; i < prevLen; ++i) {
        prevIndexes.set(prev[i].instanceId, i);
    }

    const oldValues: T[] = [];
    const newValues: T[] = [];
    let lastPrevIndex = -1;
    let oldInOrder = true;
    for (let i = 0; i < nextLen; ++i) {
        const value = next[i];
        const prevIndex = prevIndexes.get(value.instanceId);
        if (prevIndex === undefined) {
            newValues.push(value);
            continue;
        }
        if (prevIndex < lastPrevIndex) {
            oldInOrder = false;
        }
        lastPrevIndex = prevIndex;
        oldValues.push(prev[prevIndex]);
    }

    // All the same values exist just in a different order so maintain the existing reference
    if (oldValues.length === prevLen && newValues.length === 0) {
        return prev;
    }

    // All new values so maintain the reference of next
    if (oldValues.length === 0) {
        return next;
    }

    // with the old values in `next`'s order, `next` already holds them, and places each new one before the old one
    // after it; appending new values instead needs there to be none
    if (oldInOrder && (placeNewInOrder || newValues.length === 0)) {
        return next;
    }

    if (placeNewInOrder && newValues.length !== 0) {
        // old values keep their place, so each run of new values goes before the old value after it in `next`;
        // by position in `prev`, the run before each old value, undefined where `next` drops it
        const runsBefore: (T[] | undefined)[] = new Array(prevLen);
        let run: T[] = [];
        for (let i = 0; i < nextLen; ++i) {
            const value = next[i];
            const prevIndex = prevIndexes.get(value.instanceId);
            if (prevIndex === undefined) {
                run.push(value);
            } else if (run.length === 0) {
                runsBefore[prevIndex] = NO_NEW_VALUES;
            } else {
                runsBefore[prevIndex] = run;
                run = [];
            }
        }
        const result: T[] = [];
        for (let i = 0; i < prevLen; ++i) {
            const runBefore = runsBefore[i];
            if (runBefore !== undefined) {
                pushAll(result, runBefore);
                result.push(prev[i]);
            }
        }
        pushAll(result, run);
        return result;
    }

    if (!oldInOrder) {
        // back in their previous order, reusing the array
        const kept = new Uint8Array(prevLen);
        for (let i = 0, len = oldValues.length; i < len; ++i) {
            kept[prevIndexes.get(oldValues[i].instanceId)!] = 1;
        }
        oldValues.length = 0;
        for (let i = 0; i < prevLen; ++i) {
            if (kept[i] === 1) {
                oldValues.push(prev[i]);
            }
        }
    }
    pushAll(oldValues, newValues);
    return oldValues;
}

const NO_NEW_VALUES: never[] = [];

const pushAll = <T,>(target: T[], values: T[]): void => {
    for (let i = 0, len = values.length; i < len; ++i) {
        target.push(values[i]);
    }
};
