import { Comparator } from "./compare";

export function bisect<T>(list: T[], x: T, comparator: Comparator<T>, lo: number = 0, hi: number = list.length): number {
    return bisectRight(list, x, comparator, lo, hi);
}

export function bisectRight<T>(list: T[], x: T, comparator: Comparator<T>, low: number = 0, high: number = list.length): number {
    let lo = low;
    let hi = high;
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (comparator(list[mid], x) > 0) { // list[mid] > x
            hi = mid;
        }
        else {
            lo = mid + 1;
        }
    }
    return lo;
}

export function bisectLeft<T>(list: T[], x: T, comparator: Comparator<T>, low: number = 0, high: number = list.length): number {
    let lo = low;
    let hi = high;
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (comparator(list[mid], x) < 0) { // list[mid] < x
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    return lo;
}
