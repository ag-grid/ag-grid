// ag-grid-enterprise v20.2.0
import { Chart } from "../chart";
import { PolarSeries } from "./polarSeries";
import { DropShadow } from "../../scene/dropShadow";
export declare class PieSeries<D, X = number, Y = number> extends PolarSeries<D, X, Y> {
    protected fieldPropertiesX: (keyof this)[];
    protected fieldPropertiesY: (keyof this)[];
    chart: Chart<D, X, Y> | null;
    /**
     * The name of the numeric field to use to determine the angle (for example,
     * a pie slice angle).
     */
    _angleField: Extract<keyof D, string> | null;
    angleField: Extract<keyof D, string> | null;
    _labelField: Extract<keyof D, string> | null;
    labelField: Extract<keyof D, string> | null;
    labelFont: string;
    labelColor: string;
    labelRotation: number;
    labelMinAngle: number;
    /**
     * `null` means make the callout color the same as {@link strokeStyle}.
     */
    calloutColor: string | null;
    calloutWidth: number;
    calloutLength: number;
    calloutPadding: number;
    colors: string[];
    private strokeColors;
    rotation: number;
    /**
     * The stroke style to use for all pie sectors.
     * `null` value here doesn't mean invisible stroke, as it normally would
     * (see `Shape.strokeStyle` comments), it means derive stroke colors from fill
     * colors by darkening them. To make the stroke appear invisible use the same
     * color as the background of the chart (such as 'white').
     */
    strokeStyle: string | null;
    lineWidth: number;
    shadow: DropShadow | null;
    /**
     * The name of the numeric field to use to determine the radii of pie slices.
     */
    private _radiusField;
    radiusField: string;
    private angleScale;
    private radiusScale;
    private groupSelection;
    /**
     * The processed data that gets visualized.
     */
    private sectorsData;
    private _data;
    data: any[];
    getDomainX(): [number, number];
    getDomainY(): [number, number];
    processData(): boolean;
    update(): void;
}
