import { BaseManager } from './baseManager';

type ChartEventType = 'legend-item-click' | 'node-click';

interface ChartEvent<ChartEventType> {
    type: ChartEventType;
}

export interface LegendItemClickChartEvent extends ChartEvent<'legend-item-click'> {
    series: any;
    itemId: any;
    enabled: boolean;
}

export interface NodeClickChartEvent extends ChartEvent<'node-click'> {
    type: 'node-click';
}

export class ChartEventManager extends BaseManager<ChartEventType, ChartEvent<ChartEventType>> {
    legendItemClick(series: any, itemId: any, enabled: boolean) {
        const event: LegendItemClickChartEvent = {
            type: 'legend-item-click',
            series,
            itemId,
            enabled,
        };

        this.listeners.dispatch('legend-item-click', event);
    }
}
