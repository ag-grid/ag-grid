import constant from "./constant";
import number from "./number";
import date from "./date";

export default function(a: any, b: any): (t: number) => any {
    const t = typeof b;

    if (b == null || t === 'boolean') {
        return constant(b);
    }

    if (t === 'number') {
        return number(a, b);
    }

    if (b instanceof Date) {
        return date(a, b);
    }

    return number(a, b);
}
