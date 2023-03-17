import { Path } from '../../../scene/shape/path';
import { Selection } from '../../../scene/selection';
import { SeriesNodeDatum, SeriesTooltip, SeriesNodeDataContext } from '../series';
import { Text } from '../../../scene/shape/text';
import { LegendDatum } from '../../legendDatum';
import { CartesianSeries, CartesianSeriesMarker, CartesianSeriesNodeClickEvent, CartesianSeriesNodeDoubleClickEvent } from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxisDirection';
import { Label } from '../../label';
import { Marker } from '../../marker/marker';
import { AgCartesianSeriesLabelFormatterParams, AgCartesianSeriesTooltipRendererParams, AgTooltipRendererResult, FontStyle, FontWeight } from '../../agChartOptions';
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
declare class LineSeriesLabel extends Label {
    formatter?: (params: AgCartesianSeriesLabelFormatterParams) => string;
}
declare class LineSeriesTooltip extends SeriesTooltip {
    renderer?: (params: AgCartesianSeriesTooltipRendererParams) => string | AgTooltipRendererResult;
    format?: string;
}
declare type LineContext = SeriesNodeDataContext<LineNodeDatum>;
export declare class LineSeries extends CartesianSeries<LineContext> {
    static className: string;
    static type: "line";
    private xDomain;
    private yDomain;
    private pointsData;
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
    protected markerFactory(): Marker;
    protected updateMarkerSelection(opts: {
        nodeData: LineNodeDatum[];
        markerSelection: Selection<Marker, LineNodeDatum>;
    }): Promise<Selection<Marker, LineNodeDatum>>;
    protected updateMarkerNodes(opts: {
        markerSelection: Selection<Marker, LineNodeDatum>;
        isHighlight: boolean;
    }): Promise<void>;
    protected updateLabelSelection(opts: {
        labelData: LineNodeDatum[];
        labelSelection: Selection<Text, LineNodeDatum>;
    }): Promise<Selection<Text, LineNodeDatum>>;
    protected updateLabelNodes(opts: {
        labelSelection: Selection<Text, LineNodeDatum>;
    }): Promise<void>;
    protected getNodeClickEvent(event: MouseEvent, datum: LineNodeDatum): CartesianSeriesNodeClickEvent<any>;
    protected getNodeDoubleClickEvent(event: MouseEvent, datum: LineNodeDatum): CartesianSeriesNodeDoubleClickEvent<any>;
    getTooltipHtml(nodeDatum: LineNodeDatum): string;
    getLegendData(): LegendDatum[];
    protected isLabelEnabled(): boolean;
}
export {};
