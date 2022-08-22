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
Object.defineProperty(exports, "__esModule", { value: true });
var selection_1 = require("../../../scene/selection");
var hdpiCanvas_1 = require("../../../canvas/hdpiCanvas");
var label_1 = require("../../label");
var series_1 = require("../series");
var hierarchySeries_1 = require("./hierarchySeries");
var chart_1 = require("../../chart");
var group_1 = require("../../../scene/group");
var text_1 = require("../../../scene/shape/text");
var rect_1 = require("../../../scene/shape/rect");
var dropShadow_1 = require("../../../scene/dropShadow");
var linearScale_1 = require("../../../scale/linearScale");
var treemap_1 = require("../../../layout/treemap");
var hierarchy_1 = require("../../../layout/hierarchy");
var number_1 = require("../../../util/number");
var path2D_1 = require("../../../scene/path2D");
var TreemapSeriesTooltip = /** @class */ (function (_super) {
    __extends(TreemapSeriesTooltip, _super);
    function TreemapSeriesTooltip() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.renderer = undefined;
        return _this;
    }
    return TreemapSeriesTooltip;
}(series_1.SeriesTooltip));
exports.TreemapSeriesTooltip = TreemapSeriesTooltip;
var TreemapSeriesLabel = /** @class */ (function (_super) {
    __extends(TreemapSeriesLabel, _super);
    function TreemapSeriesLabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.padding = 10;
        return _this;
    }
    return TreemapSeriesLabel;
}(label_1.Label));
exports.TreemapSeriesLabel = TreemapSeriesLabel;
var TextNodeTag;
(function (TextNodeTag) {
    TextNodeTag[TextNodeTag["Name"] = 0] = "Name";
    TextNodeTag[TextNodeTag["Value"] = 1] = "Value";
})(TextNodeTag || (TextNodeTag = {}));
var TreemapSeries = /** @class */ (function (_super) {
    __extends(TreemapSeries, _super);
    function TreemapSeries() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.groupSelection = selection_1.Selection.select(_this.pickGroup).selectAll();
        _this.highlightSelection = selection_1.Selection.select(_this.highlightGroup).selectAll();
        _this.layout = new treemap_1.Treemap();
        _this.title = (function () {
            var label = new TreemapSeriesLabel();
            label.color = 'white';
            label.fontWeight = 'bold';
            label.fontSize = 12;
            label.fontFamily = 'Verdana, sans-serif';
            label.padding = 15;
            return label;
        })();
        _this.subtitle = (function () {
            var label = new TreemapSeriesLabel();
            label.color = 'white';
            label.fontSize = 9;
            label.fontFamily = 'Verdana, sans-serif';
            label.padding = 13;
            return label;
        })();
        _this.labels = {
            large: (function () {
                var label = new label_1.Label();
                label.color = 'white';
                label.fontWeight = 'bold';
                label.fontSize = 18;
                return label;
            })(),
            medium: (function () {
                var label = new label_1.Label();
                label.color = 'white';
                label.fontWeight = 'bold';
                label.fontSize = 14;
                return label;
            })(),
            small: (function () {
                var label = new label_1.Label();
                label.color = 'white';
                label.fontWeight = 'bold';
                label.fontSize = 10;
                return label;
            })(),
            color: (function () {
                var label = new label_1.Label();
                label.color = 'white';
                return label;
            })(),
        };
        _this._nodePadding = 2;
        _this.labelKey = 'label';
        _this.sizeKey = 'size';
        _this.colorKey = 'color';
        _this.colorDomain = [-5, 5];
        _this.colorRange = ['#cb4b3f', '#6acb64'];
        _this.colorParents = false;
        _this.gradient = true;
        _this.colorName = 'Change';
        _this.rootName = 'Root';
        _this.shadow = (function () {
            var shadow = new dropShadow_1.DropShadow();
            shadow.color = 'rgba(0, 0, 0, 0.4)';
            shadow.xOffset = 1.5;
            shadow.yOffset = 1.5;
            return shadow;
        })();
        _this.tooltip = new TreemapSeriesTooltip();
        return _this;
    }
    Object.defineProperty(TreemapSeries.prototype, "nodePadding", {
        get: function () {
            return this._nodePadding;
        },
        set: function (value) {
            if (this._nodePadding !== value) {
                this._nodePadding = value;
                this.updateLayoutPadding();
            }
        },
        enumerable: true,
        configurable: true
    });
    TreemapSeries.prototype.updateLayoutPadding = function () {
        var _a = this, title = _a.title, subtitle = _a.subtitle, nodePadding = _a.nodePadding, labelKey = _a.labelKey;
        this.layout.paddingRight = function (_) { return nodePadding; };
        this.layout.paddingBottom = function (_) { return nodePadding; };
        this.layout.paddingLeft = function (_) { return nodePadding; };
        this.layout.paddingTop = function (node) {
            var name = node.datum[labelKey] || '';
            if (node.children) {
                name = name.toUpperCase();
            }
            var font = node.depth > 1 ? subtitle : title;
            var textSize = hdpiCanvas_1.HdpiCanvas.getTextSize(name, [font.fontWeight, font.fontSize + 'px', font.fontFamily].join(' ').trim());
            var innerNodeWidth = node.x1 - node.x0 - nodePadding * 2;
            var hasTitle = node.depth > 0 && node.children && textSize.width <= innerNodeWidth;
            node.hasTitle = !!hasTitle;
            return hasTitle ? textSize.height + nodePadding * 2 : nodePadding;
        };
    };
    TreemapSeries.prototype.processData = function () {
        if (!this.data) {
            return false;
        }
        var _a = this, data = _a.data, sizeKey = _a.sizeKey, labelKey = _a.labelKey, colorKey = _a.colorKey, colorDomain = _a.colorDomain, colorRange = _a.colorRange, colorParents = _a.colorParents;
        var dataRoot;
        if (sizeKey) {
            dataRoot = hierarchy_1.hierarchy(data).sum(function (datum) { return (datum.children ? 1 : datum[sizeKey]); });
        }
        else {
            dataRoot = hierarchy_1.hierarchy(data).sum(function (datum) { return (datum.children ? 0 : 1); });
        }
        this.dataRoot = dataRoot;
        var colorScale = new linearScale_1.LinearScale();
        colorScale.domain = colorDomain;
        colorScale.range = colorRange;
        var series = this;
        function traverse(root, depth) {
            if (depth === void 0) { depth = 0; }
            var children = root.children, datum = root.datum;
            var label = datum[labelKey];
            var colorValue = colorKey ? datum[colorKey] : depth;
            Object.assign(root, { series: series });
            root.fill = !children || colorParents ? colorScale.convert(colorValue) : '#272931';
            root.colorValue = colorValue;
            if (label) {
                root.label = children ? label.toUpperCase() : label;
            }
            else {
                root.label = '';
            }
            if (children) {
                children.forEach(function (child) { return traverse(child, depth + 1); });
            }
        }
        traverse(this.dataRoot);
        return true;
    };
    TreemapSeries.prototype.getLabelCenterX = function (datum) {
        return (datum.x0 + datum.x1) / 2;
    };
    TreemapSeries.prototype.getLabelCenterY = function (datum) {
        return (datum.y0 + datum.y1) / 2 + 2;
    };
    TreemapSeries.prototype.createNodeData = function () {
        return [];
    };
    TreemapSeries.prototype.update = function () {
        this.updateSelections();
        this.updateNodes();
    };
    TreemapSeries.prototype.updateSelections = function () {
        if (!this.nodeDataRefresh) {
            return;
        }
        this.nodeDataRefresh = false;
        var _a = this, chart = _a.chart, dataRoot = _a.dataRoot;
        if (!chart || !dataRoot) {
            return;
        }
        var seriesRect = chart.getSeriesRect();
        if (!seriesRect) {
            return;
        }
        this.layout.size = [seriesRect.width, seriesRect.height];
        this.updateLayoutPadding();
        var descendants = this.layout.processData(dataRoot).descendants();
        var _b = this, groupSelection = _b.groupSelection, highlightSelection = _b.highlightSelection;
        var update = function (selection) {
            var updateGroups = selection.setData(descendants);
            updateGroups.exit.remove();
            var enterGroups = updateGroups.enter.append(group_1.Group);
            enterGroups.append(rect_1.Rect);
            enterGroups.append(text_1.Text).each(function (node) { return (node.tag = TextNodeTag.Name); });
            enterGroups.append(text_1.Text).each(function (node) { return (node.tag = TextNodeTag.Value); });
            return updateGroups.merge(enterGroups);
        };
        this.groupSelection = update(groupSelection);
        this.highlightSelection = update(highlightSelection);
    };
    TreemapSeries.prototype.updateNodes = function () {
        var _this = this;
        if (!this.chart) {
            return;
        }
        var _a = this, nodePadding = _a.nodePadding, labels = _a.labels, shadow = _a.shadow, gradient = _a.gradient, highlightedDatum = _a.chart.highlightedDatum, _b = _a.highlightStyle, deprecatedFill = _b.fill, deprecatedStroke = _b.stroke, deprecatedStrokeWidth = _b.strokeWidth, _c = _b.item, _d = _c.fill, highlightedFill = _d === void 0 ? deprecatedFill : _d, highlightedFillOpacity = _c.fillOpacity, _e = _c.stroke, highlightedStroke = _e === void 0 ? deprecatedStroke : _e, _f = _c.strokeWidth, highlightedDatumStrokeWidth = _f === void 0 ? deprecatedStrokeWidth : _f;
        var labelMeta = this.buildLabelMeta(this.groupSelection.data);
        var updateRectFn = function (rect, datum, isDatumHighlighted) {
            var _a;
            var fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : datum.fill;
            var fillOpacity = (_a = (isDatumHighlighted ? highlightedFillOpacity : 1), (_a !== null && _a !== void 0 ? _a : 1));
            var stroke = isDatumHighlighted && highlightedStroke !== undefined
                ? highlightedStroke
                : datum.depth < 2
                    ? undefined
                    : 'black';
            var strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined ? highlightedDatumStrokeWidth : 1;
            rect.fill = fill;
            rect.fillOpacity = fillOpacity;
            rect.stroke = stroke;
            rect.strokeWidth = strokeWidth;
            rect.crisp = true;
            rect.gradient = gradient;
            rect.x = datum.x0;
            rect.y = datum.y0;
            rect.width = datum.x1 - datum.x0;
            rect.height = datum.y1 - datum.y0;
            if (isDatumHighlighted && datum.children) {
                var x0 = datum.x0, x1 = datum.x1, y0 = datum.y0, y1 = datum.y1;
                var pLeft = _this.layout.paddingLeft(datum);
                var pRight = _this.layout.paddingRight(datum);
                var pTop = _this.layout.paddingTop(datum);
                var pBottom = _this.layout.paddingBottom(datum);
                if (rect.clipPath) {
                    rect.clipPath.clear();
                }
                else {
                    rect.clipPath = new path2D_1.Path2D();
                }
                rect.clipMode = 'punch-out';
                rect.clipPath.moveTo(x0 + pLeft, y0 + pTop);
                rect.clipPath.lineTo(x1 - pRight, y0 + pTop);
                rect.clipPath.lineTo(x1 - pRight, y1 - pBottom);
                rect.clipPath.lineTo(x0 + pLeft, y1 - pBottom);
                rect.clipPath.lineTo(x0 + pLeft, y0 + pTop);
                rect.clipPath.closePath();
            }
        };
        this.groupSelection.selectByClass(rect_1.Rect).each(function (rect, datum) { return updateRectFn(rect, datum, false); });
        this.highlightSelection.selectByClass(rect_1.Rect).each(function (rect, datum) {
            var isDatumHighlighted = datum === highlightedDatum;
            rect.visible = isDatumHighlighted;
            if (rect.visible) {
                updateRectFn(rect, datum, isDatumHighlighted);
            }
        });
        var updateNodeFn = function (text, datum, index, highlighted) {
            var _a;
            var hasTitle = datum.hasTitle;
            var _b = (_a = labelMeta[index], (_a !== null && _a !== void 0 ? _a : {})), label = _b.label, textBaseline = _b.nodeBaseline;
            if (label != null && textBaseline != null) {
                text.textBaseline = textBaseline;
                text.fontWeight = label.fontWeight;
                text.fontSize = label.fontSize;
                text.fontFamily = label.fontFamily;
                text.textAlign = hasTitle ? 'left' : 'center';
                text.text = datum.label;
                text.fill = highlighted ? 'black' : label.color;
                text.fillShadow = !highlighted ? shadow : undefined;
                text.visible = true;
            }
            else {
                text.visible = false;
            }
            if (hasTitle) {
                text.x = datum.x0 + nodePadding;
                text.y = datum.y0 + nodePadding;
            }
            else {
                text.x = _this.getLabelCenterX(datum);
                text.y = _this.getLabelCenterY(datum);
            }
        };
        this.groupSelection
            .selectByTag(TextNodeTag.Name)
            .each(function (text, datum, index) { return updateNodeFn(text, datum, index, false); });
        this.highlightSelection.selectByTag(TextNodeTag.Name).each(function (text, datum, index) {
            var isDatumHighlighted = datum === highlightedDatum;
            text.visible = isDatumHighlighted;
            if (text.visible) {
                updateNodeFn(text, datum, index, isDatumHighlighted);
            }
        });
        var updateValueFn = function (text, datum, index, highlighted) {
            var _a;
            var _b = (_a = labelMeta[index], (_a !== null && _a !== void 0 ? _a : {})), textBaseline = _b.valueBaseline, valueText = _b.valueText;
            var label = labels.color;
            if (label.enabled && textBaseline != null && valueText) {
                text.fontSize = label.fontSize;
                text.fontFamily = label.fontFamily;
                text.fontStyle = label.fontStyle;
                text.fontWeight = label.fontWeight;
                text.textBaseline = textBaseline;
                text.textAlign = 'center';
                text.text = valueText;
                text.fill = highlighted ? 'black' : label.color;
                text.fillShadow = highlighted ? undefined : shadow;
                text.visible = true;
                text.x = _this.getLabelCenterX(datum);
                text.y = _this.getLabelCenterY(datum);
            }
            else {
                text.visible = false;
            }
        };
        this.groupSelection
            .selectByTag(TextNodeTag.Value)
            .each(function (text, datum, index) { return updateValueFn(text, datum, index, false); });
        this.highlightSelection.selectByTag(TextNodeTag.Value).each(function (text, datum, index) {
            var isDatumHighlighted = datum === highlightedDatum;
            text.visible = isDatumHighlighted;
            if (text.visible) {
                updateValueFn(text, datum, index, isDatumHighlighted);
            }
        });
    };
    TreemapSeries.prototype.buildLabelMeta = function (data) {
        var e_1, _a;
        var _b = this, labels = _b.labels, title = _b.title, subtitle = _b.subtitle, nodePadding = _b.nodePadding, colorKey = _b.colorKey;
        var labelMeta = [];
        labelMeta.length = this.groupSelection.data.length;
        var text = new text_1.Text();
        var index = 0;
        try {
            for (var data_1 = __values(data), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
                var datum = data_1_1.value;
                var value = datum.value;
                var isLeaf = !datum.children;
                var innerNodeWidth = datum.x1 - datum.x0 - nodePadding * 2;
                var innerNodeHeight = datum.y1 - datum.y0 - nodePadding * 2;
                var hasTitle = datum.hasTitle;
                var label = void 0;
                if (isLeaf) {
                    if (innerNodeWidth > 40 && innerNodeHeight > 40) {
                        label = labels.large;
                    }
                    else if (innerNodeWidth > 20 && innerNodeHeight > 20) {
                        label = labels.medium;
                    }
                    else {
                        label = labels.small;
                    }
                }
                else if (datum.depth > 1) {
                    label = subtitle;
                }
                else {
                    label = title;
                }
                if (!label.enabled) {
                    labelMeta[index++] = undefined;
                    continue;
                }
                text.fontWeight = label.fontWeight;
                text.fontSize = label.fontSize;
                text.fontFamily = label.fontFamily;
                text.textAlign = hasTitle ? 'left' : 'center';
                text.text = datum.label;
                var nodeBBox = text.computeBBox();
                var hasNode = isLeaf && !!nodeBBox && nodeBBox.width <= innerNodeWidth && nodeBBox.height * 2 + 8 <= innerNodeHeight;
                var valueText = typeof value === 'number' && isFinite(value) ? String(number_1.toFixed(datum.colorValue)) + '%' : '';
                text.fontSize = labels.color.fontSize;
                text.fontFamily = labels.color.fontFamily;
                text.fontStyle = labels.color.fontStyle;
                text.fontWeight = labels.color.fontWeight;
                text.text = valueText;
                var valueBBox = text.computeBBox();
                var hasValue = isLeaf && !!colorKey && hasNode && !!valueBBox && valueBBox.width < innerNodeWidth;
                var nodeBaseline = hasValue ? 'bottom' : isLeaf ? 'middle' : hasTitle ? 'top' : 'middle';
                labelMeta[index++] = {
                    label: label,
                    nodeBaseline: hasTitle || hasNode ? nodeBaseline : undefined,
                    valueBaseline: hasValue ? 'top' : undefined,
                    valueText: valueText,
                };
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (data_1_1 && !data_1_1.done && (_a = data_1.return)) _a.call(data_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return labelMeta;
    };
    TreemapSeries.prototype.getDomain = function (_direction) {
        return [0, 1];
    };
    TreemapSeries.prototype.fireNodeClickEvent = function (event, datum) {
        this.fireEvent({
            type: 'nodeClick',
            event: event,
            series: this,
            datum: datum.datum,
            labelKey: this.labelKey,
            sizeKey: this.sizeKey,
            colorKey: this.colorKey,
        });
    };
    TreemapSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var _a = this, tooltip = _a.tooltip, sizeKey = _a.sizeKey, labelKey = _a.labelKey, colorKey = _a.colorKey, colorName = _a.colorName, rootName = _a.rootName;
        var datum = nodeDatum.datum;
        var tooltipRenderer = tooltip.renderer;
        var title = nodeDatum.depth ? datum[labelKey] : rootName || datum[labelKey];
        var content = undefined;
        var color = nodeDatum.fill || 'gray';
        if (colorKey && colorName) {
            var colorValue = datum[colorKey];
            if (typeof colorValue === 'number' && isFinite(colorValue)) {
                content = "<b>" + colorName + "</b>: " + number_1.toFixed(datum[colorKey]);
            }
        }
        var defaults = {
            title: title,
            backgroundColor: color,
            content: content,
        };
        if (tooltipRenderer) {
            return chart_1.toTooltipHtml(tooltipRenderer({
                datum: nodeDatum,
                sizeKey: sizeKey,
                labelKey: labelKey,
                colorKey: colorKey,
                title: title,
                color: color,
            }), defaults);
        }
        return chart_1.toTooltipHtml(defaults);
    };
    TreemapSeries.prototype.listSeriesItems = function (_legendData) {
        // Override point for subclasses.
    };
    TreemapSeries.className = 'TreemapSeries';
    TreemapSeries.type = 'treemap';
    return TreemapSeries;
}(hierarchySeries_1.HierarchySeries));
exports.TreemapSeries = TreemapSeries;
