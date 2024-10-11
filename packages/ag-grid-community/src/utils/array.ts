export function _existsAndNotEmpty<T>(value?: T[]): boolean {
    return value != null && value.length > 0;
}

export function _last<T>(arr: T[]): T;
export function _last<T extends Node>(arr: NodeListOf<T>): T;
export function _last(arr: any): any {
    if (!arr || !arr.length) {
        return;
    }

    return arr[arr.length - 1];
}

export function _areEqual<T>(a?: T[] | null, b?: T[] | null, comparator?: (a: T, b: T) => boolean): boolean {
    if (a == null && b == null) {
        return true;
    }

    return (
        a != null &&
        b != null &&
        a.length === b.length &&
        a.every((value, index) => (comparator ? comparator(value, b[index]) : b[index] === value))
    );
}

export function _shallowCompare(arr1: any[], arr2: any[]): boolean {
    return _areEqual(arr1, arr2);
}

export function _sortNumerically(array: number[]): number[] {
    return array.sort((a, b) => a - b);
}

export function _removeRepeatsFromArray<T>(array: T[], object: T) {
    if (!array) {
        return;
    }

    for (let index = array.length - 2; index >= 0; index--) {
        const thisOneMatches = array[index] === object;
        const nextOneMatches = array[index + 1] === object;

        if (thisOneMatches && nextOneMatches) {
            array.splice(index + 1, 1);
        }
    }
}

export function _removeFromUnorderedArray<T>(array: T[], object: T) {
    const index = array.indexOf(object);

    if (index >= 0) {
        // preserve the last element, then shorten array length by 1 to delete index
        array[index] = array[array.length - 1];
        array.pop();
    }
}

export function _removeFromArray<T>(array: T[], object: T) {
    const index = array.indexOf(object);

    if (index >= 0) {
        array.splice(index, 1);
    }
}

export function _removeAllFromUnorderedArray<T>(array: T[], toRemove: T[]) {
    for (let i = 0; i < toRemove.length; i++) {
        _removeFromUnorderedArray(array, toRemove[i]);
    }
}

export function _removeAllFromArray<T>(array: T[], toRemove: T[]) {
    for (let i = 0; i < toRemove.length; i++) {
        _removeFromArray(array, toRemove[i]);
    }
}

export function _insertIntoArray<T>(array: T[], object: T, toIndex: number) {
    array.splice(toIndex, 0, object);
}

export function _insertArrayIntoArray<T>(dest: T[], src: T[], toIndex: number) {
    if (dest == null || src == null) {
        return;
    }

    // put items in backwards, otherwise inserted items end up in reverse order
    for (let i = src.length - 1; i >= 0; i--) {
        const item = src[i];
        _insertIntoArray(dest, item, toIndex);
    }
}

export function _moveInArray<T>(array: T[], objectsToMove: T[], toIndex: number) {
    // first take out items from the array
    _removeAllFromArray(array, objectsToMove);

    // now add the objects, in same order as provided to us, that means we start at the end
    // as the objects will be pushed to the right as they are inserted
    objectsToMove
        .slice()
        .reverse()
        .forEach((obj) => _insertIntoArray(array, obj, toIndex));
}

export function _includes<T>(array: T[], value: T): boolean {
    return array.indexOf(value) > -1;
}

export function _flatten<T>(arrayOfArrays: (T | T[])[]): T[] {
    return arrayOfArrays?.flatMap((t) => t) ?? [];
}

export function _pushAll<T>(target: T[], source: T[]): void {
    if (source == null || target == null) {
        return;
    }

    source.forEach((value) => target.push(value));
}

export function _forEachReverse<T>(list: T[], action: (value: T, index: number) => void): void {
    if (list == null) {
        return;
    }

    for (let i = list.length - 1; i >= 0; i--) {
        action(list[i], i);
    }
}

export function _some<T>(iterator: Iterable<T>, predicate: (item: T) => boolean): boolean {
    for (const item of iterator) {
        if (predicate(item)) {
            return true;
        }
    }
    return false;
}

export function _find<T>(iterator: Iterable<T>, predicate: (item: T) => boolean): T | undefined {
    for (const item of iterator) {
        if (predicate(item)) {
            return item;
        }
    }
    return undefined;
}
