export function areArrayItemsStrictlyEqual(arrA, arrB) {
    return (arrA.length === arrB.length &&
        arrA.every(function (a, i) {
            var b = arrB[i];
            if (Array.isArray(a) && Array.isArray(b)) {
                return areArrayItemsStrictlyEqual(a, b);
            }
            return a === b;
        }));
}
export function areArrayNumbersEqual(arrA, arrB) {
    return arrA.length === arrB.length && arrA.every(function (item, i) { return Number(item) === Number(arrB[i]); });
}
