"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HighlightManager = void 0;
const baseManager_1 = require("./baseManager");
function isEqual(a, b) {
    if (a === b)
        return true;
    if ((a === null || a === void 0 ? void 0 : a.series) !== (b === null || b === void 0 ? void 0 : b.series))
        return false;
    if ((a === null || a === void 0 ? void 0 : a.itemId) !== (b === null || b === void 0 ? void 0 : b.itemId))
        return false;
    if ((a === null || a === void 0 ? void 0 : a.datum) !== (b === null || b === void 0 ? void 0 : b.datum))
        return false;
    return true;
}
/**
 * Manages the actively highlighted series/datum for a chart. Tracks the requested highlights from
 * distinct dependents and handles conflicting highlight requests.
 */
class HighlightManager extends baseManager_1.BaseManager {
    constructor() {
        super();
        this.states = {};
        this.activeHighlight = undefined;
    }
    updateHighlight(callerId, highlightedDatum) {
        delete this.states[callerId];
        if (highlightedDatum != null) {
            this.states[callerId] = { highlightedDatum };
        }
        this.applyStates();
    }
    getActiveHighlight() {
        return this.activeHighlight;
    }
    applyStates() {
        const previousHighlight = this.activeHighlight;
        let highlightToApply = undefined;
        // Last added entry wins.
        Object.entries(this.states)
            .reverse()
            .slice(0, 1)
            .forEach(([_, { highlightedDatum }]) => (highlightToApply = highlightedDatum));
        this.activeHighlight = highlightToApply;
        const changed = !isEqual(previousHighlight, this.activeHighlight);
        if (changed) {
            const event = {
                type: 'highlight-change',
                previousHighlight,
                currentHighlight: this.activeHighlight,
            };
            this.listeners.dispatch('highlight-change', event);
        }
    }
}
exports.HighlightManager = HighlightManager;
