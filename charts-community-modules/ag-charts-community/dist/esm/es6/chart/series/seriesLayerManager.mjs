import { Group } from '../../scene/group.mjs';
import { Layers } from '../layers.mjs';
export class SeriesLayerManager {
    constructor(rootGroup) {
        this.groups = {};
        this.series = {};
        this.rootGroup = rootGroup;
    }
    requestGroup(seriesConfig) {
        var _a, _b;
        var _c, _d;
        const { id, type, rootGroup: seriesRootGroup, seriesGrouping } = seriesConfig;
        const { groupIndex = id } = seriesGrouping !== null && seriesGrouping !== void 0 ? seriesGrouping : {};
        if (this.series[id] != null) {
            throw new Error(`AG Charts - series already has an allocated layer: ${this.series[id]}`);
        }
        (_a = (_c = this.groups)[type]) !== null && _a !== void 0 ? _a : (_c[type] = {});
        let groupInfo = this.groups[type][groupIndex];
        if (!groupInfo) {
            groupInfo = (_b = (_d = this.groups[type])[groupIndex]) !== null && _b !== void 0 ? _b : (_d[groupIndex] = {
                seriesIds: [],
                group: this.rootGroup.appendChild(new Group({
                    name: `${type}-content`,
                    layer: true,
                    zIndex: Layers.SERIES_LAYER_ZINDEX,
                    zIndexSubOrder: seriesConfig.getGroupZIndexSubOrder('data'),
                })),
            });
        }
        this.series[id] = { layerState: groupInfo, seriesConfig };
        groupInfo.seriesIds.push(id);
        groupInfo.group.appendChild(seriesRootGroup);
        return groupInfo.group;
    }
    changeGroup(seriesConfig) {
        var _a, _b;
        const { id, seriesGrouping, type, rootGroup, oldGrouping } = seriesConfig;
        const { groupIndex = id } = seriesGrouping !== null && seriesGrouping !== void 0 ? seriesGrouping : {};
        if ((_b = (_a = this.groups[type]) === null || _a === void 0 ? void 0 : _a[groupIndex]) === null || _b === void 0 ? void 0 : _b.seriesIds.includes(id)) {
            // Already in the right group, nothing to do.
            return;
        }
        if (this.series[id] != null) {
            this.releaseGroup({ id, seriesGrouping: oldGrouping, type, rootGroup });
        }
        this.requestGroup(seriesConfig);
    }
    releaseGroup(seriesConfig) {
        var _a, _b, _c, _d, _e;
        const { id, seriesGrouping, rootGroup, type } = seriesConfig;
        const { groupIndex = id } = seriesGrouping !== null && seriesGrouping !== void 0 ? seriesGrouping : {};
        if (this.series[id] == null) {
            throw new Error(`AG Charts - series doesn't have an allocated layer: ${id}`);
        }
        const groupInfo = (_b = (_a = this.groups[type]) === null || _a === void 0 ? void 0 : _a[groupIndex]) !== null && _b !== void 0 ? _b : (_c = this.series[id]) === null || _c === void 0 ? void 0 : _c.layerState;
        if (groupInfo) {
            groupInfo.seriesIds = groupInfo.seriesIds.filter((v) => v !== id);
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
            const leadSeriesConfig = (_e = this.series[(_d = groupInfo === null || groupInfo === void 0 ? void 0 : groupInfo.seriesIds) === null || _d === void 0 ? void 0 : _d[0]]) === null || _e === void 0 ? void 0 : _e.seriesConfig;
            groupInfo.group.zIndexSubOrder = leadSeriesConfig === null || leadSeriesConfig === void 0 ? void 0 : leadSeriesConfig.getGroupZIndexSubOrder('data');
        }
        delete this.series[id];
    }
    destroy() {
        for (const groups of Object.values(this.groups)) {
            for (const groupInfo of Object.values(groups)) {
                this.rootGroup.removeChild(groupInfo.group);
            }
        }
        this.groups = {};
        this.series = {};
    }
}
