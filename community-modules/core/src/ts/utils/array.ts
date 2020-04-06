import { exists, missing, toStringOrNull } from './generic';

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
    if (values) {
        for (let i = 0; i < values.length; i++) {
            if (exists(values[i])) {
                return true;
            }
        }
    }

    return false;
}

export function existsAndNotEmpty<T>(value?: T[]): boolean {
    return value != null && exists(value) && value.length > 0;
}

export function last<T>(arr: T[]): T | undefined {
    if (!arr || !arr.length) { return undefined; }

    return arr[arr.length - 1];
}

export function areEqual<T>(a: T[], b: T[]): boolean {
    if (missing(a) && missing(b)) {
        return true;
    }

    if (missing(a) || missing(b)) {
        return false;
    }

    return a.length === b.length && a.every((value, index) => b[index] === value);
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
    toRemove.forEach(item => removeFromArray(array, item));
}

export function insertIntoArray<T>(array: T[], object: T, toIndex: number) {
    array.splice(toIndex, 0, object);
}

export function insertArrayIntoArray<T>(dest: T[], src: T[], toIndex: number) {
    if (missing(dest) || missing(src)) { return; }
    // put items in backwards, otherwise inserted items end up in reverse order

    for (let i = src.length - 1; i >= 0; i--) {
        const item = src[i];
        insertIntoArray(dest, item, toIndex);
    }
}

export function moveInArray<T>(array: T[], objectsToMove: T[], toIndex: number) {
    // first take out it items from the array
    objectsToMove.forEach((obj) => {
        removeFromArray(array, obj);
    });

    // now add the objects, in same order as provided to us, that means we start at the end
    // as the objects will be pushed to the right as they are inserted
    objectsToMove.slice().reverse().forEach((obj) => {
        insertIntoArray(array, obj, toIndex);
    });
}

export function includes<T>(array: T[], value: T): boolean {
    return array.indexOf(value) > -1;
}

export function flatten(arrayOfArrays: any[]): any[] {
    return [].concat.apply([], arrayOfArrays);
}

export function pushAll<T>(target: T[], source: T[]): void {
    if (missing(source) || missing(target)) { return; }

    source.forEach(func => target.push(func));
}

export function toStrings<T>(array: T[]): (string | null)[] {
    return array.map(toStringOrNull);
}

export function findIndex<T>(collection: T[], predicate: (item: T, idx: number, collection: T[]) => boolean): number {
    for (let i = 0; i < collection.length; i++) {
        if (predicate(collection[i], i, collection)) {
            return i;
        }
    }

    return -1;
}

/** @deprecated Should use Array.prototype.every instead */
export function every<T>(items: T[], callback: (item: T) => boolean): boolean {
    return !items || items.every(callback);
}

/** @deprecated */
export function forEachSnapshotFirst<T>(list: T[], callback: (item: T) => void): void {
    if (!list) { return; }

    const arrayCopy = list.slice(0);
    arrayCopy.forEach(callback);
}
