var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Path, ScenePathChangeDetection } from './path';
import { BBox } from '../bbox';
import { LinearGradient } from '../gradient/linearGradient';
import { Color } from '../../util/color';
import { Shape } from './shape';
import { Path2D } from '../path2D';
export var RectSizing;
(function (RectSizing) {
    RectSizing[RectSizing["Content"] = 0] = "Content";
    RectSizing[RectSizing["Border"] = 1] = "Border";
})(RectSizing || (RectSizing = {}));
export class Rect extends Path {
    constructor() {
        super((ctx) => this.renderRect(ctx));
        this.borderPath = new Path2D();
        this.x = 0;
        this.y = 0;
        this.width = 10;
        this.height = 10;
        this.radius = 0;
        /**
         * If `true`, the rect is aligned to the pixel grid for crisp looking lines.
         * Animated rects may not look nice with this option enabled, for example
         * when a rect is translated by a sub-pixel value on each frame.
         */
        this.crisp = false;
        this.gradient = false;
        this.lastUpdatePathStrokeWidth = Shape.defaultStyles.strokeWidth;
        this.effectiveStrokeWidth = Shape.defaultStyles.strokeWidth;
    }
    updateGradientInstance() {
        const { fill } = this;
        if (this.gradient) {
            if (fill) {
                const gradient = new LinearGradient();
                gradient.angle = 270;
                gradient.stops = [
                    {
                        offset: 0,
                        color: Color.fromString(fill).brighter().toString(),
                    },
                    {
                        offset: 1,
                        color: Color.fromString(fill).darker().toString(),
                    },
                ];
                this.gradientInstance = gradient;
            }
        }
        else {
            this.gradientInstance = undefined;
        }
        this.gradientFill = fill;
    }
    isDirtyPath() {
        var _a;
        if (this.lastUpdatePathStrokeWidth !== this.strokeWidth) {
            return true;
        }
        if (this.path.isDirty() || this.borderPath.isDirty() || ((_a = this.clipPath) === null || _a === void 0 ? void 0 : _a.isDirty())) {
            return true;
        }
        return false;
    }
    updatePath() {
        var _a;
        const { path, borderPath, crisp } = this;
        let { x, y, width: w, height: h, strokeWidth } = this;
        path.clear({ trackChanges: true });
        borderPath.clear({ trackChanges: true });
        if (crisp) {
            // Order matters here, since we need unaligned x/y for w/h calculations.
            w = this.align(x, w);
            h = this.align(y, h);
            x = this.align(x);
            y = this.align(y);
        }
        if (strokeWidth) {
            if (strokeWidth < w && strokeWidth < h) {
                const halfStrokeWidth = strokeWidth / 2;
                x += halfStrokeWidth;
                y += halfStrokeWidth;
                w -= strokeWidth;
                h -= strokeWidth;
                // Clipping not needed in this case; fill to center of stroke.
                this.clipPath = undefined;
                path.rect(x, y, w, h);
            }
            else {
                // Skip the fill and just render the stroke.
                this.clipPath = (_a = this.clipPath, (_a !== null && _a !== void 0 ? _a : new Path2D()));
                this.clipPath.clear({ trackChanges: true });
                this.clipPath.rect(x, y, w, h);
            }
            borderPath.rect(x, y, w, h);
        }
        else {
            // No borderPath needed, and thus no clipPath needed either. Fill to full extent of
            // Rect.
            this.clipPath = undefined;
            path.rect(x, y, w, h);
        }
        this.effectiveStrokeWidth = strokeWidth;
        this.lastUpdatePathStrokeWidth = strokeWidth;
    }
    computeBBox() {
        const { x, y, width, height } = this;
        return new BBox(x, y, width, height);
    }
    isPointInPath(x, y) {
        const point = this.transformPoint(x, y);
        const bbox = this.computeBBox();
        return bbox.containsPoint(point.x, point.y);
    }
    renderRect(ctx) {
        var _a, _b;
        const { stroke, effectiveStrokeWidth, fill, path, borderPath, clipPath, opacity } = this;
        const borderActive = !!stroke && !!effectiveStrokeWidth;
        if (fill) {
            const { gradientFill, fillOpacity, fillShadow } = this;
            if (fill !== gradientFill) {
                this.updateGradientInstance();
            }
            const { gradientInstance } = this;
            if (gradientInstance) {
                ctx.fillStyle = gradientInstance.createGradient(ctx, this.computeBBox());
            }
            else {
                ctx.fillStyle = fill;
            }
            ctx.globalAlpha = opacity * fillOpacity;
            // The canvas context scaling (depends on the device's pixel ratio)
            // has no effect on shadows, so we have to account for the pixel ratio
            // manually here.
            if (fillShadow && fillShadow.enabled) {
                const pixelRatio = (_b = (_a = this.scene) === null || _a === void 0 ? void 0 : _a.canvas.pixelRatio, (_b !== null && _b !== void 0 ? _b : 1));
                ctx.shadowColor = fillShadow.color;
                ctx.shadowOffsetX = fillShadow.xOffset * pixelRatio;
                ctx.shadowOffsetY = fillShadow.yOffset * pixelRatio;
                ctx.shadowBlur = fillShadow.blur * pixelRatio;
            }
            path.draw(ctx);
            ctx.fill();
            ctx.shadowColor = 'rgba(0, 0, 0, 0)';
        }
        if (borderActive) {
            const { strokeOpacity, lineDash, lineDashOffset, lineCap, lineJoin } = this;
            if (clipPath) {
                // strokeWidth is larger than width or height, so use clipping to render correctly.
                // This is the simplest way to achieve the correct rendering due to nuances with ~0
                // width/height lines in Canvas operations.
                clipPath.draw(ctx);
                ctx.clip();
            }
            borderPath.draw(ctx);
            ctx.strokeStyle = stroke;
            ctx.globalAlpha = opacity * strokeOpacity;
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
        }
    }
}
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
__decorate([
    ScenePathChangeDetection({ changeCb: (r) => r.updateGradientInstance() })
], Rect.prototype, "gradient", void 0);
