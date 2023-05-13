var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
import { BaseManager } from './baseManager';
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
var HighlightManager = /** @class */ (function (_super) {
    __extends(HighlightManager, _super);
    function HighlightManager() {
        var _this = _super.call(this) || this;
        _this.states = {};
        _this.activeHighlight = undefined;
        return _this;
    }
    HighlightManager.prototype.updateHighlight = function (callerId, highlightedDatum) {
        delete this.states[callerId];
        if (highlightedDatum != null) {
            this.states[callerId] = { highlightedDatum: highlightedDatum };
        }
        this.applyStates();
    };
    HighlightManager.prototype.getActiveHighlight = function () {
        return this.activeHighlight;
    };
    HighlightManager.prototype.applyStates = function () {
        var previousHighlight = this.activeHighlight;
        var highlightToApply = undefined;
        // Last added entry wins.
        Object.entries(this.states)
            .reverse()
            .slice(0, 1)
            .forEach(function (_a) {
            var _b = __read(_a, 2), _ = _b[0], highlightedDatum = _b[1].highlightedDatum;
            return (highlightToApply = highlightedDatum);
        });
        this.activeHighlight = highlightToApply;
        var changed = !isEqual(previousHighlight, this.activeHighlight);
        if (changed) {
            var event_1 = {
                type: 'highlight-change',
                previousHighlight: previousHighlight,
                currentHighlight: this.activeHighlight,
            };
            this.listeners.dispatch('highlight-change', event_1);
        }
    };
    return HighlightManager;
}(BaseManager));
export { HighlightManager };
