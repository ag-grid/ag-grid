import type { AgChartLegendListeners } from '../options/agChartOptions';
import type { Node } from '../scene/node';
import type { Marker } from './marker/marker';
export interface ChartLegend {
    attachLegend(node: Node | null): void;
    destroy(): void;
    data: any;
    listeners: AgChartLegendListeners;
}
export type ChartLegendType = 'category' | 'gradient';
export type ChartLegendDatum<T extends ChartLegendType> = T extends 'category' ? CategoryLegendDatum : T extends 'gradient' ? GradientLegendDatum : never;
export interface BaseChartLegendDatum {
    legendType: ChartLegendType;
    seriesId: string;
    enabled: boolean;
}
export interface CategoryLegendDatum extends BaseChartLegendDatum {
    legendType: 'category';
    id: string;
    itemId: any;
    marker: {
        shape?: string | (new () => Marker);
        fill?: string;
        stroke?: string;
        fillOpacity: number;
        strokeOpacity: number;
        strokeWidth: number;
        enabled?: boolean;
    };
    line?: {
        stroke: string;
        strokeOpacity: number;
        strokeWidth: number;
        lineDash: number[];
    };
    /** Optional deduplication id - used to coordinate synced toggling of multiple items. */
    legendItemName?: string;
    label: {
        text: string;
    };
}
export interface GradientLegendDatum extends BaseChartLegendDatum {
    legendType: 'gradient';
    enabled: boolean;
    seriesId: string;
    colorName?: string;
    colorDomain: number[];
    colorRange: string[];
}
/**
 * Internal Use Only: Used to ensure this file is treated as a module until we can use moduleDetection flag in Ts v4.7
 */
export declare const __FORCE_MODULE_DETECTION = 0;
