var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Shape } from './shape';
import { BBox } from '../bbox';
import { RedrawType, SceneChangeDetection } from '../node';
export class Range extends Shape {
    constructor() {
        super();
        this.x1 = 0;
        this.y1 = 0;
        this.x2 = 0;
        this.y2 = 0;
        this.startLine = false;
        this.endLine = false;
        this.isRange = false;
        this.restoreOwnStyles();
    }
    computeBBox() {
        return new BBox(this.x1, this.y1, this.x2 - this.x1, this.y2 - this.y1);
    }
    isPointInPath(_x, _y) {
        return false;
    }
    render(renderCtx) {
        var _a;
        let { ctx, forceRender, stats } = renderCtx;
        if (this.dirty === RedrawType.NONE && !forceRender) {
            if (stats)
                stats.nodesSkipped += this.nodeCount.count;
            return;
        }
        this.computeTransformMatrix();
        this.matrix.toContext(ctx);
        let { x1, y1, x2, y2 } = this;
        x1 = this.align(x1);
        y1 = this.align(y1);
        x2 = this.align(x2);
        y2 = this.align(y2);
        const { fill, opacity, isRange } = this;
        const fillActive = !!(isRange && fill);
        if (fillActive) {
            const { fillOpacity } = this;
            ctx.fillStyle = fill;
            ctx.globalAlpha = opacity * fillOpacity;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x1, y2);
            ctx.closePath();
            ctx.fill();
        }
        const { stroke, strokeWidth, startLine, endLine } = this;
        const strokeActive = !!((startLine || endLine) && stroke && strokeWidth);
        if (strokeActive) {
            const { strokeOpacity, lineDash, lineDashOffset, lineCap, lineJoin } = this;
            ctx.strokeStyle = stroke;
            ctx.globalAlpha = opacity * strokeOpacity;
            ctx.lineWidth = strokeWidth;
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
            ctx.beginPath();
            if (startLine) {
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y1);
            }
            if (endLine) {
                ctx.moveTo(x2, y2);
                ctx.lineTo(x1, y2);
            }
            ctx.stroke();
        }
        (_a = this.fillShadow) === null || _a === void 0 ? void 0 : _a.markClean();
        super.render(renderCtx);
    }
}
Range.className = 'Range';
Range.defaultStyles = Object.assign(Object.assign({}, Shape.defaultStyles), { strokeWidth: 1 });
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MINOR })
], Range.prototype, "x1", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MINOR })
], Range.prototype, "y1", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MINOR })
], Range.prototype, "x2", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MINOR })
], Range.prototype, "y2", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MINOR })
], Range.prototype, "startLine", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MINOR })
], Range.prototype, "endLine", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MINOR })
], Range.prototype, "isRange", void 0);
