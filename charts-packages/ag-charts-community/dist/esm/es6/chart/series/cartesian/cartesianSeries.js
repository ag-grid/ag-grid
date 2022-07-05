var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Series } from '../series';
import { ChartAxisDirection } from '../../chartAxis';
import { SeriesMarker } from '../seriesMarker';
import { isContinuous, isDiscrete } from '../../../util/value';
import { Path } from '../../../scene/shape/path';
import { Selection } from '../../../scene/selection';
import { Group } from '../../../scene/group';
import { RedrawType, SceneChangeDetection } from '../../../scene/changeDetectable';
export class CartesianSeries extends Series {
    constructor(opts = {}) {
        super({ seriesGroupUsesLayer: false });
        this.highlightSelection = Selection.select(this.highlightGroup).selectAll();
        this.subGroups = [];
        this.subGroupId = 0;
        /**
         * The assumption is that the values will be reset (to `true`)
         * in the {@link yKeys} setter.
         */
        this.seriesItemEnabled = new Map();
        this.directionKeys = {
            [ChartAxisDirection.X]: ['xKey'],
            [ChartAxisDirection.Y]: ['yKey'],
        };
        const { pickGroupIncludes = ['datumNodes'], pathsPerSeries = 1, features = [], } = opts;
        this.opts = { pickGroupIncludes, pathsPerSeries, features };
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
        const isValidDatum = ((isContinuousX && isContinuous(x)) || (!isContinuousX && isDiscrete(x))) &&
            ((isContinuousY && isContinuous(y)) || (!isContinuousY && isDiscrete(y)));
        return isValidDatum ? [x, y] : undefined;
    }
    /**
     * Note: we are passing `isContinuousScale` into this method because it will
     *       typically be called inside a loop and this check only needs to happen once.
     * @param value A domain value to be plotted along an axis.
     * @param isContinuousScale Typically this will be the value of `xAxis.scale instanceof ContinuousScale` or `yAxis.scale instanceof ContinuousScale`.
     * @returns `value`, if the value is valid for its axis/scale, or `undefined`.
     */
    checkDatum(value, isContinuousScale) {
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
        const anySeriesItemEnabled = (visible && seriesItemEnabled.size === 0) || [...seriesItemEnabled.values()].some(v => v === true);
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
            this.contextNodeData = this.createNodeData();
            this.updateSeriesGroups();
        }
        this.subGroups.forEach((subGroup, seriesIdx) => {
            const { datumSelection, labelSelection, markerSelection, paths } = subGroup;
            const contextData = this.contextNodeData[seriesIdx];
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
        const { contextNodeData, subGroups, opts: { pickGroupIncludes, pathsPerSeries, features }, } = this;
        if (contextNodeData.length === subGroups.length) {
            return;
        }
        if (contextNodeData.length < subGroups.length) {
            subGroups.splice(contextNodeData.length)
                .forEach(({ group, markerGroup }) => {
                this.seriesGroup.removeChild(group);
                if (markerGroup) {
                    this.seriesGroup.removeChild(markerGroup);
                }
            });
        }
        while (contextNodeData.length > subGroups.length) {
            const group = new Group({
                name: `${this.id}-series-sub${this.subGroupId++}`,
                layer: true,
                zIndex: Series.SERIES_LAYER_ZINDEX,
            });
            const markerGroup = features.includes('markers') ?
                new Group({
                    name: `${this.id}-series-sub${this.subGroupId++}-markers`,
                    layer: true,
                    zIndex: Series.SERIES_LAYER_ZINDEX,
                }) :
                undefined;
            const pickGroup = new Group();
            const pathParentGroup = pickGroupIncludes.includes('mainPath') ? pickGroup : group;
            const datumParentGroup = pickGroupIncludes.includes('datumNodes') ? pickGroup : group;
            this.seriesGroup.appendChild(group);
            if (markerGroup) {
                this.seriesGroup.appendChild(markerGroup);
            }
            const paths = [];
            for (let index = 0; index < pathsPerSeries; index++) {
                paths[index] = new Path();
                pathParentGroup.appendChild(paths[index]);
            }
            group.appendChild(pickGroup);
            subGroups.push({
                paths,
                group,
                pickGroup,
                markerGroup,
                labelSelection: Selection.select(group).selectAll(),
                datumSelection: Selection.select(datumParentGroup).selectAll(),
                markerSelection: markerGroup ? Selection.select(markerGroup).selectAll() : undefined,
            });
        }
    }
    updateNodes(seriesHighlighted, anySeriesItemEnabled) {
        var _a;
        const { highlightSelection, contextNodeData, seriesItemEnabled, opts: { features } } = this;
        const markersEnabled = features.includes('markers');
        const visible = this.visible && ((_a = this.contextNodeData) === null || _a === void 0 ? void 0 : _a.length) > 0 && anySeriesItemEnabled;
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
        this.subGroups.forEach((subGroup, seriesIdx) => {
            var _a;
            const { group, markerGroup, datumSelection, labelSelection, markerSelection, paths } = subGroup;
            const { itemId } = contextNodeData[seriesIdx];
            group.opacity = this.getOpacity({ itemId });
            group.zIndex = this.getZIndex({ itemId });
            group.visible = visible && (_a = seriesItemEnabled.get(itemId), (_a !== null && _a !== void 0 ? _a : true));
            if (markerGroup) {
                markerGroup.opacity = group.opacity;
                markerGroup.zIndex = group.zIndex >= Series.SERIES_LAYER_ZINDEX ? group.zIndex : group.zIndex + 1;
                markerGroup.visible = group.visible;
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
        const { chart: { highlightedDatum: { datum = undefined } = {}, highlightedDatum = undefined } = {}, highlightSelection, } = this;
        const item = seriesHighlighted && highlightedDatum && datum ? highlightedDatum : undefined;
        this.highlightSelection = this.updateHighlightSelectionItem({ item, highlightSelection });
    }
    pickNode(x, y) {
        var _a;
        let result = super.pickNode(x, y);
        if (!result) {
            const { opts: { pickGroupIncludes } } = this;
            const markerGroupIncluded = pickGroupIncludes.includes('markers');
            for (const { pickGroup, markerGroup } of this.subGroups) {
                result = pickGroup.pickNode(x, y);
                if (!result && markerGroupIncluded) {
                    result = (_a = markerGroup) === null || _a === void 0 ? void 0 : _a.pickNode(x, y);
                }
                if (result) {
                    break;
                }
            }
        }
        return result;
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
    updatePaths(opts) {
        // Override point for sub-classes.
        opts.paths.forEach((p) => (p.visible = false));
    }
    updatePathNodes(_opts) {
        // Override point for sub-classes.
    }
    updateHighlightSelectionItem(opts) {
        const { opts: { features } } = this;
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
    updateDatumSelection(opts) {
        // Override point for sub-classes.
        return opts.datumSelection;
    }
    updateDatumNodes(opts) {
        // Override point for sub-classes.
    }
    updateMarkerSelection(opts) {
        // Override point for sub-classes.
        return opts.markerSelection;
    }
    updateMarkerNodes(opts) {
        // Override point for sub-classes.
    }
}
export class CartesianSeriesMarker extends SeriesMarker {
    constructor() {
        super(...arguments);
        this.formatter = undefined;
    }
}
__decorate([
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], CartesianSeriesMarker.prototype, "formatter", void 0);
//# sourceMappingURL=cartesianSeries.js.map