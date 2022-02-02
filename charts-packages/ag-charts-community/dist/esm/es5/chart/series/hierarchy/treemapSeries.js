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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Selection } from "../../../scene/selection";
import { HdpiCanvas } from "../../../canvas/hdpiCanvas";
import { reactive } from "../../../util/observable";
import { Label } from "../../label";
import { SeriesTooltip } from "../series";
import { HierarchySeries } from "./hierarchySeries";
import { toTooltipHtml } from "../../chart";
import { Group } from "../../../scene/group";
import { Text } from "../../../scene/shape/text";
import { Rect } from "../../../scene/shape/rect";
import { DropShadow } from "../../../scene/dropShadow";
import { LinearScale } from "../../../scale/linearScale";
import { Treemap } from "../../../layout/treemap";
import { hierarchy } from "../../../layout/hierarchy";
import { toFixed } from "../../../util/number";
var TreemapSeriesTooltip = /** @class */ (function (_super) {
    __extends(TreemapSeriesTooltip, _super);
    function TreemapSeriesTooltip() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        reactive('change')
    ], TreemapSeriesTooltip.prototype, "renderer", void 0);
    return TreemapSeriesTooltip;
}(SeriesTooltip));
export { TreemapSeriesTooltip };
var TreemapSeriesLabel = /** @class */ (function (_super) {
    __extends(TreemapSeriesLabel, _super);
    function TreemapSeriesLabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.padding = 10;
        return _this;
    }
    __decorate([
        reactive('change')
    ], TreemapSeriesLabel.prototype, "padding", void 0);
    return TreemapSeriesLabel;
}(Label));
export { TreemapSeriesLabel };
var TextNodeTag;
(function (TextNodeTag) {
    TextNodeTag[TextNodeTag["Name"] = 0] = "Name";
    TextNodeTag[TextNodeTag["Value"] = 1] = "Value";
})(TextNodeTag || (TextNodeTag = {}));
var TreemapSeries = /** @class */ (function (_super) {
    __extends(TreemapSeries, _super);
    function TreemapSeries() {
        var _this = _super.call(this) || this;
        _this.groupSelection = Selection.select(_this.pickGroup).selectAll();
        _this.labelMap = new Map();
        _this.layout = new Treemap();
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
                var label = new Label();
                label.color = 'white';
                label.fontWeight = 'bold';
                label.fontSize = 18;
                return label;
            })(),
            medium: (function () {
                var label = new Label();
                label.color = 'white';
                label.fontWeight = 'bold';
                label.fontSize = 14;
                return label;
            })(),
            small: (function () {
                var label = new Label();
                label.color = 'white';
                label.fontWeight = 'bold';
                label.fontSize = 10;
                return label;
            })(),
            color: (function () {
                var label = new Label();
                label.color = 'white';
                return label;
            })()
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
        _this._shadow = (function () {
            var shadow = new DropShadow();
            shadow.color = 'rgba(0, 0, 0, 0.4)';
            shadow.xOffset = 1.5;
            shadow.yOffset = 1.5;
            return shadow;
        })();
        _this.tooltip = new TreemapSeriesTooltip();
        _this.shadow.addEventListener('change', _this.scheduleUpdate, _this);
        _this.title.addEventListener('change', _this.scheduleUpdate, _this);
        _this.subtitle.addEventListener('change', _this.scheduleUpdate, _this);
        _this.labels.small.addEventListener('change', _this.scheduleUpdate, _this);
        _this.labels.medium.addEventListener('change', _this.scheduleUpdate, _this);
        _this.labels.large.addEventListener('change', _this.scheduleUpdate, _this);
        _this.labels.color.addEventListener('change', _this.scheduleUpdate, _this);
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
                this.scheduleUpdate();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreemapSeries.prototype, "shadow", {
        get: function () {
            return this._shadow;
        },
        set: function (value) {
            if (this._shadow !== value) {
                this._shadow = value;
                this.scheduleUpdate();
            }
        },
        enumerable: true,
        configurable: true
    });
    TreemapSeries.prototype.onHighlightChange = function () {
        this.updateNodes();
    };
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
            var textSize = HdpiCanvas.getTextSize(name, [font.fontWeight, font.fontSize + 'px', font.fontFamily].join(' ').trim());
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
            dataRoot = hierarchy(data).sum(function (datum) { return datum.children ? 1 : datum[sizeKey]; });
        }
        else {
            dataRoot = hierarchy(data).sum(function (datum) { return datum.children ? 0 : 1; });
        }
        this.dataRoot = dataRoot;
        var colorScale = new LinearScale();
        colorScale.domain = colorDomain;
        colorScale.range = colorRange;
        var series = this;
        function traverse(root, depth) {
            if (depth === void 0) { depth = 0; }
            var children = root.children, datum = root.datum;
            var label = datum[labelKey];
            var colorValue = colorKey ? datum[colorKey] : depth;
            root.series = series;
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
    TreemapSeries.prototype.update = function () {
        this.updatePending = false;
        this.updateSelections();
        this.updateNodes();
    };
    TreemapSeries.prototype.updateSelections = function () {
        if (!this.nodeDataPending) {
            return;
        }
        this.nodeDataPending = false;
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
        var updateGroups = this.groupSelection.setData(descendants);
        updateGroups.exit.remove();
        var enterGroups = updateGroups.enter.append(Group);
        enterGroups.append(Rect);
        enterGroups.append(Text).each(function (node) { return node.tag = TextNodeTag.Name; });
        enterGroups.append(Text).each(function (node) { return node.tag = TextNodeTag.Value; });
        this.groupSelection = updateGroups.merge(enterGroups);
    };
    TreemapSeries.prototype.updateNodes = function () {
        var _this = this;
        if (!this.chart) {
            return;
        }
        var _a = this, colorKey = _a.colorKey, labelMap = _a.labelMap, nodePadding = _a.nodePadding, title = _a.title, subtitle = _a.subtitle, labels = _a.labels, shadow = _a.shadow, gradient = _a.gradient, highlightedDatum = _a.chart.highlightedDatum, _b = _a.highlightStyle, deprecatedFill = _b.fill, deprecatedStroke = _b.stroke, deprecatedStrokeWidth = _b.strokeWidth, _c = _b.item, _d = _c.fill, highlightedFill = _d === void 0 ? deprecatedFill : _d, _e = _c.stroke, highlightedStroke = _e === void 0 ? deprecatedStroke : _e, _f = _c.strokeWidth, highlightedDatumStrokeWidth = _f === void 0 ? deprecatedStrokeWidth : _f;
        this.groupSelection.selectByClass(Rect).each(function (rect, datum) {
            var isDatumHighlighted = datum === highlightedDatum;
            var fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : datum.fill;
            var stroke = isDatumHighlighted && highlightedStroke !== undefined ? highlightedStroke : datum.depth < 2 ? undefined : 'black';
            var strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                ? highlightedDatumStrokeWidth
                : _this.getStrokeWidth(1, datum);
            rect.fill = fill;
            rect.stroke = stroke;
            rect.strokeWidth = strokeWidth;
            rect.crisp = true;
            rect.gradient = gradient;
            rect.x = datum.x0;
            rect.y = datum.y0;
            rect.width = datum.x1 - datum.x0;
            rect.height = datum.y1 - datum.y0;
        });
        this.groupSelection.selectByTag(TextNodeTag.Name).each(function (text, datum, index) {
            var isLeaf = !datum.children;
            var innerNodeWidth = datum.x1 - datum.x0 - nodePadding * 2;
            var innerNodeHeight = datum.y1 - datum.y0 - nodePadding * 2;
            var hasTitle = datum.hasTitle;
            var highlighted = datum === highlightedDatum;
            var label;
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
            else {
                if (datum.depth > 1) {
                    label = subtitle;
                }
                else {
                    label = title;
                }
            }
            text.fontWeight = label.fontWeight;
            text.fontSize = label.fontSize;
            text.fontFamily = label.fontFamily;
            text.textBaseline = isLeaf ? 'bottom' : (hasTitle ? 'top' : 'middle');
            text.textAlign = hasTitle ? 'left' : 'center';
            text.text = datum.label;
            var textBBox = text.computeBBox();
            var hasLabel = isLeaf && !!textBBox
                && textBBox.width <= innerNodeWidth
                && textBBox.height * 2 + 8 <= innerNodeHeight;
            labelMap.set(index, text);
            text.fill = highlighted ? 'black' : label.color;
            text.fillShadow = hasLabel && !highlighted ? shadow : undefined;
            text.visible = hasTitle || hasLabel;
            if (hasTitle) {
                text.x = datum.x0 + nodePadding;
                text.y = datum.y0 + nodePadding;
            }
            else {
                text.x = _this.getLabelCenterX(datum);
                text.y = _this.getLabelCenterY(datum);
            }
        });
        this.groupSelection.selectByTag(TextNodeTag.Value).each(function (text, datum, index) {
            var isLeaf = !datum.children;
            var innerNodeWidth = datum.x1 - datum.x0 - nodePadding * 2;
            var highlighted = datum === highlightedDatum;
            var value = datum.colorValue;
            var label = labels.color;
            text.fontSize = label.fontSize;
            text.fontFamily = label.fontFamily;
            text.fontStyle = label.fontStyle;
            text.fontWeight = label.fontWeight;
            text.textBaseline = 'top';
            text.textAlign = 'center';
            text.text = typeof value === 'number' && isFinite(value)
                ? String(toFixed(datum.colorValue)) + '%'
                : '';
            var textBBox = text.computeBBox();
            var nameNode = labelMap.get(index);
            var hasLabel = !!nameNode && nameNode.visible;
            var isVisible = isLeaf && !!colorKey && hasLabel && !!textBBox && textBBox.width < innerNodeWidth;
            text.fill = highlighted ? 'black' : label.color;
            text.fillShadow = highlighted ? undefined : shadow;
            text.visible = isVisible;
            if (isVisible) {
                text.x = _this.getLabelCenterX(datum);
                text.y = _this.getLabelCenterY(datum);
            }
            else {
                if (nameNode && !(datum.children && datum.children.length)) {
                    nameNode.textBaseline = 'middle';
                    nameNode.y = _this.getLabelCenterY(datum);
                }
            }
        });
    };
    TreemapSeries.prototype.getDomain = function (direction) {
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
            colorKey: this.colorKey
        });
    };
    TreemapSeries.prototype.getTooltipHtml = function (nodeDatum) {
        var _a = this, tooltip = _a.tooltip, sizeKey = _a.sizeKey, labelKey = _a.labelKey, colorKey = _a.colorKey, colorName = _a.colorName, rootName = _a.rootName;
        var datum = nodeDatum.datum;
        var tooltipRenderer = tooltip.renderer;
        var title = nodeDatum.depth ? datum[labelKey] : (rootName || datum[labelKey]);
        var content = undefined;
        var color = nodeDatum.fill || 'gray';
        if (colorKey && colorName) {
            var colorValue = datum[colorKey];
            if (typeof colorValue === 'number' && isFinite(colorValue)) {
                content = "<b>" + colorName + "</b>: " + toFixed(datum[colorKey]);
            }
        }
        var defaults = {
            title: title,
            backgroundColor: color,
            content: content
        };
        if (tooltipRenderer) {
            return toTooltipHtml(tooltipRenderer({
                datum: nodeDatum,
                sizeKey: sizeKey,
                labelKey: labelKey,
                colorKey: colorKey,
                title: title,
                color: color
            }), defaults);
        }
        return toTooltipHtml(defaults);
    };
    TreemapSeries.prototype.listSeriesItems = function (legendData) {
    };
    TreemapSeries.className = 'TreemapSeries';
    TreemapSeries.type = 'treemap';
    __decorate([
        reactive('dataChange')
    ], TreemapSeries.prototype, "labelKey", void 0);
    __decorate([
        reactive('dataChange')
    ], TreemapSeries.prototype, "sizeKey", void 0);
    __decorate([
        reactive('dataChange')
    ], TreemapSeries.prototype, "colorKey", void 0);
    __decorate([
        reactive('dataChange')
    ], TreemapSeries.prototype, "colorDomain", void 0);
    __decorate([
        reactive('dataChange')
    ], TreemapSeries.prototype, "colorRange", void 0);
    __decorate([
        reactive('dataChange')
    ], TreemapSeries.prototype, "colorParents", void 0);
    __decorate([
        reactive('update')
    ], TreemapSeries.prototype, "gradient", void 0);
    return TreemapSeries;
}(HierarchySeries));
export { TreemapSeries };
//# sourceMappingURL=treemapSeries.js.map