export function areArrayItemsStrictlyEqual<T>(arrA: T[], arrB: T[]) {
    return arrA.length === arrB.length && arrA.every((item, i) => item === arrB[i]);
}
