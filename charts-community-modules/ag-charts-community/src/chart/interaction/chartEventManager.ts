import { BaseManager } from './baseManager';
import type { ChartAxisDirection } from '../chartAxisDirection';

type ChartEventType = 'legend-item-click' | 'legend-item-double-click' | 'axis-hover';
type ChartEvents = LegendItemClickChartEvent | LegendItemDoubleClickChartEvent | AxisHoverChartEvent;

interface ChartEvent<ChartEventType> {
    type: ChartEventType;
}

export interface LegendItemClickChartEvent extends ChartEvent<'legend-item-click'> {
    series: any;
    itemId: any;
    enabled: boolean;
}

export interface LegendItemDoubleClickChartEvent extends ChartEvent<'legend-item-double-click'> {
    series: any;
    itemId: any;
    enabled: boolean;
    numVisibleItems: { [key: string]: number };
}

export interface AxisHoverChartEvent extends ChartEvent<'axis-hover'> {
    axisId: string;
    direction: ChartAxisDirection;
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

    legendItemDoubleClick(series: any, itemId: any, enabled: boolean, numVisibleItems: { [key: string]: number }) {
        const event: LegendItemDoubleClickChartEvent = {
            type: 'legend-item-double-click',
            series,
            itemId,
            enabled,
            numVisibleItems,
        };

        this.listeners.dispatch('legend-item-double-click', event);
    }

    axisHover(axisId: string, direction: ChartAxisDirection) {
        const event: AxisHoverChartEvent = {
            type: 'axis-hover',
            axisId,
            direction,
        };

        this.listeners.dispatch('axis-hover', event);
    }
}
