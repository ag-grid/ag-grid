import { Group } from "../scene/group";
import { FontStyle, FontWeight } from "../scene/shape/text";
import { Marker } from "./marker/marker";
export declare class MarkerLabel extends Group {
    static className: string;
    private label;
    constructor();
    text: string;
    fontStyle: FontStyle | undefined;
    fontWeight: FontWeight | undefined;
    fontSize: number;
    fontFamily: string;
    color: string | undefined;
    private _marker;
    marker: Marker;
    private _markerSize;
    markerSize: number;
    markerFill: string | undefined;
    markerStroke: string | undefined;
    markerStrokeWidth: number;
    markerFillOpacity: number;
    markerStrokeOpacity: number;
    opacity: number;
    private _spacing;
    spacing: number;
    private update;
}
