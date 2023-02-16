var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
import { Validate, BOOLEAN, OPT_BOOLEAN, NUMBER, OPT_NUMBER, OPT_FONT_STYLE, OPT_FONT_WEIGHT, STRING, OPT_COLOR_STRING, OPTIONAL, ARRAY, predicateWithMessage, OPT_STRING, OPT_ARRAY, LESS_THAN, NUMBER_OR_NAN, AND, GREATER_THAN, } from './util/validation';
import { Layers } from './chart/layers';
import { axisLabelsOverlap } from './util/labelPlacement';
import { ContinuousScale } from './scale/continuousScale';
import { Matrix } from './scene/matrix';
import { TimeScale } from './scale/timeScale';
import { LogScale } from './scale/logScale';
import { Default } from './util/default';
import { Deprecated } from './util/deprecation';
import { extent } from './util/array';
import { ChartAxisDirection } from './chart/chartAxisDirection';
const TICK_COUNT = predicateWithMessage((v, ctx) => NUMBER(0)(v, ctx) || v instanceof TimeInterval, `expecting a tick count Number value or, for a time axis, a Time Interval such as 'agCharts.time.month'`);
const OPT_TICK_COUNT = predicateWithMessage((v, ctx) => OPTIONAL(v, ctx, TICK_COUNT), `expecting an optional tick count Number value or, for a time axis, a Time Interval such as 'agCharts.time.month'`);
const OPT_TICK_INTERVAL = predicateWithMessage((v, ctx) => OPTIONAL(v, ctx, (v, ctx) => (v !== 0 && NUMBER(0)(v, ctx)) || v instanceof TimeInterval), `expecting an optional non-zero positive Number value or, for a time axis, a Time Interval such as 'agCharts.time.month'`);
const GRID_STYLE_KEYS = ['stroke', 'lineDash'];
const GRID_STYLE = predicateWithMessage(ARRAY(undefined, (o) => {
    for (const key in o) {
        if (!GRID_STYLE_KEYS.includes(key)) {
            return false;
        }
    }
    return true;
}), `expecting an Array of objects with gridline style properties such as 'stroke' and 'lineDash'`);
var Tags;
(function (Tags) {
    Tags[Tags["Tick"] = 0] = "Tick";
    Tags[Tags["GridLine"] = 1] = "GridLine";
})(Tags || (Tags = {}));
export class AxisLine {
    constructor() {
        this.width = 1;
        this.color = 'rgba(195, 195, 195, 1)';
    }
}
__decorate([
    Validate(NUMBER(0))
], AxisLine.prototype, "width", void 0);
__decorate([
    Validate(OPT_COLOR_STRING)
], AxisLine.prototype, "color", void 0);
class AxisTick {
    constructor() {
        /**
         * The line width to be used by axis ticks.
         */
        this.width = 1;
        /**
         * The line length to be used by axis ticks.
         */
        this.size = 6;
        /**
         * The color of the axis ticks.
         * Use `undefined` rather than `rgba(0, 0, 0, 0)` to make the ticks invisible.
         */
        this.color = 'rgba(195, 195, 195, 1)';
        /**
         * A hint of how many ticks to use (the exact number of ticks might differ),
         * a `TimeInterval` or a `CountableTimeInterval`.
         * For example:
         *
         *     axis.tick.count = 5;
         *     axis.tick.count = year;
         *     axis.tick.count = month.every(6);
         */
        this.count = undefined;
        this.interval = undefined;
        this.values = undefined;
        this.minSpacing = NaN;
        this.maxSpacing = NaN;
    }
}
__decorate([
    Validate(NUMBER(0))
], AxisTick.prototype, "width", void 0);
__decorate([
    Validate(NUMBER(0))
], AxisTick.prototype, "size", void 0);
__decorate([
    Validate(OPT_COLOR_STRING)
], AxisTick.prototype, "color", void 0);
__decorate([
    Validate(OPT_TICK_COUNT),
    Deprecated('Use tick.interval or tick.minSpacing and tick.maxSpacing instead')
], AxisTick.prototype, "count", void 0);
__decorate([
    Validate(OPT_TICK_INTERVAL)
], AxisTick.prototype, "interval", void 0);
__decorate([
    Validate(OPT_ARRAY())
], AxisTick.prototype, "values", void 0);
__decorate([
    Validate(AND(NUMBER_OR_NAN(1), LESS_THAN('maxSpacing'))),
    Default(NaN)
], AxisTick.prototype, "minSpacing", void 0);
__decorate([
    Validate(AND(NUMBER_OR_NAN(1), GREATER_THAN('minSpacing'))),
    Default(NaN)
], AxisTick.prototype, "maxSpacing", void 0);
export class AxisLabel {
    constructor() {
        this.fontStyle = undefined;
        this.fontWeight = undefined;
        this.fontSize = 12;
        this.fontFamily = 'Verdana, sans-serif';
        /**
         * The padding between the labels and the ticks.
         */
        this.padding = 5;
        /**
         * Minimum gap in pixels between the axis labels before being removed to avoid collisions.
         */
        this.minSpacing = undefined;
        /**
         * The color of the labels.
         * Use `undefined` rather than `rgba(0, 0, 0, 0)` to make labels invisible.
         */
        this.color = 'rgba(87, 87, 87, 1)';
        /**
         * Custom label rotation in degrees.
         * Labels are rendered perpendicular to the axis line by default.
         * Or parallel to the axis line, if the {@link parallel} is set to `true`.
         * The value of this config is used as the angular offset/deflection
         * from the default rotation.
         */
        this.rotation = undefined;
        /**
         * If specified and axis labels may collide, they are rotated to reduce collisions. If the
         * `rotation` property is specified, it takes precedence.
         */
        this.autoRotate = undefined;
        /**
         * Rotation angle to use when autoRotate is applied.
         */
        this.autoRotateAngle = 335;
        /**
         * Avoid axis label collision by automatically reducing the number of ticks displayed. If set to `false`, axis labels may collide.
         */
        this.avoidCollisions = true;
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
        this.mirrored = false;
        /**
         * Labels are rendered perpendicular to the axis line by default.
         * Setting this config to `true` makes labels render parallel to the axis line
         * and center aligns labels' text at the ticks.
         */
        this.parallel = false;
        /**
         * In case {@param value} is a number, the {@param fractionDigits} parameter will
         * be provided as well. The `fractionDigits` corresponds to the number of fraction
         * digits used by the tick step. For example, if the tick step is `0.0005`,
         * the `fractionDigits` is 4.
         */
        this.formatter = undefined;
        this.format = undefined;
    }
}
__decorate([
    Validate(OPT_FONT_STYLE)
], AxisLabel.prototype, "fontStyle", void 0);
__decorate([
    Validate(OPT_FONT_WEIGHT)
], AxisLabel.prototype, "fontWeight", void 0);
__decorate([
    Validate(NUMBER(1))
], AxisLabel.prototype, "fontSize", void 0);
__decorate([
    Validate(STRING)
], AxisLabel.prototype, "fontFamily", void 0);
__decorate([
    Validate(NUMBER(0))
], AxisLabel.prototype, "padding", void 0);
__decorate([
    Validate(OPT_NUMBER())
], AxisLabel.prototype, "minSpacing", void 0);
__decorate([
    Validate(OPT_COLOR_STRING)
], AxisLabel.prototype, "color", void 0);
__decorate([
    Validate(OPT_NUMBER(-360, 360))
], AxisLabel.prototype, "rotation", void 0);
__decorate([
    Validate(OPT_BOOLEAN)
], AxisLabel.prototype, "autoRotate", void 0);
__decorate([
    Validate(NUMBER(-360, 360))
], AxisLabel.prototype, "autoRotateAngle", void 0);
__decorate([
    Validate(BOOLEAN)
], AxisLabel.prototype, "avoidCollisions", void 0);
__decorate([
    Validate(BOOLEAN)
], AxisLabel.prototype, "mirrored", void 0);
__decorate([
    Validate(BOOLEAN)
], AxisLabel.prototype, "parallel", void 0);
__decorate([
    Validate(OPT_STRING)
], AxisLabel.prototype, "format", void 0);
/**
 * A general purpose linear axis with no notion of orientation.
 * The axis is always rendered vertically, with horizontal labels positioned to the left
 * of the axis line by default. The axis can be {@link rotation | rotated} by an arbitrary angle,
 * so that it can be used as a top, right, bottom, left, radial or any other kind
 * of linear axis.
 * The generic `D` parameter is the type of the domain of the axis' scale.
 * The output range of the axis' scale is always numeric (screen coordinates).
 */
