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
import { Group } from '../../scene/group.mjs';
import { Observable } from '../../util/observable.mjs';
import { createId } from '../../util/id.mjs';
import { checkDatum } from '../../util/value.mjs';
import { BOOLEAN, OPT_BOOLEAN, OPT_NUMBER, OPT_COLOR_STRING, INTERACTION_RANGE, STRING, Validate, } from '../../util/validation.mjs';
import { Layers } from '../layers.mjs';
import { ChartAxisDirection } from '../chartAxisDirection.mjs';
import { fixNumericExtent } from '../data/dataModel.mjs';
import { TooltipPosition } from '../tooltip/tooltip.mjs';
import { accumulatedValue, trailingAccumulatedValue } from '../data/aggregateFunctions.mjs';
import { accumulateGroup } from '../data/processors.mjs';
import { ActionOnSet } from '../../util/proxy.mjs';
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
function basicContinuousCheckDatumValidation(v) {
    return checkDatum(v, true) != null;
}
function basicDiscreteCheckDatumValidation(v) {
    return checkDatum(v, false) != null;
}
export function keyProperty(scope, propName, continuous, opts = {}) {
    const result = Object.assign({ scopes: [scope.id], property: propName, type: 'key', valueType: continuous ? 'range' : 'category', validation: continuous ? basicContinuousCheckDatumValidation : basicDiscreteCheckDatumValidation }, opts);
    return result;
}
export function valueProperty(scope, propName, continuous, opts = {}) {
    const result = Object.assign({ scopes: [scope.id], property: propName, type: 'value', valueType: continuous ? 'range' : 'category', validation: continuous ? basicContinuousCheckDatumValidation : basicDiscreteCheckDatumValidation }, opts);
    return result;
}
export function rangedValueProperty(scope, propName, opts = {}) {
    const { min = -Infinity, max = Infinity } = opts, defOpts = __rest(opts, ["min", "max"]);
    return Object.assign({ scopes: [scope.id], type: 'value', property: propName, valueType: 'range', validation: basicContinuousCheckDatumValidation, processor: () => (datum) => {
            if (typeof datum !== 'number')
                return datum;
            if (isNaN(datum))
                return datum;
            return Math.min(Math.max(datum, min), max);
        } }, defOpts);
}
export function accumulativeValueProperty(scope, propName, continuous, opts = {}) {
    const result = Object.assign(Object.assign({}, valueProperty(scope, propName, continuous, opts)), { processor: accumulatedValue() });
    return result;
}
export function trailingAccumulatedValueProperty(scope, propName, continuous, opts = {}) {
    const result = Object.assign(Object.assign({}, valueProperty(scope, propName, continuous, opts)), { processor: trailingAccumulatedValue() });
    return result;
}
export function groupAccumulativeValueProperty(scope, propName, continuous, mode, sum = 'current', opts) {
    return [valueProperty(scope, propName, continuous, opts), accumulateGroup(scope, opts.groupId, mode, sum)];
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
    constructor(seriesOpts) {
        super();
        this.id = createId(this);
        // The group node that contains all the nodes used to render this series.
        this.rootGroup = new Group({ name: 'seriesRoot', isVirtual: true });
        this.axes = {
            [ChartAxisDirection.X]: undefined,
            [ChartAxisDirection.Y]: undefined,
        };
        this.directions = [ChartAxisDirection.X, ChartAxisDirection.Y];
        // Flag to determine if we should recalculate node data.
        this.nodeDataRefresh = true;
        this._data = undefined;
        this._visible = true;
        this.showInLegend = true;
        this.cursor = 'default';
        this.nodeClickRange = 'exact';
        this.seriesGrouping = undefined;
        this._declarationOrder = -1;
        this.highlightStyle = new HighlightStyle();
        this.ctx = seriesOpts.moduleCtx;
        const { useLabelLayer = false, pickModes = [SeriesNodePickMode.NEAREST_BY_MAIN_AXIS_FIRST], directionKeys = {}, directionNames = {}, contentGroupVirtual = true, } = seriesOpts;
        const { rootGroup } = this;
        this.directionKeys = directionKeys;
        this.directionNames = directionNames;
        this.contentGroup = rootGroup.appendChild(new Group({
            name: `${this.id}-content`,
            layer: !contentGroupVirtual,
            isVirtual: contentGroupVirtual,
            zIndex: Layers.SERIES_LAYER_ZINDEX,
            zIndexSubOrder: this.getGroupZIndexSubOrder('data'),
        }));
        this.highlightGroup = rootGroup.appendChild(new Group({
            name: `${this.id}-highlight`,
            layer: true,
            zIndex: Layers.SERIES_LAYER_ZINDEX,
            zIndexSubOrder: this.getGroupZIndexSubOrder('highlight'),
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
    onSeriesGroupingChange(prev, next) {
        const { id, type, visible, rootGroup } = this;
        if (prev) {
            this.ctx.seriesStateManager.deregisterSeries({ id, type });
        }
        if (next) {
            this.ctx.seriesStateManager.registerSeries({ id, type, visible, seriesGrouping: next });
        }
        this.ctx.seriesLayerManager.changeGroup({
            id,
            type,
            rootGroup,
            getGroupZIndexSubOrder: (type) => this.getGroupZIndexSubOrder(type),
            seriesGrouping: next,
            oldGrouping: prev,
        });
    }
    getBandScalePadding() {
        return { inner: 1, outer: 0 };
    }
    getGroupZIndexSubOrder(type, subIndex = 0) {
        let mainAdjust = 0;
        switch (type) {
            case 'data':
            case 'paths':
                break;
            case 'labels':
                mainAdjust += 20000;
                break;
            case 'marker':
                mainAdjust += 10000;
                break;
            // Following cases are in their own layer, so need to be careful to respect declarationOrder.
            case 'highlight':
                subIndex += 15000;
                break;
        }
        const main = () => this._declarationOrder + mainAdjust;
        return [main, subIndex];
    }
    addChartEventListeners() {
        return;
    }
    destroy() {
        this.ctx.seriesStateManager.deregisterSeries(this);
        this.ctx.seriesLayerManager.releaseGroup(this);
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
        this.ctx.seriesStateManager.registerSeries(this);
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
        const highlightedDatum = (_a = this.ctx.highlightManager) === null || _a === void 0 ? void 0 : _a.getActiveHighlight();
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
            const [paddingMin, paddingMax] = (_a = axis === null || axis === void 0 ? void 0 : axis.calculatePadding(min, max)) !== null && _a !== void 0 ? _a : [1, 1];
            min -= paddingMin;
            max += paddingMax;
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
__decorate([
    ActionOnSet({
        changeValue: function (newVal, oldVal) {
            this.onSeriesGroupingChange(oldVal, newVal);
        },
    })
], Series.prototype, "seriesGrouping", void 0);
