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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var group_1 = require("../../../scene/group");
var selection_1 = require("../../../scene/selection");
var rect_1 = require("../../../scene/shape/rect");
var text_1 = require("../../../scene/shape/text");
var palettes_1 = require("../../palettes");
var label_1 = require("../../label");
var node_1 = require("../../../scene/node");
var cartesianSeries_1 = require("./cartesianSeries");
var chartAxis_1 = require("../../chartAxis");
var chart_1 = require("../../chart");
var array_1 = require("../../../util/array");
var number_1 = require("../../../util/number");
var observable_1 = require("../../../util/observable");
var ticks_1 = require("../../../util/ticks");
var HistogramSeriesNodeTag;
(function (HistogramSeriesNodeTag) {
    HistogramSeriesNodeTag[HistogramSeriesNodeTag["Bin"] = 0] = "Bin";
    HistogramSeriesNodeTag[HistogramSeriesNodeTag["Label"] = 1] = "Label";
})(HistogramSeriesNodeTag || (HistogramSeriesNodeTag = {}));
var HistogramSeriesLabel = /** @class */ (function (_super) {
    __extends(HistogramSeriesLabel, _super);
    function HistogramSeriesLabel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        observable_1.reactive('change')
    ], HistogramSeriesLabel.prototype, "formatter", void 0);
    return HistogramSeriesLabel;
}(label_1.Label));
var defaultBinCount = 10;
var aggregationFunctions = {
    count: function (bin) { return bin.data.length; },
    sum: function (bin, yKey) { return bin.data.reduce(function (acc, datum) { return acc + datum[yKey]; }, 0); },
    mean: function (bin, yKey) { return aggregationFunctions.sum(bin, yKey) / aggregationFunctions.count(bin, yKey); }
};
var HistogramBin = /** @class */ (function () {
    function HistogramBin(_a) {
        var domainMin = _a[0], domainMax = _a[1];
        this.data = [];
        this.aggregatedValue = 0;
        this.frequency = 0;
        this.domain = [domainMin, domainMax];
    }
    ;
    HistogramBin.prototype.addDatum = function (datum) {
        this.data.push(datum);
        this.frequency++;
    };
    ;
    Object.defineProperty(HistogramBin.prototype, "domainWidth", {
        get: function () {
            var _a = this.domain, domainMin = _a[0], domainMax = _a[1];
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
    ;
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
;
var HistogramSeries = /** @class */ (function (_super) {
    __extends(HistogramSeries, _super);
    function HistogramSeries() {
        var _a;
        var _this = _super.call(this) || this;
        // Need to put column and label nodes into separate groups, because even though label nodes are
        // created after the column nodes, this only guarantees that labels will always be on top of columns
        // on the first run. If on the next run more columns are added, they might clip the labels
        // rendered during the previous run.
        _this.rectGroup = _this.group.appendChild(new group_1.Group());
        _this.textGroup = _this.group.appendChild(new group_1.Group());
        _this.rectSelection = selection_1.Selection.select(_this.rectGroup).selectAll();
        _this.textSelection = selection_1.Selection.select(_this.textGroup).selectAll();
        _this.binnedData = [];
        _this.xDomain = [];
        _this.yDomain = [];
        _this.label = new HistogramSeriesLabel();
        _this.seriesItemEnabled = true;
        _this.fill = palettes_1.default.fills[0];
        _this.stroke = palettes_1.default.strokes[0];
        _this.fillOpacity = 1;
        _this.strokeOpacity = 1;
        _this.directionKeys = (_a = {},
            _a[chartAxis_1.ChartAxisDirection.X] = ['xKey'],
            _a[chartAxis_1.ChartAxisDirection.Y] = ['yKey'],
            _a);
        _this._xKey = '';
        _this._areaPlot = false;
        _this._xName = '';
        _this._yKey = '';
        _this._yName = '';
        _this._strokeWidth = 1;
        _this.highlightStyle = { fill: 'yellow' };
        _this.label.enabled = false;
        _this.label.addEventListener('change', _this.update, _this);
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
                        values.push.apply(values, value);
                    }
                    else {
                        values.push(value);
                    }
                }
            });
        }
        return values;
    };
    Object.defineProperty(HistogramSeries.prototype, "xKey", {
        get: function () {
            return this._xKey;
        },
        set: function (value) {
            if (this._xKey !== value) {
                this._xKey = value;
                this.scheduleData();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HistogramSeries.prototype, "areaPlot", {
        get: function () {
            return this._areaPlot;
        },
        set: function (c) {
            this._areaPlot = c;
            this.scheduleData();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HistogramSeries.prototype, "bins", {
        get: function () {
            return this._bins;
        },
        set: function (bins) {
            this._bins = bins;
            this.scheduleData();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HistogramSeries.prototype, "aggregation", {
        get: function () {
            return this._aggregation;
        },
        set: function (aggregation) {
            this._aggregation = aggregation;
            this.scheduleData();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HistogramSeries.prototype, "binCount", {
        get: function () {
            return this._binCount;
        },
        set: function (binCount) {
            this._binCount = binCount;
            this.scheduleData();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HistogramSeries.prototype, "xName", {
        get: function () {
            return this._xName;
        },
        set: function (value) {
            if (this._xName !== value) {
                this._xName = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HistogramSeries.prototype, "yKey", {
        get: function () {
            return this._yKey;
        },
        set: function (yKey) {
            this._yKey = yKey;
            this.seriesItemEnabled = true;
            this.scheduleData();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HistogramSeries.prototype, "yName", {
        get: function () {
            return this._yName;
        },
        set: function (values) {
            this._yName = values;
            this.scheduleData();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HistogramSeries.prototype, "strokeWidth", {
        get: function () {
            return this._strokeWidth;
        },
        set: function (value) {
            if (this._strokeWidth !== value) {
                this._strokeWidth = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HistogramSeries.prototype, "shadow", {
        get: function () {
            return this._shadow;
        },
        set: function (value) {
            if (this._shadow !== value) {
                this._shadow = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    HistogramSeries.prototype.onHighlightChange = function () {
        this.updateRectNodes();
    };
    /*  during processData phase, used to unify different ways of the user specifying
        the bins. Returns bins in format [[min1, max1], [min2, max2] ... ] */
    HistogramSeries.prototype.deriveBins = function () {
        var _this = this;
        var _a = this, bins = _a.bins, binCount = _a.binCount;
        if (bins && binCount) {
            console.warn('bin domain and bin count both specified - these are mutually exclusive properties');
        }
        if (bins) {
            // we have explicity set bins from user. Use those.
            return bins;
        }
        var xData = this.data.map(function (datum) { return datum[_this.xKey]; });
        var xDomain = this.fixNumericExtent(array_1.finiteExtent(xData), 'x');
        var binStarts = ticks_1.default(xDomain[0], xDomain[1], this.binCount || defaultBinCount);
        var binSize = ticks_1.tickStep(xDomain[0], xDomain[1], this.binCount || defaultBinCount);
        var firstBinEnd = binStarts[0];
        var expandStartToBin = function (n) { return [n, n + binSize]; };
        return __spreadArrays([
            [firstBinEnd - binSize, firstBinEnd]
        ], binStarts.map(expandStartToBin));
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
        var currentBin = 0;
        var bins = [new HistogramBin(derivedBins[0])];
        sortedData.forEach(function (datum) {
            while (datum[xKey] > derivedBins[currentBin][1]) {
                currentBin++;
                bins.push(new HistogramBin(derivedBins[currentBin]));
            }
            bins[currentBin].addDatum(datum);
        });
        bins.forEach(function (b) { return b.calculateAggregatedValue(_this._aggregation, _this.yKey); });
        return bins;
    };
    Object.defineProperty(HistogramSeries.prototype, "xMax", {
        get: function () {
            var _this = this;
            return this.data && this.data.reduce(function (acc, datum) {
                return Math.max(acc, datum[_this.xKey]);
            }, Number.NEGATIVE_INFINITY);
        },
        enumerable: true,
        configurable: true
    });
    HistogramSeries.prototype.processData = function () {
        var _this = this;
        var _a = this, xKey = _a.xKey, data = _a.data;
        this.binnedData = this.placeDataInBins(xKey && data ? data : []);
        var yData = this.binnedData.map(function (b) { return b.getY(_this.areaPlot); });
        var yMinMax = array_1.numericExtent(yData);
        this.yDomain = this.fixNumericExtent([0, yMinMax[1]], 'y');
        var firstBin = this.binnedData[0];
        var lastBin = this.binnedData[this.binnedData.length - 1];
        var xMin = firstBin.domain[0];
        var xMax = lastBin.domain[1];
        this.xDomain = [xMin, xMax];
        this.fireEvent({ type: 'dataProcessed' });
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
    HistogramSeries.prototype.fireNodeClickEvent = function (datum) {
        this.fireEvent({
            type: 'nodeClick',
            series: this,
            datum: datum.seriesDatum,
            xKey: this.xKey
        });
    };
    HistogramSeries.prototype.update = function () {
        var _a = this, visible = _a.visible, chart = _a.chart, xAxis = _a.xAxis, yAxis = _a.yAxis;
        this.group.visible = visible;
        if (!xAxis || !yAxis || !visible || !chart || chart.layoutPending || chart.dataPending) {
            return;
        }
        var nodeData = this.generateNodeData();
        this.updateRectSelection(nodeData);
        this.updateRectNodes();
        this.updateTextSelection(nodeData);
        this.updateTextNodes();
    };
    HistogramSeries.prototype.generateNodeData = function () {
        var _this = this;
        if (!this.seriesItemEnabled) {
            return [];
        }
        var _a = this, xScale = _a.xAxis.scale, yScale = _a.yAxis.scale, fill = _a.fill, stroke = _a.stroke, strokeWidth = _a.strokeWidth;
        var nodeData = [];
        var defaultLabelFormatter = function (b) { return String(b.aggregatedValue); };
        var _b = this.label, _c = _b.formatter, labelFormatter = _c === void 0 ? defaultLabelFormatter : _c, labelFontStyle = _b.fontStyle, labelFontWeight = _b.fontWeight, labelFontSize = _b.fontSize, labelFontFamily = _b.fontFamily, labelColor = _b.color;
        this.binnedData.forEach(function (binOfData) {
            var total = binOfData.aggregatedValue, frequency = binOfData.frequency, _a = binOfData.domain, xDomainMin = _a[0], xDomainMax = _a[1], relativeHeight = binOfData.relativeHeight;
            var xMinPx = xScale.convert(xDomainMin), xMaxPx = xScale.convert(xDomainMax), 
            // note: assuming can't be negative:
            y = _this.areaPlot ? relativeHeight : (_this.yKey ? total : frequency), yZeroPx = yScale.convert(0), yMaxPx = yScale.convert(y), w = xMaxPx - xMinPx, h = Math.abs(yMaxPx - yZeroPx);
            var selectionDatumLabel = y !== 0 && {
                text: labelFormatter(binOfData),
                fontStyle: labelFontStyle,
                fontWeight: labelFontWeight,
                fontSize: labelFontSize,
                fontFamily: labelFontFamily,
                fill: labelColor,
                x: xMinPx + w / 2,
                y: yMaxPx + h / 2
            };
            nodeData.push({
                series: _this,
                seriesDatum: binOfData,
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
        return nodeData;
    };
    HistogramSeries.prototype.updateRectSelection = function (nodeData) {
        var updateRects = this.rectSelection.setData(nodeData);
        updateRects.exit.remove();
        var enterRects = updateRects.enter.append(rect_1.Rect).each(function (rect) {
            rect.tag = HistogramSeriesNodeTag.Bin;
            rect.crisp = true;
        });
        this.rectSelection = updateRects.merge(enterRects);
    };
    HistogramSeries.prototype.updateRectNodes = function () {
        var highlightedDatum = this.chart.highlightedDatum;
        var _a = this, fillOpacity = _a.fillOpacity, strokeOpacity = _a.strokeOpacity, shadow = _a.shadow, _b = _a.highlightStyle, fill = _b.fill, stroke = _b.stroke;
        this.rectSelection.each(function (rect, datum) {
            var highlighted = datum === highlightedDatum;
            rect.x = datum.x;
            rect.y = datum.y;
            rect.width = datum.width;
            rect.height = datum.height;
            rect.fill = highlighted && fill !== undefined ? fill : datum.fill;
            rect.stroke = highlighted && stroke !== undefined ? stroke : datum.stroke;
            rect.fillOpacity = fillOpacity;
            rect.strokeOpacity = strokeOpacity;
            rect.strokeWidth = datum.strokeWidth;
            rect.fillShadow = shadow;
            rect.visible = datum.height > 0; // prevent stroke from rendering for zero height columns
        });
    };
    HistogramSeries.prototype.updateTextSelection = function (nodeData) {
        var updateTexts = this.textSelection.setData(nodeData);
        updateTexts.exit.remove();
        var enterTexts = updateTexts.enter.append(text_1.Text).each(function (text) {
            text.tag = HistogramSeriesNodeTag.Label;
            text.pointerEvents = node_1.PointerEvents.None;
            text.textAlign = 'center';
            text.textBaseline = 'middle';
        });
        this.textSelection = updateTexts.merge(enterTexts);
    };
    HistogramSeries.prototype.updateTextNodes = function () {
        var labelEnabled = this.label.enabled;
        this.textSelection.each(function (text, datum) {
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
        var _a = this, xKey = _a.xKey, yKey = _a.yKey;
        if (!xKey) {
            return '';
        }
        var _b = this, xName = _b.xName, yName = _b.yName, fill = _b.fill, tooltipRenderer = _b.tooltipRenderer, aggregation = _b.aggregation;
        var bin = nodeDatum.seriesDatum;
        var aggregatedValue = bin.aggregatedValue, frequency = bin.frequency, _c = bin.domain, rangeMin = _c[0], rangeMax = _c[1];
        if (tooltipRenderer) {
            return tooltipRenderer({
                datum: bin,
                xKey: xKey,
                xName: xName,
                yKey: yKey,
                yName: yName,
                color: fill
            });
        }
        else {
            var titleStyle = "style=\"color: white; background-color: " + fill + "\"";
            var titleString = "\n                <div class=\"" + chart_1.Chart.defaultTooltipClass + "-title\" " + titleStyle + ">\n                    " + (xName || xKey) + " " + number_1.toFixed(rangeMin) + " - " + number_1.toFixed(rangeMax) + "\n                </div>";
            var contentHtml = yKey ?
                "<b>" + (yName || yKey) + " (" + aggregation + ")</b>: " + number_1.toFixed(aggregatedValue) + "<br>" :
                '';
            contentHtml += "<b>Frequency</b>: " + frequency;
            return "\n                " + titleString + "\n                <div class=\"" + chart_1.Chart.defaultTooltipClass + "-content\">\n                    " + contentHtml + "\n                </div>";
        }
    };
    HistogramSeries.prototype.listSeriesItems = function (legendData) {
        var _a = this, id = _a.id, data = _a.data, yKey = _a.yKey, yName = _a.yName, seriesItemEnabled = _a.seriesItemEnabled, fill = _a.fill, stroke = _a.stroke, fillOpacity = _a.fillOpacity, strokeOpacity = _a.strokeOpacity;
        if (data && data.length) {
            legendData.push({
                id: id,
                itemId: yKey,
                enabled: seriesItemEnabled,
                label: {
                    text: yName || yKey || 'Frequency'
                },
                marker: {
                    fill: fill,
                    stroke: stroke,
                    fillOpacity: fillOpacity,
                    strokeOpacity: strokeOpacity
                }
            });
        }
    };
    HistogramSeries.prototype.toggleSeriesItem = function (itemId, enabled) {
        if (itemId === this.yKey) {
            this.seriesItemEnabled = enabled;
        }
        this.scheduleData();
    };
    HistogramSeries.className = 'HistogramSeries';
    HistogramSeries.type = 'histogram';
    __decorate([
        observable_1.reactive('dataChange')
    ], HistogramSeries.prototype, "fill", void 0);
    __decorate([
        observable_1.reactive('dataChange')
    ], HistogramSeries.prototype, "stroke", void 0);
    __decorate([
        observable_1.reactive('layoutChange')
    ], HistogramSeries.prototype, "fillOpacity", void 0);
    __decorate([
        observable_1.reactive('layoutChange')
    ], HistogramSeries.prototype, "strokeOpacity", void 0);
    return HistogramSeries;
}(cartesianSeries_1.CartesianSeries));
exports.HistogramSeries = HistogramSeries;
//# sourceMappingURL=histogramSeries.js.map