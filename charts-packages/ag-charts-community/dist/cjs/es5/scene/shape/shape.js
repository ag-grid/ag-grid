"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Shape = void 0;
var node_1 = require("../node");
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
            if (styles.hasOwnProperty(property) && protoStyles.hasOwnProperty(property)) {
                this[property] = styles[property];
            }
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
        if (!this.layerManager) {
            return;
        }
        var pixelRatio = this.layerManager.canvas.pixelRatio || 1;
        var globalAlpha = ctx.globalAlpha;
        if (this.fill) {
            ctx.fillStyle = this.fill;
            ctx.globalAlpha = globalAlpha * this.opacity * this.fillOpacity;
            // The canvas context scaling (depends on the device's pixel ratio)
            // has no effect on shadows, so we have to account for the pixel ratio
            // manually here.
            var fillShadow = this.fillShadow;
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
            ctx.stroke();
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
        node_1.SceneChangeDetection({ redraw: node_1.RedrawType.MINOR })
    ], Shape.prototype, "fillOpacity", void 0);
    __decorate([
        node_1.SceneChangeDetection({ redraw: node_1.RedrawType.MINOR })
    ], Shape.prototype, "strokeOpacity", void 0);
    __decorate([
        node_1.SceneChangeDetection({ redraw: node_1.RedrawType.MINOR })
    ], Shape.prototype, "fill", void 0);
    __decorate([
        node_1.SceneChangeDetection({ redraw: node_1.RedrawType.MINOR })
    ], Shape.prototype, "stroke", void 0);
    __decorate([
        node_1.SceneChangeDetection({ redraw: node_1.RedrawType.MINOR })
    ], Shape.prototype, "strokeWidth", void 0);
    __decorate([
        node_1.SceneChangeDetection({ redraw: node_1.RedrawType.MINOR })
    ], Shape.prototype, "lineDash", void 0);
    __decorate([
        node_1.SceneChangeDetection({ redraw: node_1.RedrawType.MINOR })
    ], Shape.prototype, "lineDashOffset", void 0);
    __decorate([
        node_1.SceneChangeDetection({ redraw: node_1.RedrawType.MINOR })
    ], Shape.prototype, "lineCap", void 0);
    __decorate([
        node_1.SceneChangeDetection({ redraw: node_1.RedrawType.MINOR })
    ], Shape.prototype, "lineJoin", void 0);
    __decorate([
        node_1.SceneChangeDetection({
            redraw: node_1.RedrawType.MINOR,
            convertor: function (v) { return Math.min(1, Math.max(0, v)); },
        })
    ], Shape.prototype, "opacity", void 0);
    __decorate([
        node_1.SceneChangeDetection({ redraw: node_1.RedrawType.MINOR, checkDirtyOnAssignment: true })
    ], Shape.prototype, "fillShadow", void 0);
    return Shape;
}(node_1.Node));
exports.Shape = Shape;
