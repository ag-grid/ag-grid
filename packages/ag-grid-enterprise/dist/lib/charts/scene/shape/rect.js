// ag-grid-enterprise v20.2.0
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
var canvas_1 = require("../../canvas/canvas");
// _pixelSnap(3) compiles to Object(_canvas_canvas__WEBPACK_IMPORTED_MODULE_3__["pixelSnap"])(3)
// This has some performance hit and is not nice for readability nor debugging.
// For example, it shows up as `pixelSnap` in the Sources tab, but can't
// be called from console like that.
// See https://github.com/webpack/webpack/issues/5600
// The suggested `concatenateModules: true` config made no difference.
var pixelSnap = canvas_1.pixelSnap;
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
        _this.getBBox = function () {
            return {
                x: _this.x,
                y: _this.y,
                width: _this.width,
                height: _this.height
            };
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
    Object.defineProperty(Rect.prototype, "lineWidth", {
        get: function () {
            return this._lineWidth;
        },
        set: function (value) {
            if (this._lineWidth !== value) {
                this._lineWidth = value;
                // Normally, when the `lineWidth` changes, we only need to repaint the rect
                // without updating the path. If the `isCrisp` is set to `true` however,
                // we need to update the path to make sure the new stroke aligns to
                // the pixel grid. This is the reason we override the `lineWidth` setter
                // and getter here.
                if (this.crisp) {
                    this.dirtyPath = true;
                }
                else {
                    this.dirty = true;
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Rect.prototype.updatePath = function () {
        if (!this.dirtyPath)
            return;
        var path = this.path;
        var radius = this.radius;
        path.clear();
        if (!radius) {
            if (this.crisp) {
                path.rect(Math.round(this.x) + pixelSnap(this.lineWidth), Math.round(this.y) + pixelSnap(this.lineWidth), Math.round(this.width) + Math.round(this.x % 1 + this.width % 1), Math.round(this.height) + Math.round(this.y % 1 + this.height % 1));
            }
            else {
                path.rect(this.x, this.y, this.width, this.height);
            }
        }
        else {
            // TODO: rect radius, this will require implementing
            //       another `arcTo` method in the `Path2D` class.
            throw "TODO";
        }
        this.dirtyPath = false;
    };
    Rect.prototype.isPointInPath = function (x, y) {
        var point = this.transformPoint(x, y);
        var bbox = this.getBBox();
        return bbox_1.isPointInBBox(bbox, point.x, point.y);
    };
    Rect.prototype.isPointInStroke = function (x, y) {
        return false;
    };
    Rect.prototype.render = function (ctx) {
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);
        this.applyContextAttributes(ctx);
        this.updatePath();
        this.scene.appendPath(this.path);
        if (this.fillStyle) {
            ctx.fill();
        }
        if (this.lineWidth && this.strokeStyle) {
            ctx.stroke();
        }
        this.dirty = false;
    };
    return Rect;
}(shape_1.Shape));
exports.Rect = Rect;
