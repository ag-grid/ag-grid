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
exports.Chart = void 0;
const scene_1 = require("../scene/scene");
const group_1 = require("../scene/group");
const series_1 = require("./series/series");
const padding_1 = require("../util/padding");
const background_1 = require("./background");
const legend_1 = require("./legend");
const sizeMonitor_1 = require("../util/sizeMonitor");
const observable_1 = require("../util/observable");
const chartAxisDirection_1 = require("./chartAxisDirection");
const id_1 = require("../util/id");
const labelPlacement_1 = require("../util/labelPlacement");
const render_1 = require("../util/render");
const cartesianSeries_1 = require("./series/cartesian/cartesianSeries");
const validation_1 = require("../util/validation");
const async_1 = require("../util/async");
const function_1 = require("../util/function");
const tooltip_1 = require("./tooltip/tooltip");
const interactionManager_1 = require("./interaction/interactionManager");
const json_1 = require("../util/json");
const clipRect_1 = require("../scene/clipRect");
const layers_1 = require("./layers");
const cursorManager_1 = require("./interaction/cursorManager");
const highlightManager_1 = require("./interaction/highlightManager");
const tooltipManager_1 = require("./interaction/tooltipManager");
const zoomManager_1 = require("./interaction/zoomManager");
const layoutService_1 = require("./layout/layoutService");
const chartUpdateType_1 = require("./chartUpdateType");
class Chart extends observable_1.Observable {
    constructor(document = window.document, overrideDevicePixelRatio, resources) {
        var _a;
        super();
        this.id = id_1.createId(this);
        this.processedOptions = {};
        this.userOptions = {};
        this.queuedUserOptions = [];
        this.seriesRoot = new clipRect_1.ClipRect();
        this.background = new background_1.Background();
        this._debug = false;
        this.extraDebugStats = {};
        this._container = undefined;
        this._data = [];
        this._autoSize = false;
        this.padding = new padding_1.Padding(20);
        this._title = undefined;
        this._subtitle = undefined;
        this.mode = 'standalone';
        this._destroyed = false;
        this.modules = {};
        this._pendingFactoryUpdates = [];
        this._performUpdateNoRenderCount = 0;
        this._performUpdateType = chartUpdateType_1.ChartUpdateType.NONE;
        this.seriesToUpdate = new Set();
        this.performUpdateTrigger = render_1.debouncedCallback(({ count }) => __awaiter(this, void 0, void 0, function* () {
            if (this._destroyed)
                return;
            try {
                yield this.performUpdate(count);
            }
            catch (error) {
                this._lastPerformUpdateError = error;
                console.error(error);
            }
        }));
        this._axes = [];
        this._series = [];
        this.lastInteractionEvent = undefined;
        this.pointerScheduler = render_1.debouncedAnimationFrame(() => {
            if (this.lastInteractionEvent) {
                this.handlePointer(this.lastInteractionEvent);
            }
            this.lastInteractionEvent = undefined;
        });
        this.onSeriesNodeClick = (event) => {
            const seriesNodeClickEvent = Object.assign(Object.assign({}, event), { type: 'seriesNodeClick' });
            Object.defineProperty(seriesNodeClickEvent, 'series', {
                enumerable: false,
                // Should display the deprecation warning
                get: () => event.series,
            });
            this.fireEvent(seriesNodeClickEvent);
        };
        const scene = resources === null || resources === void 0 ? void 0 : resources.scene;
        const element = (_a = resources === null || resources === void 0 ? void 0 : resources.element) !== null && _a !== void 0 ? _a : document.createElement('div');
        const container = resources === null || resources === void 0 ? void 0 : resources.container;
        const root = new group_1.Group({ name: 'root' });
        // Prevent the scene from rendering chart components in an invalid state
        // (before first layout is performed).
        root.visible = false;
        root.append(this.seriesRoot);
        const background = this.background;
        background.fill = 'white';
        root.appendChild(background.node);
        this.axisGroup = new group_1.Group({ name: 'Axes', layer: true, zIndex: layers_1.Layers.AXIS_ZINDEX });
        root.appendChild(this.axisGroup);
        this.element = element;
        element.classList.add('ag-chart-wrapper');
        element.style.position = 'relative';
        this.scene = scene !== null && scene !== void 0 ? scene : new scene_1.Scene({ document, overrideDevicePixelRatio });
        this.scene.debug.consoleLog = this._debug;
        this.scene.root = root;
        this.scene.container = element;
        this.autoSize = true;
        this.interactionManager = new interactionManager_1.InteractionManager(element);
        this.cursorManager = new cursorManager_1.CursorManager(element);
        this.highlightManager = new highlightManager_1.HighlightManager();
        this.zoomManager = new zoomManager_1.ZoomManager();
        this.layoutService = new layoutService_1.LayoutService();
        background.width = this.scene.width;
        background.height = this.scene.height;
        sizeMonitor_1.SizeMonitor.observe(this.element, (size) => {
            const { width, height } = size;
            if (!this.autoSize) {
                return;
            }
            if (width === 0 && height === 0) {
                return;
            }
            if (width === this.width && height === this.height) {
                return;
            }
            this._lastAutoSize = [width, height];
            this.resize(width, height);
        });
        this.tooltip = new tooltip_1.Tooltip(this.scene.canvas.element, document, document.body);
        this.tooltipManager = new tooltipManager_1.TooltipManager(this.tooltip);
        this.legend = new legend_1.Legend(this, this.interactionManager, this.cursorManager, this.highlightManager, this.tooltipManager);
        this.container = container;
        // Add interaction listeners last so child components are registered first.
        this.interactionManager.addListener('click', (event) => this.onClick(event));
        this.interactionManager.addListener('hover', (event) => this.onMouseMove(event));
        this.interactionManager.addListener('leave', () => this.disablePointer());
        this.interactionManager.addListener('page-left', () => this.destroy());
        this.zoomManager.addListener('zoom-change', (_) => this.update(chartUpdateType_1.ChartUpdateType.PROCESS_DATA, { forceNodeDataRefresh: true }));
        this.highlightManager.addListener('highlight-change', (event) => this.changeHighlightDatum(event));
    }
    getOptions() {
        var _a;
        const { queuedUserOptions } = this;
        const lastUpdateOptions = (_a = queuedUserOptions[queuedUserOptions.length - 1]) !== null && _a !== void 0 ? _a : this.userOptions;
        return json_1.jsonMerge([lastUpdateOptions]);
    }
    set debug(value) {
        this._debug = value;
        this.scene.debug.consoleLog = value;
    }
    get debug() {
        return this._debug;
    }
    set container(value) {
        if (this._container !== value) {
            const { parentNode } = this.element;
            if (parentNode != null) {
                parentNode.removeChild(this.element);
            }
            if (value && !this.destroyed) {
                value.appendChild(this.element);
            }
            this._container = value;
        }
    }
    get container() {
        return this._container;
    }
    set data(data) {
        this._data = data;
        this.series.forEach((series) => (series.data = data));
    }
    get data() {
        return this._data;
    }
    set width(value) {
        this.autoSize = false;
        if (this.width !== value) {
            this.resize(value, this.height);
        }
    }
    get width() {
        return this.scene.width;
    }
    set height(value) {
        this.autoSize = false;
        if (this.height !== value) {
            this.resize(this.width, value);
        }
    }
    get height() {
        return this.scene.height;
    }
    set autoSize(value) {
        if (this._autoSize === value) {
            return;
        }
        this._autoSize = value;
        const { style } = this.element;
        if (value) {
            style.display = 'block';
            style.width = '100%';
            style.height = '100%';
            if (!this._lastAutoSize) {
                return;
            }
            this.resize(this._lastAutoSize[0], this._lastAutoSize[1]);
        }
        else {
            style.display = 'inline-block';
            style.width = 'auto';
            style.height = 'auto';
        }
    }
    get autoSize() {
        return this._autoSize;
    }
    download(fileName, fileFormat) {
        this.scene.download(fileName, fileFormat);
    }
    set title(caption) {
        const { root } = this.scene;
        if (this._title != null) {
            root === null || root === void 0 ? void 0 : root.removeChild(this._title.node);
        }
        this._title = caption;
        if (this._title != null) {
            root === null || root === void 0 ? void 0 : root.appendChild(this._title.node);
        }
    }
    get title() {
        return this._title;
    }
    set subtitle(caption) {
        const { root } = this.scene;
        if (this._subtitle != null) {
            root === null || root === void 0 ? void 0 : root.removeChild(this._subtitle.node);
        }
        this._subtitle = caption;
        if (this._subtitle != null) {
            root === null || root === void 0 ? void 0 : root.appendChild(this._subtitle.node);
        }
    }
    get subtitle() {
        return this._subtitle;
    }
    get destroyed() {
        return this._destroyed;
    }
    addModule(module) {
        if (this.modules[module.optionsKey] != null) {
            throw new Error('AG Charts - module already initialised: ' + module.optionsKey);
        }
        const { scene, interactionManager, zoomManager, cursorManager, highlightManager, tooltipManager, layoutService, } = this;
        const moduleMeta = module.initialiseModule({
            scene,
            interactionManager,
            zoomManager,
            cursorManager,
            highlightManager,
            tooltipManager,
            layoutService,
        });
        this.modules[module.optionsKey] = moduleMeta;
        this[module.optionsKey] = moduleMeta.instance;
    }
    removeModule(module) {
        var _a, _b;
        (_b = (_a = this.modules[module.optionsKey]) === null || _a === void 0 ? void 0 : _a.instance) === null || _b === void 0 ? void 0 : _b.destroy();
        delete this.modules[module.optionsKey];
        delete this[module.optionsKey];
    }
    isModuleEnabled(module) {
        return this.modules[module.optionsKey] != null;
    }
    destroy(opts) {
        if (this._destroyed) {
            return;
        }
        const keepTransferableResources = opts === null || opts === void 0 ? void 0 : opts.keepTransferableResources;
        let result = undefined;
        this._performUpdateType = chartUpdateType_1.ChartUpdateType.NONE;
        this._pendingFactoryUpdates.splice(0);
        this.tooltip.destroy();
        sizeMonitor_1.SizeMonitor.unobserve(this.element);
        for (const [key, module] of Object.entries(this.modules)) {
            module.instance.destroy();
            delete this.modules[key];
            delete this[key];
        }
        this.interactionManager.destroy();
        if (keepTransferableResources) {
            this.scene.strip();
            result = { container: this.container, scene: this.scene, element: this.element };
        }
        else {
            this.scene.destroy();
            this.container = undefined;
        }
        this.series.forEach((s) => s.destroy());
        this.series = [];
        this._destroyed = true;
        return result;
    }
    log(opts) {
        if (this.debug) {
            console.log(opts);
        }
    }
    disablePointer(highlightOnly = false) {
        if (!highlightOnly) {
            this.tooltipManager.updateTooltip(this.id);
        }
        this.highlightManager.updateHighlight(this.id);
        if (this.lastInteractionEvent) {
            this.lastInteractionEvent = undefined;
        }
    }
    requestFactoryUpdate(cb) {
        const callbacks = this._pendingFactoryUpdates;
        const count = callbacks.length;
        if (count === 0) {
            callbacks.push(cb);
            this._processCallbacks();
        }
        else {
            // Factory callback process already running, the callback will be invoked asynchronously.
            // Clear the queue after the first callback to prevent unnecessary re-renderings.
            callbacks.splice(1, count - 1, cb);
        }
    }
    _processCallbacks() {
        return __awaiter(this, void 0, void 0, function* () {
            const callbacks = this._pendingFactoryUpdates;
            while (callbacks.length > 0) {
                if (this.updatePending) {
                    yield async_1.sleep(1);
                    continue; // Make sure to check queue has an item before continuing.
                }
                try {
                    yield callbacks[0]();
                }
                catch (e) {
                    console.error(e);
                }
                callbacks.shift();
            }
        });
    }
    get performUpdateType() {
        return this._performUpdateType;
    }
    get updatePending() {
        return this._performUpdateType !== chartUpdateType_1.ChartUpdateType.NONE || this.lastInteractionEvent != null;
    }
    get lastPerformUpdateError() {
        return this._lastPerformUpdateError;
    }
    awaitUpdateCompletion() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.performUpdateTrigger.await();
        });
    }
    update(type = chartUpdateType_1.ChartUpdateType.FULL, opts) {
        const { forceNodeDataRefresh = false, seriesToUpdate = this.series } = opts || {};
        if (forceNodeDataRefresh) {
            this.series.forEach((series) => series.markNodeDataDirty());
        }
        for (const series of seriesToUpdate) {
            this.seriesToUpdate.add(series);
        }
        if (type < this._performUpdateType) {
            this._performUpdateType = type;
            this.performUpdateTrigger.schedule();
        }
    }
    performUpdate(count) {
        return __awaiter(this, void 0, void 0, function* () {
            const { _performUpdateType: performUpdateType, extraDebugStats } = this;
            const splits = [performance.now()];
            switch (performUpdateType) {
                case chartUpdateType_1.ChartUpdateType.FULL:
                case chartUpdateType_1.ChartUpdateType.PROCESS_DATA:
                    yield this.processData();
                    this.disablePointer(true);
                    splits.push(performance.now());
                // Fall-through to next pipeline stage.
                case chartUpdateType_1.ChartUpdateType.PERFORM_LAYOUT:
                    if (this._autoSize && !this._lastAutoSize) {
                        const count = this._performUpdateNoRenderCount++;
                        if (count < 5) {
                            // Reschedule if canvas size hasn't been set yet to avoid a race.
                            this._performUpdateType = chartUpdateType_1.ChartUpdateType.PERFORM_LAYOUT;
                            this.performUpdateTrigger.schedule();
                            break;
                        }
                        // After several failed passes, continue and accept there maybe a redundant
                        // render. Sometimes this case happens when we already have the correct
                        // width/height, and we end up never rendering the chart in that scenario.
                    }
                    this._performUpdateNoRenderCount = 0;
                    yield this.performLayout();
                    splits.push(performance.now());
                // Fall-through to next pipeline stage.
                case chartUpdateType_1.ChartUpdateType.SERIES_UPDATE:
                    const { seriesRect } = this;
                    const seriesUpdates = [...this.seriesToUpdate].map((series) => series.update({ seriesRect }));
                    this.seriesToUpdate.clear();
                    yield Promise.all(seriesUpdates);
                    splits.push(performance.now());
                // Fall-through to next pipeline stage.
                case chartUpdateType_1.ChartUpdateType.TOOLTIP_RECALCULATION:
                    const tooltipMeta = this.tooltipManager.getTooltipMeta(this.id);
                    if (performUpdateType < chartUpdateType_1.ChartUpdateType.SERIES_UPDATE && tooltipMeta != null) {
                        this.handlePointer(tooltipMeta);
                    }
                // Fall-through to next pipeline stage.
                case chartUpdateType_1.ChartUpdateType.SCENE_RENDER:
                    yield this.scene.render({ debugSplitTimes: splits, extraDebugStats });
                    this.extraDebugStats = {};
                // Fall-through to next pipeline stage.
                case chartUpdateType_1.ChartUpdateType.NONE:
                    // Do nothing.
                    this._performUpdateType = chartUpdateType_1.ChartUpdateType.NONE;
            }
            const end = performance.now();
            this.log({
                chart: this,
                durationMs: Math.round((end - splits[0]) * 100) / 100,
                count,
                performUpdateType: chartUpdateType_1.ChartUpdateType[performUpdateType],
            });
        });
    }
    set axes(values) {
        this._axes.forEach((axis) => axis.detachAxis(this.axisGroup));
        // make linked axes go after the regular ones (simulates stable sort by `linkedTo` property)
        this._axes = values.filter((a) => !a.linkedTo).concat(values.filter((a) => a.linkedTo));
        this._axes.forEach((axis) => axis.attachAxis(this.axisGroup));
    }
    get axes() {
        return this._axes;
    }
    set series(values) {
        this.removeAllSeries();
        values.forEach((series) => this.addSeries(series));
    }
    get series() {
        return this._series;
    }
    addSeries(series, before) {
        const { series: allSeries, seriesRoot } = this;
        const canAdd = allSeries.indexOf(series) < 0;
        if (canAdd) {
            const beforeIndex = before ? allSeries.indexOf(before) : -1;
            if (beforeIndex >= 0) {
                allSeries.splice(beforeIndex, 0, series);
                seriesRoot.insertBefore(series.rootGroup, before.rootGroup);
            }
            else {
                allSeries.push(series);
                seriesRoot.append(series.rootGroup);
            }
            this.initSeries(series);
            return true;
        }
        return false;
    }
    initSeries(series) {
        series.chart = this;
        series.highlightManager = this.highlightManager;
        if (!series.data) {
            series.data = this.data;
        }
        series.addEventListener('nodeClick', this.onSeriesNodeClick);
    }
    freeSeries(series) {
        series.chart = undefined;
        series.removeEventListener('nodeClick', this.onSeriesNodeClick);
    }
    removeAllSeries() {
        this.series.forEach((series) => {
            this.freeSeries(series);
            this.seriesRoot.removeChild(series.rootGroup);
        });
        this._series = []; // using `_series` instead of `series` to prevent infinite recursion
    }
    assignSeriesToAxes() {
        this.axes.forEach((axis) => {
            axis.boundSeries = this.series.filter((s) => {
                const seriesAxis = axis.direction === chartAxisDirection_1.ChartAxisDirection.X ? s.xAxis : s.yAxis;
                return seriesAxis === axis;
            });
        });
    }
    assignAxesToSeries(force = false) {
        // This method has to run before `assignSeriesToAxes`.
        const directionToAxesMap = {};
        this.axes.forEach((axis) => {
            const direction = axis.direction;
            const directionAxes = directionToAxesMap[direction] || (directionToAxesMap[direction] = []);
            directionAxes.push(axis);
        });
        this.series.forEach((series) => {
            series.directions.forEach((direction) => {
                const currentAxis = direction === chartAxisDirection_1.ChartAxisDirection.X ? series.xAxis : series.yAxis;
                if (currentAxis && !force) {
                    return;
                }
                const directionAxes = directionToAxesMap[direction];
                if (!directionAxes) {
                    console.warn(`AG Charts - no available axis for direction [${direction}]; check series and axes configuration.`);
                    return;
                }
                const seriesKeys = series.getKeys(direction);
                const newAxis = this.findMatchingAxis(directionAxes, series.getKeys(direction));
                if (!newAxis) {
                    console.warn(`AG Charts - no matching axis for direction [${direction}] and keys [${seriesKeys}]; check series and axes configuration.`);
                    return;
                }
                if (direction === chartAxisDirection_1.ChartAxisDirection.X) {
                    series.xAxis = newAxis;
                }
                else {
                    series.yAxis = newAxis;
                }
            });
        });
    }
    findMatchingAxis(directionAxes, directionKeys) {
        for (const axis of directionAxes) {
            const axisKeys = axis.keys;
            if (!axisKeys.length) {
                return axis;
            }
            if (!directionKeys) {
                continue;
            }
            for (const directionKey of directionKeys) {
                if (axisKeys.indexOf(directionKey) >= 0) {
                    return axis;
                }
            }
        }
    }
    resize(width, height) {
        if (this.scene.resize(width, height)) {
            this.background.width = this.width;
            this.background.height = this.height;
            this.disablePointer();
            this.update(chartUpdateType_1.ChartUpdateType.PERFORM_LAYOUT, { forceNodeDataRefresh: true });
        }
    }
    processData() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.axes.length > 0 || this.series.some((s) => s instanceof cartesianSeries_1.CartesianSeries)) {
                this.assignAxesToSeries(true);
                this.assignSeriesToAxes();
            }
            yield Promise.all(this.series.map((s) => s.processData()));
            yield this.updateLegend();
        });
    }
    placeLabels() {
        const visibleSeries = [];
        const data = [];
        for (const series of this.series) {
            if (!series.visible) {
                continue;
            }
            const labelData = series.getLabelData();
            if (!(labelData && labelPlacement_1.isPointLabelDatum(labelData[0]))) {
                continue;
            }
            data.push(labelData);
            visibleSeries.push(series);
        }
        const { seriesRect } = this;
        const labels = seriesRect && data.length > 0
            ? labelPlacement_1.placeLabels(data, { x: 0, y: 0, width: seriesRect.width, height: seriesRect.height })
            : [];
        return new Map(labels.map((l, i) => [visibleSeries[i], l]));
    }
    updateLegend() {
        return __awaiter(this, void 0, void 0, function* () {
            const legendData = [];
            this.series
                .filter((s) => s.showInLegend)
                .forEach((series) => {
                legendData.push(...series.getLegendData());
            });
            const { formatter } = this.legend.item.label;
            if (formatter) {
                legendData.forEach((datum) => (datum.label.text = formatter({
                    get id() {
                        function_1.doOnce(() => console.warn(`AG Charts - LegendLabelFormatterParams.id is deprecated, use seriesId instead`, datum), `LegendLabelFormatterParams.id deprecated`);
                        return datum.seriesId;
                    },
                    itemId: datum.itemId,
                    value: datum.label.text,
                    seriesId: datum.seriesId,
                })));
            }
            this.legend.data = legendData;
        });
    }
    positionCaptions(shrinkRect) {
        const { _title: title, _subtitle: subtitle } = this;
        const newShrinkRect = shrinkRect.clone();
        const positionAndShrinkBBox = (caption) => {
            var _a;
            const baseY = newShrinkRect.y;
            caption.node.x = newShrinkRect.x + newShrinkRect.width / 2;
            caption.node.y = baseY;
            const bbox = caption.node.computeBBox();
            // As the bbox (x,y) ends up at a different location than specified above, we need to
            // take it into consideration when calculating how much space needs to be reserved to
            // accommodate the caption.
            const bboxHeight = Math.ceil(bbox.y - baseY + bbox.height + ((_a = caption.spacing) !== null && _a !== void 0 ? _a : 0));
            newShrinkRect.shrink(bboxHeight, 'top');
        };
        if (!title) {
            return newShrinkRect;
        }
        title.node.visible = title.enabled;
        if (title.enabled) {
            positionAndShrinkBBox(title);
        }
        if (!subtitle) {
            return newShrinkRect;
        }
        subtitle.node.visible = title.enabled && subtitle.enabled;
        if (title.enabled && subtitle.enabled) {
            positionAndShrinkBBox(subtitle);
        }
        return newShrinkRect;
    }
    positionLegend(shrinkRect) {
        const { legend } = this;
        const newShrinkRect = shrinkRect.clone();
        if (!legend.enabled || !legend.data.length) {
            return newShrinkRect;
        }
        const [legendWidth, legendHeight] = this.calculateLegendDimensions(shrinkRect);
        let translationX = 0;
        let translationY = 0;
        legend.translationX = 0;
        legend.translationY = 0;
        legend.performLayout(legendWidth, legendHeight);
        const legendBBox = legend.computePagedBBox();
        const calculateTranslationPerpendicularDimension = () => {
            switch (legend.position) {
                case 'top':
                    return 0;
                case 'bottom':
                    return shrinkRect.height - legendBBox.height;
                case 'left':
                    return 0;
                case 'right':
                default:
                    return shrinkRect.width - legendBBox.width;
            }
        };
        if (legend.visible) {
            switch (legend.position) {
                case 'top':
                case 'bottom':
                    translationX = (shrinkRect.width - legendBBox.width) / 2;
                    translationY = calculateTranslationPerpendicularDimension();
                    newShrinkRect.shrink(legendBBox.height, legend.position);
                    break;
                case 'left':
                case 'right':
                default:
                    translationX = calculateTranslationPerpendicularDimension();
                    translationY = (shrinkRect.height - legendBBox.height) / 2;
                    newShrinkRect.shrink(legendBBox.width, legend.position);
            }
            // Round off for pixel grid alignment to work properly.
            legend.translationX = Math.floor(-legendBBox.x + shrinkRect.x + translationX);
            legend.translationY = Math.floor(-legendBBox.y + shrinkRect.y + translationY);
        }
        return newShrinkRect;
    }
    calculateLegendDimensions(shrinkRect) {
        const { legend } = this;
        const { width, height } = shrinkRect;
        const aspectRatio = width / height;
        const maxCoefficient = 0.5;
        const minHeightCoefficient = 0.2;
        const minWidthCoefficient = 0.25;
        let legendWidth = 0;
        let legendHeight = 0;
        switch (legend.position) {
            case 'top':
            case 'bottom':
                // A horizontal legend should take maximum between 20 to 50 percent of the chart height if height is larger than width
                // and maximum 20 percent of the chart height if height is smaller than width.
                const heightCoefficient = aspectRatio < 1
                    ? Math.min(maxCoefficient, minHeightCoefficient * (1 / aspectRatio))
                    : minHeightCoefficient;
                legendWidth = legend.maxWidth ? Math.min(legend.maxWidth, width) : width;
                legendHeight = legend.maxHeight
                    ? Math.min(legend.maxHeight, height)
                    : Math.round(height * heightCoefficient);
                break;
            case 'left':
            case 'right':
            default:
                // A vertical legend should take maximum between 25 to 50 percent of the chart width if width is larger than height
                // and maximum 25 percent of the chart width if width is smaller than height.
                const widthCoefficient = aspectRatio > 1 ? Math.min(maxCoefficient, minWidthCoefficient * aspectRatio) : minWidthCoefficient;
                legendWidth = legend.maxWidth ? Math.min(legend.maxWidth, width) : Math.round(width * widthCoefficient);
                legendHeight = legend.maxHeight ? Math.min(legend.maxHeight, height) : height;
        }
        return [legendWidth, legendHeight];
    }
    getSeriesRect() {
        return this.seriesRect;
    }
    // x/y are local canvas coordinates in CSS pixels, not actual pixels
    pickSeriesNode(point) {
        var _a, _b;
        const { tooltip: { tracking }, } = this;
        const start = performance.now();
        // Disable 'nearest match' options if tooltip.tracking is enabled.
        const pickModes = tracking ? undefined : [series_1.SeriesNodePickMode.EXACT_SHAPE_MATCH];
        // Iterate through series in reverse, as later declared series appears on top of earlier
        // declared series.
        const reverseSeries = [...this.series].reverse();
        let result = undefined;
        for (const series of reverseSeries) {
            if (!series.visible || !series.rootGroup.visible) {
                continue;
            }
            const { match, distance } = (_a = series.pickNode(point, pickModes)) !== null && _a !== void 0 ? _a : {};
            if (!match || distance == null) {
                continue;
            }
            if (!result || result.distance > distance) {
                result = { series, distance, datum: match };
            }
            if (distance === 0) {
                break;
            }
        }
        this.extraDebugStats['pickSeriesNode'] = Math.round(((_b = this.extraDebugStats['pickSeriesNode']) !== null && _b !== void 0 ? _b : 0) + (performance.now() - start));
        return result;
    }
    onMouseMove(event) {
        this.lastInteractionEvent = event;
        this.pointerScheduler.schedule();
        this.extraDebugStats['mouseX'] = event.offsetX;
        this.extraDebugStats['mouseY'] = event.offsetY;
        this.update(chartUpdateType_1.ChartUpdateType.SCENE_RENDER);
    }
    handlePointer(event) {
        const { lastPick } = this;
        const { pageX, pageY, offsetX, offsetY } = event;
        const disablePointer = () => {
            if (lastPick) {
                // Cursor moved from a non-marker node to empty space.
                this.disablePointer();
            }
        };
        if (!(this.seriesRect && this.seriesRect.containsPoint(offsetX, offsetY))) {
            disablePointer();
            return;
        }
        const pick = this.pickSeriesNode({ x: offsetX, y: offsetY });
        if (!pick) {
            disablePointer();
            return;
        }
        const meta = { pageX, pageY, offsetX, offsetY, event: event.sourceEvent };
        if (!lastPick || lastPick.datum !== pick.datum) {
            this.onSeriesDatumPick(meta, pick.datum);
            return;
        }
        lastPick.event = event.sourceEvent;
        if (this.tooltip.enabled && pick.series.tooltip.enabled) {
            this.tooltipManager.updateTooltip(this.id, this.mergePointerDatum(meta, pick.datum));
        }
    }
    onClick(event) {
        if (this.checkSeriesNodeClick(event)) {
            this.update(chartUpdateType_1.ChartUpdateType.SERIES_UPDATE);
            return;
        }
        this.fireEvent({
            type: 'click',
            event: event.sourceEvent,
        });
    }
    checkSeriesNodeClick(event) {
        const { lastPick } = this;
        if (lastPick === null || lastPick === void 0 ? void 0 : lastPick.datum) {
            const { datum } = lastPick;
            datum.series.fireNodeClickEvent(event.sourceEvent, datum);
            return true;
        }
        else if (event.sourceEvent.type.startsWith('touch')) {
            const pick = this.pickSeriesNode({ x: event.offsetX, y: event.offsetY });
            if (pick) {
                pick.series.fireNodeClickEvent(event.sourceEvent, pick.datum);
                return true;
            }
        }
        return false;
    }
    onSeriesDatumPick(meta, datum) {
        const { lastPick } = this;
        if (lastPick) {
            if (lastPick.datum === datum) {
                return;
            }
        }
        this.highlightManager.updateHighlight(this.id, datum);
        if (datum) {
            meta = this.mergePointerDatum(meta, datum);
        }
        const tooltipEnabled = this.tooltip.enabled && datum.series.tooltip.enabled;
        const html = tooltipEnabled && datum.series.getTooltipHtml(datum);
        if (html) {
            this.tooltipManager.updateTooltip(this.id, meta, html);
        }
    }
    mergePointerDatum(meta, datum) {
        if (datum.point) {
            const { x, y } = datum.point;
            const { canvas } = this.scene;
            const point = datum.series.rootGroup.inverseTransformPoint(x, y);
            const canvasRect = canvas.element.getBoundingClientRect();
            return Object.assign(Object.assign({}, meta), { pageX: Math.round(canvasRect.left + window.scrollX + point.x), pageY: Math.round(canvasRect.top + window.scrollY + point.y), offsetX: Math.round(point.x), offsetY: Math.round(point.y) });
        }
        return meta;
    }
    changeHighlightDatum(event) {
        const seriesToUpdate = new Set();
        const { series: newSeries = undefined, datum: newDatum } = event.currentHighlight || {};
        const { series: lastSeries = undefined, datum: lastDatum } = event.previousHighlight || {};
        if (lastSeries) {
            seriesToUpdate.add(lastSeries);
        }
        if (newSeries) {
            seriesToUpdate.add(newSeries);
        }
        // Adjust cursor if a specific datum is highlighted, rather than just a series.
        if ((lastSeries === null || lastSeries === void 0 ? void 0 : lastSeries.cursor) && lastDatum) {
            this.cursorManager.updateCursor(lastSeries.id);
        }
        if ((newSeries === null || newSeries === void 0 ? void 0 : newSeries.cursor) && newDatum) {
            this.cursorManager.updateCursor(newSeries.id, newSeries.cursor);
        }
        this.lastPick = event.currentHighlight ? { datum: event.currentHighlight } : undefined;
        const updateAll = newSeries == null || lastSeries == null;
        if (updateAll) {
            this.update(chartUpdateType_1.ChartUpdateType.SERIES_UPDATE);
        }
        else {
            this.update(chartUpdateType_1.ChartUpdateType.SERIES_UPDATE, { seriesToUpdate });
        }
    }
    waitForUpdate(timeoutMs = 5000) {
        return __awaiter(this, void 0, void 0, function* () {
            const start = performance.now();
            while (this._pendingFactoryUpdates.length > 0 || this.updatePending) {
                if (performance.now() - start > timeoutMs) {
                    throw new Error('waitForUpdate() timeout reached.');
                }
                yield async_1.sleep(5);
            }
            yield this.awaitUpdateCompletion();
        });
    }
}
__decorate([
    validation_1.Validate(validation_1.BOOLEAN)
], Chart.prototype, "_autoSize", void 0);
__decorate([
    validation_1.Validate(validation_1.STRING_UNION('standalone', 'integrated'))
], Chart.prototype, "mode", void 0);
exports.Chart = Chart;
