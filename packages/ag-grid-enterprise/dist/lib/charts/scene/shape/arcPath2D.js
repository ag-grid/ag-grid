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
/**
 * Circular arc node that uses the experimental `Path2D` class to define
 * the arc path for further rendering and hit-testing.
 */
var Arc = /** @class */ (function (_super) {
    __extends(Arc, _super);
    function Arc() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // Declare a path to feed to `context.fill/stroke` using experimental native Path2D class.
        // Doesn't work in IE.
        _this.path = new Path2D();
        _this._x = 0;
        _this._y = 0;
        _this._radius = 10;
        _this._startAngle = 0;
        _this._endAngle = Math.PI * 2;
        _this._counterClockwise = false;
        return _this;
    }
    Object.defineProperty(Arc.prototype, "x", {
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
    Object.defineProperty(Arc.prototype, "y", {
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
    Object.defineProperty(Arc.prototype, "radius", {
        get: function () {
            return this._radius;
        },
        set: function (value) {
            if (this._radius !== value) {
                this._radius = value;
                this.dirty = true;
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
                this.dirty = true;
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
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Arc.prototype, "counterClockwise", {
        get: function () {
            return this._counterClockwise;
        },
        set: function (value) {
            if (this._counterClockwise !== value) {
                this._counterClockwise = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Arc.prototype.updatePath = function () {
        this.path = new Path2D();
        // No way to clear existing Path2D, have to create a new one each time.
        this.path.arc(this.x, this.y, this.radius, this.startAngle, this.endAngle, this.counterClockwise);
        this.path.closePath();
    };
    // Native Path2D's isPointInPath/isPointInStroke require multiplying by the pixelRatio:
    // const x = mouseEvent.offsetX * pixelRatio;
    // const y = mouseEvent.offsetY * pixelRatio;
    Arc.prototype.isPointInPath = function (x, y) {
        return false; //ctx.isPointInPath(this.path, x, y);
    };
    Arc.prototype.isPointInStroke = function (x, y) {
        return false; //ctx.isPointInStroke(this.path, x, y);
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
    return Arc;
}(shape_1.Shape));
exports.Arc = Arc;
