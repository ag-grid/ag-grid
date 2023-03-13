export function areArrayItemsStrictlyEqual<T>(arrA: T[], arrB: T[]): boolean {
    return (
        arrA.length === arrB.length &&
        arrA.every((a, i) => {
            const b = arrB[i];
            if (Array.isArray(a) && Array.isArray(b)) {
                return areArrayItemsStrictlyEqual(a, b);
            }
            return a === b;
        })
    );
}

export function areArrayNumbersEqual<T>(arrA: T[], arrB: T[]) {
    return arrA.length === arrB.length && arrA.every((item, i) => Number(item) === Number(arrB[i]));
}
