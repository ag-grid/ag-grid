"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const series_1 = require("../series");
const chartAxis_1 = require("../../chartAxis");
const seriesMarker_1 = require("../seriesMarker");
const value_1 = require("../../../util/value");
const path_1 = require("../../../scene/shape/path");
const selection_1 = require("../../../scene/selection");
const group_1 = require("../../../scene/group");
const changeDetectable_1 = require("../../../scene/changeDetectable");
const categoryAxis_1 = require("../../axis/categoryAxis");
const layers_1 = require("../../layers");
class CartesianSeries extends series_1.Series {
    constructor(opts = {}) {
        super({ seriesGroupUsesLayer: true, pickModes: opts.pickModes });
        this.highlightSelection = selection_1.Selection.select(this.highlightNode).selectAll();
        this.highlightLabelSelection = selection_1.Selection.select(this.highlightLabel).selectAll();
        this.subGroups = [];
        this.subGroupId = 0;
        /**
         * The assumption is that the values will be reset (to `true`)
         * in the {@link yKeys} setter.
         */
        this.seriesItemEnabled = new Map();
        this.directionKeys = {
            [chartAxis_1.ChartAxisDirection.X]: ['xKey'],
            [chartAxis_1.ChartAxisDirection.Y]: ['yKey'],
        };
        const { pickGroupIncludes = ['datumNodes'], pathsPerSeries = 1, features = [], pathsZIndexSubOrderOffset = [], } = opts;
        this.opts = { pickGroupIncludes, pathsPerSeries, features, pathsZIndexSubOrderOffset };
    }
    get contextNodeData() {
        var _a;
        return (_a = this._contextNodeData) === null || _a === void 0 ? void 0 : _a.slice();
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
    checkDomainXY(x, y, isContinuousX, isContinuousY) {
        const isValidDatum = ((isContinuousX && value_1.isContinuous(x)) || (!isContinuousX && value_1.isDiscrete(x))) &&
            ((isContinuousY && value_1.isContinuous(y)) || (!isContinuousY && value_1.isDiscrete(y)));
        return isValidDatum ? [x, y] : undefined;
    }
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
    checkRangeXY(x, y, xAxis, yAxis) {
        return !isNaN(x) && !isNaN(y) && xAxis.inRange(x) && yAxis.inRange(y);
    }
    update() {
        const { seriesItemEnabled, visible, chart: { highlightedDatum: { series = undefined } = {} } = {} } = this;
        const seriesHighlighted = series ? series === this : undefined;
        const anySeriesItemEnabled = (visible && seriesItemEnabled.size === 0) || [...seriesItemEnabled.values()].some((v) => v === true);
        this.updateSelections(seriesHighlighted, anySeriesItemEnabled);
        this.updateNodes(seriesHighlighted, anySeriesItemEnabled);
    }
    updateSelections(seriesHighlighted, anySeriesItemEnabled) {
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
        this.subGroups.forEach((subGroup, seriesIdx) => {
            const { datumSelection, labelSelection, markerSelection, paths } = subGroup;
            const contextData = this._contextNodeData[seriesIdx];
            const { nodeData, labelData, itemId } = contextData;
            this.updatePaths({ seriesHighlighted, itemId, contextData, paths, seriesIdx });
            subGroup.datumSelection = this.updateDatumSelection({ nodeData, datumSelection, seriesIdx });
            subGroup.labelSelection = this.updateLabelSelection({ labelData, labelSelection, seriesIdx });
            if (markerSelection) {
                subGroup.markerSelection = this.updateMarkerSelection({ nodeData, markerSelection, seriesIdx });
            }
        });
    }
    updateSeriesGroups() {
        var _a;
        const { _contextNodeData: contextNodeData, seriesGroup, subGroups, opts: { pickGroupIncludes, pathsPerSeries, features, pathsZIndexSubOrderOffset }, } = this;
        if (contextNodeData.length === subGroups.length) {
            return;
        }
        if (contextNodeData.length < subGroups.length) {
            subGroups.splice(contextNodeData.length).forEach(({ group, markerGroup, paths }) => {
                seriesGroup.removeChild(group);
                if (markerGroup) {
                    seriesGroup.removeChild(markerGroup);
                }
                if (!pickGroupIncludes.includes('mainPath')) {
                    for (const path of paths) {
                        seriesGroup.removeChild(path);
                    }
                }
            });
        }
        while (contextNodeData.length > subGroups.length) {
            const layer = false;
            const subGroupId = this.subGroupId++;
            const group = new group_1.Group({
                name: `${this.id}-series-sub${subGroupId}`,
                layer,
                zIndex: layers_1.Layers.SERIES_LAYER_ZINDEX,
                zIndexSubOrder: [this.id, subGroupId],
            });
            const markerGroup = features.includes('markers')
                ? new group_1.Group({
                    name: `${this.id}-series-sub${this.subGroupId++}-markers`,
                    layer,
                    zIndex: layers_1.Layers.SERIES_LAYER_ZINDEX,
                    zIndexSubOrder: [this.id, 10000 + subGroupId],
                })
                : undefined;
            const labelGroup = new group_1.Group({
                name: `${this.id}-series-sub${this.subGroupId++}-labels`,
                layer,
                zIndex: layers_1.Layers.SERIES_LAYER_ZINDEX,
                zIndexSubOrder: [this.id, 20000 + subGroupId],
            });
            const pickGroup = new group_1.Group({
                name: `${this.id}-series-sub${this.subGroupId++}-pickGroup`,
                zIndex: layers_1.Layers.SERIES_LAYER_ZINDEX,
                zIndexSubOrder: [this.id, 10000 + subGroupId],
            });
            const pathParentGroup = pickGroupIncludes.includes('mainPath') ? pickGroup : seriesGroup;
            const datumParentGroup = pickGroupIncludes.includes('datumNodes') ? pickGroup : group;
            seriesGroup.appendChild(group);
            seriesGroup.appendChild(labelGroup);
            if (markerGroup) {
                seriesGroup.appendChild(markerGroup);
            }
            const paths = [];
            for (let index = 0; index < pathsPerSeries; index++) {
                paths[index] = new path_1.Path();
                paths[index].zIndex = layers_1.Layers.SERIES_LAYER_ZINDEX;
                paths[index].zIndexSubOrder = [this.id, (_a = pathsZIndexSubOrderOffset[index], (_a !== null && _a !== void 0 ? _a : 0)) + subGroupId];
                pathParentGroup.appendChild(paths[index]);
            }
            group.appendChild(pickGroup);
            subGroups.push({
                paths,
                group,
                pickGroup,
                markerGroup,
                labelGroup,
                labelSelection: selection_1.Selection.select(labelGroup).selectAll(),
                datumSelection: selection_1.Selection.select(datumParentGroup).selectAll(),
                markerSelection: markerGroup ? selection_1.Selection.select(markerGroup).selectAll() : undefined,
            });
        }
    }
    updateNodes(seriesHighlighted, anySeriesItemEnabled) {
        var _a;
        const { highlightSelection, highlightLabelSelection, _contextNodeData: contextNodeData, seriesItemEnabled, opts: { features }, } = this;
        const markersEnabled = features.includes('markers');
        const visible = this.visible && ((_a = this._contextNodeData) === null || _a === void 0 ? void 0 : _a.length) > 0 && anySeriesItemEnabled;
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
        this.subGroups.forEach((subGroup, seriesIdx) => {
            var _a;
            const { group, markerGroup, datumSelection, labelSelection, markerSelection, paths } = subGroup;
            const { itemId } = contextNodeData[seriesIdx];
            group.opacity = this.getOpacity({ itemId });
            group.visible = visible && (_a = seriesItemEnabled.get(itemId), (_a !== null && _a !== void 0 ? _a : true));
            if (markerGroup) {
                markerGroup.opacity = group.opacity;
                markerGroup.zIndex = group.zIndex >= layers_1.Layers.SERIES_LAYER_ZINDEX ? group.zIndex : group.zIndex + 1;
                markerGroup.visible = group.visible;
            }
            for (const path of paths) {
                path.opacity = group.opacity;
                path.visible = group.visible;
            }
            if (!group.visible) {
                return;
            }
            this.updatePathNodes({ seriesHighlighted, itemId, paths, seriesIdx });
            this.updateDatumNodes({ datumSelection, isHighlight: false, seriesIdx });
            this.updateLabelNodes({ labelSelection, seriesIdx });
            if (markersEnabled && markerSelection) {
                this.updateMarkerNodes({ markerSelection, isHighlight: false, seriesIdx });
            }
        });
    }
    updateHighlightSelection(seriesHighlighted) {
        const { chart: { highlightedDatum: { datum = undefined } = {}, highlightedDatum = undefined } = {}, highlightSelection, highlightLabelSelection, _contextNodeData: contextNodeData, } = this;
        const item = seriesHighlighted && highlightedDatum && datum ? highlightedDatum : undefined;
        this.highlightSelection = this.updateHighlightSelectionItem({ item, highlightSelection });
        let labelItem;
        if (this.label.enabled && item != null) {
            const { itemId = undefined } = item;
            for (const { labelData } of contextNodeData) {
                labelItem = labelData.find((ld) => ld.datum === item.datum && ld.itemId === itemId);
                if (labelItem != null) {
                    break;
                }
            }
        }
        this.highlightLabelSelection = this.updateHighlightSelectionLabel({ item: labelItem, highlightLabelSelection });
    }
    pickNodeExactShape(point) {
        var _a;
        let result = super.pickNodeExactShape(point);
        if (result) {
            return result;
        }
        const { x, y } = point;
        const { opts: { pickGroupIncludes }, } = this;
        const markerGroupIncluded = pickGroupIncludes.includes('markers');
        for (const { pickGroup, markerGroup } of this.subGroups) {
            let match = pickGroup.pickNode(x, y);
            if (!match && markerGroupIncluded) {
                match = (_a = markerGroup) === null || _a === void 0 ? void 0 : _a.pickNode(x, y);
            }
            if (match) {
                return { datum: match.datum, distance: 0 };
            }
        }
    }
    pickNodeClosestDatum(point) {
        var _a, _b, _c, _d;
        const { x, y } = point;
        const { xAxis, yAxis, group, _contextNodeData: contextNodeData } = this;
        const hitPoint = group.transformPoint(x, y);
        let minDistance = Infinity;
        let closestDatum;
        for (const context of contextNodeData) {
            for (const datum of context.nodeData) {
                const { point: { x: datumX = NaN, y: datumY = NaN } = {} } = datum;
                const isInRange = ((_a = xAxis) === null || _a === void 0 ? void 0 : _a.inRange(datumX)) && ((_b = yAxis) === null || _b === void 0 ? void 0 : _b.inRange(datumY));
                if (!isInRange) {
                    continue;
                }
                // No need to use Math.sqrt() since x < y implies Math.sqrt(x) < Math.sqrt(y) for
                // values > 1
                const distance = Math.max(Math.pow((hitPoint.x - datumX), 2) + Math.pow((hitPoint.y - datumY), 2), 0);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestDatum = datum;
                }
            }
        }
        if (closestDatum) {
            const distance = Math.max(Math.sqrt(minDistance) - (_d = (_c = closestDatum.point) === null || _c === void 0 ? void 0 : _c.size, (_d !== null && _d !== void 0 ? _d : 0)), 0);
            return { datum: closestDatum, distance };
        }
    }
    pickNodeMainAxisFirst(point, requireCategoryAxis) {
        var _a, _b, _c, _d;
        const { x, y } = point;
        const { xAxis, yAxis, group, _contextNodeData: contextNodeData } = this;
        // Prefer to start search with any available category axis.
        const directions = [xAxis, yAxis]
            .filter((a) => a instanceof categoryAxis_1.CategoryAxis)
            .map((a) => a.direction);
        if (requireCategoryAxis && directions.length === 0) {
            return;
        }
        // Default to X-axis unless we found a suitable category axis.
        const [primaryDirection = chartAxis_1.ChartAxisDirection.X] = directions;
        const hitPoint = group.transformPoint(x, y);
        const hitPointCoords = primaryDirection === chartAxis_1.ChartAxisDirection.X ? [hitPoint.x, hitPoint.y] : [hitPoint.y, hitPoint.x];
        let minDistance = [Infinity, Infinity];
        let closestDatum = undefined;
        for (const context of contextNodeData) {
            for (const datum of context.nodeData) {
                const { point: { x: datumX = NaN, y: datumY = NaN } = {} } = datum;
                const isInRange = ((_a = xAxis) === null || _a === void 0 ? void 0 : _a.inRange(datumX)) && ((_b = yAxis) === null || _b === void 0 ? void 0 : _b.inRange(datumY));
                if (!isInRange) {
                    continue;
                }
                const point = primaryDirection === chartAxis_1.ChartAxisDirection.X ? [datumX, datumY] : [datumY, datumX];
                // Compare distances from most significant dimension to least.
                let newMinDistance = true;
                for (let i = 0; i < point.length; i++) {
                    const dist = Math.abs(point[i] - hitPointCoords[i]);
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
        if (closestDatum) {
            const distance = Math.max(Math.sqrt(Math.pow(minDistance[0], 2) + Math.pow(minDistance[1], 2)) - (_d = (_c = closestDatum.point) === null || _c === void 0 ? void 0 : _c.size, (_d !== null && _d !== void 0 ? _d : 0)), 0);
            return { datum: closestDatum, distance };
        }
    }
    toggleSeriesItem(itemId, enabled) {
        if (this.seriesItemEnabled.size > 0) {
            this.seriesItemEnabled.set(itemId, enabled);
            this.nodeDataRefresh = true;
        }
        else {
            super.toggleSeriesItem(itemId, enabled);
        }
    }
    isPathOrSelectionDirty() {
        // Override point to allow more sophisticated dirty selection detection.
        return false;
    }
    getLabelData() {
        return [];
    }
    updatePaths(opts) {
        // Override point for sub-classes.
        opts.paths.forEach((p) => (p.visible = false));
    }
    updatePathNodes(_opts) {
        // Override point for sub-classes.
    }
    updateHighlightSelectionItem(opts) {
        const { opts: { features }, } = this;
        const markersEnabled = features.includes('markers');
        const { item, highlightSelection } = opts;
        const nodeData = item ? [item] : [];
        if (markersEnabled) {
            const markerSelection = highlightSelection;
            return this.updateMarkerSelection({ nodeData, markerSelection, seriesIdx: -1 });
        }
        else {
            return this.updateDatumSelection({ nodeData, datumSelection: highlightSelection, seriesIdx: -1 });
        }
    }
    updateHighlightSelectionLabel(opts) {
        const { item, highlightLabelSelection } = opts;
        const labelData = item ? [item] : [];
        return this.updateLabelSelection({ labelData, labelSelection: highlightLabelSelection, seriesIdx: -1 });
    }
    updateDatumSelection(opts) {
        // Override point for sub-classes.
        return opts.datumSelection;
    }
    updateDatumNodes(_opts) {
        // Override point for sub-classes.
    }
    updateMarkerSelection(opts) {
        // Override point for sub-classes.
        return opts.markerSelection;
    }
    updateMarkerNodes(_opts) {
        // Override point for sub-classes.
    }
}
exports.CartesianSeries = CartesianSeries;
class CartesianSeriesMarker extends seriesMarker_1.SeriesMarker {
    constructor() {
        super(...arguments);
        this.formatter = undefined;
    }
}
__decorate([
    changeDetectable_1.SceneChangeDetection({ redraw: changeDetectable_1.RedrawType.MAJOR })
], CartesianSeriesMarker.prototype, "formatter", void 0);
exports.CartesianSeriesMarker = CartesianSeriesMarker;
