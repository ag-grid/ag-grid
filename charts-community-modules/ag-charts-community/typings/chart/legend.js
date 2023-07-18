"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Legend = void 0;
var node_1 = require("../scene/node");
var group_1 = require("../scene/group");
var selection_1 = require("../scene/selection");
var markerLabel_1 = require("./markerLabel");
var bbox_1 = require("../scene/bbox");
var text_1 = require("../scene/shape/text");
var util_1 = require("./marker/util");
var id_1 = require("../util/id");
var hdpiCanvas_1 = require("../canvas/hdpiCanvas");
var validation_1 = require("../util/validation");
var layers_1 = require("./layers");
var chartUpdateType_1 = require("./chartUpdateType");
var gridLayout_1 = require("./gridLayout");
var pagination_1 = require("./pagination/pagination");
var tooltip_1 = require("./tooltip/tooltip");
var logger_1 = require("../util/logger");
var ORIENTATIONS = ['horizontal', 'vertical'];
var OPT_ORIENTATION = validation_1.predicateWithMessage(function (v, ctx) { return validation_1.OPTIONAL(v, ctx, function (v) { return ORIENTATIONS.includes(v); }); }, "expecting an orientation keyword such as 'horizontal' or 'vertical'");
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
        validation_1.Validate(validation_1.NUMBER(0))
    ], LegendMarker.prototype, "size", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], LegendMarker.prototype, "padding", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
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
    return LegendItem;
}());
var LegendListeners = /** @class */ (function () {
    function LegendListeners() {
        this.legendItemClick = undefined;
        this.legendItemDoubleClick = undefined;
    }
    __decorate([
        validation_1.Validate(validation_1.OPT_FUNCTION)
    ], LegendListeners.prototype, "legendItemClick", void 0);
    return LegendListeners;
}());
var Legend = /** @class */ (function () {
    function Legend(ctx) {
        var _a;
        var _this = this;
        this.ctx = ctx;
        this.id = id_1.createId(this);
        this.group = new group_1.Group({ name: 'legend', layer: true, zIndex: layers_1.Layers.LEGEND_ZINDEX });
        this.itemSelection = selection_1.Selection.select(this.group, markerLabel_1.MarkerLabel);
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
        this.pagination = new pagination_1.Pagination(function (type) { return ctx.updateService.update(type); }, function (page) { return _this.updatePageNumber(page); }, ctx.interactionManager, ctx.cursorManager);
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
        this.group.markDirty(this.group, node_1.RedrawType.MINOR);
    };
    Legend.prototype.getCharacterWidths = function (font) {
        var characterWidths = this.characterWidths;
        if (characterWidths.has(font)) {
            return characterWidths.get(font);
        }
        var cw = {
            '...': hdpiCanvas_1.HdpiCanvas.getTextSize('...', font).width,
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
        var font = text_1.getFont(label);
        var itemMaxWidthPercentage = 0.8;
        var maxItemWidth = maxWidth !== null && maxWidth !== void 0 ? maxWidth : width * itemMaxWidthPercentage;
        var paddedMarkerWidth = markerSize + markerPadding + paddingX;
        this.itemSelection.each(function (markerLabel, datum) {
            var _a;
            var Marker = util_1.getMarker(markerShape !== null && markerShape !== void 0 ? markerShape : datum.marker.shape);
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
        var labelWidth = Math.floor(paddedMarkerWidth + hdpiCanvas_1.HdpiCanvas.getTextSize(text, font).width);
        if (labelWidth > maxItemWidth) {
            var truncatedText = '';
            var characterWidths = this.getCharacterWidths(font);
            var cumulativeWidth = paddedMarkerWidth + characterWidths[ellipsis];
            try {
                for (var textChars_1 = __values(textChars), textChars_1_1 = textChars_1.next(); !textChars_1_1.done; textChars_1_1 = textChars_1.next()) {
                    var char = textChars_1_1.value;
                    if (!characterWidths[char]) {
                        characterWidths[char] = hdpiCanvas_1.HdpiCanvas.getTextSize(char, font).width;
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
        var lastPassPaginationBBox = new bbox_1.BBox(0, 0, 0, 0);
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
                logger_1.Logger.warn('unable to find stable legend layout.');
                break;
            }
            paginationBBox = lastPassPaginationBBox;
            var maxWidth = width - (paginationVertical ? 0 : paginationBBox.width);
            var maxHeight = height - (paginationVertical ? paginationBBox.height : 0);
            var layout = gridLayout_1.gridLayout({
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
        this.ctx.updateService.update(chartUpdateType_1.ChartUpdateType.SCENE_RENDER);
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
                if (!(child instanceof markerLabel_1.MarkerLabel))
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
        var pageBBox = bbox_1.BBox.merge(visibleChildBBoxes);
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
            this.ctx.chartEventManager.legendItemClick(series, itemId, newEnabled, datum.legendItemName);
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
        this.ctx.updateService.update(chartUpdateType_1.ChartUpdateType.PROCESS_DATA, { forceNodeDataRefresh: true });
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
            this.ctx.chartEventManager.legendItemDoubleClick(series, itemId, (_a = clickedItem === null || clickedItem === void 0 ? void 0 : clickedItem.enabled) !== null && _a !== void 0 ? _a : false, numVisibleItems_1, clickedItem === null || clickedItem === void 0 ? void 0 : clickedItem.legendItemName);
        }
        this.ctx.updateService.update(chartUpdateType_1.ChartUpdateType.PROCESS_DATA, { forceNodeDataRefresh: true });
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
            this.ctx.tooltipManager.updateTooltip(this.id, { pageX: pageX, pageY: pageY, offsetX: offsetX, offsetY: offsetY, event: event, showArrow: false }, tooltip_1.toTooltipHtml({ content: labelText }));
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
        validation_1.Validate(OPT_ORIENTATION)
    ], Legend.prototype, "orientation", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], Legend.prototype, "spacing", void 0);
    return Legend;
}());
exports.Legend = Legend;
//# sourceMappingURL=legend.js.map