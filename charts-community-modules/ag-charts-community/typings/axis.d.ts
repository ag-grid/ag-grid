import type { Scale } from './scale/scale';
import type { Node } from './scene/node';
import { Group } from './scene/group';
import { Selection } from './scene/selection';
import { Line } from './scene/shape/line';
import { Text } from './scene/shape/text';
import { BBox } from './scene/bbox';
import { Caption } from './caption';
import type { CrossLine } from './chart/crossline/crossLine';
import type { AgAxisGridStyle } from './chart/agChartOptions';
import { ChartAxisDirection } from './chart/chartAxisDirection';
import type { Flag } from './chart/label';
import type { AxisLayout } from './chart/layout/layoutService';
import type { AxisOptionModule, ModuleInstance } from './util/module';
import type { AxisContext, ModuleContext } from './util/moduleContext';
import { AxisLabel } from './chart/axis/axisLabel';
import { AxisLine } from './chart/axis/axisLine';
import type { AxisTitle } from './chart/axis/axisTitle';
import type { TickInterval } from './chart/axis/axisTick';
import { AxisTick } from './chart/axis/axisTick';
import type { ChartAxis, BoundSeries } from './chart/chartAxis';
export declare enum Tags {
    TickLine = 0,
    TickLabel = 1,
    GridLine = 2,
    GridArc = 3,
    AxisLine = 4
}
declare type TickStrategyResult = {
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
declare type TickDatum = {
    tickLabel: string;
    tick: any;
    tickId: string;
    translationY: number;
};
declare type TickData = {
    rawTicks: any[];
    ticks: TickDatum[];
    labelCount: number;
};
declare type AxisUpdateDiff = {
    changed: boolean;
    tickCount: number;
    added: {
        [key: string]: true;
    };
    removed: {
        [key: string]: true;
    };
};
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
    static readonly defaultTickMinSpacing = 50;
    readonly id: string;
    nice: boolean;
    dataDomain: D[];
    protected _scale: S;
    get scale(): S;
    keys: string[];
    get type(): string;
    abstract get direction(): ChartAxisDirection;
    boundSeries: BoundSeries[];
    linkedTo?: Axis<any, any>;
    includeInvisibleDomains: boolean;
    readonly axisGroup: Group;
    protected lineNode: Line;
    protected readonly tickLineGroup: Group;
    protected readonly tickLabelGroup: Group;
    protected readonly crossLineGroup: Group;
    readonly gridGroup: Group;
    protected readonly gridLineGroup: Group;
    protected tickLineGroupSelection: Selection<Line, any>;
    protected tickLabelGroupSelection: Selection<Text, any>;
    protected gridLineGroupSelection: Selection<Line, any>;
    protected abstract assignCrossLineArrayConstructor(crossLines: CrossLine[]): void;
    private _crossLines?;
    set crossLines(value: CrossLine[] | undefined);
    get crossLines(): CrossLine[] | undefined;
    readonly line: AxisLine;
    readonly tick: AxisTick<S>;
    readonly label: AxisLabel;
    readonly translation: {
        x: number;
        y: number;
    };
    rotation: number;
    protected readonly layout: Pick<AxisLayout, 'label'>;
    protected axisContext?: AxisContext;
    protected readonly modules: Record<string, {
        instance: ModuleInstance;
    }>;
    private animationManager;
    private animationState;
    private destroyFns;
    constructor(moduleCtx: ModuleContext, scale: S);
    private attachCrossLine;
    private detachCrossLine;
    destroy(): void;
    protected refreshScale(): void;
    protected updateRange(): void;
    setCrossLinesVisible(visible: boolean): void;
    attachAxis(node: Node): void;
    detachAxis(node: Node): void;
    /**
     * Checks if a point or an object is in range.
     * @param x A point (or object's starting point).
     * @param width Object's width.
     * @param tolerance Expands the range on both ends by this amount.
     */
    inRange(x: number, width?: number, tolerance?: number): boolean;
    inRangeEx(x: number, width?: number, tolerance?: number): -1 | 0 | 1;
    range: number[];
    visibleRange: number[];
    protected labelFormatter?: (datum: any) => string;
    protected onLabelFormatChange(ticks: any[], format?: string): void;
    title: AxisTitle | undefined;
    protected _titleCaption: Caption;
    private setDomain;
    private setTickInterval;
    private setTickCount;
    /**
     * The length of the grid. The grid is only visible in case of a non-zero value.
     * In case {@link radialGrid} is `true`, the value is interpreted as an angle
     * (in degrees).
     */
    protected _gridLength: number;
    set gridLength(value: number);
    get gridLength(): number;
    /**
     * The array of styles to cycle through when rendering grid lines.
     * For example, use two {@link GridStyle} objects for alternating styles.
     * Contains only one {@link GridStyle} object by default, meaning all grid lines
     * have the same style.
     */
    gridStyle: AgAxisGridStyle[];
    private fractionDigits;
    /**
     * The distance between the grid ticks and the axis ticks.
     */
    gridPadding: number;
    /**
     * Is used to avoid collisions between axis labels and series.
     */
    seriesAreaPadding: number;
    protected createTick(): AxisTick<S>;
    private checkAxisHover;
    /**
     * Creates/removes/updates the scene graph nodes that constitute the axis.
     */
    update(primaryTickCount?: number): number | undefined;
    private updateLayoutState;
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
    private estimateTickCount;
    private updateVisibility;
    protected updateCrossLines({ rotation, parallelFlipRotation, regularFlipRotation, sideFlag, }: {
        rotation: number;
        parallelFlipRotation: number;
        regularFlipRotation: number;
        sideFlag: Flag;
    }): void;
    protected updateTickLines(sideFlag: Flag): void;
    private calculateAvailableRange;
    protected calculateDomain(): void;
    updatePosition({ rotation, sideFlag }: {
        rotation: number;
        sideFlag: Flag;
    }): void;
    updateSecondaryAxisTicks(_primaryTickCount: number | undefined): any[];
    private updateSelections;
    protected updateGridLines(sideFlag: Flag): void;
    protected updateLabels({ tickLabelGroupSelection, combinedRotation, textBaseline, textAlign, labelX, }: {
        tickLabelGroupSelection: Selection<Text, any>;
        combinedRotation: number;
        textBaseline: CanvasTextBaseline;
        textAlign: CanvasTextAlign;
        labelX: number;
    }): void;
    private wrapLabels;
    private updateLine;
    protected updateTitle({ anyTickVisible, sideFlag }: {
        anyTickVisible: boolean;
        sideFlag: Flag;
    }): void;
    formatTick(datum: any, index: number): string;
    formatDatum(datum: any): string;
    maxThickness: number;
    computeBBox(): BBox;
    initCrossLine(crossLine: CrossLine): void;
    isAnySeriesActive(): boolean;
    clipTickLines(x: number, y: number, width: number, height: number): void;
    clipGrid(x: number, y: number, width: number, height: number): void;
    calculatePadding(min: number, _max: number): [number, number];
    protected getTitleFormatterParams(): {
        direction: ChartAxisDirection;
        boundSeries: import("./chart/agChartOptions").AgAxisBoundSeries[];
        defaultValue: string | undefined;
    };
    normaliseDataDomain(d: D[]): D[];
    getLayoutState(): AxisLayout;
    protected createAxisContext(): AxisContext;
    addModule(module: AxisOptionModule): void;
    removeModule(module: AxisOptionModule): void;
    isModuleEnabled(module: AxisOptionModule): boolean;
    animateReadyUpdate(diff: AxisUpdateDiff): void;
    private animateSelectionNode;
    private resetSelectionNodes;
    private calculateUpdateDiff;
}
export {};
//# sourceMappingURL=axis.d.ts.map