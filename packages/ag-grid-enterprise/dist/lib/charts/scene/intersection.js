// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var polyRoots_1 = require("./polyRoots");
/**
 * Returns the intersection point for the given pair of line segments, or null,
 * if the segments are parallel or don't intersect.
 * Based on http://paulbourke.net/geometry/pointlineplane/
 */
function segmentIntersection(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
    var d = (ax2 - ax1) * (by2 - by1) - (ay2 - ay1) * (bx2 - bx1);
    if (d === 0) { // The lines are parallel.
        return null;
    }
    var ua = ((bx2 - bx1) * (ay1 - by1) - (ax1 - bx1) * (by2 - by1)) / d;
    var ub = ((ax2 - ax1) * (ay1 - by1) - (ay2 - ay1) * (ax1 - bx1)) / d;
    if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
        return {
            x: ax1 + ua * (ax2 - ax1),
            y: ay1 + ua * (ay2 - ay1)
        };
    }
    return null; // The intersection point is outside either or both segments.
}
exports.segmentIntersection = segmentIntersection;
/**
 * Returns intersection points of the given cubic curve and the line segment.
 * Takes in x/y components of cubic control points and line segment start/end points
 * as parameters.
 */
function cubicSegmentIntersections(px1, py1, px2, py2, px3, py3, px4, py4, x1, y1, x2, y2) {
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
    var roots = polyRoots_1.cubicRoots(a, b, c, d);
    // Verify that the roots are within bounds of the linear segment.
    for (var i = 0; i < roots.length; i++) {
        var t = roots[i];
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
        else { // the line is vertical
            s = (y - y1) / (y2 - y1);
        }
        if (s >= 0 && s <= 1) {
            intersections.push({ x: x, y: y });
        }
    }
    return intersections;
}
exports.cubicSegmentIntersections = cubicSegmentIntersections;
/**
 * Returns the given coordinates vector multiplied by the coefficient matrix
 * of the parametric cubic Bézier equation.
 */
function bezierCoefficients(P1, P2, P3, P4) {
    return [
        -P1 + 3 * P2 - 3 * P3 + P4,
        3 * P1 - 6 * P2 + 3 * P3,
        -3 * P1 + 3 * P2,
        P1 //                 | 1  0  0  0| |P4|
    ];
}
exports.bezierCoefficients = bezierCoefficients;
