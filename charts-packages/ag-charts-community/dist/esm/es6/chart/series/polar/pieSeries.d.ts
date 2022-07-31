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
}
export interface PieTooltipRendererParams extends PolarTooltipRendererParams {
    readonly labelKey?: string;
    readonly labelName?: string;
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
declare class PieSeriesLabel extends Label {
    offset: number;
    minAngle: number;
    formatter?: (params: {
        value: any;
    }) => string;
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
export declare class PieSeries extends PolarSeries<PieNodeDatum> {
    static className: string;
    static type: "pie";
    private radiusScale;
    private groupSelection;
    private highlightSelection;
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
    readonly callout: PieSeriesCallout;
    tooltip: PieSeriesTooltip;
    set data(input: any[] | undefined);
    get data(): any[] | undefined;
    /**
     * The key of the numeric field to use to determine the angle (for example,
     * a pie slice angle).
     */
    angleKey: string;
    angleName: string;
    /**
     * The key of the numeric field to use to determine the radii of pie slices.
     * The largest value will correspond to the full radius and smaller values to
     * proportionally smaller radii.
     */
    radiusKey?: string;
    radiusName?: string;
    radiusMin?: number;
    radiusMax?: number;
    labelKey?: string;
    labelName?: string;
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
    innerRadiusOffset: number;
    strokeWidth: number;
    shadow?: DropShadow;
    readonly highlightStyle: PieHighlightStyle;
    visibleChanged(): void;
    private processSeriesItemEnabled;
    setColors(fills: string[], strokes: string[]): void;
    getDomain(direction: ChartAxisDirection): any[];
    processData(): boolean;
    createNodeData(): never[];
    update(): void;
    private updateSelections;
    private updateGroupSelection;
    private updateNodes;
    fireNodeClickEvent(event: MouseEvent, datum: PieNodeDatum): void;
    getTooltipHtml(nodeDatum: PieNodeDatum): string;
    listSeriesItems(legendData: LegendDatum[]): void;
    toggleSeriesItem(itemId: number, enabled: boolean): void;
}
export {};
