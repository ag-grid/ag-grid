import { CartesianChartProxy } from "./cartesianChartProxy.mjs";
import { isHorizontal } from "../../utils/seriesTypeMapper.mjs";
export class WaterfallChartProxy extends CartesianChartProxy {
    constructor(params) {
        super(params);
    }
    getAxes(params) {
        return [
            {
                type: this.getXAxisType(params),
                position: isHorizontal(this.chartType) ? 'left' : 'bottom',
            },
            {
                type: 'number',
                position: isHorizontal(this.chartType) ? 'bottom' : 'left',
            },
        ];
    }
    getSeries(params) {
        var _a;
        const [category] = params.categories;
        const [firstField] = params.fields;
        const firstSeries = {
            type: this.standaloneChartType,
            direction: isHorizontal(this.chartType) ? 'horizontal' : 'vertical',
            xKey: category.id,
            xName: category.name,
            yKey: firstField.colId,
            yName: (_a = firstField.displayName) !== null && _a !== void 0 ? _a : undefined
        };
        return [firstSeries]; // waterfall only supports a single series!
    }
}
