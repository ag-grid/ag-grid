import { AgChart, AgCartesianChartOptions, AgCartesianAxisOptions, CartesianChart, ChartAxisPosition, AgChartV2 } from "ag-charts-community";
import { _, ChartType, SeriesChartType } from "@ag-grid-community/core";
import { ChartProxyParams, FieldDefinition, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "../cartesian/cartesianChartProxy";
import { deepMerge } from "../../utils/object";
import { getSeriesType } from "../../utils/seriesTypeMapper";

export class ComboChartProxy extends CartesianChartProxy {

    private prevFields: string;
    private prevSeriesChartTypes: SeriesChartType[];
    private prevAxes: AgCartesianAxisOptions[];

    public constructor(params: ChartProxyParams) {
        super(params);

        this.xAxisType = 'category';
        this.yAxisType = 'number';

        this.recreateChart();
    }

    protected createChart(): CartesianChart {
        let chart: CartesianChart;

        if ((window as any).test === true) {
            chart = AgChartV2.create({
                type: 'cartesian',
                container: this.chartProxyParams.parentElement,
                theme: this.chartTheme,
            }) as CartesianChart;

        } else {
            chart = AgChart.create({
                container: this.chartProxyParams.parentElement,
                theme: this.chartTheme,
            }) as CartesianChart;
        }

        console.log(chart);

        return chart;
    }

    public update(params: UpdateChartParams): void {
        const { category, data } = params;

        let options: AgCartesianChartOptions;

        if ((window as any).test === true) {
            options = {
                type: 'cartesian',
                container: this.chartProxyParams.parentElement,
                theme: this.chartTheme,
                data: this.transformData(data, category.id),
                series: this.getSeriesOptions(params),
                axes: this.getAxes(params),
            }

            AgChartV2.update(this.chart as CartesianChart, options);
        } else {
            options = {
                container: this.chartProxyParams.parentElement,
                theme: this.chartTheme,
                data: this.transformData(data, category.id),
                series: this.getSeriesOptions(params),
            }

            const axesCleared = this.clearAxes(params);
            if (axesCleared) {
                options.axes = this.getAxes(params);
                this.prevAxes = options.axes;
            } else {
                this.chart.axes = [];
                options.axes = this.prevAxes;
            }

            AgChart.update(this.chart as CartesianChart, options);
        }

        // console.log(options);
        // console.log(this.chart);

        this.updateLabelRotation(category.id);
    }

    private clearAxes(params: UpdateChartParams): boolean {
        const { seriesChartTypes } = params;
        const seriesChartTypesChanged = !_.areEqual(this.prevSeriesChartTypes, seriesChartTypes,
            (s1, s2) => s1.colId === s2.colId && s1.chartType === s2.chartType && s1.secondaryAxis === s2.secondaryAxis);

        // cache a cloned copy of `seriesChartTypes` for subsequent comparisons
        this.prevSeriesChartTypes = seriesChartTypes.map(s => ({...s}));

        const fields = params.fields.map(f => f.colId).join();
        const fieldsChanged = this.prevFields !== fields;
        this.prevFields = fields;

        if (seriesChartTypesChanged || fieldsChanged) {
            this.chart.axes = [];
            return true;
        }

        return false;
    }

    private getAxes(updateParams: UpdateChartParams): AgCartesianAxisOptions[] {
        const axisOptions = this.getAxesOptions('cartesian');
        const bottomOptions = deepMerge(axisOptions[this.xAxisType], axisOptions[this.xAxisType].bottom);
        const leftOptions = deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].left);
        const rightOptions = deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].right);

        const primaryYKeys: string[] = [];
        const secondaryYKeys: string[] = [];

        const fields = updateParams ? updateParams.fields : [];
        const fieldsMap = new Map(fields.map(f => [f.colId, f]));

        fields.forEach(field => {
            const colId = field.colId;
            const seriesChartType = this.chartProxyParams.seriesChartTypes.find(s => s.colId === colId);
            if (seriesChartType) {
                seriesChartType.secondaryAxis ? secondaryYKeys.push(colId) : primaryYKeys.push(colId);
            }
        });

        const axes = [
            {
                ...bottomOptions,
                type: this.xAxisType,
                position: ChartAxisPosition.Bottom,
                gridStyle: [
                    { strokeWidth: 0 },
                ],
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
                    secondaryAxisOptions.gridStyle = [
                        { strokeWidth: 0 },
                    ];
                }

                axes.push(secondaryAxisOptions);
            });
        }

        return axes;
    }

    private getSeriesOptions(params: UpdateChartParams): any {
        const { fields, category, seriesChartTypes } = params;

        return fields.map(field => {
            const seriesChartType = seriesChartTypes.find(s => s.colId === field.colId);
            if (seriesChartType) {
                const chartType: ChartType = seriesChartType.chartType;
                return {
                    type: getSeriesType(chartType),
                    xKey: category.id,
                    yKey: field.colId,
                    yName: field.displayName,
                    grouped: ['groupedColumn' || 'groupedBar' || 'groupedArea'].includes(chartType),
                    stacked: ['stackedArea' ].includes(chartType),
                }
            }
        });
    }
}