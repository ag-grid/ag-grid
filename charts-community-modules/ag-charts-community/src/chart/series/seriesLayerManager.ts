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

    public requestGroup({
        id,
        seriesGrouping,
        type,
        rootGroup,
    }: {
        id: string;
        seriesGrouping?: SeriesGrouping;
        rootGroup: Group;
        type: string;
    }) {
        const { groupIndex = -1 } = seriesGrouping ?? {};

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
                    })
                ),
            };
        }

        groupInfo.seriesIds.push(id);
        groupInfo.group.appendChild(rootGroup);
        return groupInfo.group;
    }

    public releaseGroup({ id, seriesGrouping, type }: { id: string; seriesGrouping?: SeriesGrouping; type: string }) {
        if (!seriesGrouping) return;

        const { groupIndex } = seriesGrouping;
        const groupInfo = this.groups[type][groupIndex];
        if (groupInfo) {
            groupInfo.seriesIds = groupInfo.seriesIds.filter((v) => v !== id);
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
