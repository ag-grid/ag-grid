"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const group_1 = require("../../scene/group");
const observable_1 = require("../../util/observable");
const chartAxis_1 = require("../chartAxis");
const id_1 = require("../../util/id");
const label_1 = require("../label");
const value_1 = require("../../util/value");
const timeAxis_1 = require("../axis/timeAxis");
const validation_1 = require("../../util/validation");
class SeriesItemHighlightStyle {
    constructor() {
        this.fill = 'yellow';
        this.stroke = undefined;
        this.strokeWidth = undefined;
    }
}
exports.SeriesItemHighlightStyle = SeriesItemHighlightStyle;
class SeriesHighlightStyle {
    constructor() {
        this.strokeWidth = undefined;
        this.dimOpacity = undefined;
    }
}
exports.SeriesHighlightStyle = SeriesHighlightStyle;
class HighlightStyle {
    constructor() {
        /**
         * @deprecated Use item.fill instead.
         */
        this.fill = undefined;
        /**
         * @deprecated Use item.stroke instead.
         */
        this.stroke = undefined;
        /**
         * @deprecated Use item.strokeWidth instead.
         */
        this.strokeWidth = undefined;
        this.item = new SeriesItemHighlightStyle();
        this.series = new SeriesHighlightStyle();
    }
}
__decorate([
    validation_1.Deprecated('Use item.fill instead.')
], HighlightStyle.prototype, "fill", void 0);
__decorate([
    validation_1.Deprecated('Use item.stroke instead.')
], HighlightStyle.prototype, "stroke", void 0);
__decorate([
    validation_1.Deprecated('Use item.strokeWidth instead.')
], HighlightStyle.prototype, "strokeWidth", void 0);
exports.HighlightStyle = HighlightStyle;
class SeriesTooltip {
    constructor() {
        this.enabled = true;
    }
}
exports.SeriesTooltip = SeriesTooltip;
class Series extends observable_1.Observable {
    constructor({ seriesGroupUsesLayer = true } = {}) {
        super();
        this.id = id_1.createId(this);
        // The group node that contains all the nodes used to render this series.
        this.group = new group_1.Group();
        this.directions = [chartAxis_1.ChartAxisDirection.X, chartAxis_1.ChartAxisDirection.Y];
        this.directionKeys = {};
        // Flag to determine if we should recalculate node data.
        this.nodeDataRefresh = true;
        this.label = new label_1.Label();
        this._data = undefined;
        this._visible = true;
        this.showInLegend = true;
        this.cursor = 'default';
        this.highlightStyle = new HighlightStyle();
        const { group } = this;
        this.seriesGroup = group.appendChild(new group_1.Group({
            name: `${this.id}-series`,
            layer: seriesGroupUsesLayer,
            zIndex: Series.SERIES_LAYER_ZINDEX,
        }));
        this.pickGroup = this.seriesGroup.appendChild(new group_1.Group());
        this.highlightGroup = group.appendChild(new group_1.Group({
            name: `${this.id}-highlight`,
            layer: true,
            zIndex: Series.SERIES_HIGHLIGHT_LAYER_ZINDEX,
            optimiseDirtyTracking: true,
        }));
    }
    get type() {
        return this.constructor.type || '';
    }
    set data(input) {
        this._data = input;
        this.nodeDataRefresh = true;
    }
    get data() {
        return this._data;
    }
    set visible(value) {
        this._visible = value;
        this.visibleChanged();
    }
    get visible() {
        return this._visible;
    }
    set grouped(g) {
        if (g === true) {
            throw new Error(`AG Charts - grouped: true is unsupported for series of type: ${this.type}`);
        }
    }
    setColors(_fills, _strokes) {
        // Override point for subclasses.
    }
    // Returns the actual keys used (to fetch the values from `data` items) for the given direction.
    getKeys(direction) {
        const { directionKeys } = this;
        const keys = directionKeys && directionKeys[direction];
        const values = [];
        if (keys) {
            keys.forEach((key) => {
                const value = this[key];
                if (value) {
                    if (Array.isArray(value)) {
                        values.push(...value);
                    }
                    else {
                        values.push(value);
                    }
                }
            });
        }
        return values;
    }
    // Indicate that something external changed and we should recalculate nodeData.
    markNodeDataDirty() {
        this.nodeDataRefresh = true;
    }
    visibleChanged() {
        // Override point for this.visible change post-processing.
    }
    getOpacity(datum) {
        const { highlightStyle: { series: { dimOpacity = 1 }, }, } = this;
        const defaultOpacity = 1;
        if (dimOpacity === defaultOpacity) {
            return defaultOpacity;
        }
        switch (this.isItemIdHighlighted(datum)) {
            case 'no-highlight':
            case 'highlighted':
                return defaultOpacity;
            case 'other-highlighted':
                return dimOpacity;
        }
    }
    getStrokeWidth(defaultStrokeWidth, datum) {
        const { highlightStyle: { series: { strokeWidth }, }, } = this;
        if (strokeWidth === undefined) {
            // No change in styling for highlight cases.
            return defaultStrokeWidth;
        }
        switch (this.isItemIdHighlighted(datum)) {
            case 'highlighted':
                return strokeWidth;
            case 'no-highlight':
            case 'other-highlighted':
                return defaultStrokeWidth;
        }
    }
    getZIndex(datum) {
        const defaultZIndex = Series.SERIES_LAYER_ZINDEX;
        switch (this.isItemIdHighlighted(datum)) {
            case 'highlighted':
                return Series.SERIES_HIGHLIGHT_LAYER_ZINDEX - 2;
            case 'no-highlight':
            case 'other-highlighted':
                return defaultZIndex;
        }
    }
    isItemIdHighlighted(datum) {
        const { chart: { highlightedDatum: { series = undefined, itemId = undefined } = {}, highlightedDatum = undefined, } = {}, } = this;
        const highlighting = series != null;
        if (!highlighting) {
            // Highlighting not active.
            return 'no-highlight';
        }
        if (series !== this) {
            // Highlighting active, this series not highlighted.
            return 'other-highlighted';
        }
        if (itemId === undefined) {
            // Series doesn't use itemIds - so no further refinement needed, series is highlighted.
            return 'highlighted';
        }
        if (datum && highlightedDatum !== datum && itemId !== datum.itemId) {
            // Highlighting active, this series item not highlighted.
            return 'other-highlighted';
        }
        return 'highlighted';
    }
    pickNode(x, y) {
        return this.pickGroup.pickNode(x, y);
    }
    fireNodeClickEvent(_event, _datum) {
        // Override point for subclasses.
    }
    toggleSeriesItem(_itemId, enabled) {
        this.visible = enabled;
        this.nodeDataRefresh = true;
    }
    fixNumericExtent(extent, axis) {
        if (!extent) {
            return [0, 1];
        }
        let [min, max] = extent;
        min = +min;
        max = +max;
        if (min === 0 && max === 0) {
            // domain has zero length and the single valid value is 0. Use the default of [0, 1].
            return [0, 1];
        }
        if (min === max) {
            // domain has zero length, there is only a single valid value in data
            if (axis instanceof timeAxis_1.TimeAxis) {
                // numbers in domain correspond to Unix timestamps
                // automatically expand domain by 1 in each direction
                min -= 1;
                max += 1;
            }
            else {
                const padding = Math.abs(min * 0.01);
                min -= padding;
                max += padding;
            }
        }
        if (!(value_1.isNumber(min) && value_1.isNumber(max))) {
            return [0, 1];
        }
        return [min, max];
    }
}
exports.Series = Series;
Series.highlightedZIndex = 1000000000000;
Series.SERIES_LAYER_ZINDEX = 100;
Series.SERIES_MARKER_LAYER_ZINDEX = 110;
Series.SERIES_HIGHLIGHT_LAYER_ZINDEX = 150;
//# sourceMappingURL=series.js.map