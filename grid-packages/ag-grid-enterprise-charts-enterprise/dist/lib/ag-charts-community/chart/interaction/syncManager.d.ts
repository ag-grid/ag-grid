import type { ModuleInstance } from '../../module/baseModule';
import type { ChartAxisDirection } from '../chartAxisDirection';
import type { ISeries } from '../series/seriesTypes';
import { BaseManager } from './baseManager';
import type { HighlightManager } from './highlightManager';
import type { ZoomManager } from './zoomManager';
type GroupId = string | symbol;
/** Breaks circular dependencies which occur when importing ChartAxis. */
type AxisLike = {
    boundSeries: ISeries<any>[];
    direction: ChartAxisDirection;
    keys: string[];
    reverse?: boolean;
    nice: boolean;
    min?: number;
    max?: number;
};
/** Breaks circular dependencies which occur when importing Chart. */
type ChartLike = {
    id: string;
    axes: AxisLike[];
    series: ISeries<any>[];
    highlightManager: HighlightManager;
    zoomManager: ZoomManager;
    modules: Map<string, ModuleInstance>;
};
export declare class SyncManager extends BaseManager {
    protected chart: ChartLike;
    static chartsGroups: Map<GroupId, Set<ChartLike>>;
    static DEFAULT_GROUP: symbol;
    constructor(chart: ChartLike);
    subscribe(groupId?: GroupId): this;
    unsubscribe(groupId?: GroupId): this;
    getChart(): ChartLike;
    getGroup(groupId?: GroupId): ChartLike[];
    getGroupSiblings(groupId?: GroupId): ChartLike[];
    private get;
}
export {};
