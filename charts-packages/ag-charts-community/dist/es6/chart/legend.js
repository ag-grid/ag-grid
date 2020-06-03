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
import { reactive, Observable } from "../util/observable";
import { getMarker } from "./marker/util";
import { createId } from "../util/id";
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
var Legend = /** @class */ (function (_super) {
    __extends(Legend, _super);
    function Legend() {
        var _this = _super.call(this) || this;
        _this.id = createId(_this);
        _this.group = new Group();
        _this.itemSelection = Selection.select(_this.group).selectAll();
        _this.oldSize = [0, 0];
        _this.data = [];
        _this.enabled = true;
        _this.orientation = LegendOrientation.Vertical;
        _this.position = LegendPosition.Right;
        /**
         * Spacing between the legend and the edge of the chart's element.
         */
        _this.spacing = 20;
        /**
         * The legend uses grid layout for its items, occupying as few columns as possible when positioned to left or right,
         * and as few rows as possible when positioned to top or bottom. This config specifies the amount of horizontal
         * spacing between legend items.
         */
        _this.layoutHorizontalSpacing = 16;
        /**
         * The legend uses grid layout for its items, occupying as few columns as possible when positioned to left or right,
         * and as few rows as possible when positioned to top or bottom. This config specifies the amount of vertical
         * spacing between legend items.
         */
        _this.layoutVerticalSpacing = 8;
        /**
         * Spacing between the marker and the label within each legend item.
         */
        _this.itemSpacing = 8;
        _this.markerSize = 15;
        _this.strokeWidth = 1;
        _this.color = 'black';
        _this.fontSize = 12;
        _this.fontFamily = 'Verdana, sans-serif';
        _this._size = [0, 0];
        _this.addPropertyListener('data', _this.onDataChange);
        _this.addPropertyListener('enabled', _this.onEnabledChange);
        _this.addPropertyListener('position', _this.onPositionChange);
        _this.addPropertyListener('markerShape', _this.onMarkerShapeChange);
        _this.addEventListener('change', _this.update);
        return _this;
    }
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
        var _this = this;
        var _a = this, markerShape = _a.markerShape, layoutHorizontalSpacing = _a.layoutHorizontalSpacing, layoutVerticalSpacing = _a.layoutVerticalSpacing;
        var updateSelection = this.itemSelection.setData(this.data, function (_, datum) {
            var MarkerShape = getMarker(markerShape || datum.marker.shape);
            return datum.id + '-' + datum.itemId + '-' + MarkerShape.name;
        });
        updateSelection.exit.remove();
        var enterSelection = updateSelection.enter.append(MarkerLabel).each(function (node, datum) {
            var MarkerShape = getMarker(markerShape || datum.marker.shape);
            node.marker = new MarkerShape();
        });
        var itemSelection = this.itemSelection = updateSelection.merge(enterSelection);
        var itemCount = itemSelection.size;
        // Update properties that affect the size of the legend items and measure them.
        var bboxes = [];
        itemSelection.each(function (markerLabel, datum) {
            // TODO: measure only when one of these properties or data change (in a separate routine)
            markerLabel.markerSize = _this.markerSize;
            markerLabel.fontStyle = _this.fontStyle;
            markerLabel.fontWeight = _this.fontWeight;
            markerLabel.fontSize = _this.fontSize;
            markerLabel.fontFamily = _this.fontFamily;
            markerLabel.text = datum.label.text;
            markerLabel.spacing = _this.itemSpacing;
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
                    paddedItemsWidth = itemsWidth + (columnCount - 1) * layoutHorizontalSpacing;
                } while (paddedItemsWidth > width && columnCount > 1);
                paddedItemsHeight = itemHeight * rowCount + (rowCount - 1) * layoutVerticalSpacing;
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
                    paddedItemsWidth = itemsWidth + (columnCount_1 - 1) * layoutHorizontalSpacing;
                    paddedItemsHeight = itemsHeight + (rowCount - 1) * layoutVerticalSpacing;
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
                x += columnWidth + layoutHorizontalSpacing;
                y = 0;
                columnWidth = 0;
            }
            else {
                y += bbox.height + layoutVerticalSpacing;
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
            markerLabel.markerStrokeWidth = _this.strokeWidth;
            markerLabel.markerFillOpacity = marker.fillOpacity;
            markerLabel.markerStrokeOpacity = marker.strokeOpacity;
            markerLabel.opacity = datum.enabled ? 1 : 0.5;
            markerLabel.color = _this.color;
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
        reactive('layoutChange')
    ], Legend.prototype, "data", void 0);
    __decorate([
        reactive('layoutChange')
    ], Legend.prototype, "enabled", void 0);
    __decorate([
        reactive('layoutChange')
    ], Legend.prototype, "orientation", void 0);
    __decorate([
        reactive('layoutChange')
    ], Legend.prototype, "position", void 0);
    __decorate([
        reactive('layoutChange')
    ], Legend.prototype, "spacing", void 0);
    __decorate([
        reactive('layoutChange')
    ], Legend.prototype, "layoutHorizontalSpacing", void 0);
    __decorate([
        reactive('layoutChange')
    ], Legend.prototype, "layoutVerticalSpacing", void 0);
    __decorate([
        reactive('layoutChange')
    ], Legend.prototype, "itemSpacing", void 0);
    __decorate([
        reactive('layoutChange')
    ], Legend.prototype, "markerShape", void 0);
    __decorate([
        reactive('layoutChange')
    ], Legend.prototype, "markerSize", void 0);
    __decorate([
        reactive('change')
    ], Legend.prototype, "strokeWidth", void 0);
    __decorate([
        reactive('change')
    ], Legend.prototype, "color", void 0);
    __decorate([
        reactive('layoutChange')
    ], Legend.prototype, "fontStyle", void 0);
    __decorate([
        reactive('layoutChange')
    ], Legend.prototype, "fontWeight", void 0);
    __decorate([
        reactive('layoutChange')
    ], Legend.prototype, "fontSize", void 0);
    __decorate([
        reactive('layoutChange')
    ], Legend.prototype, "fontFamily", void 0);
    return Legend;
}(Observable));
export { Legend };
