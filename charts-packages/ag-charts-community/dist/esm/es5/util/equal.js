export function areArrayItemsStrictlyEqual(arrA, arrB) {
    return arrA.length === arrB.length && arrA.every(function (item, i) { return item === arrB[i]; });
}
