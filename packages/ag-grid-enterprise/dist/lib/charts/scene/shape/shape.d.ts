// ag-grid-enterprise v20.1.0
import { Node } from "../node";
import { DropShadow } from "../dropShadow";
export declare type ShapeLineCap = null | 'round' | 'square';
export declare type ShapeLineJoin = null | 'round' | 'bevel';
export declare abstract class Shape extends Node {
    /**
     * Defaults for style properties. Note that properties that affect the position
     * and shape of the node are not considered style properties, for example:
     * `x`, `y`, `width`, `height`, `radius`, `rotation`, etc.
     * Can be used to reset to the original styling after some custom styling
     * has been applied (using the `restoreOwnStyles` and `restoreAllStyles` methods).
     * These static defaults are meant to be inherited by subclasses.
     */
    protected static defaultStyles: {
        fillStyle: string | null;
        strokeStyle: string | null;
        lineWidth: number;
        lineDash: number[] | null;
        lineDashOffset: number;
        lineCap: ShapeLineCap;
        lineJoin: ShapeLineJoin;
        opacity: number;
        shadow: DropShadow | null;
    };
    /**
     * Restores the default styles introduced by this subclass.
     */
    protected restoreOwnStyles(): void;
    protected restoreAllStyles(): void;
    /**
     * Restores the base class default styles that have been overridden by this subclass.
     */
    protected restoreOverriddenStyles(): void;
    private _fillStyle;
    fillStyle: string | null;
    private _strokeStyle;
    strokeStyle: string | null;
    private _lineWidth;
    lineWidth: number;
    private _lineDash;
    lineDash: number[] | null;
    private _lineDashOffset;
    lineDashOffset: number;
    private _lineCap;
    lineCap: ShapeLineCap;
    private _lineJoin;
    lineJoin: ShapeLineJoin;
    private _opacity;
    opacity: number;
    private _shadow;
    shadow: DropShadow | null;
    applyContextAttributes(ctx: CanvasRenderingContext2D): void;
    isPointInNode(x: number, y: number): boolean;
    abstract isPointInPath(x: number, y: number): boolean;
    abstract isPointInStroke(x: number, y: number): boolean;
}
