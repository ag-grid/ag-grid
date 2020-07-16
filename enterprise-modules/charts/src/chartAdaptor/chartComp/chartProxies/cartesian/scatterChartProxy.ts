import { _, CartesianChartOptions, ChartType, ScatterSeriesOptions } from "@ag-grid-community/core";
import { CartesianChart, ScatterSeries, AgChart, AgCartesianChartOptions } from "ag-charts-community";
import { ChartProxyParams, FieldDefinition, UpdateChartParams } from "../chartProxy";
import { ChartDataModel } from "../../chartDataModel";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { isDate } from "../../typeChecker";

interface SeriesDefinition {
    xField: FieldDefinition;
    yField: FieldDefinition;
    sizeField?: FieldDefinition;
}

export class ScatterChartProxy extends CartesianChartProxy<ScatterSeriesOptions> {

    public constructor(params: ChartProxyParams) {
        super(params);

        this.initChartOptions();
        this.recreateChart();
    }

    protected createChart(options?: CartesianChartOptions<ScatterSeriesOptions>): CartesianChart {
        options = options || this.chartOptions;
        const agChartOptions = options as AgCartesianChartOptions;
        agChartOptions.autoSize = true;
        agChartOptions.axes = [{
            ...options.xAxis,
            position: 'bottom',
            type: 'number'
        }, {
            ...options.yAxis,
            position: 'left',
            type: 'number'
        }];

        return AgChart.create(agChartOptions, this.chartProxyParams.parentElement);
    }

    public update(params: UpdateChartParams): void {
        if (params.fields.length < 2) {
            this.chart.removeAllSeries();
            return;
        }

        const { fields } = params;
        const { seriesDefaults } = this.chartOptions as any;
        const seriesDefinitions = this.getSeriesDefinitions(fields, seriesDefaults.paired);
        const testDatum = params.data[0];
        const xValuesAreDates = seriesDefinitions
            .map(d => d.xField.colId)
            .map(xKey => testDatum && testDatum[xKey])
            .every(test => isDate(test));

        this.updateAxes(xValuesAreDates ? 'time' : 'number');

        const { chart } = this;

        const existingSeriesById = (chart.series as ScatterSeries[]).reduceRight((map, series, i) => {
            const matchingIndex = _.findIndex(seriesDefinitions, (s: any) =>
                s.xField.colId === series.xKey &&
                s.yField.colId === series.yKey &&
                ((!s.sizeField && !series.sizeKey) || (s.sizeField && s.sizeField.colId === series.sizeKey)));

            if (matchingIndex === i) {
                map.set(series.yKey, series);
            } else {
                chart.removeSeries(series);
            }

            return map;
        }, new Map<string, ScatterSeries>());

        const { fills, strokes } = this.getPalette();
        const labelFieldDefinition = params.category.id === ChartDataModel.DEFAULT_CATEGORY ? undefined : params.category;
        let previousSeries: ScatterSeries | undefined = undefined;

        seriesDefinitions.forEach((seriesDefinition, index) => {
            const existingSeries = existingSeriesById.get(seriesDefinition.yField.colId);
            const marker = { ...seriesDefaults.marker } as any;
            if (marker.type) { // deprecated
                marker.shape = marker.type;
                delete marker.type;
            }
            const series = existingSeries || AgChart.createComponent({
                ...seriesDefaults,
                type: 'scatter',
                fillOpacity: seriesDefaults.fill.opacity,
                strokeOpacity: seriesDefaults.stroke.opacity,
                strokeWidth: seriesDefaults.stroke.width,
                marker
            }, 'scatter.series');

            if (!series) {
                return;
            }

            const {
                xField: xFieldDefinition,
                yField: yFieldDefinition,
                sizeField: sizeFieldDefinition
            } = seriesDefinition;

            series.title = `${yFieldDefinition.displayName} vs ${xFieldDefinition.displayName}`;
            series.xKey = xFieldDefinition.colId;
            series.xName = xFieldDefinition.displayName;
            series.yKey = yFieldDefinition.colId;
            series.yName = yFieldDefinition.displayName;
            series.data = params.data;
            series.fill = fills[index % fills.length];
            series.stroke = strokes[index % strokes.length];

            if (sizeFieldDefinition) {
                series.sizeKey = sizeFieldDefinition.colId;
                series.sizeName = sizeFieldDefinition.displayName;
            } else {
                series.sizeKey = series.sizeName = undefined;
            }

            if (labelFieldDefinition) {
                series.labelKey = labelFieldDefinition.id;
                series.labelName = labelFieldDefinition.name;
            } else {
                series.labelKey = series.labelName = undefined;
            }

            if (!existingSeries) {
                chart.addSeriesAfter(series, previousSeries);
            }

            previousSeries = series;
        });
    }

    public getTooltipsEnabled(): boolean {
        return this.chartOptions.seriesDefaults.tooltip != null && !!this.chartOptions.seriesDefaults.tooltip.enabled;
    }

