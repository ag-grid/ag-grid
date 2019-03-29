export function isEqual(a: number, b: number, epsilon: number = 1e-10) {
    return Math.abs(a - b) < epsilon;
}
