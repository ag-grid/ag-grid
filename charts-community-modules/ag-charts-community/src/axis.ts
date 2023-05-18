import { Scale } from './scale/scale';
import { Node } from './scene/node';
import { Group } from './scene/group';
import { Selection } from './scene/selection';
import { Line } from './scene/shape/line';
import { getFont, measureText, Text, TextSizeProperties, splitText } from './scene/shape/text';
import { Arc } from './scene/shape/arc';
import { BBox } from './scene/bbox';
import { Caption } from './caption';
import { createId } from './util/id';
import { normalizeAngle360, normalizeAngle360Inclusive, toRadians } from './util/angle';
import { TimeInterval } from './util/time/interval';
import { areArrayNumbersEqual } from './util/equal';
import { CrossLine } from './chart/crossline/crossLine';
import {
    Validate,
    BOOLEAN,
    OPT_BOOLEAN,
    NUMBER,
    OPT_NUMBER,
    OPT_FONT_STYLE,
    OPT_FONT_WEIGHT,
    STRING,
    OPT_COLOR_STRING,
    OPTIONAL,
    ARRAY,
    predicateWithMessage,
    OPT_STRING,
    OPT_ARRAY,
    LESS_THAN,
    NUMBER_OR_NAN,
    AND,
    GREATER_THAN,
} from './util/validation';
import { Layers } from './chart/layers';
import { axisLabelsOverlap, PointLabelDatum } from './util/labelPlacement';
import { ContinuousScale } from './scale/continuousScale';
import { Matrix } from './scene/matrix';
import { TimeScale } from './scale/timeScale';
import { AgAxisGridStyle, AgAxisLabelFormatterParams, FontStyle, FontWeight } from './chart/agChartOptions';
import { LogScale } from './scale/logScale';
import { Default } from './util/default';
import { Deprecated } from './util/deprecation';
import { extent } from './util/array';
import { ChartAxisDirection } from './chart/chartAxisDirection';
import {
    calculateLabelRotation,
    calculateLabelBBox,
    getLabelSpacing,
    getTextAlign,
    getTextBaseline,
    Flag,
} from './chart/label';
import { Logger } from './util/logger';
import { AxisLayout } from './chart/layout/layoutService';

const TICK_COUNT = predicateWithMessage(
    (v: any, ctx) => NUMBER(0)(v, ctx) || v instanceof TimeInterval,
    `expecting a tick count Number value or, for a time axis, a Time Interval such as 'agCharts.time.month'`
);
const OPT_TICK_COUNT = predicateWithMessage(
    (v: any, ctx) => OPTIONAL(v, ctx, TICK_COUNT),
    `expecting an optional tick count Number value or, for a time axis, a Time Interval such as 'agCharts.time.month'`
);

const OPT_TICK_INTERVAL = predicateWithMessage(
    (v: any, ctx) => OPTIONAL(v, ctx, (v: any, ctx) => (v !== 0 && NUMBER(0)(v, ctx)) || v instanceof TimeInterval),
    `expecting an optional non-zero positive Number value or, for a time axis, a Time Interval such as 'agCharts.time.month'`
);

const GRID_STYLE_KEYS = ['stroke', 'lineDash'];
const GRID_STYLE = predicateWithMessage(
    ARRAY(undefined, (o) => {
        for (const key in o) {
            if (!GRID_STYLE_KEYS.includes(key)) {
                return false;
            }
        }
        return true;
    }),
    `expecting an Array of objects with gridline style properties such as 'stroke' and 'lineDash'`
);

export enum Tags {
    TickLine,
    TickLabel,
    GridLine,
    GridArc,
    AxisLine,
}

type TickCount<S> = S extends TimeScale ? number | TimeInterval : number;

type TickDatum = {
    tickLabel: string;
    tick: any;
    translationY: number;
};

type TickData = { rawTicks: any[]; ticks: TickDatum[]; labelCount: number };

export type TickInterval<S> = S extends TimeScale ? number | TimeInterval : number;

export class AxisLine {
    @Validate(NUMBER(0))
    width: number = 1;

    @Validate(OPT_COLOR_STRING)
    color?: string = 'rgba(195, 195, 195, 1)';
}

class AxisTick<S extends Scale<D, number>, D = any> {
    @Validate(BOOLEAN)
    enabled = true;

    /**
     * The line width to be used by axis ticks.
     */
    @Validate(NUMBER(0))
    width: number = 1;

    /**
     * The line length to be used by axis ticks.
     */
    @Validate(NUMBER(0))
    size: number = 6;

    /**
     * The color of the axis ticks.
     * Use `undefined` rather than `rgba(0, 0, 0, 0)` to make the ticks invisible.
     */
    @Validate(OPT_COLOR_STRING)
    color?: string = 'rgba(195, 195, 195, 1)';

    /**
     * A hint of how many ticks to use (the exact number of ticks might differ),
     * a `TimeInterval` or a `CountableTimeInterval`.
     * For example:
     *
     *     axis.tick.count = 5;
     *     axis.tick.count = year;
     *     axis.tick.count = month.every(6);
     */
    @Validate(OPT_TICK_COUNT)
    @Deprecated('Use tick.interval or tick.minSpacing and tick.maxSpacing instead')
    count?: TickCount<S> = undefined;

    @Validate(OPT_TICK_INTERVAL)
    interval?: TickInterval<S> = undefined;

    @Validate(OPT_ARRAY())
    values?: any[] = undefined;

    @Validate(AND(NUMBER_OR_NAN(1), LESS_THAN('maxSpacing')))
    @Default(NaN)
    minSpacing: number = NaN;

    @Validate(AND(NUMBER_OR_NAN(1), GREATER_THAN('minSpacing')))
    @Default(NaN)
    maxSpacing: number = NaN;
}

export class AxisLabel {
    @Validate(BOOLEAN)
    enabled = true;

