import { exists, toStringOrNull } from './generic';

export function firstExistingValue<A>(...values: A[]): A | null {
    for (let i = 0; i < values.length; i++) {
        const value = values[i];

        if (exists(value)) {
            return value;
        }
    }

    return null;
}

/** @deprecated */
export function anyExists(values: any[]): boolean {
    return values && firstExistingValue(values) != null;
}

export function existsAndNotEmpty<T>(value?: T[]): boolean {
    return value != null && value.length > 0;
}

export function last<T>(arr: T[]): T | undefined {
    if (!arr || !arr.length) { return undefined; }

    return arr[arr.length - 1];
}

export function areEqual<T>(a: T[], b: T[], comparator?: (a: T, b: T) => boolean): boolean {
    if (a == null && b == null) {
        return true;
    }

    return a != null &&
        b != null &&
        a.length === b.length &&
        every(a, (value, index) => comparator ? comparator(value, b[index]) : b[index] === value);
}

/** @deprecated */
export function compareArrays(array1?: any[], array2?: any[]): boolean {
    return areEqual(array1, array2);
}

/** @deprecated */
export function shallowCompare(arr1: any[], arr2: any[]): boolean {
    return areEqual(arr1, arr2);
}

export function sortNumerically(array: number[]): number[] {
    return array.sort((a, b) => a - b);
}

export function removeRepeatsFromArray<T>(array: T[], object: T) {
    if (!array) { return; }

    for (let index = array.length - 2; index >= 0; index--) {
        const thisOneMatches = array[index] === object;
        const nextOneMatches = array[index + 1] === object;

        if (thisOneMatches && nextOneMatches) {
            array.splice(index + 1, 1);
        }
    }
}

export function removeFromArray<T>(array: T[], object: T) {
    const index = array.indexOf(object);

    if (index >= 0) {
        array.splice(index, 1);
    }
}

export function removeAllFromArray<T>(array: T[], toRemove: T[]) {
    forEach(toRemove, item => removeFromArray(array, item));
}

export function insertIntoArray<T>(array: T[], object: T, toIndex: number) {
    array.splice(toIndex, 0, object);
}

export function insertArrayIntoArray<T>(dest: T[], src: T[], toIndex: number) {
    if (dest == null || src == null) { return; }

    // put items in backwards, otherwise inserted items end up in reverse order
    for (let i = src.length - 1; i >= 0; i--) {
        const item = src[i];
        insertIntoArray(dest, item, toIndex);
    }
}

export function moveInArray<T>(array: T[], objectsToMove: T[], toIndex: number) {
    // first take out items from the array
    removeAllFromArray(array, objectsToMove);

    // now add the objects, in same order as provided to us, that means we start at the end
    // as the objects will be pushed to the right as they are inserted
    forEach(objectsToMove.slice().reverse(), obj => insertIntoArray(array, obj, toIndex));
}

export function includes<T>(array: T[], value: T): boolean {
    return array.indexOf(value) > -1;
}

export function flatten(arrayOfArrays: any[]): any[] {
    return [].concat.apply([], arrayOfArrays);
}

export function pushAll<T>(target: T[], source: T[]): void {
    if (source == null || target == null) { return; }

    forEach(source, value => target.push(value));
}

export function toStrings<T>(array: T[]): (string | null)[] {
    return map(array, toStringOrNull);
}

export function findIndex<T>(collection: T[], predicate: (item: T, idx: number, collection: T[]) => boolean): number {
    for (let i = 0; i < collection.length; i++) {
        if (predicate(collection[i], i, collection)) {
            return i;
        }
    }

    return -1;
}

/**
 * The implementation of Array.prototype.every in browsers is always slower than just using a simple for loop, so
 * use this for improved performance.
 * https://jsbench.me/bek91dtit8/
 */
export function every<T>(list: T[], predicate: (value: T, index: number) => boolean): boolean {
    if (list == null) {
        return true;
    }

    for (let i = 0; i < list.length; i++) {
        if (!predicate(list[i], i)) {
            return false;
        }
    }

    return true;
}

/**
 * The implementation of Array.prototype.some in browsers is always slower than just using a simple for loop, so
 * use this for improved performance.
 * https://jsbench.me/5dk91e4tmt/
 */
export function some<T>(list: T[], predicate: (value: T, index: number) => boolean): boolean {
    if (list == null) {
        return false;
    }

    for (let i = 0; i < list.length; i++) {
        if (predicate(list[i], i)) {
            return true;
        }
    }

    return false;
}

/**
 * The implementation of Array.prototype.forEach in browsers is often slower than just using a simple for loop, so
 * use this for improved performance.
 * https://jsbench.me/apk91elt8a/
 */
export function forEach<T>(list: T[], action: (value: T, index: number) => void): void {
    if (list == null) {
        return;
    }

    for (let i = 0; i < list.length; i++) {
        action(list[i], i);
    }
}

/**
 * The implementation of Array.prototype.map in browsers is generally the same as just using a simple for loop. However,
 * Firefox does exhibit some difference, and this performs no worse in other browsers, so use this if you want improved
 * performance.
 * https://jsbench.me/njk91ez8pc/
 */
export function map<T, V>(list: T[], process: (value: T, index: number) => V): V[] {
    if (list == null) {
        return null;
    }

    const mapped: V[] = [];

    for (let i = 0; i < list.length; i++) {
        mapped.push(process(list[i], i));
    }

    return mapped;
}

/**
 * The implementation of Array.prototype.filter in browsers is always slower than just using a simple for loop, so
 * use this for improved performance.
 * https://jsbench.me/7bk91fk08c/
 */
export function filter<T>(list: T[], predicate: (value: T, index: number) => boolean): T[] {
    if (list == null) {
        return null;
    }

    const filtered: T[] = [];

    for (let i = 0; i < list.length; i++) {
        if (predicate(list[i], i)) {
            filtered.push(list[i]);
        }
    }

    return filtered;
}

/**
 * The implementation of Array.prototype.reduce in browsers is generally the same as just using a simple for loop. However,
 * Chrome does exhibit some difference, and this performs no worse in other browsers, so use this if you want improved
 * performance.
 * https://jsbench.me/7vk92n6u1f/
 */
export function reduce<T, V>(list: T[], step: (acc: V, value: T, index: number) => V, initial: V): V {
    if (list == null || initial == null) {
        return null;
    }

    let result = initial;

    for (let i = 0; i < list.length; i++) {
        result = step(result, list[i], i);
    }

    return result;
}

/** @deprecated */
export function forEachSnapshotFirst<T>(list: T[], callback: (item: T) => void): void {
    if (!list) { return; }

    const arrayCopy = list.slice(0);
    arrayCopy.forEach(callback);
}
