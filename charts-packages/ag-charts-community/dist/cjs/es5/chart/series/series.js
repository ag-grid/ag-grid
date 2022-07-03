"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var group_1 = require("../../scene/group");
var observable_1 = require("../../util/observable");
var chartAxis_1 = require("../chartAxis");
var id_1 = require("../../util/id");
var label_1 = require("../label");
var value_1 = require("../../util/value");
var timeAxis_1 = require("../axis/timeAxis");
var validation_1 = require("../../util/validation");
var SeriesItemHighlightStyle = /** @class */ (function () {
    function SeriesItemHighlightStyle() {
        this.fill = 'yellow';
        this.stroke = undefined;
        this.strokeWidth = undefined;
    }
    return SeriesItemHighlightStyle;
}());
exports.SeriesItemHighlightStyle = SeriesItemHighlightStyle;
var SeriesHighlightStyle = /** @class */ (function () {
    function SeriesHighlightStyle() {
        this.strokeWidth = undefined;
        this.dimOpacity = undefined;
    }
    return SeriesHighlightStyle;
}());
exports.SeriesHighlightStyle = SeriesHighlightStyle;
var HighlightStyle = /** @class */ (function () {
    function HighlightStyle() {
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
    __decorate([
        validation_1.Deprecated('Use item.fill instead.')
    ], HighlightStyle.prototype, "fill", void 0);
    __decorate([
        validation_1.Deprecated('Use item.stroke instead.')
    ], HighlightStyle.prototype, "stroke", void 0);
    __decorate([
        validation_1.Deprecated('Use item.strokeWidth instead.')
    ], HighlightStyle.prototype, "strokeWidth", void 0);
    return HighlightStyle;
}());
exports.HighlightStyle = HighlightStyle;
var SeriesTooltip = /** @class */ (function () {
    function SeriesTooltip() {
        this.enabled = true;
    }
    return SeriesTooltip;
}());
exports.SeriesTooltip = SeriesTooltip;
var Series = /** @class */ (function (_super) {
    __extends(Series, _super);
    function Series(_a) {
        var _b = (_a === void 0 ? {} : _a).seriesGroupUsesLayer, seriesGroupUsesLayer = _b === void 0 ? true : _b;
        var _this = _super.call(this) || this;
        _this.id = id_1.createId(_this);
        // The group node that contains all the nodes used to render this series.
        _this.group = new group_1.Group();
        _this.directions = [chartAxis_1.ChartAxisDirection.X, chartAxis_1.ChartAxisDirection.Y];
        _this.directionKeys = {};
        // Flag to determine if we should recalculate node data.
        _this.nodeDataRefresh = true;
        _this.label = new label_1.Label();
        _this._data = undefined;
        _this._visible = true;
        _this.showInLegend = true;
        _this.cursor = 'default';
        _this.highlightStyle = new HighlightStyle();
        var group = _this.group;
        _this.seriesGroup = group.appendChild(new group_1.Group({
            name: _this.id + "-series",
            layer: seriesGroupUsesLayer,
            zIndex: Series.SERIES_LAYER_ZINDEX,
        }));
        _this.pickGroup = _this.seriesGroup.appendChild(new group_1.Group());
        _this.highlightGroup = group.appendChild(new group_1.Group({
            name: _this.id + "-highlight",
            layer: true,
            zIndex: Series.SERIES_HIGHLIGHT_LAYER_ZINDEX,
            optimiseDirtyTracking: true,
        }));
        return _this;
    }
    Object.defineProperty(Series.prototype, "type", {
        get: function () {
            return this.constructor.type || '';
        },
        enumerable: true,
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
        enumerable: true,
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
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Series.prototype, "grouped", {
        set: function (g) {
            if (g === true) {
                throw new Error("AG Charts - grouped: true is unsupported for series of type: " + this.type);
            }
        },
        enumerable: true,
        configurable: true
    });
    Series.prototype.setColors = function (_fills, _strokes) {
        // Override point for subclasses.
    };
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
        var _a = this.highlightStyle.series.dimOpacity, dimOpacity = _a === void 0 ? 1 : _a;
        var defaultOpacity = 1;
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
    };
    Series.prototype.getStrokeWidth = function (defaultStrokeWidth, datum) {
        var strokeWidth = this.highlightStyle.series.strokeWidth;
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
    };
    Series.prototype.getZIndex = function (datum) {
        var defaultZIndex = Series.SERIES_LAYER_ZINDEX;
        switch (this.isItemIdHighlighted(datum)) {
            case 'highlighted':
                return defaultZIndex + 1;
            case 'no-highlight':
            case 'other-highlighted':
                return defaultZIndex;
        }
    };
    Series.prototype.isItemIdHighlighted = function (datum) {
        var _a = this.chart, _b = _a === void 0 ? {} : _a, _c = _b.highlightedDatum, _d = _c === void 0 ? {} : _c, _e = _d.series, series = _e === void 0 ? undefined : _e, _f = _d.itemId, itemId = _f === void 0 ? undefined : _f, _g = _b.highlightedDatum, highlightedDatum = _g === void 0 ? undefined : _g;
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
            // Highlighting active, this series item not highlighted.
            return 'other-highlighted';
        }
        return 'highlighted';
    };
    Series.prototype.pickNode = function (x, y) {
        return this.pickGroup.pickNode(x, y);
    };
    Series.prototype.fireNodeClickEvent = function (_event, _datum) {
        // Override point for subclasses.
    };
    Series.prototype.toggleSeriesItem = function (_itemId, enabled) {
        this.visible = enabled;
        this.nodeDataRefresh = true;
    };
    Series.prototype.fixNumericExtent = function (extent, axis) {
        if (!extent) {
            return [0, 1];
        }
        var _a = __read(extent, 2), min = _a[0], max = _a[1];
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
                var padding = Math.abs(min * 0.01);
                min -= padding;
                max += padding;
            }
        }
        if (!(value_1.isNumber(min) && value_1.isNumber(max))) {
            return [0, 1];
        }
        return [min, max];
    };
    Series.highlightedZIndex = 1000000000000;
    Series.SERIES_LAYER_ZINDEX = 100;
    Series.SERIES_MARKER_LAYER_ZINDEX = 110;
    Series.SERIES_HIGHLIGHT_LAYER_ZINDEX = 150;
    return Series;
}(observable_1.Observable));
exports.Series = Series;
//# sourceMappingURL=series.js.map