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
import { Rect } from '../../../scene/shape/rect.mjs';
import { BandScale } from '../../../scale/bandScale.mjs';
import { SeriesTooltip, SeriesNodePickMode, keyProperty, valueProperty, groupAccumulativeValueProperty, } from '../series.mjs';
import { Label } from '../../label.mjs';
import { PointerEvents } from '../../../scene/node.mjs';
import { CartesianSeries, CartesianSeriesNodeClickEvent, CartesianSeriesNodeDoubleClickEvent } from './cartesianSeries.mjs';
import { ChartAxisDirection } from '../../chartAxisDirection.mjs';
import { toTooltipHtml } from '../../tooltip/tooltip.mjs';
import { extent } from '../../../util/array.mjs';
import { sanitizeHtml } from '../../../util/sanitize.mjs';
import { ContinuousScale } from '../../../scale/continuousScale.mjs';
import { NUMBER, OPT_FUNCTION, OPT_LINE_DASH, OPT_NUMBER, Validate, OPTIONAL, OPT_STRING, OPT_COLOR_STRING, } from '../../../util/validation.mjs';
import { CategoryAxis } from '../../axis/categoryAxis.mjs';
import { GroupedCategoryAxis } from '../../axis/groupedCategoryAxis.mjs';
import { LogAxis } from '../../axis/logAxis.mjs';
import { normaliseGroupTo, SMALLEST_KEY_INTERVAL, diff } from '../../data/processors.mjs';
import * as easing from '../../../motion/easing.mjs';
import { createLabelData, getRectConfig, updateRect, checkCrisp, updateLabel } from './barUtil.mjs';
const BAR_LABEL_PLACEMENTS = ['inside', 'outside'];
const OPT_BAR_LABEL_PLACEMENT = (v, ctx) => OPTIONAL(v, ctx, (v) => BAR_LABEL_PLACEMENTS.includes(v));
var BarSeriesNodeTag;
(function (BarSeriesNodeTag) {
    BarSeriesNodeTag[BarSeriesNodeTag["Bar"] = 0] = "Bar";
    BarSeriesNodeTag[BarSeriesNodeTag["Label"] = 1] = "Label";
})(BarSeriesNodeTag || (BarSeriesNodeTag = {}));
class BarSeriesLabel extends Label {
    constructor() {
        super(...arguments);
        this.formatter = undefined;
        this.placement = 'inside';
    }
}
__decorate([
    Validate(OPT_FUNCTION)
], BarSeriesLabel.prototype, "formatter", void 0);
__decorate([
    Validate(OPT_BAR_LABEL_PLACEMENT)
], BarSeriesLabel.prototype, "placement", void 0);
class BarSeriesTooltip extends SeriesTooltip {
    constructor() {
        super(...arguments);
        this.renderer = undefined;
    }
}
__decorate([
    Validate(OPT_FUNCTION)
], BarSeriesTooltip.prototype, "renderer", void 0);
export class BarSeries extends CartesianSeries {
    constructor(moduleCtx) {
        super({
            moduleCtx,
            pickModes: [SeriesNodePickMode.EXACT_SHAPE_MATCH],
            pathsPerSeries: 0,
            hasHighlightedLabels: true,
        });
        this.label = new BarSeriesLabel();
        this.tooltip = new BarSeriesTooltip();
        this.fill = '#c16068';
        this.stroke = '#874349';
        this.fillOpacity = 1;
        this.strokeOpacity = 1;
        this.lineDash = [0];
        this.lineDashOffset = 0;
        this.formatter = undefined;
        this.xKey = undefined;
        this.xName = undefined;
        this.yKey = undefined;
        this.yName = undefined;
        /**
         * Used to get the position of bars within each group.
         */
        this.groupScale = new BandScale();
        this.stackGroup = undefined;
        this.strokeWidth = 1;
        this.shadow = undefined;
        this.smallestDataInterval = undefined;
        this.datumSelectionGarbageCollection = false;
        this.label.enabled = false;
    }
    resolveKeyDirection(direction) {
        if (this.getBarDirection() === ChartAxisDirection.X) {
            if (direction === ChartAxisDirection.X) {
                return ChartAxisDirection.Y;
            }
            return ChartAxisDirection.X;
        }
        return direction;
    }
    processData(dataController) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
            const { xKey, yKey, normalizedTo, seriesGrouping: { groupIndex = this.id } = {}, data = [] } = this;
            const normalizedToAbs = Math.abs(normalizedTo !== null && normalizedTo !== void 0 ? normalizedTo : NaN);
            const isContinuousX = ((_a = this.getCategoryAxis()) === null || _a === void 0 ? void 0 : _a.scale) instanceof ContinuousScale;
            const isContinuousY = ((_b = this.getValueAxis()) === null || _b === void 0 ? void 0 : _b.scale) instanceof ContinuousScale;
            const stackGroupName = `bar-stack-${groupIndex}-yValues`;
            const stackGroupTrailingName = `${stackGroupName}-trailing`;
            const normaliseTo = normalizedToAbs && isFinite(normalizedToAbs) ? normalizedToAbs : undefined;
            const extraProps = [];
            if (normaliseTo) {
                extraProps.push(normaliseGroupTo(this, [stackGroupName, stackGroupTrailingName], normaliseTo, 'range'));
            }
            if (!((_c = this.ctx.animationManager) === null || _c === void 0 ? void 0 : _c.skipAnimations) && this.processedData) {
                extraProps.push(diff(this.processedData));
            }
            const { dataModel, processedData } = yield dataController.request(this.id, data, {
                props: [
                    keyProperty(this, xKey, isContinuousX, { id: 'xValue' }),
                    valueProperty(this, yKey, isContinuousY, { id: `yValue-raw`, invalidValue: null }),
                    ...groupAccumulativeValueProperty(this, yKey, isContinuousY, 'normal', 'current', {
                        id: `yValue-end`,
                        invalidValue: null,
                        groupId: stackGroupName,
                    }),
                    ...groupAccumulativeValueProperty(this, yKey, isContinuousY, 'trailing', 'current', {
                        id: `yValue-start`,
                        invalidValue: null,
                        groupId: stackGroupTrailingName,
                    }),
                    ...(isContinuousX ? [SMALLEST_KEY_INTERVAL] : []),
                    ...extraProps,
                ],
                groupByKeys: true,
                dataVisible: this.visible,
            });
            this.dataModel = dataModel;
            this.processedData = processedData;
            this.smallestDataInterval = {
                x: (_e = (_d = processedData.reduced) === null || _d === void 0 ? void 0 : _d[SMALLEST_KEY_INTERVAL.property]) !== null && _e !== void 0 ? _e : Infinity,
                y: Infinity,
            };
            this.animationState.transition('updateData');
        });
    }
    getDomain(direction) {
        var _a;
        const { processedData, dataModel } = this;
        if (!processedData || !dataModel)
            return [];
        const { reduced: { [SMALLEST_KEY_INTERVAL.property]: smallestX } = {} } = processedData;
        const categoryAxis = this.getCategoryAxis();
        const valueAxis = this.getValueAxis();
        const keyDef = dataModel.resolveProcessedDataDefById(this, `xValue`);
        const keys = dataModel.getDomain(this, `xValue`, 'key', processedData);
        const yExtent = dataModel.getDomain(this, `yValue-end`, 'value', processedData);
        if (direction === this.getCategoryDirection()) {
            if ((keyDef === null || keyDef === void 0 ? void 0 : keyDef.def.type) === 'key' && (keyDef === null || keyDef === void 0 ? void 0 : keyDef.def.valueType) === 'category') {
                return keys;
            }
            const scalePadding = isFinite(smallestX) ? smallestX : 0;
            const keysExtent = (_a = extent(keys)) !== null && _a !== void 0 ? _a : [NaN, NaN];
            if (direction === ChartAxisDirection.Y) {
                return this.fixNumericExtent([keysExtent[0] + -scalePadding, keysExtent[1]], categoryAxis);
            }
            return this.fixNumericExtent([keysExtent[0], keysExtent[1] + scalePadding], categoryAxis);
        }
        else if (this.getValueAxis() instanceof LogAxis) {
            return this.fixNumericExtent(yExtent, valueAxis);
        }
        else {
            const fixedYExtent = [yExtent[0] > 0 ? 0 : yExtent[0], yExtent[1] < 0 ? 0 : yExtent[1]];
            return this.fixNumericExtent(fixedYExtent, valueAxis);
        }
    }
    getNodeClickEvent(event, datum) {
        var _a;
        return new CartesianSeriesNodeClickEvent((_a = this.xKey) !== null && _a !== void 0 ? _a : '', datum.yKey, event, datum, this);
    }
    getNodeDoubleClickEvent(event, datum) {
        var _a;
        return new CartesianSeriesNodeDoubleClickEvent((_a = this.xKey) !== null && _a !== void 0 ? _a : '', datum.yKey, event, datum, this);
    }
    getCategoryAxis() {
        const direction = this.getCategoryDirection();
        return this.axes[direction];
    }
    getValueAxis() {
        const direction = this.getBarDirection();
        return this.axes[direction];
    }
    calculateStep(range) {
        var _a;
        const { smallestDataInterval: smallestInterval } = this;
        const xAxis = this.getCategoryAxis();
        if (!xAxis) {
            return;
        }
        // calculate step
        const domainLength = xAxis.dataDomain[1] - xAxis.dataDomain[0];
        const intervals = domainLength / ((_a = smallestInterval === null || smallestInterval === void 0 ? void 0 : smallestInterval.x) !== null && _a !== void 0 ? _a : 1) + 1;
        // The number of intervals/bands is used to determine the width of individual bands by dividing the available range.
        // Allow a maximum number of bands to ensure the step does not fall below 1 pixel.
        // This means there could be some overlap of the bands in the chart.
        const maxBands = Math.floor(range); // A minimum of 1px per bar/column means the maximum number of bands will equal the available range
        const bands = Math.min(intervals, maxBands);
        const step = range / Math.max(1, bands);
        return step;
    }
    createNodeData() {
        return __awaiter(this, void 0, void 0, function* () {
            const { visible, dataModel } = this;
            const xAxis = this.getCategoryAxis();
            const yAxis = this.getValueAxis();
            if (!(dataModel && visible && xAxis && yAxis)) {
                return [];
            }
            const xScale = xAxis.scale;
            const yScale = yAxis.scale;
            const { groupScale, yKey = '', xKey = '', fill, stroke, strokeWidth, label, id: seriesId, processedData, ctx, ctx: { seriesStateManager }, } = this;
            let xBandWidth = xScale.bandwidth;
            if (xScale instanceof ContinuousScale) {
                const availableRange = Math.max(xAxis.range[0], xAxis.range[1]);
                const step = this.calculateStep(availableRange);
                xBandWidth = step;
            }
            const domain = [];
            const { index: groupIndex, visibleGroupCount } = seriesStateManager.getVisiblePeerGroupIndex(this);
            for (let groupIdx = 0; groupIdx < visibleGroupCount; groupIdx++) {
                domain.push(String(groupIdx));
            }
            groupScale.domain = domain;
            groupScale.range = [0, xBandWidth !== null && xBandWidth !== void 0 ? xBandWidth : 0];
            if (xAxis instanceof CategoryAxis) {
                groupScale.padding = xAxis.groupPaddingInner;
            }
            else if (xAxis instanceof GroupedCategoryAxis) {
                groupScale.padding = 0.1;
            }
            else {
                // Number or Time axis
                groupScale.padding = 0;
            }
            // To get exactly `0` padding we need to turn off rounding
            if (groupScale.padding === 0) {
                groupScale.round = false;
            }
            else {
                groupScale.round = true;
            }
            const barWidth = groupScale.bandwidth >= 1
                ? // Pixel-rounded value for low-volume bar charts.
                    groupScale.bandwidth
                : // Handle high-volume bar charts gracefully.
                    groupScale.rawBandwidth;
            const xIndex = dataModel.resolveProcessedDataIndexById(this, `xValue`, 'key').index;
            const yRawIndex = dataModel.resolveProcessedDataIndexById(this, `yValue-raw`).index;
            const yStartIndex = dataModel.resolveProcessedDataIndexById(this, `yValue-start`).index;
            const yEndIndex = dataModel.resolveProcessedDataIndexById(this, `yValue-end`).index;
            const context = {
                itemId: yKey,
                nodeData: [],
                labelData: [],
            };
            processedData === null || processedData === void 0 ? void 0 : processedData.data.forEach(({ keys, datum: seriesDatum, values }, dataIndex) => {
                const xValue = keys[xIndex];
                const x = xScale.convert(xValue);
                const currY = +values[0][yEndIndex];
                const prevY = +values[0][yStartIndex];
                const yRawValue = values[0][yRawIndex];
                const barX = x + groupScale.convert(String(groupIndex));
                // Bars outside of visible range are not rendered, so we create node data
                // only for the visible subset of user data.
                if (!xAxis.inRange(barX, barWidth)) {
                    return;
                }
                if (isNaN(currY)) {
                    return;
                }
                const y = yScale.convert(currY, { strict: false });
                const bottomY = yScale.convert(prevY, { strict: false });
                const barAlongX = this.getBarDirection() === ChartAxisDirection.X;
                const rect = {
                    x: barAlongX ? Math.min(y, bottomY) : barX,
                    y: barAlongX ? barX : Math.min(y, bottomY),
                    width: barAlongX ? Math.abs(bottomY - y) : barWidth,
                    height: barAlongX ? barWidth : Math.abs(bottomY - y),
                };
                const nodeMidPoint = {
                    x: rect.x + rect.width / 2,
                    y: rect.y + rect.height / 2,
                };
                const { fontStyle: labelFontStyle, fontWeight: labelFontWeight, fontSize: labelFontSize, fontFamily: labelFontFamily, color: labelColor, formatter, placement, } = label;
                const { text: labelText, textAlign: labelTextAlign, textBaseline: labelTextBaseline, x: labelX, y: labelY, } = createLabelData({ value: yRawValue, rect, formatter, placement, seriesId, barAlongX, ctx });
                const nodeData = {
                    index: dataIndex,
                    series: this,
                    itemId: yKey,
                    datum: seriesDatum[0],
                    cumulativeValue: prevY + currY,
                    xValue,
                    yValue: yRawValue,
                    yKey,
                    xKey,
                    x: rect.x,
                    y: rect.y,
                    width: rect.width,
                    height: rect.height,
                    nodeMidPoint,
                    fill,
                    stroke,
                    strokeWidth,
                    label: labelText
                        ? {
                            text: labelText,
                            fontStyle: labelFontStyle,
                            fontWeight: labelFontWeight,
                            fontSize: labelFontSize,
                            fontFamily: labelFontFamily,
                            textAlign: labelTextAlign,
                            textBaseline: labelTextBaseline,
                            fill: labelColor,
                            x: labelX,
                            y: labelY,
                        }
                        : undefined,
                };
                context.nodeData.push(nodeData);
                context.labelData.push(nodeData);
            });
            return [context];
        });
    }
    nodeFactory() {
        return new Rect();
    }
    updateDatumSelection(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nodeData, datumSelection } = opts;
            const getDatumId = (datum) => datum.xValue;
            return datumSelection.update(nodeData, (rect) => (rect.tag = BarSeriesNodeTag.Bar), getDatumId);
        });
    }
    updateDatumNodes(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const { datumSelection, isHighlight } = opts;
            const { fill, stroke, fillOpacity, strokeOpacity, lineDash, lineDashOffset, shadow, formatter, id: seriesId, highlightStyle: { item: itemHighlightStyle }, ctx, stackGroup, } = this;
            const xAxis = this.axes[ChartAxisDirection.X];
            const crisp = checkCrisp(xAxis === null || xAxis === void 0 ? void 0 : xAxis.visibleRange);
            const categoryAlongX = this.getCategoryDirection() === ChartAxisDirection.X;
            datumSelection.each((rect, datum) => {
                const style = {
                    fill,
                    stroke,
                    fillOpacity,
                    strokeOpacity,
                    lineDash,
                    lineDashOffset,
                    fillShadow: shadow,
                    strokeWidth: this.getStrokeWidth(this.strokeWidth, datum),
                };
                const visible = categoryAlongX ? datum.width > 0 : datum.height > 0;
                const config = getRectConfig({
                    datum,
                    isHighlighted: isHighlight,
                    style,
                    highlightStyle: itemHighlightStyle,
                    formatter,
                    seriesId,
                    stackGroup,
                    ctx,
                });
                config.crisp = crisp;
                config.visible = visible;
                updateRect({ rect, config });
            });
        });
    }
    updateLabelSelection(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const { labelData, labelSelection } = opts;
            const { enabled } = this.label;
            const data = enabled ? labelData : [];
            return labelSelection.update(data, (text) => {
                text.tag = BarSeriesNodeTag.Label;
                text.pointerEvents = PointerEvents.None;
            });
        });
    }
    updateLabelNodes(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const { labelSelection } = opts;
            labelSelection.each((text, datum) => {
                const labelDatum = datum.label;
                updateLabel({ labelNode: text, labelDatum, config: this.label, visible: true });
            });
        });
    }
    getTooltipHtml(nodeDatum) {
        var _a;
        const { xKey, yKey, processedData, ctx: { callbackCache }, } = this;
        const xAxis = this.getCategoryAxis();
        const yAxis = this.getValueAxis();
        const { xValue, yValue, datum } = nodeDatum;
        if (!processedData || !xKey || !yKey || !xAxis || !yAxis) {
            return '';
        }
        const { xName, yName, fill, stroke, tooltip, formatter, id: seriesId, stackGroup } = this;
        const { renderer: tooltipRenderer } = tooltip;
        const strokeWidth = this.getStrokeWidth(this.strokeWidth);
        const xString = sanitizeHtml(xAxis.formatDatum(xValue));
        const yString = sanitizeHtml(yAxis.formatDatum(yValue));
        const title = sanitizeHtml(yName);
        const content = xString + ': ' + yString;
        let format = undefined;
        if (formatter) {
            format = callbackCache.call(formatter, {
                datum,
                fill,
                stroke,
                strokeWidth,
                highlighted: false,
                xKey,
                yKey,
                seriesId,
                stackGroup,
            });
        }
        const color = (_a = format === null || format === void 0 ? void 0 : format.fill) !== null && _a !== void 0 ? _a : fill;
        const defaults = {
            title,
            backgroundColor: color,
            content,
        };
        if (tooltipRenderer) {
            return toTooltipHtml(tooltipRenderer({
                datum,
                xKey,
                xValue,
                xName,
                yKey,
                yValue,
                yName,
                color,
                title,
                seriesId,
                stackGroup,
            }), defaults);
        }
        return toTooltipHtml(defaults);
    }
    getLegendData() {
        var _a;
        const { id, data, xKey, yKey, yName, legendItemName, fill, stroke, fillOpacity, strokeOpacity, visible, showInLegend, } = this;
        if (!showInLegend || !(data === null || data === void 0 ? void 0 : data.length) || !xKey || !yKey) {
            return [];
        }
        const legendData = [];
        legendData.push({
            legendType: 'category',
            id,
            itemId: yKey,
            seriesId: id,
            enabled: visible,
            label: {
                text: (_a = legendItemName !== null && legendItemName !== void 0 ? legendItemName : yName) !== null && _a !== void 0 ? _a : yKey,
            },
            legendItemName,
            marker: {
                fill,
                stroke,
                fillOpacity: fillOpacity,
                strokeOpacity: strokeOpacity,
            },
        });
        return legendData;
    }
    animateEmptyUpdateReady({ datumSelections, labelSelections, }) {
        var _a, _b;
        const duration = (_b = (_a = this.ctx.animationManager) === null || _a === void 0 ? void 0 : _a.defaultOptions.duration) !== null && _b !== void 0 ? _b : 1000;
        const labelDuration = 200;
        const { startingX, startingY } = this.getDirectionStartingValues(datumSelections);
        datumSelections.forEach((datumSelection) => {
            datumSelection.each((rect, datum) => {
                var _a;
                let contextX = startingX;
                let contextWidth = 0;
                let contextY = datum.y;
                let contextHeight = datum.height;
                if (this.getBarDirection() === ChartAxisDirection.Y) {
                    contextX = datum.x;
                    contextWidth = datum.width;
                    contextY = startingY;
                    contextHeight = 0;
                }
                const props = [
                    { from: contextX, to: datum.x },
                    { from: contextWidth, to: datum.width },
                    { from: contextY, to: datum.y },
                    { from: contextHeight, to: datum.height },
                ];
                (_a = this.ctx.animationManager) === null || _a === void 0 ? void 0 : _a.animateMany(`${this.id}_empty-update-ready_${rect.id}`, props, {
                    duration,
                    ease: easing.easeOut,
                    onUpdate([x, width, y, height]) {
                        rect.x = x;
                        rect.width = width;
                        rect.y = y;
                        rect.height = height;
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
        var _a, _b, _c, _d, _e;
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
        if (diff.added.length > 0 || diff.removed.length > 0) {
            sectionDuration = Math.floor(totalDuration / 2);
        }
        const { startingX, startingY } = this.getDirectionStartingValues(datumSelections);
        const datumIdKey = (_e = (_d = this.processedData) === null || _d === void 0 ? void 0 : _d.defs.keys) === null || _e === void 0 ? void 0 : _e[0];
        const addedIds = {};
        diff.added.forEach((d) => {
            addedIds[d[0]] = true;
        });
        const removedIds = {};
        diff.removed.forEach((d) => {
            removedIds[d[0]] = true;
        });
        const rectThrottleGroup = `${this.id}_${Math.random()}`;
        const labelThrottleGroup = `${this.id}_${Math.random()}`;
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
                let duration = sectionDuration;
                let cleanup = false;
                const datumId = datumIdKey ? datum.xValue : '';
                let contextX = startingX;
                let contextWidth = 0;
                let contextY = datum.y;
                let contextHeight = datum.height;
                if (this.getBarDirection() === ChartAxisDirection.Y) {
                    contextX = datum.x;
                    contextWidth = datum.width;
                    contextY = startingY;
                    contextHeight = 0;
                }
                const isAdded = datumId !== undefined && addedIds[datumId] !== undefined;
                const isRemoved = datumId !== undefined && removedIds[datumId] !== undefined;
                if (isAdded) {
                    props = [
                        { from: contextX, to: datum.x },
                        { from: contextWidth, to: datum.width },
                        { from: contextY, to: datum.y },
                        { from: contextHeight, to: datum.height },
                    ];
                    duration = sectionDuration;
                }
                else if (isRemoved) {
                    props = [
                        { from: datum.x, to: contextX },
                        { from: datum.width, to: contextWidth },
                        { from: datum.y, to: contextY },
                        { from: datum.height, to: contextHeight },
                    ];
                    delay = 0;
                    duration = sectionDuration;
                    cleanup = true;
                }
                (_a = this.ctx.animationManager) === null || _a === void 0 ? void 0 : _a.animateManyWithThrottle(`${this.id}_waiting-update-ready_${rect.id}`, props, {
                    delay,
                    duration,
                    ease: easing.easeOut,
                    throttleId: `${this.id}_rects`,
                    throttleGroup: rectThrottleGroup,
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
                (_a = this.ctx.animationManager) === null || _a === void 0 ? void 0 : _a.animateWithThrottle(`${this.id}_waiting-update-ready_${label.id}`, {
                    from: 0,
                    to: 1,
                    delay: totalDuration,
                    duration: labelDuration,
                    throttleId: `${this.id}_labels`,
                    throttleGroup: labelThrottleGroup,
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
        selection.cleanup();
    }
    getDirectionStartingValues(datumSelections) {
        const isColumnSeries = this.getBarDirection() === ChartAxisDirection.Y;
        const xAxis = this.axes[ChartAxisDirection.X];
        const yAxis = this.axes[ChartAxisDirection.Y];
        const isContinuousX = (xAxis === null || xAxis === void 0 ? void 0 : xAxis.scale) instanceof ContinuousScale;
        const isContinuousY = (yAxis === null || yAxis === void 0 ? void 0 : yAxis.scale) instanceof ContinuousScale;
        let startingX = Infinity;
        let startingY = 0;
        if (yAxis && isColumnSeries) {
            if (isContinuousY) {
                startingY = yAxis.scale.convert(0);
            }
            else {
                datumSelections.forEach((datumSelection) => datumSelection.each((_, datum) => {
                    if (datum.yValue >= 0) {
                        startingY = Math.max(startingY, datum.height + datum.y);
                    }
                }));
            }
        }
        if (xAxis && !isColumnSeries) {
            if (isContinuousX) {
                startingX = xAxis.scale.convert(0);
            }
            else {
                datumSelections.forEach((datumSelection) => datumSelection.each((_, datum) => {
                    if (datum.yValue >= 0) {
                        startingX = Math.min(startingX, datum.x);
                    }
                }));
            }
        }
        return { startingX, startingY };
    }
    isLabelEnabled() {
        return this.label.enabled;
    }
    getBandScalePadding() {
        return { inner: 0.2, outer: 0.3 };
    }
    getBarDirection() {
        return ChartAxisDirection.X;
    }
    getCategoryDirection() {
        return ChartAxisDirection.Y;
    }
}
BarSeries.className = 'BarSeries';
BarSeries.type = 'bar';
__decorate([
    Validate(OPT_COLOR_STRING)
], BarSeries.prototype, "fill", void 0);
__decorate([
    Validate(OPT_COLOR_STRING)
], BarSeries.prototype, "stroke", void 0);
__decorate([
    Validate(NUMBER(0, 1))
], BarSeries.prototype, "fillOpacity", void 0);
__decorate([
    Validate(NUMBER(0, 1))
], BarSeries.prototype, "strokeOpacity", void 0);
__decorate([
    Validate(OPT_LINE_DASH)
], BarSeries.prototype, "lineDash", void 0);
__decorate([
    Validate(NUMBER(0))
], BarSeries.prototype, "lineDashOffset", void 0);
__decorate([
    Validate(OPT_FUNCTION)
], BarSeries.prototype, "formatter", void 0);
__decorate([
    Validate(OPT_STRING)
], BarSeries.prototype, "xKey", void 0);
__decorate([
    Validate(OPT_STRING)
], BarSeries.prototype, "xName", void 0);
__decorate([
    Validate(OPT_STRING)
], BarSeries.prototype, "yKey", void 0);
__decorate([
    Validate(OPT_STRING)
], BarSeries.prototype, "yName", void 0);
__decorate([
    Validate(OPT_STRING)
], BarSeries.prototype, "stackGroup", void 0);
__decorate([
    Validate(OPT_NUMBER())
], BarSeries.prototype, "normalizedTo", void 0);
__decorate([
    Validate(NUMBER(0))
], BarSeries.prototype, "strokeWidth", void 0);
export class ColumnSeries extends BarSeries {
    getBarDirection() {
        return ChartAxisDirection.Y;
    }
    getCategoryDirection() {
        return ChartAxisDirection.X;
    }
}
ColumnSeries.type = 'column';
ColumnSeries.className = 'ColumnSeries';
