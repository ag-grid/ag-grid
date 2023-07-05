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

    public deregisterSeries({ id }: { id: string }) {
        delete this.groups[id];
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

        visibleGroups.sort();

        return { visibleGroupCount: visibleGroups.length, index: visibleGroups.indexOf(seriesGrouping.groupIndex) };
    }
}
