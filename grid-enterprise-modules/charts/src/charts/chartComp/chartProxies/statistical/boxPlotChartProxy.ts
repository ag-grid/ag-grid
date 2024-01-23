import { isHorizontal } from '../../utils/seriesTypeMapper';
import { CartesianChartProxy } from '../cartesian/cartesianChartProxy';
import { ChartProxyParams, FieldDefinition, UpdateParams } from '../chartProxy';
import { AgCartesianAxisOptions, AgBoxPlotSeriesOptions } from 'ag-charts-community';
import { quantiles } from '../../utils/statistics';

export class BoxPlotChartProxy extends CartesianChartProxy {
    public constructor(params: ChartProxyParams) {
        super(params);
    }

    public getAxes(params: UpdateParams): AgCartesianAxisOptions[] {
        const axes: AgCartesianAxisOptions[] = [
            {
                type: 'category',
                position: isHorizontal(this.chartType) ? 'left' : 'bottom',
            },
            {
                type: 'number',
                position: isHorizontal(this.chartType) ? 'bottom' : 'left',
            },
        ];

        return axes;
    }

    protected override getData(params: UpdateParams, axes: AgCartesianAxisOptions[]): any[] {
        return params.fields.map((field) => {
            const values = params.data.map((item) => Number(item[field.colId]));
            return {
                series: field.displayName,
                ...quantiles(values, {
                    min: 0,
                    q1: 0.25,
                    median: 0.5,
                    q3: 0.75,
                    max: 1,
                }),
            };
        });
    }

    public getSeries(params: UpdateParams): AgBoxPlotSeriesOptions<any>[] {
        const series: AgBoxPlotSeriesOptions[] = [
            {
                type: this.standaloneChartType,
                direction: isHorizontal(this.chartType) ? 'horizontal' : 'vertical',
                xKey: 'series',
                minKey: 'min',
                q1Key: 'q1',
                medianKey: 'median',
                q3Key: 'q3',
                maxKey: 'max',
            } as AgBoxPlotSeriesOptions,
        ];
        return series;
    }
}
