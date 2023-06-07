var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Node, RedrawType, SceneChangeDetection } from '../node';
import { LinearGradient } from '../gradient/linearGradient';
var LINEAR_GRADIENT_REGEXP = /^linear-gradient\((.*?)deg,\s*(.*?)\s*\)$/i;
var Shape = /** @class */ (function (_super) {
    __extends(Shape, _super);
    function Shape() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.lastInstanceId = 0;
        _this.fillOpacity = 1;
        _this.strokeOpacity = 1;
        _this.fill = Shape.defaultStyles.fill;
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
        _this.stroke = Shape.defaultStyles.stroke;
        _this.strokeWidth = Shape.defaultStyles.strokeWidth;
        _this.lineDash = Shape.defaultStyles.lineDash;
        _this.lineDashOffset = Shape.defaultStyles.lineDashOffset;
        _this.lineCap = Shape.defaultStyles.lineCap;
        _this.lineJoin = Shape.defaultStyles.lineJoin;
        _this.opacity = Shape.defaultStyles.opacity;
        _this.fillShadow = Shape.defaultStyles.fillShadow;
        return _this;
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
    Shape.createInstance = function (template) {
        var shape = Object.create(template);
        shape._setParent(undefined);
        shape.id = template.id + '-Instance-' + String(++template.lastInstanceId);
        return shape;
    };
    /**
     * Restores the default styles introduced by this subclass.
     */
    Shape.prototype.restoreOwnStyles = function () {
        var styles = this.constructor.defaultStyles;
        var keys = Object.getOwnPropertyNames(styles);
        // getOwnPropertyNames is about 2.5 times faster than
        // for..in with the hasOwnProperty check and in this
        // case, where most properties are inherited, can be
        // more then an order of magnitude faster.
        for (var i = 0, n = keys.length; i < n; i++) {
            var key = keys[i];
            this[key] = styles[key];
        }
    };
    Shape.prototype.restoreAllStyles = function () {
        var styles = this.constructor.defaultStyles;
        for (var property in styles) {
            this[property] = styles[property];
        }
    };
    /**
     * Restores the base class default styles that have been overridden by this subclass.
     */
    Shape.prototype.restoreOverriddenStyles = function () {
        var styles = this.constructor.defaultStyles;
        var protoStyles = Object.getPrototypeOf(styles);
        for (var property in styles) {
            if (Object.prototype.hasOwnProperty.call(styles, property) &&
                Object.prototype.hasOwnProperty.call(protoStyles, property)) {
                this[property] = styles[property];
            }
        }
    };
    Shape.prototype.updateGradient = function () {
        var fill = this.fill;
        var linearGradientMatch;
        if ((fill === null || fill === void 0 ? void 0 : fill.startsWith('linear-gradient')) && (linearGradientMatch = LINEAR_GRADIENT_REGEXP.exec(fill))) {
            var angle = parseFloat(linearGradientMatch[1]);
            var colors_1 = [];
            var colorsPart = linearGradientMatch[2];
            var colorRegex = /(#[0-9a-f]+)|(rgba?\(.+?\))|([a-z]+)/gi;
            var c = void 0;
            while ((c = colorRegex.exec(colorsPart))) {
                colors_1.push(c[0]);
            }
            this.gradient = new LinearGradient();
            this.gradient.angle = angle;
            this.gradient.stops = colors_1.map(function (color, index) {
                var offset = index / (colors_1.length - 1);
                return { offset: offset, color: color };
            });
        }
        else {
            this.gradient = undefined;
        }
    };
    /**
     * Returns a device-pixel aligned coordinate (or length if length is supplied).
     *
     * NOTE: Not suitable for strokes, since the stroke needs to be offset to the middle
     * of a device pixel.
     */
    Shape.prototype.align = function (start, length) {
        var _a, _b, _c;
        var pixelRatio = (_c = (_b = (_a = this.layerManager) === null || _a === void 0 ? void 0 : _a.canvas) === null || _b === void 0 ? void 0 : _b.pixelRatio) !== null && _c !== void 0 ? _c : 1;
        var alignedStart = Math.round(start * pixelRatio) / pixelRatio;
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
    };
    Shape.prototype.fillStroke = function (ctx) {
        this.renderFill(ctx);
        this.renderStroke(ctx);
    };
    Shape.prototype.renderFill = function (ctx) {
        if (this.fill) {
            var globalAlpha = ctx.globalAlpha;
            this.applyFill(ctx);
            this.applyFillAlpha(ctx);
            this.applyShadow(ctx);
            ctx.fill();
            ctx.globalAlpha = globalAlpha;
        }
        ctx.shadowColor = 'rgba(0, 0, 0, 0)';
    };
    Shape.prototype.applyFill = function (ctx) {
        if (this.gradient) {
            ctx.fillStyle = this.gradient.createGradient(ctx, this.computeBBox());
        }
        else {
            ctx.fillStyle = this.fill;
        }
    };
    Shape.prototype.applyFillAlpha = function (ctx) {
        var globalAlpha = ctx.globalAlpha;
        ctx.globalAlpha = globalAlpha * this.opacity * this.fillOpacity;
    };
    Shape.prototype.applyShadow = function (ctx) {
        var _a, _b;
        // The canvas context scaling (depends on the device's pixel ratio)
        // has no effect on shadows, so we have to account for the pixel ratio
        // manually here.
        var pixelRatio = (_b = (_a = this.layerManager) === null || _a === void 0 ? void 0 : _a.canvas.pixelRatio) !== null && _b !== void 0 ? _b : 1;
        var fillShadow = this.fillShadow;
        if (fillShadow === null || fillShadow === void 0 ? void 0 : fillShadow.enabled) {
            ctx.shadowColor = fillShadow.color;
            ctx.shadowOffsetX = fillShadow.xOffset * pixelRatio;
            ctx.shadowOffsetY = fillShadow.yOffset * pixelRatio;
            ctx.shadowBlur = fillShadow.blur * pixelRatio;
        }
    };
    Shape.prototype.renderStroke = function (ctx) {
        if (this.stroke && this.strokeWidth) {
            var globalAlpha = ctx.globalAlpha;
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
    };
    Shape.prototype.containsPoint = function (x, y) {
        return this.isPointInPath(x, y);
    };
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
        SceneChangeDetection({ redraw: RedrawType.MINOR, changeCb: function (s) { return s.updateGradient(); } })
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
            convertor: function (v) { return Math.min(1, Math.max(0, v)); },
        })
    ], Shape.prototype, "opacity", void 0);
    __decorate([
        SceneChangeDetection({ redraw: RedrawType.MINOR, checkDirtyOnAssignment: true })
    ], Shape.prototype, "fillShadow", void 0);
    return Shape;
}(Node));
export { Shape };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvc2NlbmUvc2hhcGUvc2hhcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFFakUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBVzVELElBQU0sc0JBQXNCLEdBQUcsNENBQTRDLENBQUM7QUFFNUU7SUFBb0MseUJBQUk7SUFBeEM7UUFBQSxxRUF3UUM7UUFqUFcsb0JBQWMsR0FBRyxDQUFDLENBQUM7UUFvRTNCLGlCQUFXLEdBQVcsQ0FBQyxDQUFDO1FBR3hCLG1CQUFhLEdBQVcsQ0FBQyxDQUFDO1FBRzFCLFVBQUksR0FBdUIsS0FBSyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUM7UUE0QnBEOzs7Ozs7Ozs7V0FTRztRQUVILFlBQU0sR0FBdUIsS0FBSyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUM7UUFHeEQsaUJBQVcsR0FBVyxLQUFLLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQztRQStCdEQsY0FBUSxHQUF5QixLQUFLLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQztRQUc5RCxvQkFBYyxHQUFXLEtBQUssQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDO1FBRzVELGFBQU8sR0FBa0IsS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7UUFHckQsY0FBUSxHQUFtQixLQUFLLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQztRQU14RCxhQUFPLEdBQVcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7UUFHOUMsZ0JBQVUsR0FBMkIsS0FBSyxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUM7O0lBNEV4RSxDQUFDO0lBdlFHOzs7Ozs7Ozs7Ozs7OztPQWNHO0lBQ0ksb0JBQWMsR0FBckIs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