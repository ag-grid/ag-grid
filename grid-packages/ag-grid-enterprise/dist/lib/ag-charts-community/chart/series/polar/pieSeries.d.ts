import type { ModuleContext } from '../../../module/moduleContext';
import type { AgPieSeriesFormat, AgPieSeriesFormatterParams, AgPieSeriesLabelFormatterParams, AgPieSeriesTooltipRendererParams } from '../../../options/agChartOptions';
import { BBox } from '../../../scene/bbox';
import type { DropShadow } from '../../../scene/dropShadow';
import { Group } from '../../../scene/group';
import { Sector } from '../../../scene/shape/sector';
import { Caption } from '../../caption';
import { ChartAxisDirection } from '../../chartAxisDirection';
import type { DataController } from '../../data/dataController';
import type { LegendItemClickChartEvent } from '../../interaction/chartEventManager';
import { Label } from '../../label';
import type { CategoryLegendDatum, ChartLegendType } from '../../legendDatum';
import type { SeriesNodeEventTypes } from '../series';
import { HighlightStyle, SeriesNodeClickEvent } from '../series';
import { SeriesTooltip } from '../seriesTooltip';
import type { SeriesNodeDatum } from '../seriesTypes';
import { type PolarAnimationData, PolarSeries } from './polarSeries';
declare class PieSeriesNodeClickEvent<TEvent extends string = SeriesNodeEventTypes> extends SeriesNodeClickEvent<PieNodeDatum, TEvent> {
    readonly angleKey: string;
    readonly radiusKey?: string;
    readonly calloutLabelKey?: string;
    readonly sectorLabelKey?: string;
    constructor(type: TEvent, nativeEvent: MouseEvent, datum: PieNodeDatum, series: PieSeries);
}
interface PieNodeDatum extends SeriesNodeDatum {
    readonly index: number;
    readonly radius: number;
    readonly innerRadius: number;
    readonly outerRadius: number;
    readonly angleValue: number;
    readonly radiusValue?: number;
    readonly startAngle: number;
    readonly endAngle: number;
    readonly midAngle: number;
    readonly midCos: number;
    readonly midSin: number;
    readonly calloutLabel?: {
        readonly text: string;
        readonly textAlign: CanvasTextAlign;
        readonly textBaseline: CanvasTextBaseline;
        hidden: boolean;
        collisionTextAlign?: CanvasTextAlign;
        collisionOffsetY: number;
        box?: BBox;
    };
    readonly sectorLabel?: {
        readonly text: string;
    };
    readonly sectorFormat: Required<AgPieSeriesFormat>;
    readonly legendItem?: {
        key: string;
        text: string;
    };
    readonly legendItemValue?: string;
}
declare class PieSeriesCalloutLabel extends Label<AgPieSeriesLabelFormatterParams> {
    offset: number;
    minAngle: number;
    minSpacing: number;
    maxCollisionOffset: number;
    avoidCollisions: boolean;
}
declare class PieSeriesSectorLabel extends Label<AgPieSeriesLabelFormatterParams> {
    positionOffset: number;
    positionRatio: number;
}
declare class PieSeriesCalloutLine {
    colors?: string[];
    length: number;
    strokeWidth: number;
}
export declare class PieTitle extends Caption {
    showInLegend: boolean;
}
export declare class DoughnutInnerLabel extends Label<AgPieSeriesLabelFormatterParams> {
    text: string;
    margin: number;
}
export declare class DoughnutInnerCircle {
    fill: string;
    fillOpacity?: number | undefined;
}
export declare class PieSeries extends PolarSeries<PieNodeDatum, Sector> {
    static className: string;
    static type: "pie";
    private readonly previousRadiusScale;
    private readonly radiusScale;
    private readonly calloutLabelSelection;
    private readonly sectorLabelSelection;
    private readonly innerLabelsSelection;
    private readonly innerCircleSelection;
    readonly backgroundGroup: Group;
    readonly innertCircleGroup: Group;
    private nodeData;
    private angleScale;
    seriesItemEnabled: boolean[];
    title?: PieTitle;
    private oldTitle?;
    calloutLabel: PieSeriesCalloutLabel;
    readonly sectorLabel: PieSeriesSectorLabel;
    calloutLine: PieSeriesCalloutLine;
    tooltip: SeriesTooltip<AgPieSeriesTooltipRendererParams>;
    /**
     * The key of the numeric field to use to determine the angle (for example,
     * a pie sector angle).
     */
    angleKey: string;
    angleName: string;
    readonly innerLabels: DoughnutInnerLabel[];
    innerCircle?: DoughnutInnerCircle;
    /**
     * The key of the numeric field to use to determine the radii of pie sectors.
     * The largest value will correspond to the full radius and smaller values to
     * proportionally smaller radii.
     */
    radiusKey?: string;
    radiusName?: string;
    radiusMin?: number;
    radiusMax?: number;
    calloutLabelKey?: string;
    calloutLabelName?: string;
    sectorLabelKey?: string;
    sectorLabelName?: string;
    legendItemKey?: string;
    fills: string[];
    strokes: string[];
    fillOpacity: number;
    strokeOpacity: number;
    lineDash?: number[];
    lineDashOffset: number;
    formatter?: (params: AgPieSeriesFormatterParams<any>) => AgPieSeriesFormat;
    /**
     * The series rotation in degrees.
     */
    rotation: number;
    outerRadiusOffset: number;
    outerRadiusRatio: number;
    innerRadiusOffset: number;
    innerRadiusRatio: number;
    strokeWidth: number;
    shadow?: DropShadow;
    readonly highlightStyle: HighlightStyle;
    surroundingRadius?: number;
    constructor(moduleCtx: ModuleContext);
    addChartEventListeners(): void;
    visibleChanged(): void;
    private processSeriesItemEnabled;
    protected nodeFactory(): Sector;
    getSeriesDomain(direction: ChartAxisDirection): any[];
    processData(dataController: DataController): Promise<void>;
    maybeRefreshNodeData(): Promise<void>;
    private getProcessedDataIndexes;
    createNodeData(): Promise<{
        itemId: string;
        nodeData: PieNodeDatum[];
        labelData: PieNodeDatum[];
    }[]>;
    private getLabels;
    private getTextAlignment;
    private getSectorFormat;
    getInnerRadius(): number;
    getOuterRadius(): number;
    updateRadiusScale(resize: boolean): void;
    private getTitleTranslationY;
    update({ seriesRect }: {
        seriesRect: BBox;
    }): Promise<void>;
    private updateTitleNodes;
    private updateNodeMidPoint;
    private updateSelections;
    private updateGroupSelection;
    private updateInnerCircleSelection;
    private updateNodes;
    updateCalloutLineNodes(): void;
    private getLabelOverflow;
    private bboxIntersectsSurroundingSeries;
    private computeCalloutLabelCollisionOffsets;
    private updateCalloutLabelNodes;
    computeLabelsBBox(options: {
        hideWhenNecessary: boolean;
    }, seriesRect: BBox): Promise<BBox | null>;
    private updateSectorLabelNodes;
    private updateInnerLabelNodes;
    protected readonly NodeClickEvent: typeof PieSeriesNodeClickEvent;
    private getDatumLegendName;
    getTooltipHtml(nodeDatum: PieNodeDatum): string;
    getLegendData(legendType: ChartLegendType): CategoryLegendDatum[];
    onLegendItemClick(event: LegendItemClickChartEvent): void;
    protected toggleSeriesItem(itemId: number, enabled: boolean): void;
    toggleOtherSeriesItems(series: PieSeries, itemId: number, enabled: boolean): void;
    animateEmptyUpdateReady(_data?: PolarAnimationData): void;
    animateWaitingUpdateReady(): void;
    animateClearingUpdateEmpty(): void;
    getDatumIdFromData(datum: any): any;
    getDatumId(datum: PieNodeDatum): any;
    protected onDataChange(): void;
}
export {};
