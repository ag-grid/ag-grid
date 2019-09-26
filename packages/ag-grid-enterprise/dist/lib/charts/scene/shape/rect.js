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
var path2D_1 = require("../path2D");
var bbox_1 = require("../bbox");
var RectSizing;
(function (RectSizing) {
    RectSizing[RectSizing["Content"] = 0] = "Content";
    RectSizing[RectSizing["Border"] = 1] = "Border";
})(RectSizing = exports.RectSizing || (exports.RectSizing = {}));
var Rect = /** @class */ (function (_super) {
    __extends(Rect, _super);
    function Rect() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.path = new path2D_1.Path2D();
        _this._dirtyPath = true;
        _this._x = 0;
        _this._y = 0;
        _this._width = 10;
        _this._height = 10;
        _this._radius = 0;
        /**
         * If `true`, the rect is aligned to the pixel grid for crisp looking lines.
         * Animated rects may not look nice with this option enabled, for example
         * when a rect is translated by a sub-pixel value on each frame.
         */
        _this._crisp = false;
        _this.effectiveStrokeWidth = shape_1.Shape.defaultStyles.strokeWidth;
        _this._sizing = RectSizing.Content;
        _this.getBBox = function () {
            return new bbox_1.BBox(_this.x, _this.y, _this.width, _this.height);
        };
        return _this;
    }
    Rect.create = function (x, y, width, height, radius) {
        if (radius === void 0) { radius = 0; }
        var rect = new Rect();
        rect.x = x;
        rect.y = y;
        rect.width = width;
        rect.height = height;
        rect.radius = radius;
        return rect;
    };
    Object.defineProperty(Rect.prototype, "dirtyPath", {
        get: function () {
            return this._dirtyPath;
        },
        set: function (value) {
            if (this._dirtyPath !== value) {
                this._dirtyPath = value;
                if (value) {
                    this.dirty = true;
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "x", {
        get: function () {
            return this._x;
        },
        set: function (value) {
            if (this._x !== value) {
                this._x = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "y", {
        get: function () {
            return this._y;
        },
        set: function (value) {
            if (this._y !== value) {
                this._y = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "width", {
        get: function () {
            return this._width;
        },
        set: function (value) {
            if (this._width !== value) {
                this._width = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "height", {
        get: function () {
            return this._height;
        },
        set: function (value) {
            if (this._height !== value) {
                this._height = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "radius", {
        get: function () {
            return this._radius;
        },
        set: function (value) {
            if (this._radius !== value) {
                this._radius = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "crisp", {
        get: function () {
            return this._crisp;
        },
        set: function (value) {
            if (this._crisp !== value) {
                this._crisp = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "strokeWidth", {
        get: function () {
            return this._strokeWidth;
        },
        set: function (value) {
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
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "sizing", {
        get: function () {
            return this._sizing;
        },
        set: function (value) {
            if (this._sizing !== value) {
                this._sizing = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Rect.prototype.updatePath = function () {
        if (!this.dirtyPath) {
            return;
        }
        var borderSizing = this.sizing === RectSizing.Border;
        var path = this.path;
        path.clear();
        var x = this.x;
        var y = this.y;
        var width = this.width;
        var height = this.height;
        var strokeWidth;
        if (borderSizing) {
            var halfWidth = width / 2;
            var halfHeight = height / 2;
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
            var alignment = Math.floor(strokeWidth) % 2 / 2;
            path.rect(Math.floor(x) + alignment, Math.floor(y) + alignment, Math.floor(width) + Math.floor(x % 1 + width % 1), Math.floor(height) + Math.floor(y % 1 + height % 1));
        }
        else {
            path.rect(x, y, width, height);
        }
        this.dirtyPath = false;
    };
    Rect.prototype.isPointInPath = function (x, y) {
        var point = this.transformPoint(x, y);
        var bbox = this.getBBox();
        return bbox.containsPoint(point.x, point.y);
    };
    Rect.prototype.isPointInStroke = function (x, y) {
        return false;
    };
    Rect.prototype.render = function (ctx) {
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);
        this.updatePath();
        this.scene.appendPath(this.path);
        this.fillStroke(ctx);
        this.dirty = false;
    };
    Rect.prototype.fillStroke = function (ctx) {
        if (!this.scene) {
            return;
        }
        var pixelRatio = this.scene.canvas.pixelRatio || 1;
        if (this.fill) {
            ctx.fillStyle = this.fill;
            ctx.globalAlpha = this.opacity * this.fillOpacity;
            // The canvas context scaling (depends on the device's pixel ratio)
            // has no effect on shadows, so we have to account for the pixel ratio
            // manually here.
            var fillShadow = this.fillShadow;
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
            var strokeShadow = this.strokeShadow;
            if (strokeShadow && strokeShadow.enabled) {
                ctx.shadowColor = strokeShadow.color;
                ctx.shadowOffsetX = strokeShadow.xOffset * pixelRatio;
                ctx.shadowOffsetY = strokeShadow.yOffset * pixelRatio;
                ctx.shadowBlur = strokeShadow.blur * pixelRatio;
            }
            ctx.stroke();
        }
    };
    Rect.className = 'Rect';
    return Rect;
}(shape_1.Shape));
exports.Rect = Rect;
