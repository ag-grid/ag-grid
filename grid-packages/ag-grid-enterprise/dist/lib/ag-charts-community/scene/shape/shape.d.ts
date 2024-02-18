import type { DropShadow } from '../dropShadow';
import { LinearGradient } from '../gradient/linearGradient';
import { Node } from '../node';
export type ShapeLineCap = 'butt' | 'round' | 'square';
type ShapeLineJoin = 'round' | 'bevel' | 'miter';
type CanvasContext = CanvasFillStrokeStyles & CanvasCompositing & CanvasShadowStyles & CanvasPathDrawingStyles & CanvasDrawPath;
export declare abstract class Shape extends Node {
    /**
     * Defaults for style properties. Note that properties that affect the position
     * and shape of the node are not considered style properties, for example:
     * `x`, `y`, `width`, `height`, `radius`, `rotation`, etc.
     * Can be used to reset to the original styling after some custom styling
     * has been applied (using the `restoreOwnStyles` method).
     * These static defaults are meant to be inherited by subclasses.
     */
    protected static defaultStyles: {
        fill: string;
        stroke: undefined;
        strokeWidth: number;
        lineDash: undefined;
        lineDashOffset: number;
        lineCap: undefined;
        lineJoin: undefined;
        opacity: number;
        fillShadow: undefined;
    };
    /**
     * Restores the default styles introduced by this subclass.
     */
    protected restoreOwnStyles(): void;
    fillOpacity: number;
    strokeOpacity: number;
    fill: string | undefined;
    protected updateGradient(): void;
    protected gradient: LinearGradient | undefined;
    /**
     * Note that `strokeStyle = null` means invisible stroke,
     * while `lineWidth = 0` means no stroke, and sometimes this can mean different things.
     * For example, a rect shape with an invisible stroke may not align to the pixel grid
     * properly because the stroke affects the rules of alignment, and arc shapes forming
     * a pie chart will have a gap between them if they have an invisible stroke, whereas
     * there would be not gap if there was no stroke at all.
     * The preferred way of making the stroke invisible is setting the `lineWidth` to zero,
     * unless specific looks that is achieved by having an invisible stroke is desired.
     */
    stroke: string | undefined;
    strokeWidth: number;
    /**
     * Returns a device-pixel aligned coordinate (or length if length is supplied).
     *
     * NOTE: Not suitable for strokes, since the stroke needs to be offset to the middle
     * of a device pixel.
     */
    align(start: number, length?: number): number;
    lineDash: number[] | undefined;
    lineDashOffset: number;
    lineCap?: ShapeLineCap;
    lineJoin?: ShapeLineJoin;
    opacity: number;
    fillShadow: DropShadow | undefined;
    protected fillStroke(ctx: CanvasContext): void;
    protected renderFill(ctx: CanvasContext): void;
    protected applyFill(ctx: CanvasContext): void;
    protected applyFillAlpha(ctx: CanvasContext): void;
    protected applyShadow(ctx: CanvasContext): void;
    protected renderStroke(ctx: CanvasContext): void;
    containsPoint(x: number, y: number): boolean;
    abstract isPointInPath(x: number, y: number): boolean;
}
export {};
