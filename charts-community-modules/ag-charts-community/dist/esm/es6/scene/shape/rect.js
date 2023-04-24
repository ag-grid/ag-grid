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
export class Rect extends Path {
    constructor() {
        super(...arguments);
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
        this.lastUpdatePathStrokeWidth = Shape.defaultStyles.strokeWidth;
        this.effectiveStrokeWidth = Shape.defaultStyles.strokeWidth;
        /**
         * When the rectangle's width or height is less than a pixel
         * and crisp mode is on, the rectangle will still fit into the pixel,
         * but will be less opaque to make an effect of holding less space.
         */
        this.microPixelEffectOpacity = 1;
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
        var _a, _b, _c;
        const { path, borderPath, crisp } = this;
        let { x, y, width: w, height: h, strokeWidth } = this;
        const pixelRatio = (_b = (_a = this.layerManager) === null || _a === void 0 ? void 0 : _a.canvas.pixelRatio) !== null && _b !== void 0 ? _b : 1;
        const pixelSize = 1 / pixelRatio;
        let microPixelEffectOpacity = 1;
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
                const lx = x + pixelSize / 2;
                borderPath.moveTo(lx, y);
                borderPath.lineTo(lx, y + h);
                strokeWidth = pixelSize;
                this.borderClipPath = undefined;
            }
            else if (h < pixelSize) {
                // Too narrow, draw a horizontal stroke
                const ly = y + pixelSize / 2;
                borderPath.moveTo(x, ly);
                borderPath.lineTo(x + w, ly);
                strokeWidth = pixelSize;
                this.borderClipPath = undefined;
            }
            else if (strokeWidth < w && strokeWidth < h) {
                const halfStrokeWidth = strokeWidth / 2;
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
    applyFillAlpha(ctx) {
        const { fillOpacity, microPixelEffectOpacity, opacity } = this;
        ctx.globalAlpha = opacity * fillOpacity * microPixelEffectOpacity;
    }
    renderStroke(ctx) {
        const { stroke, effectiveStrokeWidth, borderPath, borderClipPath, opacity, microPixelEffectOpacity } = this;
        const borderActive = !!stroke && !!effectiveStrokeWidth;
        if (borderActive) {
            const { strokeOpacity, lineDash, lineDashOffset, lineCap, lineJoin } = this;
            if (borderClipPath) {
                // strokeWidth is larger than width or height, so use clipping to render correctly.
                // This is the simplest way to achieve the correct rendering due to nuances with ~0
                // width/height lines in Canvas operations.
                borderClipPath.draw(ctx);
                ctx.clip();
            }
            borderPath.draw(ctx);
            const { globalAlpha } = ctx;
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
