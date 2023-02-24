import { Scale } from './scale/scale';
import { Node } from './scene/node';
import { Group } from './scene/group';
import { Selection } from './scene/selection';
import { Line } from './scene/shape/line';
import { Text } from './scene/shape/text';
import { Arc } from './scene/shape/arc';
import { BBox } from './scene/bbox';
import { Caption } from './caption';
import { createId } from './util/id';
import { normalizeAngle360, normalizeAngle360Inclusive, toRadians } from './util/angle';
import { doOnce } from './util/function';
import { TimeInterval } from './util/time/interval';
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
import { calculateLabelRotation } from './chart/label';

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

interface AxisNodeDatum {
    readonly tick: any;
    readonly translationY: number;
}

type TickCount<S> = S extends TimeScale ? number | TimeInterval : number;

export type TickInterval<S> = S extends TimeScale ? number | TimeInterval : number;

export class AxisLine {
    @Validate(NUMBER(0))
    width: number = 1;

    @Validate(OPT_COLOR_STRING)
    color?: string = 'rgba(195, 195, 195, 1)';
}

class AxisTick<S extends Scale<D, number>, D = any> {
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
    static readonly defaultTickMinSpacing = 80;

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

    private tickLineGroupSelection = Selection.select(this.tickLineGroup).selectAll<Line>();
    private tickLabelGroupSelection = Selection.select(this.tickLabelGroup).selectAll<Text>();
    private gridLineGroupSelection = Selection.select(this.gridLineGroup).selectAll<Line>();
    private gridArcGroupSelection = Selection.select(this.gridArcGroup).selectAll<Arc>();

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
        this.updateRange();
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
                doOnce(
                    () =>
                        console.warn(
                            `AG Charts - the axis label format string ${format} is invalid. No formatting will be applied`
                        ),
                    `invalid axis label format string ${format}`
                );
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