    /** If set to `false`, axis labels will not be wrapped on multiple lines. */
    @Validate(OPT_BOOLEAN)
    autoWrap: boolean = false;

    /** Used to constrain the width of the label when `autoWrap` is `true`, if the label text width exceeds the `maxWidth`, it will be wrapped on multiple lines automatically. If `maxWidth` is omitted, a default width constraint will be applied. */
    @Validate(OPT_NUMBER(0))
    maxWidth?: number = undefined;

    /** Used to constrain the height of the multiline label, if the label text height exceeds the `maxHeight`, it will be truncated automatically. If `maxHeight` is omitted, a default height constraint will be applied. */
    @Validate(OPT_NUMBER(0))
    maxHeight?: number = undefined;

    @Validate(OPT_FONT_STYLE)
    fontStyle?: FontStyle = undefined;

    @Validate(OPT_FONT_WEIGHT)
    fontWeight?: FontWeight = undefined;

    @Validate(NUMBER(1))
    fontSize: number = 12;

    @Validate(STRING)
    fontFamily: string = 'Verdana, sans-serif';

    /**
     * The padding between the labels and the ticks.
     */
    @Validate(NUMBER(0))
    padding: number = 5;

    /**
     * Minimum gap in pixels between the axis labels before being removed to avoid collisions.
     */
    @Validate(NUMBER_OR_NAN())
    @Default(NaN)
    minSpacing: number = NaN;

    /**
     * The color of the labels.
     * Use `undefined` rather than `rgba(0, 0, 0, 0)` to make labels invisible.
     */
    @Validate(OPT_COLOR_STRING)
    color?: string = 'rgba(87, 87, 87, 1)';

    /**
     * Custom label rotation in degrees.
     * Labels are rendered perpendicular to the axis line by default.
     * Or parallel to the axis line, if the {@link parallel} is set to `true`.
     * The value of this config is used as the angular offset/deflection
     * from the default rotation.
     */
    @Validate(OPT_NUMBER(-360, 360))
    rotation?: number = undefined;

    /**
     * If specified and axis labels may collide, they are rotated to reduce collisions. If the
     * `rotation` property is specified, it takes precedence.
     */
    @Validate(OPT_BOOLEAN)
    autoRotate: boolean | undefined = undefined;

    /**
     * Rotation angle to use when autoRotate is applied.
     */
    @Validate(NUMBER(-360, 360))
    autoRotateAngle: number = 335;

    /**
     * Avoid axis label collision by automatically reducing the number of ticks displayed. If set to `false`, axis labels may collide.
     */
    @Validate(BOOLEAN)
    avoidCollisions: boolean = true;

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
    @Validate(BOOLEAN)
    mirrored: boolean = false;

    /**
     * The side of the axis line to position the labels on.
     * -1 = left (default)
     * 1 = right
     */
    getSideFlag(): Flag {
        return this.mirrored ? 1 : -1;
    }

    /**
     * Labels are rendered perpendicular to the axis line by default.
     * Setting this config to `true` makes labels render parallel to the axis line
     * and center aligns labels' text at the ticks.
     */
    @Validate(BOOLEAN)
    parallel: boolean = false;

    /**
     * In case {@param value} is a number, the {@param fractionDigits} parameter will
     * be provided as well. The `fractionDigits` corresponds to the number of fraction
     * digits used by the tick step. For example, if the tick step is `0.0005`,
     * the `fractionDigits` is 4.
     */
    formatter?: (params: AgAxisLabelFormatterParams) => string = undefined;

    @Validate(OPT_STRING)
    format: string | undefined = undefined;

    getFont(): string {
        return getFont(this);
    }
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
export class Axis<S extends Scale<D, number, TickInterval<S>>, D = any> {
    static readonly defaultTickMinSpacing = 50;

    readonly id = createId(this);

    @Validate(BOOLEAN)
    nice: boolean = true;

    dataDomain: D[] = [];

    protected _scale: S;
    get scale(): S {
        return this._scale;
    }

    readonly axisGroup = new Group({ name: `${this.id}-axis`, zIndex: Layers.AXIS_ZINDEX });

    private lineNode = this.axisGroup.appendChild(new Line());
    protected readonly tickLineGroup = this.axisGroup.appendChild(
        new Group({ name: `${this.id}-Axis-tick-lines`, zIndex: Layers.AXIS_ZINDEX })
    );
    protected readonly tickLabelGroup = this.axisGroup.appendChild(
        new Group({ name: `${this.id}-Axis-tick-labels`, zIndex: Layers.AXIS_ZINDEX })
    );
    private readonly crossLineGroup: Group = new Group({ name: `${this.id}-CrossLines` });

    readonly gridGroup = new Group({ name: `${this.id}-Axis-grid` });
    protected readonly gridLineGroup = this.gridGroup.appendChild(
        new Group({
            name: `${this.id}-gridLines`,
            zIndex: Layers.AXIS_GRID_ZINDEX,
        })
    );

    protected readonly gridArcGroup = this.gridGroup.appendChild(
        new Group({
            name: `${this.id}-gridArcs`,
            zIndex: Layers.AXIS_GRID_ZINDEX,
        })
    );

    private tickLineGroupSelection = Selection.select(this.tickLineGroup, Line);
    private tickLabelGroupSelection = Selection.select(this.tickLabelGroup, Text);
    private gridLineGroupSelection = Selection.select(this.gridLineGroup, Line);
    private gridArcGroupSelection = Selection.select(this.gridArcGroup, Arc);

    private _crossLines?: CrossLine[] = [];
    set crossLines(value: CrossLine[] | undefined) {
        this._crossLines?.forEach((crossLine) => this.detachCrossLine(crossLine));

        this._crossLines = value;

        this._crossLines?.forEach((crossLine) => {
            this.attachCrossLine(crossLine);
            this.initCrossLine(crossLine);
        });
    }
    get crossLines(): CrossLine[] | undefined {
        return this._crossLines;
    }

