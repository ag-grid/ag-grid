import number from "./number";
import { Color } from "../util/color";
export default function (a, b) {
    if (typeof a === 'string') {
        try {
            a = Color.fromString(a);
        }
        catch (e) {
            a = Color.fromArray([0, 0, 0]);
        }
    }
    if (typeof b === 'string') {
        try {
            b = Color.fromString(b);
        }
        catch (e) {
            b = Color.fromArray([0, 0, 0]);
        }
    }
    var red = number(a.r, b.r);
    var green = number(a.g, b.g);
    var blue = number(a.b, b.b);
    var alpha = number(a.a, b.a);
    return function (t) {
        return Color.fromArray([red(t), green(t), blue(t), alpha(t)]).toRgbaString();
    };
}
