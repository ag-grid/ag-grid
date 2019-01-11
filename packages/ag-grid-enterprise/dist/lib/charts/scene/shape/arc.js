// ag-grid-enterprise v20.0.0
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
var path_1 = require("../path");
var Arc = /** @class */ (function (_super) {
    __extends(Arc, _super);
    function Arc() {
        var _this = _super.call(this) || this;
        // Declare a path to retain for later rendering and hit testing
        // using custom Path class. It's pure TypeScript and works in all browsers.
        _this.path = new path_1.Path();
        _this._x = Arc.defaults.x;
        _this._y = Arc.defaults.y;
        _this._radius = Arc.defaults.radius;
        _this._startAngle = Arc.defaults.startAngle;
        _this._endAngle = Arc.defaults.endAngle;
        _this._anticlockwise = Arc.defaults.anticlockwise;
        _this.fillStyle = Arc.defaults.fillStyle;
        _this.strokeStyle = Arc.defaults.strokeStyle;
        return _this;
    }
    Object.defineProperty(Arc.prototype, "x", {
        get: function () {
            return this._x;
        },
        set: function (value) {
            this._x = value;
            this.dirty = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Arc.prototype, "y", {
        get: function () {
            return this._y;
        },
        set: function (value) {
            this._y = value;
            this.dirty = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Arc.prototype, "radius", {
        get: function () {
            return this._radius;
        },
        set: function (value) {
            this._radius = value;
            this.dirty = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Arc.prototype, "startAngle", {
        get: function () {
            return this._startAngle;
        },
        set: function (value) {
            this._startAngle = value;
            this.dirty = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Arc.prototype, "endAngle", {
        get: function () {
            return this._endAngle;
        },
        set: function (value) {
            this._endAngle = value;
            this.dirty = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Arc.prototype, "anticlockwise", {
        get: function () {
            return this._anticlockwise;
        },
        set: function (value) {
            this._anticlockwise = value;
            this.dirty = true;
        },
        enumerable: true,
        configurable: true
    });
    Arc.prototype.updatePath = function () {
        var path = this.path;
        path.clear(); // No need to recreate the Path, can simply clear the existing one.
        // This is much faster than the native Path2D implementation even though this `cubicArc`
        // method is pure TypeScript and actually produces the definition of an elliptical arc,
        // where you can specify two radii and rotation, while Path2D's `arc` method simply produces
        // a circular arc. Maybe it's due to the experimental nature of the Path2D class,
        // maybe it's because we have to create a new instance of it on each render, who knows...
        path.cubicArc(this.x, this.y, this.radius, this.radius, 0, this.startAngle, this.endAngle, this.anticlockwise ? 1 : 0);
        path.closePath();
    };
    Arc.prototype.isPointInPath = function (ctx, x, y) {
        // TODO: implement hit testing in the Path class.
        // For example:
        // return this.path.isPointInPath(x, y);
        return false;
    };
    Arc.prototype.isPointInStroke = function (ctx, x, y) {
        return false;
    };
    Arc.prototype.render = function (ctx) {
        if (this.scene) {
            this.updatePath();
            this.applyContextAttributes(ctx);
            this.scene.appendPath(this.path);
            ctx.fill();
            ctx.stroke();
        }
        this.dirty = false;
    };
    Arc.defaults = object_1.chainObjects(shape_1.Shape.defaults, {
        fillStyle: 'red',
        strokeStyle: 'black',
        x: 0,
        y: 0,
        radius: 10,
        startAngle: 0,
        endAngle: Math.PI * 2,
        anticlockwise: false
    });
    return Arc;
}(shape_1.Shape));
exports.Arc = Arc;
