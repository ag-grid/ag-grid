import {AgCartesianAxisOptions, AgWaterfallSeriesOptions} from "ag-charts-community";
import {ChartProxyParams, UpdateParams} from "../chartProxy";
import {CartesianChartProxy} from "./cartesianChartProxy";
import {isHorizontal} from "../../utils/seriesTypeMapper";

export class WaterfallChartProxy extends CartesianChartProxy {

    public constructor(params: ChartProxyParams) {
        super(params);
    }

    protected override getAxes(params: UpdateParams): AgCartesianAxisOptions[] {
        return [
            {
                type: this.getXAxisType(params),
                position: isHorizontal(this.chartType) ? 'left' : 'bottom',
            },
            {
                type: 'number',
                position: isHorizontal(this.chartType) ? 'bottom' : 'left',
            },
        ];
    }

    protected override getSeries(params: UpdateParams): AgWaterfallSeriesOptions[] {
        const [category] = params.categories;
        const [firstField] = params.fields;
        const firstSeries: AgWaterfallSeriesOptions = {
            type: this.standaloneChartType as 'waterfall',
            direction: isHorizontal(this.chartType) ? 'horizontal' : 'vertical',
            xKey: category.id,
            xName: category.name,
            yKey: firstField.colId,
            yName: firstField.displayName ?? undefined
        };

        return [firstSeries]; // waterfall only supports a single series!
    }
}
