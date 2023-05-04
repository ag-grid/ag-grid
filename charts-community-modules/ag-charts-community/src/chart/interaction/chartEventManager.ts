import { Series } from '../series/series';
import { BaseManager } from './baseManager';

type ChartEventType = 'legend-item-click' | 'legend-item-double-click';
type ChartEvents = LegendItemClickChartEvent | LegendItemDoubleClickChartEvent;

interface ChartEvent<ChartEventType> {
    type: ChartEventType;
}

export interface LegendItemClickChartEvent extends ChartEvent<'legend-item-click'> {
    series: Series;
    itemId: any;
    enabled: boolean;
}

export interface LegendItemDoubleClickChartEvent extends ChartEvent<'legend-item-double-click'> {
    series: Series;
    itemId: any;
    enabled: boolean;
    numVisibleItems: { [key: string]: number };
}

export class ChartEventManager extends BaseManager<ChartEventType, ChartEvents> {
    legendItemClick(series: Series, itemId: any, enabled: boolean) {
        const event: LegendItemClickChartEvent = {
            type: 'legend-item-click',
            series,
            itemId,
            enabled,
        };

        this.listeners.dispatch('legend-item-click', event);
    }

    legendItemDoubleClick(
        series: Series,
        itemId: string | number,
        enabled: boolean,
        numVisibleItems: { [key: string]: number }
    ) {
        const event: LegendItemDoubleClickChartEvent = {
            type: 'legend-item-double-click',
            series,
            itemId,
            enabled,
            numVisibleItems,
        };

        this.listeners.dispatch('legend-item-double-click', event);
    }
}
