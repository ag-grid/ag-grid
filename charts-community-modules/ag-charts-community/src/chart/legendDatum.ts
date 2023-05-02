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
    id: string; // component ID
    itemId: any; // sub-component ID
    marker: {
        shape?: string | (new () => Marker);
        fill: string;
        stroke: string;
        fillOpacity: number;
        strokeOpacity: number;
    };
    label: {
        text: string; // display name for the sub-component
    };
}
