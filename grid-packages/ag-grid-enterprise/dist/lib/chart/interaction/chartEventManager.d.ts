import { BaseManager } from './baseManager';
import type { ChartAxisDirection } from '../chartAxisDirection';
declare type ChartEventType = 'legend-item-click' | 'legend-item-double-click' | 'axis-hover';
declare type ChartEvents = LegendItemClickChartEvent | LegendItemDoubleClickChartEvent | AxisHoverChartEvent;
interface ChartEvent<ChartEventType> {
    type: ChartEventType;
}
export interface LegendItemClickChartEvent extends ChartEvent<'legend-item-click'> {
    series: any;
    itemId: any;
    enabled: boolean;
    legendItemName?: string;
}
export interface LegendItemDoubleClickChartEvent extends ChartEvent<'legend-item-double-click'> {
    series: any;
    itemId: any;
    enabled: boolean;
    legendItemName?: string;
    numVisibleItems: {
        [key: string]: number;
    };
}
export interface AxisHoverChartEvent extends ChartEvent<'axis-hover'> {
    axisId: string;
    direction: ChartAxisDirection;
}
export declare class ChartEventManager extends BaseManager<ChartEventType, ChartEvents> {
    legendItemClick(series: any, itemId: any, enabled: boolean, legendItemName?: string): void;
    legendItemDoubleClick(series: any, itemId: any, enabled: boolean, numVisibleItems: {
        [key: string]: number;
    }, legendItemName?: string): void;
    axisHover(axisId: string, direction: ChartAxisDirection): void;
}
export {};
//# sourceMappingURL=chartEventManager.d.ts.map