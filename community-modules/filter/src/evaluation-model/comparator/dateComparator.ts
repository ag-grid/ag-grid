import { Comparator, ComparatorResult } from "../interfaces";
import { DEFAULT_COMPARATOR } from "./defaultComparator";

function formatDate(date: Date | null): string {
    if (date == null) { return ''; }
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().padStart(4, '0');
    return `${year}/${month}/${day}`;
}

export class DateComparator implements Comparator<Date> {
    public compare(a: Date, b: Date): ComparatorResult {
        if (a === b) { return 0; }

        return DEFAULT_COMPARATOR.compare(formatDate(a), formatDate(b));
    }
}

export const DATE_COMPARATOR = new DateComparator();