export class Axis {
    constructor(scale) {
        this.id = createId(this);
        this.nice = true;
        this.dataDomain = [];
        this.axisGroup = new Group({ name: `${this.id}-axis`, zIndex: Layers.AXIS_ZINDEX });
        this.crossLineGroup = new Group({ name: `${this.id}-CrossLines` });
        this.lineGroup = this.axisGroup.appendChild(new Group({ name: `${this.id}-Line` }));
        this.tickGroup = this.axisGroup.appendChild(new Group({ name: `${this.id}-Tick` }));
        this.titleGroup = this.axisGroup.appendChild(new Group({ name: `${this.id}-Title` }));
        this.tickGroupSelection = Selection.select(this.tickGroup).selectAll();
        this.lineNode = this.lineGroup.appendChild(new Line());
        this.gridlineGroup = new Group({
            name: `${this.id}-gridline`,
            zIndex: Layers.AXIS_GRIDLINES_ZINDEX,
        });
        this.gridlineGroupSelection = Selection.select(this.gridlineGroup).selectAll();
        this._crossLines = [];
        this.line = new AxisLine();
        this.tick = new AxisTick();
        this.label = new AxisLabel();
        this.translation = { x: 0, y: 0 };
        this.rotation = 0; // axis rotation angle in degrees
        this.requestedRange = [0, 1];
        this._visibleRange = [0, 1];
        this._title = undefined;
        /**
         * The length of the grid. The grid is only visible in case of a non-zero value.
         * In case {@link radialGrid} is `true`, the value is interpreted as an angle
         * (in degrees).
         */
        this._gridLength = 0;
        /**
         * The array of styles to cycle through when rendering grid lines.
         * For example, use two {@link GridStyle} objects for alternating styles.
         * Contains only one {@link GridStyle} object by default, meaning all grid lines
         * have the same style.
         */
        this.gridStyle = [
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
        this._radialGrid = false;
        this.fractionDigits = 0;
        /**
         * The distance between the grid ticks and the axis ticks.
         */
        this.gridPadding = 0;
        this.thickness = 0;
        this._scale = scale;
        this.refreshScale();
    }
    get scale() {
        return this._scale;
    }
    set crossLines(value) {
        var _a, _b;
        (_a = this._crossLines) === null || _a === void 0 ? void 0 : _a.forEach((crossLine) => this.detachCrossLine(crossLine));
        this._crossLines = value;
        (_b = this._crossLines) === null || _b === void 0 ? void 0 : _b.forEach((crossLine) => {
            this.attachCrossLine(crossLine);
            this.initCrossLine(crossLine);
        });
    }
    get crossLines() {
        return this._crossLines;
    }
    attachCrossLine(crossLine) {
        this.crossLineGroup.appendChild(crossLine.group);
    }
    detachCrossLine(crossLine) {
        this.crossLineGroup.removeChild(crossLine.group);
    }
    refreshScale() {
        var _a;
        this.requestedRange = this.scale.range.slice();
        (_a = this.crossLines) === null || _a === void 0 ? void 0 : _a.forEach((crossLine) => {
            this.initCrossLine(crossLine);
        });
    }
    updateRange() {
        var _a;
        const { requestedRange: rr, visibleRange: vr, scale } = this;
        const span = (rr[1] - rr[0]) / (vr[1] - vr[0]);
        const shift = span * vr[0];
        const start = rr[0] - shift;
        scale.range = [start, start + span];
        (_a = this.crossLines) === null || _a === void 0 ? void 0 : _a.forEach((crossLine) => {
            crossLine.clippedRange = [rr[0], rr[1]];
        });
    }
    setCrossLinesVisible(visible) {
        this.crossLineGroup.visible = visible;
    }
    attachAxis(node, nextNode) {
        node.insertBefore(this.gridlineGroup, nextNode);
        node.insertBefore(this.axisGroup, nextNode);
        node.insertBefore(this.crossLineGroup, nextNode);
    }
    detachAxis(node) {
        node.removeChild(this.axisGroup);
        node.removeChild(this.gridlineGroup);
        node.removeChild(this.crossLineGroup);
    }
    /**
     * Checks if a point or an object is in range.
     * @param x A point (or object's starting point).
     * @param width Object's width.
     * @param tolerance Expands the range on both ends by this amount.
     */
    inRange(x, width = 0, tolerance = 0) {
        return this.inRangeEx(x, width, tolerance) === 0;
    }
    inRangeEx(x, width = 0, tolerance = 0) {
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
    set range(value) {
        this.requestedRange = value.slice();
        this.updateRange();
    }
    get range() {
        return this.requestedRange;
    }
    set visibleRange(value) {
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
    get visibleRange() {
        return this._visibleRange.slice();
    }
    onLabelFormatChange(ticks, format) {
        const { scale, fractionDigits } = this;
        const logScale = scale instanceof LogScale;
        const defaultLabelFormatter = !logScale && fractionDigits > 0
            ? (x) => (typeof x === 'number' ? x.toFixed(fractionDigits) : String(x))
            : (x) => String(x);
        if (format && scale && scale.tickFormat) {
            try {
                this.labelFormatter = scale.tickFormat({
                    ticks,
                    specifier: format,
                });
            }
            catch (e) {
                this.labelFormatter = defaultLabelFormatter;
                doOnce(() => console.warn(`AG Charts - the axis label format string ${format} is invalid. No formatting will be applied`), `invalid axis label format string ${format}`);
            }
        }
        else {
            this.labelFormatter = defaultLabelFormatter;
        }
    }
    set title(value) {
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
            this.setTickCount(this.tick.count);
            this.setTickInterval(this.tick.interval);
            this.updateTitle({ ticks: this.scale.ticks() });
        }
    }
    get title() {
        return this._title;
    }
    setDomain() {
        var _a;
        const { scale, dataDomain, tick: { values: tickValues }, } = this;
        if (tickValues && scale instanceof ContinuousScale) {
            const [tickMin, tickMax] = (_a = extent(tickValues)) !== null && _a !== void 0 ? _a : [Infinity, -Infinity];
            const min = Math.min(scale.fromDomain(dataDomain[0]), tickMin);
            const max = Math.max(scale.fromDomain(dataDomain[1]), tickMax);
            scale.domain = [scale.toDomain(min), scale.toDomain(max)];
        }
        else {
            scale.domain = dataDomain;
        }
    }
    setTickInterval(interval) {
        var _a;
        this.scale.interval = (_a = this.tick.interval) !== null && _a !== void 0 ? _a : interval;
    }
    setTickCount(count) {
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
    set gridLength(value) {
        var _a;
        // Was visible and now invisible, or was invisible and now visible.
        if ((this._gridLength && !value) || (!this._gridLength && value)) {
            this.gridlineGroupSelection = this.gridlineGroupSelection.remove().setData([]);
        }
        this._gridLength = value;
        (_a = this.crossLines) === null || _a === void 0 ? void 0 : _a.forEach((crossLine) => {
            this.initCrossLine(crossLine);
        });
    }
    get gridLength() {
        return this._gridLength;
    }
    set radialGrid(value) {
        if (this._radialGrid !== value) {
            this._radialGrid = value;
            this.gridlineGroupSelection = this.gridlineGroupSelection.remove().setData([]);
        }
    }
    get radialGrid() {
        return this._radialGrid;
    }
    /**
     * Creates/removes/updates the scene graph nodes that constitute the axis.
     */
    update(primaryTickCount) {
        var _a, _b;
        this.calculateDomain();
        const { scale, gridLength, tick, label: { parallel: parallelLabels, mirrored, avoidCollisions, minSpacing }, requestedRange, } = this;
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
        let ticks = [];
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
                const filterTicks = checkForOverlap && !(continuous && this.tick.count === undefined) && (tickSpacing || i !== 0);
                if (this.tick.values) {
                    ticks = this.tick.values;
                }
                else if (maxTickCount === 0) {
                    ticks = [];
                }
                else if (i === 0 || !filterTicks) {
                    this.setTickCount((_a = this.tick.count) !== null && _a !== void 0 ? _a : tickCount);
                    ticks = scale.ticks();
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
                tickLineGroupSelection: this.tickGroupSelection,
                ticks,
            });
            const labelPadding = minSpacing !== null && minSpacing !== void 0 ? minSpacing : (rotated ? 0 : 10);
            // no need for further iterations if `avoidCollisions` is false
            labelOverlap = checkForOverlap ? axisLabelsOverlap(labelData, labelPadding) : false;
        }
        this.updateGridLines({
            gridLength,
            halfBandwidth,
            sideFlag,
        });
        let anyTickVisible = false;
        const visibleFn = (node) => {
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
        const { gridlineGroupSelection, tickGroupSelection } = this;
        gridlineGroupSelection.attrFn('visible', visibleFn);
        tickGroupSelection.attrFn('visible', visibleFn);
        this.tickGroup.visible = anyTickVisible;
        this.gridlineGroup.visible = anyTickVisible;
        (_b = this.crossLines) === null || _b === void 0 ? void 0 : _b.forEach((crossLine) => {
            crossLine.sideFlag = -sideFlag;
            crossLine.direction = rotation === -Math.PI / 2 ? ChartAxisDirection.X : ChartAxisDirection.Y;
            crossLine.label.parallel =
                crossLine.label.parallel !== undefined ? crossLine.label.parallel : parallelLabels;
            crossLine.parallelFlipRotation = parallelFlipRotation;
            crossLine.regularFlipRotation = regularFlipRotation;
            crossLine.update(anySeriesActive);
        });
        this.updateTitle({ ticks });
        tickGroupSelection
            .selectByTag(Tags.Tick)
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
    estimateTickCount({ minSpacing, maxSpacing }) {
        const { requestedRange } = this;
        const min = Math.min(...requestedRange);
        const max = Math.max(...requestedRange);
        const availableRange = max - min;
        const defaultMinSpacing = Math.max(Axis.defaultTickMinSpacing, availableRange / ContinuousScale.defaultTickCount);
        if (isNaN(minSpacing) && isNaN(maxSpacing)) {
            minSpacing = defaultMinSpacing;
            maxSpacing = availableRange;
            if (minSpacing > maxSpacing) {
                // Take automatic minSpacing if there is a conflict.
                maxSpacing = minSpacing;
            }
        }
        else if (isNaN(minSpacing)) {
            minSpacing = defaultMinSpacing;
            if (minSpacing > maxSpacing) {
                // Take user-suplied maxSpacing if there is a conflict.
                minSpacing = maxSpacing;
            }
        }
        else if (isNaN(maxSpacing)) {
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
    calculateDomain() {
        // Placeholder for subclasses to override.
    }
    updatePosition() {
        const { label, axisGroup, gridlineGroup, crossLineGroup, translation, gridlineGroupSelection, gridPadding, gridLength, } = this;
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
        gridlineGroup.translationX = translationX;
        gridlineGroup.translationY = translationY;
        gridlineGroup.rotation = rotation;
        gridlineGroupSelection.selectByTag(Tags.GridLine).each((line) => {
            line.x1 = gridPadding;
            line.x2 = -sideFlag * gridLength + gridPadding;
            line.y1 = 0;
            line.y2 = 0;
        });
    }
    updateSecondaryAxisTicks(_primaryTickCount) {
        throw new Error('AG Charts - unexpected call to updateSecondaryAxisTicks() - check axes configuration.');
    }
    updateTickGroupSelection({ data }) {
        const updateAxis = this.tickGroupSelection.setData(data);
        updateAxis.exit.remove();
        const enterAxis = updateAxis.enter.append(Group);
        // Line auto-snaps to pixel grid if vertical or horizontal.
        enterAxis.append(Line).each((node) => (node.tag = Tags.Tick));
        enterAxis.append(Text);
        return updateAxis.merge(enterAxis);
    }
    updateGridLineGroupSelection({ gridLength, data }) {
        const updateGridlines = this.gridlineGroupSelection.setData(gridLength ? data : []);
        updateGridlines.exit.remove();
        let gridlineGroupSelection = updateGridlines;
        if (gridLength) {
            const tagFn = (node) => (node.tag = Tags.GridLine);
            const enterGridline = updateGridlines.enter.append(Group);
            if (this.radialGrid) {
                enterGridline.append(Arc).each(tagFn);
            }
            else {
                enterGridline.append(Line).each(tagFn);
            }
            gridlineGroupSelection = updateGridlines.merge(enterGridline);
        }
        return gridlineGroupSelection;
    }
    updateSelections({ ticks, halfBandwidth, gridLength, }) {
        const { scale } = this;
        const data = ticks.map((t) => ({ tick: t, translationY: scale.convert(t) + halfBandwidth }));
        const gridlineGroupSelection = this.updateGridLineGroupSelection({ gridLength, data });
        const tickGroupSelection = this.updateTickGroupSelection({ data });
        // We need raw `translationY` values on `datum` for accurate label collision detection in axes.update()
        // But node `translationY` values must be rounded to get pixel grid alignment
        gridlineGroupSelection.attrFn('translationY', (_, datum) => Math.round(datum.translationY));
        tickGroupSelection.attrFn('translationY', (_, datum) => Math.round(datum.translationY));
        this.tickGroupSelection = tickGroupSelection;
        this.gridlineGroupSelection = gridlineGroupSelection;
    }
    updateGridLines({ gridLength, halfBandwidth, sideFlag, }) {
        const { gridStyle, scale, tick, gridPadding } = this;
        if (gridLength && gridStyle.length) {
            const styleCount = gridStyle.length;
            let gridLines;
            if (this.radialGrid) {
                const angularGridLength = normalizeAngle360Inclusive(toRadians(gridLength));
                gridLines = this.gridlineGroupSelection.selectByTag(Tags.GridLine).each((arc, datum) => {
                    const radius = Math.round(scale.convert(datum) + halfBandwidth);
                    arc.centerX = 0;
                    arc.centerY = scale.range[0] - radius;
                    arc.endAngle = angularGridLength;
                    arc.radius = radius;
                });
            }
            else {
                gridLines = this.gridlineGroupSelection.selectByTag(Tags.GridLine).each((line) => {
                    line.x1 = gridPadding;
                    line.x2 = -sideFlag * gridLength + gridPadding;
                    line.y1 = 0;
                    line.y2 = 0;
                    line.visible = Math.abs(line.parent.translationY - scale.range[0]) > 1;
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
    }
    updateLabels({ ticks, tickLineGroupSelection, sideFlag, parallelFlipRotation, regularFlipRotation, }) {
        const { label, label: { parallel: parallelLabels, minSpacing }, tick, } = this;
        let labelAutoRotation = 0;
        const labelRotation = label.rotation ? normalizeAngle360(toRadians(label.rotation)) : 0;
        const parallelFlipFlag = !labelRotation && parallelFlipRotation >= 0 && parallelFlipRotation <= Math.PI ? -1 : 1;
        // Flip if the axis rotation angle is in the top hemisphere.
        const regularFlipFlag = !labelRotation && regularFlipRotation >= 0 && regularFlipRotation <= Math.PI ? -1 : 1;
        const autoRotation = parallelLabels ? (parallelFlipFlag * Math.PI) / 2 : regularFlipFlag === -1 ? Math.PI : 0;
        // `ticks instanceof NumericTicks` doesn't work here, so we feature detect.
        this.fractionDigits = ticks.fractionDigits >= 0 ? ticks.fractionDigits : 0;
        // Update properties that affect the size of the axis labels and measure the labels
        const labelBboxes = new Map();
        const labelX = sideFlag * (tick.size + label.padding);
        const labelMatrix = new Matrix();
        Matrix.updateTransformMatrix(labelMatrix, 1, 1, autoRotation, 0, 0);
        let labelData = [];
        const labelSelection = tickLineGroupSelection.selectByClass(Text).each((node, datum, index) => {
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
        const labelPadding = minSpacing !== null && minSpacing !== void 0 ? minSpacing : 10;
        const rotate = axisLabelsOverlap(labelData, labelPadding);
        if (label.rotation === undefined && label.autoRotate === true && rotate) {
            // When no user label rotation angle has been specified and the width of any label exceeds the average tick gap (`rotate` is `true`),
            // automatically rotate the labels
            labelAutoRotation = normalizeAngle360(toRadians(label.autoRotateAngle));
        }
        const labelTextBaseline = parallelLabels && !labelRotation ? (sideFlag * parallelFlipFlag === -1 ? 'hanging' : 'bottom') : 'middle';
        const alignFlag = (labelRotation > 0 && labelRotation <= Math.PI) || (labelAutoRotation > 0 && labelAutoRotation <= Math.PI)
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
    updateLine() {
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
    updateTitle({ ticks }) {
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
            const titleRotationFlag = sideFlag === -1 && parallelFlipRotation > Math.PI && parallelFlipRotation < Math.PI * 2 ? -1 : 1;
            titleNode.rotation = (titleRotationFlag * sideFlag * Math.PI) / 2;
            titleNode.x = Math.floor((titleRotationFlag * sideFlag * (requestedRange[0] + requestedRange[1])) / 2);
            const lineBBox = lineGroup.computeBBox();
            let bboxYDimension = rotation === 0 ? lineBBox.width : lineBBox.height;
            if ((ticks === null || ticks === void 0 ? void 0 : ticks.length) > 0) {
                const tickBBox = tickGroup.computeBBox();
                const tickWidth = rotation === 0 ? tickBBox.width : tickBBox.height;
                if (Math.abs(tickWidth) < Infinity) {
                    bboxYDimension += tickWidth;
                }
            }
            if (sideFlag === -1) {
                titleNode.y = Math.floor(titleRotationFlag * (-padding - bboxYDimension));
            }
            else {
                titleNode.y = Math.floor(-padding - bboxYDimension);
            }
            titleNode.textBaseline = titleRotationFlag === 1 ? 'bottom' : 'top';
        }
        title.node.visible = titleVisible;
    }
    // For formatting (nice rounded) tick values.
    formatTickDatum(datum, index) {
        const { label, labelFormatter, fractionDigits } = this;
        if (label.formatter) {
            return label.formatter({
                value: fractionDigits > 0 ? datum : String(datum),
                index,
                fractionDigits,
                formatter: labelFormatter,
            });
        }
        else if (labelFormatter) {
            return labelFormatter(datum);
        }
        // The axis is using a logScale or the`datum` is an integer, a string or an object
        return String(datum);
    }
    // For formatting arbitrary values between the ticks.
    formatDatum(datum) {
        return String(datum);
    }
    computeBBox() {
        return this.axisGroup.computeBBox();
    }
    initCrossLine(crossLine) {
        crossLine.scale = this.scale;
        crossLine.gridLength = this.gridLength;
    }
    isAnySeriesActive() {
        return false;
    }
}
Axis.defaultTickMinSpacing = 80;
__decorate([
    Validate(BOOLEAN)
], Axis.prototype, "nice", void 0);
__decorate([
    Validate(GRID_STYLE)
], Axis.prototype, "gridStyle", void 0);
__decorate([
    Validate(NUMBER(0))
], Axis.prototype, "thickness", void 0);
