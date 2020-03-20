import { DropShadow } from "../../../scene/dropShadow";
import { PolarTooltipRendererParams, SeriesNodeDatum } from "./../series";
import { Label } from "../../label";
import { LegendDatum } from "../../legend";
import { Caption } from "../../../caption";
import { Shape } from "../../../scene/shape/shape";
import { Observable } from "../../../util/observable";
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
declare class PieSeriesCallout extends Observable {
    colors: string[];
    length: number;
    strokeWidth: number;
}
export declare class PieSeries extends PolarSeries {
    static className: string;
    static type: string;
    private radiusScale;
    private groupSelection;
    /**
     * The processed data that gets visualized.
     */
    private groupSelectionData;
    private angleScale;
    seriesItemEnabled: boolean[];
    private _title?;
    set title(value: Caption | undefined);
    get title(): Caption | undefined;
    readonly label: PieSeriesLabel;
    readonly callout: PieSeriesCallout;
    constructor();
    /**
     * The key of the numeric field to use to determine the angle (for example,
     * a pie slice angle).
     */
    angleKey: string;
    angleName: string;
    /**
     * The key of the numeric field to use to determine the radii of pie slices.
     * The largest value will correspond to the full radius and smaller values to
     * proportionally smaller radii. To prevent confusing visuals, this config only works
     * if {@link innerRadiusOffset} is zero.
     */
    radiusKey?: string;
    radiusName?: string;
    labelKey?: string;
    labelName?: string;
    private _fills;
    set fills(values: string[]);
    get fills(): string[];
    private _strokes;
    set strokes(values: string[]);
    get strokes(): string[];
    fillOpacity: number;
    strokeOpacity: number;
    /**
     * The series rotation in degrees.
     */
    rotation: number;
    outerRadiusOffset: number;
    innerRadiusOffset: number;
    strokeWidth: number;
    shadow?: DropShadow;
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
    listSeriesItems(legendData: LegendDatum[]): void;
    toggleSeriesItem(itemId: number, enabled: boolean): void;
}
export {};
