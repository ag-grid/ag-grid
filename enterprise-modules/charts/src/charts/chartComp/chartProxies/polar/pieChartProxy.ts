import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { PolarChartProxy } from "./polarChartProxy";
import { AgPolarSeriesOptions } from "ag-charts-community/src/chart/agChartOptions";

export class PieChartProxy extends PolarChartProxy {

    public constructor(params: ChartProxyParams) {
        super(params);
        this.recreateChart();
    }

    public update(params: UpdateChartParams): void {
        this.updateChart({
            data: this.transformData(params.data, params.category.id),
            series: this.getSeries(params)
        });
    }

    private getSeries(params: UpdateChartParams): AgPolarSeriesOptions[] {
        const field = params.fields[0];
        return [{
                ...this.chartOptions[this.standaloneChartType].series,
                type: this.standaloneChartType,
                angleKey: field.colId,
                angleName: field.displayName!,
                labelKey: params.category.id,
                labelName: params.category.name,
        }];
    }
}