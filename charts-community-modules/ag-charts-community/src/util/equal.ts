export function areArrayItemsStrictlyEqual<T>(arrA: T[], arrB: T[]) {
    return arrA.length === arrB.length && arrA.every((item, i) => item === arrB[i]);
}

export function areArrayNumbersEqual<T>(arrA: T[], arrB: T[]) {
    return arrA.length === arrB.length && arrA.every((item, i) => Number(item) === Number(arrB[i]));
}
