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

export function isNumber(n: any): boolean {
    const type = typeof n;
    if (type === 'string') {
        return false;
    } else if (type !== 'number') {
        return false;
    }
    return n - n < 1;;
}