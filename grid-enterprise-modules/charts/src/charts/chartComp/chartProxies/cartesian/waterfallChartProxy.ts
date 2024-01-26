import { _ } from "@ag-grid-community/core";
import { AgWaterfallSeriesOptions, AgCartesianAxisOptions } from "ag-charts-enterprise";
import { ChartProxyParams, UpdateParams } from "../chartProxy";
import { CartesianChartProxy } from "./cartesianChartProxy";
import { isHorizontal } from "../../utils/seriesTypeMapper";

export class WaterfallChartProxy extends CartesianChartProxy {

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

    public getSeries(params: UpdateParams): AgWaterfallSeriesOptions[] {
        const series: AgWaterfallSeriesOptions[] = params.fields.map(f => (
            {
                type: this.standaloneChartType as 'waterfall',
                direction: isHorizontal(this.chartType) ? 'horizontal' : 'vertical',
                xKey: params.category.id,
                xName: params.category.name,
                yKey: f.colId,
                yName: f.displayName ?? undefined
            }
        ));

        return series;
    }
}
