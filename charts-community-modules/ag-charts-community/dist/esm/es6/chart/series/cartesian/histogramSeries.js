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
import { Rect } from '../../../scene/shape/rect';
import { SeriesTooltip, Series, SeriesNodePickMode, valueProperty, keyProperty, } from '../series';
import { Label } from '../../label';
import { PointerEvents } from '../../../scene/node';
import { CartesianSeries, CartesianSeriesNodeClickEvent, CartesianSeriesNodeDoubleClickEvent, } from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxisDirection';
import { toTooltipHtml } from '../../tooltip/tooltip';
import ticks, { tickStep } from '../../../util/ticks';
import { sanitizeHtml } from '../../../util/sanitize';
import { BOOLEAN, NUMBER, OPT_ARRAY, OPT_FUNCTION, OPT_LINE_DASH, OPT_NUMBER, OPT_COLOR_STRING, Validate, predicateWithMessage, OPT_STRING, } from '../../../util/validation';
import { DataModel, fixNumericExtent, } from '../../data/dataModel';
import { area, groupAverage, groupCount, groupSum } from '../../data/aggregateFunctions';
import { SORT_DOMAIN_GROUPS } from '../../data/processors';
import * as easing from '../../../motion/easing';
const HISTOGRAM_AGGREGATIONS = ['count', 'sum', 'mean'];
const HISTOGRAM_AGGREGATION = predicateWithMessage((v) => HISTOGRAM_AGGREGATIONS.includes(v), `expecting a histogram aggregation keyword such as 'count', 'sum' or 'mean`);
var HistogramSeriesNodeTag;
(function (HistogramSeriesNodeTag) {
    HistogramSeriesNodeTag[HistogramSeriesNodeTag["Bin"] = 0] = "Bin";
    HistogramSeriesNodeTag[HistogramSeriesNodeTag["Label"] = 1] = "Label";
})(HistogramSeriesNodeTag || (HistogramSeriesNodeTag = {}));
class HistogramSeriesLabel extends Label {
    constructor() {
        super(...arguments);
        this.formatter = undefined;
    }
}
__decorate([
    Validate(OPT_FUNCTION)
], HistogramSeriesLabel.prototype, "formatter", void 0);
const defaultBinCount = 10;
class HistogramSeriesTooltip extends SeriesTooltip {
    constructor() {
        super(...arguments);
        this.renderer = undefined;
    }
}
__decorate([
    Validate(OPT_FUNCTION)
], HistogramSeriesTooltip.prototype, "renderer", void 0);
export class HistogramSeries extends CartesianSeries {
    constructor(moduleCtx) {
        super({ moduleCtx, pickModes: [SeriesNodePickMode.EXACT_SHAPE_MATCH] });
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
        this.label.enabled = false;
    }
    // During processData phase, used to unify different ways of the user specifying
    // the bins. Returns bins in format[[min1, max1], [min2, max2], ... ].
    deriveBins(xDomain) {
        if (this.binCount === undefined) {
            const binStarts = ticks(xDomain[0], xDomain[1], defaultBinCount);
            const binSize = tickStep(xDomain[0], xDomain[1], defaultBinCount);
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
    processData() {
        return __awaiter(this, void 0, void 0, function* () {
            const { xKey, yKey, data, areaPlot, aggregation } = this;
            const props = [keyProperty(xKey, true), SORT_DOMAIN_GROUPS];
            if (yKey) {
                let aggProp = groupCount();
                if (aggregation === 'count') {
                    // Nothing to do.
                }
                else if (aggregation === 'sum') {
                    aggProp = groupSum([yKey]);
                }
                else if (aggregation === 'mean') {
                    aggProp = groupAverage([yKey]);
                }
                if (areaPlot) {
                    aggProp = area([yKey], aggProp);
                }
                props.push(valueProperty(yKey, true, { invalidValue: undefined }), aggProp);
            }
            else {
                let aggProp = groupCount();
                if (areaPlot) {
                    aggProp = area([], aggProp);
                }
                props.push(aggProp);
            }
            const groupByFn = (dataSet) => {
                var _a;
                const xExtent = fixNumericExtent(dataSet.domain.keys[0]);
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
            this.dataModel = new DataModel({
                props,
                dataVisible: this.visible,
                groupByFn,
            });
            this.processedData = this.dataModel.processData(data !== null && data !== void 0 ? data : []);
        });
    }
    getDomain(direction) {
        var _a, _b, _c, _d;
        const { processedData } = this;
        if (!processedData)
            return [];
        const { domain: { aggValues: [yDomain] = [] }, } = processedData;
        const xDomainMin = (_a = this.calculatedBins) === null || _a === void 0 ? void 0 : _a[0][0];
        const xDomainMax = (_b = this.calculatedBins) === null || _b === void 0 ? void 0 : _b[((_d = (_c = this.calculatedBins) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0) - 1][1];
        if (direction === ChartAxisDirection.X) {
            return fixNumericExtent([xDomainMin, xDomainMax]);
        }
        return fixNumericExtent(yDomain);
    }
    getNodeClickEvent(event, datum) {
        var _a, _b;
        return new CartesianSeriesNodeClickEvent((_a = this.xKey) !== null && _a !== void 0 ? _a : '', (_b = this.yKey) !== null && _b !== void 0 ? _b : '', event, datum, this);
    }
    getNodeDoubleClickEvent(event, datum) {
        var _a, _b;
        return new CartesianSeriesNodeDoubleClickEvent((_a = this.xKey) !== null && _a !== void 0 ? _a : '', (_b = this.yKey) !== null && _b !== void 0 ? _b : '', event, datum, this);
    }
    createNodeData() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { xAxis, yAxis, processedData, ctx: { callbackCache }, } = this;
            if (!this.seriesItemEnabled || !xAxis || !yAxis || !processedData || processedData.type !== 'grouped') {
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
        return new Rect();
    }
    updateDatumSelection(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nodeData, datumSelection } = opts;
            return datumSelection.update(nodeData, (rect) => {
                rect.tag = HistogramSeriesNodeTag.Bin;
                rect.crisp = true;
            });
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
                rect.x = datum.x;
                rect.width = datum.width;
                rect.fill = (_a = (isDatumHighlighted ? highlightedFill : undefined)) !== null && _a !== void 0 ? _a : datum.fill;
                rect.stroke = (_b = (isDatumHighlighted ? highlightedStroke : undefined)) !== null && _b !== void 0 ? _b : datum.stroke;
                rect.fillOpacity = fillOpacity;
                rect.strokeOpacity = strokeOpacity;
                rect.strokeWidth = strokeWidth;
                rect.lineDash = this.lineDash;
                rect.lineDashOffset = this.lineDashOffset;
                rect.fillShadow = shadow;
                rect.zIndex = isDatumHighlighted ? Series.highlightedZIndex : index;
                rect.visible = datum.height > 0; // prevent stroke from rendering for zero height columns
            });
        });
    }
    updateLabelSelection(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const { labelData, labelSelection } = opts;
            return labelSelection.update(labelData, (text) => {
                text.tag = HistogramSeriesNodeTag.Label;
                text.pointerEvents = PointerEvents.None;
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
        const { xKey, yKey = '', xAxis, yAxis } = this;
        if (!xKey || !xAxis || !yAxis) {
            return '';
        }
        const { xName, yName, fill: color, tooltip, aggregation, id: seriesId } = this;
        const { renderer: tooltipRenderer } = tooltip;
        const { aggregatedValue, frequency, domain, domain: [rangeMin, rangeMax], } = nodeDatum;
        const title = `${sanitizeHtml(xName !== null && xName !== void 0 ? xName : xKey)}: ${xAxis.formatDatum(rangeMin)} - ${xAxis.formatDatum(rangeMax)}`;
        let content = yKey
            ? `<b>${sanitizeHtml(yName !== null && yName !== void 0 ? yName : yKey)} (${aggregation})</b>: ${yAxis.formatDatum(aggregatedValue)}<br>`
            : '';
        content += `<b>Frequency</b>: ${frequency}`;
        const defaults = {
            title,
            backgroundColor: color,
            content,
        };
        if (tooltipRenderer) {
            return toTooltipHtml(tooltipRenderer({
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
        return toTooltipHtml(defaults);
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
        const duration = 1000;
        const labelDuration = 200;
        let startingY = 0;
        datumSelections.forEach((datumSelection) => datumSelection.each((_, datum) => {
            startingY = Math.max(startingY, datum.height + datum.y);
        }));
        datumSelections.forEach((datumSelection) => {
            datumSelection.each((rect, datum) => {
                var _a;
                (_a = this.animationManager) === null || _a === void 0 ? void 0 : _a.animateMany(`${this.id}_empty-update-ready_${rect.id}`, [
                    { from: startingY, to: datum.y },
                    { from: 0, to: datum.height },
                ], {
                    disableInteractions: true,
                    duration,
                    ease: easing.easeOut,
                    repeat: 0,
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
                (_a = this.animationManager) === null || _a === void 0 ? void 0 : _a.animate(`${this.id}_empty-update-ready_${label.id}`, {
                    from: 0,
                    to: 1,
                    delay: duration,
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
        (_a = this.animationManager) === null || _a === void 0 ? void 0 : _a.stop();
        datumSelections.forEach((datumSelection) => {
            this.resetSelectionRects(datumSelection);
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
    Validate(OPT_COLOR_STRING)
], HistogramSeries.prototype, "fill", void 0);
__decorate([
    Validate(OPT_COLOR_STRING)
], HistogramSeries.prototype, "stroke", void 0);
__decorate([
    Validate(NUMBER(0, 1))
], HistogramSeries.prototype, "fillOpacity", void 0);
__decorate([
    Validate(NUMBER(0, 1))
], HistogramSeries.prototype, "strokeOpacity", void 0);
__decorate([
    Validate(OPT_LINE_DASH)
], HistogramSeries.prototype, "lineDash", void 0);
__decorate([
    Validate(NUMBER(0))
], HistogramSeries.prototype, "lineDashOffset", void 0);
__decorate([
    Validate(OPT_STRING)
], HistogramSeries.prototype, "xKey", void 0);
__decorate([
    Validate(BOOLEAN)
], HistogramSeries.prototype, "areaPlot", void 0);
__decorate([
    Validate(OPT_ARRAY())
], HistogramSeries.prototype, "bins", void 0);
__decorate([
    Validate(HISTOGRAM_AGGREGATION)
], HistogramSeries.prototype, "aggregation", void 0);
__decorate([
    Validate(OPT_NUMBER(0))
], HistogramSeries.prototype, "binCount", void 0);
__decorate([
    Validate(OPT_STRING)
], HistogramSeries.prototype, "xName", void 0);
__decorate([
    Validate(OPT_STRING)
], HistogramSeries.prototype, "yKey", void 0);
__decorate([
    Validate(OPT_STRING)
], HistogramSeries.prototype, "yName", void 0);
__decorate([
    Validate(NUMBER(0))
], HistogramSeries.prototype, "strokeWidth", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlzdG9ncmFtU2VyaWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L3Nlcmllcy9jYXJ0ZXNpYW4vaGlzdG9ncmFtU2VyaWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUNBLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUdqRCxPQUFPLEVBQ0gsYUFBYSxFQUNiLE1BQU0sRUFFTixrQkFBa0IsRUFDbEIsYUFBYSxFQUNiLFdBQVcsR0FDZCxNQUFNLFdBQVcsQ0FBQztBQUNuQixPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUVwRCxPQUFPLEVBQ0gsZUFBZSxFQUNmLDZCQUE2QixFQUU3QixtQ0FBbUMsR0FDdEMsTUFBTSxtQkFBbUIsQ0FBQztBQUMzQixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDdEQsT0FBTyxLQUFLLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUN0RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDdEQsT0FBTyxFQUNILE9BQU8sRUFDUCxNQUFNLEVBQ04sU0FBUyxFQUNULFlBQVksRUFDWixhQUFhLEVBQ2IsVUFBVSxFQUNWLGdCQUFnQixFQUNoQixRQUFRLEVBQ1Isb0JBQW9CLEVBQ3BCLFVBQVUsR0FDYixNQUFNLDBCQUEwQixDQUFDO0FBU2xDLE9BQU8sRUFFSCxTQUFTLEVBQ1QsZ0JBQWdCLEdBR25CLE1BQU0sc0JBQXNCLENBQUM7QUFDOUIsT0FBTyxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxNQUFNLCtCQUErQixD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