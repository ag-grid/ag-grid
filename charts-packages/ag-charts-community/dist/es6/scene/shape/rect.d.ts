import { Path } from "./path";
import { BBox } from "../bbox";
export declare enum RectSizing {
    Content = 0,
    Border = 1
}
export declare class Rect extends Path {
    static className: string;
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
    /**
     * Similar to https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing
     */
    private _sizing;
    sizing: RectSizing;
    protected updatePath(): void;
    computeBBox(): BBox;
    isPointInPath(x: number, y: number): boolean;
    isPointInStroke(x: number, y: number): boolean;
    protected fillStroke(ctx: CanvasRenderingContext2D): void;
}
