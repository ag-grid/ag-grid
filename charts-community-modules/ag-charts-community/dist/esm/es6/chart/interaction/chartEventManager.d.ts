import { BaseManager } from './baseManager';
declare type ChartEventType = 'legend-item-click' | 'legend-item-double-click';
declare type ChartEvents = LegendItemClickChartEvent | LegendItemDoubleClickChartEvent;
interface ChartEvent<ChartEventType> {
    type: ChartEventType;
}
export interface LegendItemClickChartEvent extends ChartEvent<'legend-item-click'> {
    series: any;
    itemId: any;
    enabled: boolean;
}
export interface LegendItemDoubleClickChartEvent extends ChartEvent<'legend-item-double-click'> {
    series: any;
    itemId: any;
    enabled: boolean;
    numVisibleItems: {
        [key: string]: number;
    };
}
export declare class ChartEventManager extends BaseManager<ChartEventType, ChartEvents> {
    legendItemClick(series: any, itemId: any, enabled: boolean): void;
    legendItemDoubleClick(series: any, itemId: any, enabled: boolean, numVisibleItems: {
        [key: string]: number;
    }): void;
}
export {};
//# sourceMappingURL=chartEventManager.d.ts.map