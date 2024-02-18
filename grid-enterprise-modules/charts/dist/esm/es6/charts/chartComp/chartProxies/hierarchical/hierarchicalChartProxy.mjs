import { AgCharts } from 'ag-charts-community';
import { ChartProxy } from '../chartProxy.mjs';
import { CATEGORY_LABEL_KEY, createAutoGroupHierarchy, createCategoryHierarchy } from './hierarchicalChartUtils.mjs';
import { GROUP_AUTO_COLUMN_ID } from '@ag-grid-community/core';
export class HierarchicalChartProxy extends ChartProxy {
    constructor(chartProxyParams) {
        super(chartProxyParams);
        this.chartProxyParams = chartProxyParams;
    }
    update(params) {
        const options = Object.assign(Object.assign({}, this.getCommonChartOptions(params.updatedOverrides)), { series: this.getSeries(params, CATEGORY_LABEL_KEY), data: this.getData(params) });
        AgCharts.update(this.getChartRef(), options);
    }
    getData(params) {
        const { categories, data, grouping: isGrouped } = params;
        if (isGrouped) {
            return createAutoGroupHierarchy(data, getRowAutoGroupLabels);
        }
        else {
            const categoryKeys = categories.map(({ id }) => id);
            return createCategoryHierarchy(data, categoryKeys);
        }
    }
}
function getRowAutoGroupLabels(item) {
    var _a, _b;
    return (_b = (_a = item[GROUP_AUTO_COLUMN_ID]) === null || _a === void 0 ? void 0 : _a.labels) !== null && _b !== void 0 ? _b : null;
}
