// ag-grid-enterprise v21.2.2
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
Object.defineProperty(exports, "__esModule", { value: true });
var group_1 = require("../../scene/group");
var selection_1 = require("../../scene/selection");
var rect_1 = require("../../scene/shape/rect");
var text_1 = require("../../scene/shape/text");
var bandScale_1 = require("../../scale/bandScale");
var palettes_1 = require("../palettes");
var series_1 = require("./series");
var node_1 = require("../../scene/node");
var number_1 = require("../../util/number");
var ag_grid_community_1 = require("ag-grid-community");
var numberAxis_1 = require("../axis/numberAxis");
var BarSeriesNodeTag;
(function (BarSeriesNodeTag) {
    BarSeriesNodeTag[BarSeriesNodeTag["Bar"] = 0] = "Bar";
    BarSeriesNodeTag[BarSeriesNodeTag["Label"] = 1] = "Label";
})(BarSeriesNodeTag || (BarSeriesNodeTag = {}));
var BarSeries = /** @class */ (function (_super) {
    __extends(BarSeries, _super);
    function BarSeries() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // Need to put bar and label nodes into separate groups, because even though label nodes are
        // created after the bar nodes, this only guarantees that labels will always be on top of bars
        // on the first run. If on the next run more bars are added, they might clip the labels
        // rendered during the previous run.
        _this.rectGroup = _this.group.appendChild(new group_1.Group);
        _this.textGroup = _this.group.appendChild(new group_1.Group);
        _this.rectSelection = selection_1.Selection.select(_this.rectGroup).selectAll();
        _this.textSelection = selection_1.Selection.select(_this.textGroup).selectAll();
        /**
         * The assumption is that the values will be reset (to `true`)
         * in the {@link yFields} setter.
         */
        _this.enabled = new Map();
        _this._fills = palettes_1.default.fills;
        _this._strokes = palettes_1.default.strokes;
        _this._fillOpacity = 1;
        _this._strokeOpacity = 1;
        _this.xData = [];
        _this.yData = [];
        _this.ySums = [];
        _this.domainY = [];
        /**
         * Used to get the position of bars within each group.
         */
        _this.groupScale = new bandScale_1.BandScale();
        _this._xField = '';
        /**
         * With a single value in the `yFields` array we get the regular bar series.
         * With multiple values, we get the stacked bar series.
         * If the {@link grouped} set to `true`, we get the grouped bar series.
         * @param values
         */
        _this._yFields = [];
        _this._yFieldNames = [];
        _this._grouped = false;
        /**
         * The value to normalize the stacks to, when {@link grouped} is `false`.
         * Should be a finite positive value or `NaN`.
         * Defaults to `NaN` - stacks are not normalized.
         */
        _this._normalizedTo = NaN;
        _this._strokeWidth = 1;
        _this._shadow = undefined;
        _this._labelEnabled = true;
        _this._labelFontStyle = undefined;
        _this._labelFontWeight = undefined;
        _this._labelFontSize = 12;
        _this._labelFontFamily = 'Verdana, sans-serif';
        _this._labelColor = 'black';
        _this._labelFormatter = undefined;
        _this.highlightStyle = {
            fill: 'yellow'
        };
        return _this;
    }
    Object.defineProperty(BarSeries.prototype, "fills", {
        get: function () {
            return this._fills;
        },
        set: function (values) {
            this._fills = values;
            this.strokes = values.map(function (color) { return ag_grid_community_1.Color.fromString(color).darker().toHexString(); });
            this.scheduleData();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BarSeries.prototype, "strokes", {
        get: function () {
            return this._strokes;
        },
        set: function (values) {
            this._strokes = values;
            this.scheduleData();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BarSeries.prototype, "fillOpacity", {
        get: function () {
            return this._fillOpacity;
        },
        set: function (value) {
            if (this._fillOpacity !== value) {
                this._fillOpacity = value;
                this.scheduleLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BarSeries.prototype, "strokeOpacity", {
        get: function () {
            return this._strokeOpacity;
        },
        set: function (value) {
            if (this._strokeOpacity !== value) {
                this._strokeOpacity = value;
                this.scheduleLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BarSeries.prototype, "chart", {
        get: function () {
            return this._chart;
        },
        set: function (chart) {
            if (this._chart !== chart) {
                this._chart = chart;
                this.scheduleData();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BarSeries.prototype, "xField", {
        get: function () {
            return this._xField;
        },
        set: function (value) {
            if (this._xField !== value) {
                this._xField = value;
                this.xData = [];
                this.scheduleData();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BarSeries.prototype, "yFields", {
        get: function () {
            return this._yFields;
        },
        set: function (values) {
            this._yFields = values;
            var enabled = this.enabled;
            enabled.clear();
            values.forEach(function (field) { return enabled.set(field, true); });
            var groupScale = this.groupScale;
            groupScale.domain = values;
            groupScale.padding = 0.1;
            groupScale.round = true;
            this.yData = [];
            this.scheduleData();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BarSeries.prototype, "yFieldNames", {
        get: function () {
            return this._yFieldNames;
        },
        set: function (values) {
            this._yFieldNames = values;
            this.update();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BarSeries.prototype, "grouped", {
        get: function () {
            return this._grouped;
        },
        set: function (value) {
            if (this._grouped !== value) {
                this._grouped = value;
                this.scheduleData();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BarSeries.prototype, "normalizedTo", {
        get: function () {
            return this._normalizedTo;
        },
        set: function (value) {
            if (value === 0) {
                value = NaN;
            }
            var absValue = Math.abs(value);
            if (this._normalizedTo !== absValue) {
                this._normalizedTo = absValue;
                this.scheduleData();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BarSeries.prototype, "strokeWidth", {
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
    Object.defineProperty(BarSeries.prototype, "shadow", {
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
    Object.defineProperty(BarSeries.prototype, "labelEnabled", {
        get: function () {
            return this._labelEnabled;
        },
        set: function (value) {
            if (this._labelEnabled !== value) {
                this._labelEnabled = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BarSeries.prototype, "labelFontStyle", {
        get: function () {
            return this._labelFontStyle;
        },
        set: function (value) {
            if (this._labelFontStyle !== value) {
                this._labelFontStyle = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BarSeries.prototype, "labelFontWeight", {
        get: function () {
            return this._labelFontWeight;
        },
        set: function (value) {
            if (this._labelFontWeight !== value) {
                this._labelFontWeight = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BarSeries.prototype, "labelFontSize", {
        get: function () {
            return this._labelFontSize;
        },
        set: function (value) {
            if (this._labelFontSize !== value) {
                this._labelFontSize = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BarSeries.prototype, "labelFontFamily", {
        get: function () {
            return this._labelFontFamily;
        },
        set: function (value) {
            if (this._labelFontFamily !== value) {
                this._labelFontFamily = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BarSeries.prototype, "labelColor", {
        get: function () {
            return this._labelColor;
        },
        set: function (value) {
            if (this._labelColor !== value) {
                this._labelColor = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BarSeries.prototype, "labelFormatter", {
        get: function () {
            return this._labelFormatter;
        },
        set: function (value) {
            if (this._labelFormatter !== value) {
                this._labelFormatter = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    BarSeries.prototype.highlightNode = function (node) {
        if (!(node instanceof rect_1.Rect)) {
            return;
        }
        this.highlightedNode = node;
        this.scheduleLayout();
    };
    BarSeries.prototype.dehighlightNode = function () {
        this.highlightedNode = undefined;
        this.scheduleLayout();
    };
    BarSeries.prototype.processData = function () {
        var data = this.data;
        var xField = this.xField;
        var yFields = this.yFields;
        if (!(xField && yFields.length)) {
            this._data = data = [];
        }
        // If the data is an array of rows like so:
        //
        // [{
        //   xField: 'Jan',
        //   yField1: 5,
        //   yField2: 7,
        //   yField3: -9,
        // }, {
        //   xField: 'Feb',
        //   yField1: 10,
        //   yField2: -15,
        //   yField3: 20
        // }]
        //
        var enabled = this.enabled;
        var normalizedTo = this.normalizedTo;
        var xData = this.xData = data.map(function (datum) { return datum[xField]; });
        var ySums = this.ySums = []; // used for normalization of stacked bars
        var yData = this.yData = data.map(function (datum, xIndex) {
            var values = [];
            var ySum = 0;
            yFields.forEach(function (field) {
                var value = datum[field];
                if (!isFinite(value) || !enabled.get(field)) {
                    value = 0;
                }
                if (value > 0) {
                    ySum += value;
                }
                values.push(value);
            });
            ySums[xIndex] = ySum;
            return values;
        });
        // xData: ['Jan', 'Feb']
        //
        // yData: [
        //   [5, 7, -9],
        //   [10, -15, 20]
        // ]
        var yMin = Infinity;
        var yMax = -Infinity;
        if (this.grouped) {
            // Find the tallest positive/negative bar in each group,
            // then find the tallest positive/negative bar overall.
            // The `yMin` should always be <= 0,
            // otherwise with the `yData` like [300, 200, 100] the last bar
            // will have zero height, because the y-axis range is [100, 300].
            yMin = Math.min.apply(Math, yData.map(function (groupValues) { return Math.min.apply(Math, [0].concat(groupValues)); }));
            yMax = Math.max.apply(Math, yData.map(function (groupValues) { return Math.max.apply(Math, groupValues); }));
        }
        else { // stacked or regular
            if (isFinite(normalizedTo)) {
                yMin = 0;
                yMax = normalizedTo;
                yData.forEach(function (stackValues, i) {
                    var ySum = ySums[i];
                    stackValues.forEach(function (y, j) { return stackValues[j] = y / ySum * normalizedTo; });
                });
            }
            else {
                // Find the height of each stack in the positive and negative directions,
                // then find the tallest stacks in both directions.
                yMin = Math.min.apply(Math, [0].concat(yData.map(function (stackValues) {
                    var min = 0;
                    stackValues.forEach(function (y) {
                        if (y < 0) {
                            min -= y;
                        }
                    });
                    return min;
                })));
                yMax = Math.max.apply(Math, yData.map(function (stackValues) {
                    var max = 0;
                    stackValues.forEach(function (y) {
                        if (y > 0) {
                            max += y;
                        }
                    });
                    return max;
                }));
            }
        }
        if (yMin === yMax || !isFinite(yMin) || !isFinite(yMax)) {
            yMin = 0;
            yMax = 1;
            // console.warn('Zero or infinite y-range.');
        }
        this.domainY = [yMin, yMax];
        var chart = this.chart;
        if (chart) {
            chart.updateAxes();
        }
        return true;
    };
    BarSeries.prototype.getDomainX = function () {
        return this.xData;
    };
    BarSeries.prototype.getDomainY = function () {
        return this.domainY;
    };
    BarSeries.prototype.update = function () {
        var _this = this;
        var chart = this.chart;
        var visible = this.group.visible = this.visible;
        if (!chart || !visible || chart.dataPending || chart.layoutPending || !(chart.xAxis && chart.yAxis)) {
            return;
        }
        var categoryCount = this.data.length;
        var flipXY = !(chart.yAxis instanceof numberAxis_1.NumberAxis);
        var xAxis = flipXY ? chart.yAxis : chart.xAxis;
        var yAxis = flipXY ? chart.xAxis : chart.yAxis;
        var xScale = xAxis.scale;
        var yScale = yAxis.scale;
        var groupScale = this.groupScale;
        var yFields = this.yFields;
        var fills = this.fills;
        var strokes = this.strokes;
        var fillOpacity = this.fillOpacity;
        var strokeOpacity = this.strokeOpacity;
        var grouped = this.grouped;
        var strokeWidth = this.strokeWidth;
        var enabled = this.enabled;
        var labelEnabled = this.labelEnabled;
        var labelFontStyle = this.labelFontStyle;
        var labelFontWeight = this.labelFontWeight;
        var labelFontSize = this.labelFontSize;
        var labelFontFamily = this.labelFontFamily;
        var labelColor = this.labelColor;
        var labelFormatter = this.labelFormatter;
        var data = this.data;
        var xData = this.xData;
        var yData = this.yData;
        groupScale.range = [0, xScale.bandwidth];
        var barWidth = grouped ? groupScale.bandwidth : xScale.bandwidth;
        var selectionData = [];
        for (var i = 0; i < categoryCount; i++) {
            var category = xData[i];
            var values = yData[i];
            var valueCount = values.length;
            var x = xScale.convert(category);
            var prev = 0;
            var curr = void 0;
            for (var j = 0; j < valueCount; j++) {
                curr = values[j];
                var yField = yFields[j];
                var yFieldEnabled = enabled.get(yField);
                var barX = grouped ? x + groupScale.convert(yField) : x;
                var y = yScale.convert((grouped ? curr : prev + curr));
                var bottomY = yScale.convert((grouped ? 0 : prev));
                var seriesDatum = data[i];
                var yValue = seriesDatum[yField]; // unprocessed y-value
                var yValueIsNumber = typeof yValue === 'number';
                var labelText = void 0;
                if (labelFormatter) {
                    labelText = labelFormatter({
                        value: yValueIsNumber ? yValue : NaN
                    });
                }
                else {
                    labelText = yValueIsNumber && isFinite(yValue) ? yValue.toFixed(2) : '';
                }
                selectionData.push({
                    seriesDatum: seriesDatum,
                    yValue: yValue,
                    yField: yField,
                    x: flipXY ? Math.min(y, bottomY) : barX,
                    y: flipXY ? barX : Math.min(y, bottomY),
                    width: flipXY ? Math.abs(bottomY - y) : barWidth,
                    height: flipXY ? barWidth : Math.abs(bottomY - y),
                    fill: fills[j % fills.length],
                    stroke: strokes[j % strokes.length],
                    strokeWidth: strokeWidth,
                    label: yFieldEnabled && labelText ? {
                        text: labelText,
                        fontStyle: labelFontStyle,
                        fontWeight: labelFontWeight,
                        fontSize: labelFontSize,
                        fontFamily: labelFontFamily,
                        fill: labelColor,
                        x: flipXY ? y + (yValue >= 0 ? -1 : 1) * Math.abs(bottomY - y) / 2 : barX + barWidth / 2,
                        y: flipXY ? barX + barWidth / 2 : y + (yValue >= 0 ? 1 : -1) * Math.abs(bottomY - y) / 2
                    } : undefined
                });
                if (grouped) {
                    prev = curr;
                }
                else {
                    prev += curr;
                }
            }
        }
        var updateRects = this.rectSelection.setData(selectionData);
        var updateTexts = this.textSelection.setData(selectionData);
        updateRects.exit.remove();
        updateTexts.exit.remove();
        var enterRects = updateRects.enter.append(rect_1.Rect).each(function (rect) {
            rect.tag = BarSeriesNodeTag.Bar;
            // rect.sizing = RectSizing.Border;
            rect.crisp = true;
        });
        var enterTexts = updateTexts.enter.append(text_1.Text).each(function (text) {
            text.tag = BarSeriesNodeTag.Label;
            text.pointerEvents = node_1.PointerEvents.None;
            text.textAlign = 'center';
            text.textBaseline = 'middle';
        });
        var highlightedNode = this.highlightedNode;
        var rectSelection = updateRects.merge(enterRects);
        var textSelection = updateTexts.merge(enterTexts);
        rectSelection.each(function (rect, datum) {
            rect.x = datum.x;
            rect.y = datum.y;
            rect.width = datum.width;
            rect.height = datum.height;
            rect.fill = rect === highlightedNode && _this.highlightStyle.fill !== undefined
                ? _this.highlightStyle.fill
                : datum.fill;
            rect.stroke = rect === highlightedNode && _this.highlightStyle.stroke !== undefined
                ? _this.highlightStyle.stroke
                : datum.stroke;
            rect.fillOpacity = fillOpacity;
            rect.strokeOpacity = strokeOpacity;
            rect.strokeWidth = datum.strokeWidth;
            rect.fillShadow = _this.shadow;
            rect.visible = datum.height > 0; // prevent stroke from rendering for zero height columns
        });
        textSelection.each(function (text, datum) {
            var label = datum.label;
            if (label && labelEnabled) {
                text.fontStyle = label.fontStyle;
                text.fontWeight = label.fontWeight;
                text.fontSize = label.fontSize;
                text.fontFamily = label.fontFamily;
                text.text = label.text;
                text.x = label.x;
                text.y = label.y;
                text.fill = label.fill;
                text.visible = true;
            }
            else {
                text.visible = false;
            }
        });
        this.rectSelection = rectSelection;
        this.textSelection = textSelection;
    };
    BarSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var html = '';
        if (this.tooltipEnabled) {
            var xField = this.xField;
            var yField = nodeDatum.yField;
            var yFields = this.yFields;
            var yFieldIndex = yFields.indexOf(yField);
            var datum = nodeDatum.seriesDatum;
            var color = this.fills[yFieldIndex % this.fills.length];
            var title = this.yFieldNames[yFieldIndex] || undefined;
            if (this.tooltipRenderer && xField) {
                html = this.tooltipRenderer({
                    datum: datum,
                    xField: xField,
                    yField: yField,
                    title: title,
                    color: color
                });
            }
            else {
                var titleStyle = "style=\"color: white; background-color: " + color + "\"";
                title = title ? "<div class=\"title\" " + titleStyle + ">" + title + "</div>" : '';
                var xValue = datum[xField];
                var yValue = datum[yField];
                var xString = typeof (xValue) === 'number' ? number_1.toFixed(xValue) : String(xValue);
                var yString = typeof (yValue) === 'number' ? number_1.toFixed(yValue) : String(yValue);
                html = title + "<div class=\"content\">" + xString + ": " + yString + "</div>";
            }
        }
        return html;
    };
    BarSeries.prototype.listSeriesItems = function (data) {
        var _this = this;
        if (this.data.length && this.xField && this.yFields.length) {
            var fills_1 = this.fills;
            var strokes_1 = this.strokes;
            var id_1 = this.id;
            this.yFields.forEach(function (yField, index) {
                data.push({
                    id: id_1,
                    itemId: yField,
                    enabled: _this.enabled.get(yField) || false,
                    label: {
                        text: _this.yFieldNames[index] || _this.yFields[index]
                    },
                    marker: {
                        fill: fills_1[index % fills_1.length],
                        stroke: strokes_1[index % strokes_1.length]
                    }
                });
            });
        }
    };
    BarSeries.prototype.toggleSeriesItem = function (itemId, enabled) {
        this.enabled.set(itemId, enabled);
        var enabledYFields = [];
        this.enabled.forEach(function (enabled, yField) {
            if (enabled) {
                enabledYFields.push(yField);
            }
        });
        this.groupScale.domain = enabledYFields;
        this.scheduleData();
    };
    BarSeries.className = 'BarSeries';
    return BarSeries;
}(series_1.Series));
exports.BarSeries = BarSeries;
