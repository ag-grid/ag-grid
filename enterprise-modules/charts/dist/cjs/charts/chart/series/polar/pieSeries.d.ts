import { FontStyle, FontWeight } from "../../../scene/shape/text";
import { DropShadow } from "../../../scene/dropShadow";
import { PolarTooltipRendererParams, SeriesNodeDatum } from "./../series";
import { Label } from "../../label";
import { LegendDatum } from "../../legend";
import { Caption } from "../../../caption";
import { Shape } from "../../../scene/shape/shape";
import { PolarSeries } from "./polarSeries";
import { ChartAxisDirection } from "../../chartAxis";
interface GroupSelectionDatum extends SeriesNodeDatum {
    index: number;
    radius: number;
    startAngle: number;
    endAngle: number;
    midAngle: number;
    midCos: number;
    midSin: number;
    label?: {
        text: string;
        textAlign: CanvasTextAlign;
        textBaseline: CanvasTextBaseline;
    };
}
export interface PieTooltipRendererParams extends PolarTooltipRendererParams {
    labelKey?: string;
    labelName?: string;
}
declare class PieSeriesLabel extends Label {
    offset: number;
    minAngle: number;
}
export declare class PieSeries extends PolarSeries {
    static className: string;
    private radiusScale;
    private groupSelection;
    /**
     * The processed data that gets visualized.
     */
    private groupSelectionData;
    private angleScale;
    dataEnabled: boolean[];
    private _title?;
    title: Caption | undefined;
    /**
     * Defaults to make the callout colors the same as {@link strokeStyle}.
     */
    private _calloutColors;
    calloutColors: string[];
    private _calloutStrokeWidth;
    calloutStrokeWidth: number;
    private _calloutLength;
    calloutLength: number;
    readonly label: PieSeriesLabel;
    constructor();
    private _labelOffset;
    labelOffset: number;
    private _labelFontStyle?;
    labelFontStyle: FontStyle | undefined;
    private _labelFontWeight?;
    labelFontWeight: FontWeight | undefined;
    private _labelFontSize;
    labelFontSize: number;
    private _labelFontFamily;
    labelFontFamily: string;
    private _labelColor;
    labelColor: string;
    /**
     * The key of the numeric field to use to determine the angle (for example,
     * a pie slice angle).
     */
    private _angleKey;
    angleKey: string;
    private _angleName;
    angleName: string;
    /**
     * The key of the numeric field to use to determine the radii of pie slices.
     * The largest value will correspond to the full radius and smaller values to
     * proportionally smaller radii. To prevent confusing visuals, this config only works
     * if {@link innerRadiusOffset} is zero.
     */
    private _radiusKey?;
    radiusKey: string | undefined;
    private _radiusName?;
    radiusName: string | undefined;
    private _labelKey?;
    labelKey: string | undefined;
    private _labelName?;
    labelName: string | undefined;
    private _fills;
    fills: string[];
    private _strokes;
    strokes: string[];
    private _fillOpacity;
    fillOpacity: number;
    private _strokeOpacity;
    strokeOpacity: number;
    /**
     * The series rotation in degrees.
     */
    private _rotation;
    rotation: number;
    private _outerRadiusOffset;
    outerRadiusOffset: number;
    private _innerRadiusOffset;
    innerRadiusOffset: number;
    private _strokeWidth;
    strokeWidth: number;
    private _shadow?;
    shadow: DropShadow | undefined;
    highlightStyle: {
        fill?: string;
        stroke?: string;
        centerOffset?: number;
    };
    private highlightedNode?;
    highlightNode(node: Shape): void;
    dehighlightNode(): void;
    getDomain(direction: ChartAxisDirection): any[];
    processData(): boolean;
    update(): void;
    getTooltipHtml(nodeDatum: GroupSelectionDatum): string;
    tooltipRenderer?: (params: PieTooltipRendererParams) => string;
    listSeriesItems(data: LegendDatum[]): void;
    toggleSeriesItem(itemId: number, enabled: boolean): void;
}
export {};
