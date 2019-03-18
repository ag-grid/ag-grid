import {Node} from "../node";
import {chainObjects} from "../../util/object";
import {DropShadow} from "../dropShadow";

export type ShapeLineCap = null | 'round' | 'square';  // null is for 'butt'
export type ShapeLineJoin = null | 'round' | 'bevel';  // null is for 'miter'

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
        fillStyle: 'black' as string | null,
        strokeStyle: null as string | null,
        lineWidth: 0,
        lineDash: null as number[] | null,
        lineDashOffset: 0,
        lineCap: null as ShapeLineCap,
        lineJoin: null as ShapeLineJoin,
        opacity: 1,
        shadow: null as DropShadow | null
    });

    /**
     * Restores the default styles introduced by this subclass.
     */
    protected restoreOwnStyles() {
        const styles = (this.constructor as any).defaultStyles;
        const keys = Object.getOwnPropertyNames(styles);

        // getOwnPropertyNames is about 2.5 times faster than
        // for..in with the hasOwnProperty check and in this
        // case, where most properties are inherited, can be
        // more then an order of magnitude faster.
        for (let i = 0, n = keys.length; i < n; i++) {
            const key = keys[i];
            (this as any)[key] = styles[key];
        }
    }

    protected restoreAllStyles() {
        const styles = (this.constructor as any).defaultStyles;

        for (const property in styles) {
            (this as any)[property] = styles[property];
        }
    }

    /**
     * Restores the base class default styles that have been overridden by this subclass.
     */
    protected restoreOverriddenStyles() {
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

    protected _lineWidth: number = Shape.defaultStyles.lineWidth;
    set lineWidth(value: number) {
        if (this._lineWidth !== value) {
            this._lineWidth = value;
            this.dirty = true;
        }
    }
    get lineWidth(): number {
        return this._lineWidth;
    }

    private _lineDash: number[] | null = Shape.defaultStyles.lineDash;
    set lineDash(value: number[] | null) {
        const oldValue = this._lineDash;

        if (oldValue !== value) {
            if (oldValue && value && oldValue.length === value.length) {
                let identical = true;
                const n = value.length;
                for (let i = 0; i < n; i++) {
                    if (oldValue[i] !== value[i]) {
                        identical = false;
                        break;
                    }
                }
                if (identical) {
                    return;
                }
            }
            this._lineDash = value;
            this.dirty = true;
        }
    }
    get lineDash(): number[] | null {
        return this._lineDash;
    }

    private _lineDashOffset: number = Shape.defaultStyles.lineDashOffset;
    set lineDashOffset(value: number) {
        if (this._lineDashOffset !== value) {
            this._lineDashOffset = value;
            this.dirty = true;
        }
    }
    get lineDashOffset(): number {
        return this._lineDashOffset;
    }

    private _lineCap: ShapeLineCap = Shape.defaultStyles.lineCap;
    set lineCap(value: ShapeLineCap) {
        if (this._lineCap !== value) {
            this._lineCap = value;
            this.dirty = true;
        }
    }
    get lineCap(): ShapeLineCap {
        return this._lineCap;
    }

    private _lineJoin: ShapeLineJoin = Shape.defaultStyles.lineJoin;
    set lineJoin(value: ShapeLineJoin) {
        if (this._lineJoin !== value) {
            this._lineJoin = value;
            this.dirty = true;
        }
    }
    get lineJoin(): ShapeLineJoin {
        return this._lineJoin;
    }

    private _opacity: number = Shape.defaultStyles.opacity;
    set opacity(value: number) {
        value = Math.min(1, Math.max(0, value));
        if (this._opacity !== value) {
            this._opacity = value;
            this.dirty = true;
        }
    }
    get opacity(): number {
        return this._opacity;
    }

    private _shadow: DropShadow | null = Shape.defaultStyles.shadow;
    set shadow(value: DropShadow | null) {
        if (this._shadow !== value) {
            this._shadow = value;
            this.dirty = true;
        }
    }
    get shadow(): DropShadow | null {
        return this._shadow;
    }

    applyContextAttributes(ctx: CanvasRenderingContext2D) {
        if (this.fillStyle) {
            ctx.fillStyle = this.fillStyle;
        }
        if (this.strokeStyle) {
            ctx.strokeStyle = this.strokeStyle;
            ctx.lineWidth = this.lineWidth;
            if (this.lineDash) {
                ctx.setLineDash(this.lineDash);
            }
            if (this.lineDashOffset) {
                ctx.lineDashOffset = this.lineDashOffset;
            }
            if (this.lineCap) {
                ctx.lineCap = this.lineCap;
            }
            if (this.lineJoin) {
                ctx.lineJoin = this.lineJoin;
            }
        }
        if (this.opacity < 1) {
            ctx.globalAlpha = this.opacity;
        }

        const shadow = this.shadow;
        if (shadow) {
            ctx.shadowColor = shadow.color;
            ctx.shadowOffsetX = shadow.offset.x;
            ctx.shadowOffsetY = shadow.offset.y;
            ctx.shadowBlur = shadow.blur;
        }
    }

    isPointInNode(x: number, y: number): boolean {
        return this.isPointInPath(x, y);
    }

    abstract isPointInPath(x: number, y: number): boolean
    abstract isPointInStroke(x: number, y: number): boolean
}
