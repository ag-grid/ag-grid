import { Scale } from './scale/scale';
import { Group } from './scene/group';
import { Selection } from './scene/selection';
import { Line } from './scene/shape/line';
import { Text, FontStyle, FontWeight } from './scene/shape/text';
import { Arc } from './scene/shape/arc';
import { Shape } from './scene/shape/shape';
import { BBox } from './scene/bbox';
import { Caption } from './caption';
import { createId } from './util/id';
import { normalizeAngle360, normalizeAngle360Inclusive, toRadians } from './util/angle';
import { doOnce } from './util/function';
import { ContinuousScale } from './scale/continuousScale';
import { CountableTimeInterval } from './util/time/interval';
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
    OPT_STRING,
} from './util/validation';
import { ChartAxisDirection } from './chart/chartAxis';
import { Layers } from './chart/layers';

enum Tags {
    Tick,
    GridLine,
}

export interface GridStyle {
    stroke?: string;
    lineDash?: number[];
}

type TickCount = number | CountableTimeInterval;
export class AxisTick {
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
    @Validate(OPT_STRING)
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
    count?: TickCount = undefined;
}

export interface AxisLabelFormatterParams {
    value: any;
    index: number;
    fractionDigits?: number;
    formatter?: (x: any) => string;
    axis?: any;
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
     * The color of the labels.
     * Use `undefined` rather than `rgba(0, 0, 0, 0)` to make labels invisible.
     */
    @Validate(STRING)
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
    formatter?: (params: AxisLabelFormatterParams) => string = undefined;

    onFormatChange?: (format?: string) => void = undefined;

