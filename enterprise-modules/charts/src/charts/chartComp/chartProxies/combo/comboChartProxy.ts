import { AgChart, AgCartesianChartOptions, AgCartesianAxisOptions, CartesianChart, ChartAxisPosition } from "ag-charts-community";
import { _, ChartType, SeriesChartType } from "@ag-grid-community/core";
import { ChartProxyParams, FieldDefinition, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "../cartesian/cartesianChartProxy";
import { deepMerge } from "../../utils/object";
import { getSeriesType } from "../../utils/seriesTypeMapper";

export class ComboChartProxy extends CartesianChartProxy {

    private prevSeriesChartTypes: SeriesChartType[];
    private prevAxes: AgCartesianAxisOptions[];

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

        let options: AgCartesianChartOptions = {
            container: this.chartProxyParams.parentElement,
            theme: this.chartTheme,
            data: this.transformData(data, category.id),
            series: this.getSeriesOptions(fields, category.id, seriesChartTypes),
        }

        const axesCleared = this.clearAxes(seriesChartTypes);
        if (axesCleared) {
            options.axes = this.getAxes(seriesChartTypes)
            this.prevAxes = options.axes;
        } else {
            // TODO: this should be removed once standalone is fixed
            this.chart.axes = [];
            options.axes = this.prevAxes;
        }

        console.log(options);

        AgChart.update(this.chart as CartesianChart, options);

        this.updateLabelRotation(category.id);
    }

    private clearAxes(seriesChartTypes: SeriesChartType[]): boolean {
        const seriesChartTypesChanged = !_.areEqual(this.prevSeriesChartTypes, seriesChartTypes,
            (s1, s2) => s1.colId === s2.colId && s1.chartType === s2.chartType && s1.secondaryAxis === s2.secondaryAxis);

        // cache a cloned copy of `seriesChartTypes` for subsequent comparisons
        this.prevSeriesChartTypes = seriesChartTypes.map(s => ({...s}));

        if (seriesChartTypesChanged) {
            this.chart.axes = [];
            return true;
        }

        return false;
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

    private getAxes(seriesChartTypes: SeriesChartType[]): AgCartesianAxisOptions[] {
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
                    gridStyle: {
                        width: 0,
                    },
                    title: { //TODO: improve
                        enabled: true,
                        text: secondaryYKey
                    },
                });
            });
        }

        return axes;
    }
}