import { Scale } from './scale/scale';
import { Node } from './scene/node';
import { Group } from './scene/group';
import { BBox } from './scene/bbox';
import { Caption } from './caption';
import { TimeInterval } from './util/time/interval';
import { CrossLine } from './chart/crossline/crossLine';
import { TimeScale } from './scale/timeScale';
import { AgAxisGridStyle, AgAxisLabelFormatterParams, FontStyle, FontWeight } from './chart/agChartOptions';
declare type TickCount<S> = S extends TimeScale ? number | TimeInterval : number;
export declare type TickInterval<S> = S extends TimeScale ? number | TimeInterval : number;
export declare class AxisLine {
    width: number;
    color?: string;
}
declare class AxisTick<S extends Scale<D, number>, D = any> {
    /**
     * The line width to be used by axis ticks.
     */
    width: number;
    /**
     * The line length to be used by axis ticks.
     */
    size: number;
    /**
     * The color of the axis ticks.
     * Use `undefined` rather than `rgba(0, 0, 0, 0)` to make the ticks invisible.
     */
    color?: string;
    /**
     * A hint of how many ticks to use (the exact number of ticks might differ),
     * a `TimeInterval` or a `CountableTimeInterval`.
     * For example:
     *
     *     axis.tick.count = 5;
     *     axis.tick.count = year;
     *     axis.tick.count = month.every(6);
     */
    count?: TickCount<S>;
    interval?: TickInterval<S>;
    values?: any[];
    minSpacing: number;
    maxSpacing: number;
}
export declare class AxisLabel {
    fontStyle?: FontStyle;
    fontWeight?: FontWeight;
    fontSize: number;
    fontFamily: string;
    /**
     * The padding between the labels and the ticks.
     */
    padding: number;
    /**
     * Minimum gap in pixels between the axis labels before being removed to avoid collisions.
     */
    minSpacing?: number;
    /**
     * The color of the labels.
     * Use `undefined` rather than `rgba(0, 0, 0, 0)` to make labels invisible.
     */
    color?: string;
    /**
     * Custom label rotation in degrees.
     * Labels are rendered perpendicular to the axis line by default.
     * Or parallel to the axis line, if the {@link parallel} is set to `true`.
     * The value of this config is used as the angular offset/deflection
     * from the default rotation.
     */
    rotation?: number;
    /**
     * If specified and axis labels may collide, they are rotated to reduce collisions. If the
     * `rotation` property is specified, it takes precedence.
     */
    autoRotate: boolean | undefined;
    /**
     * Rotation angle to use when autoRotate is applied.
     */
    autoRotateAngle: number;
    /**
     * Avoid axis label collision by automatically reducing the number of ticks displayed. If set to `false`, axis labels may collide.
     */
    avoidCollisions: boolean;
    /**
     * By default labels and ticks are positioned to the left of the axis line.
     * `true` positions the labels to the right of the axis line.
     * However, if the axis is rotated, it's easier to think in terms
     * of this side or the opposite side, rather than left and right.
     * We use the term `mirror` for conciseness, although it's not
     * true mirroring - for example, when a label is rotated, so that
     * it is inclined at the 45 degree angle, text flowing from north-west
     * to south-east, ending at the tick to the left of the axis line,
     * and then we set this config to `true`, the text will still be flowing
     * from north-west to south-east, _starting_ at the tick to the right
     * of the axis line.
     */
    mirrored: boolean;
    /**
     * Labels are rendered perpendicular to the axis line by default.
     * Setting this config to `true` makes labels render parallel to the axis line
     * and center aligns labels' text at the ticks.
     */
    parallel: boolean;
    /**
     * In case {@param value} is a number, the {@param fractionDigits} parameter will
     * be provided as well. The `fractionDigits` corresponds to the number of fraction
     * digits used by the tick step. For example, if the tick step is `0.0005`,
     * the `fractionDigits` is 4.
     */
    formatter?: (params: AgAxisLabelFormatterParams) => string;
    format: string | undefined;
}
/**
 * A general purpose linear axis with no notion of orientation.
 * The axis is always rendered vertically, with horizontal labels positioned to the left
 * of the axis line by default. The axis can be {@link rotation | rotated} by an arbitrary angle,
 * so that it can be used as a top, right, bottom, left, radial or any other kind
 * of linear axis.
 * The generic `D` parameter is the type of the domain of the axis' scale.
 * The output range of the axis' scale is always numeric (screen coordinates).
 */
export declare class Axis<S extends Scale<D, number, TickInterval<S>>, D = any> {
    static readonly defaultTickMinSpacing = 80;
    readonly id: string;
    nice: boolean;
    dataDomain: D[];
    protected _scale: S;
    get scale(): S;
    protected readonly axisGroup: Group;
    private readonly crossLineGroup;
    private readonly lineGroup;
    private readonly tickGroup;
    private readonly titleGroup;
    private tickGroupSelection;
    private lineNode;
    protected readonly gridlineGroup: Group;
    private gridlineGroupSelection;
    private _crossLines?;
    set crossLines(value: CrossLine[] | undefined);
    get crossLines(): CrossLine[] | undefined;
    readonly line: AxisLine;
    readonly tick: AxisTick<S, any>;
    readonly label: AxisLabel;
    readonly translation: {
        x: number;
        y: number;
    };
    rotation: number;
    private attachCrossLine;
    private detachCrossLine;
    constructor(scale: S);
    protected refreshScale(): void;
    protected updateRange(): void;
    setCrossLinesVisible(visible: boolean): void;
    attachAxis(node: Node, nextNode?: Node | null): void;
    detachAxis(node: Node): void;
    /**
     * Checks if a point or an object is in range.
     * @param x A point (or object's starting point).
     * @param width Object's width.
     * @param tolerance Expands the range on both ends by this amount.
     */
    inRange(x: number, width?: number, tolerance?: number): boolean;
    inRangeEx(x: number, width?: number, tolerance?: number): -1 | 0 | 1;
    protected requestedRange: number[];
    set range(value: number[]);
    get range(): number[];
    protected _visibleRange: number[];
    set visibleRange(value: number[]);
    get visibleRange(): number[];
    protected labelFormatter?: (datum: any) => string;
    protected onLabelFormatChange(ticks: any[], format?: string): void;
    protected _title: Caption | undefined;
    set title(value: Caption | undefined);
    get title(): Caption | undefined;
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
    /**
     * `false` - render grid as lines of {@link gridLength} that extend the ticks
     *           on the opposite side of the axis
     * `true` - render grid as concentric circles that go through the ticks
     */
    private _radialGrid;
    set radialGrid(value: boolean);
    get radialGrid(): boolean;
    private fractionDigits;
    /**
     * The distance between the grid ticks and the axis ticks.
     */
    gridPadding: number;
    /**
     * Creates/removes/updates the scene graph nodes that constitute the axis.
     */
    update(primaryTickCount?: number): number | undefined;
    private estimateTickCount;
    protected calculateDomain(): void;
    updatePosition(): void;
    updateSecondaryAxisTicks(_primaryTickCount: number | undefined): any[];
    private updateTickGroupSelection;
    private updateGridLineGroupSelection;
    private updateSelections;
    private updateGridLines;
    private updateLabels;
    private updateLine;
    private updateTitle;
    formatTickDatum(datum: any, index: number): string;
    formatDatum(datum: any): string;
    thickness: number;
    computeBBox(): BBox;
    initCrossLine(crossLine: CrossLine): void;
    isAnySeriesActive(): boolean;
}
export {};
