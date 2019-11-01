import { Marker } from "../marker/marker";
import { Color } from "../../util/color";
import { Observable, reactive, listener } from "../../util/observable";
import palette from "../palettes";

export class SeriesMarker extends Observable {
    /**
     * Marker constructor function. A series will create one marker instance per data point.
     */
    @reactive(['type', 'legend']) type?: new () => Marker;

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

    @reactive(['style', 'legend']) fill?: string = palette.fills[0];
    @reactive(['style', 'legend']) stroke?: string = palette.strokes[0]; // Color.fromString(value).darker().toHexString();

    @reactive(['style']) strokeWidth?: number;
    @reactive(['style', 'legend']) fillOpacity = 1;
    @reactive(['style', 'legend']) strokeOpacity = 1;
}