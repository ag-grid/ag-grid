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
var axis_1 = require("../../axis");
var linearScale_1 = require("../../scale/linearScale");
var NumberAxis = /** @class */ (function (_super) {
    __extends(NumberAxis, _super);
    function NumberAxis() {
        return _super.call(this, linearScale_1.default()) || this;
    }
    return NumberAxis;
}(axis_1.Axis));
exports.NumberAxis = NumberAxis;
