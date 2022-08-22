import { ChartProxy } from "../chartProxy";
import { AgChart } from "ag-charts-community";
import { changeOpacity } from "../../utils/color";
import { deepMerge } from "../../utils/object";
export class PieChartProxy extends ChartProxy {
    constructor(params) {
        super(params);
        this.recreateChart();
    }
    createChart() {
        return AgChart.create({
            type: 'pie',
            container: this.chartProxyParams.parentElement,
            theme: this.chartTheme,
        });
    }
    update(params) {
        const { data, category } = params;
        let options = Object.assign(Object.assign({}, this.getCommonChartOptions()), { data: this.crossFiltering ? this.getCrossFilterData(params) : this.transformData(data, category.id), series: this.getSeries(params) });
        if (this.crossFiltering) {
            options = this.getCrossFilterChartOptions(options);
        }
        AgChart.update(this.chart, options);
    }
    getSeries(params) {
        const numFields = params.fields.length;
        const offset = {
            currentOffset: 0,
            offsetAmount: numFields > 1 ? 20 : 40
        };
        const series = this.getFields(params).map((f) => {
            const seriesDefaults = this.extractSeriesOverrides();
            // options shared by 'pie' and 'doughnut' charts
            const options = Object.assign(Object.assign({}, seriesDefaults), { type: this.standaloneChartType, angleKey: f.colId, angleName: f.displayName, labelKey: params.category.id, labelName: params.category.name });
            if (this.chartType === 'doughnut') {
                const { outerRadiusOffset, innerRadiusOffset } = PieChartProxy.calculateOffsets(offset);
                // augment shared options with 'doughnut' specific options
                return Object.assign(Object.assign({}, options), { outerRadiusOffset,
                    innerRadiusOffset, title: Object.assign(Object.assign({}, seriesDefaults.title), { text: seriesDefaults.title.text || f.displayName, showInLegend: numFields > 1 }), callout: Object.assign(Object.assign({}, seriesDefaults.callout), { colors: this.chartTheme.palette.strokes }) });
            }
            return options;
        });
        return this.crossFiltering ? this.extractCrossFilterSeries(series) : series;
    }
    getCrossFilterChartOptions(options) {
        const seriesOverrides = this.extractSeriesOverrides();
        return Object.assign(Object.assign({}, options), { tooltip: Object.assign(Object.assign({}, seriesOverrides.tooltip), { delay: 500 }), legend: Object.assign(Object.assign({}, seriesOverrides.legend), { listeners: {
                    legendItemClick: (e) => {
                        this.chart.series.forEach(s => s.toggleSeriesItem(e.itemId, e.enabled));
                    }
                } }) });
    }
    getCrossFilterData(params) {
        const colId = params.fields[0].colId;
        const filteredOutColId = `${colId}-filtered-out`;
        return params.data.map(d => {
            const total = d[colId] + d[filteredOutColId];
            d[`${colId}-total`] = total;
            d[filteredOutColId] = 1; // normalise to 1
            d[colId] = d[colId] / total; // fraction of 1
            return d;
        });
    }
    extractCrossFilterSeries(series) {
        const palette = this.chartTheme.palette;
        const seriesOverrides = this.extractSeriesOverrides();
        const primaryOptions = (seriesOptions) => {
            return Object.assign(Object.assign({}, seriesOptions), { label: { enabled: false }, highlightStyle: { item: { fill: undefined } }, radiusKey: seriesOptions.angleKey, angleKey: seriesOptions.angleKey + '-total', radiusMin: 0, radiusMax: 1, listeners: Object.assign(Object.assign({}, seriesOverrides.listeners), { nodeClick: this.crossFilterCallback }), tooltip: Object.assign(Object.assign({}, seriesOverrides.tooltip), { renderer: this.getCrossFilterTooltipRenderer(`${seriesOptions.angleName}`) }) });
        };
        const filteredOutOptions = (seriesOptions, angleKey) => {
            var _a, _b, _c;
            return Object.assign(Object.assign({}, deepMerge({}, primaryOpts)), { radiusKey: angleKey + '-filtered-out', label: seriesOverrides.label, callout: Object.assign(Object.assign({}, seriesOverrides.callout), { colors: (_a = seriesOverrides.callout.colors, (_a !== null && _a !== void 0 ? _a : palette.strokes)) }), fills: changeOpacity((_b = seriesOptions.fills, (_b !== null && _b !== void 0 ? _b : palette.fills)), 0.3), strokes: changeOpacity((_c = seriesOptions.strokes, (_c !== null && _c !== void 0 ? _c : palette.strokes)), 0.3), showInLegend: false });
        };
        // currently, only single 'doughnut' cross-filter series are supported
        const primarySeries = series[0];
        // update primary series
        const angleKey = primarySeries.angleKey;
        const primaryOpts = primaryOptions(primarySeries);
        return [
            primaryOpts,
            filteredOutOptions(primarySeries, angleKey)
        ];
    }
    static calculateOffsets(offset) {
        const outerRadiusOffset = offset.currentOffset;
        offset.currentOffset -= offset.offsetAmount;
        const innerRadiusOffset = offset.currentOffset;
        offset.currentOffset -= offset.offsetAmount;
        return { outerRadiusOffset, innerRadiusOffset };
    }
    getFields(params) {
        return this.chartType === 'pie' ? params.fields.slice(0, 1) : params.fields;
    }
    getCrossFilterTooltipRenderer(title) {
        return (params) => {
            const label = params.datum[params.labelKey];
            const ratio = params.datum[params.radiusKey];
            const totalValue = params.angleValue;
            return { title, content: `${label}: ${totalValue * ratio}` };
        };
    }
    extractSeriesOverrides() {
        return this.chartOptions[this.standaloneChartType].series;
    }
    crossFilteringReset() {
        // not required in pie charts
    }
}
