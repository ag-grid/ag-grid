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
    private _x1;
    set x1(value: number);
    get x1(): number;
    private _y1;
    set y1(value: number);
    get y1(): number;
    private _x2;
    set x2(value: number);
    get x2(): number;
    private _y2;
    set y2(value: number);
    get y2(): number;
    computeBBox(): BBox;
    isPointInPath(x: number, y: number): boolean;
    isPointInStroke(x: number, y: number): boolean;
    render(ctx: CanvasRenderingContext2D): void;
}