    private setTickCount(count?: TickCount<S> | number) {
        const { scale } = this;
        if (!(count && scale instanceof ContinuousScale)) {
            return;
        }

        if (typeof count === 'number') {
            scale.tickCount = count;
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
            this.gridLineGroupSelection = this.gridLineGroupSelection.remove().setData([]);
            this.gridArcGroupSelection = this.gridArcGroupSelection.remove().setData([]);
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
            this.gridLineGroupSelection = this.gridLineGroupSelection.remove().setData([]);
            this.gridArcGroupSelection = this.gridArcGroupSelection.remove().setData([]);
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
     * Creates/removes/updates the scene graph nodes that constitute the axis.
     */
    update(primaryTickCount?: number): number | undefined {
        this.calculateDomain();

        const {
            scale,
            gridLength,
            tick,
            label: { parallel: parallelLabels, mirrored, avoidCollisions },
            requestedRange,
        } = this;
        const requestedRangeMin = Math.min(...requestedRange);
        const requestedRangeMax = Math.max(...requestedRange);
        const rotation = toRadians(this.rotation);
        const anySeriesActive = this.isAnySeriesActive();

        // The side of the axis line to position the labels on.
        // -1 = left (default)
        //  1 = right
        const sideFlag = mirrored ? 1 : -1;
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

        const nice = this.nice;
        this.setDomain();

        this.setTickInterval(this.tick.interval);

        if (scale instanceof ContinuousScale) {
            scale.nice = nice;
            this.setTickCount(this.tick.count);
            scale.update();
        }

        const halfBandwidth = (scale.bandwidth || 0) / 2;

        this.updatePosition();
        this.updateLine();

        let i = 0;
        let labelOverlap = true;
        let ticks: any[] = [];
        const { maxTickCount, minTickCount } = this.estimateTickCount({
            minSpacing: this.tick.minSpacing,
            maxSpacing: this.tick.maxSpacing,
        });
        const continuous = scale instanceof ContinuousScale;
        const secondaryAxis = primaryTickCount !== undefined;

        const checkForOverlap = avoidCollisions && this.tick.interval === undefined && this.tick.values === undefined;
        const tickSpacing = !isNaN(this.tick.minSpacing) || !isNaN(this.tick.maxSpacing);
        const maxIterations = this.tick.count || !continuous ? 10 : maxTickCount;

        while (labelOverlap) {
            let unchanged = true;
            while (unchanged) {
                if (i > maxIterations) {
                    // The iteration count `i` is used to reduce the default tick count until all labels fit without overlapping
                    // `i` cannot exceed `defaultTickCount` as it would lead to negative tick count values.
                    // Break out of the while loops when then iteration count reaches `defaultTickCount`
                    break;
                }

                const prevTicks = ticks;
                const tickCount = Math.max(maxTickCount - i, minTickCount);

                const filterTicks =
                    checkForOverlap && !(continuous && this.tick.count === undefined) && (tickSpacing || i !== 0);

                if (this.tick.values) {
                    ticks = this.tick.values;
                } else if (maxTickCount === 0) {
                    ticks = [];
                } else if (i === 0 || !filterTicks) {
                    this.setTickCount(this.tick.count ?? tickCount);
                    ticks = scale.ticks!();
                }

                if (filterTicks) {
                    const keepEvery = tickSpacing ? Math.ceil(ticks.length / tickCount) : 2;
                    ticks = ticks.filter((_, i) => i % keepEvery === 0);
                }

                let secondaryAxisTicks;
                if (secondaryAxis) {
                    // `updateSecondaryAxisTicks` mutates `scale.domain` based on `primaryTickCount`
                    secondaryAxisTicks = this.updateSecondaryAxisTicks(primaryTickCount);
                    ticks = secondaryAxisTicks;
                }

                this.updateSelections({
                    halfBandwidth,
                    gridLength,
                    ticks,
                });

                if (!secondaryAxis && ticks.length > 0) {
                    primaryTickCount = ticks.length;
                }

                unchanged = checkForOverlap ? ticks.every((t, i) => Number(t) === Number(prevTicks[i])) : false;
                i++;
            }

            if (unchanged) {
                break;
            }

            // When the scale domain or the ticks change, the label format may change
            this.onLabelFormatChange(ticks, this.label.format);

            const { labelData, rotated } = this.updateLabels({
                parallelFlipRotation,
                regularFlipRotation,
                sideFlag,
                tickLabelGroupSelection: this.tickLabelGroupSelection,
                ticks,
            });

            const labelSpacing = this.getLabelSpacing(rotated);

            // no need for further iterations if `avoidCollisions` is false
            labelOverlap = checkForOverlap ? axisLabelsOverlap(labelData, labelSpacing) : false;
        }

        this.updateGridLines({
            gridLength,
            halfBandwidth,
            sideFlag,
        });

        let anyTickVisible = false;
        const visibleFn = (node: Line | Text | Arc) => {
            const min = Math.floor(requestedRangeMin);
            const max = Math.ceil(requestedRangeMax);
            if (min === max) {
                return false;
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
            return visible;
        };

        const { gridLineGroupSelection, gridArcGroupSelection, tickLineGroupSelection, tickLabelGroupSelection } = this;
        gridLineGroupSelection.attrFn('visible', visibleFn);
        gridArcGroupSelection.attrFn('visible', visibleFn);
        tickLineGroupSelection.attrFn('visible', visibleFn);
        tickLabelGroupSelection.attrFn('visible', visibleFn);

        this.tickLineGroup.visible = anyTickVisible;
        this.tickLabelGroup.visible = anyTickVisible;
        this.gridLineGroup.visible = anyTickVisible;
        this.gridArcGroup.visible = anyTickVisible;

        this.crossLines?.forEach((crossLine) => {
            crossLine.sideFlag = -sideFlag as -1 | 1;
            crossLine.direction = rotation === -Math.PI / 2 ? ChartAxisDirection.X : ChartAxisDirection.Y;
            crossLine.label.parallel =
                crossLine.label.parallel !== undefined ? crossLine.label.parallel : parallelLabels;
            crossLine.parallelFlipRotation = parallelFlipRotation;
            crossLine.regularFlipRotation = regularFlipRotation;
            crossLine.update(anySeriesActive);
        });

        this.updateTitle({ ticks });

        tickLineGroupSelection
            .each((line) => {
                line.strokeWidth = tick.width;
                line.stroke = tick.color;
                line.visible = anyTickVisible;
            })
            .attr('x1', sideFlag * tick.size)
            .attr('x2', 0)
            .attr('y1', 0)
            .attr('y2', 0);

        return primaryTickCount;
    }

    private estimateTickCount({ minSpacing, maxSpacing }: { minSpacing: number; maxSpacing: number }): {
        minTickCount: number;
        maxTickCount: number;
    } {
        const { requestedRange } = this;

        const min = Math.min(...requestedRange);
        const max = Math.max(...requestedRange);

        const availableRange = max - min;

        const defaultMinSpacing = Math.max(
            Axis.defaultTickMinSpacing,
            availableRange / ContinuousScale.defaultTickCount
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

        minSpacing = Math.max(minSpacing, defaultMinSpacing);

        const maxTickCount = Math.max(1, Math.floor(availableRange / minSpacing));
        const minTickCount = Math.ceil(availableRange / maxSpacing);

        return { minTickCount, maxTickCount };
    }

    private getLabelSpacing(rotated?: boolean): number {
        const { label, tick } = this;
        if (!isNaN(label.minSpacing) && !isNaN(tick.minSpacing)) {
            return Math.max(label.minSpacing, tick.minSpacing);
        } else if (!isNaN(label.minSpacing)) {
            return label.minSpacing;
        } else if (!isNaN(tick.minSpacing)) {
            return tick.minSpacing;
        }
        return rotated ? 0 : 10;
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
        const sideFlag = label.mirrored ? 1 : -1;

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

    private updateTickGroupSelection({
        data,
        tickSelection,
        node,
        tag,
    }: {
        data: AxisNodeDatum[];
        tickSelection: Selection<Text | Line, any>;
        node: new () => Text | Line;
        tag: Tags;
    }) {
        const updateSelection = tickSelection.setData(data);
        updateSelection.exit.remove();

        // Line auto-snaps to pixel grid if vertical or horizontal.
        const enterSelection = updateSelection.enter.append(node).each((node) => (node.tag = tag));

        return updateSelection.merge(enterSelection);
    }

    private updateGridLineGroupSelection({ gridLength, data }: { gridLength: number; data: AxisNodeDatum[] }) {
        const updateGridLines = this.gridLineGroupSelection.setData(gridLength ? data : []);
        updateGridLines.exit.remove();
        let gridLineGroupSelection = updateGridLines;
        if (gridLength) {
            const tagFn = (node: Line | Arc) => (node.tag = Tags.GridLine);
            const enterGridLines = updateGridLines.enter.append(Line).each(tagFn);
            gridLineGroupSelection = updateGridLines.merge(enterGridLines);
        }

        return gridLineGroupSelection;
    }

    private updateGridArcGroupSelection({ gridLength, data }: { gridLength: number; data: AxisNodeDatum[] }) {
        const updateGridArcs = this.gridArcGroupSelection.setData(gridLength ? data : []);
        updateGridArcs.exit.remove();
        let gridArcGroupSelection = updateGridArcs;
        if (gridLength) {
            const tagFn = (node: Line | Arc) => (node.tag = Tags.GridArc);
            const enterGridArcs = updateGridArcs.enter.append(Arc).each(tagFn);
            gridArcGroupSelection = updateGridArcs.merge(enterGridArcs);
        }

        return gridArcGroupSelection;
    }

    private updateSelections({
        ticks,
        halfBandwidth,
        gridLength,
    }: {
        ticks: any[];
        halfBandwidth: number;
        gridLength: number;
    }) {
        const { scale } = this;
        const data = ticks.map((t) => ({ tick: t, translationY: scale.convert(t) + halfBandwidth }));
        const gridLineGroupSelection = this.radialGrid
            ? this.gridLineGroupSelection
            : this.updateGridLineGroupSelection({ gridLength, data });
        const gridArcGroupSelection = this.radialGrid
            ? this.updateGridArcGroupSelection({ gridLength, data })
            : this.gridArcGroupSelection;
        const tickLineGroupSelection = this.updateTickGroupSelection({
            data,
            tickSelection: this.tickLineGroupSelection,
            node: Line,
            tag: Tags.TickLine,
        });
        const tickLabelGroupSelection = this.updateTickGroupSelection({
            data,
            tickSelection: this.tickLabelGroupSelection,
            node: Text,
            tag: Tags.TickLabel,
        });

        // We need raw `translationY` values on `datum` for accurate label collision detection in axes.update()
        // But node `translationY` values must be rounded to get pixel grid alignment
        gridLineGroupSelection.attrFn('translationY', (_, datum: any) => Math.round(datum.translationY));
        gridArcGroupSelection.attrFn('translationY', (_, datum: any) => Math.round(datum.translationY));
        tickLineGroupSelection.attrFn('translationY', (_, datum: any) => Math.round(datum.translationY));
        tickLabelGroupSelection.attrFn('translationY', (_, datum: any) => Math.round(datum.translationY));

        this.tickLineGroupSelection = tickLineGroupSelection as Selection<Line, any, AxisNodeDatum, any>;
        this.tickLabelGroupSelection = tickLabelGroupSelection as Selection<Text, any, AxisNodeDatum, any>;
        this.gridLineGroupSelection = gridLineGroupSelection;
        this.gridArcGroupSelection = gridArcGroupSelection;
    }

    private updateGridLines({
        gridLength,
        halfBandwidth,
        sideFlag,
    }: {
        gridLength: number;
        halfBandwidth: number;
        sideFlag: -1 | 1;
    }) {
        const { gridStyle, scale, tick, gridPadding } = this;
        if (gridLength && gridStyle.length) {
            const styleCount = gridStyle.length;
            let grid: Selection<Line | Arc, Group, D, D>;

            if (this.radialGrid) {
                const angularGridLength = normalizeAngle360Inclusive(toRadians(gridLength));

                grid = this.gridArcGroupSelection.each((arc, datum) => {
                    const radius = Math.round(scale.convert(datum) + halfBandwidth);

                    arc.centerX = 0;
                    arc.centerY = scale.range[0] - radius;
                    arc.endAngle = angularGridLength;
                    arc.radius = radius;
                });
            } else {
                grid = this.gridLineGroupSelection.each((line) => {
                    line.x1 = gridPadding;
                    line.x2 = -sideFlag * gridLength + gridPadding;
                    line.y1 = 0;
                    line.y2 = 0;
                    line.visible = Math.abs(line.parent!.translationY - scale.range[0]) > 1;
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
        ticks,
        tickLabelGroupSelection,
        sideFlag,
        parallelFlipRotation,
        regularFlipRotation,
    }: {
        ticks: any[];
        tickLabelGroupSelection: Selection<Text, any>;
        sideFlag: -1 | 1;
        parallelFlipRotation: number;
        regularFlipRotation: number;
    }) {
        const {
            label,
            label: { parallel, rotation },
            tick,
        } = this;
        let labelAutoRotation = 0;

        const { autoRotation, labelRotation, parallelFlipFlag, regularFlipFlag } = calculateLabelRotation({
            rotation,
            parallel,
            regularFlipRotation,
            parallelFlipRotation,
        });

        // `ticks instanceof NumericTicks` doesn't work here, so we feature detect.
        this.fractionDigits = (ticks as any).fractionDigits >= 0 ? (ticks as any).fractionDigits : 0;

        // Update properties that affect the size of the axis labels and measure the labels
        const labelBboxes: Map<number, BBox | null> = new Map();

        const labelX = sideFlag * (tick.size + label.padding);

        const labelMatrix = new Matrix();
        Matrix.updateTransformMatrix(labelMatrix, 1, 1, autoRotation, 0, 0);

        let labelData: PointLabelDatum[] = [];

        const labelSelection = tickLabelGroupSelection.each((node, datum, index) => {
            const { tick, translationY } = datum;
            node.fontStyle = label.fontStyle;
            node.fontWeight = label.fontWeight;
            node.fontSize = label.fontSize;
            node.fontFamily = label.fontFamily;
            node.fill = label.color;
            node.text = this.formatTickDatum(tick, index);

            const userHidden = node.text === '' || node.text == undefined;

            const bbox = node.computeBBox();
            const { width, height } = bbox;

            const translatedBBox = new BBox(labelX, translationY, 0, 0);
            labelMatrix.transformBBox(translatedBBox, bbox);

            const { x = 0, y = 0 } = bbox;
            bbox.width = width;
            bbox.height = height;

            labelBboxes.set(index, userHidden ? null : bbox);

            if (userHidden) {
                return;
            }

            labelData.push({
                point: {
                    x,
                    y,
                    size: 0,
                },
                label: {
                    width,
                    height,
                    text: '',
                },
            });
        });

        const labelSpacing = this.getLabelSpacing();
        const rotate = axisLabelsOverlap(labelData, labelSpacing);

        if (label.rotation === undefined && label.autoRotate === true && rotate) {
            // When no user label rotation angle has been specified and the width of any label exceeds the average tick gap (`rotate` is `true`),
            // automatically rotate the labels
            labelAutoRotation = normalizeAngle360(toRadians(label.autoRotateAngle));
        }

        let labelTextBaseline: 'hanging' | 'bottom' | 'middle' = 'middle';
        if (parallel && !labelRotation) {
            if (sideFlag * parallelFlipFlag === -1) {
                labelTextBaseline = 'hanging';
            } else {
                labelTextBaseline = 'bottom';
            }
        }

        const labelRotated = labelRotation > 0 && labelRotation <= Math.PI;
        const labelAutoRotated = labelAutoRotation > 0 && labelAutoRotation <= Math.PI;
        const alignFlag = labelRotated || labelAutoRotated ? -1 : 1;

        let labelTextAlign: 'start' | 'end' | 'center' = 'start';
        if (parallel) {
            if (labelRotation || labelAutoRotation) {
                if (sideFlag * alignFlag === -1) {
                    labelTextAlign = 'end';
                }
            } else {
                labelTextAlign = 'center';
            }
        } else if (sideFlag * regularFlipFlag === -1) {
            labelTextAlign = 'end';
        }

        const combinedRotation = autoRotation + labelRotation + labelAutoRotation;
        if (combinedRotation) {
            Matrix.updateTransformMatrix(labelMatrix, 1, 1, combinedRotation, 0, 0);
        }

        labelData = [];
        labelSelection.each((label, datum, index) => {
            if (label.text === '' || label.text == undefined) {
                label.visible = false; // hide empty labels
                return;
            }

            label.textBaseline = labelTextBaseline;
            label.textAlign = labelTextAlign;
            label.x = labelX;
            label.rotationCenterX = labelX;
            label.rotation = combinedRotation;

            // Text.computeBBox() does not take into account any of the transformations that have been applied to the label nodes, only the width and height are useful.
            // Rather than taking into account all transformations including those of parent nodes which would be the result of `computeTransformedBBox()`, giving the x and y in the entire axis coordinate space,
            // take into account only the rotation and translation applied to individual label nodes to get the x y coordinates of the labels relative to each other
            // this makes label collision detection a lot simpler

            const bbox = labelBboxes.get(index);
            if (!bbox) {
                return;
            }

            label.visible = true;

            const { width = 0, height = 0 } = bbox;

            const { translationY } = datum;
            const translatedBBox = new BBox(labelX, translationY, 0, 0);
            labelMatrix.transformBBox(translatedBBox, bbox);

            const { x = 0, y = 0 } = bbox;

            labelData.push({
                point: {
                    x,
                    y,
                    size: 0,
                },
                label: {
                    width,
                    height,
                    text: label.text,
                },
            });
        });

        return { labelData, rotated: !!(labelRotation || labelAutoRotation) };
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

            const sideFlag = label.mirrored ? 1 : -1;
            const parallelFlipRotation = normalizeAngle360(rotation);
            const padding = Caption.PADDING;
            const titleNode = title.node;
            const titleRotationFlag =
                sideFlag === -1 && parallelFlipRotation > Math.PI && parallelFlipRotation < Math.PI * 2 ? -1 : 1;

            titleNode.rotation = (titleRotationFlag * sideFlag * Math.PI) / 2;
            titleNode.x = Math.floor((titleRotationFlag * sideFlag * (requestedRange[0] + requestedRange[1])) / 2);

            let bboxYDimension = 0;
            if (ticks?.length > 0) {
                const tickBBox = this.computeBBoxForGroups(tickLineGroup, tickLabelGroup);
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
    formatTickDatum(datum: any, index: number): string {
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

    computeBBoxForGroups(...groups: Group[]) {
        let left = Infinity;
        let right = -Infinity;
        let top = Infinity;
        let bottom = -Infinity;

        groups.forEach((g) => {
            if (!g.visible) {
                return;
            }
            const bbox = g.computeTransformedBBox();
            if (!bbox) {
                return;
            }

            const x = bbox.x;
            const y = bbox.y;

            if (x < left) {
                left = x;
            }
            if (y < top) {
                top = y;
            }
            if (x + bbox.width > right) {
                right = x + bbox.width;
            }
            if (y + bbox.height > bottom) {
                bottom = y + bbox.height;
            }
        });

        return new BBox(left, top, right - left, bottom - top);
    }

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
}
