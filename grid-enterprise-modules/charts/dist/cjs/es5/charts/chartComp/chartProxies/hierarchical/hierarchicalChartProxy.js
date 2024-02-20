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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HierarchicalChartProxy = void 0;
var ag_charts_community_1 = require("ag-charts-community");
var chartProxy_1 = require("../chartProxy");
var hierarchicalChartUtils_1 = require("./hierarchicalChartUtils");
var core_1 = require("@ag-grid-community/core");
var HierarchicalChartProxy = /** @class */ (function (_super) {
    __extends(HierarchicalChartProxy, _super);
    function HierarchicalChartProxy(chartProxyParams) {
        var _this = _super.call(this, chartProxyParams) || this;
        _this.chartProxyParams = chartProxyParams;
        return _this;
    }
    HierarchicalChartProxy.prototype.update = function (params) {
        var options = __assign(__assign({}, this.getCommonChartOptions(params.updatedOverrides)), { series: this.getSeries(params, hierarchicalChartUtils_1.CATEGORY_LABEL_KEY), data: this.getData(params) });
        ag_charts_community_1.AgCharts.update(this.getChartRef(), options);
    };
    HierarchicalChartProxy.prototype.getData = function (params) {
        var categories = params.categories, data = params.data, isGrouped = params.grouping;
        if (isGrouped) {
            return (0, hierarchicalChartUtils_1.createAutoGroupHierarchy)(data, getRowAutoGroupLabels);
        }
        else {
            var categoryKeys = categories.map(function (_a) {
                var id = _a.id;
                return id;
            });
            return (0, hierarchicalChartUtils_1.createCategoryHierarchy)(data, categoryKeys);
        }
    };
    return HierarchicalChartProxy;
}(chartProxy_1.ChartProxy));
exports.HierarchicalChartProxy = HierarchicalChartProxy;
function getRowAutoGroupLabels(item) {
    var _a, _b;
    return (_b = (_a = item[core_1.GROUP_AUTO_COLUMN_ID]) === null || _a === void 0 ? void 0 : _a.labels) !== null && _b !== void 0 ? _b : null;
}
