import { Marker } from "../marker/marker";
import { Observable, reactive } from "../../util/observable";

export class SeriesMarker extends Observable {
    /**
     * Marker constructor function. A series will create one marker instance per data point.
     */
    @reactive(['legend']) type?: new () => Marker;

    /**
     * In case a series has the `sizeKey` set, the `sizeKey` values along with the `minSize/size` configs
     * will be used to determine the size of the marker. All values will be mapped to a marker size
     * within the `[minSize, size]` range, where the largest values will correspond to the `size`
     * and the lowest to the `minSize`.
     */
    @reactive(['style']) size = 12;

    @reactive(['style']) minSize = 12;

    @reactive(['style']) enabled = true;

    @reactive(['style']) xOffset = 0;
    @reactive(['style']) yOffset = 0;

    @reactive(['style', 'legend']) fill?: string;
    @reactive(['style', 'legend']) stroke?: string;

    @reactive(['style']) strokeWidth?: number;
    @reactive(['style', 'legend']) fillOpacity = 1;
    @reactive(['style', 'legend']) strokeOpacity = 1;
}