import { CartesianChartOptions, LineSeriesOptions } from "@ag-grid-community/core";
import { CartesianChart, AgChart, findIndex } from "ag-charts-community";
import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { isDate } from '../../typeChecker';

export class LineChartProxy extends CartesianChartProxy<LineSeriesOptions> {

    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.recreateChart();
    }

    protected createChart(options: any): CartesianChart {
        const { grouping, parentElement } = this.chartProxyParams;

        options = options || this.chartOptions;
        options.theme = this.getTheme();
        options.autoSize = true;
        options.axes = [{
            ...options.xAxis,
            position: 'bottom',
            type: grouping ? 'groupedCategory' : 'category',
            paddingInner: 1,
            paddingOuter: 0
        }, {
            ...options.yAxis,
            position: 'left',
            type: 'number'
        }];

        return AgChart.create(options, parentElement);
    }

    public update(params: UpdateChartParams): void {
        const options: any = this.chartOptions;
        options.theme = this.getTheme();

        this.chartProxyParams.grouping = params.grouping;

        if (params.fields.length === 0) {
            options.series = [];
            return;
        }

        const testDatum = params.data[0];
        const testValue = testDatum && testDatum[params.category.id];

        this.updateAxes(isDate(testValue) ? 'time' : 'category');

        const allSeries: any[] = options.series || (options.series = []);
        const fieldIds = params.fields.map(f => f.colId);
        const data = this.transformData(params.data, params.category.id);

        const existingSeriesById = allSeries.reduceRight((map, series, i) => {
            const id = series.yKey;

            if (fieldIds.indexOf(id) === i) {
                map.set(id, series);
            } else {
                allSeries.splice(i, 1);
            }

            return map;
        }, new Map<string, any>());

        let previousYKey: string | undefined = undefined;

        params.fields.forEach((f, index) => {
            let series = existingSeriesById.get(f.colId);

            if (series) {
                series.title = f.displayName;
                series.data = data;
                series.xKey = params.category.id;
                series.xName = params.category.name;
                series.yKey = f.colId;
                series.yName = f.displayName;
            } else {
                const { seriesDefaults } = this.chartOptions;
                const marker = {
                    ...seriesDefaults.marker
                } as any;
                if (marker.type) { // deprecated
                    marker.shape = marker.type;
                    delete marker.type;
                }
                series = {
                    ...seriesDefaults,
                    type: 'line',
                    title: f.displayName,
                    data,
                    xKey: params.category.id,
                    xName: params.category.name,
                    yKey: f.colId,
                    yName: f.displayName,
                    fillOpacity: seriesDefaults.fill.opacity,
                    strokeOpacity: seriesDefaults.stroke.opacity,
                    strokeWidth: seriesDefaults.stroke.width,
                    marker
                };

                let insertIndex = findIndex(allSeries, series => {
                    return series.yKey === previousYKey;
                });
                if (insertIndex >= 0) {
                    insertIndex += 1;
                } else {
                    insertIndex = index;
                }
                allSeries.splice(insertIndex, 0, series);
            }

            previousYKey = series.yKey;
        });

        AgChart.update(this.chart, options, this.chartProxyParams.parentElement);

        this.updateLabelRotation(params.category.id);
    }

    protected getDefaultOptions(): CartesianChartOptions<LineSeriesOptions> {
        const options = this.getDefaultCartesianChartOptions() as CartesianChartOptions<LineSeriesOptions>;

        options.xAxis.label.rotation = 335;

        options.seriesDefaults = {
            ...options.seriesDefaults,
            stroke: {
                ...options.seriesDefaults.stroke,
                width: 3,
            },
            marker: {
                enabled: true,
                shape: 'circle',
                size: 6,
                strokeWidth: 1,
            },
            tooltip: {
                enabled: true,
            }
        };

        return options;
    }
}
