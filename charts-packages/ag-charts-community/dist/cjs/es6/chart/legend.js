"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Legend = exports.OPT_ORIENTATION = void 0;
const group_1 = require("../scene/group");
const selection_1 = require("../scene/selection");
const markerLabel_1 = require("./markerLabel");
const bbox_1 = require("../scene/bbox");
const text_1 = require("../scene/shape/text");
const util_1 = require("./marker/util");
const id_1 = require("../util/id");
const node_1 = require("../scene/node");
const hdpiCanvas_1 = require("../canvas/hdpiCanvas");
const validation_1 = require("../util/validation");
const layers_1 = require("./layers");
const chart_1 = require("./chart");
const gridLayout_1 = require("./gridLayout");
const pagination_1 = require("./pagination/pagination");
const ORIENTATIONS = ['horizontal', 'vertical'];
exports.OPT_ORIENTATION = validation_1.predicateWithMessage((v, ctx) => validation_1.OPTIONAL(v, ctx, (v) => ORIENTATIONS.includes(v)), `expecting an orientation keyword such as 'horizontal' or 'vertical'`);
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
        this.toggleSeriesVisible = true;
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
__decorate([
    validation_1.Validate(validation_1.BOOLEAN)
], LegendItem.prototype, "toggleSeriesVisible", void 0);
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
class Legend {
    constructor(chart, interactionManager, cursorManager, highlightManager) {
        this.chart = chart;
        this.interactionManager = interactionManager;
        this.cursorManager = cursorManager;
        this.highlightManager = highlightManager;
        this.id = id_1.createId(this);
        this.group = new group_1.Group({ name: 'legend', layer: true, zIndex: layers_1.Layers.LEGEND_ZINDEX });
        this.itemSelection = selection_1.Selection.select(this.group).selectAll();
        this.oldSize = [0, 0];
        this.pages = [];
        this.maxPageSize = [0, 0];
        /** Item index to track on re-pagination, so current page updates appropriately. */
        this.paginationTrackingIndex = 0;
        this.item = new LegendItem();
        this.listeners = new LegendListeners();
        this.truncatedItems = new Set();
        this._data = [];
        this._enabled = true;
        this.position = 'right';
        /** Used to constrain the width of the legend. */
        this.maxWidth = undefined;
        /** Used to constrain the height of the legend. */
        this.maxHeight = undefined;
        /** Reverse the display order of legend items if `true`. */
        this.reverseOrder = undefined;
        /**
         * Spacing between the legend and the edge of the chart's element.
         */
        this.spacing = 20;
        this.characterWidths = new Map();
        this.size = [0, 0];
        this._visible = true;
        this.item.marker.parent = this;
        this.pagination = new pagination_1.Pagination((type) => this.chart.update(type), (page) => this.updatePageNumber(page), this.interactionManager, this.cursorManager);
        this.pagination.attachPagination(this.group);
        this.item.marker.parent = this;
        this.interactionManager.addListener('click', (e) => this.checkLegendClick(e));
        this.interactionManager.addListener('hover', (e) => this.handleLegendMouseMove(e));
    }
    set translationX(value) {
        this.group.translationX = value;
    }
    get translationX() {
        return this.group.translationX;
    }
    set translationY(value) {
        this.group.translationY = value;
    }
    get translationY() {
        return this.group.translationY;
    }
    set data(value) {
        this._data = value;
        this.updateGroupVisibility();
    }
    get data() {
        return this._data;
    }
    set enabled(value) {
        this._enabled = value;
        this.updateGroupVisibility();
    }
    get enabled() {
        return this._enabled;
    }
    getOrientation() {
        if (this.orientation !== undefined) {
            return this.orientation;
        }
        switch (this.position) {
            case 'right':
            case 'left':
                return 'vertical';
            case 'bottom':
            case 'top':
                return 'horizontal';
        }
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
    set visible(value) {
        this._visible = value;
        this.updateGroupVisibility();
    }
    get visible() {
        return this._visible;
    }
    updateGroupVisibility() {
        this.group.visible = this.enabled && this.visible && this.data.length > 0;
    }
    attachLegend(node) {
        node.append(this.group);
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
        // Update properties that affect the size of the legend items and measure them.
        const bboxes = [];
        const font = label.getFont();
        const ellipsis = `...`;
        const itemMaxWidthPercentage = 0.8;
        const maxItemWidth = maxWidth !== null && maxWidth !== void 0 ? maxWidth : width * itemMaxWidthPercentage;
        const paddedMarkerWidth = markerSize + markerPadding + paddingX;
        itemSelection.each((markerLabel, datum) => {
            var _a;
            let text = (_a = datum.label.text) !== null && _a !== void 0 ? _a : '<unknown>';
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
            const labelWidth = Math.floor(paddedMarkerWidth + hdpiCanvas_1.HdpiCanvas.getTextSize(text, font).width);
            if (labelWidth > maxItemWidth) {
                let truncatedText = '';
                const characterWidths = this.getCharacterWidths(font);
                let cumulativeWidth = paddedMarkerWidth + characterWidths[ellipsis];
                for (const char of textChars) {
                    if (!characterWidths[char]) {
                        characterWidths[char] = hdpiCanvas_1.HdpiCanvas.getTextSize(char, font).width;
                    }
                    cumulativeWidth += characterWidths[char];
                    if (cumulativeWidth > maxItemWidth) {
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
        width = Math.max(1, width);
        height = Math.max(1, height);
        if (!isFinite(width)) {
            return false;
        }
        const size = this.size;
        const oldSize = this.oldSize;
        size[0] = width;
        size[1] = height;
        if (size[0] !== oldSize[0] || size[1] !== oldSize[1]) {
            oldSize[0] = size[0];
            oldSize[1] = size[1];
        }
        const { pages, maxPageHeight, maxPageWidth } = this.updatePagination(bboxes, width, height);
        this.pages = pages;
        this.maxPageSize = [maxPageWidth - paddingX, maxPageHeight - paddingY];
        const pageNumber = this.pagination.currentPage;
        const page = this.pages[pageNumber];
        if (this.pages.length < 1 || !page) {
            this.visible = false;
            return;
        }
        this.visible = true;
        // Position legend items
        this.updatePositions(pageNumber);
        // Update legend item properties that don't affect the layout.
        this.update();
    }
    updatePagination(bboxes, width, height) {
        const { paddingX: itemPaddingX, paddingY: itemPaddingY } = this.item;
        const orientation = this.getOrientation();
        const verticalOrientation = orientation === 'vertical';
        this.pagination.orientation = orientation;
        this.pagination.translationX = 0;
        this.pagination.translationY = 0;
        let paginationBBox = this.pagination.computeBBox();
        let lastPassPaginationBBox = new bbox_1.BBox(0, 0, 0, 0);
        let pages = [];
        let maxPageWidth = 0;
        let maxPageHeight = 0;
        let count = 0;
        const trackingIndex = Math.min(this.paginationTrackingIndex, bboxes.length);
        const stableOutput = (lastPassPaginationBBox) => {
            const { width, height } = lastPassPaginationBBox;
            return width === paginationBBox.width && height === paginationBBox.height;
        };
        const forceResult = this.maxWidth !== undefined || this.maxHeight !== undefined;
        do {
            if (count++ > 10) {
                console.warn('AG Charts - unable to find stable legend layout.');
                break;
            }
            paginationBBox = lastPassPaginationBBox;
            const maxWidth = width - (verticalOrientation ? 0 : paginationBBox.width);
            const maxHeight = height - (verticalOrientation ? paginationBBox.height : 0);
            const layout = gridLayout_1.gridLayout({
                orientation,
                bboxes,
                maxHeight,
                maxWidth,
                itemPaddingY,
                itemPaddingX,
                forceResult,
            });
            if (layout) {
                pages = layout.pages;
                maxPageWidth = layout.maxPageWidth;
                maxPageHeight = layout.maxPageHeight;
            }
            const totalPages = pages.length;
            this.pagination.visible = totalPages > 1;
            this.pagination.totalPages = totalPages;
            this.pagination.update();
            lastPassPaginationBBox = this.pagination.computeBBox();
            if (!this.pagination.visible) {
                break;
            }
        } while (!stableOutput(lastPassPaginationBBox));
        const newCurrentPage = pages.findIndex((p) => p.endIndex >= trackingIndex);
        this.pagination.currentPage = Math.min(Math.max(newCurrentPage, 0), pages.length - 1);
        const paginationComponentPadding = 8;
        const legendItemsWidth = maxPageWidth - itemPaddingX;
        const legendItemsHeight = maxPageHeight - itemPaddingY;
        this.pagination.translationX = verticalOrientation
            ? 0
            : -paginationBBox.x + legendItemsWidth + paginationComponentPadding;
        this.pagination.translationY =
            -paginationBBox.y -
                this.item.marker.size / 2 +
                (verticalOrientation
                    ? legendItemsHeight + paginationComponentPadding
                    : (legendItemsHeight - paginationBBox.height) / 2);
        this.pagination.update();
        this.pagination.updateMarkers();
        return {
            maxPageHeight,
            maxPageWidth,
            pages,
        };
    }
    updatePositions(pageNumber = 0) {
        const { item: { paddingY }, itemSelection, pages, } = this;
        if (pages.length < 1 || !pages[pageNumber]) {
            return;
        }
        const { columns, startIndex: visibleStart, endIndex: visibleEnd } = pages[pageNumber];
        // Position legend items using the layout computed above.
        let x = 0;
        let y = 0;
        const columnCount = columns.length;
        const rowCount = columns[0].indices.length;
        const horizontal = this.getOrientation() === 'horizontal';
        const itemHeight = columns[0].bboxes[0].height + paddingY;
        const rowSumColumnWidths = [];
        itemSelection.each((markerLabel, _, i) => {
            var _a, _b;
            if (i < visibleStart || i > visibleEnd) {
                markerLabel.visible = false;
                return;
            }
            const pageIndex = i - visibleStart;
            let columnIndex = 0;
            let rowIndex = 0;
            if (horizontal) {
                columnIndex = pageIndex % columnCount;
                rowIndex = Math.floor(pageIndex / columnCount);
            }
            else {
                columnIndex = Math.floor(pageIndex / rowCount);
                rowIndex = pageIndex % rowCount;
            }
            markerLabel.visible = true;
            let column = columns[columnIndex];
            if (!column) {
                return;
            }
            y = itemHeight * rowIndex;
            x = (_a = rowSumColumnWidths[rowIndex]) !== null && _a !== void 0 ? _a : 0;
            rowSumColumnWidths[rowIndex] = ((_b = rowSumColumnWidths[rowIndex]) !== null && _b !== void 0 ? _b : 0) + column.columnWidth;
            // Round off for pixel grid alignment to work properly.
            markerLabel.translationX = Math.floor(x);
            markerLabel.translationY = Math.floor(y);
        });
    }
    updatePageNumber(pageNumber) {
        const { pages } = this;
        // Track an item on the page in re-pagination cases (e.g. resize).
        const { startIndex, endIndex } = pages[pageNumber];
        if (startIndex === 0) {
            // Stay on first page on pagination update.
            this.paginationTrackingIndex = 0;
        }
        else if (pageNumber === pages.length - 1) {
            // Stay on last page on pagination update.
            this.paginationTrackingIndex = endIndex;
        }
        else {
            // Track the middle item on the page).
            this.paginationTrackingIndex = Math.floor((startIndex + endIndex) / 2);
        }
        this.pagination.update();
        this.pagination.updateMarkers();
        this.updatePositions(pageNumber);
        this.chart.update(chart_1.ChartUpdateType.SCENE_RENDER);
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
        const visibleChildBBoxes = [];
        const closestLeftTop = { dist: Infinity, datum: undefined };
        for (const child of this.group.children) {
            if (!child.visible)
                continue;
            if (!(child instanceof markerLabel_1.MarkerLabel))
                continue;
            const childBBox = child.computeBBox();
            childBBox.grow(this.item.paddingX / 2, 'horizontal');
            childBBox.grow(this.item.paddingY / 2, 'vertical');
            if (childBBox.containsPoint(x, y)) {
                return child.datum;
            }
            const distX = x - childBBox.x - this.item.paddingX / 2;
            const distY = y - childBBox.y - this.item.paddingY / 2;
            const dist = Math.pow(distX, 2) + Math.pow(distY, 2);
            const toTheLeftTop = distX >= 0 && distY >= 0;
            if (toTheLeftTop && dist < closestLeftTop.dist) {
                closestLeftTop.dist = dist;
                closestLeftTop.datum = child.datum;
            }
            visibleChildBBoxes.push(childBBox);
        }
        const pageBBox = bbox_1.BBox.merge(visibleChildBBoxes);
        if (!pageBBox.containsPoint(x, y)) {
            // We're not in-between legend items.
            return undefined;
        }
        // Fallback to returning closest match to the left/up.
        return closestLeftTop.datum;
    }
    computeBBox() {
        return this.group.computeBBox();
    }
    computePagedBBox() {
        const actualBBox = this.group.computeBBox();
        if (this.pages.length <= 1) {
            return actualBBox;
        }
        const [maxPageWidth, maxPageHeight] = this.maxPageSize;
        actualBBox.height = Math.max(maxPageHeight, actualBBox.height);
        actualBBox.width = Math.max(maxPageWidth, actualBBox.width);
        return actualBBox;
    }
    checkLegendClick(event) {
        const { listeners: { legendItemClick }, chart, highlightManager, item: { toggleSeriesVisible }, } = this;
        const datum = this.getDatumForPoint(event.offsetX, event.offsetY);
        if (!datum) {
            return;
        }
        const { id, itemId, enabled } = datum;
        const series = chart.series.find((s) => s.id === id);
        if (!series) {
            return;
        }
        event.consume();
        let newEnabled = enabled;
        if (toggleSeriesVisible) {
            newEnabled = !enabled;
            series.toggleSeriesItem(itemId, newEnabled);
        }
        if (!newEnabled) {
            chart.togglePointer(false);
            highlightManager.updateHighlight(this.id);
        }
        else {
            highlightManager.updateHighlight(this.id, {
                series,
                itemId,
                datum: undefined,
            });
        }
        this.chart.update(chart_1.ChartUpdateType.PROCESS_DATA, { forceNodeDataRefresh: true });
        legendItemClick({ enabled: newEnabled, itemId, seriesId: series.id });
    }
    handleLegendMouseMove(event) {
        const { enabled, item: { toggleSeriesVisible }, listeners, } = this;
        if (!enabled) {
            return;
        }
        const legendBBox = this.computeBBox();
        const { offsetX, offsetY } = event;
        const pointerInsideLegend = this.group.visible && legendBBox.containsPoint(offsetX, offsetY);
        if (!pointerInsideLegend) {
            this.cursorManager.updateCursor(this.id);
            this.highlightManager.updateHighlight(this.id);
            if (this.chart.element.title) {
                this.chart.element.title = '';
            }
            return;
        }
        // Prevent other handlers from consuming this event if it's generated inside the legend
        // boundaries.
        event.consume();
        const datum = this.getDatumForPoint(offsetX, offsetY);
        const pointerOverLegendDatum = pointerInsideLegend && datum !== undefined;
        if (!pointerOverLegendDatum) {
            this.cursorManager.updateCursor(this.id);
            this.highlightManager.updateHighlight(this.id);
            return;
        }
        if (datum && this.truncatedItems.has(datum.itemId || datum.id)) {
            this.chart.element.title = datum.label.text;
        }
        else {
            this.chart.element.title = '';
        }
        if (toggleSeriesVisible || listeners.legendItemClick !== NO_OP_LISTENER) {
            this.cursorManager.updateCursor(this.id, 'pointer');
        }
        const series = datum ? this.chart.series.find((series) => series.id === (datum === null || datum === void 0 ? void 0 : datum.id)) : undefined;
        if ((datum === null || datum === void 0 ? void 0 : datum.enabled) && series) {
            this.highlightManager.updateHighlight(this.id, {
                series,
                itemId: datum === null || datum === void 0 ? void 0 : datum.itemId,
                datum: undefined,
            });
        }
        else {
            this.highlightManager.updateHighlight(this.id);
        }
    }
}
Legend.className = 'Legend';
__decorate([
    validation_1.Validate(validation_1.BOOLEAN)
], Legend.prototype, "_enabled", void 0);
__decorate([
    validation_1.Validate(validation_1.POSITION)
], Legend.prototype, "position", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_NUMBER(0))
], Legend.prototype, "maxWidth", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_NUMBER(0))
], Legend.prototype, "maxHeight", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_BOOLEAN)
], Legend.prototype, "reverseOrder", void 0);
__decorate([
    validation_1.Validate(exports.OPT_ORIENTATION)
], Legend.prototype, "orientation", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], Legend.prototype, "spacing", void 0);
exports.Legend = Legend;
