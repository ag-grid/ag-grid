import { AgChart, CartesianChart, ChartAxisPosition } from "ag-charts-community";
import { ChartType, SeriesChartType } from "@ag-grid-community/core";
import { ChartProxyParams, FieldDefinition, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "../cartesian/cartesianChartProxy";
import { deepMerge } from "../../utils/object";
import { getChartThemeOverridesObjectName } from "../../utils/chartThemeOverridesMapper";

export class ComboChartProxy extends CartesianChartProxy {

    public constructor(params: ChartProxyParams) {
        super(params);

        this.xAxisType = params.grouping ? 'groupedCategory' : 'category';
        this.yAxisType = 'number';

        this.recreateChart();
    }

    protected createChart(): CartesianChart {
        return AgChart.create({
            container: this.chartProxyParams.parentElement,
            theme: this.chartTheme
        });
    }

    public update(params: UpdateChartParams): void {
        const options = {
            container: this.chartProxyParams.parentElement,
            theme: this.chartTheme,
            axes: this.getAxes(params),
            data: this.transformData(params.data, params.category.id),
            series: this.getSeriesOptions(params)
        }

        AgChart.update(this.chart as CartesianChart, options);

        this.updateLabelRotation(params.category.id);
    }

    private getSeriesOptions(params: UpdateChartParams): any {
        return params.fields.map(field => {
            const seriesChartType = params.seriesChartTypes.find(s => s.colId === field.colId);
            if (seriesChartType) {
                const chartType: ChartType = seriesChartType.chartType;
                return {
                    type: getChartThemeOverridesObjectName(chartType),
                    xKey: params.category.id,
                    yKey: field.colId,
                    yName: field.displayName,
                    grouped: ['groupedColumn' || 'groupedBar' || 'groupedArea'].includes(chartType),
                    stacked: ['stackedArea' ].includes(chartType),
                }
            }
        });
    }

    private getAxes(params: UpdateChartParams) {
        const primaryYKeys: string[] = []
        const secondaryYKeys: string[] = [];
        params.seriesChartTypes.forEach(seriesChartType => {
            const { secondaryAxis, colId } = seriesChartType;
            secondaryAxis ? secondaryYKeys.push(colId) : primaryYKeys.push(colId);
        })

        const axisOptions = this.getAxesOptions();
        const axes = [
            {
                ...deepMerge(axisOptions[this.xAxisType], axisOptions[this.xAxisType].bottom),
                type: this.xAxisType,
                position: ChartAxisPosition.Bottom
            },
            {
                ...deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].left),
                type: this.yAxisType,
                keys: primaryYKeys,
                position: ChartAxisPosition.Left,
                title: {
                    enabled: true,
                    text: primaryYKeys.join(' / '), //TODO: improve
                },
            },
        ];

        if (secondaryYKeys.length > 0) {
            secondaryYKeys.forEach(secondaryYKey => {
                axes.push({
                    ...deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].right),
                    type: this.yAxisType,
                    keys: [secondaryYKey],
                    position: ChartAxisPosition.Right,
                    title: {
                        enabled: true,
                        text: secondaryYKey
                    },
                });
            });
        }

        return axes;
    }
}