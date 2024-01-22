import { ChartProxy, ChartProxyParams, UpdateParams } from '../chartProxy';
import { AgBaseSeriesOptions, AgPolarAxisOptions, AgPolarChartOptions, AgCharts } from 'ag-charts-community';

export abstract class PolarChartProxy extends ChartProxy {
    protected constructor(params: ChartProxyParams) {
        super(params);
    }

    abstract getAxes(params: UpdateParams): AgPolarAxisOptions[];
    abstract getSeries(params: UpdateParams): AgBaseSeriesOptions<any>[];

    public update(params: UpdateParams): void {
        const axes = this.getAxes(params);

        const options: AgPolarChartOptions = {
            ...this.getCommonChartOptions(params.updatedOverrides),
            data: this.getData(params, axes),
            axes,
            series: this.getSeries(params),
        };

        AgCharts.update(this.getChartRef(), options);
    }

    private getData(params: UpdateParams, axes: AgPolarAxisOptions[]): any[] {
        const isCategoryAxis = axes.some((axis) => axis.type === 'angle-category' || axis.type === 'radius-category');
        return this.getDataTransformedData(params, isCategoryAxis);
    }

    private getDataTransformedData(params: UpdateParams, isCategoryAxis: boolean) {
        return this.transformData(params.data, params.category.id, isCategoryAxis);
    }
}
