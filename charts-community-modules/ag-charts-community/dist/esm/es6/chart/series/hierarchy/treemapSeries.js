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
import { Selection } from '../../../scene/selection';
import { Label } from '../../label';
import { SeriesTooltip, HighlightStyle, SeriesNodeBaseClickEvent } from '../series';
import { HierarchySeries } from './hierarchySeries';
import { toTooltipHtml } from '../../tooltip/tooltip';
import { Group } from '../../../scene/group';
import { Text } from '../../../scene/shape/text';
import { Rect } from '../../../scene/shape/rect';
import { DropShadow } from '../../../scene/dropShadow';
import { ColorScale } from '../../../scale/colorScale';
import { toFixed, isEqual } from '../../../util/number';
import { BBox } from '../../../scene/bbox';
import { Color } from '../../../util/color';
import { BOOLEAN, NUMBER, NUMBER_ARRAY, OPT_BOOLEAN, OPT_COLOR_STRING, OPT_FUNCTION, OPT_NUMBER, OPT_STRING, STRING, COLOR_STRING_ARRAY, Validate, TEXT_WRAP, } from '../../../util/validation';
import { Logger } from '../../../util/logger';
class TreemapSeriesTooltip extends SeriesTooltip {
    constructor() {
        super(...arguments);
        this.renderer = undefined;
    }
}
__decorate([
    Validate(OPT_FUNCTION)
], TreemapSeriesTooltip.prototype, "renderer", void 0);
class TreemapSeriesNodeBaseClickEvent extends SeriesNodeBaseClickEvent {
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
class TreemapSeriesLabel extends Label {
    constructor() {
        super(...arguments);
        this.padding = 10;
    }
}
__decorate([
    Validate(NUMBER(0))
], TreemapSeriesLabel.prototype, "padding", void 0);
class TreemapSeriesTileLabel extends Label {
    constructor() {
        super(...arguments);
        this.wrapping = 'on-space';
    }
}
__decorate([
    Validate(TEXT_WRAP)
], TreemapSeriesTileLabel.prototype, "wrapping", void 0);
class TreemapValueLabel {
    constructor() {
        this.style = (() => {
            const label = new Label();
            label.color = 'white';
            return label;
        })();
    }
}
__decorate([
    Validate(OPT_STRING)
], TreemapValueLabel.prototype, "key", void 0);
__decorate([
    Validate(OPT_STRING)
], TreemapValueLabel.prototype, "name", void 0);
__decorate([
    Validate(OPT_FUNCTION)
], TreemapValueLabel.prototype, "formatter", void 0);
var TextNodeTag;
(function (TextNodeTag) {
    TextNodeTag[TextNodeTag["Name"] = 0] = "Name";
    TextNodeTag[TextNodeTag["Value"] = 1] = "Value";
})(TextNodeTag || (TextNodeTag = {}));
const tempText = new Text();
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
    if (typeof color === 'string' && !Color.validColorString(color)) {
        const fallbackColor = 'black';
        Logger.warnOnce(`invalid Treemap tile colour string "${color}". Affected treemap tiles will be coloured ${fallbackColor}.`);
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
    Validate(OPT_COLOR_STRING)
], TreemapTextHighlightStyle.prototype, "color", void 0);
class TreemapHighlightStyle extends HighlightStyle {
    constructor() {
        super(...arguments);
        this.text = new TreemapTextHighlightStyle();
    }
}
export class TreemapSeries extends HierarchySeries {
    constructor() {
        super(...arguments);
        this.groupSelection = Selection.select(this.contentGroup, Group);
        this.highlightSelection = Selection.select(this.highlightGroup, Group);
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
        this.tileShadow = new DropShadow();
        this.labelShadow = new DropShadow();
        this.tooltip = new TreemapSeriesTooltip();
        this.highlightStyle = new TreemapHighlightStyle();
    }
    getNodePaddingTop(nodeDatum, bbox) {
        var _a;
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
        return textSize.height + nodePadding + ((_a = font.padding) !== null && _a !== void 0 ? _a : 0);
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
        const innerBox = new BBox(bbox.x + padding.left, bbox.y + padding.top, width, height);
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
                const childBox = new BBox(x, y, width, height);
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
            const childBox = new BBox(x, y, width, height);
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
            if (!isEqual(innerBounds[side], childBounds[side])) {
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
            const colorScale = new ColorScale();
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
                    const rect = new Rect();
                    const nameLabel = new Text();
                    nameLabel.tag = TextNodeTag.Name;
                    const valueLabel = new Text();
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
            const boxes = this.squarify(this.dataRoot, new BBox(0, 0, seriesRect.width, seriesRect.height));
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
                    const start = Color.tryParseFromString(fill).brighter().toString();
                    const end = Color.tryParseFromString(fill).darker().toString();
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
            this.groupSelection.selectByClass(Rect).forEach((rect) => updateRectFn(rect, rect.datum, false));
            this.highlightSelection.selectByClass(Rect).forEach((rect) => {
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
            const valueMargin = Math.ceil(valueStyle.fontSize * 2 * (Text.defaultLineHeightRatio - 1));
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
                        const wrapped = Text.wrap(labelText, availTextWidth, availHeight, style, style.wrapping);
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
                    valueText = toFixed(value);
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
            return toTooltipHtml(tooltipRenderer({
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
        return toTooltipHtml(defaults);
    }
    getLegendData() {
        // Override point for subclasses.
        return [];
    }
}
TreemapSeries.className = 'TreemapSeries';
TreemapSeries.type = 'treemap';
__decorate([
    Validate(NUMBER(0))
], TreemapSeries.prototype, "nodePadding", void 0);
__decorate([
    Validate(NUMBER(0))
], TreemapSeries.prototype, "nodeGap", void 0);
__decorate([
    Validate(STRING)
], TreemapSeries.prototype, "labelKey", void 0);
__decorate([
    Validate(OPT_STRING)
], TreemapSeries.prototype, "sizeKey", void 0);
__decorate([
    Validate(OPT_STRING)
], TreemapSeries.prototype, "colorKey", void 0);
__decorate([
    Validate(NUMBER_ARRAY)
], TreemapSeries.prototype, "colorDomain", void 0);
__decorate([
    Validate(COLOR_STRING_ARRAY)
], TreemapSeries.prototype, "colorRange", void 0);
__decorate([
    Validate(OPT_STRING)
], TreemapSeries.prototype, "groupFill", void 0);
__decorate([
    Validate(OPT_COLOR_STRING)
], TreemapSeries.prototype, "groupStroke", void 0);
__decorate([
    Validate(OPT_NUMBER(0))
], TreemapSeries.prototype, "groupStrokeWidth", void 0);
__decorate([
    Validate(OPT_COLOR_STRING)
], TreemapSeries.prototype, "tileStroke", void 0);
__decorate([
    Validate(OPT_NUMBER(0))
], TreemapSeries.prototype, "tileStrokeWidth", void 0);
__decorate([
    Validate(BOOLEAN)
], TreemapSeries.prototype, "gradient", void 0);
__decorate([
    Validate(OPT_FUNCTION)
], TreemapSeries.prototype, "formatter", void 0);
__decorate([
    Validate(STRING)
], TreemapSeries.prototype, "colorName", void 0);
__decorate([
    Validate(STRING)
], TreemapSeries.prototype, "rootName", void 0);
__decorate([
    Validate(OPT_BOOLEAN)
], TreemapSeries.prototype, "highlightGroups", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZW1hcFNlcmllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9zZXJpZXMvaGllcmFyY2h5L3RyZWVtYXBTZXJpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDcEMsT0FBTyxFQUFtQixhQUFhLEVBQUUsY0FBYyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQ3JHLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNwRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDdEQsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNqRCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDakQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3ZELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUd2RCxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUMzQyxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDNUMsT0FBTyxFQUNILE9BQU8sRUFDUCxNQUFNLEVBQ04sWUFBWSxFQUNaLFdBQVcsRUFDWCxnQkFBZ0IsRUFDaEIsWUFBWSxFQUNaLFVBQVUsRUFDVixVQUFVLEVBQ1YsTUFBTSxFQUNOLGtCQUFrQixFQUNsQixRQUFRLEVBQ1IsU0FBUyxHQUNaLE1BQU0sMEJBQTBCLENBQUM7QUFTbEMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBb0I5QyxNQUFNLG9CQUFxQixTQUFRLGFBQWE7SUFBaEQ7O1FBRUksYUFBUSxHQUE2RixTQUFTLENBQUM7SUFDbkgsQ0FBQztDQUFBO0FBREc7SUFEQyxRQUFRLENBQUMsWUFBWSxDQUFDO3NEQUN3RjtBQUduSCxNQUFNLCtCQUFnQyxTQUFRLHdCQUE2QjtJQUt2RSxZQUNJLFFBQWdCLEVBQ2hCLE9BQTJCLEVBQzNCLFFBQTRCLEVBQzVCLFdBQXVCLEVBQ3ZCLEtBQXVCLEVBQ3ZCLE1BQXFCO1FBRXJCLEtBQUssQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0lBQzdCLENBQUM7Q0FDSjtBQUVELE1BQU0sMkJBQTRCLFNBQVEsK0JBQStCO0lBQXpFOztRQUNhLFNBQUksR0FBRyxXQUFXLENBQUM7SUFDaEMsQ0FBQztDQUFBO0FBRUQsTUFBTSxpQ0FBa0MsU0FBUSwrQkFBK0I7SUFBL0U7O1FBQ2EsU0FBSSxHQUFHLGlCQUFpQixDQUFDO0lBQ3RDLENBQUM7Q0FBQTtBQUVELE1BQU0sa0JBQW1CLFNBQVEsS0FBSztJQUF0Qzs7UUFFSSxZQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ2pCLENBQUM7Q0FBQTtBQURHO0lBREMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQzttREFDUDtBQUdqQixNQUFNLHNCQUF1QixTQUFRLEtBQUs7SUFBMUM7O1FBRUksYUFBUSxHQUFhLFVBQVUsQ0FBQztJQUNwQyxDQUFDO0NBQUE7QUFERztJQURDLFFBQVEsQ0FBQyxTQUFTLENBQUM7d0RBQ1k7QUFHcEMsTUFBTSxpQkFBaUI7SUFBdkI7UUFVSSxVQUFLLEdBQUcsQ0FBQyxHQUFHLEVBQUU7WUFDVixNQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO1lBQzFCLEtBQUssQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDO1lBQ3RCLE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDVCxDQUFDO0NBQUE7QUFiRztJQURDLFFBQVEsQ0FBQyxVQUFVLENBQUM7OENBQ1I7QUFHYjtJQURDLFFBQVEsQ0FBQyxVQUFVLENBQUM7K0NBQ1A7QUFHZDtJQURDLFFBQVEsQ0FBQyxZQUFZLENBQUM7b0RBQ29DO0FBUy9ELElBQUssV0FHSjtBQUhELFdBQUssV0FBVztJQUNaLDZDQUFJLENBQUE7SUFDSiwrQ0FBSyxDQUFBO0FBQ1QsQ0FBQyxFQUhJLFdBQVcsS0FBWCxXQUFXLFFBR2Y7QUFFRCxNQUFNLFFBQVEsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0FBRTVCLFNBQVMsV0FBVyxDQUFDLElBQVksRUFBRSxLQUFZO0lBQzNDLE1BQU0sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsR0FBRyxLQUFLLENBQUM7SUFDOUQsUUFBUSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7SUFDL0IsUUFBUSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7SUFDakMsUUFBUSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7SUFDN0IsUUFBUSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7SUFDakMsUUFBUSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDckIsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDZixRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNmLFFBQVEsQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDO0lBQzVCLFFBQVEsQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO0lBQzlCLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ2pELE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUM7QUFDN0IsQ0FBQztBQUVELFNBQVMsYUFBYSxDQUFDLEtBQWM7SUFDakMsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDN0QsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDO1FBQzlCLE1BQU0sQ0FBQyxRQUFRLENBQ1gsdUNBQXVDLEtBQUssOENBQThDLGFBQWEsR0FBRyxDQUM3RyxDQUFDO1FBQ0YsT0FBTyxPQUFPLENBQUM7S0FDbEI7SUFFRCxPQUFPLEtBQUssQ0FBQztBQUNqQixDQUFDO0FBRUQsTUFBTSx5QkFBeUI7SUFBL0I7UUFFSSxVQUFLLEdBQVksT0FBTyxDQUFDO0lBQzdCLENBQUM7Q0FBQTtBQURHO0lBREMsUUFBUSxDQUFDLGdCQUFnQixDQUFDO3dEQUNGO0FBRzdCLE1BQU0scUJBQXNCLFNBQVEsY0FBYztJQUFsRDs7UUFDYSxTQUFJLEdBQUcsSUFBSSx5QkFBeUIsRUFBRSxDQUFDO0lBQ3BELENBQUM7Q0FBQTtBQUVELE1BQU0sT0FBTyxhQUFjLFNBQVEsZUFBaUM7SUFBcEU7O1FBSVksbUJBQWMsR0FBdUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2hHLHVCQUFrQixHQUF1QyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFJckcsVUFBSyxHQUF1QixDQUFDLEdBQUcsRUFBRTtZQUN2QyxNQUFNLEtBQUssR0FBRyxJQUFJLGtCQUFrQixFQUFFLENBQUM7WUFDdkMsS0FBSyxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUM7WUFDdEIsS0FBSyxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUM7WUFDMUIsS0FBSyxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7WUFDcEIsS0FBSyxDQUFDLFVBQVUsR0FBRyxxQkFBcUIsQ0FBQztZQUN6QyxLQUFLLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUNuQixPQUFPLEtBQUssQ0FBQztRQUNqQixDQUFDLENBQUMsRUFBRSxDQUFDO1FBRUksYUFBUSxHQUF1QixDQUFDLEdBQUcsRUFBRTtZQUMxQyxNQUFNLEtBQUssR0FBRyxJQUFJLGtCQUFrQixFQUFFLENBQUM7WUFDdkMsS0FBSyxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUM7WUFDdEIsS0FBSyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7WUFDbkIsS0FBSyxDQUFDLFVBQVUsR0FBRyxxQkFBcUIsQ0FBQztZQUN6QyxLQUFLLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUNuQixPQUFPLEtBQUssQ0FBQztRQUNqQixDQUFDLENBQUMsRUFBRSxDQUFDO1FBRUksV0FBTSxHQUFHO1lBQ2QsS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFO2dCQUNULE1BQU0sS0FBSyxHQUFHLElBQUksc0JBQXNCLEVBQUUsQ0FBQztnQkFDM0MsS0FBSyxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUM7Z0JBQ3RCLEtBQUssQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDO2dCQUMxQixLQUFLLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztnQkFDcEIsT0FBTyxLQUFLLENBQUM7WUFDakIsQ0FBQyxDQUFDLEVBQUU7WUFDSixNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUU7Z0JBQ1YsTUFBTSxLQUFLLEdBQUcsSUFBSSxzQkFBc0IsRUFBRSxDQUFDO2dCQUMzQyxLQUFLLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQztnQkFDdEIsS0FBSyxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUM7Z0JBQzFCLEtBQUssQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO2dCQUNwQixPQUFPLEtBQUssQ0FBQztZQUNqQixDQUFDLENBQUMsRUFBRTtZQUNKLEtBQUssRUFBRSxDQUFDLEdBQUcsRUFBRTtnQkFDVCxNQUFNLEtBQUssR0FBRyxJQUFJLHNCQUFzQixFQUFFLENBQUM7Z0JBQzNDLEtBQUssQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDO2dCQUN0QixLQUFLLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQztnQkFDMUIsS0FBSyxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7Z0JBQ3BCLE9BQU8sS0FBSyxDQUFDO1lBQ2pCLENBQUMsQ0FBQyxFQUFFO1lBQ0osU0FBUyxFQUFFLFNBQTJEO1lBQ3RFLEtBQUssRUFBRSxJQUFJLGlCQUFpQixFQUFFO1NBQ2pDLENBQUM7UUFHRixnQkFBVyxHQUFHLENBQUMsQ0FBQztRQUdoQixZQUFPLEdBQUcsQ0FBQyxDQUFDO1FBR1osYUFBUSxHQUFXLE9BQU8sQ0FBQztRQUczQixZQUFPLEdBQVksTUFBTSxDQUFDO1FBRzFCLGFBQVEsR0FBWSxPQUFPLENBQUM7UUFHNUIsZ0JBQVcsR0FBYSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBR2hDLGVBQVUsR0FBYSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUc5QyxjQUFTLEdBQVcsU0FBUyxDQUFDO1FBRzlCLGdCQUFXLEdBQVcsT0FBTyxDQUFDO1FBRzlCLHFCQUFnQixHQUFXLENBQUMsQ0FBQztRQUc3QixlQUFVLEdBQVcsT0FBTyxDQUFDO1FBRzdCLG9CQUFlLEdBQVcsQ0FBQyxDQUFDO1FBRzVCLGFBQVEsR0FBWSxJQUFJLENBQUM7UUFHekIsY0FBUyxHQUF1RSxTQUFTLENBQUM7UUFHMUYsY0FBUyxHQUFXLFFBQVEsQ0FBQztRQUc3QixhQUFRLEdBQVcsTUFBTSxDQUFDO1FBRzFCLG9CQUFlLEdBQVksSUFBSSxDQUFDO1FBRWhDLGVBQVUsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO1FBRTlCLGdCQUFXLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztRQUV0QixZQUFPLEdBQUcsSUFBSSxvQkFBb0IsRUFBRSxDQUFDO1FBRXJDLG1CQUFjLEdBQUcsSUFBSSxxQkFBcUIsRUFBRSxDQUFDO0lBa3NCMUQsQ0FBQztJQWhzQlcsaUJBQWlCLENBQUMsU0FBMkIsRUFBRSxJQUFVOztRQUM3RCxNQUFNLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDOUMsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQztRQUM5QixJQUFJLFNBQVMsQ0FBQyxNQUFNLElBQUksQ0FBQyxLQUFLLElBQUksU0FBUyxDQUFDLEtBQUssS0FBSyxDQUFDLEVBQUU7WUFDckQsT0FBTyxXQUFXLENBQUM7U0FDdEI7UUFFRCxNQUFNLElBQUksR0FBRyxTQUFTLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDcEQsTUFBTSxRQUFRLEdBQUcsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMxQyxNQUFNLG9CQUFvQixHQUFHLENBQUMsQ0FBQztRQUMvQixJQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxvQkFBb0IsSUFBSSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsb0JBQW9CLEVBQUU7WUFDekcsT0FBTyxXQUFXLENBQUM7U0FDdEI7UUFFRCxJQUFJLFFBQVEsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNoQyxPQUFPLFdBQVcsQ0FBQztTQUN0QjtRQUVELE9BQU8sUUFBUSxDQUFDLE1BQU0sR0FBRyxXQUFXLEdBQUcsQ0FBQyxNQUFBLElBQUksQ0FBQyxPQUFPLG1DQUFJLENBQUMsQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFFTyxjQUFjLENBQUMsU0FBMkIsRUFBRSxJQUFVO1FBQzFELE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDN0IsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNwRCxPQUFPO1lBQ0gsR0FBRztZQUNILEtBQUssRUFBRSxXQUFXO1lBQ2xCLE1BQU0sRUFBRSxXQUFXO1lBQ25CLElBQUksRUFBRSxXQUFXO1NBQ3BCLENBQUM7SUFDTixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ssUUFBUSxDQUNaLFNBQTJCLEVBQzNCLElBQVUsRUFDVixtQkFBZ0QsSUFBSSxHQUFHLEVBQUU7UUFFekQsSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtZQUNyQyxPQUFPLGdCQUFnQixDQUFDO1NBQzNCO1FBRUQsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUV0QyxNQUFNLHFCQUFxQixHQUFHLENBQUMsQ0FBQyxDQUFDLCtDQUErQztRQUNoRixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNyRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztRQUN4RCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUMxRCxJQUFJLEtBQUssSUFBSSxDQUFDLElBQUksTUFBTSxJQUFJLENBQUMsSUFBSSxTQUFTLENBQUMsS0FBSyxJQUFJLENBQUMsRUFBRTtZQUNuRCxPQUFPLGdCQUFnQixDQUFDO1NBQzNCO1FBRUQsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztRQUNuQixJQUFJLFlBQVksR0FBRyxRQUFRLENBQUM7UUFDNUIsSUFBSSxZQUFZLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQztRQUNuQyxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDO1FBQ3BDLE1BQU0sUUFBUSxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3RGLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUVuQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN0QyxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQ2hDLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFDOUMsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDO1lBQ3RELFFBQVEsSUFBSSxLQUFLLENBQUM7WUFFbEIsTUFBTSxhQUFhLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO1lBQ3RFLE1BQU0sVUFBVSxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztZQUNuRSxNQUFNLGVBQWUsR0FBRyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsR0FBRyxRQUFRLENBQUM7WUFDN0QsSUFBSSxjQUFjLEdBQUcsQ0FBQyxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsWUFBWSxDQUFDO1lBRS9ELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLGNBQWMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ3BHLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMscUJBQXFCLEdBQUcsS0FBSyxDQUFDLENBQUM7WUFDckQsSUFBSSxJQUFJLEdBQUcsWUFBWSxFQUFFO2dCQUNyQixZQUFZLEdBQUcsSUFBSSxDQUFDO2dCQUNwQixTQUFTO2FBQ1o7WUFFRCw4Q0FBOEM7WUFDOUMsUUFBUSxJQUFJLEtBQUssQ0FBQztZQUNsQixjQUFjLEdBQUcsQ0FBQyxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsWUFBWSxDQUFDO1lBQzNELElBQUksS0FBSyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNuRCxLQUFLLElBQUksQ0FBQyxHQUFHLFVBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNqQyxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRTFCLE1BQU0sQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUMzQyxNQUFNLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztnQkFDM0MsTUFBTSxNQUFNLEdBQUcsQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLFFBQVEsQ0FBQztnQkFDckQsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQztnQkFDbkQsTUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztnQkFFcEQsTUFBTSxRQUFRLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQy9DLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUNsQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztnQkFFakQsWUFBWSxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUM7Z0JBQzVCLEtBQUssSUFBSSxNQUFNLENBQUM7YUFDbkI7WUFFRCxJQUFJLFVBQVUsRUFBRTtnQkFDWixTQUFTLENBQUMsQ0FBQyxJQUFJLGNBQWMsQ0FBQztnQkFDOUIsU0FBUyxDQUFDLE1BQU0sSUFBSSxjQUFjLENBQUM7YUFDdEM7aUJBQU07Z0JBQ0gsU0FBUyxDQUFDLENBQUMsSUFBSSxjQUFjLENBQUM7Z0JBQzlCLFNBQVMsQ0FBQyxLQUFLLElBQUksY0FBYyxDQUFDO2FBQ3JDO1lBQ0QsVUFBVSxHQUFHLENBQUMsQ0FBQztZQUNmLFFBQVEsR0FBRyxDQUFDLENBQUM7WUFDYixZQUFZLEdBQUcsUUFBUSxDQUFDO1lBQ3hCLENBQUMsRUFBRSxDQUFDO1NBQ1A7UUFFRCwwQkFBMEI7UUFDMUIsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDO1FBQ3RELElBQUksS0FBSyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNuRCxLQUFLLElBQUksQ0FBQyxHQUFHLFVBQVUsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUMvQyxNQUFNLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUMzQyxNQUFNLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUMzQyxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLFlBQVksQ0FBQztZQUM5QyxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsS0FBSyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hELE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDMUQsTUFBTSxRQUFRLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDL0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDbEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixDQUFDLENBQUM7WUFDdkQsS0FBSyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7U0FDeEM7UUFFRCxPQUFPLGdCQUFnQixDQUFDO0lBQzVCLENBQUM7SUFFTyxRQUFRLENBQUMsUUFBYyxFQUFFLFFBQWM7UUFDM0MsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFDN0IsTUFBTSxTQUFTLEdBQUcsQ0FBQyxHQUFTLEVBQXdCLEVBQUU7WUFDbEQsT0FBTztnQkFDSCxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ1gsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUNWLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxLQUFLO2dCQUN4QixNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTTthQUM3QixDQUFDO1FBQ04sQ0FBQyxDQUFDO1FBQ0YsTUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3hDLE1BQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN4QyxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBVyxDQUFDO1FBQ2pELEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUNuQixJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRTtnQkFDaEQsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDOUI7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFSyxXQUFXOztZQUNiLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNaLE9BQU87YUFDVjtZQUVELE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUM7WUFDdkYsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUM7WUFFN0MsTUFBTSxVQUFVLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztZQUNwQyxVQUFVLENBQUMsTUFBTSxHQUFHLFdBQVcsQ0FBQztZQUNoQyxVQUFVLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQztZQUM5QixVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7WUFFcEIsTUFBTSxtQkFBbUIsR0FBRyxDQUFDLEtBQWdCLEVBQUUsS0FBSyxHQUFHLENBQUMsRUFBRSxNQUF5QixFQUFFLEVBQUU7O2dCQUNuRixJQUFJLEtBQUssQ0FBQztnQkFDVixJQUFJLGNBQWMsRUFBRTtvQkFDaEIsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO2lCQUNsRTtnQkFDRCxJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUU7b0JBQ3JCLCtDQUErQztpQkFDbEQ7cUJBQU0sSUFBSSxRQUFRLEVBQUU7b0JBQ2pCLEtBQUssR0FBRyxNQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsbUNBQUksRUFBRSxDQUFDO2lCQUNqQztxQkFBTTtvQkFDSCxLQUFLLEdBQUcsRUFBRSxDQUFDO2lCQUNkO2dCQUNELElBQUksZUFBZSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBQSxLQUFLLENBQUMsUUFBUSxDQUFDLG1DQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO2dCQUNsRSxlQUFlLEdBQUcsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUNqRCxNQUFNLE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7Z0JBQy9CLElBQUksSUFBSSxHQUFHLFNBQVMsQ0FBQztnQkFDckIsSUFBSSxPQUFPLGVBQWUsS0FBSyxRQUFRLEVBQUU7b0JBQ3JDLElBQUksR0FBRyxlQUFlLENBQUM7aUJBQzFCO3FCQUFNLElBQUksTUFBTSxJQUFJLENBQUMsU0FBUyxFQUFFO29CQUM3QixJQUFJLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztpQkFDOUM7Z0JBQ0QsTUFBTSxTQUFTLEdBQXFCO29CQUNoQyxLQUFLO29CQUNMLEtBQUs7b0JBQ0wsTUFBTTtvQkFDTixLQUFLLEVBQUUsQ0FBQztvQkFDUixLQUFLO29CQUNMLElBQUk7b0JBQ0osTUFBTSxFQUFFLElBQUk7b0JBQ1osTUFBTTtvQkFDTixRQUFRLEVBQUUsRUFBd0I7aUJBQ3JDLENBQUM7Z0JBQ0YsSUFBSSxNQUFNLEVBQUU7b0JBQ1IsU0FBUyxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQUEsS0FBSyxDQUFDLE9BQU8sQ0FBQyxtQ0FBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDdkQ7cUJBQU07b0JBQ0gsS0FBSyxDQUFDLFFBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTt3QkFDOUIsTUFBTSxjQUFjLEdBQUcsbUJBQW1CLENBQUMsS0FBSyxFQUFFLEtBQUssR0FBRyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7d0JBQ3hFLE1BQU0sS0FBSyxHQUFHLGNBQWMsQ0FBQyxLQUFLLENBQUM7d0JBQ25DLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7NEJBQ2pELE9BQU87eUJBQ1Y7d0JBQ0QsU0FBUyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUM7d0JBQ3pCLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUM1QyxDQUFDLENBQUMsQ0FBQztvQkFDSCxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTt3QkFDN0IsT0FBTyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7b0JBQzdCLENBQUMsQ0FBQyxDQUFDO2lCQUNOO2dCQUNELE9BQU8sU0FBUyxDQUFDO1lBQ3JCLENBQUMsQ0FBQztZQUNGLElBQUksQ0FBQyxRQUFRLEdBQUcsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUMsQ0FBQztLQUFBO0lBRUssY0FBYzs7WUFDaEIsT0FBTyxFQUFFLENBQUM7UUFDZCxDQUFDO0tBQUE7SUFFSyxNQUFNOztZQUNSLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDOUIsTUFBTSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDN0IsQ0FBQztLQUFBO0lBRUssZ0JBQWdCOztZQUNsQixJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRTtnQkFDdkIsT0FBTzthQUNWO1lBQ0QsSUFBSSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUM7WUFFN0IsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUM7WUFFakMsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDckIsT0FBTzthQUNWO1lBRUQsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBRXpDLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ2IsT0FBTzthQUNWO1lBRUQsTUFBTSxXQUFXLEdBQUcsRUFBd0IsQ0FBQztZQUM3QyxNQUFNLFFBQVEsR0FBRyxDQUFDLEtBQXVCLEVBQUUsRUFBRTs7Z0JBQ3pDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3hCLE1BQUEsS0FBSyxDQUFDLFFBQVEsMENBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3RDLENBQUMsQ0FBQztZQUNGLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUyxDQUFDLENBQUM7WUFFekIsTUFBTSxFQUFFLGNBQWMsRUFBRSxrQkFBa0IsRUFBRSxHQUFHLElBQUksQ0FBQztZQUNwRCxNQUFNLE1BQU0sR0FBRyxDQUFDLFNBQWdDLEVBQUUsRUFBRTtnQkFDaEQsT0FBTyxTQUFTLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFO29CQUMzQyxNQUFNLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO29CQUV4QixNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO29CQUM3QixTQUFTLENBQUMsR0FBRyxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUM7b0JBRWpDLE1BQU0sVUFBVSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7b0JBQzlCLFVBQVUsQ0FBQyxHQUFHLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQztvQkFFbkMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztnQkFDaEQsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUM7WUFFRixJQUFJLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM3QyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDekQsQ0FBQztLQUFBO0lBRU8sa0JBQWtCLENBQUMsS0FBdUI7O1FBQzlDLE1BQU0sZ0JBQWdCLEdBQUcsTUFBQSxJQUFJLENBQUMsZ0JBQWdCLDBDQUFFLGtCQUFrQixFQUFFLENBQUM7UUFDckUsT0FBTyxLQUFLLEtBQUssZ0JBQWdCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNoRixDQUFDO0lBRU8sYUFBYSxDQUFDLEtBQXVCLEVBQUUsYUFBc0I7O1FBQ2pFLE1BQU0sRUFDRixTQUFTLEVBQ1QsR0FBRyxFQUFFLEVBQUUsYUFBYSxFQUFFLEdBQ3pCLEdBQUcsSUFBSSxDQUFDO1FBQ1QsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNaLE9BQU8sRUFBRSxDQUFDO1NBQ2I7UUFFRCxNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUFFLEdBQ3ZHLElBQUksQ0FBQztRQUVULE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO1FBQ3ZELE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUM7UUFFdEUsTUFBTSxNQUFNLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDekMsUUFBUSxFQUFFLElBQUksQ0FBQyxFQUFFO1lBQ2pCLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSztZQUNsQixLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUs7WUFDbEIsTUFBTSxFQUFFLE1BQUEsS0FBSyxDQUFDLE1BQU0sMENBQUUsS0FBSztZQUMzQixRQUFRO1lBQ1IsT0FBTztZQUNQLFFBQVE7WUFDUixJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7WUFDaEIsTUFBTTtZQUNOLFdBQVc7WUFDWCxRQUFRO1lBQ1IsV0FBVyxFQUFFLGFBQWE7U0FDN0IsQ0FBQyxDQUFDO1FBRUgsT0FBTyxNQUFNLGFBQU4sTUFBTSxjQUFOLE1BQU0sR0FBSSxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVLLFdBQVc7O1lBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ2IsT0FBTzthQUNWO1lBRUQsTUFBTSxFQUNGLFFBQVEsRUFDUixjQUFjLEVBQUUsRUFDWixJQUFJLEVBQUUsRUFDRixJQUFJLEVBQUUsZUFBZSxFQUNyQixXQUFXLEVBQUUsc0JBQXNCLEVBQ25DLE1BQU0sRUFBRSxpQkFBaUIsRUFDekIsV0FBVyxFQUFFLDJCQUEyQixHQUMzQyxFQUNELElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxvQkFBb0IsRUFBRSxHQUN4QyxFQUNELFVBQVUsRUFDVixlQUFlLEVBQ2YsV0FBVyxFQUNYLGdCQUFnQixFQUNoQixVQUFVLEVBQ1YsV0FBVyxHQUNkLEdBQUcsSUFBSSxDQUFDO1lBRVQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUcsQ0FBQztZQUMvQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFTLEVBQUUsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxVQUFVLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ2pHLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDN0MsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUV4RCxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFL0IsTUFBTSxZQUFZLEdBQUcsQ0FBQyxJQUFVLEVBQUUsS0FBdUIsRUFBRSxrQkFBMkIsRUFBRSxFQUFFOztnQkFDdEYsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUUsQ0FBQztnQkFDOUIsSUFBSSxDQUFDLEdBQUcsRUFBRTtvQkFDTixJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztvQkFDckIsT0FBTztpQkFDVjtnQkFFRCxNQUFNLElBQUksR0FBRyxrQkFBa0IsSUFBSSxlQUFlLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7Z0JBQ2hHLE1BQU0sV0FBVyxHQUFHLE1BQUEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxtQ0FBSSxDQUFDLENBQUM7Z0JBQzNFLElBQUksTUFBTSxHQUFHLFdBQVcsQ0FBQztnQkFDekIsSUFBSSxrQkFBa0IsSUFBSSxpQkFBaUIsS0FBSyxTQUFTLEVBQUU7b0JBQ3ZELE1BQU0sR0FBRyxpQkFBaUIsQ0FBQztpQkFDOUI7cUJBQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFO29CQUNyQixNQUFNLEdBQUcsVUFBVSxDQUFDO2lCQUN2QjtnQkFDRCxJQUFJLFdBQVcsR0FBRyxnQkFBZ0IsQ0FBQztnQkFDbkMsSUFBSSxrQkFBa0IsSUFBSSwyQkFBMkIsS0FBSyxTQUFTLEVBQUU7b0JBQ2pFLFdBQVcsR0FBRywyQkFBMkIsQ0FBQztpQkFDN0M7cUJBQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFO29CQUNyQixXQUFXLEdBQUcsZUFBZSxDQUFDO2lCQUNqQztnQkFDRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO2dCQUU3RCxNQUFNLFNBQVMsR0FBRyxhQUFhLENBQUMsTUFBQSxNQUFNLGFBQU4sTUFBTSx1QkFBTixNQUFNLENBQUUsSUFBSSxtQ0FBSSxJQUFJLENBQUMsQ0FBQztnQkFDdEQsSUFBSSxNQUFBLE1BQU0sYUFBTixNQUFNLHVCQUFOLE1BQU0sQ0FBRSxRQUFRLG1DQUFJLFFBQVEsRUFBRTtvQkFDOUIsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO29CQUNuRSxNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7b0JBQy9ELElBQUksQ0FBQyxJQUFJLEdBQUcsMkJBQTJCLEtBQUssS0FBSyxHQUFHLEdBQUcsQ0FBQztpQkFDM0Q7cUJBQU07b0JBQ0gsSUFBSSxDQUFDLElBQUksR0FBRyxTQUFTLENBQUM7aUJBQ3pCO2dCQUNELElBQUksQ0FBQyxXQUFXLEdBQUcsTUFBQSxNQUFNLGFBQU4sTUFBTSx1QkFBTixNQUFNLENBQUUsV0FBVyxtQ0FBSSxXQUFXLENBQUM7Z0JBQ3RELElBQUksQ0FBQyxNQUFNLEdBQUcsYUFBYSxDQUFDLE1BQUEsTUFBTSxhQUFOLE1BQU0sdUJBQU4sTUFBTSxDQUFFLE1BQU0sbUNBQUksTUFBTSxDQUFDLENBQUM7Z0JBQ3RELElBQUksQ0FBQyxXQUFXLEdBQUcsTUFBQSxNQUFNLGFBQU4sTUFBTSx1QkFBTixNQUFNLENBQUUsV0FBVyxtQ0FBSSxXQUFXLENBQUM7Z0JBQ3RELElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO2dCQUM3QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztnQkFFbEIsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNmLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDZixJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7Z0JBQ3ZCLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQztnQkFDekIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDeEIsQ0FBQyxDQUFDO1lBQ0YsSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNqRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO2dCQUN6RCxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBRS9ELElBQUksQ0FBQyxPQUFPLEdBQUcsa0JBQWtCLElBQUksa0JBQWtCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDeEUsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO29CQUNkLFlBQVksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO2lCQUN0RDtZQUNMLENBQUMsQ0FBQyxDQUFDO1lBRUgsTUFBTSxhQUFhLEdBQUcsQ0FBQyxJQUFVLEVBQUUsS0FBdUIsRUFBRSxXQUFvQixFQUFFLEdBQXNCLEVBQUUsRUFBRTtnQkFDeEcsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDbEMsTUFBTSxLQUFLLEdBQUcsSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUMxQixJQUFJLENBQUMsS0FBSyxFQUFFO29CQUNSLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO29CQUNyQixPQUFPO2lCQUNWO2dCQUVELElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztnQkFDdkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQztnQkFDekMsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQztnQkFDckMsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQztnQkFDekMsSUFBSSxDQUFDLElBQUksR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixhQUFwQixvQkFBb0IsY0FBcEIsb0JBQW9CLEdBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO2dCQUN4RixJQUFJLENBQUMsVUFBVSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUM7Z0JBRXhELElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztnQkFDOUIsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO2dCQUNqQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ2pCLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDakIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDeEIsQ0FBQyxDQUFDO1lBQ0YsSUFBSSxDQUFDLGNBQWM7aUJBQ2QsV0FBVyxDQUFPLFdBQVcsQ0FBQyxJQUFJLENBQUM7aUJBQ25DLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQU8sV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO2dCQUN6RSxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBRS9ELElBQUksQ0FBQyxPQUFPLEdBQUcsa0JBQWtCLElBQUksa0JBQWtCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDeEUsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO29CQUNkLGFBQWEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxrQkFBa0IsRUFBRSxPQUFPLENBQUMsQ0FBQztpQkFDaEU7WUFDTCxDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxjQUFjO2lCQUNkLFdBQVcsQ0FBTyxXQUFXLENBQUMsS0FBSyxDQUFDO2lCQUNwQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFPLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFDMUUsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUUvRCxJQUFJLENBQUMsT0FBTyxHQUFHLGtCQUFrQixJQUFJLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3hFLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtvQkFDZCxhQUFhLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsa0JBQWtCLEVBQUUsT0FBTyxDQUFDLENBQUM7aUJBQ2hFO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO0tBQUE7SUFFTyxrQkFBa0IsQ0FBQyxLQUFrQztRQUN6RCxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLGFBQWEsRUFBRSxFQUFFO1lBQ2pDLGFBQWEsQ0FBQyxZQUFZLEdBQUc7Z0JBQ3pCLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQztnQkFDeEIsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQ1gsQ0FBQztRQUNOLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLHFCQUFxQjtRQUN6QixNQUFNLEtBQUssR0FBRyxJQUFJLEdBQUcsRUFBb0IsQ0FBQztRQUMxQyxNQUFNLFFBQVEsR0FBRyxDQUFDLEtBQXVCLEVBQUUsRUFBRTs7WUFDekMsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUU7Z0JBQzdFLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDcEI7WUFDRCxNQUFBLEtBQUssQ0FBQyxRQUFRLDBDQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN0QyxDQUFDLENBQUM7UUFDRixRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVMsQ0FBQyxDQUFDO1FBQ3pCLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFRCxjQUFjLENBQUMsS0FBa0M7UUFDN0MsTUFBTSxFQUNGLE1BQU0sRUFDTixLQUFLLEVBQ0wsUUFBUSxFQUNSLFdBQVcsRUFDWCxRQUFRLEVBQ1IsR0FBRyxFQUFFLEVBQUUsYUFBYSxFQUFFLEdBQ3pCLEdBQUcsSUFBSSxDQUFDO1FBQ1QsTUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDO1FBWTVCLE1BQU0sU0FBUyxHQUFHLElBQUksR0FBRyxFQUErQixDQUFDO1FBRXpELEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUU7O1lBQ3pCLElBQUksQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxDQUFDLEVBQUU7Z0JBQ2hDLE9BQU87YUFDVjtZQUVELE1BQU0sY0FBYyxHQUFHLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLFdBQVcsQ0FBQztZQUNuRCxNQUFNLGVBQWUsR0FBRyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxXQUFXLENBQUM7WUFDckQsTUFBTSxhQUFhLEdBQUcsQ0FBQyxVQUFpQixFQUFFLEVBQUU7Z0JBQ3hDLE1BQU0sWUFBWSxHQUFHLENBQUMsQ0FBQztnQkFDdkIsT0FBTyxDQUNILFVBQVUsQ0FBQyxRQUFRLEdBQUcsR0FBRyxDQUFDLEtBQUssR0FBRyxZQUFZLElBQUksVUFBVSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FDcEcsQ0FBQztZQUNOLENBQUMsQ0FBQztZQUVGLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7WUFFdkUsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDO1lBQ25CLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDakMsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQztZQUNyQyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHNCQUFzQixHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0YsSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFO2dCQUNkLElBQUksV0FBVyxDQUFDLFNBQVMsRUFBRTtvQkFDdkIsU0FBUyxHQUFHLE1BQUEsYUFBYSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxtQ0FBSSxFQUFFLENBQUM7aUJBQ3ZGO3FCQUFNLElBQUksV0FBVyxDQUFDLEdBQUcsRUFBRTtvQkFDeEIsU0FBUyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUM1QzthQUNKO1lBQ0QsSUFBSSxTQUFTLEdBQUcsV0FBVyxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUNuRCxJQUFJLFNBQVMsSUFBSSxTQUFTLENBQUMsS0FBSyxHQUFHLGNBQWMsRUFBRTtnQkFDL0MsU0FBUyxHQUFHLEVBQUUsQ0FBQzthQUNsQjtZQUVELElBQUksVUFBaUIsQ0FBQztZQUN0QixJQUFJLFdBQVcsR0FBRyxFQUFFLENBQUM7WUFDckIsSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFO2dCQUNkLFVBQVUsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO2dCQUUxQixNQUFNLFNBQVMsR0FBRyxHQUFHLEVBQUU7b0JBQ25CLE1BQU0sV0FBVyxHQUFHLGVBQWUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFFBQVEsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMxRixNQUFNLFdBQVcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ2hFLEtBQUssTUFBTSxLQUFLLElBQUksV0FBVyxFQUFFO3dCQUM3QixNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxHQUFHLFdBQVcsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7d0JBQ3hELElBQUksTUFBTSxHQUFHLFdBQVcsSUFBSSxhQUFhLENBQUMsS0FBSyxDQUFDLEVBQUU7NEJBQzlDLFNBQVM7eUJBQ1o7d0JBQ0QsSUFBSSxLQUFLLElBQUksY0FBYyxFQUFFOzRCQUN6QixPQUFPLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsQ0FBQzt5QkFDNUM7d0JBQ0QsK0RBQStEO3dCQUMvRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxjQUFjLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBQ3pGLElBQ0ksT0FBTzs0QkFDUCxPQUFPLEtBQUssUUFBUTs0QkFDcEIsQ0FBQyxLQUFLLEtBQUssTUFBTSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFDMUY7NEJBQ0UsT0FBTyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLENBQUM7eUJBQzFDO3FCQUNKO29CQUNELHFDQUFxQztvQkFDckMsTUFBTSxTQUFTLEdBQUcsV0FBVyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ3ZELElBQUksU0FBUyxDQUFDLE1BQU0sSUFBSSxXQUFXLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFO3dCQUNqRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxDQUFDO3FCQUMxRDtvQkFDRCxPQUFPLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLENBQUM7Z0JBQ3hELENBQUMsQ0FBQztnQkFFRixJQUFJLE1BQU0sR0FBRyxTQUFTLEVBQUUsQ0FBQztnQkFDekIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQUksU0FBUyxFQUFFO29CQUM1QixTQUFTLEdBQUcsRUFBRSxDQUFDO29CQUNmLE1BQU0sR0FBRyxTQUFTLEVBQUUsQ0FBQztpQkFDeEI7Z0JBQ0QsVUFBVSxHQUFHLE1BQUEsTUFBTSxDQUFDLEtBQUssbUNBQUksTUFBTSxDQUFDLEtBQUssQ0FBQztnQkFDMUMsV0FBVyxHQUFHLE1BQUEsTUFBTSxDQUFDLFdBQVcsbUNBQUksRUFBRSxDQUFDO2FBQzFDO2lCQUFNLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxDQUFDLEVBQUU7Z0JBQzFCLFVBQVUsR0FBRyxLQUFLLENBQUM7YUFDdEI7aUJBQU07Z0JBQ0gsVUFBVSxHQUFHLFFBQVEsQ0FBQzthQUN6QjtZQUVELE1BQU0sU0FBUyxHQUFHLFdBQVcsQ0FBQyxXQUFXLElBQUksU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ3BFLElBQUksYUFBYSxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUMzQixrQ0FBa0M7Z0JBQ2xDLE9BQU87YUFDVjtZQUVELGdDQUFnQztZQUNoQyxJQUFJLFNBQVMsQ0FBQyxLQUFLLEdBQUcsY0FBYyxFQUFFO2dCQUNsQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN6RixTQUFTLEdBQUcsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDO2FBQy9EO1lBRUQsU0FBUyxHQUFHLFdBQVcsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDL0MsTUFBTSxZQUFZLEdBQ2QsU0FBUztnQkFDVCxTQUFTLENBQUMsS0FBSyxHQUFHLGNBQWM7Z0JBQ2hDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLE1BQU0sR0FBRyxXQUFXLEdBQUcsZUFBZSxDQUFDO1lBRXhFLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFO2dCQUNqQixLQUFLLGtCQUNELElBQUksRUFBRSxXQUFXLElBQUksU0FBUyxFQUM5QixLQUFLLEVBQUUsVUFBVSxJQUNkLENBQUMsS0FBSyxDQUFDLE1BQU07b0JBQ1osQ0FBQyxDQUFDO3dCQUNJLE1BQU0sRUFBRSxRQUFRO3dCQUNoQixNQUFNLEVBQUUsUUFBUTt3QkFDaEIsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDO3dCQUN4QixDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsV0FBVyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUMxRjtvQkFDSCxDQUFDLENBQUM7d0JBQ0ksTUFBTSxFQUFFLE1BQU07d0JBQ2QsTUFBTSxFQUFFLEtBQUs7d0JBQ2IsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsV0FBVzt3QkFDdEIsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsV0FBVztxQkFDekIsQ0FBQyxDQUNYO2dCQUNELEtBQUssRUFBRSxZQUFZO29CQUNmLENBQUMsQ0FBQzt3QkFDSSxJQUFJLEVBQUUsU0FBUzt3QkFDZixLQUFLLEVBQUUsVUFBVTt3QkFDakIsTUFBTSxFQUFFLFFBQVE7d0JBQ2hCLE1BQU0sRUFBRSxRQUFRO3dCQUNoQixDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUM7d0JBQ3hCLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLFdBQVcsR0FBRyxDQUFDO3FCQUNyRTtvQkFDSCxDQUFDLENBQUMsU0FBUzthQUNsQixDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sU0FBUyxDQUFDO0lBQ3JCLENBQUM7SUFFRCxTQUFTLENBQUMsVUFBOEI7UUFDcEMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNsQixDQUFDO0lBRVMsaUJBQWlCLENBQUMsS0FBaUIsRUFBRSxLQUF1QjtRQUNsRSxPQUFPLElBQUksMkJBQTJCLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMzRyxDQUFDO0lBRVMsdUJBQXVCLENBQUMsS0FBaUIsRUFBRSxLQUF1QjtRQUN4RSxPQUFPLElBQUksaUNBQWlDLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNqSCxDQUFDO0lBRUQsY0FBYyxDQUFDLFNBQTJCOztRQUN0QyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUU7WUFDNUMsT0FBTyxFQUFFLENBQUM7U0FDYjtRQUVELE1BQU0sRUFDRixPQUFPLEVBQ1AsT0FBTyxFQUNQLFFBQVEsRUFDUixRQUFRLEVBQ1IsUUFBUSxFQUNSLEVBQUUsRUFBRSxRQUFRLEVBQ1osTUFBTSxFQUNOLEdBQUcsRUFBRSxFQUFFLGFBQWEsRUFBRSxHQUN6QixHQUFHLElBQUksQ0FBQztRQUNULE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxTQUFTLENBQUM7UUFDNUIsTUFBTSxFQUFFLFFBQVEsRUFBRSxlQUFlLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFFOUMsTUFBTSxLQUFLLEdBQXVCLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBQSxLQUFLLENBQUMsUUFBUSxDQUFDLG1DQUFJLFFBQVEsQ0FBQztRQUNsRyxJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDakIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDcEQsTUFBTSxLQUFLLEdBQUcsTUFBQSxNQUFBLE1BQU0sYUFBTixNQUFNLHVCQUFOLE1BQU0sQ0FBRSxJQUFJLG1DQUFJLFNBQVMsQ0FBQyxJQUFJLG1DQUFJLE1BQU0sQ0FBQztRQUV2RCxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztRQUNsQyxNQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQztRQUM5QyxJQUFJLFFBQVEsSUFBSSxjQUFjLEVBQUU7WUFDNUIsSUFBSSxTQUFTLEdBQXVCLEVBQUUsQ0FBQztZQUN2QyxJQUFJLGNBQWMsRUFBRTtnQkFDaEIsU0FBUyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQzthQUM3RDtpQkFBTTtnQkFDSCxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsUUFBUyxDQUFDLENBQUM7Z0JBQy9CLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRTtvQkFDOUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDOUI7YUFDSjtZQUNELElBQUksU0FBUyxFQUFFO2dCQUNYLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUU7b0JBQ25CLE9BQU8sSUFBSSxNQUFNLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxRQUFRLENBQUM7aUJBQzlDO2dCQUNELE9BQU8sSUFBSSxTQUFTLENBQUM7YUFDeEI7U0FDSjtRQUVELE1BQU0sUUFBUSxHQUE0QjtZQUN0QyxLQUFLO1lBQ0wsZUFBZSxFQUFFLEtBQUs7WUFDdEIsT0FBTztTQUNWLENBQUM7UUFFRixJQUFJLGVBQWUsRUFBRTtZQUNqQixPQUFPLGFBQWEsQ0FDaEIsZUFBZSxDQUFDO2dCQUNaLEtBQUssRUFBRSxTQUFTLENBQUMsS0FBSztnQkFDdEIsTUFBTSxFQUFFLE1BQUEsU0FBUyxDQUFDLE1BQU0sMENBQUUsS0FBSztnQkFDL0IsS0FBSyxFQUFFLFNBQVMsQ0FBQyxLQUFLO2dCQUN0QixPQUFPO2dCQUNQLFFBQVE7Z0JBQ1IsUUFBUTtnQkFDUixLQUFLO2dCQUNMLEtBQUs7Z0JBQ0wsUUFBUTthQUNYLENBQUMsRUFDRixRQUFRLENBQ1gsQ0FBQztTQUNMO1FBRUQsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNwQixPQUFPLEVBQUUsQ0FBQztTQUNiO1FBRUQsT0FBTyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVELGFBQWE7UUFDVCxpQ0FBaUM7UUFDakMsT0FBTyxFQUFFLENBQUM7SUFDZCxDQUFDOztBQS95Qk0sdUJBQVMsR0FBRyxlQUFlLENBQUM7QUFDNUIsa0JBQUksR0FBRyxTQUFrQixDQUFDO0FBcURqQztJQURDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7a0RBQ0o7QUFHaEI7SUFEQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDOzhDQUNSO0FBR1o7SUFEQyxRQUFRLENBQUMsTUFBTSxDQUFDOytDQUNVO0FBRzNCO0lBREMsUUFBUSxDQUFDLFVBQVUsQ0FBQzs4Q0FDSztBQUcxQjtJQURDLFFBQVEsQ0FBQyxVQUFVLENBQUM7K0NBQ087QUFHNUI7SUFEQyxRQUFRLENBQUMsWUFBWSxDQUFDO2tEQUNTO0FBR2hDO0lBREMsUUFBUSxDQUFDLGtCQUFrQixDQUFDO2lEQUNpQjtBQUc5QztJQURDLFFBQVEsQ0FBQyxVQUFVLENBQUM7Z0RBQ1M7QUFHOUI7SUFEQyxRQUFRLENBQUMsZ0JBQWdCLENBQUM7a0RBQ0c7QUFHOUI7SUFEQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO3VEQUNLO0FBRzdCO0lBREMsUUFBUSxDQUFDLGdCQUFnQixDQUFDO2lEQUNFO0FBRzdCO0lBREMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztzREFDSTtBQUc1QjtJQURDLFFBQVEsQ0FBQyxPQUFPLENBQUM7K0NBQ087QUFHekI7SUFEQyxRQUFRLENBQUMsWUFBWSxDQUFDO2dEQUNtRTtBQUcxRjtJQURDLFFBQVEsQ0FBQyxNQUFNLENBQUM7Z0RBQ1k7QUFHN0I7SUFEQyxRQUFRLENBQUMsTUFBTSxDQUFDOytDQUNTO0FBRzFCO0lBREMsUUFBUSxDQUFDLFdBQVcsQ0FBQztzREFDVSJ9