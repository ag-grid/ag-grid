import { DropShadow } from '../../../scene/dropShadow';
import { PolarTooltipRendererParams, SeriesNodeDatum, HighlightStyle, SeriesTooltip } from './../series';
import { Label } from '../../label';
import { LegendDatum } from '../../legend';
import { Caption } from '../../../caption';
import { Observable, TypedEvent } from '../../../util/observable';
import { PolarSeries } from './polarSeries';
import { ChartAxisDirection } from '../../chartAxis';
import { TooltipRendererResult } from '../../chart';
export interface PieSeriesNodeClickEvent extends TypedEvent {
    readonly type: 'nodeClick';
    readonly event: MouseEvent;
    readonly series: PieSeries;
    readonly datum: any;
    readonly angleKey: string;
    readonly labelKey?: string;
    readonly sectorLabelKey?: string;
    readonly radiusKey?: string;
}
interface PieNodeDatum extends SeriesNodeDatum {
    readonly index: number;
    readonly radius: number;
    readonly startAngle: number;
    readonly endAngle: number;
    readonly midAngle: number;
    readonly midCos: number;
    readonly midSin: number;
    readonly label?: {
        readonly text: string;
        readonly textAlign: CanvasTextAlign;
        readonly textBaseline: CanvasTextBaseline;
    };
    readonly sectorLabel?: {
        readonly text: string;
    };
}
export interface PieTooltipRendererParams extends PolarTooltipRendererParams {
    readonly labelKey?: string;
    readonly labelName?: string;
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
}
export interface PieSeriesFormat {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}
interface PieSeriesLabelFormatterParams {
    readonly datum: any;
    readonly labelKey?: string;
    readonly labelValue?: string;
    readonly labelName?: string;
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
}
declare class PieSeriesLabel extends Label {
    offset: number;
    minAngle: number;
    formatter?: (params: PieSeriesLabelFormatterParams) => string;
}
declare class PieSeriesSectorLabel extends Label {
    positionOffset: number;
    positionRatio: number;
    formatter?: (params: PieSeriesLabelFormatterParams) => string;
}
declare class PieSeriesCallout extends Observable {
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
    private labelSelection;
    private sectorLabelSelection;
    private innerLabelsSelection;
    /**
     * The processed data that gets visualized.
     */
    private groupSelectionData;
    private angleScale;
    seriesItemEnabled: boolean[];
    private _title?;
    set title(value: PieTitle | undefined);
    get title(): PieTitle | undefined;
    readonly label: PieSeriesLabel;
    readonly sectorLabel: PieSeriesSectorLabel;
    readonly callout: PieSeriesCallout;
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
    fireNodeClickEvent(event: MouseEvent, datum: PieNodeDatum): void;
    getTooltipHtml(nodeDatum: PieNodeDatum): string;
    listSeriesItems(legendData: LegendDatum[]): void;
    toggleSeriesItem(itemId: number, enabled: boolean): void;
}
export {};
