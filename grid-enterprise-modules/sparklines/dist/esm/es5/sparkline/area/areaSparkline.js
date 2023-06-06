var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { _Scale, _Scene, _Util } from 'ag-charts-community';
import { Sparkline, ZINDICIES } from '../sparkline';
import { toTooltipHtml } from '../tooltip/sparklineTooltip';
import { getMarker } from '../marker/markerFactory';
import { getLineDash } from '../../util/lineDash';
var extent = _Util.extent;
var BandScale = _Scale.BandScale;
var SparklineMarker = /** @class */ (function () {
    function SparklineMarker() {
        this.enabled = true;
        this.shape = 'circle';
        this.size = 0;
        this.fill = 'rgb(124, 181, 236)';
        this.stroke = 'rgb(124, 181, 236)';
        this.strokeWidth = 1;
        this.formatter = undefined;
    }
    return SparklineMarker;
}());
var SparklineLine = /** @class */ (function () {
    function SparklineLine() {
        this.stroke = 'rgb(124, 181, 236)';
        this.strokeWidth = 1;
    }
    return SparklineLine;
}());
var SparklineCrosshairs = /** @class */ (function () {
    function SparklineCrosshairs() {
        this.xLine = {
            enabled: true,
            stroke: 'rgba(0,0,0, 0.54)',
            strokeWidth: 1,
            lineDash: 'solid',
            lineCap: undefined,
        };
        this.yLine = {
            enabled: false,
            stroke: 'rgba(0,0,0, 0.54)',
            strokeWidth: 1,
            lineDash: 'solid',
            lineCap: undefined,
        };
    }
    return SparklineCrosshairs;
}());
var AreaSparkline = /** @class */ (function (_super) {
    __extends(AreaSparkline, _super);
    function AreaSparkline() {
        var _this = _super.call(this) || this;
        _this.fill = 'rgba(124, 181, 236, 0.25)';
        _this.strokePath = new _Scene.Path();
        _this.fillPath = new _Scene.Path();
        _this.xCrosshairLine = new _Scene.Line();
        _this.yCrosshairLine = new _Scene.Line();
        _this.areaSparklineGroup = new _Scene.Group();
        _this.xAxisLine = new _Scene.Line();
        _this.markers = new _Scene.Group();
        _this.markerSelection = _Scene.Selection.select(_this.markers, function () { return _this.markerFactory(); });
        _this.markerSelectionData = [];
        _this.marker = new SparklineMarker();
        _this.line = new SparklineLine();
        _this.crosshairs = new SparklineCrosshairs();
        _this.rootGroup.append(_this.areaSparklineGroup);
        _this.xAxisLine.zIndex = ZINDICIES.AXIS_LINE_ZINDEX;
        _this.fillPath.zIndex = ZINDICIES.SERIES_FILL_ZINDEX;
        _this.strokePath.zIndex = ZINDICIES.SERIES_STROKE_ZINDEX;
        _this.xCrosshairLine.zIndex = ZINDICIES.CROSSHAIR_ZINDEX;
        _this.yCrosshairLine.zIndex = ZINDICIES.CROSSHAIR_ZINDEX;
        _this.markers.zIndex = ZINDICIES.SERIES_MARKERS_ZINDEX;
        _this.areaSparklineGroup.append([
            _this.fillPath,
            _this.xAxisLine,
            _this.strokePath,
            _this.xCrosshairLine,
            _this.yCrosshairLine,
            _this.markers,
        ]);
        return _this;
    }
    AreaSparkline.prototype.markerFactory = function () {
        var shape = this.marker.shape;
        var MarkerShape = getMarker(shape);
        return new MarkerShape();
    };
    AreaSparkline.prototype.getNodeData = function () {
        return this.markerSelectionData;
    };
    AreaSparkline.prototype.update = function () {
        var data = this.generateNodeData();
        if (!data) {
            return;
        }
        var nodeData = data.nodeData, fillData = data.fillData, strokeData = data.strokeData;
        this.markerSelectionData = nodeData;
        this.updateSelection(nodeData);
        this.updateNodes();
        this.updateStroke(strokeData);
        this.updateFill(fillData);
    };
    AreaSparkline.prototype.updateYScaleDomain = function () {
        var _a = this, yData = _a.yData, yScale = _a.yScale;
        var yMinMax = extent(yData);
        var yMin = 0;
        var yMax = 1;
        if (yMinMax !== undefined) {
            yMin = this.min = yMinMax[0];
            yMax = this.max = yMinMax[1];
        }
        // if yMin is positive, set yMin to 0
        yMin = yMin < 0 ? yMin : 0;
        // if yMax is negative, set yMax to 0
        yMax = yMax < 0 ? 0 : yMax;
        yScale.domain = [yMin, yMax];
    };
    AreaSparkline.prototype.generateNodeData = function () {
        var _a = this, data = _a.data, yData = _a.yData, xData = _a.xData, xScale = _a.xScale, yScale = _a.yScale;
        if (!data) {
            return;
        }
        var continuous = !(xScale instanceof BandScale);
        var offsetX = !continuous ? xScale.bandwidth / 2 : 0;
        var n = yData.length;
        var nodeData = [];
        var fillData = [];
        var strokeData = [];
        var firstValidX;
        var lastValidX;
        var previousX;
        var nextX;
        var yZero = yScale.convert(0);
        for (var i = 0; i < n; i++) {
            var yDatum = yData[i];
            var xDatum = xData[i];
            var x = xScale.convert(continuous ? xScale.toDomain(xDatum) : xDatum) + offsetX;
            var y = yDatum === undefined ? NaN : yScale.convert(yDatum);
            // if this iteration is not the last, set nextX using the next value in the data array
            if (i + 1 < n) {
                nextX = xScale.convert(continuous ? xScale.toDomain(xData[i + 1]) : xData[i + 1]) + offsetX;
            }
            // set stroke data regardless of missing/ undefined values. Undefined values will be handled in the updateStroke() method
            strokeData.push({
                seriesDatum: { x: xDatum, y: yDatum },
                point: { x: x, y: y },
            });
            if (yDatum === undefined && previousX !== undefined) {
                // if yDatum is undefined and there is a valid previous data point, add a phantom point at yZero
                // if a next data point exists, add a phantom point at yZero at the next X
                fillData.push({ seriesDatum: undefined, point: { x: previousX, y: yZero } });
                if (nextX !== undefined) {
                    fillData.push({ seriesDatum: undefined, point: { x: nextX, y: yZero } });
                }
            }
            else if (yDatum !== undefined) {
                fillData.push({
                    seriesDatum: { x: xDatum, y: yDatum },
                    point: { x: x, y: y },
                });
                // set node data only if yDatum is not undefined. These values are used in the updateSelection() method to update markers
                nodeData.push({
                    seriesDatum: { x: xDatum, y: yDatum },
                    point: { x: x, y: y },
                });
                firstValidX = firstValidX !== undefined ? firstValidX : x;
                lastValidX = x;
            }
            previousX = x;
        }
        // phantom points for creating closed area
        fillData.push({ seriesDatum: undefined, point: { x: lastValidX, y: yZero } }, { seriesDatum: undefined, point: { x: firstValidX, y: yZero } });
        return { nodeData: nodeData, fillData: fillData, strokeData: strokeData };
    };
    AreaSparkline.prototype.updateAxisLine = function () {
        var _a = this, xScale = _a.xScale, yScale = _a.yScale, axis = _a.axis, xAxisLine = _a.xAxisLine;
        xAxisLine.x1 = xScale.range[0];
        xAxisLine.x2 = xScale.range[1];
        xAxisLine.y1 = xAxisLine.y2 = 0;
        xAxisLine.stroke = axis.stroke;
        xAxisLine.strokeWidth = axis.strokeWidth;
        var yZero = yScale.convert(0);
        xAxisLine.translationY = yZero;
    };
    AreaSparkline.prototype.updateSelection = function (selectionData) {
        this.markerSelection.update(selectionData);
    };
    AreaSparkline.prototype.updateNodes = function () {
        var _this = this;
        var _a = this, highlightedDatum = _a.highlightedDatum, highlightStyle = _a.highlightStyle, marker = _a.marker;
        var highlightSize = highlightStyle.size, highlightFill = highlightStyle.fill, highlightStroke = highlightStyle.stroke, highlightStrokeWidth = highlightStyle.strokeWidth;
        var markerFormatter = marker.formatter;
        this.markerSelection.each(function (node, datum, index) {
            var point = datum.point, seriesDatum = datum.seriesDatum;
            if (!point) {
                return;
            }
            var highlighted = datum === highlightedDatum;
            var markerFill = highlighted && highlightFill !== undefined ? highlightFill : marker.fill;
            var markerStroke = highlighted && highlightStroke !== undefined ? highlightStroke : marker.stroke;
            var markerStrokeWidth = highlighted && highlightStrokeWidth !== undefined ? highlightStrokeWidth : marker.strokeWidth;
            var markerSize = highlighted && highlightSize !== undefined ? highlightSize : marker.size;
            var markerFormat;
            if (markerFormatter) {
                var first = index === 0;
                var last = index === _this.markerSelectionData.length - 1;
                var min = seriesDatum.y === _this.min;
                var max = seriesDatum.y === _this.max;
                markerFormat = markerFormatter({
                    datum: datum,
                    xValue: seriesDatum.x,
                    yValue: seriesDatum.y,
                    min: min,
                    max: max,
                    first: first,
                    last: last,
                    fill: markerFill,
                    stroke: markerStroke,
                    strokeWidth: markerStrokeWidth,
                    size: markerSize,
                    highlighted: highlighted,
                });
            }
            node.size = markerFormat && markerFormat.size != undefined ? markerFormat.size : markerSize;
            node.fill = markerFormat && markerFormat.fill != undefined ? markerFormat.fill : markerFill;
            node.stroke = markerFormat && markerFormat.stroke != undefined ? markerFormat.stroke : markerStroke;
            node.strokeWidth =
                markerFormat && markerFormat.strokeWidth != undefined ? markerFormat.strokeWidth : markerStrokeWidth;
            node.translationX = point.x;
            node.translationY = point.y;
            node.visible =
                markerFormat && markerFormat.enabled != undefined
                    ? markerFormat.enabled
                    : marker.enabled && node.size > 0;
        });
    };
    AreaSparkline.prototype.updateStroke = function (strokeData) {
        var _a = this, strokePath = _a.strokePath, yData = _a.yData, line = _a.line;
        if (yData.length < 2) {
            return;
        }
        var path = strokePath.path;
        var n = strokeData.length;
        var moveTo = true;
        path.clear();
        for (var i = 0; i < n; i++) {
            var _b = strokeData[i], point = _b.point, seriesDatum = _b.seriesDatum;
            var x = point.x;
            var y = point.y;
            if (seriesDatum.y == undefined) {
                moveTo = true;
            }
            else {
                if (moveTo) {
                    path.moveTo(x, y);
                    moveTo = false;
                }
                else {
                    path.lineTo(x, y);
                }
            }
        }
        strokePath.lineJoin = strokePath.lineCap = 'round';
        strokePath.fill = undefined;
        strokePath.stroke = line.stroke;
        strokePath.strokeWidth = line.strokeWidth;
    };
    AreaSparkline.prototype.updateFill = function (areaData) {
        var _a = this, fillPath = _a.fillPath, yData = _a.yData, fill = _a.fill;
        var path = fillPath.path;
        var n = areaData.length;
        path.clear();
        if (yData.length < 2) {
            return;
        }
        for (var i = 0; i < n; i++) {
            var point = areaData[i].point;
            var x = point.x;
            var y = point.y;
            if (i > 0) {
                path.lineTo(x, y);
            }
            else {
                path.moveTo(x, y);
            }
        }
        path.closePath();
        fillPath.lineJoin = 'round';
        fillPath.stroke = undefined;
        fillPath.fill = fill;
    };
    AreaSparkline.prototype.updateXCrosshairLine = function () {
        var _a;
        var _b = this, yScale = _b.yScale, xCrosshairLine = _b.xCrosshairLine, highlightedDatum = _b.highlightedDatum, xLine = _b.crosshairs.xLine;
        if (!xLine.enabled || highlightedDatum == undefined) {
            xCrosshairLine.strokeWidth = 0;
            return;
        }
        xCrosshairLine.y1 = yScale.range[0];
        xCrosshairLine.y2 = yScale.range[1];
        xCrosshairLine.x1 = xCrosshairLine.x2 = 0;
        xCrosshairLine.stroke = xLine.stroke;
        xCrosshairLine.strokeWidth = (_a = xLine.strokeWidth) !== null && _a !== void 0 ? _a : 1;
        xCrosshairLine.lineCap = xLine.lineCap === 'round' || xLine.lineCap === 'square' ? xLine.lineCap : undefined;
        var lineDash = xLine.lineDash;
        xCrosshairLine.lineDash = Array.isArray(lineDash)
            ? lineDash
            : getLineDash(xCrosshairLine.lineCap, xLine.lineDash);
        xCrosshairLine.translationX = highlightedDatum.point.x;
    };
    AreaSparkline.prototype.updateYCrosshairLine = function () {
        var _a;
        var _b = this, xScale = _b.xScale, yCrosshairLine = _b.yCrosshairLine, highlightedDatum = _b.highlightedDatum, yLine = _b.crosshairs.yLine;
        if (!yLine.enabled || highlightedDatum == undefined) {
            yCrosshairLine.strokeWidth = 0;
            return;
        }
        yCrosshairLine.x1 = xScale.range[0];
        yCrosshairLine.x2 = xScale.range[1];
        yCrosshairLine.y1 = yCrosshairLine.y2 = 0;
        yCrosshairLine.stroke = yLine.stroke;
        yCrosshairLine.strokeWidth = (_a = yLine.strokeWidth) !== null && _a !== void 0 ? _a : 1;
        yCrosshairLine.lineCap = yLine.lineCap === 'round' || yLine.lineCap === 'square' ? yLine.lineCap : undefined;
        var lineDash = yLine.lineDash;
        yCrosshairLine.lineDash = Array.isArray(lineDash)
            ? lineDash
            : getLineDash(yCrosshairLine.lineCap, yLine.lineDash);
        yCrosshairLine.translationY = highlightedDatum.point.y;
    };
    AreaSparkline.prototype.getTooltipHtml = function (datum) {
        var _a, _b;
        var dataType = this.dataType;
        var seriesDatum = datum.seriesDatum;
        var yValue = seriesDatum.y;
        var xValue = seriesDatum.x;
        var content = this.formatNumericDatum(yValue);
        var title = dataType === 'array' || dataType === 'object' ? this.formatDatum(xValue) : undefined;
        var defaults = {
            content: content,
            title: title,
        };
        var tooltipRenderer = (_b = (_a = this.processedOptions) === null || _a === void 0 ? void 0 : _a.tooltip) === null || _b === void 0 ? void 0 : _b.renderer;
        if (tooltipRenderer) {
            return toTooltipHtml(tooltipRenderer({
                context: this.context,
                datum: seriesDatum,
                yValue: yValue,
                xValue: xValue,
            }), defaults);
        }
        return toTooltipHtml(defaults);
    };
    AreaSparkline.className = 'AreaSparkline';
    return AreaSparkline;
}(Sparkline));
export { AreaSparkline };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJlYVNwYXJrbGluZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9zcGFya2xpbmUvYXJlYS9hcmVhU3BhcmtsaW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUNBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRTVELE9BQU8sRUFBMEIsU0FBUyxFQUFFLFNBQVMsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUM1RSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDNUQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3BELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUUxQyxJQUFBLE1BQU0sR0FBSyxLQUFLLE9BQVYsQ0FBVztBQUNqQixJQUFBLFNBQVMsR0FBSyxNQUFNLFVBQVgsQ0FBWTtBQVE3QjtJQUFBO1FBQ0ksWUFBTyxHQUFZLElBQUksQ0FBQztRQUN4QixVQUFLLEdBQVcsUUFBUSxDQUFDO1FBQ3pCLFNBQUksR0FBVyxDQUFDLENBQUM7UUFDakIsU0FBSSxHQUFZLG9CQUFvQixDQUFDO1FBQ3JDLFdBQU0sR0FBWSxvQkFBb0IsQ0FBQztRQUN2QyxnQkFBVyxHQUFXLENBQUMsQ0FBQztRQUN4QixjQUFTLEdBQXFELFNBQVMsQ0FBQztJQUM1RSxDQUFDO0lBQUQsc0JBQUM7QUFBRCxDQUFDLEFBUkQsSUFRQztBQUVEO0lBQUE7UUFDSSxXQUFNLEdBQVcsb0JBQW9CLENBQUM7UUFDdEMsZ0JBQVcsR0FBVyxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUFELG9CQUFDO0FBQUQsQ0FBQyxBQUhELElBR0M7QUFFRDtJQUFBO1FBQ0ksVUFBSyxHQUF5QjtZQUMxQixPQUFPLEVBQUUsSUFBSTtZQUNiLE1BQU0sRUFBRSxtQkFBbUI7WUFDM0IsV0FBVyxF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