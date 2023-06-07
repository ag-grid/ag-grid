var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Node, RedrawType, SceneChangeDetection } from '../node';
import { LinearGradient } from '../gradient/linearGradient';
const LINEAR_GRADIENT_REGEXP = /^linear-gradient\((.*?)deg,\s*(.*?)\s*\)$/i;
export class Shape extends Node {
    constructor() {
        super(...arguments);
        this.lastInstanceId = 0;
        this.fillOpacity = 1;
        this.strokeOpacity = 1;
        this.fill = Shape.defaultStyles.fill;
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
        this.stroke = Shape.defaultStyles.stroke;
        this.strokeWidth = Shape.defaultStyles.strokeWidth;
        this.lineDash = Shape.defaultStyles.lineDash;
        this.lineDashOffset = Shape.defaultStyles.lineDashOffset;
        this.lineCap = Shape.defaultStyles.lineCap;
        this.lineJoin = Shape.defaultStyles.lineJoin;
        this.opacity = Shape.defaultStyles.opacity;
        this.fillShadow = Shape.defaultStyles.fillShadow;
    }
    /**
     * Creates a light-weight instance of the given shape (that serves as a template).
     * The created instance only stores the properites set on the instance itself
     * and the rest of the properties come via the prototype chain from the template.
     * This can greatly reduce memory usage in cases where one has many similar shapes,
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
            if (Object.prototype.hasOwnProperty.call(styles, property) &&
                Object.prototype.hasOwnProperty.call(protoStyles, property)) {
                this[property] = styles[property];
            }
        }
    }
    updateGradient() {
        const { fill } = this;
        let linearGradientMatch;
        if ((fill === null || fill === void 0 ? void 0 : fill.startsWith('linear-gradient')) && (linearGradientMatch = LINEAR_GRADIENT_REGEXP.exec(fill))) {
            const angle = parseFloat(linearGradientMatch[1]);
            const colors = [];
            const colorsPart = linearGradientMatch[2];
            const colorRegex = /(#[0-9a-f]+)|(rgba?\(.+?\))|([a-z]+)/gi;
            let c;
            while ((c = colorRegex.exec(colorsPart))) {
                colors.push(c[0]);
            }
            this.gradient = new LinearGradient();
            this.gradient.angle = angle;
            this.gradient.stops = colors.map((color, index) => {
                const offset = index / (colors.length - 1);
                return { offset, color };
            });
        }
        else {
            this.gradient = undefined;
        }
    }
    /**
     * Returns a device-pixel aligned coordinate (or length if length is supplied).
     *
     * NOTE: Not suitable for strokes, since the stroke needs to be offset to the middle
     * of a device pixel.
     */
    align(start, length) {
        var _a, _b, _c;
        const pixelRatio = (_c = (_b = (_a = this.layerManager) === null || _a === void 0 ? void 0 : _a.canvas) === null || _b === void 0 ? void 0 : _b.pixelRatio) !== null && _c !== void 0 ? _c : 1;
        const alignedStart = Math.round(start * pixelRatio) / pixelRatio;
        if (length == undefined) {
            return alignedStart;
        }
        if (length === 0) {
            return 0;
        }
        if (length < 1) {
            // Avoid hiding crisp shapes
            return Math.ceil(length * pixelRatio) / pixelRatio;
        }
        // Account for the rounding of alignedStart by increasing length to compensate before
        // alignment.
        return Math.round((length + start) * pixelRatio) / pixelRatio - alignedStart;
    }
    fillStroke(ctx) {
        this.renderFill(ctx);
        this.renderStroke(ctx);
    }
    renderFill(ctx) {
        if (this.fill) {
            const { globalAlpha } = ctx;
            this.applyFill(ctx);
            this.applyFillAlpha(ctx);
            this.applyShadow(ctx);
            ctx.fill();
            ctx.globalAlpha = globalAlpha;
        }
        ctx.shadowColor = 'rgba(0, 0, 0, 0)';
    }
    applyFill(ctx) {
        if (this.gradient) {
            ctx.fillStyle = this.gradient.createGradient(ctx, this.computeBBox());
        }
        else {
            ctx.fillStyle = this.fill;
        }
    }
    applyFillAlpha(ctx) {
        const { globalAlpha } = ctx;
        ctx.globalAlpha = globalAlpha * this.opacity * this.fillOpacity;
    }
    applyShadow(ctx) {
        var _a, _b;
        // The canvas context scaling (depends on the device's pixel ratio)
        // has no effect on shadows, so we have to account for the pixel ratio
        // manually here.
        const pixelRatio = (_b = (_a = this.layerManager) === null || _a === void 0 ? void 0 : _a.canvas.pixelRatio) !== null && _b !== void 0 ? _b : 1;
        const fillShadow = this.fillShadow;
        if (fillShadow === null || fillShadow === void 0 ? void 0 : fillShadow.enabled) {
            ctx.shadowColor = fillShadow.color;
            ctx.shadowOffsetX = fillShadow.xOffset * pixelRatio;
            ctx.shadowOffsetY = fillShadow.yOffset * pixelRatio;
            ctx.shadowBlur = fillShadow.blur * pixelRatio;
        }
    }
    renderStroke(ctx) {
        if (this.stroke && this.strokeWidth) {
            const { globalAlpha } = ctx;
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
            ctx.stroke();
            ctx.globalAlpha = globalAlpha;
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
Shape.defaultStyles = Object.assign({}, {
    fill: 'black',
    stroke: undefined,
    strokeWidth: 0,
    lineDash: undefined,
    lineDashOffset: 0,
    lineCap: undefined,
    lineJoin: undefined,
    opacity: 1,
    fillShadow: undefined,
});
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MINOR })
], Shape.prototype, "fillOpacity", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MINOR })
], Shape.prototype, "strokeOpacity", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MINOR, changeCb: (s) => s.updateGradient() })
], Shape.prototype, "fill", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MINOR })
], Shape.prototype, "stroke", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MINOR })
], Shape.prototype, "strokeWidth", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MINOR })
], Shape.prototype, "lineDash", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MINOR })
], Shape.prototype, "lineDashOffset", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MINOR })
], Shape.prototype, "lineCap", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MINOR })
], Shape.prototype, "lineJoin", void 0);
__decorate([
    SceneChangeDetection({
        redraw: RedrawType.MINOR,
        convertor: (v) => Math.min(1, Math.max(0, v)),
    })
], Shape.prototype, "opacity", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MINOR, checkDirtyOnAssignment: true })
], Shape.prototype, "fillShadow", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvc2NlbmUvc2hhcGUvc2hhcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFFakUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBVzVELE1BQU0sc0JBQXNCLEdBQUcsNENBQTRDLENBQUM7QUFFNUUsTUFBTSxPQUFnQixLQUFNLFNBQVEsSUFBSTtJQUF4Qzs7UUF1QlksbUJBQWMsR0FBRyxDQUFDLENBQUM7UUFvRTNCLGdCQUFXLEdBQVcsQ0FBQyxDQUFDO1FBR3hCLGtCQUFhLEdBQVcsQ0FBQyxDQUFDO1FBRzFCLFNBQUksR0FBdUIsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUM7UUE0QnBEOzs7Ozs7Ozs7V0FTRztRQUVILFdBQU0sR0FBdUIsS0FBSyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUM7UUFHeEQsZ0JBQVcsR0FBVyxLQUFLLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQztRQStCdEQsYUFBUSxHQUF5QixLQUFLLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQztRQUc5RCxtQkFBYyxHQUFXLEtBQUssQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDO1FBRzVELFlBQU8sR0FBa0IsS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7UUFHckQsYUFBUSxHQUFtQixLQUFLLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQztRQU14RCxZQUFPLEdBQVcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7UUFHOUMsZUFBVSxHQUEyQixLQUFLLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQztJQTRFeEUsQ0FBQztJQXZRRzs7Ozs7Ozs7Ozs7Ozs7T0FjRztJQUNILE1BQU0sQ0FBQyxjQUFjLENBQWtCLFFBQVc7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