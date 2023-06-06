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
import { SeriesTooltip, SeriesNodePickMode, valueProperty } from '../series';
import { ColorScale } from '../../../scale/colorScale';
import { LinearScale } from '../../../scale/linearScale';
import { CartesianSeries, CartesianSeriesMarker, CartesianSeriesNodeBaseClickEvent, } from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxisDirection';
import { getMarker } from '../../marker/util';
import { toTooltipHtml } from '../../tooltip/tooltip';
import { ContinuousScale } from '../../../scale/continuousScale';
import { extent } from '../../../util/array';
import { sanitizeHtml } from '../../../util/sanitize';
import { Label } from '../../label';
import { HdpiCanvas } from '../../../canvas/hdpiCanvas';
import { OPT_FUNCTION, OPT_STRING, OPT_NUMBER_ARRAY, COLOR_STRING_ARRAY, Validate } from '../../../util/validation';
import { DataModel } from '../../data/dataModel';
import * as easing from '../../../motion/easing';
var ScatterSeriesLabel = /** @class */ (function (_super) {
    __extends(ScatterSeriesLabel, _super);
    function ScatterSeriesLabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.formatter = undefined;
        return _this;
    }
    __decorate([
        Validate(OPT_FUNCTION)
    ], ScatterSeriesLabel.prototype, "formatter", void 0);
    return ScatterSeriesLabel;
}(Label));
var ScatterSeriesNodeBaseClickEvent = /** @class */ (function (_super) {
    __extends(ScatterSeriesNodeBaseClickEvent, _super);
    function ScatterSeriesNodeBaseClickEvent(sizeKey, xKey, yKey, nativeEvent, datum, series) {
        var _this = _super.call(this, xKey, yKey, nativeEvent, datum, series) || this;
        _this.sizeKey = sizeKey;
        return _this;
    }
    return ScatterSeriesNodeBaseClickEvent;
}(CartesianSeriesNodeBaseClickEvent));
var ScatterSeriesNodeClickEvent = /** @class */ (function (_super) {
    __extends(ScatterSeriesNodeClickEvent, _super);
    function ScatterSeriesNodeClickEvent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'nodeClick';
        return _this;
    }
    return ScatterSeriesNodeClickEvent;
}(ScatterSeriesNodeBaseClickEvent));
var ScatterSeriesNodeDoubleClickEvent = /** @class */ (function (_super) {
    __extends(ScatterSeriesNodeDoubleClickEvent, _super);
    function ScatterSeriesNodeDoubleClickEvent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'nodeDoubleClick';
        return _this;
    }
    return ScatterSeriesNodeDoubleClickEvent;
}(ScatterSeriesNodeBaseClickEvent));
var ScatterSeriesTooltip = /** @class */ (function (_super) {
    __extends(ScatterSeriesTooltip, _super);
    function ScatterSeriesTooltip() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.renderer = undefined;
        return _this;
    }
    __decorate([
        Validate(OPT_FUNCTION)
    ], ScatterSeriesTooltip.prototype, "renderer", void 0);
    return ScatterSeriesTooltip;
}(SeriesTooltip));
var ScatterSeries = /** @class */ (function (_super) {
    __extends(ScatterSeries, _super);
    function ScatterSeries(moduleCtx) {
        var _this = _super.call(this, {
            moduleCtx: moduleCtx,
            pickModes: [
                SeriesNodePickMode.NEAREST_BY_MAIN_CATEGORY_AXIS_FIRST,
                SeriesNodePickMode.NEAREST_NODE,
                SeriesNodePickMode.EXACT_SHAPE_MATCH,
            ],
            pathsPerSeries: 0,
            hasMarkers: true,
        }) || this;
        _this.sizeScale = new LinearScale();
        _this.marker = new CartesianSeriesMarker();
        _this.label = new ScatterSeriesLabel();
        _this.title = undefined;
        _this.labelKey = undefined;
        _this.xName = undefined;
        _this.yName = undefined;
        _this.sizeName = 'Size';
        _this.labelName = 'Label';
        _this.xKey = undefined;
        _this.yKey = undefined;
        _this.sizeKey = undefined;
        _this.colorKey = undefined;
        _this.colorName = 'Color';
        _this.colorDomain = undefined;
        _this.colorRange = ['#ffff00', '#00ff00', '#0000ff'];
        _this.colorScale = new ColorScale();
        _this.tooltip = new ScatterSeriesTooltip();
        var label = _this.label;
        label.enabled = false;
        return _this;
    }
    ScatterSeries.prototype.processData = function () {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function () {
            var _g, _h, xKey, _j, yKey, sizeKey, xAxis, yAxis, marker, data, isContinuousX, isContinuousY, _k, colorScale, colorDomain, colorRange, colorKey, sizeKeyIdx, processedSize, colorKeyIdx;
            return __generator(this, function (_l) {
                _g = this, _h = _g.xKey, xKey = _h === void 0 ? '' : _h, _j = _g.yKey, yKey = _j === void 0 ? '' : _j, sizeKey = _g.sizeKey, xAxis = _g.xAxis, yAxis = _g.yAxis, marker = _g.marker, data = _g.data;
                isContinuousX = (xAxis === null || xAxis === void 0 ? void 0 : xAxis.scale) instanceof ContinuousScale;
                isContinuousY = (yAxis === null || yAxis === void 0 ? void 0 : yAxis.scale) instanceof ContinuousScale;
                _k = this, colorScale = _k.colorScale, colorDomain = _k.colorDomain, colorRange = _k.colorRange, colorKey = _k.colorKey;
                this.dataModel = new DataModel({
                    props: __spreadArray(__spreadArray([
                        valueProperty(xKey, isContinuousX, { id: "xValue" }),
                        valueProperty(yKey, isContinuousY, { id: "yValue" })
                    ], __read((sizeKey ? [valueProperty(sizeKey, true, { id: "sizeValue" })] : []))), __read((colorKey ? [valueProperty(colorKey, true, { id: "colorValue" })] : []))),
                    dataVisible: this.visible,
                });
                this.processedData = this.dataModel.processData(data !== null && data !== void 0 ? data : []);
                if (sizeKey) {
                    sizeKeyIdx = (_b = (_a = this.dataModel.resolveProcessedDataIndexById("sizeValue")) === null || _a === void 0 ? void 0 : _a.index) !== null && _b !== void 0 ? _b : -1;
                    processedSize = (_d = (_c = this.processedData) === null || _c === void 0 ? void 0 : _c.domain.values[sizeKeyIdx]) !== null && _d !== void 0 ? _d : [];
                    this.sizeScale.domain = marker.domain ? marker.domain : processedSize;
                }
                if (colorKey) {
                    colorKeyIdx = (_f = (_e = this.dataModel.resolveProcessedDataIndexById("colorValue")) === null || _e === void 0 ? void 0 : _e.index) !== null && _f !== void 0 ? _f : -1;
                    colorScale.domain = colorDomain !== null && colorDomain !== void 0 ? colorDomain : this.processedData.domain.values[colorKeyIdx];
                    colorScale.range = colorRange;
                    colorScale.update();
                }
                return [2 /*return*/];
            });
        });
    };
    ScatterSeries.prototype.getDomain = function (direction) {
        var _a = this, dataModel = _a.dataModel, processedData = _a.processedData;
        if (!processedData || !dataModel)
            return [];
        var id = direction === ChartAxisDirection.X ? "xValue" : "yValue";
        var dataDef = dataModel.resolveProcessedDataDefById(id);
        var domain = dataModel.getDomain(id, processedData);
        if ((dataDef === null || dataDef === void 0 ? void 0 : dataDef.valueType) === 'category') {
            return domain;
        }
        var axis = direction === ChartAxisDirection.X ? this.xAxis : this.yAxis;
        return this.fixNumericExtent(extent(domain), axis);
    };
    ScatterSeries.prototype.getNodeClickEvent = function (event, datum) {
        var _a, _b;
        return new ScatterSeriesNodeClickEvent(this.sizeKey, (_a = this.xKey) !== null && _a !== void 0 ? _a : '', (_b = this.yKey) !== null && _b !== void 0 ? _b : '', event, datum, this);
    };
    ScatterSeries.prototype.getNodeDoubleClickEvent = function (event, datum) {
        var _a, _b;
        return new ScatterSeriesNodeDoubleClickEvent(this.sizeKey, (_a = this.xKey) !== null && _a !== void 0 ? _a : '', (_b = this.yKey) !== null && _b !== void 0 ? _b : '', event, datum, this);
    };
    ScatterSeries.prototype.createNodeData = function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return __awaiter(this, void 0, void 0, function () {
            var _k, visible, xAxis, yAxis, _l, yKey, _m, xKey, label, labelKey, callbackCache, xDataIdx, yDataIdx, _o, colorScale, sizeKey, colorKey, seriesId, xScale, yScale, xOffset, yOffset, _p, sizeScale, marker, nodeData, font, actualLength, _q, _r, _s, values, datum, xDatum, yDatum, x, y, text, size, markerSize, colorIdx, fill;
            var e_1, _t;
            return __generator(this, function (_u) {
                _k = this, visible = _k.visible, xAxis = _k.xAxis, yAxis = _k.yAxis, _l = _k.yKey, yKey = _l === void 0 ? '' : _l, _m = _k.xKey, xKey = _m === void 0 ? '' : _m, label = _k.label, labelKey = _k.labelKey, callbackCache = _k.ctx.callbackCache;
                xDataIdx = (_a = this.dataModel) === null || _a === void 0 ? void 0 : _a.resolveProcessedDataIndexById("xValue");
                yDataIdx = (_b = this.dataModel) === null || _b === void 0 ? void 0 : _b.resolveProcessedDataIndexById("yValue");
                if (!(xDataIdx && yDataIdx && visible && xAxis && yAxis)) {
                    return [2 /*return*/, []];
                }
                _o = this, colorScale = _o.colorScale, sizeKey = _o.sizeKey, colorKey = _o.colorKey, seriesId = _o.id;
                xScale = xAxis.scale;
                yScale = yAxis.scale;
                xOffset = ((_c = xScale.bandwidth) !== null && _c !== void 0 ? _c : 0) / 2;
                yOffset = ((_d = yScale.bandwidth) !== null && _d !== void 0 ? _d : 0) / 2;
                _p = this, sizeScale = _p.sizeScale, marker = _p.marker;
                nodeData = new Array((_f = (_e = this.processedData) === null || _e === void 0 ? void 0 : _e.data.length) !== null && _f !== void 0 ? _f : 0);
                sizeScale.range = [marker.size, marker.maxSize];
                font = label.getFont();
                actualLength = 0;
                try {
                    for (_q = __values((_h = (_g = this.processedData) === null || _g === void 0 ? void 0 : _g.data) !== null && _h !== void 0 ? _h : []), _r = _q.next(); !_r.done; _r = _q.next()) {
                        _s = _r.value, values = _s.values, datum = _s.datum;
                        xDatum = values[xDataIdx.index];
                        yDatum = values[yDataIdx.index];
                        x = xScale.convert(xDatum) + xOffset;
                        y = yScale.convert(yDatum) + yOffset;
                        if (!this.checkRangeXY(x, y, xAxis, yAxis)) {
                            continue;
                        }
                        text = void 0;
                        if (label.formatter) {
                            text = callbackCache.call(label.formatter, { value: yDatum, seriesId: seriesId, datum: datum });
                        }
                        if (text === undefined) {
                            text = labelKey ? String(datum[labelKey]) : '';
                        }
                        size = HdpiCanvas.getTextSize(text, font);
                        markerSize = sizeKey ? sizeScale.convert(values[2]) : marker.size;
                        colorIdx = sizeKey ? 3 : 2;
                        fill = colorKey ? colorScale.convert(values[colorIdx]) : undefined;
                        nodeData[actualLength++] = {
                            series: this,
                            itemId: yKey,
                            yKey: yKey,
                            xKey: xKey,
                            datum: datum,
                            point: { x: x, y: y, size: markerSize },
                            nodeMidPoint: { x: x, y: y },
                            fill: fill,
                            label: __assign({ text: text }, size),
                        };
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_r && !_r.done && (_t = _q.return)) _t.call(_q);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                nodeData.length = actualLength;
                return [2 /*return*/, [{ itemId: (_j = this.yKey) !== null && _j !== void 0 ? _j : this.id, nodeData: nodeData, labelData: nodeData }]];
            });
        });
    };
    ScatterSeries.prototype.isPathOrSelectionDirty = function () {
        return this.marker.isDirty();
    };
    ScatterSeries.prototype.getLabelData = function () {
        var _a;
        return (_a = this.contextNodeData) === null || _a === void 0 ? void 0 : _a.reduce(function (r, n) { return r.concat(n.labelData); }, []);
    };
    ScatterSeries.prototype.markerFactory = function () {
        var shape = this.marker.shape;
        var MarkerShape = getMarker(shape);
        return new MarkerShape();
    };
    ScatterSeries.prototype.updateMarkerSelection = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var nodeData, markerSelection, enabled, data;
            return __generator(this, function (_a) {
                nodeData = opts.nodeData, markerSelection = opts.markerSelection;
                enabled = this.marker.enabled;
                if (this.marker.isDirty()) {
                    markerSelection.clear();
                }
                data = enabled ? nodeData : [];
                return [2 /*return*/, markerSelection.update(data)];
            });
        });
    };
    ScatterSeries.prototype.updateMarkerNodes = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var markerSelection, isDatumHighlighted, _a, marker, _b, xKey, _c, yKey, sizeScale, _d, markerFillOpacity, markerStrokeOpacity, markerStrokeWidth, _e, highlightedFill, _f, highlightFillOpacity, highlightedStroke, highlightedDatumStrokeWidth, seriesId, callbackCache, formatter, customMarker;
            return __generator(this, function (_g) {
                markerSelection = opts.markerSelection, isDatumHighlighted = opts.isHighlight;
                _a = this, marker = _a.marker, _b = _a.xKey, xKey = _b === void 0 ? '' : _b, _c = _a.yKey, yKey = _c === void 0 ? '' : _c, sizeScale = _a.sizeScale, _d = _a.marker, markerFillOpacity = _d.fillOpacity, markerStrokeOpacity = _d.strokeOpacity, markerStrokeWidth = _d.strokeWidth, _e = _a.highlightStyle.item, highlightedFill = _e.fill, _f = _e.fillOpacity, highlightFillOpacity = _f === void 0 ? markerFillOpacity : _f, highlightedStroke = _e.stroke, highlightedDatumStrokeWidth = _e.strokeWidth, seriesId = _a.id, callbackCache = _a.ctx.callbackCache;
                formatter = marker.formatter;
                sizeScale.range = [marker.size, marker.maxSize];
                customMarker = typeof marker.shape === 'function';
                markerSelection.each(function (node, datum) {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                    var fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : (_a = datum.fill) !== null && _a !== void 0 ? _a : marker.fill;
                    var fillOpacity = isDatumHighlighted ? highlightFillOpacity : markerFillOpacity;
                    var stroke = isDatumHighlighted && highlightedStroke !== undefined ? highlightedStroke : marker.stroke;
                    var strokeOpacity = markerStrokeOpacity;
                    var strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                        ? highlightedDatumStrokeWidth
                        : markerStrokeWidth !== null && markerStrokeWidth !== void 0 ? markerStrokeWidth : 1;
                    var size = (_c = (_b = datum.point) === null || _b === void 0 ? void 0 : _b.size) !== null && _c !== void 0 ? _c : 0;
                    var format = undefined;
                    if (formatter) {
                        format = callbackCache.call(formatter, {
                            datum: datum.datum,
                            xKey: xKey,
                            yKey: yKey,
                            fill: fill,
                            stroke: stroke,
                            strokeWidth: strokeWidth,
                            size: size,
                            highlighted: isDatumHighlighted,
                            seriesId: seriesId,
                        });
                    }
                    node.fill = (_d = format === null || format === void 0 ? void 0 : format.fill) !== null && _d !== void 0 ? _d : fill;
                    node.stroke = (_e = format === null || format === void 0 ? void 0 : format.stroke) !== null && _e !== void 0 ? _e : stroke;
                    node.strokeWidth = (_f = format === null || format === void 0 ? void 0 : format.strokeWidth) !== null && _f !== void 0 ? _f : strokeWidth;
                    node.fillOpacity = fillOpacity !== null && fillOpacity !== void 0 ? fillOpacity : 1;
                    node.strokeOpacity = strokeOpacity !== null && strokeOpacity !== void 0 ? strokeOpacity : 1;
                    node.translationX = (_h = (_g = datum.point) === null || _g === void 0 ? void 0 : _g.x) !== null && _h !== void 0 ? _h : 0;
                    node.translationY = (_k = (_j = datum.point) === null || _j === void 0 ? void 0 : _j.y) !== null && _k !== void 0 ? _k : 0;
                    node.visible = node.size > 0;
                    if (!customMarker || node.dirtyPath) {
                        return;
                    }
                    // Only for custom marker shapes.
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
    ScatterSeries.prototype.updateLabelSelection = function (opts) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var labelSelection, enabled, placedLabels, placedNodeDatum;
            return __generator(this, function (_c) {
                labelSelection = opts.labelSelection;
                enabled = this.label.enabled;
                placedLabels = enabled ? (_b = (_a = this.chart) === null || _a === void 0 ? void 0 : _a.placeLabels().get(this)) !== null && _b !== void 0 ? _b : [] : [];
                placedNodeDatum = placedLabels.map(function (v) { return (__assign(__assign({}, v.datum), { point: {
                        x: v.x,
                        y: v.y,
                        size: v.datum.point.size,
                    } })); });
                return [2 /*return*/, labelSelection.update(placedNodeDatum)];
            });
        });
    };
    ScatterSeries.prototype.updateLabelNodes = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var labelSelection, label;
            return __generator(this, function (_a) {
                labelSelection = opts.labelSelection;
                label = this.label;
                labelSelection.each(function (text, datum) {
                    var _a, _b, _c, _d;
                    text.text = datum.label.text;
                    text.fill = label.color;
                    text.x = (_b = (_a = datum.point) === null || _a === void 0 ? void 0 : _a.x) !== null && _b !== void 0 ? _b : 0;
                    text.y = (_d = (_c = datum.point) === null || _c === void 0 ? void 0 : _c.y) !== null && _d !== void 0 ? _d : 0;
                    text.fontStyle = label.fontStyle;
                    text.fontWeight = label.fontWeight;
                    text.fontSize = label.fontSize;
                    text.fontFamily = label.fontFamily;
                    text.textAlign = 'left';
                    text.textBaseline = 'top';
                });
                return [2 /*return*/];
            });
        });
    };
    ScatterSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var _a, _b, _c, _d, _e, _f, _g;
        var _h = this, xKey = _h.xKey, yKey = _h.yKey, xAxis = _h.xAxis, yAxis = _h.yAxis;
        if (!xKey || !yKey || !xAxis || !yAxis) {
            return '';
        }
        var _j = this, marker = _j.marker, tooltip = _j.tooltip, xName = _j.xName, yName = _j.yName, sizeKey = _j.sizeKey, sizeName = _j.sizeName, labelKey = _j.labelKey, labelName = _j.labelName, seriesId = _j.id, callbackCache = _j.ctx.callbackCache;
        var stroke = marker.stroke;
        var fill = (_a = nodeDatum.fill) !== null && _a !== void 0 ? _a : marker.fill;
        var strokeWidth = this.getStrokeWidth((_b = marker.strokeWidth) !== null && _b !== void 0 ? _b : 1);
        var formatter = this.marker.formatter;
        var format = undefined;
        if (formatter) {
            format = callbackCache.call(formatter, {
                datum: nodeDatum,
                xKey: xKey,
                yKey: yKey,
                fill: fill,
                stroke: stroke,
                strokeWidth: strokeWidth,
                size: (_d = (_c = nodeDatum.point) === null || _c === void 0 ? void 0 : _c.size) !== null && _d !== void 0 ? _d : 0,
                highlighted: false,
                seriesId: seriesId,
            });
        }
        var color = (_f = (_e = format === null || format === void 0 ? void 0 : format.fill) !== null && _e !== void 0 ? _e : fill) !== null && _f !== void 0 ? _f : 'gray';
        var title = (_g = this.title) !== null && _g !== void 0 ? _g : yName;
        var datum = nodeDatum.datum;
        var xValue = datum[xKey];
        var yValue = datum[yKey];
        var xString = sanitizeHtml(xAxis.formatDatum(xValue));
        var yString = sanitizeHtml(yAxis.formatDatum(yValue));
        var content = "<b>" + sanitizeHtml(xName !== null && xName !== void 0 ? xName : xKey) + "</b>: " + xString + "<br>" +
            ("<b>" + sanitizeHtml(yName !== null && yName !== void 0 ? yName : yKey) + "</b>: " + yString);
        if (sizeKey) {
            content += "<br><b>" + sanitizeHtml(sizeName !== null && sizeName !== void 0 ? sizeName : sizeKey) + "</b>: " + sanitizeHtml(datum[sizeKey]);
        }
        if (labelKey) {
            content = "<b>" + sanitizeHtml(labelName !== null && labelName !== void 0 ? labelName : labelKey) + "</b>: " + sanitizeHtml(datum[labelKey]) + "<br>" + content;
        }
        var defaults = {
            title: title,
            backgroundColor: color,
            content: content,
        };
        var tooltipRenderer = tooltip.renderer;
        if (tooltipRenderer) {
            return toTooltipHtml(tooltipRenderer({
                datum: datum,
                xKey: xKey,
                xValue: xValue,
                xName: xName,
                yKey: yKey,
                yValue: yValue,
                yName: yName,
                sizeKey: sizeKey,
                sizeName: sizeName,
                labelKey: labelKey,
                labelName: labelName,
                title: title,
                color: color,
                seriesId: seriesId,
            }), defaults);
        }
        return toTooltipHtml(defaults);
    };
    ScatterSeries.prototype.getLegendData = function () {
        var _a, _b, _c, _d, _e;
        var _f = this, id = _f.id, data = _f.data, xKey = _f.xKey, yKey = _f.yKey, yName = _f.yName, title = _f.title, visible = _f.visible, marker = _f.marker;
        var fill = marker.fill, stroke = marker.stroke, fillOpacity = marker.fillOpacity, strokeOpacity = marker.strokeOpacity;
        if (!((data === null || data === void 0 ? void 0 : data.length) && xKey && yKey)) {
            return [];
        }
        var legendData = [
            {
                legendType: 'category',
                id: id,
                itemId: yKey,
                seriesId: id,
                enabled: visible,
                label: {
                    text: (_a = title !== null && title !== void 0 ? title : yName) !== null && _a !== void 0 ? _a : yKey,
                },
                marker: {
                    shape: marker.shape,
                    fill: (_c = (_b = marker.fill) !== null && _b !== void 0 ? _b : fill) !== null && _c !== void 0 ? _c : 'rgba(0, 0, 0, 0)',
                    stroke: (_e = (_d = marker.stroke) !== null && _d !== void 0 ? _d : stroke) !== null && _e !== void 0 ? _e : 'rgba(0, 0, 0, 0)',
                    fillOpacity: fillOpacity !== null && fillOpacity !== void 0 ? fillOpacity : 1,
                    strokeOpacity: strokeOpacity !== null && strokeOpacity !== void 0 ? strokeOpacity : 1,
                },
            },
        ];
        return legendData;
    };
    ScatterSeries.prototype.animateEmptyUpdateReady = function (_a) {
        var _this = this;
        var markerSelections = _a.markerSelections, labelSelections = _a.labelSelections;
        var duration = 1000;
        var labelDuration = 200;
        markerSelections.forEach(function (markerSelection) {
            markerSelection.each(function (marker, datum) {
                var _a, _b, _c, _d;
                var format = _this.animateFormatter(marker, datum);
                var size = (_b = (_a = datum.point) === null || _a === void 0 ? void 0 : _a.size) !== null && _b !== void 0 ? _b : 0;
                var to = (_c = format === null || format === void 0 ? void 0 : format.size) !== null && _c !== void 0 ? _c : size;
                (_d = _this.animationManager) === null || _d === void 0 ? void 0 : _d.animate(_this.id + "_empty-update-ready_" + marker.id, {
                    from: 0,
                    to: to,
                    disableInteractions: true,
                    duration: duration,
                    ease: easing.linear,
                    repeat: 0,
                    onUpdate: function (size) {
                        marker.size = size;
                    },
                });
            });
        });
        labelSelections.forEach(function (labelSelection) {
            labelSelection.each(function (label) {
                var _a;
                (_a = _this.animationManager) === null || _a === void 0 ? void 0 : _a.animate(_this.id + "_empty-update-ready_" + label.id, {
                    from: 0,
                    to: 1,
                    delay: duration,
                    duration: labelDuration,
                    ease: easing.linear,
                    repeat: 0,
                    onUpdate: function (opacity) {
                        label.opacity = opacity;
                    },
                });
            });
        });
    };
    ScatterSeries.prototype.animateReadyUpdate = function (_a) {
        var _this = this;
        var markerSelections = _a.markerSelections;
        markerSelections.forEach(function (markerSelection) {
            markerSelection.each(function (marker, datum) {
                var _a, _b, _c;
                var format = _this.animateFormatter(marker, datum);
                var size = (_b = (_a = datum.point) === null || _a === void 0 ? void 0 : _a.size) !== null && _b !== void 0 ? _b : 0;
                marker.size = (_c = format === null || format === void 0 ? void 0 : format.size) !== null && _c !== void 0 ? _c : size;
            });
        });
    };
    ScatterSeries.prototype.animateFormatter = function (marker, datum) {
        var _a, _b, _c;
        var _d = this, _e = _d.xKey, xKey = _e === void 0 ? '' : _e, _f = _d.yKey, yKey = _f === void 0 ? '' : _f, markerStrokeWidth = _d.marker.strokeWidth, seriesId = _d.id, callbackCache = _d.ctx.callbackCache;
        var formatter = this.marker.formatter;
        var fill = (_a = datum.fill) !== null && _a !== void 0 ? _a : marker.fill;
        var stroke = marker.stroke;
        var strokeWidth = markerStrokeWidth !== null && markerStrokeWidth !== void 0 ? markerStrokeWidth : 1;
        var size = (_c = (_b = datum.point) === null || _b === void 0 ? void 0 : _b.size) !== null && _c !== void 0 ? _c : 0;
        var format = undefined;
        if (formatter) {
            format = callbackCache.call(formatter, {
                datum: datum.datum,
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
        return format;
    };
    ScatterSeries.prototype.isLabelEnabled = function () {
        return this.label.enabled;
    };
    ScatterSeries.className = 'ScatterSeries';
    ScatterSeries.type = 'scatter';
    __decorate([
        Validate(OPT_STRING)
    ], ScatterSeries.prototype, "title", void 0);
    __decorate([
        Validate(OPT_STRING)
    ], ScatterSeries.prototype, "labelKey", void 0);
    __decorate([
        Validate(OPT_STRING)
    ], ScatterSeries.prototype, "xName", void 0);
    __decorate([
        Validate(OPT_STRING)
    ], ScatterSeries.prototype, "yName", void 0);
    __decorate([
        Validate(OPT_STRING)
    ], ScatterSeries.prototype, "sizeName", void 0);
    __decorate([
        Validate(OPT_STRING)
    ], ScatterSeries.prototype, "labelName", void 0);
    __decorate([
        Validate(OPT_STRING)
    ], ScatterSeries.prototype, "xKey", void 0);
    __decorate([
        Validate(OPT_STRING)
    ], ScatterSeries.prototype, "yKey", void 0);
    __decorate([
        Validate(OPT_STRING)
    ], ScatterSeries.prototype, "sizeKey", void 0);
    __decorate([
        Validate(OPT_STRING)
    ], ScatterSeries.prototype, "colorKey", void 0);
    __decorate([
        Validate(OPT_STRING)
    ], ScatterSeries.prototype, "colorName", void 0);
    __decorate([
        Validate(OPT_NUMBER_ARRAY)
    ], ScatterSeries.prototype, "colorDomain", void 0);
    __decorate([
        Validate(COLOR_STRING_ARRAY)
    ], ScatterSeries.prototype, "colorRange", void 0);
    return ScatterSeries;
}(CartesianSeries));
export { ScatterSeries };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NhdHRlclNlcmllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9zZXJpZXMvY2FydGVzaWFuL3NjYXR0ZXJTZXJpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLE9BQU8sRUFBRSxhQUFhLEVBQXlCLGtCQUFrQixFQUFFLGFBQWEsRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUVwRyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDdkQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ3pELE9BQU8sRUFDSCxlQUFlLEVBQ2YscUJBQXFCLEVBQ3JCLGlDQUFpQyxHQUVwQyxNQUFNLG1CQUFtQixDQUFDO0FBQzNCLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQzlELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUM5QyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDdEQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ2pFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUM3QyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDdEQsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUVwQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFHeEQsT0FBTyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLEVBQUUsa0JBQWtCLEVBQUUsUUFBUSxFQUFFLE1BQU0sMEJBQTBCLENB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