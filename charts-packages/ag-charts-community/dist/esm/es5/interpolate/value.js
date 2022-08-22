import constant from './constant';
import number from './number';
import date from './date';
import array from './array';
import object from './object';
import color from './color';
import { Color } from '../util/color';
export default function (a, b) {
    var t = typeof b;
    var c;
    if (b == null || t === 'boolean') {
        return constant(b);
    }
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
            // return string(a, b);
        }
    }
    if (b instanceof Color) {
        return color(a, b);
    }
    if (b instanceof Date) {
        return date(a, b);
    }
    if (Array.isArray(b)) {
        return array(a, b);
    }
    if ((typeof b.valueOf !== 'function' && typeof b.toString !== 'function') || isNaN(b)) {
        return object(a, b);
    }
    return number(a, b);
}
