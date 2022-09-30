import { Group } from '../../../scene/group';
import { Selection } from '../../../scene/selection';
import { DropShadow } from '../../../scene/dropShadow';
import { SeriesNodeDatum, CartesianTooltipRendererParams as AreaTooltipRendererParams, SeriesTooltip, SeriesNodeDataContext } from '../series';
import { LegendDatum } from '../../legend';
import { Path } from '../../../scene/shape/path';
import { Marker } from '../../marker/marker';
import { CartesianSeries, CartesianSeriesMarker } from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxis';
import { TooltipRendererResult } from '../../chart';
import { TypedEvent } from '../../../util/observable';
import { Text, FontStyle, FontWeight } from '../../../scene/shape/text';
import { Label } from '../../label';
import { Point } from '../../../scene/point';
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
export interface AreaSeriesNodeClickEvent extends TypedEvent {
    readonly type: 'nodeClick';
    readonly event: MouseEvent;
    readonly series: AreaSeries;
    readonly datum: any;
    readonly xKey: string;
    readonly yKey: string;
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
export { AreaTooltipRendererParams };
declare class AreaSeriesLabel extends Label {
    formatter?: (params: {
        value: any;
    }) => string;
}
export declare class AreaSeriesTooltip extends SeriesTooltip {
    renderer?: (params: AreaTooltipRendererParams) => string | TooltipRendererResult;
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
    directionKeys: {
        x: string[];
        y: string[];
    };
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
    setColors(fills: string[], strokes: string[]): void;
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
    protected updateMarkerSelection(opts: {
        nodeData: MarkerSelectionDatum[];
        markerSelection: Selection<Marker, Group, MarkerSelectionDatum, any>;
    }): Promise<Selection<Marker, Group, MarkerSelectionDatum, any>>;
    protected updateMarkerNodes(opts: {
        markerSelection: Selection<Marker, Group, MarkerSelectionDatum, any>;
        isHighlight: boolean;
    }): Promise<void>;
    protected updateLabelSelection(opts: {
        labelData: LabelSelectionDatum[];
        labelSelection: Selection<Text, Group, LabelSelectionDatum, any>;
    }): Promise<Selection<Text, Group, LabelSelectionDatum, any>>;
    protected updateLabelNodes(opts: {
        labelSelection: Selection<Text, Group, LabelSelectionDatum, any>;
    }): Promise<void>;
    fireNodeClickEvent(event: MouseEvent, datum: MarkerSelectionDatum): void;
    getTooltipHtml(nodeDatum: MarkerSelectionDatum): string;
    listSeriesItems(legendData: LegendDatum[]): void;
    protected isLabelEnabled(): boolean;
}
