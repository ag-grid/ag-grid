"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Axis = exports.AxisLabel = exports.AxisLine = exports.Tags = void 0;
const group_1 = require("./scene/group");
const selection_1 = require("./scene/selection");
const line_1 = require("./scene/shape/line");
const text_1 = require("./scene/shape/text");
const arc_1 = require("./scene/shape/arc");
const bbox_1 = require("./scene/bbox");
const caption_1 = require("./caption");
const id_1 = require("./util/id");
const angle_1 = require("./util/angle");
const interval_1 = require("./util/time/interval");
const equal_1 = require("./util/equal");
const validation_1 = require("./util/validation");
const layers_1 = require("./chart/layers");
const labelPlacement_1 = require("./util/labelPlacement");
const continuousScale_1 = require("./scale/continuousScale");
const matrix_1 = require("./scene/matrix");
const timeScale_1 = require("./scale/timeScale");
const logScale_1 = require("./scale/logScale");
const default_1 = require("./util/default");
const deprecation_1 = require("./util/deprecation");
const array_1 = require("./util/array");
const chartAxisDirection_1 = require("./chart/chartAxisDirection");
const label_1 = require("./chart/label");
const logger_1 = require("./util/logger");
const TICK_COUNT = validation_1.predicateWithMessage((v, ctx) => validation_1.NUMBER(0)(v, ctx) || v instanceof interval_1.TimeInterval, `expecting a tick count Number value or, for a time axis, a Time Interval such as 'agCharts.time.month'`);
const OPT_TICK_COUNT = validation_1.predicateWithMessage((v, ctx) => validation_1.OPTIONAL(v, ctx, TICK_COUNT), `expecting an optional tick count Number value or, for a time axis, a Time Interval such as 'agCharts.time.month'`);
const OPT_TICK_INTERVAL = validation_1.predicateWithMessage((v, ctx) => validation_1.OPTIONAL(v, ctx, (v, ctx) => (v !== 0 && validation_1.NUMBER(0)(v, ctx)) || v instanceof interval_1.TimeInterval), `expecting an optional non-zero positive Number value or, for a time axis, a Time Interval such as 'agCharts.time.month'`);
const GRID_STYLE_KEYS = ['stroke', 'lineDash'];
const GRID_STYLE = validation_1.predicateWithMessage(validation_1.ARRAY(undefined, (o) => {
    for (const key in o) {
        if (!GRID_STYLE_KEYS.includes(key)) {
            return false;
        }
    }
    return true;
}), `expecting an Array of objects with gridline style properties such as 'stroke' and 'lineDash'`);
var Tags;
(function (Tags) {
    Tags[Tags["TickLine"] = 0] = "TickLine";
    Tags[Tags["TickLabel"] = 1] = "TickLabel";
    Tags[Tags["GridLine"] = 2] = "GridLine";
    Tags[Tags["GridArc"] = 3] = "GridArc";
    Tags[Tags["AxisLine"] = 4] = "AxisLine";
})(Tags = exports.Tags || (exports.Tags = {}));
class AxisLine {
    constructor() {
        this.width = 1;
        this.color = 'rgba(195, 195, 195, 1)';
    }
}
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], AxisLine.prototype, "width", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_COLOR_STRING)
], AxisLine.prototype, "color", void 0);
exports.AxisLine = AxisLine;
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
    validation_1.Validate(validation_1.NUMBER(0))
], AxisTick.prototype, "width", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], AxisTick.prototype, "size", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_COLOR_STRING)
], AxisTick.prototype, "color", void 0);
__decorate([
    validation_1.Validate(OPT_TICK_COUNT),
    deprecation_1.Deprecated('Use tick.interval or tick.minSpacing and tick.maxSpacing instead')
], AxisTick.prototype, "count", void 0);
__decorate([
    validation_1.Validate(OPT_TICK_INTERVAL)
], AxisTick.prototype, "interval", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_ARRAY())
], AxisTick.prototype, "values", void 0);
__decorate([
    validation_1.Validate(validation_1.AND(validation_1.NUMBER_OR_NAN(1), validation_1.LESS_THAN('maxSpacing'))),
    default_1.Default(NaN)
], AxisTick.prototype, "minSpacing", void 0);
__decorate([
    validation_1.Validate(validation_1.AND(validation_1.NUMBER_OR_NAN(1), validation_1.GREATER_THAN('minSpacing'))),
    default_1.Default(NaN)
], AxisTick.prototype, "maxSpacing", void 0);
class AxisLabel {
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
        this.minSpacing = NaN;
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
    validation_1.Validate(validation_1.OPT_FONT_STYLE)
], AxisLabel.prototype, "fontStyle", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_FONT_WEIGHT)
], AxisLabel.prototype, "fontWeight", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(1))
], AxisLabel.prototype, "fontSize", void 0);
__decorate([
    validation_1.Validate(validation_1.STRING)
], AxisLabel.prototype, "fontFamily", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], AxisLabel.prototype, "padding", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER_OR_NAN()),
    default_1.Default(NaN)
], AxisLabel.prototype, "minSpacing", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_COLOR_STRING)
], AxisLabel.prototype, "color", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_NUMBER(-360, 360))
], AxisLabel.prototype, "rotation", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_BOOLEAN)
], AxisLabel.prototype, "autoRotate", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(-360, 360))
], AxisLabel.prototype, "autoRotateAngle", void 0);
__decorate([
    validation_1.Validate(validation_1.BOOLEAN)
], AxisLabel.prototype, "avoidCollisions", void 0);
__decorate([
    validation_1.Validate(validation_1.BOOLEAN)
], AxisLabel.prototype, "mirrored", void 0);
__decorate([
    validation_1.Validate(validation_1.BOOLEAN)
], AxisLabel.prototype, "parallel", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_STRING)
], AxisLabel.prototype, "format", void 0);
exports.AxisLabel = AxisLabel;
/**
 * A general purpose linear axis with no notion of orientation.
 * The axis is always rendered vertically, with horizontal labels positioned to the left
 * of the axis line by default. The axis can be {@link rotation | rotated} by an arbitrary angle,
 * so that it can be used as a top, right, bottom, left, radial or any other kind
 * of linear axis.
 * The generic `D` parameter is the type of the domain of the axis' scale.
 * The output range of the axis' scale is always numeric (screen coordinates).
 */
