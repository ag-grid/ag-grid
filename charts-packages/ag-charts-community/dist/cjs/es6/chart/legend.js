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
const observable_1 = require("../util/observable");
const util_1 = require("./marker/util");
const id_1 = require("../util/id");
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
class LegendLabel extends observable_1.Observable {
    constructor() {
        super(...arguments);
        this.color = 'black';
        this.fontSize = 12;
        this.fontFamily = 'Verdana, sans-serif';
    }
}
__decorate([
    observable_1.reactive('change')
], LegendLabel.prototype, "color", void 0);
__decorate([
    observable_1.reactive('layoutChange')
], LegendLabel.prototype, "fontStyle", void 0);
__decorate([
    observable_1.reactive('layoutChange')
], LegendLabel.prototype, "fontWeight", void 0);
__decorate([
    observable_1.reactive('layoutChange')
], LegendLabel.prototype, "fontSize", void 0);
__decorate([
    observable_1.reactive('layoutChange')
], LegendLabel.prototype, "fontFamily", void 0);
__decorate([
    observable_1.reactive()
], LegendLabel.prototype, "formatter", void 0);
exports.LegendLabel = LegendLabel;
class LegendMarker extends observable_1.Observable {
    constructor() {
        super(...arguments);
        this.size = 15;
        /**
         * Padding between the marker and the label within each legend item.
         */
        this.padding = 8;
        this.strokeWidth = 1;
    }
}
__decorate([
    observable_1.reactive('layoutChange')
], LegendMarker.prototype, "size", void 0);
__decorate([
    observable_1.reactive('layoutChange')
], LegendMarker.prototype, "shape", void 0);
__decorate([
    observable_1.reactive('layoutChange')
], LegendMarker.prototype, "padding", void 0);
__decorate([
    observable_1.reactive('change')
], LegendMarker.prototype, "strokeWidth", void 0);
exports.LegendMarker = LegendMarker;
class LegendItem extends observable_1.Observable {
    constructor() {
        super();
        this.marker = new LegendMarker();
        this.label = new LegendLabel();
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
        const changeListener = () => this.fireEvent({ type: 'change' });
        this.marker.addEventListener('change', changeListener);
        this.label.addEventListener('change', changeListener);
        const layoutChangeListener = () => this.fireEvent({ type: 'layoutChange' });
        this.marker.addEventListener('layoutChange', layoutChangeListener);
        this.label.addEventListener('layoutChange', layoutChangeListener);
    }
}
__decorate([
    observable_1.reactive('layoutChange')
], LegendItem.prototype, "paddingX", void 0);
__decorate([
    observable_1.reactive('layoutChange')
], LegendItem.prototype, "paddingY", void 0);
exports.LegendItem = LegendItem;
class Legend extends observable_1.Observable {
    constructor() {
        super();
        this.id = id_1.createId(this);
        this.group = new group_1.Group();
        this.itemSelection = selection_1.Selection.select(this.group).selectAll();
        this.oldSize = [0, 0];
        this.item = new LegendItem();
        this.data = [];
        this.enabled = true;
        this.orientation = LegendOrientation.Vertical;
        this.position = LegendPosition.Right;
        /**
         * Spacing between the legend and the edge of the chart's element.
         */
        this.spacing = 20;
        this._size = [0, 0];
        this.addPropertyListener('data', this.onDataChange);
        this.addPropertyListener('enabled', this.onEnabledChange);
        this.addPropertyListener('position', this.onPositionChange);
        this.item.marker.addPropertyListener('shape', this.onMarkerShapeChange, this);
        this.addEventListener('change', this.update);
        this.item.addEventListener('change', () => this.fireEvent({ type: 'change' }));
        this.item.addEventListener('layoutChange', () => this.fireEvent({ type: 'layoutChange' }));
    }
    get size() {
        return this._size;
    }
    onDataChange(event) {
        this.group.visible = event.value.length > 0 && this.enabled;
    }
    onEnabledChange(event) {
        this.group.visible = event.value && this.data.length > 0;
    }
    onPositionChange(event) {
        switch (event.value) {
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
    onMarkerShapeChange() {
        this.itemSelection = this.itemSelection.setData([]);
        this.itemSelection.exit.remove();
        if (this.group.scene) {
            this.group.scene.dirty = false;
        }
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
        const { item } = this;
        const { marker, paddingX, paddingY } = item;
        const updateSelection = this.itemSelection.setData(this.data, (_, datum) => {
            const MarkerShape = util_1.getMarker(marker.shape || datum.marker.shape);
            return datum.id + '-' + datum.itemId + '-' + MarkerShape.name;
        });
        updateSelection.exit.remove();
        const enterSelection = updateSelection.enter.append(markerLabel_1.MarkerLabel).each((node, datum) => {
            const MarkerShape = util_1.getMarker(marker.shape || datum.marker.shape);
            node.marker = new MarkerShape();
        });
        const itemSelection = this.itemSelection = updateSelection.merge(enterSelection);
        const itemCount = itemSelection.size;
        // Update properties that affect the size of the legend items and measure them.
        const bboxes = [];
        const itemMarker = this.item.marker;
        const itemLabel = this.item.label;
        const maxCharCount = 25;
        const ellipsis = `...`;
        itemSelection.each((markerLabel, datum) => {
            // TODO: measure only when one of these properties or data change (in a separate routine)
            markerLabel.markerSize = itemMarker.size;
            markerLabel.spacing = itemMarker.padding;
            markerLabel.fontStyle = itemLabel.fontStyle;
            markerLabel.fontWeight = itemLabel.fontWeight;
            markerLabel.fontSize = itemLabel.fontSize;
            markerLabel.fontFamily = itemLabel.fontFamily;
            let text = datum.label.text;
            if (text.length > maxCharCount) {
                text = `${text.substring(0, maxCharCount - ellipsis.length)}${ellipsis}`;
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
        itemSelection.each((markerLabel, datum, i) => {
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
        const size = this._size;
        const oldSize = this.oldSize;
        size[0] = paddedItemsWidth;
        size[1] = paddedItemsHeight;
        if (size[0] !== oldSize[0] || size[1] !== oldSize[1]) {
            oldSize[0] = size[0];
            oldSize[1] = size[1];
        }
    }
    update() {
        this.itemSelection.each((markerLabel, datum) => {
            const marker = datum.marker;
            markerLabel.markerFill = marker.fill;
            markerLabel.markerStroke = marker.stroke;
            markerLabel.markerStrokeWidth = this.item.marker.strokeWidth;
            markerLabel.markerFillOpacity = marker.fillOpacity;
            markerLabel.markerStrokeOpacity = marker.strokeOpacity;
            markerLabel.opacity = datum.enabled ? 1 : 0.5;
            markerLabel.color = this.item.label.color;
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
    observable_1.reactive('layoutChange')
], Legend.prototype, "data", void 0);
__decorate([
    observable_1.reactive('layoutChange')
], Legend.prototype, "enabled", void 0);
__decorate([
    observable_1.reactive('layoutChange')
], Legend.prototype, "orientation", void 0);
__decorate([
    observable_1.reactive('layoutChange')
], Legend.prototype, "position", void 0);
__decorate([
    observable_1.reactive('layoutChange')
], Legend.prototype, "spacing", void 0);
exports.Legend = Legend;
//# sourceMappingURL=legend.js.map