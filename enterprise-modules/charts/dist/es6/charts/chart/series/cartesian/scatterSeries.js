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
import { Selection } from "../../../scene/selection";
import { Group } from "../../../scene/group";
import { numericExtent } from "../../../util/array";
import { toFixed } from "../../../util/number";
import linearScale from "../../../scale/linearScale";
import { Marker } from "../../marker/marker";
import { reactive } from "../../../util/observable";
import { CartesianSeries, CartesianSeriesMarker } from "./cartesianSeries";
import { ChartAxisDirection } from "../../chartAxis";
import palette from "../../palettes";
var ScatterSeries = /** @class */ (function (_super) {
    __extends(ScatterSeries, _super);
    function ScatterSeries() {
        var _this = _super.call(this) || this;
        _this.xDomain = [];
        _this.yDomain = [];
        _this.xData = [];
        _this.yData = [];
        _this.sizeData = [];
        _this.sizeScale = linearScale();
        _this.groupSelection = Selection.select(_this.group).selectAll();
        _this.marker = new CartesianSeriesMarker();
        _this._fill = palette.fills[0];
        _this._stroke = palette.strokes[0];
        _this._strokeWidth = 2;
        _this._fillOpacity = 1;
        _this._strokeOpacity = 1;
        _this.highlightStyle = {
            fill: 'yellow'
        };
        _this.xKey = '';
        _this.yKey = '';
        _this.xName = 'X';
        _this.yName = 'Y';
        _this.sizeName = 'Size';
        _this.labelName = 'Label';
        var marker = _this.marker;
        marker.addPropertyListener('type', function () { return _this.onMarkerTypeChange(); });
        marker.addEventListener('change', function () { return _this.update(); });
        _this.addPropertyListener('xKey', function () { return _this.xData = []; });
        _this.addPropertyListener('yKey', function () { return _this.yData = []; });
        _this.addPropertyListener('sizeKey', function () { return _this.sizeData = []; });
        return _this;
    }
    Object.defineProperty(ScatterSeries.prototype, "fill", {
        get: function () {
            return this._fill;
        },
        set: function (value) {
            if (this._fill !== value) {
                this._fill = value;
                this.scheduleData();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ScatterSeries.prototype, "stroke", {
        get: function () {
            return this._stroke;
        },
        set: function (value) {
            if (this._stroke !== value) {
                this._stroke = value;
                this.scheduleData();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ScatterSeries.prototype, "strokeWidth", {
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
    Object.defineProperty(ScatterSeries.prototype, "fillOpacity", {
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
    Object.defineProperty(ScatterSeries.prototype, "strokeOpacity", {
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
    ScatterSeries.prototype.onMarkerTypeChange = function () {
        this.groupSelection = this.groupSelection.setData([]);
        this.groupSelection.exit.remove();
        this.update();
        this.fireEvent({ type: 'legendChange' });
    };
    ScatterSeries.prototype.processData = function () {
        var _a = this, xKey = _a.xKey, yKey = _a.yKey, sizeKey = _a.sizeKey;
        var data = xKey && yKey ? this.data : [];
        this.xData = data.map(function (d) { return d[xKey]; });
        this.yData = data.map(function (d) { return d[yKey]; });
        if (sizeKey) {
            this.sizeData = data.map(function (d) { return d[sizeKey]; });
        }
        else {
            this.sizeData = [];
        }
        this.sizeScale.domain = numericExtent(this.sizeData) || [1, 1];
        this.xDomain = this.fixNumericExtent(numericExtent(this.xData), 'x');
        this.yDomain = this.fixNumericExtent(numericExtent(this.yData), 'y');
        return true;
    };
    ScatterSeries.prototype.getDomain = function (direction) {
        if (direction === ChartAxisDirection.X) {
            return this.xDomain;
        }
        else {
            return this.yDomain;
        }
    };
    ScatterSeries.prototype.highlightNode = function (node) {
        if (!(node instanceof Marker)) {
            return;
        }
        this.highlightedNode = node;
        this.scheduleLayout();
    };
    ScatterSeries.prototype.dehighlightNode = function () {
        this.highlightedNode = undefined;
        this.scheduleLayout();
    };
    ScatterSeries.prototype.update = function () {
        var _a = this, visible = _a.visible, chart = _a.chart, xAxis = _a.xAxis, yAxis = _a.yAxis;
        this.group.visible = visible;
        if (!xAxis || !yAxis || !visible || !chart || chart.layoutPending || chart.dataPending) {
            return;
        }
        var xScale = xAxis.scale;
        var yScale = yAxis.scale;
        var xOffset = (xScale.bandwidth || 0) / 2;
        var yOffset = (yScale.bandwidth || 0) / 2;
        var _b = this, data = _b.data, xData = _b.xData, yData = _b.yData, sizeData = _b.sizeData, xKey = _b.xKey, yKey = _b.yKey, sizeScale = _b.sizeScale, marker = _b.marker, fill = _b.fill, stroke = _b.stroke, strokeWidth = _b.strokeWidth, fillOpacity = _b.fillOpacity, strokeOpacity = _b.strokeOpacity, highlightedNode = _b.highlightedNode;
        var Marker = marker.type;
        var markerFormatter = marker.formatter;
        this.sizeScale.range = [marker.minSize, marker.size];
        var groupSelectionData = xData.map(function (xDatum, i) { return ({
            seriesDatum: data[i],
            x: xScale.convert(xDatum) + xOffset,
            y: yScale.convert(yData[i]) + yOffset,
            size: sizeData.length ? sizeScale.convert(sizeData[i]) : marker.size
        }); });
        var updateGroups = this.groupSelection.setData(groupSelectionData);
        updateGroups.exit.remove();
        var enterGroups = updateGroups.enter.append(Group);
        enterGroups.append(Marker);
        var groupSelection = updateGroups.merge(enterGroups);
        var _c = this.highlightStyle, highlightFill = _c.fill, highlightStroke = _c.stroke;
        var markerStrokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : strokeWidth;
        groupSelection.selectByClass(Marker)
            .each(function (node, datum) {
            var isHighlightedNode = node === highlightedNode;
            var markerFill = isHighlightedNode && highlightFill !== undefined ? highlightFill : marker.fill || fill;
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
                    size: datum.size,
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
                : datum.size;
            node.fillOpacity = fillOpacity;
            node.strokeOpacity = strokeOpacity;
            node.translationX = datum.x;
            node.translationY = datum.y;
            node.visible = marker.enabled && node.size > 0;
        });
        this.groupSelection = groupSelection;
    };
    ScatterSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var _a = this, xKey = _a.xKey, yKey = _a.yKey;
        if (!xKey || !yKey) {
            return '';
        }
        var _b = this, title = _b.title, tooltipRenderer = _b.tooltipRenderer, xName = _b.xName, yName = _b.yName, sizeKey = _b.sizeKey, sizeName = _b.sizeName, labelKey = _b.labelKey, labelName = _b.labelName, fill = _b.fill;
        var color = fill || 'gray';
        if (tooltipRenderer) {
            return tooltipRenderer({
                datum: nodeDatum.seriesDatum,
                xKey: xKey,
                yKey: yKey,
                sizeKey: sizeKey,
                labelKey: labelKey,
                xName: xName,
                yName: yName,
                sizeName: sizeName,
                labelName: labelName,
                title: title,
                color: color
            });
        }
        else {
            var titleStyle = "style=\"color: white; background-color: " + color + "\"";
            var titleHtml = title ? "<div class=\"title\" " + titleStyle + ">" + title + "</div>" : '';
            var seriesDatum = nodeDatum.seriesDatum;
            var xValue = seriesDatum[xKey];
            var yValue = seriesDatum[yKey];
            var contentHtml = "<b>" + xName + "</b>: " + toFixed(xValue) + "<br><b>" + yName + "</b>: " + toFixed(yValue);
            if (sizeKey) {
                contentHtml += "<br><b>" + sizeName + "</b>: " + seriesDatum[sizeKey];
            }
            if (labelKey) {
                contentHtml = "<b>" + labelName + "</b>: " + seriesDatum[labelKey] + "<br>" + contentHtml;
            }
            return titleHtml + "<div class=\"content\">" + contentHtml + "</div>";
        }
    };
    ScatterSeries.prototype.listSeriesItems = function (data) {
        var _a = this, id = _a.id, title = _a.title, visible = _a.visible, xKey = _a.xKey, yKey = _a.yKey, yName = _a.yName, marker = _a.marker, fill = _a.fill, stroke = _a.stroke, fillOpacity = _a.fillOpacity, strokeOpacity = _a.strokeOpacity;
        if (this.data.length && xKey && yKey) {
            data.push({
                id: id,
                itemId: undefined,
                enabled: visible,
                label: {
                    text: title || yName || yKey
                },
                marker: {
                    type: marker.type,
                    fill: marker.fill || fill,
                    stroke: marker.stroke || stroke,
                    fillOpacity: fillOpacity,
                    strokeOpacity: strokeOpacity
                }
            });
        }
    };
    ScatterSeries.className = 'ScatterSeries';
    __decorate([
        reactive(['layoutChange'])
    ], ScatterSeries.prototype, "title", void 0);
    __decorate([
        reactive(['dataChange'])
    ], ScatterSeries.prototype, "xKey", void 0);
    __decorate([
        reactive(['dataChange'])
    ], ScatterSeries.prototype, "yKey", void 0);
    __decorate([
        reactive(['dataChange'])
    ], ScatterSeries.prototype, "sizeKey", void 0);
    __decorate([
        reactive(['dataChange'])
    ], ScatterSeries.prototype, "labelKey", void 0);
    return ScatterSeries;
}(CartesianSeries));
export { ScatterSeries };
