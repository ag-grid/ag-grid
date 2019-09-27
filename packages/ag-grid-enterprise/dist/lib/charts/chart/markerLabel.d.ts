// ag-grid-enterprise v21.2.2
import { Group } from "../scene/group";
export declare class MarkerLabel extends Group {
    static className: string;
    static defaults: Readonly<{
        padding: number;
        markerSize: number;
        labelFont: string;
        labelFontStyle: undefined;
        labelFontWeight: undefined;
        labelFontSize: number;
        labelFontFamily: string;
        labelColor: string;
    }>;
    private marker;
    private label;
    constructor();
    labelText: string;
    labelFontStyle: string | undefined;
    labelFontWeight: string | undefined;
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