    readonly line = new AxisLine();
    readonly tick = new AxisTick<S>();
    readonly label = new AxisLabel();

    readonly translation = { x: 0, y: 0 };
    rotation: number = 0; // axis rotation angle in degrees

    protected readonly layout: Pick<AxisLayout, 'label'> = {
        label: {
            align: 'center',
            baseline: 'middle',
            rotation: 0,
            fractionDigits: 0,
            padding: this.label.padding,
            format: this.label.format,
        },
    };

    private attachCrossLine(crossLine: CrossLine) {
        this.crossLineGroup.appendChild(crossLine.group);
    }

    private detachCrossLine(crossLine: CrossLine) {
        this.crossLineGroup.removeChild(crossLine.group);
    }

    constructor(scale: S) {
        this._scale = scale;
        this.refreshScale();
    }

    public destroy() {
        // For override by sub-classes.
    }

    protected refreshScale() {
        this.requestedRange = this.scale.range.slice();
        this.crossLines?.forEach((crossLine) => {
            this.initCrossLine(crossLine);
        });
    }

    protected updateRange() {
        const { requestedRange: rr, visibleRange: vr, scale } = this;
        const span = (rr[1] - rr[0]) / (vr[1] - vr[0]);
        const shift = span * vr[0];
        const start = rr[0] - shift;

        scale.range = [start, start + span];
        this.crossLines?.forEach((crossLine) => {
            crossLine.clippedRange = [rr[0], rr[1]];
        });
    }

    setCrossLinesVisible(visible: boolean) {
        this.crossLineGroup.visible = visible;
    }

    attachAxis(node: Node, nextNode?: Node | null) {
        node.insertBefore(this.gridGroup, nextNode);
        node.insertBefore(this.axisGroup, nextNode);
        node.insertBefore(this.crossLineGroup, nextNode);
    }

    detachAxis(node: Node) {
        node.removeChild(this.gridGroup);
        node.removeChild(this.axisGroup);
        node.removeChild(this.crossLineGroup);
    }

    /**
     * Checks if a point or an object is in range.
     * @param x A point (or object's starting point).
     * @param width Object's width.
     * @param tolerance Expands the range on both ends by this amount.
     */
    inRange(x: number, width = 0, tolerance = 0): boolean {
        return this.inRangeEx(x, width, tolerance) === 0;
    }

    inRangeEx(x: number, width = 0, tolerance = 0): -1 | 0 | 1 {
        const { range } = this;
        // Account for inverted ranges, for example [500, 100] as well as [100, 500]
        const min = Math.min(range[0], range[1]);
        const max = Math.max(range[0], range[1]);
        if (x + width < min - tolerance) {
            return -1; // left of range
        }
        if (x > max + tolerance) {
            return 1; // right of range
        }
        return 0; // in range
    }

    protected requestedRange: number[] = [0, 1];
    set range(value: number[]) {
        this.requestedRange = value.slice();
    }
    get range(): number[] {
        return this.requestedRange;
    }

    protected _visibleRange: number[] = [0, 1];
    set visibleRange(value: number[]) {
        if (value && value.length === 2) {
            let [min, max] = value;
            min = Math.max(0, min);
            max = Math.min(1, max);
            min = Math.min(min, max);
            max = Math.max(min, max);
            this._visibleRange = [min, max];
            this.updateRange();
        }
    }
    get visibleRange(): number[] {
        return this._visibleRange.slice();
    }

    protected labelFormatter?: (datum: any) => string;
    protected onLabelFormatChange(ticks: any[], format?: string) {
        const { scale, fractionDigits } = this;
        const logScale = scale instanceof LogScale;

        const defaultLabelFormatter =
            !logScale && fractionDigits > 0
                ? (x: any) => (typeof x === 'number' ? x.toFixed(fractionDigits) : String(x))
                : (x: any) => String(x);

        if (format && scale && scale.tickFormat) {
            try {
                this.labelFormatter = scale.tickFormat({
                    ticks,
                    specifier: format,
                });
            } catch (e) {
                this.labelFormatter = defaultLabelFormatter;
                Logger.warnOnce(`the axis label format string ${format} is invalid. No formatting will be applied`);
            }
        } else {
            this.labelFormatter = defaultLabelFormatter;
        }
    }

    protected _title: Caption | undefined = undefined;
    set title(value: Caption | undefined) {
        const oldTitle = this._title;
        if (oldTitle !== value) {
            if (oldTitle) {
                this.axisGroup.removeChild(oldTitle.node);
            }

            if (value) {
                value.node.rotation = -Math.PI / 2;
                this.axisGroup.appendChild(value.node);
            }

            this._title = value;

            // position title so that it doesn't briefly get rendered in the top left hand corner of the canvas before update is called.
            this.setTickCount(this.tick.count);
            this.setTickInterval(this.tick.interval);
            this.updateTitle({ ticks: this.scale.ticks!() });
        }
    }
    get title(): Caption | undefined {
        return this._title;
    }

    private setDomain() {
        const {
            scale,
            dataDomain,
            tick: { values: tickValues },
        } = this;
        if (tickValues && scale instanceof ContinuousScale) {
            const [tickMin, tickMax] = extent(tickValues) ?? [Infinity, -Infinity];
            const min = Math.min(scale.fromDomain(dataDomain[0]), tickMin);
            const max = Math.max(scale.fromDomain(dataDomain[1]), tickMax);
            scale.domain = [scale.toDomain(min), scale.toDomain(max)];
        } else {
            scale.domain = dataDomain;
        }
    }

    private setTickInterval(interval?: TickInterval<S>) {
        this.scale.interval = this.tick.interval ?? interval;
    }

