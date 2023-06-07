var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Series, SeriesNodeBaseClickEvent, } from '../series';
import { SeriesMarker } from '../seriesMarker';
import { isContinuous, isDiscrete } from '../../../util/value';
import { Path } from '../../../scene/shape/path';
import { Selection } from '../../../scene/selection';
import { Group } from '../../../scene/group';
import { Text } from '../../../scene/shape/text';
import { RedrawType, SceneChangeDetection } from '../../../scene/changeDetectable';
import { CategoryAxis } from '../../axis/categoryAxis';
import { Layers } from '../../layers';
import { OPT_FUNCTION, Validate } from '../../../util/validation';
import { jsonDiff } from '../../../util/json';
import { ChartAxisDirection } from '../../chartAxisDirection';
import { getMarker } from '../../marker/util';
import { StateMachine } from '../../../motion/states';
const DEFAULT_DIRECTION_KEYS = {
    [ChartAxisDirection.X]: ['xKey'],
    [ChartAxisDirection.Y]: ['yKey'],
};
const DEFAULT_DIRECTION_NAMES = {
    [ChartAxisDirection.X]: ['xName'],
    [ChartAxisDirection.Y]: ['yName'],
};
export class CartesianSeriesNodeBaseClickEvent extends SeriesNodeBaseClickEvent {
    constructor(xKey, yKey, nativeEvent, datum, series) {
        super(nativeEvent, datum, series);
        this.xKey = xKey;
        this.yKey = yKey;
    }
}
export class CartesianSeriesNodeClickEvent extends CartesianSeriesNodeBaseClickEvent {
    constructor() {
        super(...arguments);
        this.type = 'nodeClick';
    }
}
export class CartesianSeriesNodeDoubleClickEvent extends CartesianSeriesNodeBaseClickEvent {
    constructor() {
        super(...arguments);
        this.type = 'nodeDoubleClick';
    }
}
class CartesianStateMachine extends StateMachine {
}
export class CartesianSeries extends Series {
    constructor(opts) {
        var _a, _b;
        super(Object.assign(Object.assign({}, opts), { useSeriesGroupLayer: true, directionKeys: (_a = opts.directionKeys) !== null && _a !== void 0 ? _a : DEFAULT_DIRECTION_KEYS, directionNames: (_b = opts.directionNames) !== null && _b !== void 0 ? _b : DEFAULT_DIRECTION_NAMES }));
        this._contextNodeData = [];
        this.nodeDataDependencies = {};
        this.highlightSelection = Selection.select(this.highlightNode, () => this.opts.hasMarkers ? this.markerFactory() : this.nodeFactory());
        this.highlightLabelSelection = Selection.select(this.highlightLabel, Text);
        this.subGroups = [];
        this.subGroupId = 0;
        /**
         * The assumption is that the values will be reset (to `true`)
         * in the {@link yKeys} setter.
         */
        this.seriesItemEnabled = new Map();
        const { pathsPerSeries = 1, hasMarkers = false, pathsZIndexSubOrderOffset = [] } = opts;
        this.opts = { pathsPerSeries, hasMarkers, pathsZIndexSubOrderOffset };
        this.animationState = new CartesianStateMachine('empty', {
            empty: {
                on: {
                    update: {
                        target: 'ready',
                        action: (data) => this.animateEmptyUpdateReady(data),
                    },
                },
            },
            ready: {
                on: {
                    update: {
                        target: 'ready',
                        action: (data) => this.animateReadyUpdate(data),
                    },
                    highlight: {
                        target: 'ready',
                        action: (data) => this.animateReadyHighlight(data),
                    },
                    highlightMarkers: {
                        target: 'ready',
                        action: (data) => this.animateReadyHighlightMarkers(data),
                    },
                    resize: {
                        target: 'ready',
                        action: (data) => this.animateReadyResize(data),
                    },
                },
            },
        });
    }
    get contextNodeData() {
        var _a;
        return (_a = this._contextNodeData) === null || _a === void 0 ? void 0 : _a.slice();
    }
    addChartEventListeners() {
        var _a, _b;
        (_a = this.chartEventManager) === null || _a === void 0 ? void 0 : _a.addListener('legend-item-click', (event) => this.onLegendItemClick(event));
        (_b = this.chartEventManager) === null || _b === void 0 ? void 0 : _b.addListener('legend-item-double-click', (event) => this.onLegendItemDoubleClick(event));
    }
    destroy() {
        super.destroy();
        this._contextNodeData.splice(0, this._contextNodeData.length);
        this.subGroups.splice(0, this.subGroups.length);
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
    update({ seriesRect }) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const { seriesItemEnabled, visible } = this;
            const { series } = (_b = (_a = this.highlightManager) === null || _a === void 0 ? void 0 : _a.getActiveHighlight()) !== null && _b !== void 0 ? _b : {};
            const seriesHighlighted = series ? series === this : undefined;
            const anySeriesItemEnabled = (visible && seriesItemEnabled.size === 0) || [...seriesItemEnabled.values()].some((v) => v === true);
            const newNodeDataDependencies = {
                seriesRectWidth: seriesRect === null || seriesRect === void 0 ? void 0 : seriesRect.width,
                seriesRectHeight: seriesRect === null || seriesRect === void 0 ? void 0 : seriesRect.height,
            };
            if (jsonDiff(this.nodeDataDependencies, newNodeDataDependencies) != null) {
                this.nodeDataDependencies = newNodeDataDependencies;
                this.markNodeDataDirty();
                this.animationState.transition('resize', {
                    datumSelections: this.subGroups.map(({ datumSelection }) => datumSelection),
                    markerSelections: this.subGroups.map(({ markerSelection }) => markerSelection),
                    contextData: this._contextNodeData,
                    paths: this.subGroups.map(({ paths }) => paths),
                });
            }
            yield this.updateSelections(seriesHighlighted, anySeriesItemEnabled);
            yield this.updateNodes(seriesHighlighted, anySeriesItemEnabled);
            this.animationState.transition('update', {
                datumSelections: this.subGroups.map(({ datumSelection }) => datumSelection),
                markerSelections: this.subGroups.map(({ markerSelection }) => markerSelection),
                labelSelections: this.subGroups.map(({ labelSelection }) => labelSelection),
                contextData: this._contextNodeData,
                paths: this.subGroups.map(({ paths }) => paths),
                seriesRect,
            });
        });
    }
    updateSelections(seriesHighlighted, anySeriesItemEnabled) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateHighlightSelection(seriesHighlighted);
            if (!anySeriesItemEnabled) {
                return;
            }
            if (!this.nodeDataRefresh && !this.isPathOrSelectionDirty()) {
                return;
            }
            if (this.nodeDataRefresh) {
                this.nodeDataRefresh = false;
                this._contextNodeData = yield this.createNodeData();
                yield this.updateSeriesGroups();
            }
            yield Promise.all(this.subGroups.map((g, i) => this.updateSeriesGroupSelections(g, i)));
        });
    }
    updateSeriesGroupSelections(subGroup, seriesIdx) {
        return __awaiter(this, void 0, void 0, function* () {
            const { datumSelection, labelSelection, markerSelection } = subGroup;
            const contextData = this._contextNodeData[seriesIdx];
            const { nodeData, labelData } = contextData;
            subGroup.datumSelection = yield this.updateDatumSelection({ nodeData, datumSelection, seriesIdx });
            subGroup.labelSelection = yield this.updateLabelSelection({ labelData, labelSelection, seriesIdx });
            if (markerSelection) {
                subGroup.markerSelection = yield this.updateMarkerSelection({
                    nodeData,
                    markerSelection,
                    seriesIdx,
                });
            }
        });
    }
    nodeFactory() {
        return new Group();
    }
    markerFactory() {
        const MarkerShape = getMarker();
        return new MarkerShape();
    }
    updateSeriesGroups() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { _contextNodeData: contextNodeData, contentGroup, subGroups, opts: { pathsPerSeries, hasMarkers, pathsZIndexSubOrderOffset }, } = this;
            if (contextNodeData.length === subGroups.length) {
                return;
            }
            if (contextNodeData.length < subGroups.length) {
                subGroups.splice(contextNodeData.length).forEach(({ dataNodeGroup, markerGroup, labelGroup, paths }) => {
                    contentGroup.removeChild(dataNodeGroup);
                    if (markerGroup) {
                        contentGroup.removeChild(markerGroup);
                    }
                    if (labelGroup) {
                        contentGroup.removeChild(labelGroup);
                    }
                    for (const path of paths) {
                        contentGroup.removeChild(path);
                    }
                });
            }
            const totalGroups = contextNodeData.length;
            while (totalGroups > subGroups.length) {
                const layer = false;
                const subGroupId = this.subGroupId++;
                const subGroupZOffset = subGroupId;
                const dataNodeGroup = new Group({
                    name: `${this.id}-series-sub${subGroupId}-dataNodes`,
                    layer,
                    zIndex: Layers.SERIES_LAYER_ZINDEX,
                    zIndexSubOrder: [() => this._declarationOrder, subGroupZOffset],
                });
                const markerGroup = hasMarkers
                    ? new Group({
                        name: `${this.id}-series-sub${this.subGroupId++}-markers`,
                        layer,
                        zIndex: Layers.SERIES_LAYER_ZINDEX,
                        zIndexSubOrder: [() => this._declarationOrder, 10000 + subGroupId],
                    })
                    : undefined;
                const labelGroup = new Group({
                    name: `${this.id}-series-sub${this.subGroupId++}-labels`,
                    layer,
                    zIndex: Layers.SERIES_LABEL_ZINDEX,
                    zIndexSubOrder: [() => this._declarationOrder, subGroupId],
                });
                contentGroup.appendChild(dataNodeGroup);
                contentGroup.appendChild(labelGroup);
                if (markerGroup) {
                    contentGroup.appendChild(markerGroup);
                }
                const paths = [];
                for (let index = 0; index < pathsPerSeries; index++) {
                    paths[index] = new Path();
                    paths[index].zIndex = Layers.SERIES_LAYER_ZINDEX;
                    paths[index].zIndexSubOrder = [
                        () => this._declarationOrder,
                        ((_a = pathsZIndexSubOrderOffset[index]) !== null && _a !== void 0 ? _a : 0) + subGroupZOffset,
                    ];
                    contentGroup.appendChild(paths[index]);
                }
                subGroups.push({
                    paths,
                    dataNodeGroup,
                    markerGroup,
                    labelGroup,
                    labelSelection: Selection.select(labelGroup, Text),
                    datumSelection: Selection.select(dataNodeGroup, () => this.nodeFactory()),
                    markerSelection: markerGroup ? Selection.select(markerGroup, () => this.markerFactory()) : undefined,
                });
            }
        });
    }
    updateNodes(seriesHighlighted, anySeriesItemEnabled) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { highlightSelection, highlightLabelSelection, _contextNodeData: contextNodeData, seriesItemEnabled, opts: { hasMarkers }, } = this;
            const visible = this.visible && ((_a = this._contextNodeData) === null || _a === void 0 ? void 0 : _a.length) > 0 && anySeriesItemEnabled;
            this.rootGroup.visible = visible;
            this.contentGroup.visible = visible;
            this.highlightGroup.visible = visible && !!seriesHighlighted;
            const seriesOpacity = this.getOpacity();
            const subGroupOpacities = this.subGroups.map((_, index) => {
                const { itemId } = contextNodeData[index];
                return this.getOpacity({ itemId });
            });
            const isSubGroupOpacityDifferent = subGroupOpacities.some((subOp) => subOp !== seriesOpacity);
            this.contentGroup.opacity = isSubGroupOpacityDifferent ? 1 : seriesOpacity;
            if (hasMarkers) {
                yield this.updateMarkerNodes({
                    markerSelection: highlightSelection,
                    isHighlight: true,
                    seriesIdx: -1,
                });
                this.animationState.transition('highlightMarkers', highlightSelection);
            }
            else {
                yield this.updateDatumNodes({ datumSelection: highlightSelection, isHighlight: true, seriesIdx: -1 });
                this.animationState.transition('highlight', highlightSelection);
            }
            yield this.updateLabelNodes({ labelSelection: highlightLabelSelection, seriesIdx: -1 });
            yield Promise.all(this.subGroups.map((subGroup, seriesIdx) => __awaiter(this, void 0, void 0, function* () {
                var _b;
                const { dataNodeGroup, markerGroup, datumSelection, labelSelection, markerSelection, paths, labelGroup, } = subGroup;
                const { itemId } = contextNodeData[seriesIdx];
                const subGroupVisible = visible && ((_b = seriesItemEnabled.get(itemId)) !== null && _b !== void 0 ? _b : true);
                const subGroupOpacity = isSubGroupOpacityDifferent ? subGroupOpacities[seriesIdx] : 1;
                dataNodeGroup.opacity = subGroupOpacity;
                dataNodeGroup.visible = subGroupVisible;
                labelGroup.visible = subGroupVisible;
                if (markerGroup) {
                    markerGroup.opacity = subGroupOpacity;
                    markerGroup.zIndex =
                        dataNodeGroup.zIndex >= Layers.SERIES_LAYER_ZINDEX
                            ? dataNodeGroup.zIndex
                            : dataNodeGroup.zIndex + 1;
                    markerGroup.visible = subGroupVisible;
                }
                if (labelGroup) {
                    labelGroup.opacity = subGroupOpacity;
                }
                for (const path of paths) {
                    path.opacity = subGroupOpacity;
                    path.visible = subGroupVisible;
                }
                if (!dataNodeGroup.visible) {
                    return;
                }
                yield this.updateDatumNodes({ datumSelection, isHighlight: false, seriesIdx });
                yield this.updateLabelNodes({ labelSelection, seriesIdx });
                if (hasMarkers && markerSelection) {
                    yield this.updateMarkerNodes({ markerSelection, isHighlight: false, seriesIdx });
                }
            })));
        });
    }
    updateHighlightSelection(seriesHighlighted) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { highlightSelection, highlightLabelSelection, _contextNodeData: contextNodeData } = this;
            const highlightedDatum = (_a = this.highlightManager) === null || _a === void 0 ? void 0 : _a.getActiveHighlight();
            const item = seriesHighlighted && (highlightedDatum === null || highlightedDatum === void 0 ? void 0 : highlightedDatum.datum) ? highlightedDatum : undefined;
            this.highlightSelection = yield this.updateHighlightSelectionItem({ item, highlightSelection });
            let labelItem;
            if (this.isLabelEnabled() && item != null) {
                const { itemId = undefined } = item;
                for (const { labelData } of contextNodeData) {
                    labelItem = labelData.find((ld) => ld.datum === item.datum && ld.itemId === itemId);
                    if (labelItem != null) {
                        break;
                    }
                }
            }
            this.highlightLabelSelection = yield this.updateHighlightSelectionLabel({
                item: labelItem,
                highlightLabelSelection,
            });
        });
    }
    pickNodeExactShape(point) {
        const result = super.pickNodeExactShape(point);
        if (result) {
            return result;
        }
        const { x, y } = point;
        const { opts: { hasMarkers }, } = this;
        for (const { dataNodeGroup, markerGroup } of this.subGroups) {
            let match = dataNodeGroup.pickNode(x, y);
            if (!match && hasMarkers) {
                match = markerGroup === null || markerGroup === void 0 ? void 0 : markerGroup.pickNode(x, y);
            }
            if (match) {
                return { datum: match.datum, distance: 0 };
            }
        }
    }
    pickNodeClosestDatum(point) {
        var _a, _b;
        const { x, y } = point;
        const { xAxis, yAxis, rootGroup, _contextNodeData: contextNodeData } = this;
        const hitPoint = rootGroup.transformPoint(x, y);
        let minDistance = Infinity;
        let closestDatum;
        for (const context of contextNodeData) {
            for (const datum of context.nodeData) {
                const { point: { x: datumX = NaN, y: datumY = NaN } = {} } = datum;
                if (isNaN(datumX) || isNaN(datumY)) {
                    continue;
                }
                const isInRange = (xAxis === null || xAxis === void 0 ? void 0 : xAxis.inRange(datumX)) && (yAxis === null || yAxis === void 0 ? void 0 : yAxis.inRange(datumY));
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
            const distance = Math.max(Math.sqrt(minDistance) - ((_b = (_a = closestDatum.point) === null || _a === void 0 ? void 0 : _a.size) !== null && _b !== void 0 ? _b : 0), 0);
            return { datum: closestDatum, distance };
        }
    }
    pickNodeMainAxisFirst(point, requireCategoryAxis) {
        var _a, _b;
        const { x, y } = point;
        const { xAxis, yAxis, rootGroup, _contextNodeData: contextNodeData } = this;
        // Prefer to start search with any available category axis.
        const directions = [xAxis, yAxis]
            .filter((a) => a instanceof CategoryAxis)
            .map((a) => a.direction);
        if (requireCategoryAxis && directions.length === 0) {
            return;
        }
        // Default to X-axis unless we found a suitable category axis.
        const [primaryDirection = ChartAxisDirection.X] = directions;
        const hitPoint = rootGroup.transformPoint(x, y);
        const hitPointCoords = primaryDirection === ChartAxisDirection.X ? [hitPoint.x, hitPoint.y] : [hitPoint.y, hitPoint.x];
        const minDistance = [Infinity, Infinity];
        let closestDatum = undefined;
        for (const context of contextNodeData) {
            for (const datum of context.nodeData) {
                const { point: { x: datumX = NaN, y: datumY = NaN } = {} } = datum;
                if (isNaN(datumX) || isNaN(datumY)) {
                    continue;
                }
                const isInRange = (xAxis === null || xAxis === void 0 ? void 0 : xAxis.inRange(datumX)) && (yAxis === null || yAxis === void 0 ? void 0 : yAxis.inRange(datumY));
                if (!isInRange) {
                    continue;
                }
                const point = primaryDirection === ChartAxisDirection.X ? [datumX, datumY] : [datumY, datumX];
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
            const distance = Math.max(Math.sqrt(Math.pow(minDistance[0], 2) + Math.pow(minDistance[1], 2)) - ((_b = (_a = closestDatum.point) === null || _a === void 0 ? void 0 : _a.size) !== null && _b !== void 0 ? _b : 0), 0);
            return { datum: closestDatum, distance };
        }
    }
    onLegendItemClick(event) {
        const { enabled, itemId, series } = event;
        if (series.id !== this.id)
            return;
        this.toggleSeriesItem(itemId, enabled);
    }
    onLegendItemDoubleClick(event) {
        const { enabled, itemId, series, numVisibleItems } = event;
        const totalVisibleItems = Object.values(numVisibleItems).reduce((p, v) => p + v, 0);
        const wasClicked = series.id === this.id;
        const newEnabled = wasClicked || (enabled && totalVisibleItems === 1);
        this.toggleSeriesItem(itemId, newEnabled);
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
    isEnabled() {
        if (this.seriesItemEnabled.size > 0) {
            for (const [, enabled] of this.seriesItemEnabled) {
                if (enabled) {
                    return true;
                }
            }
            return false;
        }
        return super.isEnabled();
    }
    isPathOrSelectionDirty() {
        // Override point to allow more sophisticated dirty selection detection.
        return false;
    }
    getLabelData() {
        return [];
    }
    isAnySeriesVisible() {
        for (const visible of this.seriesItemEnabled.values()) {
            if (visible) {
                return true;
            }
        }
        return false;
    }
    updateHighlightSelectionItem(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const { opts: { hasMarkers }, } = this;
            const { item, highlightSelection } = opts;
            const nodeData = item ? [item] : [];
            if (hasMarkers) {
                const markerSelection = highlightSelection;
                return this.updateMarkerSelection({ nodeData, markerSelection, seriesIdx: -1 });
            }
            else {
                return this.updateDatumSelection({ nodeData, datumSelection: highlightSelection, seriesIdx: -1 });
            }
        });
    }
    updateHighlightSelectionLabel(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const { item, highlightLabelSelection } = opts;
            const labelData = item ? [item] : [];
            return this.updateLabelSelection({ labelData, labelSelection: highlightLabelSelection, seriesIdx: -1 });
        });
    }
    updateDatumSelection(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            // Override point for sub-classes.
            return opts.datumSelection;
        });
    }
    updateDatumNodes(_opts) {
        return __awaiter(this, void 0, void 0, function* () {
            // Override point for sub-classes.
        });
    }
    updateMarkerSelection(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            // Override point for sub-classes.
            return opts.markerSelection;
        });
    }
    updateMarkerNodes(_opts) {
        return __awaiter(this, void 0, void 0, function* () {
            // Override point for sub-classes.
        });
    }
    animateEmptyUpdateReady(_data) {
        // Override point for sub-classes.
    }
    animateReadyUpdate(_data) {
        // Override point for sub-classes.
    }
    animateReadyHighlight(_data) {
        // Override point for sub-classes.
    }
    animateReadyHighlightMarkers(_data) {
        // Override point for sub-classes.
    }
    animateReadyResize(_data) {
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
    Validate(OPT_FUNCTION),
    SceneChangeDetection({ redraw: RedrawType.MAJOR })
], CartesianSeriesMarker.prototype, "formatter", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FydGVzaWFuU2VyaWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L3Nlcmllcy9jYXJ0ZXNpYW4vY2FydGVzaWFuU2VyaWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFDSCxNQUFNLEVBS04sd0JBQXdCLEdBQzNCLE1BQU0sV0FBVyxDQUFDO0FBRW5CLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMvQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQy9ELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNqRCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFckQsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUVqRCxPQUFPLEVBQUUsVUFBVSxFQUFFLG9CQUFvQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDbkYsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRXZELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFFdEMsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUNsRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFHOUMsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDOUQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRzlDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQWdDdEQsTUFBTSxzQkFBc0IsR0FBK0M7SUFDdkUsQ0FBQyxrQkFB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