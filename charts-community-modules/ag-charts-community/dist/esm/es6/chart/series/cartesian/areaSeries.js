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
import { SeriesTooltip, keyProperty, valueProperty } from '../series';
import { PointerEvents } from '../../../scene/node';
import { CartesianSeries, CartesianSeriesMarker, CartesianSeriesNodeClickEvent, CartesianSeriesNodeDoubleClickEvent, } from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxisDirection';
import { getMarker } from '../../marker/util';
import { toTooltipHtml } from '../../tooltip/tooltip';
import { extent } from '../../../util/array';
import { areArrayItemsStrictlyEqual } from '../../../util/equal';
import { interpolate } from '../../../util/string';
import { Label } from '../../label';
import { sanitizeHtml } from '../../../util/sanitize';
import { isContinuous, isNumber } from '../../../util/value';
import { ContinuousScale } from '../../../scale/continuousScale';
import { BOOLEAN_ARRAY, NUMBER, OPT_FUNCTION, OPT_LINE_DASH, OPT_STRING, STRING_ARRAY, COLOR_STRING_ARRAY, Validate, OPT_NUMBER, } from '../../../util/validation';
import { LogAxis } from '../../axis/logAxis';
import { DataModel } from '../../data/dataModel';
import { TimeAxis } from '../../axis/timeAxis';
import { sum } from '../../data/aggregateFunctions';
import { normaliseGroupTo } from '../../data/processors';
import * as easing from '../../../motion/easing';
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
            directionKeys: {
                [ChartAxisDirection.X]: ['xKey'],
                [ChartAxisDirection.Y]: ['yKeys'],
            },
            directionNames: {
                [ChartAxisDirection.X]: ['xName'],
                [ChartAxisDirection.Y]: ['yNames'],
            },
        });
        this.tooltip = new AreaSeriesTooltip();
        this.marker = new CartesianSeriesMarker();
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
        if (!areArrayItemsStrictlyEqual(this._yKeys, values)) {
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
            const isContinuousX = (xAxis === null || xAxis === void 0 ? void 0 : xAxis.scale) instanceof ContinuousScale;
            const isContinuousY = (yAxis === null || yAxis === void 0 ? void 0 : yAxis.scale) instanceof ContinuousScale;
            const enabledYKeys = [...seriesItemEnabled.entries()].filter(([, enabled]) => enabled).map(([yKey]) => yKey);
            const normaliseTo = normalizedTo && isFinite(normalizedTo) ? normalizedTo : undefined;
            const extraProps = [];
            if (normaliseTo) {
                extraProps.push(normaliseGroupTo(enabledYKeys, normaliseTo, 'sum'));
            }
            this.dataModel = new DataModel({
                props: [
                    keyProperty(xKey, isContinuousX, { id: 'xValue' }),
                    ...enabledYKeys.map((yKey) => valueProperty(yKey, isContinuousY, {
                        id: `yValue-${yKey}`,
                        missingValue: NaN,
                        invalidValue: undefined,
                    })),
                    sum(enabledYKeys),
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
        if (direction === ChartAxisDirection.X) {
            if (keyDef.valueType === 'category') {
                return keys;
            }
            return this.fixNumericExtent(extent(keys), xAxis);
        }
        else if (yAxis instanceof LogAxis || yAxis instanceof TimeAxis) {
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
            const continuousY = yScale instanceof ContinuousScale;
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
                const normalizedAndValid = normalized && continuousY && isContinuous(rawYDatum);
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
                            labelText = isNumber(yDatum) ? Number(yDatum).toFixed(2) : String(yDatum);
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
        return new CartesianSeriesNodeClickEvent((_a = this.xKey) !== null && _a !== void 0 ? _a : '', datum.yKey, event, datum, this);
    }
    getNodeDoubleClickEvent(event, datum) {
        var _a;
        return new CartesianSeriesNodeDoubleClickEvent((_a = this.xKey) !== null && _a !== void 0 ? _a : '', datum.yKey, event, datum, this);
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
        if (!(xAxis && yAxis && isNumber(yValue)) || !yKeyDataIndex) {
            return '';
        }
        const { xName, yNames, fills, strokes, tooltip, marker } = this;
        const { size, formatter: markerFormatter, strokeWidth: markerStrokeWidth, fill: markerFill, stroke: markerStroke, } = marker;
        const xString = xAxis.formatDatum(xValue);
        const yString = yAxis.formatDatum(yValue);
        const yKeyIndex = yKeys.indexOf(yKey);
        const processedYValue = (_c = (_b = this.processedData) === null || _b === void 0 ? void 0 : _b.data[nodeDatum.index]) === null || _c === void 0 ? void 0 : _c.values[0][yKeyDataIndex === null || yKeyDataIndex === void 0 ? void 0 : yKeyDataIndex.index];
        const yName = yNames[yKeyIndex];
        const title = sanitizeHtml(yName);
        const content = sanitizeHtml(xString + ': ' + yString);
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
                stroke.pointerEvents = PointerEvents.None;
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
                fill.pointerEvents = PointerEvents.None;
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
    Validate(COLOR_STRING_ARRAY)
], AreaSeries.prototype, "fills", void 0);
__decorate([
    Validate(COLOR_STRING_ARRAY)
], AreaSeries.prototype, "strokes", void 0);
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
    Validate(STRING_ARRAY)
], AreaSeries.prototype, "_yKeys", void 0);
__decorate([
    Validate(BOOLEAN_ARRAY)
], AreaSeries.prototype, "_visibles", void 0);
__decorate([
    Validate(STRING_ARRAY)
], AreaSeries.prototype, "yNames", void 0);
__decorate([
    Validate(OPT_NUMBER())
], AreaSeries.prototype, "_normalizedTo", void 0);
__decorate([
    Validate(NUMBER(0))
], AreaSeries.prototype, "strokeWidth", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJlYVNlcmllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9zZXJpZXMvY2FydGVzaWFuL2FyZWFTZXJpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsT0FBTyxFQUFFLGFBQWEsRUFBeUIsV0FBVyxFQUFFLGFBQWEsRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUU3RixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFJcEQsT0FBTyxFQUNILGVBQWUsRUFDZixxQkFBcUIsRUFDckIsNkJBQTZCLEVBRTdCLG1DQUFtQyxHQUN0QyxNQUFNLG1CQUFtQixDQUFDO0FBQzNCLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQzlELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUM5QyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDdEQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQzdDLE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ2pFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUVuRCxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUN0RCxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQzdELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUVqRSxPQUFPLEVBQ0gsYUFBYSxFQUNiLE1BQU0sRUFDTixZQUFZLEVBQ1osYUFBYSxFQUNiLFVBQVUsRUFDVixZQUFZLEVBQ1osa0JBQWtCLEVBQ2xCLFFBQVEsRUFDUixVQUFVLEdBQ2Is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