    private setTickCount(count?: TickCount<S> | number, minTickCount?: number, maxTickCount?: number) {
        const { scale } = this;
        if (!(count && scale instanceof ContinuousScale)) {
            return;
        }

        if (typeof count === 'number') {
            scale.tickCount = count;
            scale.minTickCount = minTickCount ?? 0;
            scale.maxTickCount = maxTickCount ?? Infinity;
            return;
        }

        if (scale instanceof TimeScale) {
            this.setTickInterval(count);
        }
    }

    /**
     * The length of the grid. The grid is only visible in case of a non-zero value.
     * In case {@link radialGrid} is `true`, the value is interpreted as an angle
     * (in degrees).
     */
    protected _gridLength: number = 0;
    set gridLength(value: number) {
        // Was visible and now invisible, or was invisible and now visible.
        if ((this._gridLength && !value) || (!this._gridLength && value)) {
            this.gridLineGroupSelection = this.gridLineGroupSelection.clear();
            this.gridArcGroupSelection = this.gridArcGroupSelection.clear();
        }

        this._gridLength = value;

        this.crossLines?.forEach((crossLine) => {
            this.initCrossLine(crossLine);
        });
    }
    get gridLength(): number {
        return this._gridLength;
    }

    /**
     * The array of styles to cycle through when rendering grid lines.
     * For example, use two {@link GridStyle} objects for alternating styles.
     * Contains only one {@link GridStyle} object by default, meaning all grid lines
     * have the same style.
     */
    @Validate(GRID_STYLE)
    gridStyle: AgAxisGridStyle[] = [
        {
            stroke: 'rgba(219, 219, 219, 1)',
            lineDash: [4, 2],
        },
    ];

    /**
     * `false` - render grid as lines of {@link gridLength} that extend the ticks
     *           on the opposite side of the axis
     * `true` - render grid as concentric circles that go through the ticks
     */
    private _radialGrid: boolean = false;
    set radialGrid(value: boolean) {
        if (this._radialGrid !== value) {
            this._radialGrid = value;
            this.gridLineGroupSelection = this.gridLineGroupSelection.clear();
            this.gridArcGroupSelection = this.gridArcGroupSelection.clear();
        }
    }
    get radialGrid(): boolean {
        return this._radialGrid;
    }

    private fractionDigits = 0;

    /**
     * The distance between the grid ticks and the axis ticks.
     */
    gridPadding = 0;

    /**
     * Is used to avoid collisions between axis labels and series.
     */
    seriesAreaPadding = 0;

    /**
     * Creates/removes/updates the scene graph nodes that constitute the axis.
     */
    update(primaryTickCount?: number): number | undefined {
        this.initScale();
        this.updatePosition();
        this.updateLine();
        const { rotation, parallelFlipRotation, regularFlipRotation } = this.calculateRotations();

        const sideFlag = this.label.getSideFlag();
        const labelX = sideFlag * (this.tick.size + this.label.padding + this.seriesAreaPadding);
        const ticksResult = this.getTicks({
            primaryTickCount,
            parallelFlipRotation,
            regularFlipRotation,
            labelX,
            sideFlag,
        });

        primaryTickCount = ticksResult.primaryTickCount;

        const { tickData, combinedRotation, textBaseline, textAlign } = ticksResult;

        this.updateSelections(tickData.ticks);
        // When the scale domain or the ticks change, the label format may change
        this.onLabelFormatChange(tickData.rawTicks, this.label.format);
        this.updateLabels({
            tickLabelGroupSelection: this.tickLabelGroupSelection,
            combinedRotation,
            textBaseline,
            textAlign,
            labelX,
        });

        this.layout.label = {
            align: textAlign,
            baseline: textBaseline,
            rotation: combinedRotation,
            fractionDigits: this.fractionDigits,
            padding: this.label.padding,
            format: this.label.format,
        };

        const anyTickVisible = this.updateVisibility();
        this.updateGridLines();
        this.updateCrossLines({ rotation, parallelFlipRotation, regularFlipRotation });
        this.updateTitle({ ticks: tickData.rawTicks });
        this.updateTickLines(anyTickVisible);

        return primaryTickCount;
    }

    private initScale() {
        this.updateRange();
        this.calculateDomain();

        const { scale, nice } = this;

        this.setDomain();
        this.setTickInterval(this.tick.interval);

        if (!(scale instanceof ContinuousScale)) {
            return;
        }

        scale.nice = nice;
        this.setTickCount(this.tick.count);
        scale.update();
    }

    private calculateRotations() {
        const rotation = toRadians(this.rotation);
        // When labels are parallel to the axis line, the `parallelFlipFlag` is used to
        // flip the labels to avoid upside-down text, when the axis is rotated
        // such that it is in the right hemisphere, i.e. the angle of rotation
        // is in the [0, π] interval.
        // The rotation angle is normalized, so that we have an easier time checking
        // if it's in the said interval. Since the axis is always rendered vertically
        // and then rotated, zero rotation means 12 (not 3) o-clock.
        // -1 = flip
        //  1 = don't flip (default)
        const parallelFlipRotation = normalizeAngle360(rotation);
        const regularFlipRotation = normalizeAngle360(rotation - Math.PI / 2);
        return { rotation, parallelFlipRotation, regularFlipRotation };
    }

