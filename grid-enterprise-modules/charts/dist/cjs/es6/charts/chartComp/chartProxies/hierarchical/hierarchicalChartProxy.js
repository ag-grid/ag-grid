"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HierarchicalChartProxy = void 0;
const ag_charts_community_1 = require("ag-charts-community");
const chartProxy_1 = require("../chartProxy");
const hierarchicalChartUtils_1 = require("./hierarchicalChartUtils");
const core_1 = require("@ag-grid-community/core");
class HierarchicalChartProxy extends chartProxy_1.ChartProxy {
    constructor(chartProxyParams) {
        super(chartProxyParams);
        this.chartProxyParams = chartProxyParams;
    }
    update(params) {
        const options = Object.assign(Object.assign({}, this.getCommonChartOptions(params.updatedOverrides)), { series: this.getSeries(params, hierarchicalChartUtils_1.CATEGORY_LABEL_KEY), data: this.getData(params) });
        ag_charts_community_1.AgCharts.update(this.getChartRef(), options);
    }
    getData(params) {
        const { categories, data, grouping: isGrouped } = params;
        if (isGrouped) {
            return (0, hierarchicalChartUtils_1.createAutoGroupHierarchy)(data, getRowAutoGroupLabels);
        }
        else {
            const categoryKeys = categories.map(({ id }) => id);
            return (0, hierarchicalChartUtils_1.createCategoryHierarchy)(data, categoryKeys);
        }
    }
}
exports.HierarchicalChartProxy = HierarchicalChartProxy;
function getRowAutoGroupLabels(item) {
    var _a, _b;
    return (_b = (_a = item[core_1.GROUP_AUTO_COLUMN_ID]) === null || _a === void 0 ? void 0 : _a.labels) !== null && _b !== void 0 ? _b : null;
}