class Axis {
    constructor(scale) {
        this.id = id_1.createId(this);
        this.nice = true;
        this.dataDomain = [];
        this.axisGroup = new group_1.Group({ name: `${this.id}-axis`, zIndex: layers_1.Layers.AXIS_ZINDEX });
        this.lineNode = this.axisGroup.appendChild(new line_1.Line());
        this.tickLineGroup = this.axisGroup.appendChild(new group_1.Group({ name: `${this.id}-Axis-tick-lines`, zIndex: layers_1.Layers.AXIS_ZINDEX }));
        this.tickLabelGroup = this.axisGroup.appendChild(new group_1.Group({ name: `${this.id}-Axis-tick-labels`, zIndex: layers_1.Layers.AXIS_ZINDEX }));
        this.crossLineGroup = new group_1.Group({ name: `${this.id}-CrossLines` });
        this.gridGroup = new group_1.Group({ name: `${this.id}-Axis-grid` });
        this.gridLineGroup = this.gridGroup.appendChild(new group_1.Group({
            name: `${this.id}-gridLines`,
            zIndex: layers_1.Layers.AXIS_GRID_ZINDEX,
        }));
        this.gridArcGroup = this.gridGroup.appendChild(new group_1.Group({
            name: `${this.id}-gridArcs`,
            zIndex: layers_1.Layers.AXIS_GRID_ZINDEX,
        }));
        this.tickLineGroupSelection = selection_1.Selection.select(this.tickLineGroup, line_1.Line);
        this.tickLabelGroupSelection = selection_1.Selection.select(this.tickLabelGroup, text_1.Text);
        this.gridLineGroupSelection = selection_1.Selection.select(this.gridLineGroup, line_1.Line);
        this.gridArcGroupSelection = selection_1.Selection.select(this.gridArcGroup, arc_1.Arc);
        this._crossLines = [];
        this.line = new AxisLine();
        this.tick = new AxisTick();
        this.label = new AxisLabel();
        this.translation = { x: 0, y: 0 };
        this.rotation = 0; // axis rotation angle in degrees
        this.layout = {
            label: {
                align: 'center',
                baseline: 'middle',
                rotation: 0,
                fractionDigits: 0,
            },
        };
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
        /**
         * Is used to avoid collisions between axis labels and series.
         */
        this.seriesAreaPadding = 0;
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
    destroy() {
        // For override by sub-classes.
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
        node.insertBefore(this.gridGroup, nextNode);
        node.insertBefore(this.axisGroup, nextNode);
        node.insertBefore(this.crossLineGroup, nextNode);
    }
    detachAxis(node) {
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
        const logScale = scale instanceof logScale_1.LogScale;
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
                logger_1.Logger.warnOnce(`the axis label format string ${format} is invalid. No formatting will be applied`);
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
            this.updateTitle({ ticks: this.scale.ticks() });
        }
    }
    get title() {
        return this._title;
    }
    setDomain() {
        var _a;
        const { scale, dataDomain, tick: { values: tickValues }, } = this;
        if (tickValues && scale instanceof continuousScale_1.ContinuousScale) {
            const [tickMin, tickMax] = (_a = array_1.extent(tickValues)) !== null && _a !== void 0 ? _a : [Infinity, -Infinity];
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
    setTickCount(count, minTickCount, maxTickCount) {
        const { scale } = this;
        if (!(count && scale instanceof continuousScale_1.ContinuousScale)) {
            return;
        }
        if (typeof count === 'number') {
            scale.tickCount = count;
            scale.minTickCount = minTickCount !== null && minTickCount !== void 0 ? minTickCount : 0;
            scale.maxTickCount = maxTickCount !== null && maxTickCount !== void 0 ? maxTickCount : Infinity;
            return;
        }
        if (scale instanceof timeScale_1.TimeScale) {
            this.setTickInterval(count);
        }
    }
    set gridLength(value) {
        var _a;
        // Was visible and now invisible, or was invisible and now visible.
        if ((this._gridLength && !value) || (!this._gridLength && value)) {
            this.gridLineGroupSelection = this.gridLineGroupSelection.clear();
            this.gridArcGroupSelection = this.gridArcGroupSelection.clear();
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
            this.gridLineGroupSelection = this.gridLineGroupSelection.clear();
            this.gridArcGroupSelection = this.gridArcGroupSelection.clear();
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
        const { scale, gridLength, tick, label: { parallel: parallelLabels, mirrored, avoidCollisions }, requestedRange, } = this;
        const requestedRangeMin = Math.min(...requestedRange);
        const requestedRangeMax = Math.max(...requestedRange);
        const rotation = angle_1.toRadians(this.rotation);
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
        const parallelFlipRotation = angle_1.normalizeAngle360(rotation);
        const regularFlipRotation = angle_1.normalizeAngle360(rotation - Math.PI / 2);
        const nice = this.nice;
        this.setDomain();
        this.setTickInterval(this.tick.interval);
        if (scale instanceof continuousScale_1.ContinuousScale) {
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
        const { maxTickCount, minTickCount, defaultTickCount } = this.estimateTickCount({
            minSpacing: this.tick.minSpacing,
            maxSpacing: this.tick.maxSpacing,
        });
        const continuous = scale instanceof continuousScale_1.ContinuousScale;
        const secondaryAxis = primaryTickCount !== undefined;
        const checkForOverlap = avoidCollisions && this.tick.interval === undefined && this.tick.values === undefined;
        const tickSpacing = !isNaN(this.tick.minSpacing) || !isNaN(this.tick.maxSpacing);
        const maxIterations = this.tick.count || !continuous || isNaN(maxTickCount) ? 10 : maxTickCount;
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
                const tickCount = Math.max(defaultTickCount - i, minTickCount);
                const filterTicks = checkForOverlap && !(continuous && this.tick.count === undefined) && (tickSpacing || i !== 0);
                if (this.tick.values) {
                    ticks = this.tick.values;
                }
                else if (maxTickCount === 0) {
                    ticks = [];
                }
                else if (i === 0 || !filterTicks) {
                    this.setTickCount((_a = this.tick.count) !== null && _a !== void 0 ? _a : tickCount, minTickCount, maxTickCount);
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
                unchanged = checkForOverlap ? equal_1.areArrayNumbersEqual(ticks, prevTicks) : false;
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
            labelOverlap = checkForOverlap ? labelPlacement_1.axisLabelsOverlap(labelData, labelSpacing) : false;
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
        this.tickLineGroup.visible = anyTickVisible;
        this.tickLabelGroup.visible = anyTickVisible;
        this.gridLineGroup.visible = anyTickVisible;
        this.gridArcGroup.visible = anyTickVisible;
        (_b = this.crossLines) === null || _b === void 0 ? void 0 : _b.forEach((crossLine) => {
            crossLine.sideFlag = -sideFlag;
            crossLine.direction = rotation === -Math.PI / 2 ? chartAxisDirection_1.ChartAxisDirection.X : chartAxisDirection_1.ChartAxisDirection.Y;
            crossLine.label.parallel =
                crossLine.label.parallel !== undefined ? crossLine.label.parallel : parallelLabels;
            crossLine.parallelFlipRotation = parallelFlipRotation;
            crossLine.regularFlipRotation = regularFlipRotation;
            crossLine.update(anySeriesActive);
        });
        this.updateTitle({ ticks });
        tickLineGroupSelection.each((line) => {
            line.strokeWidth = tick.width;
            line.stroke = tick.color;
            line.visible = anyTickVisible;
            line.x1 = sideFlag * tick.size;
            line.x2 = 0;
            line.y1 = 0;
            line.y2 = 0;
        });
        return primaryTickCount;
    }
    estimateTickCount({ minSpacing, maxSpacing }) {
        const { requestedRange } = this;
        const min = Math.min(...requestedRange);
        const max = Math.max(...requestedRange);
        const availableRange = max - min;
        const defaultMinSpacing = Math.max(Axis.defaultTickMinSpacing, availableRange / continuousScale_1.ContinuousScale.defaultMaxTickCount);
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
        const maxTickCount = Math.max(1, Math.floor(availableRange / minSpacing));
        const minTickCount = Math.min(maxTickCount, Math.ceil(availableRange / maxSpacing));
        let defaultTickCount = continuousScale_1.ContinuousScale.defaultTickCount;
        if (defaultTickCount > maxTickCount) {
            defaultTickCount = maxTickCount;
        }
        else if (defaultTickCount < minTickCount) {
            defaultTickCount = minTickCount;
        }
        return { minTickCount, maxTickCount, defaultTickCount };
    }
    getLabelSpacing(rotated) {
        const { label } = this;
        if (!isNaN(label.minSpacing)) {
            return label.minSpacing;
        }
        return rotated ? 0 : 10;
    }
    calculateDomain() {
        // Placeholder for subclasses to override.
    }
    updatePosition() {
        const { label, crossLineGroup, axisGroup, gridGroup, translation, gridLineGroupSelection, gridPadding, gridLength, } = this;
        const rotation = angle_1.toRadians(this.rotation);
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
    updateSecondaryAxisTicks(_primaryTickCount) {
        throw new Error('AG Charts - unexpected call to updateSecondaryAxisTicks() - check axes configuration.');
    }
    updateSelections({ ticks, halfBandwidth, gridLength, }) {
        const { scale } = this;
        const data = ticks.map((t) => ({ tick: t, translationY: scale.convert(t) + halfBandwidth }));
        const gridLineGroupSelection = this.radialGrid
            ? this.gridLineGroupSelection
            : this.gridLineGroupSelection.update(gridLength ? data : [], (group) => {
                const node = new line_1.Line();
                node.tag = Tags.GridLine;
                group.append(node);
            });
        const gridArcGroupSelection = this.radialGrid
            ? this.gridArcGroupSelection.update(gridLength ? data : [], (group) => {
                const node = new arc_1.Arc();
                node.tag = Tags.GridArc;
                group.append(node);
            })
            : this.gridArcGroupSelection;
        const tickLineGroupSelection = this.tickLineGroupSelection.update(data, (group) => {
            const line = new line_1.Line();
            line.tag = Tags.TickLine;
            group.appendChild(line);
        });
        const tickLabelGroupSelection = this.tickLabelGroupSelection.update(data, (group) => {
            const text = new text_1.Text();
            text.tag = Tags.TickLabel;
            group.appendChild(text);
        });
        // We need raw `translationY` values on `datum` for accurate label collision detection in axes.update()
        // But node `translationY` values must be rounded to get pixel grid alignment
        const translationFn = (node) => (node.translationY = Math.round(node.datum.translationY));
        gridLineGroupSelection.each(translationFn);
        gridArcGroupSelection.each(translationFn);
        tickLineGroupSelection.each(translationFn);
        tickLabelGroupSelection.each(translationFn);
        this.tickLineGroupSelection = tickLineGroupSelection;
        this.tickLabelGroupSelection = tickLabelGroupSelection;
        this.gridLineGroupSelection = gridLineGroupSelection;
        this.gridArcGroupSelection = gridArcGroupSelection;
    }
    updateGridLines({ gridLength, halfBandwidth, sideFlag, }) {
        const { gridStyle, scale, tick, gridPadding } = this;
        if (gridLength && gridStyle.length) {
            const styleCount = gridStyle.length;
            let grid;
            if (this.radialGrid) {
                const angularGridLength = angle_1.normalizeAngle360Inclusive(angle_1.toRadians(gridLength));
                grid = this.gridArcGroupSelection.each((arc, datum) => {
                    const radius = Math.round(scale.convert(datum) + halfBandwidth);
                    arc.centerX = 0;
                    arc.centerY = scale.range[0] - radius;
                    arc.endAngle = angularGridLength;
                    arc.radius = radius;
                });
            }
            else {
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
    updateLabels({ ticks, tickLabelGroupSelection, sideFlag, parallelFlipRotation, regularFlipRotation, }) {
        const { label, label: { parallel, rotation }, tick, } = this;
        let labelAutoRotation = 0;
        const { autoRotation, labelRotation, parallelFlipFlag, regularFlipFlag } = label_1.calculateLabelRotation({
            rotation,
            parallel,
            regularFlipRotation,
            parallelFlipRotation,
        });
        // `ticks instanceof NumericTicks` doesn't work here, so we feature detect.
        this.fractionDigits = ticks.fractionDigits >= 0 ? ticks.fractionDigits : 0;
        // Update properties that affect the size of the axis labels and measure the labels
        const labelBboxes = new Map();
        const labelX = sideFlag * (tick.size + label.padding + this.seriesAreaPadding);
        const labelMatrix = new matrix_1.Matrix();
        matrix_1.Matrix.updateTransformMatrix(labelMatrix, 1, 1, autoRotation, 0, 0);
        let labelData = [];
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
            const translatedBBox = new bbox_1.BBox(labelX, translationY, 0, 0);
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
        const rotate = labelPlacement_1.axisLabelsOverlap(labelData, labelSpacing);
        if (label.rotation === undefined && label.autoRotate === true && rotate) {
            // When no user label rotation angle has been specified and the width of any label exceeds the average tick gap (`rotate` is `true`),
            // automatically rotate the labels
            labelAutoRotation = angle_1.normalizeAngle360(angle_1.toRadians(label.autoRotateAngle));
        }
        let labelTextBaseline = 'middle';
        if (parallel && !labelRotation) {
            if (sideFlag * parallelFlipFlag === -1) {
                labelTextBaseline = 'hanging';
            }
            else {
                labelTextBaseline = 'bottom';
            }
        }
        const labelRotated = labelRotation > 0 && labelRotation <= Math.PI;
        const labelAutoRotated = labelAutoRotation > 0 && labelAutoRotation <= Math.PI;
        const alignFlag = labelRotated || labelAutoRotated ? -1 : 1;
        let labelTextAlign = 'start';
        if (parallel) {
            if (labelRotation || labelAutoRotation) {
                if (sideFlag * alignFlag === -1) {
                    labelTextAlign = 'end';
                }
            }
            else {
                labelTextAlign = 'center';
            }
        }
        else if (sideFlag * regularFlipFlag === -1) {
            labelTextAlign = 'end';
        }
        const combinedRotation = autoRotation + labelRotation + labelAutoRotation;
        if (combinedRotation) {
            matrix_1.Matrix.updateTransformMatrix(labelMatrix, 1, 1, combinedRotation, 0, 0);
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
            const translatedBBox = new bbox_1.BBox(labelX, translationY, 0, 0);
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
        this.layout.label = {
            align: labelTextAlign,
            baseline: labelTextBaseline,
            rotation: combinedRotation,
            fractionDigits: this.fractionDigits,
        };
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
        const { label, rotation, title, lineNode, requestedRange, tickLineGroup, tickLabelGroup } = this;
        if (!title) {
            return;
        }
        let titleVisible = false;
        if (title.enabled && lineNode.visible) {
            titleVisible = true;
            const sideFlag = label.mirrored ? 1 : -1;
            const parallelFlipRotation = angle_1.normalizeAngle360(rotation);
            const padding = caption_1.Caption.PADDING;
            const titleNode = title.node;
            const titleRotationFlag = sideFlag === -1 && parallelFlipRotation > Math.PI && parallelFlipRotation < Math.PI * 2 ? -1 : 1;
            titleNode.rotation = (titleRotationFlag * sideFlag * Math.PI) / 2;
            titleNode.x = Math.floor((titleRotationFlag * sideFlag * (requestedRange[0] + requestedRange[1])) / 2);
            let bboxYDimension = 0;
            if ((ticks === null || ticks === void 0 ? void 0 : ticks.length) > 0) {
                const tickBBox = group_1.Group.computeBBox([tickLineGroup, tickLabelGroup]);
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
    clipTickLines(x, y, width, height) {
        this.tickLineGroup.setClipRectInGroupCoordinateSpace(new bbox_1.BBox(x, y, width, height));
    }
    clipGrid(x, y, width, height) {
        this.gridGroup.setClipRectInGroupCoordinateSpace(new bbox_1.BBox(x, y, width, height));
    }
}
Axis.defaultTickMinSpacing = 50;
__decorate([
    validation_1.Validate(validation_1.BOOLEAN)
], Axis.prototype, "nice", void 0);
__decorate([
    validation_1.Validate(GRID_STYLE)
], Axis.prototype, "gridStyle", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], Axis.prototype, "thickness", void 0);
exports.Axis = Axis;
