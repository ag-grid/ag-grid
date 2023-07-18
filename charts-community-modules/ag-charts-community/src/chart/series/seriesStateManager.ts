export type SeriesGrouping = {
    groupIndex: number;
    groupCount: number;
    stackIndex: number;
    stackCount: number;
};

export class SeriesStateManager {
    private readonly groups: {
        [type: string]: {
            [id: string]: {
                grouping: SeriesGrouping;
                visible: boolean;
            };
        };
    } = {};

    public registerSeries({
        id,
        seriesGrouping,
        visible,
        type,
    }: {
        id: string;
        seriesGrouping?: SeriesGrouping;
        visible: boolean;
        type: string;
    }) {
        if (!seriesGrouping) return;

        this.groups[type] ??= {};
        this.groups[type][id] = { grouping: seriesGrouping, visible };
    }

    public deregisterSeries({ id, type }: { id: string; type: string }) {
        if (this.groups[type]) {
            delete this.groups[type][id];
        }
        if (this.groups[type] && Object.keys(this.groups[type]).length === 0) {
            delete this.groups[type];
        }
    }

    public getVisiblePeerGroupIndex({ type, seriesGrouping }: { type: string; seriesGrouping?: SeriesGrouping }): {
        visibleGroupCount: number;
        index: number;
    } {
        if (!seriesGrouping) return { visibleGroupCount: 1, index: 0 };

        const visibleGroups = [
            ...Object.entries(this.groups[type] ?? {})
                .filter(([_, entry]) => entry.visible)
                .reduce((result, [_, next]) => {
                    if (next.visible) {
                        result.add(next.grouping.groupIndex);
                    }
                    return result;
                }, new Set<number>())
                .values(),
        ];

        visibleGroups.sort((a, b) => a - b);

        return { visibleGroupCount: visibleGroups.length, index: visibleGroups.indexOf(seriesGrouping.groupIndex) };
    }
}
