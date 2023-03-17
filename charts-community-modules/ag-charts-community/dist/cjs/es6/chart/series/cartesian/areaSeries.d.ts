import { Selection } from '../../../scene/selection';
import { DropShadow } from '../../../scene/dropShadow';
import { SeriesNodeDatum, SeriesTooltip, SeriesNodeDataContext } from '../series';
import { LegendDatum } from '../../legendDatum';
import { Path } from '../../../scene/shape/path';
import { Marker } from '../../marker/marker';
import { CartesianSeries, CartesianSeriesMarker, CartesianSeriesNodeClickEvent, CartesianSeriesNodeDoubleClickEvent } from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxisDirection';
import { Text } from '../../../scene/shape/text';
import { Label } from '../../label';
import { Point } from '../../../scene/point';
import { AgCartesianSeriesTooltipRendererParams, AgCartesianSeriesLabelFormatterParams, FontStyle, FontWeight, AgTooltipRendererResult } from '../../agChartOptions';
interface FillSelectionDatum {
    readonly itemId: string;
    readonly points: {
        x: number;
        y: number;
    }[];
}
interface StrokeSelectionDatum extends FillSelectionDatum {
    readonly yValues: (number | undefined)[];
}
interface MarkerSelectionDatum extends Required<SeriesNodeDatum> {
    readonly index: number;
    readonly fill?: string;
    readonly stroke?: string;
    readonly yKey: string;
    readonly yValue: number;
}
interface LabelSelectionDatum {
    readonly index: number;
    readonly itemId: any;
    readonly point: Readonly<Point>;
    readonly label?: {
        readonly text: string;
        readonly fontStyle?: FontStyle;
        readonly fontWeight?: FontWeight;
        readonly fontSize: number;
        readonly fontFamily: string;
        readonly textAlign: CanvasTextAlign;
        readonly textBaseline: CanvasTextBaseline;
        readonly fill: string;
    };
}
declare class AreaSeriesLabel extends Label {
    formatter?: (params: AgCartesianSeriesLabelFormatterParams) => string;
}
declare class AreaSeriesTooltip extends SeriesTooltip {
    renderer?: (params: AgCartesianSeriesTooltipRendererParams) => string | AgTooltipRendererResult;
    format?: string;
}
declare type AreaSeriesNodeDataContext = SeriesNodeDataContext<MarkerSelectionDatum, LabelSelectionDatum> & {
    fillSelectionData: FillSelectionDatum;
    strokeSelectionData: StrokeSelectionDatum;
};
export declare class AreaSeries extends CartesianSeries<AreaSeriesNodeDataContext> {
    static className: string;
    static type: "area";
    tooltip: AreaSeriesTooltip;
    private xData;
    private yData;
    private yDomain;
    private xDomain;
    readonly marker: CartesianSeriesMarker;
    readonly label: AreaSeriesLabel;
    fills: string[];
    strokes: string[];
    fillOpacity: number;
    strokeOpacity: number;
    lineDash?: number[];
    lineDashOffset: number;
    constructor();
    protected _xKey: string;
    set xKey(value: string);
    get xKey(): string;
    xName: string;
    protected _yKeys: string[];
    set yKeys(values: string[]);
    get yKeys(): string[];
    protected _visibles: boolean[];
    set visibles(visibles: boolean[]);
    get visibles(): boolean[];
    private processSeriesItemEnabled;
    yNames: string[];
    private _normalizedTo?;
    set normalizedTo(value: number | undefined);
    get normalizedTo(): number | undefined;
    strokeWidth: number;
    shadow?: DropShadow;
    protected highlightedDatum?: MarkerSelectionDatum;
    processData(): Promise<void>;
    getDomain(direction: ChartAxisDirection): any[];
    createNodeData(): Promise<AreaSeriesNodeDataContext[]>;
    protected isPathOrSelectionDirty(): boolean;
    protected updatePaths(opts: {
        seriesHighlighted?: boolean;
        contextData: AreaSeriesNodeDataContext;
        paths: Path[];
    }): Promise<void>;
    protected updatePathNodes(opts: {
        seriesHighlighted?: boolean;
        itemId?: string;
        paths: Path[];
        seriesIdx: number;
    }): Promise<void>;
    protected markerFactory(): Marker;
    protected updateMarkerSelection(opts: {
        nodeData: MarkerSelectionDatum[];
        markerSelection: Selection<Marker, MarkerSelectionDatum>;
    }): Promise<Selection<Marker, MarkerSelectionDatum>>;
    protected updateMarkerNodes(opts: {
        markerSelection: Selection<Marker, MarkerSelectionDatum>;
        isHighlight: boolean;
    }): Promise<void>;
    protected updateLabelSelection(opts: {
        labelData: LabelSelectionDatum[];
        labelSelection: Selection<Text, LabelSelectionDatum>;
    }): Promise<Selection<Text, LabelSelectionDatum>>;
    protected updateLabelNodes(opts: {
        labelSelection: Selection<Text, LabelSelectionDatum>;
    }): Promise<void>;
    protected getNodeClickEvent(event: MouseEvent, datum: MarkerSelectionDatum): CartesianSeriesNodeClickEvent<any>;
    protected getNodeDoubleClickEvent(event: MouseEvent, datum: MarkerSelectionDatum): CartesianSeriesNodeDoubleClickEvent<any>;
    getTooltipHtml(nodeDatum: MarkerSelectionDatum): string;
    getLegendData(): LegendDatum[];
    protected isLabelEnabled(): boolean;
}
export {};
