import { Path } from './path';
import { BBox } from '../bbox';
import { Path2D } from '../path2D';
export declare class Rect extends Path {
    static className: string;
    readonly borderPath: Path2D;
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
    private borderClipPath?;
    constructor();
    private updateGradientInstance;
    private lastUpdatePathStrokeWidth;
    protected isDirtyPath(): boolean;
    private effectiveStrokeWidth;
    /**
     * When the rectangle's width or height is less than a pixel
     * and crisp mode is on, the rectangle will still fit into the pixel,
     * but will be less opaque to make an effect of holding less space.
     */
    private microPixelEffectOpacity;
    updatePath(): void;
    computeBBox(): BBox;
    isPointInPath(x: number, y: number): boolean;
    private renderRect;
}