    @Validate(STRING)
    private _format: string | undefined;
    set format(value: string | undefined) {
        // See `TimeLocaleObject` docs for the list of supported format directives.
        if (this._format !== value) {
            this._format = value;
            if (this.onFormatChange) {
                this.onFormatChange(value);
            }
        }
    }
    get format(): string | undefined {
        return this._format;
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
export class Axis<S extends Scale<D, number>, D = any> {
    readonly id = createId(this);

    protected _scale!: S;
    set scale(value: S) {
        this._scale = value;
        this.requestedRange = value.range.slice();
        this.onLabelFormatChange();
        this.crossLines?.forEach((crossLine) => {
            this.initCrossLine(crossLine);
        });
    }
    get scale(): S {
        return this._scale;
    }

    ticks?: any[];
    protected getTicks() {
        return this.ticks ?? this.scale.ticks!(this.calculatedTickCount);
    }

    readonly axisGroup = new Group({ name: `${this.id}-axis`, layer: true, zIndex: Layers.AXIS_ZINDEX });
    readonly crossLineGroup: Group = new Group({ name: `${this.id}-CrossLines` });

    private readonly lineGroup = this.axisGroup.appendChild(new Group({ name: `${this.id}-Line` }));
    private readonly tickGroup = this.axisGroup.appendChild(new Group({ name: `${this.id}-Tick` }));
    private readonly titleGroup = this.axisGroup.appendChild(new Group({ name: `${this.id}-Title` }));
    private tickGroupSelection = Selection.select(this.tickGroup).selectAll<Group>();
    private lineNode = this.lineGroup.appendChild(new Line());

    readonly gridlineGroup = new Group({
        name: `${this.id}-gridline`,
        layer: true,
        zIndex: Layers.AXIS_GRIDLINES_ZINDEX,
    });
    private gridlineGroupSelection = Selection.select(this.gridlineGroup).selectAll<Group>();

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
    } = {
        width: 1,
        color: 'rgba(195, 195, 195, 1)',
    };

    readonly tick = new AxisTick();
    readonly label = new AxisLabel();

    readonly translation = { x: 0, y: 0 };
    rotation: number = 0; // axis rotation angle in degrees

    private _labelAutoRotated: boolean = false;
    get labelAutoRotated(): boolean {
        return this._labelAutoRotated;
    }

    /**
     * This will be assigned a value when `this.calculateTickCount` is invoked.
     * If the user has specified a tick count, it will be used, otherwise a tick count will be calculated based on the available range.
     */
    protected _calculatedTickCount?: TickCount = undefined;
    get calculatedTickCount() {
        return this._calculatedTickCount ?? this.tick.count;
    }

    private attachCrossLine(crossLine: CrossLine) {
        this.crossLineGroup.appendChild(crossLine.group);
    }

    private detachCrossLine(crossLine: CrossLine) {
        this.crossLineGroup.removeChild(crossLine.group);
    }

    /**
     * Overridden in ChartAxis subclass.
     * Sets an appropriate tick count based on the available range.
     */
    calculateTickCount(_availableRange: number): void {
        // Override point for subclasses.
    }

    /**
     * Meant to be overridden in subclasses to provide extra context the the label formatter.
     * The return value of this function will be passed to the laber.formatter as the `axis` parameter.
     */
    getMeta(): any {
        // Override point for subclasses.
    }

    constructor(scale: S) {
        this.scale = scale;

        this.label.onFormatChange = this.onLabelFormatChange.bind(this);
    }

    protected updateRange() {
        const { requestedRange: rr, visibleRange: vr, scale } = this;
        const span = (rr[1] - rr[0]) / (vr[1] - vr[0]);
        const shift = span * vr[0];
        const start = rr[0] - shift;

        scale.range = [start, start + span];
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

    set domain(value: D[]) {
        this.scale.domain = value.slice();
        this.onLabelFormatChange(this.label.format);
    }
    get domain(): D[] {
        return this.scale.domain.slice();
    }

    protected labelFormatter?: (datum: any) => string;
    protected onLabelFormatChange(format?: string) {
        const { scale } = this;
        if (format && scale && scale.tickFormat) {
            try {
                this.labelFormatter = scale.tickFormat({
                    ticks: this.getTicks(),
                    count: this.calculatedTickCount,
                    specifier: format,
                });
            } catch (e) {
                this.labelFormatter = undefined;
                doOnce(
                    () =>
                        console.warn(
                            `AG Charts - the axis label format string ${format} is invalid. No formatting will be applied`
                        ),
                    `invalid axis label format string ${format}`
                );
            }
        } else {
            this.labelFormatter = undefined;
        }
    }

    protected _title: Caption | undefined = undefined;
    set title(value: Caption | undefined) {
        const oldTitle = this._title;
        if (oldTitle !== value) {
            if (oldTitle) {
                this.titleGroup.removeChild(oldTitle.node);
            }

            if (value) {
                value.node.rotation = -Math.PI / 2;
                this.titleGroup.appendChild(value.node);
            }

            this._title = value;

            // position title so that it doesn't briefly get rendered in the top left hand corner of the canvas before update is called.
            this.updateTitle({ ticks: this.ticks || this.scale.ticks!(this.calculatedTickCount) });
        }
    }
    get title(): Caption | undefined {
        return this._title;
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
            this.gridlineGroupSelection = this.gridlineGroupSelection.remove().setData([]);
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
    gridStyle: GridStyle[] = [
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
            this.gridlineGroupSelection = this.gridlineGroupSelection.remove().setData([]);
        }
    }
    get radialGrid(): boolean {
        return this._radialGrid;
    }

    private fractionDigits = 0;

    /**
     * Creates/removes/updates the scene graph nodes that constitute the axis.
     */
    update() {
        const {
            axisGroup,
            gridlineGroup,
            crossLineGroup,
            scale,
            gridLength,
            tick,
            label,
            requestedRange,
            translation,
        } = this;
        const requestedRangeMin = Math.min(...requestedRange);
        const requestedRangeMax = Math.max(...requestedRange);
        const rotation = toRadians(this.rotation);
        const parallelLabels = label.parallel;

        const translationX = Math.floor(translation.x);
        const translationY = Math.floor(translation.y);

        crossLineGroup.translationX = translationX;
        crossLineGroup.translationY = translationY;
        crossLineGroup.rotation = rotation;

        axisGroup.translationX = translationX;
        axisGroup.translationY = translationY;
        axisGroup.rotation = rotation;

        gridlineGroup.translationX = translationX;
        gridlineGroup.translationY = translationY;
        gridlineGroup.rotation = rotation;

        this.updateLine();

        // The side of the axis line to position the labels on.
        // -1 = left (default)
        //  1 = right
        const sideFlag = label.mirrored ? 1 : -1;
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
        const halfBandwidth = (scale.bandwidth || 0) / 2;

        const ticks = this.getTicks();

        const tickGroupSelection = this.updateTicks({ ticks });
        const labelBboxes = this.updateLabels({
            parallelFlipRotation,
            regularFlipRotation,
            sideFlag,
            tickLineGroupSelection: tickGroupSelection,
            ticks,
        });
        const gridlineGroupSelection = this.updateGridLines({
            gridLength,
            ticks,
            halfBandwidth,
            labelBboxes,
            sideFlag,
        });

        this.tickGroupSelection = tickGroupSelection;
        this.gridlineGroupSelection = gridlineGroupSelection;

        let anyTickVisible = false;
        const translationYFn = (_: unknown, datum: any) => Math.round(scale.convert(datum) + halfBandwidth);
        const visibleFn = (node: Group) => {
            const min = Math.floor(requestedRangeMin);
            const max = Math.ceil(requestedRangeMax);
            const visible = min !== max && node.translationY >= min && node.translationY <= max;
            anyTickVisible = visible || anyTickVisible;
            return visible;
        };

        tickGroupSelection.attrFn('translationY', translationYFn).attrFn('visible', visibleFn);
        gridlineGroupSelection.attrFn('translationY', translationYFn).attrFn('visible', visibleFn);

        this.tickGroup.visible = anyTickVisible;
        this.gridlineGroup.visible = anyTickVisible;

        if (!anyTickVisible) {
            this.crossLines?.forEach((crossLine) => {
                crossLine.update(anyTickVisible);
            });
            this.updateTitle({ ticks });
            return;
        }

        tickGroupSelection
            .selectByTag<Line>(Tags.Tick)
            .each((line, _, index) => {
                line.strokeWidth = tick.width;
                line.stroke = tick.color;
                line.visible = labelBboxes.has(index);
            })
            .attr('x1', sideFlag * tick.size)
            .attr('x2', 0)
            .attr('y1', 0)
            .attr('y2', 0);

        this.updateTitle({ ticks });

        this.crossLines?.forEach((crossLine) => {
            crossLine.sideFlag = -sideFlag as -1 | 1;
            crossLine.direction = rotation === -Math.PI / 2 ? ChartAxisDirection.X : ChartAxisDirection.Y;
            crossLine.label.parallel =
                crossLine.label.parallel !== undefined ? crossLine.label.parallel : parallelLabels;
            crossLine.parallelFlipRotation = parallelFlipRotation;
            crossLine.regularFlipRotation = regularFlipRotation;
            crossLine.update(anyTickVisible);
        });
    }

    private updateTicks({ ticks }: { ticks: any[] }) {
        const updateAxis = this.tickGroupSelection.setData(ticks);
        updateAxis.exit.remove();

        const enterAxis = updateAxis.enter.append(Group);
        // Line auto-snaps to pixel grid if vertical or horizontal.
        enterAxis.append(Line).each((node) => (node.tag = Tags.Tick));
        enterAxis.append(Text);

        return updateAxis.merge(enterAxis);
    }

    private updateGridLines({
        gridLength,
        ticks,
        labelBboxes,
        halfBandwidth,
        sideFlag,
    }: {
        gridLength: number;
        ticks: any[];
        labelBboxes: Map<number, BBox | null>;
        halfBandwidth: number;
        sideFlag: -1 | 1;
    }) {
        const { gridStyle, scale, tick } = this;

        const updateGridlines = this.gridlineGroupSelection.setData(gridLength ? ticks : []);
        updateGridlines.exit.remove();
        let gridlineGroupSelection = updateGridlines;
        if (gridLength) {
            const tagFn = (node: Line | Arc) => (node.tag = Tags.GridLine);
            const enterGridline = updateGridlines.enter.append(Group);
            if (this.radialGrid) {
                enterGridline.append(Arc).each(tagFn);
            } else {
                enterGridline.append(Line).each(tagFn);
            }
            gridlineGroupSelection = updateGridlines.merge(enterGridline);
        }

        if (gridLength && gridStyle.length) {
            const styleCount = gridStyle.length;
            let gridLines: Selection<Shape, Group, D, D>;

            if (this.radialGrid) {
                const angularGridLength = normalizeAngle360Inclusive(toRadians(gridLength));

                gridLines = gridlineGroupSelection.selectByTag<Arc>(Tags.GridLine).each((arc, datum, index) => {
                    const radius = Math.round(scale.convert(datum) + halfBandwidth);

                    arc.centerX = 0;
                    arc.centerY = scale.range[0] - radius;
                    arc.endAngle = angularGridLength;
                    arc.radiusX = radius;
                    arc.radiusY = radius;
                    arc.visible = labelBboxes.has(index);
                });
            } else {
                gridLines = gridlineGroupSelection.selectByTag<Line>(Tags.GridLine).each((line, _, index) => {
                    line.x1 = 0;
                    line.x2 = -sideFlag * gridLength;
                    line.y1 = 0;
                    line.y2 = 0;
                    line.visible = Math.abs(line.parent!.translationY - scale.range[0]) > 1 && labelBboxes.has(index);
                });
            }

            gridLines.each((gridLine, _, index) => {
                const style = gridStyle[index % styleCount];

                gridLine.stroke = style.stroke;
                gridLine.strokeWidth = tick.width;
                gridLine.lineDash = style.lineDash;
                gridLine.fill = undefined;
            });
        }

        return gridlineGroupSelection;
    }

    private updateLabels({
        ticks,
        tickLineGroupSelection,
        sideFlag,
        parallelFlipRotation,
        regularFlipRotation,
    }: {
        ticks: any[];
        tickLineGroupSelection: Selection<Group, any>;
        sideFlag: -1 | 1;
        parallelFlipRotation: number;
        regularFlipRotation: number;
    }) {
        const {
            label,
            label: { parallel: parallelLabels },
            scale,
            tick,
            requestedRange,
        } = this;
        const requestedRangeMin = Math.min(...requestedRange);
        const requestedRangeMax = Math.max(...requestedRange);
        let labelAutoRotation = 0;

        const labelRotation = label.rotation ? normalizeAngle360(toRadians(label.rotation)) : 0;
        const parallelFlipFlag =
            !labelRotation && parallelFlipRotation >= 0 && parallelFlipRotation <= Math.PI ? -1 : 1;
        // Flip if the axis rotation angle is in the top hemisphere.
        const regularFlipFlag = !labelRotation && regularFlipRotation >= 0 && regularFlipRotation <= Math.PI ? -1 : 1;

        // `ticks instanceof NumericTicks` doesn't work here, so we feature detect.
        this.fractionDigits = (ticks as any).fractionDigits >= 0 ? (ticks as any).fractionDigits : 0;

        // Update properties that affect the size of the axis labels and measure the labels
        const labelBboxes: Map<number, BBox | null> = new Map();
        let labelCount = 0;

        let halfFirstLabelLength = false;
        let halfLastLabelLength = false;
        const availableRange = requestedRangeMax - requestedRangeMin;
        const labelSelection = tickLineGroupSelection.selectByClass(Text).each((node, datum, index) => {
            node.fontStyle = label.fontStyle;
            node.fontWeight = label.fontWeight;
            node.fontSize = label.fontSize;
            node.fontFamily = label.fontFamily;
            node.fill = label.color;
            node.text = this.formatTickDatum(datum, index);

            node.visible = node.parent!.visible;
            if (node.visible !== true) {
                return;
            }

            const userHidden = node.text === '' || node.text == undefined;
            labelBboxes.set(index, userHidden ? null : node.computeBBox());

            if (userHidden) {
                return;
            }
            labelCount++;

            if (index === 0 && node.translationY === scale.range[0]) {
                halfFirstLabelLength = true; // first label protrudes axis line
            } else if (index === ticks.length - 1 && node.translationY === scale.range[1]) {
                halfLastLabelLength = true; // last label protrudes axis line
            }
        });

        const labelX = sideFlag * (tick.size + label.padding);

        const step = availableRange / labelCount;

        const calculateLabelsLength = (bboxes: Map<number, BBox | null>, useWidth: boolean) => {
            let totalLength = 0;
            let rotate = false;
            const lastIdx = bboxes.size - 1;
            const padding = 12;
            for (let [i, bbox] of bboxes.entries()) {
                if (bbox == null) {
                    continue;
                }

                const divideBy = (i === 0 && halfFirstLabelLength) || (i === lastIdx && halfLastLabelLength) ? 2 : 1;
                const length = useWidth ? bbox.width / divideBy : bbox.height / divideBy;
                const lengthWithPadding = length <= 0 ? 0 : length + padding;
                totalLength += lengthWithPadding;

                if (lengthWithPadding > step) {
                    rotate = true;
                }
            }
            return { totalLength, rotate };
        };

        let useWidth = parallelLabels; // When the labels are parallel to the axis line, use the width of the text to calculate the total length of all labels

        let { totalLength: totalLabelLength, rotate } = calculateLabelsLength(labelBboxes, useWidth);

        this._labelAutoRotated = false;
        if (label.rotation === undefined && label.autoRotate === true && rotate) {
            // When no user label rotation angle has been specified and the width of any label exceeds the average tick gap (`rotate` is `true`),
            // automatically rotate the labels
            labelAutoRotation = normalizeAngle360(toRadians(label.autoRotateAngle));
            this._labelAutoRotated = true;
        }

        if (labelRotation || labelAutoRotation) {
            // If the label rotation angle results in a non-parallel orientation, use the height of the texts to calculate the total length of all labels
            if (parallelLabels) {
                useWidth = labelRotation === Math.PI || labelAutoRotation === Math.PI ? true : false;
            } else {
                useWidth =
                    labelRotation === Math.PI / 2 ||
                    labelRotation === Math.PI + Math.PI / 2 ||
                    labelAutoRotation === Math.PI / 2 ||
                    labelAutoRotation === Math.PI + Math.PI / 2
                        ? true
                        : false;
            }

            totalLabelLength = calculateLabelsLength(labelBboxes, useWidth).totalLength;
        }

        const autoRotation = parallelLabels ? (parallelFlipFlag * Math.PI) / 2 : regularFlipFlag === -1 ? Math.PI : 0;

        const labelTextBaseline =
            parallelLabels && !labelRotation ? (sideFlag * parallelFlipFlag === -1 ? 'hanging' : 'bottom') : 'middle';

        const alignFlag =
            (labelRotation > 0 && labelRotation <= Math.PI) || (labelAutoRotation > 0 && labelAutoRotation <= Math.PI)
                ? -1
                : 1;

        const labelTextAlign = parallelLabels
            ? labelRotation || labelAutoRotation
                ? sideFlag * alignFlag === -1
                    ? 'end'
                    : 'start'
                : 'center'
            : sideFlag * regularFlipFlag === -1
            ? 'end'
            : 'start';

        labelSelection.each((label) => {
            if (label.text === '' || label.text == undefined) {
                label.visible = false; // hide empty labels
                return;
            }

            label.textBaseline = labelTextBaseline;
            label.textAlign = labelTextAlign;
            label.x = labelX;
            label.rotationCenterX = labelX;
            label.rotation = autoRotation + labelRotation + labelAutoRotation;
        });

        if (totalLabelLength > availableRange) {
            const isContinuous = scale instanceof ContinuousScale;

            const averageLabelLength = totalLabelLength / labelCount;
            const labelsToShow = Math.floor(availableRange / averageLabelLength);
            const showEvery = labelsToShow > 2 ? Math.ceil(labelCount / labelsToShow) : labelCount;

            let visibleLabelIndex = 0;
            labelSelection.each((label, _, index) => {
                if (label.visible !== true) {
                    return;
                }

                const forceVisible =
                    isContinuous && this.tick.count === undefined ? index === 0 || index === labelCount - 1 : false; // always show first and last labels for a continuous axis when tick count has not been specified by the user
                label.visible = forceVisible || visibleLabelIndex % showEvery === 0 ? true : false;
                visibleLabelIndex++;

                if (!label.visible) {
                    labelBboxes.delete(index);
                }
            });
        }

        return labelBboxes;
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
        const { label, rotation, title, lineNode, requestedRange, tickGroup, lineGroup } = this;

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

            const lineBBox = lineGroup.computeBBox();
            let bboxYDimension = rotation === 0 ? lineBBox.width : lineBBox.height;
            if (ticks?.length > 0) {
                const tickBBox = tickGroup.computeBBox();
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
        const meta = this.getMeta();

        return label.formatter
            ? label.formatter({
                  value: fractionDigits >= 0 ? datum : String(datum),
                  index,
                  fractionDigits,
                  formatter: labelFormatter,
                  axis: meta,
              })
            : labelFormatter
            ? labelFormatter(datum)
            : typeof datum === 'number' && fractionDigits >= 0
            ? // the `datum` is a floating point number
              datum.toFixed(fractionDigits)
            : // the`datum` is an integer, a string or an object
              String(datum);
    }

    // For formatting arbitrary values between the ticks.
    formatDatum(datum: any): string {
        return String(datum);
    }

    thickness: number = 0;

    computeBBox(): BBox {
        return this.axisGroup.computeBBox();
    }

    initCrossLine(crossLine: CrossLine) {
        crossLine.scale = this.scale;
        crossLine.gridLength = this.gridLength;
    }
}
