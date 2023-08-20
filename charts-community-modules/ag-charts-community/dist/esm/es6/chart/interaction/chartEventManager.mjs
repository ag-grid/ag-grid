import { BaseManager } from './baseManager.mjs';
export class ChartEventManager extends BaseManager {
    legendItemClick(series, itemId, enabled, legendItemName) {
        const event = {
            type: 'legend-item-click',
            series,
            itemId,
            enabled,
            legendItemName,
        };
        this.listeners.dispatch('legend-item-click', event);
    }
    legendItemDoubleClick(series, itemId, enabled, numVisibleItems, legendItemName) {
        const event = {
            type: 'legend-item-double-click',
            series,
            itemId,
            enabled,
            legendItemName,
            numVisibleItems,
        };
        this.listeners.dispatch('legend-item-double-click', event);
    }
    axisHover(axisId, direction) {
        const event = {
            type: 'axis-hover',
            axisId,
            direction,
        };
        this.listeners.dispatch('axis-hover', event);
    }
}
