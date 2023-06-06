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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var AreaSeriesLabel = /** @class */ (function (_super) {
    __extends(AreaSeriesLabel, _super);
    function AreaSeriesLabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.formatter = undefined;
        return _this;
    }
    __decorate([
        Validate(OPT_FUNCTION)
    ], AreaSeriesLabel.prototype, "formatter", void 0);
    return AreaSeriesLabel;
}(Label));
var AreaSeriesTooltip = /** @class */ (function (_super) {
    __extends(AreaSeriesTooltip, _super);
    function AreaSeriesTooltip() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.renderer = undefined;
        _this.format = undefined;
        return _this;
    }
    __decorate([
        Validate(OPT_FUNCTION)
    ], AreaSeriesTooltip.prototype, "renderer", void 0);
    __decorate([
        Validate(OPT_STRING)
    ], AreaSeriesTooltip.prototype, "format", void 0);
    return AreaSeriesTooltip;
}(SeriesTooltip));
var AreaSeriesTag;
(function (AreaSeriesTag) {
    AreaSeriesTag[AreaSeriesTag["Fill"] = 0] = "Fill";
    AreaSeriesTag[AreaSeriesTag["Stroke"] = 1] = "Stroke";
    AreaSeriesTag[AreaSeriesTag["Marker"] = 2] = "Marker";
    AreaSeriesTag[AreaSeriesTag["Label"] = 3] = "Label";
})(AreaSeriesTag || (AreaSeriesTag = {}));
var AreaSeries = /** @class */ (function (_super) {
    __extends(AreaSeries, _super);
    function AreaSeries(moduleCtx) {
        var _a, _b;
        var _this = _super.call(this, {
            moduleCtx: moduleCtx,
            pathsPerSeries: 2,
            pathsZIndexSubOrderOffset: [0, 1000],
            hasMarkers: true,
            directionKeys: (_a = {},
                _a[ChartAxisDirection.X] = ['xKey'],
                _a[ChartAxisDirection.Y] = ['yKeys'],
                _a),
            directionNames: (_b = {},
                _b[ChartAxisDirection.X] = ['xName'],
                _b[ChartAxisDirection.Y] = ['yNames'],
                _b),
        }) || this;
        _this.tooltip = new AreaSeriesTooltip();
        _this.marker = new CartesianSeriesMarker();
        _this.label = new AreaSeriesLabel();
        _this.fills = ['#c16068', '#a2bf8a', '#ebcc87', '#80a0c3', '#b58dae', '#85c0d1'];
        _this.strokes = ['#874349', '#718661', '#a48f5f', '#5a7088', '#7f637a', '#5d8692'];
        _this.fillOpacity = 1;
        _this.strokeOpacity = 1;
        _this.lineDash = [0];
        _this.lineDashOffset = 0;
        _this.xKey = undefined;
        _this.xName = undefined;
        _this._yKeys = [];
        _this._visibles = [];
        _this.yNames = [];
        _this.strokeWidth = 2;
        _this.shadow = undefined;
        var _c = _this, marker = _c.marker, label = _c.label;
        marker.enabled = false;
        label.enabled = false;
        return _this;
    }
    Object.defineProperty(AreaSeries.prototype, "yKeys", {
        get: function () {
            return this._yKeys;
        },
        set: function (values) {
            if (!areArrayItemsStrictlyEqual(this._yKeys, values)) {
                this._yKeys = values;
                this.processedData = undefined;
                this.processSeriesItemEnabled();
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AreaSeries.prototype, "visibles", {
        get: function () {
            return this._visibles;
        },
        set: function (visibles) {
            this._visibles = visibles;
            this.processSeriesItemEnabled();
        },
        enumerable: false,
        configurable: true
    });
    AreaSeries.prototype.processSeriesItemEnabled = function () {
        var _a = this, seriesItemEnabled = _a.seriesItemEnabled, _b = _a._visibles, visibles = _b === void 0 ? [] : _b;
        seriesItemEnabled.clear();
        this._yKeys.forEach(function (key, idx) { var _a; return seriesItemEnabled.set(key, (_a = visibles[idx]) !== null && _a !== void 0 ? _a : true); });
    };
    Object.defineProperty(AreaSeries.prototype, "normalizedTo", {
        get: function () {
            return this._normalizedTo;
        },
        set: function (value) {
            var absValue = value ? Math.abs(value) : undefined;
            if (this._normalizedTo !== absValue) {
                this._normalizedTo = absValue;
            }
        },
        enumerable: false,
        configurable: true
    });
    AreaSeries.prototype.processData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, xKey, yKeys, seriesItemEnabled, xAxis, yAxis, normalizedTo, data, isContinuousX, isContinuousY, enabledYKeys, normaliseTo, extraProps;
            return __generator(this, function (_b) {
                _a = this, xKey = _a.xKey, yKeys = _a.yKeys, seriesItemEnabled = _a.seriesItemEnabled, xAxis = _a.xAxis, yAxis = _a.yAxis, normalizedTo = _a.normalizedTo;
                data = xKey && yKeys.length && this.data ? this.data : [];
                isContinuousX = (xAxis === null || xAxis === void 0 ? void 0 : xAxis.scale) instanceof ContinuousScale;
                isContinuousY = (yAxis === null || yAxis === void 0 ? void 0 : yAxis.scale) instanceof ContinuousScale;
                enabledYKeys = __spreadArray([], __read(seriesItemEnabled.entries())).filter(function (_a) {
                    var _b = __read(_a, 2), enabled = _b[1];
                    return enabled;
                }).map(function (_a) {
                    var _b = __read(_a, 1), yKey = _b[0];
                    return yKey;
                });
                normaliseTo = normalizedTo && isFinite(normalizedTo) ? normalizedTo : undefined;
                extraProps = [];
                if (normaliseTo) {
                    extraProps.push(normaliseGroupTo(enabledYKeys, normaliseTo, 'sum'));
                }
                this.dataModel = new DataModel({
                    props: __spreadArray(__spreadArray(__spreadArray([
                        keyProperty(xKey, isContinuousX, { id: 'xValue' })
                    ], __read(enabledYKeys.map(function (yKey) {
                        return valueProperty(yKey, isContinuousY, {
                            id: "yValue-" + yKey,
                            missingValue: NaN,
                            invalidValue: undefined,
                        });
                    }))), [
                        sum(enabledYKeys)
                    ]), __read(extraProps)),
                    groupByKeys: true,
                    dataVisible: this.visible && enabledYKeys.length > 0,
                });
                this.processedData = this.dataModel.processData(data);
                return [2 /*return*/];
            });
        });
    };
    AreaSeries.prototype.getDomain = function (direction) {
        var _a = this, processedData = _a.processedData, xAxis = _a.xAxis, yAxis = _a.yAxis;
        if (!processedData)
            return [];
        var _b = __read(processedData.defs.keys, 1), keyDef = _b[0], _c = processedData.domain, _d = __read(_c.keys, 1), keys = _d[0], _e = __read(_c.values, 1), yExtent = _e[0], _f = _c.aggValues, _g = _f === void 0 ? [] : _f, _h = __read(_g, 1), ySumExtent = _h[0];
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
    };
    AreaSeries.prototype.createNodeData = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, xAxis, yAxis, data, _c, _d, groupedData, callbackCache, contexts, _e, yKeys, _f, xKey, marker, label, fills, strokes, seriesId, xScale, yScale, continuousY, xOffset, xDataCount, cumulativePathValues, cumulativeMarkerValues, createPathCoordinates, createMarkerCoordinate;
            var _this = this;
            return __generator(this, function (_g) {
                _b = this, xAxis = _b.xAxis, yAxis = _b.yAxis, data = _b.data, _c = _b.processedData, _d = _c === void 0 ? {} : _c, groupedData = _d.data, callbackCache = _b.ctx.callbackCache;
                if (!xAxis || !yAxis || !data) {
                    return [2 /*return*/, []];
                }
                contexts = [];
                _e = this, yKeys = _e.yKeys, _f = _e.xKey, xKey = _f === void 0 ? '' : _f, marker = _e.marker, label = _e.label, fills = _e.fills, strokes = _e.strokes, seriesId = _e.id;
                xScale = xAxis.scale;
                yScale = yAxis.scale;
                continuousY = yScale instanceof ContinuousScale;
                xOffset = ((_a = xScale.bandwidth) !== null && _a !== void 0 ? _a : 0) / 2;
                xDataCount = data.length;
                cumulativePathValues = new Array(xDataCount)
                    .fill(null)
                    .map(function () { return ({ left: 0, right: 0 }); });
                cumulativeMarkerValues = new Array(xDataCount).fill(0);
                createPathCoordinates = function (xDatum, yDatum, idx, side) {
                    var x = xScale.convert(xDatum) + xOffset;
                    var prevY = cumulativePathValues[idx][side];
                    var currY = cumulativePathValues[idx][side] + yDatum;
                    var prevYCoordinate = yScale.convert(prevY, { strict: false });
                    var currYCoordinate = yScale.convert(currY, { strict: false });
                    cumulativePathValues[idx][side] = currY;
                    return [
                        { x: x, y: currYCoordinate, size: marker.size },
                        { x: x, y: prevYCoordinate, size: marker.size },
                    ];
                };
                createMarkerCoordinate = function (xDatum, yDatum, idx, rawYDatum) {
                    var currY;
                    // if not normalized, the invalid data points will be processed as `undefined` in processData()
                    // if normalized, the invalid data points will be processed as 0 rather than `undefined`
                    // check if unprocessed datum is valid as we only want to show markers for valid points
                    var normalized = _this.normalizedTo && isFinite(_this.normalizedTo);
                    var normalizedAndValid = normalized && continuousY && isContinuous(rawYDatum);
                    var valid = (!normalized && !isNaN(rawYDatum)) || normalizedAndValid;
                    if (valid) {
                        currY = cumulativeMarkerValues[idx] += yDatum;
                    }
                    var x = xScale.convert(xDatum) + xOffset;
                    var y = yScale.convert(currY, { strict: false });
                    return { x: x, y: y, size: marker.size };
                };
                yKeys.forEach(function (yKey, seriesIdx) {
                    var _a;
                    var yKeyDataIndex = (_a = _this.dataModel) === null || _a === void 0 ? void 0 : _a.resolveProcessedDataIndexById("yValue-" + yKey);
                    var labelSelectionData = [];
                    var markerSelectionData = [];
                    var strokeSelectionData = { itemId: yKey, points: [], yValues: [] };
                    var fillSelectionData = { itemId: yKey, points: [] };
                    contexts[seriesIdx] = {
                        itemId: yKey,
                        fillSelectionData: fillSelectionData,
                        labelData: labelSelectionData,
                        nodeData: markerSelectionData,
                        strokeSelectionData: strokeSelectionData,
                    };
                    if (!yKeyDataIndex) {
                        return;
                    }
                    var fillPoints = fillSelectionData.points;
                    var fillPhantomPoints = [];
                    var strokePoints = strokeSelectionData.points;
                    var yValues = strokeSelectionData.yValues;
                    var datumIdx = -1;
                    groupedData === null || groupedData === void 0 ? void 0 : groupedData.forEach(function (datumGroup, dataIdx) {
                        var _a = __read(datumGroup.keys, 1), xDatum = _a[0], datumArray = datumGroup.datum, valuesArray = datumGroup.values;
                        valuesArray.forEach(function (values, valueIdx) {
                            var _a;
                            datumIdx++;
                            var seriesDatum = datumArray[valueIdx];
                            var rawYDatum = values[yKeyDataIndex.index];
                            var yDatum = isNaN(rawYDatum) ? undefined : rawYDatum;
                            var nextValuesSameGroup = valueIdx < valuesArray.length - 1;
                            var nextDatumGroup = nextValuesSameGroup ? datumGroup : groupedData[dataIdx + 1];
                            var nextXDatum = nextDatumGroup === null || nextDatumGroup === void 0 ? void 0 : nextDatumGroup.keys[0];
                            var rawNextYIdx = nextValuesSameGroup ? valueIdx + 1 : 0;
                            var rawNextYDatum = nextDatumGroup === null || nextDatumGroup === void 0 ? void 0 : nextDatumGroup.values[rawNextYIdx][yKeyDataIndex.index];
                            var nextYDatum = isNaN(rawNextYDatum) ? undefined : rawNextYDatum;
                            // marker data
                            var point = createMarkerCoordinate(xDatum, +yDatum, datumIdx, seriesDatum[yKey]);
                            if (marker) {
                                markerSelectionData.push({
                                    index: datumIdx,
                                    series: _this,
                                    itemId: yKey,
                                    datum: seriesDatum,
                                    nodeMidPoint: { x: point.x, y: point.y },
                                    cumulativeValue: cumulativeMarkerValues[datumIdx],
                                    yValue: yDatum,
                                    yKey: yKey,
                                    xKey: xKey,
                                    point: point,
                                    fill: fills[seriesIdx % fills.length],
                                    stroke: strokes[seriesIdx % strokes.length],
                                });
                            }
                            // label data
                            var labelText;
                            if (label.formatter) {
                                labelText = (_a = callbackCache.call(label.formatter, { value: yDatum, seriesId: seriesId })) !== null && _a !== void 0 ? _a : '';
                            }
                            else {
                                labelText = isNumber(yDatum) ? Number(yDatum).toFixed(2) : String(yDatum);
                            }
                            if (label) {
                                labelSelectionData.push({
                                    index: datumIdx,
                                    itemId: yKey,
                                    point: point,
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
                            var windowX = [xDatum, nextXDatum];
                            var windowY = [yDatum, nextYDatum];
                            if (windowX.some(function (v) { return v == undefined; })) {
                                return;
                            }
                            if (windowY.some(function (v) { return v == undefined; })) {
                                windowY[0] = 0;
                                windowY[1] = 0;
                            }
                            var currCoordinates = createPathCoordinates(windowX[0], +windowY[0], datumIdx, 'right');
                            fillPoints.push(currCoordinates[0]);
                            fillPhantomPoints.push(currCoordinates[1]);
                            var nextCoordinates = createPathCoordinates(windowX[1], +windowY[1], datumIdx, 'left');
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
                    for (var i = fillPhantomPoints.length - 1; i >= 0; i--) {
                        fillPoints.push(fillPhantomPoints[i]);
                    }
                });
                return [2 /*return*/, contexts];
            });
        });
    };
    AreaSeries.prototype.isPathOrSelectionDirty = function () {
        return this.marker.isDirty();
    };
    AreaSeries.prototype.markerFactory = function () {
        var shape = this.marker.shape;
        var MarkerShape = getMarker(shape);
        return new MarkerShape();
    };
    AreaSeries.prototype.updateMarkerSelection = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var nodeData, markerSelection, enabled, data;
            return __generator(this, function (_a) {
                nodeData = opts.nodeData, markerSelection = opts.markerSelection;
                enabled = this.marker.enabled;
                data = enabled && nodeData ? nodeData : [];
                if (this.marker.isDirty()) {
                    markerSelection.clear();
                }
                return [2 /*return*/, markerSelection.update(data, function (marker) {
                        marker.tag = AreaSeriesTag.Marker;
                    })];
            });
        });
    };
    AreaSeries.prototype.updateMarkerNodes = function (opts) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var markerSelection, isDatumHighlighted, _b, seriesId, _c, xKey, marker, seriesItemEnabled, yKeys, fills, strokes, seriesFillOpacity, _d, markerFillOpacity, strokeOpacity, _e, highlightedFill, _f, highlightFillOpacity, highlightedStroke, highlightedDatumStrokeWidth, callbackCache, size, formatter, markerStrokeWidth, customMarker;
            return __generator(this, function (_g) {
                markerSelection = opts.markerSelection, isDatumHighlighted = opts.isHighlight;
                _b = this, seriesId = _b.id, _c = _b.xKey, xKey = _c === void 0 ? '' : _c, marker = _b.marker, seriesItemEnabled = _b.seriesItemEnabled, yKeys = _b.yKeys, fills = _b.fills, strokes = _b.strokes, seriesFillOpacity = _b.fillOpacity, _d = _b.marker.fillOpacity, markerFillOpacity = _d === void 0 ? seriesFillOpacity : _d, strokeOpacity = _b.strokeOpacity, _e = _b.highlightStyle.item, highlightedFill = _e.fill, _f = _e.fillOpacity, highlightFillOpacity = _f === void 0 ? markerFillOpacity : _f, highlightedStroke = _e.stroke, highlightedDatumStrokeWidth = _e.strokeWidth, callbackCache = _b.ctx.callbackCache;
                size = marker.size, formatter = marker.formatter;
                markerStrokeWidth = (_a = marker.strokeWidth) !== null && _a !== void 0 ? _a : this.strokeWidth;
                customMarker = typeof marker.shape === 'function';
                markerSelection.each(function (node, datum) {
                    var _a, _b, _c, _d, _e, _f, _g, _h;
                    var yKeyIndex = yKeys.indexOf(datum.yKey);
                    var fill = isDatumHighlighted && highlightedFill !== undefined
                        ? highlightedFill
                        : (_a = marker.fill) !== null && _a !== void 0 ? _a : fills[yKeyIndex % fills.length];
                    var fillOpacity = isDatumHighlighted ? highlightFillOpacity : markerFillOpacity;
                    var stroke = isDatumHighlighted && highlightedStroke !== undefined
                        ? highlightedStroke
                        : (_b = marker.stroke) !== null && _b !== void 0 ? _b : strokes[yKeyIndex % fills.length];
                    var strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                        ? highlightedDatumStrokeWidth
                        : markerStrokeWidth;
                    var format = undefined;
                    if (formatter) {
                        format = callbackCache.call(formatter, {
                            datum: datum.datum,
                            xKey: xKey,
                            yKey: datum.yKey,
                            fill: fill,
                            stroke: stroke,
                            strokeWidth: strokeWidth,
                            size: size,
                            highlighted: isDatumHighlighted,
                            seriesId: seriesId,
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
                return [2 /*return*/];
            });
        });
    };
    AreaSeries.prototype.updateLabelSelection = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var labelData, labelSelection;
            return __generator(this, function (_a) {
                labelData = opts.labelData, labelSelection = opts.labelSelection;
                return [2 /*return*/, labelSelection.update(labelData, function (text) {
                        text.tag = AreaSeriesTag.Label;
                    })];
            });
        });
    };
    AreaSeries.prototype.updateLabelNodes = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var labelSelection, _a, labelEnabled, fontStyle, fontWeight, fontSize, fontFamily, color;
            return __generator(this, function (_b) {
                labelSelection = opts.labelSelection;
                _a = this.label, labelEnabled = _a.enabled, fontStyle = _a.fontStyle, fontWeight = _a.fontWeight, fontSize = _a.fontSize, fontFamily = _a.fontFamily, color = _a.color;
                labelSelection.each(function (text, datum) {
                    var point = datum.point, label = datum.label;
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
                return [2 /*return*/];
            });
        });
    };
    AreaSeries.prototype.getNodeClickEvent = function (event, datum) {
        var _a;
        return new CartesianSeriesNodeClickEvent((_a = this.xKey) !== null && _a !== void 0 ? _a : '', datum.yKey, event, datum, this);
    };
    AreaSeries.prototype.getNodeDoubleClickEvent = function (event, datum) {
        var _a;
        return new CartesianSeriesNodeDoubleClickEvent((_a = this.xKey) !== null && _a !== void 0 ? _a : '', datum.yKey, event, datum, this);
    };
    AreaSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var _a, _b, _c, _d;
        var _e = this, xKey = _e.xKey, seriesId = _e.id;
        var yKey = nodeDatum.yKey;
        var yKeyDataIndex = (_a = this.dataModel) === null || _a === void 0 ? void 0 : _a.resolveProcessedDataIndexById("yValue-" + yKey);
        if (!(xKey && yKey) || !yKeyDataIndex) {
            return '';
        }
        var datum = nodeDatum.datum;
        var xValue = datum[xKey];
        var yValue = datum[yKey];
        var _f = this, xAxis = _f.xAxis, yAxis = _f.yAxis, yKeys = _f.yKeys;
        if (!(xAxis && yAxis && isNumber(yValue)) || !yKeyDataIndex) {
            return '';
        }
        var _g = this, xName = _g.xName, yNames = _g.yNames, fills = _g.fills, strokes = _g.strokes, tooltip = _g.tooltip, marker = _g.marker;
        var size = marker.size, markerFormatter = marker.formatter, markerStrokeWidth = marker.strokeWidth, markerFill = marker.fill, markerStroke = marker.stroke;
        var xString = xAxis.formatDatum(xValue);
        var yString = yAxis.formatDatum(yValue);
        var yKeyIndex = yKeys.indexOf(yKey);
        var processedYValue = (_c = (_b = this.processedData) === null || _b === void 0 ? void 0 : _b.data[nodeDatum.index]) === null || _c === void 0 ? void 0 : _c.values[0][yKeyDataIndex === null || yKeyDataIndex === void 0 ? void 0 : yKeyDataIndex.index];
        var yName = yNames[yKeyIndex];
        var title = sanitizeHtml(yName);
        var content = sanitizeHtml(xString + ': ' + yString);
        var strokeWidth = markerStrokeWidth !== null && markerStrokeWidth !== void 0 ? markerStrokeWidth : this.strokeWidth;
        var fill = markerFill !== null && markerFill !== void 0 ? markerFill : fills[yKeyIndex % fills.length];
        var stroke = markerStroke !== null && markerStroke !== void 0 ? markerStroke : strokes[yKeyIndex % fills.length];
        var format = undefined;
        if (markerFormatter) {
            format = markerFormatter({
                datum: datum,
                xKey: xKey,
                yKey: yKey,
                fill: fill,
                stroke: stroke,
                strokeWidth: strokeWidth,
                size: size,
                highlighted: false,
                seriesId: seriesId,
            });
        }
        var color = (_d = format === null || format === void 0 ? void 0 : format.fill) !== null && _d !== void 0 ? _d : fill;
        var defaults = {
            title: title,
            backgroundColor: color,
            content: content,
        };
        var tooltipRenderer = tooltip.renderer, tooltipFormat = tooltip.format;
        if (tooltipFormat || tooltipRenderer) {
            var params = {
                datum: datum,
                xKey: xKey,
                xName: xName,
                xValue: xValue,
                yKey: yKey,
                yValue: yValue,
                processedYValue: processedYValue,
                yName: yName,
                color: color,
                title: title,
                seriesId: seriesId,
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
    };
    AreaSeries.prototype.getLegendData = function () {
        var _a, _b, _c, _d, _e;
        var _f = this, data = _f.data, id = _f.id, xKey = _f.xKey, yKeys = _f.yKeys, yNames = _f.yNames, seriesItemEnabled = _f.seriesItemEnabled, marker = _f.marker, fills = _f.fills, strokes = _f.strokes, fillOpacity = _f.fillOpacity, strokeOpacity = _f.strokeOpacity;
        if (!(data === null || data === void 0 ? void 0 : data.length) || !xKey || !yKeys.length) {
            return [];
        }
        var legendData = [];
        // Area stacks should be listed in the legend in reverse order, for symmetry with the
        // vertical stack display order.
        for (var index = yKeys.length - 1; index >= 0; index--) {
            var yKey = yKeys[index];
            legendData.push({
                legendType: 'category',
                id: id,
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
    };
    AreaSeries.prototype.onLegendItemDoubleClick = function (event) {
        var _this = this;
        var enabled = event.enabled, itemId = event.itemId, series = event.series, numVisibleItems = event.numVisibleItems;
        var newEnableds = {};
        var totalVisibleItems = Object.values(numVisibleItems).reduce(function (p, v) { return p + v; }, 0);
        var singleEnabledWasClicked = totalVisibleItems === 1 && enabled;
        if (series.id === this.id) {
            var singleEnabledInEachSeries_1 = Object.values(numVisibleItems).filter(function (v) { return v === 1; }).length === Object.keys(numVisibleItems).length;
            this.yKeys.forEach(function (yKey) {
                var _a;
                var matches = yKey === itemId;
                var newEnabled = matches || singleEnabledWasClicked || (singleEnabledInEachSeries_1 && enabled);
                newEnableds[yKey] = (_a = newEnableds[yKey]) !== null && _a !== void 0 ? _a : newEnabled;
            });
        }
        else {
            this.yKeys.forEach(function (yKey) {
                newEnableds[yKey] = singleEnabledWasClicked;
            });
        }
        Object.keys(newEnableds).forEach(function (yKey) {
            _super.prototype.toggleSeriesItem.call(_this, yKey, newEnableds[yKey]);
        });
    };
    AreaSeries.prototype.animateEmptyUpdateReady = function (_a) {
        var _this = this;
        var markerSelections = _a.markerSelections, labelSelections = _a.labelSelections, contextData = _a.contextData, paths = _a.paths, seriesRect = _a.seriesRect;
        var _b = this, strokes = _b.strokes, fills = _b.fills, fillOpacity = _b.fillOpacity, lineDash = _b.lineDash, lineDashOffset = _b.lineDashOffset, strokeOpacity = _b.strokeOpacity, strokeWidth = _b.strokeWidth, shadow = _b.shadow;
        contextData.forEach(function (_a, seriesIdx) {
            var _b, _c, _d;
            var fillSelectionData = _a.fillSelectionData, strokeSelectionData = _a.strokeSelectionData, itemId = _a.itemId;
            var _e = __read(paths[seriesIdx], 2), fill = _e[0], stroke = _e[1];
            var duration = 1000;
            var markerDuration = 200;
            var animationOptions = {
                from: 0,
                to: (_b = seriesRect === null || seriesRect === void 0 ? void 0 : seriesRect.width) !== null && _b !== void 0 ? _b : 0,
                disableInteractions: true,
                duration: duration,
                ease: easing.linear,
                repeat: 0,
            };
            // Stroke
            {
                var points_1 = strokeSelectionData.points, yValues_1 = strokeSelectionData.yValues;
                stroke.tag = AreaSeriesTag.Stroke;
                stroke.fill = undefined;
                stroke.lineJoin = stroke.lineCap = 'round';
                stroke.pointerEvents = PointerEvents.None;
                stroke.stroke = strokes[seriesIdx % strokes.length];
                stroke.strokeWidth = _this.getStrokeWidth(_this.strokeWidth, { itemId: itemId });
                stroke.strokeOpacity = strokeOpacity;
                stroke.lineDash = lineDash;
                stroke.lineDashOffset = lineDashOffset;
                (_c = _this.animationManager) === null || _c === void 0 ? void 0 : _c.animate(_this.id + "_empty-update-ready_stroke_" + seriesIdx, __assign(__assign({}, animationOptions), { onUpdate: function (xValue) {
                        stroke.path.clear({ trackChanges: true });
                        var moveTo = true;
                        points_1.forEach(function (point, index) {
                            // Draw/move the full segment if past the end of this segment
                            if (yValues_1[index] === undefined || isNaN(point.x) || isNaN(point.y)) {
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
                                yValues_1[index] !== undefined &&
                                yValues_1[index - 1] !== undefined &&
                                points_1[index - 1].x <= xValue) {
                                // Draw/move partial line if in between the start and end of this segment
                                var start = points_1[index - 1];
                                var end = point;
                                var x = xValue;
                                var y = start.y + ((x - start.x) * (end.y - start.y)) / (end.x - start.x);
                                stroke.path.lineTo(x, y);
                            }
                        });
                        stroke.checkPathDirty();
                    } }));
            }
            // Fill
            {
                var allPoints = fillSelectionData.points;
                var points_2 = allPoints.slice(0, allPoints.length / 2);
                var bottomPoints_1 = allPoints.slice(allPoints.length / 2);
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
                (_d = _this.animationManager) === null || _d === void 0 ? void 0 : _d.animate(_this.id + "_empty-update-ready_fill_" + seriesIdx, __assign(__assign({}, animationOptions), { onUpdate: function (xValue) {
                        fill.path.clear({ trackChanges: true });
                        var x = 0;
                        var y = 0;
                        points_2.forEach(function (point, index) {
                            if (point.x <= xValue) {
                                // Draw/move the full segment if past the end of this segment
                                x = point.x;
                                y = point.y;
                                fill.path.lineTo(point.x, point.y);
                            }
                            else if (index > 0 && points_2[index - 1].x < xValue) {
                                // Draw/move partial line if in between the start and end of this segment
                                var start = points_2[index - 1];
                                var end = point;
                                x = xValue;
                                y = start.y + ((x - start.x) * (end.y - start.y)) / (end.x - start.x);
                                fill.path.lineTo(x, y);
                            }
                        });
                        bottomPoints_1.forEach(function (point, index) {
                            var reverseIndex = bottomPoints_1.length - index - 1;
                            if (point.x <= xValue) {
                                fill.path.lineTo(point.x, point.y);
                            }
                            else if (reverseIndex > 0 && points_2[reverseIndex - 1].x < xValue) {
                                var start = point;
                                var end = bottomPoints_1[index + 1];
                                var bottomY = start.y + ((x - start.x) * (end.y - start.y)) / (end.x - start.x);
                                fill.path.lineTo(x, bottomY);
                            }
                        });
                        if (bottomPoints_1.length > 0) {
                            fill.path.lineTo(bottomPoints_1[bottomPoints_1.length - 1].x, bottomPoints_1[bottomPoints_1.length - 1].y);
                        }
                        fill.path.closePath();
                        fill.checkPathDirty();
                    } }));
            }
            markerSelections[seriesIdx].each(function (marker, datum) {
                var _a, _b, _c, _d;
                var delay = (seriesRect === null || seriesRect === void 0 ? void 0 : seriesRect.width) ? (datum.point.x / seriesRect.width) * duration : 0;
                var format = _this.animateFormatter(datum);
                var size = (_b = (_a = datum.point) === null || _a === void 0 ? void 0 : _a.size) !== null && _b !== void 0 ? _b : 0;
                (_c = _this.animationManager) === null || _c === void 0 ? void 0 : _c.animate(_this.id + "_empty-update-ready_" + marker.id, __assign(__assign({}, animationOptions), { to: (_d = format === null || format === void 0 ? void 0 : format.size) !== null && _d !== void 0 ? _d : size, delay: delay, duration: markerDuration, onUpdate: function (size) {
                        marker.size = size;
                    } }));
            });
            labelSelections[seriesIdx].each(function (label, datum) {
                var _a;
                var delay = (seriesRect === null || seriesRect === void 0 ? void 0 : seriesRect.width) ? (datum.point.x / seriesRect.width) * duration : 0;
                (_a = _this.animationManager) === null || _a === void 0 ? void 0 : _a.animate(_this.id + "_empty-update-ready_" + label.id, {
                    from: 0,
                    to: 1,
                    delay: delay,
                    duration: markerDuration,
                    ease: easing.linear,
                    repeat: 0,
                    onUpdate: function (opacity) {
                        label.opacity = opacity;
                    },
                });
            });
        });
    };
    AreaSeries.prototype.animateReadyUpdate = function (_a) {
        var _this = this;
        var contextData = _a.contextData, paths = _a.paths;
        var _b = this, strokes = _b.strokes, fills = _b.fills, fillOpacity = _b.fillOpacity, lineDash = _b.lineDash, lineDashOffset = _b.lineDashOffset, strokeOpacity = _b.strokeOpacity, strokeWidth = _b.strokeWidth, shadow = _b.shadow;
        contextData.forEach(function (_a, seriesIdx) {
            var strokeSelectionData = _a.strokeSelectionData, fillSelectionData = _a.fillSelectionData, itemId = _a.itemId;
            var _b = __read(paths[seriesIdx], 2), fill = _b[0], stroke = _b[1];
            // Stroke
            stroke.stroke = strokes[seriesIdx % strokes.length];
            stroke.strokeWidth = _this.getStrokeWidth(_this.strokeWidth, { itemId: itemId });
            stroke.strokeOpacity = strokeOpacity;
            stroke.lineDash = lineDash;
            stroke.lineDashOffset = lineDashOffset;
            stroke.path.clear({ trackChanges: true });
            var moveTo = true;
            strokeSelectionData.points.forEach(function (point, index) {
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
            fillSelectionData.points.forEach(function (point) {
                fill.path.lineTo(point.x, point.y);
            });
            fill.path.closePath();
            fill.checkPathDirty();
        });
    };
    AreaSeries.prototype.animateFormatter = function (datum) {
        var _a, _b, _c;
        var _d = this, marker = _d.marker, fills = _d.fills, strokes = _d.strokes, _e = _d.xKey, xKey = _e === void 0 ? '' : _e, yKeys = _d.yKeys, seriesId = _d.id, callbackCache = _d.ctx.callbackCache;
        var size = marker.size, formatter = marker.formatter;
        var yKeyIndex = yKeys.indexOf(datum.yKey);
        var fill = (_a = marker.fill) !== null && _a !== void 0 ? _a : fills[yKeyIndex % fills.length];
        var stroke = (_b = marker.stroke) !== null && _b !== void 0 ? _b : strokes[yKeyIndex % fills.length];
        var strokeWidth = (_c = marker.strokeWidth) !== null && _c !== void 0 ? _c : this.strokeWidth;
        var format = undefined;
        if (formatter) {
            format = callbackCache.call(formatter, {
                datum: datum.datum,
                xKey: xKey,
                yKey: datum.yKey,
                fill: fill,
                stroke: stroke,
                strokeWidth: strokeWidth,
                size: size,
                highlighted: false,
                seriesId: seriesId,
            });
        }
        return format;
    };
    AreaSeries.prototype.isLabelEnabled = function () {
        return this.label.enabled;
    };
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
    return AreaSeries;
}(CartesianSeries));
export { AreaSeries };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJlYVNlcmllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9zZXJpZXMvY2FydGVzaWFuL2FyZWFTZXJpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxPQUFPLEVBQUUsYUFBYSxFQUF5QixXQUFXLEVBQUUsYUFBYSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRTdGLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUlwRCxPQUFPLEVBQ0gsZUFBZSxFQUNmLHFCQUFxQixFQUNyQiw2QkFBNkIsRUFFN0IsbUNBQW1DLEdBQ3RDLE1BQU0sbUJBQW1CLENBQUM7QUFDM0IsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDOUQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQzlDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUN0RCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDN0MsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDakUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRW5ELE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDcEMsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3RELE9BQU8sRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDN0QsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBRWpFLE9BQU8sRUFDSCxhQUFhLEVBQ2IsTUFBTSxFQUNO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