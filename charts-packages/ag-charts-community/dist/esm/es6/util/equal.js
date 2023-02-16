export function areArrayItemsStrictlyEqual(arrA, arrB) {
    return arrA.length === arrB.length && arrA.every((item, i) => item === arrB[i]);
}
