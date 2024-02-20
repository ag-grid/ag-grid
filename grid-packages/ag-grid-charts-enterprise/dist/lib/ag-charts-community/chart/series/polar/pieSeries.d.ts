import type { ModuleContext } from '../../../module/moduleContext';
import type { AgPieSeriesFormat } from '../../../options/agChartOptions';
import { BBox } from '../../../scene/bbox';
import { Group } from '../../../scene/group';
import { Sector } from '../../../scene/shape/sector';
import { ChartAxisDirection } from '../../chartAxisDirection';
import type { DataController } from '../../data/dataController';
import type { LegendItemClickChartEvent } from '../../interaction/chartEventManager';
import type { CategoryLegendDatum, ChartLegendType } from '../../legendDatum';
import { Circle } from '../../marker/circle';
import type { SeriesNodeEventTypes } from '../series';
import { SeriesNodeClickEvent } from '../series';
import type { SeriesNodeDatum } from '../seriesTypes';
import { PieSeriesProperties } from './pieSeriesProperties';
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
    readonly sectorFormat: {
        [key in keyof Required<AgPieSeriesFormat>]: AgPieSeriesFormat[key];
    };
    readonly legendItem?: {
        key: string;
        text: string;
    };
    readonly legendItemValue?: string;
}
export declare class PieSeries extends PolarSeries<PieNodeDatum, Sector> {
    static className: string;
    static type: "pie";
    properties: PieSeriesProperties;
    private readonly previousRadiusScale;
    private readonly radiusScale;
    private readonly calloutLabelSelection;
    private readonly sectorLabelSelection;
    private readonly innerLabelsSelection;
    private readonly innerCircleSelection;
    readonly backgroundGroup: Group;
    readonly zerosumRingsGroup: Group;
    readonly zerosumOuterRing: Circle;
    readonly zerosumInnerRing: Circle;
    readonly innerCircleGroup: Group;
    private nodeData;
    private angleScale;
    seriesItemEnabled: boolean[];
    private oldTitle?;
    surroundingRadius?: number;
    constructor(moduleCtx: ModuleContext);
    addChartEventListeners(): void;
    visibleChanged(): void;
    get visible(): boolean;
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
    private updateZerosumRings;
    protected readonly NodeClickEvent: typeof PieSeriesNodeClickEvent;
    private getDatumLegendName;
    getTooltipHtml(nodeDatum: PieNodeDatum): string;
    getLegendData(legendType: ChartLegendType): CategoryLegendDatum[];
    onLegendItemClick(event: LegendItemClickChartEvent): void;
    protected toggleSeriesItem(itemId: number, enabled: boolean): void;
    toggleOtherSeriesItems(legendItemName: string, enabled: boolean): void;
    animateEmptyUpdateReady(_data?: PolarAnimationData): void;
    animateWaitingUpdateReady(): void;
    animateClearingUpdateEmpty(): void;
    getDatumIdFromData(datum: any): any;
    getDatumId(datum: PieNodeDatum): any;
    protected onDataChange(): void;
}
export {};
