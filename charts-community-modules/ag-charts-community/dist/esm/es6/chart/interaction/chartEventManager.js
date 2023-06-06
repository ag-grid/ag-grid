import { BaseManager } from './baseManager';
export class ChartEventManager extends BaseManager {
    legendItemClick(series, itemId, enabled) {
        const event = {
            type: 'legend-item-click',
            series,
            itemId,
            enabled,
        };
        this.listeners.dispatch('legend-item-click', event);
    }
    legendItemDoubleClick(series, itemId, enabled, numVisibleItems) {
        const event = {
            type: 'legend-item-double-click',
            series,
            itemId,
            enabled,
            numVisibleItems,
        };
        this.listeners.dispatch('legend-item-double-click', event);
    }
}
