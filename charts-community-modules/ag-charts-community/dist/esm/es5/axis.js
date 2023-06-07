var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
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
var TICK_COUNT = predicateWithMessage(function (v, ctx) { return NUMBER(0)(v, ctx) || v instanceof TimeInterval; }, "expecting a tick count Number value or, for a time axis, a Time Interval such as 'agCharts.time.month'");
var OPT_TICK_COUNT = predicateWithMessage(function (v, ctx) { return OPTIONAL(v, ctx, TICK_COUNT); }, "expecting an optional tick count Number value or, for a time axis, a Time Interval such as 'agCharts.time.month'");
var OPT_TICK_INTERVAL = predicateWithMessage(function (v, ctx) { return OPTIONAL(v, ctx, function (v, ctx) { return (v !== 0 && NUMBER(0)(v, ctx)) || v instanceof TimeInterval; }); }, "expecting an optional non-zero positive Number value or, for a time axis, a Time Interval such as 'agCharts.time.month'");
var GRID_STYLE_KEYS = ['stroke', 'lineDash'];
var GRID_STYLE = predicateWithMessage(ARRAY(undefined, function (o) {
    for (var key in o) {
        if (!GRID_STYLE_KEYS.includes(key)) {
            return false;
        }
    }
    return true;
}), "expecting an Array of objects with gridline style properties such as 'stroke' and 'lineDash'");
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
var AxisLine = /** @class */ (function () {
    function AxisLine() {
        this.width = 1;
        this.color = 'rgba(195, 195, 195, 1)';
    }
    __decorate([
        Validate(NUMBER(0))
    ], AxisLine.prototype, "width", void 0);
    __decorate([
        Validate(OPT_COLOR_STRING)
    ], AxisLine.prototype, "color", void 0);
    return AxisLine;
}());
export { AxisLine };
var BaseAxisTick = /** @class */ (function () {
    function BaseAxisTick() {
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
    return BaseAxisTick;
}());
export { BaseAxisTick };
var AxisLabel = /** @class */ (function () {
    function AxisLabel() {
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
    AxisLabel.prototype.getSideFlag = function () {
        return this.mirrored ? 1 : -1;
    };
    AxisLabel.prototype.getFont = function () {
        return getFont(this);
    };
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
    return AxisLabel;
}());
export { AxisLabel };
var AxisTitle = /** @class */ (function () {
    function AxisTitle() {
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
    return AxisTitle;
}());
export { AxisTitle };
/**
 * A general purpose linear axis with no notion of orientation.
 * The axis is always rendered vertically, with horizontal labels positioned to the left
 * of the axis line by default. The axis can be {@link rotation | rotated} by an arbitrary angle,
 * so that it can be used as a top, right, bottom, left, radial or any other kind
 * of linear axis.
 * The generic `D` parameter is the type of the domain of the axis' scale.
 * The output range of the axis' scale is always numeric (screen coordinates).
 */
var Axis = /** @class */ (function () {
    function Axis(moduleCtx, scale) {
        this.moduleCtx = moduleCtx;
        this.id = createId(this);
        this.nice = true;
        this.dataDomain = [];
        this.axisGroup = new Group({ name: this.id + "-axis", zIndex: Layers.AXIS_ZINDEX });
        this.lineNode = this.axisGroup.appendChild(new Line());
        this.tickLineGroup = this.axisGroup.appendChild(new Group({ name: this.id + "-Axis-tick-lines", zIndex: Layers.AXIS_ZINDEX }));
        this.tickLabelGroup = this.axisGroup.appendChild(new Group({ name: this.id + "-Axis-tick-labels", zIndex: Layers.AXIS_ZINDEX }));
        this.crossLineGroup = new Group({ name: this.id + "-CrossLines" });
        this.gridGroup = new Group({ name: this.id + "-Axis-grid" });
        this.gridLineGroup = this.gridGroup.appendChild(new Group({
            name: this.id + "-gridLines",
            zIndex: Layers.AXIS_GRID_ZINDEX,
        }));
        this.gridArcGroup = this.gridGroup.appendChild(new Group({
            name: this.id + "-gridArcs",
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
    Object.defineProperty(Axis.prototype, "scale", {
        get: function () {
            return this._scale;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Axis.prototype, "crossLines", {
        get: function () {
            return this._crossLines;
        },
        set: function (value) {
            var _this = this;
            var _a, _b;
            (_a = this._crossLines) === null || _a === void 0 ? void 0 : _a.forEach(function (crossLine) { return _this.detachCrossLine(crossLine); });
            this._crossLines = value;
            (_b = this._crossLines) === null || _b === void 0 ? void 0 : _b.forEach(function (crossLine) {
                _this.attachCrossLine(crossLine);
                _this.initCrossLine(crossLine);
            });
        },
        enumerable: false,
        configurable: true
    });
    Axis.prototype.attachCrossLine = function (crossLine) {
        this.crossLineGroup.appendChild(crossLine.group);
    };
    Axis.prototype.detachCrossLine = function (crossLine) {
        this.crossLineGroup.removeChild(crossLine.group);
    };
    Axis.prototype.destroy = function () {
        // For override by sub-classes.
    };
    Axis.prototype.refreshScale = function () {
        var _this = this;
        var _a;
        this.range = this.scale.range.slice();
        (_a = this.crossLines) === null || _a === void 0 ? void 0 : _a.forEach(function (crossLine) {
            _this.initCrossLine(crossLine);
        });
    };
    Axis.prototype.updateRange = function () {
        var _a;
        var _b = this, rr = _b.range, vr = _b.visibleRange, scale = _b.scale;
        var span = (rr[1] - rr[0]) / (vr[1] - vr[0]);
        var shift = span * vr[0];
        var start = rr[0] - shift;
        scale.range = [start, start + span];
        (_a = this.crossLines) === null || _a === void 0 ? void 0 : _a.forEach(function (crossLine) {
            crossLine.clippedRange = [rr[0], rr[1]];
        });
    };
    Axis.prototype.setCrossLinesVisible = function (visible) {
        this.crossLineGroup.visible = visible;
    };
    Axis.prototype.attachAxis = function (node, nextNode) {
        node.insertBefore(this.gridGroup, nextNode);
        node.insertBefore(this.axisGroup, nextNode);
        node.insertBefore(this.crossLineGroup, nextNode);
    };
    Axis.prototype.detachAxis = function (node) {
        node.removeChild(this.gridGroup);
        node.removeChild(this.axisGroup);
        node.removeChild(this.crossLineGroup);
    };
    /**
     * Checks if a point or an object is in range.
     * @param x A point (or object's starting point).
     * @param width Object's width.
     * @param tolerance Expands the range on both ends by this amount.
     */
    Axis.prototype.inRange = function (x, width, tolerance) {
        if (width === void 0) { width = 0; }
        if (tolerance === void 0) { tolerance = 0; }
        return this.inRangeEx(x, width, tolerance) === 0;
    };
    Axis.prototype.inRangeEx = function (x, width, tolerance) {
        if (width === void 0) { width = 0; }
        if (tolerance === void 0) { tolerance = 0; }
        var range = this.range;
        // Account for inverted ranges, for example [500, 100] as well as [100, 500]
        var min = Math.min(range[0], range[1]);
        var max = Math.max(range[0], range[1]);
        if (x + width < min - tolerance) {
            return -1; // left of range
        }
        if (x > max + tolerance) {
            return 1; // right of range
        }
        return 0; // in range
    };
    Axis.prototype.onLabelFormatChange = function (ticks, format) {
        var _a = this, scale = _a.scale, fractionDigits = _a.fractionDigits;
        var logScale = scale instanceof LogScale;
        var defaultLabelFormatter = !logScale && fractionDigits > 0
            ? function (x) { return (typeof x === 'number' ? x.toFixed(fractionDigits) : String(x)); }
            : function (x) { return String(x); };
        if (format && scale && scale.tickFormat) {
            try {
                this.labelFormatter = scale.tickFormat({
                    ticks: ticks,
                    specifier: format,
                });
            }
            catch (e) {
                this.labelFormatter = defaultLabelFormatter;
                Logger.warnOnce("the axis label format string " + format + " is invalid. No formatting will be applied");
            }
        }
        else {
            this.labelFormatter = defaultLabelFormatter;
        }
    };
    Axis.prototype.setDomain = function () {
        var _a;
        var _b = this, scale = _b.scale, dataDomain = _b.dataDomain, tickValues = _b.tick.values;
        if (tickValues && scale instanceof ContinuousScale) {
            var _c = __read((_a = extent(tickValues)) !== null && _a !== void 0 ? _a : [Infinity, -Infinity], 2), tickMin = _c[0], tickMax = _c[1];
            var min = Math.min(scale.fromDomain(dataDomain[0]), tickMin);
            var max = Math.max(scale.fromDomain(dataDomain[1]), tickMax);
            scale.domain = [scale.toDomain(min), scale.toDomain(max)];
        }
        else {
            scale.domain = dataDomain;
        }
    };
    Axis.prototype.setTickInterval = function (interval) {
        var _a;
        this.scale.interval = (_a = this.tick.interval) !== null && _a !== void 0 ? _a : interval;
    };
    Axis.prototype.setTickCount = function (count, minTickCount, maxTickCount) {
        var scale = this.scale;
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
    };
    Object.defineProperty(Axis.prototype, "gridLength", {
        get: function () {
            return this._gridLength;
        },
        set: function (value) {
            var _this = this;
            var _a;
            // Was visible and now invisible, or was invisible and now visible.
            if ((this._gridLength && !value) || (!this._gridLength && value)) {
                this.gridLineGroupSelection = this.gridLineGroupSelection.clear();
                this.gridArcGroupSelection = this.gridArcGroupSelection.clear();
            }
            this._gridLength = value;
            (_a = this.crossLines) === null || _a === void 0 ? void 0 : _a.forEach(function (crossLine) {
                _this.initCrossLine(crossLine);
            });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Axis.prototype, "radialGrid", {
        get: function () {
            return this._radialGrid;
        },
        set: function (value) {
            if (this._radialGrid !== value) {
                this._radialGrid = value;
                this.gridLineGroupSelection = this.gridLineGroupSelection.clear();
                this.gridArcGroupSelection = this.gridArcGroupSelection.clear();
            }
        },
        enumerable: false,
        configurable: true
    });
    Axis.prototype.createTick = function () {
        return new BaseAxisTick();
    };
    /**
     * Creates/removes/updates the scene graph nodes that constitute the axis.
     */
    Axis.prototype.update = function (primaryTickCount) {
        var _a = this.calculateRotations(), rotation = _a.rotation, parallelFlipRotation = _a.parallelFlipRotation, regularFlipRotation = _a.regularFlipRotation;
        var sideFlag = this.label.getSideFlag();
        var labelX = sideFlag * (this.tick.size + this.label.padding + this.seriesAreaPadding);
        this.updateScale();
        this.updatePosition({ rotation: rotation, sideFlag: sideFlag });
        this.updateLine();
        var _b = this.generateTicks({
            primaryTickCount: primaryTickCount,
            parallelFlipRotation: parallelFlipRotation,
            regularFlipRotation: regularFlipRotation,
            labelX: labelX,
            sideFlag: sideFlag,
        }), tickData = _b.tickData, combinedRotation = _b.combinedRotation, textBaseline = _b.textBaseline, textAlign = _b.textAlign, ticksResult = __rest(_b, ["tickData", "combinedRotation", "textBaseline", "textAlign"]);
        this.updateSelections(tickData.ticks);
        this.updateLabels({
            tickLabelGroupSelection: this.tickLabelGroupSelection,
            combinedRotation: combinedRotation,
            textBaseline: textBaseline,
            textAlign: textAlign,
            labelX: labelX,
        });
        this.updateVisibility();
        this.updateGridLines(sideFlag);
        this.updateTickLines(sideFlag);
        this.updateTitle({ anyTickVisible: tickData.ticks.length > 0, sideFlag: sideFlag });
        this.updateCrossLines({ rotation: rotation, parallelFlipRotation: parallelFlipRotation, regularFlipRotation: regularFlipRotation, sideFlag: sideFlag });
        this.updateLayoutState();
        primaryTickCount = ticksResult.primaryTickCount;
        return primaryTickCount;
    };
    Axis.prototype.updateLayoutState = function () {
        this.layout.label = {
            fractionDigits: this.fractionDigits,
            padding: this.label.padding,
            format: this.label.format,
        };
    };
    Axis.prototype.updateScale = function () {
        this.updateRange();
        this.calculateDomain();
        this.setDomain();
        this.setTickInterval(this.tick.interval);
        var _a = this, scale = _a.scale, nice = _a.nice;
        if (!(scale instanceof ContinuousScale)) {
            return;
        }
        this.setTickCount(this.tick.count);
        scale.nice = nice;
        scale.update();
    };
    Axis.prototype.calculateRotations = function () {
        var rotation = toRadians(this.rotation);
        // When labels are parallel to the axis line, the `parallelFlipFlag` is used to
        // flip the labels to avoid upside-down text, when the axis is rotated
        // such that it is in the right hemisphere, i.e. the angle of rotation
        // is in the [0, π] interval.
        // The rotation angle is normalized, so that we have an easier time checking
        // if it's in the said interval. Since the axis is always rendered vertically
        // and then rotated, zero rotation means 12 (not 3) o-clock.
        // -1 = flip
        //  1 = don't flip (default)
        var parallelFlipRotation = normalizeAngle360(rotation);
        var regularFlipRotation = normalizeAngle360(rotation - Math.PI / 2);
        return { rotation: rotation, parallelFlipRotation: parallelFlipRotation, regularFlipRotation: regularFlipRotation };
    };
    Axis.prototype.generateTicks = function (_a) {
        var e_1, _b, _c;
        var _d;
        var primaryTickCount = _a.primaryTickCount, parallelFlipRotation = _a.parallelFlipRotation, regularFlipRotation = _a.regularFlipRotation, labelX = _a.labelX, sideFlag = _a.sideFlag;
        var _e = this, scale = _e.scale, tick = _e.tick, _f = _e.label, parallel = _f.parallel, rotation = _f.rotation, fontFamily = _f.fontFamily, fontSize = _f.fontSize, fontStyle = _f.fontStyle, fontWeight = _f.fontWeight;
        var secondaryAxis = primaryTickCount !== undefined;
        var _g = calculateLabelRotation({
            rotation: rotation,
            parallel: parallel,
            regularFlipRotation: regularFlipRotation,
            parallelFlipRotation: parallelFlipRotation,
        }), defaultRotation = _g.defaultRotation, configuredRotation = _g.configuredRotation, parallelFlipFlag = _g.parallelFlipFlag, regularFlipFlag = _g.regularFlipFlag;
        var initialRotation = configuredRotation + defaultRotation;
        var labelMatrix = new Matrix();
        var maxTickCount = this.estimateTickCount({
            minSpacing: tick.minSpacing,
            maxSpacing: (_d = tick.maxSpacing) !== null && _d !== void 0 ? _d : NaN,
        }).maxTickCount;
        var continuous = scale instanceof ContinuousScale;
        var maxIterations = tick.count || !continuous || isNaN(maxTickCount) ? 10 : maxTickCount;
        var textAlign = getTextAlign(parallel, configuredRotation, 0, sideFlag, regularFlipFlag);
        var textBaseline = getTextBaseline(parallel, configuredRotation, sideFlag, parallelFlipFlag);
        var textProps = {
            fontFamily: fontFamily,
            fontSize: fontSize,
            fontStyle: fontStyle,
            fontWeight: fontWeight,
            textBaseline: textBaseline,
            textAlign: textAlign,
        };
        var tickData = {
            rawTicks: [],
            ticks: [],
            labelCount: 0,
        };
        var index = 0;
        var autoRotation = 0;
        var labelOverlap = true;
        var terminate = false;
        while (labelOverlap && index <= maxIterations) {
            if (terminate) {
                break;
            }
            autoRotation = 0;
            textAlign = getTextAlign(parallel, configuredRotation, 0, sideFlag, regularFlipFlag);
            var tickStrategies = this.getTickStrategies({ secondaryAxis: secondaryAxis, index: index });
            try {
                for (var tickStrategies_1 = (e_1 = void 0, __values(tickStrategies)), tickStrategies_1_1 = tickStrategies_1.next(); !tickStrategies_1_1.done; tickStrategies_1_1 = tickStrategies_1.next()) {
                    var strategy = tickStrategies_1_1.value;
                    (_c = strategy({
                        index: index,
                        tickData: tickData,
                        textProps: textProps,
                        labelOverlap: labelOverlap,
                        terminate: terminate,
                        primaryTickCount: primaryTickCount,
                    }), tickData = _c.tickData, index = _c.index, autoRotation = _c.autoRotation, terminate = _c.terminate);
                    var ticksResult = tickData.ticks;
                    textAlign = getTextAlign(parallel, configuredRotation, autoRotation, sideFlag, regularFlipFlag);
                    var rotated = configuredRotation !== 0 || autoRotation !== 0;
                    var rotation_1 = initialRotation + autoRotation;
                    labelOverlap = this.checkLabelOverlap(rotation_1, rotated, labelMatrix, ticksResult, labelX, __assign(__assign({}, textProps), { textAlign: textAlign }));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (tickStrategies_1_1 && !tickStrategies_1_1.done && (_b = tickStrategies_1.return)) _b.call(tickStrategies_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        var combinedRotation = defaultRotation + configuredRotation + autoRotation;
        if (!secondaryAxis && tickData.rawTicks.length > 0) {
            primaryTickCount = tickData.rawTicks.length;
        }
        return { tickData: tickData, primaryTickCount: primaryTickCount, combinedRotation: combinedRotation, textBaseline: textBaseline, textAlign: textAlign };
    };
    Axis.prototype.getTickStrategies = function (_a) {
        var _this = this;
        var index = _a.index, secondaryAxis = _a.secondaryAxis;
        var _b = this, scale = _b.scale, label = _b.label, tick = _b.tick;
        var continuous = scale instanceof ContinuousScale;
        var avoidLabelCollisions = label.enabled && label.avoidCollisions;
        var filterTicks = !(continuous && this.tick.count === undefined) && index !== 0 && avoidLabelCollisions;
        var autoRotate = label.autoRotate === true && label.rotation === undefined;
        var strategies = [];
        var tickGenerationType;
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
        var tickGenerationStrategy = function (_a) {
            var index = _a.index, tickData = _a.tickData, primaryTickCount = _a.primaryTickCount, terminate = _a.terminate;
            return _this.createTickData(tickGenerationType, index, tickData, terminate, primaryTickCount);
        };
        strategies.push(tickGenerationStrategy);
        if (!continuous && !isNaN(tick.minSpacing)) {
            var tickFilterStrategy = function (_a) {
                var index = _a.index, tickData = _a.tickData, primaryTickCount = _a.primaryTickCount, terminate = _a.terminate;
                return _this.createTickData(TickGenerationType.FILTER, index, tickData, terminate, primaryTickCount);
            };
            strategies.push(tickFilterStrategy);
        }
        if (!avoidLabelCollisions) {
            return strategies;
        }
        if (label.autoWrap) {
            var autoWrapStrategy = function (_a) {
                var index = _a.index, tickData = _a.tickData, textProps = _a.textProps;
                return _this.wrapLabels(tickData, index, textProps);
            };
            strategies.push(autoWrapStrategy);
        }
        else if (autoRotate) {
            var autoRotateStrategy = function (_a) {
                var index = _a.index, tickData = _a.tickData, labelOverlap = _a.labelOverlap, terminate = _a.terminate;
                return ({
                    index: index,
                    tickData: tickData,
                    autoRotation: _this.getAutoRotation(labelOverlap),
                    terminate: terminate,
                });
            };
            strategies.push(autoRotateStrategy);
        }
        return strategies;
    };
    Axis.prototype.createTickData = function (tickGenerationType, index, tickData, terminate, primaryTickCount) {
        var _a, _b, _c;
        var _d = this, scale = _d.scale, tick = _d.tick;
        var _e = this.estimateTickCount({
            minSpacing: tick.minSpacing,
            maxSpacing: (_a = tick.maxSpacing) !== null && _a !== void 0 ? _a : NaN,
        }), maxTickCount = _e.maxTickCount, minTickCount = _e.minTickCount, defaultTickCount = _e.defaultTickCount;
        var continuous = scale instanceof ContinuousScale;
        var maxIterations = tick.count || !continuous || isNaN(maxTickCount) ? 10 : maxTickCount;
        var tickCount = (_b = tick.count) !== null && _b !== void 0 ? _b : (continuous ? Math.max(defaultTickCount - index, minTickCount) : maxTickCount);
        var regenerateTicks = tick.interval === undefined &&
            tick.values === undefined &&
            tick.count === undefined &&
            tickCount > minTickCount &&
            (continuous || tickGenerationType === TickGenerationType.FILTER);
        var unchanged = true;
        while (unchanged && index <= maxIterations) {
            var prevTicks = tickData.rawTicks;
            tickCount = (_c = tick.count) !== null && _c !== void 0 ? _c : (continuous ? Math.max(defaultTickCount - index, minTickCount) : maxTickCount);
            var _f = this.getTicks({
                tickGenerationType: tickGenerationType,
                previousTicks: prevTicks,
                tickCount: tickCount,
                minTickCount: minTickCount,
                maxTickCount: maxTickCount,
                primaryTickCount: primaryTickCount,
            }), rawTicks = _f.rawTicks, ticks = _f.ticks, labelCount = _f.labelCount;
            tickData.rawTicks = rawTicks;
            tickData.ticks = ticks;
            tickData.labelCount = labelCount;
            unchanged = regenerateTicks ? areArrayNumbersEqual(rawTicks, prevTicks) : false;
            index++;
        }
        return { tickData: tickData, index: index, autoRotation: 0, terminate: terminate };
    };
    Axis.prototype.checkLabelOverlap = function (rotation, rotated, labelMatrix, tickData, labelX, textProps) {
        Matrix.updateTransformMatrix(labelMatrix, 1, 1, rotation, 0, 0);
        var labelData = this.createLabelData(tickData, labelX, textProps, labelMatrix);
        var labelSpacing = getLabelSpacing(this.label.minSpacing, rotated);
        return axisLabelsOverlap(labelData, labelSpacing);
    };
    Axis.prototype.createLabelData = function (tickData, labelX, textProps, labelMatrix) {
        var e_2, _a;
        var labelData = [];
        try {
            for (var tickData_1 = __values(tickData), tickData_1_1 = tickData_1.next(); !tickData_1_1.done; tickData_1_1 = tickData_1.next()) {
                var tickDatum = tickData_1_1.value;
                var tickLabel = tickDatum.tickLabel, translationY = tickDatum.translationY;
                if (tickLabel === '' || tickLabel == undefined) {
                    // skip user hidden ticks
                    continue;
                }
                var lines = splitText(tickLabel);
                var _b = measureText(lines, labelX, translationY, textProps), width = _b.width, height = _b.height;
                var bbox = new BBox(labelX, translationY, width, height);
                var labelDatum = calculateLabelBBox(tickLabel, bbox, labelX, translationY, labelMatrix);
                labelData.push(labelDatum);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (tickData_1_1 && !tickData_1_1.done && (_a = tickData_1.return)) _a.call(tickData_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return labelData;
    };
    Axis.prototype.getAutoRotation = function (labelOveralap) {
        return labelOveralap ? normalizeAngle360(toRadians(this.label.autoRotateAngle)) : 0;
    };
    Axis.prototype.getTicks = function (_a) {
        var _b;
        var tickGenerationType = _a.tickGenerationType, previousTicks = _a.previousTicks, tickCount = _a.tickCount, minTickCount = _a.minTickCount, maxTickCount = _a.maxTickCount, primaryTickCount = _a.primaryTickCount;
        var scale = this.scale;
        var rawTicks = [];
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
        var halfBandwidth = ((_b = this.scale.bandwidth) !== null && _b !== void 0 ? _b : 0) / 2;
        var ticks = [];
        var labelCount = 0;
        for (var i = 0; i < rawTicks.length; i++) {
            var rawTick = rawTicks[i];
            var translationY = scale.convert(rawTick) + halfBandwidth;
            var tickLabel = this.formatTick(rawTick, i);
            ticks.push({ tick: rawTick, tickLabel: tickLabel, translationY: translationY });
            if (tickLabel === '' || tickLabel == undefined) {
                continue;
            }
            labelCount++;
        }
        return { rawTicks: rawTicks, ticks: ticks, labelCount: labelCount };
    };
    Axis.prototype.filterTicks = function (ticks, tickCount) {
        var _a;
        var tickSpacing = !isNaN(this.tick.minSpacing) || !isNaN((_a = this.tick.maxSpacing) !== null && _a !== void 0 ? _a : NaN);
        var keepEvery = tickSpacing ? Math.ceil(ticks.length / tickCount) : 2;
        return ticks.filter(function (_, i) { return i % keepEvery === 0; });
    };
    Axis.prototype.createTicks = function (tickCount, minTickCount, maxTickCount) {
        this.setTickCount(tickCount, minTickCount, maxTickCount);
        return this.scale.ticks();
    };
    Axis.prototype.estimateTickCount = function (_a) {
        var minSpacing = _a.minSpacing, maxSpacing = _a.maxSpacing;
        var availableRange = this.calculateAvailableRange();
        var defaultMinSpacing = Math.max(Axis.defaultTickMinSpacing, availableRange / ContinuousScale.defaultMaxTickCount);
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
        var maxTickCount = Math.max(1, Math.floor(availableRange / minSpacing));
        var minTickCount = Math.min(maxTickCount, Math.ceil(availableRange / maxSpacing));
        var defaultTickCount = ContinuousScale.defaultTickCount;
        if (defaultTickCount > maxTickCount) {
            defaultTickCount = maxTickCount;
        }
        else if (defaultTickCount < minTickCount) {
            defaultTickCount = minTickCount;
        }
        return { minTickCount: minTickCount, maxTickCount: maxTickCount, defaultTickCount: defaultTickCount };
    };
    Axis.prototype.updateVisibility = function () {
        var requestedRange = this.range;
        var requestedRangeMin = Math.min.apply(Math, __spreadArray([], __read(requestedRange)));
        var requestedRangeMax = Math.max.apply(Math, __spreadArray([], __read(requestedRange)));
        var visibleFn = function (node) {
            var min = Math.floor(requestedRangeMin);
            var max = Math.ceil(requestedRangeMax);
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
            var visible = node.translationY >= min && node.translationY <= max;
            node.visible = visible;
        };
        var _a = this, gridLineGroupSelection = _a.gridLineGroupSelection, gridArcGroupSelection = _a.gridArcGroupSelection, tickLineGroupSelection = _a.tickLineGroupSelection, tickLabelGroupSelection = _a.tickLabelGroupSelection;
        gridLineGroupSelection.each(visibleFn);
        gridArcGroupSelection.each(visibleFn);
        tickLineGroupSelection.each(visibleFn);
        tickLabelGroupSelection.each(visibleFn);
        this.tickLineGroup.visible = this.tick.enabled;
        this.tickLabelGroup.visible = this.label.enabled;
    };
    Axis.prototype.updateCrossLines = function (_a) {
        var _this = this;
        var _b;
        var rotation = _a.rotation, parallelFlipRotation = _a.parallelFlipRotation, regularFlipRotation = _a.regularFlipRotation, sideFlag = _a.sideFlag;
        var anySeriesActive = this.isAnySeriesActive();
        (_b = this.crossLines) === null || _b === void 0 ? void 0 : _b.forEach(function (crossLine) {
            var _a;
            crossLine.sideFlag = -sideFlag;
            crossLine.direction = rotation === -Math.PI / 2 ? ChartAxisDirection.X : ChartAxisDirection.Y;
            crossLine.label.parallel = (_a = crossLine.label.parallel) !== null && _a !== void 0 ? _a : _this.label.parallel;
            crossLine.parallelFlipRotation = parallelFlipRotation;
            crossLine.regularFlipRotation = regularFlipRotation;
            crossLine.update(anySeriesActive);
        });
    };
    Axis.prototype.updateTickLines = function (sideFlag) {
        var tick = this.tick;
        this.tickLineGroupSelection.each(function (line) {
            line.strokeWidth = tick.width;
            line.stroke = tick.color;
            line.x1 = sideFlag * tick.size;
            line.x2 = 0;
            line.y1 = 0;
            line.y2 = 0;
        });
    };
    Axis.prototype.calculateAvailableRange = function () {
        var requestedRange = this.range;
        var min = Math.min.apply(Math, __spreadArray([], __read(requestedRange)));
        var max = Math.max.apply(Math, __spreadArray([], __read(requestedRange)));
        return max - min;
    };
    Axis.prototype.calculateDomain = function () {
        // Placeholder for subclasses to override.
    };
    Axis.prototype.updatePosition = function (_a) {
        var rotation = _a.rotation, sideFlag = _a.sideFlag;
        var _b = this, crossLineGroup = _b.crossLineGroup, axisGroup = _b.axisGroup, gridGroup = _b.gridGroup, translation = _b.translation, gridLineGroupSelection = _b.gridLineGroupSelection, gridPadding = _b.gridPadding, gridLength = _b.gridLength;
        var translationX = Math.floor(translation.x);
        var translationY = Math.floor(translation.y);
        crossLineGroup.translationX = translationX;
        crossLineGroup.translationY = translationY;
        crossLineGroup.rotation = rotation;
        axisGroup.translationX = translationX;
        axisGroup.translationY = translationY;
        axisGroup.rotation = rotation;
        gridGroup.translationX = translationX;
        gridGroup.translationY = translationY;
        gridGroup.rotation = rotation;
        gridLineGroupSelection.each(function (line) {
            line.x1 = gridPadding;
            line.x2 = -sideFlag * gridLength + gridPadding;
            line.y1 = 0;
            line.y2 = 0;
        });
    };
    Axis.prototype.updateSecondaryAxisTicks = function (_primaryTickCount) {
        throw new Error('AG Charts - unexpected call to updateSecondaryAxisTicks() - check axes configuration.');
    };
    Axis.prototype.updateSelections = function (data) {
        var gridData = this.gridLength ? data : [];
        var gridLineGroupSelection = this.radialGrid
            ? this.gridLineGroupSelection
            : this.gridLineGroupSelection.update(gridData, function (group) {
                var node = new Line();
                node.tag = Tags.GridLine;
                group.append(node);
            });
        var gridArcGroupSelection = this.radialGrid
            ? this.gridArcGroupSelection.update(gridData, function (group) {
                var node = new Arc();
                node.tag = Tags.GridArc;
                group.append(node);
            })
            : this.gridArcGroupSelection;
        var tickLineGroupSelection = this.tickLineGroupSelection.update(data, function (group) {
            var line = new Line();
            line.tag = Tags.TickLine;
            group.appendChild(line);
        });
        var tickLabelGroupSelection = this.tickLabelGroupSelection.update(data, function (group) {
            var text = new Text();
            text.tag = Tags.TickLabel;
            group.appendChild(text);
        });
        // We need raw `translationY` values on `datum` for accurate label collision detection in axes.update()
        // But node `translationY` values must be rounded to get pixel grid alignment
        var translationFn = function (node) { return (node.translationY = Math.round(node.datum.translationY)); };
        gridLineGroupSelection.each(translationFn);
        gridArcGroupSelection.each(translationFn);
        tickLineGroupSelection.each(translationFn);
        tickLabelGroupSelection.each(translationFn);
        this.tickLineGroupSelection = tickLineGroupSelection;
        this.tickLabelGroupSelection = tickLabelGroupSelection;
        this.gridLineGroupSelection = gridLineGroupSelection;
        this.gridArcGroupSelection = gridArcGroupSelection;
    };
    Axis.prototype.updateGridLines = function (sideFlag) {
        var _a;
        var _b = this, gridStyle = _b.gridStyle, scale = _b.scale, tick = _b.tick, gridPadding = _b.gridPadding, gridLength = _b.gridLength;
        if (gridLength && gridStyle.length) {
            var styleCount_1 = gridStyle.length;
            var grid = void 0;
            if (this.radialGrid) {
                var angularGridLength_1 = normalizeAngle360Inclusive(toRadians(gridLength));
                var halfBandwidth_1 = ((_a = this.scale.bandwidth) !== null && _a !== void 0 ? _a : 0) / 2;
                grid = this.gridArcGroupSelection.each(function (arc, datum) {
                    var radius = Math.round(scale.convert(datum) + halfBandwidth_1);
                    arc.centerX = 0;
                    arc.centerY = scale.range[0] - radius;
                    arc.endAngle = angularGridLength_1;
                    arc.radius = radius;
                });
            }
            else {
                grid = this.gridLineGroupSelection.each(function (line) {
                    line.x1 = gridPadding;
                    line.x2 = -sideFlag * gridLength + gridPadding;
                    line.y1 = 0;
                    line.y2 = 0;
                });
            }
            grid.each(function (node, _, index) {
                var style = gridStyle[index % styleCount_1];
                node.stroke = style.stroke;
                node.strokeWidth = tick.width;
                node.lineDash = style.lineDash;
                node.fill = undefined;
            });
        }
    };
    Axis.prototype.updateLabels = function (_a) {
        var tickLabelGroupSelection = _a.tickLabelGroupSelection, combinedRotation = _a.combinedRotation, textBaseline = _a.textBaseline, textAlign = _a.textAlign, labelX = _a.labelX;
        var _b = this, label = _b.label, labelsEnabled = _b.label.enabled;
        if (!labelsEnabled) {
            return { labelData: [], rotated: false };
        }
        // Apply label option values
        tickLabelGroupSelection.each(function (node, datum) {
            var tickLabel = datum.tickLabel;
            node.fontStyle = label.fontStyle;
            node.fontWeight = label.fontWeight;
            node.fontSize = label.fontSize;
            node.fontFamily = label.fontFamily;
            node.fill = label.color;
            node.text = tickLabel;
            var userHidden = node.text === '' || node.text == undefined;
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
    };
    Axis.prototype.wrapLabels = function (tickData, index, labelProps) {
        var _a = this.label, parallel = _a.parallel, maxWidth = _a.maxWidth, maxHeight = _a.maxHeight;
        var defaultMaxLabelWidth = parallel
            ? Math.round(this.calculateAvailableRange() / tickData.labelCount)
            : this.maxThickness;
        var maxLabelWidth = maxWidth !== null && maxWidth !== void 0 ? maxWidth : defaultMaxLabelWidth;
        var defaultMaxLabelHeight = parallel
            ? this.maxThickness
            : Math.round(this.calculateAvailableRange() / tickData.labelCount);
        var maxLabelHeight = maxHeight !== null && maxHeight !== void 0 ? maxHeight : defaultMaxLabelHeight;
        tickData.ticks.forEach(function (tickDatum) {
            var tickLabel = tickDatum.tickLabel;
            var wrapping = 'hyphenate';
            var wrappedTickLabel = Text.wrap(tickLabel, maxLabelWidth, maxLabelHeight, labelProps, wrapping);
            tickDatum.tickLabel = wrappedTickLabel;
        });
        return { tickData: tickData, index: index, autoRotation: 0, terminate: true };
    };
    Axis.prototype.updateLine = function () {
        // Render axis line.
        var _a = this, lineNode = _a.lineNode, requestedRange = _a.range;
        lineNode.x1 = 0;
        lineNode.x2 = 0;
        lineNode.y1 = requestedRange[0];
        lineNode.y2 = requestedRange[1];
        lineNode.strokeWidth = this.line.width;
        lineNode.stroke = this.line.color;
        lineNode.visible = true;
    };
    Axis.prototype.updateTitle = function (_a) {
        var _b;
        var anyTickVisible = _a.anyTickVisible, sideFlag = _a.sideFlag;
        var identityFormatter = function (params) { return params.defaultValue; };
        var _c = this, rotation = _c.rotation, title = _c.title, _titleCaption = _c._titleCaption, lineNode = _c.lineNode, requestedRange = _c.range, tickLineGroup = _c.tickLineGroup, tickLabelGroup = _c.tickLabelGroup, callbackCache = _c.moduleCtx.callbackCache;
        var _d = ((_b = this.title) !== null && _b !== void 0 ? _b : {}).formatter, formatter = _d === void 0 ? identityFormatter : _d;
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
        var titleVisible = false;
        var titleNode = _titleCaption.node;
        if (title.enabled && lineNode.visible) {
            titleVisible = true;
            var parallelFlipRotation = normalizeAngle360(rotation);
            var padding = Caption.PADDING;
            var titleRotationFlag = sideFlag === -1 && parallelFlipRotation > Math.PI && parallelFlipRotation < Math.PI * 2 ? -1 : 1;
            titleNode.rotation = (titleRotationFlag * sideFlag * Math.PI) / 2;
            titleNode.x = Math.floor((titleRotationFlag * sideFlag * (requestedRange[0] + requestedRange[1])) / 2);
            var bboxYDimension = 0;
            if (anyTickVisible) {
                var tickBBox = Group.computeBBox([tickLineGroup, tickLabelGroup]);
                var tickWidth = rotation === 0 ? tickBBox.width : tickBBox.height;
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
    };
    // For formatting (nice rounded) tick values.
    Axis.prototype.formatTick = function (datum, index) {
        var _a, _b;
        var _c = this, label = _c.label, labelFormatter = _c.labelFormatter, fractionDigits = _c.fractionDigits, callbackCache = _c.moduleCtx.callbackCache;
        if (label.formatter) {
            var defaultValue = fractionDigits > 0 ? datum : String(datum);
            return ((_a = callbackCache.call(label.formatter, {
                value: defaultValue,
                index: index,
                fractionDigits: fractionDigits,
                formatter: labelFormatter,
            })) !== null && _a !== void 0 ? _a : defaultValue);
        }
        else if (labelFormatter) {
            return (_b = callbackCache.call(labelFormatter, datum)) !== null && _b !== void 0 ? _b : String(datum);
        }
        // The axis is using a logScale or the`datum` is an integer, a string or an object
        return String(datum);
    };
    // For formatting arbitrary values between the ticks.
    Axis.prototype.formatDatum = function (datum) {
        return String(datum);
    };
    Axis.prototype.computeBBox = function () {
        return this.axisGroup.computeBBox();
    };
    Axis.prototype.initCrossLine = function (crossLine) {
        crossLine.scale = this.scale;
        crossLine.gridLength = this.gridLength;
    };
    Axis.prototype.isAnySeriesActive = function () {
        return false;
    };
    Axis.prototype.clipTickLines = function (x, y, width, height) {
        this.tickLineGroup.setClipRectInGroupCoordinateSpace(new BBox(x, y, width, height));
    };
    Axis.prototype.clipGrid = function (x, y, width, height) {
        this.gridGroup.setClipRectInGroupCoordinateSpace(new BBox(x, y, width, height));
    };
    Axis.prototype.calculatePadding = function (min, _max) {
        return Math.abs(min * 0.01);
    };
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
    return Axis;
}());
export { Axis };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXhpcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9heGlzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDdEMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQzlDLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUMxQyxPQUFPLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQXNCLFNBQVMsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQy9GLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUN4QyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDcEMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUNyQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsMEJBQTBCLEVBQUUsU0FBUyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3hGLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNwRCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFFcEQsT0FBTyxFQUNILFFBQVEsRUFDUixPQUFPLEVBQ1AsV0FBVyxFQUNYLE1BQU0sRUFDTixVQUFVLEVBQ1YsY0FBYyxFQUNkLGVBQWUsRUFDZixNQUFNLEVBQ04sZ0JBQWdCLEVBQ2hCLFFBQVEsRUFDUixLQUFLLEVBQ0wsb0JBQW9CLEVBQ3BCLFVBQVUsRUFDVixTQUFTLEVBQ1QsU0FBUyxFQUNULGFBQWEsRUFDYixHQUFHLEVBQ0gsU0FBUyxFQUNULFlBQVksR0FDZixNQUFNLG1C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