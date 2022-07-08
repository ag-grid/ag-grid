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
var shape_1 = require("../../scene/shape/shape");
var Rectangle = /** @class */ (function (_super) {
    __extends(Rectangle, _super);
    function Rectangle() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._x = 0;
        _this._y = 0;
        _this._width = 0;
        _this._height = 0;
        /**
         * If `true`, the rect is aligned to the pixel grid for crisp looking lines.
         */
        _this._crisp = false;
        return _this;
    }
    Object.defineProperty(Rectangle.prototype, "x", {
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
    Object.defineProperty(Rectangle.prototype, "y", {
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
    Object.defineProperty(Rectangle.prototype, "width", {
        get: function () {
            return this._width;
        },
        set: function (value) {
            if (this._width !== value) {
                this._width = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rectangle.prototype, "height", {
        get: function () {
            return this._height;
        },
        set: function (value) {
            if (this._height !== value) {
                this._height = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rectangle.prototype, "crisp", {
        get: function () {
            return this._crisp;
        },
        set: function (value) {
            if (this._crisp !== value) {
                this._crisp = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Rectangle.prototype.isPointInStroke = function (x, y) {
        return false;
    };
    Rectangle.prototype.isPointInPath = function (x, y) {
        return false;
    };
    Rectangle.prototype.render = function (ctx) {
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);
        var _a = this, x = _a.x, y = _a.y, width = _a.width, height = _a.height, crisp = _a.crisp;
        ctx.beginPath();
        if (crisp) {
            // ensure stroke aligns to the pixel grid
            var _b = this, a = _b.alignment, al = _b.align;
            ctx.rect(al(a, x), al(a, y), al(a, x, width), al(a, y, height));
        }
        else {
            ctx.rect(x, y, width, height);
        }
        this.fillStroke(ctx);
        this.dirty = false;
    };
    Rectangle.className = 'Column';
    return Rectangle;
}(shape_1.Shape));
exports.Rectangle = Rectangle;
