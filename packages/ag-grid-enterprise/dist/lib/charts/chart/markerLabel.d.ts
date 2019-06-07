// ag-grid-enterprise v21.0.1
import { Group } from "../scene/group";
export declare class MarkerLabel extends Group {
    static className: string;
    static defaults: Readonly<{
        padding: number;
        markerSize: number;
        labelFont: string;
        labelColor: string;
    }>;
    private marker;
    private label;
    constructor();
    labelText: string;
    labelFont: string;
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
