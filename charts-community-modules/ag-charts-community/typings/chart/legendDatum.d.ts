import { Marker } from './marker/marker';
import { Node } from '../scene/node';
import { BBox } from '../scene/bbox';
import { AgChartLegendListeners } from './agChartOptions';
export interface ChartLegend {
    computeBBox(): BBox;
    attachLegend(node: Node | null): void;
    destroy(): void;
    data: any;
    item: {
        label: {
            formatter?: (params: any) => string;
        };
    };
    listeners: AgChartLegendListeners;
}
export interface ChartLegendDatum {
    legendType: string;
    seriesId: string;
    enabled: boolean;
}
export interface CategoryLegendDatum extends ChartLegendDatum {
    legendType: 'category';
    id: string;
    itemId: any;
    marker: {
        shape?: string | (new () => Marker);
        fill: string;
        stroke: string;
        fillOpacity: number;
        strokeOpacity: number;
    };
    label: {
        text: string;
    };
}
/**
 * Internal Use Only: Used to ensure this file is treated as a module until we can use moduleDetection flag in Ts v4.7
 */
export declare const __FORCE_MODULE_DETECTION = 0;
//# sourceMappingURL=legendDatum.d.ts.map