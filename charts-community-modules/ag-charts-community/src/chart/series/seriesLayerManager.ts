import { Group } from '../../scene/group';
import { Layers } from '../layers';
import type { SeriesGrouping } from './seriesStateManager';

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

    public requestGroup(opts: {
        id: string;
        seriesGrouping?: SeriesGrouping;
        rootGroup: Group;
        type: string;
        _declarationOrder: number;
    }) {
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
                        zIndexSubOrder: [() => opts._declarationOrder, 0],
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
    }: {
        id: string;
        seriesGrouping?: SeriesGrouping;
        oldGrouping?: SeriesGrouping;
        rootGroup: Group;
        type: string;
        _declarationOrder: number;
    }) {
        const { groupIndex = id } = seriesGrouping ?? {};

        if (this.groups[type]?.[groupIndex]?.seriesIds.includes(id)) {
            // Already in the right group, nothing to do.
            return;
        }

        this.releaseGroup({ id, seriesGrouping: oldGrouping, type, rootGroup });
        this.requestGroup({ id, seriesGrouping, type, rootGroup, _declarationOrder });
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
