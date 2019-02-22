// ag-grid-enterprise v20.1.0
import { Shape } from "./shape";
import { Path2D } from "../path2D";
export declare class Rect extends Shape {
    static create(x: number, y: number, width: number, height: number, radius?: number): Rect;
    protected path: Path2D;
    private _isDirtyPath;
    isDirtyPath: boolean;
    private _x;
    x: number;
    private _y;
    y: number;
    private _width;
    width: number;
    private _height;
    height: number;
    private _radius;
    radius: number;
    updatePath(): void;
    readonly getBBox: () => {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    isPointInPath(x: number, y: number): boolean;
    isPointInStroke(x: number, y: number): boolean;
    render(ctx: CanvasRenderingContext2D): void;
}
