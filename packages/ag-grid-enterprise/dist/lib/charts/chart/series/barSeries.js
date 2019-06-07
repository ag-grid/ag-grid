// ag-grid-enterprise v21.0.1
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
var color_1 = require("../../util/color");
var series_1 = require("./series");
var node_1 = require("../../scene/node");
var number_1 = require("../../util/number");
var BarSeriesNodeTag;
(function (BarSeriesNodeTag) {
    BarSeriesNodeTag[BarSeriesNodeTag["Bar"] = 0] = "Bar";
    BarSeriesNodeTag[BarSeriesNodeTag["Label"] = 1] = "Label";
})(BarSeriesNodeTag || (BarSeriesNodeTag = {}));
var BarSeries = /** @class */ (function (_super) {
    __extends(BarSeries, _super);
    function BarSeries() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * The selection of Group elements, each containing a Rect (bar) and a Text (label) nodes.
         */
        _this.groupSelection = selection_1.Selection.select(_this.group).selectAll();
        /**
         * The assumption is that the values will be reset (to `true`)
         * in the {@link yFields} setter.
         */
        _this.enabled = new Map();
        _this._fills = palettes_1.default.fills;
        _this._strokes = palettes_1.default.strokes;
        _this.xData = [];
        _this.yData = [];
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
        _this._strokeWidth = 1;
        _this._shadow = undefined;
        _this._labelEnabled = true;
        _this._labelFont = '12px Verdana, sans-serif';
        _this._labelColor = 'black';
        /**
         * Vertical and horizontal label padding as an array of two numbers.
         */
        _this._labelPadding = { x: 10, y: 10 };
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
            this.strokes = values.map(function (color) { return color_1.Color.fromString(color).darker().toHexString(); });
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
    Object.defineProperty(BarSeries.prototype, "labelFont", {
        get: function () {
            return this._labelFont;
        },
        set: function (value) {
            if (this._labelFont !== value) {
                this._labelFont = value;
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
    Object.defineProperty(BarSeries.prototype, "labelPadding", {
        get: function () {
            return this._labelPadding;
        },
        set: function (value) {
            if (this._labelPadding !== value) {
                this._labelPadding = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    BarSeries.prototype.highlight = function (node) {
        if (!(node instanceof rect_1.Rect)) {
            return;
        }
        this.highlightedNode = node;
        this.scheduleLayout();
    };
    BarSeries.prototype.dehighlight = function () {
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
        var xData = this.xData = data.map(function (datum) { return datum[xField]; });
        var yData = this.yData = data.map(function (datum) {
            var values = [];
            yFields.forEach(function (field) {
                var value = datum[field];
                if (isNaN(value) || !isFinite(value)) {
                    value = 0;
                }
                values.push(enabled.get(field) ? value : 0);
            });
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
            // Find the height of each stack in the positive and negative directions,
            // then find the tallest stacks in both directions.
            yMin = Math.min.apply(Math, [0].concat(yData.map(function (stackValues) {
                var min = 0;
                stackValues.forEach(function (value) {
                    if (value < 0) {
                        min -= value;
                    }
                });
                return min;
            })));
            yMax = Math.max.apply(Math, yData.map(function (stackValues) {
                var max = 0;
                stackValues.forEach(function (value) {
                    if (value > 0) {
                        max += value;
                    }
                });
                return max;
            }));
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
        var n = this.data.length;
        var xAxis = chart.xAxis;
        var yAxis = chart.yAxis;
        var xScale = xAxis.scale;
        var yScale = yAxis.scale;
        var groupScale = this.groupScale;
        var yFields = this.yFields;
        var fills = this.fills;
        var strokes = this.strokes;
        var grouped = this.grouped;
        var strokeWidth = this.strokeWidth;
        var labelFont = this.labelFont;
        var labelColor = this.labelColor;
        var labelPadding = this.labelPadding;
        var data = this.data;
        var xData = this.xData;
        var yData = this.yData;
        var labelEnabled = this.labelEnabled;
        groupScale.range = [0, xScale.bandwidth];
        var barWidth = grouped ? groupScale.bandwidth : xScale.bandwidth;
        var groupSelectionData = [];
        var _loop_1 = function (i) {
            var category = xData[i];
            var values = yData[i];
            var x = xScale.convert(category);
            var yFieldIndex = 0;
            values.reduce(function (prev, curr) {
                var yField = yFields[yFieldIndex];
                var barX = grouped ? x + groupScale.convert(yField) : x;
                var y = yScale.convert((grouped ? curr : prev + curr));
                var bottomY = yScale.convert((grouped ? 0 : prev));
                var labelText = _this.yFieldNames[yFieldIndex];
                groupSelectionData.push({
                    seriesDatum: data[i],
                    yField: yField,
                    x: barX,
                    y: Math.min(y, bottomY),
                    width: barWidth,
                    height: Math.abs(bottomY - y),
                    fill: fills[yFieldIndex % fills.length],
                    stroke: strokes[yFieldIndex % strokes.length],
                    strokeWidth: strokeWidth,
                    label: labelText ? {
                        text: labelText,
                        font: labelFont,
                        fill: labelColor,
                        x: barX + barWidth / 2,
                        y: y + strokeWidth / 2 + labelPadding.x
                    } : undefined
                });
                yFieldIndex++;
                return grouped ? curr : curr + prev;
            }, 0);
        };
        for (var i = 0; i < n; i++) {
            _loop_1(i);
        }
        var updateGroups = this.groupSelection.setData(groupSelectionData);
        updateGroups.exit.remove();
        var enterGroups = updateGroups.enter.append(group_1.Group);
        enterGroups.append(rect_1.Rect).each(function (rect) {
            rect.tag = BarSeriesNodeTag.Bar;
            rect.crisp = true;
        });
        enterGroups.append(text_1.Text).each(function (text) {
            text.tag = BarSeriesNodeTag.Label;
            text.pointerEvents = node_1.PointerEvents.None;
            text.textBaseline = 'hanging';
            text.textAlign = 'center';
        });
        var highlightedNode = this.highlightedNode;
        var groupSelection = updateGroups.merge(enterGroups);
        groupSelection.selectByTag(BarSeriesNodeTag.Bar)
            .each(function (rect, datum) {
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
            rect.strokeWidth = datum.strokeWidth;
            rect.fillShadow = _this.shadow;
            rect.visible = datum.height > 0; // prevent stroke from rendering for zero height columns
        });
        groupSelection.selectByTag(BarSeriesNodeTag.Label)
            .each(function (text, datum) {
            var label = datum.label;
            if (label && labelEnabled) {
                text.font = label.font;
                text.text = label.text;
                text.x = label.x;
                text.y = label.y;
                text.fill = label.fill;
                var textBBox = text.getBBox();
                text.visible = datum.height > (textBBox.height + datum.strokeWidth + labelPadding.x * 2)
                    && datum.width > (textBBox.width + datum.strokeWidth + labelPadding.y * 2);
            }
            else {
                text.visible = false;
            }
        });
        this.groupSelection = groupSelection;
    };
    BarSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var html = '';
        if (this.tooltipEnabled) {
            var xField = this.xField;
            var yField = nodeDatum.yField;
            if (this.tooltipRenderer && xField) {
                html = this.tooltipRenderer({
                    datum: nodeDatum.seriesDatum,
                    xField: xField,
                    yField: yField,
                });
            }
            else {
                var title = nodeDatum.label ? "<div class=\"title\">" + nodeDatum.label.text + "</div>" : '';
                var seriesDatum = nodeDatum.seriesDatum;
                var xValue = seriesDatum[xField];
                var yValue = seriesDatum[yField];
                var xString = typeof (xValue) === 'number' ? number_1.toFixed(xValue) : String(xValue);
                var yString = typeof (yValue) === 'number' ? number_1.toFixed(yValue) : String(yValue);
                html = "" + title + xString + ": " + yString;
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
                        fillStyle: fills_1[index % fills_1.length],
                        strokeStyle: strokes_1[index % strokes_1.length]
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
