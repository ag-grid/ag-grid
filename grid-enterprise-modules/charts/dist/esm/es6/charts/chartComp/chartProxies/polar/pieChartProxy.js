import { ChartProxy } from '../chartProxy';
import { AgChart, } from 'ag-charts-community';
import { changeOpacity } from '../../utils/color';
import { deepMerge } from '../../utils/object';
export class PieChartProxy extends ChartProxy {
    constructor(params) {
        super(params);
    }
    update(params) {
        const { data, category } = params;
        const options = Object.assign(Object.assign({}, this.getCommonChartOptions(params.updatedOverrides)), { data: this.crossFiltering ? this.getCrossFilterData(params) : this.transformData(data, category.id), series: this.getSeries(params) });
        AgChart.update(this.getChartRef(), options);
    }
    getSeries(params) {
        const numFields = params.fields.length;
        const offset = {
            currentOffset: 0,
            offsetAmount: numFields > 1 ? 20 : 40
        };
        const series = this.getFields(params).map((f) => {
            var _a;
            // options shared by 'pie' and 'doughnut' charts
            const options = {
                type: this.standaloneChartType,
                angleKey: f.colId,
                angleName: f.displayName,
                sectorLabelKey: f.colId,
                calloutLabelKey: params.category.id,
                calloutLabelName: params.category.name,
            };
            if (this.chartType === 'doughnut') {
                const { outerRadiusOffset, innerRadiusOffset } = PieChartProxy.calculateOffsets(offset);
                const title = f.displayName ? {
                    title: { text: f.displayName, showInLegend: numFields > 1 },
                } : undefined;
                // augment shared options with 'doughnut' specific options
                return Object.assign(Object.assign(Object.assign(Object.assign({}, options), { outerRadiusOffset,
                    innerRadiusOffset }), title), { calloutLine: {
                        colors: (_a = this.getChartPalette()) === null || _a === void 0 ? void 0 : _a.strokes,
                    } });
            }
            return options;
        });
        return this.crossFiltering ? this.extractCrossFilterSeries(series) : series;
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
        const palette = this.getChartPalette();
        const primaryOptions = (seriesOptions) => {
            return Object.assign(Object.assign({}, seriesOptions), { calloutLabel: { enabled: false }, highlightStyle: { item: { fill: undefined } }, radiusKey: seriesOptions.angleKey, angleKey: seriesOptions.angleKey + '-total', radiusMin: 0, radiusMax: 1, listeners: {
                    nodeClick: this.crossFilterCallback,
                } });
        };
        const filteredOutOptions = (seriesOptions, angleKey) => {
            var _a, _b;
            return Object.assign(Object.assign({}, deepMerge({}, primaryOpts)), { radiusKey: angleKey + '-filtered-out', fills: changeOpacity((_a = seriesOptions.fills) !== null && _a !== void 0 ? _a : palette.fills, 0.3), strokes: changeOpacity((_b = seriesOptions.strokes) !== null && _b !== void 0 ? _b : palette.strokes, 0.3), showInLegend: false });
        };
        // currently, only single 'doughnut' cross-filter series are supported
        const primarySeries = series[0];
        // update primary series
        const angleKey = primarySeries.angleKey;
        const primaryOpts = primaryOptions(primarySeries);
        return [
            filteredOutOptions(primarySeries, angleKey),
            primaryOpts,
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
    crossFilteringReset() {
        // not required in pie charts
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGllQ2hhcnRQcm94eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydHMvY2hhcnRDb21wL2NoYXJ0UHJveGllcy9wb2xhci9waWVDaGFydFByb3h5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQW1ELE1BQU0sZUFBZSxDQUFDO0FBQzVGLE9BQU8sRUFBRSxPQUFPLEdBQWtFLE1BQU0scUJBQXFCLENBQUM7QUFDOUcsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQU8vQyxNQUFNLE9BQU8sYUFBYyxTQUFRLFVBQVU7SUFFekMsWUFBbUIsTUFBd0I7UUFDdkMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFFTSxNQUFNLENBQUMsTUFBb0I7UUFDOUIsTUFBTSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLENBQUM7UUFFbEMsTUFBTSxPQUFPLG1DQUNOLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsS0FDdEQsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUNuRyxNQUFNLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FDakMsQ0FBQTtRQUVELE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFTyxTQUFTLENBQUMsTUFBb0I7UUFDbEMsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLE1B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