"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaterfallChartProxy = void 0;
const cartesianChartProxy_1 = require("./cartesianChartProxy");
const seriesTypeMapper_1 = require("../../utils/seriesTypeMapper");
class WaterfallChartProxy extends cartesianChartProxy_1.CartesianChartProxy {
    constructor(params) {
        super(params);
    }
    getAxes(params) {
        return [
            {
                type: this.getXAxisType(params),
                position: (0, seriesTypeMapper_1.isHorizontal)(this.chartType) ? 'left' : 'bottom',
            },
            {
                type: 'number',
                position: (0, seriesTypeMapper_1.isHorizontal)(this.chartType) ? 'bottom' : 'left',
            },
        ];
    }
    getSeries(params) {
        var _a;
        const [category] = params.categories;
        const [firstField] = params.fields;
        const firstSeries = {
            type: this.standaloneChartType,
            direction: (0, seriesTypeMapper_1.isHorizontal)(this.chartType) ? 'horizontal' : 'vertical',
            xKey: category.id,
            xName: category.name,
            yKey: firstField.colId,
            yName: (_a = firstField.displayName) !== null && _a !== void 0 ? _a : undefined
        };
        return [firstSeries]; // waterfall only supports a single series!
    }
}
exports.WaterfallChartProxy = WaterfallChartProxy;
