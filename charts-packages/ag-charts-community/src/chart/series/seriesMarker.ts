import { Marker } from "../marker/marker";
import { Circle } from "../marker/circle";
import { ChangeDetectable, SceneChangeDetection, RedrawType } from "../../scene/changeDetectable";

export class SeriesMarker extends ChangeDetectable {

    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    enabled = true;

    /**
     * One of the predefined marker names, or a marker constructor function (for user-defined markers).
     * A series will create one marker instance per data point.
     */
     @SceneChangeDetection({ redraw: RedrawType.MAJOR })
     shape: string | (new () => Marker) = Circle;

     @SceneChangeDetection({ redraw: RedrawType.MAJOR })
     size = 6;

    /**
     * In case a series has the `sizeKey` set, the `sizeKey` values along with the `size` and `maxSize` configs
     * will be used to determine the size of the marker. All values will be mapped to a marker size
     * within the `[size, maxSize]` range, where the largest values will correspond to the `maxSize`
     * and the lowest to the `size`.
     */
    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    maxSize = 30;

    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    domain?: [number, number] = undefined;

    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    fill?: string = undefined;

    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    stroke?: string = undefined;

    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    strokeWidth?: number = 1;

    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
    fillOpacity?: number = undefined;

    @SceneChangeDetection({ redraw: RedrawType.MAJOR })
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
