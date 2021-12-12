import { AgChart, CartesianChart, ChartAxisPosition } from "ag-charts-community";
import { ChartProxyParams, FieldDefinition, UpdateChartParams } from "../chartProxy";
import { CartesianChartProxy } from "../cartesian/cartesianChartProxy";
import { deepMerge } from "../../object";

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
            theme: this.chartTheme,
            axes: this.getAxes()
        });
    }

    public update(params: UpdateChartParams): void {
        const chart = this.chart as CartesianChart;

        const updatedOptions = {
            container: this.chartProxyParams.parentElement,
            theme: this.chartTheme,
            axes: this.getAxes(),
            data: this.transformData(params.data, params.category.id),
            series: this.getSeriesOptions(params)
        };

        AgChart.update(chart, updatedOptions);

        this.updateAxes(params);
        this.updateLabelRotation(params.category.id);
    }

    private getSeriesOptions(params: UpdateChartParams) {
        const lineIndex = Math.ceil(params.fields.length / 2);

        return params.fields.map((f: FieldDefinition, i: number) => {
            const seriesType = (i >= lineIndex) ? 'line' : 'column';
            let options: any = {
                type: seriesType,
                xKey: params.category.id,
                yKey: f.colId,
                yName: f.displayName,
            }

            if (seriesType === 'column') {
                options.grouped = this.chartType === 'groupedColumnLine';
            }

            if (seriesType === 'line') {
                options.marker = {size: 3};
            }

            return options;
        });
    }

    private getAxes() {
        const axisOptions = this.getAxesOptions();
        return [
            {
                ...deepMerge(axisOptions[this.xAxisType], axisOptions[this.xAxisType].bottom),
                type: this.xAxisType,
                position: ChartAxisPosition.Bottom
            },
            {
                ...deepMerge(axisOptions[this.yAxisType], axisOptions[this.yAxisType].left),
                type: this.yAxisType,
                position: ChartAxisPosition.Left
            },
        ];
    }
}