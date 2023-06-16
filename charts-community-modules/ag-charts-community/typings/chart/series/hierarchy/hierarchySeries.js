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
exports.HierarchySeries = void 0;
var series_1 = require("../series");
var HierarchySeries = /** @class */ (function (_super) {
    __extends(HierarchySeries, _super);
    function HierarchySeries(moduleCtx) {
        return _super.call(this, { moduleCtx: moduleCtx, pickModes: [series_1.SeriesNodePickMode.EXACT_SHAPE_MATCH] }) || this;
    }
    HierarchySeries.prototype.getLabelData = function () {
        return [];
    };
    return HierarchySeries;
}(series_1.Series));
exports.HierarchySeries = HierarchySeries;
//# sourceMappingURL=hierarchySeries.js.map