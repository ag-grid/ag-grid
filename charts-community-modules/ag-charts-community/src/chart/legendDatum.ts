import { Marker } from './marker/marker';

export interface LegendDatum {
    id: string; // component ID
    itemId: any; // sub-component ID
    itemKey?: string;
    seriesId: string;
    enabled: boolean; // the current state of the sub-component
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
