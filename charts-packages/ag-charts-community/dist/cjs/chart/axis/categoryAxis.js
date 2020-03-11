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
var bandScale_1 = require("../../scale/bandScale");
var chartAxis_1 = require("../chartAxis");
var CategoryAxis = /** @class */ (function (_super) {
    __extends(CategoryAxis, _super);
    function CategoryAxis() {
        var _this = this;
        var scale = new bandScale_1.BandScale();
        scale.paddingInner = 0.2;
        scale.paddingOuter = 0.3;
        _this = _super.call(this, scale) || this;
        return _this;
    }
    CategoryAxis.className = 'CategoryAxis';
    CategoryAxis.type = 'category';
    return CategoryAxis;
}(chartAxis_1.ChartAxis));
exports.CategoryAxis = CategoryAxis;
//# sourceMappingURL=categoryAxis.js.map