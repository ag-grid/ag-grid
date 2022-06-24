import { ChartProxy, ChartProxyParams } from "../chartProxy";
import { AgChart, PieSeries, PieTooltipRendererParams, PolarChart, AgChartLegendClickEvent } from "ag-charts-community";
import { AgPieSeriesOptions, AgPolarChartOptions } from "ag-charts-community/src/chart/agChartOptions";

export abstract class PolarChartProxy extends ChartProxy {

    protected constructor(params: ChartProxyParams) {
        super(params);
    }

    protected createChart(): PolarChart {
        return AgChart.create({
            type: 'pie',
            container: this.chartProxyParams.parentElement,
            theme: this.chartTheme,
        });
    }

    protected updateChart(options: AgPolarChartOptions): void {
        if (this.crossFiltering) {
            const seriesOverrides = this.extractSeriesOverrides();

            options.tooltip = {
                ...seriesOverrides.tooltip,
                delay: 500,
            };

            options.legend = {
                ...seriesOverrides.legend,
                listeners: {
                    legendItemClick: (e: AgChartLegendClickEvent) => {
                        // options?.series?.forEach(s => s.visible = e.enabled);
                        // this.updateChart(options);
                    }
                }
            };
        }

        AgChart.update(this.chart as PolarChart, options);
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

    protected extractSeriesOverrides() {
        return this.chartOptions[this.standaloneChartType].series;
    }
}