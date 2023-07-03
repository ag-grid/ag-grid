import number from './number.mjs';
import color from './color.mjs';
import { Color } from '../util/color.mjs';
export default function (a, b) {
    const t = typeof b;
    let c;
    if (t === 'number') {
        return number(a, b);
    }
    if (t === 'string') {
        try {
            c = Color.fromString(b);
            b = c;
            return color(a, b);
        }
        catch (e) {
            // Error-case handled below.
        }
    }
    throw new Error('Unable to interpolate values');
}
