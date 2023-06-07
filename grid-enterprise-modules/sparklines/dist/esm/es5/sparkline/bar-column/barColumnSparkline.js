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
import { _Scene, _Util } from 'ag-charts-community';
import { Sparkline, ZINDICIES } from '../sparkline';
import { toTooltipHtml } from '../tooltip/sparklineTooltip';
import { Label } from '../label/label';
var extent = _Util.extent;
var BarColumnNodeTag;
(function (BarColumnNodeTag) {
    BarColumnNodeTag[BarColumnNodeTag["Rect"] = 0] = "Rect";
    BarColumnNodeTag[BarColumnNodeTag["Label"] = 1] = "Label";
})(BarColumnNodeTag || (BarColumnNodeTag = {}));
export var BarColumnLabelPlacement;
(function (BarColumnLabelPlacement) {
    BarColumnLabelPlacement["InsideBase"] = "insideBase";
    BarColumnLabelPlacement["InsideEnd"] = "insideEnd";
    BarColumnLabelPlacement["Center"] = "center";
    BarColumnLabelPlacement["OutsideEnd"] = "outsideEnd";
})(BarColumnLabelPlacement || (BarColumnLabelPlacement = {}));
var BarColumnLabel = /** @class */ (function (_super) {
    __extends(BarColumnLabel, _super);
    function BarColumnLabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.formatter = undefined;
        _this.placement = BarColumnLabelPlacement.InsideEnd;
        return _this;
    }
    return BarColumnLabel;
}(Label));
export { BarColumnLabel };
var BarColumnSparkline = /** @class */ (function (_super) {
    __extends(BarColumnSparkline, _super);
    function BarColumnSparkline() {
        var _this = _super.call(this) || this;
        _this.fill = 'rgb(124, 181, 236)';
        _this.stroke = 'silver';
        _this.strokeWidth = 0;
        _this.paddingInner = 0.1;
        _this.paddingOuter = 0.2;
        _this.valueAxisDomain = undefined;
        _this.formatter = undefined;
        _this.axisLine = new _Scene.Line();
        _this.bandWidth = 0;
        _this.sparklineGroup = new _Scene.Group();
        _this.rectGroup = new _Scene.Group();
        _this.labelGroup = new _Scene.Group();
        _this.rectSelection = _Scene.Selection.select(_this.rectGroup, _Scene.Rect);
        _this.labelSelection = _Scene.Selection.select(_this.labelGroup, _Scene.Text);
        _this.nodeSelectionData = [];
        _this.label = new BarColumnLabel();
        _this.rootGroup.append(_this.sparklineGroup);
        _this.rectGroup.zIndex = ZINDICIES.SERIES_FILL_ZINDEX;
        _this.axisLine.zIndex = ZINDICIES.AXIS_LINE_ZINDEX;
        _this.labelGroup.zIndex = ZINDICIES.SERIES_LABEL_ZINDEX;
        _this.sparklineGroup.append([_this.rectGroup, _this.axisLine, _this.labelGroup]);
        _this.axisLine.lineCap = 'round';
        _this.label.enabled = false;
        return _this;
    }
    BarColumnSparkline.prototype.getNodeData = function () {
        return this.nodeSelectionData;
    };
    BarColumnSparkline.prototype.update = function () {
        this.updateSelections();
        this.updateNodes();
    };
    BarColumnSparkline.prototype.updateSelections = function () {
        var nodeData = this.generateNodeData();
        if (!nodeData) {
            return;
        }
        this.nodeSelectionData = nodeData;
        this.updateRectSelection(nodeData);
        this.updateLabelSelection(nodeData);
    };
    BarColumnSparkline.prototype.updateNodes = function () {
        this.updateRectNodes();
        this.updateLabelNodes();
    };
    BarColumnSparkline.prototype.calculateStep = function (range) {
        var _a;
        var _b = this, xScale = _b.xScale, paddingInner = _b.paddingInner, paddingOuter = _b.paddingOuter, smallestInterval = _b.smallestInterval;
        // calculate step
        var domainLength = xScale.domain[1] - xScale.domain[0];
        var intervals = domainLength / ((_a = smallestInterval === null || smallestInterval === void 0 ? void 0 : smallestInterval.x) !== null && _a !== void 0 ? _a : 1) + 1;
        // The number of intervals/bands is used to determine the width of individual bands by dividing the available range.
        // Allow a maximum of 50 bands to ensure the step (width of individual bands + padding) does not fall below a certain number of pixels.
        // If the number of intervals exceeds 50, calculate the step for 50 bands within the given range.
        // This means there could be some overlap of the bands in the sparkline.
        var maxBands = 50;
        var bands = Math.min(intervals, maxBands);
        var gaps = bands - 1; // number of gaps (padding between bands)
        var step = range / Math.max(1, 2 * paddingOuter + gaps * paddingInner + bands); // step width is a combination of band width and gap width
        return step;
    };
    BarColumnSparkline.prototype.updateYScaleDomain = function () {
        var _a = this, yScale = _a.yScale, yData = _a.yData, valueAxisDomain = _a.valueAxisDomain;
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
        if (valueAxisDomain) {
            if (valueAxisDomain[1] < yMax) {
                valueAxisDomain[1] = yMax;
            }
            if (valueAxisDomain[0] > yMin) {
                valueAxisDomain[0] = yMin;
            }
        }
        yScale.domain = valueAxisDomain ? valueAxisDomain : [yMin, yMax];
    };
    BarColumnSparkline.prototype.updateRectSelection = function (selectionData) {
        this.rectSelection.update(selectionData);
    };
    BarColumnSparkline.prototype.updateRectNodes = function () {
        var _this = this;
        var _a = this, highlightedDatum = _a.highlightedDatum, nodeFormatter = _a.formatter, fill = _a.fill, stroke = _a.stroke, strokeWidth = _a.strokeWidth;
        var _b = this.highlightStyle, highlightFill = _b.fill, highlightStroke = _b.stroke, highlightStrokeWidth = _b.strokeWidth;
        this.rectSelection.each(function (node, datum, index) {
            var highlighted = datum === highlightedDatum;
            var nodeFill = highlighted && highlightFill !== undefined ? highlightFill : fill;
            var nodeStroke = highlighted && highlightStroke !== undefined ? highlightStroke : stroke;
            var nodeStrokeWidth = highlighted && highlightStrokeWidth !== undefined ? highlightStrokeWidth : strokeWidth;
            var nodeFormat;
            var x = datum.x, y = datum.y, width = datum.width, height = datum.height, seriesDatum = datum.seriesDatum;
            if (nodeFormatter) {
                var first = index === 0;
                var last = index === _this.nodeSelectionData.length - 1;
                var min = seriesDatum.y === _this.min;
                var max = seriesDatum.y === _this.max;
                nodeFormat = nodeFormatter({
                    datum: datum,
                    xValue: seriesDatum.x,
                    yValue: seriesDatum.y,
                    width: width,
                    height: height,
                    min: min,
                    max: max,
                    first: first,
                    last: last,
                    fill: nodeFill,
                    stroke: nodeStroke,
                    strokeWidth: nodeStrokeWidth,
                    highlighted: highlighted,
                });
            }
            node.fill = (nodeFormat && nodeFormat.fill) || nodeFill;
            node.stroke = (nodeFormat && nodeFormat.stroke) || nodeStroke;
            node.strokeWidth = (nodeFormat && nodeFormat.strokeWidth) || nodeStrokeWidth;
            node.x = node.y = 0;
            node.width = width;
            node.height = height;
            node.visible = node.height > 0;
            node.translationX = x;
            node.translationY = y;
            // shifts bars upwards?
            // node.crisp = true;
        });
    };
    BarColumnSparkline.prototype.updateLabelSelection = function (selectionData) {
        this.labelSelection.update(selectionData, function (text) {
            text.tag = BarColumnNodeTag.Label;
            text.pointerEvents = _Scene.PointerEvents.None;
        });
    };
    BarColumnSparkline.prototype.updateLabelNodes = function () {
        var _a = this.label, labelEnabled = _a.enabled, fontStyle = _a.fontStyle, fontWeight = _a.fontWeight, fontSize = _a.fontSize, fontFamily = _a.fontFamily, color = _a.color;
        this.labelSelection.each(function (text, datum) {
            var label = datum.label;
            if (label && labelEnabled) {
                text.fontStyle = fontStyle;
                text.fontWeight = fontWeight;
                text.fontSize = fontSize;
                text.fontFamily = fontFamily;
                text.textAlign = label.textAlign;
                text.textBaseline = label.textBaseline;
                text.text = label.text;
                text.x = label.x;
                text.y = label.y;
                text.fill = color;
                text.visible = true;
            }
            else {
                text.visible = false;
            }
        });
    };
    BarColumnSparkline.prototype.getTooltipHtml = function (datum) {
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
    BarColumnSparkline.prototype.formatLabelValue = function (value) {
        return value % 1 !== 0 ? value.toFixed(1) : value.toFixed(0);
    };
    return BarColumnSparkline;
}(Sparkline));
export { BarColumnSparkline };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFyQ29sdW1uU3BhcmtsaW5lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3NwYXJrbGluZS9iYXItY29sdW1uL2JhckNvbHVtblNwYXJrbGluZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFDQSxPQUFPLEVBQXlCLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUUzRSxPQUFPLEVBQW1CLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDckUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzVELE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUUvQixJQUFBLE1BQU0sR0FBSyxLQUFLLE9BQVYsQ0FBVztBQXdCekIsSUFBSyxnQkFHSjtBQUhELFdBQUssZ0JBQWdCO0lBQ2pCLHVEQUFJLENBQUE7SUFDSix5REFBSyxDQUFBO0FBQ1QsQ0FBQyxFQUhJLGdCQUFnQixLQUFoQixnQkFBZ0IsUUFHcEI7QUFFRCxNQUFNLENBQU4sSUFBWSx1QkFLWDtBQUxELFdBQVksdUJBQXVCO0lBQy9CLG9EQUF5QixDQUFBO0lBQ3pCLGtEQUF1QixDQUFBO0lBQ3ZCLDRDQUFpQixDQUFBO0lBQ2pCLG9EQUF5QixDQUFBO0FBQzdCLENBQUMsRUFMVyx1QkFBdUIsS0FBdkIsdUJBQXVCLFFBS2xDO0FBRUQ7SUFBb0Msa0NBQUs7SUFBekM7UUFBQSxxRUFHQztRQUZHLGVBQVMsR0FBdUQsU0FBUyxDQUFDO1FBQzFFLGVBQVMsR0FBRyx1QkFBdUIsQ0FBQyxTQUFTLENBQUM7O0lBQ2xELENBQUM7SUFBRCxxQkFBQztBQUFELENBQUMsQUFIRCxDQUFvQyxLQUFLLEdBR3hDOztBQUVEO0lBQWlELHNDQUFTO0lBNkJ0RDtRQUFBLFlBQ0ksaUJBQU8sU0FhVjtRQTFDRCxVQUFJLEdBQVcsb0JBQW9CLENBQUM7UUFDcEMs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