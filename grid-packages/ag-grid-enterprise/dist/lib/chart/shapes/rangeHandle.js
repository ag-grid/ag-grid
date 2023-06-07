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
exports.RangeHandle = void 0;
var path_1 = require("../../scene/shape/path");
var bbox_1 = require("../../scene/bbox");
var validation_1 = require("../../util/validation");
var RangeHandle = /** @class */ (function (_super) {
    __extends(RangeHandle, _super);
    function RangeHandle() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._fill = '#f2f2f2';
        _this._stroke = '#999999';
        _this._strokeWidth = 1;
        _this._lineCap = 'square';
        _this._centerX = 0;
        _this._centerY = 0;
        // Use an even number for better looking results.
        _this._width = 8;
        // Use an even number for better looking results.
        _this._gripLineGap = 2;
        // Use an even number for better looking results.
        _this._gripLineLength = 8;
        _this._height = 16;
        return _this;
    }
    Object.defineProperty(RangeHandle.prototype, "centerX", {
        get: function () {
            return this._centerX;
        },
        set: function (value) {
            if (this._centerX !== value) {
                this._centerX = value;
                this.dirtyPath = true;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RangeHandle.prototype, "centerY", {
        get: function () {
            return this._centerY;
        },
        set: function (value) {
            if (this._centerY !== value) {
                this._centerY = value;
                this.dirtyPath = true;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RangeHandle.prototype, "width", {
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
    Object.defineProperty(RangeHandle.prototype, "gripLineGap", {
        get: function () {
            return this._gripLineGap;
        },
        set: function (value) {
            if (this._gripLineGap !== value) {
                this._gripLineGap = value;
                this.dirtyPath = true;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RangeHandle.prototype, "gripLineLength", {
        get: function () {
            return this._gripLineLength;
        },
        set: function (value) {
            if (this._gripLineLength !== value) {
                this._gripLineLength = value;
                this.dirtyPath = true;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RangeHandle.prototype, "height", {
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
    RangeHandle.prototype.computeBBox = function () {
        var _a = this, centerX = _a.centerX, centerY = _a.centerY, width = _a.width, height = _a.height;
        var x = centerX - width / 2;
        var y = centerY - height / 2;
        return new bbox_1.BBox(x, y, width, height);
    };
    RangeHandle.prototype.isPointInPath = function (x, y) {
        var point = this.transformPoint(x, y);
        var bbox = this.computeBBox();
        return bbox.containsPoint(point.x, point.y);
    };
    RangeHandle.prototype.updatePath = function () {
        var _a = this, path = _a.path, centerX = _a.centerX, centerY = _a.centerY, width = _a.width, height = _a.height;
        path.clear();
        var x = centerX - width / 2;
        var y = centerY - height / 2;
        var ax = this.align(x);
        var ay = this.align(y);
        var axw = ax + this.align(x, width);
        var ayh = ay + this.align(y, height);
        // Handle.
        path.moveTo(ax, ay);
        path.lineTo(axw, ay);
        path.lineTo(axw, ayh);
        path.lineTo(ax, ayh);
        path.lineTo(ax, ay);
        // Grip lines.
        var dx = this.gripLineGap / 2;
        var dy = this.gripLineLength / 2;
        path.moveTo(this.align(centerX - dx), this.align(centerY - dy));
        path.lineTo(this.align(centerX - dx), this.align(centerY + dy));
        path.moveTo(this.align(centerX + dx), this.align(centerY - dy));
        path.lineTo(this.align(centerX + dx), this.align(centerY + dy));
    };
    RangeHandle.className = 'RangeHandle';
    __decorate([
        validation_1.Validate(validation_1.COLOR_STRING)
    ], RangeHandle.prototype, "_fill", void 0);
    __decorate([
        validation_1.Validate(validation_1.COLOR_STRING)
    ], RangeHandle.prototype, "_stroke", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], RangeHandle.prototype, "_strokeWidth", void 0);
    __decorate([
        validation_1.Validate(validation_1.LINE_CAP)
    ], RangeHandle.prototype, "_lineCap", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], RangeHandle.prototype, "_width", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], RangeHandle.prototype, "_gripLineGap", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], RangeHandle.prototype, "_gripLineLength", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], RangeHandle.prototype, "_height", void 0);
    return RangeHandle;
}(path_1.Path));
exports.RangeHandle = RangeHandle;
//# sourceMappingURL=rangeHandle.js.map