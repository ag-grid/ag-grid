"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var path_1 = require("./path");
var bbox_1 = require("../bbox");
var linearGradient_1 = require("../gradient/linearGradient");
var color_1 = require("../../util/color");
var shape_1 = require("./shape");
var RectSizing;
(function (RectSizing) {
    RectSizing[RectSizing["Content"] = 0] = "Content";
    RectSizing[RectSizing["Border"] = 1] = "Border";
})(RectSizing = exports.RectSizing || (exports.RectSizing = {}));
var Rect = /** @class */ (function (_super) {
    __extends(Rect, _super);
    function Rect() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.x = 0;
        _this.y = 0;
        _this.width = 10;
        _this.height = 10;
        _this.radius = 0;
        /**
         * If `true`, the rect is aligned to the pixel grid for crisp looking lines.
         * Animated rects may not look nice with this option enabled, for example
         * when a rect is translated by a sub-pixel value on each frame.
         */
        _this.crisp = false;
        _this.gradient = false;
        /**
         * Similar to https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing
         */
        _this.sizing = RectSizing.Content;
        _this.lastUpdatePathStrokeWidth = shape_1.Shape.defaultStyles.strokeWidth;
        _this.effectiveStrokeWidth = shape_1.Shape.defaultStyles.strokeWidth;
        return _this;
    }
    Rect.prototype.updateGradientInstance = function () {
        var fill = this.fill;
        if (this.gradient) {
            if (fill) {
                var gradient = new linearGradient_1.LinearGradient();
                gradient.angle = 270;
                gradient.stops = [{
                        offset: 0,
                        color: color_1.Color.fromString(fill).brighter().toString()
                    }, {
                        offset: 1,
                        color: color_1.Color.fromString(fill).darker().toString()
                    }];
                this.gradientInstance = gradient;
            }
        }
        else {
            this.gradientInstance = undefined;
        }
        this.gradientFill = fill;
    };
    Rect.prototype.isDirtyPath = function () {
        if (this.lastUpdatePathStrokeWidth !== this.strokeWidth) {
            return this.crisp || this.sizing === RectSizing.Border;
        }
        return false;
    };
    Rect.prototype.updatePath = function () {
        var borderSizing = this.sizing === RectSizing.Border;
        var path = this.path;
        path.clear();
        var x = this.x;
        var y = this.y;
        var width = this.width;
        var height = this.height;
        var strokeWidth;
        if (borderSizing) {
            var halfWidth = width / 2;
            var halfHeight = height / 2;
            strokeWidth = Math.min(this.strokeWidth, halfWidth, halfHeight);
            x = Math.min(x + strokeWidth / 2, x + halfWidth);
            y = Math.min(y + strokeWidth / 2, y + halfHeight);
            width = Math.max(width - strokeWidth, 0);
            height = Math.max(height - strokeWidth, 0);
        }
        else {
            strokeWidth = this.strokeWidth;
        }
        this.effectiveStrokeWidth = strokeWidth;
        this.lastUpdatePathStrokeWidth = this.strokeWidth;
        if (this.crisp && !borderSizing) {
            var _a = this, a = _a.alignment, al = _a.align;
            path.rect(al(a, x), al(a, y), al(a, x, width), al(a, y, height));
        }
        else {
            path.rect(x, y, width, height);
        }
    };
    Rect.prototype.computeBBox = function () {
        var _a = this, x = _a.x, y = _a.y, width = _a.width, height = _a.height;
        return new bbox_1.BBox(x, y, width, height);
    };
    Rect.prototype.isPointInPath = function (x, y) {
        var point = this.transformPoint(x, y);
        var bbox = this.computeBBox();
        return bbox.containsPoint(point.x, point.y);
    };
    Rect.prototype.fillStroke = function (ctx) {
        if (!this.scene) {
            return;
        }
        var pixelRatio = this.scene.canvas.pixelRatio || 1;
        if (this.fill) {
            if (this.fill !== this.gradientFill) {
                this.updateGradientInstance();
            }
            if (this.gradientInstance) {
                ctx.fillStyle = this.gradientInstance.createGradient(ctx, this.computeBBox());
            }
            else {
                ctx.fillStyle = this.fill;
            }
            ctx.globalAlpha = this.opacity * this.fillOpacity;
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
        if (this.stroke && this.effectiveStrokeWidth) {
            ctx.strokeStyle = this.stroke;
            ctx.globalAlpha = this.opacity * this.strokeOpacity;
            ctx.lineWidth = this.effectiveStrokeWidth;
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
            var strokeShadow = this.strokeShadow;
            if (strokeShadow && strokeShadow.enabled) {
                ctx.shadowColor = strokeShadow.color;
                ctx.shadowOffsetX = strokeShadow.xOffset * pixelRatio;
                ctx.shadowOffsetY = strokeShadow.yOffset * pixelRatio;
                ctx.shadowBlur = strokeShadow.blur * pixelRatio;
            }
            ctx.stroke();
        }
    };
    Rect.className = 'Rect';
    __decorate([
        path_1.ScenePathChangeDetection()
    ], Rect.prototype, "x", void 0);
    __decorate([
        path_1.ScenePathChangeDetection()
    ], Rect.prototype, "y", void 0);
    __decorate([
        path_1.ScenePathChangeDetection()
    ], Rect.prototype, "width", void 0);
    __decorate([
        path_1.ScenePathChangeDetection()
    ], Rect.prototype, "height", void 0);
    __decorate([
        path_1.ScenePathChangeDetection()
    ], Rect.prototype, "radius", void 0);
    __decorate([
        path_1.ScenePathChangeDetection()
    ], Rect.prototype, "crisp", void 0);
    __decorate([
        path_1.ScenePathChangeDetection({ changeCb: function (r) { return r.updateGradientInstance(); } })
    ], Rect.prototype, "gradient", void 0);
    __decorate([
        path_1.ScenePathChangeDetection({ changeCb: function (o) { return o.updateGradientInstance(); } })
    ], Rect.prototype, "sizing", void 0);
    return Rect;
}(path_1.Path));
exports.Rect = Rect;
//# sourceMappingURL=rect.js.map