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
import { sumPositiveValues } from "../../../util/array";
import { toFixed } from "../../../util/number";
import { reactive } from "../../../util/observable";
import { CartesianSeries } from "./cartesianSeries";
import { ChartAxisDirection, flipChartAxisDirection } from "../../chartAxis";
var ColumnSeriesNodeTag;
(function (ColumnSeriesNodeTag) {
    ColumnSeriesNodeTag[ColumnSeriesNodeTag["Column"] = 0] = "Column";
    ColumnSeriesNodeTag[ColumnSeriesNodeTag["Label"] = 1] = "Label";
})(ColumnSeriesNodeTag || (ColumnSeriesNodeTag = {}));
var ColumnSeriesLabel = /** @class */ (function (_super) {
    __extends(ColumnSeriesLabel, _super);
    function ColumnSeriesLabel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        reactive(['change'])
    ], ColumnSeriesLabel.prototype, "formatter", void 0);
    return ColumnSeriesLabel;
}(Label));
var ColumnSeries = /** @class */ (function (_super) {
    __extends(ColumnSeries, _super);
    function ColumnSeries() {
        var _a;
        var _this = _super.call(this) || this;
        // Need to put column and label nodes into separate groups, because even though label nodes are
        // created after the column nodes, this only guarantees that labels will always be on top of columns
        // on the first run. If on the next run more columns are added, they might clip the labels
        // rendered during the previous run.
        _this.rectGroup = _this.group.appendChild(new Group);
        _this.textGroup = _this.group.appendChild(new Group);
        _this.rectSelection = Selection.select(_this.rectGroup).selectAll();
        _this.textSelection = Selection.select(_this.textGroup).selectAll();
        _this.xData = [];
        _this.yData = [];
        _this.yDomain = [];
        _this.label = new ColumnSeriesLabel();
        /**
         * The assumption is that the values will be reset (to `true`)
         * in the {@link yKeys} setter.
         */
        _this.yKeyEnabled = new Map();
        _this.fills = palette.fills;
        _this.strokes = palette.strokes;
        _this.fillOpacity = 1;
        _this.strokeOpacity = 1;
        /**
         * Used to get the position of columns within each group.
         */
        _this.groupScale = new BandScale();
        _this.directionKeys = (_a = {},
            _a[ChartAxisDirection.X] = ['xKey'],
            _a[ChartAxisDirection.Y] = ['yKeys'],
            _a);
        _this.flipXY = false;
        _this._xKey = '';
        _this._xName = '';
        /**
         * With a single value in the `yKeys` array we get the regular column series.
         * With multiple values, we get the stacked column series.
         * If the {@link grouped} set to `true`, we get the grouped column series.
         * @param values
         */
        _this._yKeys = [];
        _this._yNames = [];
        _this._grouped = false;
        _this._strokeWidth = 1;
        _this.highlightStyle = {
            fill: 'yellow'
        };
        _this.label.enabled = false;
        _this.label.addEventListener('change', function () { return _this.update(); });
        return _this;
    }
    ColumnSeries.prototype.getKeys = function (direction) {
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
    Object.defineProperty(ColumnSeries.prototype, "xKey", {
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
    Object.defineProperty(ColumnSeries.prototype, "xName", {
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
    Object.defineProperty(ColumnSeries.prototype, "yKeys", {
        get: function () {
            return this._yKeys;
        },
        set: function (values) {
            this._yKeys = values;
            this.yData = [];
            var yKeyEnabled = this.yKeyEnabled;
            yKeyEnabled.clear();
            values.forEach(function (key) { return yKeyEnabled.set(key, true); });
            var groupScale = this.groupScale;
            groupScale.domain = values;
            groupScale.padding = 0.1;
            groupScale.round = true;
            this.scheduleData();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ColumnSeries.prototype, "yNames", {
        get: function () {
            return this._yNames;
        },
        set: function (values) {
            this._yNames = values;
            this.update();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ColumnSeries.prototype, "grouped", {
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
    Object.defineProperty(ColumnSeries.prototype, "normalizedTo", {
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
    Object.defineProperty(ColumnSeries.prototype, "strokeWidth", {
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
    Object.defineProperty(ColumnSeries.prototype, "shadow", {
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
    ColumnSeries.prototype.highlightNode = function (node) {
        if (!(node instanceof Rect)) {
            return;
        }
        this.highlightedNode = node;
        this.scheduleLayout();
    };
    ColumnSeries.prototype.dehighlightNode = function () {
        this.highlightedNode = undefined;
        this.scheduleLayout();
    };
    ColumnSeries.prototype.processData = function () {
        var _a = this, xKey = _a.xKey, yKeys = _a.yKeys, yKeyEnabled = _a.yKeyEnabled;
        var data = xKey && yKeys.length ? this.data : [];
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
            return isFinite(value) && yKeyEnabled.get(yKey) ? value : 0;
        }); });
        // xData: ['Jan', 'Feb']
        //
        // yData: [
        //   [5, 7, -9],
        //   [10, -15, 20]
        // ]
        var ySums = this.yData.map(function (values) { return sumPositiveValues(values); }); // used for normalization of stacked columns
        var _b = this, yData = _b.yData, normalizedTo = _b.normalizedTo;
        var yMin = Infinity;
        var yMax = -Infinity;
        if (this.grouped) {
            // Find the tallest positive/negative column in each group,
            // then find the tallest positive/negative column overall.
            // The `yMin` should always be <= 0,
            // otherwise with the `yData` like [300, 200, 100] the last column
            // will have zero height, because the y-axis range is [100, 300].
            yMin = Math.min.apply(Math, __spreadArrays([0], yData.map(function (values) { return Math.min.apply(Math, values); })));
            yMax = Math.max.apply(Math, yData.map(function (values) { return Math.max.apply(Math, values); }));
        }
        else { // stacked or regular
            if (normalizedTo && isFinite(normalizedTo)) {
                yMin = 0;
                yMax = normalizedTo;
                yData.forEach(function (stackValues, i) { return stackValues.forEach(function (y, j) { return stackValues[j] = y / ySums[i] * normalizedTo; }); });
            }
            else {
                // Find the height of each stack in the positive and negative directions,
                // then find the tallest stacks in both directions.
                yMin = Math.min.apply(Math, __spreadArrays([0], yData.map(function (values) { return values.reduce(function (min, value) { return value < 0 ? min - value : min; }, 0); })));
                yMax = Math.max.apply(Math, yData.map(function (values) { return values.reduce(function (max, value) { return value > 0 ? max + value : max; }, 0); }));
            }
        }
        this.yDomain = this.fixNumericExtent([yMin, yMax], 'y');
        this.fireEvent({ type: 'dataProcessed' });
        return true;
    };
    ColumnSeries.prototype.getDomain = function (direction) {
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
    ColumnSeries.prototype.update = function () {
        var _a = this, visible = _a.visible, chart = _a.chart, xAxis = _a.xAxis, yAxis = _a.yAxis, xData = _a.xData, yData = _a.yData;
        this.group.visible = visible;
        if (!xAxis || !yAxis || !visible || !chart || chart.layoutPending || chart.dataPending || !xData.length || !yData.length) {
            return;
        }
        var selectionData = this.generateSelectionData();
        this.updateRectSelection(selectionData);
        this.updateTextSelection(selectionData);
    };
    ColumnSeries.prototype.generateSelectionData = function () {
        var _a = this, xAxis = _a.xAxis, yAxis = _a.yAxis, flipXY = _a.flipXY;
        var xScale = (flipXY ? yAxis : xAxis).scale;
        var yScale = (flipXY ? xAxis : yAxis).scale;
        var _b = this, groupScale = _b.groupScale, yKeys = _b.yKeys, fills = _b.fills, strokes = _b.strokes, grouped = _b.grouped, strokeWidth = _b.strokeWidth, yKeyEnabled = _b.yKeyEnabled, data = _b.data, xData = _b.xData, yData = _b.yData;
        var label = this.label;
        var labelFontStyle = label.fontStyle;
        var labelFontWeight = label.fontWeight;
        var labelFontSize = label.fontSize;
        var labelFontFamily = label.fontFamily;
        var labelColor = label.color;
        var labelFormatter = label.formatter;
        groupScale.range = [0, xScale.bandwidth];
        var columnWidth = grouped ? groupScale.bandwidth : xScale.bandwidth;
        var selectionData = [];
        xData.forEach(function (category, i) {
            var values = yData[i];
            var seriesDatum = data[i];
            var x = xScale.convert(category);
            var prev = 0;
            values.forEach(function (curr, j) {
                var yKey = yKeys[j];
                var columnX = grouped ? x + groupScale.convert(yKey) : x;
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
                selectionData.push({
                    seriesDatum: seriesDatum,
                    yValue: yValue,
                    yKey: yKey,
                    x: flipXY ? Math.min(y, bottomY) : columnX,
                    y: flipXY ? columnX : Math.min(y, bottomY),
                    width: flipXY ? Math.abs(bottomY - y) : columnWidth,
                    height: flipXY ? columnWidth : Math.abs(bottomY - y),
                    fill: fills[j % fills.length],
                    stroke: strokes[j % strokes.length],
                    strokeWidth: strokeWidth,
                    label: yKeyEnabled.get(yKey) && labelText ? {
                        text: labelText,
                        fontStyle: labelFontStyle,
                        fontWeight: labelFontWeight,
                        fontSize: labelFontSize,
                        fontFamily: labelFontFamily,
                        fill: labelColor,
                        x: flipXY ? y + (yValue >= 0 ? -1 : 1) * Math.abs(bottomY - y) / 2 : columnX + columnWidth / 2,
                        y: flipXY ? columnX + columnWidth / 2 : y + (yValue >= 0 ? 1 : -1) * Math.abs(bottomY - y) / 2
                    } : undefined
                });
                if (grouped) {
                    prev = curr;
                }
                else {
                    prev += curr;
                }
            });
        });
        return selectionData;
    };
    ColumnSeries.prototype.updateRectSelection = function (selectionData) {
        var _a = this, fillOpacity = _a.fillOpacity, strokeOpacity = _a.strokeOpacity, shadow = _a.shadow, highlightedNode = _a.highlightedNode, _b = _a.highlightStyle, fill = _b.fill, stroke = _b.stroke;
        var updateRects = this.rectSelection.setData(selectionData);
        updateRects.exit.remove();
        var enterRects = updateRects.enter.append(Rect).each(function (rect) {
            rect.tag = ColumnSeriesNodeTag.Column;
            rect.crisp = true;
        });
        var rectSelection = updateRects.merge(enterRects);
        rectSelection.each(function (rect, datum) {
            rect.x = datum.x;
            rect.y = datum.y;
            rect.width = datum.width;
            rect.height = datum.height;
            rect.fill = rect === highlightedNode && fill !== undefined ? fill : datum.fill;
            rect.stroke = rect === highlightedNode && stroke !== undefined ? stroke : datum.stroke;
            rect.fillOpacity = fillOpacity;
            rect.strokeOpacity = strokeOpacity;
            rect.strokeWidth = datum.strokeWidth;
            rect.fillShadow = shadow;
            rect.visible = datum.height > 0; // prevent stroke from rendering for zero height columns
        });
        this.rectSelection = rectSelection;
    };
    ColumnSeries.prototype.updateTextSelection = function (selectionData) {
        var labelEnabled = this.label.enabled;
        var updateTexts = this.textSelection.setData(selectionData);
        updateTexts.exit.remove();
        var enterTexts = updateTexts.enter.append(Text).each(function (text) {
            text.tag = ColumnSeriesNodeTag.Label;
            text.pointerEvents = PointerEvents.None;
            text.textAlign = 'center';
            text.textBaseline = 'middle';
        });
        var textSelection = updateTexts.merge(enterTexts);
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
        this.textSelection = textSelection;
    };
    ColumnSeries.prototype.getTooltipHtml = function (nodeDatum) {
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
        var title = yName;
        if (tooltipRenderer) {
            return tooltipRenderer({
                datum: datum,
                xKey: xKey,
                xName: xName,
                yKey: yKey,
                yName: yName,
                title: title,
                color: color,
            });
        }
        else {
            var titleStyle = "style=\"color: white; background-color: " + color + "\"";
            var titleString = title ? "<div class=\"title\" " + titleStyle + ">" + title + "</div>" : '';
            var xValue = datum[xKey];
            var yValue = datum[yKey];
            var xString = typeof xValue === 'number' ? toFixed(xValue) : String(xValue);
            var yString = typeof yValue === 'number' ? toFixed(yValue) : String(yValue);
            return titleString + "<div class=\"content\">" + xString + ": " + yString + "</div>";
        }
    };
    ColumnSeries.prototype.listSeriesItems = function (data) {
        var _this = this;
        if (this.data.length && this.xKey && this.yKeys.length) {
            var _a = this, fills_1 = _a.fills, strokes_1 = _a.strokes, id_1 = _a.id;
            this.yKeys.forEach(function (yKey, index) {
                data.push({
                    id: id_1,
                    itemId: yKey,
                    enabled: _this.yKeyEnabled.get(yKey) || false,
                    label: {
                        text: _this.yNames[index] || _this.yKeys[index]
                    },
                    marker: {
                        fill: fills_1[index % fills_1.length],
                        stroke: strokes_1[index % strokes_1.length],
                        fillOpacity: _this.fillOpacity,
                        strokeOpacity: _this.strokeOpacity
                    }
                });
            });
        }
    };
    ColumnSeries.prototype.toggleSeriesItem = function (itemId, enabled) {
        this.yKeyEnabled.set(itemId, enabled);
        var enabledYKeys = [];
        this.yKeyEnabled.forEach(function (enabled, yKey) {
            if (enabled) {
                enabledYKeys.push(yKey);
            }
        });
        this.groupScale.domain = enabledYKeys;
        this.scheduleData();
    };
    ColumnSeries.className = 'ColumnSeries';
    __decorate([
        reactive(['dataChange'])
    ], ColumnSeries.prototype, "fills", void 0);
    __decorate([
        reactive(['dataChange'])
    ], ColumnSeries.prototype, "strokes", void 0);
    __decorate([
        reactive(['layoutChange'])
    ], ColumnSeries.prototype, "fillOpacity", void 0);
    __decorate([
        reactive(['layoutChange'])
    ], ColumnSeries.prototype, "strokeOpacity", void 0);
    __decorate([
        reactive(['layoutChange'])
    ], ColumnSeries.prototype, "flipXY", void 0);
    return ColumnSeries;
}(CartesianSeries));
export { ColumnSeries };
