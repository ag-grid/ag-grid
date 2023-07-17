"use strict";
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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeriesStateManager = void 0;
var SeriesStateManager = /** @class */ (function () {
    function SeriesStateManager() {
        this.groups = {};
    }
    SeriesStateManager.prototype.registerSeries = function (_a) {
        var _b;
        var _c;
        var id = _a.id, seriesGrouping = _a.seriesGrouping, visible = _a.visible, type = _a.type;
        if (!seriesGrouping)
            return;
        (_b = (_c = this.groups)[type]) !== null && _b !== void 0 ? _b : (_c[type] = {});
        this.groups[type][id] = { grouping: seriesGrouping, visible: visible };
    };
    SeriesStateManager.prototype.deregisterSeries = function (_a) {
        var id = _a.id, type = _a.type;
        if (this.groups[type]) {
            delete this.groups[type][id];
        }
        if (this.groups[type] && Object.keys(this.groups[type]).length === 0) {
            delete this.groups[type];
        }
    };
    SeriesStateManager.prototype.getVisiblePeerGroupIndex = function (_a) {
        var _b;
        var type = _a.type, seriesGrouping = _a.seriesGrouping;
        if (!seriesGrouping)
            return { visibleGroupCount: 1, index: 0 };
        var visibleGroups = __spreadArray([], __read(Object.entries((_b = this.groups[type]) !== null && _b !== void 0 ? _b : {})
            .filter(function (_a) {
            var _b = __read(_a, 2), _ = _b[0], entry = _b[1];
            return entry.visible;
        })
            .reduce(function (result, _a) {
            var _b = __read(_a, 2), _ = _b[0], next = _b[1];
            if (next.visible) {
                result.add(next.grouping.groupIndex);
            }
            return result;
        }, new Set())
            .values()));
        visibleGroups.sort(function (a, b) { return a - b; });
        return { visibleGroupCount: visibleGroups.length, index: visibleGroups.indexOf(seriesGrouping.groupIndex) };
    };
    return SeriesStateManager;
}());
exports.SeriesStateManager = SeriesStateManager;
//# sourceMappingURL=seriesStateManager.js.map