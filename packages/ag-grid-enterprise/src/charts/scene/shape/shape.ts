import {Node} from "../node";
import {chainObjects} from "../../util/object";

// TODO: Should we call this class `Path`?
// `Text` sprite will also have basic attributes like `fillStyle`, `strokeStyle`
// and `opacity`, but the `Shape` isn't a proper base class for `Text`.
// Move the `render` method here and make `Rect` and `Arc` only supply the
// `updatePath` method.
export abstract class Shape extends Node {
    /**
     * Defaults for style properties. Note that properties that affect the position
     * and shape of the node are not considered style properties, for example:
     * `x`, `y`, `width`, `height`, `radius`, `rotation`, etc.
     * Can be used to reset to the original styling after some custom styling
     * has been applied (using the `restoreOwnStyles` and `restoreAllStyles` methods).
     * These static defaults are meant to be inherited by subclasses.
     */
    protected static defaultStyles = chainObjects({}, {
        fillStyle: 'black',
        strokeStyle: null,
        lineWidth: 1,
        opacity: 1,
        shadowColor: 'rgba(0, 0, 0, 0)',
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0
    });

    /**
     * Restores the default styles introduced by this subclass.
     */
    restoreOwnStyles() {
        const styles = (this.constructor as any).defaultStyles;

        for (const property in styles) {
            if (styles.hasOwnProperty(property)) {
                (this as any)[property] = styles[property];
            }
        }
    }

    restoreAllStyles() {
        const styles = (this.constructor as any).defaultStyles;

        for (const property in styles) {
            (this as any)[property] = styles[property];
        }
    }

    /**
     * Restores the base class default styles that have been overridden by this subclass.
     */
    restoreOverriddenStyles() {
        const styles = (this.constructor as any).defaultStyles;
        const protoStyles = Object.getPrototypeOf(styles);

        for (const property in styles) {
            if (styles.hasOwnProperty(property) && protoStyles.hasOwnProperty(property)) {
                (this as any)[property] = styles[property];
            }
        }
    }

    private _fillStyle: string | null = Shape.defaultStyles.fillStyle; //| CanvasGradient | CanvasPattern;
    set fillStyle(value: string | null) {
        if (this._fillStyle !== value) {
            this._fillStyle = value;
            this.dirty = true;
        }
    }
    get fillStyle(): string | null {
        return this._fillStyle;
    }

    private _strokeStyle: string | null = Shape.defaultStyles.strokeStyle;
    set strokeStyle(value: string | null) {
        if (this._strokeStyle !== value) {
            this._strokeStyle = value;
            this.dirty = true;
        }
    }
    get strokeStyle(): string | null {
        return this._strokeStyle;
    }

    private _lineWidth: number = Shape.defaultStyles.lineWidth;
    set lineWidth(value: number) {
        if (this._lineWidth !== value) {
            this._lineWidth = value;
            this.dirty = true;
        }
    }
    get lineWidth(): number {
        return this._lineWidth;
    }

    private _opacity: number = Shape.defaultStyles.opacity;
    set opacity(value: number) {
        if (this._opacity !== value) {
            this._opacity = value;
            this.dirty = true;
        }
    }
    get opacity(): number {
        return this._opacity;
    }

    private _shadowColor: string = Shape.defaultStyles.shadowColor;
    set shadowColor(value: string) {
        if (this._shadowColor !== value) {
            this._shadowColor = value;
            this.dirty = true;
        }
    }
    get shadowColor(): string {
        return this._shadowColor;
    }

    private _shadowBlur: number = Shape.defaultStyles.shadowBlur;
    set shadowBlur(value: number) {
        if (this._shadowBlur !== value) {
            this._shadowBlur = value;
            this.dirty = true;
        }
    }
    get shadowBlur(): number {
        return this._shadowBlur;
    }

    private _shadowOffsetX: number = Shape.defaultStyles.shadowOffsetX;
    set shadowOffsetX(value: number) {
        if (this._shadowOffsetX !== value) {
            this._shadowOffsetX = value;
            this.dirty = true;
        }
    }
    get shadowOffsetX(): number {
        return this._shadowOffsetX;
    }

    private _shadowOffsetY: number = Shape.defaultStyles.shadowOffsetY;
    set shadowOffsetY(value: number) {
        if (this._shadowOffsetY !== value) {
            this._shadowOffsetY = value;
            this.dirty = true;
        }
    }
    get shadowOffsetY(): number {
        return this._shadowOffsetY;
    }

    applyContextAttributes(ctx: CanvasRenderingContext2D) {
        if (this.fillStyle) {
            ctx.fillStyle = this.fillStyle;
        }
        if (this.strokeStyle) {
            ctx.strokeStyle = this.strokeStyle;
        }
        ctx.lineWidth = this.lineWidth;
        ctx.globalAlpha = this.opacity;
        ctx.shadowColor = this.shadowColor;
        ctx.shadowBlur = this.shadowBlur;
        ctx.shadowOffsetX = this.shadowOffsetX;
        ctx.shadowOffsetY = this.shadowOffsetY;
    }

    abstract isPointInPath(x: number, y: number): boolean
    abstract isPointInStroke(x: number, y: number): boolean
}
