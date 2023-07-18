"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeriesLayerManager = void 0;
var group_1 = require("../../scene/group");
var layers_1 = require("../layers");
var SeriesLayerManager = /** @class */ (function () {
    function SeriesLayerManager(rootGroup) {
        this.groups = {};
        this.series = {};
        this.rootGroup = rootGroup;
    }
    SeriesLayerManager.prototype.requestGroup = function (seriesConfig) {
        var _a, _b;
        var _c, _d;
        var id = seriesConfig.id, type = seriesConfig.type, seriesRootGroup = seriesConfig.rootGroup, seriesGrouping = seriesConfig.seriesGrouping;
        var _e = (seriesGrouping !== null && seriesGrouping !== void 0 ? seriesGrouping : {}).groupIndex, groupIndex = _e === void 0 ? id : _e;
        if (this.series[id] != null) {
            throw new Error("AG Charts - series already has an allocated layer: " + this.series[id]);
        }
        (_a = (_c = this.groups)[type]) !== null && _a !== void 0 ? _a : (_c[type] = {});
        var groupInfo = this.groups[type][groupIndex];
        if (!groupInfo) {
            groupInfo = (_b = (_d = this.groups[type])[groupIndex]) !== null && _b !== void 0 ? _b : (_d[groupIndex] = {
                seriesIds: [],
                group: this.rootGroup.appendChild(new group_1.Group({
                    name: type + "-content",
                    layer: true,
                    zIndex: layers_1.Layers.SERIES_LAYER_ZINDEX,
                    zIndexSubOrder: seriesConfig.getGroupZIndexSubOrder('data'),
                })),
            });
        }
        this.series[id] = { layerState: groupInfo, seriesConfig: seriesConfig };
        groupInfo.seriesIds.push(id);
        groupInfo.group.appendChild(seriesRootGroup);
        return groupInfo.group;
    };
    SeriesLayerManager.prototype.changeGroup = function (seriesConfig) {
        var _a, _b;
        var id = seriesConfig.id, seriesGrouping = seriesConfig.seriesGrouping, type = seriesConfig.type, rootGroup = seriesConfig.rootGroup, oldGrouping = seriesConfig.oldGrouping;
        var _c = (seriesGrouping !== null && seriesGrouping !== void 0 ? seriesGrouping : {}).groupIndex, groupIndex = _c === void 0 ? id : _c;
        if ((_b = (_a = this.groups[type]) === null || _a === void 0 ? void 0 : _a[groupIndex]) === null || _b === void 0 ? void 0 : _b.seriesIds.includes(id)) {
            // Already in the right group, nothing to do.
            return;
        }
        if (this.series[id] != null) {
            this.releaseGroup({ id: id, seriesGrouping: oldGrouping, type: type, rootGroup: rootGroup });
        }
        this.requestGroup(seriesConfig);
    };
    SeriesLayerManager.prototype.releaseGroup = function (seriesConfig) {
        var _a, _b, _c, _d, _e;
        var id = seriesConfig.id, seriesGrouping = seriesConfig.seriesGrouping, rootGroup = seriesConfig.rootGroup, type = seriesConfig.type;
        var _f = (seriesGrouping !== null && seriesGrouping !== void 0 ? seriesGrouping : {}).groupIndex, groupIndex = _f === void 0 ? id : _f;
        if (this.series[id] == null) {
            throw new Error("AG Charts - series doesn't have an allocated layer: " + id);
        }
        var groupInfo = (_b = (_a = this.groups[type]) === null || _a === void 0 ? void 0 : _a[groupIndex]) !== null && _b !== void 0 ? _b : (_c = this.series[id]) === null || _c === void 0 ? void 0 : _c.layerState;
        if (groupInfo) {
            groupInfo.seriesIds = groupInfo.seriesIds.filter(function (v) { return v !== id; });
            groupInfo.group.removeChild(rootGroup);
        }
        if ((groupInfo === null || groupInfo === void 0 ? void 0 : groupInfo.seriesIds.length) === 0) {
            // Last member of the layer, cleanup.
            this.rootGroup.removeChild(groupInfo.group);
            delete this.groups[type][groupIndex];
            delete this.groups[type][id];
        }
        else if ((groupInfo === null || groupInfo === void 0 ? void 0 : groupInfo.seriesIds.length) > 0) {
            // Update zIndexSubOrder to avoid it becoming stale as series are removed and re-added
            // with the same groupIndex, but are otherwise unrelated.
            var leadSeriesConfig = (_e = this.series[(_d = groupInfo === null || groupInfo === void 0 ? void 0 : groupInfo.seriesIds) === null || _d === void 0 ? void 0 : _d[0]]) === null || _e === void 0 ? void 0 : _e.seriesConfig;
            groupInfo.group.zIndexSubOrder = leadSeriesConfig === null || leadSeriesConfig === void 0 ? void 0 : leadSeriesConfig.getGroupZIndexSubOrder('data');
        }
        delete this.series[id];
    };
    SeriesLayerManager.prototype.destroy = function () {
        var e_1, _a, e_2, _b;
        try {
            for (var _c = __values(Object.values(this.groups)), _d = _c.next(); !_d.done; _d = _c.next()) {
                var groups = _d.value;
                try {
                    for (var _e = (e_2 = void 0, __values(Object.values(groups))), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var groupInfo = _f.value;
                        this.rootGroup.removeChild(groupInfo.group);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.groups = {};
        this.series = {};
    };
    return SeriesLayerManager;
}());
exports.SeriesLayerManager = SeriesLayerManager;
//# sourceMappingURL=seriesLayerManager.js.map