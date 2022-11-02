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
import { BBox } from '../scene/bbox';
import { find } from '../util/array';
import { SizeMonitor } from '../util/sizeMonitor';
import { Observable } from '../util/observable';
import { ChartAxisDirection } from './chartAxis';
import { createId } from '../util/id';
import { isPointLabelDatum, placeLabels } from '../util/labelPlacement';
import { debouncedAnimationFrame, debouncedCallback } from '../util/render';
import { CartesianSeries } from './series/cartesian/cartesianSeries';
import { BOOLEAN, Validate } from '../util/validation';
import { sleep } from '../util/async';
import { doOnce } from '../util/function';
import { Tooltip } from './tooltip/tooltip';
/** Types of chart-update, in pipeline execution order. */
export var ChartUpdateType;
(function (ChartUpdateType) {
    ChartUpdateType[ChartUpdateType["FULL"] = 0] = "FULL";
    ChartUpdateType[ChartUpdateType["PROCESS_DATA"] = 1] = "PROCESS_DATA";
    ChartUpdateType[ChartUpdateType["PERFORM_LAYOUT"] = 2] = "PERFORM_LAYOUT";
    ChartUpdateType[ChartUpdateType["SERIES_UPDATE"] = 3] = "SERIES_UPDATE";
    ChartUpdateType[ChartUpdateType["SCENE_RENDER"] = 4] = "SCENE_RENDER";
    ChartUpdateType[ChartUpdateType["NONE"] = 5] = "NONE";
})(ChartUpdateType || (ChartUpdateType = {}));
export class Chart extends Observable {
    constructor(document = window.document, overrideDevicePixelRatio) {
        super();
        this.id = createId(this);
        this.options = {};
        this.userOptions = {};
        this.background = new Background();
        this.legend = new Legend();
        this.legendAutoPadding = new Padding();
        this._debug = false;
        this.extraDebugStats = {};
        this._container = undefined;
        this._data = [];
        this._autoSize = false;
        this.padding = new Padding(20);
        this._title = undefined;
        this._subtitle = undefined;
        this._destroyed = false;
        this._pendingFactoryUpdates = [];
        this._performUpdateNoRenderCount = 0;
        this._performUpdateType = ChartUpdateType.NONE;
        this.seriesToUpdate = new Set();
        this.performUpdateTrigger = debouncedCallback(({ count }) => __awaiter(this, void 0, void 0, function* () {
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
        this.legendBBox = new BBox(0, 0, 0, 0);
        this._onMouseDown = this.onMouseDown.bind(this);
        this._onMouseMove = this.onMouseMove.bind(this);
        this._onMouseUp = this.onMouseUp.bind(this);
        this._onMouseOut = this.onMouseOut.bind(this);
        this._onClick = this.onClick.bind(this);
        this.lastPointerMeta = undefined;
        this.pointerScheduler = debouncedAnimationFrame(() => {
            this.handlePointer(this.lastPointerMeta);
            this.lastPointerMeta = undefined;
        });
        this.pointerInsideLegend = false;
        this.pointerOverLegendDatum = false;
        const root = new Group({ name: 'root' });
        const background = this.background;
        background.fill = 'white';
        root.appendChild(background.node);
        const element = (this.element = document.createElement('div'));
        element.classList.add('ag-chart-wrapper');
        element.style.position = 'relative';
        this.scene = new Scene({ document, overrideDevicePixelRatio });
        this.scene.debug.consoleLog = this._debug;
        this.scene.root = root;
        this.scene.container = element;
        this.autoSize = true;
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
        this.tooltip = new Tooltip(() => this.scene.canvas.element, document, () => this.container);
        this.setupDomListeners(this.scene.canvas.element);
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
        var _a, _b;
        const { root } = this.scene;
        if (this._title != null) {
            (_a = root) === null || _a === void 0 ? void 0 : _a.removeChild(this._title.node);
        }
        this._title = caption;
        if (this._title != null) {
            (_b = root) === null || _b === void 0 ? void 0 : _b.appendChild(this._title.node);
        }
    }
    get title() {
        return this._title;
    }
    set subtitle(caption) {
        var _a, _b;
        const { root } = this.scene;
        if (this._subtitle != null) {
            (_a = root) === null || _a === void 0 ? void 0 : _a.removeChild(this._subtitle.node);
        }
        this._subtitle = caption;
        if (this._subtitle != null) {
            (_b = root) === null || _b === void 0 ? void 0 : _b.appendChild(this._subtitle.node);
        }
    }
    get subtitle() {
        return this._subtitle;
    }
    get destroyed() {
        return this._destroyed;
    }
    destroy() {
        this._performUpdateType = ChartUpdateType.NONE;
        this._pendingFactoryUpdates.splice(0);
        this.tooltip.destroy();
        SizeMonitor.unobserve(this.element);
        this.container = undefined;
        this.cleanupDomListeners(this.scene.canvas.element);
        this.scene.destroy();
        this.series.forEach((s) => s.destroy());
        this.series = [];
        this._destroyed = true;
    }
    log(opts) {
        if (this.debug) {
            console.log(opts);
        }
    }
    togglePointer(visible) {
        if (this.tooltip.enabled) {
            this.tooltip.toggle(visible);
        }
        else if (this.lastPick) {
            this.changeHighlightDatum();
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
        return this._performUpdateType !== ChartUpdateType.NONE || this.lastPointerMeta != null;
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
        return __awaiter(this, void 0, void 0, function* () {
            const { _performUpdateType: performUpdateType, extraDebugStats } = this;
            const splits = [performance.now()];
            switch (performUpdateType) {
                case ChartUpdateType.FULL:
                case ChartUpdateType.PROCESS_DATA:
                    yield this.processData();
                    splits.push(performance.now());
                    // Disable tooltip/highlight if the data fundamentally shifted.
                    this.disablePointer({ updateProcessing: false });
                // Fall-through to next pipeline stage.
                case ChartUpdateType.PERFORM_LAYOUT:
                    if (this._autoSize && !this._lastAutoSize) {
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
                    yield this.performLayout();
                    splits.push(performance.now());
                // Fall-through to next pipeline stage.
                case ChartUpdateType.SERIES_UPDATE:
                    const { seriesRect } = this;
                    const seriesUpdates = [...this.seriesToUpdate].map((series) => series.update({ seriesRect }));
                    this.seriesToUpdate.clear();
                    yield Promise.all(seriesUpdates);
                    splits.push(performance.now());
                // Fall-through to next pipeline stage.
                case ChartUpdateType.SCENE_RENDER:
                    yield this.scene.render({ debugSplitTimes: splits, extraDebugStats });
                    this.extraDebugStats = {};
                // Fall-through to next pipeline stage.
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
        this._axes.forEach((axis) => this.detachAxis(axis));
        // make linked axes go after the regular ones (simulates stable sort by `linkedTo` property)
        this._axes = values.filter((a) => !a.linkedTo).concat(values.filter((a) => a.linkedTo));
        this._axes.forEach((axis) => this.attachAxis(axis));
    }
    get axes() {
        return this._axes;
    }
    attachAxis(axis) {
        this.scene.root.insertBefore(axis.gridlineGroup, this.seriesRoot);
        this.scene.root.insertBefore(axis.axisGroup, this.seriesRoot);
        this.scene.root.insertBefore(axis.crossLineGroup, this.seriesRoot);
    }
    detachAxis(axis) {
        this.scene.root.removeChild(axis.axisGroup);
        this.scene.root.removeChild(axis.gridlineGroup);
        this.scene.root.removeChild(axis.crossLineGroup);
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
                seriesRoot.insertBefore(series.group, before.group);
            }
            else {
                allSeries.push(series);
                seriesRoot.append(series.group);
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
        series.addEventListener('nodeClick', this.onSeriesNodeClick, this);
    }
    freeSeries(series) {
        series.chart = undefined;
        series.removeEventListener('nodeClick', this.onSeriesNodeClick, this);
    }
    addSeriesAfter(series, after) {
        const { series: allSeries, seriesRoot } = this;
        const canAdd = allSeries.indexOf(series) < 0;
        if (canAdd) {
            const afterIndex = after ? this.series.indexOf(after) : -1;
            if (afterIndex >= 0) {
                if (afterIndex + 1 < allSeries.length) {
                    seriesRoot.insertBefore(series.group, allSeries[afterIndex + 1].group);
                }
                else {
                    seriesRoot.append(series.group);
                }
                this.initSeries(series);
                allSeries.splice(afterIndex + 1, 0, series);
            }
            else {
                if (allSeries.length > 0) {
                    seriesRoot.insertBefore(series.group, allSeries[0].group);
                }
                else {
                    seriesRoot.append(series.group);
                }
                this.initSeries(series);
                allSeries.unshift(series);
            }
        }
        return false;
    }
    removeSeries(series) {
        const index = this.series.indexOf(series);
        if (index >= 0) {
            this.series.splice(index, 1);
            this.freeSeries(series);
            this.seriesRoot.removeChild(series.group);
            return true;
        }
        return false;
    }
    removeAllSeries() {
        this.series.forEach((series) => {
            this.freeSeries(series);
            this.seriesRoot.removeChild(series.group);
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
                    console.warn(`AG Charts - no available axis for direction [${direction}]; check series and axes configuration.`);
                    return;
                }
                const seriesKeys = series.getKeys(direction);
                const newAxis = this.findMatchingAxis(directionAxes, series.getKeys(direction));
                if (!newAxis) {
                    console.warn(`AG Charts - no matching axis for direction [${direction}] and keys [${seriesKeys}]; check series and axes configuration.`);
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
        if (this.scene.resize(width, height)) {
            this.background.width = this.width;
            this.background.height = this.height;
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
            let labelData = series.getLabelData();
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
                        doOnce(() => console.warn(`AG Charts - LegendLabelFormatterParams.id is deprecated, use seriesId instead`, datum), `LegendLabelFormatterParams.id deprecated`);
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
    positionCaptions() {
        const { _title: title, _subtitle: subtitle } = this;
        const spacing = 10;
        let paddingTop = spacing;
        if (!title) {
            return {};
        }
        title.node.visible = title.enabled;
        if (title.enabled) {
            title.node.x = this.width / 2;
            title.node.y = paddingTop;
            const titleBBox = title.node.computeBBox(); // make sure to set node's x/y, then computeBBox
            if (titleBBox) {
                paddingTop = titleBBox.y + titleBBox.height;
            }
        }
        if (!subtitle) {
            return {};
        }
        subtitle.node.visible = title.enabled && subtitle.enabled;
        if (title.enabled && subtitle.enabled) {
            subtitle.node.x = this.width / 2;
            subtitle.node.y = paddingTop + spacing;
            const subtitleBBox = subtitle.node.computeBBox();
            if (subtitleBBox) {
                paddingTop = subtitleBBox.y + subtitleBBox.height;
            }
        }
        return { captionAutoPadding: Math.floor(paddingTop) };
    }
    positionLegend(captionAutoPadding) {
        const { legend, legendAutoPadding } = this;
        legendAutoPadding.clear();
        if (!legend.enabled || !legend.data.length) {
            return;
        }
        const width = this.width;
        const height = this.height - captionAutoPadding;
        const legendGroup = legend.group;
        const legendSpacing = legend.spacing;
        let translationX = 0;
        let translationY = 0;
        let legendBBox;
        switch (legend.position) {
            case 'bottom':
                legend.performLayout(width - legendSpacing * 2, 0);
                legendBBox = legendGroup.computeBBox();
                legendGroup.visible = legendBBox.height < Math.floor(height * 0.5); // Remove legend if it takes up more than 50% of the chart height.
                if (legendGroup.visible) {
                    translationX = (width - legendBBox.width) / 2 - legendBBox.x;
                    translationY = captionAutoPadding + height - legendBBox.height - legendBBox.y - legendSpacing;
                    legendAutoPadding.bottom = legendBBox.height;
                }
                else {
                    legendAutoPadding.bottom = 0;
                }
                break;
            case 'top':
                legend.performLayout(width - legendSpacing * 2, 0);
                legendBBox = legendGroup.computeBBox();
                legendGroup.visible = legendBBox.height < Math.floor(height * 0.5);
                if (legendGroup.visible) {
                    translationX = (width - legendBBox.width) / 2 - legendBBox.x;
                    translationY = captionAutoPadding + legendSpacing - legendBBox.y;
                    legendAutoPadding.top = legendBBox.height;
                }
                else {
                    legendAutoPadding.top = 0;
                }
                break;
            case 'left':
                legend.performLayout(width, height - legendSpacing * 2);
                legendBBox = legendGroup.computeBBox();
                legendGroup.visible = legendBBox.width < Math.floor(width * 0.5); // Remove legend if it takes up more than 50% of the chart width.
                if (legendGroup.visible) {
                    translationX = legendSpacing - legendBBox.x;
                    translationY = captionAutoPadding + (height - legendBBox.height) / 2 - legendBBox.y;
                    legendAutoPadding.left = legendBBox.width;
                }
                else {
                    legendAutoPadding.left = 0;
                }
                break;
            default: // case 'right':
                legend.performLayout(width, height - legendSpacing * 2);
                legendBBox = legendGroup.computeBBox();
                legendGroup.visible = legendBBox.width < Math.floor(width * 0.5);
                if (legendGroup.visible) {
                    translationX = width - legendBBox.width - legendBBox.x - legendSpacing;
                    translationY = captionAutoPadding + (height - legendBBox.height) / 2 - legendBBox.y;
                    legendAutoPadding.right = legendBBox.width;
                }
                else {
                    legendAutoPadding.right = 0;
                }
                break;
        }
        if (legendGroup.visible) {
            // Round off for pixel grid alignment to work properly.
            legendGroup.translationX = Math.floor(translationX + legendGroup.translationX);
            legendGroup.translationY = Math.floor(translationY + legendGroup.translationY);
            this.legendBBox = legendGroup.computeBBox();
        }
    }
    setupDomListeners(chartElement) {
        chartElement.addEventListener('mousedown', this._onMouseDown);
        chartElement.addEventListener('mousemove', this._onMouseMove);
        chartElement.addEventListener('mouseup', this._onMouseUp);
        chartElement.addEventListener('mouseout', this._onMouseOut);
        chartElement.addEventListener('click', this._onClick);
    }
    cleanupDomListeners(chartElement) {
        chartElement.removeEventListener('mousedown', this._onMouseDown);
        chartElement.removeEventListener('mousemove', this._onMouseMove);
        chartElement.removeEventListener('mouseup', this._onMouseUp);
        chartElement.removeEventListener('mouseout', this._onMouseOut);
        chartElement.removeEventListener('click', this._onClick);
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
        const pickModes = tracking ? undefined : [SeriesNodePickMode.EXACT_SHAPE_MATCH];
        // Iterate through series in reverse, as later declared series appears on top of earlier
        // declared series.
        const reverseSeries = [...this.series].reverse();
        let result = undefined;
        for (const series of reverseSeries) {
            if (!series.visible || !series.group.visible) {
                continue;
            }
            let { match, distance } = (_a = series.pickNode(point, pickModes), (_a !== null && _a !== void 0 ? _a : {}));
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
        this.extraDebugStats['pickSeriesNode'] = Math.round((_b = this.extraDebugStats['pickSeriesNode'], (_b !== null && _b !== void 0 ? _b : 0)) + (performance.now() - start));
        return result;
    }
    onMouseMove(event) {
        this.handleLegendMouseMove(event);
        if (this.tooltip.enabled) {
            if (this.tooltip.delay > 0) {
                this.togglePointer(false);
            }
        }
        this.lastPointerMeta = {
            pageX: event.pageX,
            pageY: event.pageY,
            offsetX: event.offsetX,
            offsetY: event.offsetY,
            event,
        };
        this.pointerScheduler.schedule();
        this.extraDebugStats['mouseX'] = event.offsetX;
        this.extraDebugStats['mouseY'] = event.offsetY;
        this.update(ChartUpdateType.SCENE_RENDER);
    }
    disablePointer({ updateProcessing = true } = {}) {
        this.changeHighlightDatum(undefined, { updateProcessing });
        this.togglePointer(false);
    }
    handlePointer(meta) {
        const { lastPick } = this;
        const { offsetX, offsetY } = meta;
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
        if (!lastPick || lastPick.datum !== pick.datum) {
            this.onSeriesDatumPick(meta, pick.datum);
            return;
        }
        lastPick.event = meta.event;
        if (this.tooltip.enabled && pick.series.tooltip.enabled) {
            this.tooltip.show(this.mergePointerDatum(meta, pick.datum));
        }
    }
    onMouseDown(_event) {
        // Override point for subclasses.
    }
    onMouseUp(_event) {
        // Override point for subclasses.
    }
    onMouseOut(_event) {
        this.togglePointer(false);
    }
    onClick(event) {
        if (this.checkSeriesNodeClick()) {
            this.update(ChartUpdateType.SERIES_UPDATE);
            return;
        }
        if (this.checkLegendClick(event)) {
            this.update(ChartUpdateType.PROCESS_DATA, { forceNodeDataRefresh: true });
            return;
        }
        this.fireEvent({
            type: 'click',
            event,
        });
    }
    checkSeriesNodeClick() {
        const { lastPick } = this;
        if (lastPick && lastPick.event) {
            const { event, datum } = lastPick;
            datum.series.fireNodeClickEvent(event, datum);
            return true;
        }
        return false;
    }
    onSeriesNodeClick(event) {
        const seriesNodeClickEvent = Object.assign(Object.assign({}, event), { type: 'seriesNodeClick' });
        Object.defineProperty(seriesNodeClickEvent, 'series', {
            enumerable: false,
            // Should display the deprecation warning
            get: () => event.series,
        });
        this.fireEvent(seriesNodeClickEvent);
    }
    checkLegendClick(event) {
        var _a;
        const { legend, legend: { listeners: { legendItemClick }, }, } = this;
        const datum = legend.getDatumForPoint(event.offsetX, event.offsetY);
        if (!datum) {
            return false;
        }
        const { id, itemId, enabled } = datum;
        const series = find(this.series, (s) => s.id === id);
        if (!series) {
            return false;
        }
        series.toggleSeriesItem(itemId, !enabled);
        if (enabled) {
            this.togglePointer(false);
        }
        if (enabled && ((_a = this.highlightedDatum) === null || _a === void 0 ? void 0 : _a.series) === series) {
            this.highlightedDatum = undefined;
        }
        if (!enabled) {
            this.highlightedDatum = {
                series,
                itemId,
                datum: undefined,
            };
        }
        legendItemClick({ enabled: !enabled, itemId, seriesId: series.id });
        return true;
    }
    handleLegendMouseMove(event) {
        if (!this.legend.enabled) {
            return;
        }
        const { offsetX, offsetY } = event;
        const datum = this.legend.getDatumForPoint(offsetX, offsetY);
        const pointerInsideLegend = this.legendBBox.containsPoint(offsetX, offsetY);
        const pointerOverLegendDatum = pointerInsideLegend && datum !== undefined;
        if (!pointerInsideLegend && this.pointerInsideLegend) {
            this.pointerInsideLegend = false;
            this.element.style.cursor = 'default';
            // Dehighlight if the pointer was inside the legend and is now leaving it.
            this.changeHighlightDatum();
            return;
        }
        if (pointerOverLegendDatum && !this.pointerOverLegendDatum) {
            this.element.style.cursor = 'pointer';
            if (datum && this.legend.truncatedItems.has(datum.itemId || datum.id)) {
                this.element.title = datum.label.text;
            }
            else {
                this.element.title = '';
            }
        }
        if (!pointerOverLegendDatum && this.pointerOverLegendDatum) {
            this.element.style.cursor = 'default';
        }
        this.pointerInsideLegend = pointerInsideLegend;
        this.pointerOverLegendDatum = pointerOverLegendDatum;
        const oldHighlightedDatum = this.highlightedDatum;
        if (datum) {
            const { id, itemId, enabled } = datum;
            if (enabled) {
                const series = find(this.series, (series) => series.id === id);
                if (series) {
                    this.highlightedDatum = {
                        series,
                        itemId,
                        datum: undefined,
                    };
                }
            }
            else {
                this.highlightedDatum = undefined;
            }
        }
        // Careful to only schedule updates when necessary.
        if ((this.highlightedDatum && !oldHighlightedDatum) ||
            (!this.highlightedDatum && oldHighlightedDatum) ||
            (this.highlightedDatum &&
                oldHighlightedDatum &&
                (this.highlightedDatum.series !== oldHighlightedDatum.series ||
                    this.highlightedDatum.itemId !== oldHighlightedDatum.itemId))) {
            this.update(ChartUpdateType.SERIES_UPDATE);
        }
    }
    onSeriesDatumPick(meta, datum) {
        const { lastPick } = this;
        if (lastPick) {
            if (lastPick.datum === datum) {
                return;
            }
        }
        this.changeHighlightDatum({
            datum,
            event: meta.event,
        });
        if (datum) {
            meta = this.mergePointerDatum(meta, datum);
        }
        const tooltipEnabled = this.tooltip.enabled && datum.series.tooltip.enabled;
        const html = tooltipEnabled && datum.series.getTooltipHtml(datum);
        if (html) {
            this.tooltip.show(meta, html);
        }
    }
    mergePointerDatum(meta, datum) {
        if (datum.point) {
            const { x, y } = datum.point;
            const { canvas } = this.scene;
            const point = datum.series.group.inverseTransformPoint(x, y);
            const canvasRect = canvas.element.getBoundingClientRect();
            return Object.assign(Object.assign({}, meta), { pageX: Math.round(canvasRect.left + window.scrollX + point.x), pageY: Math.round(canvasRect.top + window.scrollY + point.y), offsetX: Math.round(canvasRect.left + point.y), offsetY: Math.round(canvasRect.top + point.y) });
        }
        return meta;
    }
    changeHighlightDatum(newPick, opts) {
        const { updateProcessing = true } = (opts !== null && opts !== void 0 ? opts : {});
        const seriesToUpdate = new Set();
        const { datum: { series: newSeries = undefined } = {}, datum = undefined } = newPick || {};
        const { lastPick: { datum: { series: lastSeries = undefined } = {} } = {} } = this;
        if (lastSeries) {
            seriesToUpdate.add(lastSeries);
        }
        if (newSeries) {
            seriesToUpdate.add(newSeries);
            this.element.style.cursor = newSeries.cursor;
        }
        this.lastPick = newPick;
        this.highlightedDatum = datum;
        if (!updateProcessing) {
            return;
        }
        let updateAll = newSeries == null || lastSeries == null;
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
}
__decorate([
    Validate(BOOLEAN)
], Chart.prototype, "_autoSize", void 0);
