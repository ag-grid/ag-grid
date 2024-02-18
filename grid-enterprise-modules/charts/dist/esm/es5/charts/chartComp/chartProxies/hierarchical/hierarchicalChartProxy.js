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
import { AgCharts } from 'ag-charts-community';
import { ChartProxy } from '../chartProxy';
import { CATEGORY_LABEL_KEY, createAutoGroupHierarchy, createCategoryHierarchy } from './hierarchicalChartUtils';
import { GROUP_AUTO_COLUMN_ID } from '@ag-grid-community/core';
var HierarchicalChartProxy = /** @class */ (function (_super) {
    __extends(HierarchicalChartProxy, _super);
    function HierarchicalChartProxy(chartProxyParams) {
        var _this = _super.call(this, chartProxyParams) || this;
        _this.chartProxyParams = chartProxyParams;
        return _this;
    }
    HierarchicalChartProxy.prototype.update = function (params) {
        var options = __assign(__assign({}, this.getCommonChartOptions(params.updatedOverrides)), { series: this.getSeries(params, CATEGORY_LABEL_KEY), data: this.getData(params) });
        AgCharts.update(this.getChartRef(), options);
    };
    HierarchicalChartProxy.prototype.getData = function (params) {
        var categories = params.categories, data = params.data, isGrouped = params.grouping;
        if (isGrouped) {
            return createAutoGroupHierarchy(data, getRowAutoGroupLabels);
        }
        else {
            var categoryKeys = categories.map(function (_a) {
                var id = _a.id;
                return id;
            });
            return createCategoryHierarchy(data, categoryKeys);
        }
    };
    return HierarchicalChartProxy;
}(ChartProxy));
export { HierarchicalChartProxy };
function getRowAutoGroupLabels(item) {
    var _a, _b;
    return (_b = (_a = item[GROUP_AUTO_COLUMN_ID]) === null || _a === void 0 ? void 0 : _a.labels) !== null && _b !== void 0 ? _b : null;
}
