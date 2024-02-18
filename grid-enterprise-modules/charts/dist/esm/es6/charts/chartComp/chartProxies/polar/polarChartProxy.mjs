import { ChartProxy } from '../chartProxy.mjs';
import { AgCharts } from 'ag-charts-community';
export class PolarChartProxy extends ChartProxy {
    constructor(params) {
        super(params);
    }
    getAxes(_) {
        const radialBar = this.standaloneChartType === 'radial-bar';
        return [
            { type: radialBar ? 'angle-number' : 'angle-category' },
            { type: radialBar ? 'radius-category' : 'radius-number' },
        ];
    }
    getSeries(params) {
        const { fields } = params;
        const [category] = params.categories;
        const radialBar = this.standaloneChartType === 'radial-bar';
        return fields.map(f => {
            var _a, _b;
            return ({
                type: this.standaloneChartType,
                angleKey: radialBar ? f.colId : category.id,
                angleName: radialBar ? ((_a = f.displayName) !== null && _a !== void 0 ? _a : undefined) : category.name,
                radiusKey: radialBar ? category.id : f.colId,
                radiusName: radialBar ? category.name : ((_b = f.displayName) !== null && _b !== void 0 ? _b : undefined),
            });
        });
    }
    update(params) {
        const axes = this.getAxes(params);
        const options = Object.assign(Object.assign({}, this.getCommonChartOptions(params.updatedOverrides)), { data: this.getData(params, axes), axes, series: this.getSeries(params) });
        AgCharts.update(this.getChartRef(), options);
    }
    getData(params, axes) {
        const isCategoryAxis = axes.some((axis) => axis.type === 'angle-category' || axis.type === 'radius-category');
        return this.getDataTransformedData(params, isCategoryAxis);
    }
    getDataTransformedData(params, isCategoryAxis) {
        const [category] = params.categories;
        return this.transformData(params.data, category.id, isCategoryAxis);
    }
    crossFilteringReset() {
        // cross filtering is not currently supported in polar charts
    }
}
