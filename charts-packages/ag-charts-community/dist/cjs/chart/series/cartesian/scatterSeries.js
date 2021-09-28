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
Object.defineProperty(exports, "__esModule", { value: true });
var selection_1 = require("../../../scene/selection");
var series_1 = require("../series");
var array_1 = require("../../../util/array");
var linearScale_1 = require("../../../scale/linearScale");
var observable_1 = require("../../../util/observable");
var cartesianSeries_1 = require("./cartesianSeries");
var chartAxis_1 = require("../../chartAxis");
var util_1 = require("../../marker/util");
var chart_1 = require("../../chart");
var continuousScale_1 = require("../../../scale/continuousScale");
var sanitize_1 = require("../../../util/sanitize");
var label_1 = require("../../label");
var text_1 = require("../../../scene/shape/text");
var hdpiCanvas_1 = require("../../../canvas/hdpiCanvas");
var value_1 = require("../../../util/value");
var ScatterSeriesTooltip = /** @class */ (function (_super) {
    __extends(ScatterSeriesTooltip, _super);
    function ScatterSeriesTooltip() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        observable_1.reactive('change')
    ], ScatterSeriesTooltip.prototype, "renderer", void 0);
    return ScatterSeriesTooltip;
}(series_1.SeriesTooltip));
exports.ScatterSeriesTooltip = ScatterSeriesTooltip;
var ScatterSeries = /** @class */ (function (_super) {
    __extends(ScatterSeries, _super);
    function ScatterSeries() {
        var _this = _super.call(this) || this;
        _this.xDomain = [];
        _this.yDomain = [];
        _this.xData = [];
        _this.yData = [];
        _this.sizeData = [];
        _this.sizeScale = new linearScale_1.LinearScale();
        _this.nodeData = [];
        _this.markerSelection = selection_1.Selection.select(_this.pickGroup).selectAll();
        _this.labelData = [];
        _this.labelSelection = selection_1.Selection.select(_this.group).selectAll();
        _this.marker = new cartesianSeries_1.CartesianSeriesMarker();
        _this.label = new label_1.Label();
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
        marker.addEventListener('change', _this.scheduleUpdate, _this);
        marker.addPropertyListener('maxSize', _this.scheduleData, _this);
        _this.addPropertyListener('xKey', function () { return _this.xData = []; });
        _this.addPropertyListener('yKey', function () { return _this.yData = []; });
        _this.addPropertyListener('sizeKey', function () { return _this.sizeData = []; });
        label.enabled = false;
        label.addEventListener('change', _this.scheduleUpdate, _this);
        label.addEventListener('dataChange', _this.scheduleData, _this);
        label.addPropertyListener('fontSize', _this.scheduleData, _this);
        return _this;
    }
    Object.defineProperty(ScatterSeries.prototype, "fill", {
        get: function () {
            return this._fill;
        },
        /**
         * @deprecated Use {@link marker.fill} instead.
         */
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
        /**
         * @deprecated Use {@link marker.stroke} instead.
         */
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
        /**
         * @deprecated Use {@link marker.strokeWidth} instead.
         */
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
        /**
         * @deprecated Use {@link marker.fillOpacity} instead.
         */
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
        /**
         * @deprecated Use {@link marker.strokeOpacity} instead.
         */
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
        if (!xAxis || !yAxis) {
            return false;
        }
        var data = xKey && yKey && this.data ? this.data : [];
        this.xData = data.map(function (d) { return d[xKey]; });
        this.yData = data.map(function (d) { return d[yKey]; });
        this.sizeData = sizeKey ? data.map(function (d) { return d[sizeKey]; }) : [];
        var font = label.getFont();
        this.labelData = labelKey ? data.map(function (d) {
            var text = String(d[labelKey]);
            var size = hdpiCanvas_1.HdpiCanvas.getTextSize(text, font);
            return __assign({ text: text }, size);
        }) : [];
        this.sizeScale.domain = marker.domain ? marker.domain : array_1.extent(this.sizeData, value_1.isContinuous) || [1, 1];
        if (xAxis.scale instanceof continuousScale_1.ContinuousScale) {
            this.xDomain = this.fixNumericExtent(array_1.extent(this.xData, value_1.isContinuous), 'x');
        }
        else {
            this.xDomain = this.xData;
        }
        if (yAxis.scale instanceof continuousScale_1.ContinuousScale) {
            this.yDomain = this.fixNumericExtent(array_1.extent(this.yData, value_1.isContinuous), 'y');
        }
        else {
            this.yDomain = this.yData;
        }
        return true;
    };
    ScatterSeries.prototype.getDomain = function (direction) {
        if (direction === chartAxis_1.ChartAxisDirection.X) {
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
    ScatterSeries.prototype.createNodeData = function () {
        var _a = this, chart = _a.chart, data = _a.data, visible = _a.visible, xAxis = _a.xAxis, yAxis = _a.yAxis;
        if (!(chart && data && visible && xAxis && yAxis) || chart.layoutPending || chart.dataPending) {
            return [];
        }
        var xScale = xAxis.scale;
        var yScale = yAxis.scale;
        var isContinuousX = xScale instanceof continuousScale_1.ContinuousScale;
        var isContinuousY = yScale instanceof continuousScale_1.ContinuousScale;
        var xOffset = (xScale.bandwidth || 0) / 2;
        var yOffset = (yScale.bandwidth || 0) / 2;
        var _b = this, xData = _b.xData, yData = _b.yData, sizeData = _b.sizeData, sizeScale = _b.sizeScale, marker = _b.marker;
        var nodeData = [];
        sizeScale.range = [marker.size, marker.maxSize];
        for (var i = 0; i < xData.length; i++) {
            var xy = this.checkDomainXY(xData[i], yData[i], isContinuousX, isContinuousY);
            if (!xy) {
                continue;
            }
            var x = xScale.convert(xy[0]) + xOffset;
            var y = yScale.convert(xy[1]) + yOffset;
            if (!this.checkRangeXY(x, y, xAxis, yAxis)) {
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
        this.updatePending = false;
        this.updateSelections();
        this.updateNodes();
    };
    ScatterSeries.prototype.updateSelections = function () {
        if (!this.nodeDataPending) {
            return;
        }
        this.nodeDataPending = false;
        this.createNodeData();
        this.updateMarkerSelection();
        this.updateLabelSelection();
    };
    ScatterSeries.prototype.updateNodes = function () {
        this.group.visible = this.visible;
        this.updateMarkerNodes();
        this.updateLabelNodes();
    };
    ScatterSeries.prototype.updateLabelSelection = function () {
        var placedLabels = this.chart && this.chart.placeLabels().get(this) || [];
        var updateLabels = this.labelSelection.setData(placedLabels);
        updateLabels.exit.remove();
        var enterLabels = updateLabels.enter.append(text_1.Text);
        this.labelSelection = updateLabels.merge(enterLabels);
    };
    ScatterSeries.prototype.updateMarkerSelection = function () {
        var MarkerShape = util_1.getMarker(this.marker.shape);
        var updateMarkers = this.markerSelection.setData(this.nodeData);
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
        var _this = this;
        if (!this.chart) {
            return;
        }
        var _a = this, marker = _a.marker, xKey = _a.xKey, yKey = _a.yKey, strokeWidth = _a.strokeWidth, fillOpacity = _a.fillOpacity, strokeOpacity = _a.strokeOpacity, seriesFill = _a.fill, seriesStroke = _a.stroke, highlightedDatum = _a.chart.highlightedDatum, _b = _a.highlightStyle, deprecatedFill = _b.fill, deprecatedStroke = _b.stroke, deprecatedStrokeWidth = _b.strokeWidth, _c = _b.item, _d = _c.fill, highlightedFill = _d === void 0 ? deprecatedFill : _d, _e = _c.stroke, highlightedStroke = _e === void 0 ? deprecatedStroke : _e, _f = _c.strokeWidth, highlightedDatumStrokeWidth = _f === void 0 ? deprecatedStrokeWidth : _f;
        var markerStrokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : strokeWidth;
        var formatter = marker.formatter;
        this.markerSelection.each(function (node, datum, index) {
            var isDatumHighlighted = datum === highlightedDatum;
            var fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : marker.fill || seriesFill;
            var stroke = isDatumHighlighted && highlightedStroke !== undefined ? highlightedStroke : marker.stroke || seriesStroke;
            var strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                ? highlightedDatumStrokeWidth
                : _this.getStrokeWidth(markerStrokeWidth, datum);
            var format = undefined;
            if (formatter) {
                format = formatter({
                    datum: datum.seriesDatum,
                    xKey: xKey,
                    yKey: yKey,
                    fill: fill,
                    stroke: stroke,
                    strokeWidth: strokeWidth,
                    size: datum.size,
                    highlighted: isDatumHighlighted
                });
            }
            node.fill = format && format.fill || fill;
            node.stroke = format && format.stroke || stroke;
            node.strokeWidth = format && format.strokeWidth !== undefined
                ? format.strokeWidth
                : strokeWidth;
            node.size = format && format.size !== undefined
                ? format.size
                : datum.size;
            node.fillOpacity = marker.fillOpacity !== undefined ? marker.fillOpacity : fillOpacity;
            node.strokeOpacity = marker.strokeOpacity !== undefined ? marker.strokeOpacity : strokeOpacity;
            node.translationX = datum.point.x;
            node.translationY = datum.point.y;
            node.opacity = _this.getOpacity(datum);
            node.zIndex = isDatumHighlighted ? series_1.Series.highlightedZIndex : index;
            node.visible = marker.enabled && node.size > 0;
        });
    };
    ScatterSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var _a = this, xKey = _a.xKey, yKey = _a.yKey, xAxis = _a.xAxis, yAxis = _a.yAxis;
        if (!xKey || !yKey || !xAxis || !yAxis) {
            return '';
        }
        var _b = this, tooltip = _b.tooltip, xName = _b.xName, yName = _b.yName, sizeKey = _b.sizeKey, sizeName = _b.sizeName, labelKey = _b.labelKey, labelName = _b.labelName;
        var tooltipRenderer = tooltip.renderer;
        var color = this.marker.fill || this.fill || 'gray';
        var title = this.title || yName;
        var datum = nodeDatum.seriesDatum;
        var xValue = datum[xKey];
        var yValue = datum[yKey];
        var xString = sanitize_1.sanitizeHtml(xAxis.formatDatum(xValue));
        var yString = sanitize_1.sanitizeHtml(yAxis.formatDatum(yValue));
        var content = "<b>" + sanitize_1.sanitizeHtml(xName || xKey) + "</b>: " + xString + "<br>" +
            ("<b>" + sanitize_1.sanitizeHtml(yName || yKey) + "</b>: " + yString);
        if (sizeKey) {
            content += "<br><b>" + sanitize_1.sanitizeHtml(sizeName || sizeKey) + "</b>: " + sanitize_1.sanitizeHtml(datum[sizeKey]);
        }
        if (labelKey) {
            content = "<b>" + sanitize_1.sanitizeHtml(labelName || labelKey) + "</b>: " + sanitize_1.sanitizeHtml(datum[labelKey]) + "<br>" + content;
        }
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
                sizeKey: sizeKey,
                sizeName: sizeName,
                labelKey: labelKey,
                labelName: labelName,
                title: title,
                color: color
            }), defaults);
        }
        return chart_1.toTooltipHtml(defaults);
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
                    fillOpacity: marker.fillOpacity !== undefined ? marker.fillOpacity : fillOpacity,
                    strokeOpacity: marker.strokeOpacity !== undefined ? marker.strokeOpacity : strokeOpacity
                }
            });
        }
    };
    ScatterSeries.className = 'ScatterSeries';
    ScatterSeries.type = 'scatter';
    __decorate([
        observable_1.reactive('layoutChange')
    ], ScatterSeries.prototype, "title", void 0);
    __decorate([
        observable_1.reactive('dataChange')
    ], ScatterSeries.prototype, "xKey", void 0);
    __decorate([
        observable_1.reactive('dataChange')
    ], ScatterSeries.prototype, "yKey", void 0);
    __decorate([
        observable_1.reactive('dataChange')
    ], ScatterSeries.prototype, "sizeKey", void 0);
    __decorate([
        observable_1.reactive('dataChange')
    ], ScatterSeries.prototype, "labelKey", void 0);
    return ScatterSeries;
}(cartesianSeries_1.CartesianSeries));
exports.ScatterSeries = ScatterSeries;
//# sourceMappingURL=scatterSeries.js.map