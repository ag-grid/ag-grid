import { Group } from '../../scene/group';
import type { ZIndexSubOrder } from '../../scene/node';
import { Layers } from '../layers';
import type { SeriesGrouping } from './seriesStateManager';

export type SeriesConfig = {
    id: string;
    seriesGrouping?: SeriesGrouping;
    rootGroup: Group;
    type: string;
    getGroupZIndexSubOrder(
        type: 'data' | 'labels' | 'highlight' | 'path' | 'marker' | 'paths',
        subIndex?: number
    ): ZIndexSubOrder;
};

type LayerState = {
    seriesIds: string[];
    group: Group;
};

export class SeriesLayerManager {
    private readonly rootGroup: Group;

    private readonly groups: {
        [type: string]: {
            [id: string]: LayerState;
        };
    } = {};
    private readonly series: { [id: string]: { layerState: LayerState; seriesConfig: SeriesConfig } } = {};

    constructor(rootGroup: Group) {
        this.rootGroup = rootGroup;
    }

    public requestGroup(seriesConfig: SeriesConfig) {
        const { id, type, rootGroup: seriesRootGroup, seriesGrouping } = seriesConfig;
        const { groupIndex = id } = seriesGrouping ?? {};

        if (this.series[id] != null) {
            throw new Error(`AG Charts - series already has an allocated layer: ${this.series[id]}`);
        }

        this.groups[type] ??= {};
        let groupInfo = this.groups[type][groupIndex];
        if (!groupInfo) {
            groupInfo = this.groups[type][groupIndex] ??= {
                seriesIds: [],
                group: this.rootGroup.appendChild(
                    new Group({
                        name: `${type}-content`,
                        layer: true,
                        zIndex: Layers.SERIES_LAYER_ZINDEX,
                        zIndexSubOrder: seriesConfig.getGroupZIndexSubOrder('data'),
                    })
                ),
            };
        }

        this.series[id] = { layerState: groupInfo, seriesConfig };

        groupInfo.seriesIds.push(id);
        groupInfo.group.appendChild(seriesRootGroup);
        return groupInfo.group;
    }

    public changeGroup(seriesConfig: SeriesConfig & { oldGrouping?: SeriesGrouping }) {
        const { id, seriesGrouping, type, rootGroup, oldGrouping } = seriesConfig;
        const { groupIndex = id } = seriesGrouping ?? {};

        if (this.groups[type]?.[groupIndex]?.seriesIds.includes(id)) {
            // Already in the right group, nothing to do.
            return;
        }

        if (this.series[id] != null) {
            this.releaseGroup({ id, seriesGrouping: oldGrouping, type, rootGroup });
        }
        this.requestGroup(seriesConfig);
    }

    public releaseGroup(seriesConfig: { id: string; seriesGrouping?: SeriesGrouping; rootGroup: Group; type: string }) {
        const { id, seriesGrouping, rootGroup, type } = seriesConfig;
        const { groupIndex = id } = seriesGrouping ?? {};

        if (this.series[id] == null) {
            throw new Error(`AG Charts - series doesn't have an allocated layer: ${id}`);
        }

        const groupInfo = this.groups[type]?.[groupIndex] ?? this.series[id]?.layerState;
        if (groupInfo) {
            groupInfo.seriesIds = groupInfo.seriesIds.filter((v) => v !== id);
            groupInfo.group.removeChild(rootGroup);
        }

        if (groupInfo?.seriesIds.length === 0) {
            // Last member of the layer, cleanup.
            this.rootGroup.removeChild(groupInfo.group);
            delete this.groups[type][groupIndex];
            delete this.groups[type][id];
        } else if (groupInfo?.seriesIds.length > 0) {
            // Update zIndexSubOrder to avoid it becoming state as series are removed and re-added
            // with the same groupIndex, but are otherwise unrelated.
            const leadSeriesConfig = this.series[groupInfo?.seriesIds?.[0]]?.seriesConfig;
            groupInfo.group.zIndexSubOrder = leadSeriesConfig?.getGroupZIndexSubOrder('data');
        }

        delete this.series[id];
    }

    public destroy() {
        for (const groups of Object.values(this.groups)) {
            for (const groupInfo of Object.values(groups)) {
                this.rootGroup.removeChild(groupInfo.group);
            }
        }
        (this as any).groups = {};
        (this as any).series = {};
    }
}
