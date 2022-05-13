import { ChartProxy } from "../chartProxy";
export class PolarChartProxy extends ChartProxy {
    constructor(params) {
        super(params);
    }
    addCrossFilteringTooltipRenderer(pieSeries) {
        pieSeries.tooltip.renderer = (params) => {
            const label = params.datum[params.labelKey];
            const ratio = params.datum[params.radiusKey];
            const totalValue = params.angleValue;
            const value = totalValue * ratio;
            return {
                content: `${label}: ${value}`,
            };
        };
    }
}
//# sourceMappingURL=polarChartProxy.js.map