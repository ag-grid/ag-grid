"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Axis = exports.Tags = void 0;
var group_1 = require("./scene/group");
var selection_1 = require("./scene/selection");
var line_1 = require("./scene/shape/line");
var text_1 = require("./scene/shape/text");
var bbox_1 = require("./scene/bbox");
var caption_1 = require("./caption");
var id_1 = require("./util/id");
var angle_1 = require("./util/angle");
var equal_1 = require("./util/equal");
var validation_1 = require("./util/validation");
var layers_1 = require("./chart/layers");
var labelPlacement_1 = require("./util/labelPlacement");
var continuousScale_1 = require("./scale/continuousScale");
var matrix_1 = require("./scene/matrix");
var timeScale_1 = require("./scale/timeScale");
var logScale_1 = require("./scale/logScale");
var array_1 = require("./util/array");
var chartAxisDirection_1 = require("./chart/chartAxisDirection");
var label_1 = require("./chart/label");
var logger_1 = require("./util/logger");
var axisLabel_1 = require("./chart/axis/axisLabel");
var axisLine_1 = require("./chart/axis/axisLine");
var axisTick_1 = require("./chart/axis/axisTick");
var easing = require("./motion/easing");
var states_1 = require("./motion/states");
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
var AxisStateMachine = /** @class */ (function (_super) {
    __extends(AxisStateMachine, _super);
    function AxisStateMachine() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return AxisStateMachine;
}(states_1.StateMachine));
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
        var _this = this;
        this.moduleCtx = moduleCtx;
        this.id = id_1.createId(this);
        this.nice = true;
        this.dataDomain = [];
        this.keys = [];
        this.boundSeries = [];
        this.includeInvisibleDomains = false;
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
        this.tickLineGroupSelection = selection_1.Selection.select(this.tickLineGroup, line_1.Line, false);
        this.tickLabelGroupSelection = selection_1.Selection.select(this.tickLabelGroup, text_1.Text, false);
        this.gridLineGroupSelection = selection_1.Selection.select(this.gridLineGroup, line_1.Line, false);
        this.line = new axisLine_1.AxisLine();
        this.tick = this.createTick();
        this.label = new axisLabel_1.AxisLabel();
        this.translation = { x: 0, y: 0 };
        this.rotation = 0; // axis rotation angle in degrees
        this.layout = {
            label: {
                fractionDigits: 0,
                padding: this.label.padding,
                format: this.label.format,
            },
        };
        this.modules = {};
        this.destroyFns = [];
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
        this.fractionDigits = 0;
        /**
         * The distance between the grid ticks and the axis ticks.
         */
        this.gridPadding = 0;
        /**
         * Is used to avoid collisions between axis labels and series.
         */
        this.seriesAreaPadding = 0;
        this.maxThickness = Infinity;
        this._scale = scale;
        this.refreshScale();
        this._titleCaption.node.rotation = -Math.PI / 2;
        this.axisGroup.appendChild(this._titleCaption.node);
        var axisHoverHandle = moduleCtx.interactionManager.addListener('hover', function (e) { return _this.checkAxisHover(e); });
        this.destroyFns.push(function () { return moduleCtx.interactionManager.removeListener(axisHoverHandle); });
        this.animationManager = moduleCtx.animationManager;
        this.animationState = new AxisStateMachine('empty', {
            empty: {
                on: {
                    update: {
                        target: 'align',
                        action: function () { return _this.resetSelectionNodes(); },
                    },
                },
            },
            align: {
                on: {
                    update: {
                        target: 'ready',
                        action: function () { return _this.resetSelectionNodes(); },
                    },
                },
            },
            ready: {
                on: {
                    update: {
                        target: 'ready',
                        action: function (data) { return _this.animateReadyUpdate(data); },
                    },
                },
            },
        });
        this._crossLines = [];
        this.assignCrossLineArrayConstructor(this._crossLines);
    }
    Object.defineProperty(Axis.prototype, "scale", {
        get: function () {
            return this._scale;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Axis.prototype, "type", {
        get: function () {
            var _a;
            return (_a = this.constructor.type) !== null && _a !== void 0 ? _a : '';
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
            if (value) {
                this.assignCrossLineArrayConstructor(value);
            }
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
        var e_1, _a;
        try {
            for (var _b = __values(Object.entries(this.modules)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), key = _d[0], module = _d[1];
                module.instance.destroy();
                delete this.modules[key];
                delete this[key];
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.destroyFns.forEach(function (f) { return f(); });
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
    Axis.prototype.attachAxis = function (node) {
        node.appendChild(this.gridGroup);
        node.appendChild(this.axisGroup);
        node.appendChild(this.crossLineGroup);
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
            }
            this._gridLength = value;
            (_a = this.crossLines) === null || _a === void 0 ? void 0 : _a.forEach(function (crossLine) {
                _this.initCrossLine(crossLine);
            });
        },
        enumerable: false,
        configurable: true
    });
    Axis.prototype.createTick = function () {
        return new axisTick_1.AxisTick();
    };
    Axis.prototype.checkAxisHover = function (event) {
        var bbox = this.computeBBox();
        var isInAxis = bbox.containsPoint(event.offsetX, event.offsetY);
        if (!isInAxis)
            return;
        this.moduleCtx.chartEventManager.axisHover(this.id, this.direction);
    };
    /**
     * Creates/removes/updates the scene graph nodes that constitute the axis.
     */
    Axis.prototype.update = function (primaryTickCount) {
        var previous = this.tickLabelGroupSelection.nodes().map(function (node) { return node.datum.tickId; });
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
        if (this.animationManager.skipAnimations) {
            this.resetSelectionNodes();
        }
        else {
            var diff = this.calculateUpdateDiff(previous, tickData);
            this.animationState.transition('update', diff);
        }
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
        var e_2, _b, _c;
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
                for (var tickStrategies_1 = (e_2 = void 0, __values(tickStrategies)), tickStrategies_1_1 = tickStrategies_1.next(); !tickStrategies_1_1.done; tickStrategies_1_1 = tickStrategies_1.next()) {
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
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (tickStrategies_1_1 && !tickStrategies_1_1.done && (_b = tickStrategies_1.return)) _b.call(tickStrategies_1);
                }
                finally { if (e_2) throw e_2.error; }
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
        var e_3, _a;
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
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (tickData_1_1 && !tickData_1_1.done && (_a = tickData_1.return)) _a.call(tickData_1);
            }
            finally { if (e_3) throw e_3.error; }
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
        var tickIdCounts = new Map();
        for (var i = 0; i < rawTicks.length; i++) {
            var rawTick = rawTicks[i];
            var translationY = scale.convert(rawTick) + halfBandwidth;
            var tickLabel = this.formatTick(rawTick, i);
            // Create a tick id from the label, or as an increment of the last label if this tick label is blank
            var tickId = tickLabel;
            if (tickIdCounts.has(tickId)) {
                var count = tickIdCounts.get(tickId);
                tickIdCounts.set(tickId, count + 1);
                tickId = tickId + "_" + count;
            }
            else {
                tickIdCounts.set(tickId, 1);
            }
            ticks.push({ tick: rawTick, tickId: tickId, tickLabel: tickLabel, translationY: translationY });
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
        var _a, _b, _c;
        this.setTickCount(tickCount, minTickCount, maxTickCount);
        return (_c = (_b = (_a = this.scale).ticks) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : [];
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
        var _a = this, gridLineGroupSelection = _a.gridLineGroupSelection, tickLineGroupSelection = _a.tickLineGroupSelection, tickLabelGroupSelection = _a.tickLabelGroupSelection;
        gridLineGroupSelection.each(visibleFn);
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
        var e_4, _a, _b;
        var _c = this, direction = _c.direction, boundSeries = _c.boundSeries, includeInvisibleDomains = _c.includeInvisibleDomains;
        if (this.linkedTo) {
            this.dataDomain = this.linkedTo.dataDomain;
        }
        else {
            var domains = [];
            var visibleSeries = boundSeries.filter(function (s) { return includeInvisibleDomains || s.isEnabled(); });
            try {
                for (var visibleSeries_1 = __values(visibleSeries), visibleSeries_1_1 = visibleSeries_1.next(); !visibleSeries_1_1.done; visibleSeries_1_1 = visibleSeries_1.next()) {
                    var series = visibleSeries_1_1.value;
                    domains.push(series.getDomain(direction));
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (visibleSeries_1_1 && !visibleSeries_1_1.done && (_a = visibleSeries_1.return)) _a.call(visibleSeries_1);
                }
                finally { if (e_4) throw e_4.error; }
            }
            var domain = (_b = new Array()).concat.apply(_b, __spreadArray([], __read(domains)));
            this.dataDomain = this.normaliseDataDomain(domain);
        }
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
        var gridLineGroupSelection = this.gridLineGroupSelection.update(gridData, function (group) {
            var node = new line_1.Line();
            node.tag = Tags.GridLine;
            group.append(node);
        }, function (datum) { return datum.tickId; });
        var tickLineGroupSelection = this.tickLineGroupSelection.update(data, function (group) {
            var line = new line_1.Line();
            line.tag = Tags.TickLine;
            group.appendChild(line);
        }, function (datum) { return datum.tickId; });
        var tickLabelGroupSelection = this.tickLabelGroupSelection.update(data, function (group) {
            var text = new text_1.Text();
            text.tag = Tags.TickLabel;
            group.appendChild(text);
        }, function (datum) { return datum.tickId; });
        this.tickLineGroupSelection = tickLineGroupSelection;
        this.tickLabelGroupSelection = tickLabelGroupSelection;
        this.gridLineGroupSelection = gridLineGroupSelection;
    };
    Axis.prototype.updateGridLines = function (sideFlag) {
        var _a = this, gridStyle = _a.gridStyle, tick = _a.tick, gridPadding = _a.gridPadding, gridLength = _a.gridLength;
        if (gridLength === 0 || gridStyle.length === 0) {
            return;
        }
        var styleCount = gridStyle.length;
        this.gridLineGroupSelection.each(function (line, _, index) {
            var style = gridStyle[index % styleCount];
            line.x1 = gridPadding;
            line.x2 = -sideFlag * gridLength + gridPadding;
            line.y1 = 0;
            line.y2 = 0;
            line.stroke = style.stroke;
            line.strokeWidth = tick.width;
            line.lineDash = style.lineDash;
            line.fill = undefined;
        });
    };
    Axis.prototype.updateLabels = function (_a) {
        var tickLabelGroupSelection = _a.tickLabelGroupSelection, combinedRotation = _a.combinedRotation, textBaseline = _a.textBaseline, textAlign = _a.textAlign, labelX = _a.labelX;
        var _b = this, label = _b.label, labelsEnabled = _b.label.enabled;
        if (!labelsEnabled) {
            return;
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
        var _this = this;
        return this.boundSeries.some(function (s) { return _this.includeInvisibleDomains || s.isEnabled(); });
    };
    Axis.prototype.clipTickLines = function (x, y, width, height) {
        this.tickLineGroup.setClipRectInGroupCoordinateSpace(new bbox_1.BBox(x, y, width, height));
    };
    Axis.prototype.clipGrid = function (x, y, width, height) {
        this.gridGroup.setClipRectInGroupCoordinateSpace(new bbox_1.BBox(x, y, width, height));
    };
    Axis.prototype.calculatePadding = function (min, _max) {
        return [Math.abs(min * 0.01), Math.abs(min * 0.01)];
    };
    Axis.prototype.getTitleFormatterParams = function () {
        var _this = this;
        var _a;
        var boundSeries = this.boundSeries.reduce(function (acc, next) {
            var keys = next.getKeys(_this.direction);
            var names = next.getNames(_this.direction);
            for (var idx = 0; idx < keys.length; idx++) {
                acc.push({
                    key: keys[idx],
                    name: names[idx],
                });
            }
            return acc;
        }, []);
        return {
            direction: this.direction,
            boundSeries: boundSeries,
            defaultValue: (_a = this.title) === null || _a === void 0 ? void 0 : _a.text,
        };
    };
    Axis.prototype.normaliseDataDomain = function (d) {
        return d;
    };
    Axis.prototype.getLayoutState = function () {
        return __assign({ rect: this.computeBBox(), gridPadding: this.gridPadding, seriesAreaPadding: this.seriesAreaPadding, tickSize: this.tick.size }, this.layout);
    };
    Axis.prototype.createAxisContext = function () {
        var _this = this;
        var keys = function () {
            return _this.boundSeries
                .map(function (s) { return s.getKeys(_this.direction); })
                .reduce(function (keys, seriesKeys) {
                keys.push.apply(keys, __spreadArray([], __read(seriesKeys)));
                return keys;
            }, []);
        };
        return {
            axisId: this.id,
            direction: this.direction,
            continuous: this.scale instanceof continuousScale_1.ContinuousScale,
            keys: keys,
            scaleValueFormatter: function (specifier) { var _a, _b, _c; return (_c = (_b = (_a = _this.scale).tickFormat) === null || _b === void 0 ? void 0 : _b.call(_a, { specifier: specifier })) !== null && _c !== void 0 ? _c : undefined; },
            scaleBandwidth: function () { var _a; return (_a = _this.scale.bandwidth) !== null && _a !== void 0 ? _a : 0; },
            scaleConvert: function (val) { return _this.scale.convert(val); },
            scaleInvert: function (val) { var _a, _b, _c; return (_c = (_b = (_a = _this.scale).invert) === null || _b === void 0 ? void 0 : _b.call(_a, val)) !== null && _c !== void 0 ? _c : undefined; },
        };
    };
    Axis.prototype.addModule = function (module) {
        if (this.modules[module.optionsKey] != null) {
            throw new Error('AG Charts - module already initialised: ' + module.optionsKey);
        }
        if (this.axisContext == null) {
            this.axisContext = this.createAxisContext();
        }
        var moduleInstance = new module.instanceConstructor(__assign(__assign({}, this.moduleCtx), { parent: this.axisContext }));
        this.modules[module.optionsKey] = { instance: moduleInstance };
        this[module.optionsKey] = moduleInstance;
    };
    Axis.prototype.removeModule = function (module) {
        var _a, _b;
        (_b = (_a = this.modules[module.optionsKey]) === null || _a === void 0 ? void 0 : _a.instance) === null || _b === void 0 ? void 0 : _b.destroy();
        delete this.modules[module.optionsKey];
        delete this[module.optionsKey];
    };
    Axis.prototype.isModuleEnabled = function (module) {
        return this.modules[module.optionsKey] != null;
    };
    Axis.prototype.animateReadyUpdate = function (diff) {
        var _this = this;
        var _a, _b;
        if (!diff.changed) {
            this.resetSelectionNodes();
            return;
        }
        var _c = this, gridLineGroupSelection = _c.gridLineGroupSelection, tickLineGroupSelection = _c.tickLineGroupSelection, tickLabelGroupSelection = _c.tickLabelGroupSelection;
        var addedCount = Object.keys(diff.added).length;
        var removedCount = Object.keys(diff.removed).length;
        if (removedCount === diff.tickCount) {
            this.resetSelectionNodes();
            return;
        }
        var totalDuration = (_b = (_a = this.animationManager) === null || _a === void 0 ? void 0 : _a.defaultOptions.duration) !== null && _b !== void 0 ? _b : 1000;
        var sectionDuration = Math.floor(totalDuration / 2);
        if (addedCount > 0 && removedCount > 0) {
            sectionDuration = Math.floor(totalDuration / 3);
        }
        var options = {
            delay: removedCount > 0 ? sectionDuration : 0,
            duration: sectionDuration,
        };
        var animationGroup = this.id + "_" + Math.random();
        tickLabelGroupSelection.each(function (node, datum) {
            _this.animateSelectionNode(tickLabelGroupSelection, diff, options, node, datum, animationGroup);
        });
        gridLineGroupSelection.each(function (node, datum) {
            _this.animateSelectionNode(gridLineGroupSelection, diff, options, node, datum, animationGroup);
        });
        tickLineGroupSelection.each(function (node, datum) {
            _this.animateSelectionNode(tickLineGroupSelection, diff, options, node, datum, animationGroup);
        });
    };
    Axis.prototype.animateSelectionNode = function (selection, diff, options, node, datum, animationGroup) {
        var roundedTranslationY = Math.round(datum.translationY);
        var translate = { from: node.translationY, to: roundedTranslationY };
        var opacity = { from: 1, to: 1 };
        var duration = options.duration;
        var delay = options.delay;
        var datumId = datum.tickLabel;
        if (diff.added[datumId]) {
            translate = { from: roundedTranslationY, to: roundedTranslationY };
            opacity = { from: 0, to: 1 };
            delay += duration;
        }
        else if (diff.removed[datumId]) {
            opacity = { from: 1, to: 0 };
            delay = 0;
        }
        var props = [translate, opacity];
        this.animationManager.animateManyWithThrottle(this.id + "_ready-update_" + node.id, props, {
            disableInteractions: false,
            delay: delay,
            duration: duration,
            ease: easing.easeOut,
            throttleId: this.id,
            throttleGroup: animationGroup,
            onUpdate: function (_a) {
                var _b = __read(_a, 2), translationY = _b[0], opacity = _b[1];
                node.translationY = translationY;
                node.opacity = opacity;
            },
            onComplete: function () {
                selection.cleanup();
            },
        });
    };
    Axis.prototype.resetSelectionNodes = function () {
        var _a = this, gridLineGroupSelection = _a.gridLineGroupSelection, tickLineGroupSelection = _a.tickLineGroupSelection, tickLabelGroupSelection = _a.tickLabelGroupSelection;
        gridLineGroupSelection.cleanup();
        tickLineGroupSelection.cleanup();
        tickLabelGroupSelection.cleanup();
        // We need raw `translationY` values on `datum` for accurate label collision detection in axes.update()
        // But node `translationY` values must be rounded to get pixel grid alignment
        var resetFn = function (node) {
            node.translationY = Math.round(node.datum.translationY);
            node.opacity = 1;
        };
        gridLineGroupSelection.each(resetFn);
        tickLineGroupSelection.each(resetFn);
        tickLabelGroupSelection.each(resetFn);
    };
    Axis.prototype.calculateUpdateDiff = function (previous, tickData) {
        var _a;
        var added = new Set();
        var removed = new Set();
        var tickCount = Math.max(previous.length, tickData.ticks.length);
        for (var i = 0; i < tickCount; i++) {
            var prev = previous[i];
            var tick = (_a = tickData.ticks[i]) === null || _a === void 0 ? void 0 : _a.tickId;
            if (prev === tick) {
                continue;
            }
            if (removed.has(tick)) {
                removed.delete(tick);
            }
            else if (tick) {
                added.add(tick);
            }
            if (added.has(prev)) {
                added.delete(prev);
            }
            else if (prev) {
                removed.add(prev);
            }
        }
        var addedKeys = {};
        var removedKeys = {};
        added.forEach(function (a) {
            addedKeys[a] = true;
        });
        removed.forEach(function (r) {
            removedKeys[r] = true;
        });
        return {
            changed: added.size > 0 || removed.size > 0,
            tickCount: tickCount,
            added: addedKeys,
            removed: removedKeys,
        };
    };
    Axis.defaultTickMinSpacing = 50;
    __decorate([
        validation_1.Validate(validation_1.BOOLEAN)
    ], Axis.prototype, "nice", void 0);
    __decorate([
        validation_1.Validate(validation_1.STRING_ARRAY)
    ], Axis.prototype, "keys", void 0);
    __decorate([
        validation_1.Validate(GRID_STYLE)
    ], Axis.prototype, "gridStyle", void 0);
    return Axis;
}());
exports.Axis = Axis;
//# sourceMappingURL=axis.js.map