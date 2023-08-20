"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Series = exports.SeriesTooltipInteraction = exports.SeriesTooltip = exports.HighlightStyle = exports.SeriesItemHighlightStyle = exports.SeriesNodeDoubleClickEvent = exports.SeriesNodeClickEvent = exports.SeriesNodeBaseClickEvent = exports.groupAccumulativeValueProperty = exports.trailingAccumulatedValueProperty = exports.accumulativeValueProperty = exports.rangedValueProperty = exports.valueProperty = exports.keyProperty = exports.SeriesNodePickMode = void 0;
var group_1 = require("../../scene/group");
var observable_1 = require("../../util/observable");
var id_1 = require("../../util/id");
var value_1 = require("../../util/value");
var validation_1 = require("../../util/validation");
var layers_1 = require("../layers");
var chartAxisDirection_1 = require("../chartAxisDirection");
var dataModel_1 = require("../data/dataModel");
var tooltip_1 = require("../tooltip/tooltip");
var aggregateFunctions_1 = require("../data/aggregateFunctions");
var processors_1 = require("../data/processors");
var proxy_1 = require("../../util/proxy");
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
function basicContinuousCheckDatumValidation(v) {
    return value_1.checkDatum(v, true) != null;
}
function basicDiscreteCheckDatumValidation(v) {
    return value_1.checkDatum(v, false) != null;
}
function keyProperty(scope, propName, continuous, opts) {
    if (opts === void 0) { opts = {}; }
    var result = __assign({ scopes: [scope.id], property: propName, type: 'key', valueType: continuous ? 'range' : 'category', validation: continuous ? basicContinuousCheckDatumValidation : basicDiscreteCheckDatumValidation }, opts);
    return result;
}
exports.keyProperty = keyProperty;
function valueProperty(scope, propName, continuous, opts) {
    if (opts === void 0) { opts = {}; }
    var result = __assign({ scopes: [scope.id], property: propName, type: 'value', valueType: continuous ? 'range' : 'category', validation: continuous ? basicContinuousCheckDatumValidation : basicDiscreteCheckDatumValidation }, opts);
    return result;
}
exports.valueProperty = valueProperty;
function rangedValueProperty(scope, propName, opts) {
    if (opts === void 0) { opts = {}; }
    var _a = opts.min, min = _a === void 0 ? -Infinity : _a, _b = opts.max, max = _b === void 0 ? Infinity : _b, defOpts = __rest(opts, ["min", "max"]);
    return __assign({ scopes: [scope.id], type: 'value', property: propName, valueType: 'range', validation: basicContinuousCheckDatumValidation, processor: function () { return function (datum) {
            if (typeof datum !== 'number')
                return datum;
            if (isNaN(datum))
                return datum;
            return Math.min(Math.max(datum, min), max);
        }; } }, defOpts);
}
exports.rangedValueProperty = rangedValueProperty;
function accumulativeValueProperty(scope, propName, continuous, opts) {
    if (opts === void 0) { opts = {}; }
    var result = __assign(__assign({}, valueProperty(scope, propName, continuous, opts)), { processor: aggregateFunctions_1.accumulatedValue() });
    return result;
}
exports.accumulativeValueProperty = accumulativeValueProperty;
function trailingAccumulatedValueProperty(scope, propName, continuous, opts) {
    if (opts === void 0) { opts = {}; }
    var result = __assign(__assign({}, valueProperty(scope, propName, continuous, opts)), { processor: aggregateFunctions_1.trailingAccumulatedValue() });
    return result;
}
exports.trailingAccumulatedValueProperty = trailingAccumulatedValueProperty;
function groupAccumulativeValueProperty(scope, propName, continuous, mode, sum, opts) {
    if (sum === void 0) { sum = 'current'; }
    return [valueProperty(scope, propName, continuous, opts), processors_1.accumulateGroup(scope, opts.groupId, mode, sum)];
}
exports.groupAccumulativeValueProperty = groupAccumulativeValueProperty;
var SeriesNodeBaseClickEvent = /** @class */ (function () {
    function SeriesNodeBaseClickEvent(nativeEvent, datum, series) {
        this.type = 'nodeClick';
        this.event = nativeEvent;
        this.datum = datum.datum;
        this.seriesId = series.id;
    }
    return SeriesNodeBaseClickEvent;
}());
exports.SeriesNodeBaseClickEvent = SeriesNodeBaseClickEvent;
var SeriesNodeClickEvent = /** @class */ (function (_super) {
    __extends(SeriesNodeClickEvent, _super);
    function SeriesNodeClickEvent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SeriesNodeClickEvent;
}(SeriesNodeBaseClickEvent));
exports.SeriesNodeClickEvent = SeriesNodeClickEvent;
var SeriesNodeDoubleClickEvent = /** @class */ (function (_super) {
    __extends(SeriesNodeDoubleClickEvent, _super);
    function SeriesNodeDoubleClickEvent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'nodeDoubleClick';
        return _this;
    }
    return SeriesNodeDoubleClickEvent;
}(SeriesNodeBaseClickEvent));
exports.SeriesNodeDoubleClickEvent = SeriesNodeDoubleClickEvent;
var SeriesItemHighlightStyle = /** @class */ (function () {
    function SeriesItemHighlightStyle() {
        this.fill = 'yellow';
        this.fillOpacity = undefined;
        this.stroke = undefined;
        this.strokeWidth = undefined;
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
    return SeriesItemHighlightStyle;
}());
exports.SeriesItemHighlightStyle = SeriesItemHighlightStyle;
var SeriesHighlightStyle = /** @class */ (function () {
    function SeriesHighlightStyle() {
        this.strokeWidth = undefined;
        this.dimOpacity = undefined;
        this.enabled = undefined;
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
    return SeriesHighlightStyle;
}());
var TextHighlightStyle = /** @class */ (function () {
    function TextHighlightStyle() {
        this.color = 'black';
    }
    __decorate([
        validation_1.Validate(validation_1.OPT_COLOR_STRING)
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
exports.HighlightStyle = HighlightStyle;
var SeriesTooltip = /** @class */ (function () {
    function SeriesTooltip() {
        this.enabled = true;
        this.showArrow = undefined;
        this.interaction = new SeriesTooltipInteraction();
        this.position = new tooltip_1.TooltipPosition();
    }
    __decorate([
        validation_1.Validate(validation_1.BOOLEAN)
    ], SeriesTooltip.prototype, "enabled", void 0);
    __decorate([
        validation_1.Validate(validation_1.OPT_BOOLEAN)
    ], SeriesTooltip.prototype, "showArrow", void 0);
    return SeriesTooltip;
}());
exports.SeriesTooltip = SeriesTooltip;
var SeriesTooltipInteraction = /** @class */ (function () {
    function SeriesTooltipInteraction() {
        this.enabled = false;
    }
    __decorate([
        validation_1.Validate(validation_1.BOOLEAN)
    ], SeriesTooltipInteraction.prototype, "enabled", void 0);
    return SeriesTooltipInteraction;
}());
exports.SeriesTooltipInteraction = SeriesTooltipInteraction;
var Series = /** @class */ (function (_super) {
    __extends(Series, _super);
    function Series(seriesOpts) {
        var _a;
        var _this = _super.call(this) || this;
        _this.id = id_1.createId(_this);
        // The group node that contains all the nodes used to render this series.
        _this.rootGroup = new group_1.Group({ name: 'seriesRoot', isVirtual: true });
        _this.axes = (_a = {},
            _a[chartAxisDirection_1.ChartAxisDirection.X] = undefined,
            _a[chartAxisDirection_1.ChartAxisDirection.Y] = undefined,
            _a);
        _this.directions = [chartAxisDirection_1.ChartAxisDirection.X, chartAxisDirection_1.ChartAxisDirection.Y];
        // Flag to determine if we should recalculate node data.
        _this.nodeDataRefresh = true;
        _this._data = undefined;
        _this._visible = true;
        _this.showInLegend = true;
        _this.cursor = 'default';
        _this.nodeClickRange = 'exact';
        _this.seriesGrouping = undefined;
        _this._declarationOrder = -1;
        _this.highlightStyle = new HighlightStyle();
        _this.ctx = seriesOpts.moduleCtx;
        var _b = seriesOpts.useLabelLayer, useLabelLayer = _b === void 0 ? false : _b, _c = seriesOpts.pickModes, pickModes = _c === void 0 ? [SeriesNodePickMode.NEAREST_BY_MAIN_AXIS_FIRST] : _c, _d = seriesOpts.directionKeys, directionKeys = _d === void 0 ? {} : _d, _e = seriesOpts.directionNames, directionNames = _e === void 0 ? {} : _e, _f = seriesOpts.contentGroupVirtual, contentGroupVirtual = _f === void 0 ? true : _f;
        var rootGroup = _this.rootGroup;
        _this.directionKeys = directionKeys;
        _this.directionNames = directionNames;
        _this.contentGroup = rootGroup.appendChild(new group_1.Group({
            name: _this.id + "-content",
            layer: !contentGroupVirtual,
            isVirtual: contentGroupVirtual,
            zIndex: layers_1.Layers.SERIES_LAYER_ZINDEX,
            zIndexSubOrder: _this.getGroupZIndexSubOrder('data'),
        }));
        _this.highlightGroup = rootGroup.appendChild(new group_1.Group({
            name: _this.id + "-highlight",
            layer: true,
            zIndex: layers_1.Layers.SERIES_LAYER_ZINDEX,
            zIndexSubOrder: _this.getGroupZIndexSubOrder('highlight'),
        }));
        _this.highlightNode = _this.highlightGroup.appendChild(new group_1.Group({ name: 'highlightNode' }));
        _this.highlightLabel = _this.highlightGroup.appendChild(new group_1.Group({ name: 'highlightLabel' }));
        _this.highlightNode.zIndex = 0;
        _this.highlightLabel.zIndex = 10;
        _this.pickModes = pickModes;
        if (useLabelLayer) {
            _this.labelGroup = rootGroup.appendChild(new group_1.Group({
                name: _this.id + "-series-labels",
                layer: true,
                zIndex: layers_1.Layers.SERIES_LABEL_ZINDEX,
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
    Series.prototype.onSeriesGroupingChange = function (prev, next) {
        var _this = this;
        var _a = this, id = _a.id, type = _a.type, visible = _a.visible, rootGroup = _a.rootGroup;
        if (prev) {
            this.ctx.seriesStateManager.deregisterSeries({ id: id, type: type });
        }
        if (next) {
            this.ctx.seriesStateManager.registerSeries({ id: id, type: type, visible: visible, seriesGrouping: next });
        }
        this.ctx.seriesLayerManager.changeGroup({
            id: id,
            type: type,
            rootGroup: rootGroup,
            getGroupZIndexSubOrder: function (type) { return _this.getGroupZIndexSubOrder(type); },
            seriesGrouping: next,
            oldGrouping: prev,
        });
    };
    Series.prototype.getBandScalePadding = function () {
        return { inner: 1, outer: 0 };
    };
    Series.prototype.getGroupZIndexSubOrder = function (type, subIndex) {
        var _this = this;
        if (subIndex === void 0) { subIndex = 0; }
        var mainAdjust = 0;
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
        var main = function () { return _this._declarationOrder + mainAdjust; };
        return [main, subIndex];
    };
    Series.prototype.addChartEventListeners = function () {
        return;
    };
    Series.prototype.destroy = function () {
        this.ctx.seriesStateManager.deregisterSeries(this);
        this.ctx.seriesLayerManager.releaseGroup(this);
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
        this.ctx.seriesStateManager.registerSeries(this);
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
        var highlightedDatum = (_a = this.ctx.highlightManager) === null || _a === void 0 ? void 0 : _a.getActiveHighlight();
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
        var fixedExtent = dataModel_1.fixNumericExtent(extent);
        if (fixedExtent.length === 0) {
            return fixedExtent;
        }
        var _b = __read(fixedExtent, 2), min = _b[0], max = _b[1];
        if (min === max) {
            // domain has zero length, there is only a single valid value in data
            var _c = __read((_a = axis === null || axis === void 0 ? void 0 : axis.calculatePadding(min, max)) !== null && _a !== void 0 ? _a : [1, 1], 2), paddingMin = _c[0], paddingMax = _c[1];
            min -= paddingMin;
            max += paddingMax;
        }
        return [min, max];
    };
    Series.highlightedZIndex = 1000000000000;
    __decorate([
        validation_1.Validate(validation_1.STRING)
    ], Series.prototype, "id", void 0);
    __decorate([
        validation_1.Validate(validation_1.BOOLEAN)
    ], Series.prototype, "_visible", void 0);
    __decorate([
        validation_1.Validate(validation_1.BOOLEAN)
    ], Series.prototype, "showInLegend", void 0);
    __decorate([
        validation_1.Validate(validation_1.STRING)
    ], Series.prototype, "cursor", void 0);
    __decorate([
        validation_1.Validate(validation_1.INTERACTION_RANGE)
    ], Series.prototype, "nodeClickRange", void 0);
    __decorate([
        proxy_1.ActionOnSet({
            changeValue: function (newVal, oldVal) {
                this.onSeriesGroupingChange(oldVal, newVal);
            },
        })
    ], Series.prototype, "seriesGrouping", void 0);
    return Series;
}(observable_1.Observable));
exports.Series = Series;
//# sourceMappingURL=series.js.map