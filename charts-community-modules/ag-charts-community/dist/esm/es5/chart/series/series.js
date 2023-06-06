var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
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
export function keyProperty(propName, continuous, opts) {
    if (opts === void 0) { opts = {}; }
    var result = __assign({ property: propName, type: 'key', valueType: continuous ? 'range' : 'category', validation: function (v) { return checkDatum(v, continuous) != null; } }, opts);
    return result;
}
export function valueProperty(propName, continuous, opts) {
    if (opts === void 0) { opts = {}; }
    var result = __assign({ property: propName, type: 'value', valueType: continuous ? 'range' : 'category', validation: function (v) { return checkDatum(v, continuous) != null; } }, opts);
    return result;
}
export function rangedValueProperty(propName, opts) {
    if (opts === void 0) { opts = {}; }
    var _a = opts.min, min = _a === void 0 ? -Infinity : _a, _b = opts.max, max = _b === void 0 ? Infinity : _b, defOpts = __rest(opts, ["min", "max"]);
    return __assign({ type: 'value', property: propName, valueType: 'range', validation: function (v) { return checkDatum(v, true) != null; }, processor: function () { return function (datum) {
            if (typeof datum !== 'number')
                return datum;
            if (isNaN(datum))
                return datum;
            return Math.min(Math.max(datum, min), max);
        }; } }, defOpts);
}
export function accumulativeValueProperty(propName, continuous, opts) {
    if (opts === void 0) { opts = {}; }
    var result = __assign(__assign({}, valueProperty(propName, continuous, opts)), { processor: accumulatedValue() });
    return result;
}
export function trailingAccumulatedValueProperty(propName, continuous, opts) {
    if (opts === void 0) { opts = {}; }
    var result = __assign(__assign({}, valueProperty(propName, continuous, opts)), { processor: trailingAccumulatedValue() });
    return result;
}
var SeriesNodeBaseClickEvent = /** @class */ (function () {
    function SeriesNodeBaseClickEvent(nativeEvent, datum, series) {
        this.type = 'nodeClick';
        this.event = nativeEvent;
        this.datum = datum.datum;
        this.seriesId = series.id;
    }
    return SeriesNodeBaseClickEvent;
}());
export { SeriesNodeBaseClickEvent };
var SeriesNodeClickEvent = /** @class */ (function (_super) {
    __extends(SeriesNodeClickEvent, _super);
    function SeriesNodeClickEvent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SeriesNodeClickEvent;
}(SeriesNodeBaseClickEvent));
export { SeriesNodeClickEvent };
var SeriesNodeDoubleClickEvent = /** @class */ (function (_super) {
    __extends(SeriesNodeDoubleClickEvent, _super);
    function SeriesNodeDoubleClickEvent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'nodeDoubleClick';
        return _this;
    }
    return SeriesNodeDoubleClickEvent;
}(SeriesNodeBaseClickEvent));
export { SeriesNodeDoubleClickEvent };
var SeriesItemHighlightStyle = /** @class */ (function () {
    function SeriesItemHighlightStyle() {
        this.fill = 'yellow';
        this.fillOpacity = undefined;
        this.stroke = undefined;
        this.strokeWidth = undefined;
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
    return SeriesItemHighlightStyle;
}());
export { SeriesItemHighlightStyle };
var SeriesHighlightStyle = /** @class */ (function () {
    function SeriesHighlightStyle() {
        this.strokeWidth = undefined;
        this.dimOpacity = undefined;
        this.enabled = undefined;
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
    return SeriesHighlightStyle;
}());
var TextHighlightStyle = /** @class */ (function () {
    function TextHighlightStyle() {
        this.color = 'black';
    }
    __decorate([
        Validate(OPT_COLOR_STRING)
    ], TextHighlightStyle.prototype, "color", void 0);
    return TextHighlightStyle;
}());
var HighlightStyle = /** @class */ (function () {
    function HighlightStyle() {
        this.item = new SeriesItemHighlightStyle();
        this.series = new SeriesHighlightStyle();
        this.text = new TextHighlightStyle();
    }
    return HighlightStyle;
}());
export { HighlightStyle };
var SeriesTooltip = /** @class */ (function () {
    function SeriesTooltip() {
        this.enabled = true;
        this.showArrow = undefined;
        this.interaction = new SeriesTooltipInteraction();
        this.position = new TooltipPosition();
    }
    __decorate([
        Validate(BOOLEAN)
    ], SeriesTooltip.prototype, "enabled", void 0);
    __decorate([
        Validate(OPT_BOOLEAN)
    ], SeriesTooltip.prototype, "showArrow", void 0);
    return SeriesTooltip;
}());
export { SeriesTooltip };
var SeriesTooltipInteraction = /** @class */ (function () {
    function SeriesTooltipInteraction() {
        this.enabled = false;
    }
    __decorate([
        Validate(BOOLEAN)
    ], SeriesTooltipInteraction.prototype, "enabled", void 0);
    return SeriesTooltipInteraction;
}());
export { SeriesTooltipInteraction };
var Series = /** @class */ (function (_super) {
    __extends(Series, _super);
    function Series(opts) {
        var _this = _super.call(this) || this;
        _this.id = createId(_this);
        // The group node that contains all the nodes used to render this series.
        _this.rootGroup = new Group({ name: 'seriesRoot' });
        _this.directions = [ChartAxisDirection.X, ChartAxisDirection.Y];
        // Flag to determine if we should recalculate node data.
        _this.nodeDataRefresh = true;
        _this._data = undefined;
        _this._visible = true;
        _this.showInLegend = true;
        _this.cursor = 'default';
        _this.nodeClickRange = 'exact';
        _this._declarationOrder = -1;
        _this.highlightStyle = new HighlightStyle();
        _this.ctx = opts.moduleCtx;
        var _a = opts.useSeriesGroupLayer, useSeriesGroupLayer = _a === void 0 ? true : _a, _b = opts.useLabelLayer, useLabelLayer = _b === void 0 ? false : _b, _c = opts.pickModes, pickModes = _c === void 0 ? [SeriesNodePickMode.NEAREST_BY_MAIN_AXIS_FIRST] : _c, _d = opts.directionKeys, directionKeys = _d === void 0 ? {} : _d, _e = opts.directionNames, directionNames = _e === void 0 ? {} : _e;
        var rootGroup = _this.rootGroup;
        _this.directionKeys = directionKeys;
        _this.directionNames = directionNames;
        _this.contentGroup = rootGroup.appendChild(new Group({
            name: _this.id + "-content",
            layer: useSeriesGroupLayer,
            zIndex: Layers.SERIES_LAYER_ZINDEX,
            zIndexSubOrder: [function () { return _this._declarationOrder; }, 0],
        }));
        _this.highlightGroup = rootGroup.appendChild(new Group({
            name: _this.id + "-highlight",
            layer: true,
            zIndex: Layers.SERIES_LAYER_ZINDEX,
            zIndexSubOrder: [function () { return _this._declarationOrder; }, 15000],
        }));
        _this.highlightNode = _this.highlightGroup.appendChild(new Group({ name: 'highlightNode' }));
        _this.highlightLabel = _this.highlightGroup.appendChild(new Group({ name: 'highlightLabel' }));
        _this.highlightNode.zIndex = 0;
        _this.highlightLabel.zIndex = 10;
        _this.pickModes = pickModes;
        if (useLabelLayer) {
            _this.labelGroup = rootGroup.appendChild(new Group({
                name: _this.id + "-series-labels",
                layer: true,
                zIndex: Layers.SERIES_LABEL_ZINDEX,
            }));
        }
        return _this;
    }
    Object.defineProperty(Series.prototype, "type", {
        get: function () {
            var _a;
            return (_a = this.constructor.type) !== null && _a !== void 0 ? _a : '';
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Series.prototype, "data", {
        get: function () {
            return this._data;
        },
        set: function (input) {
            this._data = input;
            this.nodeDataRefresh = true;
        },
        enumerable: false,
        configurable: true
    });
    Series.prototype.hasData = function () {
        var data = this.data;
        return data && (!Array.isArray(data) || data.length > 0);
    };
    Object.defineProperty(Series.prototype, "visible", {
        get: function () {
            return this._visible;
        },
        set: function (value) {
            this._visible = value;
            this.visibleChanged();
        },
        enumerable: false,
        configurable: true
    });
    Series.prototype.getBandScalePadding = function () {
        return { inner: 1, outer: 0 };
    };
    Series.prototype.addChartEventListeners = function () {
        return;
    };
    Series.prototype.destroy = function () {
        // Override point for sub-classes.
    };
    Series.prototype.getDirectionValues = function (direction, properties) {
        var _this = this;
        var resolvedDirection = this.resolveKeyDirection(direction);
        var keys = properties === null || properties === void 0 ? void 0 : properties[resolvedDirection];
        var values = [];
        var flatten = function () {
            var e_1, _a;
            var array = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                array[_i] = arguments[_i];
            }
            try {
                for (var array_1 = __values(array), array_1_1 = array_1.next(); !array_1_1.done; array_1_1 = array_1.next()) {
                    var value = array_1_1.value;
                    addValue(value);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (array_1_1 && !array_1_1.done && (_a = array_1.return)) _a.call(array_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
        var addValue = function (value) {
            if (Array.isArray(value)) {
                flatten.apply(void 0, __spreadArray([], __read(value)));
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
        keys.forEach(function (key) {
            var value = _this[key];
            addValue(value);
        });
        return values;
    };
    Series.prototype.getKeys = function (direction) {
        return this.getDirectionValues(direction, this.directionKeys);
    };
    Series.prototype.getNames = function (direction) {
        return this.getDirectionValues(direction, this.directionNames);
    };
    Series.prototype.resolveKeyDirection = function (direction) {
        return direction;
    };
    // Indicate that something external changed and we should recalculate nodeData.
    Series.prototype.markNodeDataDirty = function () {
        this.nodeDataRefresh = true;
    };
    Series.prototype.visibleChanged = function () {
        // Override point for this.visible change post-processing.
    };
    Series.prototype.getOpacity = function (datum) {
        var _a = this.highlightStyle.series, _b = _a.dimOpacity, dimOpacity = _b === void 0 ? 1 : _b, _c = _a.enabled, enabled = _c === void 0 ? true : _c;
        var defaultOpacity = 1;
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
    };
    Series.prototype.getStrokeWidth = function (defaultStrokeWidth, datum) {
        var _a = this.highlightStyle.series, strokeWidth = _a.strokeWidth, _b = _a.enabled, enabled = _b === void 0 ? true : _b;
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
    };
    Series.prototype.isItemIdHighlighted = function (datum) {
        var _a;
        var highlightedDatum = (_a = this.highlightManager) === null || _a === void 0 ? void 0 : _a.getActiveHighlight();
        var _b = highlightedDatum !== null && highlightedDatum !== void 0 ? highlightedDatum : {}, series = _b.series, itemId = _b.itemId;
        var highlighting = series != null;
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
    };
    Series.prototype.pickNode = function (point, limitPickModes) {
        var e_2, _a;
        var _b = this, pickModes = _b.pickModes, visible = _b.visible, rootGroup = _b.rootGroup;
        if (!visible || !rootGroup.visible) {
            return;
        }
        try {
            for (var pickModes_1 = __values(pickModes), pickModes_1_1 = pickModes_1.next(); !pickModes_1_1.done; pickModes_1_1 = pickModes_1.next()) {
                var pickMode = pickModes_1_1.value;
                if (limitPickModes && !limitPickModes.includes(pickMode)) {
                    continue;
                }
                var match = undefined;
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
                    return { pickMode: pickMode, match: match.datum, distance: match.distance };
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (pickModes_1_1 && !pickModes_1_1.done && (_a = pickModes_1.return)) _a.call(pickModes_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    Series.prototype.pickNodeExactShape = function (point) {
        var match = this.contentGroup.pickNode(point.x, point.y);
        if (match) {
            return {
                datum: match.datum,
                distance: 0,
            };
        }
    };
    Series.prototype.pickNodeClosestDatum = function (_point) {
        // Override point for sub-classes - but if this is invoked, the sub-class specified it wants
        // to use this feature.
        throw new Error('AG Charts - Series.pickNodeClosestDatum() not implemented');
    };
    Series.prototype.pickNodeMainAxisFirst = function (_point, _requireCategoryAxis) {
        // Override point for sub-classes - but if this is invoked, the sub-class specified it wants
        // to use this feature.
        throw new Error('AG Charts - Series.pickNodeMainAxisFirst() not implemented');
    };
    Series.prototype.fireNodeClickEvent = function (event, _datum) {
        var eventObject = this.getNodeClickEvent(event, _datum);
        this.fireEvent(eventObject);
    };
    Series.prototype.fireNodeDoubleClickEvent = function (event, _datum) {
        var eventObject = this.getNodeDoubleClickEvent(event, _datum);
        this.fireEvent(eventObject);
    };
    Series.prototype.getNodeClickEvent = function (event, datum) {
        return new SeriesNodeClickEvent(event, datum, this);
    };
    Series.prototype.getNodeDoubleClickEvent = function (event, datum) {
        return new SeriesNodeDoubleClickEvent(event, datum, this);
    };
    Series.prototype.toggleSeriesItem = function (_itemId, enabled) {
        this.visible = enabled;
        this.nodeDataRefresh = true;
    };
    Series.prototype.isEnabled = function () {
        return this.visible;
    };
    Series.prototype.fixNumericExtent = function (extent, axis) {
        var _a;
        var fixedExtent = fixNumericExtent(extent);
        if (fixedExtent.length === 0) {
            return fixedExtent;
        }
        var _b = __read(fixedExtent, 2), min = _b[0], max = _b[1];
        if (min === max) {
            // domain has zero length, there is only a single valid value in data
            var padding = (_a = axis === null || axis === void 0 ? void 0 : axis.calculatePadding(min, max)) !== null && _a !== void 0 ? _a : 1;
            min -= padding;
            max += padding;
        }
        return [min, max];
    };
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
    return Series;
}(Observable));
export { Series };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VyaWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L3Nlcmllcy9zZXJpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRTFDLE9BQU8sRUFBRSxVQUFVLEVBQWMsTUFBTSx1QkFBdUIsQ0FBQztBQUUvRCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUM5QyxPQUFPLEVBQ0gsT0FBTyxFQUNQLFdBQVcsRUFDWCxVQUFVLEVBQ1YsZ0JBQWdCLEVBQ2hCLGlCQUFpQixFQUNqQixNQUFNLEVBQ04sUUFBUSxHQUNYLE1BQU0sdUJBQXVCLENBQUM7QUFFL0IsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFdBQVcsQ0FBQztBQU1uQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUUzRCxPQUFPLEVBQTJCLGdCQUFnQixFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDOUUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSx3QkFBd0IsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBb0J4RixrRkFBa0Y7QUFDbEYsTUFBTSxDQUFOLElBQVksa0JBU1g7QUFURCxXQUFZLGtCQUFrQjtJQUMxQixxRkFBcUY7SUFDckYscUZBQWlCLENBQUE7SUFDakIsaUdBQWlHO0lBQ2pHLHVHQUEwQixDQUFBO0lBQzFCLGtGQUFrRjtJQUNsRix5SEFBbUMsQ0FBQTtJQUNuQyx5REFBeUQ7SUFDekQsMkVBQVksQ0FBQTtBQUNoQixD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