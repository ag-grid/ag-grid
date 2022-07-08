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
Object.defineProperty(exports, "__esModule", { value: true });
var sparkline_1 = require("../sparkline");
var group_1 = require("../../scene/group");
var line_1 = require("../../scene/shape/line");
var selection_1 = require("../../scene/selection");
var sparklineTooltip_1 = require("../tooltip/sparklineTooltip");
var rectangle_1 = require("./rectangle");
var array_1 = require("../../util/array");
var value_1 = require("../../util/value");
var label_1 = require("../label/label");
var text_1 = require("../label/text");
var node_1 = require("../../scene/node");
var BarColumnNodeTag;
(function (BarColumnNodeTag) {
    BarColumnNodeTag[BarColumnNodeTag["Rect"] = 0] = "Rect";
    BarColumnNodeTag[BarColumnNodeTag["Label"] = 1] = "Label";
})(BarColumnNodeTag || (BarColumnNodeTag = {}));
var BarColumnLabelPlacement;
(function (BarColumnLabelPlacement) {
    BarColumnLabelPlacement["InsideBase"] = "insideBase";
    BarColumnLabelPlacement["InsideEnd"] = "insideEnd";
    BarColumnLabelPlacement["Center"] = "center";
    BarColumnLabelPlacement["OutsideEnd"] = "outsideEnd";
})(BarColumnLabelPlacement = exports.BarColumnLabelPlacement || (exports.BarColumnLabelPlacement = {}));
var BarColumnLabel = /** @class */ (function (_super) {
    __extends(BarColumnLabel, _super);
    function BarColumnLabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.formatter = undefined;
        _this.placement = BarColumnLabelPlacement.InsideEnd;
        return _this;
    }
    return BarColumnLabel;
}(label_1.Label));
exports.BarColumnLabel = BarColumnLabel;
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
        _this.axisLine = new line_1.Line();
        _this.bandWidth = 0;
        _this.sparklineGroup = new group_1.Group();
        _this.rectGroup = new group_1.Group();
        _this.labelGroup = new group_1.Group();
        _this.rectSelection = selection_1.Selection.select(_this.rectGroup).selectAll();
        _this.labelSelection = selection_1.Selection.select(_this.labelGroup).selectAll();
        _this.nodeSelectionData = [];
        _this.label = new BarColumnLabel();
        _this.rootGroup.append(_this.sparklineGroup);
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
        var _a, _b;
        var _c = this, xScale = _c.xScale, paddingInner = _c.paddingInner, paddingOuter = _c.paddingOuter, smallestInterval = _c.smallestInterval;
        // calculate step
        var domainLength = xScale.domain[1] - xScale.domain[0];
        var intervals = (domainLength / (_b = (_a = smallestInterval) === null || _a === void 0 ? void 0 : _a.x, (_b !== null && _b !== void 0 ? _b : 1))) + 1;
        // The number of intervals/bands is used to determine the width of individual bands by dividing the available range.
        // Allow a maximum of 50 bands to ensure the step (width of individual bands + padding) does not fall below a certain number of pixels.
        // If the number of intervals exceeds 50, calculate the step for 50 bands within the given range.
        // This means there could be some overlap of the bands in the sparkline.
        var maxBands = 50;
        var bands = Math.min(intervals, maxBands);
        var gaps = bands - 1; // number of gaps (padding between bands)
        var step = range / Math.max(1, (2 * paddingOuter) + (gaps * paddingInner) + bands); // step width is a combination of band width and gap width
        return step;
    };
    BarColumnSparkline.prototype.updateYScaleDomain = function () {
        var _a = this, yScale = _a.yScale, yData = _a.yData, valueAxisDomain = _a.valueAxisDomain;
        var yMinMax = array_1.extent(yData, value_1.isNumber);
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
        var updateRectSelection = this.rectSelection.setData(selectionData);
        var enterRectSelection = updateRectSelection.enter.append(rectangle_1.Rectangle);
        updateRectSelection.exit.remove();
        this.rectSelection = updateRectSelection.merge(enterRectSelection);
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
        var updateLabels = this.labelSelection.setData(selectionData);
        var enterLabels = updateLabels.enter.append(text_1.Text).each(function (text) {
            (text.tag = BarColumnNodeTag.Label), (text.pointerEvents = node_1.PointerEvents.None);
        });
        updateLabels.exit.remove();
        this.labelSelection = updateLabels.merge(enterLabels);
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
        if (this.tooltip.renderer) {
            return sparklineTooltip_1.toTooltipHtml(this.tooltip.renderer({
                context: this.context,
                datum: seriesDatum,
                yValue: yValue,
                xValue: xValue,
            }), defaults);
        }
        return sparklineTooltip_1.toTooltipHtml(defaults);
    };
    BarColumnSparkline.prototype.formatLabelValue = function (value) {
        return value % 1 !== 0 ? value.toFixed(1) : value.toFixed(0);
    };
    return BarColumnSparkline;
}(sparkline_1.Sparkline));
exports.BarColumnSparkline = BarColumnSparkline;
