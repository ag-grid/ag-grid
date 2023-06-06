import { Selection } from '../../../scene/selection';
import { Rect } from '../../../scene/shape/rect';
import { Text } from '../../../scene/shape/text';
import { DropShadow } from '../../../scene/dropShadow';
import { SeriesNodeDataContext, SeriesTooltip } from '../series';
import { Label } from '../../label';
import { ChartLegendDatum } from '../../legendDatum';
import { CartesianSeries, CartesianSeriesNodeClickEvent, CartesianSeriesNodeDatum, CartesianSeriesNodeDoubleClickEvent } from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxisDirection';
import { Point } from '../../../scene/point';
import { AgCartesianSeriesLabelFormatterParams, AgTooltipRendererResult, AgBarSeriesFormatterParams, AgBarSeriesTooltipRendererParams, AgBarSeriesFormat, AgBarSeriesLabelPlacement, FontStyle, FontWeight } from '../../agChartOptions';
import { LegendItemClickChartEvent, LegendItemDoubleClickChartEvent } from '../../interaction/chartEventManager';
import { ModuleContext } from '../../../util/module';
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
    readonly yValue: number;
    readonly cumulativeValue: number;
    readonly width: number;
    readonly height: number;
    readonly fill?: string;
    readonly stroke?: string;
    readonly colorIndex: number;
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
    fills: string[];
    strokes: string[];
    fillOpacity: number;
    strokeOpacity: number;
    lineDash?: number[];
    lineDashOffset: number;
    formatter?: (params: AgBarSeriesFormatterParams<any>) => AgBarSeriesFormat;
    constructor(moduleCtx: ModuleContext);
    /**
     * Used to get the position of bars within each group.
     */
    private groupScale;
    protected resolveKeyDirection(direction: ChartAxisDirection): ChartAxisDirection;
    xKey?: string;
    xName?: string;
    private cumYKeyCount;
    private flatYKeys;
    hideInLegend: string[];
    yKeys: string[][];
    protected yKeysCache: string[][];
    protected processYKeys(): void;
    visibles: boolean[];
    private processSeriesItemEnabled;
    grouped: boolean;
    stackGroups: Record<string, string[]>;
    protected getStackGroup(yKey: string): string | undefined;
    /**
     * A map of `yKeys` to their names (used in legends and tooltips).
     * For example, if a key is `product_name` it's name can be a more presentable `Product Name`.
     */
    yNames: {
        [key in string]: string;
    };
    protected processYNames(): void;
    legendItemNames: {
        [key in string]: string;
    };
    normalizedTo?: number;
    strokeWidth: number;
    shadow?: DropShadow;
    protected smallestDataInterval?: {
        x: number;
        y: number;
    };
    processData(): Promise<void>;
    getDomain(direction: ChartAxisDirection): any[];
    protected getNodeClickEvent(event: MouseEvent, datum: BarNodeDatum): CartesianSeriesNodeClickEvent<any>;
    protected getNodeDoubleClickEvent(event: MouseEvent, datum: BarNodeDatum): CartesianSeriesNodeDoubleClickEvent<any>;
    private getCategoryAxis;
    private getValueAxis;
    private calculateStep;
    createNodeData(): Promise<SeriesNodeDataContext<BarNodeDatum, BarNodeDatum>[]>;
    protected nodeFactory(): Rect;
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
    validateLegendData(): void;
    onLegendItemClick(event: LegendItemClickChartEvent): void;
    onLegendItemDoubleClick(event: LegendItemDoubleClickChartEvent): void;
    calculateVisibleDomain(): void;
    animateEmptyUpdateReady({ datumSelections, labelSelections, }: {
        datumSelections: Array<Selection<Rect, BarNodeDatum>>;
        labelSelections: Array<Selection<Text, BarNodeDatum>>;
    }): void;
    animateReadyUpdate({ datumSelections }: {
        datumSelections: Array<Selection<Rect, BarNodeDatum>>;
    }): void;
    animateReadyHighlight(highlightSelection: Selection<Rect, BarNodeDatum>): void;
    animateReadyResize({ datumSelections }: {
        datumSelections: Array<Selection<Rect, BarNodeDatum>>;
    }): void;
    resetSelectionRects(selection: Selection<Rect, BarNodeDatum>): void;
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
    animateEmptyUpdateReady({ datumSelections, labelSelections, }: {
        datumSelections: Array<Selection<Rect, BarNodeDatum>>;
        labelSelections: Array<Selection<Text, BarNodeDatum>>;
    }): void;
}
export {};
//# sourceMappingURL=barSeries.d.ts.map