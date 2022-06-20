import { ChartProxyParams, UpdateChartParams } from "../chartProxy";
import { PolarChartProxy } from "./polarChartProxy";
import { AgPolarSeriesOptions } from "ag-charts-community/src/chart/agChartOptions";

export class DoughnutChartProxy extends PolarChartProxy {

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
        const numFields = params.fields.length;

        let offset = 0;
        const calculateOffsets = () => {
            const offsetAmount = numFields > 1 ? 20 : 40;
            const outerRadiusOffset = offset;
            offset -= offsetAmount;
            const innerRadiusOffset = offset;
            offset -= offsetAmount;
            return { outerRadiusOffset, innerRadiusOffset };
        }

        return params.fields.map(f => {
            const seriesDefaults = this.chartOptions[this.standaloneChartType].series;
            const { outerRadiusOffset, innerRadiusOffset } = calculateOffsets();

            return {
                ...seriesDefaults,
                type: this.standaloneChartType,
                angleKey: f.colId,
                angleName: f.displayName!,
                labelKey: params.category.id,
                labelName: params.category.name,
                outerRadiusOffset,
                innerRadiusOffset,
                title: {
                    ...seriesDefaults.title,
                    text: seriesDefaults.title.text || f.displayName,
                    showInLegend: numFields > 1,
                },
                callout: {
                    ...seriesDefaults.callout,
                    colors: this.chartTheme.palette.strokes
                }
            }
        });
    }
}
