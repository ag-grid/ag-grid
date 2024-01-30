import {AgCartesianAxisOptions, AgWaterfallSeriesOptions} from "ag-charts-enterprise";
import {ChartProxyParams, UpdateParams} from "../chartProxy";
import {CartesianChartProxy} from "./cartesianChartProxy";
import {isHorizontal} from "../../utils/seriesTypeMapper";

export class WaterfallChartProxy extends CartesianChartProxy {

    public constructor(params: ChartProxyParams) {
        super(params);
    }

    public getAxes(params: UpdateParams): AgCartesianAxisOptions[] {
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

    public getSeries(params: UpdateParams): AgWaterfallSeriesOptions[] {
        const [firstField] = params.fields;
        const firstSeries: AgWaterfallSeriesOptions = {
            type: this.standaloneChartType as 'waterfall',
            direction: isHorizontal(this.chartType) ? 'horizontal' : 'vertical',
            xKey: params.category.id,
            xName: params.category.name,
            yKey: firstField.colId,
            yName: firstField.displayName ?? undefined
        };

        return [firstSeries]; // waterfall only supports a single series!
    }
}
