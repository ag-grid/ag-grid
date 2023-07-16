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
import { PointerEvents } from '../../../scene/node.mjs';
import { SeriesTooltip, keyProperty, valueProperty, groupAccumulativeValueProperty } from '../series.mjs';
import { CartesianSeries, CartesianSeriesMarker, CartesianSeriesNodeClickEvent, CartesianSeriesNodeDoubleClickEvent, } from './cartesianSeries.mjs';
import { ChartAxisDirection } from '../../chartAxisDirection.mjs';
import { getMarker } from '../../marker/util.mjs';
import { toTooltipHtml } from '../../tooltip/tooltip.mjs';
import { extent } from '../../../util/array.mjs';
import { interpolate } from '../../../util/string.mjs';
import { Label } from '../../label.mjs';
import { sanitizeHtml } from '../../../util/sanitize.mjs';
import { isContinuous, isNumber } from '../../../util/value.mjs';
import { ContinuousScale } from '../../../scale/continuousScale.mjs';
import { NUMBER, OPT_FUNCTION, OPT_LINE_DASH, OPT_STRING, Validate, OPT_NUMBER, COLOR_STRING, } from '../../../util/validation.mjs';
import { LogAxis } from '../../axis/logAxis.mjs';
import { TimeAxis } from '../../axis/timeAxis.mjs';
import { normaliseGroupTo } from '../../data/processors.mjs';
class AreaSeriesLabel extends Label {
    constructor() {
        super(...arguments);
        this.formatter = undefined;
    }
}
__decorate([
    Validate(OPT_FUNCTION)
], AreaSeriesLabel.prototype, "formatter", void 0);
class AreaSeriesTooltip extends SeriesTooltip {
    constructor() {
        super(...arguments);
        this.renderer = undefined;
        this.format = undefined;
    }
}
__decorate([
    Validate(OPT_FUNCTION)
], AreaSeriesTooltip.prototype, "renderer", void 0);
__decorate([
    Validate(OPT_STRING)
], AreaSeriesTooltip.prototype, "format", void 0);
var AreaSeriesTag;
(function (AreaSeriesTag) {
    AreaSeriesTag[AreaSeriesTag["Fill"] = 0] = "Fill";
    AreaSeriesTag[AreaSeriesTag["Stroke"] = 1] = "Stroke";
    AreaSeriesTag[AreaSeriesTag["Marker"] = 2] = "Marker";
    AreaSeriesTag[AreaSeriesTag["Label"] = 3] = "Label";
})(AreaSeriesTag || (AreaSeriesTag = {}));
export class AreaSeries extends CartesianSeries {
    constructor(moduleCtx) {
        super({
            moduleCtx,
            pathsPerSeries: 2,
            pathsZIndexSubOrderOffset: [0, 1000],
            hasMarkers: true,
        });
        this.tooltip = new AreaSeriesTooltip();
        this.marker = new CartesianSeriesMarker();
        this.label = new AreaSeriesLabel();
        this.fill = '#c16068';
        this.stroke = '#874349';
        this.fillOpacity = 1;
        this.strokeOpacity = 1;
        this.lineDash = [0];
        this.lineDashOffset = 0;
        this.xKey = undefined;
        this.xName = undefined;
        this.strokeWidth = 2;
        this.shadow = undefined;
        const { marker, label } = this;
        marker.enabled = false;
        label.enabled = false;
    }
    processData(dataController) {
        return __awaiter(this, void 0, void 0, function* () {
            const { xKey, yKey, axes, normalizedTo, data, visible, seriesGrouping: { groupIndex = this.id } = {} } = this;
            if (!xKey || !yKey || !data)
                return;
            const xAxis = axes[ChartAxisDirection.X];
            const yAxis = axes[ChartAxisDirection.Y];
            const isContinuousX = (xAxis === null || xAxis === void 0 ? void 0 : xAxis.scale) instanceof ContinuousScale;
            const isContinuousY = (yAxis === null || yAxis === void 0 ? void 0 : yAxis.scale) instanceof ContinuousScale;
            const ids = [
                `area-stack-${groupIndex}-yValues`,
                `area-stack-${groupIndex}-yValues-trailing`,
                `area-stack-${groupIndex}-yValues-prev`,
                `area-stack-${groupIndex}-yValues-trailing-prev`,
                `area-stack-${groupIndex}-yValues-marker`,
            ];
            const extraProps = [];
            const normaliseTo = normalizedTo && isFinite(normalizedTo) ? normalizedTo : undefined;
            if (normaliseTo) {
                extraProps.push(normaliseGroupTo(this, [ids[0], ids[1], ids[4]], normaliseTo, 'range'));
                extraProps.push(normaliseGroupTo(this, [ids[2], ids[3]], normaliseTo, 'range'));
            }
            const { dataModel, processedData } = yield dataController.request(this.id, data, {
                props: [
                    keyProperty(this, xKey, isContinuousX, { id: 'xValue' }),
                    valueProperty(this, yKey, isContinuousY, { id: `yValue-raw`, invalidValue: null }),
                    ...groupAccumulativeValueProperty(this, yKey, isContinuousY, 'window', 'current', {
                        id: `yValue-end`,
                        invalidValue: null,
                        groupId: ids[0],
                    }),
                    ...groupAccumulativeValueProperty(this, yKey, isContinuousY, 'window-trailing', 'current', {
                        id: `yValue-start`,
                        invalidValue: null,
                        groupId: ids[1],
                    }),
                    ...groupAccumulativeValueProperty(this, yKey, isContinuousY, 'window', 'last', {
                        id: `yValue-previous-end`,
                        invalidValue: null,
                        groupId: ids[2],
                    }),
                    ...groupAccumulativeValueProperty(this, yKey, isContinuousY, 'window-trailing', 'last', {
                        id: `yValue-previous-start`,
                        invalidValue: null,
                        groupId: ids[3],
                    }),
                    ...groupAccumulativeValueProperty(this, yKey, isContinuousY, 'normal', 'current', {
                        id: `yValue-cumulative`,
                        invalidValue: null,
                        groupId: ids[4],
                    }),
                    ...extraProps,
                ],
                groupByKeys: true,
                dataVisible: visible,
            });
            this.dataModel = dataModel;
            this.processedData = processedData;
        });
    }
    getDomain(direction) {
        const { processedData, dataModel, axes } = this;
        if (!processedData || !dataModel)
            return [];
        const xAxis = axes[ChartAxisDirection.X];
        const yAxis = axes[ChartAxisDirection.Y];
        const keyDef = dataModel.resolveProcessedDataDefById(this, `xValue`);
        const keys = dataModel.getDomain(this, `xValue`, 'key', processedData);
        const yExtent = dataModel.getDomain(this, /yValue-(previous-)?end/, 'value', processedData);
        if (direction === ChartAxisDirection.X) {
            if ((keyDef === null || keyDef === void 0 ? void 0 : keyDef.def.type) === 'key' && keyDef.def.valueType === 'category') {
                return keys;
            }
            return this.fixNumericExtent(extent(keys), xAxis);
        }
        else if (yAxis instanceof LogAxis || yAxis instanceof TimeAxis) {
            return this.fixNumericExtent(yExtent, yAxis);
        }
        else {
            const fixedYExtent = [yExtent[0] > 0 ? 0 : yExtent[0], yExtent[1] < 0 ? 0 : yExtent[1]];
            return this.fixNumericExtent(fixedYExtent, yAxis);
        }
    }
    createNodeData() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { axes, data, processedData: { data: groupedData } = {}, dataModel, ctx: { callbackCache }, } = this;
            const xAxis = axes[ChartAxisDirection.X];
            const yAxis = axes[ChartAxisDirection.Y];
            if (!xAxis || !yAxis || !data || !dataModel) {
                return [];
            }
            const { yKey = '', xKey = '', marker, label, fill, stroke, id: seriesId } = this;
            const { scale: xScale } = xAxis;
            const { scale: yScale } = yAxis;
            const continuousY = yScale instanceof ContinuousScale;
            const xOffset = ((_a = xScale.bandwidth) !== null && _a !== void 0 ? _a : 0) / 2;
            const yStartIndex = dataModel.resolveProcessedDataIndexById(this, `yValue-start`).index;
            const yEndIndex = dataModel.resolveProcessedDataIndexById(this, `yValue-end`).index;
            const yRawIndex = dataModel.resolveProcessedDataIndexById(this, `yValue-raw`).index;
            const yPreviousStartIndex = dataModel.resolveProcessedDataIndexById(this, `yValue-previous-start`).index;
            const yPreviousEndIndex = dataModel.resolveProcessedDataIndexById(this, `yValue-previous-end`).index;
            const yCumulativeIndex = dataModel.resolveProcessedDataIndexById(this, `yValue-cumulative`).index;
            const createPathCoordinates = (xDatum, lastYEnd, yEnd) => {
                const x = xScale.convert(xDatum) + xOffset;
                const prevYCoordinate = yScale.convert(lastYEnd, { strict: false });
                const currYCoordinate = yScale.convert(yEnd, { strict: false });
                return [
                    { x, y: currYCoordinate, size: marker.size },
                    { x, y: prevYCoordinate, size: marker.size },
                ];
            };
            const createMarkerCoordinate = (xDatum, yEnd, rawYDatum) => {
                let currY;
                // if not normalized, the invalid data points will be processed as `undefined` in processData()
                // if normalized, the invalid data points will be processed as 0 rather than `undefined`
                // check if unprocessed datum is valid as we only want to show markers for valid points
                const normalized = this.normalizedTo && isFinite(this.normalizedTo);
                const normalizedAndValid = normalized && continuousY && isContinuous(rawYDatum);
                const valid = (!normalized && !isNaN(rawYDatum)) || normalizedAndValid;
                if (valid) {
                    currY = yEnd;
                }
                const x = xScale.convert(xDatum) + xOffset;
                const y = yScale.convert(currY, { strict: false });
                return { x, y, size: marker.size };
            };
            const labelSelectionData = [];
            const markerSelectionData = [];
            const strokeSelectionData = { itemId: yKey, points: [], yValues: [] };
            const fillSelectionData = { itemId: yKey, points: [] };
            const context = {
                itemId: yKey,
                fillSelectionData,
                labelData: labelSelectionData,
                nodeData: markerSelectionData,
                strokeSelectionData,
            };
            const fillPoints = fillSelectionData.points;
            const fillPhantomPoints = [];
            const strokePoints = strokeSelectionData.points;
            const yValues = strokeSelectionData.yValues;
            let datumIdx = -1;
            let lastXDatum;
            groupedData === null || groupedData === void 0 ? void 0 : groupedData.forEach((datumGroup) => {
                const { keys: [xDatum], datum: datumArray, values: valuesArray, } = datumGroup;
                valuesArray.forEach((values, valueIdx) => {
                    var _a;
                    datumIdx++;
                    const seriesDatum = datumArray[valueIdx];
                    const yRawDatum = values[yRawIndex];
                    const yStart = values[yStartIndex];
                    const yEnd = values[yEndIndex];
                    const yPreviousStart = values[yPreviousStartIndex];
                    const yPreviousEnd = values[yPreviousEndIndex];
                    const yCumulative = values[yCumulativeIndex];
                    const validPoint = yRawDatum != null;
                    // marker data
                    const point = createMarkerCoordinate(xDatum, +yCumulative, yRawDatum);
                    if (validPoint && marker) {
                        markerSelectionData.push({
                            index: datumIdx,
                            series: this,
                            itemId: yKey,
                            datum: seriesDatum,
                            nodeMidPoint: { x: point.x, y: point.y },
                            cumulativeValue: yEnd,
                            yValue: yRawDatum,
                            xValue: xDatum,
                            yKey,
                            xKey,
                            point,
                            fill,
                            stroke,
                        });
                    }
                    // label data
                    if (validPoint && label) {
                        let labelText;
                        if (label.formatter) {
                            labelText = (_a = callbackCache.call(label.formatter, { value: yRawDatum, seriesId })) !== null && _a !== void 0 ? _a : '';
                        }
                        else {
                            labelText = isNumber(yRawDatum) ? Number(yRawDatum).toFixed(2) : String(yRawDatum);
                        }
                        labelSelectionData.push({
                            index: datumIdx,
                            itemId: yKey,
                            point,
                            label: labelText
                                ? {
                                    text: labelText,
                                    fontStyle: label.fontStyle,
                                    fontWeight: label.fontWeight,
                                    fontSize: label.fontSize,
                                    fontFamily: label.fontFamily,
                                    textAlign: 'center',
                                    textBaseline: 'bottom',
                                    fill: label.color,
                                }
                                : undefined,
                        });
                    }
                    // fill data
                    // Handle data in pairs of current and next x and y values
                    const windowX = [lastXDatum, xDatum];
                    const windowYStart = [yPreviousStart, yStart];
                    const windowYEnd = [yPreviousEnd, yEnd];
                    if (windowX.some((v) => v == undefined)) {
                        lastXDatum = xDatum;
                        return;
                    }
                    if (windowYStart.some((v) => v == undefined)) {
                        windowYStart[0] = 0;
                        windowYStart[1] = 0;
                    }
                    if (windowYEnd.some((v) => v == undefined)) {
                        windowYEnd[0] = 0;
                        windowYEnd[1] = 0;
                    }
                    const prevCoordinates = createPathCoordinates(lastXDatum, +windowYStart[0], +windowYEnd[0]);
                    fillPoints.push(prevCoordinates[0]);
                    fillPhantomPoints.push(prevCoordinates[1]);
                    const nextCoordinates = createPathCoordinates(xDatum, +windowYStart[1], +windowYEnd[1]);
                    fillPoints.push(nextCoordinates[0]);
                    fillPhantomPoints.push(nextCoordinates[1]);
                    // stroke data
                    strokePoints.push({ x: NaN, y: NaN }); // moveTo
                    yValues.push(undefined);
                    if (yPreviousEnd != null) {
                        strokePoints.push(prevCoordinates[0]);
                        yValues.push(yPreviousEnd);
                    }
                    if (yEnd != undefined) {
                        strokePoints.push(nextCoordinates[0]);
                        yValues.push(yEnd);
                    }
                    lastXDatum = xDatum;
                });
            });
            for (let i = fillPhantomPoints.length - 1; i >= 0; i--) {
                fillPoints.push(fillPhantomPoints[i]);
            }
            return [context];
        });
    }
    isPathOrSelectionDirty() {
        return this.marker.isDirty();
    }
    markerFactory() {
        const { shape } = this.marker;
        const MarkerShape = getMarker(shape);
        return new MarkerShape();
    }
    updateMarkerSelection(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nodeData, markerSelection } = opts;
            const { marker: { enabled }, } = this;
            const data = enabled && nodeData ? nodeData : [];
            if (this.marker.isDirty()) {
                markerSelection.clear();
            }
            return markerSelection.update(data, (marker) => {
                marker.tag = AreaSeriesTag.Marker;
            });
        });
    }
    updateMarkerNodes(opts) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { markerSelection, isHighlight: isDatumHighlighted } = opts;
            const { id: seriesId, xKey = '', marker, fill: seriesFill, stroke: seriesStroke, fillOpacity: seriesFillOpacity, marker: { fillOpacity: markerFillOpacity = seriesFillOpacity }, strokeOpacity, highlightStyle: { item: { fill: highlightedFill, fillOpacity: highlightFillOpacity = markerFillOpacity, stroke: highlightedStroke, strokeWidth: highlightedDatumStrokeWidth, }, }, visible, ctx: { callbackCache }, } = this;
            const { size, formatter } = marker;
            const markerStrokeWidth = (_a = marker.strokeWidth) !== null && _a !== void 0 ? _a : this.strokeWidth;
            const customMarker = typeof marker.shape === 'function';
            markerSelection.each((node, datum) => {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                const fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : (_a = marker.fill) !== null && _a !== void 0 ? _a : seriesFill;
                const fillOpacity = isDatumHighlighted ? highlightFillOpacity : markerFillOpacity;
                const stroke = isDatumHighlighted && highlightedStroke !== undefined
                    ? highlightedStroke
                    : (_b = marker.stroke) !== null && _b !== void 0 ? _b : seriesStroke;
                const strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                    ? highlightedDatumStrokeWidth
                    : markerStrokeWidth;
                let format = undefined;
                if (formatter) {
                    format = callbackCache.call(formatter, {
                        datum: datum.datum,
                        xKey,
                        yKey: datum.yKey,
                        fill,
                        stroke,
                        strokeWidth,
                        size,
                        highlighted: isDatumHighlighted,
                        seriesId,
                    });
                }
                node.fill = (_c = format === null || format === void 0 ? void 0 : format.fill) !== null && _c !== void 0 ? _c : fill;
                node.stroke = (_d = format === null || format === void 0 ? void 0 : format.stroke) !== null && _d !== void 0 ? _d : stroke;
                node.strokeWidth = (_e = format === null || format === void 0 ? void 0 : format.strokeWidth) !== null && _e !== void 0 ? _e : strokeWidth;
                node.fillOpacity = fillOpacity !== null && fillOpacity !== void 0 ? fillOpacity : 1;
                node.strokeOpacity = (_g = (_f = marker.strokeOpacity) !== null && _f !== void 0 ? _f : strokeOpacity) !== null && _g !== void 0 ? _g : 1;
                node.size = (_h = format === null || format === void 0 ? void 0 : format.size) !== null && _h !== void 0 ? _h : size;
                node.translationX = datum.point.x;
                node.translationY = datum.point.y;
                node.visible = node.size > 0 && visible && !isNaN(datum.point.x) && !isNaN(datum.point.y);
                if (!customMarker || node.dirtyPath) {
                    return;
                }
                // Only for custom marker shapes
                node.path.clear({ trackChanges: true });
                node.updatePath();
                node.checkPathDirty();
            });
            if (!isDatumHighlighted) {
                this.marker.markClean();
            }
        });
    }
    updateLabelSelection(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const { labelData, labelSelection } = opts;
            return labelSelection.update(labelData, (text) => {
                text.tag = AreaSeriesTag.Label;
            });
        });
    }
    updateLabelNodes(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const { labelSelection } = opts;
            const { enabled: labelEnabled, fontStyle, fontWeight, fontSize, fontFamily, color } = this.label;
            labelSelection.each((text, datum) => {
                const { point, label } = datum;
                if (label && labelEnabled) {
                    text.fontStyle = fontStyle;
                    text.fontWeight = fontWeight;
                    text.fontSize = fontSize;
                    text.fontFamily = fontFamily;
                    text.textAlign = label.textAlign;
                    text.textBaseline = label.textBaseline;
                    text.text = label.text;
                    text.x = point.x;
                    text.y = point.y - 10;
                    text.fill = color;
                    text.visible = true;
                }
                else {
                    text.visible = false;
                }
            });
        });
    }
    getNodeClickEvent(event, datum) {
        var _a;
        return new CartesianSeriesNodeClickEvent((_a = this.xKey) !== null && _a !== void 0 ? _a : '', datum.yKey, event, datum, this);
    }
    getNodeDoubleClickEvent(event, datum) {
        var _a;
        return new CartesianSeriesNodeDoubleClickEvent((_a = this.xKey) !== null && _a !== void 0 ? _a : '', datum.yKey, event, datum, this);
    }
    getTooltipHtml(nodeDatum) {
        var _a, _b, _c;
        const { xKey, id: seriesId, axes, xName, yName, fill: seriesFill, stroke: seriesStroke, tooltip, marker, dataModel, } = this;
        const { yKey, xValue, yValue, datum } = nodeDatum;
        const xAxis = axes[ChartAxisDirection.X];
        const yAxis = axes[ChartAxisDirection.Y];
        if (!(xKey && yKey) || !(xAxis && yAxis && isNumber(yValue)) || !dataModel) {
            return '';
        }
        const yRawIndex = dataModel.resolveProcessedDataIndexById(this, `yValue-raw`).index;
        const { size, formatter: markerFormatter, strokeWidth: markerStrokeWidth, fill: markerFill, stroke: markerStroke, } = marker;
        const xString = xAxis.formatDatum(xValue);
        const yString = yAxis.formatDatum(yValue);
        const processedYValue = (_b = (_a = this.processedData) === null || _a === void 0 ? void 0 : _a.data[nodeDatum.index]) === null || _b === void 0 ? void 0 : _b.values[0][yRawIndex];
        const title = sanitizeHtml(yName);
        const content = sanitizeHtml(xString + ': ' + yString);
        const strokeWidth = markerStrokeWidth !== null && markerStrokeWidth !== void 0 ? markerStrokeWidth : this.strokeWidth;
        const fill = markerFill !== null && markerFill !== void 0 ? markerFill : seriesFill;
        const stroke = markerStroke !== null && markerStroke !== void 0 ? markerStroke : seriesStroke;
        let format = undefined;
        if (markerFormatter) {
            format = markerFormatter({
                datum,
                xKey,
                yKey,
                fill,
                stroke,
                strokeWidth,
                size,
                highlighted: false,
                seriesId,
            });
        }
        const color = (_c = format === null || format === void 0 ? void 0 : format.fill) !== null && _c !== void 0 ? _c : fill;
        const defaults = {
            title,
            backgroundColor: color,
            content,
        };
        const { renderer: tooltipRenderer, format: tooltipFormat } = tooltip;
        if (tooltipFormat || tooltipRenderer) {
            const params = {
                datum,
                xKey,
                xName,
                xValue,
                yKey,
                yValue,
                processedYValue,
                yName,
                color,
                title,
                seriesId,
            };
            if (tooltipFormat) {
                return toTooltipHtml({
                    content: interpolate(tooltipFormat, params),
                }, defaults);
            }
            if (tooltipRenderer) {
                return toTooltipHtml(tooltipRenderer(params), defaults);
            }
        }
        return toTooltipHtml(defaults);
    }
    getLegendData() {
        var _a, _b, _c, _d;
        const { data, id, xKey, yKey, yName, marker, fill, stroke, fillOpacity, strokeOpacity, visible } = this;
        if (!(data === null || data === void 0 ? void 0 : data.length) || !xKey || !yKey) {
            return [];
        }
        // Area stacks should be listed in the legend in reverse order, for symmetry with the
        // vertical stack display order.
        return [
            {
                legendType: 'category',
                id,
                itemId: yKey,
                seriesId: id,
                enabled: visible,
                label: {
                    text: yName !== null && yName !== void 0 ? yName : yKey,
                },
                marker: {
                    shape: marker.shape,
                    fill: (_a = marker.fill) !== null && _a !== void 0 ? _a : fill,
                    stroke: (_b = marker.stroke) !== null && _b !== void 0 ? _b : stroke,
                    fillOpacity: (_c = marker.fillOpacity) !== null && _c !== void 0 ? _c : fillOpacity,
                    strokeOpacity: (_d = marker.strokeOpacity) !== null && _d !== void 0 ? _d : strokeOpacity,
                },
            },
        ];
    }
    animateEmptyUpdateReady({ markerSelections, labelSelections, contextData, paths, seriesRect, }) {
        const { stroke: seriesStroke, fill: seriesFill, fillOpacity, lineDash, lineDashOffset, strokeOpacity, strokeWidth, shadow, } = this;
        contextData.forEach(({ fillSelectionData, strokeSelectionData, itemId }, seriesIdx) => {
            var _a, _b, _c, _d, _e;
            const [fill, stroke] = paths[seriesIdx];
            const duration = (_b = (_a = this.ctx.animationManager) === null || _a === void 0 ? void 0 : _a.defaultOptions.duration) !== null && _b !== void 0 ? _b : 1000;
            const markerDuration = 200;
            const animationOptions = {
                from: 0,
                to: (_c = seriesRect === null || seriesRect === void 0 ? void 0 : seriesRect.width) !== null && _c !== void 0 ? _c : 0,
                duration,
            };
            // Stroke
            {
                const { points, yValues } = strokeSelectionData;
                stroke.tag = AreaSeriesTag.Stroke;
                stroke.fill = undefined;
                stroke.lineJoin = stroke.lineCap = 'round';
                stroke.pointerEvents = PointerEvents.None;
                stroke.stroke = seriesStroke;
                stroke.strokeWidth = this.getStrokeWidth(this.strokeWidth, { itemId });
                stroke.strokeOpacity = strokeOpacity;
                stroke.lineDash = lineDash;
                stroke.lineDashOffset = lineDashOffset;
                (_d = this.ctx.animationManager) === null || _d === void 0 ? void 0 : _d.animate(`${this.id}_empty-update-ready_stroke_${seriesIdx}`, Object.assign(Object.assign({}, animationOptions), { onUpdate(xValue) {
                        stroke.path.clear({ trackChanges: true });
                        let moveTo = true;
                        points.forEach((point, index) => {
                            // Draw/move the full segment if past the end of this segment
                            if (yValues[index] === undefined || isNaN(point.x) || isNaN(point.y)) {
                                moveTo = true;
                            }
                            else if (point.x <= xValue) {
                                if (moveTo) {
                                    stroke.path.moveTo(point.x, point.y);
                                    moveTo = false;
                                }
                                else {
                                    stroke.path.lineTo(point.x, point.y);
                                }
                            }
                            else if (index > 0 &&
                                yValues[index] !== undefined &&
                                yValues[index - 1] !== undefined &&
                                points[index - 1].x <= xValue) {
                                // Draw/move partial line if in between the start and end of this segment
                                const start = points[index - 1];
                                const end = point;
                                const x = xValue;
                                const y = start.y + ((x - start.x) * (end.y - start.y)) / (end.x - start.x);
                                stroke.path.lineTo(x, y);
                            }
                        });
                        stroke.checkPathDirty();
                    } }));
            }
            // Fill
            {
                const { points: allPoints } = fillSelectionData;
                const points = allPoints.slice(0, allPoints.length / 2);
                const bottomPoints = allPoints.slice(allPoints.length / 2);
                fill.tag = AreaSeriesTag.Fill;
                fill.stroke = undefined;
                fill.lineJoin = 'round';
                fill.pointerEvents = PointerEvents.None;
                fill.fill = seriesFill;
                fill.fillOpacity = fillOpacity;
                fill.strokeOpacity = strokeOpacity;
                fill.strokeWidth = strokeWidth;
                fill.lineDash = lineDash;
                fill.lineDashOffset = lineDashOffset;
                fill.fillShadow = shadow;
                (_e = this.ctx.animationManager) === null || _e === void 0 ? void 0 : _e.animate(`${this.id}_empty-update-ready_fill_${seriesIdx}`, Object.assign(Object.assign({}, animationOptions), { onUpdate(xValue) {
                        fill.path.clear({ trackChanges: true });
                        let x = 0;
                        let y = 0;
                        points.forEach((point, index) => {
                            if (point.x <= xValue) {
                                // Draw/move the full segment if past the end of this segment
                                x = point.x;
                                y = point.y;
                                fill.path.lineTo(point.x, point.y);
                            }
                            else if (index > 0 && points[index - 1].x < xValue) {
                                // Draw/move partial line if in between the start and end of this segment
                                const start = points[index - 1];
                                const end = point;
                                x = xValue;
                                y = start.y + ((x - start.x) * (end.y - start.y)) / (end.x - start.x);
                                fill.path.lineTo(x, y);
                            }
                        });
                        bottomPoints.forEach((point, index) => {
                            const reverseIndex = bottomPoints.length - index - 1;
                            if (point.x <= xValue) {
                                fill.path.lineTo(point.x, point.y);
                            }
                            else if (reverseIndex > 0 && points[reverseIndex - 1].x < xValue) {
                                const start = point;
                                const end = bottomPoints[index + 1];
                                const bottomY = start.y + ((x - start.x) * (end.y - start.y)) / (end.x - start.x);
                                fill.path.lineTo(x, bottomY);
                            }
                        });
                        if (bottomPoints.length > 0) {
                            fill.path.lineTo(bottomPoints[bottomPoints.length - 1].x, bottomPoints[bottomPoints.length - 1].y);
                        }
                        fill.path.closePath();
                        fill.checkPathDirty();
                    } }));
            }
            markerSelections[seriesIdx].each((marker, datum) => {
                var _a, _b, _c, _d;
                const delay = (seriesRect === null || seriesRect === void 0 ? void 0 : seriesRect.width) ? (datum.point.x / seriesRect.width) * duration : 0;
                const format = this.animateFormatter(datum);
                const size = (_b = (_a = datum.point) === null || _a === void 0 ? void 0 : _a.size) !== null && _b !== void 0 ? _b : 0;
                (_c = this.ctx.animationManager) === null || _c === void 0 ? void 0 : _c.animate(`${this.id}_empty-update-ready_${marker.id}`, Object.assign(Object.assign({}, animationOptions), { to: (_d = format === null || format === void 0 ? void 0 : format.size) !== null && _d !== void 0 ? _d : size, delay, duration: markerDuration, onUpdate(size) {
                        marker.size = size;
                    } }));
            });
            labelSelections[seriesIdx].each((label, datum) => {
                var _a;
                const delay = (seriesRect === null || seriesRect === void 0 ? void 0 : seriesRect.width) ? (datum.point.x / seriesRect.width) * duration : 0;
                (_a = this.ctx.animationManager) === null || _a === void 0 ? void 0 : _a.animate(`${this.id}_empty-update-ready_${label.id}`, {
                    from: 0,
                    to: 1,
                    delay,
                    duration: markerDuration,
                    onUpdate: (opacity) => {
                        label.opacity = opacity;
                    },
                });
            });
        });
    }
    animateReadyUpdate({ contextData, paths, }) {
        const { stroke: seriesStroke, fill: seriesFill, fillOpacity, lineDash, lineDashOffset, strokeOpacity, strokeWidth, shadow, } = this;
        contextData.forEach(({ strokeSelectionData, fillSelectionData, itemId }, seriesIdx) => {
            const [fill, stroke] = paths[seriesIdx];
            // Stroke
            stroke.stroke = seriesStroke;
            stroke.strokeWidth = this.getStrokeWidth(this.strokeWidth, { itemId });
            stroke.strokeOpacity = strokeOpacity;
            stroke.lineDash = lineDash;
            stroke.lineDashOffset = lineDashOffset;
            stroke.path.clear({ trackChanges: true });
            let moveTo = true;
            strokeSelectionData.points.forEach((point, index) => {
                if (strokeSelectionData.yValues[index] === undefined || isNaN(point.x) || isNaN(point.y)) {
                    moveTo = true;
                }
                else if (moveTo) {
                    stroke.path.moveTo(point.x, point.y);
                    moveTo = false;
                }
                else {
                    stroke.path.lineTo(point.x, point.y);
                }
            });
            stroke.checkPathDirty();
            // Fill
            fill.fill = seriesFill;
            fill.fillOpacity = fillOpacity;
            fill.strokeOpacity = strokeOpacity;
            fill.strokeWidth = strokeWidth;
            fill.lineDash = lineDash;
            fill.lineDashOffset = lineDashOffset;
            fill.fillShadow = shadow;
            fill.path.clear({ trackChanges: true });
            fillSelectionData.points.forEach((point) => {
                fill.path.lineTo(point.x, point.y);
            });
            fill.path.closePath();
            fill.checkPathDirty();
        });
    }
    animateFormatter(datum) {
        var _a, _b, _c;
        const { marker, fill: seriesFill, stroke: seriesStroke, xKey = '', id: seriesId, ctx: { callbackCache }, } = this;
        const { size, formatter } = marker;
        const fill = (_a = marker.fill) !== null && _a !== void 0 ? _a : seriesFill;
        const stroke = (_b = marker.stroke) !== null && _b !== void 0 ? _b : seriesStroke;
        const strokeWidth = (_c = marker.strokeWidth) !== null && _c !== void 0 ? _c : this.strokeWidth;
        let format = undefined;
        if (formatter) {
            format = callbackCache.call(formatter, {
                datum: datum.datum,
                xKey,
                yKey: datum.yKey,
                fill,
                stroke,
                strokeWidth,
                size,
                highlighted: false,
                seriesId,
            });
        }
        return format;
    }
    isLabelEnabled() {
        return this.label.enabled;
    }
}
AreaSeries.className = 'AreaSeries';
AreaSeries.type = 'area';
__decorate([
    Validate(COLOR_STRING)
], AreaSeries.prototype, "fill", void 0);
__decorate([
    Validate(COLOR_STRING)
], AreaSeries.prototype, "stroke", void 0);
__decorate([
    Validate(NUMBER(0, 1))
], AreaSeries.prototype, "fillOpacity", void 0);
__decorate([
    Validate(NUMBER(0, 1))
], AreaSeries.prototype, "strokeOpacity", void 0);
__decorate([
    Validate(OPT_LINE_DASH)
], AreaSeries.prototype, "lineDash", void 0);
__decorate([
    Validate(NUMBER(0))
], AreaSeries.prototype, "lineDashOffset", void 0);
__decorate([
    Validate(OPT_STRING)
], AreaSeries.prototype, "xKey", void 0);
__decorate([
    Validate(OPT_STRING)
], AreaSeries.prototype, "xName", void 0);
__decorate([
    Validate(OPT_STRING)
], AreaSeries.prototype, "yKey", void 0);
__decorate([
    Validate(OPT_STRING)
], AreaSeries.prototype, "yName", void 0);
__decorate([
    Validate(OPT_NUMBER(0))
], AreaSeries.prototype, "normalizedTo", void 0);
__decorate([
    Validate(NUMBER(0))
], AreaSeries.prototype, "strokeWidth", void 0);
