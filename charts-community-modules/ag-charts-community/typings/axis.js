"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Axis = exports.AxisLabel = exports.AxisLine = exports.Tags = void 0;
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
var AxisTick = /** @class */ (function () {
    function AxisTick() {
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
    return AxisTick;
}());
var AxisLabel = /** @class */ (function () {
    function AxisLabel() {
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
    function Axis(scale) {
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
        this.requestedRange = this.scale.range.slice();
        (_a = this.crossLines) === null || _a === void 0 ? void 0 : _a.forEach(function (crossLine) {
            _this.initCrossLine(crossLine);
        });
    };
    Axis.prototype.updateRange = function () {
        var _a;
        var _b = this, rr = _b.requestedRange, vr = _b.visibleRange, scale = _b.scale;
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
    Object.defineProperty(Axis.prototype, "range", {
        get: function () {
            return this.requestedRange;
        },
        set: function (value) {
            this.requestedRange = value.slice();
            this.updateRange();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Axis.prototype, "visibleRange", {
        get: function () {
            return this._visibleRange.slice();
        },
        set: function (value) {
            if (value && value.length === 2) {
                var _a = __read(value, 2), min = _a[0], max = _a[1];
                min = Math.max(0, min);
                max = Math.min(1, max);
                min = Math.min(min, max);
                max = Math.max(min, max);
                this._visibleRange = [min, max];
                this.updateRange();
            }
        },
        enumerable: false,
        configurable: true
    });
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
    Object.defineProperty(Axis.prototype, "title", {
        get: function () {
            return this._title;
        },
        set: function (value) {
            var oldTitle = this._title;
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
        },
        enumerable: false,
        configurable: true
    });
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
    /**
     * Creates/removes/updates the scene graph nodes that constitute the axis.
     */
    Axis.prototype.update = function (primaryTickCount) {
        var _a, _b;
        this.calculateDomain();
        var _c = this, scale = _c.scale, gridLength = _c.gridLength, tick = _c.tick, _d = _c.label, parallelLabels = _d.parallel, mirrored = _d.mirrored, avoidCollisions = _d.avoidCollisions, requestedRange = _c.requestedRange;
        var requestedRangeMin = Math.min.apply(Math, __spread(requestedRange));
        var requestedRangeMax = Math.max.apply(Math, __spread(requestedRange));
        var rotation = angle_1.toRadians(this.rotation);
        var anySeriesActive = this.isAnySeriesActive();
        // The side of the axis line to position the labels on.
        // -1 = left (default)
        //  1 = right
        var sideFlag = mirrored ? 1 : -1;
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
        var nice = this.nice;
        this.setDomain();
        this.setTickInterval(this.tick.interval);
        if (scale instanceof continuousScale_1.ContinuousScale) {
            scale.nice = nice;
            this.setTickCount(this.tick.count);
            scale.update();
        }
        var halfBandwidth = (scale.bandwidth || 0) / 2;
        this.updatePosition();
        this.updateLine();
        var i = 0;
        var labelOverlap = true;
        var ticks = [];
        var _e = this.estimateTickCount({
            minSpacing: this.tick.minSpacing,
            maxSpacing: this.tick.maxSpacing,
        }), maxTickCount = _e.maxTickCount, minTickCount = _e.minTickCount, defaultTickCount = _e.defaultTickCount;
        var continuous = scale instanceof continuousScale_1.ContinuousScale;
        var secondaryAxis = primaryTickCount !== undefined;
        var checkForOverlap = avoidCollisions && this.tick.interval === undefined && this.tick.values === undefined;
        var tickSpacing = !isNaN(this.tick.minSpacing) || !isNaN(this.tick.maxSpacing);
        var maxIterations = this.tick.count || !continuous || isNaN(maxTickCount) ? 10 : maxTickCount;
        while (labelOverlap) {
            var unchanged = true;
            var _loop_1 = function () {
                if (i > maxIterations) {
                    return "break";
                }
                var prevTicks = ticks;
                var tickCount = Math.max(defaultTickCount - i, minTickCount);
                var filterTicks = checkForOverlap && !(continuous && this_1.tick.count === undefined) && (tickSpacing || i !== 0);
                if (this_1.tick.values) {
                    ticks = this_1.tick.values;
                }
                else if (maxTickCount === 0) {
                    ticks = [];
                }
                else if (i === 0 || !filterTicks) {
                    this_1.setTickCount((_a = this_1.tick.count) !== null && _a !== void 0 ? _a : tickCount, minTickCount, maxTickCount);
                    ticks = scale.ticks();
                }
                if (filterTicks) {
                    var keepEvery_1 = tickSpacing ? Math.ceil(ticks.length / tickCount) : 2;
                    ticks = ticks.filter(function (_, i) { return i % keepEvery_1 === 0; });
                }
                var secondaryAxisTicks = void 0;
                if (secondaryAxis) {
                    // `updateSecondaryAxisTicks` mutates `scale.domain` based on `primaryTickCount`
                    secondaryAxisTicks = this_1.updateSecondaryAxisTicks(primaryTickCount);
                    ticks = secondaryAxisTicks;
                }
                this_1.updateSelections({
                    halfBandwidth: halfBandwidth,
                    gridLength: gridLength,
                    ticks: ticks,
                });
                if (!secondaryAxis && ticks.length > 0) {
                    primaryTickCount = ticks.length;
                }
                unchanged = checkForOverlap ? equal_1.areArrayNumbersEqual(ticks, prevTicks) : false;
                i++;
            };
            var this_1 = this;
            while (unchanged) {
                var state_1 = _loop_1();
                if (state_1 === "break")
                    break;
            }
            if (unchanged) {
                break;
            }
            // When the scale domain or the ticks change, the label format may change
            this.onLabelFormatChange(ticks, this.label.format);
            var _f = this.updateLabels({
                parallelFlipRotation: parallelFlipRotation,
                regularFlipRotation: regularFlipRotation,
                sideFlag: sideFlag,
                tickLabelGroupSelection: this.tickLabelGroupSelection,
                ticks: ticks,
            }), labelData = _f.labelData, rotated = _f.rotated;
            var labelSpacing = this.getLabelSpacing(rotated);
            // no need for further iterations if `avoidCollisions` is false
            labelOverlap = checkForOverlap ? labelPlacement_1.axisLabelsOverlap(labelData, labelSpacing) : false;
        }
        this.updateGridLines({
            gridLength: gridLength,
            halfBandwidth: halfBandwidth,
            sideFlag: sideFlag,
        });
        var anyTickVisible = false;
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
            if (visible) {
                anyTickVisible = true;
            }
            node.visible = visible;
        };
        var _g = this, gridLineGroupSelection = _g.gridLineGroupSelection, gridArcGroupSelection = _g.gridArcGroupSelection, tickLineGroupSelection = _g.tickLineGroupSelection, tickLabelGroupSelection = _g.tickLabelGroupSelection;
        gridLineGroupSelection.each(visibleFn);
        gridArcGroupSelection.each(visibleFn);
        tickLineGroupSelection.each(visibleFn);
        tickLabelGroupSelection.each(visibleFn);
        this.tickLineGroup.visible = anyTickVisible;
        this.tickLabelGroup.visible = anyTickVisible;
        this.gridLineGroup.visible = anyTickVisible;
        this.gridArcGroup.visible = anyTickVisible;
        (_b = this.crossLines) === null || _b === void 0 ? void 0 : _b.forEach(function (crossLine) {
            crossLine.sideFlag = -sideFlag;
            crossLine.direction = rotation === -Math.PI / 2 ? chartAxisDirection_1.ChartAxisDirection.X : chartAxisDirection_1.ChartAxisDirection.Y;
            crossLine.label.parallel =
                crossLine.label.parallel !== undefined ? crossLine.label.parallel : parallelLabels;
            crossLine.parallelFlipRotation = parallelFlipRotation;
            crossLine.regularFlipRotation = regularFlipRotation;
            crossLine.update(anySeriesActive);
        });
        this.updateTitle({ ticks: ticks });
        tickLineGroupSelection.each(function (line) {
            line.strokeWidth = tick.width;
            line.stroke = tick.color;
            line.visible = anyTickVisible;
            line.x1 = sideFlag * tick.size;
            line.x2 = 0;
            line.y1 = 0;
            line.y2 = 0;
        });
        return primaryTickCount;
    };
    Axis.prototype.estimateTickCount = function (_a) {
        var minSpacing = _a.minSpacing, maxSpacing = _a.maxSpacing;
        var requestedRange = this.requestedRange;
        var min = Math.min.apply(Math, __spread(requestedRange));
        var max = Math.max.apply(Math, __spread(requestedRange));
        var availableRange = max - min;
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
    Axis.prototype.getLabelSpacing = function (rotated) {
        var label = this.label;
        if (!isNaN(label.minSpacing)) {
            return label.minSpacing;
        }
        return rotated ? 0 : 10;
    };
    Axis.prototype.calculateDomain = function () {
        // Placeholder for subclasses to override.
    };
    Axis.prototype.updatePosition = function () {
        var _a = this, label = _a.label, crossLineGroup = _a.crossLineGroup, axisGroup = _a.axisGroup, gridGroup = _a.gridGroup, translation = _a.translation, gridLineGroupSelection = _a.gridLineGroupSelection, gridPadding = _a.gridPadding, gridLength = _a.gridLength;
        var rotation = angle_1.toRadians(this.rotation);
        var sideFlag = label.mirrored ? 1 : -1;
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
    Axis.prototype.updateSelections = function (_a) {
        var ticks = _a.ticks, halfBandwidth = _a.halfBandwidth, gridLength = _a.gridLength;
        var scale = this.scale;
        var data = ticks.map(function (t) { return ({ tick: t, translationY: scale.convert(t) + halfBandwidth }); });
        var gridLineGroupSelection = this.radialGrid
            ? this.gridLineGroupSelection
            : this.gridLineGroupSelection.update(gridLength ? data : [], function (group) {
                var node = new line_1.Line();
                node.tag = Tags.GridLine;
                group.append(node);
            });
        var gridArcGroupSelection = this.radialGrid
            ? this.gridArcGroupSelection.update(gridLength ? data : [], function (group) {
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
    Axis.prototype.updateGridLines = function (_a) {
        var gridLength = _a.gridLength, halfBandwidth = _a.halfBandwidth, sideFlag = _a.sideFlag;
        var _b = this, gridStyle = _b.gridStyle, scale = _b.scale, tick = _b.tick, gridPadding = _b.gridPadding;
        if (gridLength && gridStyle.length) {
            var styleCount_1 = gridStyle.length;
            var grid = void 0;
            if (this.radialGrid) {
                var angularGridLength_1 = angle_1.normalizeAngle360Inclusive(angle_1.toRadians(gridLength));
                grid = this.gridArcGroupSelection.each(function (arc, datum) {
                    var radius = Math.round(scale.convert(datum) + halfBandwidth);
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
        var _this = this;
        var ticks = _a.ticks, tickLabelGroupSelection = _a.tickLabelGroupSelection, sideFlag = _a.sideFlag, parallelFlipRotation = _a.parallelFlipRotation, regularFlipRotation = _a.regularFlipRotation;
        var _b = this, label = _b.label, _c = _b.label, parallel = _c.parallel, rotation = _c.rotation, tick = _b.tick;
        var labelAutoRotation = 0;
        var _d = label_1.calculateLabelRotation({
            rotation: rotation,
            parallel: parallel,
            regularFlipRotation: regularFlipRotation,
            parallelFlipRotation: parallelFlipRotation,
        }), autoRotation = _d.autoRotation, labelRotation = _d.labelRotation, parallelFlipFlag = _d.parallelFlipFlag, regularFlipFlag = _d.regularFlipFlag;
        // `ticks instanceof NumericTicks` doesn't work here, so we feature detect.
        this.fractionDigits = ticks.fractionDigits >= 0 ? ticks.fractionDigits : 0;
        // Update properties that affect the size of the axis labels and measure the labels
        var labelBboxes = new Map();
        var labelX = sideFlag * (tick.size + label.padding + this.seriesAreaPadding);
        var labelMatrix = new matrix_1.Matrix();
        matrix_1.Matrix.updateTransformMatrix(labelMatrix, 1, 1, autoRotation, 0, 0);
        var labelData = [];
        var labelSelection = tickLabelGroupSelection.each(function (node, datum, index) {
            var tick = datum.tick, translationY = datum.translationY;
            node.fontStyle = label.fontStyle;
            node.fontWeight = label.fontWeight;
            node.fontSize = label.fontSize;
            node.fontFamily = label.fontFamily;
            node.fill = label.color;
            node.text = _this.formatTickDatum(tick, index);
            var userHidden = node.text === '' || node.text == undefined;
            var bbox = node.computeBBox();
            var width = bbox.width, height = bbox.height;
            var translatedBBox = new bbox_1.BBox(labelX, translationY, 0, 0);
            labelMatrix.transformBBox(translatedBBox, bbox);
            var _a = bbox.x, x = _a === void 0 ? 0 : _a, _b = bbox.y, y = _b === void 0 ? 0 : _b;
            bbox.width = width;
            bbox.height = height;
            labelBboxes.set(index, userHidden ? null : bbox);
            if (userHidden) {
                return;
            }
            labelData.push({
                point: {
                    x: x,
                    y: y,
                    size: 0,
                },
                label: {
                    width: width,
                    height: height,
                    text: '',
                },
            });
        });
        var labelSpacing = this.getLabelSpacing();
        var rotate = labelPlacement_1.axisLabelsOverlap(labelData, labelSpacing);
        if (label.rotation === undefined && label.autoRotate === true && rotate) {
            // When no user label rotation angle has been specified and the width of any label exceeds the average tick gap (`rotate` is `true`),
            // automatically rotate the labels
            labelAutoRotation = angle_1.normalizeAngle360(angle_1.toRadians(label.autoRotateAngle));
        }
        var labelTextBaseline = 'middle';
        if (parallel && !labelRotation) {
            if (sideFlag * parallelFlipFlag === -1) {
                labelTextBaseline = 'hanging';
            }
            else {
                labelTextBaseline = 'bottom';
            }
        }
        var labelRotated = labelRotation > 0 && labelRotation <= Math.PI;
        var labelAutoRotated = labelAutoRotation > 0 && labelAutoRotation <= Math.PI;
        var alignFlag = labelRotated || labelAutoRotated ? -1 : 1;
        var labelTextAlign = 'start';
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
        var combinedRotation = autoRotation + labelRotation + labelAutoRotation;
        if (combinedRotation) {
            matrix_1.Matrix.updateTransformMatrix(labelMatrix, 1, 1, combinedRotation, 0, 0);
        }
        labelData = [];
        labelSelection.each(function (label, datum, index) {
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
            var bbox = labelBboxes.get(index);
            if (!bbox) {
                return;
            }
            label.visible = true;
            var _a = bbox.width, width = _a === void 0 ? 0 : _a, _b = bbox.height, height = _b === void 0 ? 0 : _b;
            var translationY = datum.translationY;
            var translatedBBox = new bbox_1.BBox(labelX, translationY, 0, 0);
            labelMatrix.transformBBox(translatedBBox, bbox);
            var _c = bbox.x, x = _c === void 0 ? 0 : _c, _d = bbox.y, y = _d === void 0 ? 0 : _d;
            labelData.push({
                point: {
                    x: x,
                    y: y,
                    size: 0,
                },
                label: {
                    width: width,
                    height: height,
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
        return { labelData: labelData, rotated: !!(labelRotation || labelAutoRotation) };
    };
    Axis.prototype.updateLine = function () {
        // Render axis line.
        var _a = this, lineNode = _a.lineNode, requestedRange = _a.requestedRange;
        lineNode.x1 = 0;
        lineNode.x2 = 0;
        lineNode.y1 = requestedRange[0];
        lineNode.y2 = requestedRange[1];
        lineNode.strokeWidth = this.line.width;
        lineNode.stroke = this.line.color;
        lineNode.visible = true;
    };
    Axis.prototype.updateTitle = function (_a) {
        var ticks = _a.ticks;
        var _b = this, label = _b.label, rotation = _b.rotation, title = _b.title, lineNode = _b.lineNode, requestedRange = _b.requestedRange, tickLineGroup = _b.tickLineGroup, tickLabelGroup = _b.tickLabelGroup;
        if (!title) {
            return;
        }
        var titleVisible = false;
        if (title.enabled && lineNode.visible) {
            titleVisible = true;
            var sideFlag = label.mirrored ? 1 : -1;
            var parallelFlipRotation = angle_1.normalizeAngle360(rotation);
            var padding = caption_1.Caption.PADDING;
            var titleNode = title.node;
            var titleRotationFlag = sideFlag === -1 && parallelFlipRotation > Math.PI && parallelFlipRotation < Math.PI * 2 ? -1 : 1;
            titleNode.rotation = (titleRotationFlag * sideFlag * Math.PI) / 2;
            titleNode.x = Math.floor((titleRotationFlag * sideFlag * (requestedRange[0] + requestedRange[1])) / 2);
            var bboxYDimension = 0;
            if ((ticks === null || ticks === void 0 ? void 0 : ticks.length) > 0) {
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
        }
        title.node.visible = titleVisible;
    };
    // For formatting (nice rounded) tick values.
    Axis.prototype.formatTickDatum = function (datum, index) {
        var _a = this, label = _a.label, labelFormatter = _a.labelFormatter, fractionDigits = _a.fractionDigits;
        if (label.formatter) {
            return label.formatter({
                value: fractionDigits > 0 ? datum : String(datum),
                index: index,
                fractionDigits: fractionDigits,
                formatter: labelFormatter,
            });
        }
        else if (labelFormatter) {
            return labelFormatter(datum);
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