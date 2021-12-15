import { Comparator } from "../interfaces";

export class DefaultComparator<T extends number | string | Date> implements Comparator<T> {
    public compare(a: T, b: T): number {
        if (a === b) { return 0; }

        return a < b ? 1 : -1;
    }
}

export const DEFAULT_COMPARATOR = new DefaultComparator();
