import { ChartAxisPosition } from "ag-charts-community";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { deepMerge } from "../../utils/object";
export class AreaChartProxy extends CartesianChartProxy {
    constructor(params) {
        super(params);
        this.xAxisType = params.grouping ? 'groupedCategory' : 'category';
        this.yAxisType = 'number';
        this.recreateChart();
    }
    getData(params) {
        return this.crossFiltering ? this.getLineAreaCrossFilterData(params) : this.getDataTransformedData(params);
    }
    getAxes() {
        const axisOptions = this.getAxesOptions();
        return [
            Object.assign(Object.assign({}, deepMerge(axisOptions[this.xAxisType], axisOptions[this.xAxisType].bottom)), { type: this.xAxisType, position: ChartAxisPosition.Bottom }),
            Object.assign(Object.assign({}, deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].left)), { type: this.yAxisType, position: ChartAxisPosition.Left }),
        ];
    }
    getSeries(params) {
        const series = params.fields.map(f => (Object.assign(Object.assign({}, this.extractSeriesOverrides()), { type: this.standaloneChartType, xKey: params.category.id, xName: params.category.name, yKey: f.colId, yName: f.displayName, normalizedTo: this.chartType === 'normalizedArea' ? 100 : undefined, stacked: ['normalizedArea', 'stackedArea'].includes(this.chartType) })));
        return this.crossFiltering ? this.extractLineAreaCrossFilterSeries(series, params) : series;
    }
}
