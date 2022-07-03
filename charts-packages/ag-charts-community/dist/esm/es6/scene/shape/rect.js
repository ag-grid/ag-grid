var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Path, ScenePathChangeDetection } from "./path";
import { BBox } from "../bbox";
import { LinearGradient } from "../gradient/linearGradient";
import { Color } from "../../util/color";
import { Shape } from "./shape";
export var RectSizing;
(function (RectSizing) {
    RectSizing[RectSizing["Content"] = 0] = "Content";
    RectSizing[RectSizing["Border"] = 1] = "Border";
})(RectSizing || (RectSizing = {}));
export class Rect extends Path {
    constructor() {
        super(...arguments);
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
        /**
         * Similar to https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing
         */
        this.sizing = RectSizing.Content;
        this.lastUpdatePathStrokeWidth = Shape.defaultStyles.strokeWidth;
        this.effectiveStrokeWidth = Shape.defaultStyles.strokeWidth;
    }
    updateGradientInstance() {
        const { fill } = this;
        if (this.gradient) {
            if (fill) {
                const gradient = new LinearGradient();
                gradient.angle = 270;
                gradient.stops = [{
                        offset: 0,
                        color: Color.fromString(fill).brighter().toString()
                    }, {
                        offset: 1,
                        color: Color.fromString(fill).darker().toString()
                    }];
                this.gradientInstance = gradient;
            }
        }
        else {
            this.gradientInstance = undefined;
        }
        this.gradientFill = fill;
    }
    isDirtyPath() {
        if (this.lastUpdatePathStrokeWidth !== this.strokeWidth) {
            return this.crisp || this.sizing === RectSizing.Border;
        }
        return false;
    }
    updatePath() {
        const borderSizing = this.sizing === RectSizing.Border;
        const path = this.path;
        path.clear();
        let x = this.x;
        let y = this.y;
        let width = this.width;
        let height = this.height;
        let strokeWidth;
        if (borderSizing) {
            const halfWidth = width / 2;
            const halfHeight = height / 2;
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
            const { alignment: a, align: al } = this;
            path.rect(al(a, x), al(a, y), al(a, x, width), al(a, y, height));
        }
        else {
            path.rect(x, y, width, height);
        }
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
    fillStroke(ctx) {
        if (!this.scene) {
            return;
        }
        const pixelRatio = this.scene.canvas.pixelRatio || 1;
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
__decorate([
    ScenePathChangeDetection({ changeCb: (o) => o.updateGradientInstance() })
], Rect.prototype, "sizing", void 0);
//# sourceMappingURL=rect.js.map