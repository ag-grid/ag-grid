import { Marker } from "../marker/marker";
import { Observable } from "../../util/observable";
export declare class SeriesMarker extends Observable {
    enabled: boolean;
    /**
     * One of the predefined marker names, or a marker constructor function (for user-defined markers).
     * A series will create one marker instance per data point.
     */
    shape: string | (new () => Marker);
    size: number;
    /**
     * In case a series has the `sizeKey` set, the `sizeKey` values along with the `minSize/size` configs
     * will be used to determine the size of the marker. All values will be mapped to a marker size
     * within the `[minSize, size]` range, where the largest values will correspond to the `size`
     * and the lowest to the `minSize`.
     */
    minSize: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}
export interface SeriesMarkerFormatterParams {
    datum: any;
    fill?: string;
    stroke?: string;
    strokeWidth: number;
    size: number;
    highlighted: boolean;
}
