"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rect = void 0;
var path_1 = require("./path");
var bbox_1 = require("../bbox");
var shape_1 = require("./shape");
var path2D_1 = require("../path2D");
var Rect = /** @class */ (function (_super) {
    __extends(Rect, _super);
    function Rect() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.borderPath = new path2D_1.Path2D();
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
        _this.lastUpdatePathStrokeWidth = shape_1.Shape.defaultStyles.strokeWidth;
        _this.effectiveStrokeWidth = shape_1.Shape.defaultStyles.strokeWidth;
        /**
         * When the rectangle's width or height is less than a pixel
         * and crisp mode is on, the rectangle will still fit into the pixel,
         * but will be less opaque to make an effect of holding less space.
         */
        _this.microPixelEffectOpacity = 1;
        return _this;
    }
    Rect.prototype.isDirtyPath = function () {
        var _a;
        if (this.lastUpdatePathStrokeWidth !== this.strokeWidth) {
            return true;
        }
        if (this.path.isDirty() || this.borderPath.isDirty() || ((_a = this.clipPath) === null || _a === void 0 ? void 0 : _a.isDirty())) {
            return true;
        }
        return false;
    };
    Rect.prototype.updatePath = function () {
        var _a, _b, _c;
        var _d = this, path = _d.path, borderPath = _d.borderPath, crisp = _d.crisp;
        var _e = this, x = _e.x, y = _e.y, w = _e.width, h = _e.height, strokeWidth = _e.strokeWidth;
        var pixelRatio = (_b = (_a = this.layerManager) === null || _a === void 0 ? void 0 : _a.canvas.pixelRatio) !== null && _b !== void 0 ? _b : 1;
        var pixelSize = 1 / pixelRatio;
        var microPixelEffectOpacity = 1;
        path.clear({ trackChanges: true });
        borderPath.clear({ trackChanges: true });
        if (crisp) {
            if (w <= pixelSize) {
                microPixelEffectOpacity *= w / pixelSize;
            }
            if (h <= pixelSize) {
                microPixelEffectOpacity *= h / pixelSize;
            }
            w = this.align(x, w);
            h = this.align(y, h);
            x = this.align(x);
            y = this.align(y);
        }
        if (strokeWidth) {
            if (w < pixelSize) {
                // Too narrow, draw a vertical stroke
                var lx = x + pixelSize / 2;
                borderPath.moveTo(lx, y);
                borderPath.lineTo(lx, y + h);
                strokeWidth = pixelSize;
                this.borderClipPath = undefined;
            }
            else if (h < pixelSize) {
                // Too narrow, draw a horizontal stroke
                var ly = y + pixelSize / 2;
                borderPath.moveTo(x, ly);
                borderPath.lineTo(x + w, ly);
                strokeWidth = pixelSize;
                this.borderClipPath = undefined;
            }
            else if (strokeWidth < w && strokeWidth < h) {
                var halfStrokeWidth = strokeWidth / 2;
                x += halfStrokeWidth;
                y += halfStrokeWidth;
                w -= strokeWidth;
                h -= strokeWidth;
                // Clipping not needed in this case; fill to center of stroke.
                this.borderClipPath = undefined;
                path.rect(x, y, w, h);
                borderPath.rect(x, y, w, h);
            }
            else {
                // Skip the fill and just render the stroke.
                this.borderClipPath = (_c = this.borderClipPath) !== null && _c !== void 0 ? _c : new path2D_1.Path2D();
                this.borderClipPath.clear({ trackChanges: true });
                this.borderClipPath.rect(x, y, w, h);
                borderPath.rect(x, y, w, h);
            }
        }
        else {
            // No borderPath needed, and thus no clipPath needed either. Fill to full extent of
            // Rect.
            this.borderClipPath = undefined;
            path.rect(x, y, w, h);
        }
        this.effectiveStrokeWidth = strokeWidth;
        this.lastUpdatePathStrokeWidth = strokeWidth;
        this.microPixelEffectOpacity = microPixelEffectOpacity;
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
    Rect.prototype.applyFillAlpha = function (ctx) {
        var _a = this, fillOpacity = _a.fillOpacity, microPixelEffectOpacity = _a.microPixelEffectOpacity, opacity = _a.opacity;
        var globalAlpha = ctx.globalAlpha;
        ctx.globalAlpha = globalAlpha * opacity * fillOpacity * microPixelEffectOpacity;
    };
    Rect.prototype.renderStroke = function (ctx) {
        var _a = this, stroke = _a.stroke, effectiveStrokeWidth = _a.effectiveStrokeWidth, borderPath = _a.borderPath, borderClipPath = _a.borderClipPath, opacity = _a.opacity, microPixelEffectOpacity = _a.microPixelEffectOpacity;
        var borderActive = !!stroke && !!effectiveStrokeWidth;
        if (borderActive) {
            var _b = this, strokeOpacity = _b.strokeOpacity, lineDash = _b.lineDash, lineDashOffset = _b.lineDashOffset, lineCap = _b.lineCap, lineJoin = _b.lineJoin;
            if (borderClipPath) {
                // strokeWidth is larger than width or height, so use clipping to render correctly.
                // This is the simplest way to achieve the correct rendering due to nuances with ~0
                // width/height lines in Canvas operations.
                borderClipPath.draw(ctx);
                ctx.clip();
            }
            borderPath.draw(ctx);
            var globalAlpha = ctx.globalAlpha;
            ctx.strokeStyle = stroke;
            ctx.globalAlpha = globalAlpha * opacity * strokeOpacity * microPixelEffectOpacity;
            ctx.lineWidth = effectiveStrokeWidth;
            if (lineDash) {
                ctx.setLineDash(lineDash);
            }
            if (lineDashOffset) {
                ctx.lineDashOffset = lineDashOffset;
            }
            if (lineCap) {
                ctx.lineCap = lineCap;
            }
            if (lineJoin) {
                ctx.lineJoin = lineJoin;
            }
            ctx.stroke();
            ctx.globalAlpha = globalAlpha;
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
    return Rect;
}(path_1.Path));
exports.Rect = Rect;
//# sourceMappingURL=rect.js.map