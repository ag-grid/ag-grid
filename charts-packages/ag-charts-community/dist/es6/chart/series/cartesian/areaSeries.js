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
import { Group } from "../../../scene/group";
import { Selection } from "../../../scene/selection";
import { SeriesTooltip } from "../series";
import { PointerEvents } from "../../../scene/node";
import { Path } from "../../../scene/shape/path";
import { CartesianSeries, CartesianSeriesMarker } from "./cartesianSeries";
import { ChartAxisDirection } from "../../chartAxis";
import { getMarker } from "../../marker/util";
import { toTooltipHtml } from "../../chart";
import { findMinMax } from "../../../util/array";
import { toFixed } from "../../../util/number";
import { equal } from "../../../util/equal";
import { reactive } from "../../../util/observable";
import { interpolate } from "../../../util/string";
var AreaSeriesTooltip = /** @class */ (function (_super) {
    __extends(AreaSeriesTooltip, _super);
    function AreaSeriesTooltip() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        reactive('change')
    ], AreaSeriesTooltip.prototype, "renderer", void 0);
    __decorate([
        reactive('change')
    ], AreaSeriesTooltip.prototype, "format", void 0);
    return AreaSeriesTooltip;
}(SeriesTooltip));
export { AreaSeriesTooltip };
var AreaSeries = /** @class */ (function (_super) {
    __extends(AreaSeries, _super);
    function AreaSeries() {
        var _this = _super.call(this) || this;
        _this.tooltip = new AreaSeriesTooltip();
        _this.areaGroup = _this.group.appendChild(new Group);
        _this.strokeGroup = _this.group.appendChild(new Group);
        _this.markerGroup = _this.group.appendChild(new Group);
        _this.areaSelection = Selection.select(_this.areaGroup).selectAll();
        _this.strokeSelection = Selection.select(_this.strokeGroup).selectAll();
        _this.markerSelection = Selection.select(_this.markerGroup).selectAll();
        _this.markerSelectionData = [];
        /**
         * The assumption is that the values will be reset (to `true`)
         * in the {@link yKeys} setter.
         */
        _this.seriesItemEnabled = new Map();
        _this.xData = [];
        _this.yData = [];
        _this.yDomain = [];
        _this.directionKeys = {
            x: ['xKey'],
            y: ['yKeys']
        };
        _this.marker = new CartesianSeriesMarker();
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
        _this._xKey = '';
        _this.xName = '';
        _this._yKeys = [];
        _this.yNames = [];
        _this.strokeWidth = 2;
        _this.highlightStyle = { fill: 'yellow' };
        _this.addEventListener('update', _this.update);
        _this.marker.enabled = false;
        _this.marker.addPropertyListener('shape', _this.onMarkerShapeChange, _this);
        _this.marker.addEventListener('change', _this.update, _this);
        return _this;
    }
    AreaSeries.prototype.onMarkerShapeChange = function () {
        this.markerSelection = this.markerSelection.setData([]);
        this.markerSelection.exit.remove();
        this.update();
        this.fireEvent({ type: 'legendChange' });
    };
    Object.defineProperty(AreaSeries.prototype, "xKey", {
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
    Object.defineProperty(AreaSeries.prototype, "yKeys", {
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
                this.scheduleData();
            }
        },
        enumerable: true,
        configurable: true
    });
    AreaSeries.prototype.setColors = function (fills, strokes) {
        this.fills = fills;
        this.strokes = strokes;
    };
    Object.defineProperty(AreaSeries.prototype, "normalizedTo", {
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
    AreaSeries.prototype.onHighlightChange = function () {
        this.updateMarkerNodes();
    };
    AreaSeries.prototype.processData = function () {
        var _a = this, xKey = _a.xKey, yKeys = _a.yKeys, seriesItemEnabled = _a.seriesItemEnabled;
        var data = xKey && yKeys.length && this.data ? this.data : [];
        // if (!(chart && chart.xAxis && chart.yAxis)) {
        //     return false;
        // }
        // If the data is an array of rows like so:
        //
        // [{
        //   xKy: 'Jan',
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
        var _b = this, yData = _b.yData, normalizedTo = _b.normalizedTo;
        var yMinMax = yData.map(function (values) { return findMinMax(values); }); // used for normalization
        var yLargestMinMax = this.findLargestMinMax(yMinMax);
        var yMin;
        var yMax;
        if (normalizedTo && isFinite(normalizedTo)) {
            yMin = yLargestMinMax.min < 0 ? -normalizedTo : 0;
            yMax = normalizedTo;
            yData.forEach(function (stack, i) { return stack.forEach(function (y, j) {
                if (y < 0) {
                    stack[j] = -y / yMinMax[i].min * normalizedTo;
                }
                else {
                    stack[j] = y / yMinMax[i].max * normalizedTo;
                }
            }); });
        }
        else {
            yMin = yLargestMinMax.min;
            yMax = yLargestMinMax.max;
        }
        if (yMin === 0 && yMax === 0) {
            yMax = 1;
        }
        this.yDomain = this.fixNumericExtent([yMin, yMax], 'y');
        this.fireEvent({ type: 'dataProcessed' });
        return true;
    };
    AreaSeries.prototype.findLargestMinMax = function (totals) {
        var min = 0;
        var max = 0;
        for (var _i = 0, totals_1 = totals; _i < totals_1.length; _i++) {
            var total = totals_1[_i];
            if (total.min < min) {
                min = total.min;
            }
            if (total.max > max) {
                max = total.max;
            }
        }
        return { min: min, max: max };
    };
    AreaSeries.prototype.getDomain = function (direction) {
        if (direction === ChartAxisDirection.X) {
            return this.xData;
        }
        else {
            return this.yDomain;
        }
    };
    AreaSeries.prototype.update = function () {
        var _a = this, visible = _a.visible, chart = _a.chart, xAxis = _a.xAxis, yAxis = _a.yAxis, xData = _a.xData, yData = _a.yData;
        this.group.visible = visible && !!(xData.length && yData.length);
        if (!xAxis || !yAxis || !visible || !chart || chart.layoutPending || chart.dataPending || !xData.length || !yData.length) {
            return;
        }
        var selectionData = this.generateSelectionData();
        if (!selectionData) {
            return;
        }
        var areaSelectionData = selectionData.areaSelectionData, markerSelectionData = selectionData.markerSelectionData;
        this.updateAreaSelection(areaSelectionData);
        this.updateStrokeSelection(areaSelectionData);
        this.updateMarkerSelection(markerSelectionData);
        this.updateMarkerNodes();
        this.markerSelectionData = markerSelectionData;
    };
    AreaSeries.prototype.generateSelectionData = function () {
        var _this = this;
        if (!this.data) {
            return;
        }
        var _a = this, yKeys = _a.yKeys, data = _a.data, xData = _a.xData, yData = _a.yData, marker = _a.marker, fills = _a.fills, strokes = _a.strokes, xScale = _a.xAxis.scale, yScale = _a.yAxis.scale;
        var xOffset = (xScale.bandwidth || 0) / 2;
        var yOffset = (yScale.bandwidth || 0) / 2;
        var areaSelectionData = [];
        var markerSelectionData = [];
        var last = xData.length * 2 - 1;
        xData.forEach(function (xDatum, i) {
            var yDatum = yData[i];
            var seriesDatum = data[i];
            var x = xScale.convert(xDatum) + xOffset;
            var prevMin = 0;
            var prevMax = 0;
            yDatum.forEach(function (curr, j) {
                var prev = curr < 0 ? prevMin : prevMax;
                var y = yScale.convert(prev + curr) + yOffset;
                var yKey = yKeys[j];
                var yValue = seriesDatum[yKey];
                if (marker) {
                    markerSelectionData.push({
                        series: _this,
                        seriesDatum: seriesDatum,
                        yValue: yValue,
                        yKey: yKey,
                        point: { x: x, y: y },
                        fill: fills[j % fills.length],
                        stroke: strokes[j % strokes.length]
                    });
                }
                var areaDatum = areaSelectionData[j] || (areaSelectionData[j] = { yKey: yKey, points: [] });
                var areaPoints = areaDatum.points;
                areaPoints[i] = { x: x, y: y };
                areaPoints[last - i] = { x: x, y: yScale.convert(prev) + yOffset }; // bottom y
                if (curr < 0) {
                    prevMin += curr;
                }
                else {
                    prevMax += curr;
                }
            });
        });
        return { areaSelectionData: areaSelectionData, markerSelectionData: markerSelectionData };
    };
    AreaSeries.prototype.updateAreaSelection = function (areaSelectionData) {
        var _this = this;
        var _a = this, fills = _a.fills, fillOpacity = _a.fillOpacity, strokes = _a.strokes, strokeOpacity = _a.strokeOpacity, strokeWidth = _a.strokeWidth, seriesItemEnabled = _a.seriesItemEnabled, shadow = _a.shadow;
        var updateAreas = this.areaSelection.setData(areaSelectionData);
        updateAreas.exit.remove();
        var enterAreas = updateAreas.enter.append(Path)
            .each(function (path) {
            path.lineJoin = 'round';
            path.stroke = undefined;
            path.pointerEvents = PointerEvents.None;
        });
        var areaSelection = updateAreas.merge(enterAreas);
        areaSelection.each(function (shape, datum, index) {
            var path = shape.path;
            shape.fill = fills[index % fills.length];
            shape.fillOpacity = fillOpacity;
            shape.stroke = strokes[index % strokes.length];
            shape.strokeOpacity = strokeOpacity;
            shape.strokeWidth = strokeWidth;
            shape.lineDash = _this.lineDash;
            shape.lineDashOffset = _this.lineDashOffset;
            shape.fillShadow = shadow;
            shape.visible = !!seriesItemEnabled.get(datum.yKey);
            path.clear();
            var points = datum.points;
            points.forEach(function (_a, i) {
                var x = _a.x, y = _a.y;
                if (i > 0) {
                    path.lineTo(x, y);
                }
                else {
                    path.moveTo(x, y);
                }
            });
            path.closePath();
        });
        this.areaSelection = areaSelection;
    };
    AreaSeries.prototype.updateStrokeSelection = function (areaSelectionData) {
        var _this = this;
        if (!this.data) {
            return;
        }
        var _a = this, strokes = _a.strokes, strokeWidth = _a.strokeWidth, strokeOpacity = _a.strokeOpacity, data = _a.data, seriesItemEnabled = _a.seriesItemEnabled;
        var updateStrokes = this.strokeSelection.setData(areaSelectionData);
        updateStrokes.exit.remove();
        var enterStrokes = updateStrokes.enter.append(Path)
            .each(function (path) {
            path.fill = undefined;
            path.lineJoin = path.lineCap = 'round';
            path.pointerEvents = PointerEvents.None;
        });
        var strokeSelection = updateStrokes.merge(enterStrokes);
        strokeSelection.each(function (shape, datum, index) {
            var path = shape.path;
            shape.stroke = strokes[index % strokes.length];
            shape.strokeWidth = strokeWidth;
            shape.visible = !!seriesItemEnabled.get(datum.yKey);
            shape.strokeOpacity = strokeOpacity;
            shape.lineDash = _this.lineDash;
            shape.lineDashOffset = _this.lineDashOffset;
            path.clear();
            var points = datum.points;
            // The stroke doesn't go all the way around the fill, only on top,
            // that's why we iterate until `data.length` (rather than `points.length`) and stop.
            for (var i = 0; i < data.length; i++) {
                var _a = points[i], x = _a.x, y = _a.y;
                if (i > 0) {
                    path.lineTo(x, y);
                }
                else {
                    path.moveTo(x, y);
                }
            }
        });
        this.strokeSelection = strokeSelection;
    };
    AreaSeries.prototype.updateMarkerSelection = function (markerSelectionData) {
        var marker = this.marker;
        var data = marker.shape ? markerSelectionData : [];
        var MarkerShape = getMarker(marker.shape);
        var updateMarkers = this.markerSelection.setData(data);
        updateMarkers.exit.remove();
        var enterMarkers = updateMarkers.enter.append(MarkerShape);
        this.markerSelection = updateMarkers.merge(enterMarkers);
    };
    AreaSeries.prototype.updateMarkerNodes = function () {
        if (!this.chart) {
            return;
        }
        var marker = this.marker;
        var markerFormatter = marker.formatter;
        var markerStrokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : this.strokeWidth;
        var markerSize = marker.size;
        var _a = this, xKey = _a.xKey, seriesItemEnabled = _a.seriesItemEnabled;
        var highlightedDatum = this.chart.highlightedDatum;
        var _b = this.highlightStyle, highlightFill = _b.fill, highlightStroke = _b.stroke;
        this.markerSelection.each(function (node, datum) {
            var highlighted = datum === highlightedDatum;
            var markerFill = highlighted && highlightFill !== undefined ? highlightFill : marker.fill || datum.fill;
            var markerStroke = highlighted && highlightStroke !== undefined ? highlightStroke : marker.stroke || datum.stroke;
            var markerFormat = undefined;
            if (markerFormatter) {
                markerFormat = markerFormatter({
                    datum: datum.seriesDatum,
                    xKey: xKey,
                    yKey: datum.yKey,
                    fill: markerFill,
                    stroke: markerStroke,
                    strokeWidth: markerStrokeWidth,
                    size: markerSize,
                    highlighted: highlighted
                });
            }
            node.fill = markerFormat && markerFormat.fill || markerFill;
            node.stroke = markerFormat && markerFormat.stroke || markerStroke;
            node.strokeWidth = markerFormat && markerFormat.strokeWidth !== undefined
                ? markerFormat.strokeWidth
                : markerStrokeWidth;
            node.size = markerFormat && markerFormat.size !== undefined
                ? markerFormat.size
                : markerSize;
            node.translationX = datum.point.x;
            node.translationY = datum.point.y;
            node.visible = marker.enabled && node.size > 0 && !!seriesItemEnabled.get(datum.yKey);
        });
    };
    AreaSeries.prototype.getNodeData = function () {
        return this.markerSelectionData;
    };
    AreaSeries.prototype.fireNodeClickEvent = function (event, datum) {
        this.fireEvent({
            type: 'nodeClick',
            event: event,
            series: this,
            datum: datum.seriesDatum,
            xKey: this.xKey,
            yKey: datum.yKey
        });
    };
    AreaSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var xKey = this.xKey;
        var yKey = nodeDatum.yKey;
        if (!xKey || !yKey) {
            return '';
        }
        var _a = this, xName = _a.xName, yKeys = _a.yKeys, yNames = _a.yNames, fills = _a.fills, tooltip = _a.tooltip;
        var _b = tooltip.renderer, tooltipRenderer = _b === void 0 ? this.tooltipRenderer : _b, tooltipFormat = tooltip.format;
        var datum = nodeDatum.seriesDatum;
        var xValue = datum[xKey];
        var yValue = datum[yKey];
        var yKeyIndex = yKeys.indexOf(yKey);
        var yName = yNames[yKeyIndex];
        var color = fills[yKeyIndex % fills.length];
        var xString = typeof xValue === 'number' ? toFixed(xValue) : String(xValue);
        var yString = typeof yValue === 'number' ? toFixed(yValue) : String(yValue);
        var title = yName;
        var content = xString + ': ' + yString;
        var defaults = {
            title: title,
            backgroundColor: color,
            content: content
        };
        if (tooltipFormat || tooltipRenderer) {
            var params = {
                datum: datum,
                xKey: xKey,
                xName: xName,
                xValue: xValue,
                yKey: yKey,
                yValue: yValue,
                yName: yName,
                color: color
            };
            if (tooltipFormat) {
                return toTooltipHtml({
                    content: interpolate(tooltipFormat, params)
                }, defaults);
            }
            if (tooltipRenderer) {
                return toTooltipHtml(tooltipRenderer(params), defaults);
            }
        }
        return toTooltipHtml(defaults);
    };
    AreaSeries.prototype.listSeriesItems = function (legendData) {
        var _a = this, data = _a.data, id = _a.id, xKey = _a.xKey, yKeys = _a.yKeys, yNames = _a.yNames, seriesItemEnabled = _a.seriesItemEnabled, marker = _a.marker, fills = _a.fills, strokes = _a.strokes, fillOpacity = _a.fillOpacity, strokeOpacity = _a.strokeOpacity;
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
                        shape: marker.shape,
                        fill: marker.fill || fills[index % fills.length],
                        stroke: marker.stroke || strokes[index % strokes.length],
                        fillOpacity: fillOpacity,
                        strokeOpacity: strokeOpacity
                    }
                });
            });
        }
    };
    AreaSeries.prototype.toggleSeriesItem = function (itemId, enabled) {
        this.seriesItemEnabled.set(itemId, enabled);
        this.scheduleData();
    };
    AreaSeries.className = 'AreaSeries';
    AreaSeries.type = 'area';
    __decorate([
        reactive('dataChange')
    ], AreaSeries.prototype, "fills", void 0);
    __decorate([
        reactive('dataChange')
    ], AreaSeries.prototype, "strokes", void 0);
    __decorate([
        reactive('update')
    ], AreaSeries.prototype, "fillOpacity", void 0);
    __decorate([
        reactive('update')
    ], AreaSeries.prototype, "strokeOpacity", void 0);
    __decorate([
        reactive('update')
    ], AreaSeries.prototype, "lineDash", void 0);
    __decorate([
        reactive('update')
    ], AreaSeries.prototype, "lineDashOffset", void 0);
    __decorate([
        reactive('update')
    ], AreaSeries.prototype, "xName", void 0);
    __decorate([
        reactive('update')
    ], AreaSeries.prototype, "yNames", void 0);
    __decorate([
        reactive('update')
    ], AreaSeries.prototype, "strokeWidth", void 0);
    __decorate([
        reactive('update')
    ], AreaSeries.prototype, "shadow", void 0);
    return AreaSeries;
}(CartesianSeries));
export { AreaSeries };
