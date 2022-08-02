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
var series_1 = require("../series");
var array_1 = require("../../../util/array");
var linearScale_1 = require("../../../scale/linearScale");
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
var validation_1 = require("../../../util/validation");
var ScatterSeriesTooltip = /** @class */ (function (_super) {
    __extends(ScatterSeriesTooltip, _super);
    function ScatterSeriesTooltip() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.renderer = undefined;
        return _this;
    }
    return ScatterSeriesTooltip;
}(series_1.SeriesTooltip));
exports.ScatterSeriesTooltip = ScatterSeriesTooltip;
var ScatterSeries = /** @class */ (function (_super) {
    __extends(ScatterSeries, _super);
    function ScatterSeries() {
        var _this = _super.call(this, {
            pickGroupIncludes: ['markers'],
            pickModes: [
                series_1.SeriesNodePickMode.NEAREST_BY_MAIN_CATEGORY_AXIS_FIRST,
                series_1.SeriesNodePickMode.NEAREST_NODE,
                series_1.SeriesNodePickMode.EXACT_SHAPE_MATCH,
            ],
            pathsPerSeries: 0,
            features: ['markers'],
        }) || this;
        _this.xDomain = [];
        _this.yDomain = [];
        _this.xData = [];
        _this.yData = [];
        _this.validData = [];
        _this.sizeData = [];
        _this.sizeScale = new linearScale_1.LinearScale();
        _this.marker = new cartesianSeries_1.CartesianSeriesMarker();
        _this.label = new label_1.Label();
        /**
         * @deprecated Use {@link marker.fill} instead.
         */
        _this.fill = '#c16068';
        /**
         * @deprecated Use {@link marker.stroke} instead.
         */
        _this.stroke = '#874349';
        /**
         * @deprecated Use {@link marker.strokeWidth} instead.
         */
        _this.strokeWidth = 2;
        /**
         * @deprecated Use {@link marker.fillOpacity} instead.
         */
        _this.fillOpacity = 1;
        /**
         * @deprecated Use {@link marker.strokeOpacity} instead.
         */
        _this.strokeOpacity = 1;
        _this.title = undefined;
        _this.labelKey = undefined;
        _this.xName = '';
        _this.yName = '';
        _this.sizeName = 'Size';
        _this.labelName = 'Label';
        _this._xKey = '';
        _this._yKey = '';
        _this._sizeKey = undefined;
        _this.tooltip = new ScatterSeriesTooltip();
        var label = _this.label;
        label.enabled = false;
        return _this;
    }
    Object.defineProperty(ScatterSeries.prototype, "xKey", {
        get: function () {
            return this._xKey;
        },
        set: function (value) {
            this._xKey = value;
            this.xData = [];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ScatterSeries.prototype, "yKey", {
        get: function () {
            return this._yKey;
        },
        set: function (value) {
            this._yKey = value;
            this.yData = [];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ScatterSeries.prototype, "sizeKey", {
        get: function () {
            return this._sizeKey;
        },
        set: function (value) {
            this._sizeKey = value;
            this.sizeData = [];
        },
        enumerable: true,
        configurable: true
    });
    ScatterSeries.prototype.setColors = function (fills, strokes) {
        this.marker.fill = fills[0];
        this.marker.stroke = strokes[0];
    };
    ScatterSeries.prototype.processData = function () {
        var _a = this, xKey = _a.xKey, yKey = _a.yKey, sizeKey = _a.sizeKey, xAxis = _a.xAxis, yAxis = _a.yAxis, marker = _a.marker;
        if (!xAxis || !yAxis) {
            return false;
        }
        var data = xKey && yKey && this.data ? this.data : [];
        var xScale = xAxis.scale;
        var yScale = yAxis.scale;
        var isContinuousX = xScale instanceof continuousScale_1.ContinuousScale;
        var isContinuousY = yScale instanceof continuousScale_1.ContinuousScale;
        this.validData = data.filter(function (d) { return value_1.checkDatum(d[xKey], isContinuousX) !== undefined && value_1.checkDatum(d[yKey], isContinuousY) !== undefined; });
        this.xData = this.validData.map(function (d) { return d[xKey]; });
        this.yData = this.validData.map(function (d) { return d[yKey]; });
        this.sizeData = sizeKey ? this.validData.map(function (d) { return d[sizeKey]; }) : [];
        this.sizeScale.domain = marker.domain ? marker.domain : array_1.extent(this.sizeData, value_1.isContinuous) || [1, 1];
        if (xAxis.scale instanceof continuousScale_1.ContinuousScale) {
            this.xDomain = this.fixNumericExtent(array_1.extent(this.xData, value_1.isContinuous), xAxis);
        }
        else {
            this.xDomain = this.xData;
        }
        if (yAxis.scale instanceof continuousScale_1.ContinuousScale) {
            this.yDomain = this.fixNumericExtent(array_1.extent(this.yData, value_1.isContinuous), yAxis);
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
    ScatterSeries.prototype.fireNodeClickEvent = function (event, datum) {
        this.fireEvent({
            type: 'nodeClick',
            event: event,
            series: this,
            datum: datum.datum,
            xKey: this.xKey,
            yKey: this.yKey,
            sizeKey: this.sizeKey,
        });
    };
    ScatterSeries.prototype.createNodeData = function () {
        var _a = this, chart = _a.chart, data = _a.data, visible = _a.visible, xAxis = _a.xAxis, yAxis = _a.yAxis, label = _a.label, labelKey = _a.labelKey;
        if (!(chart && data && visible && xAxis && yAxis)) {
            return [];
        }
        var xScale = xAxis.scale;
        var yScale = yAxis.scale;
        var isContinuousX = xScale instanceof continuousScale_1.ContinuousScale;
        var isContinuousY = yScale instanceof continuousScale_1.ContinuousScale;
        var xOffset = (xScale.bandwidth || 0) / 2;
        var yOffset = (yScale.bandwidth || 0) / 2;
        var _b = this, xData = _b.xData, yData = _b.yData, validData = _b.validData, sizeData = _b.sizeData, sizeScale = _b.sizeScale, marker = _b.marker;
        var nodeData = new Array(xData.length);
        sizeScale.range = [marker.size, marker.maxSize];
        var font = label.getFont();
        var actualLength = 0;
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
            var size = hdpiCanvas_1.HdpiCanvas.getTextSize(text, font);
            nodeData[actualLength++] = {
                series: this,
                datum: validData[i],
                point: { x: x, y: y },
                size: sizeData.length ? sizeScale.convert(sizeData[i]) : marker.size,
                label: __assign({ text: text }, size),
            };
        }
        nodeData.length = actualLength;
        return [{ itemId: this.yKey, nodeData: nodeData, labelData: nodeData }];
    };
    ScatterSeries.prototype.isPathOrSelectionDirty = function () {
        return this.marker.isDirty();
    };
    ScatterSeries.prototype.getLabelData = function () {
        var _a;
        return (_a = this.contextNodeData) === null || _a === void 0 ? void 0 : _a.reduce(function (r, n) { return r.concat(n.labelData); }, []);
    };
    ScatterSeries.prototype.updateMarkerSelection = function (opts) {
        var nodeData = opts.nodeData, markerSelection = opts.markerSelection;
        var _a = this.marker, enabled = _a.enabled, shape = _a.shape;
        var MarkerShape = util_1.getMarker(shape);
        if (this.marker.isDirty()) {
            markerSelection = markerSelection.setData([]);
            markerSelection.exit.remove();
        }
        var data = enabled ? nodeData : [];
        var updateMarkers = markerSelection.setData(data);
        updateMarkers.exit.remove();
        var enterMarkers = updateMarkers.enter.append(MarkerShape);
        return updateMarkers.merge(enterMarkers);
    };
    ScatterSeries.prototype.updateMarkerNodes = function (opts) {
        var markerSelection = opts.markerSelection, isDatumHighlighted = opts.isHighlight;
        var _a = this, marker = _a.marker, xKey = _a.xKey, yKey = _a.yKey, strokeWidth = _a.strokeWidth, fillOpacity = _a.fillOpacity, strokeOpacity = _a.strokeOpacity, seriesFill = _a.fill, seriesStroke = _a.stroke, sizeScale = _a.sizeScale, _b = _a.highlightStyle, deprecatedFill = _b.fill, deprecatedStroke = _b.stroke, deprecatedStrokeWidth = _b.strokeWidth, _c = _b.item, _d = _c.fill, highlightedFill = _d === void 0 ? deprecatedFill : _d, _e = _c.stroke, highlightedStroke = _e === void 0 ? deprecatedStroke : _e, _f = _c.strokeWidth, highlightedDatumStrokeWidth = _f === void 0 ? deprecatedStrokeWidth : _f;
        var markerStrokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : strokeWidth;
        var formatter = marker.formatter;
        sizeScale.range = [marker.size, marker.maxSize];
        markerSelection.each(function (node, datum) {
            var fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : marker.fill || seriesFill;
            var stroke = isDatumHighlighted && highlightedStroke !== undefined
                ? highlightedStroke
                : marker.stroke || seriesStroke;
            var strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                ? highlightedDatumStrokeWidth
                : markerStrokeWidth;
            var size = datum.size;
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
                    highlighted: isDatumHighlighted,
                });
            }
            node.fill = (format && format.fill) || fill;
            node.stroke = (format && format.stroke) || stroke;
            node.strokeWidth = format && format.strokeWidth !== undefined ? format.strokeWidth : strokeWidth;
            node.size = format && format.size !== undefined ? format.size : size;
            node.fillOpacity = marker.fillOpacity !== undefined ? marker.fillOpacity : fillOpacity;
            node.strokeOpacity = marker.strokeOpacity !== undefined ? marker.strokeOpacity : strokeOpacity;
            node.translationX = datum.point.x;
            node.translationY = datum.point.y;
            node.visible = node.size > 0;
        });
        if (!isDatumHighlighted) {
            this.marker.markClean();
        }
    };
    ScatterSeries.prototype.updateLabelSelection = function (opts) {
        var _a, _b;
        var labelSelection = opts.labelSelection;
        var placedLabels = (_b = (_a = this.chart) === null || _a === void 0 ? void 0 : _a.placeLabels().get(this), (_b !== null && _b !== void 0 ? _b : []));
        var placedNodeDatum = placedLabels.map(function (v) { return (__assign(__assign({}, v.datum), { point: {
                x: v.x,
                y: v.y,
            } })); });
        var updateLabels = labelSelection.setData(placedNodeDatum);
        updateLabels.exit.remove();
        var enterLabels = updateLabels.enter.append(text_1.Text);
        return updateLabels.merge(enterLabels);
    };
    ScatterSeries.prototype.updateLabelNodes = function (opts) {
        var labelSelection = opts.labelSelection;
        var label = this.label;
        labelSelection.each(function (text, datum) {
            text.text = datum.label.text;
            text.fill = label.color;
            text.x = datum.point.x;
            text.y = datum.point.y;
            text.fontStyle = label.fontStyle;
            text.fontWeight = label.fontWeight;
            text.fontSize = label.fontSize;
            text.fontFamily = label.fontFamily;
            text.textAlign = 'left';
            text.textBaseline = 'top';
        });
    };
    ScatterSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var _a, _b;
        var _c = this, xKey = _c.xKey, yKey = _c.yKey, xAxis = _c.xAxis, yAxis = _c.yAxis;
        if (!xKey || !yKey || !xAxis || !yAxis) {
            return '';
        }
        var _d = this, seriesFill = _d.fill, seriesStroke = _d.stroke, marker = _d.marker, tooltip = _d.tooltip, xName = _d.xName, yName = _d.yName, sizeKey = _d.sizeKey, sizeName = _d.sizeName, labelKey = _d.labelKey, labelName = _d.labelName;
        var fill = (_a = marker.fill, (_a !== null && _a !== void 0 ? _a : seriesFill));
        var stroke = (_b = marker.stroke, (_b !== null && _b !== void 0 ? _b : seriesStroke));
        var strokeWidth = this.getStrokeWidth(marker.strokeWidth || this.strokeWidth);
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
                highlighted: false,
            });
        }
        var color = (format && format.fill) || fill || 'gray';
        var title = this.title || yName;
        var datum = nodeDatum.datum;
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
            content: content,
        };
        var tooltipRenderer = tooltip.renderer;
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
                color: color,
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
                    text: title || yName || yKey,
                },
                marker: {
                    shape: marker.shape,
                    fill: marker.fill || fill || 'rgba(0, 0, 0, 0)',
                    stroke: marker.stroke || stroke || 'rgba(0, 0, 0, 0)',
                    fillOpacity: marker.fillOpacity !== undefined ? marker.fillOpacity : fillOpacity,
                    strokeOpacity: marker.strokeOpacity !== undefined ? marker.strokeOpacity : strokeOpacity,
                },
            });
        }
    };
    ScatterSeries.className = 'ScatterSeries';
    ScatterSeries.type = 'scatter';
    __decorate([
        validation_1.Deprecated('Use marker.fill instead.', { default: '#c16068' })
    ], ScatterSeries.prototype, "fill", void 0);
    __decorate([
        validation_1.Deprecated('Use marker.stroke instead.', { default: '#874349' })
    ], ScatterSeries.prototype, "stroke", void 0);
    __decorate([
        validation_1.Deprecated('Use marker.strokeWidth instead.', { default: 2 })
    ], ScatterSeries.prototype, "strokeWidth", void 0);
    __decorate([
        validation_1.Deprecated('Use marker.fillOpacity instead.', { default: 1 })
    ], ScatterSeries.prototype, "fillOpacity", void 0);
    __decorate([
        validation_1.Deprecated('Use marker.strokeOpacity instead.', { default: 1 })
    ], ScatterSeries.prototype, "strokeOpacity", void 0);
    return ScatterSeries;
}(cartesianSeries_1.CartesianSeries));
exports.ScatterSeries = ScatterSeries;
