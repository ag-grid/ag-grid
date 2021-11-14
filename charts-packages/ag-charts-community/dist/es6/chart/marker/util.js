import { Square } from "./square";
import { Circle } from "./circle";
import { Cross } from "./cross";
import { Diamond } from "./diamond";
import { Heart } from "./heart";
import { Plus } from "./plus";
import { Triangle } from "./triangle";
// This function is in its own file because putting it into SeriesMarker makes the Legend
// suddenly aware of the series (it's an agnostic component), and putting it into Marker
// introduces circular dependencies.
export function getMarker(shape) {
    if (shape === void 0) { shape = Square; }
    if (typeof shape === 'string') {
        switch (shape) {
            case 'circle':
                return Circle;
            case 'cross':
                return Cross;
            case 'diamond':
                return Diamond;
            case 'heart':
                return Heart;
            case 'plus':
                return Plus;
            case 'triangle':
                return Triangle;
            default:
                return Square;
        }
    }
    if (typeof shape === 'function') {
        return shape;
    }
    return Square;
}
