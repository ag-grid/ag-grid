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
var Line = /** @class */ (function (_super) {
    __extends(Line, _super);
    function Line() {
        var _this = _super.call(this) || this;
        _this._x1 = 0;
        _this._y1 = 0;
        _this._x2 = 0;
        _this._y2 = 0;
        _this.getBBox = function () {
            return new bbox_1.BBox(_this.x1, _this.y1, _this.x2 - _this.x1, _this.y2 - _this.y1);
        };
        _this.restoreOwnStyles();
        return _this;
    }
    Line.create = function (x1, y1, x2, y2) {
        var line = new Line();
        line.x1 = x1;
        line.y1 = y1;
        line.x2 = x2;
        line.y2 = y2;
        return line;
    };
    Object.defineProperty(Line.prototype, "x1", {
        get: function () {
            // TODO: Investigate getter performance further in the context
            //       of the scene graph.
            //       In isolated benchmarks using a getter has the same
            //       performance as a direct property access in Firefox 64.
            //       But in Chrome 71 the getter is 60% slower than direct access.
            //       Direct read is 4.5+ times slower in Chrome than it is in Firefox.
            //       Property access and direct read have the same performance
            //       in Safari 12, which is 2+ times faster than Firefox at this.
            // https://jsperf.com/es5-getters-setters-versus-getter-setter-methods/18
            // This is a know Chrome issue. They say it's not a regression, since
            // the behavior is observed since M60, but jsperf.com history shows the
            // 10x slowdown happened between Chrome 48 and Chrome 57.
            // https://bugs.chromium.org/p/chromium/issues/detail?id=908743
            return this._x1;
        },
        set: function (value) {
            if (this._x1 !== value) {
                this._x1 = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Line.prototype, "y1", {
        get: function () {
            return this._y1;
        },
        set: function (value) {
            if (this._y1 !== value) {
                this._y1 = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Line.prototype, "x2", {
        get: function () {
            return this._x2;
        },
        set: function (value) {
            if (this._x2 !== value) {
                this._x2 = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Line.prototype, "y2", {
        get: function () {
            return this._y2;
        },
        set: function (value) {
            if (this._y2 !== value) {
                this._y2 = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Line.prototype.isPointInPath = function (x, y) {
        return false;
    };
    Line.prototype.isPointInStroke = function (x, y) {
        return false;
    };
    Line.prototype.render = function (ctx) {
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);
        var x1 = this.x1;
        var y1 = this.y1;
        var x2 = this.x2;
        var y2 = this.y2;
        // Align to the pixel grid if the line is strictly vertical
        // or horizontal (but not both, i.e. a dot).
        if (x1 === x2) {
            var x = Math.round(x1) + Math.floor(this.strokeWidth) % 2 / 2;
            x1 = x;
            x2 = x;
        }
        else if (y1 === y2) {
            var y = Math.round(y1) + Math.floor(this.strokeWidth) % 2 / 2;
            y1 = y;
            y2 = y;
        }
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        this.fillStroke(ctx);
        this.dirty = false;
    };
    Line.className = 'Line';
    Line.defaultStyles = object_1.chainObjects(shape_1.Shape.defaultStyles, {
        fill: undefined,
        strokeWidth: 1
    });
    return Line;
}(shape_1.Shape));
exports.Line = Line;
