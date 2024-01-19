import { isHorizontal } from '../../utils/seriesTypeMapper';
import { CartesianChartProxy } from '../cartesian/cartesianChartProxy';
import { ChartProxyParams, UpdateParams } from '../chartProxy';
import { AgCartesianAxisOptions, AgBoxPlotSeriesOptions } from 'ag-charts-community';

export class BoxPlotChartProxy extends CartesianChartProxy {
    public constructor(params: ChartProxyParams) {
        super(params);
    }

    public getAxes(params: UpdateParams): AgCartesianAxisOptions[] {
        const axes: AgCartesianAxisOptions[] = [
            {
                type: this.getXAxisType(params),
                position: isHorizontal(this.chartType) ? 'left' : 'bottom',
            },
            {
                type: 'number',
                position: isHorizontal(this.chartType) ? 'bottom' : 'left',
            },
        ];

        return axes;
    }

    public getSeries(params: UpdateParams): AgBoxPlotSeriesOptions<any>[] {
        const series: AgBoxPlotSeriesOptions[] = params.fields.map(f => (
            {
                type: this.standaloneChartType,
                direction: isHorizontal(this.chartType) ? 'horizontal' : 'vertical',
                xKey: params.category.id,
                xName: params.category.name,
                yName: f.displayName,
                // FIXME: determine correct data source for box plot quartiles
                minKey: f.colId,
                q1Key: f.colId,
                medianKey: f.colId,
                q3Key: f.colId,
                maxKey: f.colId,
            } as AgBoxPlotSeriesOptions
        ));

        return series;
    }
}
