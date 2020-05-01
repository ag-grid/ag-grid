import { Path } from "./path";
import { BBox } from "../bbox";
export declare enum ArcType {
    Open = 0,
    Chord = 1,
    Round = 2
}
/**
 * Elliptical arc node.
 */
export declare class Arc extends Path {
    static className: string;
    protected static defaultStyles: {
        fill: string;
        stroke: any;
        strokeWidth: number;
        lineDash: any;
        lineDashOffset: number;
        lineCap: import("./shape").ShapeLineCap;
        lineJoin: import("./shape").ShapeLineJoin;
        opacity: number;
        fillShadow: any;
        strokeShadow: any;
    } & {
        lineWidth: number;
        fillStyle: any;
    };
    constructor();
    private _centerX;
    centerX: number;
    private _centerY;
    centerY: number;
    private _radiusX;
    radiusX: number;
    private _radiusY;
    radiusY: number;
    private _startAngle;
    startAngle: number;
    private _endAngle;
    endAngle: number;
    private readonly fullPie;
    private _counterClockwise;
    counterClockwise: boolean;
    /**
     * The type of arc to render:
     * - {@link ArcType.Open} - end points of the arc segment are not connected (default)
     * - {@link ArcType.Chord} - end points of the arc segment are connected by a line segment
     * - {@link ArcType.Round} - each of the end points of the arc segment are connected
     *                           to the center of the arc
     * Arcs with {@link ArcType.Open} do not support hit testing, even if they have their
     * {@link Shape.fillStyle} set, because they are not closed paths. Hit testing support
     * would require using two paths - one for rendering, another for hit testing - and there
     * doesn't seem to be a compelling reason to do that, when one can just use {@link ArcType.Chord}
     * to create a closed path.
     */
    private _type;
    type: ArcType;
    updatePath(): void;
    computeBBox(): BBox;
    isPointInPath(x: number, y: number): boolean;
}
