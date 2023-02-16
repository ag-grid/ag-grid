import { Marker } from '../marker/marker';
import { ChangeDetectable } from '../../scene/changeDetectable';
export declare class SeriesMarker extends ChangeDetectable {
    enabled: boolean;
    /**
     * One of the predefined marker names, or a marker constructor function (for user-defined markers).
     * A series will create one marker instance per data point.
     */
    shape: string | (new () => Marker);
    size: number;
    /**
     * In case a series has the `sizeKey` set, the `sizeKey` values along with the `size` and `maxSize` configs
     * will be used to determine the size of the marker. All values will be mapped to a marker size
     * within the `[size, maxSize]` range, where the largest values will correspond to the `maxSize`
     * and the lowest to the `size`.
     */
    maxSize: number;
    domain?: [number, number];
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    fillOpacity?: number;
    strokeOpacity?: number;
}
