import { _ } from "@ag-grid-community/core";
import { AgPolarAxisOptions, AgRadialColumnSeriesOptions } from "ag-charts-community";
import { ChartProxyParams, UpdateParams } from "../chartProxy";
import { PolarChartProxy } from './polarChartProxy';

export class RadialColumnChartProxy extends PolarChartProxy {

    public constructor(params: ChartProxyParams) {
        super(params);
    }

    public getAxes(params: UpdateParams): AgPolarAxisOptions[] {
        const axes: AgPolarAxisOptions[] = [
            {
                type: 'angle-category',
            },
            {
                type: 'radius-number',
            },
        ];

        return axes;
    }

    public getSeries(params: UpdateParams): AgRadialColumnSeriesOptions[] {
        const series: AgRadialColumnSeriesOptions[] = params.fields.map(f => (
            {
                type: this.standaloneChartType as AgRadialColumnSeriesOptions['type'],
                angleKey: params.category.id,
                angleName: params.category.name,
                radiusKey: f.colId,
                radiusName: f.displayName ?? undefined,
            }
        ));

        return series;
    }

    public crossFilteringReset(): void {
    }
}
