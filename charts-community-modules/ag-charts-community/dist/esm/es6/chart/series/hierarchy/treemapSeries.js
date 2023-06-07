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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZW1hcFNlcmllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jaGFydC9zZXJpZXMvaGllcmFyY2h5L3RyZWVtYXBTZXJpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDcEMsT0FBTyxFQUFtQixhQUFhLEVBQUUsY0FBYyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQ3JHLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNwRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDdEQsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNqRCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDakQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3ZELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUd2RCxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUMzQyxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDNUMsT0FBTyxFQUNILE9BQU8sRUFDUCxNQUFNLEVBQ04sWUFBWSxFQUNaLFdBQVcsRUFDWCxnQkFBZ0IsRUFDaEIsWUFBWSxFQUNaLFVBQVUsRUFDVixVQUFVLEVBQ1YsTUFBTSxFQUNOLGtCQUFrQixFQUNsQixRQUFRLEVBQ1IsU0FBUyxHQUNaLE1B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QUUsTUFBTSxDQUFDLENBQUM7UUFDdEYsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBRW5DLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3RDLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFDaEMsTUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUM5QyxNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7WUFDdEQsUUFBUSxJQUFJLEtBQUssQ0FBQztZQUVsQixNQUFNLGFBQWEsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUM7WUFDdEUsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO1lBQ25FLE1BQU0sZUFBZSxHQUFHLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxHQUFHLFFBQVEsQ0FBQztZQUM3RCxJQUFJLGNBQWMsR0FBRyxDQUFDLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxZQUFZLENBQUM7WUFFL0QsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsY0FBYyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDcEcsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsR0FBRyxLQUFLLENBQUMsQ0FBQztZQUNyRCxJQUFJLElBQUksR0FBRyxZQUFZLEVBQUU7Z0JBQ3JCLFlBQVksR0FBRyxJQUFJLENBQUM7Z0JBQ3BCLFNBQVM7YUFD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