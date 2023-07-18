export declare type SeriesGrouping = {
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
    getVisiblePeerGroupIndex({ type, seriesGrouping }: {
        type: string;
        seriesGrouping?: SeriesGrouping;
    }): {
        visibleGroupCount: number;
        index: number;
    };
}
//# sourceMappingURL=seriesStateManager.d.ts.map