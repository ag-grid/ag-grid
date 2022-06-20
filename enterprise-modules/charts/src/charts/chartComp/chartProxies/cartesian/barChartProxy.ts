import { _ } from "@ag-grid-community/core";
import { AgBarSeriesOptions, ChartAxisPosition } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { deepMerge } from "../../utils/object";
import { hexToRGBA } from "../../utils/color";

export class BarChartProxy extends CartesianChartProxy {

    public constructor(params: ChartProxyParams) {
        super(params);

        // when the standalone chart type is 'bar' - xAxis is positioned to the 'left'
        this.xAxisType = params.grouping ? 'groupedCategory' : 'category';
        this.yAxisType = 'number';

        this.recreateChart();
    }

    public update(params: UpdateChartParams): void {
        const isNormalised = this.isNormalised();
        const isBar = this.standaloneChartType === 'bar';

        this.updateChart({
            data: this.transformData(params.data, params.category.id),
            axes: this.getAxes(isBar, isNormalised),
            series: this.getSeries(params, isNormalised)
        });
    }

    private getAxes(isBar: boolean, normalised: boolean) {
        const axisOptions = this.getAxesOptions();
        let axes = [
            {
                ...deepMerge(axisOptions[this.xAxisType], axisOptions[this.xAxisType].bottom),
                type: this.xAxisType,
                position: isBar ? ChartAxisPosition.Left : ChartAxisPosition.Bottom,
            },
            {
                ...deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].left),
                type: this.yAxisType,
                position: isBar ? ChartAxisPosition.Bottom : ChartAxisPosition.Left,
            },
        ];
        // special handling to add a default label formatter to show '%' for normalized charts if none is provided
        if (normalised) {
            const numberAxis = axes[1];
            numberAxis.label = { ...numberAxis.label, formatter: (params: any) => Math.round(params.value) + '%' };
        }

        return axes;
    }

    private getSeries(params: UpdateChartParams, normalised: boolean) {
        const groupedCharts = ['groupedColumn', 'groupedBar'];
        const isGrouped = !this.crossFiltering && _.includes(groupedCharts, this.chartType);

        const series: AgBarSeriesOptions[] = params.fields.map(f => (
            {
                ...this.extractSeriesOverrides(),
                type: this.standaloneChartType,
                grouped: isGrouped,
                normalizedTo: normalised ? 100 : undefined,
                xKey: params.category.id,
                xName: params.category.name,
                yKey: f.colId,
                yName: f.displayName
            }
        ));

        return this.crossFiltering ? this.extractCrossFilterSeries(series) : series;
    }

    private extractCrossFilterSeries(series: AgBarSeriesOptions[]): AgBarSeriesOptions[] {
        const palette = this.chartTheme.palette;

        const updatePrimarySeries = (s: AgBarSeriesOptions, index: number) => {
            s.highlightStyle = { item: { fill: undefined } };
            s.fill = palette.fills[index];
            s.stroke = palette.strokes[index];
            s.listeners = { nodeClick: this.crossFilterCallback };
        }

        const updateFilteredOutSeries = (s: AgBarSeriesOptions) => {
            s.yKey = s.yKey + '-filtered-out';
            s.fill = hexToRGBA(s.fill!, '0.3');
            s.stroke = hexToRGBA(s.stroke!, '0.3');
            (s as any).hideInLegend = [s.yKey];
        }

        const allSeries: AgBarSeriesOptions[] = [];
        for (let i = 0; i < series.length; i++) {
            const s: AgBarSeriesOptions = series[i];
            updatePrimarySeries(s, i);
            allSeries.push(s);

            const filteredOutSeries = deepMerge({}, s);
            updateFilteredOutSeries(filteredOutSeries);

            // TODO: pending AG Chart factory support
            // sync toggling of legend item with hidden 'filtered out' item
            // this.chart.legend.addEventListener('click', (event: LegendClickEvent) => {
            //     barSeries.toggleSeriesItem(event.itemId + '-filtered-out', event.enabled);
            // });

            allSeries.push(filteredOutSeries);
        }
        return allSeries;
    }

    private isNormalised() {
        const normalisedCharts = ['normalizedColumn', 'normalizedBar'];
        return !this.crossFiltering && _.includes(normalisedCharts, this.chartType);
    }
}