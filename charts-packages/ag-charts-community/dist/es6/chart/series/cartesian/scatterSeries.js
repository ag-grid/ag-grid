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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Selection } from "../../../scene/selection";
import { SeriesTooltip } from "../series";
import { finiteExtent } from "../../../util/array";
import { LinearScale } from "../../../scale/linearScale";
import { reactive } from "../../../util/observable";
import { CartesianSeries, CartesianSeriesMarker } from "./cartesianSeries";
import { ChartAxisDirection } from "../../chartAxis";
import { getMarker } from "../../marker/util";
import { toTooltipHtml } from "../../chart";
import ContinuousScale from "../../../scale/continuousScale";
import { sanitizeHtml } from "../../../util/sanitize";
import { Label } from "../../label";
import { Text } from "../../../scene/shape/text";
import { HdpiCanvas } from "../../../canvas/hdpiCanvas";
var ScatterSeriesTooltip = /** @class */ (function (_super) {
    __extends(ScatterSeriesTooltip, _super);
    function ScatterSeriesTooltip() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        reactive('change')
    ], ScatterSeriesTooltip.prototype, "renderer", void 0);
    return ScatterSeriesTooltip;
}(SeriesTooltip));
export { ScatterSeriesTooltip };
var ScatterSeries = /** @class */ (function (_super) {
    __extends(ScatterSeries, _super);
    function ScatterSeries() {
        var _this = _super.call(this) || this;
        _this.xDomain = [];
        _this.yDomain = [];
        _this.xData = [];
        _this.yData = [];
        _this.sizeData = [];
        _this.sizeScale = new LinearScale();
        _this.nodeData = [];
        _this.markerSelection = Selection.select(_this.pickGroup).selectAll();
        _this.labelData = [];
        _this.labelSelection = Selection.select(_this.group).selectAll();
        _this.marker = new CartesianSeriesMarker();
        _this.label = new Label();
        _this._fill = '#c16068';
        _this._stroke = '#874349';
        _this._strokeWidth = 2;
        _this._fillOpacity = 1;
        _this._strokeOpacity = 1;
        _this.xKey = '';
        _this.yKey = '';
        _this.xName = '';
        _this.yName = '';
        _this.sizeName = 'Size';
        _this.labelName = 'Label';
        _this.tooltip = new ScatterSeriesTooltip();
        var _a = _this, marker = _a.marker, label = _a.label;
        marker.addPropertyListener('shape', _this.onMarkerShapeChange, _this);
        marker.addEventListener('change', _this.update, _this);
        _this.addPropertyListener('xKey', function () { return _this.xData = []; });
        _this.addPropertyListener('yKey', function () { return _this.yData = []; });
        _this.addPropertyListener('sizeKey', function () { return _this.sizeData = []; });
        label.enabled = false;
        label.addEventListener('change', _this.update, _this);
        label.addEventListener('dataChange', _this.scheduleData, _this);
        label.addPropertyListener('fontSize', _this.scheduleData, _this);
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
    ScatterSeries.prototype.onHighlightChange = function () {
        this.updateMarkerNodes();
    };
    ScatterSeries.prototype.onMarkerShapeChange = function () {
        this.markerSelection = this.markerSelection.setData([]);
        this.markerSelection.exit.remove();
        this.update();
        this.fireEvent({ type: 'legendChange' });
    };
    ScatterSeries.prototype.setColors = function (fills, strokes) {
        this.fill = fills[0];
        this.stroke = strokes[0];
        this.marker.fill = fills[0];
        this.marker.stroke = strokes[0];
    };
    ScatterSeries.prototype.processData = function () {
        var _a = this, xKey = _a.xKey, yKey = _a.yKey, sizeKey = _a.sizeKey, labelKey = _a.labelKey, xAxis = _a.xAxis, yAxis = _a.yAxis, marker = _a.marker, label = _a.label;
        var data = xKey && yKey && this.data ? this.data : [];
        this.xData = data.map(function (d) { return d[xKey]; });
        this.yData = data.map(function (d) { return d[yKey]; });
        this.sizeData = sizeKey ? data.map(function (d) { return d[sizeKey]; }) : [];
        var font = label.getFont();
        this.labelData = labelKey ? data.map(function (d) {
            var text = String(d[labelKey]);
            var size = HdpiCanvas.getTextSize(text, font);
            return __assign({ text: text }, size);
        }) : [];
        this.sizeScale.domain = marker.domain ? marker.domain : finiteExtent(this.sizeData) || [1, 1];
        if (xAxis.scale instanceof ContinuousScale) {
            this.xDomain = this.fixNumericExtent(finiteExtent(this.xData), 'x');
        }
        else {
            this.xDomain = this.xData;
        }
        if (yAxis.scale instanceof ContinuousScale) {
            this.yDomain = this.fixNumericExtent(finiteExtent(this.yData), 'y');
        }
        else {
            this.yDomain = this.yData;
        }
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
    ScatterSeries.prototype.getNodeData = function () {
        return this.nodeData;
    };
    ScatterSeries.prototype.getLabelData = function () {
        return this.nodeData;
    };
    ScatterSeries.prototype.fireNodeClickEvent = function (event, datum) {
        this.fireEvent({
            type: 'nodeClick',
            event: event,
            series: this,
            datum: datum.seriesDatum,
            xKey: this.xKey,
            yKey: this.yKey,
            sizeKey: this.sizeKey
        });
    };
    ScatterSeries.prototype.generateNodeData = function () {
        if (!this.data) {
            return [];
        }
        var _a = this, xAxis = _a.xAxis, yAxis = _a.yAxis;
        var xScale = xAxis.scale;
        var yScale = yAxis.scale;
        var isContinuousX = xScale instanceof ContinuousScale;
        var isContinuousY = yScale instanceof ContinuousScale;
        var xOffset = (xScale.bandwidth || 0) / 2;
        var yOffset = (yScale.bandwidth || 0) / 2;
        var _b = this, data = _b.data, xData = _b.xData, yData = _b.yData, sizeData = _b.sizeData, sizeScale = _b.sizeScale, marker = _b.marker;
        var nodeData = [];
        sizeScale.range = [marker.size, marker.maxSize];
        for (var i = 0; i < xData.length; i++) {
            var xDatum = xData[i];
            var yDatum = yData[i];
            var noDatum = yDatum == null || (isContinuousY && (isNaN(yDatum) || !isFinite(yDatum))) ||
                xDatum == null || (isContinuousX && (isNaN(xDatum) || !isFinite(xDatum)));
            if (noDatum) {
                continue;
            }
            var x = xScale.convert(xDatum) + xOffset;
            var y = yScale.convert(yDatum) + yOffset;
            if (!(xAxis.inRange(x) && yAxis.inRange(y))) {
                continue;
            }
            nodeData.push({
                series: this,
                seriesDatum: data[i],
                point: { x: x, y: y },
                size: sizeData.length ? sizeScale.convert(sizeData[i]) : marker.size,
                label: this.labelData[i]
            });
        }
        return this.nodeData = nodeData;
    };
    ScatterSeries.prototype.update = function () {
        var _a = this, visible = _a.visible, chart = _a.chart, xAxis = _a.xAxis, yAxis = _a.yAxis;
        this.group.visible = visible;
        if (!visible || !chart || chart.layoutPending || chart.dataPending || !xAxis || !yAxis) {
            return;
        }
        this.generateNodeData();
        this.updateMarkerSelection(this.nodeData);
        this.updateLabelSelection(this.nodeData);
        this.updateMarkerNodes();
        this.updateLabelNodes();
    };
    ScatterSeries.prototype.updateLabelSelection = function (nodeData) {
        var placedLabels = this.chart && this.chart.placeLabels().get(this) || [];
        var updateLabels = this.labelSelection.setData(placedLabels);
        updateLabels.exit.remove();
        var enterLabels = updateLabels.enter.append(Text);
        this.labelSelection = updateLabels.merge(enterLabels);
    };
    ScatterSeries.prototype.updateMarkerSelection = function (nodeData) {
        var MarkerShape = getMarker(this.marker.shape);
        var updateMarkers = this.markerSelection.setData(nodeData);
        updateMarkers.exit.remove();
        var enterMarkers = updateMarkers.enter.append(MarkerShape);
        this.markerSelection = updateMarkers.merge(enterMarkers);
    };
    ScatterSeries.prototype.updateLabelNodes = function () {
        var label = this.label;
        this.labelSelection.each(function (text, datum) {
            text.text = datum.text;
            text.fill = label.color;
            text.x = datum.x;
            text.y = datum.y;
            text.fontStyle = label.fontStyle;
            text.fontWeight = label.fontWeight;
            text.fontSize = label.fontSize;
            text.fontFamily = label.fontFamily;
            text.textAlign = 'left';
            text.textBaseline = 'top';
        });
    };
    ScatterSeries.prototype.updateMarkerNodes = function () {
        if (!this.chart) {
            return;
        }
        var highlightedDatum = this.chart.highlightedDatum;
        var _a = this, marker = _a.marker, xKey = _a.xKey, yKey = _a.yKey, fill = _a.fill, stroke = _a.stroke, strokeWidth = _a.strokeWidth, fillOpacity = _a.fillOpacity, strokeOpacity = _a.strokeOpacity;
        var _b = this.highlightStyle, highlightFill = _b.fill, highlightStroke = _b.stroke;
        var markerStrokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : strokeWidth;
        var markerFormatter = marker.formatter;
        this.markerSelection.each(function (node, datum) {
            var highlighted = datum === highlightedDatum;
            var markerFill = highlighted && highlightFill !== undefined ? highlightFill : marker.fill || fill;
            var markerStroke = highlighted && highlightStroke !== undefined ? highlightStroke : marker.stroke || stroke;
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
                : datum.size;
            node.fillOpacity = fillOpacity;
            node.strokeOpacity = strokeOpacity;
            node.translationX = datum.point.x;
            node.translationY = datum.point.y;
            node.visible = marker.enabled && node.size > 0;
        });
    };
    ScatterSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var _a = this, xKey = _a.xKey, yKey = _a.yKey, xAxis = _a.xAxis, yAxis = _a.yAxis;
        if (!xKey || !yKey) {
            return '';
        }
        var _b = this, tooltip = _b.tooltip, xName = _b.xName, yName = _b.yName, sizeKey = _b.sizeKey, sizeName = _b.sizeName, labelKey = _b.labelKey, labelName = _b.labelName;
        var tooltipRenderer = tooltip.renderer;
        var color = this.marker.fill || this.fill || 'gray';
        var title = this.title || yName;
        var datum = nodeDatum.seriesDatum;
        var xValue = datum[xKey];
        var yValue = datum[yKey];
        var xString = sanitizeHtml(xAxis.formatDatum(xValue));
        var yString = sanitizeHtml(yAxis.formatDatum(yValue));
        var content = "<b>" + sanitizeHtml(xName || xKey) + "</b>: " + xString
            + ("<br><b>" + sanitizeHtml(yName || yKey) + "</b>: " + yString);
        if (sizeKey) {
            content += "<br><b>" + sanitizeHtml(sizeName || sizeKey) + "</b>: " + sanitizeHtml(datum[sizeKey]);
        }
        if (labelKey) {
            content = "<b>" + sanitizeHtml(labelName || labelKey) + "</b>: " + sanitizeHtml(datum[labelKey]) + "<br>" + content;
        }
        var defaults = {
            title: title,
            backgroundColor: color,
            content: content
        };
        if (tooltipRenderer) {
            return toTooltipHtml(tooltipRenderer({
                datum: datum,
                xKey: xKey,
                xValue: xValue,
                xName: xName,
                yKey: yKey,
                yValue: yValue,
                yName: yName,
                sizeKey: sizeKey,
                sizeName: sizeName,
                labelKey: labelKey,
                labelName: labelName,
                title: title,
                color: color
            }), defaults);
        }
        return toTooltipHtml(defaults);
    };
    ScatterSeries.prototype.listSeriesItems = function (legendData) {
        var _a = this, id = _a.id, data = _a.data, xKey = _a.xKey, yKey = _a.yKey, yName = _a.yName, title = _a.title, visible = _a.visible, marker = _a.marker, fill = _a.fill, stroke = _a.stroke, fillOpacity = _a.fillOpacity, strokeOpacity = _a.strokeOpacity;
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
                    fill: marker.fill || fill || 'rgba(0, 0, 0, 0)',
                    stroke: marker.stroke || stroke || 'rgba(0, 0, 0, 0)',
                    fillOpacity: fillOpacity,
                    strokeOpacity: strokeOpacity
                }
            });
        }
    };
    ScatterSeries.className = 'ScatterSeries';
    ScatterSeries.type = 'scatter';
    __decorate([
        reactive('layoutChange')
    ], ScatterSeries.prototype, "title", void 0);
    __decorate([
        reactive('dataChange')
    ], ScatterSeries.prototype, "xKey", void 0);
    __decorate([
        reactive('dataChange')
    ], ScatterSeries.prototype, "yKey", void 0);
    __decorate([
        reactive('dataChange')
    ], ScatterSeries.prototype, "sizeKey", void 0);
    __decorate([
        reactive('dataChange')
    ], ScatterSeries.prototype, "labelKey", void 0);
    return ScatterSeries;
}(CartesianSeries));
export { ScatterSeries };
