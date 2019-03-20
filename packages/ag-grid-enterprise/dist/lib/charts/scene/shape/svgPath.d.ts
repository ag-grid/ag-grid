// ag-grid-enterprise v20.2.0
import { Shape } from "./shape";
import { Path2D } from "../path2D";
export declare class SvgPath extends Shape {
    protected path2d: Path2D;
    private _path;
    path: string;
    isPointInPath(x: number, y: number): boolean;
    isPointInStroke(x: number, y: number): boolean;
    render(ctx: CanvasRenderingContext2D): void;
}
