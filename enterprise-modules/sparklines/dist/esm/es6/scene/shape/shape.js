import { Node } from "../node";
import { chainObjects } from "../../util/object";
export class Shape extends Node {
    constructor() {
        super(...arguments);
        this.lastInstanceId = 0;
        this._fillOpacity = 1;
        this._strokeOpacity = 1;
        this._fill = Shape.defaultStyles.fill;
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
        this._stroke = Shape.defaultStyles.stroke;
        this._strokeWidth = Shape.defaultStyles.strokeWidth;
        this._lineDash = Shape.defaultStyles.lineDash;
        this._lineDashOffset = Shape.defaultStyles.lineDashOffset;
        this._lineCap = Shape.defaultStyles.lineCap;
        this._lineJoin = Shape.defaultStyles.lineJoin;
        this._opacity = Shape.defaultStyles.opacity;
        this.onShadowChange = () => {
            this.dirty = true;
        };
        this._fillShadow = Shape.defaultStyles.fillShadow;
        this._strokeShadow = Shape.defaultStyles.strokeShadow;
    }
    /**
     * Creates a light-weight instance of the given shape (that serves as a template).
     * The created instance only stores the properites set on the instance itself
     * and the rest of the properties come via the prototype chain from the template.
     * This can greatly reduce memory usage in cases where one has many simular shapes,
     * for example, circles of different size, position and color. The exact memory usage
     * reduction will depend on the size of the template and the number of own properties
     * set on its lightweight instances, but will typically be around an order of magnitude
     * or more.
     *
     * Note: template shapes are not supposed to be part of the scene graph (they should not
     * have a parent).
     *
     * @param template
     */
    static createInstance(template) {
        const shape = Object.create(template);
        shape._setParent(undefined);
        shape.id = template.id + '-Instance-' + String(++template.lastInstanceId);
        return shape;
    }
    /**
     * Restores the default styles introduced by this subclass.
     */
    restoreOwnStyles() {
        const styles = this.constructor.defaultStyles;
        const keys = Object.getOwnPropertyNames(styles);
        // getOwnPropertyNames is about 2.5 times faster than
        // for..in with the hasOwnProperty check and in this
        // case, where most properties are inherited, can be
        // more then an order of magnitude faster.
        for (let i = 0, n = keys.length; i < n; i++) {
            const key = keys[i];
            this[key] = styles[key];
        }
    }
    restoreAllStyles() {
        const styles = this.constructor.defaultStyles;
        for (const property in styles) {
            this[property] = styles[property];
        }
    }
    /**
     * Restores the base class default styles that have been overridden by this subclass.
     */
    restoreOverriddenStyles() {
        const styles = this.constructor.defaultStyles;
        const protoStyles = Object.getPrototypeOf(styles);
        for (const property in styles) {
            if (styles.hasOwnProperty(property) && protoStyles.hasOwnProperty(property)) {
                this[property] = styles[property];
            }
        }
    }
    set fillOpacity(value) {
        if (this._fillOpacity !== value) {
            this._fillOpacity = value;
            this.dirty = true;
        }
    }
    get fillOpacity() {
        return this._fillOpacity;
    }
    set strokeOpacity(value) {
        if (this._strokeOpacity !== value) {
            this._strokeOpacity = value;
            this.dirty = true;
        }
    }
    get strokeOpacity() {
        return this._strokeOpacity;
    }
    set fill(value) {
        if (this._fill !== value) {
            this._fill = value;
            this.dirty = true;
        }
    }
    get fill() {
        return this._fill;
    }
    set stroke(value) {
        if (this._stroke !== value) {
            this._stroke = value;
            this.dirty = true;
        }
    }
    get stroke() {
        return this._stroke;
    }
    set strokeWidth(value) {
        if (this._strokeWidth !== value) {
            this._strokeWidth = value;
            this.dirty = true;
        }
    }
    get strokeWidth() {
        return this._strokeWidth;
    }
    // An offset value to align to the pixel grid.
    get alignment() {
        return Math.floor(this.strokeWidth) % 2 / 2;
    }
    // Returns the aligned `start` or `length` value.
    // For example: `start` could be `y` and `length` could be `height` of a rectangle.
    align(alignment, start, length) {
        if (length != undefined) {
            return Math.floor(length) + Math.floor(start % 1 + length % 1);
        }
        return Math.floor(start) + alignment;
    }
    set lineDash(value) {
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
    get lineDash() {
        return this._lineDash;
    }
    set lineDashOffset(value) {
        if (this._lineDashOffset !== value) {
            this._lineDashOffset = value;
            this.dirty = true;
        }
    }
    get lineDashOffset() {
        return this._lineDashOffset;
    }
    set lineCap(value) {
        if (this._lineCap !== value) {
            this._lineCap = value;
            this.dirty = true;
        }
    }
    get lineCap() {
        return this._lineCap;
    }
    set lineJoin(value) {
        if (this._lineJoin !== value) {
            this._lineJoin = value;
            this.dirty = true;
        }
    }
    get lineJoin() {
        return this._lineJoin;
    }
    set opacity(value) {
        value = Math.min(1, Math.max(0, value));
        if (this._opacity !== value) {
            this._opacity = value;
            this.dirty = true;
        }
    }
    get opacity() {
        return this._opacity;
    }
    set fillShadow(value) {
        const oldValue = this._fillShadow;
        if (oldValue !== value) {
            if (oldValue) {
                oldValue.removeEventListener('change', this.onShadowChange);
            }
            if (value) {
                value.addEventListener('change', this.onShadowChange);
            }
            this._fillShadow = value;
            this.dirty = true;
        }
    }
    get fillShadow() {
        return this._fillShadow;
    }
    set strokeShadow(value) {
        const oldValue = this._strokeShadow;
        if (oldValue !== value) {
            if (oldValue) {
                oldValue.removeEventListener('change', this.onShadowChange);
            }
            if (value) {
                value.addEventListener('change', this.onShadowChange);
            }
            this._strokeShadow = value;
            this.dirty = true;
        }
    }
    get strokeShadow() {
        return this._strokeShadow;
    }
    fillStroke(ctx) {
        if (!this.scene) {
            return;
        }
        const pixelRatio = this.scene.canvas.pixelRatio || 1;
        const { globalAlpha } = ctx;
        if (this.fill) {
            ctx.fillStyle = this.fill;
            ctx.globalAlpha = globalAlpha * this.opacity * this.fillOpacity;
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
            ctx.globalAlpha = globalAlpha * this.opacity * this.strokeOpacity;
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
    containsPoint(x, y) {
        return this.isPointInPath(x, y);
    }
}
/**
 * Defaults for style properties. Note that properties that affect the position
 * and shape of the node are not considered style properties, for example:
 * `x`, `y`, `width`, `height`, `radius`, `rotation`, etc.
 * Can be used to reset to the original styling after some custom styling
 * has been applied (using the `restoreOwnStyles` and `restoreAllStyles` methods).
 * These static defaults are meant to be inherited by subclasses.
 */
Shape.defaultStyles = chainObjects({}, {
    fill: 'black',
    stroke: undefined,
    strokeWidth: 0,
    lineDash: undefined,
    lineDashOffset: 0,
    lineCap: undefined,
    lineJoin: undefined,
    opacity: 1,
    fillShadow: undefined,
    strokeShadow: undefined
});
