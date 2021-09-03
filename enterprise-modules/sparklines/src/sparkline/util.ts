import { Circle } from "./circle";
import { Diamond } from "./diamond";
import { Square } from "./square";

export function getMarkerShape(shape: string) {
    switch (shape) {
        case 'circle':
            return Circle;
        case 'square':
            return Square;
        case 'diamond':
            return Diamond;
        default:
            return Circle;
    }
}

// Simplified version of https://github.com/plotly/fast-isnumeric
// that doesn't treat number strings with leading/trailing whitespace as numbers.
export function isNumber(n: any): boolean {
    const type = typeof n;
    if (type === 'string') {
        return false;
    } else if (type !== 'number') {
        return false;
    }
    // n - n is going to be:
    // - zero, for any finite number
    // -  NaN, for NaN, Infinity, -Infinity
    return n - n < 1;
}