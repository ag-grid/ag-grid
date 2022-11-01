import { DropShadow } from '../../../scene/dropShadow';
import { PolarTooltipRendererParams, SeriesNodeDatum, HighlightStyle, SeriesTooltip, SeriesNodeClickEvent } from './../series';
import { Label } from '../../label';
import { LegendDatum } from '../../legend';
import { Caption } from '../../../caption';
import { Observable } from '../../../util/observable';
import { PolarSeries } from './polarSeries';
import { ChartAxisDirection } from '../../chartAxis';
import { TooltipRendererResult } from '../../tooltip/tooltip';
export declare class PieSeriesNodeClickEvent extends SeriesNodeClickEvent<any> {
    readonly angleKey: string;
    readonly labelKey?: string;
    readonly calloutLabelKey?: string;
    readonly sectorLabelKey?: string;
    readonly radiusKey?: string;
    constructor(angleKey: string, calloutLabelKey: string | undefined, sectorLabelKey: string | undefined, radiusKey: string | undefined, nativeEvent: MouseEvent, datum: PieNodeDatum, series: PieSeries);
}
interface PieNodeDatum extends SeriesNodeDatum {
    readonly index: number;
    readonly radius: number;
    readonly startAngle: number;
    readonly endAngle: number;
    readonly midAngle: number;
    readonly midCos: number;
    readonly midSin: number;
    readonly calloutLabel?: {
        readonly text: string;
        readonly textAlign: CanvasTextAlign;
        readonly textBaseline: CanvasTextBaseline;
    };
    readonly sectorLabel?: {
        readonly text: string;
    };
    readonly sectorFormat: PieSeriesFormat;
}
export interface PieTooltipRendererParams extends PolarTooltipRendererParams {
    /** @deprecated Use calloutLabelKey or sectorLabelKey */
    readonly labelKey?: string;
    /** @deprecated Use calloutLabelName or sectorLabelName */
    readonly labelName?: string;
    readonly calloutLabelKey?: string;
    readonly calloutLabelName?: string;
    readonly sectorLabelKey?: string;
    readonly sectorLabelName?: string;
}
declare class PieHighlightStyle extends HighlightStyle {
    centerOffset?: number;
}
export interface PieSeriesFormatterParams {
    readonly datum: any;
    readonly fill?: string;
    readonly stroke?: string;
    readonly strokeWidth: number;
    readonly highlighted: boolean;
    readonly angleKey: string;
    readonly radiusKey?: string;
    readonly seriesId: string;
}
export interface PieSeriesFormat {
    fill?: string;
    fillOpacity?: number;
    stroke?: string;
    strokeWidth?: number;
}
interface PieSeriesLabelFormatterParams {
    readonly datum: any;
    /** @deprecated Use calloutLabelKey or sectorLabelKey */
    readonly labelKey?: string;
    /** @deprecated Use calloutLabelValue or sectorLabelValue */
    readonly labelValue?: string;
    /** @deprecated Use calloutLabelName or sectorLabelName */
    readonly labelName?: string;
    readonly calloutLabelKey?: string;
    readonly calloutLabelValue?: string;
    readonly calloutLabelName?: string;
    readonly sectorLabelKey?: string;
    readonly sectorLabelValue?: string;
    readonly sectorLabelName?: string;
    readonly angleKey: string;
    readonly angleValue?: any;
    readonly angleName?: string;
    readonly radiusKey?: string;
    readonly radiusValue?: any;
    readonly radiusName?: string;
    readonly value?: any;
    readonly seriesId: string;
}
declare class PieSeriesCalloutLabel extends Label {
    offset: number;
    minAngle: number;
    formatter?: (params: PieSeriesLabelFormatterParams) => string;
}
declare class PieSeriesSectorLabel extends Label {
    positionOffset: number;
    positionRatio: number;
    formatter?: (params: PieSeriesLabelFormatterParams) => string;
}
declare class PieSeriesCalloutLine extends Observable {
    colors: string[];
    length: number;
    strokeWidth: number;
}
export declare class PieSeriesTooltip extends SeriesTooltip {
    renderer?: (params: PieTooltipRendererParams) => string | TooltipRendererResult;
}
export declare class PieTitle extends Caption {
    showInLegend: boolean;
}
export declare class DoughnutInnerLabel extends Label {
    text: string;
    margin: number;
}
export declare class DoughnutInnerCircle {
    fill: string;
    fillOpacity?: number | undefined;
}
export declare class PieSeries extends PolarSeries<PieNodeDatum> {
    static className: string;
    static type: "pie";
    private radiusScale;
    private groupSelection;
    private highlightSelection;
    private calloutSelection;
    private sectorLabelSelection;
    private innerLabelsSelection;
    /**
     * The processed data that gets visualized.
     */
    private groupSelectionData;
    private sectorFormatData;
    private angleScale;
    seriesItemEnabled: boolean[];
    private _title?;
    set title(value: PieTitle | undefined);
    get title(): PieTitle | undefined;
    calloutLabel: PieSeriesCalloutLabel;
    label: PieSeriesCalloutLabel;
    readonly sectorLabel: PieSeriesSectorLabel;
    calloutLine: PieSeriesCalloutLine;
    callout: PieSeriesCalloutLine;
    tooltip: PieSeriesTooltip;
    set data(input: any[] | undefined);
    get data(): any[] | undefined;
    /**
     * The key of the numeric field to use to determine the angle (for example,
     * a pie sector angle).
     */
    angleKey: string;
    angleName: string;
    readonly innerLabels: DoughnutInnerLabel[];
    private _innerCircleConfig?;
    private _innerCircleNode?;
    get innerCircle(): DoughnutInnerCircle | undefined;
    set innerCircle(value: DoughnutInnerCircle | undefined);
    /**
     * The key of the numeric field to use to determine the radii of pie sectors.
     * The largest value will correspond to the full radius and smaller values to
     * proportionally smaller radii.
     */
    radiusKey?: string;
    radiusName?: string;
    radiusMin?: number;
    radiusMax?: number;
    calloutLabelKey?: string;
    calloutLabelName?: string;
    labelKey?: string;
    labelName?: string;
    sectorLabelKey?: string;
    sectorLabelName?: string;
    fills: string[];
    strokes: string[];
    fillOpacity: number;
    strokeOpacity: number;
    lineDash?: number[];
    lineDashOffset: number;
    formatter?: (params: PieSeriesFormatterParams) => PieSeriesFormat;
    /**
     * The series rotation in degrees.
     */
    rotation: number;
    outerRadiusOffset: number;
    outerRadiusRatio: number;
    innerRadiusOffset: number;
    innerRadiusRatio: number;
    strokeWidth: number;
    shadow?: DropShadow;
    readonly highlightStyle: PieHighlightStyle;
    constructor();
    visibleChanged(): void;
    private processSeriesItemEnabled;
    setColors(fills: string[], strokes: string[]): void;
    getDomain(direction: ChartAxisDirection): any[];
    processData(): Promise<void>;
    private getSectorFormat;
    createNodeData(): Promise<never[]>;
    private getInnerRadius;
    private getOuterRadius;
    update(): Promise<void>;
    private updateSelections;
    private updateGroupSelection;
    private datumSectorRefs;
    private updateNodes;
    private updateSectorLabelNodes;
    private updateInnerCircle;
    private updateInnerLabelNodes;
    protected getNodeClickEvent(event: MouseEvent, datum: PieNodeDatum): PieSeriesNodeClickEvent;
    getTooltipHtml(nodeDatum: PieNodeDatum): string;
    getLegendData(): LegendDatum[];
    toggleSeriesItem(itemId: number, enabled: boolean): void;
}
export {};
