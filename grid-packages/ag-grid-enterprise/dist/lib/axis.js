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
exports.Axis = exports.AxisLabel = exports.AxisLine = void 0;
var group_1 = require("./scene/group");
var selection_1 = require("./scene/selection");
var line_1 = require("./scene/shape/line");
var text_1 = require("./scene/shape/text");
var arc_1 = require("./scene/shape/arc");
var bbox_1 = require("./scene/bbox");
var caption_1 = require("./caption");
var id_1 = require("./util/id");
var angle_1 = require("./util/angle");
var function_1 = require("./util/function");
var interval_1 = require("./util/time/interval");
var validation_1 = require("./util/validation");
var chartAxis_1 = require("./chart/chartAxis");
var layers_1 = require("./chart/layers");
var labelPlacement_1 = require("./util/labelPlacement");
var continuousScale_1 = require("./scale/continuousScale");
var matrix_1 = require("./scene/matrix");
var timeScale_1 = require("./scale/timeScale");
var TICK_COUNT = validation_1.predicateWithMessage(function (v, ctx) { return validation_1.NUMBER(0)(v, ctx) || v instanceof interval_1.TimeInterval; }, "expecting a tick count Number value or, for a time axis, a Time Interval such as 'agCharts.time.month'");
var OPT_TICK_COUNT = validation_1.predicateWithMessage(function (v, ctx) { return validation_1.OPTIONAL(v, ctx, TICK_COUNT); }, "expecting an optional tick count Number value or, for a time axis, a Time Interval such as 'agCharts.time.month'");
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
    Tags[Tags["Tick"] = 0] = "Tick";
    Tags[Tags["GridLine"] = 1] = "GridLine";
})(Tags || (Tags = {}));
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
        validation_1.Validate(OPT_TICK_COUNT)
    ], AxisTick.prototype, "count", void 0);
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
        validation_1.Validate(validation_1.OPT_NUMBER())
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
        this.crossLineGroup = new group_1.Group({ name: this.id + "-CrossLines" });
        this.lineGroup = this.axisGroup.appendChild(new group_1.Group({ name: this.id + "-Line" }));
        this.tickGroup = this.axisGroup.appendChild(new group_1.Group({ name: this.id + "-Tick" }));
        this.titleGroup = this.axisGroup.appendChild(new group_1.Group({ name: this.id + "-Title" }));
        this.tickGroupSelection = selection_1.Selection.select(this.tickGroup).selectAll();
        this.lineNode = this.lineGroup.appendChild(new line_1.Line());
        this.gridlineGroup = new group_1.Group({
            name: this.id + "-gridline",
            zIndex: layers_1.Layers.AXIS_GRIDLINES_ZINDEX,
        });
        this.gridlineGroupSelection = selection_1.Selection.select(this.gridlineGroup).selectAll();
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
        node.insertBefore(this.gridlineGroup, nextNode);
        node.insertBefore(this.axisGroup, nextNode);
        node.insertBefore(this.crossLineGroup, nextNode);
    };
    Axis.prototype.detachAxis = function (node) {
        node.removeChild(this.axisGroup);
        node.removeChild(this.gridlineGroup);
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
        var scale = this.scale;
        if (format && scale && scale.tickFormat) {
            try {
                this.labelFormatter = scale.tickFormat({
                    ticks: ticks,
                    count: ticks.length,
                    specifier: format,
                });
            }
            catch (e) {
                this.labelFormatter = undefined;
                function_1.doOnce(function () {
                    return console.warn("AG Charts - the axis label format string " + format + " is invalid. No formatting will be applied");
                }, "invalid axis label format string " + format);
            }
        }
        else {
            this.labelFormatter = undefined;
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
                    this.titleGroup.removeChild(oldTitle.node);
                }
                if (value) {
                    value.node.rotation = -Math.PI / 2;
                    this.titleGroup.appendChild(value.node);
                }
                this._title = value;
                // position title so that it doesn't briefly get rendered in the top left hand corner of the canvas before update is called.
                this.setTickCount(this.scale, this.tick.count);
                this.updateTitle({ ticks: this.scale.ticks() });
            }
        },
        enumerable: false,
        configurable: true
    });
    Axis.prototype.setTickCount = function (scale, count) {
        if (scale instanceof timeScale_1.TimeScale && count && count instanceof interval_1.TimeInterval) {
            scale.tickInterval = count;
        }
        else {
            scale.tickCount = count;
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
                this.gridlineGroupSelection = this.gridlineGroupSelection.remove().setData([]);
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
                this.gridlineGroupSelection = this.gridlineGroupSelection.remove().setData([]);
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
        var _c = this, scale = _c.scale, gridLength = _c.gridLength, tick = _c.tick, _d = _c.label, parallelLabels = _d.parallel, mirrored = _d.mirrored, avoidCollisions = _d.avoidCollisions, minSpacing = _d.minSpacing, requestedRange = _c.requestedRange;
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
        var halfBandwidth = (scale.bandwidth || 0) / 2;
        this.updatePosition();
        this.updateLine();
        var i = 0;
        var labelOverlap = true;
        var ticks = [];
        var defaultTickCount = 10;
        var nice = this.nice;
        var continuous = scale instanceof continuousScale_1.ContinuousScale;
        var secondaryAxis = primaryTickCount !== undefined;
        scale.domain = this.dataDomain;
        if (scale instanceof continuousScale_1.ContinuousScale) {
            scale.nice = nice;
            this.setTickCount(scale, this.tick.count);
            scale.update();
        }
        while (labelOverlap) {
            var unchanged = true;
            var _loop_1 = function () {
                if (i >= defaultTickCount) {
                    return "break";
                }
                var prevTicks = ticks;
                var filteredTicks = !avoidCollisions || (continuous && this_1.tick.count === undefined) || i === 0
                    ? undefined
                    : ticks.filter(function (_, i) { return i % 2 === 0; });
                var secondaryAxisTicks = void 0;
                if (secondaryAxis) {
                    // `updateSecondaryAxisTicks` mutates `scale.domain` based on `primaryTickCount`
                    secondaryAxisTicks = this_1.updateSecondaryAxisTicks(primaryTickCount);
                }
                if (filteredTicks) {
                    ticks = filteredTicks;
                }
                else if (secondaryAxisTicks) {
                    ticks = secondaryAxisTicks;
                }
                else {
                    scale.tickCount = (_a = this_1.tick.count) !== null && _a !== void 0 ? _a : defaultTickCount - i;
                    ticks = scale.ticks();
                }
                this_1.updateSelections({
                    halfBandwidth: halfBandwidth,
                    gridLength: gridLength,
                    ticks: ticks,
                });
                if (!secondaryAxis && ticks.length > 0) {
                    primaryTickCount = ticks.length;
                }
                unchanged = avoidCollisions ? ticks.every(function (t, i) { return Number(t) === Number(prevTicks[i]); }) : false;
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
            var _e = this.updateLabels({
                parallelFlipRotation: parallelFlipRotation,
                regularFlipRotation: regularFlipRotation,
                sideFlag: sideFlag,
                tickLineGroupSelection: this.tickGroupSelection,
                ticks: ticks,
            }), labelData = _e.labelData, rotated = _e.rotated;
            var labelPadding = minSpacing !== null && minSpacing !== void 0 ? minSpacing : (rotated ? 0 : 10);
            // no need for further iterations if `avoidCollisions` is false
            labelOverlap = avoidCollisions ? labelPlacement_1.axisLabelsOverlap(labelData, labelPadding) : false;
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
                return false;
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
            return visible;
        };
        var _f = this, gridlineGroupSelection = _f.gridlineGroupSelection, tickGroupSelection = _f.tickGroupSelection;
        gridlineGroupSelection.attrFn('visible', visibleFn);
        tickGroupSelection.attrFn('visible', visibleFn);
        this.tickGroup.visible = anyTickVisible;
        this.gridlineGroup.visible = anyTickVisible;
        (_b = this.crossLines) === null || _b === void 0 ? void 0 : _b.forEach(function (crossLine) {
            crossLine.sideFlag = -sideFlag;
            crossLine.direction = rotation === -Math.PI / 2 ? chartAxis_1.ChartAxisDirection.X : chartAxis_1.ChartAxisDirection.Y;
            crossLine.label.parallel =
                crossLine.label.parallel !== undefined ? crossLine.label.parallel : parallelLabels;
            crossLine.parallelFlipRotation = parallelFlipRotation;
            crossLine.regularFlipRotation = regularFlipRotation;
            crossLine.update(anySeriesActive);
        });
        this.updateTitle({ ticks: ticks });
        tickGroupSelection
            .selectByTag(Tags.Tick)
            .each(function (line) {
            line.strokeWidth = tick.width;
            line.stroke = tick.color;
            line.visible = anyTickVisible;
        })
            .attr('x1', sideFlag * tick.size)
            .attr('x2', 0)
            .attr('y1', 0)
            .attr('y2', 0);
        return primaryTickCount;
    };
    Axis.prototype.calculateDomain = function () {
        // Placeholder for subclasses to override.
    };
    Axis.prototype.updatePosition = function () {
        var _a = this, label = _a.label, axisGroup = _a.axisGroup, gridlineGroup = _a.gridlineGroup, crossLineGroup = _a.crossLineGroup, translation = _a.translation, gridlineGroupSelection = _a.gridlineGroupSelection, gridPadding = _a.gridPadding, gridLength = _a.gridLength;
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
        gridlineGroup.translationX = translationX;
        gridlineGroup.translationY = translationY;
        gridlineGroup.rotation = rotation;
        gridlineGroupSelection.selectByTag(Tags.GridLine).each(function (line) {
            line.x1 = gridPadding;
            line.x2 = -sideFlag * gridLength + gridPadding;
            line.y1 = 0;
            line.y2 = 0;
        });
    };
    Axis.prototype.updateSecondaryAxisTicks = function (_primaryTickCount) {
        throw new Error('AG Charts - unexpected call to updateSecondaryAxisTicks() - check axes configuration.');
    };
    Axis.prototype.updateTickGroupSelection = function (_a) {
        var data = _a.data;
        var updateAxis = this.tickGroupSelection.setData(data);
        updateAxis.exit.remove();
        var enterAxis = updateAxis.enter.append(group_1.Group);
        // Line auto-snaps to pixel grid if vertical or horizontal.
        enterAxis.append(line_1.Line).each(function (node) { return (node.tag = Tags.Tick); });
        enterAxis.append(text_1.Text);
        return updateAxis.merge(enterAxis);
    };
    Axis.prototype.updateGridLineGroupSelection = function (_a) {
        var gridLength = _a.gridLength, data = _a.data;
        var updateGridlines = this.gridlineGroupSelection.setData(gridLength ? data : []);
        updateGridlines.exit.remove();
        var gridlineGroupSelection = updateGridlines;
        if (gridLength) {
            var tagFn = function (node) { return (node.tag = Tags.GridLine); };
            var enterGridline = updateGridlines.enter.append(group_1.Group);
            if (this.radialGrid) {
                enterGridline.append(arc_1.Arc).each(tagFn);
            }
            else {
                enterGridline.append(line_1.Line).each(tagFn);
            }
            gridlineGroupSelection = updateGridlines.merge(enterGridline);
        }
        return gridlineGroupSelection;
    };
    Axis.prototype.updateSelections = function (_a) {
        var ticks = _a.ticks, halfBandwidth = _a.halfBandwidth, gridLength = _a.gridLength;
        var scale = this.scale;
        var data = ticks.map(function (t) { return ({ tick: t, translationY: scale.convert(t) + halfBandwidth }); });
        var gridlineGroupSelection = this.updateGridLineGroupSelection({ gridLength: gridLength, data: data });
        var tickGroupSelection = this.updateTickGroupSelection({ data: data });
        // We need raw `translationY` values on `datum` for accurate label collision detection in axes.update()
        // But node `translationY` values must be rounded to get pixel grid alignment
        gridlineGroupSelection.attrFn('translationY', function (_, datum) { return Math.round(datum.translationY); });
        tickGroupSelection.attrFn('translationY', function (_, datum) { return Math.round(datum.translationY); });
        this.tickGroupSelection = tickGroupSelection;
        this.gridlineGroupSelection = gridlineGroupSelection;
    };
    Axis.prototype.updateGridLines = function (_a) {
        var gridLength = _a.gridLength, halfBandwidth = _a.halfBandwidth, sideFlag = _a.sideFlag;
        var _b = this, gridStyle = _b.gridStyle, scale = _b.scale, tick = _b.tick, gridPadding = _b.gridPadding;
        if (gridLength && gridStyle.length) {
            var styleCount_1 = gridStyle.length;
            var gridLines = void 0;
            if (this.radialGrid) {
                var angularGridLength_1 = angle_1.normalizeAngle360Inclusive(angle_1.toRadians(gridLength));
                gridLines = this.gridlineGroupSelection.selectByTag(Tags.GridLine).each(function (arc, datum) {
                    var radius = Math.round(scale.convert(datum) + halfBandwidth);
                    arc.centerX = 0;
                    arc.centerY = scale.range[0] - radius;
                    arc.endAngle = angularGridLength_1;
                    arc.radiusX = radius;
                    arc.radiusY = radius;
                });
            }
            else {
                gridLines = this.gridlineGroupSelection.selectByTag(Tags.GridLine).each(function (line) {
                    line.x1 = gridPadding;
                    line.x2 = -sideFlag * gridLength + gridPadding;
                    line.y1 = 0;
                    line.y2 = 0;
                    line.visible = Math.abs(line.parent.translationY - scale.range[0]) > 1;
                });
            }
            gridLines.each(function (gridLine, _, index) {
                var style = gridStyle[index % styleCount_1];
                gridLine.stroke = style.stroke;
                gridLine.strokeWidth = tick.width;
                gridLine.lineDash = style.lineDash;
                gridLine.fill = undefined;
            });
        }
    };
    Axis.prototype.updateLabels = function (_a) {
        var _this = this;
        var ticks = _a.ticks, tickLineGroupSelection = _a.tickLineGroupSelection, sideFlag = _a.sideFlag, parallelFlipRotation = _a.parallelFlipRotation, regularFlipRotation = _a.regularFlipRotation;
        var _b = this, label = _b.label, _c = _b.label, parallelLabels = _c.parallel, minSpacing = _c.minSpacing, tick = _b.tick;
        var labelAutoRotation = 0;
        var labelRotation = label.rotation ? angle_1.normalizeAngle360(angle_1.toRadians(label.rotation)) : 0;
        var parallelFlipFlag = !labelRotation && parallelFlipRotation >= 0 && parallelFlipRotation <= Math.PI ? -1 : 1;
        // Flip if the axis rotation angle is in the top hemisphere.
        var regularFlipFlag = !labelRotation && regularFlipRotation >= 0 && regularFlipRotation <= Math.PI ? -1 : 1;
        var autoRotation = parallelLabels ? (parallelFlipFlag * Math.PI) / 2 : regularFlipFlag === -1 ? Math.PI : 0;
        // `ticks instanceof NumericTicks` doesn't work here, so we feature detect.
        this.fractionDigits = ticks.fractionDigits >= 0 ? ticks.fractionDigits : 0;
        // Update properties that affect the size of the axis labels and measure the labels
        var labelBboxes = new Map();
        var labelX = sideFlag * (tick.size + label.padding);
        var labelMatrix = new matrix_1.Matrix();
        matrix_1.Matrix.updateTransformMatrix(labelMatrix, 1, 1, autoRotation, 0, 0);
        var labelData = [];
        var labelSelection = tickLineGroupSelection.selectByClass(text_1.Text).each(function (node, datum, index) {
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
        var labelPadding = minSpacing !== null && minSpacing !== void 0 ? minSpacing : 10;
        var rotate = labelPlacement_1.axisLabelsOverlap(labelData, labelPadding);
        if (label.rotation === undefined && label.autoRotate === true && rotate) {
            // When no user label rotation angle has been specified and the width of any label exceeds the average tick gap (`rotate` is `true`),
            // automatically rotate the labels
            labelAutoRotation = angle_1.normalizeAngle360(angle_1.toRadians(label.autoRotateAngle));
        }
        var labelTextBaseline = parallelLabels && !labelRotation ? (sideFlag * parallelFlipFlag === -1 ? 'hanging' : 'bottom') : 'middle';
        var alignFlag = (labelRotation > 0 && labelRotation <= Math.PI) || (labelAutoRotation > 0 && labelAutoRotation <= Math.PI)
            ? -1
            : 1;
        var labelTextAlign = parallelLabels
            ? labelRotation || labelAutoRotation
                ? sideFlag * alignFlag === -1
                    ? 'end'
                    : 'start'
                : 'center'
            : sideFlag * regularFlipFlag === -1
                ? 'end'
                : 'start';
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
        var _b = this, label = _b.label, rotation = _b.rotation, title = _b.title, lineNode = _b.lineNode, requestedRange = _b.requestedRange, tickGroup = _b.tickGroup, lineGroup = _b.lineGroup;
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
            var lineBBox = lineGroup.computeBBox();
            var bboxYDimension = rotation === 0 ? lineBBox.width : lineBBox.height;
            if ((ticks === null || ticks === void 0 ? void 0 : ticks.length) > 0) {
                var tickBBox = tickGroup.computeBBox();
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
        return label.formatter
            ? label.formatter({
                value: fractionDigits >= 0 ? datum : String(datum),
                index: index,
                fractionDigits: fractionDigits,
                formatter: labelFormatter,
            })
            : labelFormatter
                ? labelFormatter(datum)
                : typeof datum === 'number' && fractionDigits >= 0
                    ? // the `datum` is a floating point number
                        datum.toFixed(fractionDigits)
                    : // the`datum` is an integer, a string or an object
                        String(datum);
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