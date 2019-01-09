// ag-grid-enterprise v20.0.0
import { Node } from "../node";
export declare abstract class Shape extends Node {
    /**
     * Defaults for certain properties.
     * Can be used to reset to the original styling after some custom styling
     * has been applied (using the `restoreOwnDefaults` and `restoreAllDefaults` methods).
     * These static defaults are meant to be inherited by subclasses.
     */
    protected static defaults: {
        fillStyle: string;
        strokeStyle: string;
        lineWidth: number;
        opacity: number;
    };
    /**
     * Restores the defaults introduced by this subclass.
     */
    restoreOwnDefaults(): void;
    restoreAllDefaults(): void;
    /**
     * Restores the base class defaults that have been overridden by this subclass.
     */
    restoreOverriddenDefaults(): void;
    private _fillStyle;
    fillStyle: string;
    private _strokeStyle;
    strokeStyle: string;
    private _lineWidth;
    lineWidth: number;
    private _opacity;
    opacity: number;
    applyContextAttributes(ctx: CanvasRenderingContext2D): void;
    abstract isPointInPath(ctx: CanvasRenderingContext2D, x: number, y: number): boolean;
    abstract isPointInStroke(ctx: CanvasRenderingContext2D, x: number, y: number): boolean;
}
