import type { ModuleInstance } from '../../module/baseModule';
import type { AxisContext, ModuleContext, ModuleContextWithParent } from '../../module/moduleContext';
import { ModuleMap } from '../../module/moduleMap';
import type { AxisOptionModule } from '../../module/optionsModule';
import type { FromToDiff } from '../../motion/fromToMotion';
import type { CssColor, FontFamily, FontSize, FontStyle, FontWeight } from '../../options/agChartOptions';
import type { Scale } from '../../scale/scale';
import { BBox } from '../../scene/bbox';
import { Group } from '../../scene/group';
import type { Node } from '../../scene/node';
import { Selection } from '../../scene/selection';
import { Line } from '../../scene/shape/line';
import { Text } from '../../scene/shape/text';
import { Caption } from '../caption';
import type { ChartAnimationPhase } from '../chartAnimationPhase';
import type { ChartAxis, ChartAxisLabel, ChartAxisLabelFlipFlag } from '../chartAxis';
import { ChartAxisDirection } from '../chartAxisDirection';
import type { CrossLine } from '../crossline/crossLine';
import type { AnimationManager } from '../interaction/animationManager';
import type { AxisLayout } from '../layout/layoutService';
import type { ISeries } from '../series/seriesTypes';
import { AxisGridLine } from './axisGridLine';
import { AxisLine } from './axisLine';
import type { TickInterval } from './axisTick';
import { AxisTick } from './axisTick';
import type { AxisTitle } from './axisTitle';
import type { AxisLineDatum } from './axisUtil';
export declare enum Tags {
    TickLine = 0,
    TickLabel = 1,
    GridLine = 2,
    GridArc = 3,
    AxisLine = 4
}
type TickStrategyResult = {
    index: number;
    tickData: TickData;
    autoRotation: number;
    terminate: boolean;
};
declare enum TickGenerationType {
    CREATE = 0,
    CREATE_SECONDARY = 1,
    FILTER = 2,
    VALUES = 3
}
export type TickDatum = {
    tickLabel: string;
    tick: any;
    tickId: string;
    translationY: number;
};
export type LabelNodeDatum = {
    tickId: string;
    fill?: CssColor;
    fontFamily?: FontFamily;
    fontSize?: FontSize;
    fontStyle?: FontStyle;
    fontWeight?: FontWeight;
    rotation: number;
    rotationCenterX: number;
    text: string;
    textAlign?: CanvasTextAlign;
    textBaseline: CanvasTextBaseline;
    visible: boolean;
    x: number;
    y: number;
    translationY: number;
    range: number[];
};
type TickData = {
    rawTicks: any[];
    ticks: TickDatum[];
    labelCount: number;
};
export type AxisModuleMap = ModuleMap<AxisOptionModule, ModuleInstance, ModuleContextWithParent<AxisContext>>;
/**
 * A general purpose linear axis with no notion of orientation.
 * The axis is always rendered vertically, with horizontal labels positioned to the left
 * of the axis line by default. The axis can be {@link rotation | rotated} by an arbitrary angle,
 * so that it can be used as a top, right, bottom, left, radial or any other kind
 * of linear axis.
 * The generic `D` parameter is the type of the domain of the axis' scale.
 * The output range of the axis' scale is always numeric (screen coordinates).
 */