    private getTicks({
        primaryTickCount,
        parallelFlipRotation,
        regularFlipRotation,
        labelX,
        sideFlag,
    }: {
        primaryTickCount?: number;
        parallelFlipRotation: number;
        regularFlipRotation: number;
        labelX: number;
        sideFlag: Flag;
    }): {
        tickData: TickData;
        primaryTickCount?: number;
        combinedRotation: number;
        textBaseline: CanvasTextBaseline;
        textAlign: CanvasTextAlign;
    } {
        const {
            scale,
            label: {
                enabled: enabledLabels,
                avoidCollisions,
                autoWrap,
                parallel,
                rotation,
                fontFamily,
                fontSize,
                fontStyle,
                fontWeight,
            },
        } = this;

        const { maxTickCount, minTickCount, defaultTickCount } = this.estimateTickCount({
            minSpacing: this.tick.minSpacing,
            maxSpacing: this.tick.maxSpacing,
        });

        const continuous = scale instanceof ContinuousScale;
        const secondaryAxis = primaryTickCount !== undefined;
        const checkForOverlap =
            !autoWrap &&
            enabledLabels &&
            avoidCollisions &&
            this.tick.interval === undefined &&
            this.tick.values === undefined;
        const filterTicks = checkForOverlap && !(continuous && this.tick.count === undefined);

        const { defaultRotation, configuredRotation, parallelFlipFlag, regularFlipFlag } = calculateLabelRotation({
            rotation,
            parallel,
            regularFlipRotation,
            parallelFlipRotation,
        });

        const tickData: TickData = {
            rawTicks: [],
            ticks: [],
            labelCount: 0,
        };

        let autoRotation = 0;
        let textAlign = getTextAlign(parallel, configuredRotation, autoRotation, sideFlag, regularFlipFlag);
        const textBaseline = getTextBaseline(parallel, configuredRotation, sideFlag, parallelFlipFlag);

        const textProps: TextSizeProperties = {
            fontFamily,
            fontSize,
            fontStyle,
            fontWeight,
            textBaseline,
            textAlign,
        };

        const labelMatrix = new Matrix();

        const maxIterations = this.tick.count || !continuous || isNaN(maxTickCount) ? 10 : maxTickCount;
        let i = 0;
        let labelOverlap = true;
        while (labelOverlap) {
            let unchanged = true;
            while (unchanged) {
                if (i > maxIterations) {
                    // The iteration count `i` is used to reduce the default tick count until all labels fit without overlapping
                    // `i` cannot exceed `defaultTickCount` as it would lead to negative tick count values.
                    // Break out of the while loops when then iteration count reaches `defaultTickCount`
                    break;
                }

                const prevTicks = tickData.rawTicks;
                const tickCount = this.tick.count ?? Math.max(defaultTickCount - i, minTickCount);

                const { rawTicks, ticks, labelCount } = this.generateTicks({
                    previousTicks: prevTicks,
                    tickCount,
                    minTickCount,
                    maxTickCount,
                    primaryTickCount,
                    secondaryAxis,
                    filterTicks: filterTicks && i !== 0,
                });

                tickData.rawTicks = rawTicks;
                tickData.ticks = ticks;
                tickData.labelCount = labelCount;

                // `ticks instanceof NumericTicks` doesn't work here, so we feature detect.
                this.fractionDigits = (rawTicks as any).fractionDigits >= 0 ? (rawTicks as any).fractionDigits : 0;

                if (!secondaryAxis && rawTicks.length > 0) {
                    primaryTickCount = rawTicks.length;
                }

                unchanged = checkForOverlap ? areArrayNumbersEqual(rawTicks, prevTicks) : false;
                i++;
            }

            if (unchanged) {
                break;
            }

            const ticksResult = tickData.ticks;

            if (!checkForOverlap) {
                if (autoWrap) {
                    this.wrapLabels(ticksResult, tickData.labelCount, textProps);
                }
                labelOverlap = false;
                break;
            }

            ({ labelOverlap, autoRotation, textAlign } = this.getAutoRotation(
                ticksResult,
                labelX,
                parallel,
                sideFlag,
                regularFlipFlag,
                textProps,
                labelMatrix,
                configuredRotation,
                defaultRotation
            ));
        }

        const combinedRotation = defaultRotation + configuredRotation + autoRotation;

        return { tickData, primaryTickCount, combinedRotation, textBaseline, textAlign };
    }

    private getAutoRotation(
        tickData: TickDatum[],
        labelX: number,
        parallel: boolean,
        sideFlag: Flag,
        regularFlipFlag: Flag,
        textProps: TextSizeProperties,
        labelMatrix: Matrix,
        configuredRotation: number,
        defaultRotation: number
    ): { labelOverlap: boolean; autoRotation: number; textAlign: CanvasTextAlign } {
        const { label } = this;

        const initialRotation = configuredRotation + defaultRotation;
        Matrix.updateTransformMatrix(labelMatrix, 1, 1, initialRotation, 0, 0);

        let textAlign = getTextAlign(parallel, configuredRotation, 0, sideFlag, regularFlipFlag);
        let labelData: PointLabelDatum[] = this.createLabelData(
            tickData,
            labelX,
            { ...textProps, textAlign },
            labelMatrix
        );

        let labelSpacing = getLabelSpacing(label.minSpacing, !!configuredRotation);
        let labelOverlap = axisLabelsOverlap(labelData, labelSpacing);
        const autoRotate = labelOverlap && label.rotation === undefined && label.autoRotate === true;

        if (!autoRotate) {
            return { labelOverlap, autoRotation: 0, textAlign };
        }

        const autoRotation = normalizeAngle360(toRadians(label.autoRotateAngle));
        const rotated = !!(configuredRotation || autoRotation);

        const updatedRotation = initialRotation + autoRotation;
        Matrix.updateTransformMatrix(labelMatrix, 1, 1, updatedRotation, 0, 0);

        textAlign = getTextAlign(parallel, configuredRotation, autoRotation, sideFlag, regularFlipFlag);
        labelData = this.createLabelData(tickData, labelX, { ...textProps, textAlign }, labelMatrix);

        labelSpacing = getLabelSpacing(this.label.minSpacing, rotated);
        labelOverlap = axisLabelsOverlap(labelData, labelSpacing);

        return { labelOverlap, autoRotation, textAlign };
    }

