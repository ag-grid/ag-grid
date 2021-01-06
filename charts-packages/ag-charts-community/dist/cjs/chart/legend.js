"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var group_1 = require("../scene/group");
var selection_1 = require("../scene/selection");
var markerLabel_1 = require("./markerLabel");
var observable_1 = require("../util/observable");
var util_1 = require("./marker/util");
var id_1 = require("../util/id");
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
var LegendLabel = /** @class */ (function (_super) {
    __extends(LegendLabel, _super);
    function LegendLabel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.color = 'black';
        _this.fontSize = 12;
        _this.fontFamily = 'Verdana, sans-serif';
        return _this;
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
    return LegendLabel;
}(observable_1.Observable));
exports.LegendLabel = LegendLabel;
var LegendMarker = /** @class */ (function (_super) {
    __extends(LegendMarker, _super);
    function LegendMarker() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.size = 15;
        /**
         * Padding between the marker and the label within each legend item.
         */
        _this.padding = 8;
        _this.strokeWidth = 1;
        return _this;
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
    return LegendMarker;
}(observable_1.Observable));
exports.LegendMarker = LegendMarker;
var LegendItem = /** @class */ (function (_super) {
    __extends(LegendItem, _super);
    function LegendItem() {
        var _this = _super.call(this) || this;
        _this.marker = new LegendMarker();
        _this.label = new LegendLabel();
        /**
         * The legend uses grid layout for its items, occupying as few columns as possible when positioned to left or right,
         * and as few rows as possible when positioned to top or bottom. This config specifies the amount of horizontal
         * padding between legend items.
         */
        _this.paddingX = 16;
        /**
         * The legend uses grid layout for its items, occupying as few columns as possible when positioned to left or right,
         * and as few rows as possible when positioned to top or bottom. This config specifies the amount of vertical
         * padding between legend items.
         */
        _this.paddingY = 8;
        var changeListener = function () { return _this.fireEvent({ type: 'change' }); };
        _this.marker.addEventListener('change', changeListener);
        _this.label.addEventListener('change', changeListener);
        var layoutChangeListener = function () { return _this.fireEvent({ type: 'layoutChange' }); };
        _this.marker.addEventListener('layoutChange', layoutChangeListener);
        _this.label.addEventListener('layoutChange', layoutChangeListener);
        return _this;
    }
    __decorate([
        observable_1.reactive('layoutChange')
    ], LegendItem.prototype, "paddingX", void 0);
    __decorate([
        observable_1.reactive('layoutChange')
    ], LegendItem.prototype, "paddingY", void 0);
    return LegendItem;
}(observable_1.Observable));
exports.LegendItem = LegendItem;
var Legend = /** @class */ (function (_super) {
    __extends(Legend, _super);
    function Legend() {
        var _this = _super.call(this) || this;
        _this.id = id_1.createId(_this);
        _this.group = new group_1.Group();
        _this.itemSelection = selection_1.Selection.select(_this.group).selectAll();
        _this.oldSize = [0, 0];
        _this.item = new LegendItem();
        _this.data = [];
        _this.enabled = true;
        _this.orientation = LegendOrientation.Vertical;
        _this.position = LegendPosition.Right;
        /**
         * Spacing between the legend and the edge of the chart's element.
         */
        _this.spacing = 20;
        _this._size = [0, 0];
        _this.addPropertyListener('data', _this.onDataChange);
        _this.addPropertyListener('enabled', _this.onEnabledChange);
        _this.addPropertyListener('position', _this.onPositionChange);
        _this.item.marker.addPropertyListener('shape', _this.onMarkerShapeChange, _this);
        _this.addEventListener('change', _this.update);
        _this.item.addEventListener('change', function () { return _this.fireEvent({ type: 'change' }); });
        _this.item.addEventListener('layoutChange', function () { return _this.fireEvent({ type: 'layoutChange' }); });
        return _this;
    }
    Object.defineProperty(Legend.prototype, "layoutHorizontalSpacing", {
        get: function () {
            return this.item.paddingX;
        },
        /**
         * @deprecated Please use {@link item.paddingX} instead.
         */
        set: function (value) {
            this.item.paddingX = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Legend.prototype, "layoutVerticalSpacing", {
        get: function () {
            return this.item.paddingY;
        },
        /**
         * @deprecated Please use {@link item.paddingY} instead.
         */
        set: function (value) {
            this.item.paddingY = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Legend.prototype, "itemSpacing", {
        get: function () {
            return this.item.marker.padding;
        },
        /**
         * @deprecated Please use {@link item.marker.padding} instead.
         */
        set: function (value) {
            this.item.marker.padding = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Legend.prototype, "markerShape", {
        get: function () {
            return this.item.marker.shape;
        },
        /**
         * @deprecated Please use {@link item.marker.shape} instead.
         */
        set: function (value) {
            this.item.marker.shape = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Legend.prototype, "markerSize", {
        get: function () {
            return this.item.marker.size;
        },
        /**
         * @deprecated Please use {@link item.marker.size} instead.
         */
        set: function (value) {
            this.item.marker.size = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Legend.prototype, "strokeWidth", {
        get: function () {
            return this.item.marker.strokeWidth;
        },
        /**
         * @deprecated Please use {@link item.marker.strokeWidth} instead.
         */
        set: function (value) {
            this.item.marker.strokeWidth = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Legend.prototype, "color", {
        get: function () {
            return this.item.label.color;
        },
        /**
         * @deprecated Please use {@link item.label.color} instead.
         */
        set: function (value) {
            this.item.label.color = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Legend.prototype, "fontStyle", {
        get: function () {
            return this.item.label.fontStyle;
        },
        /**
         * @deprecated Please use {@link item.label.fontStyle} instead.
         */
        set: function (value) {
            this.item.label.fontStyle = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Legend.prototype, "fontWeight", {
        get: function () {
            return this.item.label.fontWeight;
        },
        /**
         * @deprecated Please use {@link item.label.fontWeight} instead.
         */
        set: function (value) {
            this.item.label.fontWeight = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Legend.prototype, "fontSize", {
        get: function () {
            return this.item.label.fontSize;
        },
        /**
         * @deprecated Please use {@link item.label.fontSize} instead.
         */
        set: function (value) {
            this.item.label.fontSize = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Legend.prototype, "fontFamily", {
        get: function () {
            return this.item.label.fontFamily;
        },
        /**
         * @deprecated Please use {@link item.label.fontFamily} instead.
         */
        set: function (value) {
            this.item.label.fontFamily = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Legend.prototype, "size", {
        get: function () {
            return this._size;
        },
        enumerable: true,
        configurable: true
    });
    Legend.prototype.onDataChange = function (event) {
        this.group.visible = event.value.length > 0 && this.enabled;
    };
    Legend.prototype.onEnabledChange = function (event) {
        this.group.visible = event.value && this.data.length > 0;
    };
    Legend.prototype.onPositionChange = function (event) {
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
    };
    Legend.prototype.onMarkerShapeChange = function () {
        this.itemSelection = this.itemSelection.setData([]);
        this.itemSelection.exit.remove();
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
        var item = this.item;
        var marker = item.marker, paddingX = item.paddingX, paddingY = item.paddingY;
        var updateSelection = this.itemSelection.setData(this.data, function (_, datum) {
            var MarkerShape = util_1.getMarker(marker.shape || datum.marker.shape);
            return datum.id + '-' + datum.itemId + '-' + MarkerShape.name;
        });
        updateSelection.exit.remove();
        var enterSelection = updateSelection.enter.append(markerLabel_1.MarkerLabel).each(function (node, datum) {
            var MarkerShape = util_1.getMarker(marker.shape || datum.marker.shape);
            node.marker = new MarkerShape();
        });
        var itemSelection = this.itemSelection = updateSelection.merge(enterSelection);
        var itemCount = itemSelection.size;
        // Update properties that affect the size of the legend items and measure them.
        var bboxes = [];
        var itemMarker = this.item.marker;
        var itemLabel = this.item.label;
        itemSelection.each(function (markerLabel, datum) {
            // TODO: measure only when one of these properties or data change (in a separate routine)
            markerLabel.markerSize = itemMarker.size;
            markerLabel.spacing = itemMarker.padding;
            markerLabel.fontStyle = itemLabel.fontStyle;
            markerLabel.fontWeight = itemLabel.fontWeight;
            markerLabel.fontSize = itemLabel.fontSize;
            markerLabel.fontFamily = itemLabel.fontFamily;
            markerLabel.text = datum.label.text;
            bboxes.push(markerLabel.computeBBox());
        });
        var itemHeight = bboxes.length && bboxes[0].height;
        var rowCount = 0;
        var columnWidth = 0;
        var paddedItemsWidth = 0;
        var paddedItemsHeight = 0;
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
        itemSelection.each(function (markerLabel, datum, i) {
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
        var size = this._size;
        var oldSize = this.oldSize;
        size[0] = paddedItemsWidth;
        size[1] = paddedItemsHeight;
        if (size[0] !== oldSize[0] || size[1] !== oldSize[1]) {
            oldSize[0] = size[0];
            oldSize[1] = size[1];
        }
    };
    Legend.prototype.update = function () {
        var _this = this;
        this.itemSelection.each(function (markerLabel, datum) {
            var marker = datum.marker;
            markerLabel.markerFill = marker.fill;
            markerLabel.markerStroke = marker.stroke;
            markerLabel.markerStrokeWidth = _this.item.marker.strokeWidth;
            markerLabel.markerFillOpacity = marker.fillOpacity;
            markerLabel.markerStrokeOpacity = marker.strokeOpacity;
            markerLabel.opacity = datum.enabled ? 1 : 0.5;
            markerLabel.color = _this.item.label.color;
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
    return Legend;
}(observable_1.Observable));
exports.Legend = Legend;
//# sourceMappingURL=legend.js.map