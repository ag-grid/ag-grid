import type { BeanName, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

import { HistogramChartProxy } from './cartesian/histogramChartProxy';
import { WaterfallChartProxy } from './cartesian/waterfallChartProxy';
import type { ChartProxy, ChartProxyParams } from './chartProxy';
import { HierarchicalChartProxy } from './hierarchical/hierarchicalChartProxy';
import { PolarChartProxy } from './polar/polarChartProxy';
import { HeatmapChartProxy } from './specialized/heatmapChartProxy';
import { BoxPlotChartProxy } from './statistical/boxPlotChartProxy';
import { RangeChartProxy } from './statistical/rangeChartProxy';

export class EnterpriseChartProxyFactory extends BeanStub implements NamedBean {
    beanName: BeanName = 'enterpriseChartProxyFactory';

    public createChartProxy(chartProxyParams: ChartProxyParams): ChartProxy | undefined {
        switch (chartProxyParams.chartType) {
            case 'histogram':
                return new HistogramChartProxy(chartProxyParams);
            case 'radarLine':
            case 'radarArea':
            case 'nightingale':
            case 'radialColumn':
            case 'radialBar':
                return new PolarChartProxy(chartProxyParams);
            case 'rangeBar':
            case 'rangeArea':
                return new RangeChartProxy(chartProxyParams);
            case 'boxPlot':
                return new BoxPlotChartProxy(chartProxyParams);
            case 'treemap':
            case 'sunburst':
                return new HierarchicalChartProxy(chartProxyParams);
            case 'heatmap':
                return new HeatmapChartProxy(chartProxyParams);
            case 'waterfall':
                return new WaterfallChartProxy(chartProxyParams);
        }
        return undefined;
    }
}
