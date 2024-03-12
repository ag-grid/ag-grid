import { toStringOrNull } from './generic';

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

export function removeFromUnorderedArray<T>(array: T[], object: T) {
    const index = array.indexOf(object);

    if (index >= 0) {
        // preserve the last element, then shorten array length by 1 to delete index
        array[index] = array[array.length - 1];
        array.pop();
    }
}

export function removeFromArray<T>(array: T[], object: T) {
    const index = array.indexOf(object);

    if (index >= 0) {
        array.splice(index, 1);
    }
}

export function removeAllFromUnorderedArray<T>(array: T[], toRemove: T[]) {
    for (let i = 0; i < toRemove.length; i++) {
        removeFromUnorderedArray(array, toRemove[i]);
    }
}

export function removeAllFromArray<T>(array: T[], toRemove: T[]) {
    for (let i = 0; i < toRemove.length; i++) {
        removeFromArray(array, toRemove[i]);
    }
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

export function flatten<T>(arrayOfArrays: (T | T[])[]): T[] {
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