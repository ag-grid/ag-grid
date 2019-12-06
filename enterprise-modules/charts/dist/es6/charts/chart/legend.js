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
import { Group } from "../scene/group";
import { Selection } from "../scene/selection";
import { MarkerLabel } from "./markerLabel";
import { Square } from "./marker/square";
import { reactive, Observable } from "../util/observable";
export var Orientation;
(function (Orientation) {
    Orientation[Orientation["Vertical"] = 0] = "Vertical";
    Orientation[Orientation["Horizontal"] = 1] = "Horizontal";
})(Orientation || (Orientation = {}));
var Legend = /** @class */ (function (_super) {
    __extends(Legend, _super);
    function Legend() {
        var _this = _super.call(this) || this;
        _this.group = new Group();
        _this.itemSelection = Selection.select(_this.group).selectAll();
        _this.oldSize = [0, 0];
        _this.data = [];
        _this.enabled = true;
        _this.orientation = Orientation.Vertical;
        _this.position = 'right';
        _this.padding = 20;
        _this.itemPaddingX = 16;
        _this.itemPaddingY = 8;
        _this.markerPadding = MarkerLabel.defaults.padding;
        _this.markerSize = MarkerLabel.defaults.markerSize;
        _this.markerStrokeWidth = 1;
        _this.labelColor = MarkerLabel.defaults.labelColor;
        _this.labelFontStyle = MarkerLabel.defaults.labelFontStyle;
        _this.labelFontWeight = MarkerLabel.defaults.labelFontWeight;
        _this.labelFontSize = MarkerLabel.defaults.labelFontSize;
        _this.labelFontFamily = MarkerLabel.defaults.labelFontFamily;
        _this._size = [0, 0];
        _this.addPropertyListener('data', function (event) {
            var legend = event.source, data = event.value;
            legend.group.visible = legend.enabled && data.length > 0;
        });
        _this.addPropertyListener('enabled', function (event) {
            var legend = event.source, value = event.value;
            legend.group.visible = value && legend.data.length > 0;
        });
        _this.addPropertyListener('position', function (event) {
            var legend = event.source, position = event.value;
            switch (position) {
                case 'right':
                case 'left':
                    legend.orientation = Orientation.Vertical;
                    break;
                case 'bottom':
                case 'top':
                    legend.orientation = Orientation.Horizontal;
                    break;
            }
        });
        _this.addEventListener('change', function () { return _this.update(); });
        return _this;
    }
    Object.defineProperty(Legend.prototype, "size", {
        get: function () {
            return this._size;
        },
        enumerable: true,
        configurable: true
    });
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
        var markerType = this.markerType;
        var updateSelection = this.itemSelection.setData(this.data, function (_, datum) {
            var itemMarkerType = markerType || datum.marker.type;
            var itemMarkerName = itemMarkerType ? itemMarkerType.name : 'Square';
            return datum.id + '-' + datum.itemId + '-' + itemMarkerName;
        });
        updateSelection.exit.remove();
        var enterSelection = updateSelection.enter.append(MarkerLabel).each(function (node, datum) {
            var Marker = markerType || datum.marker.type || Square;
            node.marker = new Marker();
        });
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
            bboxes.push(markerLabel.computeBBox());
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
        }
    };
    Legend.prototype.update = function () {
        var _this = this;
        this.itemSelection.each(function (markerLabel, datum) {
            var marker = datum.marker;
            markerLabel.markerFill = marker.fill;
            markerLabel.markerStroke = marker.stroke;
            markerLabel.markerStrokeWidth = _this.markerStrokeWidth;
            markerLabel.markerFillOpacity = marker.fillOpacity;
            markerLabel.markerStrokeOpacity = marker.strokeOpacity;
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
    __decorate([
        reactive(['layoutChange'])
    ], Legend.prototype, "data", void 0);
    __decorate([
        reactive(['layoutChange'])
    ], Legend.prototype, "enabled", void 0);
    __decorate([
        reactive(['layoutChange'])
    ], Legend.prototype, "orientation", void 0);
    __decorate([
        reactive(['layoutChange'])
    ], Legend.prototype, "position", void 0);
    __decorate([
        reactive(['layoutChange'])
    ], Legend.prototype, "padding", void 0);
    __decorate([
        reactive(['layoutChange'])
    ], Legend.prototype, "itemPaddingX", void 0);
    __decorate([
        reactive(['layoutChange'])
    ], Legend.prototype, "itemPaddingY", void 0);
    __decorate([
        reactive(['layoutChange'])
    ], Legend.prototype, "markerType", void 0);
    __decorate([
        reactive(['layoutChange'])
    ], Legend.prototype, "markerPadding", void 0);
    __decorate([
        reactive(['layoutChange'])
    ], Legend.prototype, "markerSize", void 0);
    __decorate([
        reactive(['change'])
    ], Legend.prototype, "markerStrokeWidth", void 0);
    __decorate([
        reactive(['change'])
    ], Legend.prototype, "labelColor", void 0);
    __decorate([
        reactive(['layoutChange'])
    ], Legend.prototype, "labelFontStyle", void 0);
    __decorate([
        reactive(['layoutChange'])
    ], Legend.prototype, "labelFontWeight", void 0);
    __decorate([
        reactive(['layoutChange'])
    ], Legend.prototype, "labelFontSize", void 0);
    __decorate([
        reactive(['layoutChange'])
    ], Legend.prototype, "labelFontFamily", void 0);
    return Legend;
}(Observable));
export { Legend };