    private createLabelData(
        tickData: TickDatum[],
        labelX: number,
        textProps: TextSizeProperties,
        labelMatrix: Matrix
    ): PointLabelDatum[] {
        const labelData: PointLabelDatum[] = [];
        for (let i = 0; i < tickData.length; i++) {
            const { tickLabel, translationY } = tickData[i];
            if (tickLabel === '' || tickLabel == undefined) {
                // skip user hidden ticks
                continue;
            }

            const lines = splitText(tickLabel);

            const { width, height } = measureText(lines, labelX, translationY, textProps);

            const bbox = new BBox(labelX, translationY, width, height);

            const labelDatum = calculateLabelBBox(tickLabel, bbox, labelX, translationY, labelMatrix);

            labelData.push(labelDatum);
        }
        return labelData;
    }

    private generateTicks({
        previousTicks,
        tickCount,
        minTickCount,
        maxTickCount,
        secondaryAxis,
        filterTicks,
        primaryTickCount,
    }: {
        previousTicks: TickDatum[];
        tickCount: number;
        minTickCount: number;
        maxTickCount: number;
        secondaryAxis: boolean;
        filterTicks: boolean;
        primaryTickCount?: number;
    }) {
        const { scale } = this;

        let rawTicks: any[] = [];

        if (this.tick.values) {
            rawTicks = this.tick.values;
        } else if (secondaryAxis) {
            // `updateSecondaryAxisTicks` mutates `scale.domain` based on `primaryTickCount`
            rawTicks = this.updateSecondaryAxisTicks(primaryTickCount);
        } else if (filterTicks) {
            rawTicks = this.filterTicks(previousTicks, tickCount);
        } else {
            rawTicks = this.createTicks(tickCount, minTickCount, maxTickCount);
        }

        const halfBandwidth = (this.scale.bandwidth || 0) / 2;
        const ticks: TickDatum[] = [];

        let labelCount = 0;
        for (let i = 0; i < rawTicks.length; i++) {
            const rawTick = rawTicks[i];
            const translationY = scale.convert(rawTick) + halfBandwidth;

            const tickLabel = this.formatTick(rawTick, i);
            ticks.push({ tick: rawTick, tickLabel, translationY });

            if (tickLabel === '' || tickLabel == undefined) {
                continue;
            }
            labelCount++;
        }

        return { rawTicks, ticks, labelCount };
    }

    private filterTicks(ticks: any, tickCount: number): any[] {
        const tickSpacing = !isNaN(this.tick.minSpacing) || !isNaN(this.tick.maxSpacing);
        const keepEvery = tickSpacing ? Math.ceil(ticks.length / tickCount) : 2;
        return ticks.filter((_: any, i: number) => i % keepEvery === 0);
    }

    private createTicks(tickCount: number, minTickCount: number, maxTickCount: number) {
        this.setTickCount(tickCount, minTickCount, maxTickCount);
        return this.scale.ticks!();
    }

    private estimateTickCount({ minSpacing, maxSpacing }: { minSpacing: number; maxSpacing: number }): {
        minTickCount: number;
        maxTickCount: number;
        defaultTickCount: number;
    } {
        const availableRange = this.calculateAvailableRange();

        const defaultMinSpacing = Math.max(
            Axis.defaultTickMinSpacing,
            availableRange / ContinuousScale.defaultMaxTickCount
        );

        if (isNaN(minSpacing) && isNaN(maxSpacing)) {
            minSpacing = defaultMinSpacing;
            maxSpacing = availableRange;

            if (minSpacing > maxSpacing) {
                // Take automatic minSpacing if there is a conflict.
                maxSpacing = minSpacing;
            }
        } else if (isNaN(minSpacing)) {
            minSpacing = defaultMinSpacing;

            if (minSpacing > maxSpacing) {
                // Take user-suplied maxSpacing if there is a conflict.
                minSpacing = maxSpacing;
            }
        } else if (isNaN(maxSpacing)) {
            maxSpacing = availableRange;

            if (minSpacing > maxSpacing) {
                // Take user-suplied minSpacing if there is a conflict.
                maxSpacing = minSpacing;
            }
        }

        const maxTickCount = Math.max(1, Math.floor(availableRange / minSpacing));
        const minTickCount = Math.min(maxTickCount, Math.ceil(availableRange / maxSpacing));

        let defaultTickCount = ContinuousScale.defaultTickCount;
        if (defaultTickCount > maxTickCount) {
            defaultTickCount = maxTickCount;
        } else if (defaultTickCount < minTickCount) {
            defaultTickCount = minTickCount;
        }

        return { minTickCount, maxTickCount, defaultTickCount };
    }

    private updateVisibility(): boolean {
        const { requestedRange } = this;

        const requestedRangeMin = Math.min(...requestedRange);
        const requestedRangeMax = Math.max(...requestedRange);

        let anyTickVisible = false;
        const visibleFn = (node: Line | Text | Arc) => {
            const min = Math.floor(requestedRangeMin);
            const max = Math.ceil(requestedRangeMax);
            if (min === max) {
                node.visible = false;
                return;
            }

            // Fix an effect of rounding error
            if (node.translationY >= min - 1 && node.translationY < min) {
                node.translationY = min;
            }
            if (node.translationY > max && node.translationY <= max + 1) {
                node.translationY = max;
            }

            const visible = node.translationY >= min && node.translationY <= max;
            if (visible) {
                anyTickVisible = true;
            }
            node.visible = visible;
        };

        const { gridLineGroupSelection, gridArcGroupSelection, tickLineGroupSelection, tickLabelGroupSelection } = this;
        gridLineGroupSelection.each(visibleFn);
        gridArcGroupSelection.each(visibleFn);
        tickLineGroupSelection.each(visibleFn);
        tickLabelGroupSelection.each(visibleFn);

        this.tickLineGroup.visible = this.tick.enabled && anyTickVisible;
        this.tickLabelGroup.visible = this.label.enabled && anyTickVisible;
        this.gridLineGroup.visible = anyTickVisible;
        this.gridArcGroup.visible = anyTickVisible;

        return anyTickVisible;
    }

