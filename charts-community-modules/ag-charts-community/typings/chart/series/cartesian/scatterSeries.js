"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScatterSeries = void 0;
var series_1 = require("../series");
var colorScale_1 = require("../../../scale/colorScale");
var linearScale_1 = require("../../../scale/linearScale");
var cartesianSeries_1 = require("./cartesianSeries");
var chartAxisDirection_1 = require("../../chartAxisDirection");
var util_1 = require("../../marker/util");
var tooltip_1 = require("../../tooltip/tooltip");
var continuousScale_1 = require("../../../scale/continuousScale");
var array_1 = require("../../../util/array");
var sanitize_1 = require("../../../util/sanitize");
var label_1 = require("../../label");
var hdpiCanvas_1 = require("../../../canvas/hdpiCanvas");
var validation_1 = require("../../../util/validation");
var ScatterSeriesLabel = /** @class */ (function (_super) {
    __extends(ScatterSeriesLabel, _super);
    function ScatterSeriesLabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.formatter = undefined;
        return _this;
    }
    __decorate([
        validation_1.Validate(validation_1.OPT_FUNCTION)
    ], ScatterSeriesLabel.prototype, "formatter", void 0);
    return ScatterSeriesLabel;
}(label_1.Label));
var ScatterSeriesNodeBaseClickEvent = /** @class */ (function (_super) {
    __extends(ScatterSeriesNodeBaseClickEvent, _super);
    function ScatterSeriesNodeBaseClickEvent(sizeKey, xKey, yKey, nativeEvent, datum, series) {
        var _this = _super.call(this, xKey, yKey, nativeEvent, datum, series) || this;
        _this.sizeKey = sizeKey;
        return _this;
    }
    return ScatterSeriesNodeBaseClickEvent;
}(cartesianSeries_1.CartesianSeriesNodeBaseClickEvent));
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
        validation_1.Validate(validation_1.OPT_FUNCTION)
    ], ScatterSeriesTooltip.prototype, "renderer", void 0);
    return ScatterSeriesTooltip;
}(series_1.SeriesTooltip));
var ScatterSeries = /** @class */ (function (_super) {
    __extends(ScatterSeries, _super);
    function ScatterSeries(moduleCtx) {
        var _this = _super.call(this, {
            moduleCtx: moduleCtx,
            pickModes: [
                series_1.SeriesNodePickMode.NEAREST_BY_MAIN_CATEGORY_AXIS_FIRST,
                series_1.SeriesNodePickMode.NEAREST_NODE,
                series_1.SeriesNodePickMode.EXACT_SHAPE_MATCH,
            ],
            pathsPerSeries: 0,
            hasMarkers: true,
        }) || this;
        _this.sizeScale = new linearScale_1.LinearScale();
        _this.marker = new cartesianSeries_1.CartesianSeriesMarker();
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
        _this.colorScale = new colorScale_1.ColorScale();
        _this.tooltip = new ScatterSeriesTooltip();
        var label = _this.label;
        label.enabled = false;
        return _this;
    }
    ScatterSeries.prototype.processData = function (dataController) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var _c, _d, xKey, _e, yKey, sizeKey, labelKey, axes, marker, data, xAxis, yAxis, isContinuousX, isContinuousY, _f, colorScale, colorDomain, colorRange, colorKey, _g, dataModel, processedData, sizeKeyIdx, processedSize, colorKeyIdx;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        _c = this, _d = _c.xKey, xKey = _d === void 0 ? '' : _d, _e = _c.yKey, yKey = _e === void 0 ? '' : _e, sizeKey = _c.sizeKey, labelKey = _c.labelKey, axes = _c.axes, marker = _c.marker, data = _c.data;
                        xAxis = axes[chartAxisDirection_1.ChartAxisDirection.X];
                        yAxis = axes[chartAxisDirection_1.ChartAxisDirection.Y];
                        isContinuousX = (xAxis === null || xAxis === void 0 ? void 0 : xAxis.scale) instanceof continuousScale_1.ContinuousScale;
                        isContinuousY = (yAxis === null || yAxis === void 0 ? void 0 : yAxis.scale) instanceof continuousScale_1.ContinuousScale;
                        _f = this, colorScale = _f.colorScale, colorDomain = _f.colorDomain, colorRange = _f.colorRange, colorKey = _f.colorKey;
                        return [4 /*yield*/, dataController.request(this.id, data !== null && data !== void 0 ? data : [], {
                                props: __spreadArray(__spreadArray(__spreadArray([
                                    series_1.valueProperty(this, xKey, isContinuousX, { id: "xValue" }),
                                    series_1.valueProperty(this, yKey, isContinuousY, { id: "yValue" })
                                ], __read((sizeKey ? [series_1.valueProperty(this, sizeKey, true, { id: "sizeValue" })] : []))), __read((colorKey ? [series_1.valueProperty(this, colorKey, true, { id: "colorValue" })] : []))), __read((labelKey ? [series_1.valueProperty(this, labelKey, false, { id: "labelValue" })] : []))),
                                dataVisible: this.visible,
                            })];
                    case 1:
                        _g = _h.sent(), dataModel = _g.dataModel, processedData = _g.processedData;
                        this.dataModel = dataModel;
                        this.processedData = processedData;
                        if (sizeKey) {
                            sizeKeyIdx = dataModel.resolveProcessedDataIndexById(this, "sizeValue").index;
                            processedSize = (_a = processedData.domain.values[sizeKeyIdx]) !== null && _a !== void 0 ? _a : [];
                            this.sizeScale.domain = marker.domain ? marker.domain : processedSize;
                        }
                        if (colorKey) {
                            colorKeyIdx = dataModel.resolveProcessedDataIndexById(this, "colorValue").index;
                            colorScale.domain = (_b = colorDomain !== null && colorDomain !== void 0 ? colorDomain : processedData.domain.values[colorKeyIdx]) !== null && _b !== void 0 ? _b : [];
                            colorScale.range = colorRange;
                            colorScale.update();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    ScatterSeries.prototype.getDomain = function (direction) {
        var _a = this, dataModel = _a.dataModel, processedData = _a.processedData;
        if (!processedData || !dataModel)
            return [];
        var id = direction === chartAxisDirection_1.ChartAxisDirection.X ? "xValue" : "yValue";
        var dataDef = dataModel.resolveProcessedDataDefById(this, id, 'value');
        var domain = dataModel.getDomain(this, id, 'value', processedData);
        if ((dataDef === null || dataDef === void 0 ? void 0 : dataDef.def.type) === 'value' && (dataDef === null || dataDef === void 0 ? void 0 : dataDef.def.valueType) === 'category') {
            return domain;
        }
        var axis = this.axes[direction];
        return this.fixNumericExtent(array_1.extent(domain), axis);
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
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function () {
            var _g, visible, axes, _h, yKey, _j, xKey, label, labelKey, callbackCache, dataModel, processedData, xAxis, yAxis, xDataIdx, yDataIdx, sizeDataIdx, colorDataIdx, labelDataIdx, _k, colorScale, sizeKey, colorKey, seriesId, xScale, yScale, xOffset, yOffset, _l, sizeScale, marker, nodeData, font, actualLength, _m, _o, _p, values, datum, xDatum, yDatum, x, y, text, size, markerSize, fill;
            var e_1, _q;
            return __generator(this, function (_r) {
                _g = this, visible = _g.visible, axes = _g.axes, _h = _g.yKey, yKey = _h === void 0 ? '' : _h, _j = _g.xKey, xKey = _j === void 0 ? '' : _j, label = _g.label, labelKey = _g.labelKey, callbackCache = _g.ctx.callbackCache, dataModel = _g.dataModel, processedData = _g.processedData;
                xAxis = axes[chartAxisDirection_1.ChartAxisDirection.X];
                yAxis = axes[chartAxisDirection_1.ChartAxisDirection.Y];
                if (!(dataModel && processedData && visible && xAxis && yAxis))
                    return [2 /*return*/, []];
                xDataIdx = dataModel.resolveProcessedDataIndexById(this, "xValue").index;
                yDataIdx = dataModel.resolveProcessedDataIndexById(this, "yValue").index;
                sizeDataIdx = this.sizeKey ? dataModel.resolveProcessedDataIndexById(this, "sizeValue").index : -1;
                colorDataIdx = this.colorKey ? dataModel.resolveProcessedDataIndexById(this, "colorValue").index : -1;
                labelDataIdx = this.labelKey ? dataModel.resolveProcessedDataIndexById(this, "labelValue").index : -1;
                _k = this, colorScale = _k.colorScale, sizeKey = _k.sizeKey, colorKey = _k.colorKey, seriesId = _k.id;
                xScale = xAxis.scale;
                yScale = yAxis.scale;
                xOffset = ((_a = xScale.bandwidth) !== null && _a !== void 0 ? _a : 0) / 2;
                yOffset = ((_b = yScale.bandwidth) !== null && _b !== void 0 ? _b : 0) / 2;
                _l = this, sizeScale = _l.sizeScale, marker = _l.marker;
                nodeData = new Array((_d = (_c = this.processedData) === null || _c === void 0 ? void 0 : _c.data.length) !== null && _d !== void 0 ? _d : 0);
                sizeScale.range = [marker.size, marker.maxSize];
                font = label.getFont();
                actualLength = 0;
                try {
                    for (_m = __values((_e = processedData.data) !== null && _e !== void 0 ? _e : []), _o = _m.next(); !_o.done; _o = _m.next()) {
                        _p = _o.value, values = _p.values, datum = _p.datum;
                        xDatum = values[xDataIdx];
                        yDatum = values[yDataIdx];
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
                            text = labelKey ? String(values[labelDataIdx]) : '';
                        }
                        size = hdpiCanvas_1.HdpiCanvas.getTextSize(text, font);
                        markerSize = sizeKey ? sizeScale.convert(values[sizeDataIdx]) : marker.size;
                        fill = colorKey ? colorScale.convert(values[colorDataIdx]) : undefined;
                        nodeData[actualLength++] = {
                            series: this,
                            itemId: yKey,
                            yKey: yKey,
                            xKey: xKey,
                            datum: datum,
                            xValue: xDatum,
                            yValue: yDatum,
                            sizeValue: values[sizeDataIdx],
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
                        if (_o && !_o.done && (_q = _m.return)) _q.call(_m);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                nodeData.length = actualLength;
                return [2 /*return*/, [{ itemId: (_f = this.yKey) !== null && _f !== void 0 ? _f : this.id, nodeData: nodeData, labelData: nodeData }]];
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
        var MarkerShape = util_1.getMarker(shape);
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
        var _h = this, xKey = _h.xKey, yKey = _h.yKey, axes = _h.axes;
        var xAxis = axes[chartAxisDirection_1.ChartAxisDirection.X];
        var yAxis = axes[chartAxisDirection_1.ChartAxisDirection.Y];
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
        var datum = nodeDatum.datum, xValue = nodeDatum.xValue, yValue = nodeDatum.yValue, sizeValue = nodeDatum.sizeValue, labelText = nodeDatum.label.text;
        var xString = sanitize_1.sanitizeHtml(xAxis.formatDatum(xValue));
        var yString = sanitize_1.sanitizeHtml(yAxis.formatDatum(yValue));
        var content = "<b>" + sanitize_1.sanitizeHtml(xName !== null && xName !== void 0 ? xName : xKey) + "</b>: " + xString + "<br>" +
            ("<b>" + sanitize_1.sanitizeHtml(yName !== null && yName !== void 0 ? yName : yKey) + "</b>: " + yString);
        if (sizeKey) {
            content += "<br><b>" + sanitize_1.sanitizeHtml(sizeName !== null && sizeName !== void 0 ? sizeName : sizeKey) + "</b>: " + sanitize_1.sanitizeHtml(sizeValue);
        }
        if (labelKey) {
            content = "<b>" + sanitize_1.sanitizeHtml(labelName !== null && labelName !== void 0 ? labelName : labelKey) + "</b>: " + sanitize_1.sanitizeHtml(labelText) + "<br>" + content;
        }
        var defaults = {
            title: title,
            backgroundColor: color,
            content: content,
        };
        var tooltipRenderer = tooltip.renderer;
        if (tooltipRenderer) {
            return tooltip_1.toTooltipHtml(tooltipRenderer({
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
        return tooltip_1.toTooltipHtml(defaults);
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
        var _b, _c;
        var markerSelections = _a.markerSelections, labelSelections = _a.labelSelections;
        var duration = (_c = (_b = this.ctx.animationManager) === null || _b === void 0 ? void 0 : _b.defaultOptions.duration) !== null && _c !== void 0 ? _c : 1000;
        var labelDuration = 200;
        markerSelections.forEach(function (markerSelection) {
            markerSelection.each(function (marker, datum) {
                var _a, _b, _c, _d;
                var format = _this.animateFormatter(marker, datum);
                var size = (_b = (_a = datum.point) === null || _a === void 0 ? void 0 : _a.size) !== null && _b !== void 0 ? _b : 0;
                var to = (_c = format === null || format === void 0 ? void 0 : format.size) !== null && _c !== void 0 ? _c : size;
                (_d = _this.ctx.animationManager) === null || _d === void 0 ? void 0 : _d.animate(_this.id + "_empty-update-ready_" + marker.id, {
                    from: 0,
                    to: to,
                    duration: duration,
                    onUpdate: function (size) {
                        marker.size = size;
                    },
                });
            });
        });
        labelSelections.forEach(function (labelSelection) {
            labelSelection.each(function (label) {
                var _a;
                (_a = _this.ctx.animationManager) === null || _a === void 0 ? void 0 : _a.animate(_this.id + "_empty-update-ready_" + label.id, {
                    from: 0,
                    to: 1,
                    delay: duration,
                    duration: labelDuration,
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
            _this.resetMarkers(markerSelection);
        });
    };
    ScatterSeries.prototype.animateReadyHighlightMarkers = function (markerSelection) {
        this.resetMarkers(markerSelection);
    };
    ScatterSeries.prototype.resetMarkers = function (markerSelection) {
        var _this = this;
        markerSelection.each(function (marker, datum) {
            var _a, _b, _c;
            var format = _this.animateFormatter(marker, datum);
            var size = (_b = (_a = datum.point) === null || _a === void 0 ? void 0 : _a.size) !== null && _b !== void 0 ? _b : 0;
            marker.size = (_c = format === null || format === void 0 ? void 0 : format.size) !== null && _c !== void 0 ? _c : size;
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
        validation_1.Validate(validation_1.OPT_STRING)
    ], ScatterSeries.prototype, "title", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], ScatterSeries.prototype, "labelKey", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], ScatterSeries.prototype, "xName", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], ScatterSeries.prototype, "yName", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], ScatterSeries.prototype, "sizeName", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], ScatterSeries.prototype, "labelName", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], ScatterSeries.prototype, "xKey", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], ScatterSeries.prototype, "yKey", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], ScatterSeries.prototype, "sizeKey", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], ScatterSeries.prototype, "colorKey", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], ScatterSeries.prototype, "colorName", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_NUMBER_ARRAY)
    ], ScatterSeries.prototype, "colorDomain", void 0);
    __decorate([
        validation_1.Validate(validation_1.COLOR_STRING_ARRAY)
    ], ScatterSeries.prototype, "colorRange", void 0);
    return ScatterSeries;
}(cartesianSeries_1.CartesianSeries));
exports.ScatterSeries = ScatterSeries;
//# sourceMappingURL=scatterSeries.js.map