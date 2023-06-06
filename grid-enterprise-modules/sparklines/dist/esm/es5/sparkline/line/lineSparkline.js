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
var LineSparkline = /** @class */ (function (_super) {
    __extends(LineSparkline, _super);
    function LineSparkline() {
        var _this = _super.call(this) || this;
        _this.linePath = new _Scene.Path();
        _this.xCrosshairLine = new _Scene.Line();
        _this.yCrosshairLine = new _Scene.Line();
        _this.lineSparklineGroup = new _Scene.Group();
        _this.markers = new _Scene.Group();
        _this.markerSelection = _Scene.Selection.select(_this.markers, function () { return _this.markerFactory(); });
        _this.markerSelectionData = [];
        _this.marker = new SparklineMarker();
        _this.line = new SparklineLine();
        _this.crosshairs = new SparklineCrosshairs();
        _this.rootGroup.append(_this.lineSparklineGroup);
        _this.linePath.zIndex = ZINDICIES.SERIES_STROKE_ZINDEX;
        _this.xCrosshairLine.zIndex = ZINDICIES.CROSSHAIR_ZINDEX;
        _this.yCrosshairLine.zIndex = ZINDICIES.CROSSHAIR_ZINDEX;
        _this.markers.zIndex = ZINDICIES.SERIES_MARKERS_ZINDEX;
        _this.lineSparklineGroup.append([_this.linePath, _this.xCrosshairLine, _this.yCrosshairLine, _this.markers]);
        return _this;
    }
    LineSparkline.prototype.getNodeData = function () {
        return this.markerSelectionData;
    };
    LineSparkline.prototype.markerFactory = function () {
        var shape = this.marker.shape;
        var MarkerShape = getMarker(shape);
        return new MarkerShape();
    };
    /**
     * If marker shape is changed, this method should be called to remove the previous marker nodes selection.
     */
    LineSparkline.prototype.onMarkerShapeChange = function () {
        this.markerSelection = this.markerSelection.clear();
        this.scheduleLayout();
    };
    LineSparkline.prototype.update = function () {
        var nodeData = this.generateNodeData();
        if (!nodeData) {
            return;
        }
        this.markerSelectionData = nodeData;
        this.updateSelection(nodeData);
        this.updateNodes();
        this.updateLine();
    };
    LineSparkline.prototype.updateYScaleDomain = function () {
        var _a = this, yData = _a.yData, yScale = _a.yScale;
        var yMinMax = extent(yData);
        var yMin = 0;
        var yMax = 1;
        if (yMinMax !== undefined) {
            yMin = this.min = yMinMax[0];
            yMax = this.max = yMinMax[1];
        }
        if (yMin === yMax) {
            // if all values in the data are the same, yMin and yMax will be equal, need to adjust the domain with some padding
            var padding = Math.abs(yMin * 0.01);
            yMin -= padding;
            yMax += padding;
        }
        yScale.domain = [yMin, yMax];
    };
    LineSparkline.prototype.generateNodeData = function () {
        var _a = this, data = _a.data, yData = _a.yData, xData = _a.xData, xScale = _a.xScale, yScale = _a.yScale;
        if (!data) {
            return;
        }
        var continuous = !(xScale instanceof BandScale);
        var offsetX = !continuous ? xScale.bandwidth / 2 : 0;
        var nodeData = [];
        for (var i = 0; i < yData.length; i++) {
            var yDatum = yData[i];
            var xDatum = xData[i];
            if (yDatum == undefined) {
                continue;
            }
            var x = xScale.convert(continuous ? xScale.toDomain(xDatum) : xDatum) + offsetX;
            var y = yDatum === undefined ? NaN : yScale.convert(yDatum);
            nodeData.push({
                seriesDatum: { x: xDatum, y: yDatum },
                point: { x: x, y: y },
            });
        }
        return nodeData;
    };
    LineSparkline.prototype.updateSelection = function (selectionData) {
        this.markerSelection.update(selectionData);
    };
    LineSparkline.prototype.updateNodes = function () {
        var _this = this;
        var _a = this, highlightedDatum = _a.highlightedDatum, highlightStyle = _a.highlightStyle, marker = _a.marker;
        var highlightSize = highlightStyle.size, highlightFill = highlightStyle.fill, highlightStroke = highlightStyle.stroke, highlightStrokeWidth = highlightStyle.strokeWidth;
        var markerFormatter = marker.formatter;
        this.markerSelection.each(function (node, datum, index) {
            var highlighted = datum === highlightedDatum;
            var markerFill = highlighted && highlightFill !== undefined ? highlightFill : marker.fill;
            var markerStroke = highlighted && highlightStroke !== undefined ? highlightStroke : marker.stroke;
            var markerStrokeWidth = highlighted && highlightStrokeWidth !== undefined ? highlightStrokeWidth : marker.strokeWidth;
            var markerSize = highlighted && highlightSize !== undefined ? highlightSize : marker.size;
            var markerFormat;
            var seriesDatum = datum.seriesDatum, point = datum.point;
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
    LineSparkline.prototype.updateLine = function () {
        var _a = this, linePath = _a.linePath, yData = _a.yData, xData = _a.xData, xScale = _a.xScale, yScale = _a.yScale, line = _a.line;
        if (yData.length < 2) {
            return;
        }
        var continuous = !(xScale instanceof BandScale);
        var path = linePath.path;
        var n = yData.length;
        var offsetX = !continuous ? xScale.bandwidth / 2 : 0;
        var moveTo = true;
        path.clear();
        for (var i = 0; i < n; i++) {
            var xDatum = xData[i];
            var yDatum = yData[i];
            var x = xScale.convert(continuous ? xScale.toDomain(xDatum) : xDatum) + offsetX;
            var y = yDatum === undefined ? NaN : yScale.convert(yDatum);
            if (yDatum == undefined) {
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
        linePath.fill = undefined;
        linePath.stroke = line.stroke;
        linePath.strokeWidth = line.strokeWidth;
    };
    LineSparkline.prototype.updateXCrosshairLine = function () {
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
    LineSparkline.prototype.updateYCrosshairLine = function () {
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
    LineSparkline.prototype.getTooltipHtml = function (datum) {
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
    LineSparkline.className = 'LineSparkline';
    return LineSparkline;
}(Sparkline));
export { LineSparkline };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZVNwYXJrbGluZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9zcGFya2xpbmUvbGluZS9saW5lU3BhcmtsaW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUNBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRTVELE9BQU8sRUFBMEIsU0FBUyxFQUFFLFNBQVMsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUM1RSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDNUQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3BELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUUxQyxJQUFBLE1BQU0sR0FBSyxLQUFLLE9BQVYsQ0FBVztBQUNqQixJQUFBLFNBQVMsR0FBSyxNQUFNLFVBQVgsQ0FBWTtBQU03QjtJQUFBO1FBQ0ksWUFBTyxHQUFZLElBQUksQ0FBQztRQUN4QixVQUFLLEdBQVcsUUFBUSxDQUFDO1FBQ3pCLFNBQUksR0FBVyxDQUFDLENBQUM7UUFDakIsU0FBSSxHQUFZLG9CQUFvQixDQUFDO1FBQ3JDLFdBQU0sR0FBWSxvQkFBb0IsQ0FBQztRQUN2QyxnQkFBVyxHQUFXLENBQUMsQ0FBQztRQUN4QixjQUFTLEdBQXFELFNBQVMsQ0FBQztJQUM1RSxDQUFDO0lBQUQsc0JBQUM7QUFBRCxDQUFDLEFBUkQsSUFRQztBQUVEO0lBQUE7UUFDSSxXQUFNLEdBQVcsb0JBQW9CLENBQUM7UUFDdEMsZ0JBQVcsR0FBVyxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUFELG9CQUFDO0FBQUQsQ0FBQyxBQUhELElBR0M7QUFFRDtJQUFBO1FBQ0ksVUFBSyxHQUF5QjtZQUMxQixPQUFPLEVBQUUsSUFBSTtZQUNiLE1BQU0sRUFBRSxtQkFBbUI7WUFDM0IsV0FBVyxF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