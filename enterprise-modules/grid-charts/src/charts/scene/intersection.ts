import { cubicRoots } from "./polyRoots";

/**
 * Returns the intersection point for the given pair of line segments, or null,
 * if the segments are parallel or don't intersect.
 * Based on http://paulbourke.net/geometry/pointlineplane/
 */
export function segmentIntersection(ax1: number, ay1: number, ax2: number, ay2: number,
                                    bx1: number, by1: number, bx2: number, by2: number): { x: number, y: number } | null {
    const d = (ax2 - ax1) * (by2 - by1) - (ay2 - ay1) * (bx2 - bx1);

    if (d === 0) { // The lines are parallel.
        return null;
    }

    const ua = ((bx2 - bx1) * (ay1 - by1) - (ax1 - bx1) * (by2 - by1)) / d;
    const ub = ((ax2 - ax1) * (ay1 - by1) - (ay2 - ay1) * (ax1 - bx1)) / d;

    if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
        return {
            x: ax1 + ua * (ax2 - ax1),
            y: ay1 + ua * (ay2 - ay1)
        };
    }

    return null; // The intersection point is outside either or both segments.
}

/**
 * Returns intersection points of the given cubic curve and the line segment.
 * Takes in x/y components of cubic control points and line segment start/end points
 * as parameters.
 */
export function cubicSegmentIntersections(
    px1: number, py1: number, px2: number, py2: number,
    px3: number, py3: number, px4: number, py4: number,
    x1: number, y1: number, x2: number, y2: number): { x: number, y: number }[] {

    const intersections: { x: number, y: number }[] = [];

    // Find line equation coefficients.
    const A = y1 - y2;
    const B = x2 - x1;
    const C = x1 * (y2 - y1) - y1 * (x2 - x1);

    // Find cubic Bezier curve equation coefficients from control points.
    const bx = bezierCoefficients(px1, px2, px3, px4);
    const by = bezierCoefficients(py1, py2, py3, py4);

    const a = A * bx[0] + B * by[0];     // t^3
    const b = A * bx[1] + B * by[1];     // t^2
    const c = A * bx[2] + B * by[2];     // t
    const d = A * bx[3] + B * by[3] + C; // 1

    const roots = cubicRoots(a, b, c, d);

    // Verify that the roots are within bounds of the linear segment.
    for (let i = 0; i < roots.length; i++) {
        const t = roots[i];
        const tt = t * t;
        const ttt = t * tt;

        // Find the cartesian plane coordinates for the parametric root `t`.
        const x = bx[0] * ttt + bx[1] * tt + bx[2] * t + bx[3];
        const y = by[0] * ttt + by[1] * tt + by[2] * t + by[3];

        // The parametric cubic roots we found are intersection points
        // with an infinite line, and so the x/y coordinates above are as well.
        // Make sure the x/y is also within the bounds of the given segment.
        let s: number;
        if (x1 !== x2) {
            s = (x - x1) / (x2 - x1);
        } else { // the line is vertical
            s = (y - y1) / (y2 - y1);
        }
        if (s >= 0 && s <= 1) {
            intersections.push({x, y});
        }
    }
    return intersections;
}

/**
 * Returns the given coordinates vector multiplied by the coefficient matrix
 * of the parametric cubic Bézier equation.
 */
export function bezierCoefficients(P1: number, P2: number, P3: number, P4: number) {
    return [                         // Bézier expressed as matrix operations:
        -P1 + 3 * P2 - 3 * P3 + P4,  //                 |-1  3 -3  1| |P1|
        3 * P1 - 6 * P2 + 3 * P3,    //   [t^3 t^2 t 1] | 3 -6  3  0| |P2|
        -3 * P1 + 3 * P2,            //                 |-3  3  0  0| |P3|
        P1                           //                 | 1  0  0  0| |P4|
    ];
}