    public getMarkersEnabled = (): boolean => true; // markers are always enabled on scatter charts

    protected getDefaultOptions(): CartesianChartOptions<ScatterSeriesOptions> {
        const isBubble = this.chartType === ChartType.Bubble;
        const options = this.getDefaultCartesianChartOptions() as CartesianChartOptions<ScatterSeriesOptions>;

        options.seriesDefaults = {
            ...options.seriesDefaults,
            fill: {
                ...options.seriesDefaults.fill,
                opacity: isBubble ? 0.7 : 1,
            },
            stroke: {
                ...options.seriesDefaults.stroke,
                width: 3,
            },
            marker: {
                shape: 'circle',
                enabled: true,
                size: isBubble ? 30 : 6,
                minSize: isBubble ? 6 : undefined,
                strokeWidth: 1,
            },
            tooltip: {
                enabled: true,
            },
            paired: false,
        };

        return options;
    }

    private getSeriesDefinitions(fields: FieldDefinition[], paired: boolean): SeriesDefinition[] {
        if (fields.length < 2) {
            return [];
        }

        const isBubbleChart = this.chartType === ChartType.Bubble;

        if (paired) {
            if (isBubbleChart) {
                return fields.map((xField, i) => i % 3 === 0 ? ({
                    xField,
                    yField: fields[i + 1],
                    sizeField: fields[i + 2],
                }) : null).filter(x => x && x.yField && x.sizeField);
            } else {
                return fields.map((xField, i) => i % 2 === 0 ? ({
                    xField,
                    yField: fields[i + 1],
                }) : null).filter(x => x && x.yField);
            }
        } else {
            const xField = fields[0];

            if (isBubbleChart) {
                return fields
                    .map((yField, i) => i % 2 === 1 ? ({
                        xField,
                        yField,
                        sizeField: fields[i + 1],
                    }) : null)
                    .filter(x => x && x.sizeField);
            } else {
                return fields.filter((_, i) => i > 0).map(yField => ({ xField, yField }));
            }
        }
    }
}


