"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chartProxy_1 = require("../chartProxy");
class PolarChartProxy extends chartProxy_1.ChartProxy {
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
exports.PolarChartProxy = PolarChartProxy;
//# sourceMappingURL=polarChartProxy.js.map