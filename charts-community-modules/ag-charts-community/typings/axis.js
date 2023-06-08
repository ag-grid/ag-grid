"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Axis = exports.AxisTitle = exports.AxisLabel = exports.BaseAxisTick = exports.AxisLine = exports.Tags = void 0;
var group_1 = require("./scene/group");
var selection_1 = require("./scene/selection");
var line_1 = require("./scene/shape/line");
var text_1 = require("./scene/shape/text");
var arc_1 = require("./scene/shape/arc");
var bbox_1 = require("./scene/bbox");
var caption_1 = require("./caption");
var id_1 = require("./util/id");
var angle_1 = require("./util/angle");
var interval_1 = require("./util/time/interval");
var equal_1 = require("./util/equal");
var validation_1 = require("./util/validation");
var layers_1 = require("./chart/layers");
var labelPlacement_1 = require("./util/labelPlacement");
var continuousScale_1 = require("./scale/continuousScale");
var matrix_1 = require("./scene/matrix");
var timeScale_1 = require("./scale/timeScale");
var logScale_1 = require("./scale/logScale");
var default_1 = require("./util/default");
var deprecation_1 = require("./util/deprecation");
var array_1 = require("./util/array");
var chartAxisDirection_1 = require("./chart/chartAxisDirection");
var label_1 = require("./chart/label");
var logger_1 = require("./util/logger");
var TICK_COUNT = validation_1.predicateWithMessage(function (v, ctx) { return validation_1.NUMBER(0)(v, ctx) || v instanceof interval_1.TimeInterval; }, "expecting a tick count Number value or, for a time axis, a Time Interval such as 'agCharts.time.month'");
var OPT_TICK_COUNT = validation_1.predicateWithMessage(function (v, ctx) { return validation_1.OPTIONAL(v, ctx, TICK_COUNT); }, "expecting an optional tick count Number value or, for a time axis, a Time Interval such as 'agCharts.time.month'");
var OPT_TICK_INTERVAL = validation_1.predicateWithMessage(function (v, ctx) { return validation_1.OPTIONAL(v, ctx, function (v, ctx) { return (v !== 0 && validation_1.NUMBER(0)(v, ctx)) || v instanceof interval_1.TimeInterval; }); }, "expecting an optional non-zero positive Number value or, for a time axis, a Time Interval such as 'agCharts.time.month'");
var GRID_STYLE_KEYS = ['stroke', 'lineDash'];
var GRID_STYLE = validation_1.predicateWithMessage(validation_1.ARRAY(undefined, function (o) {
    for (var key in o) {
        if (!GRID_STYLE_KEYS.includes(key)) {
            return false;
        }
    }
    return true;
}), "expecting an Array of objects with gridline style properties such as 'stroke' and 'lineDash'");
var Tags;
(function (Tags) {
    Tags[Tags["TickLine"] = 0] = "TickLine";
    Tags[Tags["TickLabel"] = 1] = "TickLabel";
    Tags[Tags["GridLine"] = 2] = "GridLine";
    Tags[Tags["GridArc"] = 3] = "GridArc";
    Tags[Tags["AxisLine"] = 4] = "AxisLine";
})(Tags = exports.Tags || (exports.Tags = {}));
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
        validation_1.Validate(validation_1.NUMBER(0))
    ], AxisLine.prototype, "width", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_COLOR_STRING)
    ], AxisLine.prototype, "color", void 0);
    return AxisLine;
}());
exports.AxisLine = AxisLine;
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
        validation_1.Validate(validation_1.BOOLEAN)
    ], BaseAxisTick.prototype, "enabled", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], BaseAxisTick.prototype, "width", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], BaseAxisTick.prototype, "size", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_COLOR_STRING)
    ], BaseAxisTick.prototype, "color", void 0);
    __decorate([
        validation_1.Validate(OPT_TICK_COUNT),
        deprecation_1.Deprecated('Use tick.interval or tick.minSpacing and tick.maxSpacing instead')
    ], BaseAxisTick.prototype, "count", void 0);
    __decorate([
        validation_1.Validate(OPT_TICK_INTERVAL)
    ], BaseAxisTick.prototype, "interval", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_ARRAY())
    ], BaseAxisTick.prototype, "values", void 0);
    __decorate([
        validation_1.Validate(validation_1.AND(validation_1.NUMBER_OR_NAN(1), validation_1.LESS_THAN('maxSpacing'))),
        default_1.Default(NaN)
    ], BaseAxisTick.prototype, "minSpacing", void 0);
    return BaseAxisTick;
}());
exports.BaseAxisTick = BaseAxisTick;
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
        return text_1.getFont(this);
    };
    __decorate([
        validation_1.Validate(validation_1.BOOLEAN)
    ], AxisLabel.prototype, "enabled", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_BOOLEAN)
    ], AxisLabel.prototype, "autoWrap", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_NUMBER(0))
    ], AxisLabel.prototype, "maxWidth", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_NUMBER(0))
    ], AxisLabel.prototype, "maxHeight", void 0);
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
    return AxisLabel;
}());
exports.AxisLabel = AxisLabel;
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
        validation_1.Validate(validation_1.BOOLEAN)
    ], AxisTitle.prototype, "enabled", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], AxisTitle.prototype, "text", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_FONT_STYLE)
    ], AxisTitle.prototype, "fontStyle", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_FONT_WEIGHT)
    ], AxisTitle.prototype, "fontWeight", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], AxisTitle.prototype, "fontSize", void 0);
    __decorate([
        validation_1.Validate(validation_1.STRING)
    ], AxisTitle.prototype, "fontFamily", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_COLOR_STRING)
    ], AxisTitle.prototype, "color", void 0);
    __decorate([
        validation_1.Validate(validation_1.TEXT_WRAP)
    ], AxisTitle.prototype, "wrapping", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_FUNCTION)
    ], AxisTitle.prototype, "formatter", void 0);
    return AxisTitle;
}());
exports.AxisTitle = AxisTitle;
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
        this.id = id_1.createId(this);
        this.nice = true;
        this.dataDomain = [];
        this.axisGroup = new group_1.Group({ name: this.id + "-axis", zIndex: layers_1.Layers.AXIS_ZINDEX });
        this.lineNode = this.axisGroup.appendChild(new line_1.Line());
        this.tickLineGroup = this.axisGroup.appendChild(new group_1.Group({ name: this.id + "-Axis-tick-lines", zIndex: layers_1.Layers.AXIS_ZINDEX }));
        this.tickLabelGroup = this.axisGroup.appendChild(new group_1.Group({ name: this.id + "-Axis-tick-labels", zIndex: layers_1.Layers.AXIS_ZINDEX }));
        this.crossLineGroup = new group_1.Group({ name: this.id + "-CrossLines" });
        this.gridGroup = new group_1.Group({ name: this.id + "-Axis-grid" });
        this.gridLineGroup = this.gridGroup.appendChild(new group_1.Group({
            name: this.id + "-gridLines",
            zIndex: layers_1.Layers.AXIS_GRID_ZINDEX,
        }));
        this.gridArcGroup = this.gridGroup.appendChild(new group_1.Group({
            name: this.id + "-gridArcs",
            zIndex: layers_1.Layers.AXIS_GRID_ZINDEX,
        }));
        this.tickLineGroupSelection = selection_1.Selection.select(this.tickLineGroup, line_1.Line);
        this.tickLabelGroupSelection = selection_1.Selection.select(this.tickLabelGroup, text_1.Text);
        this.gridLineGroupSelection = selection_1.Selection.select(this.gridLineGroup, line_1.Line);
        this.gridArcGroupSelection = selection_1.Selection.select(this.gridArcGroup, arc_1.Arc);
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
        this._titleCaption = new caption_1.Caption();
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
        var logScale = scale instanceof logScale_1.LogScale;
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
                logger_1.Logger.warnOnce("the axis label format string " + format + " is invalid. No formatting will be applied");
            }
        }
        else {
            this.labelFormatter = defaultLabelFormatter;
        }
    };
    Axis.prototype.setDomain = function () {
        var _a;
        var _b = this, scale = _b.scale, dataDomain = _b.dataDomain, tickValues = _b.tick.values;
        if (tickValues && scale instanceof continuousScale_1.ContinuousScale) {
            var _c = __read((_a = array_1.extent(tickValues)) !== null && _a !== void 0 ? _a : [Infinity, -Infinity], 2), tickMin = _c[0], tickMax = _c[1];
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
        if (!(scale instanceof continuousScale_1.ContinuousScale)) {
            return;
        }
        this.setTickCount(this.tick.count);
        scale.nice = nice;
        scale.update();
    };
    Axis.prototype.calculateRotations = function () {
        var rotation = angle_1.toRadians(this.rotation);
        // When labels are parallel to the axis line, the `parallelFlipFlag` is used to
        // flip the labels to avoid upside-down text, when the axis is rotated
        // such that it is in the right hemisphere, i.e. the angle of rotation
        // is in the [0, π] interval.
        // The rotation angle is normalized, so that we have an easier time checking
        // if it's in the said interval. Since the axis is always rendered vertically
        // and then rotated, zero rotation means 12 (not 3) o-clock.
        // -1 = flip
        //  1 = don't flip (default)
        var parallelFlipRotation = angle_1.normalizeAngle360(rotation);
        var regularFlipRotation = angle_1.normalizeAngle360(rotation - Math.PI / 2);
        return { rotation: rotation, parallelFlipRotation: parallelFlipRotation, regularFlipRotation: regularFlipRotation };
    };
    Axis.prototype.generateTicks = function (_a) {
        var e_1, _b, _c;
        var _d;
        var primaryTickCount = _a.primaryTickCount, parallelFlipRotation = _a.parallelFlipRotation, regularFlipRotation = _a.regularFlipRotation, labelX = _a.labelX, sideFlag = _a.sideFlag;
        var _e = this, scale = _e.scale, tick = _e.tick, _f = _e.label, parallel = _f.parallel, rotation = _f.rotation, fontFamily = _f.fontFamily, fontSize = _f.fontSize, fontStyle = _f.fontStyle, fontWeight = _f.fontWeight;
        var secondaryAxis = primaryTickCount !== undefined;
        var _g = label_1.calculateLabelRotation({
            rotation: rotation,
            parallel: parallel,
            regularFlipRotation: regularFlipRotation,
            parallelFlipRotation: parallelFlipRotation,
        }), defaultRotation = _g.defaultRotation, configuredRotation = _g.configuredRotation, parallelFlipFlag = _g.parallelFlipFlag, regularFlipFlag = _g.regularFlipFlag;
        var initialRotation = configuredRotation + defaultRotation;
        var labelMatrix = new matrix_1.Matrix();
        var maxTickCount = this.estimateTickCount({
            minSpacing: tick.minSpacing,
            maxSpacing: (_d = tick.maxSpacing) !== null && _d !== void 0 ? _d : NaN,
        }).maxTickCount;
        var continuous = scale instanceof continuousScale_1.ContinuousScale;
        var maxIterations = tick.count || !continuous || isNaN(maxTickCount) ? 10 : maxTickCount;
        var textAlign = label_1.getTextAlign(parallel, configuredRotation, 0, sideFlag, regularFlipFlag);
        var textBaseline = label_1.getTextBaseline(parallel, configuredRotation, sideFlag, parallelFlipFlag);
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
            textAlign = label_1.getTextAlign(parallel, configuredRotation, 0, sideFlag, regularFlipFlag);
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
                    textAlign = label_1.getTextAlign(parallel, configuredRotation, autoRotation, sideFlag, regularFlipFlag);
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
        var continuous = scale instanceof continuousScale_1.ContinuousScale;
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
        var continuous = scale instanceof continuousScale_1.ContinuousScale;
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
            unchanged = regenerateTicks ? equal_1.areArrayNumbersEqual(rawTicks, prevTicks) : false;
            index++;
        }
        var shouldTerminate = tick.interval !== undefined || tick.values !== undefined;
        terminate || (terminate = shouldTerminate);
        return { tickData: tickData, index: index, autoRotation: 0, terminate: terminate };
    };
    Axis.prototype.checkLabelOverlap = function (rotation, rotated, labelMatrix, tickData, labelX, textProps) {
        matrix_1.Matrix.updateTransformMatrix(labelMatrix, 1, 1, rotation, 0, 0);
        var labelData = this.createLabelData(tickData, labelX, textProps, labelMatrix);
        var labelSpacing = label_1.getLabelSpacing(this.label.minSpacing, rotated);
        return labelPlacement_1.axisLabelsOverlap(labelData, labelSpacing);
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
                var lines = text_1.splitText(tickLabel);
                var _b = text_1.measureText(lines, labelX, translationY, textProps), width = _b.width, height = _b.height;
                var bbox = new bbox_1.BBox(labelX, translationY, width, height);
                var labelDatum = label_1.calculateLabelBBox(tickLabel, bbox, labelX, translationY, labelMatrix);
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
        return labelOveralap ? angle_1.normalizeAngle360(angle_1.toRadians(this.label.autoRotateAngle)) : 0;
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
        var defaultMinSpacing = Math.max(Axis.defaultTickMinSpacing, availableRange / continuousScale_1.ContinuousScale.defaultMaxTickCount);
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
        var defaultTickCount = continuousScale_1.ContinuousScale.defaultTickCount;
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
            crossLine.direction = rotation === -Math.PI / 2 ? chartAxisDirection_1.ChartAxisDirection.X : chartAxisDirection_1.ChartAxisDirection.Y;
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
                var node = new line_1.Line();
                node.tag = Tags.GridLine;
                group.append(node);
            });
        var gridArcGroupSelection = this.radialGrid
            ? this.gridArcGroupSelection.update(gridData, function (group) {
                var node = new arc_1.Arc();
                node.tag = Tags.GridArc;
                group.append(node);
            })
            : this.gridArcGroupSelection;
        var tickLineGroupSelection = this.tickLineGroupSelection.update(data, function (group) {
            var line = new line_1.Line();
            line.tag = Tags.TickLine;
            group.appendChild(line);
        });
        var tickLabelGroupSelection = this.tickLabelGroupSelection.update(data, function (group) {
            var text = new text_1.Text();
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
                var angularGridLength_1 = angle_1.normalizeAngle360Inclusive(angle_1.toRadians(gridLength));
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
            var wrappedTickLabel = text_1.Text.wrap(tickLabel, maxLabelWidth, maxLabelHeight, labelProps, wrapping);
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
            var parallelFlipRotation = angle_1.normalizeAngle360(rotation);
            var padding = caption_1.Caption.PADDING;
            var titleRotationFlag = sideFlag === -1 && parallelFlipRotation > Math.PI && parallelFlipRotation < Math.PI * 2 ? -1 : 1;
            titleNode.rotation = (titleRotationFlag * sideFlag * Math.PI) / 2;
            titleNode.x = Math.floor((titleRotationFlag * sideFlag * (requestedRange[0] + requestedRange[1])) / 2);
            var bboxYDimension = 0;
            if (anyTickVisible) {
                var tickBBox = group_1.Group.computeBBox([tickLineGroup, tickLabelGroup]);
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
        this.tickLineGroup.setClipRectInGroupCoordinateSpace(new bbox_1.BBox(x, y, width, height));
    };
    Axis.prototype.clipGrid = function (x, y, width, height) {
        this.gridGroup.setClipRectInGroupCoordinateSpace(new bbox_1.BBox(x, y, width, height));
    };
    Axis.prototype.calculatePadding = function (min, _max) {
        return Math.abs(min * 0.01);
    };
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
    return Axis;
}());
exports.Axis = Axis;
//# sourceMappingURL=axis.js.map