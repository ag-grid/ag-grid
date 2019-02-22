// ag-grid-enterprise v20.1.0
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
var Rect = /** @class */ (function (_super) {
    __extends(Rect, _super);
    function Rect() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.path = new path2D_1.Path2D();
        _this._isDirtyPath = true;
        _this._x = 0;
        _this._y = 0;
        _this._width = 10;
        _this._height = 10;
        _this._radius = 0;
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
    Object.defineProperty(Rect.prototype, "isDirtyPath", {
        get: function () {
            return this._isDirtyPath;
        },
        set: function (value) {
            if (this._isDirtyPath !== value) {
                this._isDirtyPath = value;
                if (value) {
                    this.isDirty = true;
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
                this.isDirtyPath = true;
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
                this.isDirtyPath = true;
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
                this.isDirtyPath = true;
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
                this.isDirtyPath = true;
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
                this.isDirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Rect.prototype.updatePath = function () {
        if (!this.isDirtyPath)
            return;
        var path = this.path;
        var radius = this.radius;
        path.clear();
        if (!radius) {
            path.rect(this.x, this.y, this.width, this.height);
        }
        else {
            // TODO: rect radius, this will require implementing
            //       another `arcTo` method in the `Path2D` class.
            throw "TODO";
        }
        this.isDirtyPath = false;
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
        if (this.isDirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);
        this.applyContextAttributes(ctx);
        this.updatePath();
        this.scene.appendPath(this.path);
        if (this.fillStyle) {
            ctx.fill();
        }
        if (this.strokeStyle) {
            ctx.stroke();
        }
        this.isDirty = false;
    };
    return Rect;
}(shape_1.Shape));
exports.Rect = Rect;
