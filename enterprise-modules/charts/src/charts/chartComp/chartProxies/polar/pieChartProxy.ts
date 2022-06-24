import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { PolarChartProxy } from "./polarChartProxy";
import { AgPolarSeriesOptions, AgPieSeriesOptions } from "ag-charts-community/src/chart/agChartOptions";
import { changeOpacity, hexToRGBA } from "../../utils/color";
import { deepMerge } from "../../utils/object";

export class PieChartProxy extends PolarChartProxy {

    public constructor(params: ChartProxyParams) {
        super(params);
        this.recreateChart();
    }

    public update(params: UpdateChartParams): void {
        const { data, category } = params;

        this.updateChart({
            data: this.crossFiltering ? this.getCrossFilterData(params) : this.transformData(data, category.id),
            series: this.getSeries(params)
        });
    }

    private getSeries(params: UpdateChartParams): AgPolarSeriesOptions[] {
        const field = params.fields[0];

        const series = [{
            ...this.extractSeriesOverrides(),
            type: this.standaloneChartType,
            angleKey: field.colId,
            angleName: field.displayName!,
            labelKey: params.category.id,
            labelName: params.category.name,
        }];

        return this.crossFiltering ? this.extractCrossFilterSeries(series) : series;
    }

    private getCrossFilterData(params: UpdateChartParams) {
        // add additional filtered out field
        let fields = params.fields;
        fields.forEach(field => {
            const crossFilteringField = { ...field };
            crossFilteringField.colId = field.colId + '-filtered-out';
            fields.push(crossFilteringField);
        });

        const field = params.fields[0];
        const filteredOutField = fields[1];

        return params.data.map(d => {
            const total = d[field.colId] + d[filteredOutField.colId];
            d[field.colId + '-total'] = total;
            d[field.colId] = d[field.colId] / total;
            d[filteredOutField.colId] = 1;
            return d;
        });
    }

    private extractCrossFilterSeries(series: AgPieSeriesOptions[]) {
        const palette = this.chartTheme.palette;

        const updatePrimarySeries = (s: AgPieSeriesOptions) => {
            s.highlightStyle = { item: { fill: undefined } };
            s.radiusKey = s.angleKey;
            s.angleKey = s.angleKey + '-total';
            s.fills = palette.fills;
            s.strokes = palette.strokes;
            s.radiusMin = 0;
            s.radiusMax = 1;
            s.listeners = {
                ...this.extractSeriesOverrides().listeners,
                nodeClick: this.crossFilterCallback
            };
        }

        const updateFilteredOutSeries = (s: AgPieSeriesOptions) => {
            s.fills = changeOpacity(palette.fills, 0.3);
            s.strokes = changeOpacity(palette.strokes, 0.3);
            s.showInLegend = false;
        };

        const allSeries: AgPieSeriesOptions[] = [];
        for (let i = 0; i < series.length; i++) {
            const s = series[i];
            const angleKey = s.angleKey;
            updatePrimarySeries(s);
            allSeries.push(s);

            const filteredOutSeries = deepMerge({}, s);
            filteredOutSeries.radiusKey = angleKey + '-filtered-out'
            updateFilteredOutSeries(filteredOutSeries);
            allSeries.push(filteredOutSeries);
        }

        return allSeries;
    }
}