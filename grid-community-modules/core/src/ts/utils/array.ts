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

export function existsAndNotEmpty<T>(value?: T[]): boolean {
    return value != null && value.length > 0;
}

export function last<T>(arr: T[]): T;
export function last<T extends Node>(arr: NodeListOf<T>): T;
export function last(arr: any): any {
    if (!arr || !arr.length) { return; }

    return arr[arr.length - 1];
}

export function areEqual<T>(a?: T[] | null, b?: T[] | null, comparator?: (a: T, b: T) => boolean): boolean {
    if (a == null && b == null) {
        return true;
    }

    return a != null &&
        b != null &&
        a.length === b.length &&
        a.every((value, index) => comparator ? comparator(value, b[index]) : b[index] === value);
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
    objectsToMove.slice().reverse().forEach(obj => insertIntoArray(array, obj, toIndex));
}

export function includes<T>(array: T[], value: T): boolean {
    return array.indexOf(value) > -1;
}

export function flatten(arrayOfArrays: any[]): any[] {
    return [].concat.apply([], arrayOfArrays);
}

export function pushAll<T>(target: T[], source: T[]): void {
    if (source == null || target == null) { return; }

    source.forEach(value => target.push(value));
}

export function toStrings<T>(array: T[]): ((string | null)[]) | null {
    return array.map(toStringOrNull);
}

export function forEachReverse<T>(list: T[], action: (value: T, index: number) => void): void {
    if (list == null) {
        return;
    }

    for (let i = list.length - 1; i >= 0; i--) {
        action(list[i], i);
    }
}
