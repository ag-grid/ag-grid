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
var chartProxy_1 = require("../chartProxy");
var PolarChartProxy = /** @class */ (function (_super) {
    __extends(PolarChartProxy, _super);
    function PolarChartProxy(params) {
        return _super.call(this, params) || this;
    }
    return PolarChartProxy;
}(chartProxy_1.ChartProxy));
exports.PolarChartProxy = PolarChartProxy;
//# sourceMappingURL=polarChartProxy.js.map