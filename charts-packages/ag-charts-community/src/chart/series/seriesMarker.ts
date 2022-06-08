import { Marker } from "../marker/marker";
import { Circle } from "../marker/circle";

export class SeriesMarker {

    enabled = true;

    /**
     * One of the predefined marker names, or a marker constructor function (for user-defined markers).
     * A series will create one marker instance per data point.
     */
    shape: string | (new () => Marker) = Circle;

    size = 6;

    /**
     * In case a series has the `sizeKey` set, the `sizeKey` values along with the `size` and `maxSize` configs
     * will be used to determine the size of the marker. All values will be mapped to a marker size
     * within the `[size, maxSize]` range, where the largest values will correspond to the `maxSize`
     * and the lowest to the `size`.
     */
    maxSize = 30;

    domain?: [number, number] = undefined;

    fill?: string = undefined;

    stroke?: string = undefined;

    strokeWidth?: number = 1;

    fillOpacity?: number = undefined;

    strokeOpacity?: number = undefined;
}

export interface SeriesMarkerFormatterParams {
    datum: any;
    fill?: string;
    stroke?: string;
    strokeWidth: number;
    size: number;
    highlighted: boolean;
}
