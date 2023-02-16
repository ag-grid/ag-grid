var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Shape } from './shape';
import { BBox } from '../bbox';
import { HdpiCanvas } from '../../canvas/hdpiCanvas';
import { RedrawType, SceneChangeDetection } from '../node';
function SceneFontChangeDetection(opts) {
    const { redraw = RedrawType.MAJOR, changeCb } = opts || {};
    return SceneChangeDetection({ redraw, type: 'font', changeCb });
}
export class Text extends Shape {
    constructor() {
        super(...arguments);
        this.x = 0;
        this.y = 0;
        this.lines = [];
        this.text = '';
        this._dirtyFont = true;
        this.fontSize = 10;
        this.fontFamily = 'sans-serif';
        this.textAlign = Text.defaultStyles.textAlign;
        this.textBaseline = Text.defaultStyles.textBaseline;
        // Multi-line text is complicated because:
        // - Canvas does not support it natively, so we have to implement it manually
        // - need to know the height of each line -> need to parse the font shorthand ->
        //   generally impossible to do because font size may not be in pixels
        // - so, need to measure the text instead, each line individually -> expensive
        // - or make the user provide the line height manually for multi-line text
        // - computeBBox should use the lineHeight for multi-line text but ignore it otherwise
        // - textBaseline kind of loses its meaning for multi-line text
        this.lineHeight = 14;
    }
    _splitText() {
        this.lines = typeof this.text === 'string' ? this.text.split(/\r?\n/g) : [];
    }
    get font() {
        if (this._dirtyFont) {
            this._dirtyFont = false;
            this._font = getFont(this.fontSize, this.fontFamily, this.fontStyle, this.fontWeight);
        }
        return this._font;
    }
    computeBBox() {
        return HdpiCanvas.has.textMetrics ? this.getPreciseBBox() : this.getApproximateBBox();
    }
    getPreciseBBox() {
        const metrics = HdpiCanvas.measureText(this.text, this.font, this.textBaseline, this.textAlign);
        return new BBox(this.x - metrics.actualBoundingBoxLeft, this.y - metrics.actualBoundingBoxAscent, metrics.width, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent);
    }
    getApproximateBBox() {
        const size = HdpiCanvas.getTextSize(this.text, this.font);
        let { x, y } = this;
        switch (this.textAlign) {
            case 'end':
            case 'right':
                x -= size.width;
                break;
            case 'center':
                x -= size.width / 2;
        }
        switch (this.textBaseline) {
            case 'alphabetic':
                y -= size.height * 0.7;
                break;
            case 'middle':
                y -= size.height * 0.45;
                break;
            case 'ideographic':
                y -= size.height;
                break;
            case 'hanging':
                y -= size.height * 0.2;
                break;
            case 'bottom':
                y -= size.height;
                break;
        }
        return new BBox(x, y, size.width, size.height);
    }
    isPointInPath(x, y) {
        const point = this.transformPoint(x, y);
        const bbox = this.computeBBox();
        return bbox ? bbox.containsPoint(point.x, point.y) : false;
    }
    render(renderCtx) {
        const { ctx, forceRender, stats } = renderCtx;
        if (this.dirty === RedrawType.NONE && !forceRender) {
            if (stats)
                stats.nodesSkipped += this.nodeCount.count;
            return;
        }
        if (!this.lines.length || !this.layerManager) {
            if (stats)
                stats.nodesSkipped += this.nodeCount.count;
            return;
        }
        this.computeTransformMatrix();
        this.matrix.toContext(ctx);
        const { fill, stroke, strokeWidth } = this;
        ctx.font = this.font;
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = this.textBaseline;
        const pixelRatio = this.layerManager.canvas.pixelRatio || 1;
        const { globalAlpha } = ctx;
        if (fill) {
            ctx.fillStyle = fill;
            ctx.globalAlpha = globalAlpha * this.opacity * this.fillOpacity;
            const { fillShadow, text, x, y } = this;
            if (fillShadow && fillShadow.enabled) {
                ctx.shadowColor = fillShadow.color;
                ctx.shadowOffsetX = fillShadow.xOffset * pixelRatio;
                ctx.shadowOffsetY = fillShadow.yOffset * pixelRatio;
                ctx.shadowBlur = fillShadow.blur * pixelRatio;
            }
            ctx.fillText(text, x, y);
        }
        if (stroke && strokeWidth) {
            ctx.strokeStyle = stroke;
            ctx.lineWidth = strokeWidth;
            ctx.globalAlpha = globalAlpha * this.opacity * this.strokeOpacity;
            const { lineDash, lineDashOffset, lineCap, lineJoin, text, x, y } = this;
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
            ctx.strokeText(text, x, y);
        }
        super.render(renderCtx);
    }
}
Text.className = 'Text';
Text.defaultStyles = Object.assign({}, Shape.defaultStyles, {
    textAlign: 'start',
    fontStyle: undefined,
    fontWeight: undefined,
    fontSize: 10,
    fontFamily: 'sans-serif',
    textBaseline: 'alphabetic',
});
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], Text.prototype, "x", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], Text.prototype, "y", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MAJOR, changeCb: (o) => o._splitText() })
], Text.prototype, "text", void 0);
__decorate([
    SceneFontChangeDetection()
], Text.prototype, "fontStyle", void 0);
__decorate([
    SceneFontChangeDetection()
], Text.prototype, "fontWeight", void 0);
__decorate([
    SceneFontChangeDetection()
], Text.prototype, "fontSize", void 0);
__decorate([
    SceneFontChangeDetection()
], Text.prototype, "fontFamily", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], Text.prototype, "textAlign", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], Text.prototype, "textBaseline", void 0);
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], Text.prototype, "lineHeight", void 0);
export function getFont(fontSize, fontFamily, fontStyle, fontWeight) {
    return [fontStyle || '', fontWeight || '', fontSize + 'px', fontFamily].join(' ').trim();
}
