// ag-grid-enterprise v21.2.2
import { Shape } from "./shape";
import { BBox } from "../bbox";
export declare class Line extends Shape {
    static className: string;
    protected static defaultStyles: {
        fill: string;
        stroke: undefined;
        strokeWidth: number;
        lineDash: undefined;
        lineDashOffset: number;
        lineCap: import("./shape").ShapeLineCap;
        lineJoin: import("./shape").ShapeLineJoin;
        opacity: number;
        fillShadow: undefined;
        strokeShadow: undefined;
    } & {
        fill: undefined;
        strokeWidth: number;
    };
    constructor();
    static create(x1: number, y1: number, x2: number, y2: number): Line;
    private _x1;
    x1: number;
    private _y1;
    y1: number;
    private _x2;
    x2: number;
    private _y2;
    y2: number;
    readonly getBBox: () => BBox;
    isPointInPath(x: number, y: number): boolean;
    isPointInStroke(x: number, y: number): boolean;
    render(ctx: CanvasRenderingContext2D): void;
}
