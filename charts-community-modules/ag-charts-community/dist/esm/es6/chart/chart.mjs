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
import { Scene } from '../scene/scene.mjs';
import { Group } from '../scene/group.mjs';
import { Text } from '../scene/shape/text.mjs';
import { SeriesNodePickMode } from './series/series.mjs';
import { Padding } from '../util/padding.mjs';
import { BBox } from '../scene/bbox.mjs';
import { SizeMonitor } from '../util/sizeMonitor.mjs';
import { Observable } from '../util/observable.mjs';
import { createId } from '../util/id.mjs';
import { isPointLabelDatum, placeLabels } from '../util/labelPlacement.mjs';
import { debouncedAnimationFrame, debouncedCallback } from '../util/render.mjs';
import { BOOLEAN, STRING_UNION, Validate } from '../util/validation.mjs';
import { sleep } from '../util/async.mjs';
import { Tooltip } from './tooltip/tooltip.mjs';
import { ChartOverlays } from './overlay/chartOverlays.mjs';
import { jsonMerge } from '../util/json.mjs';
import { Layers } from './layers.mjs';
import { AnimationManager } from './interaction/animationManager.mjs';
import { CursorManager } from './interaction/cursorManager.mjs';
import { ChartEventManager } from './interaction/chartEventManager.mjs';
import { HighlightManager } from './interaction/highlightManager.mjs';
import { InteractionManager } from './interaction/interactionManager.mjs';
import { TooltipManager } from './interaction/tooltipManager.mjs';
import { ZoomManager } from './interaction/zoomManager.mjs';
import { LayoutService } from './layout/layoutService.mjs';
import { DataService } from './dataService.mjs';
import { UpdateService } from './updateService.mjs';
import { ChartUpdateType } from './chartUpdateType.mjs';
import { Logger } from '../util/logger.mjs';
import { ActionOnSet } from '../util/proxy.mjs';
import { ChartHighlight } from './chartHighlight.mjs';
import { getLegend } from './factory/legendTypes.mjs';
import { CallbackCache } from '../util/callbackCache.mjs';
import { DataController } from './data/dataController.mjs';
import { SeriesStateManager } from './series/seriesStateManager.mjs';
import { SeriesLayerManager } from './series/seriesLayerManager.mjs';
export class Chart extends Observable {
    constructor(document = window.document, overrideDevicePixelRatio, resources) {
        var _a;
        super();
        this.id = createId(this);
        this.processedOptions = {};
        this.userOptions = {};
        this.queuedUserOptions = [];
        this.seriesRoot = new Group({ name: `${this.id}-Series-root` });
        this.extraDebugStats = {};
        this.container = undefined;
        this.data = [];
        this.padding = new Padding(20);
        this.seriesAreaPadding = new Padding(0);
        this.title = undefined;
        this.subtitle = undefined;
        this.footnote = undefined;
        this.mode = 'standalone';
        this._destroyed = false;
        this.modules = {};
        this.legendModules = {};
        this._pendingFactoryUpdates = [];
        this._performUpdateNoRenderCount = 0;
        this._performUpdateType = ChartUpdateType.NONE;
        this.seriesToUpdate = new Set();
        this.performUpdateTrigger = debouncedCallback(({ count }) => __awaiter(this, void 0, void 0, function* () {
            if (this._destroyed)
                return;
            try {
                yield this.performUpdate(count);
            }
            catch (error) {
                this._lastPerformUpdateError = error;
                Logger.error('update error', error);
            }
        }));
        this._axes = [];
        this._series = [];
        this.applyLegendOptions = undefined;
        this.lastInteractionEvent = undefined;
        this.pointerScheduler = debouncedAnimationFrame(() => {
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
        this.onSeriesNodeDoubleClick = (event) => {
            const seriesNodeDoubleClick = Object.assign(Object.assign({}, event), { type: 'seriesNodeDoubleClick' });
            this.fireEvent(seriesNodeDoubleClick);
        };
        const scene = resources === null || resources === void 0 ? void 0 : resources.scene;
        const element = (_a = resources === null || resources === void 0 ? void 0 : resources.element) !== null && _a !== void 0 ? _a : document.createElement('div');
        const container = resources === null || resources === void 0 ? void 0 : resources.container;
        const root = new Group({ name: 'root' });
        // Prevent the scene from rendering chart components in an invalid state
        // (before first layout is performed).
        root.visible = false;
        root.append(this.seriesRoot);
        this.axisGroup = new Group({ name: 'Axes', layer: true, zIndex: Layers.AXIS_ZINDEX });
        root.appendChild(this.axisGroup);
        this.element = element;
        element.classList.add('ag-chart-wrapper');
        element.style.position = 'relative';
        this.scene = scene !== null && scene !== void 0 ? scene : new Scene({ document, overrideDevicePixelRatio });
        this.scene.debug.consoleLog = false;
        this.scene.root = root;
        this.scene.container = element;
        this.autoSize = true;
        this.chartEventManager = new ChartEventManager();
        this.cursorManager = new CursorManager(element);
        this.highlightManager = new HighlightManager();
        this.interactionManager = new InteractionManager(element);
        this.zoomManager = new ZoomManager();
        this.dataService = new DataService(() => this.series);
        this.layoutService = new LayoutService();
        this.updateService = new UpdateService((type = ChartUpdateType.FULL, { forceNodeDataRefresh }) => this.update(type, { forceNodeDataRefresh }));
        this.seriesStateManager = new SeriesStateManager();
        this.seriesLayerManager = new SeriesLayerManager(this.seriesRoot);
        this.callbackCache = new CallbackCache();
        this.animationManager = new AnimationManager(this.interactionManager);
        this.animationManager.skipAnimations = true;
        this.animationManager.play();
        this.tooltip = new Tooltip(this.scene.canvas.element, document, document.body);
        this.tooltipManager = new TooltipManager(this.tooltip, this.interactionManager);
        this.overlays = new ChartOverlays(this.element);
        this.highlight = new ChartHighlight();
        this.container = container;
        this.debug = false;
        SizeMonitor.observe(this.element, (size) => {
            var _a;
            const { width, height } = size;
            if (!this.autoSize) {
                return;
            }
            if (width === 0 && height === 0) {
                return;
            }
            const [autoWidth = 0, authHeight = 0] = (_a = this._lastAutoSize) !== null && _a !== void 0 ? _a : [];
            if (autoWidth === width && authHeight === height) {
                return;
            }
            this._lastAutoSize = [width, height];
            this.resize();
        });
        this.layoutService.addListener('start-layout', (e) => this.positionPadding(e.shrinkRect));
        this.layoutService.addListener('start-layout', (e) => this.positionCaptions(e.shrinkRect));
        // Add interaction listeners last so child components are registered first.
        this.interactionManager.addListener('click', (event) => this.onClick(event));
        this.interactionManager.addListener('dblclick', (event) => this.onDoubleClick(event));
        this.interactionManager.addListener('hover', (event) => this.onMouseMove(event));
        this.interactionManager.addListener('leave', (event) => this.onLeave(event));
        this.interactionManager.addListener('page-left', () => this.destroy());
        this.interactionManager.addListener('wheel', () => this.disablePointer());
        this.animationManager.addListener('animation-frame', (_) => {
            this.update(ChartUpdateType.SCENE_RENDER);
        });
        this.highlightManager.addListener('highlight-change', (event) => this.changeHighlightDatum(event));
        this.zoomManager.addListener('zoom-change', (_) => this.update(ChartUpdateType.PROCESS_DATA, { forceNodeDataRefresh: true }));
        this.attachLegend('category');
    }
    getOptions() {
        var _a;
        const { queuedUserOptions } = this;
        const lastUpdateOptions = (_a = queuedUserOptions[queuedUserOptions.length - 1]) !== null && _a !== void 0 ? _a : this.userOptions;
        return jsonMerge([lastUpdateOptions]);
    }
    autoSizeChanged(value) {
        const { style } = this.element;
        if (value) {
            style.display = 'block';
            style.width = '100%';
            style.height = '100%';
            if (!this._lastAutoSize) {
                return;
            }
            this.resize();
        }
        else {
            style.display = 'inline-block';
            style.width = 'auto';
            style.height = 'auto';
        }
    }
    download(fileName, fileFormat) {
        this.scene.download(fileName, fileFormat);
    }
    get destroyed() {
        return this._destroyed;
    }
    addModule(module) {
        if (this.modules[module.optionsKey] != null) {
            throw new Error('AG Charts - module already initialised: ' + module.optionsKey);
        }
        const moduleInstance = new module.instanceConstructor(this.getModuleContext());
        this.modules[module.optionsKey] = { instance: moduleInstance };
        this[module.optionsKey] = moduleInstance;
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
    getModuleContext() {
        const { scene, animationManager, chartEventManager, cursorManager, highlightManager, interactionManager, tooltipManager, zoomManager, dataService, layoutService, updateService, seriesStateManager, seriesLayerManager, mode, callbackCache, } = this;
        return {
            scene,
            animationManager,
            chartEventManager,
            cursorManager,
            highlightManager,
            interactionManager,
            tooltipManager,
            zoomManager,
            dataService,
            layoutService,
            updateService,
            mode,
            seriesStateManager,
            seriesLayerManager,
            callbackCache,
        };
    }
    destroy(opts) {
        var _a;
        if (this._destroyed) {
            return;
        }
        const keepTransferableResources = opts === null || opts === void 0 ? void 0 : opts.keepTransferableResources;
        let result = undefined;
        this._performUpdateType = ChartUpdateType.NONE;
        this._pendingFactoryUpdates.splice(0);
        this.tooltipManager.destroy();
        this.tooltip.destroy();
        (_a = this.legend) === null || _a === void 0 ? void 0 : _a.destroy();
        this.overlays.noData.hide();
        SizeMonitor.unobserve(this.element);
        for (const [key, module] of Object.entries(this.modules)) {
            module.instance.destroy();
            delete this.modules[key];
            delete this[key];
        }
        this.interactionManager.destroy();
        this.animationManager.stop();
        if (keepTransferableResources) {
            this.scene.strip();
            result = { container: this.container, scene: this.scene, element: this.element };
        }
        else {
            this.scene.destroy();
            this.container = undefined;
        }
        this.removeAllSeries();
        this.seriesLayerManager.destroy();
        this.axes.forEach((a) => a.destroy());
        this.axes = [];
        this.callbackCache.invalidateCache();
        this._destroyed = true;
        return result;
    }
    log(...opts) {
        if (this.debug) {
            Logger.debug(...opts);
        }
    }
    disablePointer(highlightOnly = false) {
        if (!highlightOnly) {
            this.tooltipManager.removeTooltip(this.id);
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
            this._processCallbacks().catch((e) => Logger.errorOnce(e));
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
                    yield sleep(1);
                    continue; // Make sure to check queue has an item before continuing.
                }
                try {
                    yield callbacks[0]();
                    this.callbackCache.invalidateCache();
                }
                catch (e) {
                    Logger.error('update error', e);
                }
                callbacks.shift();
            }
        });
    }
    get performUpdateType() {
        return this._performUpdateType;
    }
    get updatePending() {
        return this._performUpdateType !== ChartUpdateType.NONE || this.lastInteractionEvent != null;
    }
    get lastPerformUpdateError() {
        return this._lastPerformUpdateError;
    }
    awaitUpdateCompletion() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.performUpdateTrigger.await();
        });
    }
    update(type = ChartUpdateType.FULL, opts) {
        const { forceNodeDataRefresh = false, seriesToUpdate = this.series } = opts !== null && opts !== void 0 ? opts : {};
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
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { _performUpdateType: performUpdateType, extraDebugStats } = this;
            this.log('Chart.performUpdate() - start', ChartUpdateType[performUpdateType]);
            const splits = [performance.now()];
            switch (performUpdateType) {
                case ChartUpdateType.FULL:
                case ChartUpdateType.PROCESS_DATA:
                    yield this.processData();
                    this.disablePointer(true);
                    splits.push(performance.now());
                // eslint-disable-next-line no-fallthrough
                case ChartUpdateType.PERFORM_LAYOUT:
                    if (!this.checkFirstAutoSize())
                        break;
                    yield this.performLayout();
                    this.handleOverlays();
                    this.log('Chart.performUpdate() - seriesRect', this.seriesRect);
                    splits.push(performance.now());
                // eslint-disable-next-line no-fallthrough
                case ChartUpdateType.SERIES_UPDATE:
                    const { seriesRect } = this;
                    const seriesUpdates = [...this.seriesToUpdate].map((series) => series.update({ seriesRect }));
                    this.seriesToUpdate.clear();
                    yield Promise.all(seriesUpdates);
                    splits.push(performance.now());
                // eslint-disable-next-line no-fallthrough
                case ChartUpdateType.TOOLTIP_RECALCULATION:
                    const tooltipMeta = this.tooltipManager.getTooltipMeta(this.id);
                    if (performUpdateType < ChartUpdateType.SERIES_UPDATE && ((_a = tooltipMeta === null || tooltipMeta === void 0 ? void 0 : tooltipMeta.event) === null || _a === void 0 ? void 0 : _a.type) === 'hover') {
                        this.handlePointer(tooltipMeta.event);
                    }
                // eslint-disable-next-line no-fallthrough
                case ChartUpdateType.SCENE_RENDER:
                    yield this.scene.render({ debugSplitTimes: splits, extraDebugStats });
                    this.extraDebugStats = {};
                // eslint-disable-next-line no-fallthrough
                case ChartUpdateType.NONE:
                    // Do nothing.
                    this._performUpdateType = ChartUpdateType.NONE;
            }
            const end = performance.now();
            this.log('Chart.performUpdate() - end', {
                chart: this,
                durationMs: Math.round((end - splits[0]) * 100) / 100,
                count,
                performUpdateType: ChartUpdateType[performUpdateType],
            });
        });
    }
    checkFirstAutoSize() {
        if (this.autoSize && !this._lastAutoSize) {
            const count = this._performUpdateNoRenderCount++;
            const backOffMs = (count ^ 2) * 10;
            if (count < 5) {
                // Reschedule if canvas size hasn't been set yet to avoid a race.
                this._performUpdateType = ChartUpdateType.PERFORM_LAYOUT;
                this.performUpdateTrigger.schedule(backOffMs);
                this.log('Chart.checkFirstAutoSize() - backing off until first size update', backOffMs);
                return false;
            }
            // After several failed passes, continue and accept there maybe a redundant
            // render. Sometimes this case happens when we already have the correct
            // width/height, and we end up never rendering the chart in that scenario.
            this.log('Chart.checkFirstAutoSize() - timeout for first size update.');
        }
        this._performUpdateNoRenderCount = 0;
        return true;
    }
    set axes(values) {
        const removedAxes = new Set();
        this._axes.forEach((axis) => {
            axis.detachAxis(this.axisGroup);
            removedAxes.add(axis);
        });
        // make linked axes go after the regular ones (simulates stable sort by `linkedTo` property)
        this._axes = values.filter((a) => !a.linkedTo).concat(values.filter((a) => a.linkedTo));
        this._axes.forEach((axis) => {
            axis.attachAxis(this.axisGroup);
            removedAxes.delete(axis);
        });
        this.zoomManager.updateAxes(this._axes);
        removedAxes.forEach((axis) => axis.destroy());
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
    addSeries(series) {
        const { series: allSeries } = this;
        const canAdd = allSeries.indexOf(series) < 0;
        if (canAdd) {
            allSeries.push(series);
            if (series.rootGroup.parent == null) {
                this.seriesLayerManager.requestGroup(series);
            }
            this.initSeries(series);
            return true;
        }
        return false;
    }
    initSeries(series) {
        series.chart = this;
        if (!series.data) {
            series.data = this.data;
        }
        this.addSeriesListeners(series);
        series.addChartEventListeners();
    }
    removeAllSeries() {
        this.series.forEach((series) => {
            series.removeEventListener('nodeClick', this.onSeriesNodeClick);
            series.removeEventListener('nodeDoubleClick', this.onSeriesNodeDoubleClick);
            series.destroy();
            series.chart = undefined;
        });
        this._series = []; // using `_series` instead of `series` to prevent infinite recursion
    }
    addSeriesListeners(series) {
        if (this.hasEventListener('seriesNodeClick')) {
            series.addEventListener('nodeClick', this.onSeriesNodeClick);
        }
        if (this.hasEventListener('seriesNodeDoubleClick')) {
            series.addEventListener('nodeDoubleClick', this.onSeriesNodeDoubleClick);
        }
    }
    updateAllSeriesListeners() {
        this.series.forEach((series) => {
            series.removeEventListener('nodeClick', this.onSeriesNodeClick);
            series.removeEventListener('nodeDoubleClick', this.onSeriesNodeDoubleClick);
            this.addSeriesListeners(series);
        });
    }
    assignSeriesToAxes() {
        this.axes.forEach((axis) => {
            axis.boundSeries = this.series.filter((s) => {
                const seriesAxis = s.axes[axis.direction];
                return seriesAxis === axis;
            });
        });
    }
    assignAxesToSeries() {
        // This method has to run before `assignSeriesToAxes`.
        const directionToAxesMap = {};
        this.axes.forEach((axis) => {
            var _a;
            const direction = axis.direction;
            const directionAxes = ((_a = directionToAxesMap[direction]) !== null && _a !== void 0 ? _a : (directionToAxesMap[direction] = []));
            directionAxes.push(axis);
        });
        this.series.forEach((series) => {
            series.directions.forEach((direction) => {
                const directionAxes = directionToAxesMap[direction];
                if (!directionAxes) {
                    Logger.warn(`no available axis for direction [${direction}]; check series and axes configuration.`);
                    return;
                }
                const seriesKeys = series.getKeys(direction);
                const newAxis = this.findMatchingAxis(directionAxes, series.getKeys(direction));
                if (!newAxis) {
                    Logger.warn(`no matching axis for direction [${direction}] and keys [${seriesKeys}]; check series and axes configuration.`);
                    return;
                }
                series.axes[direction] = newAxis;
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
        var _a, _b, _c, _d;
        width !== null && width !== void 0 ? width : (width = (_a = this.width) !== null && _a !== void 0 ? _a : (this.autoSize ? (_b = this._lastAutoSize) === null || _b === void 0 ? void 0 : _b[0] : this.scene.canvas.width));
        height !== null && height !== void 0 ? height : (height = (_c = this.height) !== null && _c !== void 0 ? _c : (this.autoSize ? (_d = this._lastAutoSize) === null || _d === void 0 ? void 0 : _d[1] : this.scene.canvas.height));
        this.log('Chart.resize()', { width, height });
        if (!width || !height || !Number.isFinite(width) || !Number.isFinite(height))
            return;
        if (this.scene.resize(width, height)) {
            this.disablePointer();
            this.update(ChartUpdateType.PERFORM_LAYOUT, { forceNodeDataRefresh: true });
        }
    }
    processData() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.axes.length > 0) {
                this.assignAxesToSeries();
                this.assignSeriesToAxes();
            }
            const dataController = new DataController();
            const seriesPromises = this.series.map((s) => s.processData(dataController));
            yield dataController.execute();
            yield Promise.all(seriesPromises);
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
            if (!(labelData && isPointLabelDatum(labelData[0]))) {
                continue;
            }
            data.push(labelData);
            visibleSeries.push(series);
        }
        const { seriesRect } = this;
        const labels = seriesRect && data.length > 0
            ? placeLabels(data, { x: 0, y: 0, width: seriesRect.width, height: seriesRect.height })
            : [];
        return new Map(labels.map((l, i) => [visibleSeries[i], l]));
    }
    attachLegend(legendType) {
        var _a;
        if (this.legendType === legendType && this.legend) {
            return this.legend;
        }
        (_a = this.legend) === null || _a === void 0 ? void 0 : _a.destroy();
        this.legend = undefined;
        const ctx = this.getModuleContext();
        const legend = getLegend(legendType, ctx);
        legend.attachLegend(this.scene.root);
        this.legend = legend;
        this.legendType = legendType;
        return legend;
    }
    setLegendInit(initLegend) {
        this.applyLegendOptions = initLegend;
    }
    updateLegend() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const legendData = [];
            this.series
                .filter((s) => s.showInLegend)
                .forEach((series) => {
                const data = series.getLegendData();
                legendData.push(...data);
            });
            const legendType = legendData.length > 0 ? legendData[0].legendType : 'category';
            const legend = this.attachLegend(legendType);
            (_a = this.applyLegendOptions) === null || _a === void 0 ? void 0 : _a.call(this, legend);
            if (legendType === 'category') {
                this.validateLegendData(legendData);
            }
            legend.data = legendData;
        });
    }
    validateLegendData(legendData) {
        // Validate each series that shares a legend item label uses the same fill colour
        const labelMarkerFills = {};
        legendData.forEach((d) => {
            var _a, _b, _c;
            var _d, _e;
            const seriesType = (_a = this.series.find((s) => s.id === d.seriesId)) === null || _a === void 0 ? void 0 : _a.type;
            if (!seriesType)
                return;
            const dc = d;
            (_b = labelMarkerFills[seriesType]) !== null && _b !== void 0 ? _b : (labelMarkerFills[seriesType] = { [dc.label.text]: new Set() });
            (_c = (_d = labelMarkerFills[seriesType])[_e = dc.label.text]) !== null && _c !== void 0 ? _c : (_d[_e] = new Set());
            if (dc.marker.fill != null) {
                labelMarkerFills[seriesType][dc.label.text].add(dc.marker.fill);
            }
        });
        Object.keys(labelMarkerFills).forEach((seriesType) => {
            Object.keys(labelMarkerFills[seriesType]).forEach((name) => {
                const fills = labelMarkerFills[seriesType][name];
                if (fills.size > 1) {
                    Logger.warnOnce(`legend item '${name}' has multiple fill colors, this may cause unexpected behaviour.`);
                }
            });
        });
    }
    performLayout() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.scene.root != null) {
                this.scene.root.visible = true;
            }
            const { scene: { width, height }, } = this;
            let shrinkRect = new BBox(0, 0, width, height);
            ({ shrinkRect } = this.layoutService.dispatchPerformLayout('start-layout', { shrinkRect }));
            ({ shrinkRect } = this.layoutService.dispatchPerformLayout('before-series', { shrinkRect }));
            return shrinkRect;
        });
    }
    positionPadding(shrinkRect) {
        const { padding } = this;
        shrinkRect.shrink(padding.left, 'left');
        shrinkRect.shrink(padding.top, 'top');
        shrinkRect.shrink(padding.right, 'right');
        shrinkRect.shrink(padding.bottom, 'bottom');
        return { shrinkRect };
    }
    positionCaptions(shrinkRect) {
        var _a;
        const { title, subtitle, footnote } = this;
        const newShrinkRect = shrinkRect.clone();
        const updateCaption = (caption) => {
            var _a;
            const defaultCaptionHeight = shrinkRect.height / 10;
            const captionLineHeight = (_a = caption.lineHeight) !== null && _a !== void 0 ? _a : caption.fontSize * Text.defaultLineHeightRatio;
            const maxWidth = shrinkRect.width;
            const maxHeight = Math.max(captionLineHeight, defaultCaptionHeight);
            caption.computeTextWrap(maxWidth, maxHeight);
        };
        const positionTopAndShrinkBBox = (caption) => {
            var _a;
            const baseY = newShrinkRect.y;
            caption.node.x = newShrinkRect.x + newShrinkRect.width / 2;
            caption.node.y = baseY;
            caption.node.textBaseline = 'top';
            updateCaption(caption);
            const bbox = caption.node.computeBBox();
            // As the bbox (x,y) ends up at a different location than specified above, we need to
            // take it into consideration when calculating how much space needs to be reserved to
            // accommodate the caption.
            const bboxHeight = Math.ceil(bbox.y - baseY + bbox.height + ((_a = caption.spacing) !== null && _a !== void 0 ? _a : 0));
            newShrinkRect.shrink(bboxHeight, 'top');
        };
        const positionBottomAndShrinkBBox = (caption) => {
            var _a;
            const baseY = newShrinkRect.y + newShrinkRect.height;
            caption.node.x = newShrinkRect.x + newShrinkRect.width / 2;
            caption.node.y = baseY;
            caption.node.textBaseline = 'bottom';
            updateCaption(caption);
            const bbox = caption.node.computeBBox();
            const bboxHeight = Math.ceil(baseY - bbox.y + ((_a = caption.spacing) !== null && _a !== void 0 ? _a : 0));
            newShrinkRect.shrink(bboxHeight, 'bottom');
        };
        if (title) {
            title.node.visible = title.enabled;
            if (title.node.visible) {
                positionTopAndShrinkBBox(title);
            }
        }
        if (subtitle) {
            subtitle.node.visible = (_a = ((title === null || title === void 0 ? void 0 : title.enabled) && subtitle.enabled)) !== null && _a !== void 0 ? _a : false;
            if (subtitle.node.visible) {
                positionTopAndShrinkBBox(subtitle);
            }
        }
        if (footnote) {
            footnote.node.visible = footnote.enabled;
            if (footnote.node.visible) {
                positionBottomAndShrinkBBox(footnote);
            }
        }
        return { shrinkRect: newShrinkRect };
    }
    getSeriesRect() {
        return this.seriesRect;
    }
    // x/y are local canvas coordinates in CSS pixels, not actual pixels
    pickSeriesNode(point, exactMatchOnly, maxDistance) {
        var _a, _b;
        const start = performance.now();
        // Disable 'nearest match' options if looking for exact matches only
        const pickModes = exactMatchOnly ? [SeriesNodePickMode.EXACT_SHAPE_MATCH] : undefined;
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
            if ((!result || result.distance > distance) && distance <= (maxDistance !== null && maxDistance !== void 0 ? maxDistance : Infinity)) {
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
        this.update(ChartUpdateType.SCENE_RENDER);
    }
    onLeave(event) {
        if (this.tooltip.pointerLeftOntoTooltip(event)) {
            return;
        }
        this.disablePointer();
    }
    handlePointer(event) {
        const { lastPick, hoverRect } = this;
        const { offsetX, offsetY } = event;
        const disablePointer = (highlightOnly = false) => {
            if (lastPick) {
                // Cursor moved from a non-marker node to empty space.
                this.disablePointer(highlightOnly);
            }
        };
        if (!(hoverRect === null || hoverRect === void 0 ? void 0 : hoverRect.containsPoint(offsetX, offsetY))) {
            disablePointer();
            return;
        }
        // Handle node highlighting and tooltip toggling when pointer within `tooltip.range`
        this.handlePointerTooltip(event, disablePointer);
        // Handle node highlighting and mouse cursor when pointer withing `series[].nodeClickRange`
        this.handlePointerNode(event);
    }
    handlePointerTooltip(event, disablePointer) {
        var _a, _b;
        const { lastPick, tooltip } = this;
        const { range } = tooltip;
        const { pageX, pageY, offsetX, offsetY } = event;
        let pixelRange;
        if (typeof range === 'number' && Number.isFinite(range)) {
            pixelRange = range;
        }
        const pick = this.pickSeriesNode({ x: offsetX, y: offsetY }, range === 'exact', pixelRange);
        if (!pick) {
            this.tooltipManager.updateTooltip(this.id);
            if (this.highlight.range === 'tooltip')
                disablePointer(true);
            return;
        }
        const isNewDatum = this.highlight.range === 'node' || !lastPick || lastPick.datum !== pick.datum;
        let html;
        if (isNewDatum) {
            html = pick.series.getTooltipHtml(pick.datum);
            if (this.highlight.range === 'tooltip') {
                this.highlightManager.updateHighlight(this.id, pick.datum);
            }
        }
        else if (lastPick) {
            lastPick.event = event.sourceEvent;
        }
        const isPixelRange = pixelRange != null;
        const tooltipEnabled = this.tooltip.enabled && pick.series.tooltip.enabled;
        const exactlyMatched = range === 'exact' && pick.distance === 0;
        const rangeMatched = range === 'nearest' || isPixelRange || exactlyMatched;
        const shouldUpdateTooltip = tooltipEnabled && rangeMatched && (!isNewDatum || html !== undefined);
        const position = {
            xOffset: pick.datum.series.tooltip.position.xOffset,
            yOffset: pick.datum.series.tooltip.position.yOffset,
        };
        const meta = this.mergePointerDatum({ pageX, pageY, offsetX, offsetY, event: event, showArrow: pick.series.tooltip.showArrow, position }, pick.datum);
        meta.enableInteraction = (_b = (_a = pick.series.tooltip.interaction) === null || _a === void 0 ? void 0 : _a.enabled) !== null && _b !== void 0 ? _b : false;
        if (shouldUpdateTooltip) {
            this.tooltipManager.updateTooltip(this.id, meta, html);
        }
    }
    handlePointerNode(event) {
        const found = this.checkSeriesNodeRange(event, (series, datum) => {
            if (series.hasEventListener('nodeClick') || series.hasEventListener('nodeDoubleClick')) {
                this.cursorManager.updateCursor('chart', 'pointer');
            }
            if (this.highlight.range === 'node') {
                this.highlightManager.updateHighlight(this.id, datum);
            }
        });
        if (!found) {
            this.cursorManager.updateCursor('chart');
            if (this.highlight.range === 'node') {
                this.highlightManager.updateHighlight(this.id);
            }
        }
    }
    onClick(event) {
        if (this.checkSeriesNodeClick(event)) {
            this.update(ChartUpdateType.SERIES_UPDATE);
            return;
        }
        this.fireEvent({
            type: 'click',
            event: event.sourceEvent,
        });
    }
    onDoubleClick(event) {
        if (this.checkSeriesNodeDoubleClick(event)) {
            this.update(ChartUpdateType.SERIES_UPDATE);
            return;
        }
        this.fireEvent({
            type: 'doubleClick',
            event: event.sourceEvent,
        });
    }
    checkSeriesNodeClick(event) {
        return this.checkSeriesNodeRange(event, (series, datum) => series.fireNodeClickEvent(event.sourceEvent, datum));
    }
    checkSeriesNodeDoubleClick(event) {
        return this.checkSeriesNodeRange(event, (series, datum) => series.fireNodeDoubleClickEvent(event.sourceEvent, datum));
    }
    checkSeriesNodeRange(event, callback) {
        const nearestNode = this.pickSeriesNode({ x: event.offsetX, y: event.offsetY }, false);
        const datum = nearestNode === null || nearestNode === void 0 ? void 0 : nearestNode.datum;
        const nodeClickRange = datum === null || datum === void 0 ? void 0 : datum.series.nodeClickRange;
        // First check if we should trigger the callback based on nearest node
        if (datum && nodeClickRange === 'nearest') {
            callback(datum.series, datum);
            return true;
        }
        // Then check for an exact match or within the given range
        let pixelRange;
        if (typeof nodeClickRange === 'number' && Number.isFinite(nodeClickRange)) {
            pixelRange = nodeClickRange;
        }
        const pick = this.pickSeriesNode({ x: event.offsetX, y: event.offsetY }, nodeClickRange === 'exact', pixelRange);
        if (!pick)
            return false;
        // Then if we've picked a node within the pixel range, or exactly, trigger the callback
        const isPixelRange = pixelRange != null;
        const exactlyMatched = nodeClickRange === 'exact' && pick.distance === 0;
        if (isPixelRange || exactlyMatched) {
            callback(pick.series, pick.datum);
            return true;
        }
        return false;
    }
    mergePointerDatum(meta, datum) {
        const { type } = datum.series.tooltip.position;
        if (type === 'node' && datum.nodeMidPoint) {
            const { x, y } = datum.nodeMidPoint;
            const { canvas } = this.scene;
            const point = datum.series.contentGroup.inverseTransformPoint(x, y);
            const canvasRect = canvas.element.getBoundingClientRect();
            return Object.assign(Object.assign({}, meta), { pageX: Math.round(canvasRect.left + window.scrollX + point.x), pageY: Math.round(canvasRect.top + window.scrollY + point.y), offsetX: Math.round(point.x), offsetY: Math.round(point.y) });
        }
        return meta;
    }
    changeHighlightDatum(event) {
        var _a, _b;
        const seriesToUpdate = new Set();
        const { series: newSeries = undefined, datum: newDatum } = (_a = event.currentHighlight) !== null && _a !== void 0 ? _a : {};
        const { series: lastSeries = undefined, datum: lastDatum } = (_b = event.previousHighlight) !== null && _b !== void 0 ? _b : {};
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
            this.update(ChartUpdateType.SERIES_UPDATE);
        }
        else {
            this.update(ChartUpdateType.SERIES_UPDATE, { seriesToUpdate });
        }
    }
    waitForUpdate(timeoutMs = 5000) {
        return __awaiter(this, void 0, void 0, function* () {
            const start = performance.now();
            while (this._pendingFactoryUpdates.length > 0 || this.updatePending) {
                if (performance.now() - start > timeoutMs) {
                    throw new Error('waitForUpdate() timeout reached.');
                }
                yield sleep(5);
            }
            yield this.awaitUpdateCompletion();
        });
    }
    handleOverlays() {
        this.handleNoDataOverlay();
    }
    handleNoDataOverlay() {
        const shouldDisplayNoDataOverlay = !this.series.some((s) => s.hasData());
        const rect = this.getSeriesRect();
        if (shouldDisplayNoDataOverlay && rect) {
            this.overlays.noData.show(rect);
        }
        else {
            this.overlays.noData.hide();
        }
    }
}
__decorate([
    ActionOnSet({
        newValue(value) {
            this.scene.debug.consoleLog = value;
            if (this.animationManager) {
                this.animationManager.debug = value;
            }
        },
    })
], Chart.prototype, "debug", void 0);
__decorate([
    ActionOnSet({
        newValue(value) {
            if (this.destroyed)
                return;
            value.appendChild(this.element);
        },
        oldValue(value) {
            value.removeChild(this.element);
        },
    })
], Chart.prototype, "container", void 0);
__decorate([
    ActionOnSet({
        newValue(value) {
            var _a;
            (_a = this.series) === null || _a === void 0 ? void 0 : _a.forEach((series) => (series.data = value));
        },
    })
], Chart.prototype, "data", void 0);
__decorate([
    ActionOnSet({
        newValue(value) {
            this.resize(value);
        },
    })
], Chart.prototype, "width", void 0);
__decorate([
    ActionOnSet({
        newValue(value) {
            this.resize(undefined, value);
        },
    })
], Chart.prototype, "height", void 0);
__decorate([
    ActionOnSet({
        changeValue(value) {
            this.autoSizeChanged(value);
        },
    }),
    Validate(BOOLEAN)
], Chart.prototype, "autoSize", void 0);
__decorate([
    ActionOnSet({
        newValue(value) {
            var _a;
            (_a = this.scene.root) === null || _a === void 0 ? void 0 : _a.appendChild(value.node);
        },
        oldValue(oldValue) {
            var _a;
            (_a = this.scene.root) === null || _a === void 0 ? void 0 : _a.removeChild(oldValue.node);
        },
    })
], Chart.prototype, "title", void 0);
__decorate([
    ActionOnSet({
        newValue(value) {
            var _a;
            (_a = this.scene.root) === null || _a === void 0 ? void 0 : _a.appendChild(value.node);
        },
        oldValue(oldValue) {
            var _a;
            (_a = this.scene.root) === null || _a === void 0 ? void 0 : _a.removeChild(oldValue.node);
        },
    })
], Chart.prototype, "subtitle", void 0);
__decorate([
    ActionOnSet({
        newValue(value) {
            var _a;
            (_a = this.scene.root) === null || _a === void 0 ? void 0 : _a.appendChild(value.node);
        },
        oldValue(oldValue) {
            var _a;
            (_a = this.scene.root) === null || _a === void 0 ? void 0 : _a.removeChild(oldValue.node);
        },
    })
], Chart.prototype, "footnote", void 0);
__decorate([
    Validate(STRING_UNION('standalone', 'integrated'))
], Chart.prototype, "mode", void 0);
