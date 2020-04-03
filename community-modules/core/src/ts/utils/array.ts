import { exists, missing } from './generic';

export function firstExistingValue<A>(...values: A[]): A | null {
    for (let i = 0; i < values.length; i++) {
        const value = values[i];

        if (exists(value)) {
            return value;
        }
    }

    return null;
}

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

export function existsAndNotEmpty(value?: any[] | null): boolean {
    return value != null && exists(value) && value.length > 0;
}

export function last<T>(arr: T[]): T | undefined {
    if (!arr || !arr.length) { return undefined; }

    return arr[arr.length - 1];
}

export function areEqual<T>(a: T[], b: T[]): boolean {
    return a.length === b.length && a.every((value, index) => b[index] === value);
}

export function compareArrays(array1?: any[], array2?: any[]): boolean {
    if (missing(array1) && missing(array2)) {
        return true;
    }

    if (missing(array1) || missing(array2)) {
        return false;
    }

    if (array1.length !== array2.length) {
        return false;
    }

    for (let i = 0; i < array1.length; i++) {
        if (array1[i] !== array2[i]) {
            return false;
        }
    }

    return true;
}

export function shallowCompare(arr1: any[], arr2: any[]): boolean {
    // if both are missing, then they are the same
    if (missing(arr1) && missing(arr2)) { return true; }

    // if one is present, but other is missing, then they are different
    if (missing(arr1) || missing(arr2)) { return false; }

    if (arr1.length !== arr2.length) { return false; }

    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }

    return true;
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

export const includes = <T>(array: T[], value: T): boolean => array.indexOf(value) > -1;

export function flatten(arrayOfArrays: any[]): any[] {
    return [].concat.apply([], arrayOfArrays);
}

export function pushAll(target: any[], source: any[]): void {
    if (missing(source) || missing(target)) { return; }

    source.forEach(func => target.push(func));
}

export function toStrings<T>(array: T[]): (string | null)[] {
    return array.map(item => item == null || !item.toString() ? null : item.toString());
}

export function findIndex<T>(collection: T[], predicate: (item: T, idx: number, collection: T[]) => boolean): number {
    for (let i = 0; i < collection.length; i++) {
        if (predicate(collection[i], i, collection)) {
            return i;
        }
    }
    return -1;
}

export function every<T>(items: T[], callback: (item: T) => boolean): boolean {
    if (!items || items.length === 0) {
        return true;
    }

    for (let i = 0; i < items.length; i++) {
        if (!callback(items[i])) {
            return false;
        }
    }

    return true;
}

export function forEachSnapshotFirst(list: any[], callback: (item: any) => void): void {
    if (!list) { return; }

    const arrayCopy = list.slice(0);
    arrayCopy.forEach(callback);
}
