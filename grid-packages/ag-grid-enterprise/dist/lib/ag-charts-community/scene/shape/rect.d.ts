import { BBox } from '../bbox';
import { Path2D } from '../path2D';
import { Path } from './path';
export declare class Rect extends Path {
    static className: string;
    readonly borderPath: Path2D;
    x: number;
    y: number;
    width: number;
    height: number;
    topLeftCornerRadius: number;
    topRightCornerRadius: number;
    bottomRightCornerRadius: number;
    bottomLeftCornerRadius: number;
    set cornerRadius(cornerRadius: number);
    cornerRadiusBbox?: BBox;
    /**
     * If `true`, the rect is aligned to the pixel grid for crisp looking lines.
     * Animated rects may not look nice with this option enabled, for example
     * when a rect is translated by a sub-pixel value on each frame.
     */
    crisp: boolean;
    private borderClipPath?;
    private lastUpdatePathStrokeWidth;
    protected isDirtyPath(): boolean;
    private effectiveStrokeWidth;
    /**
     * When the rectangle's width or height is less than a pixel
     * and crisp mode is on, the rectangle will still fit into the pixel,
     * but will be less opaque to make an effect of holding less space.
     */
    protected microPixelEffectOpacity: number;
    updatePath(): void;
    computeBBox(): BBox;
    isPointInPath(x: number, y: number): boolean;
    protected applyFillAlpha(ctx: CanvasRenderingContext2D): void;
    protected renderStroke(ctx: CanvasRenderingContext2D): void;
}
