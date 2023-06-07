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
        const { globalAlpha } = ctx;
        ctx.globalAlpha = globalAlpha * opacity * fillOpacity * microPixelEffectOpacity;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9zY2VuZS9zaGFwZS9yZWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFDeEQsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUMvQixPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBQ2hDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFFbkMsTUFBTSxPQUFPLElBQUssU0FBUSxJQUFJO0lBQTlCOztRQUdhLGVBQVUsR0FBRyxJQUFJLE1BQU0sRUFBRSxDQUFDO1FBR25DLE1BQUMsR0FBVyxDQUFDLENBQUM7UUFHZCxNQUFDLEdBQVcsQ0FBQyxDQUFDO1FBR2QsVUFBSyxHQUFXLEVBQUUsQ0FBQztRQUduQixXQUFNLEdBQVcsRUFBRSxDQUFDO1FBR3BCLFdBQU0sR0FBVyxDQUFDLENBQUM7UUFFbkI7Ozs7V0FJRztRQUVILFVBQUssR0FBWSxLQUFLLENBQUM7UUFJZiw4QkFBeUIsR0FBVyxLQUFLLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQztRQWNwRSx5QkFBb0IsR0FBVyxLQUFLLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQztRQUV2RTs7OztXQUlHO1FBQ08sNEJBQXVCLEdBQVcsQ0FBQyxDQUFDO0lBOEhsRCxDQUFDO0lBakphLFdBQVc7O1FBQ2pCLElBQUksSUFBSSxDQUFDLHlCQUF5QixLQUFLLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDckQsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUVELElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxLQUFJLE1BQUEsSUFBSSxDQUFDLFFBQVEsMENBQUUsT0FBTyxFQUFFLENB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