export declare abstract class Axis<S extends Scale<D, number, TickInterval<S>> = Scale<any, number, any>, D = any> implements ChartAxis {
    protected readonly moduleCtx: ModuleContext;
    readonly scale: S;
    static readonly defaultTickMinSpacing = 50;
    readonly id: string;
    nice: boolean;
    /** Reverse the axis scale domain. */
    reverse: boolean;
    keys: string[];
    dataDomain: {
        domain: D[];
        clipped: boolean;
    };
    get type(): string;
    abstract get direction(): ChartAxisDirection;
    boundSeries: ISeries<unknown>[];
    includeInvisibleDomains: boolean;
    interactionEnabled: boolean;
    readonly axisGroup: Group;
    protected lineNode: Line;
    protected readonly tickLineGroup: Group;
    protected readonly tickLabelGroup: Group;
    protected readonly crossLineGroup: Group;
    readonly gridGroup: Group;
    protected readonly gridLineGroup: Group;
    protected tickLineGroupSelection: Selection<Line, any>;
    protected tickLabelGroupSelection: Selection<Text, LabelNodeDatum>;
    protected gridLineGroupSelection: Selection<Line, any>;
    protected abstract assignCrossLineArrayConstructor(crossLines: CrossLine[]): void;
    private _crossLines?;
    set crossLines(value: CrossLine[] | undefined);
    get crossLines(): CrossLine[] | undefined;
    readonly line: AxisLine;
    readonly tick: AxisTick<S>;
    readonly gridLine: AxisGridLine;
    readonly label: ChartAxisLabel;
    protected defaultTickMinSpacing: number;
    readonly translation: {
        x: number;
        y: number;
    };
    rotation: number;
    protected readonly layout: Pick<AxisLayout, 'label'>;
    protected axisContext?: AxisContext;
    protected animationManager: AnimationManager;
    private animationState;
    private destroyFns;
    private minRect?;
    constructor(moduleCtx: ModuleContext, scale: S, options?: {
        respondsToZoom: boolean;
    });
    resetAnimation(phase: ChartAnimationPhase): void;
    private attachCrossLine;
    private detachCrossLine;
    destroy(): void;
    protected refreshScale(): void;
    protected updateRange(): void;
    setCrossLinesVisible(visible: boolean): void;
    attachAxis(axisNode: Node, gridNode: Node): void;
    detachAxis(axisNode: Node, gridNode: Node): void;
    range: number[];
    visibleRange: number[];
    /**
     * Checks if a point or an object is in range.
     * @param x A point (or object's starting point).
     * @param width Object's width.
     * @param tolerance Expands the range on both ends by this amount.
     */
    inRange(x: number, width?: number, tolerance?: number): boolean;
    protected labelFormatter?: (datum: any) => string;
    protected onLabelFormatChange(ticks: any[], format?: string): void;
    title?: AxisTitle;
    protected _titleCaption: Caption;
    private setTickInterval;
    private setTickCount;
    /**
     * The length of the grid. The grid is only visible in case of a non-zero value.
     * In case {@link radialGrid} is `true`, the value is interpreted as an angle
     * (in degrees).
     */
    gridLength: number;
    private fractionDigits;
    /**
     * The distance between the grid ticks and the axis ticks.
     */
    gridPadding: number;
    /**
     * Is used to avoid collisions between axis labels and series.
     */
    seriesAreaPadding: number;
    protected onGridLengthChange(value: number, prevValue: number): void;
    protected onGridVisibilityChange(): void;
    protected createTick(): AxisTick<S>;
    protected createLabel(): ChartAxisLabel;
    private checkAxisHover;
    /**
     * Creates/removes/updates the scene graph nodes that constitute the axis.
     */
    update(_primaryTickCount?: number, animated?: boolean): number | undefined;
    private getAxisLineCoordinates;
    private getTickLineCoordinates;
    private getTickLabelProps;
    private getTickSize;
    private setTitleProps;
    private tickGenerationResult;
    calculateLayout(primaryTickCount?: number): {
        primaryTickCount: number | undefined;
        bbox: BBox;
    };
    private updateLayoutState;
    setDomain(domain: D[]): void;
    updateScale(): void;
    private calculateRotations;
    private generateTicks;
    private getTickStrategies;
    createTickData(tickGenerationType: TickGenerationType, index: number, tickData: TickData, terminate: boolean, primaryTickCount?: number): TickStrategyResult;
    private checkLabelOverlap;
    private createLabelData;
    private getAutoRotation;
    private getTicks;
    private filterTicks;
    private createTicks;
    protected estimateTickCount({ minSpacing, maxSpacing }: {
        minSpacing: number;
        maxSpacing: number;
    }): {
        minTickCount: number;
        maxTickCount: number;
        defaultTickCount: number;
    };
    private updateVisibility;
    protected updateCrossLines({ rotation, parallelFlipRotation, regularFlipRotation, }: {
        rotation: number;
        parallelFlipRotation: number;
        regularFlipRotation: number;
    }): void;
    protected updateTickLines(): void;
    protected calculateAvailableRange(): number;
    /**
     * Calculates the available range with an additional "bleed" beyond the canvas that encompasses the full axis when
     * the visible range is only a portion of the axis.
     */
    protected calculateRangeWithBleed(): number;
    protected calculateDomain(): void;
    protected getAxisTransform(): {
        rotation: number;
        rotationCenterX: number;
        rotationCenterY: number;
        translationX: number;
        translationY: number;
    };
    updatePosition(): void;
    updateSecondaryAxisTicks(_primaryTickCount: number | undefined): any[];
    protected updateSelections(lineData: AxisLineDatum, data: TickDatum[], params: {
        combinedRotation: number;
        textBaseline: CanvasTextBaseline;
        textAlign: CanvasTextAlign;
        range: number[];
    }): void;
    protected updateAxisLine(): void;
    protected updateGridLines(sideFlag: ChartAxisLabelFlipFlag): void;
    protected updateLabels(): void;
    private wrapLabels;
    protected updateTitle(params: {
        anyTickVisible: boolean;
    }): void;
    formatTick(datum: any, index: number): string;
    formatDatum(datum: any): string;
    maxThickness: number;
    computeBBox(): BBox;
    initCrossLine(crossLine: CrossLine): void;
    isAnySeriesActive(): boolean;
    clipTickLines(x: number, y: number, width: number, height: number): void;
    clipGrid(x: number, y: number, width: number, height: number): void;
    calculatePadding(min: number, max: number, reverse: boolean): [number, number];
    protected getTitleFormatterParams(): {
        direction: ChartAxisDirection;
        boundSeries: import("../../options/agChartOptions").AgAxisBoundSeries[];
        defaultValue: string | undefined;
    };
    normaliseDataDomain(d: D[]): {
        domain: D[];
        clipped: boolean;
    };
    getLayoutState(): AxisLayout;
    private readonly moduleMap;
    getModuleMap(): AxisModuleMap;
    createModuleContext(): ModuleContextWithParent<AxisContext>;
    protected createAxisContext(): AxisContext;
    animateReadyUpdate(diff: FromToDiff): void;
    protected resetSelectionNodes(): void;
    private calculateUpdateDiff;
    isReversed(): boolean;
}
export {};
