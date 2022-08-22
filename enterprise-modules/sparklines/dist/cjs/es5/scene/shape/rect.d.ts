import { Path } from "./path";
import { BBox } from "../bbox";
export declare enum RectSizing {
    Content = 0,
    Border = 1
}
export declare class Rect extends Path {
    static className: string;
    private _x;
    set x(value: number);
    get x(): number;
    private _y;
    set y(value: number);
    get y(): number;
    private _width;
    set width(value: number);
    get width(): number;
    private _height;
    set height(value: number);
    get height(): number;
    private _radius;
    set radius(value: number);
    get radius(): number;
    /**
     * If `true`, the rect is aligned to the pixel grid for crisp looking lines.
     * Animated rects may not look nice with this option enabled, for example
     * when a rect is translated by a sub-pixel value on each frame.
     */
    private _crisp;
    set crisp(value: boolean);
    get crisp(): boolean;
    private _gradient;
    set gradient(value: boolean);
    get gradient(): boolean;
    private gradientInstance?;
    private updateGradientInstance;
    set fill(value: string | undefined);
    get fill(): string | undefined;
    private effectiveStrokeWidth;
    set strokeWidth(value: number);
    get strokeWidth(): number;
    /**
     * Similar to https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing
     */
    private _sizing;
    set sizing(value: RectSizing);
    get sizing(): RectSizing;
    protected updatePath(): void;
    computeBBox(): BBox;
    isPointInPath(x: number, y: number): boolean;
    isPointInStroke(x: number, y: number): boolean;
    protected fillStroke(ctx: CanvasRenderingContext2D): void;
}
