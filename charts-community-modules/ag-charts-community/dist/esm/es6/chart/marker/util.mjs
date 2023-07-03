import { Square } from './square.mjs';
import { Circle } from './circle.mjs';
import { Cross } from './cross.mjs';
import { Diamond } from './diamond.mjs';
import { Heart } from './heart.mjs';
import { Plus } from './plus.mjs';
import { Triangle } from './triangle.mjs';
// This function is in its own file because putting it into SeriesMarker makes the Legend
// suddenly aware of the series (it's an agnostic component), and putting it into Marker
// introduces circular dependencies.
export function getMarker(shape = Square) {
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
