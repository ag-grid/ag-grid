import type { ModuleContext } from '../../../module/moduleContext';
import type { AgDonutSeriesFormat } from '../../../options/agChartOptions';
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
import { DonutSeriesProperties } from './donutSeriesProperties';
import { type PolarAnimationData, PolarSeries } from './polarSeries';
declare class DonutSeriesNodeClickEvent<TEvent extends string = SeriesNodeEventTypes> extends SeriesNodeClickEvent<DonutNodeDatum, TEvent> {
    readonly angleKey: string;
    readonly radiusKey?: string;
    readonly calloutLabelKey?: string;
    readonly sectorLabelKey?: string;
    constructor(type: TEvent, nativeEvent: MouseEvent, datum: DonutNodeDatum, series: DonutSeries);
}
interface DonutNodeDatum extends SeriesNodeDatum {
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
        [key in keyof Required<AgDonutSeriesFormat>]: AgDonutSeriesFormat[key];
    };
    readonly legendItem?: {
        key: string;
        text: string;
    };
    readonly legendItemValue?: string;
}
export declare class DonutSeries extends PolarSeries<DonutNodeDatum, Sector> {
    static className: string;
    static type: "donut";
    properties: DonutSeriesProperties;
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
        nodeData: DonutNodeDatum[];
        labelData: DonutNodeDatum[];
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
    protected readonly NodeClickEvent: typeof DonutSeriesNodeClickEvent;
    private getDatumLegendName;
    getTooltipHtml(nodeDatum: DonutNodeDatum): string;
    getLegendData(legendType: ChartLegendType): CategoryLegendDatum[];
    onLegendItemClick(event: LegendItemClickChartEvent): void;
    protected toggleSeriesItem(itemId: number, enabled: boolean): void;
    toggleOtherSeriesItems(legendItemName: string, enabled: boolean): void;
    animateEmptyUpdateReady(_data?: PolarAnimationData): void;
    animateWaitingUpdateReady(): void;
    animateClearingUpdateEmpty(): void;
    getDatumIdFromData(datum: any): any;
    getDatumId(datum: DonutNodeDatum): any;
    protected onDataChange(): void;
}
export {};
