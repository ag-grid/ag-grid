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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FydGVzaWFuU2VyaWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L3Nlcmllcy9jYXJ0ZXNpYW4vY2FydGVzaWFuU2VyaWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFDSCxNQUFNLEVBS04sd0JBQXdCLEdBQzNCLE1BQU0sV0FBVyxDQUFDO0FBRW5CLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMvQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQy9ELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNqRCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFckQsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUVqRCxPQUFPLEVBQUUsVUFBVSxFQUFFLG9CQUFvQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDbkYsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRXZELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFFdEMsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUNsRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFHOUMsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDOUQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRzlDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQWdDdEQsTUFBTSxzQkFBc0IsR0FBK0M7SUFDdkUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQztJQUNoQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDO0NBQ25DLENBQUM7QUFFRixNQUFNLHVCQUF1QixHQUErQztJQUN4RSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDO0lBQ2pDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUM7Q0FDcEMsQ0FBQztBQUVGLE1BQU0sT0FBTyxpQ0FBZ0UsU0FBUSx3QkFBK0I7SUFJaEgsWUFBWSxJQUFZLEVBQUUsSUFBWSxFQUFFLFdBQXVCLEVBQUUsS0FBWSxFQUFFLE1BQW1CO1FBQzlGLEtBQUssQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ3JCLENBQUM7Q0FDSjtBQUVELE1BQU0sT0FBTyw2QkFFWCxTQUFRLGlDQUF3QztJQUZsRDs7UUFHYSxTQUFJLEdBQUcsV0FBVyxDQUFDO0lBQ2hDLENBQUM7Q0FBQTtBQUVELE1BQU0sT0FBTyxtQ0FFWCxTQUFRLGlDQUF3QztJQUZsRDs7UUFHYSxTQUFJLEdBQUcsaUJBQWlCLENBQUM7SUFDdEMsQ0FBQztDQUFBO0FBSUQsTUFBTSxxQkFBc0IsU0FBUSxZQUE4RDtDQUFHO0FBRXJHLE1BQU0sT0FBZ0IsZUFHcEIsU0FBUSxNQUFTO0lBNkJmLFlBQ0ksSUFLQzs7UUFFRCxLQUFLLGlDQUNFLElBQUksS0FDUCxtQkFBbUIsRUFBRSxJQUFJLEVBQ3pCLGFBQWEsRUFBRSxNQUFBLElBQUksQ0FBQyxhQUFhLG1DQUFJLHNCQUFzQixFQUMzRCxjQUFjLEVBQUUsTUFBQSxJQUFJLENBQUMsY0FBYyxtQ0FBSSx1QkFBdUIsSUFDaEUsQ0FBQztRQXpDQyxxQkFBZ0IsR0FBUSxFQUFFLENBQUM7UUFLM0IseUJBQW9CLEdBQTRELEVBQUUsQ0FBQztRQUVuRix1QkFBa0IsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsR0FBRyxFQUFFLENBQ25FLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFFLElBQUksQ0FBQyxXQUFXLEVBQVUsQ0FDakQsQ0FBQztRQUNyQiw0QkFBdUIsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFnQyxDQUFDO1FBRXJHLGNBQVMsR0FBdUIsRUFBRSxDQUFDO1FBQ25DLGVBQVUsR0FBVyxDQUFDLENBQUM7UUFNL0I7OztXQUdHO1FBQ2dCLHNCQUFpQixHQUFHLElBQUksR0FBRyxFQUFtQixDQUFDO1FBb0I5RCxNQUFNLEVBQUUsY0FBYyxHQUFHLENBQUMsRUFBRSxVQUFVLEdBQUcsS0FBSyxFQUFFLHlCQUF5QixHQUFHLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQztRQUN4RixJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSx5QkFBeUIsRUFBRSxDQUFDO1FBRXRFLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxxQkFBcUIsQ0FBQyxPQUFPLEVBQUU7WUFDckQsS0FBSyxFQUFFO2dCQUNILEVBQUUsRUFBRTtvQkFDQSxNQUFNLEVBQUU7d0JBQ0osTUFBTSxFQUFFLE9BQU87d0JBQ2YsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDO3FCQUN2RDtpQkFDSjthQUNKO1lBQ0QsS0FBSyxFQUFFO2dCQUNILEVBQUUsRUFBRTtvQkFDQSxNQUFNLEVBQUU7d0JBQ0osTUFBTSxFQUFFLE9BQU87d0JBQ2YsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDO3FCQUNsRDtvQkFDRCxTQUFTLEVBQUU7d0JBQ1AsTUFBTSxFQUFFLE9BQU87d0JBQ2YsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDO3FCQUNyRDtvQkFDRCxNQUFNLEVBQUU7d0JBQ0osTUFBTSxFQUFFLE9BQU87d0JBQ2YsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDO3FCQUNsRDtpQkFDSjthQUNKO1NBQ0osQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQXZFRCxJQUFJLGVBQWU7O1FBQ2YsT0FBTyxNQUFBLElBQUksQ0FBQyxnQkFBZ0IsMENBQUUsS0FBSyxFQUFFLENBQUM7SUFDMUMsQ0FBQztJQXVFRCxzQkFBc0I7O1FBQ2xCLE1BQUEsSUFBSSxDQUFDLGlCQUFpQiwwQ0FBRSxXQUFXLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ25HLE1BQUEsSUFBSSxDQUFDLGlCQUFpQiwwQ0FBRSxXQUFXLENBQUMsMEJBQTBCLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3BILENBQUM7SUFFRCxPQUFPO1FBQ0gsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRWhCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM5RCxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRUQ7Ozs7Ozs7O09BUUc7SUFDTyxhQUFhLENBQU8sQ0FBSSxFQUFFLENBQUksRUFBRSxhQUFzQixFQUFFLGFBQXNCO1FBQ3BGLE1BQU0sWUFBWSxHQUNkLENBQUMsQ0FBQyxhQUFhLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLGFBQWEsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6RSxDQUFDLENBQUMsYUFBYSxJQUFJLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxhQUFhLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM5RSxPQUFPLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztJQUM3QyxDQUFDO0lBRUQ7Ozs7Ozs7OztPQVNHO0lBQ08sWUFBWSxDQUFDLENBQVMsRUFBRSxDQUFTLEVBQUUsS0FBZ0IsRUFBRSxLQUFnQjtRQUMzRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxRSxDQUFDO0lBRUssTUFBTSxDQUFDLEVBQUUsVUFBVSxFQUF5Qjs7O1lBQzlDLE1BQU0sRUFBRSxpQkFBaUIsRUFBRSxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUM7WUFDNUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQUEsTUFBQSxJQUFJLENBQUMsZ0JBQWdCLDBDQUFFLGtCQUFrQixFQUFFLG1DQUFJLEVBQUUsQ0FBQztZQUNyRSxNQUFNLGlCQUFpQixHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBRS9ELE1BQU0sb0JBQW9CLEdBQ3RCLENBQUMsT0FBTyxJQUFJLGlCQUFpQixDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQztZQUV6RyxNQUFNLHVCQUF1QixHQUFHO2dCQUM1QixlQUFlLEVBQUUsVUFBVSxhQUFWLFVBQVUsdUJBQVYsVUFBVSxDQUFFLEtBQUs7Z0JBQ2xDLGdCQUFnQixFQUFFLFVBQVUsYUFBVixVQUFVLHVCQUFWLFVBQVUsQ0FBRSxNQUFNO2FBQ3ZDLENBQUM7WUFDRixJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsdUJBQXVCLENBQUMsSUFBSSxJQUFJLEVBQUU7Z0JBQ3RFLElBQUksQ0FBQyxvQkFBb0IsR0FBRyx1QkFBdUIsQ0FBQztnQkFDcEQsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRTtvQkFDckMsZUFBZSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxjQUFjLEVBQUUsRUFBRSxFQUFFLENBQUMsY0FBYyxDQUFDO29CQUMzRSxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsZUFBZSxFQUFFLEVBQUUsRUFBRSxDQUFDLGVBQWUsQ0FBQztvQkFDOUUsV0FBVyxFQUFFLElBQUksQ0FBQyxnQkFBZ0I7b0JBQ2xDLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQztpQkFDbEQsQ0FBQyxDQUFDO2FBQ047WUFFRCxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxpQkFBaUIsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQ3JFLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBRWhFLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRTtnQkFDckMsZUFBZSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxjQUFjLEVBQUUsRUFBRSxFQUFFLENBQUMsY0FBYyxDQUFDO2dCQUMzRSxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsZUFBZSxFQUFFLEVBQUUsRUFBRSxDQUFDLGVBQWUsQ0FBQztnQkFDOUUsZUFBZSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxjQUFjLEVBQUUsRUFBRSxFQUFFLENBQUMsY0FBYyxDQUFDO2dCQUMzRSxXQUFXLEVBQUUsSUFBSSxDQUFDLGdCQUFnQjtnQkFDbEMsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDO2dCQUMvQyxVQUFVO2FBQ2IsQ0FBQyxDQUFDOztLQUNOO0lBRWUsZ0JBQWdCLENBQUMsaUJBQXNDLEVBQUUsb0JBQTZCOztZQUNsRyxNQUFNLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBRXZELElBQUksQ0FBQyxvQkFBb0IsRUFBRTtnQkFDdkIsT0FBTzthQUNWO1lBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLElBQUksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsRUFBRTtnQkFDekQsT0FBTzthQUNWO1lBQ0QsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFO2dCQUN0QixJQUFJLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQztnQkFFN0IsSUFBSSxDQUFDLGdCQUFnQixHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUNwRCxNQUFNLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO2FBQ25DO1lBRUQsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUYsQ0FBQztLQUFBO0lBRWEsMkJBQTJCLENBQUMsUUFBMEIsRUFBRSxTQUFpQjs7WUFDbkYsTUFBTSxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsZUFBZSxFQUFFLEdBQUcsUUFBUSxDQUFDO1lBQ3JFLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNyRCxNQUFNLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxHQUFHLFdBQVcsQ0FBQztZQUU1QyxRQUFRLENBQUMsY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO1lBQ25HLFFBQVEsQ0FBQyxjQUFjLEdBQUcsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7WUFDcEcsSUFBSSxlQUFlLEVBQUU7Z0JBQ2pCLFFBQVEsQ0FBQyxlQUFlLEdBQUcsTUFBTSxJQUFJLENBQUMscUJBQXFCLENBQUM7b0JBQ3hELFFBQVE7b0JBQ1IsZUFBZTtvQkFDZixTQUFTO2lCQUNaLENBQUMsQ0FBQzthQUNOO1FBQ0wsQ0FBQztLQUFBO0lBRVMsV0FBVztRQUNqQixPQUFPLElBQUksS0FBSyxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUVTLGFBQWE7UUFDbkIsTUFBTSxXQUFXLEdBQUcsU0FBUyxFQUFFLENBQUM7UUFDaEMsT0FBTyxJQUFJLFdBQVcsRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFYSxrQkFBa0I7OztZQUM1QixNQUFNLEVBQ0YsZ0JBQWdCLEVBQUUsZUFBZSxFQUNqQyxZQUFZLEVBQ1osU0FBUyxFQUNULElBQUksRUFBRSxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUUseUJBQXlCLEVBQUUsR0FDbEUsR0FBRyxJQUFJLENBQUM7WUFDVCxJQUFJLGVBQWUsQ0FBQyxNQUFNLEtBQUssU0FBUyxDQUFDLE1BQU0sRUFBRTtnQkFDN0MsT0FBTzthQUNWO1lBRUQsSUFBSSxlQUFlLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUU7Z0JBQzNDLFNBQVMsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsYUFBYSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRTtvQkFDbkcsWUFBWSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztvQkFDeEMsSUFBSSxXQUFXLEVBQUU7d0JBQ2IsWUFBWSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztxQkFDekM7b0JBQ0QsSUFBSSxVQUFVLEVBQUU7d0JBQ1osWUFBWSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztxQkFDeEM7b0JBQ0QsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7d0JBQ3RCLFlBQVksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ2xDO2dCQUNMLENBQUMsQ0FBQyxDQUFDO2FBQ047WUFFRCxNQUFNLFdBQVcsR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDO1lBQzNDLE9BQU8sV0FBVyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUU7Z0JBQ25DLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQztnQkFDcEIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUNyQyxNQUFNLGVBQWUsR0FBRyxVQUFVLENBQUM7Z0JBQ25DLE1BQU0sYUFBYSxHQUFHLElBQUksS0FBSyxDQUFDO29CQUM1QixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxjQUFjLFVBQVUsWUFBWTtvQkFDcEQsS0FBSztvQkFDTCxNQUFNLEVBQUUsTUFBTSxDQUFDLG1CQUFtQjtvQkFDbEMsY0FBYyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLGVBQWUsQ0FBQztpQkFDbEUsQ0FBQyxDQUFDO2dCQUNILE1BQU0sV0FBVyxHQUFHLFVBQVU7b0JBQzFCLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQzt3QkFDTixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxjQUFjLElBQUksQ0FBQyxVQUFVLEVBQUUsVUFBVTt3QkFDekQsS0FBSzt3QkFDTCxNQUFNLEVBQUUsTUFBTSxDQUFDLG1CQUFtQjt3QkFDbEMsY0FBYyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEtBQUssR0FBRyxVQUFVLENBQUM7cUJBQ3JFLENBQUM7b0JBQ0osQ0FBQyxDQUFDLFNBQVMsQ0FBQztnQkFDaEIsTUFBTSxVQUFVLEdBQUcsSUFBSSxLQUFLLENBQUM7b0JBQ3pCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLGNBQWMsSUFBSSxDQUFDLFVBQVUsRUFBRSxTQUFTO29CQUN4RCxLQUFLO29CQUNMLE1BQU0sRUFBRSxNQUFNLENBQUMsbUJBQW1CO29CQUNsQyxjQUFjLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsVUFBVSxDQUFDO2lCQUM3RCxDQUFDLENBQUM7Z0JBRUgsWUFBWSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDeEMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDckMsSUFBSSxXQUFXLEVBQUU7b0JBQ2IsWUFBWSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztpQkFDekM7Z0JBRUQsTUFBTSxLQUFLLEdBQVcsRUFBRSxDQUFDO2dCQUN6QixLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsY0FBYyxFQUFFLEtBQUssRUFBRSxFQUFFO29CQUNqRCxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztvQkFDMUIsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsbUJBQW1CLENBQUM7b0JBQ2pELEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxjQUFjLEdBQUc7d0JBQzFCLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUI7d0JBQzVCLENBQUMsTUFBQSx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsbUNBQUksQ0FBQyxDQUFDLEdBQUcsZUFBZTtxQkFDNUQsQ0FBQztvQkFDRixZQUFZLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2lCQUMxQztnQkFFRCxTQUFTLENBQUMsSUFBSSxDQUFDO29CQUNYLEtBQUs7b0JBQ0wsYUFBYTtvQkFDYixXQUFXO29CQUNYLFVBQVU7b0JBQ1YsY0FBYyxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQztvQkFDbEQsY0FBYyxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztvQkFDekUsZUFBZSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7aUJBQ3ZHLENBQUMsQ0FBQzthQUNOOztLQUNKO0lBRWUsV0FBVyxDQUFDLGlCQUFzQyxFQUFFLG9CQUE2Qjs7O1lBQzdGLE1BQU0sRUFDRixrQkFBa0IsRUFDbEIsdUJBQXVCLEVBQ3ZCLGdCQUFnQixFQUFFLGVBQWUsRUFDakMsaUJBQWlCLEVBQ2pCLElBQUksRUFBRSxFQUFFLFVBQVUsRUFBRSxHQUN2QixHQUFHLElBQUksQ0FBQztZQUVULE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQSxNQUFBLElBQUksQ0FBQyxnQkFBZ0IsMENBQUUsTUFBTSxJQUFHLENBQUMsSUFBSSxvQkFBb0IsQ0FBQztZQUMxRixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7WUFDakMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxHQUFHLE9BQU8sSUFBSSxDQUFDLENBQUMsaUJBQWlCLENBQUM7WUFFN0QsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3hDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUU7Z0JBQ3RELE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzFDLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFDdkMsQ0FBQyxDQUFDLENBQUM7WUFDSCxNQUFNLDBCQUEwQixHQUFHLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxLQUFLLGFBQWEsQ0FBQyxDQUFDO1lBQzlGLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxHQUFHLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQztZQUUzRSxJQUFJLFVBQVUsRUFBRTtnQkFDWixNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztvQkFDekIsZUFBZSxFQUFFLGtCQUF5QjtvQkFDMUMsV0FBVyxFQUFFLElBQUk7b0JBQ2pCLFNBQVMsRUFBRSxDQUFDLENBQUM7aUJBQ2hCLENBQUMsQ0FBQzthQUNOO2lCQUFNO2dCQUNILE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsY0FBYyxFQUFFLGtCQUFrQixFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDdEcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLGtCQUFrQixDQUFDLENBQUM7YUFDbkU7WUFDRCxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLGNBQWMsRUFBRSx1QkFBdUIsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRXhGLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FDYixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFPLFFBQVEsRUFBRSxTQUFTLEVBQUUsRUFBRTs7Z0JBQzdDLE1BQU0sRUFDRixhQUFhLEVBQ2IsV0FBVyxFQUNYLGNBQWMsRUFDZCxjQUFjLEVBQ2QsZUFBZSxFQUNmLEtBQUssRUFDTCxVQUFVLEdBQ2IsR0FBRyxRQUFRLENBQUM7Z0JBQ2IsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFOUMsTUFBTSxlQUFlLEdBQUcsT0FBTyxJQUFJLENBQUMsTUFBQSxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLG1DQUFJLElBQUksQ0FBQyxDQUFDO2dCQUMzRSxNQUFNLGVBQWUsR0FBRywwQkFBMEIsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFdEYsYUFBYSxDQUFDLE9BQU8sR0FBRyxlQUFlLENBQUM7Z0JBQ3hDLGFBQWEsQ0FBQyxPQUFPLEdBQUcsZUFBZSxDQUFDO2dCQUN4QyxVQUFVLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQztnQkFFckMsSUFBSSxXQUFXLEVBQUU7b0JBQ2IsV0FBVyxDQUFDLE9BQU8sR0FBRyxlQUFlLENBQUM7b0JBQ3RDLFdBQVcsQ0FBQyxNQUFNO3dCQUNkLGFBQWEsQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLG1CQUFtQjs0QkFDOUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxNQUFNOzRCQUN0QixDQUFDLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7b0JBQ25DLFdBQVcsQ0FBQyxPQUFPLEdBQUcsZUFBZSxDQUFDO2lCQUN6QztnQkFFRCxJQUFJLFVBQVUsRUFBRTtvQkFDWixVQUFVLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQztpQkFDeEM7Z0JBRUQsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7b0JBQ3RCLElBQUksQ0FBQyxPQUFPLEdBQUcsZUFBZSxDQUFDO29CQUMvQixJQUFJLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQztpQkFDbEM7Z0JBRUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUU7b0JBQ3hCLE9BQU87aUJBQ1Y7Z0JBRUQsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxjQUFjLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO2dCQUMvRSxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLGNBQWMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO2dCQUMzRCxJQUFJLFVBQVUsSUFBSSxlQUFlLEVBQUU7b0JBQy9CLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsZUFBZSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztpQkFDcEY7WUFDTCxDQUFDLENBQUEsQ0FBQyxDQUNMLENBQUM7O0tBQ0w7SUFFZSx3QkFBd0IsQ0FBQyxpQkFBMkI7OztZQUNoRSxNQUFNLEVBQUUsa0JBQWtCLEVBQUUsdUJBQXVCLEVBQUUsZ0JBQWdCLEVBQUUsZUFBZSxFQUFFLEdBQUcsSUFBSSxDQUFDO1lBRWhHLE1BQU0sZ0JBQWdCLEdBQUcsTUFBQSxJQUFJLENBQUMsZ0JBQWdCLDBDQUFFLGtCQUFrQixFQUFFLENBQUM7WUFDckUsTUFBTSxJQUFJLEdBQ04saUJBQWlCLEtBQUksZ0JBQWdCLGFBQWhCLGdCQUFnQix1QkFBaEIsZ0JBQWdCLENBQUUsS0FBSyxDQUFBLENBQUMsQ0FBQyxDQUFFLGdCQUEwQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDM0csSUFBSSxDQUFDLGtCQUFrQixHQUFHLE1BQU0sSUFBSSxDQUFDLDRCQUE0QixDQUFDLEVBQUUsSUFBSSxFQUFFLGtCQUFrQixFQUFFLENBQUMsQ0FBQztZQUVoRyxJQUFJLFNBQTZDLENBQUM7WUFDbEQsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksSUFBSSxJQUFJLElBQUksRUFBRTtnQkFDdkMsTUFBTSxFQUFFLE1BQU0sR0FBRyxTQUFTLEVBQUUsR0FBRyxJQUFJLENBQUM7Z0JBRXBDLEtBQUssTUFBTSxFQUFFLFNBQVMsRUFBRSxJQUFJLGVBQWUsRUFBRTtvQkFDekMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUMsTUFBTSxLQUFLLE1BQU0sQ0FBQyxDQUFDO29CQUVwRixJQUFJLFNBQVMsSUFBSSxJQUFJLEVBQUU7d0JBQ25CLE1BQU07cUJBQ1Q7aUJBQ0o7YUFDSjtZQUVELElBQUksQ0FBQyx1QkFBdUIsR0FBRyxNQUFNLElBQUksQ0FBQyw2QkFBNkIsQ0FBQztnQkFDcEUsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsdUJBQXVCO2FBQzFCLENBQUMsQ0FBQzs7S0FDTjtJQUVTLGtCQUFrQixDQUFDLEtBQVk7UUFDckMsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRS9DLElBQUksTUFBTSxFQUFFO1lBQ1IsT0FBTyxNQUFNLENBQUM7U0FDakI7UUFFRCxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQztRQUN2QixNQUFNLEVBQ0YsSUFBSSxFQUFFLEVBQUUsVUFBVSxFQUFFLEdBQ3ZCLEdBQUcsSUFBSSxDQUFDO1FBRVQsS0FBSyxNQUFNLEVBQUUsYUFBYSxFQUFFLFdBQVcsRUFBRSxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDekQsSUFBSSxLQUFLLEdBQUcsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFekMsSUFBSSxDQUFDLEtBQUssSUFBSSxVQUFVLEVBQUU7Z0JBQ3RCLEtBQUssR0FBRyxXQUFXLGFBQVgsV0FBVyx1QkFBWCxXQUFXLENBQUUsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUN2QztZQUVELElBQUksS0FBSyxFQUFFO2dCQUNQLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUM7YUFDOUM7U0FDSjtJQUNMLENBQUM7SUFFUyxvQkFBb0IsQ0FBQyxLQUFZOztRQUN2QyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQztRQUN2QixNQUFNLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsZUFBZSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQzVFLE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRWhELElBQUksV0FBVyxHQUFHLFFBQVEsQ0FBQztRQUMzQixJQUFJLFlBQWtELENBQUM7UUFFdkQsS0FBSyxNQUFNLE9BQU8sSUFBSSxlQUFlLEVBQUU7WUFDbkMsS0FBSyxNQUFNLEtBQUssSUFBSSxPQUFPLENBQUMsUUFBUSxFQUFFO2dCQUNsQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxFQUFFLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLE1BQU0sR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsR0FBRyxLQUFLLENBQUM7Z0JBQ25FLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRTtvQkFDaEMsU0FBUztpQkFDWjtnQkFFRCxNQUFNLFNBQVMsR0FBRyxDQUFBLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQUksS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQSxDQUFDO2dCQUNuRSxJQUFJLENBQUMsU0FBUyxFQUFFO29CQUNaLFNBQVM7aUJBQ1o7Z0JBRUQsaUZBQWlGO2dCQUNqRixhQUFhO2dCQUNiLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBQSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLEVBQUksQ0FBQyxDQUFBLEdBQUcsU0FBQSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLEVBQUksQ0FBQyxDQUFBLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RGLElBQUksUUFBUSxHQUFHLFdBQVcsRUFBRTtvQkFDeEIsV0FBVyxHQUFHLFFBQVEsQ0FBQztvQkFDdkIsWUFBWSxHQUFHLEtBQUssQ0FBQztpQkFDeEI7YUFDSjtTQUNKO1FBRUQsSUFBSSxZQUFZLEVBQUU7WUFDZCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxNQUFBLE1BQUEsWUFBWSxDQUFDLEtBQUssMENBQUUsSUFBSSxtQ0FBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2RixPQUFPLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsQ0FBQztTQUM1QztJQUNMLENBQUM7SUFFUyxxQkFBcUIsQ0FDM0IsS0FBWSxFQUNaLG1CQUE0Qjs7UUFFNUIsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxLQUFLLENBQUM7UUFDdkIsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixFQUFFLGVBQWUsRUFBRSxHQUFHLElBQUksQ0FBQztRQUU1RSwyREFBMkQ7UUFDM0QsTUFBTSxVQUFVLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO2FBQzVCLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBcUIsRUFBRSxDQUFDLENBQUMsWUFBWSxZQUFZLENBQUM7YUFDM0QsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDN0IsSUFBSSxtQkFBbUIsSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNoRCxPQUFPO1NBQ1Y7UUFFRCw4REFBOEQ7UUFDOUQsTUFBTSxDQUFDLGdCQUFnQixHQUFHLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQztRQUU3RCxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNoRCxNQUFNLGNBQWMsR0FDaEIsZ0JBQWdCLEtBQUssa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXBHLE1BQU0sV0FBVyxHQUFHLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3pDLElBQUksWUFBWSxHQUF5QyxTQUFTLENBQUM7UUFFbkUsS0FBSyxNQUFNLE9BQU8sSUFBSSxlQUFlLEVBQUU7WUFDbkMsS0FBSyxNQUFNLEtBQUssSUFBSSxPQUFPLENBQUMsUUFBUSxFQUFFO2dCQUNsQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxFQUFFLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLE1BQU0sR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsR0FBRyxLQUFLLENBQUM7Z0JBQ25FLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRTtvQkFDaEMsU0FBUztpQkFDWjtnQkFFRCxNQUFNLFNBQVMsR0FBRyxDQUFBLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQUksS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQSxDQUFDO2dCQUNuRSxJQUFJLENBQUMsU0FBUyxFQUFFO29CQUNaLFNBQVM7aUJBQ1o7Z0JBRUQsTUFBTSxLQUFLLEdBQUcsZ0JBQWdCLEtBQUssa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBRTlGLDhEQUE4RDtnQkFDOUQsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDO2dCQUMxQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDbkMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3BELElBQUksSUFBSSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRTt3QkFDdkIsY0FBYyxHQUFHLEtBQUssQ0FBQzt3QkFDdkIsTUFBTTtxQkFDVDtvQkFDRCxJQUFJLElBQUksR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUU7d0JBQ3ZCLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7d0JBQ3RCLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3FCQUN6RDtpQkFDSjtnQkFFRCxJQUFJLGNBQWMsRUFBRTtvQkFDaEIsWUFBWSxHQUFHLEtBQUssQ0FBQztpQkFDeEI7YUFDSjtTQUNKO1FBRUQsSUFBSSxZQUFZLEVBQUU7WUFDZCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQUEsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFJLENBQUMsQ0FBQSxHQUFHLFNBQUEsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFJLENBQUMsQ0FBQSxDQUFDLEdBQUcsQ0FBQyxNQUFBLE1BQUEsWUFBWSxDQUFDLEtBQUssMENBQUUsSUFBSSxtQ0FBSSxDQUFDLENBQUMsRUFDdEYsQ0FBQyxDQUNKLENBQUM7WUFDRixPQUFPLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsQ0FBQztTQUM1QztJQUNMLENBQUM7SUFFRCxpQkFBaUIsQ0FBQyxLQUFnQztRQUM5QyxNQUFNLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxLQUFLLENBQUM7UUFFMUMsSUFBSSxNQUFNLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxFQUFFO1lBQUUsT0FBTztRQUNsQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFRCx1QkFBdUIsQ0FBQyxLQUFzQztRQUMxRCxNQUFNLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsZUFBZSxFQUFFLEdBQUcsS0FBSyxDQUFDO1FBRTNELE1BQU0saUJBQWlCLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRXBGLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxFQUFFLEtBQUssSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUN6QyxNQUFNLFVBQVUsR0FBRyxVQUFVLElBQUksQ0FBQyxPQUFPLElBQUksaUJBQWlCLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFFdEUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBRVMsZ0JBQWdCLENBQUMsTUFBYyxFQUFFLE9BQWdCO1FBQ3ZELElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksR0FBRyxDQUFDLEVBQUU7WUFDakMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDNUMsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7U0FDL0I7YUFBTTtZQUNILEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDM0M7SUFDTCxDQUFDO0lBRUQsU0FBUztRQUNMLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksR0FBRyxDQUFDLEVBQUU7WUFDakMsS0FBSyxNQUFNLENBQUMsRUFBRSxPQUFPLENBQUMsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEVBQUU7Z0JBQzlDLElBQUksT0FBTyxFQUFFO29CQUNULE9BQU8sSUFBSSxDQUFDO2lCQUNmO2FBQ0o7WUFDRCxPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUVELE9BQU8sS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFUyxzQkFBc0I7UUFDNUIsd0VBQXdFO1FBQ3hFLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFRCxZQUFZO1FBQ1IsT0FBTyxFQUFFLENBQUM7SUFDZCxDQUFDO0lBRVMsa0JBQWtCO1FBQ3hCLEtBQUssTUFBTSxPQUFPLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQ25ELElBQUksT0FBTyxFQUFFO2dCQUNULE9BQU8sSUFBSSxDQUFDO2FBQ2Y7U0FDSjtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFZSw0QkFBNEIsQ0FBQyxJQUc1Qzs7WUFDRyxNQUFNLEVBQ0YsSUFBSSxFQUFFLEVBQUUsVUFBVSxFQUFFLEdBQ3ZCLEdBQUcsSUFBSSxDQUFDO1lBRVQsTUFBTSxFQUFFLElBQUksRUFBRSxrQkFBa0IsRUFBRSxHQUFHLElBQUksQ0FBQztZQUMxQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUVwQyxJQUFJLFVBQVUsRUFBRTtnQkFDWixNQUFNLGVBQWUsR0FBRyxrQkFBeUIsQ0FBQztnQkFDbEQsT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUMsRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFRLENBQUM7YUFDMUY7aUJBQU07Z0JBQ0gsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLGtCQUFrQixFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDckc7UUFDTCxDQUFDO0tBQUE7SUFFZSw2QkFBNkIsQ0FBQyxJQUc3Qzs7WUFDRyxNQUFNLEVBQUUsSUFBSSxFQUFFLHVCQUF1QixFQUFFLEdBQUcsSUFBSSxDQUFDO1lBQy9DLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBRXJDLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSx1QkFBdUIsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzVHLENBQUM7S0FBQTtJQUVlLG9CQUFvQixDQUFDLElBSXBDOztZQUNHLGtDQUFrQztZQUNsQyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUM7UUFDL0IsQ0FBQztLQUFBO0lBQ2UsZ0JBQWdCLENBQUMsS0FJaEM7O1lBQ0csa0NBQWtDO1FBQ3RDLENBQUM7S0FBQTtJQUVlLHFCQUFxQixDQUFDLElBSXJDOztZQUNHLGtDQUFrQztZQUNsQyxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUM7UUFDaEMsQ0FBQztLQUFBO0lBQ2UsaUJBQWlCLENBQUMsS0FJakM7O1lBQ0csa0NBQWtDO1FBQ3RDLENBQUM7S0FBQTtJQUVTLHVCQUF1QixDQUFDLEtBT2pDO1FBQ0csa0NBQWtDO0lBQ3RDLENBQUM7SUFFUyxrQkFBa0IsQ0FBQyxLQU01QjtRQUNHLGtDQUFrQztJQUN0QyxDQUFDO0lBRVMscUJBQXFCLENBQUMsS0FBOEI7UUFDMUQsa0NBQWtDO0lBQ3RDLENBQUM7SUFFUyxrQkFBa0IsQ0FBQyxLQUs1QjtRQUNHLGtDQUFrQztJQUN0QyxDQUFDO0NBYUo7QUFFRCxNQUFNLE9BQU8scUJBQXNCLFNBQVEsWUFBWTtJQUF2RDs7UUFHSSxjQUFTLEdBQTRGLFNBQVMsQ0FBQztJQUNuSCxDQUFDO0NBQUE7QUFERztJQUZDLFFBQVEsQ0FBQyxZQUFZLENBQUM7SUFDdEIsb0JBQW9CLENBQUMsRUFBRSxNQUFNLEVBQUUsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO3dEQUM0RCJ9