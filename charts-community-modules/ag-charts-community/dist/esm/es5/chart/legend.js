var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
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
var ORIENTATIONS = ['horizontal', 'vertical'];
var OPT_ORIENTATION = predicateWithMessage(function (v, ctx) { return OPTIONAL(v, ctx, function (v) { return ORIENTATIONS.includes(v); }); }, "expecting an orientation keyword such as 'horizontal' or 'vertical'");
var LegendLabel = /** @class */ (function () {
    function LegendLabel() {
        this.maxLength = undefined;
        this.color = 'black';
        this.fontStyle = undefined;
        this.fontWeight = undefined;
        this.fontSize = 12;
        this.fontFamily = 'Verdana, sans-serif';
        this.formatter = undefined;
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
    return LegendLabel;
}());
var LegendMarker = /** @class */ (function () {
    function LegendMarker() {
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
    Object.defineProperty(LegendMarker.prototype, "shape", {
        get: function () {
            return this._shape;
        },
        set: function (value) {
            var _a;
            this._shape = value;
            (_a = this.parent) === null || _a === void 0 ? void 0 : _a.onMarkerShapeChange();
        },
        enumerable: false,
        configurable: true
    });
    __decorate([
        Validate(NUMBER(0))
    ], LegendMarker.prototype, "size", void 0);
    __decorate([
        Validate(NUMBER(0))
    ], LegendMarker.prototype, "padding", void 0);
    __decorate([
        Validate(NUMBER(0))
    ], LegendMarker.prototype, "strokeWidth", void 0);
    return LegendMarker;
}());
var LegendItem = /** @class */ (function () {
    function LegendItem() {
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
    return LegendItem;
}());
var LegendListeners = /** @class */ (function () {
    function LegendListeners() {
        this.legendItemClick = undefined;
        this.legendItemDoubleClick = undefined;
    }
    __decorate([
        Validate(OPT_FUNCTION)
    ], LegendListeners.prototype, "legendItemClick", void 0);
    return LegendListeners;
}());
var Legend = /** @class */ (function () {
    function Legend(ctx) {
        var _a;
        var _this = this;
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
        this.pagination = new Pagination(function (type) { return ctx.updateService.update(type); }, function (page) { return _this.updatePageNumber(page); }, ctx.interactionManager, ctx.cursorManager);
        this.pagination.attachPagination(this.group);
        this.item.marker.parent = this;
        var interactionListeners = [
            ctx.interactionManager.addListener('click', function (e) { return _this.checkLegendClick(e); }),
            ctx.interactionManager.addListener('dblclick', function (e) { return _this.checkLegendDoubleClick(e); }),
            ctx.interactionManager.addListener('hover', function (e) { return _this.handleLegendMouseMove(e); }),
        ];
        var layoutListeners = [
            ctx.layoutService.addListener('start-layout', function (e) { return _this.positionLegend(e.shrinkRect); }),
        ];
        (_a = this.destroyFns).push.apply(_a, __spreadArray(__spreadArray(__spreadArray([], __read(interactionListeners.map(function (s) { return function () { return ctx.interactionManager.removeListener(s); }; }))), __read(layoutListeners.map(function (s) { return function () { return ctx.layoutService.removeListener(s); }; }))), [function () { return _this.detachLegend(); }]));
    }
    Object.defineProperty(Legend.prototype, "data", {
        get: function () {
            return this._data;
        },
        set: function (value) {
            this._data = value;
            this.updateGroupVisibility();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Legend.prototype, "enabled", {
        get: function () {
            return this._enabled;
        },
        set: function (value) {
            this._enabled = value;
            this.updateGroupVisibility();
        },
        enumerable: false,
        configurable: true
    });
    Legend.prototype.getOrientation = function () {
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
    };
    Legend.prototype.destroy = function () {
        this.destroyFns.forEach(function (f) { return f(); });
    };
    Legend.prototype.onMarkerShapeChange = function () {
        this.itemSelection.clear();
        this.group.markDirty(this.group, RedrawType.MINOR);
    };
    Legend.prototype.getCharacterWidths = function (font) {
        var characterWidths = this.characterWidths;
        if (characterWidths.has(font)) {
            return characterWidths.get(font);
        }
        var cw = {
            '...': HdpiCanvas.getTextSize('...', font).width,
        };
        characterWidths.set(font, cw);
        return cw;
    };
    Object.defineProperty(Legend.prototype, "visible", {
        get: function () {
            return this._visible;
        },
        set: function (value) {
            this._visible = value;
            this.updateGroupVisibility();
        },
        enumerable: false,
        configurable: true
    });
    Legend.prototype.updateGroupVisibility = function () {
        this.group.visible = this.enabled && this.visible && this.data.length > 0;
    };
    Legend.prototype.attachLegend = function (node) {
        node.append(this.group);
    };
    Legend.prototype.detachLegend = function () {
        var _a;
        (_a = this.group.parent) === null || _a === void 0 ? void 0 : _a.removeChild(this.group);
    };
    Legend.prototype.getItemLabel = function (datum) {
        var callbackCache = this.ctx.callbackCache;
        var formatter = this.item.label.formatter;
        if (formatter) {
            return callbackCache.call(formatter, {
                itemId: datum.itemId,
                value: datum.label.text,
                seriesId: datum.seriesId,
            });
        }
        return datum.label.text;
    };
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
    Legend.prototype.performLayout = function (width, height) {
        var _this = this;
        var _a = this.item, paddingX = _a.paddingX, paddingY = _a.paddingY, label = _a.label, maxWidth = _a.maxWidth, _b = _a.marker, markerSize = _b.size, markerPadding = _b.padding, markerShape = _b.shape, _c = _a.label, _d = _c.maxLength, maxLength = _d === void 0 ? Infinity : _d, fontStyle = _c.fontStyle, fontWeight = _c.fontWeight, fontSize = _c.fontSize, fontFamily = _c.fontFamily;
        var data = __spreadArray([], __read(this.data));
        if (this.reverseOrder) {
            data.reverse();
        }
        this.itemSelection.update(data);
        // Update properties that affect the size of the legend items and measure them.
        var bboxes = [];
        var font = getFont(label);
        var itemMaxWidthPercentage = 0.8;
        var maxItemWidth = maxWidth !== null && maxWidth !== void 0 ? maxWidth : width * itemMaxWidthPercentage;
        var paddedMarkerWidth = markerSize + markerPadding + paddingX;
        this.itemSelection.each(function (markerLabel, datum) {
            var _a;
            var Marker = getMarker(markerShape !== null && markerShape !== void 0 ? markerShape : datum.marker.shape);
            if (!(markerLabel.marker && markerLabel.marker instanceof Marker)) {
                markerLabel.marker = new Marker();
            }
            markerLabel.markerSize = markerSize;
            markerLabel.spacing = markerPadding;
            markerLabel.fontStyle = fontStyle;
            markerLabel.fontWeight = fontWeight;
            markerLabel.fontSize = fontSize;
            markerLabel.fontFamily = fontFamily;
            var id = (_a = datum.itemId) !== null && _a !== void 0 ? _a : datum.id;
            var labelText = _this.getItemLabel(datum);
            var text = (labelText !== null && labelText !== void 0 ? labelText : '<unknown>').replace(/\r?\n/g, ' ');
            markerLabel.text = _this.truncate(text, maxLength, maxItemWidth, paddedMarkerWidth, font, id);
            bboxes.push(markerLabel.computeBBox());
        });
        width = Math.max(1, width);
        height = Math.max(1, height);
        if (!isFinite(width)) {
            return false;
        }
        var size = this.size;
        var oldSize = this.oldSize;
        size[0] = width;
        size[1] = height;
        if (size[0] !== oldSize[0] || size[1] !== oldSize[1]) {
            oldSize[0] = size[0];
            oldSize[1] = size[1];
        }
        var _e = this.updatePagination(bboxes, width, height), pages = _e.pages, maxPageHeight = _e.maxPageHeight, maxPageWidth = _e.maxPageWidth;
        this.pages = pages;
        this.maxPageSize = [maxPageWidth - paddingX, maxPageHeight - paddingY];
        var pageNumber = this.pagination.currentPage;
        var page = this.pages[pageNumber];
        if (this.pages.length < 1 || !page) {
            this.visible = false;
            return;
        }
        this.visible = true;
        // Position legend items
        this.updatePositions(pageNumber);
        // Update legend item properties that don't affect the layout.
        this.update();
    };
    Legend.prototype.truncate = function (text, maxCharLength, maxItemWidth, paddedMarkerWidth, font, id) {
        var e_1, _a;
        var ellipsis = "...";
        var textChars = text.split('');
        var addEllipsis = false;
        if (text.length > maxCharLength) {
            text = "" + text.substring(0, maxCharLength);
            addEllipsis = true;
        }
        var labelWidth = Math.floor(paddedMarkerWidth + HdpiCanvas.getTextSize(text, font).width);
        if (labelWidth > maxItemWidth) {
            var truncatedText = '';
            var characterWidths = this.getCharacterWidths(font);
            var cumulativeWidth = paddedMarkerWidth + characterWidths[ellipsis];
            try {
                for (var textChars_1 = __values(textChars), textChars_1_1 = textChars_1.next(); !textChars_1_1.done; textChars_1_1 = textChars_1.next()) {
                    var char = textChars_1_1.value;
                    if (!characterWidths[char]) {
                        characterWidths[char] = HdpiCanvas.getTextSize(char, font).width;
                    }
                    cumulativeWidth += characterWidths[char];
                    if (cumulativeWidth > maxItemWidth) {
                        break;
                    }
                    truncatedText += char;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (textChars_1_1 && !textChars_1_1.done && (_a = textChars_1.return)) _a.call(textChars_1);
                }
                finally { if (e_1) throw e_1.error; }
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
    };
    Legend.prototype.updatePagination = function (bboxes, width, height) {
        var orientation = this.getOrientation();
        var trackingIndex = Math.min(this.paginationTrackingIndex, bboxes.length);
        this.pagination.orientation = orientation;
        this.pagination.translationX = 0;
        this.pagination.translationY = 0;
        var _a = this.calculatePagination(bboxes, width, height), pages = _a.pages, maxPageHeight = _a.maxPageHeight, maxPageWidth = _a.maxPageWidth, paginationBBox = _a.paginationBBox, paginationVertical = _a.paginationVertical;
        var newCurrentPage = pages.findIndex(function (p) { return p.endIndex >= trackingIndex; });
        this.pagination.currentPage = Math.min(Math.max(newCurrentPage, 0), pages.length - 1);
        var _b = this.item, itemPaddingX = _b.paddingX, itemPaddingY = _b.paddingY;
        var paginationComponentPadding = 8;
        var legendItemsWidth = maxPageWidth - itemPaddingX;
        var legendItemsHeight = maxPageHeight - itemPaddingY;
        var paginationX = 0;
        var paginationY = -paginationBBox.y - this.item.marker.size / 2;
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
            maxPageHeight: maxPageHeight,
            maxPageWidth: maxPageWidth,
            pages: pages,
        };
    };
    Legend.prototype.calculatePagination = function (bboxes, width, height) {
        var _a, _b, _c;
        var _d = this.item, itemPaddingX = _d.paddingX, itemPaddingY = _d.paddingY;
        var orientation = this.getOrientation();
        var paginationVertical = ['left', 'right'].includes(this.position);
        var paginationBBox = this.pagination.computeBBox();
        var lastPassPaginationBBox = new BBox(0, 0, 0, 0);
        var pages = [];
        var maxPageWidth = 0;
        var maxPageHeight = 0;
        var count = 0;
        var stableOutput = function (lastPassPaginationBBox) {
            var width = lastPassPaginationBBox.width, height = lastPassPaginationBBox.height;
            return width === paginationBBox.width && height === paginationBBox.height;
        };
        var forceResult = this.maxWidth !== undefined || this.maxHeight !== undefined;
        do {
            if (count++ > 10) {
                Logger.warn('unable to find stable legend layout.');
                break;
            }
            paginationBBox = lastPassPaginationBBox;
            var maxWidth = width - (paginationVertical ? 0 : paginationBBox.width);
            var maxHeight = height - (paginationVertical ? paginationBBox.height : 0);
            var layout = gridLayout({
                orientation: orientation,
                bboxes: bboxes,
                maxHeight: maxHeight,
                maxWidth: maxWidth,
                itemPaddingY: itemPaddingY,
                itemPaddingX: itemPaddingX,
                forceResult: forceResult,
            });
            pages = (_a = layout === null || layout === void 0 ? void 0 : layout.pages) !== null && _a !== void 0 ? _a : [];
            maxPageWidth = (_b = layout === null || layout === void 0 ? void 0 : layout.maxPageWidth) !== null && _b !== void 0 ? _b : 0;
            maxPageHeight = (_c = layout === null || layout === void 0 ? void 0 : layout.maxPageHeight) !== null && _c !== void 0 ? _c : 0;
            var totalPages = pages.length;
            this.pagination.visible = totalPages > 1;
            this.pagination.totalPages = totalPages;
            this.pagination.update();
            lastPassPaginationBBox = this.pagination.computeBBox();
            if (!this.pagination.visible) {
                break;
            }
        } while (!stableOutput(lastPassPaginationBBox));
        return { maxPageWidth: maxPageWidth, maxPageHeight: maxPageHeight, pages: pages, paginationBBox: paginationBBox, paginationVertical: paginationVertical };
    };
    Legend.prototype.updatePositions = function (pageNumber) {
        if (pageNumber === void 0) { pageNumber = 0; }
        var _a = this, paddingY = _a.item.paddingY, itemSelection = _a.itemSelection, pages = _a.pages;
        if (pages.length < 1 || !pages[pageNumber]) {
            return;
        }
        var _b = pages[pageNumber], columns = _b.columns, visibleStart = _b.startIndex, visibleEnd = _b.endIndex;
        // Position legend items using the layout computed above.
        var x = 0;
        var y = 0;
        var columnCount = columns.length;
        var rowCount = columns[0].indices.length;
        var horizontal = this.getOrientation() === 'horizontal';
        var itemHeight = columns[0].bboxes[0].height + paddingY;
        var rowSumColumnWidths = [];
        itemSelection.each(function (markerLabel, _, i) {
            var _a, _b;
            if (i < visibleStart || i > visibleEnd) {
                markerLabel.visible = false;
                return;
            }
            var pageIndex = i - visibleStart;
            var columnIndex = 0;
            var rowIndex = 0;
            if (horizontal) {
                columnIndex = pageIndex % columnCount;
                rowIndex = Math.floor(pageIndex / columnCount);
            }
            else {
                columnIndex = Math.floor(pageIndex / rowCount);
                rowIndex = pageIndex % rowCount;
            }
            markerLabel.visible = true;
            var column = columns[columnIndex];
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
    };
    Legend.prototype.updatePageNumber = function (pageNumber) {
        var pages = this.pages;
        // Track an item on the page in re-pagination cases (e.g. resize).
        var _a = pages[pageNumber], startIndex = _a.startIndex, endIndex = _a.endIndex;
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
    };
    Legend.prototype.update = function () {
        var _a = this.item, strokeWidth = _a.marker.strokeWidth, color = _a.label.color;
        this.itemSelection.each(function (markerLabel, datum) {
            var marker = datum.marker;
            markerLabel.markerFill = marker.fill;
            markerLabel.markerStroke = marker.stroke;
            markerLabel.markerStrokeWidth = strokeWidth;
            markerLabel.markerFillOpacity = marker.fillOpacity;
            markerLabel.markerStrokeOpacity = marker.strokeOpacity;
            markerLabel.opacity = datum.enabled ? 1 : 0.5;
            markerLabel.color = color;
        });
    };
    Legend.prototype.getDatumForPoint = function (x, y) {
        var e_2, _a;
        var visibleChildBBoxes = [];
        var closestLeftTop = { dist: Infinity, datum: undefined };
        try {
            for (var _b = __values(this.group.children), _c = _b.next(); !_c.done; _c = _b.next()) {
                var child = _c.value;
                if (!child.visible)
                    continue;
                if (!(child instanceof MarkerLabel))
                    continue;
                var childBBox = child.computeBBox();
                childBBox.grow(this.item.paddingX / 2, 'horizontal');
                childBBox.grow(this.item.paddingY / 2, 'vertical');
                if (childBBox.containsPoint(x, y)) {
                    return child.datum;
                }
                var distX = x - childBBox.x - this.item.paddingX / 2;
                var distY = y - childBBox.y - this.item.paddingY / 2;
                var dist = Math.pow(distX, 2) + Math.pow(distY, 2);
                var toTheLeftTop = distX >= 0 && distY >= 0;
                if (toTheLeftTop && dist < closestLeftTop.dist) {
                    closestLeftTop.dist = dist;
                    closestLeftTop.datum = child.datum;
                }
                visibleChildBBoxes.push(childBBox);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        var pageBBox = BBox.merge(visibleChildBBoxes);
        if (!pageBBox.containsPoint(x, y)) {
            // We're not in-between legend items.
            return undefined;
        }
        // Fallback to returning closest match to the left/up.
        return closestLeftTop.datum;
    };
    Legend.prototype.computeBBox = function () {
        return this.group.computeBBox();
    };
    Legend.prototype.computePagedBBox = function () {
        var actualBBox = this.group.computeBBox();
        if (this.pages.length <= 1) {
            return actualBBox;
        }
        var _a = __read(this.maxPageSize, 2), maxPageWidth = _a[0], maxPageHeight = _a[1];
        actualBBox.height = Math.max(maxPageHeight, actualBBox.height);
        actualBBox.width = Math.max(maxPageWidth, actualBBox.width);
        return actualBBox;
    };
    Legend.prototype.checkLegendClick = function (event) {
        var _a = this, legendItemClick = _a.listeners.legendItemClick, _b = _a.ctx, dataService = _b.dataService, highlightManager = _b.highlightManager, toggleSeriesVisible = _a.item.toggleSeriesVisible;
        var offsetX = event.offsetX, offsetY = event.offsetY;
        var legendBBox = this.computeBBox();
        var pointerInsideLegend = this.group.visible && legendBBox.containsPoint(offsetX, offsetY);
        var datum = this.getDatumForPoint(offsetX, offsetY);
        if (!pointerInsideLegend || !datum) {
            return;
        }
        var id = datum.id, itemId = datum.itemId, enabled = datum.enabled;
        var chartSeries = dataService.getSeries();
        var series = chartSeries.find(function (s) { return s.id === id; });
        if (!series) {
            return;
        }
        event.consume();
        var newEnabled = enabled;
        if (toggleSeriesVisible) {
            newEnabled = !enabled;
            this.ctx.chartEventManager.legendItemClick(series, itemId, newEnabled);
        }
        if (!newEnabled) {
            highlightManager.updateHighlight(this.id);
        }
        else {
            highlightManager.updateHighlight(this.id, {
                series: series,
                itemId: itemId,
                datum: undefined,
            });
        }
        this.ctx.updateService.update(ChartUpdateType.PROCESS_DATA, { forceNodeDataRefresh: true });
        legendItemClick === null || legendItemClick === void 0 ? void 0 : legendItemClick({ type: 'click', enabled: newEnabled, itemId: itemId, seriesId: series.id });
    };
    Legend.prototype.checkLegendDoubleClick = function (event) {
        var _a;
        var _b = this, legendItemDoubleClick = _b.listeners.legendItemDoubleClick, dataService = _b.ctx.dataService, toggleSeriesVisible = _b.item.toggleSeriesVisible;
        var offsetX = event.offsetX, offsetY = event.offsetY;
        // Integrated charts do not handle double click behaviour correctly due to multiple instances of the
        // chart being created. See https://ag-grid.atlassian.net/browse/RTI-1381
        if (this.ctx.mode === 'integrated') {
            return;
        }
        var legendBBox = this.computeBBox();
        var pointerInsideLegend = this.group.visible && legendBBox.containsPoint(offsetX, offsetY);
        var datum = this.getDatumForPoint(offsetX, offsetY);
        if (!pointerInsideLegend || !datum) {
            return;
        }
        var id = datum.id, itemId = datum.itemId, seriesId = datum.seriesId;
        var chartSeries = dataService.getSeries();
        var series = chartSeries.find(function (s) { return s.id === id; });
        if (!series) {
            return;
        }
        event.consume();
        if (toggleSeriesVisible) {
            var legendData = chartSeries.reduce(function (ls, s) { return __spreadArray(__spreadArray([], __read(ls)), __read(s.getLegendData().filter(function (d) { return d.legendType === 'category'; }))); }, []);
            var numVisibleItems_1 = {};
            legendData.forEach(function (d) {
                var _a;
                var _b;
                (_a = numVisibleItems_1[_b = d.seriesId]) !== null && _a !== void 0 ? _a : (numVisibleItems_1[_b] = 0);
                if (d.enabled)
                    numVisibleItems_1[d.seriesId]++;
            });
            var clickedItem = legendData.find(function (d) { return d.itemId === itemId && d.seriesId === seriesId; });
            this.ctx.chartEventManager.legendItemDoubleClick(series, itemId, (_a = clickedItem === null || clickedItem === void 0 ? void 0 : clickedItem.enabled) !== null && _a !== void 0 ? _a : false, numVisibleItems_1);
        }
        this.ctx.updateService.update(ChartUpdateType.PROCESS_DATA, { forceNodeDataRefresh: true });
        legendItemDoubleClick === null || legendItemDoubleClick === void 0 ? void 0 : legendItemDoubleClick({ type: 'dblclick', enabled: true, itemId: itemId, seriesId: series.id });
    };
    Legend.prototype.handleLegendMouseMove = function (event) {
        var _a;
        var _b = this, enabled = _b.enabled, toggleSeriesVisible = _b.item.toggleSeriesVisible, listeners = _b.listeners;
        if (!enabled) {
            return;
        }
        var legendBBox = this.computeBBox();
        var pageX = event.pageX, pageY = event.pageY, offsetX = event.offsetX, offsetY = event.offsetY;
        var pointerInsideLegend = this.group.visible && legendBBox.containsPoint(offsetX, offsetY);
        if (!pointerInsideLegend) {
            this.ctx.cursorManager.updateCursor(this.id);
            this.ctx.highlightManager.updateHighlight(this.id);
            this.ctx.tooltipManager.removeTooltip(this.id);
            return;
        }
        // Prevent other handlers from consuming this event if it's generated inside the legend
        // boundaries.
        event.consume();
        var datum = this.getDatumForPoint(offsetX, offsetY);
        var pointerOverLegendDatum = pointerInsideLegend && datum !== undefined;
        if (!pointerOverLegendDatum) {
            this.ctx.cursorManager.updateCursor(this.id);
            this.ctx.highlightManager.updateHighlight(this.id);
            return;
        }
        var series = datum ? this.ctx.dataService.getSeries().find(function (series) { return series.id === (datum === null || datum === void 0 ? void 0 : datum.id); }) : undefined;
        if (datum && this.truncatedItems.has((_a = datum.itemId) !== null && _a !== void 0 ? _a : datum.id)) {
            var labelText = this.getItemLabel(datum);
            this.ctx.tooltipManager.updateTooltip(this.id, { pageX: pageX, pageY: pageY, offsetX: offsetX, offsetY: offsetY, event: event, showArrow: false }, toTooltipHtml({ content: labelText }));
        }
        else {
            this.ctx.tooltipManager.removeTooltip(this.id);
        }
        if (toggleSeriesVisible || listeners.legendItemClick != null || listeners.legendItemDoubleClick != null) {
            this.ctx.cursorManager.updateCursor(this.id, 'pointer');
        }
        if ((datum === null || datum === void 0 ? void 0 : datum.enabled) && series) {
            this.ctx.highlightManager.updateHighlight(this.id, {
                series: series,
                itemId: datum === null || datum === void 0 ? void 0 : datum.itemId,
                datum: undefined,
            });
        }
        else {
            this.ctx.highlightManager.updateHighlight(this.id);
        }
    };
    Legend.prototype.positionLegend = function (shrinkRect) {
        var _this = this;
        var newShrinkRect = shrinkRect.clone();
        if (!this.enabled || !this.data.length) {
            return { shrinkRect: newShrinkRect };
        }
        var _a = __read(this.calculateLegendDimensions(shrinkRect), 2), legendWidth = _a[0], legendHeight = _a[1];
        this.group.translationX = 0;
        this.group.translationY = 0;
        this.performLayout(legendWidth, legendHeight);
        var legendBBox = this.computePagedBBox();
        var calculateTranslationPerpendicularDimension = function () {
            switch (_this.position) {
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
            var translationX = void 0;
            var translationY = void 0;
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
            var legendPadding = this.spacing;
            newShrinkRect.shrink(legendPadding, this.position);
            var legendPositionedBBox = legendBBox.clone();
            legendPositionedBBox.x += this.group.translationX;
            legendPositionedBBox.y += this.group.translationY;
            this.ctx.tooltipManager.updateExclusiveRect(this.id, legendPositionedBBox);
        }
        else {
            this.ctx.tooltipManager.updateExclusiveRect(this.id);
        }
        return { shrinkRect: newShrinkRect };
    };
    Legend.prototype.calculateLegendDimensions = function (shrinkRect) {
        var width = shrinkRect.width, height = shrinkRect.height;
        var aspectRatio = width / height;
        var maxCoefficient = 0.5;
        var minHeightCoefficient = 0.2;
        var minWidthCoefficient = 0.25;
        var legendWidth = 0;
        var legendHeight = 0;
        switch (this.position) {
            case 'top':
            case 'bottom':
                // A horizontal legend should take maximum between 20 to 50 percent of the chart height if height is larger than width
                // and maximum 20 percent of the chart height if height is smaller than width.
                var heightCoefficient = aspectRatio < 1
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
                var widthCoefficient = aspectRatio > 1 ? Math.min(maxCoefficient, minWidthCoefficient * aspectRatio) : minWidthCoefficient;
                legendWidth = this.maxWidth ? Math.min(this.maxWidth, width) : Math.round(width * widthCoefficient);
                legendHeight = this.maxHeight ? Math.min(this.maxHeight, height) : height;
        }
        return [legendWidth, legendHeight];
    };
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
    return Legend;
}());
export { Legend };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVnZW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L2xlZ2VuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBUSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDakQsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3ZDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUMvQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzVDLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDckMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBWTlDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDMUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUN0QyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDbEQsT0FBTyxFQUNILE9BQU8sRUFDUCxNQUFNLEVBQ04sV0FBVyxFQUNYLGNBQWMsRUFDZCxlQUFlLEVBQ2YsWUFBWSxFQUNaLFVBQVUsRUFDVixRQUFRLEVBQ1IsWUFBWSxFQUNaLE1BQU0sRUFDTixRQUFRLEVBQ1Isb0JBQW9CLEVBQ3BCLFFBQVEsR0FDWCxNQUFNLG9CQUFvQixDQUFDO0FBQzVCLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDbEMsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRXBELE9BQU8sRUFBRSxVQUFVLEVBQVEsTUFBTSxjQUFjLENBQUM7QUFDaEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3JELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUVsRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFHeEMsSUFBTSxZQUFZLEdBQUcsQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDaEQsSUFBTSxlQUFlLEdBQUcsb0JBQW9CLENBQ3hDLFVBQUMsQ0FBTSxFQUFFLEdBQUcsSUFBSyxPQUFBLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBeEIsQ0FBd0IsQ0FBQyxFQUFqRCxDQUFpRCxFQUNsRSxxRUFBcUUsQ0FDeEUsQ0FBQztBQUVGO0lBQUE7UUFFSSxjQUFTLEdBQVksU0FBUyxDQUFDO1FBRy9CLFVBQUssR0FBVyxPQUFPLENBQUM7UUFHeEIsY0FBUyxHQUFlLFNBQVMsQ0FBQztRQUdsQyxlQUFVLEdBQWdCLFNBQVMsQ0FBQztRQUdwQyxhQUFRLEdBQVcsRUFBRSxDQUFDO1FBR3RCLGVBQVUsR0FBVyxxQkFBcUIsQ0FBQztRQUczQyxjQUFTLEdBQTJELFNBQVMsQ0FBQztJQUNsRixDQUFDO0lBbkJHO1FBREMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztrREFDTztJQUcvQjtRQURDLFFBQVEsQ0FBQyxZQUFZLENBQUM7OENBQ0M7SUFHeEI7UUFEQyxRQUFRLENBQUMsY0FBYyxDQUFDO2tEQUNTO0lBR2xDO1FBREMsUUFBUSxDQUFDLGVBQWUsQ0FBQzttREFDVTtJQUdwQztRQURDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7aURBQ0U7SUFHdEI7UUFEQyxRQUFRLENBQUMsTUFBTSxDQUFDO21EQUMwQjtJQUczQztRQURDLFFBQVEsQ0FBQyxZQUFZLENBQUM7a0RBQ3VEO0lBQ2xGLGtCQUFDO0NBQUEsQUFyQkQsSUFxQkM7QUFFRDtJQUFBO1FBRUksU0FBSSxHQUFHLEVBQUUsQ0FBQztRQUNWOzs7V0FHRztRQUNILFdBQU0sR0FBaUMsU0FBUyxDQUFDO1FBU2pEOztXQUVHO1FBRUgsWUFBTyxHQUFXLENBQUMsQ0FBQztRQUdwQixnQkFBVyxHQUFXLENBQUMsQ0FBQztJQUc1QixDQUFDO0lBbEJHLHNCQUFJLCtCQUFLO2FBSVQ7WUFDSSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDdkIsQ0FBQzthQU5ELFVBQVUsS0FBOEM7O1lBQ3BELElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1lBQ3BCLE1BQUEsSUFBSSxDQUFDLE1BQU0sMENBQUUsbUJBQW1CLEVBQUUsQ0FBQztRQUN2QyxDQUFDOzs7T0FBQTtJQVREO1FBREMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQzs4Q0FDVjtJQWtCVjtRQURDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7aURBQ0E7SUFHcEI7UUFEQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO3FEQUNJO0lBRzVCLG1CQUFDO0NBQUEsQUExQkQsSUEwQkM7QUFFRDtJQUFBO1FBQ2EsV0FBTSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFDNUIsVUFBSyxHQUFHLElBQUksV0FBVyxFQUFFLENBQUM7UUFDbkMsbURBQW1EO1FBRW5ELGFBQVEsR0FBWSxTQUFTLENBQUM7UUFDOUI7Ozs7V0FJRztRQUVILGFBQVEsR0FBRyxFQUFFLENBQUM7UUFDZDs7OztXQUlHO1FBRUgsYUFBUSxHQUFHLENBQUMsQ0FBQztRQUdiLHdCQUFtQixHQUFZLElBQUksQ0FBQztJQUN4QyxDQUFDO0lBbEJHO1FBREMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnREFDTTtJQU85QjtRQURDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0RBQ047SUFPZDtRQURDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0RBQ1A7SUFHYjtRQURDLFFBQVEsQ0FBQyxPQUFPLENBQUM7MkRBQ2tCO0lBQ3hDLGlCQUFDO0NBQUEsQUF2QkQsSUF1QkM7QUFFRDtJQUFBO1FBRUksb0JBQWUsR0FBOEMsU0FBUyxDQUFDO1FBQ3ZFLDBCQUFxQixHQUFvRCxTQUFTLENBQUM7SUFDdkYsQ0FBQztJQUZHO1FBREMsUUFBUSxDQUFDLFlBQVksQ0FBQzs0REFDZ0Q7SUFFM0Usc0JBQUM7Q0FBQSxBQUpELElBSUM7QUFFRDtJQTBFSSxnQkFBNkIsR0FBa0I7O1FBQS9DLGlCQTBCQztRQTFCNEIsUUFBRyxHQUFILEdBQUcsQ0FBZTtRQXZFdEMsT0FBRSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVaLFVBQUssR0FBVSxJQUFJLEtBQUssQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7UUFFakcsa0JBQWEsR0FBZ0MsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBRXZGLFlBQU8sR0FBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDbkMsVUFBSyxHQUFXLEVBQUUsQ0FBQztRQUNuQixnQkFBVyxHQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUUvQyxtRkFBbUY7UUFDM0UsNEJBQXVCLEdBQVcsQ0FBQyxDQUFDO1FBRW5DLFNBQUksR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO1FBQ3hCLGNBQVMsR0FBRyxJQUFJLGVBQWUsRUFBRSxDQUFDO1FBRTFCLG1CQUFjLEdBQWdCLElBQUksR0FBRyxFQUFFLENBQUM7UUFFakQsVUFBSyxHQUEwQixFQUFFLENBQUM7UUFVbEMsYUFBUSxHQUFHLElBQUksQ0FBQztRQVV4QixhQUFRLEdBQTBCLFFBQVEsQ0FBQztRQWdCM0MsaURBQWlEO1FBRWpELGFBQVEsR0FBWSxTQUFTLENBQUM7UUFFOUIsa0RBQWtEO1FBRWxELGNBQVMsR0FBWSxTQUFTLENBQUM7UUFFL0IsMkRBQTJEO1FBRTNELGlCQUFZLEdBQWEsU0FBUyxDQUFDO1FBSzNCLGVBQVUsR0FBZSxFQUFFLENBQUM7UUF1Q3BDOztXQUVHO1FBRUgsWUFBTyxHQUFHLEVBQUUsQ0FBQztRQUVMLG9CQUFlLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQWdCM0IsU0FBSSxHQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUVqQyxhQUFRLEdBQVksSUFBSSxDQUFDO1FBNUQ3QixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQy9CLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxVQUFVLENBQzVCLFVBQUMsSUFBcUIsSUFBSyxPQUFBLEdBQUcsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUE5QixDQUE4QixFQUN6RCxVQUFDLElBQUksSUFBSyxPQUFBLEtBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBM0IsQ0FBMkIsRUFDckMsR0FBRyxDQUFDLGtCQUFrQixFQUN0QixHQUFHLENBQUMsYUFBYSxDQUNwQixDQUFDO1FBQ0YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFN0MsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUUvQixJQUFNLG9CQUFvQixHQUFHO1lBQ3pCLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsS0FBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxFQUF4QixDQUF3QixDQUFDO1lBQzVFLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsS0FBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxFQUE5QixDQUE4QixDQUFDO1lBQ3JGLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsS0FBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxFQUE3QixDQUE2QixDQUFDO1NBQ3BGLENBQUM7UUFDRixJQUFNLGVBQWUsR0FBRztZQUNwQixHQUFHLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQUUsVUFBQyxDQUFDLElBQUssT0FBQSxLQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBakMsQ0FBaUMsQ0FBQztTQUMxRixDQUFDO1FBRUYsQ0FBQSxLQUFBLElBQUksQ0FBQyxVQUFVLENBQUEsQ0FBQyxJQUFJLGdFQUNiLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxVQUFDLENBQUMsSUFBSyxPQUFBLGNBQU0sT0FBQSxHQUFHLENBQUMsa0JBQWtCLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUF4QyxDQUF3QyxFQUE5QyxDQUE4QyxDQUFDLFdBQy9FLGVBQWUsQ0FBQyxHQUFHLENBQUMsVUFBQyxDQUFDLElBQUssT0FBQSxjQUFNLE9BQUEsR0FBRyxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQW5DLENBQW1DLEVBQXpDLENBQXlDLENBQUMsS0FDeEUsY0FBTSxPQUFBLEtBQUksQ0FBQyxZQUFZLEVBQUUsRUFBbkIsQ0FBbUIsSUFDM0I7SUFDTixDQUFDO0lBOUVELHNCQUFJLHdCQUFJO2FBSVI7WUFDSSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDdEIsQ0FBQzthQU5ELFVBQVMsS0FBNEI7WUFDakMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDbkIsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDakMsQ0FBQzs7O09BQUE7SUFPRCxzQkFBSSwyQkFBTzthQUlYO1lBQ0ksT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3pCLENBQUM7YUFORCxVQUFZLEtBQWM7WUFDdEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7WUFDdEIsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDakMsQ0FBQzs7O09BQUE7SUFRTywrQkFBYyxHQUF0QjtRQUNJLElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxTQUFTLEVBQUU7WUFDaEMsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO1NBQzNCO1FBQ0QsUUFBUSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ25CLEtBQUssT0FBTyxDQUFDO1lBQ2IsS0FBSyxNQUFNO2dCQUNQLE9BQU8sVUFBVSxDQUFDO1lBQ3RCLEtBQUssUUFBUSxDQUFDO1lBQ2QsS0FBSyxLQUFLO2dCQUNOLE9BQU8sWUFBWSxDQUFDO1NBQzNCO0lBQ0wsQ0FBQztJQStDTSx3QkFBTyxHQUFkO1FBQ0ksSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBQyxDQUFDLElBQUssT0FBQSxDQUFDLEVBQUUsRUFBSCxDQUFHLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRU0sb0NBQW1CLEdBQTFCO1FBQ0ksSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMzQixJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBVU8sbUNBQWtCLEdBQTFCLFVBQTJCLElBQVk7UUFDM0IsSUFBQSxlQUFlLEdBQUssSUFBSSxnQkFBVCxDQUFVO1FBRWpDLElBQUksZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUMzQixPQUFPLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDcEM7UUFFRCxJQUFNLEVBQUUsR0FBOEI7WUFDbEMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLEtBQUs7U0FDbkQsQ0FBQztRQUNGLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzlCLE9BQU8sRUFBRSxDQUFDO0lBQ2QsQ0FBQztJQUtELHNCQUFJLDJCQUFPO2FBSVg7WUFDSSxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDekIsQ0FBQzthQU5ELFVBQVksS0FBYztZQUN0QixJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztZQUN0QixJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUNqQyxDQUFDOzs7T0FBQTtJQUtPLHNDQUFxQixHQUE3QjtRQUNJLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDOUUsQ0FBQztJQUVELDZCQUFZLEdBQVosVUFBYSxJQUFVO1FBQ25CLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFRCw2QkFBWSxHQUFaOztRQUNJLE1BQUEsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLDBDQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVPLDZCQUFZLEdBQXBCLFVBQXFCLEtBQTBCO1FBRWhDLElBQUEsYUFBYSxHQUNwQixJQUFJLGtCQURnQixDQUNmO1FBQ0QsSUFBQSxTQUFTLEdBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLFVBQXBCLENBQXFCO1FBQ3RDLElBQUksU0FBUyxFQUFFO1lBQ1gsT0FBTyxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDakMsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNO2dCQUNwQixLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJO2dCQUN2QixRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVE7YUFDM0IsQ0FBQyxDQUFDO1NBQ047UUFDRCxPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO0lBQzVCLENBQUM7SUFFRDs7Ozs7Ozs7Ozs7T0FXRztJQUNLLDhCQUFhLEdBQXJCLFVBQXNCLEtBQWEsRUFBRSxNQUFjO1FBQW5ELGlCQW1GQztRQWxGUyxJQUFBLEtBT0YsSUFBSSxDQUFDLElBQUksRUFOVCxRQUFRLGNBQUEsRUFDUixRQUFRLGNBQUEsRUFDUixLQUFLLFdBQUEsRUFDTCxRQUFRLGNBQUEsRUFDUixjQUF3RSxFQUF4RCxVQUFVLFVBQUEsRUFBVyxhQUFhLGFBQUEsRUFBUyxXQUFXLFdBQUEsRUFDdEUsYUFBNEUsRUFBbkUsaUJBQW9CLEVBQXBCLFNBQVMsbUJBQUcsUUFBUSxLQUFBLEVBQUUsU0FBUyxlQUFBLEVBQUUsVUFBVSxnQkFBQSxFQUFFLFFBQVEsY0FBQSxFQUFFLFVBQVUsZ0JBQ2pFLENBQUM7UUFDZCxJQUFNLElBQUksNEJBQU8sSUFBSSxDQUFDLElBQUksRUFBQyxDQUFDO1FBQzVCLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNuQixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDbEI7UUFDRCxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVoQywrRUFBK0U7UUFDL0UsSUFBTSxNQUFNLEdBQVcsRUFBRSxDQUFDO1FBRTFCLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUU1QixJQUFNLHNCQUFzQixHQUFHLEdBQUcsQ0FBQztRQUNuQyxJQUFNLFlBQVksR0FBRyxRQUFRLGFBQVIsUUFBUSxjQUFSLFFBQVEsR0FBSSxLQUFLLEdBQUcsc0JBQXNCLENBQUM7UUFDaEUsSUFBTSxpQkFBaUIsR0FBRyxVQUFVLEdBQUcsYUFBYSxHQUFHLFFBQVEsQ0FBQztRQUVoRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFDLFdBQVcsRUFBRSxLQUFLOztZQUN2QyxJQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsV0FBVyxhQUFYLFdBQVcsY0FBWCxXQUFXLEdBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUU1RCxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsTUFBTSxJQUFJLFdBQVcsQ0FBQyxNQUFNLFlBQVksTUFBTSxDQUFDLEVBQUU7Z0JBQy9ELFdBQVcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQzthQUNyQztZQUVELFdBQVcsQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1lBQ3BDLFdBQVcsQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFDO1lBQ3BDLFdBQVcsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1lBQ2xDLFdBQVcsQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1lBQ3BDLFdBQVcsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1lBQ2hDLFdBQVcsQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1lBRXBDLElBQU0sRUFBRSxHQUFHLE1BQUEsS0FBSyxDQUFDLE1BQU0sbUNBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUNwQyxJQUFNLFNBQVMsR0FBRyxLQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzNDLElBQU0sSUFBSSxHQUFHLENBQUMsU0FBUyxhQUFULFNBQVMsY0FBVCxTQUFTLEdBQUksV0FBVyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUMvRCxXQUFXLENBQUMsSUFBSSxHQUFHLEtBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRTdGLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDM0MsQ0FBQyxDQUFDLENBQUM7UUFFSCxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDM0IsTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRTdCLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDbEIsT0FBTyxLQUFLLENBQUM7U0FDaEI7UUFFRCxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3ZCLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDN0IsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUNoQixJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDO1FBRWpCLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ2xELE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckIsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN4QjtRQUVLLElBQUEsS0FBeUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLEVBQW5GLEtBQUssV0FBQSxFQUFFLGFBQWEsbUJBQUEsRUFBRSxZQUFZLGtCQUFpRCxDQUFDO1FBRTVGLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxZQUFZLEdBQUcsUUFBUSxFQUFFLGFBQWEsR0FBRyxRQUFRLENBQUMsQ0FBQztRQUV2RSxJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQztRQUMvQyxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXBDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ2hDLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1lBQ3JCLE9BQU87U0FDVjtRQUVELElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBRXBCLHdCQUF3QjtRQUN4QixJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRWpDLDhEQUE4RDtRQUM5RCxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDbEIsQ0FBQztJQUVPLHlCQUFRLEdBQWhCLFVBQ0ksSUFBWSxFQUNaLGFBQXFCLEVBQ3JCLFlBQW9CLEVBQ3BCLGlCQUF5QixFQUN6QixJQUFZLEVBQ1osRUFBVTs7UUFFVixJQUFNLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFFdkIsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNqQyxJQUFJLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFFeEIsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLGFBQWEsRUFBRTtZQUM3QixJQUFJLEdBQUcsS0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxhQUFhLENBQUcsQ0FBQztZQUM3QyxXQUFXLEdBQUcsSUFBSSxDQUFDO1NBQ3RCO1FBRUQsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsR0FBRyxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM1RixJQUFJLFVBQVUsR0FBRyxZQUFZLEVBQUU7WUFDM0IsSUFBSSxhQUFhLEdBQUcsRUFBRSxDQUFDO1lBQ3ZCLElBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN0RCxJQUFJLGVBQWUsR0FBRyxpQkFBaUIsR0FBRyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7O2dCQUVwRSxLQUFtQixJQUFBLGNBQUEsU0FBQSxTQUFTLENBQUEsb0NBQUEsMkRBQUU7b0JBQXpCLElBQU0sSUFBSSxzQkFBQTtvQkFDWCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxFQUFFO3dCQUN4QixlQUFlLENBQUMsSUFBSSxDQUFDLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDO3FCQUNwRTtvQkFFRCxlQUFlLElBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUV6QyxJQUFJLGVBQWUsR0FBRyxZQUFZLEVBQUU7d0JBQ2hDLE1BQU07cUJBQ1Q7b0JBRUQsYUFBYSxJQUFJLElBQUksQ0FBQztpQkFDekI7Ozs7Ozs7OztZQUVELElBQUksR0FBRyxhQUFhLENBQUM7WUFDckIsV0FBVyxHQUFHLElBQUksQ0FBQztTQUN0QjtRQUVELElBQUksV0FBVyxFQUFFO1lBQ2IsSUFBSSxJQUFJLFFBQVEsQ0FBQztZQUNqQixJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUMvQjthQUFNO1lBQ0gsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDbEM7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU8saUNBQWdCLEdBQXhCLFVBQ0ksTUFBYyxFQUNkLEtBQWEsRUFDYixNQUFjO1FBTWQsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQzFDLElBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUU1RSxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFFMUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQztRQUUzQixJQUFBLEtBQTZFLElBQUksQ0FBQyxtQkFBbUIsQ0FDdkcsTUFBTSxFQUNOLEtBQUssRUFDTCxNQUFNLENBQ1QsRUFKTyxLQUFLLFdBQUEsRUFBRSxhQUFhLG1CQUFBLEVBQUUsWUFBWSxrQkFBQSxFQUFFLGNBQWMsb0JBQUEsRUFBRSxrQkFBa0Isd0JBSTdFLENBQUM7UUFFRixJQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLFVBQUMsQ0FBQyxJQUFLLE9BQUEsQ0FBQyxDQUFDLFFBQVEsSUFBSSxhQUFhLEVBQTNCLENBQTJCLENBQUMsQ0FBQztRQUMzRSxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFaEYsSUFBQSxLQUFxRCxJQUFJLENBQUMsSUFBSSxFQUFsRCxZQUFZLGNBQUEsRUFBWSxZQUFZLGNBQWMsQ0FBQztRQUNyRSxJQUFNLDBCQUEwQixHQUFHLENBQUMsQ0FBQztRQUNyQyxJQUFNLGdCQUFnQixHQUFHLFlBQVksR0FBRyxZQUFZLENBQUM7UUFDckQsSUFBTSxpQkFBaUIsR0FBRyxhQUFhLEdBQUcsWUFBWSxDQUFDO1FBRXZELElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQztRQUNwQixJQUFJLFdBQVcsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUNoRSxJQUFJLGtCQUFrQixFQUFFO1lBQ3BCLFdBQVcsSUFBSSxpQkFBaUIsR0FBRywwQkFBMEIsQ0FBQztTQUNqRTthQUFNO1lBQ0gsV0FBVyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsR0FBRyxnQkFBZ0IsR0FBRywwQkFBMEIsQ0FBQztZQUNqRixXQUFXLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ2xFO1FBRUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO1FBQzNDLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQztRQUMzQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxFQUFFLENBQUM7UUFFaEMsT0FBTztZQUNILGFBQWEsZUFBQTtZQUNiLFlBQVksY0FBQTtZQUNaLEtBQUssT0FBQTtTQUNSLENBQUM7SUFDTixDQUFDO0lBRU8sb0NBQW1CLEdBQTNCLFVBQTRCLE1BQWMsRUFBRSxLQUFhLEVBQUUsTUFBYzs7UUFDL0QsSUFBQSxLQUFxRCxJQUFJLENBQUMsSUFBSSxFQUFsRCxZQUFZLGNBQUEsRUFBWSxZQUFZLGNBQWMsQ0FBQztRQUVyRSxJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDMUMsSUFBTSxrQkFBa0IsR0FBRyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXJFLElBQUksY0FBYyxHQUFTLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDekQsSUFBSSxzQkFBc0IsR0FBUyxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN4RCxJQUFJLEtBQUssR0FBVyxFQUFFLENBQUM7UUFDdkIsSUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDO1FBQ3JCLElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQztRQUN0QixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7UUFFZCxJQUFNLFlBQVksR0FBRyxVQUFDLHNCQUE0QjtZQUN0QyxJQUFBLEtBQUssR0FBYSxzQkFBc0IsTUFBbkMsRUFBRSxNQUFNLEdBQUssc0JBQXNCLE9BQTNCLENBQTRCO1lBQ2pELE9BQU8sS0FBSyxLQUFLLGNBQWMsQ0FBQyxLQUFLLElBQUksTUFBTSxLQUFLLGNBQWMsQ0FBQyxNQUFNLENBQUM7UUFDOUUsQ0FBQyxDQUFDO1FBRUYsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFFBQVEsS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxTQUFTLENBQUM7UUFFaEYsR0FBRztZQUNDLElBQUksS0FBSyxFQUFFLEdBQUcsRUFBRSxFQUFFO2dCQUNkLE1BQU0sQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsQ0FBQztnQkFDcEQsTUFBTTthQUNUO1lBRUQsY0FBYyxHQUFHLHNCQUFzQixDQUFDO1lBQ3hDLElBQU0sUUFBUSxHQUFHLEtBQUssR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN6RSxJQUFNLFNBQVMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFNUUsSUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDO2dCQUN0QixXQUFXLGFBQUE7Z0JBQ1gsTUFBTSxRQUFBO2dCQUNOLFNBQVMsV0FBQTtnQkFDVCxRQUFRLFVBQUE7Z0JBQ1IsWUFBWSxjQUFBO2dCQUNaLFlBQVksY0FBQTtnQkFDWixXQUFXLGFBQUE7YUFDZCxDQUFDLENBQUM7WUFFSCxLQUFLLEdBQUcsTUFBQSxNQUFNLGFBQU4sTUFBTSx1QkFBTixNQUFNLENBQUUsS0FBSyxtQ0FBSSxFQUFFLENBQUM7WUFDNUIsWUFBWSxHQUFHLE1BQUEsTUFBTSxhQUFOLE1BQU0sdUJBQU4sTUFBTSxDQUFFLFlBQVksbUNBQUksQ0FBQyxDQUFDO1lBQ3pDLGFBQWEsR0FBRyxNQUFBLE1BQU0sYUFBTixNQUFNLHVCQUFOLE1BQU0sQ0FBRSxhQUFhLG1DQUFJLENBQUMsQ0FBQztZQUUzQyxJQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxHQUFHLFVBQVUsR0FBRyxDQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1lBRXhDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDekIsc0JBQXNCLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUV2RCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUU7Z0JBQzFCLE1BQU07YUFDVDtTQUNKLFFBQVEsQ0FBQyxZQUFZLENBQUMsc0JBQXNCLENBQUMsRUFBRTtRQUVoRCxPQUFPLEVBQUUsWUFBWSxjQUFBLEVBQUUsYUFBYSxlQUFBLEVBQUUsS0FBSyxPQUFBLEVBQUUsY0FBYyxnQkFBQSxFQUFFLGtCQUFrQixvQkFBQSxFQUFFLENBQUM7SUFDdEYsQ0FBQztJQUVPLGdDQUFlLEdBQXZCLFVBQXdCLFVBQXNCO1FBQXRCLDJCQUFBLEVBQUEsY0FBc0I7UUFDcEMsSUFBQSxLQUlGLElBQUksRUFISSxRQUFRLG1CQUFBLEVBQ2hCLGFBQWEsbUJBQUEsRUFDYixLQUFLLFdBQ0QsQ0FBQztRQUVULElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDeEMsT0FBTztTQUNWO1FBRUssSUFBQSxLQUE4RCxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQTdFLE9BQU8sYUFBQSxFQUFjLFlBQVksZ0JBQUEsRUFBWSxVQUFVLGNBQXNCLENBQUM7UUFFdEYseURBQXlEO1FBQ3pELElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNWLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVWLElBQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFDbkMsSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFDM0MsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxLQUFLLFlBQVksQ0FBQztRQUUxRCxJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUM7UUFFMUQsSUFBTSxrQkFBa0IsR0FBYSxFQUFFLENBQUM7UUFFeEMsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsQ0FBQzs7WUFDakMsSUFBSSxDQUFDLEdBQUcsWUFBWSxJQUFJLENBQUMsR0FBRyxVQUFVLEVBQUU7Z0JBQ3BDLFdBQVcsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO2dCQUM1QixPQUFPO2FBQ1Y7WUFFRCxJQUFNLFNBQVMsR0FBRyxDQUFDLEdBQUcsWUFBWSxDQUFDO1lBQ25DLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQztZQUNwQixJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7WUFDakIsSUFBSSxVQUFVLEVBQUU7Z0JBQ1osV0FBVyxHQUFHLFNBQVMsR0FBRyxXQUFXLENBQUM7Z0JBQ3RDLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxXQUFXLENBQUMsQ0FBQzthQUNsRDtpQkFBTTtnQkFDSCxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLENBQUM7Z0JBQy9DLFFBQVEsR0FBRyxTQUFTLEdBQUcsUUFBUSxDQUFDO2FBQ25DO1lBRUQsV0FBVyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDM0IsSUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBRXBDLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1QsT0FBTzthQUNWO1lBRUQsQ0FBQyxHQUFHLFVBQVUsR0FBRyxRQUFRLENBQUM7WUFDMUIsQ0FBQyxHQUFHLE1BQUEsa0JBQWtCLENBQUMsUUFBUSxDQUFDLG1DQUFJLENBQUMsQ0FBQztZQUV0QyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQUEsa0JBQWtCLENBQUMsUUFBUSxDQUFDLG1DQUFJLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7WUFFeEYsdURBQXVEO1lBQ3ZELFdBQVcsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6QyxXQUFXLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0MsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8saUNBQWdCLEdBQXhCLFVBQXlCLFVBQWtCO1FBQy9CLElBQUEsS0FBSyxHQUFLLElBQUksTUFBVCxDQUFVO1FBRXZCLGtFQUFrRTtRQUM1RCxJQUFBLEtBQTJCLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBMUMsVUFBVSxnQkFBQSxFQUFFLFFBQVEsY0FBc0IsQ0FBQztRQUNuRCxJQUFJLFVBQVUsS0FBSyxDQUFDLEVBQUU7WUFDbEIsMkNBQTJDO1lBQzNDLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxDQUFDLENBQUM7U0FDcEM7YUFBTSxJQUFJLFVBQVUsS0FBSyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUN4QywwQ0FBMEM7WUFDMUMsSUFBSSxDQUFDLHVCQUF1QixHQUFHLFFBQVEsQ0FBQztTQUMzQzthQUFNO1lBQ0gsc0NBQXNDO1lBQ3RDLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQzFFO1FBRUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUN6QixJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBRWhDLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBRUQsdUJBQU0sR0FBTjtRQUNVLElBQUEsS0FHRixJQUFJLENBQUMsSUFBSSxFQUZDLFdBQVcsd0JBQUEsRUFDWixLQUFLLGlCQUNMLENBQUM7UUFDZCxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFDLFdBQVcsRUFBRSxLQUFLO1lBQ3ZDLElBQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7WUFDNUIsV0FBVyxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ3JDLFdBQVcsQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUN6QyxXQUFXLENBQUMsaUJBQWlCLEdBQUcsV0FBVyxDQUFDO1lBQzVDLFdBQVcsQ0FBQyxpQkFBaUIsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDO1lBQ25ELFdBQVcsQ0FBQyxtQkFBbUIsR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDO1lBQ3ZELFdBQVcsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFDOUMsV0FBVyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDOUIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8saUNBQWdCLEdBQXhCLFVBQXlCLENBQVMsRUFBRSxDQUFTOztRQUN6QyxJQUFNLGtCQUFrQixHQUFXLEVBQUUsQ0FBQztRQUN0QyxJQUFNLGNBQWMsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFNBQWdCLEVBQUUsQ0FBQzs7WUFDbkUsS0FBb0IsSUFBQSxLQUFBLFNBQUEsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUEsZ0JBQUEsNEJBQUU7Z0JBQXBDLElBQU0sS0FBSyxXQUFBO2dCQUNaLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTztvQkFBRSxTQUFTO2dCQUM3QixJQUFJLENBQUMsQ0FBQyxLQUFLLFlBQVksV0FBVyxDQUFDO29CQUFFLFNBQVM7Z0JBRTlDLElBQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDdEMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUM7Z0JBQ3JELFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO2dCQUNuRCxJQUFJLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFO29CQUMvQixPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUM7aUJBQ3RCO2dCQUVELElBQU0sS0FBSyxHQUFHLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztnQkFDdkQsSUFBTSxLQUFLLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO2dCQUN2RCxJQUFNLElBQUksR0FBRyxTQUFBLEtBQUssRUFBSSxDQUFDLENBQUEsR0FBRyxTQUFBLEtBQUssRUFBSSxDQUFDLENBQUEsQ0FBQztnQkFDckMsSUFBTSxZQUFZLEdBQUcsS0FBSyxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDO2dCQUM5QyxJQUFJLFlBQVksSUFBSSxJQUFJLEdBQUcsY0FBYyxDQUFDLElBQUksRUFBRTtvQkFDNUMsY0FBYyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7b0JBQzNCLGNBQWMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztpQkFDdEM7Z0JBRUQsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQ3RDOzs7Ozs7Ozs7UUFFRCxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDaEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFO1lBQy9CLHFDQUFxQztZQUNyQyxPQUFPLFNBQVMsQ0FBQztTQUNwQjtRQUVELHNEQUFzRDtRQUN0RCxPQUFPLGNBQWMsQ0FBQyxLQUFLLENBQUM7SUFDaEMsQ0FBQztJQUVELDRCQUFXLEdBQVg7UUFDSSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDcEMsQ0FBQztJQUVPLGlDQUFnQixHQUF4QjtRQUNJLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDNUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7WUFDeEIsT0FBTyxVQUFVLENBQUM7U0FDckI7UUFFSyxJQUFBLEtBQUEsT0FBZ0MsSUFBSSxDQUFDLFdBQVcsSUFBQSxFQUEvQyxZQUFZLFFBQUEsRUFBRSxhQUFhLFFBQW9CLENBQUM7UUFDdkQsVUFBVSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0QsVUFBVSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFNUQsT0FBTyxVQUFVLENBQUM7SUFDdEIsQ0FBQztJQUVPLGlDQUFnQixHQUF4QixVQUF5QixLQUFnQztRQUMvQyxJQUFBLEtBSUYsSUFBSSxFQUhTLGVBQWUsK0JBQUEsRUFDNUIsV0FBc0MsRUFBL0IsV0FBVyxpQkFBQSxFQUFFLGdCQUFnQixzQkFBQSxFQUM1QixtQkFBbUIsOEJBQ3ZCLENBQUM7UUFDRCxJQUFBLE9BQU8sR0FBYyxLQUFLLFFBQW5CLEVBQUUsT0FBTyxHQUFLLEtBQUssUUFBVixDQUFXO1FBRW5DLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN0QyxJQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLFVBQVUsQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzdGLElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFdEQsSUFBSSxDQUFDLG1CQUFtQixJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ2hDLE9BQU87U0FDVjtRQUVPLElBQUEsRUFBRSxHQUFzQixLQUFLLEdBQTNCLEVBQUUsTUFBTSxHQUFjLEtBQUssT0FBbkIsRUFBRSxPQUFPLEdBQUssS0FBSyxRQUFWLENBQVc7UUFDdEMsSUFBTSxXQUFXLEdBQUcsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQzVDLElBQU0sTUFBTSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLElBQUssT0FBQSxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBWCxDQUFXLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1QsT0FBTztTQUNWO1FBQ0QsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRWhCLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQztRQUN6QixJQUFJLG1CQUFtQixFQUFFO1lBQ3JCLFVBQVUsR0FBRyxDQUFDLE9BQU8sQ0FBQztZQUN0QixJQUFJLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1NBQzFFO1FBRUQsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNiLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDN0M7YUFBTTtZQUNILGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFO2dCQUN0QyxNQUFNLFFBQUE7Z0JBQ04sTUFBTSxRQUFBO2dCQUNOLEtBQUssRUFBRSxTQUFTO2FBQ25CLENBQUMsQ0FBQztTQUNOO1FBRUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsRUFBRSxvQkFBb0IsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBRTVGLGVBQWUsYUFBZixlQUFlLHVCQUFmLGVBQWUsQ0FBRyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLFFBQUEsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDM0YsQ0FBQztJQUVPLHVDQUFzQixHQUE5QixVQUErQixLQUFtQzs7UUFDeEQsSUFBQSxLQUlGLElBQUksRUFIUyxxQkFBcUIscUNBQUEsRUFDM0IsV0FBVyxxQkFBQSxFQUNWLG1CQUFtQiw4QkFDdkIsQ0FBQztRQUNELElBQUEsT0FBTyxHQUFjLEtBQUssUUFBbkIsRUFBRSxPQUFPLEdBQUssS0FBSyxRQUFWLENBQVc7UUFFbkMsb0dBQW9HO1FBQ3BHLHlFQUF5RTtRQUN6RSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLFlBQVksRUFBRTtZQUNoQyxPQUFPO1NBQ1Y7UUFFRCxJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDdEMsSUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sSUFBSSxVQUFVLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM3RixJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRXRELElBQUksQ0FBQyxtQkFBbUIsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNoQyxPQUFPO1NBQ1Y7UUFFTyxJQUFBLEVBQUUsR0FBdUIsS0FBSyxHQUE1QixFQUFFLE1BQU0sR0FBZSxLQUFLLE9BQXBCLEVBQUUsUUFBUSxHQUFLLEtBQUssU0FBVixDQUFXO1FBQ3ZDLElBQU0sV0FBVyxHQUFHLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUM1QyxJQUFNLE1BQU0sR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxJQUFLLE9BQUEsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQVgsQ0FBVyxDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNULE9BQU87U0FDVjtRQUNELEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUVoQixJQUFJLG1CQUFtQixFQUFFO1lBQ3JCLElBQU0sVUFBVSxHQUEwQixXQUFXLENBQUMsTUFBTSxDQUN4RCxVQUFDLEVBQUUsRUFBRSxDQUFDLElBQUssOENBQ0osRUFBRSxXQUNGLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBQyxDQUFDLElBQStCLE9BQUEsQ0FBQyxDQUFDLFVBQVUsS0FBSyxVQUFVLEVBQTNCLENBQTJCLENBQUMsSUFGbEYsQ0FHVixFQUNELEVBQTJCLENBQzlCLENBQUM7WUFFRixJQUFNLGlCQUFlLEdBQVEsRUFBRSxDQUFDO1lBQ2hDLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBQyxDQUFDOzs7Z0JBQ2pCLE1BQUEsaUJBQWUsTUFBQyxDQUFDLENBQUMsUUFBUSxxQ0FBMUIsaUJBQWUsT0FBaUIsQ0FBQyxFQUFDO2dCQUNsQyxJQUFJLENBQUMsQ0FBQyxPQUFPO29CQUFFLGlCQUFlLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDakQsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxJQUFLLE9BQUEsQ0FBQyxDQUFDLE1BQU0sS0FBSyxNQUFNLElBQUksQ0FBQyxDQUFDLFFBQVEsS0FBSyxRQUFRLEVBQTlDLENBQThDLENBQUMsQ0FBQztZQUUzRixJQUFJLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLHFCQUFxQixDQUM1QyxNQUFNLEVBQ04sTUFBTSxFQUNOLE1BQUEsV0FBVyxhQUFYLFdBQVcsdUJBQVgsV0FBVyxDQUFFLE9BQU8sbUNBQUksS0FBSyxFQUM3QixpQkFBZSxDQUNsQixDQUFDO1NBQ0w7UUFFRCxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxFQUFFLG9CQUFvQixFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFFNUYscUJBQXFCLGFBQXJCLHFCQUFxQix1QkFBckIscUJBQXFCLENBQUcsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxRQUFBLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzlGLENBQUM7SUFFTyxzQ0FBcUIsR0FBN0IsVUFBOEIsS0FBZ0M7O1FBQ3BELElBQUEsS0FJRixJQUFJLEVBSEosT0FBTyxhQUFBLEVBQ0MsbUJBQW1CLDhCQUFBLEVBQzNCLFNBQVMsZUFDTCxDQUFDO1FBQ1QsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNWLE9BQU87U0FDVjtRQUVELElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUM5QixJQUFBLEtBQUssR0FBOEIsS0FBSyxNQUFuQyxFQUFFLEtBQUssR0FBdUIsS0FBSyxNQUE1QixFQUFFLE9BQU8sR0FBYyxLQUFLLFFBQW5CLEVBQUUsT0FBTyxHQUFLLEtBQUssUUFBVixDQUFXO1FBQ2pELElBQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLElBQUksVUFBVSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFN0YsSUFBSSxDQUFDLG1CQUFtQixFQUFFO1lBQ3RCLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDN0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ25ELElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDL0MsT0FBTztTQUNWO1FBRUQsdUZBQXVGO1FBQ3ZGLGNBQWM7UUFDZCxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFaEIsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN0RCxJQUFNLHNCQUFzQixHQUFHLG1CQUFtQixJQUFJLEtBQUssS0FBSyxTQUFTLENBQUM7UUFDMUUsSUFBSSxDQUFDLHNCQUFzQixFQUFFO1lBQ3pCLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDN0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ25ELE9BQU87U0FDVjtRQUVELElBQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQUMsTUFBTSxJQUFLLE9BQUEsTUFBTSxDQUFDLEVBQUUsTUFBSyxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsRUFBRSxDQUFBLEVBQXZCLENBQXVCLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQzlHLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLE1BQUEsS0FBSyxDQUFDLE1BQU0sbUNBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1lBQzVELElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDM0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUNqQyxJQUFJLENBQUMsRUFBRSxFQUNQLEVBQUUsS0FBSyxPQUFBLEVBQUUsS0FBSyxPQUFBLEVBQUUsT0FBTyxTQUFBLEVBQUUsT0FBTyxTQUFBLEVBQUUsS0FBSyxPQUFBLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxFQUMzRCxhQUFhLENBQUMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FDeEMsQ0FBQztTQUNMO2FBQU07WUFDSCxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ2xEO1FBRUQsSUFBSSxtQkFBbUIsSUFBSSxTQUFTLENBQUMsZUFBZSxJQUFJLElBQUksSUFBSSxTQUFTLENBQUMscUJBQXFCLElBQUksSUFBSSxFQUFFO1lBQ3JHLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1NBQzNEO1FBRUQsSUFBSSxDQUFBLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxPQUFPLEtBQUksTUFBTSxFQUFFO1lBQzFCLElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUU7Z0JBQy9DLE1BQU0sUUFBQTtnQkFDTixNQUFNLEVBQUUsS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLE1BQU07Z0JBQ3JCLEtBQUssRUFBRSxTQUFTO2FBQ25CLENBQUMsQ0FBQztTQUNOO2FBQU07WUFDSCxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDdEQ7SUFDTCxDQUFDO0lBRU8sK0JBQWMsR0FBdEIsVUFBdUIsVUFBZ0I7UUFBdkMsaUJBaUVDO1FBaEVHLElBQU0sYUFBYSxHQUFHLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUV6QyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ3BDLE9BQU8sRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLENBQUM7U0FDeEM7UUFFSyxJQUFBLEtBQUEsT0FBOEIsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFVBQVUsQ0FBQyxJQUFBLEVBQXZFLFdBQVcsUUFBQSxFQUFFLFlBQVksUUFBOEMsQ0FBQztRQUUvRSxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQzlDLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBRTNDLElBQU0sMENBQTBDLEdBQUc7WUFDL0MsUUFBUSxLQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNuQixLQUFLLEtBQUs7b0JBQ04sT0FBTyxDQUFDLENBQUM7Z0JBQ2IsS0FBSyxRQUFRO29CQUNULE9BQU8sVUFBVSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO2dCQUNqRCxLQUFLLE1BQU07b0JBQ1AsT0FBTyxDQUFDLENBQUM7Z0JBQ2IsS0FBSyxPQUFPLENBQUM7Z0JBQ2I7b0JBQ0ksT0FBTyxVQUFVLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUM7YUFDbEQ7UUFDTCxDQUFDLENBQUM7UUFDRixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDZCxJQUFJLFlBQVksU0FBQSxDQUFDO1lBQ2pCLElBQUksWUFBWSxTQUFBLENBQUM7WUFFakIsUUFBUSxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNuQixLQUFLLEtBQUssQ0FBQztnQkFDWCxLQUFLLFFBQVE7b0JBQ1QsWUFBWSxHQUFHLENBQUMsVUFBVSxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUN6RCxZQUFZLEdBQUcsMENBQTBDLEVBQUUsQ0FBQztvQkFDNUQsYUFBYSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDdkQsTUFBTTtnQkFFVixLQUFLLE1BQU0sQ0FBQztnQkFDWixLQUFLLE9BQU8sQ0FBQztnQkFDYjtvQkFDSSxZQUFZLEdBQUcsMENBQTBDLEVBQUUsQ0FBQztvQkFDNUQsWUFBWSxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUMzRCxhQUFhLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQzdEO1lBRUQsdURBQXVEO1lBQ3ZELElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLEdBQUcsWUFBWSxDQUFDLENBQUM7WUFDbEYsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUMsQ0FBQztTQUNyRjtRQUVELElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2xELElBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7WUFDbkMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRW5ELElBQU0sb0JBQW9CLEdBQUcsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2hELG9CQUFvQixDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQztZQUNsRCxvQkFBb0IsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUM7WUFDbEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1NBQzlFO2FBQU07WUFDSCxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDeEQ7UUFFRCxPQUFPLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxDQUFDO0lBQ3pDLENBQUM7SUFFTywwQ0FBeUIsR0FBakMsVUFBa0MsVUFBZ0I7UUFDdEMsSUFBQSxLQUFLLEdBQWEsVUFBVSxNQUF2QixFQUFFLE1BQU0sR0FBSyxVQUFVLE9BQWYsQ0FBZ0I7UUFFckMsSUFBTSxXQUFXLEdBQUcsS0FBSyxHQUFHLE1BQU0sQ0FBQztRQUNuQyxJQUFNLGNBQWMsR0FBRyxHQUFHLENBQUM7UUFDM0IsSUFBTSxvQkFBb0IsR0FBRyxHQUFHLENBQUM7UUFDakMsSUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUM7UUFFakMsSUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQztRQUVyQixRQUFRLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDbkIsS0FBSyxLQUFLLENBQUM7WUFDWCxLQUFLLFFBQVE7Z0JBQ1Qsc0hBQXNIO2dCQUN0SCw4RUFBOEU7Z0JBQzlFLElBQU0saUJBQWlCLEdBQ25CLFdBQVcsR0FBRyxDQUFDO29CQUNYLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxvQkFBb0IsR0FBRyxDQUFDLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQztvQkFDcEUsQ0FBQyxDQUFDLG9CQUFvQixDQUFDO2dCQUMvQixXQUFXLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7Z0JBQ3JFLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUztvQkFDekIsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUM7b0JBQ2xDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQyxDQUFDO2dCQUM3QyxNQUFNO1lBRVYsS0FBSyxNQUFNLENBQUM7WUFDWixLQUFLLE9BQU8sQ0FBQztZQUNiO2dCQUNJLG1IQUFtSDtnQkFDbkgsNkVBQTZFO2dCQUM3RSxJQUFNLGdCQUFnQixHQUNsQixXQUFXLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxtQkFBbUIsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUM7Z0JBQ3hHLFdBQVcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLGdCQUFnQixDQUFDLENBQUM7Z0JBQ3BHLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztTQUNqRjtRQUVELE9BQU8sQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQXAxQk0sZ0JBQVMsR0FBRyxRQUFRLENBQUM7SUE4QjVCO1FBREMsUUFBUSxDQUFDLE9BQU8sQ0FBQzs0Q0FDTTtJQVV4QjtRQURDLFFBQVEsQ0FBQyxRQUFRLENBQUM7NENBQ3dCO0lBa0IzQztRQURDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7NENBQ007SUFJOUI7UUFEQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDOzZDQUNPO0lBSS9CO1FBREMsUUFBUSxDQUFDLFdBQVcsQ0FBQztnREFDYTtJQUduQztRQURDLFFBQVEsQ0FBQyxlQUFlLENBQUM7K0NBQ087SUE2Q2pDO1FBREMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQzsyQ0FDUDtJQW11QmpCLGFBQUM7Q0FBQSxBQXQxQkQsSUFzMUJDO1NBdDFCWSxNQUFNIn0=