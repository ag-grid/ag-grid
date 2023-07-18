"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistogramSeries = void 0;
const rect_1 = require("../../../scene/shape/rect");
const series_1 = require("../series");
const label_1 = require("../../label");
const node_1 = require("../../../scene/node");
const cartesianSeries_1 = require("./cartesianSeries");
const chartAxisDirection_1 = require("../../chartAxisDirection");
const tooltip_1 = require("../../tooltip/tooltip");
const ticks_1 = require("../../../util/ticks");
const sanitize_1 = require("../../../util/sanitize");
const validation_1 = require("../../../util/validation");
const dataModel_1 = require("../../data/dataModel");
const aggregateFunctions_1 = require("../../data/aggregateFunctions");
const processors_1 = require("../../data/processors");
const easing = require("../../../motion/easing");
const HISTOGRAM_AGGREGATIONS = ['count', 'sum', 'mean'];
const HISTOGRAM_AGGREGATION = validation_1.predicateWithMessage((v) => HISTOGRAM_AGGREGATIONS.includes(v), `expecting a histogram aggregation keyword such as 'count', 'sum' or 'mean`);
var HistogramSeriesNodeTag;
(function (HistogramSeriesNodeTag) {
    HistogramSeriesNodeTag[HistogramSeriesNodeTag["Bin"] = 0] = "Bin";
    HistogramSeriesNodeTag[HistogramSeriesNodeTag["Label"] = 1] = "Label";
})(HistogramSeriesNodeTag || (HistogramSeriesNodeTag = {}));
class HistogramSeriesLabel extends label_1.Label {
    constructor() {
        super(...arguments);
        this.formatter = undefined;
    }
}
__decorate([
    validation_1.Validate(validation_1.OPT_FUNCTION)
], HistogramSeriesLabel.prototype, "formatter", void 0);
const defaultBinCount = 10;
class HistogramSeriesTooltip extends series_1.SeriesTooltip {
    constructor() {
        super(...arguments);
        this.renderer = undefined;
    }
}
__decorate([
    validation_1.Validate(validation_1.OPT_FUNCTION)
], HistogramSeriesTooltip.prototype, "renderer", void 0);
class HistogramSeries extends cartesianSeries_1.CartesianSeries {
    constructor(moduleCtx) {
        super({ moduleCtx, pickModes: [series_1.SeriesNodePickMode.EXACT_SHAPE_MATCH] });
        this.label = new HistogramSeriesLabel();
        this.tooltip = new HistogramSeriesTooltip();
        this.fill = undefined;
        this.stroke = undefined;
        this.fillOpacity = 1;
        this.strokeOpacity = 1;
        this.lineDash = [0];
        this.lineDashOffset = 0;
        this.xKey = undefined;
        this.areaPlot = false;
        this.bins = undefined;
        this.aggregation = 'count';
        this.binCount = undefined;
        this.xName = undefined;
        this.yKey = undefined;
        this.yName = undefined;
        this.strokeWidth = 1;
        this.shadow = undefined;
        this.calculatedBins = [];
        this.datumSelectionGarbageCollection = false;
        this.label.enabled = false;
    }
    // During processData phase, used to unify different ways of the user specifying
    // the bins. Returns bins in format[[min1, max1], [min2, max2], ... ].
    deriveBins(xDomain) {
        if (this.binCount === undefined) {
            const binStarts = ticks_1.default(xDomain[0], xDomain[1], defaultBinCount);
            const binSize = ticks_1.tickStep(xDomain[0], xDomain[1], defaultBinCount);
            const firstBinEnd = binStarts[0];
            const expandStartToBin = (n) => [n, n + binSize];
            return [[firstBinEnd - binSize, firstBinEnd], ...binStarts.map(expandStartToBin)];
        }
        else {
            return this.calculateNiceBins(xDomain, this.binCount);
        }
    }
    calculateNiceBins(domain, binCount) {
        const startGuess = Math.floor(domain[0]);
        const stop = domain[1];
        const segments = binCount || 1;
        const { start, binSize } = this.calculateNiceStart(startGuess, stop, segments);
        return this.getBins(start, stop, binSize, segments);
    }
    getBins(start, stop, step, count) {
        const bins = [];
        for (let i = 0; i < count; i++) {
            const a = Math.round((start + i * step) * 10) / 10;
            let b = Math.round((start + (i + 1) * step) * 10) / 10;
            if (i === count - 1) {
                b = Math.max(b, stop);
            }
            bins[i] = [a, b];
        }
        return bins;
    }
    calculateNiceStart(a, b, segments) {
        const binSize = Math.abs(b - a) / segments;
        const order = Math.floor(Math.log10(binSize));
        const magnitude = Math.pow(10, order);
        const start = Math.floor(a / magnitude) * magnitude;
        return {
            start,
            binSize,
        };
    }
    processData(dataController) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { xKey, yKey, data, areaPlot, aggregation } = this;
            const props = [series_1.keyProperty(this, xKey, true), processors_1.SORT_DOMAIN_GROUPS];
            if (yKey) {
                let aggProp = aggregateFunctions_1.groupCount(this, 'groupCount');
                if (aggregation === 'count') {
                    // Nothing to do.
                }
                else if (aggregation === 'sum') {
                    aggProp = aggregateFunctions_1.groupSum(this, 'groupAgg');
                }
                else if (aggregation === 'mean') {
                    aggProp = aggregateFunctions_1.groupAverage(this, 'groupAgg');
                }
                if (areaPlot) {
                    aggProp = aggregateFunctions_1.area(this, 'groupAgg', aggProp);
                }
                props.push(series_1.valueProperty(this, yKey, true, { invalidValue: undefined }), aggProp);
            }
            else {
                let aggProp = aggregateFunctions_1.groupCount(this, 'groupAgg');
                if (areaPlot) {
                    aggProp = aggregateFunctions_1.area(this, 'groupAgg', aggProp);
                }
                props.push(aggProp);
            }
            const groupByFn = (dataSet) => {
                var _a;
                const xExtent = dataModel_1.fixNumericExtent(dataSet.domain.keys[0]);
                if (xExtent.length === 0) {
                    // No buckets can be calculated.
                    dataSet.domain.groups = [];
                    return () => [];
                }
                const bins = (_a = this.bins) !== null && _a !== void 0 ? _a : this.deriveBins(xExtent);
                const binCount = bins.length;
                this.calculatedBins = [...bins];
                return (item) => {
                    const xValue = item.keys[0];
                    for (let i = 0; i < binCount; i++) {
                        const nextBin = bins[i];
                        if (xValue >= nextBin[0] && xValue < nextBin[1]) {
                            return nextBin;
                        }
                        if (i === binCount - 1 && xValue <= nextBin[1]) {
                            // Handle edge case of a value being at the maximum extent, and the
                            // final bin aligning with it.
                            return nextBin;
                        }
                    }
                    return [];
                };
            };
            if (!((_a = this.ctx.animationManager) === null || _a === void 0 ? void 0 : _a.skipAnimations) && this.processedData) {
                props.push(processors_1.diff(this.processedData, false));
            }
            const { dataModel, processedData } = yield dataController.request(this.id, data !== null && data !== void 0 ? data : [], {
                props,
                dataVisible: this.visible,
                groupByFn,
            });
            this.dataModel = dataModel;
            this.processedData = processedData;
            this.animationState.transition('updateData');
        });
    }
    getDomain(direction) {
        var _a, _b, _c, _d;
        const { processedData, dataModel } = this;
        if (!processedData || !dataModel)
            return [];
        const yDomain = dataModel.getDomain(this, `groupAgg`, 'aggregate', processedData);
        const xDomainMin = (_a = this.calculatedBins) === null || _a === void 0 ? void 0 : _a[0][0];
        const xDomainMax = (_b = this.calculatedBins) === null || _b === void 0 ? void 0 : _b[((_d = (_c = this.calculatedBins) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0) - 1][1];
        if (direction === chartAxisDirection_1.ChartAxisDirection.X) {
            return dataModel_1.fixNumericExtent([xDomainMin, xDomainMax]);
        }
        return dataModel_1.fixNumericExtent(yDomain);
    }
    getNodeClickEvent(event, datum) {
        var _a, _b;
        return new cartesianSeries_1.CartesianSeriesNodeClickEvent((_a = this.xKey) !== null && _a !== void 0 ? _a : '', (_b = this.yKey) !== null && _b !== void 0 ? _b : '', event, datum, this);
    }
    getNodeDoubleClickEvent(event, datum) {
        var _a, _b;
        return new cartesianSeries_1.CartesianSeriesNodeDoubleClickEvent((_a = this.xKey) !== null && _a !== void 0 ? _a : '', (_b = this.yKey) !== null && _b !== void 0 ? _b : '', event, datum, this);
    }
    createNodeData() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { axes, processedData, ctx: { callbackCache }, } = this;
            const xAxis = axes[chartAxisDirection_1.ChartAxisDirection.X];
            const yAxis = axes[chartAxisDirection_1.ChartAxisDirection.Y];
            if (!this.visible || !xAxis || !yAxis || !processedData || processedData.type !== 'grouped') {
                return [];
            }
            const { scale: xScale } = xAxis;
            const { scale: yScale } = yAxis;
            const { fill, stroke, strokeWidth, id: seriesId, yKey = '', xKey = '' } = this;
            const nodeData = [];
            const defaultLabelFormatter = (params) => String(params.value);
            const { label: { formatter: labelFormatter = defaultLabelFormatter, fontStyle: labelFontStyle, fontWeight: labelFontWeight, fontSize: labelFontSize, fontFamily: labelFontFamily, color: labelColor, }, } = this;
            processedData.data.forEach((group) => {
                var _a;
                const { aggValues: [[negativeAgg, positiveAgg]] = [[0, 0]], datum, datum: { length: frequency }, keys: domain, keys: [xDomainMin, xDomainMax], } = group;
                const xMinPx = xScale.convert(xDomainMin);
                const xMaxPx = xScale.convert(xDomainMax);
                const total = negativeAgg + positiveAgg;
                const yZeroPx = yScale.convert(0);
                const yMaxPx = yScale.convert(total);
                const w = xMaxPx - xMinPx;
                const h = Math.abs(yMaxPx - yZeroPx);
                const selectionDatumLabel = total !== 0
                    ? {
                        text: (_a = callbackCache.call(labelFormatter, { value: total, seriesId })) !== null && _a !== void 0 ? _a : String(total),
                        fontStyle: labelFontStyle,
                        fontWeight: labelFontWeight,
                        fontSize: labelFontSize,
                        fontFamily: labelFontFamily,
                        fill: labelColor,
                        x: xMinPx + w / 2,
                        y: yMaxPx + h / 2,
                    }
                    : undefined;
                const nodeMidPoint = {
                    x: xMinPx + w / 2,
                    y: yMaxPx + h / 2,
                };
                nodeData.push({
                    series: this,
                    datum,
                    // since each selection is an aggregation of multiple data.
                    aggregatedValue: total,
                    frequency,
                    domain: domain,
                    yKey,
                    xKey,
                    x: xMinPx,
                    y: yMaxPx,
                    xValue: xMinPx,
                    yValue: yMaxPx,
                    width: w,
                    height: h,
                    nodeMidPoint,
                    fill: fill,
                    stroke: stroke,
                    strokeWidth: strokeWidth,
                    label: selectionDatumLabel,
                });
            });
            return [{ itemId: (_a = this.yKey) !== null && _a !== void 0 ? _a : this.id, nodeData, labelData: nodeData }];
        });
    }
    nodeFactory() {
        return new rect_1.Rect();
    }
    updateDatumSelection(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nodeData, datumSelection } = opts;
            return datumSelection.update(nodeData, (rect) => {
                rect.tag = HistogramSeriesNodeTag.Bin;
                rect.crisp = true;
            }, (datum) => datum.domain.join('_'));
        });
    }
    updateDatumNodes(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const { datumSelection, isHighlight: isDatumHighlighted } = opts;
            const { fillOpacity: seriesFillOpacity, strokeOpacity, shadow, highlightStyle: { item: { fill: highlightedFill, fillOpacity: highlightFillOpacity = seriesFillOpacity, stroke: highlightedStroke, strokeWidth: highlightedDatumStrokeWidth, }, }, } = this;
            datumSelection.each((rect, datum, index) => {
                var _a, _b;
                const strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                    ? highlightedDatumStrokeWidth
                    : datum.strokeWidth;
                const fillOpacity = isDatumHighlighted ? highlightFillOpacity : seriesFillOpacity;
                rect.fill = (_a = (isDatumHighlighted ? highlightedFill : undefined)) !== null && _a !== void 0 ? _a : datum.fill;
                rect.stroke = (_b = (isDatumHighlighted ? highlightedStroke : undefined)) !== null && _b !== void 0 ? _b : datum.stroke;
                rect.fillOpacity = fillOpacity;
                rect.strokeOpacity = strokeOpacity;
                rect.strokeWidth = strokeWidth;
                rect.lineDash = this.lineDash;
                rect.lineDashOffset = this.lineDashOffset;
                rect.fillShadow = shadow;
                rect.zIndex = isDatumHighlighted ? series_1.Series.highlightedZIndex : index;
                rect.visible = datum.height > 0; // prevent stroke from rendering for zero height columns
            });
        });
    }
    updateLabelSelection(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const { labelData, labelSelection } = opts;
            return labelSelection.update(labelData, (text) => {
                text.tag = HistogramSeriesNodeTag.Label;
                text.pointerEvents = node_1.PointerEvents.None;
                text.textAlign = 'center';
                text.textBaseline = 'middle';
            });
        });
    }
    updateLabelNodes(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const { labelSelection } = opts;
            const labelEnabled = this.label.enabled;
            labelSelection.each((text, datum) => {
                const label = datum.label;
                if (label && labelEnabled) {
                    text.text = label.text;
                    text.x = label.x;
                    text.y = label.y;
                    text.fontStyle = label.fontStyle;
                    text.fontWeight = label.fontWeight;
                    text.fontSize = label.fontSize;
                    text.fontFamily = label.fontFamily;
                    text.fill = label.fill;
                    text.visible = true;
                }
                else {
                    text.visible = false;
                }
            });
        });
    }
    getTooltipHtml(nodeDatum) {
        const { xKey, yKey = '', axes } = this;
        const xAxis = axes[chartAxisDirection_1.ChartAxisDirection.X];
        const yAxis = axes[chartAxisDirection_1.ChartAxisDirection.Y];
        if (!xKey || !xAxis || !yAxis) {
            return '';
        }
        const { xName, yName, fill: color, tooltip, aggregation, id: seriesId } = this;
        const { renderer: tooltipRenderer } = tooltip;
        const { aggregatedValue, frequency, domain, domain: [rangeMin, rangeMax], } = nodeDatum;
        const title = `${sanitize_1.sanitizeHtml(xName !== null && xName !== void 0 ? xName : xKey)}: ${xAxis.formatDatum(rangeMin)} - ${xAxis.formatDatum(rangeMax)}`;
        let content = yKey
            ? `<b>${sanitize_1.sanitizeHtml(yName !== null && yName !== void 0 ? yName : yKey)} (${aggregation})</b>: ${yAxis.formatDatum(aggregatedValue)}<br>`
            : '';
        content += `<b>Frequency</b>: ${frequency}`;
        const defaults = {
            title,
            backgroundColor: color,
            content,
        };
        if (tooltipRenderer) {
            return tooltip_1.toTooltipHtml(tooltipRenderer({
                datum: {
                    data: nodeDatum.datum,
                    aggregatedValue: nodeDatum.aggregatedValue,
                    domain: nodeDatum.domain,
                    frequency: nodeDatum.frequency,
                },
                xKey,
                xValue: domain,
                xName,
                yKey,
                yValue: aggregatedValue,
                yName,
                color,
                title,
                seriesId,
            }), defaults);
        }
        return tooltip_1.toTooltipHtml(defaults);
    }
    getLegendData() {
        var _a;
        const { id, data, xKey, yName, visible, fill, stroke, fillOpacity, strokeOpacity } = this;
        if (!data || data.length === 0) {
            return [];
        }
        const legendData = [
            {
                legendType: 'category',
                id,
                itemId: xKey,
                seriesId: id,
                enabled: visible,
                label: {
                    text: (_a = yName !== null && yName !== void 0 ? yName : xKey) !== null && _a !== void 0 ? _a : 'Frequency',
                },
                marker: {
                    fill: fill !== null && fill !== void 0 ? fill : 'rgba(0, 0, 0, 0)',
                    stroke: stroke !== null && stroke !== void 0 ? stroke : 'rgba(0, 0, 0, 0)',
                    fillOpacity: fillOpacity,
                    strokeOpacity: strokeOpacity,
                },
            },
        ];
        return legendData;
    }
    animateEmptyUpdateReady({ datumSelections, labelSelections, }) {
        var _a, _b;
        const duration = (_b = (_a = this.ctx.animationManager) === null || _a === void 0 ? void 0 : _a.defaultOptions.duration) !== null && _b !== void 0 ? _b : 1000;
        const labelDuration = 200;
        let startingY = 0;
        datumSelections.forEach((datumSelection) => datumSelection.each((_, datum) => {
            startingY = Math.max(startingY, datum.height + datum.y);
        }));
        datumSelections.forEach((datumSelection) => {
            datumSelection.each((rect, datum) => {
                var _a;
                (_a = this.ctx.animationManager) === null || _a === void 0 ? void 0 : _a.animateMany(`${this.id}_empty-update-ready_${rect.id}`, [
                    { from: startingY, to: datum.y },
                    { from: 0, to: datum.height },
                ], {
                    duration,
                    ease: easing.easeOut,
                    onUpdate([y, height]) {
                        rect.y = y;
                        rect.height = height;
                        rect.x = datum.x;
                        rect.width = datum.width;
                    },
                });
            });
        });
        labelSelections.forEach((labelSelection) => {
            labelSelection.each((label) => {
                var _a;
                (_a = this.ctx.animationManager) === null || _a === void 0 ? void 0 : _a.animate(`${this.id}_empty-update-ready_${label.id}`, {
                    from: 0,
                    to: 1,
                    delay: duration,
                    duration: labelDuration,
                    onUpdate: (opacity) => {
                        label.opacity = opacity;
                    },
                });
            });
        });
    }
    animateReadyUpdate({ datumSelections }) {
        datumSelections.forEach((datumSelection) => {
            this.resetSelectionRects(datumSelection);
        });
    }
    animateReadyHighlight(highlightSelection) {
        this.resetSelectionRects(highlightSelection);
    }
    animateReadyResize({ datumSelections }) {
        var _a;
        (_a = this.ctx.animationManager) === null || _a === void 0 ? void 0 : _a.reset();
        datumSelections.forEach((datumSelection) => {
            this.resetSelectionRects(datumSelection);
        });
    }
    animateWaitingUpdateReady({ datumSelections, labelSelections, }) {
        var _a, _b, _c;
        const { processedData } = this;
        const diff = (_a = processedData === null || processedData === void 0 ? void 0 : processedData.reduced) === null || _a === void 0 ? void 0 : _a.diff;
        if (!(diff === null || diff === void 0 ? void 0 : diff.changed)) {
            datumSelections.forEach((datumSelection) => {
                this.resetSelectionRects(datumSelection);
            });
            return;
        }
        const totalDuration = (_c = (_b = this.ctx.animationManager) === null || _b === void 0 ? void 0 : _b.defaultOptions.duration) !== null && _c !== void 0 ? _c : 1000;
        const labelDuration = 200;
        let sectionDuration = totalDuration;
        if (diff.added.length > 0 && diff.removed.length > 0) {
            sectionDuration = Math.floor(totalDuration / 3);
        }
        else if (diff.added.length > 0 || diff.removed.length > 0) {
            sectionDuration = Math.floor(totalDuration / 2);
        }
        let startingY = 0;
        datumSelections.forEach((datumSelection) => datumSelection.each((_, datum) => {
            startingY = Math.max(startingY, datum.height + datum.y);
        }));
        const addedIds = {};
        diff.added.forEach((d) => {
            addedIds[d.join('_')] = true;
        });
        const removedIds = {};
        diff.removed.forEach((d) => {
            removedIds[d.join('_')] = true;
        });
        datumSelections.forEach((datumSelection) => {
            datumSelection.each((rect, datum) => {
                var _a;
                let props = [
                    { from: rect.x, to: datum.x },
                    { from: rect.width, to: datum.width },
                    { from: rect.y, to: datum.y },
                    { from: rect.height, to: datum.height },
                ];
                let delay = diff.removed.length > 0 ? sectionDuration : 0;
                let cleanup = false;
                const datumId = datum.domain.join('_');
                const contextY = startingY;
                const contextHeight = 0;
                if (datumId !== undefined && addedIds[datumId] !== undefined) {
                    props = [
                        { from: datum.x, to: datum.x },
                        { from: datum.width, to: datum.width },
                        { from: contextY, to: datum.y },
                        { from: contextHeight, to: datum.height },
                    ];
                    delay += sectionDuration;
                }
                else if (datumId !== undefined && removedIds[datumId] !== undefined) {
                    props = [
                        { from: rect.x, to: datum.x },
                        { from: rect.width, to: datum.width },
                        { from: datum.y, to: contextY },
                        { from: datum.height, to: contextHeight },
                    ];
                    delay = 0;
                    cleanup = true;
                }
                (_a = this.ctx.animationManager) === null || _a === void 0 ? void 0 : _a.animateMany(`${this.id}_waiting-update-ready_${rect.id}`, props, {
                    disableInteractions: true,
                    delay,
                    duration: sectionDuration,
                    ease: easing.easeOut,
                    repeat: 0,
                    onUpdate([x, width, y, height]) {
                        rect.x = x;
                        rect.width = width;
                        rect.y = y;
                        rect.height = height;
                    },
                    onComplete() {
                        if (cleanup)
                            datumSelection.cleanup();
                    },
                });
            });
        });
        labelSelections.forEach((labelSelection) => {
            labelSelection.each((label) => {
                var _a;
                label.opacity = 0;
                (_a = this.ctx.animationManager) === null || _a === void 0 ? void 0 : _a.animate(`${this.id}_waiting-update-ready_${label.id}`, {
                    from: 0,
                    to: 1,
                    delay: totalDuration,
                    duration: labelDuration,
                    ease: easing.linear,
                    repeat: 0,
                    onUpdate: (opacity) => {
                        label.opacity = opacity;
                    },
                });
            });
        });
    }
    resetSelectionRects(selection) {
        selection.each((rect, datum) => {
            rect.x = datum.x;
            rect.y = datum.y;
            rect.width = datum.width;
            rect.height = datum.height;
        });
    }
    isLabelEnabled() {
        return this.label.enabled;
    }
}
HistogramSeries.className = 'HistogramSeries';
HistogramSeries.type = 'histogram';
__decorate([
    validation_1.Validate(validation_1.OPT_COLOR_STRING)
], HistogramSeries.prototype, "fill", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_COLOR_STRING)
], HistogramSeries.prototype, "stroke", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0, 1))
], HistogramSeries.prototype, "fillOpacity", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0, 1))
], HistogramSeries.prototype, "strokeOpacity", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_LINE_DASH)
], HistogramSeries.prototype, "lineDash", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], HistogramSeries.prototype, "lineDashOffset", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_STRING)
], HistogramSeries.prototype, "xKey", void 0);
__decorate([
    validation_1.Validate(validation_1.BOOLEAN)
], HistogramSeries.prototype, "areaPlot", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_ARRAY())
], HistogramSeries.prototype, "bins", void 0);
__decorate([
    validation_1.Validate(HISTOGRAM_AGGREGATION)
], HistogramSeries.prototype, "aggregation", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_NUMBER(0))
], HistogramSeries.prototype, "binCount", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_STRING)
], HistogramSeries.prototype, "xName", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_STRING)
], HistogramSeries.prototype, "yKey", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_STRING)
], HistogramSeries.prototype, "yName", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], HistogramSeries.prototype, "strokeWidth", void 0);
exports.HistogramSeries = HistogramSeries;
