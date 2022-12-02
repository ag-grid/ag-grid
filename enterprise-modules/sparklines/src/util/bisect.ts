import { ascending } from "./compare";

export function complexBisectRight<T, U>(list: T[], x: U, map: (item: T) => U, lo: number = 0, hi: number = list.length): number {
    const comparator = ascendingComparator(map);
    while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (comparator(list[mid], x) < 0) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    return lo;
}

function ascendingComparator<T, U>(map: (item: T) => U) {
    return function(item: T, x: U) {
        return ascending(map(item), x);
    };
}
