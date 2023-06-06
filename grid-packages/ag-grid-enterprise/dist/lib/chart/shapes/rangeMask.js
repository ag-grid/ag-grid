"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RangeMask = void 0;
var path_1 = require("../../scene/shape/path");
var bbox_1 = require("../../scene/bbox");
var validation_1 = require("../../util/validation");
var RangeMask = /** @class */ (function (_super) {
    __extends(RangeMask, _super);
    function RangeMask() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._stroke = '#999999';
        _this._strokeWidth = 1;
        _this._fill = '#999999';
        _this._fillOpacity = 0.2;
        _this._lineCap = 'square';
        _this._x = 0;
        _this._y = 0;
        _this._width = 200;
        _this._height = 30;
        _this.minRange = 0.05;
        _this._min = 0;
        _this._max = 1;
        return _this;
    }
    Object.defineProperty(RangeMask.prototype, "x", {
        get: function () {
            return this._x;
        },
        set: function (value) {
            if (this._x !== value) {
                this._x = value;
                this.dirtyPath = true;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RangeMask.prototype, "y", {
        get: function () {
            return this._y;
        },
        set: function (value) {
            if (this._y !== value) {
                this._y = value;
                this.dirtyPath = true;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RangeMask.prototype, "width", {
        get: function () {
            return this._width;
        },
        set: function (value) {
            if (this._width !== value) {
                this._width = value;
                this.dirtyPath = true;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RangeMask.prototype, "height", {
        get: function () {
            return this._height;
        },
        set: function (value) {
            if (this._height !== value) {
                this._height = value;
                this.dirtyPath = true;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RangeMask.prototype, "min", {
        get: function () {
            return this._min;
        },
        set: function (value) {
            var _a;
            value = Math.min(Math.max(value, 0), this.max - this.minRange);
            if (isNaN(value)) {
                return;
            }
            if (this._min !== value) {
                this._min = value;
                this.dirtyPath = true;
                (_a = this.onRangeChange) === null || _a === void 0 ? void 0 : _a.call(this);
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RangeMask.prototype, "max", {
        get: function () {
            return this._max;
        },
        set: function (value) {
            var _a;
            value = Math.max(Math.min(value, 1), this.min + this.minRange);
            if (isNaN(value)) {
                return;
            }
            if (this._max !== value) {
                this._max = value;
                this.dirtyPath = true;
                (_a = this.onRangeChange) === null || _a === void 0 ? void 0 : _a.call(this);
            }
        },
        enumerable: false,
        configurable: true
    });
    RangeMask.prototype.computeBBox = function () {
        var _a = this, x = _a.x, y = _a.y, width = _a.width, height = _a.height;
        return new bbox_1.BBox(x, y, width, height);
    };
    RangeMask.prototype.computeVisibleRangeBBox = function () {
        var _a = this, x = _a.x, y = _a.y, width = _a.width, height = _a.height, min = _a.min, max = _a.max;
        var minX = x + width * min;
        var maxX = x + width * max;
        return new bbox_1.BBox(minX, y, maxX - minX, height);
    };
    RangeMask.prototype.updatePath = function () {
        var _a = this, path = _a.path, x = _a.x, y = _a.y, width = _a.width, height = _a.height, min = _a.min, max = _a.max;
        path.clear();
        var ax = this.align(x);
        var ay = this.align(y);
        var axw = ax + this.align(x, width);
        var ayh = ay + this.align(y, height);
        // Whole range.
        path.moveTo(ax, ay);
        path.lineTo(axw, ay);
        path.lineTo(axw, ayh);
        path.lineTo(ax, ayh);
        path.lineTo(ax, ay);
        var minX = this.align(x + width * min);
        var maxX = this.align(x + width * max);
        // Visible range.
        path.moveTo(minX, ay);
        path.lineTo(minX, ayh);
        path.lineTo(maxX, ayh);
        path.lineTo(maxX, ay);
        path.lineTo(minX, ay);
    };
    RangeMask.className = 'RangeMask';
    __decorate([
        validation_1.Validate(validation_1.COLOR_STRING)
    ], RangeMask.prototype, "_stroke", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], RangeMask.prototype, "_strokeWidth", void 0);
    __decorate([
        validation_1.Validate(validation_1.COLOR_STRING)
    ], RangeMask.prototype, "_fill", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0, 1))
    ], RangeMask.prototype, "_fillOpacity", void 0);
    __decorate([
        validation_1.Validate(validation_1.LINE_CAP)
    ], RangeMask.prototype, "_lineCap", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], RangeMask.prototype, "_width", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], RangeMask.prototype, "_height", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER())
    ], RangeMask.prototype, "_min", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER())
    ], RangeMask.prototype, "_max", void 0);
    return RangeMask;
}(path_1.Path));
exports.RangeMask = RangeMask;
//# sourceMappingURL=rangeMask.js.map