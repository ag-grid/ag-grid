import {Node} from "../node";
import {chainObjects} from "../../util/object";
import {DropShadow} from "../dropShadow";

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
        lineWidth: 1 as number,
        opacity: 1 as number,
        shadow: null as DropShadow | null
    });

    static isShape(node: any): node is Shape {
        return node ? (node as Shape).restoreOwnStyles !== undefined : false;
    }

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
            (this as any)[key] += styles[key];
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

    abstract isPointInPath(x: number, y: number): boolean
    abstract isPointInStroke(x: number, y: number): boolean
}
