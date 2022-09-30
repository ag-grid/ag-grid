"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const selection_1 = require("../../../scene/selection");
const hdpiCanvas_1 = require("../../../canvas/hdpiCanvas");
const label_1 = require("../../label");
const series_1 = require("../series");
const hierarchySeries_1 = require("./hierarchySeries");
const chart_1 = require("../../chart");
const group_1 = require("../../../scene/group");
const text_1 = require("../../../scene/shape/text");
const rect_1 = require("../../../scene/shape/rect");
const dropShadow_1 = require("../../../scene/dropShadow");
const linearScale_1 = require("../../../scale/linearScale");
const treemap_1 = require("../../../layout/treemap");
const hierarchy_1 = require("../../../layout/hierarchy");
const number_1 = require("../../../util/number");
const path2D_1 = require("../../../scene/path2D");
const validation_1 = require("../../../util/validation");
class TreemapSeriesTooltip extends series_1.SeriesTooltip {
    constructor() {
        super(...arguments);
        this.renderer = undefined;
    }
}
__decorate([
    validation_1.Validate(validation_1.OPT_FUNCTION)
], TreemapSeriesTooltip.prototype, "renderer", void 0);
exports.TreemapSeriesTooltip = TreemapSeriesTooltip;
class TreemapSeriesLabel extends label_1.Label {
    constructor() {
        super(...arguments);
        this.padding = 10;
    }
}
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], TreemapSeriesLabel.prototype, "padding", void 0);
exports.TreemapSeriesLabel = TreemapSeriesLabel;
var TextNodeTag;
(function (TextNodeTag) {
    TextNodeTag[TextNodeTag["Name"] = 0] = "Name";
    TextNodeTag[TextNodeTag["Value"] = 1] = "Value";
})(TextNodeTag || (TextNodeTag = {}));
class TreemapSeries extends hierarchySeries_1.HierarchySeries {
    constructor() {
        super(...arguments);
        this.groupSelection = selection_1.Selection.select(this.pickGroup).selectAll();
        this.highlightSelection = selection_1.Selection.select(this.highlightGroup).selectAll();
        this.layout = new treemap_1.Treemap();
        this.title = (() => {
            const label = new TreemapSeriesLabel();
            label.color = 'white';
            label.fontWeight = 'bold';
            label.fontSize = 12;
            label.fontFamily = 'Verdana, sans-serif';
            label.padding = 15;
            return label;
        })();
        this.subtitle = (() => {
            const label = new TreemapSeriesLabel();
            label.color = 'white';
            label.fontSize = 9;
            label.fontFamily = 'Verdana, sans-serif';
            label.padding = 13;
            return label;
        })();
        this.labels = {
            large: (() => {
                const label = new label_1.Label();
                label.color = 'white';
                label.fontWeight = 'bold';
                label.fontSize = 18;
                return label;
            })(),
            medium: (() => {
                const label = new label_1.Label();
                label.color = 'white';
                label.fontWeight = 'bold';
                label.fontSize = 14;
                return label;
            })(),
            small: (() => {
                const label = new label_1.Label();
                label.color = 'white';
                label.fontWeight = 'bold';
                label.fontSize = 10;
                return label;
            })(),
            color: (() => {
                const label = new label_1.Label();
                label.color = 'white';
                return label;
            })(),
        };
        this._nodePadding = 2;
        this.labelKey = 'label';
        this.sizeKey = 'size';
        this.colorKey = 'color';
        this.colorDomain = [-5, 5];
        this.colorRange = ['#cb4b3f', '#6acb64'];
        this.colorParents = false;
        this.gradient = true;
        this.formatter = undefined;
        this.colorName = 'Change';
        this.rootName = 'Root';
        this.shadow = (() => {
            const shadow = new dropShadow_1.DropShadow();
            shadow.color = 'rgba(0, 0, 0, 0.4)';
            shadow.xOffset = 1.5;
            shadow.yOffset = 1.5;
            return shadow;
        })();
        this.tooltip = new TreemapSeriesTooltip();
    }
    set nodePadding(value) {
        if (this._nodePadding !== value) {
            this._nodePadding = value;
            this.updateLayoutPadding();
        }
    }
    get nodePadding() {
        return this._nodePadding;
    }
    updateLayoutPadding() {
        const { title, subtitle, nodePadding, labelKey } = this;
        this.layout.paddingRight = (_) => nodePadding;
        this.layout.paddingBottom = (_) => nodePadding;
        this.layout.paddingLeft = (_) => nodePadding;
        this.layout.paddingTop = (node) => {
            let name = node.datum[labelKey] || '';
            if (node.children) {
                name = name.toUpperCase();
            }
            const font = node.depth > 1 ? subtitle : title;
            const textSize = hdpiCanvas_1.HdpiCanvas.getTextSize(name, [font.fontWeight, font.fontSize + 'px', font.fontFamily].join(' ').trim());
            const innerNodeWidth = node.x1 - node.x0 - nodePadding * 2;
            const hasTitle = node.depth > 0 && node.children && textSize.width <= innerNodeWidth;
            node.hasTitle = !!hasTitle;
            return hasTitle ? textSize.height + nodePadding * 2 : nodePadding;
        };
    }
    processData() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.data) {
                return;
            }
            const { data, sizeKey, labelKey, colorKey, colorDomain, colorRange, colorParents } = this;
            let dataRoot;
            if (sizeKey) {
                dataRoot = hierarchy_1.hierarchy(data).sum((datum) => (datum.children ? 1 : datum[sizeKey]));
            }
            else {
                dataRoot = hierarchy_1.hierarchy(data).sum((datum) => (datum.children ? 0 : 1));
            }
            this.dataRoot = dataRoot;
            const colorScale = new linearScale_1.LinearScale();
            colorScale.domain = colorDomain;
            colorScale.range = colorRange;
            const series = this;
            function traverse(root, depth = 0) {
                const { children, datum } = root;
                const label = datum[labelKey];
                const colorValue = colorKey ? datum[colorKey] : depth;
                Object.assign(root, { series });
                root.fill = !children || colorParents ? colorScale.convert(colorValue) : '#272931';
                root.colorValue = colorValue;
                if (label) {
                    root.label = children ? label.toUpperCase() : label;
                }
                else {
                    root.label = '';
                }
                if (children) {
                    children.forEach((child) => traverse(child, depth + 1));
                }
            }
            traverse(this.dataRoot);
            return;
        });
    }
    getLabelCenterX(datum) {
        return (datum.x0 + datum.x1) / 2;
    }
    getLabelCenterY(datum) {
        return (datum.y0 + datum.y1) / 2 + 2;
    }
    createNodeData() {
        return __awaiter(this, void 0, void 0, function* () {
            return [];
        });
    }
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateSelections();
            yield this.updateNodes();
        });
    }
    updateSelections() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.nodeDataRefresh) {
                return;
            }
            this.nodeDataRefresh = false;
            const { chart, dataRoot } = this;
            if (!chart || !dataRoot) {
                return;
            }
            const seriesRect = chart.getSeriesRect();
            if (!seriesRect) {
                return;
            }
            this.layout.size = [seriesRect.width, seriesRect.height];
            this.updateLayoutPadding();
            const descendants = this.layout.processData(dataRoot).descendants();
            const { groupSelection, highlightSelection } = this;
            const update = (selection) => {
                const updateGroups = selection.setData(descendants);
                updateGroups.exit.remove();
                const enterGroups = updateGroups.enter.append(group_1.Group);
                enterGroups.append(rect_1.Rect);
                enterGroups.append(text_1.Text).each((node) => (node.tag = TextNodeTag.Name));
                enterGroups.append(text_1.Text).each((node) => (node.tag = TextNodeTag.Value));
                return updateGroups.merge(enterGroups);
            };
            this.groupSelection = update(groupSelection);
            this.highlightSelection = update(highlightSelection);
        });
    }
    updateNodes() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.chart) {
                return;
            }
            const { nodePadding, labels, shadow, gradient, chart: { highlightedDatum }, highlightStyle: { fill: deprecatedFill, stroke: deprecatedStroke, strokeWidth: deprecatedStrokeWidth, item: { fill: highlightedFill = deprecatedFill, fillOpacity: highlightedFillOpacity, stroke: highlightedStroke = deprecatedStroke, strokeWidth: highlightedDatumStrokeWidth = deprecatedStrokeWidth, }, }, formatter, colorKey, labelKey, sizeKey, } = this;
            const labelMeta = this.buildLabelMeta(this.groupSelection.data);
            const updateRectFn = (rect, datum, isDatumHighlighted) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
                const fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : datum.fill;
                const fillOpacity = (_a = (isDatumHighlighted ? highlightedFillOpacity : 1), (_a !== null && _a !== void 0 ? _a : 1));
                const stroke = isDatumHighlighted && highlightedStroke !== undefined
                    ? highlightedStroke
                    : datum.depth < 2
                        ? undefined
                        : 'black';
                const strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined ? highlightedDatumStrokeWidth : 1;
                let format;
                if (formatter) {
                    format = formatter({
                        datum: datum.datum,
                        colorKey,
                        sizeKey,
                        labelKey,
                        fill,
                        stroke,
                        strokeWidth,
                        gradient,
                        highlighted: isDatumHighlighted,
                    });
                }
                rect.fill = (_c = (_b = format) === null || _b === void 0 ? void 0 : _b.fill, (_c !== null && _c !== void 0 ? _c : fill));
                rect.fillOpacity = (_e = (_d = format) === null || _d === void 0 ? void 0 : _d.fillOpacity, (_e !== null && _e !== void 0 ? _e : fillOpacity));
                rect.stroke = (_g = (_f = format) === null || _f === void 0 ? void 0 : _f.stroke, (_g !== null && _g !== void 0 ? _g : stroke));
                rect.strokeWidth = (_j = (_h = format) === null || _h === void 0 ? void 0 : _h.strokeWidth, (_j !== null && _j !== void 0 ? _j : strokeWidth));
                rect.gradient = (_l = (_k = format) === null || _k === void 0 ? void 0 : _k.gradient, (_l !== null && _l !== void 0 ? _l : gradient));
                rect.crisp = true;
                rect.x = datum.x0;
                rect.y = datum.y0;
                rect.width = datum.x1 - datum.x0;
                rect.height = datum.y1 - datum.y0;
                if (isDatumHighlighted && datum.children) {
                    const { x0, x1, y0, y1 } = datum;
                    const pLeft = this.layout.paddingLeft(datum);
                    const pRight = this.layout.paddingRight(datum);
                    const pTop = this.layout.paddingTop(datum);
                    const pBottom = this.layout.paddingBottom(datum);
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
            this.groupSelection.selectByClass(rect_1.Rect).each((rect, datum) => updateRectFn(rect, datum, false));
            this.highlightSelection.selectByClass(rect_1.Rect).each((rect, datum) => {
                const isDatumHighlighted = datum === highlightedDatum;
                rect.visible = isDatumHighlighted;
                if (rect.visible) {
                    updateRectFn(rect, datum, isDatumHighlighted);
                }
            });
            const updateNodeFn = (text, datum, index, highlighted) => {
                var _a;
                const { hasTitle } = datum;
                const { label, nodeBaseline: textBaseline } = (_a = labelMeta[index], (_a !== null && _a !== void 0 ? _a : {}));
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
                    text.x = this.getLabelCenterX(datum);
                    text.y = this.getLabelCenterY(datum);
                }
            };
            this.groupSelection
                .selectByTag(TextNodeTag.Name)
                .each((text, datum, index) => updateNodeFn(text, datum, index, false));
            this.highlightSelection.selectByTag(TextNodeTag.Name).each((text, datum, index) => {
                const isDatumHighlighted = datum === highlightedDatum;
                text.visible = isDatumHighlighted;
                if (text.visible) {
                    updateNodeFn(text, datum, index, isDatumHighlighted);
                }
            });
            const updateValueFn = (text, datum, index, highlighted) => {
                var _a;
                const { valueBaseline: textBaseline, valueText } = (_a = labelMeta[index], (_a !== null && _a !== void 0 ? _a : {}));
                const label = labels.color;
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
                    text.x = this.getLabelCenterX(datum);
                    text.y = this.getLabelCenterY(datum);
                }
                else {
                    text.visible = false;
                }
            };
            this.groupSelection
                .selectByTag(TextNodeTag.Value)
                .each((text, datum, index) => updateValueFn(text, datum, index, false));
            this.highlightSelection.selectByTag(TextNodeTag.Value).each((text, datum, index) => {
                const isDatumHighlighted = datum === highlightedDatum;
                text.visible = isDatumHighlighted;
                if (text.visible) {
                    updateValueFn(text, datum, index, isDatumHighlighted);
                }
            });
        });
    }
    buildLabelMeta(data) {
        const { labels, title, subtitle, nodePadding, colorKey } = this;
        const labelMeta = [];
        labelMeta.length = this.groupSelection.data.length;
        const text = new text_1.Text();
        let index = 0;
        for (const datum of data) {
            const { value } = datum;
            const isLeaf = !datum.children;
            const innerNodeWidth = datum.x1 - datum.x0 - nodePadding * 2;
            const innerNodeHeight = datum.y1 - datum.y0 - nodePadding * 2;
            const hasTitle = datum.hasTitle;
            let label;
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
            const nodeBBox = text.computeBBox();
            const hasNode = isLeaf && !!nodeBBox && nodeBBox.width <= innerNodeWidth && nodeBBox.height * 2 + 8 <= innerNodeHeight;
            const valueText = typeof value === 'number' && isFinite(value) ? String(number_1.toFixed(datum.colorValue)) + '%' : '';
            text.fontSize = labels.color.fontSize;
            text.fontFamily = labels.color.fontFamily;
            text.fontStyle = labels.color.fontStyle;
            text.fontWeight = labels.color.fontWeight;
            text.text = valueText;
            const valueBBox = text.computeBBox();
            const hasValue = isLeaf && !!colorKey && hasNode && !!valueBBox && valueBBox.width < innerNodeWidth;
            const nodeBaseline = hasValue ? 'bottom' : isLeaf ? 'middle' : hasTitle ? 'top' : 'middle';
            labelMeta[index++] = {
                label,
                nodeBaseline: hasTitle || hasNode ? nodeBaseline : undefined,
                valueBaseline: hasValue ? 'top' : undefined,
                valueText,
            };
        }
        return labelMeta;
    }
    getDomain(_direction) {
        return [0, 1];
    }
    fireNodeClickEvent(event, datum) {
        this.fireEvent({
            type: 'nodeClick',
            event,
            series: this,
            datum: datum.datum,
            labelKey: this.labelKey,
            sizeKey: this.sizeKey,
            colorKey: this.colorKey,
        });
    }
    getTooltipHtml(nodeDatum) {
        const { tooltip, sizeKey, labelKey, colorKey, colorName, rootName } = this;
        const { datum } = nodeDatum;
        const { renderer: tooltipRenderer } = tooltip;
        const title = nodeDatum.depth ? datum[labelKey] : rootName || datum[labelKey];
        let content = undefined;
        const color = nodeDatum.fill || 'gray';
        if (colorKey && colorName) {
            const colorValue = datum[colorKey];
            if (typeof colorValue === 'number' && isFinite(colorValue)) {
                content = `<b>${colorName}</b>: ${number_1.toFixed(datum[colorKey])}`;
            }
        }
        const defaults = {
            title,
            backgroundColor: color,
            content,
        };
        if (tooltipRenderer) {
            return chart_1.toTooltipHtml(tooltipRenderer({
                datum: nodeDatum,
                sizeKey,
                labelKey,
                colorKey,
                title,
                color,
            }), defaults);
        }
        return chart_1.toTooltipHtml(defaults);
    }
    listSeriesItems(_legendData) {
        // Override point for subclasses.
    }
}
TreemapSeries.className = 'TreemapSeries';
TreemapSeries.type = 'treemap';
__decorate([
    validation_1.Validate(validation_1.STRING)
], TreemapSeries.prototype, "labelKey", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_STRING)
], TreemapSeries.prototype, "sizeKey", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_STRING)
], TreemapSeries.prototype, "colorKey", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER_ARRAY)
], TreemapSeries.prototype, "colorDomain", void 0);
__decorate([
    validation_1.Validate(validation_1.COLOR_STRING_ARRAY)
], TreemapSeries.prototype, "colorRange", void 0);
__decorate([
    validation_1.Validate(validation_1.BOOLEAN)
], TreemapSeries.prototype, "colorParents", void 0);
__decorate([
    validation_1.Validate(validation_1.BOOLEAN)
], TreemapSeries.prototype, "gradient", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_FUNCTION)
], TreemapSeries.prototype, "formatter", void 0);
__decorate([
    validation_1.Validate(validation_1.STRING)
], TreemapSeries.prototype, "colorName", void 0);
__decorate([
    validation_1.Validate(validation_1.STRING)
], TreemapSeries.prototype, "rootName", void 0);
exports.TreemapSeries = TreemapSeries;
