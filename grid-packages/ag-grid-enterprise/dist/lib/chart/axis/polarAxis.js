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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolarAxis = void 0;
var axis_1 = require("../../axis");
var PolarAxis = /** @class */ (function (_super) {
    __extends(PolarAxis, _super);
    function PolarAxis() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.shape = 'polygon';
        return _this;
    }
    PolarAxis.prototype.computeLabelsBBox = function (_options, _seriesRect) {
        return null;
    };
    return PolarAxis;
}(axis_1.Axis));
exports.PolarAxis = PolarAxis;
//# sourceMappingURL=polarAxis.js.map