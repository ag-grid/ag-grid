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
var Arc = /** @class */ (function (_super) {
    __extends(Arc, _super);
    function Arc() {
        var _this = _super.call(this) || this;
        // Declare a path to feed to `context.fill/stroke` using experimental native Path2D class.
        // Doesn't work in IE.
        _this.path = new Path2D();
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
        this.path = new Path2D();
        // No way to clear existing Path2D, have to create a new one each time.
        this.path.arc(this.x, this.y, this.radius, this.startAngle, this.endAngle, this.anticlockwise);
        this.path.closePath();
    };
    Arc.prototype.isPointInPath = function (ctx, x, y) {
        return ctx.isPointInPath(this.path, x, y);
    };
    Arc.prototype.isPointInStroke = function (ctx, x, y) {
        return ctx.isPointInStroke(this.path, x, y);
    };
    Arc.prototype.render = function (ctx) {
        // Path2D approach:
        this.updatePath();
        this.applyContextAttributes(ctx);
        ctx.fill(this.path);
        ctx.stroke(this.path);
        // Traditional approach:
        // this.applyContextAttributes(ctx);
        // ctx.beginPath();
        // ctx.arc(this.x, this.y, this.radius, this.startAngle, this.endAngle, this.anticlockwise);
        // ctx.fill();
        // ctx.stroke();
        // About 15% performance loss for re-creating and retaining a Path2D
        // object for hit testing.
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
