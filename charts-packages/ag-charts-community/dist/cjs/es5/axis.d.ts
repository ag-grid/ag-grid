import { Scale } from "./scale/scale";
import { Group } from "./scene/group";
import { FontStyle, FontWeight } from "./scene/shape/text";
import { BBox } from "./scene/bbox";
import { Caption } from "./caption";
import { CountableTimeInterval } from "./util/time/interval";
export interface GridStyle {
    stroke?: string;
    lineDash?: number[];
}
declare type TickCount = number | CountableTimeInterval;
export declare class AxisTick {
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
    count?: TickCount;
}
export interface AxisLabelFormatterParams {
    value: any;
    index: number;
    fractionDigits?: number;
    formatter?: (x: any) => string;
    axis?: any;
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
    formatter?: (params: AxisLabelFormatterParams) => string;
    onFormatChange?: (format?: string) => void;
    private _format;
    set format(value: string | undefined);
    get format(): string | undefined;
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
export declare class Axis<S extends Scale<D, number>, D = any> {
    readonly id: string;
    protected _scale: S;
    set scale(value: S);
    get scale(): S;
    ticks: any[];
    readonly axisGroup: Group;
    private readonly tickLineGroup;
    private readonly titleGroup;
    private tickLineGroupSelection;
    private lineNode;
    readonly gridlineGroup: Group;
    private gridlineGroupSelection;
    readonly line: {
        /**
         * The line width to be used by the axis line.
         */
        width: number;
        /**
         * The color of the axis line.
         * Use `undefined` rather than `rgba(0, 0, 0, 0)` to make the axis line invisible.
         */
        color?: string;
    };
    readonly tick: AxisTick;
    readonly label: AxisLabel;
    readonly translation: {
        x: number;
        y: number;
    };
    rotation: number;
    private _labelAutoRotated;
    get labelAutoRotated(): boolean;
    /**
     * This will be assigned a value when `this.calculateTickCount` is invoked.
     * If the user has specified a tick count, it will be used, otherwise a tick count will be calculated based on the available range.
     */
    protected _calculatedTickCount?: TickCount;
    get calculatedTickCount(): number | CountableTimeInterval | undefined;
    /**
     * Overridden in ChartAxis subclass.
     * Sets an appropriate tick count based on the available range.
     */
    calculateTickCount(_availableRange: number): void;
    /**
     * Meant to be overridden in subclasses to provide extra context the the label formatter.
     * The return value of this function will be passed to the laber.formatter as the `axis` parameter.
     */
    getMeta(): any;
    constructor(scale: S);
    protected updateRange(): void;
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
    set domain(value: D[]);
    get domain(): D[];
    protected labelFormatter?: (datum: any) => string;
    protected onLabelFormatChange(format?: string): void;
    protected _title: Caption | undefined;
    set title(value: Caption | undefined);
    get title(): Caption | undefined;
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
    gridStyle: GridStyle[];
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
     * Creates/removes/updates the scene graph nodes that constitute the axis.
     * Supposed to be called _manually_ after changing _any_ of the axis properties.
     * This allows to bulk set axis properties before updating the nodes.
     * The node changes made by this method are rendered on the next animation frame.
     * We could schedule this method call automatically on the next animation frame
     * when any of the axis properties change (the way we do when properties of scene graph's
     * nodes change), but this will mean that we first wait for the next animation
     * frame to make changes to the nodes of the axis, then wait for another animation
     * frame to render those changes. It's nice to have everything update automatically,
     * but this extra level of async indirection will not just introduce an unwanted delay,
     * it will also make it harder to reason about the program.
     */
    update(): void;
    private positionTitle;
    formatTickDatum(datum: any, index: number): string;
    formatDatum(datum: any): string;
    thickness: number;
    computeBBox(): BBox;
}
export {};
