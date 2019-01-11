// ag-grid-enterprise v20.0.0
import { Shape } from "./shape";
import { Path } from "../path";
export declare class Rect extends Shape {
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
        width: number;
        height: number;
        radius: number;
    };
    constructor();
    protected path: Path;
    _x: number;
    x: number;
    _y: number;
    y: number;
    _width: number;
    width: number;
    _height: number;
    height: number;
    _radius: number;
    radius: number;
    updatePath(): void;
    isPointInPath(ctx: CanvasRenderingContext2D, x: number, y: number): boolean;
    isPointInStroke(ctx: CanvasRenderingContext2D, x: number, y: number): boolean;
    render(ctx: CanvasRenderingContext2D): void;
}
