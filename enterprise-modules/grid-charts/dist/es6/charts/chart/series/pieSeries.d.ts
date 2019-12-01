import { FontStyle, FontWeight } from "../../scene/shape/text";
import { DropShadow } from "../../scene/dropShadow";
import { Series, SeriesNodeDatum } from "./series";
import { Label } from "../label";
import { LegendDatum } from "../legend";
import { PolarChart } from "../polarChart";
import { Caption } from "../../caption";
import { Shape } from "../../scene/shape/shape";
import { PieTooltipRendererParams } from "../../chartOptions";
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
declare class PieSeriesLabel extends Label {
    onDataChange?: () => void;
    enabled: boolean;
    private _offset;
    offset: number;
    private _minAngle;
    minAngle: number;
}
export declare class PieSeries extends Series<PolarChart> {
    static className: string;
    private radiusScale;
    private groupSelection;
    /**
     * The processed data that gets visualized.
     */
    private groupSelectionData;
    private angleScale;
    dataEnabled: boolean[];
    data: any[];
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
    chart: PolarChart | undefined;
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
    getDomainX(): [number, number];
    getDomainY(): [number, number];
    processData(): boolean;
    update(): void;
    getTooltipHtml(nodeDatum: GroupSelectionDatum): string;
    tooltipRenderer?: (params: PieTooltipRendererParams) => string;
    listSeriesItems(data: LegendDatum[]): void;
    toggleSeriesItem(itemId: number, enabled: boolean): void;
}
export {};
