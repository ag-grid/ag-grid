import type { Path } from '../../../scene/shape/path';
import type { Selection } from '../../../scene/selection';
import type { SeriesNodeDatum, SeriesNodeDataContext } from '../series';
import { SeriesTooltip } from '../series';
import type { Text } from '../../../scene/shape/text';
import type { ChartLegendDatum } from '../../legendDatum';
import type { CartesianSeriesNodeDatum } from './cartesianSeries';
import { CartesianSeries, CartesianSeriesMarker, CartesianSeriesNodeClickEvent, CartesianSeriesNodeDoubleClickEvent } from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxisDirection';
import { Label } from '../../label';
import type { Marker } from '../../marker/marker';
import type { AgCartesianSeriesLabelFormatterParams, AgCartesianSeriesTooltipRendererParams, AgTooltipRendererResult, FontStyle, FontWeight } from '../../agChartOptions';
import type { ModuleContext } from '../../../util/moduleContext';
import type { DataController } from '../../data/dataController';
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
    processData(dataController: DataController): Promise<void>;
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
    animateEmptyUpdateReady({ markerSelections, labelSelections, contextData, paths, }: {
        markerSelections: Array<Selection<Marker, LineNodeDatum>>;
        labelSelections: Array<Selection<Text, LineNodeDatum>>;
        contextData: Array<LineContext>;
        paths: Array<Array<Path>>;
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