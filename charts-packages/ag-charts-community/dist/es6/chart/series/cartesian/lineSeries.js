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
import { Path } from "../../../scene/shape/path";
import ContinuousScale from "../../../scale/continuousScale";
import { Selection } from "../../../scene/selection";
import { Group } from "../../../scene/group";
import palette from "../../palettes";
import { numericExtent } from "../../../util/array";
import { toFixed } from "../../../util/number";
import { PointerEvents } from "../../../scene/node";
import { Marker } from "../../marker/marker";
import { CartesianSeries, CartesianSeriesMarker } from "./cartesianSeries";
import { ChartAxisDirection } from "../../chartAxis";
import { getMarker } from "../../marker/util";
import { reactive } from "../../../util/observable";
import { Chart } from "../../chart";
var LineSeries = /** @class */ (function (_super) {
    __extends(LineSeries, _super);
    function LineSeries() {
        var _this = _super.call(this) || this;
        _this.xDomain = [];
        _this.yDomain = [];
        _this.xData = [];
        _this.yData = [];
        _this.lineNode = new Path();
        // We use groups for this selection even though each group only contains a marker ATM
        // because in the future we might want to add label support as well.
        _this.groupSelection = Selection.select(_this.group).selectAll();
        _this.marker = new CartesianSeriesMarker();
        _this.stroke = palette.fills[0];
        _this.strokeWidth = 2;
        _this.strokeOpacity = 1;
        _this._xKey = '';
        _this.xName = '';
        _this._yKey = '';
        _this.yName = '';
        _this.highlightStyle = { fill: 'yellow' };
        var lineNode = _this.lineNode;
        lineNode.fill = undefined;
        lineNode.lineJoin = 'round';
        lineNode.pointerEvents = PointerEvents.None;
        _this.group.append(lineNode);
        var update = function () { return _this.update(); };
        _this.addEventListener('update', update);
        var marker = _this.marker;
        marker.fill = palette.fills[0];
        marker.stroke = palette.strokes[0];
        marker.addPropertyListener('shape', function () { return _this.onMarkerShapeChange(); });
        marker.addPropertyListener('enabled', function (event) {
            if (!event.value) {
                _this.groupSelection = _this.groupSelection.setData([]);
                _this.groupSelection.exit.remove();
            }
        });
        marker.addEventListener('change', update);
        return _this;
    }
    LineSeries.prototype.onMarkerShapeChange = function () {
        this.groupSelection = this.groupSelection.setData([]);
        this.groupSelection.exit.remove();
        this.update();
        this.fireEvent({ type: 'legendChange' });
    };
    Object.defineProperty(LineSeries.prototype, "xKey", {
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
    Object.defineProperty(LineSeries.prototype, "yKey", {
        get: function () {
            return this._yKey;
        },
        set: function (value) {
            if (this._yKey !== value) {
                this._yKey = value;
                this.yData = [];
                this.scheduleData();
            }
        },
        enumerable: true,
        configurable: true
    });
    LineSeries.prototype.processData = function () {
        var _a = this, xAxis = _a.xAxis, xKey = _a.xKey, yKey = _a.yKey, xData = _a.xData, yData = _a.yData;
        var data = xKey && yKey && this.data ? this.data : [];
        if (!xAxis) {
            return false;
        }
        var isContinuousX = xAxis.scale instanceof ContinuousScale;
        xData.length = 0;
        yData.length = 0;
        for (var i = 0, n = data.length; i < n; i++) {
            var datum = data[i];
            var x = datum[xKey];
            var y = datum[yKey];
            xData.push(x);
            yData.push(y);
        }
        this.xDomain = isContinuousX ? this.fixNumericExtent(numericExtent(xData), 'x') : xData;
        this.yDomain = this.fixNumericExtent(numericExtent(yData), 'y');
        return true;
    };
    LineSeries.prototype.getDomain = function (direction) {
        if (direction === ChartAxisDirection.X) {
            return this.xDomain;
        }
        return this.yDomain;
    };
    LineSeries.prototype.highlightNode = function (node) {
        if (!(node instanceof Marker)) {
            return;
        }
        this.highlightedNode = node;
        this.scheduleLayout();
    };
    LineSeries.prototype.dehighlightNode = function () {
        this.highlightedNode = undefined;
        this.scheduleLayout();
    };
    LineSeries.prototype.update = function () {
        var _a = this, chart = _a.chart, xAxis = _a.xAxis, yAxis = _a.yAxis;
        this.group.visible = this.visible;
        if (!xAxis || !yAxis || !chart || chart.layoutPending || chart.dataPending) {
            return;
        }
        var xScale = xAxis.scale;
        var yScale = yAxis.scale;
        var xOffset = (xScale.bandwidth || 0) / 2;
        var yOffset = (yScale.bandwidth || 0) / 2;
        var isContinuousX = xScale instanceof ContinuousScale;
        var _b = this, data = _b.data, xData = _b.xData, yData = _b.yData, marker = _b.marker, lineNode = _b.lineNode;
        var groupSelectionData = [];
        var linePath = lineNode.path;
        linePath.clear();
        var moveTo = true;
        xData.forEach(function (xDatum, i) {
            var yDatum = yData[i];
            var isGap = yDatum == null || isNaN(yDatum) || !isFinite(yDatum)
                || xDatum == null || (isContinuousX && (isNaN(xDatum) || !isFinite(xDatum)));
            if (isGap) {
                moveTo = true;
            }
            else {
                var x = xScale.convert(xDatum) + xOffset;
                var y = yScale.convert(yDatum) + yOffset;
                if (moveTo) {
                    linePath.moveTo(x, y);
                    moveTo = false;
                }
                else {
                    linePath.lineTo(x, y);
                }
                if (marker) {
                    groupSelectionData.push({
                        seriesDatum: data[i],
                        x: x,
                        y: y
                    });
                }
            }
        });
        lineNode.stroke = this.stroke;
        lineNode.strokeWidth = this.strokeWidth;
        lineNode.strokeOpacity = this.strokeOpacity;
        this.updateGroupSelection(groupSelectionData);
    };
    LineSeries.prototype.updateGroupSelection = function (groupSelectionData) {
        var _a = this, marker = _a.marker, xKey = _a.xKey, yKey = _a.yKey, highlightedNode = _a.highlightedNode, stroke = _a.stroke, strokeWidth = _a.strokeWidth;
        var groupSelection = this.groupSelection;
        var MarkerShape = getMarker(marker.shape);
        var updateGroups = groupSelection.setData(groupSelectionData);
        updateGroups.exit.remove();
        var enterGroups = updateGroups.enter.append(Group);
        enterGroups.append(MarkerShape);
        var _b = this.highlightStyle, highlightFill = _b.fill, highlightStroke = _b.stroke;
        var markerFormatter = marker.formatter;
        var markerSize = marker.size;
        var markerStrokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : strokeWidth;
        groupSelection = updateGroups.merge(enterGroups);
        groupSelection.selectByClass(MarkerShape)
            .each(function (node, datum) {
            var isHighlightedNode = node === highlightedNode;
            var markerFill = isHighlightedNode && highlightFill !== undefined ? highlightFill : marker.fill;
            var markerStroke = isHighlightedNode && highlightStroke !== undefined ? highlightStroke : marker.stroke || stroke;
            var markerFormat = undefined;
            if (markerFormatter) {
                markerFormat = markerFormatter({
                    datum: datum.seriesDatum,
                    xKey: xKey,
                    yKey: yKey,
                    fill: markerFill,
                    stroke: markerStroke,
                    strokeWidth: markerStrokeWidth,
                    size: markerSize,
                    highlighted: isHighlightedNode
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
            node.translationX = datum.x;
            node.translationY = datum.y;
            node.visible = marker.enabled && node.size > 0;
        });
        this.groupSelection = groupSelection;
    };
    LineSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var _a = this, xKey = _a.xKey, yKey = _a.yKey;
        if (!xKey || !yKey) {
            return '';
        }
        var _b = this, xName = _b.xName, yName = _b.yName, color = _b.stroke, tooltipRenderer = _b.tooltipRenderer;
        if (tooltipRenderer) {
            return tooltipRenderer({
                datum: nodeDatum.seriesDatum,
                xKey: xKey,
                xName: xName,
                yKey: yKey,
                yName: yName,
                title: this.title,
                color: color
            });
        }
        else {
            var title = this.title || yName;
            var titleStyle = "style=\"color: white; background-color: " + color + "\"";
            var titleString = title ? "<div class=\"" + Chart.defaultTooltipClass + "-title\" " + titleStyle + ">" + title + "</div>" : '';
            var seriesDatum = nodeDatum.seriesDatum;
            var xValue = seriesDatum[xKey];
            var yValue = seriesDatum[yKey];
            var xString = typeof xValue === 'number' ? toFixed(xValue) : String(xValue);
            var yString = typeof yValue === 'number' ? toFixed(yValue) : String(yValue);
            return titleString + "<div class=\"" + Chart.defaultTooltipClass + "-content\">" + xString + ": " + yString + "</div>";
        }
    };
    LineSeries.prototype.listSeriesItems = function (legendData) {
        var _a = this, id = _a.id, data = _a.data, xKey = _a.xKey, yKey = _a.yKey, yName = _a.yName, visible = _a.visible, title = _a.title, marker = _a.marker, stroke = _a.stroke, strokeOpacity = _a.strokeOpacity;
        if (data && data.length && xKey && yKey) {
            legendData.push({
                id: id,
                itemId: undefined,
                enabled: visible,
                label: {
                    text: title || yName || yKey
                },
                marker: {
                    shape: marker.shape,
                    fill: marker.fill,
                    stroke: marker.stroke || stroke,
                    fillOpacity: 1,
                    strokeOpacity: strokeOpacity
                }
            });
        }
    };
    LineSeries.className = 'LineSeries';
    LineSeries.type = 'line';
    __decorate([
        reactive('layoutChange')
    ], LineSeries.prototype, "title", void 0);
    __decorate([
        reactive('update')
    ], LineSeries.prototype, "stroke", void 0);
    __decorate([
        reactive('update')
    ], LineSeries.prototype, "strokeWidth", void 0);
    __decorate([
        reactive('update')
    ], LineSeries.prototype, "strokeOpacity", void 0);
    __decorate([
        reactive('update')
    ], LineSeries.prototype, "xName", void 0);
    __decorate([
        reactive('update')
    ], LineSeries.prototype, "yName", void 0);
    return LineSeries;
}(CartesianSeries));
export { LineSeries };
