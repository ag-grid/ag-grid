import { _ } from "@ag-grid-community/core";
import { AgBarSeriesOptions, AgCartesianAxisOptions } from "ag-charts-community";
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

    public getData(params: UpdateChartParams): any[] {
        return this.getDataTransformedData(params);
    }

    public getAxes(): AgCartesianAxisOptions[] {
        const isBar = this.standaloneChartType === 'bar';
        const axes: AgCartesianAxisOptions[] = [
            {
                type: this.xAxisType,
                position: isBar ? 'left' : 'bottom',
            },
            {
                type: this.yAxisType,
                position: isBar ? 'bottom' : 'left',
            },
        ];
        // Add a default label formatter to show '%' for normalized charts if none is provided
        if (this.isNormalised()) {
            const numberAxis = axes[1];
            numberAxis.label = { ...numberAxis.label, formatter: (params: any) => Math.round(params.value) + '%' };
        }

        return axes;
    }

    public getSeries(params: UpdateChartParams): AgBarSeriesOptions[] {
        const groupedCharts = ['groupedColumn', 'groupedBar'];
        const isGrouped = !this.crossFiltering && _.includes(groupedCharts, this.chartType);

        const series: AgBarSeriesOptions[] = params.fields.map(f => (
            {
                type: this.standaloneChartType,
                grouped: isGrouped,
                normalizedTo: this.isNormalised() ? 100 : undefined,
                xKey: params.category.id,
                xName: params.category.name,
                yKey: f.colId,
                yName: f.displayName
            } as AgBarSeriesOptions
        ));

        return this.crossFiltering ? this.extractCrossFilterSeries(series) : series;
    }

    private extractCrossFilterSeries(series: AgBarSeriesOptions[]): AgBarSeriesOptions[] {
        const palette = this.getChartPalette();

        const updatePrimarySeries = (seriesOptions: AgBarSeriesOptions, index: number) => {
            return {
                ...seriesOptions,
                highlightStyle: { item: { fill: undefined } },
                fill: palette?.fills[index],
                stroke: palette?.strokes[index],
                listeners: {
                    nodeClick: this.crossFilterCallback
                }
            }
        }

        const updateFilteredOutSeries = (seriesOptions: AgBarSeriesOptions): AgBarSeriesOptions => {
            const yKey = seriesOptions.yKey + '-filtered-out';
            return {
                ...deepMerge({}, seriesOptions),
                yKey,
                fill: hexToRGBA(seriesOptions.fill!, '0.3'),
                stroke: hexToRGBA(seriesOptions.stroke!, '0.3'),
                hideInLegend: [yKey],
            }
        }

        const allSeries: AgBarSeriesOptions[] = [];
        for (let i = 0; i < series.length; i++) {
            // update primary series
            const primarySeries = updatePrimarySeries(series[i], i);
            allSeries.push(primarySeries);

            // add 'filtered-out' series
            allSeries.push(updateFilteredOutSeries(primarySeries));
        }
        return allSeries;
    }

    private isNormalised() {
        const normalisedCharts = ['normalizedColumn', 'normalizedBar'];
        return !this.crossFiltering && _.includes(normalisedCharts, this.chartType);
    }
}