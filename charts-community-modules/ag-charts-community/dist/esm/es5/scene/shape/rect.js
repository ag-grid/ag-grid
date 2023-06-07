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
import { Path, ScenePathChangeDetection } from './path';
import { BBox } from '../bbox';
import { Shape } from './shape';
import { Path2D } from '../path2D';
var Rect = /** @class */ (function (_super) {
    __extends(Rect, _super);
    function Rect() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.borderPath = new Path2D();
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
        _this.lastUpdatePathStrokeWidth = Shape.defaultStyles.strokeWidth;
        _this.effectiveStrokeWidth = Shape.defaultStyles.strokeWidth;
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
                this.borderClipPath = (_c = this.borderClipPath) !== null && _c !== void 0 ? _c : new Path2D();
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
        return new BBox(x, y, width, height);
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
        ScenePathChangeDetection()
    ], Rect.prototype, "x", void 0);
    __decorate([
        ScenePathChangeDetection()
    ], Rect.prototype, "y", void 0);
    __decorate([
        ScenePathChangeDetection()
    ], Rect.prototype, "width", void 0);
    __decorate([
        ScenePathChangeDetection()
    ], Rect.prototype, "height", void 0);
    __decorate([
        ScenePathChangeDetection()
    ], Rect.prototype, "radius", void 0);
    __decorate([
        ScenePathChangeDetection()
    ], Rect.prototype, "crisp", void 0);
    return Rect;
}(Path));
export { Rect };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9zY2VuZS9zaGFwZS9yZWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFDeEQsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUMvQixPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBQ2hDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFFbkM7SUFBMEIsd0JBQUk7SUFBOUI7UUFBQSxxRUFpTEM7UUE5S1ksZ0JBQVUsR0FBRyxJQUFJLE1BQU0sRUFBRSxDQUFDO1FBR25DLE9BQUMsR0FBVyxDQUFDLENBQUM7UUFHZCxPQUFDLEdBQVcsQ0FBQyxDQUFDO1FBR2QsV0FBSyxHQUFXLEVBQUUsQ0FBQztRQUduQixZQUFNLEdBQVcsRUFBRSxDQUFDO1FBR3BCLFlBQU0sR0FBVyxDQUFDLENBQUM7UUFFbkI7Ozs7V0FJRztRQUVILFdBQUssR0FBWSxLQUFLLENBQUM7UUFJZiwrQkFBeUIsR0FBVyxLQUFLLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQztRQWNwRSwwQkFBb0IsR0FBVyxLQUFLLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQztRQUV2RTs7OztXQUlHO1FBQ08sNkJBQXVCLEdBQVcsQ0FBQyxDQUFDOztJQThIbEQsQ0FBQztJQWpKYSwwQkFBVyxHQUFyQjs7UUFDSSxJQUFJLElBQUksQ0FBQyx5QkFBeUIsS0FBSyxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ3JELE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFFRCxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsS0FBSSxNQUFBLElBQUksQ0FBQyxR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