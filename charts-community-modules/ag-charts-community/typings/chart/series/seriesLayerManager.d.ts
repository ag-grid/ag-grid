import { Group } from '../../scene/group';
import type { ZIndexSubOrder } from '../../scene/node';
import type { SeriesGrouping } from './seriesStateManager';
export declare type SeriesConfig = {
    id: string;
    seriesGrouping?: SeriesGrouping;
    rootGroup: Group;
    type: string;
    getGroupZIndexSubOrder(type: 'data' | 'labels' | 'highlight' | 'path' | 'marker' | 'paths', subIndex?: number): ZIndexSubOrder;
};
export declare class SeriesLayerManager {
    private readonly rootGroup;
    private readonly groups;
    private readonly series;
    constructor(rootGroup: Group);
    requestGroup(seriesConfig: SeriesConfig): Group;
    changeGroup(seriesConfig: SeriesConfig & {
        oldGrouping?: SeriesGrouping;
    }): void;
    releaseGroup(seriesConfig: {
        id: string;
        seriesGrouping?: SeriesGrouping;
        rootGroup: Group;
        type: string;
    }): void;
    destroy(): void;
}
//# sourceMappingURL=seriesLayerManager.d.ts.map