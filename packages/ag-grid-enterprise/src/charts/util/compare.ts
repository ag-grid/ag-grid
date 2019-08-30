export type Comparator<T> = (a: T, b: T) => number;

export function naturalOrder(a: number, b: number): number {
    return a - b;
}
