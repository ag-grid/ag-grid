import type { ModuleContext } from '../../../module/moduleContext';
import type { AgBarSeriesFormatterParams, AgBarSeriesLabelFormatterParams, AgBarSeriesLabelPlacement, AgBarSeriesStyle, AgBarSeriesTooltipRendererParams, FontStyle, FontWeight } from '../../../options/agChartOptions';
import type { DropShadow } from '../../../scene/dropShadow';
import type { Point } from '../../../scene/point';
import type { Selection } from '../../../scene/selection';
import { Rect } from '../../../scene/shape/rect';
import type { Text } from '../../../scene/shape/text';
import { ChartAxisDirection } from '../../chartAxisDirection';
import type { DataController } from '../../data/dataController';
import { Label } from '../../label';
import type { CategoryLegendDatum, ChartLegendType } from '../../legendDatum';
import { SeriesTooltip } from '../seriesTooltip';
import type { ErrorBoundSeriesNodeDatum } from '../seriesTypes';
import { AbstractBarSeries } from './abstractBarSeries';
import type { CartesianAnimationData, CartesianSeriesNodeDataContext, CartesianSeriesNodeDatum } from './cartesianSeries';
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
interface BarNodeDatum extends CartesianSeriesNodeDatum, ErrorBoundSeriesNodeDatum, Readonly<Point> {
    readonly xValue: string | number;
    readonly yValue: string | number;
    readonly cumulativeValue: number;
    readonly width: number;
    readonly height: number;
    readonly fill?: string;
    readonly stroke?: string;
    readonly strokeWidth: number;
    readonly label?: BarNodeLabelDatum;
}
type BarAnimationData = CartesianAnimationData<Rect, BarNodeDatum>;
declare class BarSeriesLabel extends Label<AgBarSeriesLabelFormatterParams> {
    placement: AgBarSeriesLabelPlacement;
}
export declare class BarSeries extends AbstractBarSeries<Rect, BarNodeDatum> {
    static className: string;
    static type: "bar";
    readonly label: BarSeriesLabel;
    tooltip: SeriesTooltip<AgBarSeriesTooltipRendererParams<any>>;
    fill: string;
    stroke: string;
    fillOpacity: number;
    strokeOpacity: number;
    lineDash?: number[];
    lineDashOffset: number;
    formatter?: (params: AgBarSeriesFormatterParams<any>) => AgBarSeriesStyle;
    xKey?: string;
    xName?: string;
    yKey?: string;
    yName?: string;
    stackGroup?: string;
    normalizedTo?: number;
    strokeWidth: number;
    shadow?: DropShadow;
    constructor(moduleCtx: ModuleContext);
    /**
     * Used to get the position of bars within each group.
     */
    private groupScale;
    protected resolveKeyDirection(direction: ChartAxisDirection): ChartAxisDirection;
    protected smallestDataInterval?: {
        x: number;
        y: number;
    };
    processData(dataController: DataController): Promise<void>;
    getSeriesDomain(direction: ChartAxisDirection): any[];
    createNodeData(): Promise<CartesianSeriesNodeDataContext<BarNodeDatum, BarNodeDatum>[]>;
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
    getLegendData(legendType: ChartLegendType): CategoryLegendDatum[];
    animateEmptyUpdateReady({ datumSelections, labelSelections, annotationSelections }: BarAnimationData): void;
    animateWaitingUpdateReady(data: BarAnimationData): void;
    protected isLabelEnabled(): boolean;
}
export {};
