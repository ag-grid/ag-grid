/**
 * Returns the intersection point for the given pair of line segments, or null,
 * if the segments are parallel or don't intersect.
 * Based on http://paulbourke.net/geometry/pointlineplane/
 */
export declare function segmentIntersection(ax1: number, ay1: number, ax2: number, ay2: number, bx1: number, by1: number, bx2: number, by2: number): {
    x: number;
    y: number;
} | null;
/**
 * Returns intersection points of the given cubic curve and the line segment.
 * Takes in x/y components of cubic control points and line segment start/end points
 * as parameters.
 */
export declare function cubicSegmentIntersections(px1: number, py1: number, px2: number, py2: number, px3: number, py3: number, px4: number, py4: number, x1: number, y1: number, x2: number, y2: number): {
    x: number;
    y: number;
}[];
/**
 * Returns intersection points of the arc and the line segment.
 * Takes in arc parameters and line segment start/end points.
 */
export declare function arcIntersections(cx: number, cy: number, r: number, startAngle: number, endAngle: number, counterClockwise: boolean, x1: number, y1: number, x2: number, y2: number): Array<{
    x: number;
    y: number;
}>;
