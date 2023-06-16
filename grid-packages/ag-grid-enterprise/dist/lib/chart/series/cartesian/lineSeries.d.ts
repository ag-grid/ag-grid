import { Path } from '../../../scene/shape/path';
import { Selection } from '../../../scene/selection';
import { SeriesNodeDatum, SeriesTooltip, SeriesNodeDataContext } from '../series';
import { BBox } from '../../../scene/bbox';
import { Text } from '../../../scene/shape/text';
import { ChartLegendDatum } from '../../legendDatum';
import { CartesianSeries, CartesianSeriesMarker, CartesianSeriesNodeClickEvent, CartesianSeriesNodeDatum, CartesianSeriesNodeDoubleClickEvent } from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxisDirection';
import { Label } from '../../label';
import { Marker } from '../../marker/marker';
import { AgCartesianSeriesLabelFormatterParams, AgCartesianSeriesTooltipRendererParams, AgTooltipRendererResult, FontStyle, FontWeight } from '../../agChartOptions';
import { ModuleContext } from '../../../util/module';
interface LineNodeDatum extends CartesianSeriesNodeDatum {
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
    readonly marker: CartesianSeriesMarker;
    readonly label: LineSeriesLabel;
    title?: string;
    stroke?: string;
    lineDash?: number[];
    lineDashOffset: number;
    strokeWidth: number;
    strokeOpacity: number;
    tooltip: LineSeriesTooltip;
    constructor(moduleCtx: ModuleContext);
    xKey?: string;
    xName?: string;
    yKey?: string;
    yName?: string;
    processData(): Promise<void>;
    getDomain(direction: ChartAxisDirection): any[];
    createNodeData(): Promise<{
        itemId: string;
        nodeData: LineNodeDatum[];
        labelData: LineNodeDatum[];
    }[]>;
    protected isPathOrSelectionDirty(): boolean;
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
    getLegendData(): ChartLegendDatum[];
    animateEmptyUpdateReady({ markerSelections, labelSelections, contextData, paths, seriesRect, }: {
        markerSelections: Array<Selection<Marker, LineNodeDatum>>;
        labelSelections: Array<Selection<Text, LineNodeDatum>>;
        contextData: Array<LineContext>;
        paths: Array<Array<Path>>;
        seriesRect?: BBox;
    }): void;
    animateReadyUpdate(data: {
        markerSelections: Array<Selection<Marker, LineNodeDatum>>;
        contextData: Array<LineContext>;
        paths: Array<Array<Path>>;
    }): void;
    animateReadyResize(data: {
        markerSelections: Array<Selection<Marker, LineNodeDatum>>;
        contextData: Array<LineContext>;
        paths: Array<Array<Path>>;
    }): void;
    resetMarkersAndPaths({ markerSelections, contextData, paths, }: {
        markerSelections: Array<Selection<Marker, LineNodeDatum>>;
        contextData: Array<LineContext>;
        paths: Array<Array<Path>>;
    }): void;
    private animateFormatter;
    protected isLabelEnabled(): boolean;
}
export {};
//# sourceMappingURL=lineSeries.d.ts.map