import { Path } from '../../../scene/shape/path';
import { Selection } from '../../../scene/selection';
import { Group } from '../../../scene/group';
import { SeriesNodeDatum, CartesianTooltipRendererParams, SeriesTooltip, SeriesNodeDataContext } from '../series';
import { Text, FontStyle, FontWeight } from '../../../scene/shape/text';
import { LegendDatum } from '../../legend';
import { CartesianSeries, CartesianSeriesMarker } from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxis';
import { TypedEvent } from '../../../util/observable';
import { TooltipRendererResult } from '../../chart';
import { Label } from '../../label';
import { Marker } from '../../marker/marker';
interface LineNodeDatum extends SeriesNodeDatum {
    readonly point: SeriesNodeDatum['point'] & {
        readonly moveTo: boolean;
    };
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
export interface LineSeriesNodeClickEvent extends TypedEvent {
    readonly type: 'nodeClick';
    readonly event: MouseEvent;
    readonly series: LineSeries;
    readonly datum: any;
    readonly xKey: string;
    readonly yKey: string;
}
export declare type LineTooltipRendererParams = CartesianTooltipRendererParams;
declare class LineSeriesLabel extends Label {
    formatter?: (params: {
        value: any;
    }) => string;
}
export declare class LineSeriesTooltip extends SeriesTooltip {
    renderer?: (params: LineTooltipRendererParams) => string | TooltipRendererResult;
    format?: string;
}
declare type LineContext = SeriesNodeDataContext<LineNodeDatum>;
export declare class LineSeries extends CartesianSeries<LineContext> {
    static className: string;
    static type: "line";
    private xDomain;
    private yDomain;
    private xData;
    private yData;
    readonly marker: CartesianSeriesMarker;
    readonly label: LineSeriesLabel;
    title?: string;
    stroke?: string;
    lineDash?: number[];
    lineDashOffset: number;
    strokeWidth: number;
    strokeOpacity: number;
    tooltip: LineSeriesTooltip;
    constructor();
    setColors(fills: string[], strokes: string[]): void;
    protected _xKey: string;
    set xKey(value: string);
    get xKey(): string;
    xName: string;
    protected _yKey: string;
    set yKey(value: string);
    get yKey(): string;
    yName: string;
    getDomain(direction: ChartAxisDirection): any[];
    processData(): Promise<void>;
    createNodeData(): Promise<{
        itemId: string;
        nodeData: LineNodeDatum[];
        labelData: LineNodeDatum[];
    }[]>;
    protected isPathOrSelectionDirty(): boolean;
    protected updatePaths(opts: {
        seriesHighlighted?: boolean;
        contextData: LineContext;
        paths: Path[];
    }): Promise<void>;
    protected updatePathNodes(opts: {
        seriesHighlighted?: boolean;
        paths: Path[];
    }): Promise<void>;
    protected updateMarkerSelection(opts: {
        nodeData: LineNodeDatum[];
        markerSelection: Selection<Marker, Group, LineNodeDatum, any>;
    }): Promise<Selection<Marker, Group, LineNodeDatum, any>>;
    protected updateMarkerNodes(opts: {
        markerSelection: Selection<Marker, Group, LineNodeDatum, any>;
        isHighlight: boolean;
    }): Promise<void>;
    protected updateLabelSelection(opts: {
        labelData: LineNodeDatum[];
        labelSelection: Selection<Text, Group, LineNodeDatum, any>;
    }): Promise<Selection<Text, Group, LineNodeDatum, any>>;
    protected updateLabelNodes(opts: {
        labelSelection: Selection<Text, Group, LineNodeDatum, any>;
    }): Promise<void>;
    fireNodeClickEvent(event: MouseEvent, datum: LineNodeDatum): void;
    getTooltipHtml(nodeDatum: LineNodeDatum): string;
    listSeriesItems(legendData: LegendDatum[]): void;
    protected isLabelEnabled(): boolean;
}
export {};
