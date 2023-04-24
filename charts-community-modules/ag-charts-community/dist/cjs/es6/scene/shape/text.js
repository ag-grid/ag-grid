"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFont = exports.Text = void 0;
const shape_1 = require("./shape");
const bbox_1 = require("../bbox");
const hdpiCanvas_1 = require("../../canvas/hdpiCanvas");
const node_1 = require("../node");
function SceneFontChangeDetection(opts) {
    const { redraw = node_1.RedrawType.MAJOR, changeCb } = opts || {};
    return node_1.SceneChangeDetection({ redraw, type: 'font', changeCb });
}
class Text extends shape_1.Shape {
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
        // TextMetrics are used if lineHeight is not defined.
        this.lineHeight = undefined;
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
        return hdpiCanvas_1.HdpiCanvas.has.textMetrics ? this.getPreciseBBox() : this.getApproximateBBox();
    }
    getPreciseBBox() {
        var _a, _b;
        let left = 0;
        let top = 0;
        let width = 0;
        let height = 0;
        // Distance between first and last base lines.
        let baselineDistance = 0;
        for (let i = 0; i < this.lines.length; i++) {
            const metrics = hdpiCanvas_1.HdpiCanvas.measureText(this.lines[i], this.font, this.textBaseline, this.textAlign);
            left = Math.max(left, metrics.actualBoundingBoxLeft);
            width = Math.max(width, metrics.width);
            if (i == 0) {
                top += metrics.actualBoundingBoxAscent;
                height += metrics.actualBoundingBoxAscent;
            }
            else {
                baselineDistance += (_a = metrics.fontBoundingBoxAscent) !== null && _a !== void 0 ? _a : metrics.emHeightAscent;
            }
            if (i == this.lines.length - 1) {
                height += metrics.actualBoundingBoxDescent;
            }
            else {
                baselineDistance += (_b = metrics.fontBoundingBoxDescent) !== null && _b !== void 0 ? _b : metrics.emHeightDescent;
            }
        }
        if (this.lineHeight !== undefined) {
            baselineDistance = (this.lines.length - 1) * this.lineHeight;
        }
        height += baselineDistance;
        top += baselineDistance * this.getVerticalOffset();
        return new bbox_1.BBox(this.x - left, this.y - top, width, height);
    }
    getVerticalOffset() {
        switch (this.textBaseline) {
            case 'top':
            case 'hanging':
                return 0;
            case 'bottom':
            case 'alphabetic':
            case 'ideographic':
                return 1;
            case 'middle':
                return 0.5;
        }
    }
    getApproximateBBox() {
        var _a;
        let width = 0;
        let firstLineHeight = 0;
        // Distance between first and last base lines.
        let baselineDistance = 0;
        if (this.lines.length > 0) {
            const lineSize = hdpiCanvas_1.HdpiCanvas.getTextSize(this.lines[0], this.font);
            width = lineSize.width;
            firstLineHeight = lineSize.height;
        }
        for (let i = 1; i < this.lines.length; i++) {
            const lineSize = hdpiCanvas_1.HdpiCanvas.getTextSize(this.lines[i], this.font);
            width = Math.max(width, lineSize.width);
            baselineDistance += (_a = this.lineHeight) !== null && _a !== void 0 ? _a : lineSize.height;
        }
        let { x, y } = this;
        switch (this.textAlign) {
            case 'end':
            case 'right':
                x -= width;
                break;
            case 'center':
                x -= width / 2;
        }
        switch (this.textBaseline) {
            case 'alphabetic':
                y -= firstLineHeight * 0.7 + baselineDistance * 0.5;
                break;
            case 'middle':
                y -= firstLineHeight * 0.45 + baselineDistance * 0.5;
                break;
            case 'ideographic':
                y -= firstLineHeight + baselineDistance;
                break;
            case 'hanging':
                y -= firstLineHeight * 0.2 + baselineDistance * 0.5;
                break;
            case 'bottom':
                y -= firstLineHeight + baselineDistance;
                break;
        }
        return new bbox_1.BBox(x, y, width, firstLineHeight + baselineDistance);
    }
    getLineHeight(line) {
        var _a, _b;
        if (this.lineHeight)
            return this.lineHeight;
        if (hdpiCanvas_1.HdpiCanvas.has.textMetrics) {
            const metrics = hdpiCanvas_1.HdpiCanvas.measureText(line, this.font, this.textBaseline, this.textAlign);
            return (((_a = metrics.fontBoundingBoxAscent) !== null && _a !== void 0 ? _a : metrics.emHeightAscent) +
                ((_b = metrics.fontBoundingBoxDescent) !== null && _b !== void 0 ? _b : metrics.emHeightDescent));
        }
        return hdpiCanvas_1.HdpiCanvas.getTextSize(line, this.font).height;
    }
    isPointInPath(x, y) {
        const point = this.transformPoint(x, y);
        const bbox = this.computeBBox();
        return bbox ? bbox.containsPoint(point.x, point.y) : false;
    }
    render(renderCtx) {
        const { ctx, forceRender, stats } = renderCtx;
        if (this.dirty === node_1.RedrawType.NONE && !forceRender) {
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
            const { fillShadow } = this;
            if (fillShadow && fillShadow.enabled) {
                ctx.shadowColor = fillShadow.color;
                ctx.shadowOffsetX = fillShadow.xOffset * pixelRatio;
                ctx.shadowOffsetY = fillShadow.yOffset * pixelRatio;
                ctx.shadowBlur = fillShadow.blur * pixelRatio;
            }
            this.renderLines((line, x, y) => ctx.fillText(line, x, y));
        }
        if (stroke && strokeWidth) {
            ctx.strokeStyle = stroke;
            ctx.lineWidth = strokeWidth;
            ctx.globalAlpha = globalAlpha * this.opacity * this.strokeOpacity;
            const { lineDash, lineDashOffset, lineCap, lineJoin } = this;
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
            this.renderLines((line, x, y) => ctx.strokeText(line, x, y));
        }
        super.render(renderCtx);
    }
    renderLines(renderCallback) {
        const { lines, x, y } = this;
        const lineHeights = this.lines.map((line) => this.getLineHeight(line));
        const totalHeight = lineHeights.reduce((a, b) => a + b, 0);
        let offsetY = -(totalHeight - lineHeights[0]) * this.getVerticalOffset();
        for (let i = 0; i < lines.length; i++) {
            renderCallback(lines[i], x, y + offsetY);
            offsetY += lineHeights[i];
        }
    }
}
Text.className = 'Text';
Text.defaultStyles = Object.assign({}, shape_1.Shape.defaultStyles, {
    textAlign: 'start',
    fontStyle: undefined,
    fontWeight: undefined,
    fontSize: 10,
    fontFamily: 'sans-serif',
    textBaseline: 'alphabetic',
});
__decorate([
    node_1.SceneChangeDetection({ redraw: node_1.RedrawType.MAJOR })
], Text.prototype, "x", void 0);
__decorate([
    node_1.SceneChangeDetection({ redraw: node_1.RedrawType.MAJOR })
], Text.prototype, "y", void 0);
__decorate([
    node_1.SceneChangeDetection({ redraw: node_1.RedrawType.MAJOR, changeCb: (o) => o._splitText() })
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
    node_1.SceneChangeDetection({ redraw: node_1.RedrawType.MAJOR })
], Text.prototype, "textAlign", void 0);
__decorate([
    node_1.SceneChangeDetection({ redraw: node_1.RedrawType.MAJOR })
], Text.prototype, "textBaseline", void 0);
__decorate([
    node_1.SceneChangeDetection({ redraw: node_1.RedrawType.MAJOR })
], Text.prototype, "lineHeight", void 0);
exports.Text = Text;
function getFont(fontSize, fontFamily, fontStyle, fontWeight) {
    return [fontStyle || '', fontWeight || '', fontSize + 'px', fontFamily].join(' ').trim();
}
exports.getFont = getFont;
