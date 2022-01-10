import { AgChart, CartesianChart, ChartAxisPosition } from "ag-charts-community";
import { _, ChartType, SeriesChartType } from "@ag-grid-community/core";
import { ChartProxyParams, FieldDefinition, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "../cartesian/cartesianChartProxy";
import { deepMerge } from "../../utils/object";
import { getSeriesType } from "../../utils/seriesTypeMapper";

export class ComboChartProxy extends CartesianChartProxy {

    private prevSeriesChartTypes: SeriesChartType[] = [];

    public constructor(params: ChartProxyParams) {
        super(params);

        this.xAxisType = params.grouping ? 'groupedCategory' : 'category';
        this.yAxisType = 'number';

        this.recreateChart();
    }

    protected createChart(): CartesianChart {
        return AgChart.create({
            container: this.chartProxyParams.parentElement,
            theme: this.chartTheme,
        });
    }

    public update(params: UpdateChartParams): void {
        const { seriesChartTypes, category, fields, data } = params;

        this.clearChartAxes(seriesChartTypes);

        const options = {
            container: this.chartProxyParams.parentElement,
            theme: this.chartTheme,
            axes: this.getAxes(seriesChartTypes),
            data: this.transformData(data, category.id),
            series: this.getSeriesOptions(fields, category.id, seriesChartTypes)
        }

        AgChart.update(this.chart as CartesianChart, options);

        this.updateLabelRotation(category.id);
    }

    private clearChartAxes(seriesChartTypes: SeriesChartType[]): void {
        // we need to clear the axes when the seriesChartTypes change, but not for data updates
        if(_.areEqual(this.prevSeriesChartTypes, seriesChartTypes)) {
            // chart factory will properly destroy axes
            this.chart.axes = [];
        }
        this.prevSeriesChartTypes = seriesChartTypes;
    }

    private getSeriesOptions(fields: FieldDefinition[], categoryId: string, seriesChartTypes: SeriesChartType[]): any {
        return fields.map(field => {
            const seriesChartType = seriesChartTypes.find(s => s.colId === field.colId);
            if (seriesChartType) {
                const chartType: ChartType = seriesChartType.chartType;
                return {
                    type: getSeriesType(chartType),
                    xKey: categoryId,
                    yKey: field.colId,
                    yName: field.displayName,
                    grouped: ['groupedColumn' || 'groupedBar' || 'groupedArea'].includes(chartType),
                    stacked: ['stackedArea' ].includes(chartType),
                }
            }
        });
    }

    private getAxes(seriesChartTypes: SeriesChartType[]) {
        const primaryYKeys: string[] = []
        const secondaryYKeys: string[] = [];
        seriesChartTypes.forEach(seriesChartType => {
            const { secondaryAxis, colId } = seriesChartType;
            secondaryAxis ? secondaryYKeys.push(colId) : primaryYKeys.push(colId);
        });

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