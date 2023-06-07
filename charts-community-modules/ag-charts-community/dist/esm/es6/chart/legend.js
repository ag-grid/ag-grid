var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { RedrawType } from '../scene/node';
import { Group } from '../scene/group';
import { Selection } from '../scene/selection';
import { MarkerLabel } from './markerLabel';
import { BBox } from '../scene/bbox';
import { getFont } from '../scene/shape/text';
import { getMarker } from './marker/util';
import { createId } from '../util/id';
import { HdpiCanvas } from '../canvas/hdpiCanvas';
import { BOOLEAN, NUMBER, OPT_BOOLEAN, OPT_FONT_STYLE, OPT_FONT_WEIGHT, OPT_FUNCTION, OPT_NUMBER, POSITION, COLOR_STRING, STRING, Validate, predicateWithMessage, OPTIONAL, } from '../util/validation';
import { Layers } from './layers';
import { ChartUpdateType } from './chartUpdateType';
import { gridLayout } from './gridLayout';
import { Pagination } from './pagination/pagination';
import { toTooltipHtml } from './tooltip/tooltip';
import { Logger } from '../util/logger';
const ORIENTATIONS = ['horizontal', 'vertical'];
const OPT_ORIENTATION = predicateWithMessage((v, ctx) => OPTIONAL(v, ctx, (v) => ORIENTATIONS.includes(v)), `expecting an orientation keyword such as 'horizontal' or 'vertical'`);
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
}
__decorate([
    Validate(OPT_NUMBER(0))
], LegendLabel.prototype, "maxLength", void 0);
__decorate([
    Validate(COLOR_STRING)
], LegendLabel.prototype, "color", void 0);
__decorate([
    Validate(OPT_FONT_STYLE)
], LegendLabel.prototype, "fontStyle", void 0);
__decorate([
    Validate(OPT_FONT_WEIGHT)
], LegendLabel.prototype, "fontWeight", void 0);
__decorate([
    Validate(NUMBER(0))
], LegendLabel.prototype, "fontSize", void 0);
__decorate([
    Validate(STRING)
], LegendLabel.prototype, "fontFamily", void 0);
__decorate([
    Validate(OPT_FUNCTION)
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
    Validate(NUMBER(0))
], LegendMarker.prototype, "size", void 0);
__decorate([
    Validate(NUMBER(0))
], LegendMarker.prototype, "padding", void 0);
__decorate([
    Validate(NUMBER(0))
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
    Validate(OPT_NUMBER(0))
], LegendItem.prototype, "maxWidth", void 0);
__decorate([
    Validate(NUMBER(0))
], LegendItem.prototype, "paddingX", void 0);
__decorate([
    Validate(NUMBER(0))
], LegendItem.prototype, "paddingY", void 0);
__decorate([
    Validate(BOOLEAN)
], LegendItem.prototype, "toggleSeriesVisible", void 0);
class LegendListeners {
    constructor() {
        this.legendItemClick = undefined;
        this.legendItemDoubleClick = undefined;
    }
}
__decorate([
    Validate(OPT_FUNCTION)
], LegendListeners.prototype, "legendItemClick", void 0);
export class Legend {
    constructor(ctx) {
        this.ctx = ctx;
        this.id = createId(this);
        this.group = new Group({ name: 'legend', layer: true, zIndex: Layers.LEGEND_ZINDEX });
        this.itemSelection = Selection.select(this.group, MarkerLabel);
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
        this.position = 'bottom';
        /** Used to constrain the width of the legend. */
        this.maxWidth = undefined;
        /** Used to constrain the height of the legend. */
        this.maxHeight = undefined;
        /** Reverse the display order of legend items if `true`. */
        this.reverseOrder = undefined;
        this.destroyFns = [];
        /**
         * Spacing between the legend and the edge of the chart's element.
         */
        this.spacing = 20;
        this.characterWidths = new Map();
        this.size = [0, 0];
        this._visible = true;
        this.item.marker.parent = this;
        this.pagination = new Pagination((type) => ctx.updateService.update(type), (page) => this.updatePageNumber(page), ctx.interactionManager, ctx.cursorManager);
        this.pagination.attachPagination(this.group);
        this.item.marker.parent = this;
        const interactionListeners = [
            ctx.interactionManager.addListener('click', (e) => this.checkLegendClick(e)),
            ctx.interactionManager.addListener('dblclick', (e) => this.checkLegendDoubleClick(e)),
            ctx.interactionManager.addListener('hover', (e) => this.handleLegendMouseMove(e)),
        ];
        const layoutListeners = [
            ctx.layoutService.addListener('start-layout', (e) => this.positionLegend(e.shrinkRect)),
        ];
        this.destroyFns.push(...interactionListeners.map((s) => () => ctx.interactionManager.removeListener(s)), ...layoutListeners.map((s) => () => ctx.layoutService.removeListener(s)), () => this.detachLegend());
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
    destroy() {
        this.destroyFns.forEach((f) => f());
    }
    onMarkerShapeChange() {
        this.itemSelection.clear();
        this.group.markDirty(this.group, RedrawType.MINOR);
    }
    getCharacterWidths(font) {
        const { characterWidths } = this;
        if (characterWidths.has(font)) {
            return characterWidths.get(font);
        }
        const cw = {
            '...': HdpiCanvas.getTextSize('...', font).width,
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
    detachLegend() {
        var _a;
        (_a = this.group.parent) === null || _a === void 0 ? void 0 : _a.removeChild(this.group);
    }
    getItemLabel(datum) {
        const { ctx: { callbackCache }, } = this;
        const { formatter } = this.item.label;
        if (formatter) {
            return callbackCache.call(formatter, {
                itemId: datum.itemId,
                value: datum.label.text,
                seriesId: datum.seriesId,
            });
        }
        return datum.label.text;
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
        this.itemSelection.update(data);
        // Update properties that affect the size of the legend items and measure them.
        const bboxes = [];
        const font = getFont(label);
        const itemMaxWidthPercentage = 0.8;
        const maxItemWidth = maxWidth !== null && maxWidth !== void 0 ? maxWidth : width * itemMaxWidthPercentage;
        const paddedMarkerWidth = markerSize + markerPadding + paddingX;
        this.itemSelection.each((markerLabel, datum) => {
            var _a;
            const Marker = getMarker(markerShape !== null && markerShape !== void 0 ? markerShape : datum.marker.shape);
            if (!(markerLabel.marker && markerLabel.marker instanceof Marker)) {
                markerLabel.marker = new Marker();
            }
            markerLabel.markerSize = markerSize;
            markerLabel.spacing = markerPadding;
            markerLabel.fontStyle = fontStyle;
            markerLabel.fontWeight = fontWeight;
            markerLabel.fontSize = fontSize;
            markerLabel.fontFamily = fontFamily;
            const id = (_a = datum.itemId) !== null && _a !== void 0 ? _a : datum.id;
            const labelText = this.getItemLabel(datum);
            const text = (labelText !== null && labelText !== void 0 ? labelText : '<unknown>').replace(/\r?\n/g, ' ');
            markerLabel.text = this.truncate(text, maxLength, maxItemWidth, paddedMarkerWidth, font, id);
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
    truncate(text, maxCharLength, maxItemWidth, paddedMarkerWidth, font, id) {
        const ellipsis = `...`;
        const textChars = text.split('');
        let addEllipsis = false;
        if (text.length > maxCharLength) {
            text = `${text.substring(0, maxCharLength)}`;
            addEllipsis = true;
        }
        const labelWidth = Math.floor(paddedMarkerWidth + HdpiCanvas.getTextSize(text, font).width);
        if (labelWidth > maxItemWidth) {
            let truncatedText = '';
            const characterWidths = this.getCharacterWidths(font);
            let cumulativeWidth = paddedMarkerWidth + characterWidths[ellipsis];
            for (const char of textChars) {
                if (!characterWidths[char]) {
                    characterWidths[char] = HdpiCanvas.getTextSize(char, font).width;
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
        if (addEllipsis) {
            text += ellipsis;
            this.truncatedItems.add(id);
        }
        else {
            this.truncatedItems.delete(id);
        }
        return text;
    }
    updatePagination(bboxes, width, height) {
        const orientation = this.getOrientation();
        const trackingIndex = Math.min(this.paginationTrackingIndex, bboxes.length);
        this.pagination.orientation = orientation;
        this.pagination.translationX = 0;
        this.pagination.translationY = 0;
        const { pages, maxPageHeight, maxPageWidth, paginationBBox, paginationVertical } = this.calculatePagination(bboxes, width, height);
        const newCurrentPage = pages.findIndex((p) => p.endIndex >= trackingIndex);
        this.pagination.currentPage = Math.min(Math.max(newCurrentPage, 0), pages.length - 1);
        const { paddingX: itemPaddingX, paddingY: itemPaddingY } = this.item;
        const paginationComponentPadding = 8;
        const legendItemsWidth = maxPageWidth - itemPaddingX;
        const legendItemsHeight = maxPageHeight - itemPaddingY;
        let paginationX = 0;
        let paginationY = -paginationBBox.y - this.item.marker.size / 2;
        if (paginationVertical) {
            paginationY += legendItemsHeight + paginationComponentPadding;
        }
        else {
            paginationX += -paginationBBox.x + legendItemsWidth + paginationComponentPadding;
            paginationY += (legendItemsHeight - paginationBBox.height) / 2;
        }
        this.pagination.translationX = paginationX;
        this.pagination.translationY = paginationY;
        this.pagination.update();
        this.pagination.updateMarkers();
        return {
            maxPageHeight,
            maxPageWidth,
            pages,
        };
    }
    calculatePagination(bboxes, width, height) {
        var _a, _b, _c;
        const { paddingX: itemPaddingX, paddingY: itemPaddingY } = this.item;
        const orientation = this.getOrientation();
        const paginationVertical = ['left', 'right'].includes(this.position);
        let paginationBBox = this.pagination.computeBBox();
        let lastPassPaginationBBox = new BBox(0, 0, 0, 0);
        let pages = [];
        let maxPageWidth = 0;
        let maxPageHeight = 0;
        let count = 0;
        const stableOutput = (lastPassPaginationBBox) => {
            const { width, height } = lastPassPaginationBBox;
            return width === paginationBBox.width && height === paginationBBox.height;
        };
        const forceResult = this.maxWidth !== undefined || this.maxHeight !== undefined;
        do {
            if (count++ > 10) {
                Logger.warn('unable to find stable legend layout.');
                break;
            }
            paginationBBox = lastPassPaginationBBox;
            const maxWidth = width - (paginationVertical ? 0 : paginationBBox.width);
            const maxHeight = height - (paginationVertical ? paginationBBox.height : 0);
            const layout = gridLayout({
                orientation,
                bboxes,
                maxHeight,
                maxWidth,
                itemPaddingY,
                itemPaddingX,
                forceResult,
            });
            pages = (_a = layout === null || layout === void 0 ? void 0 : layout.pages) !== null && _a !== void 0 ? _a : [];
            maxPageWidth = (_b = layout === null || layout === void 0 ? void 0 : layout.maxPageWidth) !== null && _b !== void 0 ? _b : 0;
            maxPageHeight = (_c = layout === null || layout === void 0 ? void 0 : layout.maxPageHeight) !== null && _c !== void 0 ? _c : 0;
            const totalPages = pages.length;
            this.pagination.visible = totalPages > 1;
            this.pagination.totalPages = totalPages;
            this.pagination.update();
            lastPassPaginationBBox = this.pagination.computeBBox();
            if (!this.pagination.visible) {
                break;
            }
        } while (!stableOutput(lastPassPaginationBBox));
        return { maxPageWidth, maxPageHeight, pages, paginationBBox, paginationVertical };
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
            const column = columns[columnIndex];
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
        this.ctx.updateService.update(ChartUpdateType.SCENE_RENDER);
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
            if (!(child instanceof MarkerLabel))
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
        const pageBBox = BBox.merge(visibleChildBBoxes);
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
        const { listeners: { legendItemClick }, ctx: { dataService, highlightManager }, item: { toggleSeriesVisible }, } = this;
        const { offsetX, offsetY } = event;
        const legendBBox = this.computeBBox();
        const pointerInsideLegend = this.group.visible && legendBBox.containsPoint(offsetX, offsetY);
        const datum = this.getDatumForPoint(offsetX, offsetY);
        if (!pointerInsideLegend || !datum) {
            return;
        }
        const { id, itemId, enabled } = datum;
        const chartSeries = dataService.getSeries();
        const series = chartSeries.find((s) => s.id === id);
        if (!series) {
            return;
        }
        event.consume();
        let newEnabled = enabled;
        if (toggleSeriesVisible) {
            newEnabled = !enabled;
            this.ctx.chartEventManager.legendItemClick(series, itemId, newEnabled);
        }
        if (!newEnabled) {
            highlightManager.updateHighlight(this.id);
        }
        else {
            highlightManager.updateHighlight(this.id, {
                series,
                itemId,
                datum: undefined,
            });
        }
        this.ctx.updateService.update(ChartUpdateType.PROCESS_DATA, { forceNodeDataRefresh: true });
        legendItemClick === null || legendItemClick === void 0 ? void 0 : legendItemClick({ type: 'click', enabled: newEnabled, itemId, seriesId: series.id });
    }
    checkLegendDoubleClick(event) {
        var _a;
        const { listeners: { legendItemDoubleClick }, ctx: { dataService }, item: { toggleSeriesVisible }, } = this;
        const { offsetX, offsetY } = event;
        // Integrated charts do not handle double click behaviour correctly due to multiple instances of the
        // chart being created. See https://ag-grid.atlassian.net/browse/RTI-1381
        if (this.ctx.mode === 'integrated') {
            return;
        }
        const legendBBox = this.computeBBox();
        const pointerInsideLegend = this.group.visible && legendBBox.containsPoint(offsetX, offsetY);
        const datum = this.getDatumForPoint(offsetX, offsetY);
        if (!pointerInsideLegend || !datum) {
            return;
        }
        const { id, itemId, seriesId } = datum;
        const chartSeries = dataService.getSeries();
        const series = chartSeries.find((s) => s.id === id);
        if (!series) {
            return;
        }
        event.consume();
        if (toggleSeriesVisible) {
            const legendData = chartSeries.reduce((ls, s) => [
                ...ls,
                ...s.getLegendData().filter((d) => d.legendType === 'category'),
            ], []);
            const numVisibleItems = {};
            legendData.forEach((d) => {
                var _a;
                var _b;
                (_a = numVisibleItems[_b = d.seriesId]) !== null && _a !== void 0 ? _a : (numVisibleItems[_b] = 0);
                if (d.enabled)
                    numVisibleItems[d.seriesId]++;
            });
            const clickedItem = legendData.find((d) => d.itemId === itemId && d.seriesId === seriesId);
            this.ctx.chartEventManager.legendItemDoubleClick(series, itemId, (_a = clickedItem === null || clickedItem === void 0 ? void 0 : clickedItem.enabled) !== null && _a !== void 0 ? _a : false, numVisibleItems);
        }
        this.ctx.updateService.update(ChartUpdateType.PROCESS_DATA, { forceNodeDataRefresh: true });
        legendItemDoubleClick === null || legendItemDoubleClick === void 0 ? void 0 : legendItemDoubleClick({ type: 'dblclick', enabled: true, itemId, seriesId: series.id });
    }
    handleLegendMouseMove(event) {
        var _a;
        const { enabled, item: { toggleSeriesVisible }, listeners, } = this;
        if (!enabled) {
            return;
        }
        const legendBBox = this.computeBBox();
        const { pageX, pageY, offsetX, offsetY } = event;
        const pointerInsideLegend = this.group.visible && legendBBox.containsPoint(offsetX, offsetY);
        if (!pointerInsideLegend) {
            this.ctx.cursorManager.updateCursor(this.id);
            this.ctx.highlightManager.updateHighlight(this.id);
            this.ctx.tooltipManager.removeTooltip(this.id);
            return;
        }
        // Prevent other handlers from consuming this event if it's generated inside the legend
        // boundaries.
        event.consume();
        const datum = this.getDatumForPoint(offsetX, offsetY);
        const pointerOverLegendDatum = pointerInsideLegend && datum !== undefined;
        if (!pointerOverLegendDatum) {
            this.ctx.cursorManager.updateCursor(this.id);
            this.ctx.highlightManager.updateHighlight(this.id);
            return;
        }
        const series = datum ? this.ctx.dataService.getSeries().find((series) => series.id === (datum === null || datum === void 0 ? void 0 : datum.id)) : undefined;
        if (datum && this.truncatedItems.has((_a = datum.itemId) !== null && _a !== void 0 ? _a : datum.id)) {
            const labelText = this.getItemLabel(datum);
            this.ctx.tooltipManager.updateTooltip(this.id, { pageX, pageY, offsetX, offsetY, event, showArrow: false }, toTooltipHtml({ content: labelText }));
        }
        else {
            this.ctx.tooltipManager.removeTooltip(this.id);
        }
        if (toggleSeriesVisible || listeners.legendItemClick != null || listeners.legendItemDoubleClick != null) {
            this.ctx.cursorManager.updateCursor(this.id, 'pointer');
        }
        if ((datum === null || datum === void 0 ? void 0 : datum.enabled) && series) {
            this.ctx.highlightManager.updateHighlight(this.id, {
                series,
                itemId: datum === null || datum === void 0 ? void 0 : datum.itemId,
                datum: undefined,
            });
        }
        else {
            this.ctx.highlightManager.updateHighlight(this.id);
        }
    }
    positionLegend(shrinkRect) {
        const newShrinkRect = shrinkRect.clone();
        if (!this.enabled || !this.data.length) {
            return { shrinkRect: newShrinkRect };
        }
        const [legendWidth, legendHeight] = this.calculateLegendDimensions(shrinkRect);
        this.group.translationX = 0;
        this.group.translationY = 0;
        this.performLayout(legendWidth, legendHeight);
        const legendBBox = this.computePagedBBox();
        const calculateTranslationPerpendicularDimension = () => {
            switch (this.position) {
                case 'top':
                    return 0;
                case 'bottom':
                    return shrinkRect.height - legendBBox.height;
                case 'left':
                    return 0;
                case 'right':
                default:
                    return shrinkRect.width - legendBBox.width;
            }
        };
        if (this.visible) {
            let translationX;
            let translationY;
            switch (this.position) {
                case 'top':
                case 'bottom':
                    translationX = (shrinkRect.width - legendBBox.width) / 2;
                    translationY = calculateTranslationPerpendicularDimension();
                    newShrinkRect.shrink(legendBBox.height, this.position);
                    break;
                case 'left':
                case 'right':
                default:
                    translationX = calculateTranslationPerpendicularDimension();
                    translationY = (shrinkRect.height - legendBBox.height) / 2;
                    newShrinkRect.shrink(legendBBox.width, this.position);
            }
            // Round off for pixel grid alignment to work properly.
            this.group.translationX = Math.floor(-legendBBox.x + shrinkRect.x + translationX);
            this.group.translationY = Math.floor(-legendBBox.y + shrinkRect.y + translationY);
        }
        if (this.visible && this.enabled && this.data.length) {
            const legendPadding = this.spacing;
            newShrinkRect.shrink(legendPadding, this.position);
            const legendPositionedBBox = legendBBox.clone();
            legendPositionedBBox.x += this.group.translationX;
            legendPositionedBBox.y += this.group.translationY;
            this.ctx.tooltipManager.updateExclusiveRect(this.id, legendPositionedBBox);
        }
        else {
            this.ctx.tooltipManager.updateExclusiveRect(this.id);
        }
        return { shrinkRect: newShrinkRect };
    }
    calculateLegendDimensions(shrinkRect) {
        const { width, height } = shrinkRect;
        const aspectRatio = width / height;
        const maxCoefficient = 0.5;
        const minHeightCoefficient = 0.2;
        const minWidthCoefficient = 0.25;
        let legendWidth = 0;
        let legendHeight = 0;
        switch (this.position) {
            case 'top':
            case 'bottom':
                // A horizontal legend should take maximum between 20 to 50 percent of the chart height if height is larger than width
                // and maximum 20 percent of the chart height if height is smaller than width.
                const heightCoefficient = aspectRatio < 1
                    ? Math.min(maxCoefficient, minHeightCoefficient * (1 / aspectRatio))
                    : minHeightCoefficient;
                legendWidth = this.maxWidth ? Math.min(this.maxWidth, width) : width;
                legendHeight = this.maxHeight
                    ? Math.min(this.maxHeight, height)
                    : Math.round(height * heightCoefficient);
                break;
            case 'left':
            case 'right':
            default:
                // A vertical legend should take maximum between 25 to 50 percent of the chart width if width is larger than height
                // and maximum 25 percent of the chart width if width is smaller than height.
                const widthCoefficient = aspectRatio > 1 ? Math.min(maxCoefficient, minWidthCoefficient * aspectRatio) : minWidthCoefficient;
                legendWidth = this.maxWidth ? Math.min(this.maxWidth, width) : Math.round(width * widthCoefficient);
                legendHeight = this.maxHeight ? Math.min(this.maxHeight, height) : height;
        }
        return [legendWidth, legendHeight];
    }
}
Legend.className = 'Legend';
__decorate([
    Validate(BOOLEAN)
], Legend.prototype, "_enabled", void 0);
__decorate([
    Validate(POSITION)
], Legend.prototype, "position", void 0);
__decorate([
    Validate(OPT_NUMBER(0))
], Legend.prototype, "maxWidth", void 0);
__decorate([
    Validate(OPT_NUMBER(0))
], Legend.prototype, "maxHeight", void 0);
__decorate([
    Validate(OPT_BOOLEAN)
], Legend.prototype, "reverseOrder", void 0);
__decorate([
    Validate(OPT_ORIENTATION)
], Legend.prototype, "orientation", void 0);
__decorate([
    Validate(NUMBER(0))
], Legend.prototype, "spacing", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVnZW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L2xlZ2VuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQVEsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ2pELE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUN2QyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDL0MsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM1QyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3JDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQVk5QyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDdEMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ2xELE9BQU8sRUFDSCxPQUFPLEVBQ1AsTUFBTSxFQUNOLFdBQVcsRUFDWCxjQUFjLEVBQ2QsZUFBZSxFQUNmLFlBQVksRUFDWixVQUFVLEVBQ1YsUUFBUSxFQUNSLFlBQVksRUFDWixNQUFNLEVBQ04sUUFBUSxFQUNSLG9CQUFvQixFQUNwQixRQUFRLEdBQ1gsTUFBTSxvQkFBb0IsQ0FBQztBQUM1QixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ2xDLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUVwRCxPQUFPLEVBQUUsVUFBVSxFQUFRLE1BQU0sY0FBYyxDQUFDO0FBQ2hELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNyRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFbEQsT0FBTyxFQUFFLE1BQU0sRUFB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