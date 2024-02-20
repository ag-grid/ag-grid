"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RangeChartProxy = void 0;
const statisticalChartProxy_1 = require("./statisticalChartProxy");
class RangeChartProxy extends statisticalChartProxy_1.StatisticalChartProxy {
    constructor(params) {
        super(params);
    }
    getSeries(params) {
        const [category] = params.categories;
        return params.fields.map((field, seriesIndex) => {
            var _a;
            return ({
                type: this.standaloneChartType,
                // xKey/xName refer to category buckets
                xKey: category.id,
                xName: category.name,
                // yName is used to label the series
                yName: (_a = field.displayName) !== null && _a !== void 0 ? _a : undefined,
                // custom field labels shown in the tooltip
                yLowName: 'Min',
                yHighName: 'Max',
                // generated 'synthetic fields' from getData()
                yLowKey: `min:${seriesIndex}`,
                yHighKey: `max:${seriesIndex}`,
            });
        });
    }
    getData(params) {
        return this.computeSeriesStatistics(params, (seriesValues) => {
            return {
                min: Math.min(...seriesValues),
                max: Math.max(...seriesValues),
            };
        });
    }
}
exports.RangeChartProxy = RangeChartProxy;
