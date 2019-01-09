// ag-grid-enterprise v20.0.0
import { Shape } from "./shape";
import { Path } from "../path";
export declare class Arc extends Shape {
    protected static defaults: {
        fillStyle: string;
        strokeStyle: string;
        lineWidth: number;
        opacity: number;
    } & {
        fillStyle: string;
        strokeStyle: string;
        x: number;
        y: number;
        radius: number;
        startAngle: number;
        endAngle: number;
        anticlockwise: boolean;
    };
    constructor();
    protected path: Path;
    private _x;
    x: number;
    private _y;
    y: number;
    private _radius;
    radius: number;
    private _startAngle;
    startAngle: number;
    private _endAngle;
    endAngle: number;
    private _anticlockwise;
    anticlockwise: boolean;
    updatePath(): void;
    isPointInPath(ctx: CanvasRenderingContext2D, x: number, y: number): boolean;
    isPointInStroke(ctx: CanvasRenderingContext2D, x: number, y: number): boolean;
    render(ctx: CanvasRenderingContext2D): void;
}
