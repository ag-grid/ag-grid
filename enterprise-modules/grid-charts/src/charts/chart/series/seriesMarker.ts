import { Marker } from "../marker/marker";
import { Observable, reactive } from "../../util/observable";
import palette from "../palettes";

export class SeriesMarker extends Observable {
    /**
     * Marker constructor function. A series will create one marker instance per data point.
     */
    @reactive(['change', 'legendChange']) type?: new () => Marker;

    /**
     * In case a series has the `sizeKey` set, the `sizeKey` values along with the `minSize/size` configs
     * will be used to determine the size of the marker. All values will be mapped to a marker size
     * within the `[minSize, size]` range, where the largest values will correspond to the `size`
     * and the lowest to the `minSize`.
     */
    @reactive(['change']) size = 12;

    @reactive(['change']) minSize = 12;

    @reactive(['change']) enabled = true;

    @reactive(['change']) xOffset = 0;
    @reactive(['change']) yOffset = 0;

    @reactive(['change', 'legendChange']) fill?: string;
    @reactive(['change', 'legendChange']) stroke?: string;

    @reactive(['change']) strokeWidth?: number;
    @reactive(['change', 'legendChange']) fillOpacity = 1;
    @reactive(['change', 'legendChange']) strokeOpacity = 1;
}