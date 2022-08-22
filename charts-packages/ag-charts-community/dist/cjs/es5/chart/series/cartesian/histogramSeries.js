"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
Object.defineProperty(exports, "__esModule", { value: true });
var rect_1 = require("../../../scene/shape/rect");
var text_1 = require("../../../scene/shape/text");
var series_1 = require("../series");
var label_1 = require("../../label");
var node_1 = require("../../../scene/node");
var cartesianSeries_1 = require("./cartesianSeries");
var chartAxis_1 = require("../../chartAxis");
var chart_1 = require("../../chart");
var array_1 = require("../../../util/array");
var ticks_1 = require("../../../util/ticks");
var sanitize_1 = require("../../../util/sanitize");
var value_1 = require("../../../util/value");
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
    return HistogramSeriesLabel;
}(label_1.Label));
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
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HistogramBin.prototype, "relativeHeight", {
        get: function () {
            return this.aggregatedValue / this.domainWidth;
        },
        enumerable: true,
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
exports.HistogramBin = HistogramBin;
var HistogramSeriesTooltip = /** @class */ (function (_super) {
    __extends(HistogramSeriesTooltip, _super);
    function HistogramSeriesTooltip() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.renderer = undefined;
        return _this;
    }
    return HistogramSeriesTooltip;
}(series_1.SeriesTooltip));
exports.HistogramSeriesTooltip = HistogramSeriesTooltip;
var HistogramSeries = /** @class */ (function (_super) {
    __extends(HistogramSeries, _super);
    function HistogramSeries() {
        var _a;
        var _this = _super.call(this, { pickModes: [series_1.SeriesNodePickMode.EXACT_SHAPE_MATCH] }) || this;
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
            _a[chartAxis_1.ChartAxisDirection.X] = ['xKey'],
            _a[chartAxis_1.ChartAxisDirection.Y] = ['yKey'],
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
    HistogramSeries.prototype.setColors = function (fills, strokes) {
        this.fill = fills[0];
        this.stroke = strokes[0];
    };
    // During processData phase, used to unify different ways of the user specifying
    // the bins. Returns bins in format[[min1, max1], [min2, max2], ... ].
    HistogramSeries.prototype.deriveBins = function () {
        var _this = this;
        var bins = this.bins;
        if (!this.data) {
            return [];
        }
        if (bins) {
            return bins;
        }
        var xData = this.data.map(function (datum) { return datum[_this.xKey]; });
        var xDomain = this.fixNumericExtent(array_1.extent(xData, value_1.isContinuous));
        if (this.binCount === undefined) {
            var binStarts = ticks_1.default(xDomain[0], xDomain[1], this.binCount || defaultBinCount);
            var binSize_1 = ticks_1.tickStep(xDomain[0], xDomain[1], this.binCount || defaultBinCount);
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
        enumerable: true,
        configurable: true
    });
    HistogramSeries.prototype.processData = function () {
        var _this = this;
        var _a = this, xKey = _a.xKey, data = _a.data;
        this.binnedData = this.placeDataInBins(xKey && data ? data : []);
        var yData = this.binnedData.map(function (b) { return b.getY(_this.areaPlot); });
        var yMinMax = array_1.extent(yData, value_1.isContinuous);
        this.yDomain = this.fixNumericExtent([0, yMinMax ? yMinMax[1] : 1]);
        var firstBin = this.binnedData[0];
        var lastBin = this.binnedData[this.binnedData.length - 1];
        var xMin = firstBin.domain[0];
        var xMax = lastBin.domain[1];
        this.xDomain = [xMin, xMax];
        return true;
    };
    HistogramSeries.prototype.getDomain = function (direction) {
        if (direction === chartAxis_1.ChartAxisDirection.X) {
            return this.xDomain;
        }
        else {
            return this.yDomain;
        }
    };
    HistogramSeries.prototype.fireNodeClickEvent = function (event, datum) {
        this.fireEvent({
            type: 'nodeClick',
            event: event,
            series: this,
            datum: datum.datum,
            xKey: this.xKey,
        });
    };
    HistogramSeries.prototype.createNodeData = function () {
        var _this = this;
        var _a = this, xAxis = _a.xAxis, yAxis = _a.yAxis;
        if (!this.seriesItemEnabled || !xAxis || !yAxis) {
            return [];
        }
        var xScale = xAxis.scale;
        var yScale = yAxis.scale;
        var _b = this, fill = _b.fill, stroke = _b.stroke, strokeWidth = _b.strokeWidth;
        var nodeData = [];
        var defaultLabelFormatter = function (params) { return String(params.value); };
        var _c = this.label, _d = _c.formatter, labelFormatter = _d === void 0 ? defaultLabelFormatter : _d, labelFontStyle = _c.fontStyle, labelFontWeight = _c.fontWeight, labelFontSize = _c.fontSize, labelFontFamily = _c.fontFamily, labelColor = _c.color;
        this.binnedData.forEach(function (binOfData) {
            var total = binOfData.aggregatedValue, frequency = binOfData.frequency, _a = __read(binOfData.domain, 2), xDomainMin = _a[0], xDomainMax = _a[1], relativeHeight = binOfData.relativeHeight;
            var xMinPx = xScale.convert(xDomainMin), xMaxPx = xScale.convert(xDomainMax), 
            // note: assuming can't be negative:
            y = _this.areaPlot ? relativeHeight : _this.yKey ? total : frequency, yZeroPx = yScale.convert(0), yMaxPx = yScale.convert(y), w = xMaxPx - xMinPx, h = Math.abs(yMaxPx - yZeroPx);
            var selectionDatumLabel = y !== 0
                ? {
                    text: labelFormatter({ value: binOfData.aggregatedValue }),
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
        return [{ itemId: this.yKey, nodeData: nodeData, labelData: nodeData }];
    };
    HistogramSeries.prototype.updateDatumSelection = function (opts) {
        var nodeData = opts.nodeData, datumSelection = opts.datumSelection;
        var updateRects = datumSelection.setData(nodeData);
        updateRects.exit.remove();
        var enterRects = updateRects.enter.append(rect_1.Rect).each(function (rect) {
            rect.tag = HistogramSeriesNodeTag.Bin;
            rect.crisp = true;
        });
        return updateRects.merge(enterRects);
    };
    HistogramSeries.prototype.updateDatumNodes = function (opts) {
        var _this = this;
        var datumSelection = opts.datumSelection, isDatumHighlighted = opts.isHighlight;
        var _a = this, seriesFillOpacity = _a.fillOpacity, strokeOpacity = _a.strokeOpacity, shadow = _a.shadow, _b = _a.highlightStyle, deprecatedFill = _b.fill, deprecatedStroke = _b.stroke, deprecatedStrokeWidth = _b.strokeWidth, _c = _b.item, _d = _c.fill, highlightedFill = _d === void 0 ? deprecatedFill : _d, _e = _c.fillOpacity, highlightFillOpacity = _e === void 0 ? seriesFillOpacity : _e, _f = _c.stroke, highlightedStroke = _f === void 0 ? deprecatedStroke : _f, _g = _c.strokeWidth, highlightedDatumStrokeWidth = _g === void 0 ? deprecatedStrokeWidth : _g;
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
            rect.zIndex = isDatumHighlighted ? series_1.Series.highlightedZIndex : index;
            rect.visible = datum.height > 0; // prevent stroke from rendering for zero height columns
        });
    };
    HistogramSeries.prototype.updateLabelSelection = function (opts) {
        var labelData = opts.labelData, labelSelection = opts.labelSelection;
        var updateTexts = labelSelection.setData(labelData);
        updateTexts.exit.remove();
        var enterTexts = updateTexts.enter.append(text_1.Text).each(function (text) {
            text.tag = HistogramSeriesNodeTag.Label;
            text.pointerEvents = node_1.PointerEvents.None;
            text.textAlign = 'center';
            text.textBaseline = 'middle';
        });
        return updateTexts.merge(enterTexts);
    };
    HistogramSeries.prototype.updateLabelNodes = function (opts) {
        var labelSelection = opts.labelSelection;
        var labelEnabled = this.label.enabled;
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
    };
    HistogramSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var _a = this, xKey = _a.xKey, yKey = _a.yKey, xAxis = _a.xAxis, yAxis = _a.yAxis;
        if (!xKey || !xAxis || !yAxis) {
            return '';
        }
        var _b = this, xName = _b.xName, yName = _b.yName, color = _b.fill, tooltip = _b.tooltip, aggregation = _b.aggregation;
        var tooltipRenderer = tooltip.renderer;
        var bin = nodeDatum.datum;
        var aggregatedValue = bin.aggregatedValue, frequency = bin.frequency, _c = __read(bin.domain, 2), rangeMin = _c[0], rangeMax = _c[1];
        var title = sanitize_1.sanitizeHtml(xName || xKey) + ": " + xAxis.formatDatum(rangeMin) + " - " + xAxis.formatDatum(rangeMax);
        var content = yKey
            ? "<b>" + sanitize_1.sanitizeHtml(yName || yKey) + " (" + aggregation + ")</b>: " + yAxis.formatDatum(aggregatedValue) + "<br>"
            : '';
        content += "<b>Frequency</b>: " + frequency;
        var defaults = {
            title: title,
            backgroundColor: color,
            content: content,
        };
        if (tooltipRenderer) {
            return chart_1.toTooltipHtml(tooltipRenderer({
                datum: bin,
                xKey: xKey,
                xValue: bin.domain,
                xName: xName,
                yKey: yKey,
                yValue: bin.aggregatedValue,
                yName: yName,
                color: color,
                title: title,
            }), defaults);
        }
        return chart_1.toTooltipHtml(defaults);
    };
    HistogramSeries.prototype.listSeriesItems = function (legendData) {
        var _a = this, id = _a.id, data = _a.data, xKey = _a.xKey, yName = _a.yName, visible = _a.visible, fill = _a.fill, stroke = _a.stroke, fillOpacity = _a.fillOpacity, strokeOpacity = _a.strokeOpacity;
        if (data && data.length) {
            legendData.push({
                id: id,
                itemId: xKey,
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
            });
        }
    };
    HistogramSeries.className = 'HistogramSeries';
    HistogramSeries.type = 'histogram';
    return HistogramSeries;
}(cartesianSeries_1.CartesianSeries));
exports.HistogramSeries = HistogramSeries;
