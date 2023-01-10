var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
import { Rect } from '../../../scene/shape/rect';
import { Text } from '../../../scene/shape/text';
import { SeriesTooltip, Series, SeriesNodePickMode } from '../series';
import { Label } from '../../label';
import { PointerEvents } from '../../../scene/node';
import { CartesianSeries, CartesianSeriesNodeClickEvent } from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxis';
import { toTooltipHtml } from '../../tooltip/tooltip';
import { extent } from '../../../util/array';
import ticks, { tickStep } from '../../../util/ticks';
import { sanitizeHtml } from '../../../util/sanitize';
import { isContinuous } from '../../../util/value';
import { BOOLEAN, NUMBER, OPT_ARRAY, OPT_FUNCTION, OPT_LINE_DASH, OPT_NUMBER, OPT_COLOR_STRING, STRING, Validate, predicateWithMessage, } from '../../../util/validation';
var HISTOGRAM_AGGREGATIONS = ['count', 'sum', 'mean'];
var HISTOGRAM_AGGREGATION = predicateWithMessage(function (v) { return HISTOGRAM_AGGREGATIONS.includes(v); }, "expecting a histogram aggregation keyword such as 'count', 'sum' or 'mean");
var HistogramSeriesNodeTag;
(function (HistogramSeriesNodeTag) {
    HistogramSeriesNodeTag[HistogramSeriesNodeTag["Bin"] = 0] = "Bin";
    HistogramSeriesNodeTag[HistogramSeriesNodeTag["Label"] = 1] = "Label";
})(HistogramSeriesNodeTag || (HistogramSeriesNodeTag = {}));
var HistogramSeriesLabel = /** @class */ (function (_super) {
    __extends(HistogramSeriesLabel, _super);
    function HistogramSeriesLabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.formatter = undefined;
        return _this;
    }
    __decorate([
        Validate(OPT_FUNCTION)
    ], HistogramSeriesLabel.prototype, "formatter", void 0);
    return HistogramSeriesLabel;
}(Label));
var defaultBinCount = 10;
var aggregationFunctions = {
    count: function (bin) { return bin.data.length; },
    sum: function (bin, yKey) { return bin.data.reduce(function (acc, datum) { return acc + datum[yKey]; }, 0); },
    mean: function (bin, yKey) { return aggregationFunctions.sum(bin, yKey) / aggregationFunctions.count(bin, yKey); },
};
var HistogramBin = /** @class */ (function () {
    function HistogramBin(_a) {
        var _b = __read(_a, 2), domainMin = _b[0], domainMax = _b[1];
        this.data = [];
        this.aggregatedValue = 0;
        this.frequency = 0;
        this.domain = [domainMin, domainMax];
    }
    HistogramBin.prototype.addDatum = function (datum) {
        this.data.push(datum);
        this.frequency++;
    };
    Object.defineProperty(HistogramBin.prototype, "domainWidth", {
        get: function () {
            var _a = __read(this.domain, 2), domainMin = _a[0], domainMax = _a[1];
            return domainMax - domainMin;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HistogramBin.prototype, "relativeHeight", {
        get: function () {
            return this.aggregatedValue / this.domainWidth;
        },
        enumerable: false,
        configurable: true
    });
    HistogramBin.prototype.calculateAggregatedValue = function (aggregationName, yKey) {
        if (!yKey) {
            // not having a yKey forces us into a frequency plot
            aggregationName = 'count';
        }
        var aggregationFunction = aggregationFunctions[aggregationName];
        this.aggregatedValue = aggregationFunction(this, yKey);
    };
    HistogramBin.prototype.getY = function (areaPlot) {
        return areaPlot ? this.relativeHeight : this.aggregatedValue;
    };
    return HistogramBin;
}());
var HistogramSeriesTooltip = /** @class */ (function (_super) {
    __extends(HistogramSeriesTooltip, _super);
    function HistogramSeriesTooltip() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.renderer = undefined;
        return _this;
    }
    __decorate([
        Validate(OPT_FUNCTION)
    ], HistogramSeriesTooltip.prototype, "renderer", void 0);
    return HistogramSeriesTooltip;
}(SeriesTooltip));
var HistogramSeries = /** @class */ (function (_super) {
    __extends(HistogramSeries, _super);
    function HistogramSeries() {
        var _a;
        var _this = _super.call(this, { pickModes: [SeriesNodePickMode.EXACT_SHAPE_MATCH] }) || this;
        _this.binnedData = [];
        _this.xDomain = [];
        _this.yDomain = [];
        _this.label = new HistogramSeriesLabel();
        _this.tooltip = new HistogramSeriesTooltip();
        _this.fill = undefined;
        _this.stroke = undefined;
        _this.fillOpacity = 1;
        _this.strokeOpacity = 1;
        _this.lineDash = [0];
        _this.lineDashOffset = 0;
        _this.directionKeys = (_a = {},
            _a[ChartAxisDirection.X] = ['xKey'],
            _a[ChartAxisDirection.Y] = ['yKey'],
            _a);
        _this.xKey = '';
        _this.areaPlot = false;
        _this.bins = undefined;
        _this.aggregation = 'count';
        _this.binCount = undefined;
        _this.xName = '';
        _this.yKey = '';
        _this.yName = '';
        _this.strokeWidth = 1;
        _this.shadow = undefined;
        _this.label.enabled = false;
        return _this;
    }
    HistogramSeries.prototype.getKeys = function (direction) {
        var _this = this;
        var directionKeys = this.directionKeys;
        var keys = directionKeys && directionKeys[direction];
        var values = [];
        if (keys) {
            keys.forEach(function (key) {
                var value = _this[key];
                if (value) {
                    if (Array.isArray(value)) {
                        values.push.apply(values, __spread(value));
                    }
                    else {
                        values.push(value);
                    }
                }
            });
        }
        return values;
    };
    // During processData phase, used to unify different ways of the user specifying
    // the bins. Returns bins in format[[min1, max1], [min2, max2], ... ].
    HistogramSeries.prototype.deriveBins = function () {
        var _this = this;
        var bins = this.bins;
        if (!this.data) {
            return [];
        }
        var xData = this.data.map(function (datum) { return datum[_this.xKey]; });
        var xDomain = this.fixNumericExtent(extent(xData, isContinuous));
        if (this.binCount === undefined) {
            if (bins) {
                return bins;
            }
            var binStarts = ticks(xDomain[0], xDomain[1], defaultBinCount);
            var binSize_1 = tickStep(xDomain[0], xDomain[1], defaultBinCount);
            var firstBinEnd = binStarts[0];
            var expandStartToBin = function (n) { return [n, n + binSize_1]; };
            return __spread([[firstBinEnd - binSize_1, firstBinEnd]], binStarts.map(expandStartToBin));
        }
        else {
            return this.calculateNiceBins(xDomain, this.binCount);
        }
    };
    HistogramSeries.prototype.calculateNiceBins = function (domain, binCount) {
        var _a;
        var start = Math.floor(domain[0]);
        var stop = domain[1];
        var binSize;
        var segments = binCount || 1;
        (_a = this.calculateNiceStart(start, stop, segments), start = _a.start, binSize = _a.binSize);
        return this.getBins(start, stop, binSize, segments);
    };
    HistogramSeries.prototype.getBins = function (start, stop, step, count) {
        var bins = [];
        for (var i = 0; i < count; i++) {
            var a = Math.round((start + i * step) * 10) / 10;
            var b = Math.round((start + (i + 1) * step) * 10) / 10;
            if (i === count - 1) {
                b = Math.max(b, stop);
            }
            bins[i] = [a, b];
        }
        return bins;
    };
    HistogramSeries.prototype.calculateNiceStart = function (a, b, segments) {
        var binSize = Math.abs(b - a) / segments;
        var order = Math.floor(Math.log10(binSize));
        var magnitude = Math.pow(10, order);
        var start = Math.floor(a / magnitude) * magnitude;
        return {
            start: start,
            binSize: binSize,
        };
    };
    HistogramSeries.prototype.placeDataInBins = function (data) {
        var _this = this;
        var xKey = this.xKey;
        var derivedBins = this.deriveBins();
        this.bins = derivedBins;
        // creating a sorted copy allows binning in O(n) rather than O(n²)
        // but at the expense of more temporary memory
        var sortedData = data.slice().sort(function (a, b) {
            if (a[xKey] < b[xKey]) {
                return -1;
            }
            if (a[xKey] > b[xKey]) {
                return 1;
            }
            return 0;
        });
        var bins = [new HistogramBin(derivedBins[0])];
        var currentBin = 0;
        for (var i = 0; i < sortedData.length && currentBin < derivedBins.length; i++) {
            var datum = sortedData[i];
            while (datum[xKey] > derivedBins[currentBin][1] && currentBin < derivedBins.length) {
                currentBin++;
                bins.push(new HistogramBin(derivedBins[currentBin]));
            }
            if (currentBin < derivedBins.length) {
                bins[currentBin].addDatum(datum);
            }
        }
        bins.forEach(function (b) { return b.calculateAggregatedValue(_this.aggregation, _this.yKey); });
        return bins;
    };
    Object.defineProperty(HistogramSeries.prototype, "xMax", {
        get: function () {
            var _this = this;
            return (this.data &&
                this.data.reduce(function (acc, datum) {
                    return Math.max(acc, datum[_this.xKey]);
                }, Number.NEGATIVE_INFINITY));
        },
        enumerable: false,
        configurable: true
    });
    HistogramSeries.prototype.processData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, xKey, data, yData, yMinMax, firstBin, lastBin, xMin, xMax;
            var _this = this;
            return __generator(this, function (_b) {
                _a = this, xKey = _a.xKey, data = _a.data;
                this.binnedData = this.placeDataInBins(xKey && data ? data : []);
                yData = this.binnedData.map(function (b) { return b.getY(_this.areaPlot); });
                yMinMax = extent(yData, isContinuous);
                this.yDomain = this.fixNumericExtent([0, yMinMax ? yMinMax[1] : 1]);
                firstBin = this.binnedData[0];
                lastBin = this.binnedData[this.binnedData.length - 1];
                xMin = firstBin.domain[0];
                xMax = lastBin.domain[1];
                this.xDomain = [xMin, xMax];
                return [2 /*return*/];
            });
        });
    };
    HistogramSeries.prototype.getDomain = function (direction) {
        if (direction === ChartAxisDirection.X) {
            return this.xDomain;
        }
        else {
            return this.yDomain;
        }
    };
    HistogramSeries.prototype.getNodeClickEvent = function (event, datum) {
        return new CartesianSeriesNodeClickEvent(this.xKey, this.yKey, event, datum, this);
    };
    HistogramSeries.prototype.createNodeData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, xAxis, yAxis, xScale, yScale, _b, fill, stroke, strokeWidth, seriesId, nodeData, defaultLabelFormatter, _c, _d, labelFormatter, labelFontStyle, labelFontWeight, labelFontSize, labelFontFamily, labelColor;
            var _this = this;
            return __generator(this, function (_e) {
                _a = this, xAxis = _a.xAxis, yAxis = _a.yAxis;
                if (!this.seriesItemEnabled || !xAxis || !yAxis) {
                    return [2 /*return*/, []];
                }
                xScale = xAxis.scale;
                yScale = yAxis.scale;
                _b = this, fill = _b.fill, stroke = _b.stroke, strokeWidth = _b.strokeWidth, seriesId = _b.id;
                nodeData = [];
                defaultLabelFormatter = function (params) { return String(params.value); };
                _c = this.label, _d = _c.formatter, labelFormatter = _d === void 0 ? defaultLabelFormatter : _d, labelFontStyle = _c.fontStyle, labelFontWeight = _c.fontWeight, labelFontSize = _c.fontSize, labelFontFamily = _c.fontFamily, labelColor = _c.color;
                this.binnedData.forEach(function (binOfData) {
                    var total = binOfData.aggregatedValue, frequency = binOfData.frequency, _a = __read(binOfData.domain, 2), xDomainMin = _a[0], xDomainMax = _a[1], relativeHeight = binOfData.relativeHeight;
                    var xMinPx = xScale.convert(xDomainMin), xMaxPx = xScale.convert(xDomainMax), 
                    // note: assuming can't be negative:
                    y = _this.areaPlot ? relativeHeight : _this.yKey ? total : frequency, yZeroPx = yScale.convert(0), yMaxPx = yScale.convert(y), w = xMaxPx - xMinPx, h = Math.abs(yMaxPx - yZeroPx);
                    var selectionDatumLabel = y !== 0
                        ? {
                            text: labelFormatter({ value: binOfData.aggregatedValue, seriesId: seriesId }),
                            fontStyle: labelFontStyle,
                            fontWeight: labelFontWeight,
                            fontSize: labelFontSize,
                            fontFamily: labelFontFamily,
                            fill: labelColor,
                            x: xMinPx + w / 2,
                            y: yMaxPx + h / 2,
                        }
                        : undefined;
                    nodeData.push({
                        series: _this,
                        datum: binOfData,
                        // since each selection is an aggregation of multiple data.
                        x: xMinPx,
                        y: yMaxPx,
                        width: w,
                        height: h,
                        fill: fill,
                        stroke: stroke,
                        strokeWidth: strokeWidth,
                        label: selectionDatumLabel,
                    });
                });
                return [2 /*return*/, [{ itemId: this.yKey, nodeData: nodeData, labelData: nodeData }]];
            });
        });
    };
    HistogramSeries.prototype.updateDatumSelection = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var nodeData, datumSelection, updateRects, enterRects;
            return __generator(this, function (_a) {
                nodeData = opts.nodeData, datumSelection = opts.datumSelection;
                updateRects = datumSelection.setData(nodeData);
                updateRects.exit.remove();
                enterRects = updateRects.enter.append(Rect).each(function (rect) {
                    rect.tag = HistogramSeriesNodeTag.Bin;
                    rect.crisp = true;
                });
                return [2 /*return*/, updateRects.merge(enterRects)];
            });
        });
    };
    HistogramSeries.prototype.updateDatumNodes = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var datumSelection, isDatumHighlighted, _a, seriesFillOpacity, strokeOpacity, shadow, _b, highlightedFill, _c, highlightFillOpacity, highlightedStroke, highlightedDatumStrokeWidth;
            var _this = this;
            return __generator(this, function (_d) {
                datumSelection = opts.datumSelection, isDatumHighlighted = opts.isHighlight;
                _a = this, seriesFillOpacity = _a.fillOpacity, strokeOpacity = _a.strokeOpacity, shadow = _a.shadow, _b = _a.highlightStyle.item, highlightedFill = _b.fill, _c = _b.fillOpacity, highlightFillOpacity = _c === void 0 ? seriesFillOpacity : _c, highlightedStroke = _b.stroke, highlightedDatumStrokeWidth = _b.strokeWidth;
                datumSelection.each(function (rect, datum, index) {
                    var strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                        ? highlightedDatumStrokeWidth
                        : datum.strokeWidth;
                    var fillOpacity = isDatumHighlighted ? highlightFillOpacity : seriesFillOpacity;
                    rect.x = datum.x;
                    rect.y = datum.y;
                    rect.width = datum.width;
                    rect.height = datum.height;
                    rect.fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : datum.fill;
                    rect.stroke = isDatumHighlighted && highlightedStroke !== undefined ? highlightedStroke : datum.stroke;
                    rect.fillOpacity = fillOpacity;
                    rect.strokeOpacity = strokeOpacity;
                    rect.strokeWidth = strokeWidth;
                    rect.lineDash = _this.lineDash;
                    rect.lineDashOffset = _this.lineDashOffset;
                    rect.fillShadow = shadow;
                    rect.zIndex = isDatumHighlighted ? Series.highlightedZIndex : index;
                    rect.visible = datum.height > 0; // prevent stroke from rendering for zero height columns
                });
                return [2 /*return*/];
            });
        });
    };
    HistogramSeries.prototype.updateLabelSelection = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var labelData, labelSelection, updateTexts, enterTexts;
            return __generator(this, function (_a) {
                labelData = opts.labelData, labelSelection = opts.labelSelection;
                updateTexts = labelSelection.setData(labelData);
                updateTexts.exit.remove();
                enterTexts = updateTexts.enter.append(Text).each(function (text) {
                    text.tag = HistogramSeriesNodeTag.Label;
                    text.pointerEvents = PointerEvents.None;
                    text.textAlign = 'center';
                    text.textBaseline = 'middle';
                });
                return [2 /*return*/, updateTexts.merge(enterTexts)];
            });
        });
    };
    HistogramSeries.prototype.updateLabelNodes = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var labelSelection, labelEnabled;
            return __generator(this, function (_a) {
                labelSelection = opts.labelSelection;
                labelEnabled = this.label.enabled;
                labelSelection.each(function (text, datum) {
                    var label = datum.label;
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
                return [2 /*return*/];
            });
        });
    };
    HistogramSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var _a = this, xKey = _a.xKey, yKey = _a.yKey, xAxis = _a.xAxis, yAxis = _a.yAxis;
        if (!xKey || !xAxis || !yAxis) {
            return '';
        }
        var _b = this, xName = _b.xName, yName = _b.yName, color = _b.fill, tooltip = _b.tooltip, aggregation = _b.aggregation, seriesId = _b.id;
        var tooltipRenderer = tooltip.renderer;
        var bin = nodeDatum.datum;
        var aggregatedValue = bin.aggregatedValue, frequency = bin.frequency, _c = __read(bin.domain, 2), rangeMin = _c[0], rangeMax = _c[1];
        var title = sanitizeHtml(xName || xKey) + ": " + xAxis.formatDatum(rangeMin) + " - " + xAxis.formatDatum(rangeMax);
        var content = yKey
            ? "<b>" + sanitizeHtml(yName || yKey) + " (" + aggregation + ")</b>: " + yAxis.formatDatum(aggregatedValue) + "<br>"
            : '';
        content += "<b>Frequency</b>: " + frequency;
        var defaults = {
            title: title,
            backgroundColor: color,
            content: content,
        };
        if (tooltipRenderer) {
            return toTooltipHtml(tooltipRenderer({
                datum: bin,
                xKey: xKey,
                xValue: bin.domain,
                xName: xName,
                yKey: yKey,
                yValue: bin.aggregatedValue,
                yName: yName,
                color: color,
                title: title,
                seriesId: seriesId,
            }), defaults);
        }
        return toTooltipHtml(defaults);
    };
    HistogramSeries.prototype.getLegendData = function () {
        var _a = this, id = _a.id, data = _a.data, xKey = _a.xKey, yName = _a.yName, visible = _a.visible, fill = _a.fill, stroke = _a.stroke, fillOpacity = _a.fillOpacity, strokeOpacity = _a.strokeOpacity;
        if (!data || data.length === 0) {
            return [];
        }
        return [
            {
                id: id,
                itemId: xKey,
                seriesId: id,
                enabled: visible,
                label: {
                    text: yName || xKey || 'Frequency',
                },
                marker: {
                    fill: fill || 'rgba(0, 0, 0, 0)',
                    stroke: stroke || 'rgba(0, 0, 0, 0)',
                    fillOpacity: fillOpacity,
                    strokeOpacity: strokeOpacity,
                },
            },
        ];
    };
    HistogramSeries.prototype.isLabelEnabled = function () {
        return this.label.enabled;
    };
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
        Validate(STRING)
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
        Validate(STRING)
    ], HistogramSeries.prototype, "xName", void 0);
    __decorate([
        Validate(STRING)
    ], HistogramSeries.prototype, "yKey", void 0);
    __decorate([
        Validate(STRING)
    ], HistogramSeries.prototype, "yName", void 0);
    __decorate([
        Validate(NUMBER(0))
    ], HistogramSeries.prototype, "strokeWidth", void 0);
    return HistogramSeries;
}(CartesianSeries));
export { HistogramSeries };