    private updateCrossLines({
        rotation,
        parallelFlipRotation,
        regularFlipRotation,
    }: {
        rotation: number;
        parallelFlipRotation: number;
        regularFlipRotation: number;
    }) {
        const anySeriesActive = this.isAnySeriesActive();
        const sideFlag = this.label.getSideFlag();
        this.crossLines?.forEach((crossLine) => {
            crossLine.sideFlag = -sideFlag as Flag;
            crossLine.direction = rotation === -Math.PI / 2 ? ChartAxisDirection.X : ChartAxisDirection.Y;
            crossLine.label.parallel = crossLine.label.parallel ?? this.label.parallel;
            crossLine.parallelFlipRotation = parallelFlipRotation;
            crossLine.regularFlipRotation = regularFlipRotation;
            crossLine.update(anySeriesActive);
        });
    }

    private updateTickLines(anyTickVisible: boolean) {
        const { tick, label } = this;
        const sideFlag = label.getSideFlag();
        this.tickLineGroupSelection.each((line) => {
            line.strokeWidth = tick.width;
            line.stroke = tick.color;
            line.visible = anyTickVisible;
            line.x1 = sideFlag * tick.size;
            line.x2 = 0;
            line.y1 = 0;
            line.y2 = 0;
        });
    }

    private calculateAvailableRange(): number {
        const { requestedRange } = this;

        const min = Math.min(...requestedRange);
        const max = Math.max(...requestedRange);

        return max - min;
    }

    protected calculateDomain() {
        // Placeholder for subclasses to override.
    }

    updatePosition() {
        const {
            label,
            crossLineGroup,
            axisGroup,
            gridGroup,
            translation,
            gridLineGroupSelection,
            gridPadding,
            gridLength,
        } = this;
        const rotation = toRadians(this.rotation);
        const sideFlag = label.getSideFlag();

        const translationX = Math.floor(translation.x);
        const translationY = Math.floor(translation.y);

        crossLineGroup.translationX = translationX;
        crossLineGroup.translationY = translationY;
        crossLineGroup.rotation = rotation;

        axisGroup.translationX = translationX;
        axisGroup.translationY = translationY;
        axisGroup.rotation = rotation;

        gridGroup.translationX = translationX;
        gridGroup.translationY = translationY;
        gridGroup.rotation = rotation;

        gridLineGroupSelection.each((line) => {
            line.x1 = gridPadding;
            line.x2 = -sideFlag * gridLength + gridPadding;
            line.y1 = 0;
            line.y2 = 0;
        });
    }

    updateSecondaryAxisTicks(_primaryTickCount: number | undefined): any[] {
        throw new Error('AG Charts - unexpected call to updateSecondaryAxisTicks() - check axes configuration.');
    }

    private updateSelections(data: TickDatum[]) {
        const gridData = this.gridLength ? data : [];
        const gridLineGroupSelection = this.radialGrid
            ? this.gridLineGroupSelection
            : this.gridLineGroupSelection.update(gridData, (group) => {
                  const node = new Line();
                  node.tag = Tags.GridLine;
                  group.append(node);
              });
        const gridArcGroupSelection = this.radialGrid
            ? this.gridArcGroupSelection.update(gridData, (group) => {
                  const node = new Arc();
                  node.tag = Tags.GridArc;
                  group.append(node);
              })
            : this.gridArcGroupSelection;
        const tickLineGroupSelection = this.tickLineGroupSelection.update(data, (group) => {
            const line = new Line();
            line.tag = Tags.TickLine;
            group.appendChild(line);
        });
        const tickLabelGroupSelection = this.tickLabelGroupSelection.update(data, (group) => {
            const text = new Text();
            text.tag = Tags.TickLabel;
            group.appendChild(text);
        });

        // We need raw `translationY` values on `datum` for accurate label collision detection in axes.update()
        // But node `translationY` values must be rounded to get pixel grid alignment
        const translationFn = (node: Line | Arc | Text) => (node.translationY = Math.round(node.datum.translationY));
        gridLineGroupSelection.each(translationFn);
        gridArcGroupSelection.each(translationFn);
        tickLineGroupSelection.each(translationFn);
        tickLabelGroupSelection.each(translationFn);

        this.tickLineGroupSelection = tickLineGroupSelection;
        this.tickLabelGroupSelection = tickLabelGroupSelection;
        this.gridLineGroupSelection = gridLineGroupSelection;
        this.gridArcGroupSelection = gridArcGroupSelection;
    }

    private updateGridLines() {
        const { gridStyle, scale, tick, gridPadding, gridLength } = this;
        if (gridLength && gridStyle.length) {
            const styleCount = gridStyle.length;
            let grid: Selection<Line | Arc, Group>;

            if (this.radialGrid) {
                const angularGridLength = normalizeAngle360Inclusive(toRadians(gridLength));
                const halfBandwidth = (this.scale.bandwidth || 0) / 2;

                grid = this.gridArcGroupSelection.each((arc, datum) => {
                    const radius = Math.round(scale.convert(datum) + halfBandwidth);

                    arc.centerX = 0;
                    arc.centerY = scale.range[0] - radius;
                    arc.endAngle = angularGridLength;
                    arc.radius = radius;
                });
            } else {
                const sideFlag = this.label.getSideFlag();
                grid = this.gridLineGroupSelection.each((line) => {
                    line.x1 = gridPadding;
                    line.x2 = -sideFlag * gridLength + gridPadding;
                    line.y1 = 0;
                    line.y2 = 0;
                });
            }

            grid.each((node, _, index) => {
                const style = gridStyle[index % styleCount];

                node.stroke = style.stroke;
                node.strokeWidth = tick.width;
                node.lineDash = style.lineDash;
                node.fill = undefined;
            });
        }
    }

