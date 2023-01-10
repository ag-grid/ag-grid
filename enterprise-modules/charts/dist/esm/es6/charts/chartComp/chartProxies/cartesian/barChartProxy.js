import { _ } from "@ag-grid-community/core";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { deepMerge } from "../../utils/object";
import { hexToRGBA } from "../../utils/color";
export class BarChartProxy extends CartesianChartProxy {
    constructor(params) {
        super(params);
    }
    getAxes(params) {
        const isBar = this.standaloneChartType === 'bar';
        const axes = [
            {
                type: this.getXAxisType(params),
                position: isBar ? 'left' : 'bottom',
            },
            {
                type: 'number',
                position: isBar ? 'bottom' : 'left',
            },
        ];
        // Add a default label formatter to show '%' for normalized charts if none is provided
        if (this.isNormalised()) {
            const numberAxis = axes[1];
            numberAxis.label = Object.assign(Object.assign({}, numberAxis.label), { formatter: (params) => Math.round(params.value) + '%' });
        }
        return axes;
    }
    getSeries(params) {
        const groupedCharts = ['groupedColumn', 'groupedBar'];
        const isGrouped = !this.crossFiltering && _.includes(groupedCharts, this.chartType);
        const series = params.fields.map(f => ({
            type: this.standaloneChartType,
            grouped: isGrouped,
            normalizedTo: this.isNormalised() ? 100 : undefined,
            xKey: params.category.id,
            xName: params.category.name,
            yKey: f.colId,
            yName: f.displayName
        }));
        return this.crossFiltering ? this.extractCrossFilterSeries(series) : series;
    }
    extractCrossFilterSeries(series) {
        const palette = this.getChartPalette();
        const updatePrimarySeries = (seriesOptions, index) => {
            return Object.assign(Object.assign({}, seriesOptions), { highlightStyle: { item: { fill: undefined } }, fill: palette === null || palette === void 0 ? void 0 : palette.fills[index], stroke: palette === null || palette === void 0 ? void 0 : palette.strokes[index], listeners: {
                    nodeClick: this.crossFilterCallback
                } });
        };
        const updateFilteredOutSeries = (seriesOptions) => {
            const yKey = seriesOptions.yKey + '-filtered-out';
            return Object.assign(Object.assign({}, deepMerge({}, seriesOptions)), { yKey, fill: hexToRGBA(seriesOptions.fill, '0.3'), stroke: hexToRGBA(seriesOptions.stroke, '0.3'), hideInLegend: [yKey] });
        };
        const allSeries = [];
        for (let i = 0; i < series.length; i++) {
            // update primary series
            const primarySeries = updatePrimarySeries(series[i], i);
            allSeries.push(primarySeries);
            // add 'filtered-out' series
            allSeries.push(updateFilteredOutSeries(primarySeries));
        }
        return allSeries;
    }
    isNormalised() {
        const normalisedCharts = ['normalizedColumn', 'normalizedBar'];
        return !this.crossFiltering && _.includes(normalisedCharts, this.chartType);
    }
}
