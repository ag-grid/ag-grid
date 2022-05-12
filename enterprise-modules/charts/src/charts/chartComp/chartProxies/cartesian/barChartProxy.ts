import { _, } from "@ag-grid-community/core";
import { AgChart, BarSeries, CartesianChart, ChartAxisPosition, LegendClickEvent } from "ag-charts-community";
import { ChartProxyParams, FieldDefinition, UpdateChartParams } from "../chartProxy";
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

    protected createChart(): CartesianChart {
        const [isBar, isNormalised] = [this.standaloneChartType === 'bar', this.isNormalised()];

        return AgChart.create({
            container: this.chartProxyParams.parentElement,
            theme: this.chartTheme,
            axes: this.getAxes(isBar, isNormalised),
            series: this.getSeries(isNormalised),
        });
    }

    public update(params: UpdateChartParams): void {
        this.updateAxes(params);

        const barSeries = this.chart.series[0] as BarSeries;
        if (this.crossFiltering) {
            this.updateCrossFilteringSeries(barSeries, params);
        } else {
            barSeries.fills = this.chartTheme.palette.fills;
            barSeries.strokes = this.chartTheme.palette.strokes;
        }

        barSeries.data = this.transformData(params.data, params.category.id);
        barSeries.xKey = params.category.id;
        barSeries.xName = params.category.name;
        barSeries.yKeys = params.fields.map(f => f.colId) as any;
        barSeries.yNames = params.fields.map(f => f.displayName!) as any;
    }

    private updateCrossFilteringSeries(barSeries: BarSeries, params: UpdateChartParams) {
        // add additional filtered out field
        let fields: FieldDefinition[] = params.fields;
        fields.forEach(field => {
            const crossFilteringField = {...field};
            crossFilteringField.colId = field.colId + '-filtered-out';
            fields.push(crossFilteringField);
        });

        const palette = this.chartTheme.palette;

        // introduce cross filtering transparent fills
        const fills: string[] = [];
        palette.fills.forEach(fill => {
            fills.push(fill);
            fills.push(hexToRGBA(fill, '0.3'));
        });
        barSeries.fills = fills;

        // introduce cross filtering transparent strokes
        const strokes: string[] = [];
        palette.strokes.forEach(stroke => {
            fills.push(stroke);
            fills.push(hexToRGBA(stroke, '0.3'));
        });
        barSeries.strokes = strokes;

        // disable series highlighting by default
        barSeries.highlightStyle.fill = undefined;

        // hide 'filtered out' legend items
        const colIds = params.fields.map(f => f.colId);
        barSeries.hideInLegend = colIds.filter(colId => colId.indexOf('-filtered-out') !== -1);

        // sync toggling of legend item with hidden 'filtered out' item
        this.chart.legend.addEventListener('click', (event: LegendClickEvent) => {
            barSeries.toggleSeriesItem(event.itemId + '-filtered-out', event.enabled);
        });

        this.chart.tooltip.delay = 500;

        // add node click cross filtering callback to series
        barSeries.addEventListener('nodeClick', this.crossFilterCallback);
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
            numberAxis.label = {...numberAxis.label, formatter: (params: any) => Math.round(params.value) + '%'};
        }
        return axes;
    }

    private getSeries(normalised: boolean) {
        const groupedCharts = ['groupedColumn', 'groupedBar'];
        const isGrouped = !this.crossFiltering && _.includes(groupedCharts, this.chartType);
        return [{
            ...this.chartOptions[this.standaloneChartType].series,
            type: this.standaloneChartType,
            grouped: isGrouped,
            normalizedTo: normalised ? 100 : undefined,
        }];
    }

    private isNormalised() {
        const normalisedCharts = ['normalizedColumn', 'normalizedBar'];
        return !this.crossFiltering && _.includes(normalisedCharts, this.chartType);
    }
}