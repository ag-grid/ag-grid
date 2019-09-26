// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var group_1 = require("../scene/group");
var selection_1 = require("../scene/selection");
var markerLabel_1 = require("./markerLabel");
var Orientation;
(function (Orientation) {
    Orientation[Orientation["Vertical"] = 0] = "Vertical";
    Orientation[Orientation["Horizontal"] = 1] = "Horizontal";
})(Orientation = exports.Orientation || (exports.Orientation = {}));
var Legend = /** @class */ (function () {
    function Legend() {
        this.group = new group_1.Group();
        this.itemSelection = selection_1.Selection.select(this.group).selectAll();
        this.oldSize = [0, 0];
        this._size = [0, 0];
        this._data = [];
        this._orientation = Orientation.Vertical;
        this._enabled = true;
        this._itemPaddingX = 16;
        this._itemPaddingY = 8;
        this._markerPadding = markerLabel_1.MarkerLabel.defaults.padding;
        this._labelColor = markerLabel_1.MarkerLabel.defaults.labelColor;
        this._labelFontStyle = markerLabel_1.MarkerLabel.defaults.labelFontStyle;
        this._labelFontWeight = markerLabel_1.MarkerLabel.defaults.labelFontWeight;
        this._labelFontSize = markerLabel_1.MarkerLabel.defaults.labelFontSize;
        this._labelFontFamily = markerLabel_1.MarkerLabel.defaults.labelFontFamily;
        this._markerSize = 14;
        this._markerStrokeWidth = 1;
    }
    Object.defineProperty(Legend.prototype, "size", {
        get: function () {
            return this._size;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Legend.prototype, "data", {
        get: function () {
            return this._data;
        },
        set: function (data) {
            this._data = data;
            this.group.visible = this.enabled && data.length > 0;
            this.requestLayout();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Legend.prototype, "orientation", {
        get: function () {
            return this._orientation;
        },
        set: function (value) {
            if (this._orientation !== value) {
                this._orientation = value;
                this.requestLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Legend.prototype, "enabled", {
        get: function () {
            return this._enabled;
        },
        set: function (value) {
            if (this._enabled !== value) {
                this._enabled = value;
                this.group.visible = value && this.data.length > 0;
                this.requestLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Legend.prototype, "itemPaddingX", {
        get: function () {
            return this._itemPaddingX;
        },
        set: function (value) {
            value = isFinite(value) ? value : 16;
            if (this._itemPaddingX !== value) {
                this._itemPaddingX = value;
                this.requestLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Legend.prototype, "itemPaddingY", {
        get: function () {
            return this._itemPaddingY;
        },
        set: function (value) {
            value = isFinite(value) ? value : 8;
            if (this._itemPaddingY !== value) {
                this._itemPaddingY = value;
                this.requestLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Legend.prototype, "markerPadding", {
        get: function () {
            return this._markerPadding;
        },
        set: function (value) {
            value = isFinite(value) ? value : markerLabel_1.MarkerLabel.defaults.padding;
            if (this._markerPadding !== value) {
                this._markerPadding = value;
                this.requestLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Legend.prototype, "labelColor", {
        get: function () {
            return this._labelColor;
        },
        set: function (value) {
            if (this._labelColor !== value) {
                this._labelColor = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Legend.prototype, "labelFontStyle", {
        get: function () {
            return this._labelFontStyle;
        },
        set: function (value) {
            if (this._labelFontStyle !== value) {
                this._labelFontStyle = value;
                this.requestLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Legend.prototype, "labelFontWeight", {
        get: function () {
            return this._labelFontWeight;
        },
        set: function (value) {
            if (this._labelFontWeight !== value) {
                this._labelFontWeight = value;
                this.requestLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Legend.prototype, "labelFontSize", {
        get: function () {
            return this._labelFontSize;
        },
        set: function (value) {
            if (this._labelFontSize !== value) {
                this._labelFontSize = value;
                this.requestLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Legend.prototype, "labelFontFamily", {
        get: function () {
            return this._labelFontFamily;
        },
        set: function (value) {
            if (this._labelFontFamily !== value) {
                this._labelFontFamily = value;
                this.requestLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Legend.prototype, "markerSize", {
        get: function () {
            return this._markerSize;
        },
        set: function (value) {
            value = isFinite(value) ? value : 14;
            if (this._markerSize !== value) {
                this._markerSize = value;
                this.requestLayout();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Legend.prototype, "markerStrokeWidth", {
        get: function () {
            return this._markerStrokeWidth;
        },
        set: function (value) {
            value = isFinite(value) ? value : 1;
            if (this._markerStrokeWidth !== value) {
                this._markerStrokeWidth = value;
                this.update();
            }
        },
        enumerable: true,
        configurable: true
    });
    Legend.prototype.requestLayout = function () {
        if (this.onLayoutChange) {
            this.onLayoutChange();
        }
    };
    /**
     * The method is given the desired size of the legend, which only serves as a hint.
     * The vertically oriented legend will take as much horizontal space as needed, but will
     * respect the height constraints, and the horizontal legend will take as much vertical
     * space as needed in an attempt not to exceed the given width.
     * After the layout is done, the {@link size} will contain the actual size of the legend.
     * If the actual size is not the same as the previous actual size, the legend will notify
     * the parent component via the {@link onLayoutChange} callback that another layout is needed,
     * and the above process should be repeated.
     * @param width
     * @param height
     */
    Legend.prototype.performLayout = function (width, height) {
        var _this = this;
        var updateSelection = this.itemSelection.setData(this.data);
        updateSelection.exit.remove();
        var enterSelection = updateSelection.enter.append(markerLabel_1.MarkerLabel);
        var itemSelection = this.itemSelection = updateSelection.merge(enterSelection);
        var itemCount = itemSelection.size;
        var itemPaddingX = this.itemPaddingX;
        var itemPaddingY = this.itemPaddingY;
        // Update properties that affect the size of the legend items and measure them.
        var bboxes = [];
        itemSelection.each(function (markerLabel, datum) {
            // TODO: measure only when one of these properties or data change (in a separate routine)
            markerLabel.markerSize = _this.markerSize;
            markerLabel.labelFontStyle = _this.labelFontStyle;
            markerLabel.labelFontWeight = _this.labelFontWeight;
            markerLabel.labelFontSize = _this.labelFontSize;
            markerLabel.labelFontFamily = _this.labelFontFamily;
            markerLabel.labelText = datum.label.text;
            markerLabel.padding = _this.markerPadding;
            bboxes.push(markerLabel.getBBox());
        });
        var itemHeight = bboxes.length && bboxes[0].height;
        var rowCount = 0;
        var columnWidth = 0;
        var paddedItemsWidth = 0;
        var paddedItemsHeight = 0;
        switch (this.orientation) {
            case Orientation.Horizontal:
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
                    paddedItemsWidth = itemsWidth + (columnCount - 1) * itemPaddingX;
                } while (paddedItemsWidth > width && columnCount > 1);
                paddedItemsHeight = itemHeight * rowCount + (rowCount - 1) * itemPaddingY;
                break;
            case Orientation.Vertical:
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
                    paddedItemsWidth = itemsWidth + (columnCount_1 - 1) * itemPaddingX;
                    paddedItemsHeight = itemsHeight + (rowCount - 1) * itemPaddingY;
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
                x += columnWidth + itemPaddingX;
                y = 0;
                columnWidth = 0;
            }
            else {
                y += bbox.height + itemPaddingY;
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
            this.requestLayout();
        }
    };
    Legend.prototype.update = function () {
        var _this = this;
        this.itemSelection.each(function (markerLabel, datum) {
            var marker = datum.marker;
            markerLabel.markerFill = marker.fill;
            markerLabel.markerStroke = marker.stroke;
            markerLabel.markerStrokeWidth = _this.markerStrokeWidth;
            markerLabel.opacity = datum.enabled ? 1 : 0.5;
            markerLabel.labelColor = _this.labelColor;
        });
    };
    Legend.prototype.datumForPoint = function (x, y) {
        var node = this.group.pickNode(x, y);
        if (node && node.parent) {
            return node.parent.datum;
        }
    };
    return Legend;
}());
exports.Legend = Legend;
