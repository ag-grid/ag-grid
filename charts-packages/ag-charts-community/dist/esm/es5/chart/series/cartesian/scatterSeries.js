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
import { SeriesTooltip, Series } from "../series";
import { extent } from "../../../util/array";
import { LinearScale } from "../../../scale/linearScale";
import { reactive } from "../../../util/observable";
import { CartesianSeries, CartesianSeriesMarker } from "./cartesianSeries";
import { ChartAxisDirection } from "../../chartAxis";
import { getMarker } from "../../marker/util";
import { toTooltipHtml } from "../../chart";
import { ContinuousScale } from "../../../scale/continuousScale";
import { sanitizeHtml } from "../../../util/sanitize";
import { Label } from "../../label";
import { Text } from "../../../scene/shape/text";
import { HdpiCanvas } from "../../../canvas/hdpiCanvas";
import { isContinuous } from "../../../util/value";
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
        _this.validData = [];
        _this.sizeData = [];
        _this.sizeScale = new LinearScale();
        _this.nodeData = [];
        _this.markerSelection = Selection.select(_this.pickGroup).selectAll();
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
        marker.addEventListener('change', _this.scheduleUpdate, _this);
        _this.addPropertyListener('xKey', function () { return _this.xData = []; });
        _this.addPropertyListener('yKey', function () { return _this.yData = []; });
        _this.addPropertyListener('sizeKey', function () { return _this.sizeData = []; });
        label.enabled = false;
        label.addEventListener('change', _this.scheduleUpdate, _this);
        label.addEventListener('dataChange', _this.scheduleData, _this);
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
                this.scheduleUpdate();
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
                this.scheduleUpdate();
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
                this.scheduleUpdate();
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
                this.scheduleUpdate();
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
                this.scheduleUpdate();
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
        this.fireEvent({ type: 'legendChange' });
    };
    ScatterSeries.prototype.setColors = function (fills, strokes) {
        this.fill = fills[0];
        this.stroke = strokes[0];
        this.marker.fill = fills[0];
        this.marker.stroke = strokes[0];
    };
    ScatterSeries.prototype.processData = function () {
        var _this = this;
        var _a = this, xKey = _a.xKey, yKey = _a.yKey, sizeKey = _a.sizeKey, labelKey = _a.labelKey, xAxis = _a.xAxis, yAxis = _a.yAxis, marker = _a.marker, label = _a.label;
        if (!xAxis || !yAxis) {
            return false;
        }
        var data = xKey && yKey && this.data ? this.data : [];
        var xScale = xAxis.scale;
        var yScale = yAxis.scale;
        var isContinuousX = xScale instanceof ContinuousScale;
        var isContinuousY = yScale instanceof ContinuousScale;
        this.validData = data.filter(function (d) { return _this.checkDatum(d[xKey], isContinuousX) !== undefined && _this.checkDatum(d[yKey], isContinuousY) !== undefined; });
        this.xData = this.validData.map(function (d) { return d[xKey]; });
        this.yData = this.validData.map(function (d) { return d[yKey]; });
        this.sizeData = sizeKey ? this.validData.map(function (d) { return d[sizeKey]; }) : [];
        this.sizeScale.domain = marker.domain ? marker.domain : extent(this.sizeData, isContinuous) || [1, 1];
        if (xAxis.scale instanceof ContinuousScale) {
            this.xDomain = this.fixNumericExtent(extent(this.xData, isContinuous), 'x', xAxis);
        }
        else {
            this.xDomain = this.xData;
        }
        if (yAxis.scale instanceof ContinuousScale) {
            this.yDomain = this.fixNumericExtent(extent(this.yData, isContinuous), 'y', yAxis);
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
            datum: datum.datum,
            xKey: this.xKey,
            yKey: this.yKey,
            sizeKey: this.sizeKey
        });
    };
    ScatterSeries.prototype.createNodeData = function () {
        var _a = this, chart = _a.chart, data = _a.data, visible = _a.visible, xAxis = _a.xAxis, yAxis = _a.yAxis, label = _a.label, labelKey = _a.labelKey;
        if (!(chart && data && visible && xAxis && yAxis) || chart.layoutPending || chart.dataPending) {
            return [];
        }
        var xScale = xAxis.scale;
        var yScale = yAxis.scale;
        var isContinuousX = xScale instanceof ContinuousScale;
        var isContinuousY = yScale instanceof ContinuousScale;
        var xOffset = (xScale.bandwidth || 0) / 2;
        var yOffset = (yScale.bandwidth || 0) / 2;
        var _b = this, xData = _b.xData, yData = _b.yData, validData = _b.validData, sizeData = _b.sizeData, sizeScale = _b.sizeScale, marker = _b.marker;
        var nodeData = [];
        sizeScale.range = [marker.size, marker.maxSize];
        var font = label.getFont();
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
            var text = labelKey ? String(validData[i][labelKey]) : '';
            var size = HdpiCanvas.getTextSize(text, font);
            nodeData.push({
                series: this,
                datum: validData[i],
                point: { x: x, y: y },
                size: sizeData.length ? sizeScale.convert(sizeData[i]) : marker.size,
                label: __assign({ text: text }, size),
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
        var enterLabels = updateLabels.enter.append(Text);
        this.labelSelection = updateLabels.merge(enterLabels);
    };
    ScatterSeries.prototype.updateMarkerSelection = function () {
        var MarkerShape = getMarker(this.marker.shape);
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
        var _a = this, marker = _a.marker, xKey = _a.xKey, yKey = _a.yKey, strokeWidth = _a.strokeWidth, fillOpacity = _a.fillOpacity, strokeOpacity = _a.strokeOpacity, seriesFill = _a.fill, seriesStroke = _a.stroke, highlightedDatum = _a.chart.highlightedDatum, sizeScale = _a.sizeScale, sizeData = _a.sizeData, _b = _a.highlightStyle, deprecatedFill = _b.fill, deprecatedStroke = _b.stroke, deprecatedStrokeWidth = _b.strokeWidth, _c = _b.item, _d = _c.fill, highlightedFill = _d === void 0 ? deprecatedFill : _d, _e = _c.stroke, highlightedStroke = _e === void 0 ? deprecatedStroke : _e, _f = _c.strokeWidth, highlightedDatumStrokeWidth = _f === void 0 ? deprecatedStrokeWidth : _f;
        var markerStrokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : strokeWidth;
        var formatter = marker.formatter;
        sizeScale.range = [marker.size, marker.maxSize];
        this.markerSelection.each(function (node, datum, index) {
            var isDatumHighlighted = datum === highlightedDatum;
            var fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : marker.fill || seriesFill;
            var stroke = isDatumHighlighted && highlightedStroke !== undefined ? highlightedStroke : marker.stroke || seriesStroke;
            var strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                ? highlightedDatumStrokeWidth
                : _this.getStrokeWidth(markerStrokeWidth, datum);
            var size = sizeData.length ? sizeScale.convert(sizeData[index]) : marker.size;
            var format = undefined;
            if (formatter) {
                format = formatter({
                    datum: datum.datum,
                    xKey: xKey,
                    yKey: yKey,
                    fill: fill,
                    stroke: stroke,
                    strokeWidth: strokeWidth,
                    size: size,
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
                : size;
            node.fillOpacity = marker.fillOpacity !== undefined ? marker.fillOpacity : fillOpacity;
            node.strokeOpacity = marker.strokeOpacity !== undefined ? marker.strokeOpacity : strokeOpacity;
            node.translationX = datum.point.x;
            node.translationY = datum.point.y;
            node.opacity = _this.getOpacity(datum);
            node.zIndex = isDatumHighlighted ? Series.highlightedZIndex : index;
            node.visible = marker.enabled && node.size > 0;
        });
    };
    ScatterSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var _a = this, xKey = _a.xKey, yKey = _a.yKey, xAxis = _a.xAxis, yAxis = _a.yAxis;
        if (!xKey || !yKey || !xAxis || !yAxis) {
            return '';
        }
        var _b = this, seriesFill = _b.fill, seriesStroke = _b.stroke, marker = _b.marker, tooltip = _b.tooltip, xName = _b.xName, yName = _b.yName, sizeKey = _b.sizeKey, sizeName = _b.sizeName, labelKey = _b.labelKey, labelName = _b.labelName;
        var fill = marker.fill || seriesFill;
        var stroke = marker.stroke || seriesStroke;
        var strokeWidth = this.getStrokeWidth(marker.strokeWidth || this.strokeWidth, nodeDatum);
        var formatter = this.marker.formatter;
        var format = undefined;
        if (formatter) {
            format = formatter({
                datum: nodeDatum,
                xKey: xKey,
                yKey: yKey,
                fill: fill,
                stroke: stroke,
                strokeWidth: strokeWidth,
                size: nodeDatum.size,
                highlighted: false
            });
        }
        var color = format && format.fill || fill || 'gray';
        var title = this.title || yName;
        var datum = nodeDatum.datum;
        var xValue = datum[xKey];
        var yValue = datum[yKey];
        var xString = sanitizeHtml(xAxis.formatDatum(xValue));
        var yString = sanitizeHtml(yAxis.formatDatum(yValue));
        var content = "<b>" + sanitizeHtml(xName || xKey) + "</b>: " + xString + "<br>" +
            ("<b>" + sanitizeHtml(yName || yKey) + "</b>: " + yString);
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
        var tooltipRenderer = tooltip.renderer;
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
                    fillOpacity: marker.fillOpacity !== undefined ? marker.fillOpacity : fillOpacity,
                    strokeOpacity: marker.strokeOpacity !== undefined ? marker.strokeOpacity : strokeOpacity
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
//# sourceMappingURL=scatterSeries.js.map