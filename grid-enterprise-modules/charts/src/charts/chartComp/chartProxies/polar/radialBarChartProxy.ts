import { _ } from "@ag-grid-community/core";
import { AgPolarAxisOptions, AgRadialBarSeriesOptions } from "ag-charts-community";
import { ChartProxyParams, UpdateParams } from "../chartProxy";
import { PolarChartProxy } from './polarChartProxy';

export class RadialBarChartProxy extends PolarChartProxy {

    public constructor(params: ChartProxyParams) {
        super(params);
    }

    public getAxes(params: UpdateParams): AgPolarAxisOptions[] {
        const axes: AgPolarAxisOptions[] = [
            {
                type: 'angle-number',
            },
            {
                type: 'radius-category',
            },
        ];

        return axes;
    }

    public getSeries(params: UpdateParams): AgRadialBarSeriesOptions[] {
        const series: AgRadialBarSeriesOptions[] = params.fields.map(f => (
            {
                type: this.standaloneChartType as AgRadialBarSeriesOptions['type'],
                angleKey: f.colId,
                angleName: f.displayName ?? undefined,
                radiusKey: params.category.id,
                radiusName: params.category.name,
            }
        ));

        return series;
    }

    public crossFilteringReset(): void {
    }
}
