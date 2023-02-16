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
        // Multi-line text is complicated because:
        // - Canvas does not support it natively, so we have to implement it manually
        // - need to know the height of each line -> need to parse the font shorthand ->
        //   generally impossible to do because font size may not be in pixels
        // - so, need to measure the text instead, each line individually -> expensive
        // - or make the user provide the line height manually for multi-line text
        // - computeBBox should use the lineHeight for multi-line text but ignore it otherwise
        // - textBaseline kind of loses its meaning for multi-line text
        _this.lineHeight = 14;
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
        var metrics = HdpiCanvas.measureText(this.text, this.font, this.textBaseline, this.textAlign);
        return new BBox(this.x - metrics.actualBoundingBoxLeft, this.y - metrics.actualBoundingBoxAscent, metrics.width, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent);
    };
    Text.prototype.getApproximateBBox = function () {
        var size = HdpiCanvas.getTextSize(this.text, this.font);
        var _a = this, x = _a.x, y = _a.y;
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
            var _b = this, fillShadow = _b.fillShadow, text = _b.text, x = _b.x, y = _b.y;
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
            var _c = this, lineDash = _c.lineDash, lineDashOffset = _c.lineDashOffset, lineCap = _c.lineCap, lineJoin = _c.lineJoin, text = _c.text, x = _c.x, y = _c.y;
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
        _super.prototype.render.call(this, renderCtx);
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
