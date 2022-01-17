import { AgChart, AgCartesianChartOptions, AgCartesianAxisOptions, CartesianChart, ChartAxisPosition } from "ag-charts-community";
import { _, ChartType, SeriesChartType } from "@ag-grid-community/core";
import { ChartProxyParams, FieldDefinition, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "../cartesian/cartesianChartProxy";
import { deepMerge } from "../../utils/object";
import { getSeriesType } from "../../utils/seriesTypeMapper";

export class ComboChartProxy extends CartesianChartProxy {

    private updateParams: UpdateChartParams;
    private prevSeriesChartTypes: SeriesChartType[];

    public constructor(params: ChartProxyParams) {
        super(params);

        this.xAxisType = 'category';
        this.yAxisType = 'number';

        this.recreateChart();
    }

    protected createChart(): CartesianChart {
        return AgChart.create({
            container: this.chartProxyParams.parentElement,
            theme: this.chartTheme,
            axes: this.getAxes(),
        });
    }

    public update(params: UpdateChartParams): void {
        this.resetAxes(params);
        this.updateSeries(params);
        this.updateLabelRotation(params.category.id);
    }

    private getAxes(): AgCartesianAxisOptions[] {
        const axisOptions = this.getAxesOptions('cartesian');
        const bottomOptions = deepMerge(axisOptions[this.xAxisType], axisOptions[this.xAxisType].bottom);
        const leftOptions = deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].left);
        const rightOptions = deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].right);

        const primaryYKeys: string[] = [];
        const secondaryYKeys: string[] = [];

        const fields = this.updateParams ? this.updateParams.fields : [];
        const fieldsMap = new Map(fields.map(f => [f.colId, f]));

        const seriesChartTypes = this.chartProxyParams.seriesChartTypes;
        if (seriesChartTypes) {
            seriesChartTypes.forEach(seriesChartType => {
                const { secondaryAxis, colId } = seriesChartType;
                secondaryAxis ? secondaryYKeys.push(colId) : primaryYKeys.push(colId);
            });
        }

        const axes = [
            {
                ...bottomOptions,
                type: this.xAxisType,
                position: ChartAxisPosition.Bottom,
                gridStyle: {
                    width: 0,
                },
            },
        ];

        if (primaryYKeys.length > 0) {
            axes.push({
                ...leftOptions,
                type: this.yAxisType,
                keys: primaryYKeys,
                position: ChartAxisPosition.Left,
                title: {
                    ...deepMerge(leftOptions.title, {
                        enabled: true,
                        text: primaryYKeys.map(key => {
                            const field = fieldsMap.get(key);
                            return field ? field.displayName : key;
                        }).join(' / '),
                    })
                },
            });
        }

        if (secondaryYKeys.length > 0) {
            secondaryYKeys.forEach((secondaryYKey: string, i: number) => {
                const field = fieldsMap.get(secondaryYKey);
                const secondaryAxisIsVisible = field && field.colId === secondaryYKey;
                if (!secondaryAxisIsVisible) {
                    return;
                }

                const secondaryAxisOptions = {
                    ...rightOptions,
                    type: this.yAxisType,
                    keys: [secondaryYKey],
                    position: ChartAxisPosition.Right,
                    title: {
                        ...deepMerge(rightOptions.title, {
                            enabled: true,
                            text: field ? field.displayName : secondaryYKey,
                        })
                    },
                }

                const primaryYAxis = primaryYKeys.some(primaryYKey => !!fieldsMap.get(primaryYKey));
                const lastSecondaryAxis = i === secondaryYKeys.length - 1;

                if (!primaryYAxis && lastSecondaryAxis) {
                    // don't remove grid lines from the secondary axis closest to the chart, i.e. last supplied
                } else {
                    secondaryAxisOptions.gridStyle = { width: 0 };
                }

                axes.push(secondaryAxisOptions);
            });
        }

        return axes;
    }

    private resetAxes(params: UpdateChartParams): void {
        const { seriesChartTypes } = params;
        const seriesChartTypesChanged = !_.areEqual(this.prevSeriesChartTypes, seriesChartTypes,
            (s1, s2) => s1.colId === s2.colId && s1.chartType === s2.chartType && s1.secondaryAxis === s2.secondaryAxis);

        // cache a cloned copy of `seriesChartTypes` for subsequent comparisons
        this.prevSeriesChartTypes = seriesChartTypes.map(s => ({...s}));

        if (seriesChartTypesChanged) {
            // save updateParams so axes can obtain series display name and check for visible series
            this.updateParams = params;
            // recreate axes
            this.recreateChart();
        }
    }

    private updateSeries(params: UpdateChartParams) {
        const { fields, category } = params;
        const { fills, strokes } = this.chartTheme.palette;

        if (fields.length === 0) {
            this.chart.removeAllSeries();
            return;
        }

        const data = this.transformData(params.data, category.id);
        const seriesMap = this.updateSeriesAndExtractSeriesMap(fields);

        let previousSeries: any;
        fields.forEach((f: FieldDefinition, index) => {
            const seriesChartType = params.seriesChartTypes.find(s => s.colId === f.colId);
            if (!seriesChartType) { return; }

            let series = seriesMap.get(f.colId);

            const fill = fills[index % fills.length];
            const stroke = strokes[index % strokes.length];

            if (series) {
                series.title = f.displayName!;
                series.data = data;
                series.xKey = category.id;
                series.xName = category.name;
                series.yKey = f.colId;
                series.yName = f.displayName!;
                series.marker.fill = fill;
                series.marker.stroke = stroke;
                series.stroke = fill; // this is deliberate, so that the line colours match the fills of other series
            } else {
                const chartType = seriesChartType.chartType;
                const seriesType = getSeriesType(chartType);
                const seriesOverrides = this.chartOptions[seriesType].series;
                const seriesOptions = {
                    ...seriesOverrides,
                    data,
                    type: seriesType,
                    xKey: category.id,
                    grouped: ['groupedColumn' || 'groupedBar' || 'groupedArea'].includes(chartType),
                    stacked: ['stackedArea'].includes(chartType),
                    fill,
                    stroke: fill, // this is deliberate, so that the line colours match the fills of other series
                    marker: {
                        ...seriesOverrides!.marker,
                        fill,
                        stroke
                    }
                }

                if (seriesType === 'line') {
                    seriesOptions.yKey = f.colId;
                    seriesOptions.yName =f.displayName;
                } else {
                    seriesOptions.yKeys = [f.colId];
                    seriesOptions.yNames = [f.displayName];
                }

                series = AgChart.createComponent(seriesOptions, seriesType + '.series');
                this.chart.addSeriesAfter(series!, previousSeries);
            }

            previousSeries = series;
        });
    }

    private updateSeriesAndExtractSeriesMap(fields: FieldDefinition[]) {
        const fieldIds = fields.map(f => f.colId);
        const series = this.chart.series as any[];

        return series.reduceRight((map, series, i: number) => {
            const seriesExistsInSamePosition = fieldIds.indexOf(series.yKey) === i;
            if (seriesExistsInSamePosition) {
                map.set(series.yKey, series);
            } else {
                this.chart.removeSeries(series);
            }
            return map;
        }, new Map<string, any>());
    }
}