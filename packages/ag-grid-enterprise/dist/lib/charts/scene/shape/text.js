// ag-grid-enterprise v21.2.2
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var shape_1 = require("./shape");
var object_1 = require("../../util/object");
var bbox_1 = require("../bbox");
var Text = /** @class */ (function (_super) {
    __extends(Text, _super);
    function Text() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._x = 0;
        _this._y = 0;
        _this.lineBreakRe = /\r?\n/g;
        _this.lines = [];
        _this._text = '';
        _this._dirtyFont = true;
        _this._fontStyle = undefined;
        _this._fontWeight = undefined;
        _this._fontSize = 10;
        _this._fontFamily = 'sans-serif';
        _this._textAlign = Text.defaultStyles.textAlign;
        _this._textBaseline = Text.defaultStyles.textBaseline;
        _this._lineHeight = 14;
        return _this;
    }
    Object.defineProperty(Text.prototype, "x", {
        get: function () {
            return this._x;
        },
        set: function (value) {
            if (this._x !== value) {
                this._x = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Text.prototype, "y", {
        get: function () {
            return this._y;
        },
        set: function (value) {
            if (this._y !== value) {
                this._y = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Text.prototype.splitText = function () {
        this.lines = this._text.split(this.lineBreakRe);
    };
    Object.defineProperty(Text.prototype, "text", {
        get: function () {
            return this._text;
        },
        set: function (value) {
            var str = String(value); // `value` can be an object here
            if (this._text !== str) {
                this._text = str;
                this.splitText();
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Text.prototype, "font", {
        get: function () {
            if (this.dirtyFont) {
                this.dirtyFont = false;
                return this._font = [
                    this.fontStyle || '',
                    this.fontWeight || '',
                    this.fontSize + 'px',
                    this.fontFamily
                ].join(' ').trim();
            }
            return this._font;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Text.prototype, "dirtyFont", {
        get: function () {
            return this._dirtyFont;
        },
        set: function (value) {
            if (this._dirtyFont !== value) {
                this._dirtyFont = value;
                if (value) {
                    this.dirty = true;
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Text.prototype, "fontStyle", {
        get: function () {
            return this._fontStyle;
        },
        set: function (value) {
            if (this._fontStyle !== value) {
                this._fontStyle = value;
                this.dirtyFont = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Text.prototype, "fontWeight", {
        get: function () {
            return this._fontWeight;
        },
        set: function (value) {
            if (this._fontWeight !== value) {
                this._fontWeight = value;
                this.dirtyFont = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Text.prototype, "fontSize", {
        get: function () {
            return this._fontSize;
        },
        set: function (value) {
            if (!isFinite(value)) {
                value = 10;
            }
            if (this._fontSize !== value) {
                this._fontSize = value;
                this.dirtyFont = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Text.prototype, "fontFamily", {
        get: function () {
            return this._fontFamily;
        },
        set: function (value) {
            if (this._fontFamily !== value) {
                this._fontFamily = value;
                this.dirtyFont = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Text.prototype, "textAlign", {
        get: function () {
            return this._textAlign;
        },
        set: function (value) {
            if (this._textAlign !== value) {
                this._textAlign = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Text.prototype, "textBaseline", {
        get: function () {
            return this._textBaseline;
        },
        set: function (value) {
            if (this._textBaseline !== value) {
                this._textBaseline = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Text.prototype, "lineHeight", {
        get: function () {
            return this._lineHeight;
        },
        set: function (value) {
            // Multi-line text is complicated because:
            // - Canvas does not support it natively, so we have to implement it manually
            // - need to know the height of each line -> need to parse the font shorthand ->
            //   generally impossible to do because font size may not be in pixels
            // - so, need to measure the text instead, each line individually -> expensive
            // - or make the user provide the line height manually for multi-line text
            // - getBBox should use the lineHeight for multi-line text but ignore it otherwise
            // - textBaseline kind of loses its meaning for multi-line text
            if (this._lineHeight !== value) {
                this._lineHeight = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Text.prototype.getBBox = function () {
        return this.scene
            ? this.scene.canvas.has.textMetrics
                ? this.getPreciseBBox()
                : this.getApproximateBBox()
            : undefined;
    };
    Text.prototype.getPreciseBBox = function () {
        var metrics = this.scene.canvas.measureText(this.text, this.font, this.textBaseline, this.textAlign);
        return new bbox_1.BBox(this.x - metrics.actualBoundingBoxLeft, this.y - metrics.actualBoundingBoxAscent, metrics.width, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent);
    };
    Text.prototype.getApproximateBBox = function () {
        var size = this.scene.canvas.getTextSize(this.text, this.font);
        var x = this.x;
        var y = this.y;
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
    };
    Text.prototype.isPointInPath = function (x, y) {
        var point = this.transformPoint(x, y);
        var bbox = this.getBBox();
        return bbox ? bbox.containsPoint(point.x, point.y) : false;
    };
    Text.prototype.isPointInStroke = function (x, y) {
        return false;
    };
    Text.prototype.render = function (ctx) {
        if (!this.scene || !this.lines.length) {
            return;
        }
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        // this.matrix.transformBBox(this.getBBox!()).render(ctx); // debug
        this.matrix.toContext(ctx);
        if (this.opacity < 1) {
            ctx.globalAlpha = this.opacity;
        }
        ctx.font = this.font;
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = this.textBaseline;
        var pixelRatio = this.scene.canvas.pixelRatio || 1;
        if (this.fill) {
            ctx.fillStyle = this.fill;
            var fillShadow = this.fillShadow;
            if (fillShadow && fillShadow.enabled) {
                ctx.shadowColor = fillShadow.color;
                ctx.shadowOffsetX = fillShadow.xOffset * pixelRatio;
                ctx.shadowOffsetY = fillShadow.yOffset * pixelRatio;
                ctx.shadowBlur = fillShadow.blur * pixelRatio;
            }
            ctx.fillText(this.text, this.x, this.y);
            // this.lines.forEach((text, index) => {
            //     ctx.fillText(text, this.x, this.y + index * this.lineHeight);
            // });
        }
        if (this.stroke && this.strokeWidth) {
            ctx.strokeStyle = this.stroke;
            ctx.lineWidth = this.strokeWidth;
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
            var strokeShadow = this.strokeShadow;
            if (strokeShadow && strokeShadow.enabled) {
                ctx.shadowColor = strokeShadow.color;
                ctx.shadowOffsetX = strokeShadow.xOffset * pixelRatio;
                ctx.shadowOffsetY = strokeShadow.yOffset * pixelRatio;
                ctx.shadowBlur = strokeShadow.blur * pixelRatio;
            }
            ctx.strokeText(this.text, this.x, this.y);
        }
        this.dirty = false;
    };
    Text.className = 'Text';
    Text.defaultStyles = object_1.chainObjects(shape_1.Shape.defaultStyles, {
        textAlign: 'start',
        fontStyle: undefined,
        fontWeight: undefined,
        fontSize: 10,
        fontFamily: 'sans-serif',
        textBaseline: 'alphabetic'
    });
    return Text;
}(shape_1.Shape));
exports.Text = Text;
