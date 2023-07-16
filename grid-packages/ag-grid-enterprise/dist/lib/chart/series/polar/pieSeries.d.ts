import { Group } from '../../../scene/group';
import type { DropShadow } from '../../../scene/dropShadow';
import { BBox } from '../../../scene/bbox';
import type { SeriesNodeDatum } from './../series';
import { HighlightStyle, SeriesTooltip, SeriesNodeBaseClickEvent } from './../series';
import { Label } from '../../label';
import type { ChartLegendDatum } from '../../legendDatum';
import { Caption } from '../../../caption';
import { PolarSeries } from './polarSeries';
import { ChartAxisDirection } from '../../chartAxisDirection';
import type { AgPieSeriesLabelFormatterParams, AgPieSeriesTooltipRendererParams, AgTooltipRendererResult, AgPieSeriesFormat, AgPieSeriesFormatterParams } from '../../agChartOptions';
import type { LegendItemClickChartEvent } from '../../interaction/chartEventManager';
import type { ModuleContext } from '../../../util/moduleContext';
import type { DataController } from '../../data/dataController';
declare class PieSeriesNodeBaseClickEvent extends SeriesNodeBaseClickEvent<any> {
    readonly angleKey: string;
    readonly calloutLabelKey?: string;
    readonly sectorLabelKey?: string;
    readonly radiusKey?: string;
    constructor(angleKey: string, calloutLabelKey: string | undefined, sectorLabelKey: string | undefined, radiusKey: string | undefined, nativeEvent: MouseEvent, datum: PieNodeDatum, series: PieSeries);
}
declare class PieSeriesNodeClickEvent extends PieSeriesNodeBaseClickEvent {
    readonly type = "nodeClick";
}
declare class PieSeriesNodeDoubleClickEvent extends PieSeriesNodeBaseClickEvent {
    readonly type = "nodeDoubleClick";
}
interface PieNodeDatum extends SeriesNodeDatum {
    readonly index: number;
    readonly radius: number;
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
    readonly legendItemKey?: string;
    readonly legendItemValue?: string;
}
declare class PieSeriesCalloutLabel extends Label {
    offset: number;
    minAngle: number;
    formatter?: (params: AgPieSeriesLabelFormatterParams<any>) => string;
    minSpacing: number;
    maxCollisionOffset: number;
    avoidCollisions: boolean;
}
declare class PieSeriesSectorLabel extends Label {
    positionOffset: number;
    positionRatio: number;
    formatter?: (params: AgPieSeriesLabelFormatterParams<any>) => string;
}
declare class PieSeriesCalloutLine {
    colors: string[] | undefined;
    length: number;
    strokeWidth: number;
}
declare class PieSeriesTooltip extends SeriesTooltip {
    renderer?: (params: AgPieSeriesTooltipRendererParams) => string | AgTooltipRendererResult;
}
export declare class PieTitle extends Caption {
    showInLegend: boolean;
}
export declare class DoughnutInnerLabel extends Label {
    text: string;
    margin: number;
}
export declare class DoughnutInnerCircle {
    fill: string;
    fillOpacity?: number | undefined;
}
export declare class PieSeries extends PolarSeries<PieNodeDatum> {
    static className: string;
    static type: "pie";
    private radiusScale;
    private groupSelection;
    private highlightSelection;
    private calloutLabelSelection;
    private sectorLabelSelection;
    private innerLabelsSelection;
    private animationState;
    readonly backgroundGroup: Group;
    private nodeData;
    private angleScale;
    seriesItemEnabled: boolean[];
    title?: PieTitle;
    private oldTitle?;
    calloutLabel: PieSeriesCalloutLabel;
    readonly sectorLabel: PieSeriesSectorLabel;
    calloutLine: PieSeriesCalloutLine;
    tooltip: PieSeriesTooltip;
    set data(input: any[] | undefined);
    get data(): any[] | undefined;
    /**
     * The key of the numeric field to use to determine the angle (for example,
     * a pie sector angle).
     */
    angleKey: string;
    angleName: string;
    readonly innerLabels: DoughnutInnerLabel[];
    innerCircle?: DoughnutInnerCircle;
    private oldInnerCircle?;
    private innerCircleNode?;
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
    getDomain(direction: ChartAxisDirection): any[];
    processData(dataController: DataController): Promise<void>;
    maybeRefreshNodeData(): void;
    createNodeData(): Promise<{
        itemId: string;
        nodeData: PieNodeDatum[];
        labelData: PieNodeDatum[];
    }[]>;
    private getProcessedDataIndexes;
    private _createNodeData;
    private getLabels;
    private getLabelFormatterParams;
    private getTextAlignment;
    private getSectorFormat;
    getInnerRadius(): number;
    getOuterRadius(): number;
    updateRadiusScale(): void;
    private getTitleTranslationY;
    update({ seriesRect }: {
        seriesRect: BBox;
    }): Promise<void>;
    private updateTitleNodes;
    private updateInnerCircleNodes;
    private updateNodeMidPoint;
    private updateSelections;
    private updateGroupSelection;
    private updateNodes;
    updateCalloutLineNodes(): void;
    private getLabelOverflow;
    private bboxIntersectsSurroundingSeries;
    private computeCalloutLabelCollisionOffsets;
    private updateCalloutLabelNodes;
    computeLabelsBBox(options: {
        hideWhenNecessary: boolean;
    }, seriesRect: BBox): BBox | null;
    private updateSectorLabelNodes;
    private updateInnerCircle;
    private updateInnerLabelNodes;
    protected getNodeClickEvent(event: MouseEvent, datum: PieNodeDatum): PieSeriesNodeClickEvent;
    protected getNodeDoubleClickEvent(event: MouseEvent, datum: PieNodeDatum): PieSeriesNodeDoubleClickEvent;
    getTooltipHtml(nodeDatum: PieNodeDatum): string;
    getLegendData(): ChartLegendDatum[];
    onLegendItemClick(event: LegendItemClickChartEvent): void;
    protected toggleSeriesItem(itemId: number, enabled: boolean): void;
    toggleOtherSeriesItems(series: PieSeries, itemId: number, enabled: boolean): void;
    animateEmptyUpdateReady(): void;
    animateReadyUpdateReady(): void;
}
export {};
//# sourceMappingURL=pieSeries.d.ts.map