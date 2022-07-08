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
var observable_1 = require("./observable");
var Padding = /** @class */ (function (_super) {
    __extends(Padding, _super);
    function Padding(top, right, bottom, left) {
        if (top === void 0) { top = 0; }
        if (right === void 0) { right = top; }
        if (bottom === void 0) { bottom = top; }
        if (left === void 0) { left = right; }
        var _this = _super.call(this) || this;
        _this.top = top;
        _this.right = right;
        _this.bottom = bottom;
        _this.left = left;
        return _this;
    }
    Padding.prototype.clear = function () {
        this.top = this.right = this.bottom = this.left = 0;
    };
    return Padding;
}(observable_1.Observable));
exports.Padding = Padding;
