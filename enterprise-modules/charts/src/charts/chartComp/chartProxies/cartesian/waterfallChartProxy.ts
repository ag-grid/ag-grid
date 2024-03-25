import {AgCartesianAxisOptions, AgWaterfallSeriesOptions} from "ag-charts-community";
import {ChartProxyParams, UpdateParams} from "../chartProxy";
import {CartesianChartProxy} from "./cartesianChartProxy";

export class WaterfallChartProxy extends CartesianChartProxy {

    public constructor(params: ChartProxyParams) {
        super(params);
    }

    protected override getAxes(params: UpdateParams): AgCartesianAxisOptions[] {
        return [
            {
                type: this.getXAxisType(params),
                position: this.isHorizontal(params) ? 'left' : 'bottom',
            },
            {
                type: 'number',
                position: this.isHorizontal(params) ? 'bottom' : 'left',
            },
        ];
    }

    protected override getSeries(params: UpdateParams): AgWaterfallSeriesOptions[] {
        const [category] = params.categories;
        const [firstField] = params.fields;
        const firstSeries: AgWaterfallSeriesOptions = {
            type: this.standaloneChartType as 'waterfall',
            xKey: category.id,
            xName: category.name,
            yKey: firstField.colId,
            yName: firstField.displayName ?? undefined
        };

        return [firstSeries]; // waterfall only supports a single series!
    }
}
