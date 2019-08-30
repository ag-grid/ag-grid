import { Node } from "../node";
import { chainObjects } from "../../util/object";
import { DropShadow } from "../dropShadow";

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
        fill: 'black',
        stroke: undefined,
        strokeWidth: 0,
        lineDash: undefined,
        lineDashOffset: 0,
        lineCap: null as ShapeLineCap,
        lineJoin: null as ShapeLineJoin,
        opacity: 1,
        fillShadow: undefined,
        strokeShadow: undefined
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

    private _fillOpacity: number = 1;
    set fillOpacity(value: number) {
        if (this._fillOpacity !== value) {
            this._fillOpacity = value;
            this.dirty = true;
        }
    }
    get fillOpacity(): number {
        return this._fillOpacity;
    }

    private _strokeOpacity: number = 1;
    set strokeOpacity(value: number) {
        if (this._strokeOpacity !== value) {
            this._strokeOpacity = value;
            this.dirty = true;
        }
    }
    get strokeOpacity(): number {
        return this._strokeOpacity;
    }

    private _fill: string | undefined = Shape.defaultStyles.fill; //| CanvasGradient | CanvasPattern;
    set fill(value: string | undefined) {
        if (this._fill !== value) {
            this._fill = value;
            this.dirty = true;
        }
    }
    get fill(): string | undefined {
        return this._fill;
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
    private _stroke: string | undefined = Shape.defaultStyles.stroke;
    set stroke(value: string | undefined) {
        if (this._stroke !== value) {
            this._stroke = value;
            this.dirty = true;
        }
    }
    get stroke(): string | undefined {
        return this._stroke;
    }

    protected _strokeWidth: number = Shape.defaultStyles.strokeWidth;
    set strokeWidth(value: number) {
        if (this._strokeWidth !== value) {
            this._strokeWidth = value;
            this.dirty = true;
        }
    }
    get strokeWidth(): number {
        return this._strokeWidth;
    }

    private _lineDash: number[] | undefined = Shape.defaultStyles.lineDash;
    set lineDash(value: number[] | undefined) {
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
    get lineDash(): number[] | undefined {
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

    private _fillShadow: DropShadow | undefined = Shape.defaultStyles.fillShadow;
    set fillShadow(value: DropShadow | undefined) {
        const fillShadow = this._fillShadow;
        if (fillShadow !== value) {
            if (fillShadow) {
                fillShadow.onChange = undefined;
            }
            if (value) {
                value.onChange = () => this.dirty = true;
            }
            this._fillShadow = value;
            this.dirty = true;
        }
    }
    get fillShadow(): DropShadow | undefined {
        return this._fillShadow;
    }

    private _strokeShadow: DropShadow | undefined = Shape.defaultStyles.strokeShadow;
    set strokeShadow(value: DropShadow | undefined) {
        const strokeShadow = this._strokeShadow;
        if (strokeShadow !== value) {
            if (strokeShadow) {
                strokeShadow.onChange = undefined;
            }
            if (value) {
                value.onChange = () => this.dirty = true;
            }
            this._strokeShadow = value;
            this.dirty = true;
        }
    }
    get strokeShadow(): DropShadow | undefined {
        return this._strokeShadow;
    }

    protected fillStroke(ctx: CanvasRenderingContext2D) {
        if (!this.scene) {
            return;
        }

        const pixelRatio = this.scene.canvas.pixelRatio || 1;

        if (this.fill) {
            ctx.fillStyle = this.fill;
            ctx.globalAlpha = this.opacity * this.fillOpacity;

            // The canvas context scaling (depends on the device's pixel ratio)
            // has no effect on shadows, so we have to account for the pixel ratio
            // manually here.
            const fillShadow = this.fillShadow;
            if (fillShadow && fillShadow.enabled) {
                ctx.shadowColor = fillShadow.color;
                ctx.shadowOffsetX = fillShadow.xOffset * pixelRatio;
                ctx.shadowOffsetY = fillShadow.yOffset * pixelRatio;
                ctx.shadowBlur = fillShadow.blur * pixelRatio;
            }
            ctx.fill();
        }

        ctx.shadowColor = 'rgba(0, 0, 0, 0)';

        if (this.stroke && this.strokeWidth) {
            ctx.strokeStyle = this.stroke;
            ctx.globalAlpha = this.opacity * this.strokeOpacity;

            ctx.lineWidth = this.strokeWidth;
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

            const strokeShadow = this.strokeShadow;
            if (strokeShadow && strokeShadow.enabled) {
                ctx.shadowColor = strokeShadow.color;
                ctx.shadowOffsetX = strokeShadow.xOffset * pixelRatio;
                ctx.shadowOffsetY = strokeShadow.yOffset * pixelRatio;
                ctx.shadowBlur = strokeShadow.blur * pixelRatio;
            }
            ctx.stroke();
        }
    }

    isPointInNode(x: number, y: number): boolean {
        return this.isPointInPath(x, y);
    }

    abstract isPointInPath(x: number, y: number): boolean;
    abstract isPointInStroke(x: number, y: number): boolean;
}
