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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
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
import { Group } from '../scene/group';
import { Selection } from '../scene/selection';
import { MarkerLabel } from './markerLabel';
import { getFont } from '../scene/shape/text';
import { getMarker } from './marker/util';
import { createId } from '../util/id';
import { RedrawType } from '../scene/node';
import { HdpiCanvas } from '../canvas/hdpiCanvas';
import { BOOLEAN, FUNCTION, NUMBER, OPT_BOOLEAN, OPT_FONT_STYLE, OPT_FONT_WEIGHT, OPT_FUNCTION, OPT_NUMBER, POSITION, COLOR_STRING, STRING, Validate, } from '../util/validation';
import { Layers } from './layers';
export var LegendOrientation;
(function (LegendOrientation) {
    LegendOrientation[LegendOrientation["Vertical"] = 0] = "Vertical";
    LegendOrientation[LegendOrientation["Horizontal"] = 1] = "Horizontal";
})(LegendOrientation || (LegendOrientation = {}));
export var LegendPosition;
(function (LegendPosition) {
    LegendPosition["Top"] = "top";
    LegendPosition["Right"] = "right";
    LegendPosition["Bottom"] = "bottom";
    LegendPosition["Left"] = "left";
})(LegendPosition || (LegendPosition = {}));
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
    LegendLabel.prototype.getFont = function () {
        return getFont(this.fontSize, this.fontFamily, this.fontStyle, this.fontWeight);
    };
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
export { LegendLabel };
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
        enumerable: true,
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
export { LegendMarker };
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
    return LegendItem;
}());
export { LegendItem };
var NO_OP_LISTENER = function () {
    // Default listener that does nothing.
};
var LegendListeners = /** @class */ (function () {
    function LegendListeners() {
        this.legendItemClick = NO_OP_LISTENER;
    }
    __decorate([
        Validate(FUNCTION)
    ], LegendListeners.prototype, "legendItemClick", void 0);
    return LegendListeners;
}());
export { LegendListeners };
var Legend = /** @class */ (function () {
    function Legend() {
        this.id = createId(this);
        this.group = new Group({ name: 'legend', layer: true, zIndex: Layers.LEGEND_ZINDEX });
        this.itemSelection = Selection.select(this.group).selectAll();
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
    Object.defineProperty(Legend.prototype, "data", {
        get: function () {
            return this._data;
        },
        set: function (value) {
            this._data = value;
            this.group.visible = value.length > 0 && this.enabled;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Legend.prototype, "enabled", {
        get: function () {
            return this._enabled;
        },
        set: function (value) {
            this._enabled = value;
            this.group.visible = value && this.data.length > 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Legend.prototype, "position", {
        get: function () {
            return this._position;
        },
        set: function (value) {
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
        },
        enumerable: true,
        configurable: true
    });
    Legend.prototype.onMarkerShapeChange = function () {
        this.itemSelection = this.itemSelection.setData([]);
        this.itemSelection.exit.remove();
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
        var data = __spread(this.data);
        if (this.reverseOrder) {
            data.reverse();
        }
        var updateSelection = this.itemSelection.setData(data, function (_, datum) {
            var Marker = getMarker(markerShape || datum.marker.shape);
            return datum.id + '-' + datum.itemId + '-' + Marker.name;
        });
        updateSelection.exit.remove();
        var enterSelection = updateSelection.enter.append(MarkerLabel).each(function (node, datum) {
            var Marker = getMarker(markerShape || datum.marker.shape);
            node.marker = new Marker();
        });
        var itemSelection = (this.itemSelection = updateSelection.merge(enterSelection));
        var itemCount = itemSelection.size;
        // Update properties that affect the size of the legend items and measure them.
        var bboxes = [];
        var font = label.getFont();
        var ellipsis = "...";
        var itemMaxWidthPercentage = 0.8;
        var maxItemWidth = (maxWidth !== null && maxWidth !== void 0 ? maxWidth : width * itemMaxWidthPercentage);
        itemSelection.each(function (markerLabel, datum) {
            var e_1, _a;
            var _b;
            var text = (_b = datum.label.text, (_b !== null && _b !== void 0 ? _b : '<unknown>'));
            markerLabel.markerSize = markerSize;
            markerLabel.spacing = markerPadding;
            markerLabel.fontStyle = fontStyle;
            markerLabel.fontWeight = fontWeight;
            markerLabel.fontSize = fontSize;
            markerLabel.fontFamily = fontFamily;
            var textChars = text.split('');
            var addEllipsis = false;
            if (text.length > maxLength) {
                text = "" + text.substring(0, maxLength);
                addEllipsis = true;
            }
            var labelWidth = markerSize + markerPadding + HdpiCanvas.getTextSize(text, font).width;
            if (labelWidth > maxItemWidth) {
                var truncatedText = '';
                var characterWidths = _this.getCharacterWidths(font);
                var cumCharSize = characterWidths[ellipsis];
                try {
                    for (var textChars_1 = __values(textChars), textChars_1_1 = textChars_1.next(); !textChars_1_1.done; textChars_1_1 = textChars_1.next()) {
                        var char = textChars_1_1.value;
                        if (!characterWidths[char]) {
                            characterWidths[char] = HdpiCanvas.getTextSize(char, font).width;
                        }
                        cumCharSize += characterWidths[char];
                        if (cumCharSize > maxItemWidth) {
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
            var id = datum.itemId || datum.id;
            if (addEllipsis) {
                text += ellipsis;
                _this.truncatedItems.add(id);
            }
            else {
                _this.truncatedItems.delete(id);
            }
            markerLabel.text = text;
            bboxes.push(markerLabel.computeBBox());
        });
        var itemHeight = bboxes.length && bboxes[0].height;
        var rowCount = 0;
        var columnWidth = 0;
        var paddedItemsWidth = 0;
        var paddedItemsHeight = 0;
        width = Math.max(1, width);
        height = Math.max(1, height);
        switch (this.orientation) {
            case LegendOrientation.Horizontal:
                if (!(isFinite(width) && width > 0)) {
                    return false;
                }
                rowCount = 0;
                var columnCount = 0;
                // Split legend items into columns until the width is suitable.
                do {
                    var itemsWidth = 0;
                    columnCount = 0;
                    columnWidth = 0;
                    rowCount++;
                    var i = 0;
                    while (i < itemCount) {
                        var bbox = bboxes[i];
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
                    var itemsWidth = 0;
                    var itemsHeight = 0;
                    var columnCount_1 = 0;
                    var i = 0;
                    while (i < itemCount) {
                        var bbox = bboxes[i];
                        if (!columnCount_1) {
                            itemsHeight += bbox.height;
                        }
                        if (bbox.width > columnWidth) {
                            columnWidth = bbox.width;
                        }
                        i++;
                        if (i % rowCount === 0) {
                            itemsWidth += columnWidth;
                            columnWidth = 0;
                            columnCount_1++;
                        }
                    }
                    if (i % rowCount !== 0) {
                        itemsWidth += columnWidth;
                        columnCount_1++;
                    }
                    paddedItemsWidth = itemsWidth + (columnCount_1 - 1) * paddingX;
                    paddedItemsHeight = itemsHeight + (rowCount - 1) * paddingY;
                } while (paddedItemsHeight > height && rowCount > 1);
                break;
        }
        // Top-left corner of the first legend item.
        var startX = (width - paddedItemsWidth) / 2;
        var startY = (height - paddedItemsHeight) / 2;
        var x = 0;
        var y = 0;
        columnWidth = 0;
        // Position legend items using the layout computed above.
        itemSelection.each(function (markerLabel, _, i) {
            // Round off for pixel grid alignment to work properly.
            markerLabel.translationX = Math.floor(startX + x);
            markerLabel.translationY = Math.floor(startY + y);
            var bbox = bboxes[i];
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
        var size = this.size;
        var oldSize = this.oldSize;
        size[0] = paddedItemsWidth;
        size[1] = paddedItemsHeight;
        if (size[0] !== oldSize[0] || size[1] !== oldSize[1]) {
            oldSize[0] = size[0];
            oldSize[1] = size[1];
        }
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
        var node = this.group.pickNode(x, y);
        if (node && node.parent) {
            return node.parent.datum;
        }
    };
    Legend.className = 'Legend';
    __decorate([
        Validate(BOOLEAN)
    ], Legend.prototype, "_enabled", void 0);
    __decorate([
        Validate(POSITION)
    ], Legend.prototype, "_position", void 0);
    __decorate([
        Validate(OPT_BOOLEAN)
    ], Legend.prototype, "reverseOrder", void 0);
    __decorate([
        Validate(NUMBER(0))
    ], Legend.prototype, "spacing", void 0);
    return Legend;
}());
export { Legend };
