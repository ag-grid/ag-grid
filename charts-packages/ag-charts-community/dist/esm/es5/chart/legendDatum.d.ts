import { Marker } from './marker/marker';
export interface LegendDatum {
    id: string;
    itemId: any;
    seriesId: string;
    enabled: boolean;
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
