// ag-grid-enterprise v20.2.0
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
var stackedCartesianSeries_1 = require("./stackedCartesianSeries");
var group_1 = require("../../scene/group");
var selection_1 = require("../../scene/selection");
var rect_1 = require("../../scene/shape/rect");
var text_1 = require("../../scene/shape/text");
var bandScale_1 = require("../../scale/bandScale");
var colors_1 = require("../colors");
var color_1 = require("../../util/color");
var BarSeriesNodeTag;
(function (BarSeriesNodeTag) {
    BarSeriesNodeTag[BarSeriesNodeTag["Bar"] = 0] = "Bar";
    BarSeriesNodeTag[BarSeriesNodeTag["Label"] = 1] = "Label";
})(BarSeriesNodeTag || (BarSeriesNodeTag = {}));
var BarSeries = /** @class */ (function (_super) {
    __extends(BarSeries, _super);
    function BarSeries() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._data = [];
        _this._grouped = false;
        /**
         * The stroke style to use for all bars.
         * `null` value here doesn't mean invisible stroke, as it normally would
         * (see `Shape.strokeStyle` comments), it means derive stroke colors from fill
         * colors by darkening them. To make the stroke appear invisible use the same
         * color as the background of the chart (such as 'white').
         */
        _this._strokeStyle = null;
        _this._lineWidth = 2;
        _this._shadow = null;
        _this._labelFont = '12px Tahoma';
        _this._labelColor = 'black';
        /**
         * Vertical and horizontal label padding as an array of two numbers.
         */
        _this._labelPadding = [10, 10];
        _this.domainX = [];
        _this.domainY = [];
        _this.yData = [];
        /**
         * Used to get the position of bars within each group.
         */
        _this.groupScale = new bandScale_1.BandScale();
        /**
         * The selection of Group elements, each containing a Rect (bar) and a Text (label) nodes.
         */
        _this.groupSelection = selection_1.Selection.select(_this.group).selectAll();
        _this.colors = colors_1.default;
        _this.strokeColors = colors_1.default.map(function (color) { return color_1.Color.fromHexString(color).darker().toHexString(); });
        return _this;
    }
    Object.defineProperty(BarSeries.prototype, "chart", {
        get: function () {
            return this._chart;
        },
        set: function (chart) {
            if (this._chart !== chart) {
                this._chart = chart;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BarSeries.prototype, "data", {
        get: function () {
            return this._data;
        },
        set: function (data) {
            this._data = data;
            if (this.processData()) {
                this.update();
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
                if (this.processData()) {
                    this.update();
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BarSeries.prototype, "yFields", {
        get: function () {
            return this._yFields;
        },
        /**
         * With a single value in the `yFields` array we get the regular bar series.
         * With multiple values, we get the stacked bar series.
         * If the {@link grouped} set to `true`, we get the grouped bar series.
         * @param values
         */
        set: function (values) {
            this._yFields = values;
            var groupScale = this.groupScale;
            groupScale.domain = values;
            groupScale.padding = 0.1;
            groupScale.round = true;
            if (this.processData()) {
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * If the type of series datum is declared as `any`, one can change the values of the
     * {@link data}, {@link xField} and {@link yFields} configs on the fly, where the type
     * of data and the fields names are completely different from ones currently in use by
     * the series. This can lead to a situation where one sets the new {@link data},
     * which triggers the series to fetch the fields from the datums, but the
     * datums have no such fields. Conversely, one can set the new {@link xField} or {@link yFields}
     * that are not present in the current {@link data}.
     * In such cases, the {@link data}, {@link xField} and {@link yFields} configs have to be set
     * simultaneously, as an atomic operation.
     * @param data
     * @param xField
     * @param yFields
     */
    BarSeries.prototype.setDataAndFields = function (data, xField, yFields) {
        this._xField = xField;
        this._yFields = yFields;
        this._data = data;
        var groupScale = this.groupScale;
        groupScale.domain = yFields;
        groupScale.padding = 0.1;
        groupScale.round = true;
        if (this.processData()) {
            this.update();
        }
    };
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
                if (this.processData()) {
                    this.update();
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BarSeries.prototype, "strokeStyle", {
        get: function () {
            return this._strokeStyle;
        },
        set: function (value) {
            if (this._strokeStyle !== value) {
                this._strokeStyle = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BarSeries.prototype, "lineWidth", {
        get: function () {
            return this._lineWidth;
        },
        set: function (value) {
            if (this._lineWidth !== value) {
                this._lineWidth = value;
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
    BarSeries.prototype.processData = function () {
        var data = this.data;
        var xField = this.xField;
        var yFields = this.yFields;
        if (!(xField && yFields.length)) {
            return false;
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
        var xData = this.domainX = data.map(function (datum) {
            var value = datum[xField];
            if (typeof value !== 'string') {
                throw new Error("The " + xField + " value is not a string. "
                    + "This error might be solved by using the 'setDataAndFields' method.");
            }
            return value;
        });
        var yData = this.yData = data.map(function (datum) {
            var values = [];
            yFields.forEach(function (field) {
                var value = datum[field];
                if (isNaN(value)) {
                    throw new Error("The " + field + " value is not a number. "
                        + "This error might be solved by using the 'setDataAndFields' method.");
                }
                values.push(value);
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
        this.domainX = xData;
        this.domainY = [yMin, yMax];
        var chart = this.chart;
        if (chart) {
            chart.updateAxes();
        }
        return true;
    };
    BarSeries.prototype.getDomainX = function () {
        return this.domainX;
    };
    BarSeries.prototype.getDomainY = function () {
        return this.domainY;
    };
    BarSeries.prototype.update = function () {
        var _this = this;
        var chart = this.chart;
        if (!chart || chart && chart.layoutPending || !(chart.xAxis && chart.yAxis)) {
            return;
        }
        var n = this.data.length;
        var xAxis = chart.xAxis;
        var yAxis = chart.yAxis;
        var xScale = xAxis.scale;
        var yScale = yAxis.scale;
        var groupScale = this.groupScale;
        var yFields = this.yFields;
        var colors = this.colors;
        var strokeColor = this.strokeStyle;
        var strokeColors = this.strokeColors;
        var grouped = this.grouped;
        var lineWidth = this.lineWidth;
        var labelFont = this.labelFont;
        var labelColor = this.labelColor;
        var labelPadding = this.labelPadding;
        groupScale.range = [0, xScale.bandwidth];
        var barWidth = grouped ? groupScale.bandwidth : xScale.bandwidth;
        var barData = [];
        var _loop_1 = function (i) {
            var category = this_1.domainX[i];
            var values = this_1.yData[i];
            var x = xScale.convert(category);
            var yFieldIndex = 0;
            values.reduce(function (prev, curr) {
                var barX = grouped ? x + groupScale.convert(yFields[yFieldIndex]) : x;
                var y = yScale.convert(grouped ? curr : prev + curr);
                var bottomY = yScale.convert(grouped ? 0 : prev);
                var labelText = _this.yFieldNames[yFieldIndex];
                barData.push({
                    x: barX,
                    y: y,
                    width: barWidth,
                    height: bottomY - y,
                    fillStyle: colors[yFieldIndex % colors.length],
                    strokeStyle: strokeColor ? strokeColor : strokeColors[yFieldIndex % strokeColors.length],
                    lineWidth: lineWidth,
                    label: labelText ? {
                        text: labelText,
                        font: labelFont,
                        fillStyle: labelColor,
                        x: barX + barWidth / 2,
                        y: y + lineWidth / 2 + labelPadding[0]
                    } : undefined
                });
                yFieldIndex++;
                return grouped ? curr : curr + prev;
            }, 0);
        };
        var this_1 = this;
        for (var i = 0; i < n; i++) {
            _loop_1(i);
        }
        var updateGroups = this.groupSelection.setData(barData);
        updateGroups.exit.remove();
        var enterGroups = updateGroups.enter.append(group_1.Group);
        enterGroups.append(rect_1.Rect).each(function (rect) {
            rect.tag = BarSeriesNodeTag.Bar;
            rect.crisp = true;
        });
        enterGroups.append(text_1.Text).each(function (text) {
            text.tag = BarSeriesNodeTag.Label;
            text.textBaseline = 'hanging';
            text.textAlign = 'center';
        });
        var groupSelection = updateGroups.merge(enterGroups);
        groupSelection.selectByTag(BarSeriesNodeTag.Bar)
            .each(function (rect, datum) {
            rect.x = datum.x;
            rect.y = datum.y;
            rect.width = datum.width;
            rect.height = datum.height;
            rect.fillStyle = datum.fillStyle;
            rect.strokeStyle = datum.strokeStyle;
            rect.lineWidth = datum.lineWidth;
            rect.shadow = _this.shadow;
            rect.visible = datum.height > 0; // prevent stroke from rendering for zero height columns
        });
        groupSelection.selectByTag(BarSeriesNodeTag.Label)
            .each(function (text, datum) {
            var label = datum.label;
            if (label) {
                text.font = label.font;
                text.text = label.text;
                text.x = label.x;
                text.y = label.y;
                text.fillStyle = label.fillStyle;
                var textBBox = text.getBBox();
                text.visible = datum.height > (textBBox.height + datum.lineWidth + labelPadding[0] * 2)
                    && datum.width > (textBBox.width + datum.lineWidth + labelPadding[1] * 2);
            }
            else {
                text.visible = false;
            }
        });
        this.groupSelection = groupSelection;
    };
    return BarSeries;
}(stackedCartesianSeries_1.StackedCartesianSeries));
exports.BarSeries = BarSeries;
