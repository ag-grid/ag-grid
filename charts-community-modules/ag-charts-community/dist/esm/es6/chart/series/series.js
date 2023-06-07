var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { Group } from '../../scene/group';
import { Observable } from '../../util/observable';
import { createId } from '../../util/id';
import { checkDatum } from '../../util/value';
import { BOOLEAN, OPT_BOOLEAN, OPT_NUMBER, OPT_COLOR_STRING, INTERACTION_RANGE, STRING, Validate, } from '../../util/validation';
import { Layers } from '../layers';
import { ChartAxisDirection } from '../chartAxisDirection';
import { fixNumericExtent } from '../data/dataModel';
import { TooltipPosition } from '../tooltip/tooltip';
import { accumulatedValue, trailingAccumulatedValue } from '../data/aggregateFunctions';
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
export function keyProperty(propName, continuous, opts = {}) {
    const result = Object.assign({ property: propName, type: 'key', valueType: continuous ? 'range' : 'category', validation: (v) => checkDatum(v, continuous) != null }, opts);
    return result;
}
export function valueProperty(propName, continuous, opts = {}) {
    const result = Object.assign({ property: propName, type: 'value', valueType: continuous ? 'range' : 'category', validation: (v) => checkDatum(v, continuous) != null }, opts);
    return result;
}
export function rangedValueProperty(propName, opts = {}) {
    const { min = -Infinity, max = Infinity } = opts, defOpts = __rest(opts, ["min", "max"]);
    return Object.assign({ type: 'value', property: propName, valueType: 'range', validation: (v) => checkDatum(v, true) != null, processor: () => (datum) => {
            if (typeof datum !== 'number')
                return datum;
            if (isNaN(datum))
                return datum;
            return Math.min(Math.max(datum, min), max);
        } }, defOpts);
}
export function accumulativeValueProperty(propName, continuous, opts = {}) {
    const result = Object.assign(Object.assign({}, valueProperty(propName, continuous, opts)), { processor: accumulatedValue() });
    return result;
}
export function trailingAccumulatedValueProperty(propName, continuous, opts = {}) {
    const result = Object.assign(Object.assign({}, valueProperty(propName, continuous, opts)), { processor: trailingAccumulatedValue() });
    return result;
}
export class SeriesNodeBaseClickEvent {
    constructor(nativeEvent, datum, series) {
        this.type = 'nodeClick';
        this.event = nativeEvent;
        this.datum = datum.datum;
        this.seriesId = series.id;
    }
}
export class SeriesNodeClickEvent extends SeriesNodeBaseClickEvent {
}
export class SeriesNodeDoubleClickEvent extends SeriesNodeBaseClickEvent {
    constructor() {
        super(...arguments);
        this.type = 'nodeDoubleClick';
    }
}
export class SeriesItemHighlightStyle {
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
        this.showArrow = undefined;
        this.interaction = new SeriesTooltipInteraction();
        this.position = new TooltipPosition();
    }
}
__decorate([
    Validate(BOOLEAN)
], SeriesTooltip.prototype, "enabled", void 0);
__decorate([
    Validate(OPT_BOOLEAN)
], SeriesTooltip.prototype, "showArrow", void 0);
export class SeriesTooltipInteraction {
    constructor() {
        this.enabled = false;
    }
}
__decorate([
    Validate(BOOLEAN)
], SeriesTooltipInteraction.prototype, "enabled", void 0);
export class Series extends Observable {
    constructor(opts) {
        super();
        this.id = createId(this);
        // The group node that contains all the nodes used to render this series.
        this.rootGroup = new Group({ name: 'seriesRoot' });
        this.directions = [ChartAxisDirection.X, ChartAxisDirection.Y];
        // Flag to determine if we should recalculate node data.
        this.nodeDataRefresh = true;
        this._data = undefined;
        this._visible = true;
        this.showInLegend = true;
        this.cursor = 'default';
        this.nodeClickRange = 'exact';
        this._declarationOrder = -1;
        this.highlightStyle = new HighlightStyle();
        this.ctx = opts.moduleCtx;
        const { useSeriesGroupLayer = true, useLabelLayer = false, pickModes = [SeriesNodePickMode.NEAREST_BY_MAIN_AXIS_FIRST], directionKeys = {}, directionNames = {}, } = opts;
        const { rootGroup } = this;
        this.directionKeys = directionKeys;
        this.directionNames = directionNames;
        this.contentGroup = rootGroup.appendChild(new Group({
            name: `${this.id}-content`,
            layer: useSeriesGroupLayer,
            zIndex: Layers.SERIES_LAYER_ZINDEX,
            zIndexSubOrder: [() => this._declarationOrder, 0],
        }));
        this.highlightGroup = rootGroup.appendChild(new Group({
            name: `${this.id}-highlight`,
            layer: true,
            zIndex: Layers.SERIES_LAYER_ZINDEX,
            zIndexSubOrder: [() => this._declarationOrder, 15000],
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
        var _a;
        return (_a = this.constructor.type) !== null && _a !== void 0 ? _a : '';
    }
    set data(input) {
        this._data = input;
        this.nodeDataRefresh = true;
    }
    get data() {
        return this._data;
    }
    hasData() {
        const { data } = this;
        return data && (!Array.isArray(data) || data.length > 0);
    }
    set visible(value) {
        this._visible = value;
        this.visibleChanged();
    }
    get visible() {
        return this._visible;
    }
    getBandScalePadding() {
        return { inner: 1, outer: 0 };
    }
    addChartEventListeners() {
        return;
    }
    destroy() {
        // Override point for sub-classes.
    }
    getDirectionValues(direction, properties) {
        const resolvedDirection = this.resolveKeyDirection(direction);
        const keys = properties === null || properties === void 0 ? void 0 : properties[resolvedDirection];
        const values = [];
        const flatten = (...array) => {
            for (const value of array) {
                addValue(value);
            }
        };
        const addValue = (value) => {
            if (Array.isArray(value)) {
                flatten(...value);
            }
            else if (typeof value === 'object') {
                flatten(Object.values(value));
            }
            else {
                values.push(value);
            }
        };
        if (!keys)
            return values;
        keys.forEach((key) => {
            const value = this[key];
            addValue(value);
        });
        return values;
    }
    getKeys(direction) {
        return this.getDirectionValues(direction, this.directionKeys);
    }
    getNames(direction) {
        return this.getDirectionValues(direction, this.directionNames);
    }
    resolveKeyDirection(direction) {
        return direction;
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
    fireNodeDoubleClickEvent(event, _datum) {
        const eventObject = this.getNodeDoubleClickEvent(event, _datum);
        this.fireEvent(eventObject);
    }
    getNodeClickEvent(event, datum) {
        return new SeriesNodeClickEvent(event, datum, this);
    }
    getNodeDoubleClickEvent(event, datum) {
        return new SeriesNodeDoubleClickEvent(event, datum, this);
    }
    toggleSeriesItem(_itemId, enabled) {
        this.visible = enabled;
        this.nodeDataRefresh = true;
    }
    isEnabled() {
        return this.visible;
    }
    fixNumericExtent(extent, axis) {
        var _a;
        const fixedExtent = fixNumericExtent(extent);
        if (fixedExtent.length === 0) {
            return fixedExtent;
        }
        let [min, max] = fixedExtent;
        if (min === max) {
            // domain has zero length, there is only a single valid value in data
            const padding = (_a = axis === null || axis === void 0 ? void 0 : axis.calculatePadding(min, max)) !== null && _a !== void 0 ? _a : 1;
            min -= padding;
            max += padding;
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
__decorate([
    Validate(INTERACTION_RANGE)
], Series.prototype, "nodeClickRange", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VyaWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L3Nlcmllcy9zZXJpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFMUMsT0FBTyxFQUFFLFVBQVUsRUFBYyxNQUFNLHVCQUF1QixDQUFDO0FBRS9ELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDekMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQzlDLE9BQU8sRUFDSCxPQUFPLEVBQ1AsV0FBVyxFQUNYLFVBQVUsRUFDVixnQkFBZ0IsRUFDaEIsaUJBQWlCLEVBQ2pCLE1BQU0sRUFDTixRQUFRLEdBQ1gsTUFBTSx1QkFBdUIsQ0FBQztBQUUvQixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBTW5DLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBRTNELE9BQU8sRUFBMkIsZ0JBQWdCLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUM5RSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDckQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLHdCQUF3QixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFvQnhGLGtGQUFrRjtBQUNsRixNQUFNLENBQU4sSUFBWSxrQkFTWDtBQVRELFdBQVksa0JBQWtCO0lBQzFCLHFGQUFxRjtJQUNyRixxRkFBaUIsQ0FBQTtJQUNqQixpR0FBaUc7SUFDakcsdUdBQTBCLENBQUE7SUFDMUIsa0ZBQWtGO0lBQ2xGLHlIQUFtQyxDQUFBO0lBQ25DLHlEQUF5RDtJQUN6RCwyRUFBWSxDQUFBO0FBQ2hCLENBQUMsRUFUVyxrQkFBa0IsS0FBbEIsa0JBQWtCLFFBUzdCO0FBT0QsTUFBTSxVQUFVLFdBQVcsQ0FB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