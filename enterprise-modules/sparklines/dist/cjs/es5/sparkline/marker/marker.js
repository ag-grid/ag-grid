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
var Marker = /** @class */ (function (_super) {
    __extends(Marker, _super);
    function Marker() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._x = 0;
        _this._y = 0;
        _this._size = 3;
        return _this;
    }
    Object.defineProperty(Marker.prototype, "x", {
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
    Object.defineProperty(Marker.prototype, "y", {
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
    Object.defineProperty(Marker.prototype, "size", {
        get: function () {
            return this._size;
        },
        set: function (value) {
            if (this._size !== value) {
                this._size = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    return Marker;
}(shape_1.Shape));
exports.Marker = Marker;
