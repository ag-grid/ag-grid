import { Path } from "./path";
import { BBox } from "../bbox";
export declare enum RectSizing {
    Content = 0,
    Border = 1
}
export declare class Rect extends Path {
    static className: string;
    x: number;
    y: number;
    width: number;
    height: number;
    radius: number;
    /**
     * If `true`, the rect is aligned to the pixel grid for crisp looking lines.
     * Animated rects may not look nice with this option enabled, for example
     * when a rect is translated by a sub-pixel value on each frame.
     */
    crisp: boolean;
    gradient: boolean;
    private gradientFill?;
    private gradientInstance?;
    private updateGradientInstance;
    /**
     * Similar to https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing
     */
    sizing: RectSizing;
    private lastUpdatePathStrokeWidth;
    protected isDirtyPath(): boolean;
    private effectiveStrokeWidth;
    protected updatePath(): void;
    computeBBox(): BBox;
    isPointInPath(x: number, y: number): boolean;
    protected fillStroke(ctx: CanvasRenderingContext2D): void;
}
