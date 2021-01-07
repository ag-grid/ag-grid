import constant from "./constant";
import number from "./number";
import date from "./date";
import array from "./array";
import object from "./object";
import color from "./color";
import { Color } from "../util/color";

export default function (a: any, b: any): (t: number) => any {
    const t = typeof b;
    let c: Color;

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
        } catch (e) {
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

    if (typeof b.valueOf !== 'function' && typeof b.toString !== 'function' || isNaN(b)) {
        return object(a, b);
    }

    return number(a, b);

    // return b == null || t === 'boolean' ? constant(b)
    //     : (t === 'number' ? number
    //         : t === 'string' ? ((c = Color.fromString(b)) ? (b = c, rgb) : string)
    //             : b instanceof color ? rgb
    //                 : b instanceof Date ? date
    //                     : Array.isArray(b) ? array
    //                         : typeof b.valueOf !== 'function' && typeof b.toString !== 'function' || isNaN(b) ? object
    //                             : number)(a, b);
}
