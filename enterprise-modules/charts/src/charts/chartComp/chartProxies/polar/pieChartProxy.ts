import { AgChart, AgPolarChartOptions, ChartTheme, PieSeries, PolarChart, AgChartTheme } from "ag-charts-community";
import { AgPieSeriesOptions } from "@ag-grid-community/core";
import { ChartProxyParams, FieldDefinition, UpdateChartParams } from "../chartProxy";
import { PolarChartProxy } from "./polarChartProxy";
import { LegendClickEvent } from "ag-charts-community/dist/cjs/chart/legend";

export class PieChartProxy extends PolarChartProxy {

    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.recreateChart();
    }

    protected createChart(): PolarChart {
        const agChartOptions = { theme: this.chartOptions } as AgPolarChartOptions;

        //TODO interrogate different options
        const overrides = (agChartOptions.theme! as AgChartTheme).overrides;
        const seriesOverrides = overrides && overrides!.pie ? overrides!.pie.series : {};

        agChartOptions.autoSize = true;
        agChartOptions.series = [{
            ...seriesOverrides,
            // fills: seriesDefaults.fill.colors,
            // fillOpacity: seriesDefaults.fill.opacity,
            // strokes: seriesDefaults.stroke.colors,
            // strokeOpacity: seriesDefaults.stroke.opacity,
            // strokeWidth: seriesDefaults.stroke.width,
            type: 'pie'
        }];

        return AgChart.create(agChartOptions, this.chartProxyParams.parentElement);
    }

    public update(params: UpdateChartParams): void {
        const {chart} = this;

        if (params.fields.length === 0) {
            chart.removeAllSeries();
            return;
        }

        const field = params.fields[0];
        const angleField = field;

        if (this.crossFiltering) {
            // add additional filtered out field
            let fields = params.fields;
            fields.forEach(field => {
                const crossFilteringField = {...field};
                crossFilteringField.colId = field.colId + '-filtered-out';
                fields.push(crossFilteringField);
            });

            const filteredOutField = fields[1];

            params.data.forEach(d => {
                d[field.colId + '-total'] = d[field.colId] + d[filteredOutField.colId];
                d[field.colId] = d[field.colId] / d[field.colId + '-total'];
                d[filteredOutField.colId] = 1;
            });

            let opaqueSeries = chart.series[1] as PieSeries;
            let radiusField = filteredOutField;
            opaqueSeries = this.updateSeries(chart, opaqueSeries, angleField, radiusField, params, undefined);

            radiusField = angleField;
            const filteredSeries = chart.series[0] as PieSeries;
            this.updateSeries(chart, filteredSeries, angleField, radiusField, params, opaqueSeries);

        } else {
            const series = chart.series[0] as PieSeries;
            this.updateSeries(chart, series, angleField, angleField, params, undefined);
        }
    }

    private updateSeries(
        chart: PolarChart,
        series: PieSeries,
        angleField: FieldDefinition,
        field: FieldDefinition,
        params: UpdateChartParams,
        opaqueSeries: PieSeries | undefined
    ) {
        const existingSeriesId = series && series.angleKey;

        //TODO interrogate different options
        const agChartOptions = { theme: this.chartOptions } as AgPolarChartOptions;
        const overrides = (agChartOptions.theme! as AgChartTheme).overrides;
        const seriesOverrides = overrides && overrides!.pie ? overrides!.pie.series : {};

        let pieSeries = series;

        if (existingSeriesId !== field.colId) {
            chart.removeSeries(series);


            const options = {
                ...seriesOverrides,
                type: 'pie',
                angleKey: this.crossFiltering ? angleField.colId + '-total' : angleField.colId,
                radiusKey: this.crossFiltering ? field.colId : undefined,
                // title: {
                //     ...seriesDefaults.title,
                //     text: seriesDefaults.title.text || params.fields[0].displayName,
                // },
                // fills: seriesDefaults.fill.colors,
                // fillOpacity: seriesDefaults.fill.opacity,
                // strokes: seriesDefaults.stroke.colors,
                // strokeOpacity: seriesDefaults.stroke.opacity,
                // strokeWidth: seriesDefaults.stroke.width,
                // tooltip: {
                //     enabled: seriesDefaults.tooltip && seriesDefaults.tooltip.enabled,
                //     renderer: seriesDefaults.tooltip && seriesDefaults.tooltip.enabled && seriesDefaults.tooltip.renderer,
                // },
            };
            pieSeries = AgChart.createComponent(options, 'pie.series');

            //TODO verify
            const palette = this.getPalette();
            pieSeries.fills = palette.fills;
            pieSeries.strokes = palette.strokes;

            if (this.crossFiltering && pieSeries && !pieSeries.tooltip.renderer) {
                // only add renderer if user hasn't provided one
                this.addCrossFilteringTooltipRenderer(pieSeries);
            }
        }

        pieSeries.angleName = field.displayName!;
        pieSeries.labelKey = params.category.id;
        pieSeries.labelName = params.category.name;
        pieSeries.data = params.data;

        if (this.crossFiltering) {
            pieSeries.radiusMin = 0;
            pieSeries.radiusMax = 1;

            const isOpaqueSeries = !opaqueSeries;
            if (isOpaqueSeries) {
                pieSeries.fills = this.changeOpacity(pieSeries.fills, 0.3);
                pieSeries.strokes = this.changeOpacity(pieSeries.strokes, 0.3);
                pieSeries.showInLegend = false;
            } else {
                chart.legend.addEventListener('click', (event: LegendClickEvent) => {
                    if (opaqueSeries) {
                        opaqueSeries.toggleSeriesItem(event.itemId as any, event.enabled);
                    }
                });
            }
            chart.tooltip.delay = 500;

            // disable series highlighting by default
            pieSeries.highlightStyle.fill = undefined;

            pieSeries.addEventListener("nodeClick", this.crossFilterCallback);
        }

        chart.addSeries(pieSeries);

        return pieSeries;
    }
}