var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Group } from '../../scene/group';
import { Observable } from '../../util/observable';
import { ChartAxisDirection } from '../chartAxis';
import { createId } from '../../util/id';
import { isNumber } from '../../util/value';
import { TimeAxis } from '../axis/timeAxis';
import { createDeprecationWarning } from '../../util/deprecation';
import { BOOLEAN, OPT_BOOLEAN, OPT_NUMBER, OPT_COLOR_STRING, STRING, Validate } from '../../util/validation';
import { Layers } from '../layers';
/** Modes of matching user interactions to rendered nodes (e.g. hover or click) */
export var SeriesNodePickMode;
(function (SeriesNodePickMode) {
    /** Pick matches based upon pick coordinates being inside a matching shape/marker. */
    SeriesNodePickMode[SeriesNodePickMode["EXACT_SHAPE_MATCH"] = 0] = "EXACT_SHAPE_MATCH";
    /** Pick matches by nearest category/X-axis value, then distance within that category/X-value. */
    SeriesNodePickMode[SeriesNodePickMode["NEAREST_BY_MAIN_AXIS_FIRST"] = 1] = "NEAREST_BY_MAIN_AXIS_FIRST";
    /** Pick matches by nearest category value, then distance within that category. */
    SeriesNodePickMode[SeriesNodePickMode["NEAREST_BY_MAIN_CATEGORY_AXIS_FIRST"] = 2] = "NEAREST_BY_MAIN_CATEGORY_AXIS_FIRST";
    /** Pick matches based upon distance to ideal position */
    SeriesNodePickMode[SeriesNodePickMode["NEAREST_NODE"] = 3] = "NEAREST_NODE";
})(SeriesNodePickMode || (SeriesNodePickMode = {}));
const warnDeprecated = createDeprecationWarning();
const warnSeriesDeprecated = () => warnDeprecated('series', 'Use seriesId to get the series ID');
export class SeriesNodeClickEvent {
    constructor(nativeEvent, datum, series) {
        this.type = 'nodeClick';
        this.event = nativeEvent;
        this.datum = datum.datum;
        this.seriesId = series.id;
        this._series = series;
    }
    /** @deprecated */
    get series() {
        warnSeriesDeprecated();
        return this._series;
    }
}
class SeriesItemHighlightStyle {
    constructor() {
        this.fill = 'yellow';
        this.fillOpacity = undefined;
        this.stroke = undefined;
        this.strokeWidth = undefined;
    }
}
__decorate([
    Validate(OPT_COLOR_STRING)
], SeriesItemHighlightStyle.prototype, "fill", void 0);
__decorate([
    Validate(OPT_NUMBER(0, 1))
], SeriesItemHighlightStyle.prototype, "fillOpacity", void 0);
__decorate([
    Validate(OPT_COLOR_STRING)
], SeriesItemHighlightStyle.prototype, "stroke", void 0);
__decorate([
    Validate(OPT_NUMBER(0))
], SeriesItemHighlightStyle.prototype, "strokeWidth", void 0);
class SeriesHighlightStyle {
    constructor() {
        this.strokeWidth = undefined;
        this.dimOpacity = undefined;
        this.enabled = undefined;
    }
}
__decorate([
    Validate(OPT_NUMBER(0))
], SeriesHighlightStyle.prototype, "strokeWidth", void 0);
__decorate([
    Validate(OPT_NUMBER(0, 1))
], SeriesHighlightStyle.prototype, "dimOpacity", void 0);
__decorate([
    Validate(OPT_BOOLEAN)
], SeriesHighlightStyle.prototype, "enabled", void 0);
class TextHighlightStyle {
    constructor() {
        this.color = 'black';
    }
}
__decorate([
    Validate(OPT_COLOR_STRING)
], TextHighlightStyle.prototype, "color", void 0);
export class HighlightStyle {
    constructor() {
        this.item = new SeriesItemHighlightStyle();
        this.series = new SeriesHighlightStyle();
        this.text = new TextHighlightStyle();
    }
}
export class SeriesTooltip {
    constructor() {
        this.enabled = true;
    }
}
__decorate([
    Validate(BOOLEAN)
], SeriesTooltip.prototype, "enabled", void 0);
export class Series extends Observable {
    constructor({ useSeriesGroupLayer = true, useLabelLayer = false, pickModes = [SeriesNodePickMode.NEAREST_BY_MAIN_AXIS_FIRST], } = {}) {
        super();
        this.id = createId(this);
        // The group node that contains all the nodes used to render this series.
        this.rootGroup = new Group({ name: 'seriesRoot' });
        this.directions = [ChartAxisDirection.X, ChartAxisDirection.Y];
        this.directionKeys = {};
        // Flag to determine if we should recalculate node data.
        this.nodeDataRefresh = true;
        this._data = undefined;
        this._visible = true;
        this.showInLegend = true;
        this.cursor = 'default';
        this.highlightStyle = new HighlightStyle();
        const { rootGroup } = this;
        this.contentGroup = rootGroup.appendChild(new Group({
            name: `${this.id}-content`,
            layer: useSeriesGroupLayer,
            zIndex: Layers.SERIES_LAYER_ZINDEX,
        }));
        this.highlightGroup = rootGroup.appendChild(new Group({
            name: `${this.id}-highlight`,
            layer: true,
            zIndex: Layers.SERIES_LAYER_ZINDEX,
            zIndexSubOrder: [this.id, 15000],
        }));
        this.highlightNode = this.highlightGroup.appendChild(new Group({ name: 'highlightNode' }));
        this.highlightLabel = this.highlightGroup.appendChild(new Group({ name: 'highlightLabel' }));
        this.highlightNode.zIndex = 0;
        this.highlightLabel.zIndex = 10;
        this.pickModes = pickModes;
        if (useLabelLayer) {
            this.labelGroup = rootGroup.appendChild(new Group({
                name: `${this.id}-series-labels`,
                layer: true,
                zIndex: Layers.SERIES_LABEL_ZINDEX,
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
        var _a;
        const highlightedDatum = (_a = this.highlightManager) === null || _a === void 0 ? void 0 : _a.getActiveHighlight();
        const { series, itemId } = highlightedDatum !== null && highlightedDatum !== void 0 ? highlightedDatum : {};
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
        const { pickModes, visible, rootGroup } = this;
        if (!visible || !rootGroup.visible) {
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
        const match = this.contentGroup.pickNode(point.x, point.y);
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
    fireNodeClickEvent(event, _datum) {
        const eventObject = this.getNodeClickEvent(event, _datum);
        this.fireEvent(eventObject);
    }
    getNodeClickEvent(event, datum) {
        return new SeriesNodeClickEvent(event, datum, this);
    }
    toggleSeriesItem(_itemId, enabled) {
        this.visible = enabled;
        this.nodeDataRefresh = true;
    }
    isEnabled() {
        return this.visible;
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
            if (axis instanceof TimeAxis) {
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
        if (!(isNumber(min) && isNumber(max))) {
            return [];
        }
        return [min, max];
    }
}
Series.highlightedZIndex = 1000000000000;
__decorate([
    Validate(STRING)
], Series.prototype, "id", void 0);
__decorate([
    Validate(BOOLEAN)
], Series.prototype, "_visible", void 0);
__decorate([
    Validate(BOOLEAN)
], Series.prototype, "showInLegend", void 0);
__decorate([
    Validate(STRING)
], Series.prototype, "cursor", void 0);
