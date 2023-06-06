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
exports.AreaSeries = void 0;
const series_1 = require("../series");
const node_1 = require("../../../scene/node");
const cartesianSeries_1 = require("./cartesianSeries");
const chartAxisDirection_1 = require("../../chartAxisDirection");
const util_1 = require("../../marker/util");
const tooltip_1 = require("../../tooltip/tooltip");
const array_1 = require("../../../util/array");
const equal_1 = require("../../../util/equal");
const string_1 = require("../../../util/string");
const label_1 = require("../../label");
const sanitize_1 = require("../../../util/sanitize");
const value_1 = require("../../../util/value");
const continuousScale_1 = require("../../../scale/continuousScale");
const validation_1 = require("../../../util/validation");
const logAxis_1 = require("../../axis/logAxis");
const dataModel_1 = require("../../data/dataModel");
const timeAxis_1 = require("../../axis/timeAxis");
const aggregateFunctions_1 = require("../../data/aggregateFunctions");
const processors_1 = require("../../data/processors");
const easing = require("../../../motion/easing");
class AreaSeriesLabel extends label_1.Label {
    constructor() {
        super(...arguments);
        this.formatter = undefined;
    }
}
__decorate([
    validation_1.Validate(validation_1.OPT_FUNCTION)
], AreaSeriesLabel.prototype, "formatter", void 0);
class AreaSeriesTooltip extends series_1.SeriesTooltip {
    constructor() {
        super(...arguments);
        this.renderer = undefined;
        this.format = undefined;
    }
}
__decorate([
    validation_1.Validate(validation_1.OPT_FUNCTION)
], AreaSeriesTooltip.prototype, "renderer", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_STRING)
], AreaSeriesTooltip.prototype, "format", void 0);
var AreaSeriesTag;
(function (AreaSeriesTag) {
    AreaSeriesTag[AreaSeriesTag["Fill"] = 0] = "Fill";
    AreaSeriesTag[AreaSeriesTag["Stroke"] = 1] = "Stroke";
    AreaSeriesTag[AreaSeriesTag["Marker"] = 2] = "Marker";
    AreaSeriesTag[AreaSeriesTag["Label"] = 3] = "Label";
})(AreaSeriesTag || (AreaSeriesTag = {}));
class AreaSeries extends cartesianSeries_1.CartesianSeries {
    constructor(moduleCtx) {
        super({
            moduleCtx,
            pathsPerSeries: 2,
            pathsZIndexSubOrderOffset: [0, 1000],
            hasMarkers: true,
            directionKeys: {
                [chartAxisDirection_1.ChartAxisDirection.X]: ['xKey'],
                [chartAxisDirection_1.ChartAxisDirection.Y]: ['yKeys'],
            },
            directionNames: {
                [chartAxisDirection_1.ChartAxisDirection.X]: ['xName'],
                [chartAxisDirection_1.ChartAxisDirection.Y]: ['yNames'],
            },
        });
        this.tooltip = new AreaSeriesTooltip();
        this.marker = new cartesianSeries_1.CartesianSeriesMarker();
        this.label = new AreaSeriesLabel();
        this.fills = ['#c16068', '#a2bf8a', '#ebcc87', '#80a0c3', '#b58dae', '#85c0d1'];
        this.strokes = ['#874349', '#718661', '#a48f5f', '#5a7088', '#7f637a', '#5d8692'];
        this.fillOpacity = 1;
        this.strokeOpacity = 1;
        this.lineDash = [0];
        this.lineDashOffset = 0;
        this.xKey = undefined;
        this.xName = undefined;
        this._yKeys = [];
        this._visibles = [];
        this.yNames = [];
        this.strokeWidth = 2;
        this.shadow = undefined;
        const { marker, label } = this;
        marker.enabled = false;
        label.enabled = false;
    }
    set yKeys(values) {
        if (!equal_1.areArrayItemsStrictlyEqual(this._yKeys, values)) {
            this._yKeys = values;
            this.processedData = undefined;
            this.processSeriesItemEnabled();
        }
    }
    get yKeys() {
        return this._yKeys;
    }
    set visibles(visibles) {
        this._visibles = visibles;
        this.processSeriesItemEnabled();
    }
    get visibles() {
        return this._visibles;
    }
    processSeriesItemEnabled() {
        const { seriesItemEnabled, _visibles: visibles = [] } = this;
        seriesItemEnabled.clear();
        this._yKeys.forEach((key, idx) => { var _a; return seriesItemEnabled.set(key, (_a = visibles[idx]) !== null && _a !== void 0 ? _a : true); });
    }
    set normalizedTo(value) {
        const absValue = value ? Math.abs(value) : undefined;
        if (this._normalizedTo !== absValue) {
            this._normalizedTo = absValue;
        }
    }
    get normalizedTo() {
        return this._normalizedTo;
    }
    processData() {
        return __awaiter(this, void 0, void 0, function* () {
            const { xKey, yKeys, seriesItemEnabled, xAxis, yAxis, normalizedTo } = this;
            const data = xKey && yKeys.length && this.data ? this.data : [];
            const isContinuousX = (xAxis === null || xAxis === void 0 ? void 0 : xAxis.scale) instanceof continuousScale_1.ContinuousScale;
            const isContinuousY = (yAxis === null || yAxis === void 0 ? void 0 : yAxis.scale) instanceof continuousScale_1.ContinuousScale;
            const enabledYKeys = [...seriesItemEnabled.entries()].filter(([, enabled]) => enabled).map(([yKey]) => yKey);
            const normaliseTo = normalizedTo && isFinite(normalizedTo) ? normalizedTo : undefined;
            const extraProps = [];
            if (normaliseTo) {
                extraProps.push(processors_1.normaliseGroupTo(enabledYKeys, normaliseTo, 'sum'));
            }
            this.dataModel = new dataModel_1.DataModel({
                props: [
                    series_1.keyProperty(xKey, isContinuousX, { id: 'xValue' }),
                    ...enabledYKeys.map((yKey) => series_1.valueProperty(yKey, isContinuousY, {
                        id: `yValue-${yKey}`,
                        missingValue: NaN,
                        invalidValue: undefined,
                    })),
                    aggregateFunctions_1.sum(enabledYKeys),
                    ...extraProps,
                ],
                groupByKeys: true,
                dataVisible: this.visible && enabledYKeys.length > 0,
            });
            this.processedData = this.dataModel.processData(data);
        });
    }
    getDomain(direction) {
        const { processedData, xAxis, yAxis } = this;
        if (!processedData)
            return [];
        const { defs: { keys: [keyDef], }, domain: { keys: [keys], values: [yExtent], aggValues: [ySumExtent] = [], }, } = processedData;
        if (direction === chartAxisDirection_1.ChartAxisDirection.X) {
            if (keyDef.valueType === 'category') {
                return keys;
            }
            return this.fixNumericExtent(array_1.extent(keys), xAxis);
        }
        else if (yAxis instanceof logAxis_1.LogAxis || yAxis instanceof timeAxis_1.TimeAxis) {
            return this.fixNumericExtent(yExtent, yAxis);
        }
        else {
            return this.fixNumericExtent(ySumExtent, yAxis);
        }
    }
    createNodeData() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { xAxis, yAxis, data, processedData: { data: groupedData } = {}, ctx: { callbackCache }, } = this;
            if (!xAxis || !yAxis || !data) {
                return [];
            }
            const contexts = [];
            const { yKeys, xKey = '', marker, label, fills, strokes, id: seriesId } = this;
            const { scale: xScale } = xAxis;
            const { scale: yScale } = yAxis;
            const continuousY = yScale instanceof continuousScale_1.ContinuousScale;
            const xOffset = ((_a = xScale.bandwidth) !== null && _a !== void 0 ? _a : 0) / 2;
            const xDataCount = data.length;
            const cumulativePathValues = new Array(xDataCount)
                .fill(null)
                .map(() => ({ left: 0, right: 0 }));
            const cumulativeMarkerValues = new Array(xDataCount).fill(0);
            const createPathCoordinates = (xDatum, yDatum, idx, side) => {
                const x = xScale.convert(xDatum) + xOffset;
                const prevY = cumulativePathValues[idx][side];
                const currY = cumulativePathValues[idx][side] + yDatum;
                const prevYCoordinate = yScale.convert(prevY, { strict: false });
                const currYCoordinate = yScale.convert(currY, { strict: false });
                cumulativePathValues[idx][side] = currY;
                return [
                    { x, y: currYCoordinate, size: marker.size },
                    { x, y: prevYCoordinate, size: marker.size },
                ];
            };
            const createMarkerCoordinate = (xDatum, yDatum, idx, rawYDatum) => {
                let currY;
                // if not normalized, the invalid data points will be processed as `undefined` in processData()
                // if normalized, the invalid data points will be processed as 0 rather than `undefined`
                // check if unprocessed datum is valid as we only want to show markers for valid points
                const normalized = this.normalizedTo && isFinite(this.normalizedTo);
                const normalizedAndValid = normalized && continuousY && value_1.isContinuous(rawYDatum);
                const valid = (!normalized && !isNaN(rawYDatum)) || normalizedAndValid;
                if (valid) {
                    currY = cumulativeMarkerValues[idx] += yDatum;
                }
                const x = xScale.convert(xDatum) + xOffset;
                const y = yScale.convert(currY, { strict: false });
                return { x, y, size: marker.size };
            };
            yKeys.forEach((yKey, seriesIdx) => {
                var _a;
                const yKeyDataIndex = (_a = this.dataModel) === null || _a === void 0 ? void 0 : _a.resolveProcessedDataIndexById(`yValue-${yKey}`);
                const labelSelectionData = [];
                const markerSelectionData = [];
                const strokeSelectionData = { itemId: yKey, points: [], yValues: [] };
                const fillSelectionData = { itemId: yKey, points: [] };
                contexts[seriesIdx] = {
                    itemId: yKey,
                    fillSelectionData,
                    labelData: labelSelectionData,
                    nodeData: markerSelectionData,
                    strokeSelectionData,
                };
                if (!yKeyDataIndex) {
                    return;
                }
                const fillPoints = fillSelectionData.points;
                const fillPhantomPoints = [];
                const strokePoints = strokeSelectionData.points;
                const yValues = strokeSelectionData.yValues;
                let datumIdx = -1;
                groupedData === null || groupedData === void 0 ? void 0 : groupedData.forEach((datumGroup, dataIdx) => {
                    const { keys: [xDatum], datum: datumArray, values: valuesArray, } = datumGroup;
                    valuesArray.forEach((values, valueIdx) => {
                        var _a;
                        datumIdx++;
                        const seriesDatum = datumArray[valueIdx];
                        const rawYDatum = values[yKeyDataIndex.index];
                        const yDatum = isNaN(rawYDatum) ? undefined : rawYDatum;
                        const nextValuesSameGroup = valueIdx < valuesArray.length - 1;
                        const nextDatumGroup = nextValuesSameGroup ? datumGroup : groupedData[dataIdx + 1];
                        const nextXDatum = nextDatumGroup === null || nextDatumGroup === void 0 ? void 0 : nextDatumGroup.keys[0];
                        const rawNextYIdx = nextValuesSameGroup ? valueIdx + 1 : 0;
                        const rawNextYDatum = nextDatumGroup === null || nextDatumGroup === void 0 ? void 0 : nextDatumGroup.values[rawNextYIdx][yKeyDataIndex.index];
                        const nextYDatum = isNaN(rawNextYDatum) ? undefined : rawNextYDatum;
                        // marker data
                        const point = createMarkerCoordinate(xDatum, +yDatum, datumIdx, seriesDatum[yKey]);
                        if (marker) {
                            markerSelectionData.push({
                                index: datumIdx,
                                series: this,
                                itemId: yKey,
                                datum: seriesDatum,
                                nodeMidPoint: { x: point.x, y: point.y },
                                cumulativeValue: cumulativeMarkerValues[datumIdx],
                                yValue: yDatum,
                                yKey,
                                xKey,
                                point,
                                fill: fills[seriesIdx % fills.length],
                                stroke: strokes[seriesIdx % strokes.length],
                            });
                        }
                        // label data
                        let labelText;
                        if (label.formatter) {
                            labelText = (_a = callbackCache.call(label.formatter, { value: yDatum, seriesId })) !== null && _a !== void 0 ? _a : '';
                        }
                        else {
                            labelText = value_1.isNumber(yDatum) ? Number(yDatum).toFixed(2) : String(yDatum);
                        }
                        if (label) {
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
                        const windowX = [xDatum, nextXDatum];
                        const windowY = [yDatum, nextYDatum];
                        if (windowX.some((v) => v == undefined)) {
                            return;
                        }
                        if (windowY.some((v) => v == undefined)) {
                            windowY[0] = 0;
                            windowY[1] = 0;
                        }
                        const currCoordinates = createPathCoordinates(windowX[0], +windowY[0], datumIdx, 'right');
                        fillPoints.push(currCoordinates[0]);
                        fillPhantomPoints.push(currCoordinates[1]);
                        const nextCoordinates = createPathCoordinates(windowX[1], +windowY[1], datumIdx, 'left');
                        fillPoints.push(nextCoordinates[0]);
                        fillPhantomPoints.push(nextCoordinates[1]);
                        // stroke data
                        strokePoints.push({ x: NaN, y: NaN }); // moveTo
                        yValues.push(undefined);
                        strokePoints.push(currCoordinates[0]);
                        yValues.push(yDatum);
                        if (nextYDatum !== undefined) {
                            strokePoints.push(nextCoordinates[0]);
                            yValues.push(yDatum);
                        }
                    });
                });
                for (let i = fillPhantomPoints.length - 1; i >= 0; i--) {
                    fillPoints.push(fillPhantomPoints[i]);
                }
            });
            return contexts;
        });
    }
    isPathOrSelectionDirty() {
        return this.marker.isDirty();
    }
    markerFactory() {
        const { shape } = this.marker;
        const MarkerShape = util_1.getMarker(shape);
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
            const { id: seriesId, xKey = '', marker, seriesItemEnabled, yKeys, fills, strokes, fillOpacity: seriesFillOpacity, marker: { fillOpacity: markerFillOpacity = seriesFillOpacity }, strokeOpacity, highlightStyle: { item: { fill: highlightedFill, fillOpacity: highlightFillOpacity = markerFillOpacity, stroke: highlightedStroke, strokeWidth: highlightedDatumStrokeWidth, }, }, ctx: { callbackCache }, } = this;
            const { size, formatter } = marker;
            const markerStrokeWidth = (_a = marker.strokeWidth) !== null && _a !== void 0 ? _a : this.strokeWidth;
            const customMarker = typeof marker.shape === 'function';
            markerSelection.each((node, datum) => {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                const yKeyIndex = yKeys.indexOf(datum.yKey);
                const fill = isDatumHighlighted && highlightedFill !== undefined
                    ? highlightedFill
                    : (_a = marker.fill) !== null && _a !== void 0 ? _a : fills[yKeyIndex % fills.length];
                const fillOpacity = isDatumHighlighted ? highlightFillOpacity : markerFillOpacity;
                const stroke = isDatumHighlighted && highlightedStroke !== undefined
                    ? highlightedStroke
                    : (_b = marker.stroke) !== null && _b !== void 0 ? _b : strokes[yKeyIndex % fills.length];
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
                node.visible =
                    node.size > 0 && !!seriesItemEnabled.get(datum.yKey) && !isNaN(datum.point.x) && !isNaN(datum.point.y);
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
        return new cartesianSeries_1.CartesianSeriesNodeClickEvent((_a = this.xKey) !== null && _a !== void 0 ? _a : '', datum.yKey, event, datum, this);
    }
    getNodeDoubleClickEvent(event, datum) {
        var _a;
        return new cartesianSeries_1.CartesianSeriesNodeDoubleClickEvent((_a = this.xKey) !== null && _a !== void 0 ? _a : '', datum.yKey, event, datum, this);
    }
    getTooltipHtml(nodeDatum) {
        var _a, _b, _c, _d;
        const { xKey, id: seriesId } = this;
        const { yKey } = nodeDatum;
        const yKeyDataIndex = (_a = this.dataModel) === null || _a === void 0 ? void 0 : _a.resolveProcessedDataIndexById(`yValue-${yKey}`);
        if (!(xKey && yKey) || !yKeyDataIndex) {
            return '';
        }
        const datum = nodeDatum.datum;
        const xValue = datum[xKey];
        const yValue = datum[yKey];
        const { xAxis, yAxis, yKeys } = this;
        if (!(xAxis && yAxis && value_1.isNumber(yValue)) || !yKeyDataIndex) {
            return '';
        }
        const { xName, yNames, fills, strokes, tooltip, marker } = this;
        const { size, formatter: markerFormatter, strokeWidth: markerStrokeWidth, fill: markerFill, stroke: markerStroke, } = marker;
        const xString = xAxis.formatDatum(xValue);
        const yString = yAxis.formatDatum(yValue);
        const yKeyIndex = yKeys.indexOf(yKey);
        const processedYValue = (_c = (_b = this.processedData) === null || _b === void 0 ? void 0 : _b.data[nodeDatum.index]) === null || _c === void 0 ? void 0 : _c.values[0][yKeyDataIndex === null || yKeyDataIndex === void 0 ? void 0 : yKeyDataIndex.index];
        const yName = yNames[yKeyIndex];
        const title = sanitize_1.sanitizeHtml(yName);
        const content = sanitize_1.sanitizeHtml(xString + ': ' + yString);
        const strokeWidth = markerStrokeWidth !== null && markerStrokeWidth !== void 0 ? markerStrokeWidth : this.strokeWidth;
        const fill = markerFill !== null && markerFill !== void 0 ? markerFill : fills[yKeyIndex % fills.length];
        const stroke = markerStroke !== null && markerStroke !== void 0 ? markerStroke : strokes[yKeyIndex % fills.length];
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
        const color = (_d = format === null || format === void 0 ? void 0 : format.fill) !== null && _d !== void 0 ? _d : fill;
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
                return tooltip_1.toTooltipHtml({
                    content: string_1.interpolate(tooltipFormat, params),
                }, defaults);
            }
            if (tooltipRenderer) {
                return tooltip_1.toTooltipHtml(tooltipRenderer(params), defaults);
            }
        }
        return tooltip_1.toTooltipHtml(defaults);
    }
    getLegendData() {
        var _a, _b, _c, _d, _e;
        const { data, id, xKey, yKeys, yNames, seriesItemEnabled, marker, fills, strokes, fillOpacity, strokeOpacity } = this;
        if (!(data === null || data === void 0 ? void 0 : data.length) || !xKey || !yKeys.length) {
            return [];
        }
        const legendData = [];
        // Area stacks should be listed in the legend in reverse order, for symmetry with the
        // vertical stack display order.
        for (let index = yKeys.length - 1; index >= 0; index--) {
            const yKey = yKeys[index];
            legendData.push({
                legendType: 'category',
                id,
                itemId: yKey,
                seriesId: id,
                enabled: (_a = seriesItemEnabled.get(yKey)) !== null && _a !== void 0 ? _a : false,
                label: {
                    text: yNames[index] || yKeys[index],
                },
                marker: {
                    shape: marker.shape,
                    fill: (_b = marker.fill) !== null && _b !== void 0 ? _b : fills[index % fills.length],
                    stroke: (_c = marker.stroke) !== null && _c !== void 0 ? _c : strokes[index % strokes.length],
                    fillOpacity: (_d = marker.fillOpacity) !== null && _d !== void 0 ? _d : fillOpacity,
                    strokeOpacity: (_e = marker.strokeOpacity) !== null && _e !== void 0 ? _e : strokeOpacity,
                },
            });
        }
        return legendData;
    }
    onLegendItemDoubleClick(event) {
        const { enabled, itemId, series, numVisibleItems } = event;
        const newEnableds = {};
        const totalVisibleItems = Object.values(numVisibleItems).reduce((p, v) => p + v, 0);
        const singleEnabledWasClicked = totalVisibleItems === 1 && enabled;
        if (series.id === this.id) {
            const singleEnabledInEachSeries = Object.values(numVisibleItems).filter((v) => v === 1).length === Object.keys(numVisibleItems).length;
            this.yKeys.forEach((yKey) => {
                var _a;
                const matches = yKey === itemId;
                const newEnabled = matches || singleEnabledWasClicked || (singleEnabledInEachSeries && enabled);
                newEnableds[yKey] = (_a = newEnableds[yKey]) !== null && _a !== void 0 ? _a : newEnabled;
            });
        }
        else {
            this.yKeys.forEach((yKey) => {
                newEnableds[yKey] = singleEnabledWasClicked;
            });
        }
        Object.keys(newEnableds).forEach((yKey) => {
            super.toggleSeriesItem(yKey, newEnableds[yKey]);
        });
    }
    animateEmptyUpdateReady({ markerSelections, labelSelections, contextData, paths, seriesRect, }) {
        const { strokes, fills, fillOpacity, lineDash, lineDashOffset, strokeOpacity, strokeWidth, shadow } = this;
        contextData.forEach(({ fillSelectionData, strokeSelectionData, itemId }, seriesIdx) => {
            var _a, _b, _c;
            const [fill, stroke] = paths[seriesIdx];
            const duration = 1000;
            const markerDuration = 200;
            const animationOptions = {
                from: 0,
                to: (_a = seriesRect === null || seriesRect === void 0 ? void 0 : seriesRect.width) !== null && _a !== void 0 ? _a : 0,
                disableInteractions: true,
                duration,
                ease: easing.linear,
                repeat: 0,
            };
            // Stroke
            {
                const { points, yValues } = strokeSelectionData;
                stroke.tag = AreaSeriesTag.Stroke;
                stroke.fill = undefined;
                stroke.lineJoin = stroke.lineCap = 'round';
                stroke.pointerEvents = node_1.PointerEvents.None;
                stroke.stroke = strokes[seriesIdx % strokes.length];
                stroke.strokeWidth = this.getStrokeWidth(this.strokeWidth, { itemId });
                stroke.strokeOpacity = strokeOpacity;
                stroke.lineDash = lineDash;
                stroke.lineDashOffset = lineDashOffset;
                (_b = this.animationManager) === null || _b === void 0 ? void 0 : _b.animate(`${this.id}_empty-update-ready_stroke_${seriesIdx}`, Object.assign(Object.assign({}, animationOptions), { onUpdate(xValue) {
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
                fill.pointerEvents = node_1.PointerEvents.None;
                fill.fill = fills[seriesIdx % fills.length];
                fill.fillOpacity = fillOpacity;
                fill.strokeOpacity = strokeOpacity;
                fill.strokeWidth = strokeWidth;
                fill.lineDash = lineDash;
                fill.lineDashOffset = lineDashOffset;
                fill.fillShadow = shadow;
                (_c = this.animationManager) === null || _c === void 0 ? void 0 : _c.animate(`${this.id}_empty-update-ready_fill_${seriesIdx}`, Object.assign(Object.assign({}, animationOptions), { onUpdate(xValue) {
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
                (_c = this.animationManager) === null || _c === void 0 ? void 0 : _c.animate(`${this.id}_empty-update-ready_${marker.id}`, Object.assign(Object.assign({}, animationOptions), { to: (_d = format === null || format === void 0 ? void 0 : format.size) !== null && _d !== void 0 ? _d : size, delay, duration: markerDuration, onUpdate(size) {
                        marker.size = size;
                    } }));
            });
            labelSelections[seriesIdx].each((label, datum) => {
                var _a;
                const delay = (seriesRect === null || seriesRect === void 0 ? void 0 : seriesRect.width) ? (datum.point.x / seriesRect.width) * duration : 0;
                (_a = this.animationManager) === null || _a === void 0 ? void 0 : _a.animate(`${this.id}_empty-update-ready_${label.id}`, {
                    from: 0,
                    to: 1,
                    delay,
                    duration: markerDuration,
                    ease: easing.linear,
                    repeat: 0,
                    onUpdate: (opacity) => {
                        label.opacity = opacity;
                    },
                });
            });
        });
    }
    animateReadyUpdate({ contextData, paths, }) {
        const { strokes, fills, fillOpacity, lineDash, lineDashOffset, strokeOpacity, strokeWidth, shadow } = this;
        contextData.forEach(({ strokeSelectionData, fillSelectionData, itemId }, seriesIdx) => {
            const [fill, stroke] = paths[seriesIdx];
            // Stroke
            stroke.stroke = strokes[seriesIdx % strokes.length];
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
            fill.fill = fills[seriesIdx % fills.length];
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
        const { marker, fills, strokes, xKey = '', yKeys, id: seriesId, ctx: { callbackCache }, } = this;
        const { size, formatter } = marker;
        const yKeyIndex = yKeys.indexOf(datum.yKey);
        const fill = (_a = marker.fill) !== null && _a !== void 0 ? _a : fills[yKeyIndex % fills.length];
        const stroke = (_b = marker.stroke) !== null && _b !== void 0 ? _b : strokes[yKeyIndex % fills.length];
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
    validation_1.Validate(validation_1.COLOR_STRING_ARRAY)
], AreaSeries.prototype, "fills", void 0);
__decorate([
    validation_1.Validate(validation_1.COLOR_STRING_ARRAY)
], AreaSeries.prototype, "strokes", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0, 1))
], AreaSeries.prototype, "fillOpacity", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0, 1))
], AreaSeries.prototype, "strokeOpacity", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_LINE_DASH)
], AreaSeries.prototype, "lineDash", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], AreaSeries.prototype, "lineDashOffset", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_STRING)
], AreaSeries.prototype, "xKey", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_STRING)
], AreaSeries.prototype, "xName", void 0);
__decorate([
    validation_1.Validate(validation_1.STRING_ARRAY)
], AreaSeries.prototype, "_yKeys", void 0);
__decorate([
    validation_1.Validate(validation_1.BOOLEAN_ARRAY)
], AreaSeries.prototype, "_visibles", void 0);
__decorate([
    validation_1.Validate(validation_1.STRING_ARRAY)
], AreaSeries.prototype, "yNames", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_NUMBER())
], AreaSeries.prototype, "_normalizedTo", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], AreaSeries.prototype, "strokeWidth", void 0);
exports.AreaSeries = AreaSeries;
