import { Group } from "../scene/group";
import { FontStyle, FontWeight } from "../scene/shape/text";
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
    private marker;
    private label;
    constructor();
    labelText: string;
    labelFontStyle: FontStyle | undefined;
    labelFontWeight: FontWeight | undefined;
    labelFontSize: number;
    labelFontFamily: string;
    labelColor: string | undefined;
    private _markerSize;
    markerSize: number;
    markerFill: string | undefined;
    markerStroke: string | undefined;
    markerStrokeWidth: number;
    opacity: number;
    private _padding;
    padding: number;
    private update;
}
