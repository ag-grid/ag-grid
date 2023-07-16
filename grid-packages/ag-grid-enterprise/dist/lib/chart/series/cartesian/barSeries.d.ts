import type { Selection } from '../../../scene/selection';
import { Rect } from '../../../scene/shape/rect';
import type { Text } from '../../../scene/shape/text';
import type { DropShadow } from '../../../scene/dropShadow';
import type { SeriesNodeDataContext } from '../series';
import { SeriesTooltip } from '../series';
import { Label } from '../../label';
import type { ChartLegendDatum } from '../../legendDatum';
import type { CartesianSeriesNodeDatum } from './cartesianSeries';
import { CartesianSeries, CartesianSeriesNodeClickEvent, CartesianSeriesNodeDoubleClickEvent } from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxisDirection';
import type { Point } from '../../../scene/point';
import type { AgCartesianSeriesLabelFormatterParams, AgTooltipRendererResult, AgBarSeriesFormatterParams, AgBarSeriesTooltipRendererParams, AgBarSeriesFormat, AgBarSeriesLabelPlacement, FontStyle, FontWeight } from '../../agChartOptions';
import type { ModuleContext } from '../../../util/moduleContext';
import type { DataController } from '../../data/dataController';
interface BarNodeLabelDatum extends Readonly<Point> {
    readonly text: string;
    readonly fontStyle?: FontStyle;
    readonly fontWeight?: FontWeight;
    readonly fontSize: number;
    readonly fontFamily: string;
    readonly textAlign: CanvasTextAlign;
    readonly textBaseline: CanvasTextBaseline;
    readonly fill: string;
}
interface BarNodeDatum extends CartesianSeriesNodeDatum, Readonly<Point> {
    readonly index: number;
    readonly xValue: number;
    readonly yValue: number;
    readonly cumulativeValue: number;
    readonly width: number;
    readonly height: number;
    readonly fill?: string;
    readonly stroke?: string;
    readonly strokeWidth: number;
    readonly label?: BarNodeLabelDatum;
}
declare class BarSeriesLabel extends Label {
    formatter?: (params: AgCartesianSeriesLabelFormatterParams) => string;
    placement: AgBarSeriesLabelPlacement;
}
declare class BarSeriesTooltip extends SeriesTooltip {
    renderer?: (params: AgBarSeriesTooltipRendererParams) => string | AgTooltipRendererResult;
}
export declare class BarSeries extends CartesianSeries<SeriesNodeDataContext<BarNodeDatum>, Rect> {
    static className: string;
    static type: 'bar' | 'column';
    readonly label: BarSeriesLabel;
    tooltip: BarSeriesTooltip;
    fill: string;
    stroke: string;
    fillOpacity: number;
    strokeOpacity: number;
    lineDash?: number[];
    lineDashOffset: number;
    formatter?: (params: AgBarSeriesFormatterParams<any>) => AgBarSeriesFormat;
    xKey?: string;
    xName?: string;
    yKey?: string;
    yName?: string;
    constructor(moduleCtx: ModuleContext);
    /**
     * Used to get the position of bars within each group.
     */
    private groupScale;
    protected resolveKeyDirection(direction: ChartAxisDirection): ChartAxisDirection;
    stackGroup?: string;
    normalizedTo?: number;
    strokeWidth: number;
    shadow?: DropShadow;
    protected smallestDataInterval?: {
        x: number;
        y: number;
    };
    processData(dataController: DataController): Promise<void>;
    getDomain(direction: ChartAxisDirection): any[];
    protected getNodeClickEvent(event: MouseEvent, datum: BarNodeDatum): CartesianSeriesNodeClickEvent<any>;
    protected getNodeDoubleClickEvent(event: MouseEvent, datum: BarNodeDatum): CartesianSeriesNodeDoubleClickEvent<any>;
    private getCategoryAxis;
    private getValueAxis;
    private calculateStep;
    createNodeData(): Promise<SeriesNodeDataContext<BarNodeDatum, BarNodeDatum>[]>;
    protected nodeFactory(): Rect;
    datumSelectionGarbageCollection: boolean;
    protected updateDatumSelection(opts: {
        nodeData: BarNodeDatum[];
        datumSelection: Selection<Rect, BarNodeDatum>;
    }): Promise<Selection<Rect, BarNodeDatum>>;
    protected updateDatumNodes(opts: {
        datumSelection: Selection<Rect, BarNodeDatum>;
        isHighlight: boolean;
    }): Promise<void>;
    protected updateLabelSelection(opts: {
        labelData: BarNodeDatum[];
        labelSelection: Selection<Text, BarNodeDatum>;
    }): Promise<Selection<Text, BarNodeDatum>>;
    protected updateLabelNodes(opts: {
        labelSelection: Selection<Text, BarNodeDatum>;
    }): Promise<void>;
    getTooltipHtml(nodeDatum: BarNodeDatum): string;
    getLegendData(): ChartLegendDatum[];
    animateEmptyUpdateReady({ datumSelections, labelSelections, }: {
        datumSelections: Array<Selection<Rect, BarNodeDatum>>;
        labelSelections: Array<Selection<Text, BarNodeDatum>>;
    }): void;
    animateReadyHighlight(highlightSelection: Selection<Rect, BarNodeDatum>): void;
    animateReadyResize({ datumSelections }: {
        datumSelections: Array<Selection<Rect, BarNodeDatum>>;
    }): void;
    animateWaitingUpdateReady({ datumSelections, labelSelections, }: {
        datumSelections: Array<Selection<Rect, BarNodeDatum>>;
        labelSelections: Array<Selection<Text, BarNodeDatum>>;
    }): void;
    resetSelectionRects(selection: Selection<Rect, BarNodeDatum>): void;
    protected getDirectionStartingValues(datumSelections: Array<Selection<Rect, BarNodeDatum>>): {
        startingX: number;
        startingY: number;
    };
    protected isLabelEnabled(): boolean;
    getBandScalePadding(): {
        inner: number;
        outer: number;
    };
    protected getBarDirection(): ChartAxisDirection;
    protected getCategoryDirection(): ChartAxisDirection;
}
export declare class ColumnSeries extends BarSeries {
    static type: "column";
    static className: string;
    protected getBarDirection(): ChartAxisDirection;
    protected getCategoryDirection(): ChartAxisDirection;
}
export {};
//# sourceMappingURL=barSeries.d.ts.map