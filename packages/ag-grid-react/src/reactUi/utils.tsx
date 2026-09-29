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
 * The list to render for `next`, keeping values already rendered in their previous order, so React moves no DOM node
 * and CSS transitions survive. Returns `prev` when nothing changed and `next` when it already has that order, so an
 * unchanged reference skips a render; otherwise builds the kept values in `prev` order with the new ones added.
 * Each list must hold distinct values.
 * @param maintainOrder Follow `next`'s order, as the DOM must for accessibility
 * @param placeNewInOrder Put each new value before the kept value that follows it in `next`, not last
 */
export function getNextValueIfDifferent<T extends { diffIndex: number }>(
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

    // Values are matched by a `diffIndex` stamp instead of a map: each `prev` value is stamped with its index, and a
    // value is kept exactly when `prev[value.diffIndex] === value`, so a stamp left by another list never matches. One
    // pass over `next` counts the kept values and notes whether they are in `prev` order and whether a new one precedes
    // a kept one. Only a result that has to be built restamps `next` and walks `prev`.
    for (let i = 0; i < prevLen; ++i) {
        prev[i].diffIndex = i;
    }

    let kept = 0;
    let lastPrevIndex = -1;
    let keptInOrder = true;
    let newBeforeKept = false;
    for (let i = 0; i < nextLen; ++i) {
        const value = next[i];
        const prevIndex = value.diffIndex;
        if (prevIndex >= prevLen || prev[prevIndex] !== value) {
            continue;
        }
        if (prevIndex < lastPrevIndex) {
            keptInOrder = false;
        }
        lastPrevIndex = prevIndex;
        if (kept !== i) {
            newBeforeKept = true;
        }
        ++kept;
    }

    // All the same values exist just in a different order so maintain the existing reference
    if (kept === prevLen && kept === nextLen) {
        return prev;
    }

    // kept values in their previous order: `next` is the result, unless new values must go last and one doesn't
    if (kept === 0 || (keptInOrder && (placeNewInOrder || !newBeforeKept))) {
        return next;
    }

    // restamped by index in `next`, a kept value moved past `nextLen` to tell it from a new one
    for (let i = 0; i < nextLen; ++i) {
        next[i].diffIndex = i;
    }
    for (let i = 0; i < prevLen; ++i) {
        const value = prev[i];
        const nextIndex = value.diffIndex;
        if (nextIndex < nextLen && next[nextIndex] === value) {
            value.diffIndex = nextLen + nextIndex;
        }
    }

    const result: T[] = [];
    for (let i = 0; i < prevLen; ++i) {
        const value = prev[i];
        const nextIndex = value.diffIndex - nextLen;
        if (nextIndex < 0 || nextIndex >= nextLen || next[nextIndex] !== value) {
            continue;
        }
        if (placeNewInOrder) {
            // each kept value brings the new values between it and the kept value before it in `next`
            pushNewBefore(result, next, nextIndex);
        }
        result.push(value);
    }
    if (placeNewInOrder) {
        pushNewBefore(result, next, nextLen);
        return result;
    }
    for (let i = 0; i < nextLen; ++i) {
        const value = next[i];
        if (value.diffIndex === i) {
            result.push(value);
        }
    }
    return result;
}

/** Pushes the new values `next` has straight before `end`, a new value being one still stamped with its own index. */
const pushNewBefore = <T extends { diffIndex: number }>(result: T[], next: T[], end: number): void => {
    let lastKept = end - 1;
    while (lastKept >= 0 && next[lastKept].diffIndex === lastKept) {
        --lastKept;
    }
    for (let i = lastKept + 1; i < end; ++i) {
        result.push(next[i]);
    }
};
