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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
import { ContinuousScale } from '../../../scale/continuousScale';
import { SeriesTooltip, SeriesNodePickMode, } from '../series';
import { extent } from '../../../util/array';
import { PointerEvents } from '../../../scene/node';
import { Text } from '../../../scene/shape/text';
import { CartesianSeries, CartesianSeriesMarker } from './cartesianSeries';
import { ChartAxisDirection } from '../../chartAxis';
import { getMarker } from '../../marker/util';
import { toTooltipHtml } from '../../chart';
import { interpolate } from '../../../util/string';
import { Label } from '../../label';
import { sanitizeHtml } from '../../../util/sanitize';
import { checkDatum, isContinuous } from '../../../util/value';
var LineSeriesLabel = /** @class */ (function (_super) {
    __extends(LineSeriesLabel, _super);
    function LineSeriesLabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.formatter = undefined;
        return _this;
    }
    return LineSeriesLabel;
}(Label));
var LineSeriesTooltip = /** @class */ (function (_super) {
    __extends(LineSeriesTooltip, _super);
    function LineSeriesTooltip() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.renderer = undefined;
        _this.format = undefined;
        return _this;
    }
    return LineSeriesTooltip;
}(SeriesTooltip));
export { LineSeriesTooltip };
var LineSeries = /** @class */ (function (_super) {
    __extends(LineSeries, _super);
    function LineSeries() {
        var _this = _super.call(this, {
            pickGroupIncludes: ['markers'],
            features: ['markers'],
            pickModes: [
                SeriesNodePickMode.NEAREST_BY_MAIN_CATEGORY_AXIS_FIRST,
                SeriesNodePickMode.NEAREST_NODE,
                SeriesNodePickMode.EXACT_SHAPE_MATCH,
            ],
        }) || this;
        _this.xDomain = [];
        _this.yDomain = [];
        _this.xData = [];
        _this.yData = [];
        _this.marker = new CartesianSeriesMarker();
        _this.label = new LineSeriesLabel();
        _this.title = undefined;
        _this.stroke = '#874349';
        _this.lineDash = [0];
        _this.lineDashOffset = 0;
        _this.strokeWidth = 2;
        _this.strokeOpacity = 1;
        _this.tooltip = new LineSeriesTooltip();
        _this._xKey = '';
        _this.xName = '';
        _this._yKey = '';
        _this.yName = '';
        var _a = _this, marker = _a.marker, label = _a.label;
        marker.fill = '#c16068';
        marker.stroke = '#874349';
        label.enabled = false;
        return _this;
    }
    LineSeries.prototype.setColors = function (fills, strokes) {
        this.stroke = fills[0];
        this.marker.stroke = strokes[0];
        this.marker.fill = fills[0];
    };
    Object.defineProperty(LineSeries.prototype, "xKey", {
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
    Object.defineProperty(LineSeries.prototype, "yKey", {
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
    LineSeries.prototype.getDomain = function (direction) {
        if (direction === ChartAxisDirection.X) {
            return this.xDomain;
        }
        return this.yDomain;
    };
    LineSeries.prototype.processData = function () {
        var e_1, _a;
        var _b = this, xAxis = _b.xAxis, yAxis = _b.yAxis, xKey = _b.xKey, yKey = _b.yKey, xData = _b.xData, yData = _b.yData;
        var data = xKey && yKey && this.data ? this.data : [];
        if (!xAxis || !yAxis) {
            return false;
        }
        var isContinuousX = xAxis.scale instanceof ContinuousScale;
        var isContinuousY = yAxis.scale instanceof ContinuousScale;
        xData.length = 0;
        yData.length = 0;
        try {
            for (var data_1 = __values(data), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
                var datum = data_1_1.value;
                var x = datum[xKey];
                var y = datum[yKey];
                var xDatum = checkDatum(x, isContinuousX);
                if (isContinuousX && xDatum === undefined) {
                    continue;
                }
                else {
                    xData.push(xDatum);
                }
                var yDatum = checkDatum(y, isContinuousY);
                yData.push(yDatum);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (data_1_1 && !data_1_1.done && (_a = data_1.return)) _a.call(data_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.xDomain = isContinuousX ? this.fixNumericExtent(extent(xData, isContinuous), xAxis) : xData;
        this.yDomain = isContinuousY ? this.fixNumericExtent(extent(yData, isContinuous), yAxis) : yData;
        return true;
    };
    LineSeries.prototype.createNodeData = function () {
        var _a;
        var _b = this, data = _b.data, xAxis = _b.xAxis, yAxis = _b.yAxis;
        if (!data || !xAxis || !yAxis) {
            return [];
        }
        var _c = this, xData = _c.xData, yData = _c.yData, label = _c.label, xKey = _c.xKey, yKey = _c.yKey;
        var xScale = xAxis.scale;
        var yScale = yAxis.scale;
        var xOffset = (xScale.bandwidth || 0) / 2;
        var yOffset = (yScale.bandwidth || 0) / 2;
        var nodeData = new Array(data.length);
        var moveTo = true;
        var prevXInRange = undefined;
        var nextXYDatums = undefined;
        var actualLength = 0;
        for (var i = 0; i < xData.length; i++) {
            var xyDatums = nextXYDatums || [xData[i], yData[i]];
            if (xyDatums[1] === undefined) {
                prevXInRange = undefined;
                moveTo = true;
            }
            else {
                var _d = __read(xyDatums, 2), xDatum = _d[0], yDatum = _d[1];
                var x = xScale.convert(xDatum) + xOffset;
                if (isNaN(x)) {
                    prevXInRange = undefined;
                    moveTo = true;
                    continue;
                }
                var tolerance = (xScale.bandwidth || this.marker.size * 0.5 + (this.marker.strokeWidth || 0)) + 1;
                nextXYDatums = yData[i + 1] === undefined ? undefined : [xData[i + 1], yData[i + 1]];
                var xInRange = xAxis.inRangeEx(x, 0, tolerance);
                var nextXInRange = nextXYDatums && xAxis.inRangeEx(xScale.convert(nextXYDatums[0]) + xOffset, 0, tolerance);
                if (xInRange === -1 && nextXInRange === -1) {
                    moveTo = true;
                    continue;
                }
                if (xInRange === 1 && prevXInRange === 1) {
                    moveTo = true;
                    continue;
                }
                prevXInRange = xInRange;
                var y = yScale.convert(yDatum) + yOffset;
                var labelText = void 0;
                if (label.formatter) {
                    labelText = label.formatter({ value: yDatum });
                }
                else {
                    labelText =
                        typeof yDatum === 'number' && isFinite(yDatum)
                            ? yDatum.toFixed(2)
                            : yDatum
                                ? String(yDatum)
                                : '';
                }
                var seriesDatum = (_a = {}, _a[xKey] = xDatum, _a[yKey] = yDatum, _a);
                nodeData[actualLength++] = {
                    series: this,
                    datum: seriesDatum,
                    point: { x: x, y: y, moveTo: moveTo },
                    label: labelText
                        ? {
                            text: labelText,
                            fontStyle: label.fontStyle,
                            fontWeight: label.fontWeight,
                            fontSize: label.fontSize,
                            fontFamily: label.fontFamily,
                            textAlign: 'center',
                            textBaseline: 'bottom',
                            fill: label.color,
                        }
                        : undefined,
                };
                moveTo = false;
            }
        }
        nodeData.length = actualLength;
        return [{ itemId: yKey, nodeData: nodeData, labelData: nodeData }];
    };
    LineSeries.prototype.isPathOrSelectionDirty = function () {
        return this.marker.isDirty();
    };
    LineSeries.prototype.updatePaths = function (opts) {
        var e_2, _a;
        var nodeData = opts.contextData.nodeData, _b = __read(opts.paths, 1), lineNode = _b[0];
        var linePath = lineNode.path;
        lineNode.fill = undefined;
        lineNode.lineJoin = 'round';
        lineNode.pointerEvents = PointerEvents.None;
        linePath.clear({ trackChanges: true });
        try {
            for (var nodeData_1 = __values(nodeData), nodeData_1_1 = nodeData_1.next(); !nodeData_1_1.done; nodeData_1_1 = nodeData_1.next()) {
                var data = nodeData_1_1.value;
                if (data.point.moveTo) {
                    linePath.moveTo(data.point.x, data.point.y);
                }
                else {
                    linePath.lineTo(data.point.x, data.point.y);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (nodeData_1_1 && !nodeData_1_1.done && (_a = nodeData_1.return)) _a.call(nodeData_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        lineNode.checkPathDirty();
    };
    LineSeries.prototype.updatePathNodes = function (opts) {
        var _a = __read(opts.paths, 1), lineNode = _a[0];
        lineNode.stroke = this.stroke;
        lineNode.strokeWidth = this.getStrokeWidth(this.strokeWidth);
        lineNode.strokeOpacity = this.strokeOpacity;
        lineNode.lineDash = this.lineDash;
        lineNode.lineDashOffset = this.lineDashOffset;
    };
    LineSeries.prototype.updateMarkerSelection = function (opts) {
        var nodeData = opts.nodeData, markerSelection = opts.markerSelection;
        var _a = this.marker, shape = _a.shape, enabled = _a.enabled;
        nodeData = shape && enabled ? nodeData : [];
        var MarkerShape = getMarker(shape);
        if (this.marker.isDirty()) {
            markerSelection = markerSelection.setData([]);
            markerSelection.exit.remove();
        }
        var updateMarkerSelection = markerSelection.setData(nodeData);
        updateMarkerSelection.exit.remove();
        var enterDatumSelection = updateMarkerSelection.enter.append(MarkerShape);
        return updateMarkerSelection.merge(enterDatumSelection);
    };
    LineSeries.prototype.updateMarkerNodes = function (opts) {
        var markerSelection = opts.markerSelection, isDatumHighlighted = opts.isHighlight;
        var _a = this, marker = _a.marker, xKey = _a.xKey, yKey = _a.yKey, lineStroke = _a.stroke, strokeOpacity = _a.strokeOpacity, _b = _a.highlightStyle, deprecatedFill = _b.fill, deprecatedStroke = _b.stroke, deprecatedStrokeWidth = _b.strokeWidth, _c = _b.item, _d = _c.fill, highlightedFill = _d === void 0 ? deprecatedFill : _d, _e = _c.stroke, highlightedStroke = _e === void 0 ? deprecatedStroke : _e, _f = _c.strokeWidth, highlightedDatumStrokeWidth = _f === void 0 ? deprecatedStrokeWidth : _f;
        var size = marker.size, formatter = marker.formatter;
        var markerStrokeWidth = marker.strokeWidth !== undefined ? marker.strokeWidth : this.strokeWidth;
        markerSelection.each(function (node, datum) {
            var _a, _b, _c;
            var fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : marker.fill;
            var stroke = isDatumHighlighted && highlightedStroke !== undefined ? highlightedStroke : marker.stroke || lineStroke;
            var strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                ? highlightedDatumStrokeWidth
                : markerStrokeWidth;
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
            node.fillOpacity = (_a = marker.fillOpacity, (_a !== null && _a !== void 0 ? _a : 1));
            node.strokeOpacity = (_c = (_b = marker.strokeOpacity, (_b !== null && _b !== void 0 ? _b : strokeOpacity)), (_c !== null && _c !== void 0 ? _c : 1));
            node.size = format && format.size !== undefined ? format.size : size;
            node.translationX = datum.point.x;
            node.translationY = datum.point.y;
            node.visible = node.size > 0;
        });
        if (!isDatumHighlighted) {
            this.marker.markClean();
        }
    };
    LineSeries.prototype.updateLabelSelection = function (opts) {
        var labelData = opts.labelData, labelSelection = opts.labelSelection;
        var _a = this.marker, shape = _a.shape, enabled = _a.enabled;
        labelData = shape && enabled ? labelData : [];
        var updateTextSelection = labelSelection.setData(labelData);
        updateTextSelection.exit.remove();
        var enterTextSelection = updateTextSelection.enter.append(Text);
        return updateTextSelection.merge(enterTextSelection);
    };
    LineSeries.prototype.updateLabelNodes = function (opts) {
        var labelSelection = opts.labelSelection;
        var _a = this.label, labelEnabled = _a.enabled, fontStyle = _a.fontStyle, fontWeight = _a.fontWeight, fontSize = _a.fontSize, fontFamily = _a.fontFamily, color = _a.color;
        labelSelection.each(function (text, datum) {
            var point = datum.point, label = datum.label;
            if (datum && label && labelEnabled) {
                text.fontStyle = fontStyle;
                text.fontWeight = fontWeight;
                text.fontSize = fontSize;
                text.fontFamily = fontFamily;
                text.textAlign = label.textAlign;
                text.textBaseline = label.textBaseline;
                text.text = label.text;
                text.x = point.x;
                text.y = point.y - 10;
                text.fill = color;
                text.visible = true;
            }
            else {
                text.visible = false;
            }
        });
    };
    LineSeries.prototype.fireNodeClickEvent = function (event, datum) {
        this.fireEvent({
            type: 'nodeClick',
            event: event,
            series: this,
            datum: datum.datum,
            xKey: this.xKey,
            yKey: this.yKey,
        });
    };
    LineSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var _a = this, xKey = _a.xKey, yKey = _a.yKey, xAxis = _a.xAxis, yAxis = _a.yAxis;
        if (!xKey || !yKey || !xAxis || !yAxis) {
            return '';
        }
        var _b = this, xName = _b.xName, yName = _b.yName, tooltip = _b.tooltip, marker = _b.marker;
        var tooltipRenderer = tooltip.renderer, tooltipFormat = tooltip.format;
        var datum = nodeDatum.datum;
        var xValue = datum[xKey];
        var yValue = datum[yKey];
        var xString = xAxis.formatDatum(xValue);
        var yString = yAxis.formatDatum(yValue);
        var title = sanitizeHtml(this.title || yName);
        var content = sanitizeHtml(xString + ': ' + yString);
        var markerFormatter = marker.formatter, fill = marker.fill, stroke = marker.stroke, markerStrokeWidth = marker.strokeWidth, size = marker.size;
        var strokeWidth = markerStrokeWidth !== undefined ? markerStrokeWidth : this.strokeWidth;
        var format = undefined;
        if (markerFormatter) {
            format = markerFormatter({
                datum: datum,
                xKey: xKey,
                yKey: yKey,
                fill: fill,
                stroke: stroke,
                strokeWidth: strokeWidth,
                size: size,
                highlighted: false,
            });
        }
        var color = (format && format.fill) || fill;
        var defaults = {
            title: title,
            backgroundColor: color,
            content: content,
        };
        if (tooltipFormat || tooltipRenderer) {
            var params = {
                datum: datum,
                xKey: xKey,
                xValue: xValue,
                xName: xName,
                yKey: yKey,
                yValue: yValue,
                yName: yName,
                title: title,
                color: color,
            };
            if (tooltipFormat) {
                return toTooltipHtml({
                    content: interpolate(tooltipFormat, params),
                }, defaults);
            }
            if (tooltipRenderer) {
                return toTooltipHtml(tooltipRenderer(params), defaults);
            }
        }
        return toTooltipHtml(defaults);
    };
    LineSeries.prototype.listSeriesItems = function (legendData) {
        var _a, _b, _c;
        var _d = this, id = _d.id, data = _d.data, xKey = _d.xKey, yKey = _d.yKey, yName = _d.yName, visible = _d.visible, title = _d.title, marker = _d.marker, stroke = _d.stroke, strokeOpacity = _d.strokeOpacity;
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
                    fill: marker.fill || 'rgba(0, 0, 0, 0)',
                    stroke: marker.stroke || stroke || 'rgba(0, 0, 0, 0)',
                    fillOpacity: (_a = marker.fillOpacity, (_a !== null && _a !== void 0 ? _a : 1)),
                    strokeOpacity: (_c = (_b = marker.strokeOpacity, (_b !== null && _b !== void 0 ? _b : strokeOpacity)), (_c !== null && _c !== void 0 ? _c : 1)),
                },
            });
        }
    };
    LineSeries.className = 'LineSeries';
    LineSeries.type = 'line';
    return LineSeries;
}(CartesianSeries));
export { LineSeries };