    private updateLabels({
        tickLabelGroupSelection,
        combinedRotation,
        textBaseline,
        textAlign,
        labelX,
    }: {
        tickLabelGroupSelection: Selection<Text, any>;
        combinedRotation: number;
        textBaseline: CanvasTextBaseline;
        textAlign: CanvasTextAlign;
        labelX: number;
    }) {
        const {
            label,
            label: { enabled: labelsEnabled },
        } = this;

        if (!labelsEnabled) {
            return { labelData: [], rotated: false };
        }

        // Apply label option values
        tickLabelGroupSelection.each((node, datum) => {
            const { tickLabel } = datum;
            node.fontStyle = label.fontStyle;
            node.fontWeight = label.fontWeight;
            node.fontSize = label.fontSize;
            node.fontFamily = label.fontFamily;
            node.fill = label.color;
            node.text = tickLabel;
            const userHidden = node.text === '' || node.text == undefined;

            if (userHidden) {
                node.visible = false; // hide empty labels
                return;
            }

            // Position labels
            node.textBaseline = textBaseline;
            node.textAlign = textAlign;
            node.x = labelX;
            node.rotationCenterX = labelX;
            node.rotation = combinedRotation;
            node.visible = true;
        });
    }

    private wrapLabels(tickData: TickDatum[], labelCount: number, labelProps: TextSizeProperties) {
        const {
            label: { parallel, maxWidth, maxHeight },
        } = this;

        const defaultMaxLabelWidth = parallel
            ? Math.round(this.calculateAvailableRange() / labelCount)
            : this.maxThickness;
        const maxLabelWidth = maxWidth ?? defaultMaxLabelWidth;

        const defaultMaxLabelHeight = parallel
            ? this.maxThickness
            : Math.round(this.calculateAvailableRange() / labelCount);
        const maxLabelHeight = maxHeight ?? defaultMaxLabelHeight;

        tickData.forEach((tickDatum) => {
            const { tickLabel } = tickDatum;
            const wrappedTickLabel = Text.wrap(tickLabel, maxLabelWidth, maxLabelHeight, labelProps, {
                breakWord: true,
                hyphens: true,
            });
            tickDatum.tickLabel = wrappedTickLabel;
        });
    }

    private updateLine() {
        // Render axis line.
        const { lineNode, requestedRange } = this;

        lineNode.x1 = 0;
        lineNode.x2 = 0;
        lineNode.y1 = requestedRange[0];
        lineNode.y2 = requestedRange[1];
        lineNode.strokeWidth = this.line.width;
        lineNode.stroke = this.line.color;
        lineNode.visible = true;
    }

    private updateTitle({ ticks }: { ticks: any[] }): void {
        const { label, rotation, title, lineNode, requestedRange, tickLineGroup, tickLabelGroup } = this;

        if (!title) {
            return;
        }

        let titleVisible = false;
        if (title.enabled && lineNode.visible) {
            titleVisible = true;

            const sideFlag = label.getSideFlag();
            const parallelFlipRotation = normalizeAngle360(rotation);
            const padding = Caption.PADDING;
            const titleNode = title.node;
            const titleRotationFlag =
                sideFlag === -1 && parallelFlipRotation > Math.PI && parallelFlipRotation < Math.PI * 2 ? -1 : 1;

            titleNode.rotation = (titleRotationFlag * sideFlag * Math.PI) / 2;
            titleNode.x = Math.floor((titleRotationFlag * sideFlag * (requestedRange[0] + requestedRange[1])) / 2);

            let bboxYDimension = 0;
            // TODO: make a boolean to see whether the axis is visible
            if (ticks?.length > 0) {
                const tickBBox = Group.computeBBox([tickLineGroup, tickLabelGroup]);
                const tickWidth = rotation === 0 ? tickBBox.width : tickBBox.height;
                if (Math.abs(tickWidth) < Infinity) {
                    bboxYDimension += tickWidth;
                }
            }
            if (sideFlag === -1) {
                titleNode.y = Math.floor(titleRotationFlag * (-padding - bboxYDimension));
            } else {
                titleNode.y = Math.floor(-padding - bboxYDimension);
            }
            titleNode.textBaseline = titleRotationFlag === 1 ? 'bottom' : 'top';
        }

        title.node.visible = titleVisible;
    }

    // For formatting (nice rounded) tick values.
    formatTick(datum: any, index: number): string {
        const { label, labelFormatter, fractionDigits } = this;

        if (label.formatter) {
            return label.formatter({
                value: fractionDigits > 0 ? datum : String(datum),
                index,
                fractionDigits,
                formatter: labelFormatter,
            });
        } else if (labelFormatter) {
            return labelFormatter(datum);
        }
        // The axis is using a logScale or the`datum` is an integer, a string or an object
        return String(datum);
    }

    // For formatting arbitrary values between the ticks.
    formatDatum(datum: any): string {
        return String(datum);
    }

    @Validate(NUMBER(0))
    thickness: number = 0;
    maxThickness: number = Infinity;

    computeBBox(): BBox {
        return this.axisGroup.computeBBox();
    }

    initCrossLine(crossLine: CrossLine) {
        crossLine.scale = this.scale;
        crossLine.gridLength = this.gridLength;
    }

    isAnySeriesActive() {
        return false;
    }

    clipTickLines(x: number, y: number, width: number, height: number) {
        this.tickLineGroup.setClipRectInGroupCoordinateSpace(new BBox(x, y, width, height));
    }

    clipGrid(x: number, y: number, width: number, height: number) {
        this.gridGroup.setClipRectInGroupCoordinateSpace(new BBox(x, y, width, height));
    }

    calculatePadding(min: number, _max: number): number {
        return Math.abs(min * 0.01);
    }
}
