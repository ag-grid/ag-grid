"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("./path");
const shape_1 = require("./shape");
const bbox_1 = require("../bbox");
const linearGradient_1 = require("../gradient/linearGradient");
const color_1 = require("../../util/color");
var RectSizing;
(function (RectSizing) {
    RectSizing[RectSizing["Content"] = 0] = "Content";
    RectSizing[RectSizing["Border"] = 1] = "Border";
})(RectSizing = exports.RectSizing || (exports.RectSizing = {}));
class Rect extends path_1.Path {
    constructor() {
        super(...arguments);
        this._x = 0;
        this._y = 0;
        this._width = 10;
        this._height = 10;
        this._radius = 0;
        /**
         * If `true`, the rect is aligned to the pixel grid for crisp looking lines.
         * Animated rects may not look nice with this option enabled, for example
         * when a rect is translated by a sub-pixel value on each frame.
         */
        this._crisp = false;
        this._gradient = false;
        this.effectiveStrokeWidth = shape_1.Shape.defaultStyles.strokeWidth;
        /**
         * Similar to https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing
         */
        this._sizing = RectSizing.Content;
    }
    set x(value) {
        if (this._x !== value) {
            this._x = value;
            this.dirtyPath = true;
        }
    }
    get x() {
        return this._x;
    }
    set y(value) {
        if (this._y !== value) {
            this._y = value;
            this.dirtyPath = true;
        }
    }
    get y() {
        return this._y;
    }
    set width(value) {
        if (this._width !== value) {
            this._width = value;
            this.dirtyPath = true;
        }
    }
    get width() {
        return this._width;
    }
    set height(value) {
        if (this._height !== value) {
            this._height = value;
            this.dirtyPath = true;
        }
    }
    get height() {
        return this._height;
    }
    set radius(value) {
        if (this._radius !== value) {
            this._radius = value;
            this.dirtyPath = true;
        }
    }
    get radius() {
        return this._radius;
    }
    set crisp(value) {
        if (this._crisp !== value) {
            this._crisp = value;
            this.dirtyPath = true;
        }
    }
    get crisp() {
        return this._crisp;
    }
    set gradient(value) {
        if (this._gradient !== value) {
            this._gradient = value;
            this.updateGradientInstance();
            this.dirty = true;
        }
    }
    get gradient() {
        return this._gradient;
    }
    updateGradientInstance() {
        if (this.gradient) {
            const { fill } = this;
            if (fill) {
                const gradient = new linearGradient_1.LinearGradient();
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
    }
    set fill(value) {
        if (this._fill !== value) {
            this._fill = value;
            this.updateGradientInstance();
            this.dirty = true;
        }
    }
    get fill() {
        return this._fill;
    }
    set strokeWidth(value) {
        if (this._strokeWidth !== value) {
            this._strokeWidth = value;
            // Normally, when the `lineWidth` changes, we only need to repaint the rect
            // without updating the path. If the `isCrisp` is set to `true` however,
            // we need to update the path to make sure the new stroke aligns to
            // the pixel grid. This is the reason we override the `lineWidth` setter
            // and getter here.
            if (this.crisp || this.sizing === RectSizing.Border) {
                this.dirtyPath = true;
            }
            else {
                this.effectiveStrokeWidth = value;
                this.dirty = true;
            }
        }
    }
    get strokeWidth() {
        return this._strokeWidth;
    }
    set sizing(value) {
        if (this._sizing !== value) {
            this._sizing = value;
            this.dirtyPath = true;
        }
    }
    get sizing() {
        return this._sizing;
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
        return new bbox_1.BBox(x, y, width, height);
    }
    isPointInPath(x, y) {
        const point = this.transformPoint(x, y);
        const bbox = this.computeBBox();
        return bbox.containsPoint(point.x, point.y);
    }
    isPointInStroke(x, y) {
        return false;
    }
    fillStroke(ctx) {
        if (!this.scene) {
            return;
        }
        const pixelRatio = this.scene.canvas.pixelRatio || 1;
        if (this.fill) {
            if (this.gradientInstance) {
                ctx.fillStyle = this.gradientInstance.generateGradient(ctx, this.computeBBox());
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
exports.Rect = Rect;
Rect.className = 'Rect';
