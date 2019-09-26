// ag-grid-enterprise v21.2.2
import { Shape } from "./shape";
import { Path2D } from "../path2D";
import { BBox } from "../bbox";
export declare enum RectSizing {
    Content = 0,
    Border = 1
}
export declare class Rect extends Shape {
    static className: string;
    static create(x: number, y: number, width: number, height: number, radius?: number): Rect;
    protected path: Path2D;
    private _dirtyPath;
    dirtyPath: boolean;
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
    /**
     * If `true`, the rect is aligned to the pixel grid for crisp looking lines.
     * Animated rects may not look nice with this option enabled, for example
     * when a rect is translated by a sub-pixel value on each frame.
     */
    private _crisp;
    crisp: boolean;
    private effectiveStrokeWidth;
    strokeWidth: number;
    private _sizing;
    sizing: RectSizing;
    updatePath(): void;
    readonly getBBox: () => BBox;
    isPointInPath(x: number, y: number): boolean;
    isPointInStroke(x: number, y: number): boolean;
    render(ctx: CanvasRenderingContext2D): void;
    protected fillStroke(ctx: CanvasRenderingContext2D): void;
}
