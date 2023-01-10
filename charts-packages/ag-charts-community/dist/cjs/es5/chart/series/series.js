"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Series = exports.SeriesTooltip = exports.HighlightStyle = exports.SeriesNodeClickEvent = exports.SeriesNodePickMode = void 0;
var group_1 = require("../../scene/group");
var observable_1 = require("../../util/observable");
var chartAxis_1 = require("../chartAxis");
var id_1 = require("../../util/id");
var value_1 = require("../../util/value");
var timeAxis_1 = require("../axis/timeAxis");
var deprecation_1 = require("../../util/deprecation");
var validation_1 = require("../../util/validation");
var layers_1 = require("../layers");
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
var warnDeprecated = deprecation_1.createDeprecationWarning();
var warnSeriesDeprecated = function () { return warnDeprecated('series', 'Use seriesId to get the series ID'); };
var SeriesNodeClickEvent = /** @class */ (function () {
    function SeriesNodeClickEvent(nativeEvent, datum, series) {
        this.type = 'nodeClick';
        this.event = nativeEvent;
        this.datum = datum.datum;
        this.seriesId = series.id;
        this._series = series;
    }
    Object.defineProperty(SeriesNodeClickEvent.prototype, "series", {
        /** @deprecated */
        get: function () {
            warnSeriesDeprecated();
            return this._series;
        },
        enumerable: false,
        configurable: true
    });
    return SeriesNodeClickEvent;
}());
exports.SeriesNodeClickEvent = SeriesNodeClickEvent;
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
    }
    __decorate([
        validation_1.Validate(validation_1.BOOLEAN)
    ], SeriesTooltip.prototype, "enabled", void 0);
    return SeriesTooltip;
}());
exports.SeriesTooltip = SeriesTooltip;
var Series = /** @class */ (function (_super) {
    __extends(Series, _super);
    function Series(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.useSeriesGroupLayer, useSeriesGroupLayer = _c === void 0 ? true : _c, _d = _b.useLabelLayer, useLabelLayer = _d === void 0 ? false : _d, _e = _b.pickModes, pickModes = _e === void 0 ? [SeriesNodePickMode.NEAREST_BY_MAIN_AXIS_FIRST] : _e;
        var _this = _super.call(this) || this;
        _this.id = id_1.createId(_this);
        // The group node that contains all the nodes used to render this series.
        _this.rootGroup = new group_1.Group({ name: 'seriesRoot' });
        _this.directions = [chartAxis_1.ChartAxisDirection.X, chartAxis_1.ChartAxisDirection.Y];
        _this.directionKeys = {};
        // Flag to determine if we should recalculate node data.
        _this.nodeDataRefresh = true;
        _this._data = undefined;
        _this._visible = true;
        _this.showInLegend = true;
        _this.cursor = 'default';
        _this.highlightStyle = new HighlightStyle();
        var rootGroup = _this.rootGroup;
        _this.contentGroup = rootGroup.appendChild(new group_1.Group({
            name: _this.id + "-content",
            layer: useSeriesGroupLayer,
            zIndex: layers_1.Layers.SERIES_LAYER_ZINDEX,
        }));
        _this.highlightGroup = rootGroup.appendChild(new group_1.Group({
            name: _this.id + "-highlight",
            layer: true,
            zIndex: layers_1.Layers.SERIES_LAYER_ZINDEX,
            zIndexSubOrder: [_this.id, 15000],
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
            return this.constructor.type || '';
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
    Series.prototype.destroy = function () {
        // Override point for sub-classes.
    };
    Object.defineProperty(Series.prototype, "grouped", {
        set: function (g) {
            if (g === true) {
                throw new Error("AG Charts - grouped: true is unsupported for series of type: " + this.type);
            }
        },
        enumerable: false,
        configurable: true
    });
    // Returns the actual keys used (to fetch the values from `data` items) for the given direction.
    Series.prototype.getKeys = function (direction) {
        var _this = this;
        var directionKeys = this.directionKeys;
        var keys = directionKeys && directionKeys[direction];
        var values = [];
        if (keys) {
            keys.forEach(function (key) {
                var value = _this[key];
                if (value) {
                    if (Array.isArray(value)) {
                        values.push.apply(values, __spread(value));
                    }
                    else {
                        values.push(value);
                    }
                }
            });
        }
        return values;
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
        var e_1, _a;
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
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (pickModes_1_1 && !pickModes_1_1.done && (_a = pickModes_1.return)) _a.call(pickModes_1);
            }
            finally { if (e_1) throw e_1.error; }
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
    Series.prototype.getNodeClickEvent = function (event, datum) {
        return new SeriesNodeClickEvent(event, datum, this);
    };
    Series.prototype.toggleSeriesItem = function (_itemId, enabled) {
        this.visible = enabled;
        this.nodeDataRefresh = true;
    };
    Series.prototype.isEnabled = function () {
        return this.visible;
    };
    Series.prototype.fixNumericExtent = function (extent, axis) {
        if (extent === undefined) {
            // Don't return a range, there is no range.
            return [];
        }
        var _a = __read(extent, 2), min = _a[0], max = _a[1];
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
                var padding = Math.abs(min * 0.01);
                min -= padding;
                max += padding;
            }
        }
        if (!(value_1.isNumber(min) && value_1.isNumber(max))) {
            return [];
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
    return Series;
}(observable_1.Observable));
exports.Series = Series;
