var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
import { normalizeAngle360 } from '../util/angle';
import { cubicRoots } from './polyRoots';
/**
 * Returns the intersection point for the given pair of line segments, or null,
 * if the segments are parallel or don't intersect.
 * Based on http://paulbourke.net/geometry/pointlineplane/
 */
export function segmentIntersection(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
    var d = (ax2 - ax1) * (by2 - by1) - (ay2 - ay1) * (bx2 - bx1);
    if (d === 0) {
        // The lines are parallel.
        return null;
    }
    var ua = ((bx2 - bx1) * (ay1 - by1) - (ax1 - bx1) * (by2 - by1)) / d;
    var ub = ((ax2 - ax1) * (ay1 - by1) - (ay2 - ay1) * (ax1 - bx1)) / d;
    if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
        return {
            x: ax1 + ua * (ax2 - ax1),
            y: ay1 + ua * (ay2 - ay1),
        };
    }
    return null; // The intersection point is outside either or both segments.
}
/**
 * Returns intersection points of the given cubic curve and the line segment.
 * Takes in x/y components of cubic control points and line segment start/end points
 * as parameters.
 */
export function cubicSegmentIntersections(px1, py1, px2, py2, px3, py3, px4, py4, x1, y1, x2, y2) {
    var e_1, _a;
    var intersections = [];
    // Find line equation coefficients.
    var A = y1 - y2;
    var B = x2 - x1;
    var C = x1 * (y2 - y1) - y1 * (x2 - x1);
    // Find cubic Bezier curve equation coefficients from control points.
    var bx = bezierCoefficients(px1, px2, px3, px4);
    var by = bezierCoefficients(py1, py2, py3, py4);
    var a = A * bx[0] + B * by[0]; // t^3
    var b = A * bx[1] + B * by[1]; // t^2
    var c = A * bx[2] + B * by[2]; // t
    var d = A * bx[3] + B * by[3] + C; // 1
    var roots = cubicRoots(a, b, c, d);
    try {
        // Verify that the roots are within bounds of the linear segment.
        for (var roots_1 = __values(roots), roots_1_1 = roots_1.next(); !roots_1_1.done; roots_1_1 = roots_1.next()) {
            var t = roots_1_1.value;
            var tt = t * t;
            var ttt = t * tt;
            // Find the cartesian plane coordinates for the parametric root `t`.
            var x = bx[0] * ttt + bx[1] * tt + bx[2] * t + bx[3];
            var y = by[0] * ttt + by[1] * tt + by[2] * t + by[3];
            // The parametric cubic roots we found are intersection points
            // with an infinite line, and so the x/y coordinates above are as well.
            // Make sure the x/y is also within the bounds of the given segment.
            var s = void 0;
            if (x1 !== x2) {
                s = (x - x1) / (x2 - x1);
            }
            else {
                // the line is vertical
                s = (y - y1) / (y2 - y1);
            }
            if (s >= 0 && s <= 1) {
                intersections.push({ x: x, y: y });
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (roots_1_1 && !roots_1_1.done && (_a = roots_1.return)) _a.call(roots_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return intersections;
}
/**
 * Returns the given coordinates vector multiplied by the coefficient matrix
 * of the parametric cubic Bézier equation.
 */
function bezierCoefficients(P1, P2, P3, P4) {
    return [
        // Bézier expressed as matrix operations:
        -P1 + 3 * P2 - 3 * P3 + P4,
        3 * P1 - 6 * P2 + 3 * P3,
        -3 * P1 + 3 * P2,
        P1,
    ];
}
/**
 * Returns intersection points of the arc and the line segment.
 * Takes in arc parameters and line segment start/end points.
 */
export function arcIntersections(cx, cy, r, startAngle, endAngle, counterClockwise, x1, y1, x2, y2) {
    // Solving the quadratic equation:
    // 1. y = k * x + y0
    // 2. (x - cx)^2 + (y - cy)^2 = r^2
    var k = (y2 - y1) / (x2 - x1);
    var y0 = y1 - k * x1;
    var a = Math.pow(k, 2) + 1;
    var b = 2 * (k * (y0 - cy) - cx);
    var c = Math.pow(cx, 2) + Math.pow(y0 - cy, 2) - Math.pow(r, 2);
    var d = Math.pow(b, 2) - 4 * a * c;
    if (d < 0) {
        return [];
    }
    var i1x = (-b + Math.sqrt(d)) / 2 / a;
    var i2x = (-b - Math.sqrt(d)) / 2 / a;
    var intersections = [];
    [i1x, i2x].forEach(function (x) {
        var isXInsideLine = x >= Math.min(x1, x2) && x <= Math.max(x1, x2);
        if (!isXInsideLine) {
            return;
        }
        var y = k * x;
        var a1 = normalizeAngle360(counterClockwise ? endAngle : startAngle);
        var a2 = normalizeAngle360(counterClockwise ? startAngle : endAngle);
        var intersectionAngle = normalizeAngle360(Math.atan2(y, x));
        // Order angles clockwise after the start angle
        // (end angle if counter-clockwise)
        if (a2 <= a1) {
            a2 += 2 * Math.PI;
        }
        if (intersectionAngle < a1) {
            intersectionAngle += 2 * Math.PI;
        }
        if (intersectionAngle >= a1 && intersectionAngle <= a2) {
            intersections.push({ x: x, y: y });
        }
    });
    return intersections;
}
