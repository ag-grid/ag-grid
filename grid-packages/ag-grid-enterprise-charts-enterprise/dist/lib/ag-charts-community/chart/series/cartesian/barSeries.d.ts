import type { ModuleContext } from '../../../module/moduleContext';
import type { FontStyle, FontWeight } from '../../../options/agChartOptions';
import { BBox } from '../../../scene/bbox';
import type { Point } from '../../../scene/point';
import type { Selection } from '../../../scene/selection';
import { Rect } from '../../../scene/shape/rect';
import type { Text } from '../../../scene/shape/text';
import { ChartAxisDirection } from '../../chartAxisDirection';
import type { DataController } from '../../data/dataController';
import type { CategoryLegendDatum, ChartLegendType } from '../../legendDatum';
import type { ErrorBoundSeriesNodeDatum } from '../seriesTypes';
import { AbstractBarSeries } from './abstractBarSeries';
import { BarSeriesProperties } from './barSeriesProperties';
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
    readonly fill: string | undefined;
    readonly stroke: string | undefined;
    readonly opacity: number | undefined;
    readonly strokeWidth: number;
    readonly cornerRadius: number;
    readonly topLeftCornerRadius: boolean;
    readonly topRightCornerRadius: boolean;
    readonly bottomRightCornerRadius: boolean;
    readonly bottomLeftCornerRadius: boolean;
    readonly cornerRadiusBbox: BBox | undefined;
    readonly label?: BarNodeLabelDatum;
}
type BarAnimationData = CartesianAnimationData<Rect, BarNodeDatum>;
export declare class BarSeries extends AbstractBarSeries<Rect, BarNodeDatum> {
    static className: string;
    static type: "bar";
    properties: BarSeriesProperties;
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
