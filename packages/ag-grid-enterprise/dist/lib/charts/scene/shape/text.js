// ag-grid-enterprise v21.0.1
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
var hdpiCanvas_1 = require("../../canvas/hdpiCanvas");
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
        _this._font = Text.defaultStyles.font;
        _this._textAlign = Text.defaultStyles.textAlign;
        _this._textBaseline = Text.defaultStyles.textBaseline;
        _this.getBBox = hdpiCanvas_1.HdpiCanvas.has.textMetrics
            ? function () {
                var metrics = hdpiCanvas_1.HdpiCanvas.measureText(_this.text, _this.font, _this.textBaseline, _this.textAlign);
                return new bbox_1.BBox(_this.x - metrics.actualBoundingBoxLeft, _this.y - metrics.actualBoundingBoxAscent, metrics.width, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent);
            }
            : function () {
                var size = hdpiCanvas_1.HdpiCanvas.getTextSize(_this.text, _this.font);
                var x = _this.x;
                var y = _this.y;
                switch (_this.textAlign) {
                    case 'end':
                    case 'right':
                        x -= size.width;
                        break;
                    case 'center':
                        x -= size.width / 2;
                }
                switch (_this.textBaseline) {
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
            return this._font;
        },
        set: function (value) {
            if (this._font !== value) {
                this._font = value;
                this.dirty = true;
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
    Text.prototype.isPointInPath = function (x, y) {
        var point = this.transformPoint(x, y);
        var bbox = this.getBBox();
        return bbox.containsPoint(point.x, point.y);
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
        this.matrix.toContext(ctx);
        if (this.opacity < 1) {
            ctx.globalAlpha = this.opacity;
        }
        ctx.font = this.font;
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = this.textBaseline;
        var pixelRatio = this.scene.hdpiCanvas.pixelRatio || 1;
        if (this.fill) {
            ctx.fillStyle = this.fill;
            var fillShadow = this.fillShadow;
            if (fillShadow) {
                ctx.shadowColor = fillShadow.color;
                ctx.shadowOffsetX = fillShadow.offset.x * pixelRatio;
                ctx.shadowOffsetY = fillShadow.offset.y * pixelRatio;
                ctx.shadowBlur = fillShadow.blur * pixelRatio;
            }
            ctx.fillText(this.text, this.x, this.y);
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
            if (strokeShadow) {
                ctx.shadowColor = strokeShadow.color;
                ctx.shadowOffsetX = strokeShadow.offset.x * pixelRatio;
                ctx.shadowOffsetY = strokeShadow.offset.y * pixelRatio;
                ctx.shadowBlur = strokeShadow.blur * pixelRatio;
            }
            ctx.strokeText(this.text, this.x, this.y);
        }
        // // debug
        // this.matrix.transformBBox(this.getBBox!()).render(ctx);
        this.dirty = false;
    };
    Text.className = 'Text';
    Text.defaultStyles = object_1.chainObjects(shape_1.Shape.defaultStyles, {
        textAlign: 'start',
        font: '10px sans-serif',
        textBaseline: 'alphabetic'
    });
    return Text;
}(shape_1.Shape));
exports.Text = Text;
