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
import { HdpiCanvas } from '../../../canvas/hdpiCanvas';
import { Label } from '../../label';
import { SeriesTooltip, HighlightStyle, SeriesNodeBaseClickEvent } from '../series';
import { HierarchySeries } from './hierarchySeries';
import { toTooltipHtml } from '../../tooltip/tooltip';
import { Group } from '../../../scene/group';
import { Text } from '../../../scene/shape/text';
import { Rect } from '../../../scene/shape/rect';
import { DropShadow } from '../../../scene/dropShadow';
import { ColorScale } from '../../../scale/colorScale';
import { toFixed } from '../../../util/number';
import { Path2D } from '../../../scene/path2D';
import { BBox } from '../../../scene/bbox';
import { Color } from '../../../util/color';
import { BOOLEAN, NUMBER, NUMBER_ARRAY, OPT_BOOLEAN, OPT_COLOR_STRING, OPT_FUNCTION, OPT_NUMBER, OPT_STRING, STRING, COLOR_STRING_ARRAY, Validate, } from '../../../util/validation';
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
function getTextSize(text, style) {
    return HdpiCanvas.getTextSize(text, [style.fontWeight, `${style.fontSize}px`, style.fontFamily].join(' '));
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
export class TreemapHighlightStyle extends HighlightStyle {
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
                const label = new Label();
                label.color = 'white';
                label.fontWeight = 'bold';
                label.fontSize = 18;
                return label;
            })(),
            medium: (() => {
                const label = new Label();
                label.color = 'white';
                label.fontWeight = 'bold';
                label.fontSize = 14;
                return label;
            })(),
            small: (() => {
                const label = new Label();
                label.color = 'white';
                label.fontWeight = 'bold';
                label.fontSize = 10;
                return label;
            })(),
            value: new TreemapValueLabel(),
        };
        this.nodePadding = 2;
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
        const targetTileAspectRatio = 1; // The width and height will tend to this ratio
        const padding = this.getNodePadding(nodeDatum, bbox);
        outputNodesBoxes.set(nodeDatum, bbox);
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
        const partition = new BBox(bbox.x + padding.left, bbox.y + padding.top, width, height);
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
            this.squarify(children[i], childBox, outputNodesBoxes);
            start += isVertical ? width : height;
        }
        return outputNodesBoxes;
    }
    processData() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.data) {
                return;
            }
            const { data, sizeKey, labelKey, colorKey, colorDomain, colorRange, groupFill } = this;
            const colorScale = new ColorScale();
            colorScale.domain = colorDomain;
            colorScale.range = colorRange;
            const createTreeNodeDatum = (datum, depth = 0, parent) => {
                var _a, _b;
                const label = (labelKey && datum[labelKey]) || '';
                let colorScaleValue = colorKey ? (_a = datum[colorKey]) !== null && _a !== void 0 ? _a : depth : depth;
                colorScaleValue = validateColor(colorScaleValue);
                const isLeaf = !datum.children;
                const fill = typeof colorScaleValue === 'string'
                    ? colorScaleValue
                    : isLeaf || !groupFill
                        ? colorScale.convert(colorScaleValue)
                        : groupFill;
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
                    nodeDatum.value = sizeKey ? (_b = datum[sizeKey]) !== null && _b !== void 0 ? _b : 1 : 1;
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
        const { formatter } = this;
        if (!formatter) {
            return {};
        }
        const { gradient, colorKey, labelKey, sizeKey, tileStroke, tileStrokeWidth, groupStroke, groupStrokeWidth } = this;
        const stroke = datum.isLeaf ? tileStroke : groupStroke;
        const strokeWidth = datum.isLeaf ? tileStrokeWidth : groupStrokeWidth;
        return formatter({
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
            const updateRectFn = (rect, datum, isDatumHighlighted) => {
                var _a, _b, _c, _d, _e, _f;
                const box = boxes.get(datum);
                if (!box) {
                    rect.visible = false;
                    return;
                }
                const fill = isDatumHighlighted && highlightedFill !== undefined ? highlightedFill : datum.fill;
                const fillOpacity = (_a = (isDatumHighlighted ? highlightedFillOpacity : 1)) !== null && _a !== void 0 ? _a : 1;
                const stroke = isDatumHighlighted && highlightedStroke !== undefined
                    ? highlightedStroke
                    : datum.isLeaf
                        ? tileStroke
                        : groupStroke;
                const strokeWidth = isDatumHighlighted && highlightedDatumStrokeWidth !== undefined
                    ? highlightedDatumStrokeWidth
                    : datum.isLeaf
                        ? tileStrokeWidth
                        : groupStrokeWidth;
                const format = this.getTileFormat(datum, isDatumHighlighted);
                rect.fill = validateColor((_b = format === null || format === void 0 ? void 0 : format.fill) !== null && _b !== void 0 ? _b : fill);
                rect.fillOpacity = (_c = format === null || format === void 0 ? void 0 : format.fillOpacity) !== null && _c !== void 0 ? _c : fillOpacity;
                rect.stroke = validateColor((_d = format === null || format === void 0 ? void 0 : format.stroke) !== null && _d !== void 0 ? _d : stroke);
                rect.strokeWidth = (_e = format === null || format === void 0 ? void 0 : format.strokeWidth) !== null && _e !== void 0 ? _e : strokeWidth;
                rect.gradient = (_f = format === null || format === void 0 ? void 0 : format.gradient) !== null && _f !== void 0 ? _f : gradient;
                rect.fillShadow = tileShadow;
                rect.crisp = true;
                rect.x = box.x;
                rect.y = box.y;
                rect.width = box.width;
                rect.height = box.height;
                rect.visible = true;
                if (isDatumHighlighted && !datum.isLeaf) {
                    const padding = this.getNodePadding(datum, box);
                    const x0 = box.x + padding.left;
                    const x1 = box.x + box.width - padding.right;
                    const y0 = box.y + padding.top;
                    const y1 = box.y + box.height - padding.bottom;
                    if (rect.clipPath) {
                        rect.clipPath.clear();
                    }
                    else {
                        rect.clipPath = new Path2D();
                    }
                    rect.clipMode = 'punch-out';
                    rect.clipPath.moveTo(x0, y0);
                    rect.clipPath.lineTo(x1, y0);
                    rect.clipPath.lineTo(x1, y1);
                    rect.clipPath.lineTo(x0, y1);
                    rect.clipPath.lineTo(x0, y0);
                    rect.clipPath.closePath();
                }
            };
            this.groupSelection.selectByClass(Rect).forEach((rect) => updateRectFn(rect, rect.datum, false));
            this.highlightSelection.selectByClass(Rect).forEach((rect) => {
                const isDatumHighlighted = this.isDatumHighlighted(rect.datum);
                rect.visible = isDatumHighlighted;
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
                text.visible = isDatumHighlighted;
                if (text.visible) {
                    updateLabelFn(text, text.datum, isDatumHighlighted, 'label');
                }
            });
            this.groupSelection
                .selectByTag(TextNodeTag.Value)
                .forEach((text) => updateLabelFn(text, text.datum, false, 'value'));
            this.highlightSelection.selectByTag(TextNodeTag.Value).forEach((text) => {
                const isDatumHighlighted = this.isDatumHighlighted(text.datum);
                text.visible = isDatumHighlighted;
                if (text.visible) {
                    updateLabelFn(text, text.datum, isDatumHighlighted, 'value');
                }
            });
        });
    }
    buildLabelMeta(boxes) {
        const { labels, title, subtitle, nodePadding, labelKey } = this;
        const labelMeta = new Map();
        boxes.forEach((box, datum) => {
            if (!labelKey || datum.depth === 0) {
                return;
            }
            let labelText = datum.isLeaf ? datum.label : datum.label.toUpperCase();
            let labelStyle;
            if (datum.isLeaf) {
                // Choose the font size that fits
                labelStyle =
                    [labels.large, labels.medium, labels.small].find((s) => {
                        const { width, height } = getTextSize(labelText, s);
                        return width < box.width && height < box.height;
                    }) || labels.small;
            }
            else if (datum.depth === 1) {
                labelStyle = title;
            }
            else {
                labelStyle = subtitle;
            }
            const labelSize = getTextSize(labelText, labelStyle);
            const availTextWidth = box.width - 2 * nodePadding;
            const availTextHeight = box.height - 2 * nodePadding;
            const minSizeRatio = 3;
            if (labelStyle.fontSize > box.width / minSizeRatio || labelStyle.fontSize > box.height / minSizeRatio) {
                // Avoid labels on too small tiles
                return;
            }
            // Crop text if not enough space
            if (labelSize.width > availTextWidth) {
                const textLength = Math.floor((labelText.length * availTextWidth) / labelSize.width) - 1;
                labelText = `${labelText.substring(0, textLength)}…`;
            }
            const valueConfig = labels.value;
            const valueStyle = valueConfig.style;
            const valueMargin = (labelStyle.fontSize + valueStyle.fontSize) / 8;
            const valueText = String(datum.isLeaf
                ? valueConfig.formatter
                    ? valueConfig.formatter({ datum: datum.datum })
                    : valueConfig.key
                        ? datum.datum[valueConfig.key]
                        : ''
                : '');
            const valueSize = getTextSize(valueText, valueStyle);
            const hasValueText = valueText &&
                valueSize.width < availTextWidth &&
                valueSize.height + labelSize.height + valueMargin < availTextHeight;
            labelMeta.set(datum, {
                label: Object.assign({ text: labelText, style: labelStyle }, (datum.isLeaf
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
        var _a;
        if (!this.highlightGroups && !nodeDatum.isLeaf) {
            return '';
        }
        const { tooltip, sizeKey, labelKey, colorKey, rootName, id: seriesId, labels } = this;
        const { datum } = nodeDatum;
        const { renderer: tooltipRenderer } = tooltip;
        const title = nodeDatum.depth ? datum[labelKey] : rootName || datum[labelKey];
        let content = '';
        const format = this.getTileFormat(nodeDatum, false);
        const color = (format === null || format === void 0 ? void 0 : format.fill) || nodeDatum.fill || 'gray';
        const valueKey = labels.value.key;
        const valueFormatter = labels.value.formatter;
        if (valueKey || valueFormatter) {
            let valueText = '';
            if (valueFormatter) {
                valueText = valueFormatter({ datum });
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
                parent: (_a = nodeDatum.parent) === null || _a === void 0 ? void 0 : _a.datum,
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
