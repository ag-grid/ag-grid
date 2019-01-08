import {Node} from "../node";
import {chainObjects} from "../../util/object";

// TODO: Should we call this class `Path`?
// `Text` sprite will also have basic attributes like `fillStyle`, `strokeStyle`
// and `opacity`, but the `Shape` isn't a proper base class for `Text`.
// Move the `render` method here and make `Rect` and `Arc` only supply the
// `updatePath` method.
export abstract class Shape extends Node {
    /**
     * Defaults for certain properties.
     * Can be used to reset to the original styling after some custom styling
     * has been applied (using the `restoreOwnDefaults` and `restoreAllDefaults` methods).
     * These static defaults are meant to be inherited by subclasses.
     */
    protected static defaults = chainObjects({}, {
        fillStyle: 'none',
        strokeStyle: 'none',
        lineWidth: 1,
        opacity: 1
    });

    /**
     * Restores the defaults introduced by this subclass.
     */
    restoreOwnDefaults() {
        const defaults = (this.constructor as any).defaults;

        for (const property in defaults) {
            if (defaults.hasOwnProperty(property)) {
                (this as any)[property] = defaults[property];
            }
        }
    }

    restoreAllDefaults() {
        const defaults = (this.constructor as any).defaults;

        for (const property in defaults) {
            (this as any)[property] = defaults[property];
        }
    }

    /**
     * Restores the base class defaults that have been overridden by this subclass.
     */
    restoreOverriddenDefaults() {
        const defaults = (this.constructor as any).defaults;
        const protoDefaults = Object.getPrototypeOf(defaults);

        for (const property in defaults) {
            if (defaults.hasOwnProperty(property) && protoDefaults.hasOwnProperty(property)) {
                (this as any)[property] = defaults[property];
            }
        }
    }

    private _fillStyle: string = Shape.defaults.fillStyle; //| CanvasGradient | CanvasPattern;
    set fillStyle(value: string) {
        this._fillStyle = value;
        this.dirty = true;
    }
    get fillStyle(): string {
        return this._fillStyle;
    }

    private _strokeStyle: string = Shape.defaults.strokeStyle;
    set strokeStyle(value: string) {
        this._strokeStyle = value;
        this.dirty = true;
    }
    get strokeStyle(): string {
        return this._strokeStyle;
    }

    private _lineWidth: number = Shape.defaults.lineWidth;
    set lineWidth(value: number) {
        this._lineWidth = value;
        this.dirty = true;
    }
    get lineWidth(): number {
        return this._lineWidth;
    }

    private _opacity: number = Shape.defaults.opacity;
    set opacity(value: number) {
        this._opacity = value;
        this.dirty = true;
    }
    get opacity(): number {
        return this._opacity;
    }

    applyContextAttributes(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.fillStyle;
        ctx.strokeStyle = this.strokeStyle;
        ctx.lineWidth = this.lineWidth;
        ctx.globalAlpha = this.opacity;
    }

    abstract isPointInPath(ctx: CanvasRenderingContext2D, x: number, y: number): boolean
    abstract isPointInStroke(ctx: CanvasRenderingContext2D, x: number, y: number): boolean
}
