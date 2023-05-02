import { BaseManager } from './baseManager';

type ChartEventType = 'legend-item-click';
type ChartEvents = LegendItemClickChartEvent;

interface ChartEvent<ChartEventType> {
    type: ChartEventType;
}

export interface LegendItemClickChartEvent extends ChartEvent<'legend-item-click'> {
    series: any;
    itemId: any;
    enabled: boolean;
}

export class ChartEventManager extends BaseManager<ChartEventType, ChartEvents> {
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
