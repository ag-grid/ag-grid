import { ChartProxy, ChartProxyParams } from "../chartProxy";
import { PieSeries, PieTooltipRendererParams, PolarChart } from "ag-charts-community";

export abstract class PolarChartProxy extends ChartProxy<PolarChart> {

    protected constructor(params: ChartProxyParams) {
        super(params);
    }

    protected addCrossFilteringTooltipRenderer(pieSeries: PieSeries) {
        pieSeries.tooltip.renderer = (params: PieTooltipRendererParams) => {
            const label = params.datum[params.labelKey as string];
            const ratio = params.datum[params.radiusKey as string];
            const totalValue = params.angleValue;
            const value = totalValue * ratio;
            return {
                content: `${label}: ${value}`,
            }
        };
    }
}