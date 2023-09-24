import type { Selection } from '../../../scene/selection';
import type { DropShadow } from '../../../scene/dropShadow';
import type { BBox } from '../../../scene/bbox';
import type { CategoryLegendDatum } from '../../legendDatum';
import type { Path } from '../../../scene/shape/path';
import type { Marker } from '../../marker/marker';
import type { SeriesNodeDataContext } from '../series';
import { SeriesTooltip } from '../series';
import type { CartesianSeriesNodeDatum } from './cartesianSeries';
import { CartesianSeries, CartesianSeriesMarker, CartesianSeriesNodeClickEvent, CartesianSeriesNodeDoubleClickEvent } from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxisDirection';
import type { Text } from '../../../scene/shape/text';
import { Label } from '../../label';
import type { Point } from '../../../scene/point';
import type { AgCartesianSeriesTooltipRendererParams, AgCartesianSeriesLabelFormatterParams, FontStyle, FontWeight, AgTooltipRendererResult } from '../../agChartOptions';
import type { ModuleContext } from '../../../util/moduleContext';
import type { DataController } from '../../data/dataController';
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
interface MarkerSelectionDatum extends Required<CartesianSeriesNodeDatum> {
    readonly index: number;
    readonly fill?: string;
    readonly stroke?: string;
    readonly cumulativeValue: number;
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
    readonly marker: CartesianSeriesMarker;
    readonly label: AreaSeriesLabel;
    fill: string;
    stroke: string;
    fillOpacity: number;
    strokeOpacity: number;
    lineDash?: number[];
    lineDashOffset: number;
    constructor(moduleCtx: ModuleContext);
    xKey?: string;
    xName?: string;
    yKey?: string;
    yName?: string;
    normalizedTo?: number;
    strokeWidth: number;
    shadow?: DropShadow;
    protected highlightedDatum?: MarkerSelectionDatum;
    processData(dataController: DataController): Promise<void>;
    getDomain(direction: ChartAxisDirection): any[];
    createNodeData(): Promise<AreaSeriesNodeDataContext[]>;
    protected isPathOrSelectionDirty(): boolean;
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
    getLegendData(): CategoryLegendDatum[];
    animateEmptyUpdateReady({ markerSelections, labelSelections, contextData, paths, seriesRect, }: {
        markerSelections: Array<Selection<Marker, MarkerSelectionDatum>>;
        labelSelections: Array<Selection<Text, LabelSelectionDatum>>;
        contextData: Array<AreaSeriesNodeDataContext>;
        paths: Array<Array<Path>>;
        seriesRect?: BBox;
    }): void;
    animateReadyUpdate({ contextData, paths, }: {
        contextData: Array<AreaSeriesNodeDataContext>;
        paths: Array<Array<Path>>;
    }): void;
    private animateFormatter;
    protected isLabelEnabled(): boolean;
}
export {};
//# sourceMappingURL=areaSeries.d.ts.map