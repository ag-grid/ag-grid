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
import { Scene } from '../scene/scene';
import { Group } from '../scene/group';
import { SeriesNodePickMode } from './series/series';
import { Padding } from '../util/padding';
import { Background } from './background';
import { Legend } from './legend';
import { SizeMonitor } from '../util/sizeMonitor';
import { Observable } from '../util/observable';
import { ChartAxisDirection } from './chartAxisDirection';
import { createId } from '../util/id';
import { isPointLabelDatum, placeLabels } from '../util/labelPlacement';
import { debouncedAnimationFrame, debouncedCallback } from '../util/render';
import { CartesianSeries } from './series/cartesian/cartesianSeries';
import { BOOLEAN, STRING_UNION, Validate } from '../util/validation';
import { sleep } from '../util/async';
import { Tooltip } from './tooltip/tooltip';
import { ChartOverlays } from './overlay/chartOverlays';
import { InteractionManager } from './interaction/interactionManager';
import { jsonMerge } from '../util/json';
import { Layers } from './layers';
import { CursorManager } from './interaction/cursorManager';
import { HighlightManager } from './interaction/highlightManager';
import { TooltipManager } from './interaction/tooltipManager';
import { ZoomManager } from './interaction/zoomManager';
import { LayoutService } from './layout/layoutService';
import { ChartUpdateType } from './chartUpdateType';
import { Logger } from '../util/logger';
import { ActionOnSet } from '../util/proxy';
import { ChartHighlight } from './chartHighlight';
export class Chart extends Observable {
    constructor(document = window.document, overrideDevicePixelRatio, resources) {
        var _a;
        super();
        this.id = createId(this);
        this.processedOptions = {};
        this.userOptions = {};
        this.queuedUserOptions = [];
        this.seriesRoot = new Group({ name: `${this.id}-Series-root` });
        this.background = new Background(() => this.update(ChartUpdateType.SCENE_RENDER));
        this.extraDebugStats = {};
        this._container = undefined;
        this.data = [];
        this.padding = new Padding(20);
        this.seriesAreaPadding = new Padding(0);
        this.title = undefined;
        this.subtitle = undefined;
        this.footnote = undefined;
        this.mode = 'standalone';
        this._destroyed = false;
        this.modules = {};
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
        const background = this.background;
        background.fill = 'white';
        root.appendChild(background.node);
        this.axisGroup = new Group({ name: 'Axes', layer: true, zIndex: Layers.AXIS_ZINDEX });
        root.appendChild(this.axisGroup);
        this.element = element;
        element.classList.add('ag-chart-wrapper');
        element.style.position = 'relative';
        this.scene = scene !== null && scene !== void 0 ? scene : new Scene({ document, overrideDevicePixelRatio });
        this.debug = false;
        this.scene.debug.consoleLog = false;
        this.scene.root = root;
        this.scene.container = element;
        this.autoSize = true;
        this.interactionManager = new InteractionManager(element);
        this.cursorManager = new CursorManager(element);
        this.highlightManager = new HighlightManager();
        this.zoomManager = new ZoomManager();
        this.layoutService = new LayoutService();
        SizeMonitor.observe(this.element, (size) => {
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
        this.tooltip = new Tooltip(this.scene.canvas.element, document, document.body);
        this.tooltipManager = new TooltipManager(this.tooltip);
        this.legend = new Legend(this, this.interactionManager, this.cursorManager, this.highlightManager, this.tooltipManager);
        this.overlays = new ChartOverlays(this.element);
        this.highlight = new ChartHighlight();
        this.container = container;
        // Add interaction listeners last so child components are registered first.
        this.interactionManager.addListener('click', (event) => this.onClick(event));
        this.interactionManager.addListener('dblclick', (event) => this.onDoubleClick(event));
        this.interactionManager.addListener('hover', (event) => this.onMouseMove(event));
        this.interactionManager.addListener('leave', () => this.disablePointer());
        this.interactionManager.addListener('page-left', () => this.destroy());
        this.zoomManager.addListener('zoom-change', (_) => this.update(ChartUpdateType.PROCESS_DATA, { forceNodeDataRefresh: true }));
        this.highlightManager.addListener('highlight-change', (event) => this.changeHighlightDatum(event));
    }
    getOptions() {
        var _a;
        const { queuedUserOptions } = this;
        const lastUpdateOptions = (_a = queuedUserOptions[queuedUserOptions.length - 1]) !== null && _a !== void 0 ? _a : this.userOptions;
        return jsonMerge([lastUpdateOptions]);
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
    autoSizeChanged(value) {
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
        const moduleMeta = module.initialiseModule(this.getModuleContext());
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
    getModuleContext() {
        const { scene, interactionManager, zoomManager, cursorManager, highlightManager, tooltipManager, layoutService, } = this;
        return {
            scene,
            interactionManager,
            zoomManager,
            cursorManager,
            highlightManager,
            tooltipManager,
            layoutService,
        };
    }
    destroy(opts) {
        if (this._destroyed) {
            return;
        }
        const keepTransferableResources = opts === null || opts === void 0 ? void 0 : opts.keepTransferableResources;
        let result = undefined;
        this._performUpdateType = ChartUpdateType.NONE;
        this._pendingFactoryUpdates.splice(0);
        this.tooltip.destroy();
        SizeMonitor.unobserve(this.element);
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
        this.axes.forEach((a) => a.destroy());
        this.axes = [];
        this._destroyed = true;
        return result;
    }
    log(opts) {
        if (this.debug) {
            Logger.debug(opts);
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
                    yield sleep(1);
                    continue; // Make sure to check queue has an item before continuing.
                }
                try {
                    yield callbacks[0]();
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
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { _performUpdateType: performUpdateType, extraDebugStats } = this;
            const splits = [performance.now()];
            switch (performUpdateType) {
                case ChartUpdateType.FULL:
                case ChartUpdateType.PROCESS_DATA:
                    yield this.processData();
                    this.disablePointer(true);
                    splits.push(performance.now());
                // eslint-disable-next-line no-fallthrough
                case ChartUpdateType.PERFORM_LAYOUT:
                    if (this.autoSize && !this._lastAutoSize) {
                        const count = this._performUpdateNoRenderCount++;
                        if (count < 5) {
                            // Reschedule if canvas size hasn't been set yet to avoid a race.
                            this._performUpdateType = ChartUpdateType.PERFORM_LAYOUT;
                            this.performUpdateTrigger.schedule();
                            break;
                        }
                        // After several failed passes, continue and accept there maybe a redundant
                        // render. Sometimes this case happens when we already have the correct
                        // width/height, and we end up never rendering the chart in that scenario.
                    }
                    this._performUpdateNoRenderCount = 0;
                    this.background.performLayout(this.scene.width, this.scene.height);
                    yield this.performLayout();
                    this.handleOverlays();
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
            this.log({
                chart: this,
                durationMs: Math.round((end - splits[0]) * 100) / 100,
                count,
                performUpdateType: ChartUpdateType[performUpdateType],
            });
        });
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
        if (this.hasEventListener('seriesNodeClick')) {
            series.addEventListener('nodeClick', this.onSeriesNodeClick);
        }
        if (this.hasEventListener('seriesNodeDoubleClick')) {
            series.addEventListener('nodeDoubleClick', this.onSeriesNodeDoubleClick);
        }
    }
    freeSeries(series) {
        series.chart = undefined;
        series.removeEventListener('nodeClick', this.onSeriesNodeClick);
        series.removeEventListener('nodeDoubleClick', this.onSeriesNodeDoubleClick);
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
                const seriesAxis = axis.direction === ChartAxisDirection.X ? s.xAxis : s.yAxis;
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
                const currentAxis = direction === ChartAxisDirection.X ? series.xAxis : series.yAxis;
                if (currentAxis && !force) {
                    return;
                }
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
                if (direction === ChartAxisDirection.X) {
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
        if (!width || !height || !Number.isFinite(width) || !Number.isFinite(height))
            return;
        if (this.scene.resize(width, height)) {
            this.disablePointer();
            this.update(ChartUpdateType.PERFORM_LAYOUT, { forceNodeDataRefresh: true });
        }
    }
    processData() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.axes.length > 0 || this.series.some((s) => s instanceof CartesianSeries)) {
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
                        Logger.warnOnce(`LegendLabelFormatterParams.id is deprecated, use seriesId instead`);
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
        const { title, subtitle, footnote } = this;
        const newShrinkRect = shrinkRect.clone();
        const positionTopAndShrinkBBox = (caption) => {
            var _a;
            const baseY = newShrinkRect.y;
            caption.node.x = newShrinkRect.x + newShrinkRect.width / 2;
            caption.node.y = baseY;
            caption.node.textBaseline = 'top';
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
            subtitle.node.visible = title !== undefined && title.enabled && subtitle.enabled;
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
    handlePointer(event) {
        var _a;
        const { lastPick } = this;
        const { offsetX, offsetY } = event;
        const disablePointer = (highlightOnly = false) => {
            if (lastPick) {
                // Cursor moved from a non-marker node to empty space.
                this.disablePointer(highlightOnly);
            }
        };
        const hoverRectPadding = 20;
        const hoverRect = (_a = this.seriesRect) === null || _a === void 0 ? void 0 : _a.clone().grow(hoverRectPadding).grow(this.seriesAreaPadding);
        if (!(hoverRect === null || hoverRect === void 0 ? void 0 : hoverRect.containsPoint(offsetX, offsetY))) {
            disablePointer();
            return;
        }
        // Handle node highlighting and tooltip toggling when pointer within `tooltip.range`
        this.handlePointerTooltip(event, disablePointer);
        // Handle mouse cursor when pointer withing `series[].nodeClickRange`
        this.handlePointerNodeCursor(event);
    }
    handlePointerTooltip(event, disablePointer) {
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
        const meta = this.mergePointerDatum({ pageX, pageY, offsetX, offsetY, event: event }, pick.datum);
        if (shouldUpdateTooltip) {
            this.tooltipManager.updateTooltip(this.id, meta, html);
        }
    }
    handlePointerNodeCursor(event) {
        const found = this.checkSeriesNodeRange(event, (series, datum) => {
            if (series.hasEventListener('nodeClick') || series.hasEventListener('nodeDoubleClick')) {
                this.cursorManager.updateCursor('chart', 'pointer');
                if (this.highlight.range === 'node') {
                    this.highlightManager.updateHighlight(this.id, datum);
                }
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
        // If the tooltip picking uses `nearest` then, irregardless of the range of each series, the same node would
        // be picked, so we can shortcut to using the last pick. Otherwise, we need to pick a node distinctly
        // from the tooltip picking in case the node click range is greater than the tooltip range.
        const nearestNode = this.tooltip.range === 'nearest' && this.lastPick !== undefined
            ? this.lastPick
            : this.pickSeriesNode({ x: event.offsetX, y: event.offsetY }, false);
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
        },
    })
], Chart.prototype, "debug", void 0);
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
            this.autoSize = false;
            this.resize(value, this.height);
        },
    })
], Chart.prototype, "width", void 0);
__decorate([
    ActionOnSet({
        newValue(value) {
            this.autoSize = false;
            this.resize(this.width, value);
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
