// ag-grid-enterprise v20.1.0
import { Node } from "./node";
import { Path2D } from "./path2D";
export declare class ClipRect extends Node {
    protected path: Path2D;
    isPointInNode(x: number, y: number): boolean;
    private _isActive;
    isActive: boolean;
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
    updatePath(): void;
    render(ctx: CanvasRenderingContext2D): void;
}
