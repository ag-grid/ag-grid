export type SeriesGrouping = {
    groupIndex: number;
    groupCount: number;
    stackIndex: number;
    stackCount: number;
};
export declare class SeriesStateManager {
    private readonly groups;
    registerSeries({ id, seriesGrouping, visible, type, }: {
        id: string;
        seriesGrouping?: SeriesGrouping;
        visible: boolean;
        type: string;
    }): void;
    deregisterSeries({ id, type }: {
        id: string;
        type: string;
    }): void;
    getVisiblePeerGroupIndex({ type, seriesGrouping, visible, }: {
        type: string;
        seriesGrouping?: SeriesGrouping;
        visible: boolean;
    }): {
        visibleGroupCount: number;
        visibleSameStackCount: number;
        index: number;
    };
}
