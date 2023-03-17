var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
import { Shape } from './shape';
import { BBox } from '../bbox';
import { HdpiCanvas } from '../../canvas/hdpiCanvas';
import { RedrawType, SceneChangeDetection } from '../node';
function SceneFontChangeDetection(opts) {
    var _a = opts || {}, _b = _a.redraw, redraw = _b === void 0 ? RedrawType.MAJOR : _b, changeCb = _a.changeCb;
    return SceneChangeDetection({ redraw: redraw, type: 'font', changeCb: changeCb });
}
var Text = /** @class */ (function (_super) {
    __extends(Text, _super);
    function Text() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.x = 0;
        _this.y = 0;
        _this.lines = [];
        _this.text = '';
        _this._dirtyFont = true;
        _this.fontSize = 10;
        _this.fontFamily = 'sans-serif';
        _this.textAlign = Text.defaultStyles.textAlign;
        _this.textBaseline = Text.defaultStyles.textBaseline;
        // TextMetrics are used if lineHeight is not defined.
        _this.lineHeight = undefined;
        return _this;
    }
    Text.prototype._splitText = function () {
        this.lines = typeof this.text === 'string' ? this.text.split(/\r?\n/g) : [];
    };
    Object.defineProperty(Text.prototype, "font", {
        get: function () {
            if (this._dirtyFont) {
                this._dirtyFont = false;
                this._font = getFont(this.fontSize, this.fontFamily, this.fontStyle, this.fontWeight);
            }
            return this._font;
        },
        enumerable: false,
        configurable: true
    });
    Text.prototype.computeBBox = function () {
        return HdpiCanvas.has.textMetrics ? this.getPreciseBBox() : this.getApproximateBBox();
    };
    Text.prototype.getPreciseBBox = function () {
        var _a, _b;
        var left = 0;
        var top = 0;
        var width = 0;
        var height = 0;
        // Distance between first and last base lines.
        var baselineDistance = 0;
        for (var i = 0; i < this.lines.length; i++) {
            var metrics = HdpiCanvas.measureText(this.lines[i], this.font, this.textBaseline, this.textAlign);
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
        return new BBox(this.x - left, this.y - top, width, height);
    };
    Text.prototype.getVerticalOffset = function () {
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
    };
    Text.prototype.getApproximateBBox = function () {
        var _a;
        var width = 0;
        var firstLineHeight = 0;
        // Distance between first and last base lines.
        var baselineDistance = 0;
        if (this.lines.length > 0) {
            var lineSize = HdpiCanvas.getTextSize(this.lines[0], this.font);
            width = lineSize.width;
            firstLineHeight = lineSize.height;
        }
        for (var i = 1; i < this.lines.length; i++) {
            var lineSize = HdpiCanvas.getTextSize(this.lines[i], this.font);
            width = Math.max(width, lineSize.width);
            baselineDistance += (_a = this.lineHeight) !== null && _a !== void 0 ? _a : lineSize.height;
        }
        var _b = this, x = _b.x, y = _b.y;
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
        return new BBox(x, y, width, firstLineHeight + baselineDistance);
    };
    Text.prototype.getLineHeight = function (line) {
        var _a, _b;
        if (this.lineHeight)
            return this.lineHeight;
        if (HdpiCanvas.has.textMetrics) {
            var metrics = HdpiCanvas.measureText(line, this.font, this.textBaseline, this.textAlign);
            return (((_a = metrics.fontBoundingBoxAscent) !== null && _a !== void 0 ? _a : metrics.emHeightAscent) +
                ((_b = metrics.fontBoundingBoxDescent) !== null && _b !== void 0 ? _b : metrics.emHeightDescent));
        }
        return HdpiCanvas.getTextSize(line, this.font).height;
    };
    Text.prototype.isPointInPath = function (x, y) {
        var point = this.transformPoint(x, y);
        var bbox = this.computeBBox();
        return bbox ? bbox.containsPoint(point.x, point.y) : false;
    };
    Text.prototype.render = function (renderCtx) {
        var ctx = renderCtx.ctx, forceRender = renderCtx.forceRender, stats = renderCtx.stats;
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
        var _a = this, fill = _a.fill, stroke = _a.stroke, strokeWidth = _a.strokeWidth;
        ctx.font = this.font;
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = this.textBaseline;
        var pixelRatio = this.layerManager.canvas.pixelRatio || 1;
        var globalAlpha = ctx.globalAlpha;
        if (fill) {
            ctx.fillStyle = fill;
            ctx.globalAlpha = globalAlpha * this.opacity * this.fillOpacity;
            var fillShadow = this.fillShadow;
            if (fillShadow && fillShadow.enabled) {
                ctx.shadowColor = fillShadow.color;
                ctx.shadowOffsetX = fillShadow.xOffset * pixelRatio;
                ctx.shadowOffsetY = fillShadow.yOffset * pixelRatio;
                ctx.shadowBlur = fillShadow.blur * pixelRatio;
            }
            this.renderLines(function (line, x, y) { return ctx.fillText(line, x, y); });
        }
        if (stroke && strokeWidth) {
            ctx.strokeStyle = stroke;
            ctx.lineWidth = strokeWidth;
            ctx.globalAlpha = globalAlpha * this.opacity * this.strokeOpacity;
            var _b = this, lineDash = _b.lineDash, lineDashOffset = _b.lineDashOffset, lineCap = _b.lineCap, lineJoin = _b.lineJoin;
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
            this.renderLines(function (line, x, y) { return ctx.strokeText(line, x, y); });
        }
        _super.prototype.render.call(this, renderCtx);
    };
    Text.prototype.renderLines = function (renderCallback) {
        var _this = this;
        var _a = this, lines = _a.lines, x = _a.x, y = _a.y;
        var lineHeights = this.lines.map(function (line) { return _this.getLineHeight(line); });
        var totalHeight = lineHeights.reduce(function (a, b) { return a + b; }, 0);
        var offsetY = -(totalHeight - lineHeights[0]) * this.getVerticalOffset();
        for (var i = 0; i < lines.length; i++) {
            renderCallback(lines[i], x, y + offsetY);
            offsetY += lineHeights[i];
        }
    };
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
        SceneChangeDetection({ redraw: RedrawType.MAJOR, changeCb: function (o) { return o._splitText(); } })
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
    return Text;
}(Shape));
export { Text };
export function getFont(fontSize, fontFamily, fontStyle, fontWeight) {
    return [fontStyle || '', fontWeight || '', fontSize + 'px', fontFamily].join(' ').trim();
}
