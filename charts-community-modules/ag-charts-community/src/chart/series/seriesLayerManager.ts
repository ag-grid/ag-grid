import { Group } from '../../scene/group';
import type { ZIndexSubOrder } from '../../scene/node';
import { Layers } from '../layers';
import type { SeriesGrouping } from './seriesStateManager';

export type SeriesConfig = {
    id: string;
    seriesGrouping?: SeriesGrouping;
    rootGroup: Group;
    type: string;
    _declarationOrder: number;
    getGroupZIndexSubOrder(
        type: 'data' | 'labels' | 'highlight' | 'path' | 'marker' | 'paths',
        subIndex?: number
    ): ZIndexSubOrder;
};

export class SeriesLayerManager {
    private readonly rootGroup: Group;

    private readonly groups: {
        [type: string]: {
            [id: string]: {
                seriesIds: string[];
                group: Group;
            };
        };
    } = {};

    constructor(rootGroup: Group) {
        this.rootGroup = rootGroup;
    }

    public requestGroup(opts: SeriesConfig) {
        const { id, seriesGrouping, type, rootGroup } = opts;
        const { groupIndex = id } = seriesGrouping ?? {};

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
                        zIndexSubOrder: opts.getGroupZIndexSubOrder('data'),
                    })
                ),
            };
        }

        groupInfo.seriesIds.push(id);
        groupInfo.group.appendChild(rootGroup);
        return groupInfo.group;
    }

    public changeGroup({
        id,
        seriesGrouping,
        type,
        rootGroup,
        oldGrouping,
        _declarationOrder,
        getGroupZIndexSubOrder,
    }: SeriesConfig & { oldGrouping?: SeriesGrouping }) {
        const { groupIndex = id } = seriesGrouping ?? {};

        if (this.groups[type]?.[groupIndex]?.seriesIds.includes(id)) {
            // Already in the right group, nothing to do.
            return;
        }

        this.releaseGroup({ id, seriesGrouping: oldGrouping, type, rootGroup });
        this.requestGroup({ id, seriesGrouping, type, rootGroup, _declarationOrder, getGroupZIndexSubOrder });
    }

    public releaseGroup({
        id,
        seriesGrouping,
        rootGroup,
        type,
    }: {
        id: string;
        seriesGrouping?: SeriesGrouping;
        rootGroup: Group;
        type: string;
    }) {
        const { groupIndex = id } = seriesGrouping ?? {};

        const groupInfo = this.groups[type]?.[groupIndex];
        if (groupInfo) {
            groupInfo.seriesIds = groupInfo.seriesIds.filter((v) => v !== id);
            groupInfo.group.removeChild(rootGroup);
        }
        if (groupInfo?.seriesIds.length === 0) {
            this.rootGroup.removeChild(groupInfo.group);
            delete this.groups[type][groupIndex];
        }
    }

    public destroy() {
        for (const groups of Object.values(this.groups)) {
            for (const groupInfo of Object.values(groups)) {
                this.rootGroup.removeChild(groupInfo.group);
            }
        }
        (this as any).groups = {};
    }
}
