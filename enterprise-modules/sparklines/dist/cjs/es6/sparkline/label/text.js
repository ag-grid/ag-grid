"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const object_1 = require("../../util/object");
const hdpiCanvas_1 = require("../../canvas/hdpiCanvas");
const shape_1 = require("../../scene/shape/shape");
const bbox_1 = require("../../scene/bbox");
class Text extends shape_1.Shape {
    constructor() {
        super(...arguments);
        this._x = 0;
        this._y = 0;
        this.lineBreakRegex = /\r?\n/g;
        this.lines = [];
        this._text = '';
        this._dirtyFont = true;
        this._fontSize = 10;
        this._fontFamily = 'sans-serif';
        this._textAlign = Text.defaultStyles.textAlign;
        this._textBaseline = Text.defaultStyles.textBaseline;
        this._lineHeight = 14;
    }
    set x(value) {
        if (this._x !== value) {
            this._x = value;
            this.dirty = true;
        }
    }
    get x() {
        return this._x;
    }
    set y(value) {
        if (this._y !== value) {
            this._y = value;
            this.dirty = true;
        }
    }
    get y() {
        return this._y;
    }
    splitText() {
        this.lines = this._text.split(this.lineBreakRegex);
    }
    set text(value) {
        const str = String(value); // `value` can be an object here
        if (this._text !== str) {
            this._text = str;
            this.splitText();
            this.dirty = true;
        }
    }
    get text() {
        return this._text;
    }
    get font() {
        if (this.dirtyFont) {
            this.dirtyFont = false;
            this._font = getFont(this.fontSize, this.fontFamily, this.fontStyle, this.fontWeight);
        }
        return this._font;
    }
    set dirtyFont(value) {
        if (this._dirtyFont !== value) {
            this._dirtyFont = value;
            if (value) {
                this.dirty = true;
            }
        }
    }
    get dirtyFont() {
        return this._dirtyFont;
    }
    set fontStyle(value) {
        if (this._fontStyle !== value) {
            this._fontStyle = value;
            this.dirtyFont = true;
        }
    }
    get fontStyle() {
        return this._fontStyle;
    }
    set fontWeight(value) {
        if (this._fontWeight !== value) {
            this._fontWeight = value;
            this.dirtyFont = true;
        }
    }
    get fontWeight() {
        return this._fontWeight;
    }
    set fontSize(value) {
        if (!isFinite(value)) {
            value = 10;
        }
        if (this._fontSize !== value) {
            this._fontSize = value;
            this.dirtyFont = true;
        }
    }
    get fontSize() {
        return this._fontSize;
    }
    set fontFamily(value) {
        if (this._fontFamily !== value) {
            this._fontFamily = value;
            this.dirtyFont = true;
        }
    }
    get fontFamily() {
        return this._fontFamily;
    }
    set textAlign(value) {
        if (this._textAlign !== value) {
            this._textAlign = value;
            this.dirty = true;
        }
    }
    get textAlign() {
        return this._textAlign;
    }
    set textBaseline(value) {
        if (this._textBaseline !== value) {
            this._textBaseline = value;
            this.dirty = true;
        }
    }
    get textBaseline() {
        return this._textBaseline;
    }
    set lineHeight(value) {
        // Multi-line text is complicated because:
        // - Canvas does not support it natively, so we have to implement it manually
        // - need to know the height of each line -> need to parse the font shorthand ->
        //   generally impossible to do because font size may not be in pixels
        // - so, need to measure the text instead, each line individually -> expensive
        // - or make the user provide the line height manually for multi-line text
        // - computeBBox should use the lineHeight for multi-line text but ignore it otherwise
        // - textBaseline kind of loses its meaning for multi-line text
        if (this._lineHeight !== value) {
            this._lineHeight = value;
            this.dirty = true;
        }
    }
    get lineHeight() {
        return this._lineHeight;
    }
    computeBBox() {
        return hdpiCanvas_1.HdpiCanvas.has.textMetrics ? this.getPreciseBBox() : this.getApproximateBBox();
    }
    getPreciseBBox() {
        const metrics = hdpiCanvas_1.HdpiCanvas.measureText(this.text, this.font, this.textBaseline, this.textAlign);
        return new bbox_1.BBox(this.x - metrics.actualBoundingBoxLeft, this.y - metrics.actualBoundingBoxAscent, metrics.width, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent);
    }
    getApproximateBBox() {
        const size = hdpiCanvas_1.HdpiCanvas.getTextSize(this.text, this.font);
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
        return new bbox_1.BBox(x, y, size.width, size.height);
    }
    isPointInPath(x, y) {
        const point = this.transformPoint(x, y);
        const bbox = this.computeBBox();
        return bbox ? bbox.containsPoint(point.x, point.y) : false;
    }
    isPointInStroke(x, y) {
        return false;
    }
    render(ctx) {
        if (!this.lines.length || !this.scene) {
            return;
        }
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        // this.matrix.transformBBox(this.computeBBox!()).render(ctx); // debug
        this.matrix.toContext(ctx);
        const { fill, stroke, strokeWidth } = this;
        ctx.font = this.font;
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = this.textBaseline;
        const pixelRatio = this.scene.canvas.pixelRatio || 1;
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
            const { lineDash, lineDashOffset, lineCap, lineJoin, strokeShadow, text, x, y } = this;
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
            if (strokeShadow && strokeShadow.enabled) {
                ctx.shadowColor = strokeShadow.color;
                ctx.shadowOffsetX = strokeShadow.xOffset * pixelRatio;
                ctx.shadowOffsetY = strokeShadow.yOffset * pixelRatio;
                ctx.shadowBlur = strokeShadow.blur * pixelRatio;
            }
            ctx.strokeText(text, x, y);
        }
        this.dirty = false;
    }
}
exports.Text = Text;
Text.className = 'Text';
Text.defaultStyles = object_1.chainObjects(shape_1.Shape.defaultStyles, {
    textAlign: 'start',
    fontStyle: undefined,
    fontWeight: undefined,
    fontSize: 10,
    fontFamily: 'sans-serif',
    textBaseline: 'alphabetic',
});
function getFont(fontSize, fontFamily, fontStyle, fontWeight) {
    return [fontStyle || '', fontWeight || '', fontSize + 'px', fontFamily].join(' ').trim();
}
exports.getFont = getFont;
