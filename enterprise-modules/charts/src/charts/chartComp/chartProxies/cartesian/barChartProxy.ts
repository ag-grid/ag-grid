import {
    _,
    AgBarSeriesOptions,
    ChartType,
} from "@ag-grid-community/core";
import {
    AgCartesianChartOptions,
    AgChart,
    BarSeries,
    CartesianChart,
    ChartTheme,
    LegendClickEvent,
    AgChartTheme
} from "ag-charts-community";
import { ChartProxyParams, FieldDefinition, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { deepMerge } from "../../object";

export class BarChartProxy extends CartesianChartProxy<any> {

    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.recreateChart();
    }

    protected createChart(): CartesianChart {
        const agChartOptions = { theme: this.chartOptions } as AgCartesianChartOptions;

        const isColumn = this.isColumnChart();
        const [xAxis, yAxis] = this.getAxes();
        agChartOptions.axes = [
            {
                ...(isColumn ? xAxis : yAxis),
                position: isColumn ? 'bottom' : 'left',
                type: this.chartProxyParams.grouping ? 'groupedCategory' : 'category'
            },
            {
                ...(isColumn ? yAxis : xAxis),
                position: isColumn ? 'left' : 'bottom',
                type: 'number'
            }
        ];

        agChartOptions.type = this.chartProxyParams.grouping ? 'groupedCategory' : agChartOptions.type;

        // special handling to add a default label formatter to show '%' for normalized charts if none is provided
        const normalised = !this.crossFiltering && _.includes([ChartType.NormalizedColumn, ChartType.NormalizedBar], this.chartType);
        if (normalised) {
            const numberAxis = agChartOptions.axes[1];
            // FIXME: only update labels when no formatter is supplied
            numberAxis.label = {...numberAxis.label, formatter: params => Math.round(params.value) + '%'};
        }

        const chartOverrides = this.chartOptions.overrides;
        const seriesDefaults = isColumn ? chartOverrides.column.series.column : chartOverrides.bar.series.bar;

        const isGrouped = !this.crossFiltering && _.includes([ChartType.GroupedColumn, ChartType.GroupedBar], this.chartType);
        agChartOptions.series = [{
            ...seriesDefaults,
            type: isColumn ? 'column' : 'bar',
            grouped: isGrouped,
            normalizedTo: normalised ? 100 : undefined,
        }];

        agChartOptions.container = this.chartProxyParams.parentElement;
        return AgChart.create(agChartOptions);
    }

    public update(params: UpdateChartParams): void {
        this.chartProxyParams.grouping = params.grouping;

        this.updateAxes('category', !this.isColumnChart());

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

        this.updateLabelRotation(params.category.id, !this.isColumnChart());
    }

    private updateCrossFilteringSeries(barSeries: BarSeries, params: UpdateChartParams) {
        const chart = this.chart;
        const palette = this.getPalette();
        let fields: FieldDefinition[] = params.fields;

        // add additional filtered out field
        fields.forEach(field => {
            const crossFilteringField = {...field};
            crossFilteringField.colId = field.colId + '-filtered-out';
            fields.push(crossFilteringField);
        });

        // introduce cross filtering transparent fills
        const fills: string[] = [];
        palette.fills.forEach(fill => {
            fills.push(fill);
            fills.push(this.hexToRGBA(fill, '0.3'));
        });
        barSeries.fills = fills;

        // introduce cross filtering transparent strokes
        const strokes: string[] = [];
        palette.strokes.forEach(stroke => {
            fills.push(stroke);
            fills.push(this.hexToRGBA(stroke, '0.3'));
        });
        barSeries.strokes = strokes;

        // disable series highlighting by default
        barSeries.highlightStyle.fill = undefined;

        // hide 'filtered out' legend items
        const colIds = params.fields.map(f => f.colId);
        barSeries.hideInLegend = colIds.filter(colId => colId.indexOf('-filtered-out') !== -1);

        // sync toggling of legend item with hidden 'filtered out' item
        chart.legend.addEventListener('click', (event: LegendClickEvent) => {
            barSeries.toggleSeriesItem(event.itemId + '-filtered-out', event.enabled);
        });

        chart.tooltip.delay = 500;

        // add node click cross filtering callback to series
        barSeries.addEventListener('nodeClick', this.crossFilterCallback);
    }

    private isColumnChart(): boolean {
        return _.includes([ChartType.Column, ChartType.GroupedColumn, ChartType.StackedColumn, ChartType.NormalizedColumn], this.chartType);
    }
}