import { Group } from "../scene/group";
import { FontStyle, FontWeight } from "../scene/shape/text";
import { Marker } from "./marker/marker";
export declare class MarkerLabel extends Group {
    static className: string;
    static defaults: Readonly<{
        padding: number;
        markerSize: number;
        labelFont: string;
        labelFontStyle: any;
        labelFontWeight: any;
        labelFontSize: number;
        labelFontFamily: string;
        labelColor: string;
    }>;
    private label;
    constructor();
    labelText: string;
    labelFontStyle: FontStyle | undefined;
    labelFontWeight: FontWeight | undefined;
    labelFontSize: number;
    labelFontFamily: string;
    labelColor: string | undefined;
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
    private _padding;
    padding: number;
    private update;
}
