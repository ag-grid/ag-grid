import constant from "./constant";
import number from "./number";
import date from "./date";
import array from "./array";
import object from "./object";
export default function (a, b) {
    var t = typeof b;
    // let c;
    return b == null || t === 'boolean' ? constant(b)
        : (t === 'number' ? number
            // : t === 'string' ? ((c = color(b)) ? (b = c, rgb) : string)
            //     : b instanceof color ? rgb
            : b instanceof Date ? date
                : Array.isArray(b) ? array
                    : typeof b.valueOf !== 'function' && typeof b.toString !== 'function' || isNaN(b) ? object
                        : number)(a, b);
}
