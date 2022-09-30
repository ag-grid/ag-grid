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
const value_1 = require("../../util/value");
const timeAxis_1 = require("../axis/timeAxis");
const validation_1 = require("../../util/validation");
const layers_1 = require("../layers");
/** Modes of matching user interactions to rendered nodes (e.g. hover or click) */
var SeriesNodePickMode;
(function (SeriesNodePickMode) {
    /** Pick matches based upon pick coordinates being inside a matching shape/marker. */
    SeriesNodePickMode[SeriesNodePickMode["EXACT_SHAPE_MATCH"] = 0] = "EXACT_SHAPE_MATCH";
    /** Pick matches by nearest category/X-axis value, then distance within that category/X-value. */
    SeriesNodePickMode[SeriesNodePickMode["NEAREST_BY_MAIN_AXIS_FIRST"] = 1] = "NEAREST_BY_MAIN_AXIS_FIRST";
    /** Pick matches by nearest category value, then distance within that category. */
    SeriesNodePickMode[SeriesNodePickMode["NEAREST_BY_MAIN_CATEGORY_AXIS_FIRST"] = 2] = "NEAREST_BY_MAIN_CATEGORY_AXIS_FIRST";
    /** Pick matches based upon distance to ideal position */
    SeriesNodePickMode[SeriesNodePickMode["NEAREST_NODE"] = 3] = "NEAREST_NODE";
})(SeriesNodePickMode = exports.SeriesNodePickMode || (exports.SeriesNodePickMode = {}));
class SeriesItemHighlightStyle {
    constructor() {
        this.fill = 'yellow';
        this.fillOpacity = undefined;
        this.stroke = undefined;
        this.strokeWidth = undefined;
    }
}
__decorate([
    validation_1.Validate(validation_1.OPT_COLOR_STRING)
], SeriesItemHighlightStyle.prototype, "fill", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_NUMBER(0, 1))
], SeriesItemHighlightStyle.prototype, "fillOpacity", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_COLOR_STRING)
], SeriesItemHighlightStyle.prototype, "stroke", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_NUMBER(0))
], SeriesItemHighlightStyle.prototype, "strokeWidth", void 0);
exports.SeriesItemHighlightStyle = SeriesItemHighlightStyle;
class SeriesHighlightStyle {
    constructor() {
        this.strokeWidth = undefined;
        this.dimOpacity = undefined;
        this.enabled = undefined;
    }
}
__decorate([
    validation_1.Validate(validation_1.OPT_NUMBER(0))
], SeriesHighlightStyle.prototype, "strokeWidth", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_NUMBER(0, 1))
], SeriesHighlightStyle.prototype, "dimOpacity", void 0);
__decorate([
    validation_1.Validate(validation_1.OPT_BOOLEAN)
], SeriesHighlightStyle.prototype, "enabled", void 0);
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
__decorate([
    validation_1.Validate(validation_1.BOOLEAN)
], SeriesTooltip.prototype, "enabled", void 0);
exports.SeriesTooltip = SeriesTooltip;
class Series extends observable_1.Observable {
    constructor({ useSeriesGroupLayer = true, useLabelLayer = false, pickModes = [SeriesNodePickMode.NEAREST_BY_MAIN_AXIS_FIRST], } = {}) {
        super();
        this.id = id_1.createId(this);
        // The group node that contains all the nodes used to render this series.
        this.group = new group_1.Group();
        this.directions = [chartAxis_1.ChartAxisDirection.X, chartAxis_1.ChartAxisDirection.Y];
        this.directionKeys = {};
        // Flag to determine if we should recalculate node data.
        this.nodeDataRefresh = true;
        this._data = undefined;
        this._visible = true;
        this.showInLegend = true;
        this.cursor = 'default';
        this.highlightStyle = new HighlightStyle();
        const { group } = this;
        this.backgroundGroup = group.appendChild(new group_1.Group({
            name: `${this.id}-background`,
            layer: useSeriesGroupLayer,
            zIndex: layers_1.Layers.SERIES_BACKGROUND_ZINDEX,
        }));
        this.seriesGroup = group.appendChild(new group_1.Group({
            name: `${this.id}-series`,
            layer: useSeriesGroupLayer,
            zIndex: layers_1.Layers.SERIES_LAYER_ZINDEX,
        }));
        this.pickGroup = this.seriesGroup.appendChild(new group_1.Group());
        this.highlightGroup = group.appendChild(new group_1.Group({
            name: `${this.id}-highlight`,
            layer: true,
            zIndex: layers_1.Layers.SERIES_LAYER_ZINDEX,
            zIndexSubOrder: [this.id, 15000],
            optimiseDirtyTracking: true,
        }));
        this.highlightNode = this.highlightGroup.appendChild(new group_1.Group());
        this.highlightLabel = this.highlightGroup.appendChild(new group_1.Group());
        this.highlightNode.zIndex = 0;
        this.highlightLabel.zIndex = 10;
        this.pickModes = pickModes;
        if (useLabelLayer) {
            this.labelGroup = group.appendChild(new group_1.Group({
                name: `${this.id}-series-labels`,
                layer: true,
                zIndex: layers_1.Layers.SERIES_LABEL_ZINDEX,
            }));
        }
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
    destroy() {
        // Override point for sub-classes.
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
        const { highlightStyle: { series: { dimOpacity = 1, enabled = true }, }, } = this;
        const defaultOpacity = 1;
        if (enabled === false || dimOpacity === defaultOpacity) {
            return defaultOpacity;
        }
        switch (this.isItemIdHighlighted(datum)) {
            case 'no-highlight':
            case 'highlighted':
                return defaultOpacity;
            case 'peer-highlighted':
            case 'other-highlighted':
                return dimOpacity;
        }
    }
    getStrokeWidth(defaultStrokeWidth, datum) {
        const { highlightStyle: { series: { strokeWidth, enabled = true }, }, } = this;
        if (enabled === false || strokeWidth === undefined) {
            // No change in styling for highlight cases.
            return defaultStrokeWidth;
        }
        switch (this.isItemIdHighlighted(datum)) {
            case 'highlighted':
                return strokeWidth;
            case 'no-highlight':
            case 'other-highlighted':
            case 'peer-highlighted':
                return defaultStrokeWidth;
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
            // A peer (in same Series instance) sub-series has highlight active, but this sub-series
            // does not.
            return 'peer-highlighted';
        }
        return 'highlighted';
    }
    pickNode(point, limitPickModes) {
        const { pickModes, visible, group } = this;
        if (!visible || !group.visible) {
            return;
        }
        for (const pickMode of pickModes) {
            if (limitPickModes && !limitPickModes.includes(pickMode)) {
                continue;
            }
            let match = undefined;
            switch (pickMode) {
                case SeriesNodePickMode.EXACT_SHAPE_MATCH:
                    match = this.pickNodeExactShape(point);
                    break;
                case SeriesNodePickMode.NEAREST_BY_MAIN_AXIS_FIRST:
                case SeriesNodePickMode.NEAREST_BY_MAIN_CATEGORY_AXIS_FIRST:
                    match = this.pickNodeMainAxisFirst(point, pickMode === SeriesNodePickMode.NEAREST_BY_MAIN_CATEGORY_AXIS_FIRST);
                    break;
                case SeriesNodePickMode.NEAREST_NODE:
                    match = this.pickNodeClosestDatum(point);
                    break;
            }
            if (match) {
                return { pickMode, match: match.datum, distance: match.distance };
            }
        }
    }
    pickNodeExactShape(point) {
        const match = this.pickGroup.pickNode(point.x, point.y);
        if (match) {
            return {
                datum: match.datum,
                distance: 0,
            };
        }
    }
    pickNodeClosestDatum(_point) {
        // Override point for sub-classes - but if this is invoked, the sub-class specified it wants
        // to use this feature.
        throw new Error('AG Charts - Series.pickNodeClosestDatum() not implemented');
    }
    pickNodeMainAxisFirst(_point, _requireCategoryAxis) {
        // Override point for sub-classes - but if this is invoked, the sub-class specified it wants
        // to use this feature.
        throw new Error('AG Charts - Series.pickNodeMainAxisFirst() not implemented');
    }
    fireNodeClickEvent(_event, _datum) {
        // Override point for subclasses.
    }
    toggleSeriesItem(_itemId, enabled) {
        this.visible = enabled;
        this.nodeDataRefresh = true;
    }
    fixNumericExtent(extent, axis) {
        if (extent === undefined) {
            // Don't return a range, there is no range.
            return [];
        }
        let [min, max] = extent;
        min = +min;
        max = +max;
        if (min === 0 && max === 0) {
            // domain has zero length and the single valid value is 0. Use the default of [0, 1].
            return [0, 1];
        }
        if (min === Infinity && max === -Infinity) {
            // There's no data in the domain.
            return [];
        }
        if (min === Infinity) {
            min = 0;
        }
        if (max === -Infinity) {
            max = 0;
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
            return [];
        }
        return [min, max];
    }
}
Series.highlightedZIndex = 1000000000000;
__decorate([
    validation_1.Validate(validation_1.BOOLEAN)
], Series.prototype, "_visible", void 0);
__decorate([
    validation_1.Validate(validation_1.BOOLEAN)
], Series.prototype, "showInLegend", void 0);
__decorate([
    validation_1.Validate(validation_1.STRING)
], Series.prototype, "cursor", void 0);
exports.Series = Series;
