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
exports.TreemapSeries = void 0;
const selection_1 = require("../../../scene/selection");
const label_1 = require("../../label");
const series_1 = require("../series");
const hierarchySeries_1 = require("./hierarchySeries");
const tooltip_1 = require("../../tooltip/tooltip");
const group_1 = require("../../../scene/group");
const text_1 = require("../../../scene/shape/text");
const rect_1 = require("../../../scene/shape/rect");
const dropShadow_1 = require("../../../scene/dropShadow");
const colorScale_1 = require("../../../scale/colorScale");
const number_1 = require("../../../util/number");
const bbox_1 = require("../../../scene/bbox");
const color_1 = require("../../../util/color");
const validation_1 = require("../../../util/validation");
const logger_1 = require("../../../util/logger");
class TreemapSeriesTooltip extends series_1.SeriesTooltip {
    constructor() {
        super(...arguments);
        this.renderer = undefined;
    }
}
__decorate([
    validation_1.Validate(validation_1.OPT_FUNCTION)
], TreemapSeriesTooltip.prototype, "renderer", void 0);
class TreemapSeriesNodeBaseClickEvent extends series_1.SeriesNodeBaseClickEvent {
    constructor(labelKey, sizeKey, colorKey, nativeEvent, datum, series) {
        super(nativeEvent, datum, series);
        this.labelKey = labelKey;
        this.sizeKey = sizeKey;
        this.colorKey = colorKey;
    }
}
class TreemapSeriesNodeClickEvent extends TreemapSeriesNodeBaseClickEvent {
    constructor() {
        super(...arguments);
        this.type = 'nodeClick';
    }
}
class TreemapSeriesNodeDoubleClickEvent extends TreemapSeriesNodeBaseClickEvent {
    constructor() {
        super(...arguments);
        this.type = 'nodeDoubleClick';
    }
}
class TreemapSeriesLabel extends label_1.Label {
    constructor() {
        super(...arguments);
        this.padding = 10;
    }
}
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], TreemapSeriesLabel.prototype, "padding", void 0);
class TreemapSeriesTileLabel extends label_1.Label {
    constructor() {
        super(...arguments);
        this.wrapping = 'on-space';
    }
}
__decorate([
    validation_1.Validate(validation_1.TEXT_WRAP)
], TreemapSeriesTileLabel.prototype, "wrapping", void 0);
class TreemapValueLabel {
    constructor() {
        this.style = (() => {
            const label = new label_1.Label();
            label.color = 'white';
            return label;
        })();
    }
}
__decorate([
    validation_1.Validate(validation_1.OPT_STRING)
], TreemapValueLabel.prototype, "key", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_STRING)
], TreemapValueLabel.prototype, "name", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_FUNCTION)
], TreemapValueLabel.prototype, "formatter", void 0);
var TextNodeTag;
(function (TextNodeTag) {
    TextNodeTag[TextNodeTag["Name"] = 0] = "Name";
    TextNodeTag[TextNodeTag["Value"] = 1] = "Value";
})(TextNodeTag || (TextNodeTag = {}));
const tempText = new text_1.Text();
function getTextSize(text, style) {
    const { fontStyle, fontWeight, fontSize, fontFamily } = style;
    tempText.fontStyle = fontStyle;
    tempText.fontWeight = fontWeight;
    tempText.fontSize = fontSize;
    tempText.fontFamily = fontFamily;
    tempText.text = text;
    tempText.x = 0;
    tempText.y = 0;
    tempText.textAlign = 'left';
    tempText.textBaseline = 'top';
    const { width, height } = tempText.computeBBox();
    return { width, height };
}
function validateColor(color) {
    if (typeof color === 'string' && !color_1.Color.validColorString(color)) {
        const fallbackColor = 'black';
        logger_1.Logger.warnOnce(`invalid Treemap tile colour string "${color}". Affected treemap tiles will be coloured ${fallbackColor}.`);
        return 'black';
    }
    return color;
}
class TreemapTextHighlightStyle {
    constructor() {
        this.color = 'black';
    }
}
__decorate([
    validation_1.Validate(validation_1.OPT_COLOR_STRING)
], TreemapTextHighlightStyle.prototype, "color", void 0);
class TreemapHighlightStyle extends series_1.HighlightStyle {
    constructor() {
        super(...arguments);
        this.text = new TreemapTextHighlightStyle();
    }
}
class TreemapSeries extends hierarchySeries_1.HierarchySeries {
    constructor() {
        super(...arguments);
        this.groupSelection = selection_1.Selection.select(this.contentGroup, group_1.Group);
        this.highlightSelection = selection_1.Selection.select(this.highlightGroup, group_1.Group);
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
                const label = new TreemapSeriesTileLabel();
                label.color = 'white';
                label.fontWeight = 'bold';
                label.fontSize = 18;
                return label;
            })(),
            medium: (() => {
                const label = new TreemapSeriesTileLabel();
                label.color = 'white';
                label.fontWeight = 'bold';
                label.fontSize = 14;
                return label;
            })(),
            small: (() => {
                const label = new TreemapSeriesTileLabel();
                label.color = 'white';
                label.fontWeight = 'bold';
                label.fontSize = 10;
                return label;
            })(),
            formatter: undefined,
            value: new TreemapValueLabel(),
        };
        this.nodePadding = 2;
        this.nodeGap = 0;
        this.labelKey = 'label';
        this.sizeKey = 'size';
        this.colorKey = 'color';
        this.colorDomain = [-5, 5];
        this.colorRange = ['#cb4b3f', '#6acb64'];
        this.groupFill = '#272931';
        this.groupStroke = 'black';
        this.groupStrokeWidth = 1;
        this.tileStroke = 'black';
        this.tileStrokeWidth = 1;
        this.gradient = true;
        this.formatter = undefined;
        this.colorName = 'Change';
        this.rootName = 'Root';
        this.highlightGroups = true;
        this.tileShadow = new dropShadow_1.DropShadow();
        this.labelShadow = new dropShadow_1.DropShadow();
        this.tooltip = new TreemapSeriesTooltip();
        this.highlightStyle = new TreemapHighlightStyle();
    }
    getNodePaddingTop(nodeDatum, bbox) {
        const { title, subtitle, nodePadding } = this;
        const label = nodeDatum.label;
        if (nodeDatum.isLeaf || !label || nodeDatum.depth === 0) {
            return nodePadding;
        }
        const font = nodeDatum.depth > 1 ? subtitle : title;
        const textSize = getTextSize(label, font);
        const heightRatioThreshold = 3;
        if (font.fontSize > bbox.width / heightRatioThreshold || font.fontSize > bbox.height / heightRatioThreshold) {
            return nodePadding;
        }
        if (textSize.height >= bbox.height) {
            return nodePadding;
        }
        return textSize.height + nodePadding * 2;
    }
    getNodePadding(nodeDatum, bbox) {
        const { nodePadding } = this;
        const top = this.getNodePaddingTop(nodeDatum, bbox);
        return {
            top,
            right: nodePadding,
            bottom: nodePadding,
            left: nodePadding,
        };
    }
    /**
     * Squarified Treemap algorithm
     * https://www.win.tue.nl/~vanwijk/stm.pdf
     */
    squarify(nodeDatum, bbox, outputNodesBoxes = new Map()) {
        if (bbox.width <= 0 || bbox.height <= 0) {
            return outputNodesBoxes;
        }
        outputNodesBoxes.set(nodeDatum, bbox);
        const targetTileAspectRatio = 1; // The width and height will tend to this ratio
        const padding = this.getNodePadding(nodeDatum, bbox);
        const width = bbox.width - padding.left - padding.right;
        const height = bbox.height - padding.top - padding.bottom;
        if (width <= 0 || height <= 0 || nodeDatum.value <= 0) {
            return outputNodesBoxes;
        }
        let stackSum = 0;
        let startIndex = 0;
        let minRatioDiff = Infinity;
        let partitionSum = nodeDatum.value;
        const children = nodeDatum.children;
        const innerBox = new bbox_1.BBox(bbox.x + padding.left, bbox.y + padding.top, width, height);
        const partition = innerBox.clone();
        for (let i = 0; i < children.length; i++) {
            const value = children[i].value;
            const firstValue = children[startIndex].value;
            const isVertical = partition.width < partition.height;
            stackSum += value;
            const partThickness = isVertical ? partition.height : partition.width;
            const partLength = isVertical ? partition.width : partition.height;
            const firstTileLength = (partLength * firstValue) / stackSum;
            let stackThickness = (partThickness * stackSum) / partitionSum;
            const ratio = Math.max(firstTileLength, stackThickness) / Math.min(firstTileLength, stackThickness);
            const diff = Math.abs(targetTileAspectRatio - ratio);
            if (diff < minRatioDiff) {
                minRatioDiff = diff;
                continue;
            }
            // Go one step back and process the best match
            stackSum -= value;
            stackThickness = (partThickness * stackSum) / partitionSum;
            let start = isVertical ? partition.x : partition.y;
            for (let j = startIndex; j < i; j++) {
                const child = children[j];
                const x = isVertical ? start : partition.x;
                const y = isVertical ? partition.y : start;
                const length = (partLength * child.value) / stackSum;
                const width = isVertical ? length : stackThickness;
                const height = isVertical ? stackThickness : length;
                const childBox = new bbox_1.BBox(x, y, width, height);
                this.applyGap(innerBox, childBox);
                this.squarify(child, childBox, outputNodesBoxes);
                partitionSum -= child.value;
                start += length;
            }
            if (isVertical) {
                partition.y += stackThickness;
                partition.height -= stackThickness;
            }
            else {
                partition.x += stackThickness;
                partition.width -= stackThickness;
            }
            startIndex = i;
            stackSum = 0;
            minRatioDiff = Infinity;
            i--;
        }
        // Process remaining space
        const isVertical = partition.width < partition.height;
        let start = isVertical ? partition.x : partition.y;
        for (let i = startIndex; i < children.length; i++) {
            const x = isVertical ? start : partition.x;
            const y = isVertical ? partition.y : start;
            const part = children[i].value / partitionSum;
            const width = partition.width * (isVertical ? part : 1);
            const height = partition.height * (isVertical ? 1 : part);
            const childBox = new bbox_1.BBox(x, y, width, height);
            this.applyGap(innerBox, childBox);
            this.squarify(children[i], childBox, outputNodesBoxes);
            start += isVertical ? width : height;
        }
        return outputNodesBoxes;
    }
    applyGap(innerBox, childBox) {
        const gap = this.nodeGap / 2;
        const getBounds = (box) => {
            return {
                left: box.x,
                top: box.y,
                right: box.x + box.width,
                bottom: box.y + box.height,
            };
        };
        const innerBounds = getBounds(innerBox);
        const childBounds = getBounds(childBox);
        const sides = Object.keys(innerBounds);
        sides.forEach((side) => {
            if (!number_1.isEqual(innerBounds[side], childBounds[side])) {
                childBox.shrink(gap, side);
            }
        });
    }
    processData() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.data) {
                return;
            }
            const { data, sizeKey, labelKey, colorKey, colorDomain, colorRange, groupFill } = this;
            const labelFormatter = this.labels.formatter;
            const colorScale = new colorScale_1.ColorScale();
            colorScale.domain = colorDomain;
            colorScale.range = colorRange;
            colorScale.update();
            const createTreeNodeDatum = (datum, depth = 0, parent) => {
                var _a, _b, _c;
                let label;
                if (labelFormatter) {
                    label = this.ctx.callbackCache.call(labelFormatter, { datum });
                }
                if (label !== undefined) {
                    // Label retrieved from formatter successfully.
                }
                else if (labelKey) {
                    label = (_a = datum[labelKey]) !== null && _a !== void 0 ? _a : '';
                }
                else {
                    label = '';
                }
                let colorScaleValue = colorKey ? (_b = datum[colorKey]) !== null && _b !== void 0 ? _b : depth : depth;
                colorScaleValue = validateColor(colorScaleValue);
                const isLeaf = !datum.children;
                let fill = groupFill;
                if (typeof colorScaleValue === 'string') {
                    fill = colorScaleValue;
                }
                else if (isLeaf || !groupFill) {
                    fill = colorScale.convert(colorScaleValue);
                }
                const nodeDatum = {
                    datum,
                    depth,
                    parent,
                    value: 0,
                    label,
                    fill,
                    series: this,
                    isLeaf,
                    children: [],
                };
                if (isLeaf) {
                    nodeDatum.value = sizeKey ? (_c = datum[sizeKey]) !== null && _c !== void 0 ? _c : 1 : 1;
                }
                else {
                    datum.children.forEach((child) => {
                        const childNodeDatum = createTreeNodeDatum(child, depth + 1, nodeDatum);
                        const value = childNodeDatum.value;
                        if (isNaN(value) || !isFinite(value) || value === 0) {
                            return;
                        }
                        nodeDatum.value += value;
                        nodeDatum.children.push(childNodeDatum);
                    });
                    nodeDatum.children.sort((a, b) => {
                        return b.value - a.value;
                    });
                }
                return nodeDatum;
            };
            this.dataRoot = createTreeNodeDatum(data);
        });
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
            const descendants = [];
            const traverse = (datum) => {
                var _a;
                descendants.push(datum);
                (_a = datum.children) === null || _a === void 0 ? void 0 : _a.forEach(traverse);
            };
            traverse(this.dataRoot);
            const { groupSelection, highlightSelection } = this;
            const update = (selection) => {
                return selection.update(descendants, (group) => {
                    const rect = new rect_1.Rect();
                    const nameLabel = new text_1.Text();
                    nameLabel.tag = TextNodeTag.Name;
                    const valueLabel = new text_1.Text();
                    valueLabel.tag = TextNodeTag.Value;
                    group.append([rect, nameLabel, valueLabel]);
                });
            };
            this.groupSelection = update(groupSelection);
            this.highlightSelection = update(highlightSelection);
        });
    }
    isDatumHighlighted(datum) {
        var _a;
        const highlightedDatum = (_a = this.highlightManager) === null || _a === void 0 ? void 0 : _a.getActiveHighlight();
        return datum === highlightedDatum && (datum.isLeaf || this.highlightGroups);
    }
    getTileFormat(datum, isHighlighted) {
        var _a;
        const { formatter, ctx: { callbackCache }, } = this;
        if (!formatter) {
            return {};
        }
        const { gradient, colorKey, labelKey, sizeKey, tileStroke, tileStrokeWidth, groupStroke, groupStrokeWidth } = this;
        const stroke = datum.isLeaf ? tileStroke : groupStroke;
        const strokeWidth = datum.isLeaf ? tileStrokeWidth : groupStrokeWidth;
        const result = callbackCache.call(formatter, {
            seriesId: this.id,
            datum: datum.datum,
            depth: datum.depth,
            parent: (_a = datum.parent) === null || _a === void 0 ? void 0 : _a.datum,
            colorKey,
            sizeKey,
            labelKey,
            fill: datum.fill,
            stroke,
            strokeWidth,
            gradient,
            highlighted: isHighlighted,
        });
        return result !== null && result !== void 0 ? result : {};
    }
    updateNodes() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.chart) {
                return;
            }
            const { gradient, highlightStyle: { item: { fill: highlightedFill, fillOpacity: highlightedFillOpacity, stroke: highlightedStroke, strokeWidth: highlightedDatumStrokeWidth, }, text: { color: highlightedTextColor }, }, tileStroke, tileStrokeWidth, groupStroke, groupStrokeWidth, tileShadow, labelShadow, } = this;
            const seriesRect = this.chart.getSeriesRect();
            const boxes = this.squarify(this.dataRoot, new bbox_1.BBox(0, 0, seriesRect.width, seriesRect.height));
            const labelMeta = this.buildLabelMeta(boxes);
            const highlightedSubtree = this.getHighlightedSubtree();
            this.updateNodeMidPoint(boxes);
            const updateRectFn = (rect, datum, isDatumHighlighted) => {
                var _a, _b, _c, _d, _e, _f;
                const box = boxes.get(datum);
                if (!box) {
                    rect.visible = false;
                    return;
                }
                const fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : datum.fill;
                const fillOpacity = (_a = (isDatumHighlighted ? highlightedFillOpacity : 1)) !== null && _a !== void 0 ? _a : 1;
                let stroke = groupStroke;
                if (isDatumHighlighted && highlightedStroke !== undefined) {
                    stroke = highlightedStroke;
                }
                else if (datum.isLeaf) {
                    stroke = tileStroke;
                }
                let strokeWidth = groupStrokeWidth;
                if (isDatumHighlighted && highlightedDatumStrokeWidth !== undefined) {
                    strokeWidth = highlightedDatumStrokeWidth;
                }
                else if (datum.isLeaf) {
                    strokeWidth = tileStrokeWidth;
                }
                const format = this.getTileFormat(datum, isDatumHighlighted);
                const fillColor = validateColor((_b = format === null || format === void 0 ? void 0 : format.fill) !== null && _b !== void 0 ? _b : fill);
                if ((_c = format === null || format === void 0 ? void 0 : format.gradient) !== null && _c !== void 0 ? _c : gradient) {
                    const start = color_1.Color.tryParseFromString(fill).brighter().toString();
                    const end = color_1.Color.tryParseFromString(fill).darker().toString();
                    rect.fill = `linear-gradient(180deg, ${start}, ${end})`;
                }
                else {
                    rect.fill = fillColor;
                }
                rect.fillOpacity = (_d = format === null || format === void 0 ? void 0 : format.fillOpacity) !== null && _d !== void 0 ? _d : fillOpacity;
                rect.stroke = validateColor((_e = format === null || format === void 0 ? void 0 : format.stroke) !== null && _e !== void 0 ? _e : stroke);
                rect.strokeWidth = (_f = format === null || format === void 0 ? void 0 : format.strokeWidth) !== null && _f !== void 0 ? _f : strokeWidth;
                rect.fillShadow = tileShadow;
                rect.crisp = true;
                rect.x = box.x;
                rect.y = box.y;
                rect.width = box.width;
                rect.height = box.height;
                rect.visible = true;
            };
            this.groupSelection.selectByClass(rect_1.Rect).forEach((rect) => updateRectFn(rect, rect.datum, false));
            this.highlightSelection.selectByClass(rect_1.Rect).forEach((rect) => {
                const isDatumHighlighted = this.isDatumHighlighted(rect.datum);
                rect.visible = isDatumHighlighted || highlightedSubtree.has(rect.datum);
                if (rect.visible) {
                    updateRectFn(rect, rect.datum, isDatumHighlighted);
                }
            });
            const updateLabelFn = (text, datum, highlighted, key) => {
                const meta = labelMeta.get(datum);
                const label = meta === null || meta === void 0 ? void 0 : meta[key];
                if (!label) {
                    text.visible = false;
                    return;
                }
                text.text = label.text;
                text.fontFamily = label.style.fontFamily;
                text.fontSize = label.style.fontSize;
                text.fontWeight = label.style.fontWeight;
                text.fill = highlighted ? highlightedTextColor !== null && highlightedTextColor !== void 0 ? highlightedTextColor : label.style.color : label.style.color;
                text.fillShadow = highlighted ? undefined : labelShadow;
                text.textAlign = label.hAlign;
                text.textBaseline = label.vAlign;
                text.x = label.x;
                text.y = label.y;
                text.visible = true;
            };
            this.groupSelection
                .selectByTag(TextNodeTag.Name)
                .forEach((text) => updateLabelFn(text, text.datum, false, 'label'));
            this.highlightSelection.selectByTag(TextNodeTag.Name).forEach((text) => {
                const isDatumHighlighted = this.isDatumHighlighted(text.datum);
                text.visible = isDatumHighlighted || highlightedSubtree.has(text.datum);
                if (text.visible) {
                    updateLabelFn(text, text.datum, isDatumHighlighted, 'label');
                }
            });
            this.groupSelection
                .selectByTag(TextNodeTag.Value)
                .forEach((text) => updateLabelFn(text, text.datum, false, 'value'));
            this.highlightSelection.selectByTag(TextNodeTag.Value).forEach((text) => {
                const isDatumHighlighted = this.isDatumHighlighted(text.datum);
                text.visible = isDatumHighlighted || highlightedSubtree.has(text.datum);
                if (text.visible) {
                    updateLabelFn(text, text.datum, isDatumHighlighted, 'value');
                }
            });
        });
    }
    updateNodeMidPoint(boxes) {
        boxes.forEach((box, treeNodeDatum) => {
            treeNodeDatum.nodeMidPoint = {
                x: box.x + box.width / 2,
                y: box.y,
            };
        });
    }
    getHighlightedSubtree() {
        const items = new Set();
        const traverse = (datum) => {
            var _a;
            if (this.isDatumHighlighted(datum) || (datum.parent && items.has(datum.parent))) {
                items.add(datum);
            }
            (_a = datum.children) === null || _a === void 0 ? void 0 : _a.forEach(traverse);
        };
        traverse(this.dataRoot);
        return items;
    }
    buildLabelMeta(boxes) {
        const { labels, title, subtitle, nodePadding, labelKey, ctx: { callbackCache }, } = this;
        const wrappedRegExp = /-$/m;
        const labelMeta = new Map();
        boxes.forEach((box, datum) => {
            var _a, _b, _c;
            if (!labelKey || datum.depth === 0) {
                return;
            }
            const availTextWidth = box.width - 2 * nodePadding;
            const availTextHeight = box.height - 2 * nodePadding;
            const isBoxTooSmall = (labelStyle) => {
                const minSizeRatio = 3;
                return (labelStyle.fontSize > box.width / minSizeRatio || labelStyle.fontSize > box.height / minSizeRatio);
            };
            let labelText = datum.isLeaf ? datum.label : datum.label.toUpperCase();
            let valueText = '';
            const valueConfig = labels.value;
            const valueStyle = valueConfig.style;
            const valueMargin = Math.ceil(valueStyle.fontSize * 2 * (text_1.Text.defaultLineHeightRatio - 1));
            if (datum.isLeaf) {
                if (valueConfig.formatter) {
                    valueText = (_a = callbackCache.call(valueConfig.formatter, { datum: datum.datum })) !== null && _a !== void 0 ? _a : '';
                }
                else if (valueConfig.key) {
                    valueText = datum.datum[valueConfig.key];
                }
            }
            let valueSize = getTextSize(valueText, valueStyle);
            if (valueText && valueSize.width > availTextWidth) {
                valueText = '';
            }
            let labelStyle;
            let wrappedText = '';
            if (datum.isLeaf) {
                labelStyle = labels.small;
                const pickStyle = () => {
                    const availHeight = availTextHeight - (valueText ? valueStyle.fontSize + valueMargin : 0);
                    const labelStyles = [labels.large, labels.medium, labels.small];
                    for (const style of labelStyles) {
                        const { width, height } = getTextSize(labelText, style);
                        if (height > availHeight || isBoxTooSmall(style)) {
                            continue;
                        }
                        if (width <= availTextWidth) {
                            return { style, wrappedText: undefined };
                        }
                        // Avoid hyphens and ellipsis for large and medium label styles
                        const wrapped = text_1.Text.wrap(labelText, availTextWidth, availHeight, style, style.wrapping);
                        if (wrapped &&
                            wrapped !== '\u2026' &&
                            (style === labels.small || !(wrappedRegExp.exec(wrapped) || wrapped.endsWith('\u2026')))) {
                            return { style, wrappedText: wrapped };
                        }
                    }
                    // Check if small font fits by height
                    const smallSize = getTextSize(labelText, labels.small);
                    if (smallSize.height <= availHeight && !isBoxTooSmall(labels.small)) {
                        return { style: labels.small, wrappedText: undefined };
                    }
                    return { style: undefined, wrappedText: undefined };
                };
                let result = pickStyle();
                if (!result.style && valueText) {
                    valueText = '';
                    result = pickStyle();
                }
                labelStyle = (_b = result.style) !== null && _b !== void 0 ? _b : labels.small;
                wrappedText = (_c = result.wrappedText) !== null && _c !== void 0 ? _c : '';
            }
            else if (datum.depth === 1) {
                labelStyle = title;
            }
            else {
                labelStyle = subtitle;
            }
            const labelSize = getTextSize(wrappedText || labelText, labelStyle);
            if (isBoxTooSmall(labelStyle)) {
                // Avoid labels on too small tiles
                return;
            }
            // Crop text if not enough space
            if (labelSize.width > availTextWidth) {
                const textLength = Math.floor((labelText.length * availTextWidth) / labelSize.width) - 1;
                labelText = `${labelText.substring(0, textLength).trim()}…`;
            }
            valueSize = getTextSize(valueText, valueStyle);
            const hasValueText = valueText &&
                valueSize.width < availTextWidth &&
                valueSize.height + labelSize.height + valueMargin < availTextHeight;
            labelMeta.set(datum, {
                label: Object.assign({ text: wrappedText || labelText, style: labelStyle }, (datum.isLeaf
                    ? {
                        hAlign: 'center',
                        vAlign: 'middle',
                        x: box.x + box.width / 2,
                        y: box.y + box.height / 2 - (hasValueText ? valueSize.height / 2 + valueMargin / 2 : 0),
                    }
                    : {
                        hAlign: 'left',
                        vAlign: 'top',
                        x: box.x + nodePadding,
                        y: box.y + nodePadding,
                    })),
                value: hasValueText
                    ? {
                        text: valueText,
                        style: valueStyle,
                        hAlign: 'center',
                        vAlign: 'middle',
                        x: box.x + box.width / 2,
                        y: box.y + box.height / 2 + labelSize.height / 2 + valueMargin / 2,
                    }
                    : undefined,
            });
        });
        return labelMeta;
    }
    getDomain(_direction) {
        return [0, 1];
    }
    getNodeClickEvent(event, datum) {
        return new TreemapSeriesNodeClickEvent(this.labelKey, this.sizeKey, this.colorKey, event, datum, this);
    }
    getNodeDoubleClickEvent(event, datum) {
        return new TreemapSeriesNodeDoubleClickEvent(this.labelKey, this.sizeKey, this.colorKey, event, datum, this);
    }
    getTooltipHtml(nodeDatum) {
        var _a, _b, _c, _d;
        if (!this.highlightGroups && !nodeDatum.isLeaf) {
            return '';
        }
        const { tooltip, sizeKey, labelKey, colorKey, rootName, id: seriesId, labels, ctx: { callbackCache }, } = this;
        const { datum } = nodeDatum;
        const { renderer: tooltipRenderer } = tooltip;
        const title = nodeDatum.depth ? datum[labelKey] : (_a = datum[labelKey]) !== null && _a !== void 0 ? _a : rootName;
        let content = '';
        const format = this.getTileFormat(nodeDatum, false);
        const color = (_c = (_b = format === null || format === void 0 ? void 0 : format.fill) !== null && _b !== void 0 ? _b : nodeDatum.fill) !== null && _c !== void 0 ? _c : 'gray';
        const valueKey = labels.value.key;
        const valueFormatter = labels.value.formatter;
        if (valueKey || valueFormatter) {
            let valueText = '';
            if (valueFormatter) {
                valueText = callbackCache.call(valueFormatter, { datum });
            }
            else {
                const value = datum[valueKey];
                if (typeof value === 'number' && isFinite(value)) {
                    valueText = number_1.toFixed(value);
                }
            }
            if (valueText) {
                if (labels.value.name) {
                    content += `<b>${labels.value.name}:</b> `;
                }
                content += valueText;
            }
        }
        const defaults = {
            title,
            backgroundColor: color,
            content,
        };
        if (tooltipRenderer) {
            return tooltip_1.toTooltipHtml(tooltipRenderer({
                datum: nodeDatum.datum,
                parent: (_d = nodeDatum.parent) === null || _d === void 0 ? void 0 : _d.datum,
                depth: nodeDatum.depth,
                sizeKey,
                labelKey,
                colorKey,
                title,
                color,
                seriesId,
            }), defaults);
        }
        if (!title && !content) {
            return '';
        }
        return tooltip_1.toTooltipHtml(defaults);
    }
    getLegendData() {
        // Override point for subclasses.
        return [];
    }
}
TreemapSeries.className = 'TreemapSeries';
TreemapSeries.type = 'treemap';
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], TreemapSeries.prototype, "nodePadding", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], TreemapSeries.prototype, "nodeGap", void 0);
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
    validation_1.Validate(validation_1.OPT_STRING)
], TreemapSeries.prototype, "groupFill", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_COLOR_STRING)
], TreemapSeries.prototype, "groupStroke", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_NUMBER(0))
], TreemapSeries.prototype, "groupStrokeWidth", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_COLOR_STRING)
], TreemapSeries.prototype, "tileStroke", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_NUMBER(0))
], TreemapSeries.prototype, "tileStrokeWidth", void 0);
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
__decorate([
    validation_1.Validate(validation_1.OPT_BOOLEAN)
], TreemapSeries.prototype, "highlightGroups", void 0);
exports.TreemapSeries = TreemapSeries;
