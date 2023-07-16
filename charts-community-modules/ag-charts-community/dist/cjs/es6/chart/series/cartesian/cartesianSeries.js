"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartesianSeriesMarker = exports.CartesianSeries = exports.CartesianSeriesNodeDoubleClickEvent = exports.CartesianSeriesNodeClickEvent = exports.CartesianSeriesNodeBaseClickEvent = void 0;
const series_1 = require("../series");
const seriesMarker_1 = require("../seriesMarker");
const value_1 = require("../../../util/value");
const path_1 = require("../../../scene/shape/path");
const selection_1 = require("../../../scene/selection");
const group_1 = require("../../../scene/group");
const text_1 = require("../../../scene/shape/text");
const changeDetectable_1 = require("../../../scene/changeDetectable");
const categoryAxis_1 = require("../../axis/categoryAxis");
const layers_1 = require("../../layers");
const validation_1 = require("../../../util/validation");
const json_1 = require("../../../util/json");
const chartAxisDirection_1 = require("../../chartAxisDirection");
const util_1 = require("../../marker/util");
const states_1 = require("../../../motion/states");
const logger_1 = require("../../../util/logger");
const DEFAULT_DIRECTION_KEYS = {
    [chartAxisDirection_1.ChartAxisDirection.X]: ['xKey'],
    [chartAxisDirection_1.ChartAxisDirection.Y]: ['yKey'],
};
const DEFAULT_DIRECTION_NAMES = {
    [chartAxisDirection_1.ChartAxisDirection.X]: ['xName'],
    [chartAxisDirection_1.ChartAxisDirection.Y]: ['yName'],
};
class CartesianSeriesNodeBaseClickEvent extends series_1.SeriesNodeBaseClickEvent {
    constructor(xKey, yKey, nativeEvent, datum, series) {
        super(nativeEvent, datum, series);
        this.xKey = xKey;
        this.yKey = yKey;
    }
}
exports.CartesianSeriesNodeBaseClickEvent = CartesianSeriesNodeBaseClickEvent;
class CartesianSeriesNodeClickEvent extends CartesianSeriesNodeBaseClickEvent {
    constructor() {
        super(...arguments);
        this.type = 'nodeClick';
    }
}
exports.CartesianSeriesNodeClickEvent = CartesianSeriesNodeClickEvent;
class CartesianSeriesNodeDoubleClickEvent extends CartesianSeriesNodeBaseClickEvent {
    constructor() {
        super(...arguments);
        this.type = 'nodeDoubleClick';
    }
}
exports.CartesianSeriesNodeDoubleClickEvent = CartesianSeriesNodeDoubleClickEvent;
class CartesianStateMachine extends states_1.StateMachine {
}
class CartesianSeries extends series_1.Series {
    constructor(opts) {
        super(Object.assign(Object.assign({}, opts), { useSeriesGroupLayer: true, directionKeys: DEFAULT_DIRECTION_KEYS, directionNames: DEFAULT_DIRECTION_NAMES }));
        this.legendItemName = undefined;
        this._contextNodeData = [];
        this.nodeDataDependencies = {};
        this.highlightSelection = selection_1.Selection.select(this.highlightNode, () => this.opts.hasMarkers ? this.markerFactory() : this.nodeFactory());
        this.highlightLabelSelection = selection_1.Selection.select(this.highlightLabel, text_1.Text);
        this.subGroups = [];
        this.subGroupId = 0;
        this.datumSelectionGarbageCollection = true;
        const { pathsPerSeries = 1, hasMarkers = false, hasHighlightedLabels = false, pathsZIndexSubOrderOffset = [], } = opts;
        this.opts = { pathsPerSeries, hasMarkers, hasHighlightedLabels, pathsZIndexSubOrderOffset };
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
                    updateData: {
                        target: 'waiting',
                        action: () => { },
                    },
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
            waiting: {
                on: {
                    update: {
                        target: 'ready',
                        action: (data) => this.animateWaitingUpdateReady(data),
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
        (_a = this.ctx.chartEventManager) === null || _a === void 0 ? void 0 : _a.addListener('legend-item-click', (event) => this.onLegendItemClick(event));
        (_b = this.ctx.chartEventManager) === null || _b === void 0 ? void 0 : _b.addListener('legend-item-double-click', (event) => this.onLegendItemDoubleClick(event));
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
    update({ seriesRect }) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const { visible } = this;
            const { series } = (_b = (_a = this.ctx.highlightManager) === null || _a === void 0 ? void 0 : _a.getActiveHighlight()) !== null && _b !== void 0 ? _b : {};
            const seriesHighlighted = series ? series === this : undefined;
            const newNodeDataDependencies = {
                seriesRectWidth: seriesRect === null || seriesRect === void 0 ? void 0 : seriesRect.width,
                seriesRectHeight: seriesRect === null || seriesRect === void 0 ? void 0 : seriesRect.height,
            };
            const resize = json_1.jsonDiff(this.nodeDataDependencies, newNodeDataDependencies) != null;
            if (resize) {
                this.nodeDataDependencies = newNodeDataDependencies;
                this.markNodeDataDirty();
            }
            yield this.updateSelections(seriesHighlighted, visible);
            yield this.updateNodes(seriesHighlighted, visible);
            if (resize) {
                this.animationState.transition('resize', {
                    datumSelections: this.subGroups.map(({ datumSelection }) => datumSelection),
                    markerSelections: this.subGroups.map(({ markerSelection }) => markerSelection),
                    contextData: this._contextNodeData,
                    paths: this.subGroups.map(({ paths }) => paths),
                });
            }
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
        var _a;
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
                if ((_a = this.chart) === null || _a === void 0 ? void 0 : _a.debug) {
                    logger_1.Logger.debug(`CartesianSeries.updateSelections() - calling createNodeData() for`, this.id);
                }
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
        return new group_1.Group();
    }
    markerFactory() {
        const MarkerShape = util_1.getMarker();
        return new MarkerShape();
    }
    updateSeriesGroups() {
        return __awaiter(this, void 0, void 0, function* () {
            const { _contextNodeData: contextNodeData, contentGroup, subGroups, opts: { pathsPerSeries, hasMarkers }, } = this;
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
                const dataNodeGroup = new group_1.Group({
                    name: `${this.id}-series-sub${subGroupId}-dataNodes`,
                    layer,
                    zIndex: layers_1.Layers.SERIES_LAYER_ZINDEX,
                    zIndexSubOrder: this.getGroupZIndexSubOrder('data', subGroupId),
                });
                const markerGroup = hasMarkers
                    ? new group_1.Group({
                        name: `${this.id}-series-sub${this.subGroupId++}-markers`,
                        layer,
                        zIndex: layers_1.Layers.SERIES_LAYER_ZINDEX,
                        zIndexSubOrder: this.getGroupZIndexSubOrder('marker', subGroupId),
                    })
                    : undefined;
                const labelGroup = new group_1.Group({
                    name: `${this.id}-series-sub${this.subGroupId++}-labels`,
                    layer,
                    zIndex: layers_1.Layers.SERIES_LABEL_ZINDEX,
                    zIndexSubOrder: this.getGroupZIndexSubOrder('labels', subGroupId),
                });
                contentGroup.appendChild(dataNodeGroup);
                contentGroup.appendChild(labelGroup);
                if (markerGroup) {
                    contentGroup.appendChild(markerGroup);
                }
                const paths = [];
                for (let index = 0; index < pathsPerSeries; index++) {
                    paths[index] = new path_1.Path();
                    paths[index].zIndex = layers_1.Layers.SERIES_LAYER_ZINDEX;
                    paths[index].zIndexSubOrder = this.getGroupZIndexSubOrder('paths', index);
                    contentGroup.appendChild(paths[index]);
                }
                subGroups.push({
                    paths,
                    dataNodeGroup,
                    markerGroup,
                    labelGroup,
                    labelSelection: selection_1.Selection.select(labelGroup, text_1.Text),
                    datumSelection: selection_1.Selection.select(dataNodeGroup, () => this.nodeFactory(), this.datumSelectionGarbageCollection),
                    markerSelection: markerGroup ? selection_1.Selection.select(markerGroup, () => this.markerFactory()) : undefined,
                });
            }
        });
    }
    getGroupZIndexSubOrder(type, subIndex = 0) {
        var _a, _b;
        const result = super.getGroupZIndexSubOrder(type, subIndex);
        switch (type) {
            case 'paths':
                const pathOffset = (_a = this.opts.pathsZIndexSubOrderOffset[subIndex]) !== null && _a !== void 0 ? _a : 0;
                const superFn = result[0];
                if (typeof superFn === 'function') {
                    result[0] = () => +superFn() + pathOffset;
                }
                else {
                    result[0] = (_b = +superFn + this.opts.pathsZIndexSubOrderOffset[subIndex]) !== null && _b !== void 0 ? _b : 0;
                }
                break;
        }
        return result;
    }
    updateNodes(seriesHighlighted, anySeriesItemEnabled) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { highlightSelection, highlightLabelSelection, _contextNodeData: contextNodeData, opts: { hasMarkers, hasHighlightedLabels }, } = this;
            const visible = this.visible && ((_a = this._contextNodeData) === null || _a === void 0 ? void 0 : _a.length) > 0 && anySeriesItemEnabled;
            this.rootGroup.visible = visible;
            this.contentGroup.visible = visible;
            this.highlightGroup.visible = visible && !!seriesHighlighted;
            const subGroupOpacities = this.subGroups.map((_, index) => {
                const { itemId } = contextNodeData[index];
                return this.getOpacity({ itemId });
            });
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
            if (hasHighlightedLabels) {
                yield this.updateLabelNodes({ labelSelection: highlightLabelSelection, seriesIdx: -1 });
            }
            yield Promise.all(this.subGroups.map((subGroup, seriesIdx) => __awaiter(this, void 0, void 0, function* () {
                const { dataNodeGroup, markerGroup, datumSelection, labelSelection, markerSelection, paths, labelGroup, } = subGroup;
                const subGroupVisible = visible;
                const subGroupOpacity = subGroupOpacities[seriesIdx];
                dataNodeGroup.opacity = subGroupOpacity;
                dataNodeGroup.visible = subGroupVisible;
                labelGroup.visible = subGroupVisible;
                if (markerGroup) {
                    markerGroup.opacity = subGroupOpacity;
                    markerGroup.zIndex =
                        dataNodeGroup.zIndex >= layers_1.Layers.SERIES_LAYER_ZINDEX
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
            const highlightedDatum = (_a = this.ctx.highlightManager) === null || _a === void 0 ? void 0 : _a.getActiveHighlight();
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
        const { axes, rootGroup, _contextNodeData: contextNodeData } = this;
        const xAxis = axes[chartAxisDirection_1.ChartAxisDirection.X];
        const yAxis = axes[chartAxisDirection_1.ChartAxisDirection.Y];
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
        const { axes, rootGroup, _contextNodeData: contextNodeData } = this;
        const xAxis = axes[chartAxisDirection_1.ChartAxisDirection.X];
        const yAxis = axes[chartAxisDirection_1.ChartAxisDirection.Y];
        // Prefer to start search with any available category axis.
        const directions = [xAxis, yAxis]
            .filter((a) => a instanceof categoryAxis_1.CategoryAxis)
            .map((a) => a.direction);
        if (requireCategoryAxis && directions.length === 0) {
            return;
        }
        // Default to X-axis unless we found a suitable category axis.
        const [primaryDirection = chartAxisDirection_1.ChartAxisDirection.X] = directions;
        const hitPoint = rootGroup.transformPoint(x, y);
        const hitPointCoords = primaryDirection === chartAxisDirection_1.ChartAxisDirection.X ? [hitPoint.x, hitPoint.y] : [hitPoint.y, hitPoint.x];
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
                const point = primaryDirection === chartAxisDirection_1.ChartAxisDirection.X ? [datumX, datumY] : [datumY, datumX];
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
        const { enabled, itemId, series, legendItemName } = event;
        const matchedLegendItemName = this.legendItemName != null && this.legendItemName === legendItemName;
        if (series.id === this.id) {
            this.toggleSeriesItem(itemId, enabled);
        }
        else if (matchedLegendItemName) {
            this.toggleSeriesItem(itemId, enabled);
        }
    }
    onLegendItemDoubleClick(event) {
        const { enabled, itemId, series, numVisibleItems, legendItemName } = event;
        const totalVisibleItems = Object.values(numVisibleItems).reduce((p, v) => p + v, 0);
        const matchedLegendItemName = this.legendItemName != null && this.legendItemName === legendItemName;
        if (series.id === this.id || matchedLegendItemName) {
            // Double-clicked item should always become visible.
            this.toggleSeriesItem(itemId, true);
        }
        else if (enabled && totalVisibleItems === 1) {
            // Other items should become visible if there is only one existing visible item.
            this.toggleSeriesItem(itemId, true);
        }
        else {
            // Disable other items if not exactly one enabled.
            this.toggleSeriesItem(itemId, false);
        }
    }
    isPathOrSelectionDirty() {
        // Override point to allow more sophisticated dirty selection detection.
        return false;
    }
    getLabelData() {
        return [];
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
    animateWaitingUpdateReady(_data) {
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
__decorate([
    validation_1.Validate(validation_1.OPT_STRING)
], CartesianSeries.prototype, "legendItemName", void 0);
exports.CartesianSeries = CartesianSeries;
class CartesianSeriesMarker extends seriesMarker_1.SeriesMarker {
    constructor() {
        super(...arguments);
        this.formatter = undefined;
    }
}
__decorate([
    validation_1.Validate(validation_1.OPT_FUNCTION),
    changeDetectable_1.SceneChangeDetection({ redraw: changeDetectable_1.RedrawType.MAJOR })
], CartesianSeriesMarker.prototype, "formatter", void 0);
exports.CartesianSeriesMarker = CartesianSeriesMarker;
