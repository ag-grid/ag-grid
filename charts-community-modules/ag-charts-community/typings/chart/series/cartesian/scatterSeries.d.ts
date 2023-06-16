import { Selection } from '../../../scene/selection';
import { SeriesTooltip, SeriesNodeDataContext } from '../series';
import { ChartLegendDatum } from '../../legendDatum';
import { ColorScale } from '../../../scale/colorScale';
import { CartesianSeries, CartesianSeriesMarker, CartesianSeriesNodeBaseClickEvent, CartesianSeriesNodeDatum } from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxisDirection';
import { Label } from '../../label';
import { Text } from '../../../scene/shape/text';
import { Marker } from '../../marker/marker';
import { MeasuredLabel, PointLabelDatum } from '../../../util/labelPlacement';
import { AgScatterSeriesLabelFormatterParams, AgScatterSeriesTooltipRendererParams, AgTooltipRendererResult, AgCartesianSeriesMarkerFormat } from '../../agChartOptions';
import { ModuleContext } from '../../../util/module';
interface ScatterNodeDatum extends Required<CartesianSeriesNodeDatum> {
    readonly label: MeasuredLabel;
    readonly fill: string | undefined;
}
declare class ScatterSeriesLabel extends Label {
    formatter?: (params: AgScatterSeriesLabelFormatterParams<any>) => string;
}
declare class ScatterSeriesNodeBaseClickEvent extends CartesianSeriesNodeBaseClickEvent<any> {
    readonly sizeKey?: string;
    constructor(sizeKey: string | undefined, xKey: string, yKey: string, nativeEvent: MouseEvent, datum: ScatterNodeDatum, series: ScatterSeries);
}
declare class ScatterSeriesNodeClickEvent extends ScatterSeriesNodeBaseClickEvent {
    readonly type = "nodeClick";
}
declare class ScatterSeriesNodeDoubleClickEvent extends ScatterSeriesNodeBaseClickEvent {
    readonly type = "nodeDoubleClick";
}
declare class ScatterSeriesTooltip extends SeriesTooltip {
    renderer?: (params: AgScatterSeriesTooltipRendererParams) => string | AgTooltipRendererResult;
}
export declare class ScatterSeries extends CartesianSeries<SeriesNodeDataContext<ScatterNodeDatum>> {
    static className: string;
    static type: "scatter";
    private sizeScale;
    readonly marker: CartesianSeriesMarker;
    readonly label: ScatterSeriesLabel;
    title?: string;
    labelKey?: string;
    xName?: string;
    yName?: string;
    sizeName?: string;
    labelName?: string;
    xKey?: string;
    yKey?: string;
    sizeKey?: string;
    colorKey?: string;
    colorName?: string;
    colorDomain: number[] | undefined;
    colorRange: string[];
    colorScale: ColorScale;
    readonly tooltip: ScatterSeriesTooltip;
    constructor(moduleCtx: ModuleContext);
    processData(): Promise<void>;
    getDomain(direction: ChartAxisDirection): any[];
    protected getNodeClickEvent(event: MouseEvent, datum: ScatterNodeDatum): ScatterSeriesNodeClickEvent;
    protected getNodeDoubleClickEvent(event: MouseEvent, datum: ScatterNodeDatum): ScatterSeriesNodeDoubleClickEvent;
    createNodeData(): Promise<{
        itemId: string;
        nodeData: ScatterNodeDatum[];
        labelData: ScatterNodeDatum[];
    }[]>;
    protected isPathOrSelectionDirty(): boolean;
    getLabelData(): PointLabelDatum[];
    protected markerFactory(): Marker;
    protected updateMarkerSelection(opts: {
        nodeData: ScatterNodeDatum[];
        markerSelection: Selection<Marker, ScatterNodeDatum>;
    }): Promise<Selection<Marker, ScatterNodeDatum>>;
    protected updateMarkerNodes(opts: {
        markerSelection: Selection<Marker, ScatterNodeDatum>;
        isHighlight: boolean;
    }): Promise<void>;
    protected updateLabelSelection(opts: {
        labelData: ScatterNodeDatum[];
        labelSelection: Selection<Text, ScatterNodeDatum>;
    }): Promise<Selection<Text, ScatterNodeDatum>>;
    protected updateLabelNodes(opts: {
        labelSelection: Selection<Text, ScatterNodeDatum>;
    }): Promise<void>;
    getTooltipHtml(nodeDatum: ScatterNodeDatum): string;
    getLegendData(): ChartLegendDatum[];
    animateEmptyUpdateReady({ markerSelections, labelSelections, }: {
        markerSelections: Array<Selection<Marker, ScatterNodeDatum>>;
        labelSelections: Array<Selection<Text, ScatterNodeDatum>>;
    }): void;
    animateReadyUpdate({ markerSelections }: {
        markerSelections: Array<Selection<Marker, ScatterNodeDatum>>;
    }): void;
    animateReadyHighlightMarkers(markerSelection: Selection<Marker, ScatterNodeDatum>): void;
    resetMarkers(markerSelection: Selection<Marker, ScatterNodeDatum>): void;
    animateFormatter(marker: Marker, datum: ScatterNodeDatum): AgCartesianSeriesMarkerFormat | undefined;
    protected isLabelEnabled(): boolean;
}
export {};
//# sourceMappingURL=scatterSeries.d.ts.map