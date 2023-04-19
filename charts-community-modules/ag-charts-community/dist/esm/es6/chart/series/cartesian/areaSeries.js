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
import { SeriesTooltip, keyProperty, valueProperty, sumProperties } from '../series';
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
import { BOOLEAN_ARRAY, NUMBER, OPT_FUNCTION, OPT_LINE_DASH, OPT_STRING, STRING, STRING_ARRAY, COLOR_STRING_ARRAY, Validate, OPT_NUMBER, } from '../../../util/validation';
import { LogAxis } from '../../axis/logAxis';
import { DataModel, SUM_VALUE_EXTENT } from '../../data/dataModel';
import { TimeAxis } from '../../axis/timeAxis';
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
    constructor() {
        super({
            pathsPerSeries: 2,
            pathsZIndexSubOrderOffset: [0, 1000],
            hasMarkers: true,
            renderLayerPerSubSeries: false,
            directionKeys: {
                x: ['xKey'],
                y: ['yKeys'],
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
        this._xKey = '';
        this.xName = '';
        this._yKeys = [];
        this._visibles = [];
        this.yNames = [];
        this.strokeWidth = 2;
        this.shadow = undefined;
        const { marker, label } = this;
        marker.enabled = false;
        label.enabled = false;
    }
    set xKey(value) {
        this._xKey = value;
        this.processedData = undefined;
    }
    get xKey() {
        return this._xKey;
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
            this.dataModel = new DataModel({
                props: [
                    keyProperty(xKey, isContinuousX),
                    ...enabledYKeys.map((yKey) => valueProperty(yKey, isContinuousY, {
                        missingValue: NaN,
                        invalidValue: undefined,
                    })),
                    sumProperties(enabledYKeys),
                    SUM_VALUE_EXTENT,
                ],
                groupByKeys: true,
                dataVisible: this.visible && enabledYKeys.length > 0,
                normaliseTo,
            });
            this.processedData = this.dataModel.processData(data);
        });
    }
    getDomain(direction) {
        const { processedData, xAxis, yAxis } = this;
        if (!processedData)
            return [];
        const { defs: { keys: [keyDef], }, domain: { keys: [keys], values: [yExtent], }, reduced: { [SUM_VALUE_EXTENT.property]: ySumExtent } = {}, } = processedData;
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
        return __awaiter(this, void 0, void 0, function* () {
            const { xAxis, yAxis, data, processedData: { data: groupedData } = {} } = this;
            if (!xAxis || !yAxis || !data) {
                return [];
            }
            const contexts = [];
            const { yKeys, xKey, marker, label, fills, strokes, id: seriesId } = this;
            const { scale: xScale } = xAxis;
            const { scale: yScale } = yAxis;
            const continuousY = yScale instanceof ContinuousScale;
            const xOffset = (xScale.bandwidth || 0) / 2;
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
                const yKeyDataIndex = (_a = this.dataModel) === null || _a === void 0 ? void 0 : _a.resolveProcessedDataIndex(yKey);
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
                            labelText = label.formatter({ value: yDatum, seriesId });
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
    updatePaths(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const { contextData: { fillSelectionData, strokeSelectionData }, paths: [fill, stroke], } = opts;
            fill.datum = fillSelectionData;
            fill.tag = AreaSeriesTag.Fill;
            fill.lineJoin = 'round';
            fill.stroke = undefined;
            fill.pointerEvents = PointerEvents.None;
            stroke.datum = strokeSelectionData;
            stroke.tag = AreaSeriesTag.Stroke;
            stroke.fill = undefined;
            stroke.lineJoin = stroke.lineCap = 'round';
            stroke.pointerEvents = PointerEvents.None;
        });
    }
    updatePathNodes(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const { paths: [fill, stroke], seriesIdx, itemId, } = opts;
            const { strokes, fills, fillOpacity, strokeOpacity, strokeWidth, shadow } = this;
            {
                const { datum: { points }, } = fill;
                fill.fill = fills[seriesIdx % fills.length];
                fill.fillOpacity = fillOpacity;
                fill.strokeOpacity = strokeOpacity;
                fill.strokeWidth = strokeWidth;
                fill.lineDash = this.lineDash;
                fill.lineDashOffset = this.lineDashOffset;
                fill.fillShadow = shadow;
                const path = fill.path;
                path.clear({ trackChanges: true });
                let i = 0;
                for (const p of points) {
                    if (i++ > 0) {
                        path.lineTo(p.x, p.y);
                    }
                    else {
                        path.moveTo(p.x, p.y);
                    }
                }
                path.closePath();
                fill.checkPathDirty();
            }
            {
                const { datum: { points, yValues }, } = stroke;
                let moveTo = true;
                stroke.stroke = strokes[seriesIdx % strokes.length];
                stroke.strokeWidth = this.getStrokeWidth(this.strokeWidth, { itemId });
                stroke.strokeOpacity = strokeOpacity;
                stroke.lineDash = this.lineDash;
                stroke.lineDashOffset = this.lineDashOffset;
                const path = stroke.path;
                path.clear({ trackChanges: true });
                let i = 0;
                for (const p of points) {
                    if (yValues[i++] === undefined) {
                        moveTo = true;
                    }
                    else if (moveTo) {
                        path.moveTo(p.x, p.y);
                        moveTo = false;
                    }
                    else {
                        path.lineTo(p.x, p.y);
                    }
                }
                stroke.checkPathDirty();
            }
        });
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
        return __awaiter(this, void 0, void 0, function* () {
            const { markerSelection, isHighlight: isDatumHighlighted } = opts;
            const { id: seriesId, xKey, marker, seriesItemEnabled, yKeys, fills, strokes, fillOpacity: seriesFillOpacity, marker: { fillOpacity: markerFillOpacity = seriesFillOpacity }, strokeOpacity, highlightStyle: { item: { fill: highlightedFill, fillOpacity: highlightFillOpacity = markerFillOpacity, stroke: highlightedStroke, strokeWidth: highlightedDatumStrokeWidth, }, }, } = this;
            const { size, formatter } = marker;
            const markerStrokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : this.strokeWidth;
            const customMarker = typeof marker.shape === 'function';
            markerSelection.each((node, datum) => {
                var _a, _b;
                const yKeyIndex = yKeys.indexOf(datum.yKey);
                const fill = isDatumHighlighted && highlightedFill !== undefined
                    ? highlightedFill
                    : marker.fill || fills[yKeyIndex % fills.length];
                const fillOpacity = isDatumHighlighted ? highlightFillOpacity : markerFillOpacity;
                const stroke = isDatumHighlighted && highlightedStroke !== undefined
                    ? highlightedStroke
                    : marker.stroke || strokes[yKeyIndex % fills.length];
                const strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                    ? highlightedDatumStrokeWidth
                    : markerStrokeWidth;
                let format = undefined;
                if (formatter) {
                    format = formatter({
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
                node.fill = (format && format.fill) || fill;
                node.stroke = (format && format.stroke) || stroke;
                node.strokeWidth = format && format.strokeWidth !== undefined ? format.strokeWidth : strokeWidth;
                node.fillOpacity = fillOpacity !== null && fillOpacity !== void 0 ? fillOpacity : 1;
                node.strokeOpacity = (_b = (_a = marker.strokeOpacity) !== null && _a !== void 0 ? _a : strokeOpacity) !== null && _b !== void 0 ? _b : 1;
                node.size = format && format.size !== undefined ? format.size : size;
                node.translationX = datum.point.x;
                node.translationY = datum.point.y;
                node.visible =
                    node.size > 0 && !!seriesItemEnabled.get(datum.yKey) && !isNaN(datum.point.x) && !isNaN(datum.point.y);
                if (!customMarker || node.dirtyPath) {
                    return;
                }
                // Only for cutom marker shapes
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
        return new CartesianSeriesNodeClickEvent(this.xKey, datum.yKey, event, datum, this);
    }
    getNodeDoubleClickEvent(event, datum) {
        return new CartesianSeriesNodeDoubleClickEvent(this.xKey, datum.yKey, event, datum, this);
    }
    getTooltipHtml(nodeDatum) {
        var _a, _b, _c;
        const { xKey, id: seriesId } = this;
        const { yKey } = nodeDatum;
        const yKeyDataIndex = (_a = this.dataModel) === null || _a === void 0 ? void 0 : _a.resolveProcessedDataIndex(yKey);
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
        const strokeWidth = markerStrokeWidth !== undefined ? markerStrokeWidth : this.strokeWidth;
        const fill = markerFill || fills[yKeyIndex % fills.length];
        const stroke = markerStroke || strokes[yKeyIndex % fills.length];
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
        const color = (format && format.fill) || fill;
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
        var _a, _b;
        const { data, id, xKey, yKeys, yNames, seriesItemEnabled, marker, fills, strokes, fillOpacity, strokeOpacity } = this;
        if (!data || !data.length || !xKey || !yKeys.length) {
            return [];
        }
        const legendData = [];
        // Area stacks should be listed in the legend in reverse order, for symmetry with the
        // vertical stack display order.
        for (let index = yKeys.length - 1; index >= 0; index--) {
            const yKey = yKeys[index];
            legendData.push({
                id,
                itemId: yKey,
                seriesId: id,
                enabled: seriesItemEnabled.get(yKey) || false,
                label: {
                    text: yNames[index] || yKeys[index],
                },
                marker: {
                    shape: marker.shape,
                    fill: marker.fill || fills[index % fills.length],
                    stroke: marker.stroke || strokes[index % strokes.length],
                    fillOpacity: (_a = marker.fillOpacity) !== null && _a !== void 0 ? _a : fillOpacity,
                    strokeOpacity: (_b = marker.strokeOpacity) !== null && _b !== void 0 ? _b : strokeOpacity,
                },
            });
        }
        return legendData;
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
    Validate(STRING)
], AreaSeries.prototype, "_xKey", void 0);
__decorate([
    Validate(STRING)
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
