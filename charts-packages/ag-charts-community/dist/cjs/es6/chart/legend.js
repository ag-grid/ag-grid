"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const group_1 = require("../scene/group");
const selection_1 = require("../scene/selection");
const markerLabel_1 = require("./markerLabel");
const text_1 = require("../scene/shape/text");
const util_1 = require("./marker/util");
const id_1 = require("../util/id");
const node_1 = require("../scene/node");
const hdpiCanvas_1 = require("../canvas/hdpiCanvas");
const validation_1 = require("../util/validation");
const layers_1 = require("./layers");
var LegendOrientation;
(function (LegendOrientation) {
    LegendOrientation[LegendOrientation["Vertical"] = 0] = "Vertical";
    LegendOrientation[LegendOrientation["Horizontal"] = 1] = "Horizontal";
})(LegendOrientation = exports.LegendOrientation || (exports.LegendOrientation = {}));
var LegendPosition;
(function (LegendPosition) {
    LegendPosition["Top"] = "top";
    LegendPosition["Right"] = "right";
    LegendPosition["Bottom"] = "bottom";
    LegendPosition["Left"] = "left";
})(LegendPosition = exports.LegendPosition || (exports.LegendPosition = {}));
class LegendLabel {
    constructor() {
        this.maxLength = undefined;
        this.color = 'black';
        this.fontStyle = undefined;
        this.fontWeight = undefined;
        this.fontSize = 12;
        this.fontFamily = 'Verdana, sans-serif';
        this.formatter = undefined;
    }
    getFont() {
        return text_1.getFont(this.fontSize, this.fontFamily, this.fontStyle, this.fontWeight);
    }
}
__decorate([
    validation_1.Validate(validation_1.OPT_NUMBER(0))
], LegendLabel.prototype, "maxLength", void 0);
__decorate([
    validation_1.Validate(validation_1.COLOR_STRING)
], LegendLabel.prototype, "color", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_FONT_STYLE)
], LegendLabel.prototype, "fontStyle", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_FONT_WEIGHT)
], LegendLabel.prototype, "fontWeight", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], LegendLabel.prototype, "fontSize", void 0);
__decorate([
    validation_1.Validate(validation_1.STRING)
], LegendLabel.prototype, "fontFamily", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_FUNCTION)
], LegendLabel.prototype, "formatter", void 0);
exports.LegendLabel = LegendLabel;
class LegendMarker {
    constructor() {
        this.size = 15;
        /**
         * If the marker type is set, the legend will always use that marker type for all its items,
         * regardless of the type that comes from the `data`.
         */
        this._shape = undefined;
        /**
         * Padding between the marker and the label within each legend item.
         */
        this.padding = 8;
        this.strokeWidth = 1;
    }
    set shape(value) {
        var _a;
        this._shape = value;
        (_a = this.parent) === null || _a === void 0 ? void 0 : _a.onMarkerShapeChange();
    }
    get shape() {
        return this._shape;
    }
}
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], LegendMarker.prototype, "size", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], LegendMarker.prototype, "padding", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], LegendMarker.prototype, "strokeWidth", void 0);
exports.LegendMarker = LegendMarker;
class LegendItem {
    constructor() {
        this.marker = new LegendMarker();
        this.label = new LegendLabel();
        /** Used to constrain the width of legend items. */
        this.maxWidth = undefined;
        /**
         * The legend uses grid layout for its items, occupying as few columns as possible when positioned to left or right,
         * and as few rows as possible when positioned to top or bottom. This config specifies the amount of horizontal
         * padding between legend items.
         */
        this.paddingX = 16;
        /**
         * The legend uses grid layout for its items, occupying as few columns as possible when positioned to left or right,
         * and as few rows as possible when positioned to top or bottom. This config specifies the amount of vertical
         * padding between legend items.
         */
        this.paddingY = 8;
    }
}
__decorate([
    validation_1.Validate(validation_1.OPT_NUMBER(0))
], LegendItem.prototype, "maxWidth", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], LegendItem.prototype, "paddingX", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], LegendItem.prototype, "paddingY", void 0);
exports.LegendItem = LegendItem;
const NO_OP_LISTENER = () => {
    // Default listener that does nothing.
};
class LegendListeners {
    constructor() {
        this.legendItemClick = NO_OP_LISTENER;
    }
}
__decorate([
    validation_1.Validate(validation_1.FUNCTION)
], LegendListeners.prototype, "legendItemClick", void 0);
exports.LegendListeners = LegendListeners;
class Legend {
    constructor() {
        this.id = id_1.createId(this);
        this.group = new group_1.Group({ name: 'legend', layer: true, zIndex: layers_1.Layers.LEGEND_ZINDEX });
        this.itemSelection = selection_1.Selection.select(this.group).selectAll();
        this.oldSize = [0, 0];
        this.item = new LegendItem();
        this.listeners = new LegendListeners();
        this.truncatedItems = new Set();
        this._data = [];
        this._enabled = true;
        this.orientation = LegendOrientation.Vertical;
        this._position = LegendPosition.Right;
        /** Reverse the display order of legend items if `true`. */
        this.reverseOrder = undefined;
        /**
         * Spacing between the legend and the edge of the chart's element.
         */
        this.spacing = 20;
        this.characterWidths = new Map();
        this.size = [0, 0];
        this.item.marker.parent = this;
    }
    set data(value) {
        this._data = value;
        this.group.visible = value.length > 0 && this.enabled;
    }
    get data() {
        return this._data;
    }
    set enabled(value) {
        this._enabled = value;
        this.group.visible = value && this.data.length > 0;
    }
    get enabled() {
        return this._enabled;
    }
    set position(value) {
        this._position = value;
        switch (value) {
            case 'right':
            case 'left':
                this.orientation = LegendOrientation.Vertical;
                break;
            case 'bottom':
            case 'top':
                this.orientation = LegendOrientation.Horizontal;
                break;
        }
    }
    get position() {
        return this._position;
    }
    onMarkerShapeChange() {
        this.itemSelection = this.itemSelection.setData([]);
        this.itemSelection.exit.remove();
        this.group.markDirty(this.group, node_1.RedrawType.MINOR);
    }
    getCharacterWidths(font) {
        const { characterWidths } = this;
        if (characterWidths.has(font)) {
            return characterWidths.get(font);
        }
        const cw = {
            '...': hdpiCanvas_1.HdpiCanvas.getTextSize('...', font).width,
        };
        characterWidths.set(font, cw);
        return cw;
    }
    /**
     * The method is given the desired size of the legend, which only serves as a hint.
     * The vertically oriented legend will take as much horizontal space as needed, but will
     * respect the height constraints, and the horizontal legend will take as much vertical
     * space as needed in an attempt not to exceed the given width.
     * After the layout is done, the {@link size} will contain the actual size of the legend.
     * If the actual size is not the same as the previous actual size, the legend will fire
     * the 'layoutChange' event to communicate that another layout is needed, and the above
     * process should be repeated.
     * @param width
     * @param height
     */
    performLayout(width, height) {
        const { paddingX, paddingY, label, maxWidth, marker: { size: markerSize, padding: markerPadding, shape: markerShape }, label: { maxLength = Infinity, fontStyle, fontWeight, fontSize, fontFamily }, } = this.item;
        const data = [...this.data];
        if (this.reverseOrder) {
            data.reverse();
        }
        const updateSelection = this.itemSelection.setData(data, (_, datum) => {
            const Marker = util_1.getMarker(markerShape || datum.marker.shape);
            return datum.id + '-' + datum.itemId + '-' + Marker.name;
        });
        updateSelection.exit.remove();
        const enterSelection = updateSelection.enter.append(markerLabel_1.MarkerLabel).each((node, datum) => {
            const Marker = util_1.getMarker(markerShape || datum.marker.shape);
            node.marker = new Marker();
        });
        const itemSelection = (this.itemSelection = updateSelection.merge(enterSelection));
        const itemCount = itemSelection.size;
        // Update properties that affect the size of the legend items and measure them.
        const bboxes = [];
        const font = label.getFont();
        const ellipsis = `...`;
        const itemMaxWidthPercentage = 0.8;
        const maxItemWidth = (maxWidth !== null && maxWidth !== void 0 ? maxWidth : width * itemMaxWidthPercentage);
        itemSelection.each((markerLabel, datum) => {
            var _a;
            let text = (_a = datum.label.text, (_a !== null && _a !== void 0 ? _a : '<unknown>'));
            markerLabel.markerSize = markerSize;
            markerLabel.spacing = markerPadding;
            markerLabel.fontStyle = fontStyle;
            markerLabel.fontWeight = fontWeight;
            markerLabel.fontSize = fontSize;
            markerLabel.fontFamily = fontFamily;
            const textChars = text.split('');
            let addEllipsis = false;
            if (text.length > maxLength) {
                text = `${text.substring(0, maxLength)}`;
                addEllipsis = true;
            }
            const labelWidth = markerSize + markerPadding + hdpiCanvas_1.HdpiCanvas.getTextSize(text, font).width;
            if (labelWidth > maxItemWidth) {
                let truncatedText = '';
                const characterWidths = this.getCharacterWidths(font);
                let cumCharSize = characterWidths[ellipsis];
                for (const char of textChars) {
                    if (!characterWidths[char]) {
                        characterWidths[char] = hdpiCanvas_1.HdpiCanvas.getTextSize(char, font).width;
                    }
                    cumCharSize += characterWidths[char];
                    if (cumCharSize > maxItemWidth) {
                        break;
                    }
                    truncatedText += char;
                }
                text = truncatedText;
                addEllipsis = true;
            }
            const id = datum.itemId || datum.id;
            if (addEllipsis) {
                text += ellipsis;
                this.truncatedItems.add(id);
            }
            else {
                this.truncatedItems.delete(id);
            }
            markerLabel.text = text;
            bboxes.push(markerLabel.computeBBox());
        });
        const itemHeight = bboxes.length && bboxes[0].height;
        let rowCount = 0;
        let columnWidth = 0;
        let paddedItemsWidth = 0;
        let paddedItemsHeight = 0;
        width = Math.max(1, width);
        height = Math.max(1, height);
        switch (this.orientation) {
            case LegendOrientation.Horizontal:
                if (!(isFinite(width) && width > 0)) {
                    return false;
                }
                rowCount = 0;
                let columnCount = 0;
                // Split legend items into columns until the width is suitable.
                do {
                    let itemsWidth = 0;
                    columnCount = 0;
                    columnWidth = 0;
                    rowCount++;
                    let i = 0;
                    while (i < itemCount) {
                        const bbox = bboxes[i];
                        if (bbox.width > columnWidth) {
                            columnWidth = bbox.width;
                        }
                        i++;
                        if (i % rowCount === 0) {
                            itemsWidth += columnWidth;
                            columnWidth = 0;
                            columnCount++;
                        }
                    }
                    if (i % rowCount !== 0) {
                        itemsWidth += columnWidth;
                        columnCount++;
                    }
                    paddedItemsWidth = itemsWidth + (columnCount - 1) * paddingX;
                } while (paddedItemsWidth > width && columnCount > 1);
                paddedItemsHeight = itemHeight * rowCount + (rowCount - 1) * paddingY;
                break;
            case LegendOrientation.Vertical:
                if (!(isFinite(height) && height > 0)) {
                    return false;
                }
                rowCount = itemCount * 2;
                // Split legend items into columns until the height is suitable.
                do {
                    rowCount = (rowCount >> 1) + (rowCount % 2);
                    columnWidth = 0;
                    let itemsWidth = 0;
                    let itemsHeight = 0;
                    let columnCount = 0;
                    let i = 0;
                    while (i < itemCount) {
                        const bbox = bboxes[i];
                        if (!columnCount) {
                            itemsHeight += bbox.height;
                        }
                        if (bbox.width > columnWidth) {
                            columnWidth = bbox.width;
                        }
                        i++;
                        if (i % rowCount === 0) {
                            itemsWidth += columnWidth;
                            columnWidth = 0;
                            columnCount++;
                        }
                    }
                    if (i % rowCount !== 0) {
                        itemsWidth += columnWidth;
                        columnCount++;
                    }
                    paddedItemsWidth = itemsWidth + (columnCount - 1) * paddingX;
                    paddedItemsHeight = itemsHeight + (rowCount - 1) * paddingY;
                } while (paddedItemsHeight > height && rowCount > 1);
                break;
        }
        // Top-left corner of the first legend item.
        const startX = (width - paddedItemsWidth) / 2;
        const startY = (height - paddedItemsHeight) / 2;
        let x = 0;
        let y = 0;
        columnWidth = 0;
        // Position legend items using the layout computed above.
        itemSelection.each((markerLabel, _, i) => {
            // Round off for pixel grid alignment to work properly.
            markerLabel.translationX = Math.floor(startX + x);
            markerLabel.translationY = Math.floor(startY + y);
            const bbox = bboxes[i];
            if (bbox.width > columnWidth) {
                columnWidth = bbox.width;
            }
            if ((i + 1) % rowCount === 0) {
                x += columnWidth + paddingX;
                y = 0;
                columnWidth = 0;
            }
            else {
                y += bbox.height + paddingY;
            }
        });
        // Update legend item properties that don't affect the layout.
        this.update();
        const size = this.size;
        const oldSize = this.oldSize;
        size[0] = paddedItemsWidth;
        size[1] = paddedItemsHeight;
        if (size[0] !== oldSize[0] || size[1] !== oldSize[1]) {
            oldSize[0] = size[0];
            oldSize[1] = size[1];
        }
    }
    update() {
        const { marker: { strokeWidth }, label: { color }, } = this.item;
        this.itemSelection.each((markerLabel, datum) => {
            const marker = datum.marker;
            markerLabel.markerFill = marker.fill;
            markerLabel.markerStroke = marker.stroke;
            markerLabel.markerStrokeWidth = strokeWidth;
            markerLabel.markerFillOpacity = marker.fillOpacity;
            markerLabel.markerStrokeOpacity = marker.strokeOpacity;
            markerLabel.opacity = datum.enabled ? 1 : 0.5;
            markerLabel.color = color;
        });
    }
    getDatumForPoint(x, y) {
        const node = this.group.pickNode(x, y);
        if (node && node.parent) {
            return node.parent.datum;
        }
    }
}
Legend.className = 'Legend';
__decorate([
    validation_1.Validate(validation_1.BOOLEAN)
], Legend.prototype, "_enabled", void 0);
__decorate([
    validation_1.Validate(validation_1.POSITION)
], Legend.prototype, "_position", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_BOOLEAN)
], Legend.prototype, "reverseOrder", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], Legend.prototype, "spacing", void 0);
exports.Legend = Legend;
