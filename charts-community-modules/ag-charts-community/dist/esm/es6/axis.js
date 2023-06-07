var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { Group } from './scene/group';
import { Selection } from './scene/selection';
import { Line } from './scene/shape/line';
import { getFont, measureText, Text, splitText } from './scene/shape/text';
import { Arc } from './scene/shape/arc';
import { BBox } from './scene/bbox';
import { Caption } from './caption';
import { createId } from './util/id';
import { normalizeAngle360, normalizeAngle360Inclusive, toRadians } from './util/angle';
import { TimeInterval } from './util/time/interval';
import { areArrayNumbersEqual } from './util/equal';
import { Validate, BOOLEAN, OPT_BOOLEAN, NUMBER, OPT_NUMBER, OPT_FONT_STYLE, OPT_FONT_WEIGHT, STRING, OPT_COLOR_STRING, OPTIONAL, ARRAY, predicateWithMessage, OPT_STRING, OPT_ARRAY, LESS_THAN, NUMBER_OR_NAN, AND, TEXT_WRAP, OPT_FUNCTION, } from './util/validation';
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
import { calculateLabelRotation, calculateLabelBBox, getLabelSpacing, getTextAlign, getTextBaseline, } from './chart/label';
import { Logger } from './util/logger';
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
export var Tags;
(function (Tags) {
    Tags[Tags["TickLine"] = 0] = "TickLine";
    Tags[Tags["TickLabel"] = 1] = "TickLabel";
    Tags[Tags["GridLine"] = 2] = "GridLine";
    Tags[Tags["GridArc"] = 3] = "GridArc";
    Tags[Tags["AxisLine"] = 4] = "AxisLine";
})(Tags || (Tags = {}));
var TickGenerationType;
(function (TickGenerationType) {
    TickGenerationType[TickGenerationType["CREATE"] = 0] = "CREATE";
    TickGenerationType[TickGenerationType["CREATE_SECONDARY"] = 1] = "CREATE_SECONDARY";
    TickGenerationType[TickGenerationType["FILTER"] = 2] = "FILTER";
    TickGenerationType[TickGenerationType["VALUES"] = 3] = "VALUES";
})(TickGenerationType || (TickGenerationType = {}));
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
export class BaseAxisTick {
    constructor() {
        this.enabled = true;
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
    }
}
__decorate([
    Validate(BOOLEAN)
], BaseAxisTick.prototype, "enabled", void 0);
__decorate([
    Validate(NUMBER(0))
], BaseAxisTick.prototype, "width", void 0);
__decorate([
    Validate(NUMBER(0))
], BaseAxisTick.prototype, "size", void 0);
__decorate([
    Validate(OPT_COLOR_STRING)
], BaseAxisTick.prototype, "color", void 0);
__decorate([
    Validate(OPT_TICK_COUNT),
    Deprecated('Use tick.interval or tick.minSpacing and tick.maxSpacing instead')
], BaseAxisTick.prototype, "count", void 0);
__decorate([
    Validate(OPT_TICK_INTERVAL)
], BaseAxisTick.prototype, "interval", void 0);
__decorate([
    Validate(OPT_ARRAY())
], BaseAxisTick.prototype, "values", void 0);
__decorate([
    Validate(AND(NUMBER_OR_NAN(1), LESS_THAN('maxSpacing'))),
    Default(NaN)
], BaseAxisTick.prototype, "minSpacing", void 0);
export class AxisLabel {
    constructor() {
        this.enabled = true;
        /** If set to `false`, axis labels will not be wrapped on multiple lines. */
        this.autoWrap = false;
        /** Used to constrain the width of the label when `autoWrap` is `true`, if the label text width exceeds the `maxWidth`, it will be wrapped on multiple lines automatically. If `maxWidth` is omitted, a default width constraint will be applied. */
        this.maxWidth = undefined;
        /** Used to constrain the height of the multiline label, if the label text height exceeds the `maxHeight`, it will be truncated automatically. If `maxHeight` is omitted, a default height constraint will be applied. */
        this.maxHeight = undefined;
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
    /**
     * The side of the axis line to position the labels on.
     * -1 = left (default)
     * 1 = right
     */
    getSideFlag() {
        return this.mirrored ? 1 : -1;
    }
    getFont() {
        return getFont(this);
    }
}
__decorate([
    Validate(BOOLEAN)
], AxisLabel.prototype, "enabled", void 0);
__decorate([
    Validate(OPT_BOOLEAN)
], AxisLabel.prototype, "autoWrap", void 0);
__decorate([
    Validate(OPT_NUMBER(0))
], AxisLabel.prototype, "maxWidth", void 0);
__decorate([
    Validate(OPT_NUMBER(0))
], AxisLabel.prototype, "maxHeight", void 0);
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
    Validate(NUMBER_OR_NAN()),
    Default(NaN)
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
export class AxisTitle {
    constructor() {
        this.enabled = false;
        this.text = undefined;
        this.fontStyle = undefined;
        this.fontWeight = undefined;
        this.fontSize = 10;
        this.fontFamily = 'sans-serif';
        this.color = undefined;
        this.wrapping = 'always';
        this.formatter = undefined;
    }
}
__decorate([
    Validate(BOOLEAN)
], AxisTitle.prototype, "enabled", void 0);
__decorate([
    Validate(OPT_STRING)
], AxisTitle.prototype, "text", void 0);
__decorate([
    Validate(OPT_FONT_STYLE)
], AxisTitle.prototype, "fontStyle", void 0);
__decorate([
    Validate(OPT_FONT_WEIGHT)
], AxisTitle.prototype, "fontWeight", void 0);
__decorate([
    Validate(NUMBER(0))
], AxisTitle.prototype, "fontSize", void 0);
__decorate([
    Validate(STRING)
], AxisTitle.prototype, "fontFamily", void 0);
__decorate([
    Validate(OPT_COLOR_STRING)
], AxisTitle.prototype, "color", void 0);
__decorate([
    Validate(TEXT_WRAP)
], AxisTitle.prototype, "wrapping", void 0);
__decorate([
    Validate(OPT_FUNCTION)
], AxisTitle.prototype, "formatter", void 0);
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
    constructor(moduleCtx, scale) {
        this.moduleCtx = moduleCtx;
        this.id = createId(this);
        this.nice = true;
        this.dataDomain = [];
        this.axisGroup = new Group({ name: `${this.id}-axis`, zIndex: Layers.AXIS_ZINDEX });
        this.lineNode = this.axisGroup.appendChild(new Line());
        this.tickLineGroup = this.axisGroup.appendChild(new Group({ name: `${this.id}-Axis-tick-lines`, zIndex: Layers.AXIS_ZINDEX }));
        this.tickLabelGroup = this.axisGroup.appendChild(new Group({ name: `${this.id}-Axis-tick-labels`, zIndex: Layers.AXIS_ZINDEX }));
        this.crossLineGroup = new Group({ name: `${this.id}-CrossLines` });
        this.gridGroup = new Group({ name: `${this.id}-Axis-grid` });
        this.gridLineGroup = this.gridGroup.appendChild(new Group({
            name: `${this.id}-gridLines`,
            zIndex: Layers.AXIS_GRID_ZINDEX,
        }));
        this.gridArcGroup = this.gridGroup.appendChild(new Group({
            name: `${this.id}-gridArcs`,
            zIndex: Layers.AXIS_GRID_ZINDEX,
        }));
        this.tickLineGroupSelection = Selection.select(this.tickLineGroup, Line);
        this.tickLabelGroupSelection = Selection.select(this.tickLabelGroup, Text);
        this.gridLineGroupSelection = Selection.select(this.gridLineGroup, Line);
        this.gridArcGroupSelection = Selection.select(this.gridArcGroup, Arc);
        this._crossLines = [];
        this.line = new AxisLine();
        this.tick = this.createTick();
        this.label = new AxisLabel();
        this.translation = { x: 0, y: 0 };
        this.rotation = 0; // axis rotation angle in degrees
        this.layout = {
            label: {
                fractionDigits: 0,
                padding: this.label.padding,
                format: this.label.format,
            },
        };
        this.range = [0, 1];
        this.visibleRange = [0, 1];
        this.title = undefined;
        this._titleCaption = new Caption();
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
        this.maxThickness = Infinity;
        this._scale = scale;
        this.refreshScale();
        this._titleCaption.node.rotation = -Math.PI / 2;
        this.axisGroup.appendChild(this._titleCaption.node);
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
        this.range = this.scale.range.slice();
        (_a = this.crossLines) === null || _a === void 0 ? void 0 : _a.forEach((crossLine) => {
            this.initCrossLine(crossLine);
        });
    }
    updateRange() {
        var _a;
        const { range: rr, visibleRange: vr, scale } = this;
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
                Logger.warnOnce(`the axis label format string ${format} is invalid. No formatting will be applied`);
            }
        }
        else {
            this.labelFormatter = defaultLabelFormatter;
        }
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
    setTickCount(count, minTickCount, maxTickCount) {
        const { scale } = this;
        if (!(count && scale instanceof ContinuousScale)) {
            return;
        }
        if (typeof count === 'number') {
            scale.tickCount = count;
            scale.minTickCount = minTickCount !== null && minTickCount !== void 0 ? minTickCount : 0;
            scale.maxTickCount = maxTickCount !== null && maxTickCount !== void 0 ? maxTickCount : Infinity;
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
    createTick() {
        return new BaseAxisTick();
    }
    /**
     * Creates/removes/updates the scene graph nodes that constitute the axis.
     */
    update(primaryTickCount) {
        const { rotation, parallelFlipRotation, regularFlipRotation } = this.calculateRotations();
        const sideFlag = this.label.getSideFlag();
        const labelX = sideFlag * (this.tick.size + this.label.padding + this.seriesAreaPadding);
        this.updateScale();
        this.updatePosition({ rotation, sideFlag });
        this.updateLine();
        const _a = this.generateTicks({
            primaryTickCount,
            parallelFlipRotation,
            regularFlipRotation,
            labelX,
            sideFlag,
        }), { tickData, combinedRotation, textBaseline, textAlign } = _a, ticksResult = __rest(_a, ["tickData", "combinedRotation", "textBaseline", "textAlign"]);
        this.updateSelections(tickData.ticks);
        this.updateLabels({
            tickLabelGroupSelection: this.tickLabelGroupSelection,
            combinedRotation,
            textBaseline,
            textAlign,
            labelX,
        });
        this.updateVisibility();
        this.updateGridLines(sideFlag);
        this.updateTickLines(sideFlag);
        this.updateTitle({ anyTickVisible: tickData.ticks.length > 0, sideFlag });
        this.updateCrossLines({ rotation, parallelFlipRotation, regularFlipRotation, sideFlag });
        this.updateLayoutState();
        primaryTickCount = ticksResult.primaryTickCount;
        return primaryTickCount;
    }
    updateLayoutState() {
        this.layout.label = {
            fractionDigits: this.fractionDigits,
            padding: this.label.padding,
            format: this.label.format,
        };
    }
    updateScale() {
        this.updateRange();
        this.calculateDomain();
        this.setDomain();
        this.setTickInterval(this.tick.interval);
        const { scale, nice } = this;
        if (!(scale instanceof ContinuousScale)) {
            return;
        }
        this.setTickCount(this.tick.count);
        scale.nice = nice;
        scale.update();
    }
    calculateRotations() {
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
    generateTicks({ primaryTickCount, parallelFlipRotation, regularFlipRotation, labelX, sideFlag, }) {
        var _a;
        const { scale, tick, label: { parallel, rotation, fontFamily, fontSize, fontStyle, fontWeight }, } = this;
        const secondaryAxis = primaryTickCount !== undefined;
        const { defaultRotation, configuredRotation, parallelFlipFlag, regularFlipFlag } = calculateLabelRotation({
            rotation,
            parallel,
            regularFlipRotation,
            parallelFlipRotation,
        });
        const initialRotation = configuredRotation + defaultRotation;
        const labelMatrix = new Matrix();
        const { maxTickCount } = this.estimateTickCount({
            minSpacing: tick.minSpacing,
            maxSpacing: (_a = tick.maxSpacing) !== null && _a !== void 0 ? _a : NaN,
        });
        const continuous = scale instanceof ContinuousScale;
        const maxIterations = tick.count || !continuous || isNaN(maxTickCount) ? 10 : maxTickCount;
        let textAlign = getTextAlign(parallel, configuredRotation, 0, sideFlag, regularFlipFlag);
        const textBaseline = getTextBaseline(parallel, configuredRotation, sideFlag, parallelFlipFlag);
        const textProps = {
            fontFamily,
            fontSize,
            fontStyle,
            fontWeight,
            textBaseline,
            textAlign,
        };
        let tickData = {
            rawTicks: [],
            ticks: [],
            labelCount: 0,
        };
        let index = 0;
        let autoRotation = 0;
        let labelOverlap = true;
        let terminate = false;
        while (labelOverlap && index <= maxIterations) {
            if (terminate) {
                break;
            }
            autoRotation = 0;
            textAlign = getTextAlign(parallel, configuredRotation, 0, sideFlag, regularFlipFlag);
            const tickStrategies = this.getTickStrategies({ secondaryAxis, index });
            for (const strategy of tickStrategies) {
                ({ tickData, index, autoRotation, terminate } = strategy({
                    index,
                    tickData,
                    textProps,
                    labelOverlap,
                    terminate,
                    primaryTickCount,
                }));
                const ticksResult = tickData.ticks;
                textAlign = getTextAlign(parallel, configuredRotation, autoRotation, sideFlag, regularFlipFlag);
                const rotated = configuredRotation !== 0 || autoRotation !== 0;
                const rotation = initialRotation + autoRotation;
                labelOverlap = this.checkLabelOverlap(rotation, rotated, labelMatrix, ticksResult, labelX, Object.assign(Object.assign({}, textProps), { textAlign }));
            }
        }
        const combinedRotation = defaultRotation + configuredRotation + autoRotation;
        if (!secondaryAxis && tickData.rawTicks.length > 0) {
            primaryTickCount = tickData.rawTicks.length;
        }
        return { tickData, primaryTickCount, combinedRotation, textBaseline, textAlign };
    }
    getTickStrategies({ index, secondaryAxis }) {
        const { scale, label, tick } = this;
        const continuous = scale instanceof ContinuousScale;
        const avoidLabelCollisions = label.enabled && label.avoidCollisions;
        const filterTicks = !(continuous && this.tick.count === undefined) && index !== 0 && avoidLabelCollisions;
        const autoRotate = label.autoRotate === true && label.rotation === undefined;
        const strategies = [];
        let tickGenerationType;
        if (this.tick.values) {
            tickGenerationType = TickGenerationType.VALUES;
        }
        else if (secondaryAxis) {
            tickGenerationType = TickGenerationType.CREATE_SECONDARY;
        }
        else if (filterTicks) {
            tickGenerationType = TickGenerationType.FILTER;
        }
        else {
            tickGenerationType = TickGenerationType.CREATE;
        }
        const tickGenerationStrategy = ({ index, tickData, primaryTickCount, terminate }) => this.createTickData(tickGenerationType, index, tickData, terminate, primaryTickCount);
        strategies.push(tickGenerationStrategy);
        if (!continuous && !isNaN(tick.minSpacing)) {
            const tickFilterStrategy = ({ index, tickData, primaryTickCount, terminate }) => this.createTickData(TickGenerationType.FILTER, index, tickData, terminate, primaryTickCount);
            strategies.push(tickFilterStrategy);
        }
        if (!avoidLabelCollisions) {
            return strategies;
        }
        if (label.autoWrap) {
            const autoWrapStrategy = ({ index, tickData, textProps }) => this.wrapLabels(tickData, index, textProps);
            strategies.push(autoWrapStrategy);
        }
        else if (autoRotate) {
            const autoRotateStrategy = ({ index, tickData, labelOverlap, terminate }) => ({
                index,
                tickData,
                autoRotation: this.getAutoRotation(labelOverlap),
                terminate,
            });
            strategies.push(autoRotateStrategy);
        }
        return strategies;
    }
    createTickData(tickGenerationType, index, tickData, terminate, primaryTickCount) {
        var _a, _b, _c;
        const { scale, tick } = this;
        const { maxTickCount, minTickCount, defaultTickCount } = this.estimateTickCount({
            minSpacing: tick.minSpacing,
            maxSpacing: (_a = tick.maxSpacing) !== null && _a !== void 0 ? _a : NaN,
        });
        const continuous = scale instanceof ContinuousScale;
        const maxIterations = tick.count || !continuous || isNaN(maxTickCount) ? 10 : maxTickCount;
        let tickCount = (_b = tick.count) !== null && _b !== void 0 ? _b : (continuous ? Math.max(defaultTickCount - index, minTickCount) : maxTickCount);
        const regenerateTicks = tick.interval === undefined &&
            tick.values === undefined &&
            tick.count === undefined &&
            tickCount > minTickCount &&
            (continuous || tickGenerationType === TickGenerationType.FILTER);
        let unchanged = true;
        while (unchanged && index <= maxIterations) {
            const prevTicks = tickData.rawTicks;
            tickCount = (_c = tick.count) !== null && _c !== void 0 ? _c : (continuous ? Math.max(defaultTickCount - index, minTickCount) : maxTickCount);
            const { rawTicks, ticks, labelCount } = this.getTicks({
                tickGenerationType,
                previousTicks: prevTicks,
                tickCount,
                minTickCount,
                maxTickCount,
                primaryTickCount,
            });
            tickData.rawTicks = rawTicks;
            tickData.ticks = ticks;
            tickData.labelCount = labelCount;
            unchanged = regenerateTicks ? areArrayNumbersEqual(rawTicks, prevTicks) : false;
            index++;
        }
        return { tickData, index, autoRotation: 0, terminate };
    }
    checkLabelOverlap(rotation, rotated, labelMatrix, tickData, labelX, textProps) {
        Matrix.updateTransformMatrix(labelMatrix, 1, 1, rotation, 0, 0);
        const labelData = this.createLabelData(tickData, labelX, textProps, labelMatrix);
        const labelSpacing = getLabelSpacing(this.label.minSpacing, rotated);
        return axisLabelsOverlap(labelData, labelSpacing);
    }
    createLabelData(tickData, labelX, textProps, labelMatrix) {
        const labelData = [];
        for (const tickDatum of tickData) {
            const { tickLabel, translationY } = tickDatum;
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
    getAutoRotation(labelOveralap) {
        return labelOveralap ? normalizeAngle360(toRadians(this.label.autoRotateAngle)) : 0;
    }
    getTicks({ tickGenerationType, previousTicks, tickCount, minTickCount, maxTickCount, primaryTickCount, }) {
        var _a;
        const { scale } = this;
        let rawTicks = [];
        switch (tickGenerationType) {
            case TickGenerationType.VALUES:
                rawTicks = this.tick.values;
                break;
            case TickGenerationType.CREATE_SECONDARY:
                // `updateSecondaryAxisTicks` mutates `scale.domain` based on `primaryTickCount`
                rawTicks = this.updateSecondaryAxisTicks(primaryTickCount);
                break;
            case TickGenerationType.FILTER:
                rawTicks = this.filterTicks(previousTicks, tickCount);
                break;
            default:
                rawTicks = this.createTicks(tickCount, minTickCount, maxTickCount);
                break;
        }
        // When the scale domain or the ticks change, the label format may change
        this.onLabelFormatChange(rawTicks, this.label.format);
        // `ticks instanceof NumericTicks` doesn't work here, so we feature detect.
        this.fractionDigits = rawTicks.fractionDigits >= 0 ? rawTicks.fractionDigits : 0;
        const halfBandwidth = ((_a = this.scale.bandwidth) !== null && _a !== void 0 ? _a : 0) / 2;
        const ticks = [];
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
    filterTicks(ticks, tickCount) {
        var _a;
        const tickSpacing = !isNaN(this.tick.minSpacing) || !isNaN((_a = this.tick.maxSpacing) !== null && _a !== void 0 ? _a : NaN);
        const keepEvery = tickSpacing ? Math.ceil(ticks.length / tickCount) : 2;
        return ticks.filter((_, i) => i % keepEvery === 0);
    }
    createTicks(tickCount, minTickCount, maxTickCount) {
        this.setTickCount(tickCount, minTickCount, maxTickCount);
        return this.scale.ticks();
    }
    estimateTickCount({ minSpacing, maxSpacing }) {
        const availableRange = this.calculateAvailableRange();
        const defaultMinSpacing = Math.max(Axis.defaultTickMinSpacing, availableRange / ContinuousScale.defaultMaxTickCount);
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
        let defaultTickCount = ContinuousScale.defaultTickCount;
        if (defaultTickCount > maxTickCount) {
            defaultTickCount = maxTickCount;
        }
        else if (defaultTickCount < minTickCount) {
            defaultTickCount = minTickCount;
        }
        return { minTickCount, maxTickCount, defaultTickCount };
    }
    updateVisibility() {
        const { range: requestedRange } = this;
        const requestedRangeMin = Math.min(...requestedRange);
        const requestedRangeMax = Math.max(...requestedRange);
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
            node.visible = visible;
        };
        const { gridLineGroupSelection, gridArcGroupSelection, tickLineGroupSelection, tickLabelGroupSelection } = this;
        gridLineGroupSelection.each(visibleFn);
        gridArcGroupSelection.each(visibleFn);
        tickLineGroupSelection.each(visibleFn);
        tickLabelGroupSelection.each(visibleFn);
        this.tickLineGroup.visible = this.tick.enabled;
        this.tickLabelGroup.visible = this.label.enabled;
    }
    updateCrossLines({ rotation, parallelFlipRotation, regularFlipRotation, sideFlag, }) {
        var _a;
        const anySeriesActive = this.isAnySeriesActive();
        (_a = this.crossLines) === null || _a === void 0 ? void 0 : _a.forEach((crossLine) => {
            var _a;
            crossLine.sideFlag = -sideFlag;
            crossLine.direction = rotation === -Math.PI / 2 ? ChartAxisDirection.X : ChartAxisDirection.Y;
            crossLine.label.parallel = (_a = crossLine.label.parallel) !== null && _a !== void 0 ? _a : this.label.parallel;
            crossLine.parallelFlipRotation = parallelFlipRotation;
            crossLine.regularFlipRotation = regularFlipRotation;
            crossLine.update(anySeriesActive);
        });
    }
    updateTickLines(sideFlag) {
        const { tick } = this;
        this.tickLineGroupSelection.each((line) => {
            line.strokeWidth = tick.width;
            line.stroke = tick.color;
            line.x1 = sideFlag * tick.size;
            line.x2 = 0;
            line.y1 = 0;
            line.y2 = 0;
        });
    }
    calculateAvailableRange() {
        const { range: requestedRange } = this;
        const min = Math.min(...requestedRange);
        const max = Math.max(...requestedRange);
        return max - min;
    }
    calculateDomain() {
        // Placeholder for subclasses to override.
    }
    updatePosition({ rotation, sideFlag }) {
        const { crossLineGroup, axisGroup, gridGroup, translation, gridLineGroupSelection, gridPadding, gridLength } = this;
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
    updateSelections(data) {
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
    updateGridLines(sideFlag) {
        var _a;
        const { gridStyle, scale, tick, gridPadding, gridLength } = this;
        if (gridLength && gridStyle.length) {
            const styleCount = gridStyle.length;
            let grid;
            if (this.radialGrid) {
                const angularGridLength = normalizeAngle360Inclusive(toRadians(gridLength));
                const halfBandwidth = ((_a = this.scale.bandwidth) !== null && _a !== void 0 ? _a : 0) / 2;
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
    updateLabels({ tickLabelGroupSelection, combinedRotation, textBaseline, textAlign, labelX, }) {
        const { label, label: { enabled: labelsEnabled }, } = this;
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
    wrapLabels(tickData, index, labelProps) {
        const { label: { parallel, maxWidth, maxHeight }, } = this;
        const defaultMaxLabelWidth = parallel
            ? Math.round(this.calculateAvailableRange() / tickData.labelCount)
            : this.maxThickness;
        const maxLabelWidth = maxWidth !== null && maxWidth !== void 0 ? maxWidth : defaultMaxLabelWidth;
        const defaultMaxLabelHeight = parallel
            ? this.maxThickness
            : Math.round(this.calculateAvailableRange() / tickData.labelCount);
        const maxLabelHeight = maxHeight !== null && maxHeight !== void 0 ? maxHeight : defaultMaxLabelHeight;
        tickData.ticks.forEach((tickDatum) => {
            const { tickLabel } = tickDatum;
            const wrapping = 'hyphenate';
            const wrappedTickLabel = Text.wrap(tickLabel, maxLabelWidth, maxLabelHeight, labelProps, wrapping);
            tickDatum.tickLabel = wrappedTickLabel;
        });
        return { tickData, index, autoRotation: 0, terminate: true };
    }
    updateLine() {
        // Render axis line.
        const { lineNode, range: requestedRange } = this;
        lineNode.x1 = 0;
        lineNode.x2 = 0;
        lineNode.y1 = requestedRange[0];
        lineNode.y2 = requestedRange[1];
        lineNode.strokeWidth = this.line.width;
        lineNode.stroke = this.line.color;
        lineNode.visible = true;
    }
    updateTitle({ anyTickVisible, sideFlag }) {
        var _a;
        const identityFormatter = (params) => params.defaultValue;
        const { rotation, title, _titleCaption, lineNode, range: requestedRange, tickLineGroup, tickLabelGroup, moduleCtx: { callbackCache }, } = this;
        const { formatter = identityFormatter } = (_a = this.title) !== null && _a !== void 0 ? _a : {};
        if (!title) {
            _titleCaption.enabled = false;
            return;
        }
        _titleCaption.enabled = title.enabled;
        _titleCaption.fontFamily = title.fontFamily;
        _titleCaption.fontSize = title.fontSize;
        _titleCaption.fontStyle = title.fontStyle;
        _titleCaption.fontWeight = title.fontWeight;
        _titleCaption.color = title.color;
        _titleCaption.wrapping = title.wrapping;
        let titleVisible = false;
        const titleNode = _titleCaption.node;
        if (title.enabled && lineNode.visible) {
            titleVisible = true;
            const parallelFlipRotation = normalizeAngle360(rotation);
            const padding = Caption.PADDING;
            const titleRotationFlag = sideFlag === -1 && parallelFlipRotation > Math.PI && parallelFlipRotation < Math.PI * 2 ? -1 : 1;
            titleNode.rotation = (titleRotationFlag * sideFlag * Math.PI) / 2;
            titleNode.x = Math.floor((titleRotationFlag * sideFlag * (requestedRange[0] + requestedRange[1])) / 2);
            let bboxYDimension = 0;
            if (anyTickVisible) {
                const tickBBox = Group.computeBBox([tickLineGroup, tickLabelGroup]);
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
            titleNode.text = callbackCache.call(formatter, this.getTitleFormatterParams());
        }
        titleNode.visible = titleVisible;
    }
    // For formatting (nice rounded) tick values.
    formatTick(datum, index) {
        var _a, _b;
        const { label, labelFormatter, fractionDigits, moduleCtx: { callbackCache }, } = this;
        if (label.formatter) {
            const defaultValue = fractionDigits > 0 ? datum : String(datum);
            return ((_a = callbackCache.call(label.formatter, {
                value: defaultValue,
                index,
                fractionDigits,
                formatter: labelFormatter,
            })) !== null && _a !== void 0 ? _a : defaultValue);
        }
        else if (labelFormatter) {
            return (_b = callbackCache.call(labelFormatter, datum)) !== null && _b !== void 0 ? _b : String(datum);
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
        this.tickLineGroup.setClipRectInGroupCoordinateSpace(new BBox(x, y, width, height));
    }
    clipGrid(x, y, width, height) {
        this.gridGroup.setClipRectInGroupCoordinateSpace(new BBox(x, y, width, height));
    }
    calculatePadding(min, _max) {
        return Math.abs(min * 0.01);
    }
}
Axis.defaultTickMinSpacing = 50;
__decorate([
    Validate(BOOLEAN)
], Axis.prototype, "nice", void 0);
__decorate([
    Validate(GRID_STYLE)
], Axis.prototype, "gridStyle", void 0);
__decorate([
    Validate(NUMBER(0))
], Axis.prototype, "thickness", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXhpcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9heGlzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN0QyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDOUMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQzFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBc0IsU0FBUyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDL0YsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ3hDLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDcEMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUNwQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQ3JDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSwwQkFBMEIsRUFBRSxTQUFTLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDeEYsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ3BELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUVwRCxPQUFPLEVBQ0gsUUFBUSxFQUNSLE9BQU8sRUFDUCxXQUFXLEVBQ1gsTUFBTSxFQUNOLFVBQVUsRUFDVixjQUFjLEVBQ2QsZUFBZSxFQUNmLE1BQU0sRUFDTixnQkFBZ0IsRUFDaEIsUUFBUSxFQUNSLEtBQUssRUFDTCxvQkFBb0IsRUFDcEIsVUFBVSxFQUNWLFNBQVMsRUFDVCxTQUFTLEVBQ1QsYUFBYSxFQUNiLEdBQUcsRUFDSCxTQUFTLEVBQ1QsWUFBWSxHQUNmLE1BQU0sbUJBQW1CLENBQUM7QUFDM0IsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGdC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