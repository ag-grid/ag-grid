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
import { Group } from "../../../scene/group";
import { Selection } from "../../../scene/selection";
import { Rect } from "../../../scene/shape/rect";
import { Text } from "../../../scene/shape/text";
import { BandScale } from "../../../scale/bandScale";
import palette from "../../palettes";
import { Label } from "../../label";
import { PointerEvents } from "../../../scene/node";
import { CartesianSeries } from "./cartesianSeries";
import { ChartAxisDirection, flipChartAxisDirection } from "../../chartAxis";
import { Chart } from "../../chart";
import { findLargestMinMax, findMinMax } from "../../../util/array";
import { toFixed } from "../../../util/number";
import { equal } from "../../../util/equal";
import { reactive } from "../../../util/observable";
var BarSeriesNodeTag;
(function (BarSeriesNodeTag) {
    BarSeriesNodeTag[BarSeriesNodeTag["Bar"] = 0] = "Bar";
    BarSeriesNodeTag[BarSeriesNodeTag["Label"] = 1] = "Label";
})(BarSeriesNodeTag || (BarSeriesNodeTag = {}));
var BarSeriesLabel = /** @class */ (function (_super) {
    __extends(BarSeriesLabel, _super);
    function BarSeriesLabel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        reactive('change')
    ], BarSeriesLabel.prototype, "formatter", void 0);
    return BarSeriesLabel;
}(Label));
var BarSeries = /** @class */ (function (_super) {
    __extends(BarSeries, _super);
    function BarSeries() {
        var _a;
        var _this = _super.call(this) || this;
        // Need to put bar and label nodes into separate groups, because even though label nodes are
        // created after the bar nodes, this only guarantees that labels will always be on top of bars
        // on the first run. If on the next run more bars are added, they might clip the labels
        // rendered during the previous run.
        _this.rectGroup = _this.group.appendChild(new Group);
        _this.textGroup = _this.group.appendChild(new Group);
        _this.rectSelection = Selection.select(_this.rectGroup).selectAll();
        _this.textSelection = Selection.select(_this.textGroup).selectAll();
        _this.xData = [];
        _this.yData = [];
        _this.yDomain = [];
        _this.label = new BarSeriesLabel();
        /**
         * The assumption is that the values will be reset (to `true`)
         * in the {@link yKeys} setter.
         */
        _this.seriesItemEnabled = new Map();
        _this.flipXY = false;
        _this.fills = palette.fills;
        _this.strokes = palette.strokes;
        _this.fillOpacity = 1;
        _this.strokeOpacity = 1;
        /**
         * Used to get the position of bars within each group.
         */
        _this.groupScale = new BandScale();
        _this.directionKeys = (_a = {},
            _a[ChartAxisDirection.X] = ['xKey'],
            _a[ChartAxisDirection.Y] = ['yKeys'],
            _a);
        _this._xKey = '';
        _this._xName = '';
        /**
         * With a single value in the `yKeys` array we get the regular bar series.
         * With multiple values, we get the stacked bar series.
         * If the {@link grouped} set to `true`, we get the grouped bar series.
         * @param values
         */
        _this._yKeys = [];
        _this._yNames = [];
        _this.grouped = false;
        _this._strokeWidth = 1;
        _this.highlightStyle = { fill: 'yellow' };
        _this.label.enabled = false;
        _this.label.addEventListener('change', _this.update, _this);
        return _this;
    }
    BarSeries.prototype.getKeys = function (direction) {
        var _this = this;
        var directionKeys = this.directionKeys;
        var keys = directionKeys && directionKeys[this.flipXY ? flipChartAxisDirection(direction) : direction];
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
    Object.defineProperty(BarSeries.prototype, "xKey", {
        get: function () {
            return this._xKey;
        },
        set: function (value) {
            if (this._xKey !== value) {
                this._xKey = value;
                this.xData = [];
                this.scheduleData();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BarSeries.prototype, "xName", {
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
    Object.defineProperty(BarSeries.prototype, "yKeys", {
        get: function () {
            return this._yKeys;
        },
        set: function (values) {
            if (!equal(this._yKeys, values)) {
                this._yKeys = values;
                this.yData = [];
                var seriesItemEnabled_1 = this.seriesItemEnabled;
                seriesItemEnabled_1.clear();
                values.forEach(function (key) { return seriesItemEnabled_1.set(key, true); });
                var groupScale = this.groupScale;
                groupScale.domain = values;
                groupScale.padding = 0.1;
                groupScale.round = true;
                this.scheduleData();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BarSeries.prototype, "yNames", {
        get: function () {
            return this._yNames;
        },
        set: function (values) {
            this._yNames = values;
            this.scheduleData();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BarSeries.prototype, "normalizedTo", {
        get: function () {
            return this._normalizedTo;
        },
        set: function (value) {
            var absValue = value ? Math.abs(value) : undefined;
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
    BarSeries.prototype.onHighlightChange = function () {
        this.updateRectNodes();
    };
    BarSeries.prototype.processData = function () {
        var _a = this, xKey = _a.xKey, yKeys = _a.yKeys, seriesItemEnabled = _a.seriesItemEnabled;
        var data = xKey && yKeys.length && this.data ? this.data : [];
        // If the data is an array of rows like so:
        //
        // [{
        //   xKey: 'Jan',
        //   yKey1: 5,
        //   yKey2: 7,
        //   yKey3: -9,
        // }, {
        //   xKey: 'Feb',
        //   yKey1: 10,
        //   yKey2: -15,
        //   yKey3: 20
        // }]
        //
        var keysFound = true; // only warn once
        this.xData = data.map(function (datum) {
            if (keysFound && !(xKey in datum)) {
                keysFound = false;
                console.warn("The key '" + xKey + "' was not found in the data: ", datum);
            }
            return datum[xKey];
        });
        this.yData = data.map(function (datum) { return yKeys.map(function (yKey) {
            if (keysFound && !(yKey in datum)) {
                keysFound = false;
                console.warn("The key '" + yKey + "' was not found in the data: ", datum);
            }
            var value = datum[yKey];
            return isFinite(value) && seriesItemEnabled.get(yKey) ? value : 0;
        }); });
        // xData: ['Jan', 'Feb']
        //
        // yData: [
        //   [5, 7, -9],
        //   [10, -15, 20]
        // ]
        var yMinMax = this.yData.map(function (values) { return findMinMax(values); }); // used for normalization of stacked bars
        var _b = this, yData = _b.yData, normalizedTo = _b.normalizedTo;
        var yMin = Infinity;
        var yMax = -Infinity;
        if (this.grouped) {
            // Find the tallest positive/negative bar in each group,
            // then find the tallest positive/negative bar overall.
            // The `yMin` should always be <= 0,
            // otherwise with the `yData` like [300, 200, 100] the last bar
            // will have zero height, because the y-axis range is [100, 300].
            yMin = Math.min.apply(Math, __spreadArrays([0], yData.map(function (values) { return Math.min.apply(Math, values); })));
            yMax = Math.max.apply(Math, yData.map(function (values) { return Math.max.apply(Math, values); }));
        }
        else { // stacked or regular
            var yLargestMinMax = findLargestMinMax(yMinMax);
            if (normalizedTo && isFinite(normalizedTo)) {
                yMin = yLargestMinMax.min < 0 ? -normalizedTo : 0;
                yMax = normalizedTo;
                yData.forEach(function (stackValues, i) { return stackValues.forEach(function (y, j) {
                    if (y < 0) {
                        stackValues[j] = -y / yMinMax[i].min * normalizedTo;
                    }
                    else {
                        stackValues[j] = y / yMinMax[i].max * normalizedTo;
                    }
                }); });
            }
            else {
                yMin = yLargestMinMax.min;
                yMax = yLargestMinMax.max;
            }
        }
        this.yDomain = this.fixNumericExtent([yMin, yMax], 'y');
        this.fireEvent({ type: 'dataProcessed' });
        return true;
    };
    BarSeries.prototype.getDomain = function (direction) {
        if (this.flipXY) {
            direction = flipChartAxisDirection(direction);
        }
        if (direction === ChartAxisDirection.X) {
            return this.xData;
        }
        else {
            return this.yDomain;
        }
    };
    BarSeries.prototype.fireNodeClickEvent = function (datum) {
        this.fireEvent({
            type: 'nodeClick',
            series: this,
            datum: datum.seriesDatum,
            xKey: this.xKey,
            yKey: datum.yKey
        });
    };
    BarSeries.prototype.generateNodeData = function () {
        var _this = this;
        var _a = this, xAxis = _a.xAxis, yAxis = _a.yAxis, flipXY = _a.flipXY;
        var xScale = (flipXY ? yAxis : xAxis).scale;
        var yScale = (flipXY ? xAxis : yAxis).scale;
        var _b = this, groupScale = _b.groupScale, yKeys = _b.yKeys, fills = _b.fills, strokes = _b.strokes, grouped = _b.grouped, strokeWidth = _b.strokeWidth, seriesItemEnabled = _b.seriesItemEnabled, data = _b.data, xData = _b.xData, yData = _b.yData;
        var label = this.label;
        var labelFontStyle = label.fontStyle;
        var labelFontWeight = label.fontWeight;
        var labelFontSize = label.fontSize;
        var labelFontFamily = label.fontFamily;
        var labelColor = label.color;
        var labelFormatter = label.formatter;
        groupScale.range = [0, xScale.bandwidth];
        var barWidth = grouped ? groupScale.bandwidth : xScale.bandwidth;
        var nodeData = [];
        xData.forEach(function (category, i) {
            var yDatum = yData[i];
            var seriesDatum = data[i];
            var x = xScale.convert(category);
            var prevMin = 0;
            var prevMax = 0;
            yDatum.forEach(function (curr, j) {
                var yKey = yKeys[j];
                var barX = grouped ? x + groupScale.convert(yKey) : x;
                var prev = curr < 0 ? prevMin : prevMax;
                var y = yScale.convert(grouped ? curr : prev + curr);
                var bottomY = yScale.convert(grouped ? 0 : prev);
                var yValue = seriesDatum[yKey]; // unprocessed y-value
                var yValueIsNumber = typeof yValue === 'number';
                var labelText;
                if (labelFormatter) {
                    labelText = labelFormatter({ value: yValueIsNumber ? yValue : undefined });
                }
                else {
                    labelText = yValueIsNumber && isFinite(yValue) ? yValue.toFixed(2) : '';
                }
                nodeData.push({
                    series: _this,
                    seriesDatum: seriesDatum,
                    yValue: yValue,
                    yKey: yKey,
                    x: flipXY ? Math.min(y, bottomY) : barX,
                    y: flipXY ? barX : Math.min(y, bottomY),
                    width: flipXY ? Math.abs(bottomY - y) : barWidth,
                    height: flipXY ? barWidth : Math.abs(bottomY - y),
                    fill: fills[j % fills.length],
                    stroke: strokes[j % strokes.length],
                    strokeWidth: strokeWidth,
                    label: seriesItemEnabled.get(yKey) && labelText ? {
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
                if (!grouped) {
                    if (curr < 0) {
                        prevMin += curr;
                    }
                    else {
                        prevMax += curr;
                    }
                }
            });
        });
        return nodeData;
    };
    BarSeries.prototype.update = function () {
        var _a = this, visible = _a.visible, chart = _a.chart, xAxis = _a.xAxis, yAxis = _a.yAxis, xData = _a.xData, yData = _a.yData;
        this.group.visible = visible;
        if (!chart || chart.layoutPending || chart.dataPending ||
            !xAxis || !yAxis || !visible || !xData.length || !yData.length) {
            return;
        }
        var nodeData = this.generateNodeData();
        this.updateRectSelection(nodeData);
        this.updateRectNodes();
        this.updateTextSelection(nodeData);
        this.updateTextNodes();
    };
    BarSeries.prototype.updateRectSelection = function (selectionData) {
        var updateRects = this.rectSelection.setData(selectionData);
        updateRects.exit.remove();
        var enterRects = updateRects.enter.append(Rect).each(function (rect) {
            rect.tag = BarSeriesNodeTag.Bar;
            rect.crisp = true;
        });
        this.rectSelection = updateRects.merge(enterRects);
    };
    BarSeries.prototype.updateRectNodes = function () {
        var _a = this, fillOpacity = _a.fillOpacity, strokeOpacity = _a.strokeOpacity, shadow = _a.shadow, _b = _a.highlightStyle, fill = _b.fill, stroke = _b.stroke;
        var highlightedDatum = this.chart.highlightedDatum;
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
            rect.visible = datum.height > 0; // prevent stroke from rendering for zero height bars
        });
    };
    BarSeries.prototype.updateTextSelection = function (selectionData) {
        var updateTexts = this.textSelection.setData(selectionData);
        updateTexts.exit.remove();
        var enterTexts = updateTexts.enter.append(Text).each(function (text) {
            text.tag = BarSeriesNodeTag.Label;
            text.pointerEvents = PointerEvents.None;
            text.textAlign = 'center';
            text.textBaseline = 'middle';
        });
        this.textSelection = updateTexts.merge(enterTexts);
    };
    BarSeries.prototype.updateTextNodes = function () {
        var labelEnabled = this.label.enabled;
        this.textSelection.each(function (text, datum) {
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
    };
    BarSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var xKey = this.xKey;
        var yKey = nodeDatum.yKey;
        if (!xKey || !yKey) {
            return '';
        }
        var _a = this, xName = _a.xName, yKeys = _a.yKeys, yNames = _a.yNames, fills = _a.fills, tooltipRenderer = _a.tooltipRenderer;
        var datum = nodeDatum.seriesDatum;
        var yKeyIndex = yKeys.indexOf(yKey);
        var yName = yNames[yKeyIndex];
        var color = fills[yKeyIndex % fills.length];
        if (tooltipRenderer) {
            return tooltipRenderer({
                datum: datum,
                xKey: xKey,
                xName: xName,
                yKey: yKey,
                yName: yName,
                color: color
            });
        }
        else {
            var titleStyle = "style=\"color: white; background-color: " + color + "\"";
            var titleString = yName ? "<div class=\"" + Chart.defaultTooltipClass + "-title\" " + titleStyle + ">" + yName + "</div>" : '';
            var xValue = datum[xKey];
            var yValue = datum[yKey];
            var xString = typeof xValue === 'number' ? toFixed(xValue) : String(xValue);
            var yString = typeof yValue === 'number' ? toFixed(yValue) : String(yValue);
            return titleString + "<div class=\"" + Chart.defaultTooltipClass + "-content\">" + xString + ": " + yString + "</div>";
        }
    };
    BarSeries.prototype.listSeriesItems = function (legendData) {
        var _a = this, id = _a.id, data = _a.data, xKey = _a.xKey, yKeys = _a.yKeys, yNames = _a.yNames, seriesItemEnabled = _a.seriesItemEnabled, fills = _a.fills, strokes = _a.strokes, fillOpacity = _a.fillOpacity, strokeOpacity = _a.strokeOpacity;
        if (data && data.length && xKey && yKeys.length) {
            yKeys.forEach(function (yKey, index) {
                legendData.push({
                    id: id,
                    itemId: yKey,
                    enabled: seriesItemEnabled.get(yKey) || false,
                    label: {
                        text: yNames[index] || yKeys[index]
                    },
                    marker: {
                        fill: fills[index % fills.length],
                        stroke: strokes[index % strokes.length],
                        fillOpacity: fillOpacity,
                        strokeOpacity: strokeOpacity
                    }
                });
            });
        }
    };
    BarSeries.prototype.toggleSeriesItem = function (itemId, enabled) {
        var seriesItemEnabled = this.seriesItemEnabled;
        var enabledSeriesItems = [];
        seriesItemEnabled.set(itemId, enabled);
        seriesItemEnabled.forEach(function (enabled, yKey) {
            if (enabled) {
                enabledSeriesItems.push(yKey);
            }
        });
        this.groupScale.domain = enabledSeriesItems;
        this.scheduleData();
    };
    BarSeries.className = 'BarSeries';
    BarSeries.type = 'bar';
    __decorate([
        reactive('layoutChange')
    ], BarSeries.prototype, "flipXY", void 0);
    __decorate([
        reactive('dataChange')
    ], BarSeries.prototype, "fills", void 0);
    __decorate([
        reactive('dataChange')
    ], BarSeries.prototype, "strokes", void 0);
    __decorate([
        reactive('layoutChange')
    ], BarSeries.prototype, "fillOpacity", void 0);
    __decorate([
        reactive('layoutChange')
    ], BarSeries.prototype, "strokeOpacity", void 0);
    __decorate([
        reactive('dataChange')
    ], BarSeries.prototype, "grouped", void 0);
    return BarSeries;
}(CartesianSeries));
export { BarSeries };
