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
Object.defineProperty(exports, "__esModule", { value: true });
var group_1 = require("../../../scene/group");
var selection_1 = require("../../../scene/selection");
var rect_1 = require("../../../scene/shape/rect");
var text_1 = require("../../../scene/shape/text");
var bandScale_1 = require("../../../scale/bandScale");
var series_1 = require("../series");
var label_1 = require("../../label");
var node_1 = require("../../../scene/node");
var cartesianSeries_1 = require("./cartesianSeries");
var chartAxis_1 = require("../../chartAxis");
var chart_1 = require("../../chart");
var array_1 = require("../../../util/array");
var number_1 = require("../../../util/number");
var equal_1 = require("../../../util/equal");
var observable_1 = require("../../../util/observable");
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
        observable_1.reactive('change')
    ], BarSeriesLabel.prototype, "formatter", void 0);
    return BarSeriesLabel;
}(label_1.Label));
var BarSeriesTooltip = /** @class */ (function (_super) {
    __extends(BarSeriesTooltip, _super);
    function BarSeriesTooltip() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        observable_1.reactive('change')
    ], BarSeriesTooltip.prototype, "renderer", void 0);
    return BarSeriesTooltip;
}(series_1.SeriesTooltip));
exports.BarSeriesTooltip = BarSeriesTooltip;
var BarSeries = /** @class */ (function (_super) {
    __extends(BarSeries, _super);
    function BarSeries() {
        var _a;
        var _this = _super.call(this) || this;
        // Need to put bar and label nodes into separate groups, because even though label nodes are
        // created after the bar nodes, this only guarantees that labels will always be on top of bars
        // on the first run. If on the next run more bars are added, they might clip the labels
        // rendered during the previous run.
        _this.rectGroup = _this.group.appendChild(new group_1.Group);
        _this.textGroup = _this.group.appendChild(new group_1.Group);
        _this.rectSelection = selection_1.Selection.select(_this.rectGroup).selectAll();
        _this.textSelection = selection_1.Selection.select(_this.textGroup).selectAll();
        _this.xData = [];
        _this.yData = [];
        _this.yDomain = [];
        _this.label = new BarSeriesLabel();
        /**
         * The assumption is that the values will be reset (to `true`)
         * in the {@link yKeys} setter.
         */
        _this.seriesItemEnabled = new Map();
        _this.tooltip = new BarSeriesTooltip();
        _this.flipXY = false;
        _this.fills = [
            '#c16068',
            '#a2bf8a',
            '#ebcc87',
            '#80a0c3',
            '#b58dae',
            '#85c0d1'
        ];
        _this.strokes = [
            '#874349',
            '#718661',
            '#a48f5f',
            '#5a7088',
            '#7f637a',
            '#5d8692'
        ];
        _this.fillOpacity = 1;
        _this.strokeOpacity = 1;
        _this.lineDash = undefined;
        _this.lineDashOffset = 0;
        /**
         * Used to get the position of bars within each group.
         */
        _this.groupScale = new bandScale_1.BandScale();
        _this.directionKeys = (_a = {},
            _a[chartAxis_1.ChartAxisDirection.X] = ['xKey'],
            _a[chartAxis_1.ChartAxisDirection.Y] = ['yKeys'],
            _a);
        _this._xKey = '';
        _this._xName = '';
        _this.cumYKeyCount = [];
        _this.flatYKeys = undefined; // only set when a user used a flat array for yKeys
        _this.hideInLegend = [];
        /**
         * yKeys: [['coffee']] - regular bars, each category has a single bar that shows a value for coffee
         * yKeys: [['coffee'], ['tea'], ['milk']] - each category has three bars that show values for coffee, tea and milk
         * yKeys: [['coffee', 'tea', 'milk']] - each category has a single bar with three stacks that show values for coffee, tea and milk
         * yKeys: [['coffee', 'tea', 'milk'], ['paper', 'ink']] - each category has 2 stacked bars,
         *     first showing values for coffee, tea and milk and second values for paper and ink
         */
        _this._yKeys = [];
        _this._grouped = false;
        /**
         * A map of `yKeys` to their names (used in legends and tooltips).
         * For example, if a key is `product_name` it's name can be a more presentable `Product Name`.
         */
        _this._yNames = {};
        _this._strokeWidth = 1;
        _this.highlightStyle = { fill: 'yellow' };
        _this.addEventListener('update', _this.update);
        _this.label.enabled = false;
        _this.label.addEventListener('change', _this.update, _this);
        return _this;
    }
    BarSeries.prototype.getKeys = function (direction) {
        var _this = this;
        var directionKeys = this.directionKeys;
        var keys = directionKeys && directionKeys[this.flipXY ? chartAxis_1.flipChartAxisDirection(direction) : direction];
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
        set: function (yKeys) {
            var _this = this;
            if (!equal_1.equal(this._yKeys, yKeys)) {
                // Convert from flat y-keys to grouped y-keys.
                if (yKeys.length && !Array.isArray(yKeys[0])) {
                    var keys = this.flatYKeys = yKeys;
                    if (this.grouped) {
                        yKeys = keys.map(function (k) { return [k]; });
                    }
                    else {
                        yKeys = [keys];
                    }
                }
                else {
                    this.flatYKeys = undefined;
                }
                this._yKeys = yKeys;
                var prevYKeyCount_1 = 0;
                this.cumYKeyCount = [];
                var visibleStacks_1 = [];
                yKeys.forEach(function (stack, index) {
                    if (stack.length > 0) {
                        visibleStacks_1.push(String(index));
                    }
                    _this.cumYKeyCount.push(prevYKeyCount_1);
                    prevYKeyCount_1 += stack.length;
                });
                this.yData = [];
                var seriesItemEnabled_1 = this.seriesItemEnabled;
                seriesItemEnabled_1.clear();
                yKeys.forEach(function (stack) {
                    stack.forEach(function (yKey) { return seriesItemEnabled_1.set(yKey, true); });
                });
                var groupScale = this.groupScale;
                groupScale.domain = visibleStacks_1;
                groupScale.padding = 0.1;
                groupScale.round = true;
                this.scheduleData();
            }
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
                if (this.flatYKeys) {
                    this.yKeys = this.flatYKeys;
                }
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
            if (Array.isArray(values) && this.flatYKeys) {
                var map_1 = {};
                this.flatYKeys.forEach(function (k, i) {
                    map_1[k] = values[i];
                });
                values = map_1;
            }
            this._yNames = values;
            this.scheduleData();
        },
        enumerable: true,
        configurable: true
    });
    BarSeries.prototype.setColors = function (fills, strokes) {
        this.fills = fills;
        this.strokes = strokes;
    };
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
        var keysFound = true; // only warn once
        this.xData = data.map(function (datum) {
            if (keysFound && !(xKey in datum)) {
                keysFound = false;
                console.warn("The key '" + xKey + "' was not found in the data: ", datum);
            }
            return datum[xKey];
        });
        this.yData = data.map(function (datum) { return yKeys.map(function (stack) {
            return stack.map(function (yKey) {
                if (keysFound && !(yKey in datum)) {
                    keysFound = false;
                    console.warn("The key '" + yKey + "' was not found in the data: ", datum);
                }
                var value = datum[yKey];
                return isFinite(value) && seriesItemEnabled.get(yKey) ? value : 0;
            });
        }); });
        // Used for normalization of stacked bars. Contains min/max values for each stack in each group,
        // where min is zero and max is a positive total of all values in the stack
        // or min is a negative total of all values in the stack and max is zero.
        var yMinMax = this.yData.map(function (group) { return group.map(function (stack) { return array_1.findMinMax(stack); }); });
        var _b = this, yData = _b.yData, normalizedTo = _b.normalizedTo;
        var yLargestMinMax = this.findLargestMinMax(yMinMax);
        var yMin;
        var yMax;
        if (normalizedTo && isFinite(normalizedTo)) {
            yMin = yLargestMinMax.min < 0 ? -normalizedTo : 0;
            yMax = normalizedTo;
            yData.forEach(function (group, i) {
                group.forEach(function (stack, j) {
                    stack.forEach(function (y, k) {
                        if (y < 0) {
                            stack[k] = -y / yMinMax[i][j].min * normalizedTo;
                        }
                        else {
                            stack[k] = y / yMinMax[i][j].max * normalizedTo;
                        }
                    });
                });
            });
        }
        else {
            yMin = yLargestMinMax.min;
            yMax = yLargestMinMax.max;
        }
        this.yDomain = this.fixNumericExtent([yMin, yMax], 'y');
        this.fireEvent({ type: 'dataProcessed' });
        return true;
    };
    BarSeries.prototype.findLargestMinMax = function (groups) {
        var tallestStackMin = 0;
        var tallestStackMax = 0;
        for (var _i = 0, groups_1 = groups; _i < groups_1.length; _i++) {
            var group = groups_1[_i];
            for (var _a = 0, group_2 = group; _a < group_2.length; _a++) {
                var stack = group_2[_a];
                if (stack.min < tallestStackMin) {
                    tallestStackMin = stack.min;
                }
                if (stack.max > tallestStackMax) {
                    tallestStackMax = stack.max;
                }
            }
        }
        return { min: tallestStackMin, max: tallestStackMax };
    };
    BarSeries.prototype.getDomain = function (direction) {
        if (this.flipXY) {
            direction = chartAxis_1.flipChartAxisDirection(direction);
        }
        if (direction === chartAxis_1.ChartAxisDirection.X) {
            return this.xData;
        }
        else {
            return this.yDomain;
        }
    };
    BarSeries.prototype.fireNodeClickEvent = function (event, datum) {
        this.fireEvent({
            type: 'nodeClick',
            event: event,
            series: this,
            datum: datum.seriesDatum,
            xKey: this.xKey,
            yKey: datum.yKey
        });
    };
    BarSeries.prototype.generateNodeData = function () {
        var _this = this;
        if (!this.data) {
            return [];
        }
        var flipXY = this.flipXY;
        var xAxis = flipXY ? this.yAxis : this.xAxis;
        var yAxis = flipXY ? this.xAxis : this.yAxis;
        var xScale = xAxis.scale;
        var yScale = yAxis.scale;
        var _a = this, groupScale = _a.groupScale, yKeys = _a.yKeys, cumYKeyCount = _a.cumYKeyCount, fills = _a.fills, strokes = _a.strokes, strokeWidth = _a.strokeWidth, seriesItemEnabled = _a.seriesItemEnabled, data = _a.data, xData = _a.xData, yData = _a.yData;
        var label = this.label;
        var labelFontStyle = label.fontStyle;
        var labelFontWeight = label.fontWeight;
        var labelFontSize = label.fontSize;
        var labelFontFamily = label.fontFamily;
        var labelColor = label.color;
        var labelFormatter = label.formatter;
        groupScale.range = [0, xScale.bandwidth];
        var grouped = true;
        var barWidth = grouped ? groupScale.bandwidth : xScale.bandwidth;
        var nodeData = [];
        xData.forEach(function (group, groupIndex) {
            var seriesDatum = data[groupIndex];
            var x = xScale.convert(group);
            var groupYs = yData[groupIndex]; // y-data for groups of stacks
            for (var stackIndex = 0; stackIndex < groupYs.length; stackIndex++) {
                var stackYs = groupYs[stackIndex]; // y-data for a stack withing a group
                var prevMinY = 0;
                var prevMaxY = 0;
                for (var levelIndex = 0; levelIndex < stackYs.length; levelIndex++) {
                    var currY = stackYs[levelIndex];
                    var yKey = yKeys[stackIndex][levelIndex];
                    var barX = grouped ? x + groupScale.convert(String(stackIndex)) : x;
                    // Bars outside of visible range are not rendered, so we generate node data
                    // only for the visible subset of user data.
                    if (!xAxis.inRange(barX, barWidth)) {
                        continue;
                    }
                    var prevY = currY < 0 ? prevMinY : prevMaxY;
                    var y = yScale.convert(prevY + currY);
                    var bottomY = yScale.convert(prevY);
                    var yValue = seriesDatum[yKey]; // unprocessed y-value
                    var yValueIsNumber = typeof yValue === 'number';
                    var labelText = void 0;
                    if (labelFormatter) {
                        labelText = labelFormatter({ value: yValueIsNumber ? yValue : undefined });
                    }
                    else {
                        labelText = yValueIsNumber && isFinite(yValue) ? yValue.toFixed(2) : '';
                    }
                    var colorIndex = cumYKeyCount[stackIndex] + levelIndex;
                    nodeData.push({
                        series: _this,
                        seriesDatum: seriesDatum,
                        yValue: yValue,
                        yKey: yKey,
                        x: flipXY ? Math.min(y, bottomY) : barX,
                        y: flipXY ? barX : Math.min(y, bottomY),
                        width: flipXY ? Math.abs(bottomY - y) : barWidth,
                        height: flipXY ? barWidth : Math.abs(bottomY - y),
                        fill: fills[colorIndex % fills.length],
                        stroke: strokes[colorIndex % strokes.length],
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
                    if (currY < 0) {
                        prevMinY += currY;
                    }
                    else {
                        prevMaxY += currY;
                    }
                }
            }
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
        var enterRects = updateRects.enter.append(rect_1.Rect).each(function (rect) {
            rect.tag = BarSeriesNodeTag.Bar;
            rect.crisp = true;
        });
        this.rectSelection = updateRects.merge(enterRects);
    };
    BarSeries.prototype.updateRectNodes = function () {
        var _this = this;
        if (!this.chart) {
            return;
        }
        var _a = this, fillOpacity = _a.fillOpacity, strokeOpacity = _a.strokeOpacity, _b = _a.highlightStyle, fill = _b.fill, stroke = _b.stroke, shadow = _a.shadow, formatter = _a.formatter, xKey = _a.xKey, flipXY = _a.flipXY;
        var highlightedDatum = this.chart.highlightedDatum;
        this.rectSelection.each(function (rect, datum) {
            var highlighted = datum === highlightedDatum;
            var rectFill = highlighted && fill !== undefined ? fill : datum.fill;
            var rectStroke = highlighted && stroke !== undefined ? stroke : datum.stroke;
            var format = undefined;
            if (formatter) {
                format = formatter({
                    datum: datum.seriesDatum,
                    fill: rectFill,
                    stroke: rectStroke,
                    strokeWidth: datum.strokeWidth,
                    highlighted: highlighted,
                    xKey: xKey,
                    yKey: datum.yKey
                });
            }
            rect.x = datum.x;
            rect.y = datum.y;
            rect.width = datum.width;
            rect.height = datum.height;
            rect.fill = format && format.fill || rectFill;
            rect.stroke = format && format.stroke || rectStroke;
            rect.strokeWidth = format && format.strokeWidth !== undefined ? format.strokeWidth : datum.strokeWidth;
            rect.fillOpacity = fillOpacity;
            rect.strokeOpacity = strokeOpacity;
            rect.lineDash = _this.lineDash;
            rect.lineDashOffset = _this.lineDashOffset;
            rect.fillShadow = shadow;
            // Prevent stroke from rendering for zero height columns and zero width bars.
            rect.visible = flipXY ? datum.width > 0 : datum.height > 0;
        });
    };
    BarSeries.prototype.updateTextSelection = function (selectionData) {
        var updateTexts = this.textSelection.setData(selectionData);
        updateTexts.exit.remove();
        var enterTexts = updateTexts.enter.append(text_1.Text).each(function (text) {
            text.tag = BarSeriesNodeTag.Label;
            text.pointerEvents = node_1.PointerEvents.None;
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
        var _a = this, xKey = _a.xKey, yKeys = _a.yKeys;
        var yKey = nodeDatum.yKey;
        if (!xKey || !yKey) {
            return '';
        }
        var yKeyIndex = 0;
        for (var _i = 0, yKeys_1 = yKeys; _i < yKeys_1.length; _i++) {
            var stack = yKeys_1[_i];
            var i = stack.indexOf(yKey);
            if (i >= 0) {
                yKeyIndex += i;
                break;
            }
            yKeyIndex += stack.length;
        }
        var _b = this, xName = _b.xName, yNames = _b.yNames, fills = _b.fills, tooltip = _b.tooltip;
        var _c = tooltip.renderer, tooltipRenderer = _c === void 0 ? this.tooltipRenderer : _c; // TODO: remove deprecated tooltipRenderer
        var datum = nodeDatum.seriesDatum;
        var yName = yNames[yKey];
        var color = fills[yKeyIndex % fills.length];
        var xValue = datum[xKey];
        var yValue = datum[yKey];
        var xString = typeof xValue === 'number' ? number_1.toFixed(xValue) : String(xValue);
        var yString = typeof yValue === 'number' ? number_1.toFixed(yValue) : String(yValue);
        var title = yName;
        var content = xString + ': ' + yString;
        var defaults = {
            title: title,
            backgroundColor: color,
            content: content
        };
        if (tooltipRenderer) {
            return chart_1.toTooltipHtml(tooltipRenderer({
                datum: datum,
                xKey: xKey,
                xValue: xValue,
                xName: xName,
                yKey: yKey,
                yValue: yValue,
                yName: yName,
                color: color
            }), defaults);
        }
        return chart_1.toTooltipHtml(defaults);
    };
    BarSeries.prototype.listSeriesItems = function (legendData) {
        var _a = this, id = _a.id, data = _a.data, xKey = _a.xKey, yKeys = _a.yKeys, yNames = _a.yNames, cumYKeyCount = _a.cumYKeyCount, seriesItemEnabled = _a.seriesItemEnabled, hideInLegend = _a.hideInLegend, fills = _a.fills, strokes = _a.strokes, fillOpacity = _a.fillOpacity, strokeOpacity = _a.strokeOpacity;
        if (data && data.length && xKey && yKeys.length) {
            this.yKeys.forEach(function (stack, stackIndex) {
                stack.forEach(function (yKey, levelIndex) {
                    if (hideInLegend.indexOf(yKey) < 0) {
                        var colorIndex = cumYKeyCount[stackIndex] + levelIndex;
                        legendData.push({
                            id: id,
                            itemId: yKey,
                            enabled: seriesItemEnabled.get(yKey) || false,
                            label: {
                                text: yNames[yKey] || yKey
                            },
                            marker: {
                                fill: fills[colorIndex % fills.length],
                                stroke: strokes[colorIndex % strokes.length],
                                fillOpacity: fillOpacity,
                                strokeOpacity: strokeOpacity
                            }
                        });
                    }
                });
            });
        }
    };
    BarSeries.prototype.toggleSeriesItem = function (itemId, enabled) {
        var seriesItemEnabled = this.seriesItemEnabled;
        seriesItemEnabled.set(itemId, enabled);
        var yKeys = this.yKeys.map(function (stack) { return stack.slice(); }); // deep clone
        seriesItemEnabled.forEach(function (enabled, yKey) {
            if (!enabled) {
                yKeys.forEach(function (stack) {
                    var index = stack.indexOf(yKey);
                    if (index >= 0) {
                        stack.splice(index, 1);
                    }
                });
            }
        });
        var visibleStacks = [];
        yKeys.forEach(function (stack, index) {
            if (stack.length > 0) {
                visibleStacks.push(String(index));
            }
        });
        this.groupScale.domain = visibleStacks;
        this.scheduleData();
    };
    BarSeries.className = 'BarSeries';
    BarSeries.type = 'bar';
    __decorate([
        observable_1.reactive('layoutChange')
    ], BarSeries.prototype, "flipXY", void 0);
    __decorate([
        observable_1.reactive('dataChange')
    ], BarSeries.prototype, "fills", void 0);
    __decorate([
        observable_1.reactive('dataChange')
    ], BarSeries.prototype, "strokes", void 0);
    __decorate([
        observable_1.reactive('layoutChange')
    ], BarSeries.prototype, "fillOpacity", void 0);
    __decorate([
        observable_1.reactive('layoutChange')
    ], BarSeries.prototype, "strokeOpacity", void 0);
    __decorate([
        observable_1.reactive('update')
    ], BarSeries.prototype, "lineDash", void 0);
    __decorate([
        observable_1.reactive('update')
    ], BarSeries.prototype, "lineDashOffset", void 0);
    __decorate([
        observable_1.reactive('update')
    ], BarSeries.prototype, "formatter", void 0);
    __decorate([
        observable_1.reactive('layoutChange')
    ], BarSeries.prototype, "hideInLegend", void 0);
    return BarSeries;
}(cartesianSeries_1.CartesianSeries));
exports.BarSeries = BarSeries;
//# sourceMappingURL=barSeries.js.map