// ag-grid-enterprise v20.2.0
import { Shape } from "./shape";
import { PixelSnapBias } from "../../canvas/canvas";
export declare class Line extends Shape {
    protected static defaultStyles: {
        fillStyle: string | null;
        strokeStyle: string | null;
        lineWidth: number;
        lineDash: number[] | null;
        lineDashOffset: number;
        lineCap: import("./shape").ShapeLineCap;
        lineJoin: import("./shape").ShapeLineJoin;
        opacity: number;
        shadow: import("../dropShadow").DropShadow | null;
    } & {
        lineWidth: number;
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
    readonly getBBox: any;
    private _pixelSnapBias;
    pixelSnapBias: PixelSnapBias;
    isPointInPath(x: number, y: number): boolean;
    isPointInStroke(x: number, y: number): boolean;
    render(ctx: CanvasRenderingContext2D): void;
}
