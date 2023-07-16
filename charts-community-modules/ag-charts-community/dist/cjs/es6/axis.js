"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Axis = exports.Tags = void 0;
const group_1 = require("./scene/group");
const selection_1 = require("./scene/selection");
const line_1 = require("./scene/shape/line");
const text_1 = require("./scene/shape/text");
const bbox_1 = require("./scene/bbox");
const caption_1 = require("./caption");
const id_1 = require("./util/id");
const angle_1 = require("./util/angle");
const equal_1 = require("./util/equal");
const validation_1 = require("./util/validation");
const layers_1 = require("./chart/layers");
const labelPlacement_1 = require("./util/labelPlacement");
const continuousScale_1 = require("./scale/continuousScale");
const matrix_1 = require("./scene/matrix");
const timeScale_1 = require("./scale/timeScale");
const logScale_1 = require("./scale/logScale");
const array_1 = require("./util/array");
const chartAxisDirection_1 = require("./chart/chartAxisDirection");
const label_1 = require("./chart/label");
const logger_1 = require("./util/logger");
const axisLabel_1 = require("./chart/axis/axisLabel");
const axisLine_1 = require("./chart/axis/axisLine");
const axisTick_1 = require("./chart/axis/axisTick");
const easing = require("./motion/easing");
const states_1 = require("./motion/states");
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
var TickGenerationType;
(function (TickGenerationType) {
    TickGenerationType[TickGenerationType["CREATE"] = 0] = "CREATE";
    TickGenerationType[TickGenerationType["CREATE_SECONDARY"] = 1] = "CREATE_SECONDARY";
    TickGenerationType[TickGenerationType["FILTER"] = 2] = "FILTER";
    TickGenerationType[TickGenerationType["VALUES"] = 3] = "VALUES";
})(TickGenerationType || (TickGenerationType = {}));
class AxisStateMachine extends states_1.StateMachine {
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
class Axis {
    constructor(moduleCtx, scale) {
        this.moduleCtx = moduleCtx;
        this.id = id_1.createId(this);
        this.nice = true;
        this.dataDomain = [];
        this.keys = [];
        this.boundSeries = [];
        this.includeInvisibleDomains = false;
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
        const axisHoverHandle = moduleCtx.interactionManager.addListener('hover', (e) => this.checkAxisHover(e));
        this.destroyFns.push(() => moduleCtx.interactionManager.removeListener(axisHoverHandle));
        this.animationManager = moduleCtx.animationManager;
        this.animationState = new AxisStateMachine('empty', {
            empty: {
                on: {
                    update: {
                        target: 'align',
                        action: () => this.resetSelectionNodes(),
                    },
                },
            },
            align: {
                on: {
                    update: {
                        target: 'ready',
                        action: () => this.resetSelectionNodes(),
                    },
                },
            },
            ready: {
                on: {
                    update: {
                        target: 'ready',
                        action: (data) => this.animateReadyUpdate(data),
                    },
                },
            },
        });
        this._crossLines = [];
        this.assignCrossLineArrayConstructor(this._crossLines);
    }
    get scale() {
        return this._scale;
    }
    get type() {
        var _a;
        return (_a = this.constructor.type) !== null && _a !== void 0 ? _a : '';
    }
    set crossLines(value) {
        var _a, _b;
        (_a = this._crossLines) === null || _a === void 0 ? void 0 : _a.forEach((crossLine) => this.detachCrossLine(crossLine));
        if (value) {
            this.assignCrossLineArrayConstructor(value);
        }
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
        for (const [key, module] of Object.entries(this.modules)) {
            module.instance.destroy();
            delete this.modules[key];
            delete this[key];
        }
        this.destroyFns.forEach((f) => f());
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
    attachAxis(node) {
        node.appendChild(this.gridGroup);
        node.appendChild(this.axisGroup);
        node.appendChild(this.crossLineGroup);
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
        }
        this._gridLength = value;
        (_a = this.crossLines) === null || _a === void 0 ? void 0 : _a.forEach((crossLine) => {
            this.initCrossLine(crossLine);
        });
    }
    get gridLength() {
        return this._gridLength;
    }
    createTick() {
        return new axisTick_1.AxisTick();
    }
    checkAxisHover(event) {
        const bbox = this.computeBBox();
        const isInAxis = bbox.containsPoint(event.offsetX, event.offsetY);
        if (!isInAxis)
            return;
        this.moduleCtx.chartEventManager.axisHover(this.id, this.direction);
    }
    /**
     * Creates/removes/updates the scene graph nodes that constitute the axis.
     */
    update(primaryTickCount) {
        const previous = this.tickLabelGroupSelection.nodes().map((node) => node.datum.tickId);
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
        if (this.animationManager.skipAnimations) {
            this.resetSelectionNodes();
        }
        else {
            const diff = this.calculateUpdateDiff(previous, tickData);
            this.animationState.transition('update', diff);
        }
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
        if (!(scale instanceof continuousScale_1.ContinuousScale)) {
            return;
        }
        this.setTickCount(this.tick.count);
        scale.nice = nice;
        scale.update();
    }
    calculateRotations() {
        const rotation = angle_1.toRadians(this.rotation);
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
        return { rotation, parallelFlipRotation, regularFlipRotation };
    }
    generateTicks({ primaryTickCount, parallelFlipRotation, regularFlipRotation, labelX, sideFlag, }) {
        var _a;
        const { scale, tick, label: { parallel, rotation, fontFamily, fontSize, fontStyle, fontWeight }, } = this;
        const secondaryAxis = primaryTickCount !== undefined;
        const { defaultRotation, configuredRotation, parallelFlipFlag, regularFlipFlag } = label_1.calculateLabelRotation({
            rotation,
            parallel,
            regularFlipRotation,
            parallelFlipRotation,
        });
        const initialRotation = configuredRotation + defaultRotation;
        const labelMatrix = new matrix_1.Matrix();
        const { maxTickCount } = this.estimateTickCount({
            minSpacing: tick.minSpacing,
            maxSpacing: (_a = tick.maxSpacing) !== null && _a !== void 0 ? _a : NaN,
        });
        const continuous = scale instanceof continuousScale_1.ContinuousScale;
        const maxIterations = tick.count || !continuous || isNaN(maxTickCount) ? 10 : maxTickCount;
        let textAlign = label_1.getTextAlign(parallel, configuredRotation, 0, sideFlag, regularFlipFlag);
        const textBaseline = label_1.getTextBaseline(parallel, configuredRotation, sideFlag, parallelFlipFlag);
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
            textAlign = label_1.getTextAlign(parallel, configuredRotation, 0, sideFlag, regularFlipFlag);
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
                textAlign = label_1.getTextAlign(parallel, configuredRotation, autoRotation, sideFlag, regularFlipFlag);
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
        const continuous = scale instanceof continuousScale_1.ContinuousScale;
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
        const continuous = scale instanceof continuousScale_1.ContinuousScale;
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
            unchanged = regenerateTicks ? equal_1.areArrayNumbersEqual(rawTicks, prevTicks) : false;
            index++;
        }
        const shouldTerminate = tick.interval !== undefined || tick.values !== undefined;
        terminate || (terminate = shouldTerminate);
        return { tickData, index, autoRotation: 0, terminate };
    }
    checkLabelOverlap(rotation, rotated, labelMatrix, tickData, labelX, textProps) {
        matrix_1.Matrix.updateTransformMatrix(labelMatrix, 1, 1, rotation, 0, 0);
        const labelData = this.createLabelData(tickData, labelX, textProps, labelMatrix);
        const labelSpacing = label_1.getLabelSpacing(this.label.minSpacing, rotated);
        return labelPlacement_1.axisLabelsOverlap(labelData, labelSpacing);
    }
    createLabelData(tickData, labelX, textProps, labelMatrix) {
        const labelData = [];
        for (const tickDatum of tickData) {
            const { tickLabel, translationY } = tickDatum;
            if (tickLabel === '' || tickLabel == undefined) {
                // skip user hidden ticks
                continue;
            }
            const lines = text_1.splitText(tickLabel);
            const { width, height } = text_1.measureText(lines, labelX, translationY, textProps);
            const bbox = new bbox_1.BBox(labelX, translationY, width, height);
            const labelDatum = label_1.calculateLabelBBox(tickLabel, bbox, labelX, translationY, labelMatrix);
            labelData.push(labelDatum);
        }
        return labelData;
    }
    getAutoRotation(labelOveralap) {
        return labelOveralap ? angle_1.normalizeAngle360(angle_1.toRadians(this.label.autoRotateAngle)) : 0;
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
        let prevTickId;
        let prevTickIdIndex = 0;
        for (let i = 0; i < rawTicks.length; i++) {
            const rawTick = rawTicks[i];
            const translationY = scale.convert(rawTick) + halfBandwidth;
            const tickLabel = this.formatTick(rawTick, i);
            // Create a tick id from the label, or as an increment of the last label if this tick label is blank
            let tickId = tickLabel;
            if (tickLabel === '' || tickLabel == undefined) {
                tickId = `${prevTickId}_${i - prevTickIdIndex}`;
            }
            else {
                prevTickId = tickId;
                prevTickIdIndex = i;
            }
            ticks.push({ tick: rawTick, tickId, tickLabel, translationY });
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
        var _a, _b, _c;
        this.setTickCount(tickCount, minTickCount, maxTickCount);
        return (_c = (_b = (_a = this.scale).ticks) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : [];
    }
    estimateTickCount({ minSpacing, maxSpacing }) {
        const availableRange = this.calculateAvailableRange();
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
        const { gridLineGroupSelection, tickLineGroupSelection, tickLabelGroupSelection } = this;
        gridLineGroupSelection.each(visibleFn);
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
            crossLine.direction = rotation === -Math.PI / 2 ? chartAxisDirection_1.ChartAxisDirection.X : chartAxisDirection_1.ChartAxisDirection.Y;
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
        const { direction, boundSeries, includeInvisibleDomains } = this;
        if (this.linkedTo) {
            this.dataDomain = this.linkedTo.dataDomain;
        }
        else {
            const domains = [];
            const visibleSeries = boundSeries.filter((s) => includeInvisibleDomains || s.isEnabled());
            for (const series of visibleSeries) {
                domains.push(series.getDomain(direction));
            }
            const domain = new Array().concat(...domains);
            this.dataDomain = this.normaliseDataDomain(domain);
        }
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
        const gridLineGroupSelection = this.gridLineGroupSelection.update(gridData, (group) => {
            const node = new line_1.Line();
            node.tag = Tags.GridLine;
            group.append(node);
        }, (datum) => datum.tickId);
        const tickLineGroupSelection = this.tickLineGroupSelection.update(data, (group) => {
            const line = new line_1.Line();
            line.tag = Tags.TickLine;
            group.appendChild(line);
        }, (datum) => datum.tickId);
        const tickLabelGroupSelection = this.tickLabelGroupSelection.update(data, (group) => {
            const text = new text_1.Text();
            text.tag = Tags.TickLabel;
            group.appendChild(text);
        }, (datum) => datum.tickId);
        this.tickLineGroupSelection = tickLineGroupSelection;
        this.tickLabelGroupSelection = tickLabelGroupSelection;
        this.gridLineGroupSelection = gridLineGroupSelection;
    }
    updateGridLines(sideFlag) {
        const { gridStyle, tick, gridPadding, gridLength } = this;
        if (gridLength === 0 || gridStyle.length === 0) {
            return;
        }
        const styleCount = gridStyle.length;
        this.gridLineGroupSelection.each((line, _, index) => {
            const style = gridStyle[index % styleCount];
            line.x1 = gridPadding;
            line.x2 = -sideFlag * gridLength + gridPadding;
            line.y1 = 0;
            line.y2 = 0;
            line.stroke = style.stroke;
            line.strokeWidth = tick.width;
            line.lineDash = style.lineDash;
            line.fill = undefined;
        });
    }
    updateLabels({ tickLabelGroupSelection, combinedRotation, textBaseline, textAlign, labelX, }) {
        const { label, label: { enabled: labelsEnabled }, } = this;
        if (!labelsEnabled) {
            return;
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
            const wrappedTickLabel = text_1.Text.wrap(tickLabel, maxLabelWidth, maxLabelHeight, labelProps, wrapping);
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
            const parallelFlipRotation = angle_1.normalizeAngle360(rotation);
            const padding = caption_1.Caption.PADDING;
            const titleRotationFlag = sideFlag === -1 && parallelFlipRotation > Math.PI && parallelFlipRotation < Math.PI * 2 ? -1 : 1;
            titleNode.rotation = (titleRotationFlag * sideFlag * Math.PI) / 2;
            titleNode.x = Math.floor((titleRotationFlag * sideFlag * (requestedRange[0] + requestedRange[1])) / 2);
            let bboxYDimension = 0;
            if (anyTickVisible) {
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
        return this.boundSeries.some((s) => this.includeInvisibleDomains || s.isEnabled());
    }
    clipTickLines(x, y, width, height) {
        this.tickLineGroup.setClipRectInGroupCoordinateSpace(new bbox_1.BBox(x, y, width, height));
    }
    clipGrid(x, y, width, height) {
        this.gridGroup.setClipRectInGroupCoordinateSpace(new bbox_1.BBox(x, y, width, height));
    }
    calculatePadding(min, _max) {
        return [Math.abs(min * 0.01), Math.abs(min * 0.01)];
    }
    getTitleFormatterParams() {
        var _a;
        const boundSeries = this.boundSeries.reduce((acc, next) => {
            const keys = next.getKeys(this.direction);
            const names = next.getNames(this.direction);
            for (let idx = 0; idx < keys.length; idx++) {
                acc.push({
                    key: keys[idx],
                    name: names[idx],
                });
            }
            return acc;
        }, []);
        return {
            direction: this.direction,
            boundSeries,
            defaultValue: (_a = this.title) === null || _a === void 0 ? void 0 : _a.text,
        };
    }
    normaliseDataDomain(d) {
        return d;
    }
    getLayoutState() {
        return Object.assign({ rect: this.computeBBox(), gridPadding: this.gridPadding, seriesAreaPadding: this.seriesAreaPadding, tickSize: this.tick.size }, this.layout);
    }
    createAxisContext() {
        const keys = () => {
            return this.boundSeries
                .map((s) => s.getKeys(this.direction))
                .reduce((keys, seriesKeys) => {
                keys.push(...seriesKeys);
                return keys;
            }, []);
        };
        return {
            axisId: this.id,
            direction: this.direction,
            continuous: this.scale instanceof continuousScale_1.ContinuousScale,
            keys,
            scaleValueFormatter: (specifier) => { var _a, _b, _c; return (_c = (_b = (_a = this.scale).tickFormat) === null || _b === void 0 ? void 0 : _b.call(_a, { specifier })) !== null && _c !== void 0 ? _c : undefined; },
            scaleBandwidth: () => { var _a; return (_a = this.scale.bandwidth) !== null && _a !== void 0 ? _a : 0; },
            scaleConvert: (val) => this.scale.convert(val),
            scaleInvert: (val) => { var _a, _b, _c; return (_c = (_b = (_a = this.scale).invert) === null || _b === void 0 ? void 0 : _b.call(_a, val)) !== null && _c !== void 0 ? _c : undefined; },
        };
    }
    addModule(module) {
        if (this.modules[module.optionsKey] != null) {
            throw new Error('AG Charts - module already initialised: ' + module.optionsKey);
        }
        if (this.axisContext == null) {
            this.axisContext = this.createAxisContext();
        }
        const moduleInstance = new module.instanceConstructor(Object.assign(Object.assign({}, this.moduleCtx), { parent: this.axisContext }));
        this.modules[module.optionsKey] = { instance: moduleInstance };
        this[module.optionsKey] = moduleInstance;
    }
    removeModule(module) {
        var _a, _b;
        (_b = (_a = this.modules[module.optionsKey]) === null || _a === void 0 ? void 0 : _a.instance) === null || _b === void 0 ? void 0 : _b.destroy();
        delete this.modules[module.optionsKey];
        delete this[module.optionsKey];
    }
    isModuleEnabled(module) {
        return this.modules[module.optionsKey] != null;
    }
    animateReadyUpdate(diff) {
        var _a, _b;
        if (!diff.changed) {
            this.resetSelectionNodes();
            return;
        }
        const { gridLineGroupSelection, tickLineGroupSelection, tickLabelGroupSelection } = this;
        const addedCount = Object.keys(diff.added).length;
        const removedCount = Object.keys(diff.removed).length;
        if (removedCount === diff.tickCount) {
            this.resetSelectionNodes();
            return;
        }
        const totalDuration = (_b = (_a = this.animationManager) === null || _a === void 0 ? void 0 : _a.defaultOptions.duration) !== null && _b !== void 0 ? _b : 1000;
        let sectionDuration = Math.floor(totalDuration / 2);
        if (addedCount > 0 && removedCount > 0) {
            sectionDuration = Math.floor(totalDuration / 3);
        }
        const options = {
            delay: removedCount > 0 ? sectionDuration : 0,
            duration: sectionDuration,
        };
        const animationGroup = `${this.id}_${Math.random()}`;
        tickLabelGroupSelection.each((node, datum) => {
            this.animateSelectionNode(tickLabelGroupSelection, diff, options, node, datum, animationGroup);
        });
        gridLineGroupSelection.each((node, datum) => {
            this.animateSelectionNode(gridLineGroupSelection, diff, options, node, datum, animationGroup);
        });
        tickLineGroupSelection.each((node, datum) => {
            this.animateSelectionNode(tickLineGroupSelection, diff, options, node, datum, animationGroup);
        });
    }
    animateSelectionNode(selection, diff, options, node, datum, animationGroup) {
        const roundedTranslationY = Math.round(datum.translationY);
        let translate = { from: node.translationY, to: roundedTranslationY };
        let opacity = { from: 1, to: 1 };
        const { duration } = options;
        let { delay } = options;
        const datumId = datum.tickLabel;
        if (diff.added[datumId]) {
            translate = { from: roundedTranslationY, to: roundedTranslationY };
            opacity = { from: 0, to: 1 };
            delay += duration;
        }
        else if (diff.removed[datumId]) {
            opacity = { from: 1, to: 0 };
            delay = 0;
        }
        const props = [translate, opacity];
        this.animationManager.animateManyWithThrottle(`${this.id}_ready-update_${node.id}`, props, {
            disableInteractions: false,
            delay,
            duration,
            ease: easing.easeOut,
            throttleId: this.id,
            throttleGroup: animationGroup,
            onUpdate([translationY, opacity]) {
                node.translationY = translationY;
                node.opacity = opacity;
            },
            onComplete() {
                selection.cleanup();
            },
        });
    }
    resetSelectionNodes() {
        const { gridLineGroupSelection, tickLineGroupSelection, tickLabelGroupSelection } = this;
        gridLineGroupSelection.cleanup();
        tickLineGroupSelection.cleanup();
        tickLabelGroupSelection.cleanup();
        // We need raw `translationY` values on `datum` for accurate label collision detection in axes.update()
        // But node `translationY` values must be rounded to get pixel grid alignment
        const resetFn = (node) => {
            node.translationY = Math.round(node.datum.translationY);
            node.opacity = 1;
        };
        gridLineGroupSelection.each(resetFn);
        tickLineGroupSelection.each(resetFn);
        tickLabelGroupSelection.each(resetFn);
    }
    calculateUpdateDiff(previous, tickData) {
        var _a;
        const added = new Set();
        const removed = new Set();
        const tickCount = Math.max(previous.length, tickData.ticks.length);
        for (let i = 0; i < tickCount; i++) {
            const prev = previous[i];
            const tick = (_a = tickData.ticks[i]) === null || _a === void 0 ? void 0 : _a.tickId;
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
        const addedKeys = {};
        const removedKeys = {};
        added.forEach((a) => {
            addedKeys[a] = true;
        });
        removed.forEach((r) => {
            removedKeys[r] = true;
        });
        return {
            changed: added.size > 0 || removed.size > 0,
            tickCount,
            added: addedKeys,
            removed: removedKeys,
        };
    }
}
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
exports.Axis = Axis;
