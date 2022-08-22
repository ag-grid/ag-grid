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
import { CategoryAxis } from '../../axis/categoryAxis';
import { Layers } from '../../layers';
var CartesianSeries = /** @class */ (function (_super) {
    __extends(CartesianSeries, _super);
    function CartesianSeries(opts) {
        var _a;
        if (opts === void 0) { opts = {}; }
        var _this = _super.call(this, { seriesGroupUsesLayer: true, pickModes: opts.pickModes }) || this;
        _this.highlightSelection = Selection.select(_this.highlightNode).selectAll();
        _this.highlightLabelSelection = Selection.select(_this.highlightLabel).selectAll();
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
        var _b = opts.pickGroupIncludes, pickGroupIncludes = _b === void 0 ? ['datumNodes'] : _b, _c = opts.pathsPerSeries, pathsPerSeries = _c === void 0 ? 1 : _c, _d = opts.features, features = _d === void 0 ? [] : _d, _e = opts.pathsZIndexSubOrderOffset, pathsZIndexSubOrderOffset = _e === void 0 ? [] : _e;
        _this.opts = { pickGroupIncludes: pickGroupIncludes, pathsPerSeries: pathsPerSeries, features: features, pathsZIndexSubOrderOffset: pathsZIndexSubOrderOffset };
        return _this;
    }
    Object.defineProperty(CartesianSeries.prototype, "contextNodeData", {
        get: function () {
            var _a;
            return (_a = this._contextNodeData) === null || _a === void 0 ? void 0 : _a.slice();
        },
        enumerable: true,
        configurable: true
    });
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
            this._contextNodeData = this.createNodeData();
            this.updateSeriesGroups();
        }
        this.subGroups.forEach(function (subGroup, seriesIdx) {
            var datumSelection = subGroup.datumSelection, labelSelection = subGroup.labelSelection, markerSelection = subGroup.markerSelection, paths = subGroup.paths;
            var contextData = _this._contextNodeData[seriesIdx];
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
        var _a;
        var _b = this, contextNodeData = _b._contextNodeData, seriesGroup = _b.seriesGroup, subGroups = _b.subGroups, _c = _b.opts, pickGroupIncludes = _c.pickGroupIncludes, pathsPerSeries = _c.pathsPerSeries, features = _c.features, pathsZIndexSubOrderOffset = _c.pathsZIndexSubOrderOffset;
        if (contextNodeData.length === subGroups.length) {
            return;
        }
        if (contextNodeData.length < subGroups.length) {
            subGroups.splice(contextNodeData.length).forEach(function (_a) {
                var e_1, _b;
                var group = _a.group, markerGroup = _a.markerGroup, paths = _a.paths;
                seriesGroup.removeChild(group);
                if (markerGroup) {
                    seriesGroup.removeChild(markerGroup);
                }
                if (!pickGroupIncludes.includes('mainPath')) {
                    try {
                        for (var paths_1 = __values(paths), paths_1_1 = paths_1.next(); !paths_1_1.done; paths_1_1 = paths_1.next()) {
                            var path = paths_1_1.value;
                            seriesGroup.removeChild(path);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (paths_1_1 && !paths_1_1.done && (_b = paths_1.return)) _b.call(paths_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
            });
        }
        while (contextNodeData.length > subGroups.length) {
            var layer = false;
            var subGroupId = this.subGroupId++;
            var group = new Group({
                name: this.id + "-series-sub" + subGroupId,
                layer: layer,
                zIndex: Layers.SERIES_LAYER_ZINDEX,
                zIndexSubOrder: [this.id, subGroupId],
            });
            var markerGroup = features.includes('markers')
                ? new Group({
                    name: this.id + "-series-sub" + this.subGroupId++ + "-markers",
                    layer: layer,
                    zIndex: Layers.SERIES_LAYER_ZINDEX,
                    zIndexSubOrder: [this.id, 10000 + subGroupId],
                })
                : undefined;
            var labelGroup = new Group({
                name: this.id + "-series-sub" + this.subGroupId++ + "-labels",
                layer: layer,
                zIndex: Layers.SERIES_LAYER_ZINDEX,
                zIndexSubOrder: [this.id, 20000 + subGroupId],
            });
            var pickGroup = new Group({
                name: this.id + "-series-sub" + this.subGroupId++ + "-pickGroup",
                zIndex: Layers.SERIES_LAYER_ZINDEX,
                zIndexSubOrder: [this.id, 10000 + subGroupId],
            });
            var pathParentGroup = pickGroupIncludes.includes('mainPath') ? pickGroup : seriesGroup;
            var datumParentGroup = pickGroupIncludes.includes('datumNodes') ? pickGroup : group;
            seriesGroup.appendChild(group);
            seriesGroup.appendChild(labelGroup);
            if (markerGroup) {
                seriesGroup.appendChild(markerGroup);
            }
            var paths = [];
            for (var index = 0; index < pathsPerSeries; index++) {
                paths[index] = new Path();
                paths[index].zIndex = Layers.SERIES_LAYER_ZINDEX;
                paths[index].zIndexSubOrder = [this.id, (_a = pathsZIndexSubOrderOffset[index], (_a !== null && _a !== void 0 ? _a : 0)) + subGroupId];
                pathParentGroup.appendChild(paths[index]);
            }
            group.appendChild(pickGroup);
            subGroups.push({
                paths: paths,
                group: group,
                pickGroup: pickGroup,
                markerGroup: markerGroup,
                labelGroup: labelGroup,
                labelSelection: Selection.select(labelGroup).selectAll(),
                datumSelection: Selection.select(datumParentGroup).selectAll(),
                markerSelection: markerGroup ? Selection.select(markerGroup).selectAll() : undefined,
            });
        }
    };
    CartesianSeries.prototype.updateNodes = function (seriesHighlighted, anySeriesItemEnabled) {
        var _this = this;
        var _a;
        var _b = this, highlightSelection = _b.highlightSelection, highlightLabelSelection = _b.highlightLabelSelection, contextNodeData = _b._contextNodeData, seriesItemEnabled = _b.seriesItemEnabled, features = _b.opts.features;
        var markersEnabled = features.includes('markers');
        var visible = this.visible && ((_a = this._contextNodeData) === null || _a === void 0 ? void 0 : _a.length) > 0 && anySeriesItemEnabled;
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
        this.updateLabelNodes({ labelSelection: highlightLabelSelection, seriesIdx: -1 });
        this.subGroups.forEach(function (subGroup, seriesIdx) {
            var e_2, _a;
            var _b;
            var group = subGroup.group, markerGroup = subGroup.markerGroup, datumSelection = subGroup.datumSelection, labelSelection = subGroup.labelSelection, markerSelection = subGroup.markerSelection, paths = subGroup.paths;
            var itemId = contextNodeData[seriesIdx].itemId;
            group.opacity = _this.getOpacity({ itemId: itemId });
            group.visible = visible && (_b = seriesItemEnabled.get(itemId), (_b !== null && _b !== void 0 ? _b : true));
            if (markerGroup) {
                markerGroup.opacity = group.opacity;
                markerGroup.zIndex = group.zIndex >= Layers.SERIES_LAYER_ZINDEX ? group.zIndex : group.zIndex + 1;
                markerGroup.visible = group.visible;
            }
            try {
                for (var paths_2 = __values(paths), paths_2_1 = paths_2.next(); !paths_2_1.done; paths_2_1 = paths_2.next()) {
                    var path = paths_2_1.value;
                    path.opacity = group.opacity;
                    path.visible = group.visible;
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (paths_2_1 && !paths_2_1.done && (_a = paths_2.return)) _a.call(paths_2);
                }
                finally { if (e_2) throw e_2.error; }
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
        var e_3, _a;
        var _b = this, _c = _b.chart, _d = _c === void 0 ? {} : _c, _e = _d.highlightedDatum, _f = (_e === void 0 ? {} : _e).datum, datum = _f === void 0 ? undefined : _f, _g = _d.highlightedDatum, highlightedDatum = _g === void 0 ? undefined : _g, highlightSelection = _b.highlightSelection, highlightLabelSelection = _b.highlightLabelSelection, contextNodeData = _b._contextNodeData;
        var item = seriesHighlighted && highlightedDatum && datum ? highlightedDatum : undefined;
        this.highlightSelection = this.updateHighlightSelectionItem({ item: item, highlightSelection: highlightSelection });
        var labelItem;
        if (this.label.enabled && item != null) {
            var _h = item.itemId, itemId_1 = _h === void 0 ? undefined : _h;
            try {
                for (var contextNodeData_1 = __values(contextNodeData), contextNodeData_1_1 = contextNodeData_1.next(); !contextNodeData_1_1.done; contextNodeData_1_1 = contextNodeData_1.next()) {
                    var labelData = contextNodeData_1_1.value.labelData;
                    labelItem = labelData.find(function (ld) { return ld.datum === item.datum && ld.itemId === itemId_1; });
                    if (labelItem != null) {
                        break;
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (contextNodeData_1_1 && !contextNodeData_1_1.done && (_a = contextNodeData_1.return)) _a.call(contextNodeData_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
        this.highlightLabelSelection = this.updateHighlightSelectionLabel({ item: labelItem, highlightLabelSelection: highlightLabelSelection });
    };
    CartesianSeries.prototype.pickNodeExactShape = function (point) {
        var e_4, _a;
        var _b;
        var result = _super.prototype.pickNodeExactShape.call(this, point);
        if (result) {
            return result;
        }
        var x = point.x, y = point.y;
        var pickGroupIncludes = this.opts.pickGroupIncludes;
        var markerGroupIncluded = pickGroupIncludes.includes('markers');
        try {
            for (var _c = __values(this.subGroups), _d = _c.next(); !_d.done; _d = _c.next()) {
                var _e = _d.value, pickGroup = _e.pickGroup, markerGroup = _e.markerGroup;
                var match = pickGroup.pickNode(x, y);
                if (!match && markerGroupIncluded) {
                    match = (_b = markerGroup) === null || _b === void 0 ? void 0 : _b.pickNode(x, y);
                }
                if (match) {
                    return { datum: match.datum, distance: 0 };
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_4) throw e_4.error; }
        }
    };
    CartesianSeries.prototype.pickNodeClosestDatum = function (point) {
        var e_5, _a, e_6, _b;
        var _c, _d, _e, _f;
        var x = point.x, y = point.y;
        var _g = this, xAxis = _g.xAxis, yAxis = _g.yAxis, group = _g.group, contextNodeData = _g._contextNodeData;
        var hitPoint = group.transformPoint(x, y);
        var minDistance = Infinity;
        var closestDatum;
        try {
            for (var contextNodeData_2 = __values(contextNodeData), contextNodeData_2_1 = contextNodeData_2.next(); !contextNodeData_2_1.done; contextNodeData_2_1 = contextNodeData_2.next()) {
                var context = contextNodeData_2_1.value;
                try {
                    for (var _h = (e_6 = void 0, __values(context.nodeData)), _j = _h.next(); !_j.done; _j = _h.next()) {
                        var datum = _j.value;
                        var _k = datum.point, _l = _k === void 0 ? {} : _k, _m = _l.x, datumX = _m === void 0 ? NaN : _m, _o = _l.y, datumY = _o === void 0 ? NaN : _o;
                        var isInRange = ((_c = xAxis) === null || _c === void 0 ? void 0 : _c.inRange(datumX)) && ((_d = yAxis) === null || _d === void 0 ? void 0 : _d.inRange(datumY));
                        if (!isInRange) {
                            continue;
                        }
                        // No need to use Math.sqrt() since x < y implies Math.sqrt(x) < Math.sqrt(y) for
                        // values > 1
                        var distance = Math.max(Math.pow((hitPoint.x - datumX), 2) + Math.pow((hitPoint.y - datumY), 2), 0);
                        if (distance < minDistance) {
                            minDistance = distance;
                            closestDatum = datum;
                        }
                    }
                }
                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                finally {
                    try {
                        if (_j && !_j.done && (_b = _h.return)) _b.call(_h);
                    }
                    finally { if (e_6) throw e_6.error; }
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (contextNodeData_2_1 && !contextNodeData_2_1.done && (_a = contextNodeData_2.return)) _a.call(contextNodeData_2);
            }
            finally { if (e_5) throw e_5.error; }
        }
        if (closestDatum) {
            var distance = Math.max(Math.sqrt(minDistance) - (_f = (_e = closestDatum.point) === null || _e === void 0 ? void 0 : _e.size, (_f !== null && _f !== void 0 ? _f : 0)), 0);
            return { datum: closestDatum, distance: distance };
        }
    };
    CartesianSeries.prototype.pickNodeMainAxisFirst = function (point, requireCategoryAxis) {
        var e_7, _a, e_8, _b;
        var _c, _d, _e, _f;
        var x = point.x, y = point.y;
        var _g = this, xAxis = _g.xAxis, yAxis = _g.yAxis, group = _g.group, contextNodeData = _g._contextNodeData;
        // Prefer to start search with any available category axis.
        var directions = [xAxis, yAxis]
            .filter(function (a) { return a instanceof CategoryAxis; })
            .map(function (a) { return a.direction; });
        if (requireCategoryAxis && directions.length === 0) {
            return;
        }
        // Default to X-axis unless we found a suitable category axis.
        var _h = __read(directions, 1), _j = _h[0], primaryDirection = _j === void 0 ? ChartAxisDirection.X : _j;
        var hitPoint = group.transformPoint(x, y);
        var hitPointCoords = primaryDirection === ChartAxisDirection.X ? [hitPoint.x, hitPoint.y] : [hitPoint.y, hitPoint.x];
        var minDistance = [Infinity, Infinity];
        var closestDatum = undefined;
        try {
            for (var contextNodeData_3 = __values(contextNodeData), contextNodeData_3_1 = contextNodeData_3.next(); !contextNodeData_3_1.done; contextNodeData_3_1 = contextNodeData_3.next()) {
                var context = contextNodeData_3_1.value;
                try {
                    for (var _k = (e_8 = void 0, __values(context.nodeData)), _l = _k.next(); !_l.done; _l = _k.next()) {
                        var datum = _l.value;
                        var _m = datum.point, _o = _m === void 0 ? {} : _m, _p = _o.x, datumX = _p === void 0 ? NaN : _p, _q = _o.y, datumY = _q === void 0 ? NaN : _q;
                        var isInRange = ((_c = xAxis) === null || _c === void 0 ? void 0 : _c.inRange(datumX)) && ((_d = yAxis) === null || _d === void 0 ? void 0 : _d.inRange(datumY));
                        if (!isInRange) {
                            continue;
                        }
                        var point_1 = primaryDirection === ChartAxisDirection.X ? [datumX, datumY] : [datumY, datumX];
                        // Compare distances from most significant dimension to least.
                        var newMinDistance = true;
                        for (var i = 0; i < point_1.length; i++) {
                            var dist = Math.abs(point_1[i] - hitPointCoords[i]);
                            if (dist > minDistance[i]) {
                                newMinDistance = false;
                                break;
                            }
                            if (dist < minDistance[i]) {
                                minDistance[i] = dist;
                                minDistance.fill(Infinity, i + 1, minDistance.length);
                            }
                        }
                        if (newMinDistance) {
                            closestDatum = datum;
                        }
                    }
                }
                catch (e_8_1) { e_8 = { error: e_8_1 }; }
                finally {
                    try {
                        if (_l && !_l.done && (_b = _k.return)) _b.call(_k);
                    }
                    finally { if (e_8) throw e_8.error; }
                }
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (contextNodeData_3_1 && !contextNodeData_3_1.done && (_a = contextNodeData_3.return)) _a.call(contextNodeData_3);
            }
            finally { if (e_7) throw e_7.error; }
        }
        if (closestDatum) {
            var distance = Math.max(Math.sqrt(Math.pow(minDistance[0], 2) + Math.pow(minDistance[1], 2)) - (_f = (_e = closestDatum.point) === null || _e === void 0 ? void 0 : _e.size, (_f !== null && _f !== void 0 ? _f : 0)), 0);
            return { datum: closestDatum, distance: distance };
        }
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
    CartesianSeries.prototype.getLabelData = function () {
        return [];
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
    CartesianSeries.prototype.updateHighlightSelectionLabel = function (opts) {
        var item = opts.item, highlightLabelSelection = opts.highlightLabelSelection;
        var labelData = item ? [item] : [];
        return this.updateLabelSelection({ labelData: labelData, labelSelection: highlightLabelSelection, seriesIdx: -1 });
    };
    CartesianSeries.prototype.updateDatumSelection = function (opts) {
        // Override point for sub-classes.
        return opts.datumSelection;
    };
    CartesianSeries.prototype.updateDatumNodes = function (_opts) {
        // Override point for sub-classes.
    };
    CartesianSeries.prototype.updateMarkerSelection = function (opts) {
        // Override point for sub-classes.
        return opts.markerSelection;
    };
    CartesianSeries.prototype.updateMarkerNodes = function (_opts) {
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
