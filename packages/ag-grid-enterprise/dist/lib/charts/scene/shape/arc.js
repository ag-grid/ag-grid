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
/**
 * Elliptical arc node.
 */
var Arc = /** @class */ (function (_super) {
    __extends(Arc, _super);
    function Arc() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // Declare a path to retain for later rendering and hit testing
        // using custom Path2D class. It's pure TypeScript and works in all browsers.
        _this.path = new path2D_1.Path2D();
        /**
         * It's not always that the path has to be updated.
         * For example, if transform attributes (such as `translationX`)
         * are changed, we don't have to update the path. The `dirtyFlag`
         * is how we keep track if the path has to be updated or not.
         */
        _this._isDirtyPath = true;
        _this._centerX = 0;
        _this._centerY = 0;
        _this._radiusX = 10;
        _this._radiusY = 10;
        _this._startAngle = 0;
        _this._endAngle = Math.PI * 2;
        _this._isCounterClockwise = false;
        _this.getBBox = function () {
            return {
                x: _this.centerX - _this.radiusX,
                y: _this.centerY - _this.radiusY,
                width: _this.radiusX * 2,
                height: _this.radiusY * 2
            };
        };
        return _this;
    }
    Arc.create = function (centerX, centerY, radiusX, radiusY, startAngle, endAngle, isCounterClockwise) {
        if (isCounterClockwise === void 0) { isCounterClockwise = false; }
        var arc = new Arc();
        arc.centerX = centerX;
        arc.centerY = centerY;
        arc.radiusX = radiusX;
        arc.radiusY = radiusY;
        arc.startAngle = startAngle;
        arc.endAngle = endAngle;
        arc.isCounterClockwise = isCounterClockwise;
        return arc;
    };
    Object.defineProperty(Arc.prototype, "isDirtyPath", {
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
    Object.defineProperty(Arc.prototype, "centerX", {
        get: function () {
            return this._centerX;
        },
        set: function (value) {
            if (this._centerX !== value) {
                this._centerX = value;
                this.isDirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Arc.prototype, "centerY", {
        get: function () {
            return this._centerY;
        },
        set: function (value) {
            if (this._centerY !== value) {
                this._centerY = value;
                this.isDirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Arc.prototype, "radiusX", {
        get: function () {
            return this._radiusX;
        },
        set: function (value) {
            if (this._radiusX !== value) {
                this._radiusX = value;
                this.isDirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Arc.prototype, "radiusY", {
        get: function () {
            return this._radiusY;
        },
        set: function (value) {
            if (this._radiusY !== value) {
                this._radiusY = value;
                this.isDirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Arc.prototype, "startAngle", {
        get: function () {
            return this._startAngle;
        },
        set: function (value) {
            if (this._startAngle !== value) {
                this._startAngle = value;
                this.isDirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Arc.prototype, "endAngle", {
        get: function () {
            return this._endAngle;
        },
        set: function (value) {
            if (this._endAngle !== value) {
                this._endAngle = value;
                this.isDirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Arc.prototype, "isCounterClockwise", {
        get: function () {
            return this._isCounterClockwise;
        },
        set: function (value) {
            if (this._isCounterClockwise !== value) {
                this._isCounterClockwise = value;
                this.isDirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Arc.prototype, "startAngleDeg", {
        get: function () {
            return this.startAngle / Math.PI * 180;
        },
        set: function (value) {
            this.startAngle = value / 180 * Math.PI;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Arc.prototype, "endAngleDeg", {
        get: function () {
            return this.endAngle / Math.PI * 180;
        },
        set: function (value) {
            this.endAngle = value / 180 * Math.PI;
        },
        enumerable: true,
        configurable: true
    });
    Arc.prototype.updatePath = function () {
        if (!this.isDirtyPath)
            return;
        var path = this.path;
        path.clear(); // No need to recreate the Path, can simply clear the existing one.
        // This is much faster than the native Path2D implementation even though this `cubicArc`
        // method is pure TypeScript and actually produces the definition of an elliptical arc,
        // where you can specify two radii and rotation, while Path2D's `arc` method simply produces
        // a circular arc. Maybe it's due to the experimental nature of the Path2D class,
        // maybe it's because we have to create a new instance of it on each render, who knows...
        path.cubicArc(this.centerX, this.centerY, this.radiusX, this.radiusY, 0, this.startAngle, this.endAngle, this.isCounterClockwise ? 1 : 0);
        path.closePath();
        this.isDirtyPath = false;
    };
    Arc.prototype.isPointInPath = function (x, y) {
        var point = this.transformPoint(x, y);
        var bbox = this.getBBox();
        return bbox_1.isPointInBBox(bbox, point.x, point.y)
            && this.path.isPointInPath(point.x, point.y);
    };
    Arc.prototype.isPointInStroke = function (x, y) {
        return false;
    };
    Arc.prototype.render = function (ctx) {
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
    return Arc;
}(shape_1.Shape));
exports.Arc = Arc;