// import { _, CartesianChartOptions, ChartType, ScatterSeriesOptions } from "@ag-grid-community/core";
// import { CartesianChart, AgChart, findIndex, AgCartesianChartOptions } from "ag-charts-community";
// import { ChartProxyParams, FieldDefinition, UpdateChartParams } from "../chartProxy";
// import { ChartDataModel } from "../../chartDataModel";
// import { CartesianChartProxy } from "./cartesianChartProxy";
// import { isDate } from "../../typeChecker";
//
// interface SeriesDefinition {
//     xField: FieldDefinition;
//     yField: FieldDefinition;
//     sizeField?: FieldDefinition;
// }
//
// export class ScatterChartProxy extends CartesianChartProxy {
//
//     public constructor(params: ChartProxyParams) {
//         super(params);
//
//         this.initChartOptions();
//         this.recreateChart();
//     }
//
//     protected createChart(chartOptions?: AgCartesianChartOptions): CartesianChart {
//         chartOptions = chartOptions || this.chartOptions as AgCartesianChartOptions;
//         const options: AgCartesianChartOptions = chartOptions;
//         options.autoSize = true;
//         options.axes = [{
//             // ...chartOptions.xAxis,
//             position: 'bottom',
//             type: 'number'
//         }, {
//             // ...chartOptions.yAxis,
//             position: 'left',
//             type: 'number'
//         }];
//
//         return AgChart.create(options, this.chartProxyParams.parentElement);
//     }
//
//     public update(params: UpdateChartParams): void {
//         const options = this.chartOptions as AgCartesianChartOptions;
//
//         if (params.fields.length < 2) {
//             options.series = [];
//             return;
//         }
//
//         const { fields } = params;
//         const { seriesDefaults } = options as CartesianChartOptions<ScatterSeriesOptions>;
//         const seriesDefinitions = this.getSeriesDefinitions(fields, seriesDefaults.paired);
//         const testDatum = params.data[0];
//         const xValuesAreDates = seriesDefinitions
//             .map(d => d.xField.colId)
//             .map(xKey => testDatum && testDatum[xKey])
//             .every(test => isDate(test));
//
//         this.updateAxes(xValuesAreDates ? 'time' : 'number');
//
//         const allSeries: any[] = options.series || (options.series = []);
//         const existingSeriesById = allSeries.reduceRight((map, series, i) => {
//             const matchingIndex = _.findIndex(seriesDefinitions, (s: any) =>
//                 s.xField.colId === series.xKey &&
//                 s.yField.colId === series.yKey &&
//                 ((!s.sizeField && !series.sizeKey) || (s.sizeField && s.sizeField.colId === series.sizeKey)));
//
//             if (matchingIndex === i) {
//                 map.set(series.yKey, series);
//             } else {
//                 allSeries.splice(i, 1);
//             }
//
//             return map;
//         }, new Map<string, any>());
//
//         const labelFieldDefinition = params.category.id === ChartDataModel.DEFAULT_CATEGORY ? undefined : params.category;
//         let previousYKey: string | undefined = undefined;
//
//         seriesDefinitions.forEach((seriesDefinition, index) => {
//             const existingSeries = existingSeriesById.get(seriesDefinition.yField.colId);
//             const marker = { ...seriesDefaults.marker } as any;
//             if (marker.type) { // deprecated
//                 marker.shape = marker.type;
//                 delete marker.type;
//             }
//             const series = existingSeries || {
//                 ...seriesDefaults,
//                 type: 'scatter',
//                 // fillOpacity: seriesDefaults.fill.opacity,
//                 // strokeOpacity: seriesDefaults.stroke.opacity,
//                 // strokeWidth: seriesDefaults.stroke.width,
//                 marker
//             };
//
//             if (!series) {
//                 return;
//             }
//
//             const {
//                 xField: xFieldDefinition,
//                 yField: yFieldDefinition,
//                 sizeField: sizeFieldDefinition
//             } = seriesDefinition;
//
//             series.title = `${yFieldDefinition.displayName} vs ${xFieldDefinition.displayName}`;
//             series.xKey = xFieldDefinition.colId;
//             series.xName = xFieldDefinition.displayName;
//             series.yKey = yFieldDefinition.colId;
//             series.yName = yFieldDefinition.displayName;
//             series.data = params.data;
//
//             if (sizeFieldDefinition) {
//                 series.sizeKey = sizeFieldDefinition.colId;
//                 series.sizeName = sizeFieldDefinition.displayName;
//             } else {
//                 series.sizeKey = series.sizeName = undefined;
//             }
//
//             if (labelFieldDefinition) {
//                 series.labelKey = labelFieldDefinition.id;
//                 series.labelName = labelFieldDefinition.name;
//             } else {
//                 series.labelKey = series.labelName = undefined;
//             }
//
//             if (!existingSeries) {
//                 // chart.addSeriesAfter(series, previousSeries);
//
//                 let insertIndex = findIndex(allSeries, series => {
//                     return series.yKey === previousYKey;
//                 });
//                 if (insertIndex >= 0) {
//                     insertIndex += 1;
//                 } else {
//                     insertIndex = index;
//                 }
//                 allSeries.splice(insertIndex, 0, series);
//             }
//
//             previousYKey = series.yKey;
//         });
//
//         AgChart.update(this.chart, options, this.chartProxyParams.parentElement);
//     }
//
//     public getTooltipsEnabled(): boolean {
//         return true;
//         // return this.chartOptions.seriesDefaults.tooltip != null && !!this.chartOptions.seriesDefaults.tooltip.enabled;
//     }
//
//     public getMarkersEnabled = (): boolean => true; // markers are always enabled on scatter charts
//
//     protected getDefaultOptions(): AgCartesianChartOptions {
//         const isBubble = this.chartType === ChartType.Bubble;
//         const options = this.getDefaultCartesianChartOptions();
//
//         // options.seriesDefaults = {
//         //     ...options.seriesDefaults,
//         //     fill: {
//         //         ...options.seriesDefaults.fill,
//         //         opacity: isBubble ? 0.7 : 1,
//         //     },
//         //     stroke: {
//         //         ...options.seriesDefaults.stroke,
//         //         width: 3,
//         //     },
//         //     marker: {
//         //         shape: 'circle',
//         //         enabled: true,
//         //         size: isBubble ? 30 : 6,
//         //         minSize: isBubble ? 6 : undefined,
//         //         strokeWidth: 1,
//         //     },
//         //     tooltip: {
//         //         enabled: true,
//         //     },
//         //     paired: false,
//         // };
//
//         return options;
//     }
//
//     private getSeriesDefinitions(fields: FieldDefinition[], paired: boolean): SeriesDefinition[] {
//         if (fields.length < 2) {
//             return [];
//         }
//
//         const isBubbleChart = this.chartType === ChartType.Bubble;
//
//         if (paired) {
//             if (isBubbleChart) {
//                 return fields.map((xField, i) => i % 3 === 0 ? ({
//                     xField,
//                     yField: fields[i + 1],
//                     sizeField: fields[i + 2],
//                 }) : null).filter(x => x && x.yField && x.sizeField);
//             } else {
//                 return fields.map((xField, i) => i % 2 === 0 ? ({
//                     xField,
//                     yField: fields[i + 1],
//                 }) : null).filter(x => x && x.yField);
//             }
//         } else {
//             const xField = fields[0];
//
//             if (isBubbleChart) {
//                 return fields
//                     .map((yField, i) => i % 2 === 1 ? ({
//                         xField,
//                         yField,
//                         sizeField: fields[i + 1],
//                     }) : null)
//                     .filter(x => x && x.sizeField);
//             } else {
//                 return fields.filter((_, i) => i > 0).map(yField => ({ xField, yField }));
//             }
//         }
//     }
// }
