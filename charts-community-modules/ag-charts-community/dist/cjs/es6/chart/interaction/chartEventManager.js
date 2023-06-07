"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartEventManager = void 0;
const baseManager_1 = require("./baseManager");
class ChartEventManager extends baseManager_1.BaseManager {
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
exports.ChartEventManager = ChartEventManager;
