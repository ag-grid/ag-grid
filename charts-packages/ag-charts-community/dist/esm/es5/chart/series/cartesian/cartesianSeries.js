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
import { Series } from '../series';
import { ChartAxisDirection } from '../../chartAxis';
import { SeriesMarker } from '../seriesMarker';
import { isContinuous, isDiscrete } from '../../../util/value';
import { Path } from '../../../scene/shape/path';
import { Selection } from '../../../scene/selection';
import { Group } from '../../../scene/group';
import { RedrawType, SceneChangeDetection } from '../../../scene/changeDetectable';
var CartesianSeries = /** @class */ (function (_super) {
    __extends(CartesianSeries, _super);
    function CartesianSeries(opts) {
        var _a;
        if (opts === void 0) { opts = {}; }
        var _this = _super.call(this, { seriesGroupUsesLayer: false }) || this;
        _this.highlightSelection = Selection.select(_this.highlightGroup).selectAll();
        _this.subGroups = [];
        _this.subGroupId = 0;
        /**
         * The assumption is that the values will be reset (to `true`)
         * in the {@link yKeys} setter.
         */
        _this.seriesItemEnabled = new Map();
        _this.directionKeys = (_a = {},
            _a[ChartAxisDirection.X] = ['xKey'],
            _a[ChartAxisDirection.Y] = ['yKey'],
            _a);
        var _b = opts.pickGroupIncludes, pickGroupIncludes = _b === void 0 ? ['datumNodes'] : _b, _c = opts.pathsPerSeries, pathsPerSeries = _c === void 0 ? 1 : _c, _d = opts.features, features = _d === void 0 ? [] : _d;
        _this.opts = { pickGroupIncludes: pickGroupIncludes, pathsPerSeries: pathsPerSeries, features: features };
        return _this;
    }
    /**
     * Note: we are passing `isContinuousX` and `isContinuousY` into this method because it will
     *       typically be called inside a loop and this check only needs to happen once.
     * @param x A domain value to be plotted along the x-axis.
     * @param y A domain value to be plotted along the y-axis.
     * @param isContinuousX Typically this will be the value of `xAxis.scale instanceof ContinuousScale`.
     * @param isContinuousY Typically this will be the value of `yAxis.scale instanceof ContinuousScale`.
     * @returns `[x, y]`, if both x and y are valid domain values for their respective axes/scales, or `undefined`.
     */
    CartesianSeries.prototype.checkDomainXY = function (x, y, isContinuousX, isContinuousY) {
        var isValidDatum = ((isContinuousX && isContinuous(x)) || (!isContinuousX && isDiscrete(x))) &&
            ((isContinuousY && isContinuous(y)) || (!isContinuousY && isDiscrete(y)));
        return isValidDatum ? [x, y] : undefined;
    };
    /**
     * Note: we are passing `isContinuousScale` into this method because it will
     *       typically be called inside a loop and this check only needs to happen once.
     * @param value A domain value to be plotted along an axis.
     * @param isContinuousScale Typically this will be the value of `xAxis.scale instanceof ContinuousScale` or `yAxis.scale instanceof ContinuousScale`.
     * @returns `value`, if the value is valid for its axis/scale, or `undefined`.
     */
    CartesianSeries.prototype.checkDatum = function (value, isContinuousScale) {
        if (isContinuousScale && isContinuous(value)) {
            return value;
        }
        else if (!isContinuousScale) {
            if (!isDiscrete(value)) {
                return String(value);
            }
            return value;
        }
        return undefined;
    };
    /**
     * Note: we are passing the xAxis and yAxis because the calling code is supposed to make sure
     *       that series has both of them defined, and also to avoid one level of indirection,
     *       e.g. `this.xAxis!.inRange(x)`, both of which are suboptimal in tight loops where this method is used.
     * @param x A range value to be plotted along the x-axis.
     * @param y A range value to be plotted along the y-axis.
     * @param xAxis The series' x-axis.
     * @param yAxis The series' y-axis.
     * @returns
     */
    CartesianSeries.prototype.checkRangeXY = function (x, y, xAxis, yAxis) {
        return !isNaN(x) && !isNaN(y) && xAxis.inRange(x) && yAxis.inRange(y);
    };
    CartesianSeries.prototype.update = function () {
        var _a = this, seriesItemEnabled = _a.seriesItemEnabled, visible = _a.visible, _b = _a.chart, _c = (_b === void 0 ? {} : _b).highlightedDatum, _d = (_c === void 0 ? {} : _c).series, series = _d === void 0 ? undefined : _d;
        var seriesHighlighted = series ? series === this : undefined;
        var anySeriesItemEnabled = (visible && seriesItemEnabled.size === 0) || __spread(seriesItemEnabled.values()).some(function (v) { return v === true; });
        this.updateSelections(seriesHighlighted, anySeriesItemEnabled);
        this.updateNodes(seriesHighlighted, anySeriesItemEnabled);
    };
    CartesianSeries.prototype.updateSelections = function (seriesHighlighted, anySeriesItemEnabled) {
        var _this = this;
        this.updateHighlightSelection(seriesHighlighted);
        if (!anySeriesItemEnabled) {
            return;
        }
        if (!this.nodeDataRefresh && !this.isPathOrSelectionDirty()) {
            return;
        }
        if (this.nodeDataRefresh) {
            this.nodeDataRefresh = false;
            this.contextNodeData = this.createNodeData();
            this.updateSeriesGroups();
        }
        this.subGroups.forEach(function (subGroup, seriesIdx) {
            var datumSelection = subGroup.datumSelection, labelSelection = subGroup.labelSelection, markerSelection = subGroup.markerSelection, paths = subGroup.paths;
            var contextData = _this.contextNodeData[seriesIdx];
            var nodeData = contextData.nodeData, labelData = contextData.labelData, itemId = contextData.itemId;
            _this.updatePaths({ seriesHighlighted: seriesHighlighted, itemId: itemId, contextData: contextData, paths: paths, seriesIdx: seriesIdx });
            subGroup.datumSelection = _this.updateDatumSelection({ nodeData: nodeData, datumSelection: datumSelection, seriesIdx: seriesIdx });
            subGroup.labelSelection = _this.updateLabelSelection({ labelData: labelData, labelSelection: labelSelection, seriesIdx: seriesIdx });
            if (markerSelection) {
                subGroup.markerSelection = _this.updateMarkerSelection({ nodeData: nodeData, markerSelection: markerSelection, seriesIdx: seriesIdx });
            }
        });
    };
    CartesianSeries.prototype.updateSeriesGroups = function () {
        var _this = this;
        var _a = this, contextNodeData = _a.contextNodeData, subGroups = _a.subGroups, _b = _a.opts, pickGroupIncludes = _b.pickGroupIncludes, pathsPerSeries = _b.pathsPerSeries, features = _b.features;
        if (contextNodeData.length === subGroups.length) {
            return;
        }
        if (contextNodeData.length < subGroups.length) {
            subGroups.splice(contextNodeData.length)
                .forEach(function (_a) {
                var group = _a.group, markerGroup = _a.markerGroup;
                _this.seriesGroup.removeChild(group);
                if (markerGroup) {
                    _this.seriesGroup.removeChild(markerGroup);
                }
            });
        }
        while (contextNodeData.length > subGroups.length) {
            var group = new Group({
                name: this.id + "-series-sub" + this.subGroupId++,
                layer: true,
                zIndex: Series.SERIES_LAYER_ZINDEX,
            });
            var markerGroup = features.includes('markers') ?
                new Group({
                    name: this.id + "-series-sub" + this.subGroupId++ + "-markers",
                    layer: true,
                    zIndex: Series.SERIES_LAYER_ZINDEX,
                }) :
                undefined;
            var pickGroup = new Group();
            var pathParentGroup = pickGroupIncludes.includes('mainPath') ? pickGroup : group;
            var datumParentGroup = pickGroupIncludes.includes('datumNodes') ? pickGroup : group;
            this.seriesGroup.appendChild(group);
            if (markerGroup) {
                this.seriesGroup.appendChild(markerGroup);
            }
            var paths = [];
            for (var index = 0; index < pathsPerSeries; index++) {
                paths[index] = new Path();
                pathParentGroup.appendChild(paths[index]);
            }
            group.appendChild(pickGroup);
            subGroups.push({
                paths: paths,
                group: group,
                pickGroup: pickGroup,
                markerGroup: markerGroup,
                labelSelection: Selection.select(group).selectAll(),
                datumSelection: Selection.select(datumParentGroup).selectAll(),
                markerSelection: markerGroup ? Selection.select(markerGroup).selectAll() : undefined,
            });
        }
    };
    CartesianSeries.prototype.updateNodes = function (seriesHighlighted, anySeriesItemEnabled) {
        var _this = this;
        var _a;
        var _b = this, highlightSelection = _b.highlightSelection, contextNodeData = _b.contextNodeData, seriesItemEnabled = _b.seriesItemEnabled, features = _b.opts.features;
        var markersEnabled = features.includes('markers');
        var visible = this.visible && ((_a = this.contextNodeData) === null || _a === void 0 ? void 0 : _a.length) > 0 && anySeriesItemEnabled;
        this.group.visible = visible;
        this.seriesGroup.visible = visible;
        this.highlightGroup.visible = visible && !!seriesHighlighted;
        this.seriesGroup.opacity = this.getOpacity();
        if (markersEnabled) {
            this.updateMarkerNodes({ markerSelection: highlightSelection, isHighlight: true, seriesIdx: -1 });
        }
        else {
            this.updateDatumNodes({ datumSelection: highlightSelection, isHighlight: true, seriesIdx: -1 });
        }
        this.subGroups.forEach(function (subGroup, seriesIdx) {
            var _a;
            var group = subGroup.group, markerGroup = subGroup.markerGroup, datumSelection = subGroup.datumSelection, labelSelection = subGroup.labelSelection, markerSelection = subGroup.markerSelection, paths = subGroup.paths;
            var itemId = contextNodeData[seriesIdx].itemId;
            group.opacity = _this.getOpacity({ itemId: itemId });
            group.zIndex = _this.getZIndex({ itemId: itemId });
            group.visible = visible && (_a = seriesItemEnabled.get(itemId), (_a !== null && _a !== void 0 ? _a : true));
            if (markerGroup) {
                markerGroup.opacity = group.opacity;
                markerGroup.zIndex = group.zIndex >= Series.SERIES_LAYER_ZINDEX ? group.zIndex : group.zIndex + 1;
                markerGroup.visible = group.visible;
            }
            if (!group.visible) {
                return;
            }
            _this.updatePathNodes({ seriesHighlighted: seriesHighlighted, itemId: itemId, paths: paths, seriesIdx: seriesIdx });
            _this.updateDatumNodes({ datumSelection: datumSelection, isHighlight: false, seriesIdx: seriesIdx });
            _this.updateLabelNodes({ labelSelection: labelSelection, seriesIdx: seriesIdx });
            if (markersEnabled && markerSelection) {
                _this.updateMarkerNodes({ markerSelection: markerSelection, isHighlight: false, seriesIdx: seriesIdx });
            }
        });
    };
    CartesianSeries.prototype.updateHighlightSelection = function (seriesHighlighted) {
        var _a = this, _b = _a.chart, _c = _b === void 0 ? {} : _b, _d = _c.highlightedDatum, _e = (_d === void 0 ? {} : _d).datum, datum = _e === void 0 ? undefined : _e, _f = _c.highlightedDatum, highlightedDatum = _f === void 0 ? undefined : _f, highlightSelection = _a.highlightSelection;
        var item = seriesHighlighted && highlightedDatum && datum ? highlightedDatum : undefined;
        this.highlightSelection = this.updateHighlightSelectionItem({ item: item, highlightSelection: highlightSelection });
    };
    CartesianSeries.prototype.pickNode = function (x, y) {
        var e_1, _a;
        var _b;
        var result = _super.prototype.pickNode.call(this, x, y);
        if (!result) {
            var pickGroupIncludes = this.opts.pickGroupIncludes;
            var markerGroupIncluded = pickGroupIncludes.includes('markers');
            try {
                for (var _c = __values(this.subGroups), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var _e = _d.value, pickGroup = _e.pickGroup, markerGroup = _e.markerGroup;
                    result = pickGroup.pickNode(x, y);
                    if (!result && markerGroupIncluded) {
                        result = (_b = markerGroup) === null || _b === void 0 ? void 0 : _b.pickNode(x, y);
                    }
                    if (result) {
                        break;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        return result;
    };
    CartesianSeries.prototype.toggleSeriesItem = function (itemId, enabled) {
        if (this.seriesItemEnabled.size > 0) {
            this.seriesItemEnabled.set(itemId, enabled);
            this.nodeDataRefresh = true;
        }
        else {
            _super.prototype.toggleSeriesItem.call(this, itemId, enabled);
        }
    };
    CartesianSeries.prototype.isPathOrSelectionDirty = function () {
        // Override point to allow more sophisticated dirty selection detection.
        return false;
    };
    CartesianSeries.prototype.updatePaths = function (opts) {
        // Override point for sub-classes.
        opts.paths.forEach(function (p) { return (p.visible = false); });
    };
    CartesianSeries.prototype.updatePathNodes = function (_opts) {
        // Override point for sub-classes.
    };
    CartesianSeries.prototype.updateHighlightSelectionItem = function (opts) {
        var features = this.opts.features;
        var markersEnabled = features.includes('markers');
        var item = opts.item, highlightSelection = opts.highlightSelection;
        var nodeData = item ? [item] : [];
        if (markersEnabled) {
            var markerSelection = highlightSelection;
            return this.updateMarkerSelection({ nodeData: nodeData, markerSelection: markerSelection, seriesIdx: -1 });
        }
        else {
            return this.updateDatumSelection({ nodeData: nodeData, datumSelection: highlightSelection, seriesIdx: -1 });
        }
    };
    CartesianSeries.prototype.updateDatumSelection = function (opts) {
        // Override point for sub-classes.
        return opts.datumSelection;
    };
    CartesianSeries.prototype.updateDatumNodes = function (opts) {
        // Override point for sub-classes.
    };
    CartesianSeries.prototype.updateMarkerSelection = function (opts) {
        // Override point for sub-classes.
        return opts.markerSelection;
    };
    CartesianSeries.prototype.updateMarkerNodes = function (opts) {
        // Override point for sub-classes.
    };
    return CartesianSeries;
}(Series));
export { CartesianSeries };
var CartesianSeriesMarker = /** @class */ (function (_super) {
    __extends(CartesianSeriesMarker, _super);
    function CartesianSeriesMarker() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.formatter = undefined;
        return _this;
    }
    __decorate([
        SceneChangeDetection({ redraw: RedrawType.MAJOR })
    ], CartesianSeriesMarker.prototype, "formatter", void 0);
    return CartesianSeriesMarker;
}(SeriesMarker));
export { CartesianSeriesMarker };
