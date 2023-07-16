"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeriesStateManager = void 0;
class SeriesStateManager {
    constructor() {
        this.groups = {};
    }
    registerSeries({ id, seriesGrouping, visible, type, }) {
        var _a;
        var _b;
        if (!seriesGrouping)
            return;
        (_a = (_b = this.groups)[type]) !== null && _a !== void 0 ? _a : (_b[type] = {});
        this.groups[type][id] = { grouping: seriesGrouping, visible };
    }
    deregisterSeries({ id, type }) {
        if (this.groups[type]) {
            delete this.groups[type][id];
        }
        if (this.groups[type] && Object.keys(this.groups[type]).length === 0) {
            delete this.groups[type];
        }
    }
    getVisiblePeerGroupIndex({ type, seriesGrouping }) {
        var _a;
        if (!seriesGrouping)
            return { visibleGroupCount: 1, index: 0 };
        const visibleGroups = [
            ...Object.entries((_a = this.groups[type]) !== null && _a !== void 0 ? _a : {})
                .filter(([_, entry]) => entry.visible)
                .reduce((result, [_, next]) => {
                if (next.visible) {
                    result.add(next.grouping.groupIndex);
                }
                return result;
            }, new Set())
                .values(),
        ];
        visibleGroups.sort();
        return { visibleGroupCount: visibleGroups.length, index: visibleGroups.indexOf(seriesGrouping.groupIndex) };
    }
}
exports.SeriesStateManager = SeriesStateManager;
