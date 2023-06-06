var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
import { Scene } from '../scene/scene';
import { Group } from '../scene/group';
import { Text } from '../scene/shape/text';
import { SeriesNodePickMode } from './series/series';
import { Padding } from '../util/padding';
import { BBox } from '../scene/bbox';
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
import { jsonMerge } from '../util/json';
import { Layers } from './layers';
import { AnimationManager } from './interaction/animationManager';
import { CursorManager } from './interaction/cursorManager';
import { ChartEventManager } from './interaction/chartEventManager';
import { HighlightManager } from './interaction/highlightManager';
import { InteractionManager } from './interaction/interactionManager';
import { TooltipManager } from './interaction/tooltipManager';
import { ZoomManager } from './interaction/zoomManager';
import { LayoutService } from './layout/layoutService';
import { DataService } from './dataService';
import { UpdateService } from './updateService';
import { ChartUpdateType } from './chartUpdateType';
import { Logger } from '../util/logger';
import { ActionOnSet } from '../util/proxy';
import { ChartHighlight } from './chartHighlight';
import { getLegend } from './factory/legendTypes';
import { CallbackCache } from '../util/callbackCache';
var Chart = /** @class */ (function (_super) {
    __extends(Chart, _super);
    function Chart(document, overrideDevicePixelRatio, resources) {
        if (document === void 0) { document = window.document; }
        var _a;
        var _this = _super.call(this) || this;
        _this.id = createId(_this);
        _this.processedOptions = {};
        _this.userOptions = {};
        _this.queuedUserOptions = [];
        _this.seriesRoot = new Group({ name: _this.id + "-Series-root" });
        _this.extraDebugStats = {};
        _this._container = undefined;
        _this.data = [];
        _this.padding = new Padding(20);
        _this.seriesAreaPadding = new Padding(0);
        _this.title = undefined;
        _this.subtitle = undefined;
        _this.footnote = undefined;
        _this.mode = 'standalone';
        _this._destroyed = false;
        _this.modules = {};
        _this.legendModules = {};
        _this._pendingFactoryUpdates = [];
        _this._performUpdateNoRenderCount = 0;
        _this._performUpdateType = ChartUpdateType.NONE;
        _this.seriesToUpdate = new Set();
        _this.performUpdateTrigger = debouncedCallback(function (_a) {
            var count = _a.count;
            return __awaiter(_this, void 0, void 0, function () {
                var error_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (this._destroyed)
                                return [2 /*return*/];
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.performUpdate(count)];
                        case 2:
                            _b.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            error_1 = _b.sent();
                            this._lastPerformUpdateError = error_1;
                            Logger.error('update error', error_1);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        });
        _this._axes = [];
        _this._series = [];
        _this.applyLegendOptions = undefined;
        _this.lastInteractionEvent = undefined;
        _this.pointerScheduler = debouncedAnimationFrame(function () {
            if (_this.lastInteractionEvent) {
                _this.handlePointer(_this.lastInteractionEvent);
            }
            _this.lastInteractionEvent = undefined;
        });
        _this.onSeriesNodeClick = function (event) {
            var seriesNodeClickEvent = __assign(__assign({}, event), { type: 'seriesNodeClick' });
            Object.defineProperty(seriesNodeClickEvent, 'series', {
                enumerable: false,
                // Should display the deprecation warning
                get: function () { return event.series; },
            });
            _this.fireEvent(seriesNodeClickEvent);
        };
        _this.onSeriesNodeDoubleClick = function (event) {
            var seriesNodeDoubleClick = __assign(__assign({}, event), { type: 'seriesNodeDoubleClick' });
            _this.fireEvent(seriesNodeDoubleClick);
        };
        var scene = resources === null || resources === void 0 ? void 0 : resources.scene;
        var element = (_a = resources === null || resources === void 0 ? void 0 : resources.element) !== null && _a !== void 0 ? _a : document.createElement('div');
        var container = resources === null || resources === void 0 ? void 0 : resources.container;
        var root = new Group({ name: 'root' });
        // Prevent the scene from rendering chart components in an invalid state
        // (before first layout is performed).
        root.visible = false;
        root.append(_this.seriesRoot);
        _this.axisGroup = new Group({ name: 'Axes', layer: true, zIndex: Layers.AXIS_ZINDEX });
        root.appendChild(_this.axisGroup);
        _this.element = element;
        element.classList.add('ag-chart-wrapper');
        element.style.position = 'relative';
        _this.scene = scene !== null && scene !== void 0 ? scene : new Scene({ document: document, overrideDevicePixelRatio: overrideDevicePixelRatio });
        _this.debug = false;
        _this.scene.debug.consoleLog = false;
        _this.scene.root = root;
        _this.scene.container = element;
        _this.autoSize = true;
        _this.chartEventManager = new ChartEventManager();
        _this.cursorManager = new CursorManager(element);
        _this.highlightManager = new HighlightManager();
        _this.interactionManager = new InteractionManager(element);
        _this.zoomManager = new ZoomManager();
        _this.dataService = new DataService(function () { return _this.series; });
        _this.layoutService = new LayoutService();
        _this.updateService = new UpdateService(function (type, _a) {
            if (type === void 0) { type = ChartUpdateType.FULL; }
            var forceNodeDataRefresh = _a.forceNodeDataRefresh;
            return _this.update(type, { forceNodeDataRefresh: forceNodeDataRefresh });
        });
        _this.callbackCache = new CallbackCache();
        _this.animationManager = new AnimationManager(_this.interactionManager);
        _this.animationManager.skipAnimations = true;
        _this.animationManager.play();
        _this.tooltip = new Tooltip(_this.scene.canvas.element, document, document.body);
        _this.tooltipManager = new TooltipManager(_this.tooltip, _this.interactionManager);
        _this.overlays = new ChartOverlays(_this.element);
        _this.highlight = new ChartHighlight();
        _this.container = container;
        SizeMonitor.observe(_this.element, function (size) {
            var _a;
            var width = size.width, height = size.height;
            if (!_this.autoSize) {
                return;
            }
            if (width === 0 && height === 0) {
                return;
            }
            var _b = __read((_a = _this._lastAutoSize) !== null && _a !== void 0 ? _a : [], 2), _c = _b[0], autoWidth = _c === void 0 ? 0 : _c, _d = _b[1], authHeight = _d === void 0 ? 0 : _d;
            if (autoWidth === width && authHeight === height) {
                return;
            }
            _this._lastAutoSize = [width, height];
            _this.resize();
        });
        _this.layoutService.addListener('start-layout', function (e) { return _this.positionPadding(e.shrinkRect); });
        _this.layoutService.addListener('start-layout', function (e) { return _this.positionCaptions(e.shrinkRect); });
        // Add interaction listeners last so child components are registered first.
        _this.interactionManager.addListener('click', function (event) { return _this.onClick(event); });
        _this.interactionManager.addListener('dblclick', function (event) { return _this.onDoubleClick(event); });
        _this.interactionManager.addListener('hover', function (event) { return _this.onMouseMove(event); });
        _this.interactionManager.addListener('leave', function (event) { return _this.onLeave(event); });
        _this.interactionManager.addListener('page-left', function () { return _this.destroy(); });
        _this.interactionManager.addListener('wheel', function () { return _this.disablePointer(); });
        _this.animationManager.addListener('animation-frame', function (_) {
            _this.update(ChartUpdateType.SCENE_RENDER);
        });
        _this.highlightManager.addListener('highlight-change', function (event) { return _this.changeHighlightDatum(event); });
        _this.zoomManager.addListener('zoom-change', function (_) {
            return _this.update(ChartUpdateType.PROCESS_DATA, { forceNodeDataRefresh: true });
        });
        _this.attachLegend('category');
        return _this;
    }
    Chart.prototype.getOptions = function () {
        var _a;
        var queuedUserOptions = this.queuedUserOptions;
        var lastUpdateOptions = (_a = queuedUserOptions[queuedUserOptions.length - 1]) !== null && _a !== void 0 ? _a : this.userOptions;
        return jsonMerge([lastUpdateOptions]);
    };
    Object.defineProperty(Chart.prototype, "container", {
        get: function () {
            return this._container;
        },
        set: function (value) {
            if (this._container !== value) {
                var parentNode = this.element.parentNode;
                if (parentNode != null) {
                    parentNode.removeChild(this.element);
                }
                if (value && !this.destroyed) {
                    value.appendChild(this.element);
                }
                this._container = value;
            }
        },
        enumerable: false,
        configurable: true
    });
    Chart.prototype.autoSizeChanged = function (value) {
        var style = this.element.style;
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
    };
    Chart.prototype.download = function (fileName, fileFormat) {
        this.scene.download(fileName, fileFormat);
    };
    Object.defineProperty(Chart.prototype, "destroyed", {
        get: function () {
            return this._destroyed;
        },
        enumerable: false,
        configurable: true
    });
    Chart.prototype.addModule = function (module) {
        if (this.modules[module.optionsKey] != null) {
            throw new Error('AG Charts - module already initialised: ' + module.optionsKey);
        }
        var moduleInstance = new module.instanceConstructor(this.getModuleContext());
        this.modules[module.optionsKey] = { instance: moduleInstance };
        this[module.optionsKey] = moduleInstance;
    };
    Chart.prototype.removeModule = function (module) {
        var _a, _b;
        (_b = (_a = this.modules[module.optionsKey]) === null || _a === void 0 ? void 0 : _a.instance) === null || _b === void 0 ? void 0 : _b.destroy();
        delete this.modules[module.optionsKey];
        delete this[module.optionsKey];
    };
    Chart.prototype.isModuleEnabled = function (module) {
        return this.modules[module.optionsKey] != null;
    };
    Chart.prototype.getModuleContext = function () {
        var _a = this, scene = _a.scene, animationManager = _a.animationManager, chartEventManager = _a.chartEventManager, cursorManager = _a.cursorManager, highlightManager = _a.highlightManager, interactionManager = _a.interactionManager, tooltipManager = _a.tooltipManager, zoomManager = _a.zoomManager, dataService = _a.dataService, layoutService = _a.layoutService, updateService = _a.updateService, mode = _a.mode, callbackCache = _a.callbackCache;
        return {
            scene: scene,
            animationManager: animationManager,
            chartEventManager: chartEventManager,
            cursorManager: cursorManager,
            highlightManager: highlightManager,
            interactionManager: interactionManager,
            tooltipManager: tooltipManager,
            zoomManager: zoomManager,
            dataService: dataService,
            layoutService: layoutService,
            updateService: updateService,
            mode: mode,
            callbackCache: callbackCache,
        };
    };
    Chart.prototype.destroy = function (opts) {
        var e_1, _a;
        var _b;
        if (this._destroyed) {
            return;
        }
        var keepTransferableResources = opts === null || opts === void 0 ? void 0 : opts.keepTransferableResources;
        var result = undefined;
        this._performUpdateType = ChartUpdateType.NONE;
        this._pendingFactoryUpdates.splice(0);
        this.tooltipManager.destroy();
        this.tooltip.destroy();
        (_b = this.legend) === null || _b === void 0 ? void 0 : _b.destroy();
        this.overlays.noData.hide();
        SizeMonitor.unobserve(this.element);
        try {
            for (var _c = __values(Object.entries(this.modules)), _d = _c.next(); !_d.done; _d = _c.next()) {
                var _e = __read(_d.value, 2), key = _e[0], module = _e[1];
                module.instance.destroy();
                delete this.modules[key];
                delete this[key];
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
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
        this.series.forEach(function (s) { return s.destroy(); });
        this.series = [];
        this.axes.forEach(function (a) { return a.destroy(); });
        this.axes = [];
        this.callbackCache.invalidateCache();
        this._destroyed = true;
        return result;
    };
    Chart.prototype.log = function (opts) {
        if (this.debug) {
            Logger.debug(opts);
        }
    };
    Chart.prototype.disablePointer = function (highlightOnly) {
        if (highlightOnly === void 0) { highlightOnly = false; }
        if (!highlightOnly) {
            this.tooltipManager.removeTooltip(this.id);
        }
        this.highlightManager.updateHighlight(this.id);
        if (this.lastInteractionEvent) {
            this.lastInteractionEvent = undefined;
        }
    };
    Chart.prototype.requestFactoryUpdate = function (cb) {
        var callbacks = this._pendingFactoryUpdates;
        var count = callbacks.length;
        if (count === 0) {
            callbacks.push(cb);
            this._processCallbacks().catch(function (e) { return Logger.errorOnce(e); });
        }
        else {
            // Factory callback process already running, the callback will be invoked asynchronously.
            // Clear the queue after the first callback to prevent unnecessary re-renderings.
            callbacks.splice(1, count - 1, cb);
        }
    };
    Chart.prototype._processCallbacks = function () {
        return __awaiter(this, void 0, void 0, function () {
            var callbacks, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        callbacks = this._pendingFactoryUpdates;
                        _a.label = 1;
                    case 1:
                        if (!(callbacks.length > 0)) return [3 /*break*/, 7];
                        if (!this.updatePending) return [3 /*break*/, 3];
                        return [4 /*yield*/, sleep(1)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 1]; // Make sure to check queue has an item before continuing.
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, callbacks[0]()];
                    case 4:
                        _a.sent();
                        this.callbackCache.invalidateCache();
                        return [3 /*break*/, 6];
                    case 5:
                        e_2 = _a.sent();
                        Logger.error('update error', e_2);
                        return [3 /*break*/, 6];
                    case 6:
                        callbacks.shift();
                        return [3 /*break*/, 1];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(Chart.prototype, "performUpdateType", {
        get: function () {
            return this._performUpdateType;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Chart.prototype, "updatePending", {
        get: function () {
            return this._performUpdateType !== ChartUpdateType.NONE || this.lastInteractionEvent != null;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Chart.prototype, "lastPerformUpdateError", {
        get: function () {
            return this._lastPerformUpdateError;
        },
        enumerable: false,
        configurable: true
    });
    Chart.prototype.awaitUpdateCompletion = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.performUpdateTrigger.await()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Chart.prototype.update = function (type, opts) {
        var e_3, _a;
        if (type === void 0) { type = ChartUpdateType.FULL; }
        var _b = opts !== null && opts !== void 0 ? opts : {}, _c = _b.forceNodeDataRefresh, forceNodeDataRefresh = _c === void 0 ? false : _c, _d = _b.seriesToUpdate, seriesToUpdate = _d === void 0 ? this.series : _d;
        if (forceNodeDataRefresh) {
            this.series.forEach(function (series) { return series.markNodeDataDirty(); });
        }
        try {
            for (var seriesToUpdate_1 = __values(seriesToUpdate), seriesToUpdate_1_1 = seriesToUpdate_1.next(); !seriesToUpdate_1_1.done; seriesToUpdate_1_1 = seriesToUpdate_1.next()) {
                var series = seriesToUpdate_1_1.value;
                this.seriesToUpdate.add(series);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (seriesToUpdate_1_1 && !seriesToUpdate_1_1.done && (_a = seriesToUpdate_1.return)) _a.call(seriesToUpdate_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        if (type < this._performUpdateType) {
            this._performUpdateType = type;
            this.performUpdateTrigger.schedule();
        }
    };
    Chart.prototype.performUpdate = function (count) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, performUpdateType, extraDebugStats, splits, _c, count_1, seriesRect_1, seriesUpdates, tooltipMeta, end;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _b = this, performUpdateType = _b._performUpdateType, extraDebugStats = _b.extraDebugStats;
                        splits = [performance.now()];
                        _c = performUpdateType;
                        switch (_c) {
                            case ChartUpdateType.FULL: return [3 /*break*/, 1];
                            case ChartUpdateType.PROCESS_DATA: return [3 /*break*/, 1];
                            case ChartUpdateType.PERFORM_LAYOUT: return [3 /*break*/, 3];
                            case ChartUpdateType.SERIES_UPDATE: return [3 /*break*/, 5];
                            case ChartUpdateType.TOOLTIP_RECALCULATION: return [3 /*break*/, 7];
                            case ChartUpdateType.SCENE_RENDER: return [3 /*break*/, 8];
                            case ChartUpdateType.NONE: return [3 /*break*/, 10];
                        }
                        return [3 /*break*/, 11];
                    case 1: return [4 /*yield*/, this.processData()];
                    case 2:
                        _d.sent();
                        this.disablePointer(true);
                        splits.push(performance.now());
                        _d.label = 3;
                    case 3:
                        if (this.autoSize && !this._lastAutoSize) {
                            count_1 = this._performUpdateNoRenderCount++;
                            if (count_1 < 5) {
                                // Reschedule if canvas size hasn't been set yet to avoid a race.
                                this._performUpdateType = ChartUpdateType.PERFORM_LAYOUT;
                                this.performUpdateTrigger.schedule();
                                return [3 /*break*/, 11];
                            }
                            // After several failed passes, continue and accept there maybe a redundant
                            // render. Sometimes this case happens when we already have the correct
                            // width/height, and we end up never rendering the chart in that scenario.
                        }
                        this._performUpdateNoRenderCount = 0;
                        return [4 /*yield*/, this.performLayout()];
                    case 4:
                        _d.sent();
                        this.handleOverlays();
                        splits.push(performance.now());
                        _d.label = 5;
                    case 5:
                        seriesRect_1 = this.seriesRect;
                        seriesUpdates = __spreadArray([], __read(this.seriesToUpdate)).map(function (series) { return series.update({ seriesRect: seriesRect_1 }); });
                        this.seriesToUpdate.clear();
                        return [4 /*yield*/, Promise.all(seriesUpdates)];
                    case 6:
                        _d.sent();
                        splits.push(performance.now());
                        _d.label = 7;
                    case 7:
                        tooltipMeta = this.tooltipManager.getTooltipMeta(this.id);
                        if (performUpdateType < ChartUpdateType.SERIES_UPDATE && ((_a = tooltipMeta === null || tooltipMeta === void 0 ? void 0 : tooltipMeta.event) === null || _a === void 0 ? void 0 : _a.type) === 'hover') {
                            this.handlePointer(tooltipMeta.event);
                        }
                        _d.label = 8;
                    case 8: return [4 /*yield*/, this.scene.render({ debugSplitTimes: splits, extraDebugStats: extraDebugStats })];
                    case 9:
                        _d.sent();
                        this.extraDebugStats = {};
                        _d.label = 10;
                    case 10:
                        // Do nothing.
                        this._performUpdateType = ChartUpdateType.NONE;
                        _d.label = 11;
                    case 11:
                        end = performance.now();
                        this.log({
                            chart: this,
                            durationMs: Math.round((end - splits[0]) * 100) / 100,
                            count: count,
                            performUpdateType: ChartUpdateType[performUpdateType],
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(Chart.prototype, "axes", {
        get: function () {
            return this._axes;
        },
        set: function (values) {
            var _this = this;
            var removedAxes = new Set();
            this._axes.forEach(function (axis) {
                axis.detachAxis(_this.axisGroup);
                removedAxes.add(axis);
            });
            // make linked axes go after the regular ones (simulates stable sort by `linkedTo` property)
            this._axes = values.filter(function (a) { return !a.linkedTo; }).concat(values.filter(function (a) { return a.linkedTo; }));
            this._axes.forEach(function (axis) {
                axis.attachAxis(_this.axisGroup);
                removedAxes.delete(axis);
            });
            removedAxes.forEach(function (axis) { return axis.destroy(); });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Chart.prototype, "series", {
        get: function () {
            return this._series;
        },
        set: function (values) {
            var _this = this;
            this.removeAllSeries();
            values.forEach(function (series) { return _this.addSeries(series); });
        },
        enumerable: false,
        configurable: true
    });
    Chart.prototype.addSeries = function (series, before) {
        var _a = this, allSeries = _a.series, seriesRoot = _a.seriesRoot;
        var canAdd = allSeries.indexOf(series) < 0;
        if (canAdd) {
            var beforeIndex = before ? allSeries.indexOf(before) : -1;
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
    };
    Chart.prototype.initSeries = function (series) {
        series.chart = this;
        series.highlightManager = this.highlightManager;
        series.animationManager = this.animationManager;
        if (!series.data) {
            series.data = this.data;
        }
        this.addSeriesListeners(series);
        series.chartEventManager = this.chartEventManager;
        series.addChartEventListeners();
    };
    Chart.prototype.freeSeries = function (series) {
        series.chart = undefined;
        series.removeEventListener('nodeClick', this.onSeriesNodeClick);
        series.removeEventListener('nodeDoubleClick', this.onSeriesNodeDoubleClick);
    };
    Chart.prototype.removeAllSeries = function () {
        var _this = this;
        this.series.forEach(function (series) {
            _this.freeSeries(series);
            _this.seriesRoot.removeChild(series.rootGroup);
        });
        this._series = []; // using `_series` instead of `series` to prevent infinite recursion
    };
    Chart.prototype.addSeriesListeners = function (series) {
        if (this.hasEventListener('seriesNodeClick')) {
            series.addEventListener('nodeClick', this.onSeriesNodeClick);
        }
        if (this.hasEventListener('seriesNodeDoubleClick')) {
            series.addEventListener('nodeDoubleClick', this.onSeriesNodeDoubleClick);
        }
    };
    Chart.prototype.updateAllSeriesListeners = function () {
        var _this = this;
        this.series.forEach(function (series) {
            series.removeEventListener('nodeClick', _this.onSeriesNodeClick);
            series.removeEventListener('nodeDoubleClick', _this.onSeriesNodeDoubleClick);
            _this.addSeriesListeners(series);
        });
    };
    Chart.prototype.assignSeriesToAxes = function () {
        var _this = this;
        this.axes.forEach(function (axis) {
            axis.boundSeries = _this.series.filter(function (s) {
                var seriesAxis = axis.direction === ChartAxisDirection.X ? s.xAxis : s.yAxis;
                return seriesAxis === axis;
            });
        });
    };
    Chart.prototype.assignAxesToSeries = function (force) {
        var _this = this;
        if (force === void 0) { force = false; }
        // This method has to run before `assignSeriesToAxes`.
        var directionToAxesMap = {};
        this.axes.forEach(function (axis) {
            var _a;
            var direction = axis.direction;
            var directionAxes = ((_a = directionToAxesMap[direction]) !== null && _a !== void 0 ? _a : (directionToAxesMap[direction] = []));
            directionAxes.push(axis);
        });
        this.series.forEach(function (series) {
            series.directions.forEach(function (direction) {
                var currentAxis = direction === ChartAxisDirection.X ? series.xAxis : series.yAxis;
                if (currentAxis && !force) {
                    return;
                }
                var directionAxes = directionToAxesMap[direction];
                if (!directionAxes) {
                    Logger.warn("no available axis for direction [" + direction + "]; check series and axes configuration.");
                    return;
                }
                var seriesKeys = series.getKeys(direction);
                var newAxis = _this.findMatchingAxis(directionAxes, series.getKeys(direction));
                if (!newAxis) {
                    Logger.warn("no matching axis for direction [" + direction + "] and keys [" + seriesKeys + "]; check series and axes configuration.");
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
    };
    Chart.prototype.findMatchingAxis = function (directionAxes, directionKeys) {
        var e_4, _a, e_5, _b;
        try {
            for (var directionAxes_1 = __values(directionAxes), directionAxes_1_1 = directionAxes_1.next(); !directionAxes_1_1.done; directionAxes_1_1 = directionAxes_1.next()) {
                var axis = directionAxes_1_1.value;
                var axisKeys = axis.keys;
                if (!axisKeys.length) {
                    return axis;
                }
                if (!directionKeys) {
                    continue;
                }
                try {
                    for (var directionKeys_1 = (e_5 = void 0, __values(directionKeys)), directionKeys_1_1 = directionKeys_1.next(); !directionKeys_1_1.done; directionKeys_1_1 = directionKeys_1.next()) {
                        var directionKey = directionKeys_1_1.value;
                        if (axisKeys.indexOf(directionKey) >= 0) {
                            return axis;
                        }
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (directionKeys_1_1 && !directionKeys_1_1.done && (_b = directionKeys_1.return)) _b.call(directionKeys_1);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (directionAxes_1_1 && !directionAxes_1_1.done && (_a = directionAxes_1.return)) _a.call(directionAxes_1);
            }
            finally { if (e_4) throw e_4.error; }
        }
    };
    Chart.prototype.resize = function (width, height) {
        var _a, _b, _c, _d;
        width !== null && width !== void 0 ? width : (width = (_a = this.width) !== null && _a !== void 0 ? _a : (this.autoSize ? (_b = this._lastAutoSize) === null || _b === void 0 ? void 0 : _b[0] : this.scene.canvas.width));
        height !== null && height !== void 0 ? height : (height = (_c = this.height) !== null && _c !== void 0 ? _c : (this.autoSize ? (_d = this._lastAutoSize) === null || _d === void 0 ? void 0 : _d[1] : this.scene.canvas.height));
        if (!width || !height || !Number.isFinite(width) || !Number.isFinite(height))
            return;
        if (this.scene.resize(width, height)) {
            this.disablePointer();
            this.update(ChartUpdateType.PERFORM_LAYOUT, { forceNodeDataRefresh: true });
        }
    };
    Chart.prototype.processData = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.axes.length > 0 || this.series.some(function (s) { return s instanceof CartesianSeries; })) {
                            this.assignAxesToSeries(true);
                            this.assignSeriesToAxes();
                        }
                        return [4 /*yield*/, Promise.all(this.series.map(function (s) { return s.processData(); }))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.updateLegend()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Chart.prototype.placeLabels = function () {
        var e_6, _a;
        var visibleSeries = [];
        var data = [];
        try {
            for (var _b = __values(this.series), _c = _b.next(); !_c.done; _c = _b.next()) {
                var series = _c.value;
                if (!series.visible) {
                    continue;
                }
                var labelData = series.getLabelData();
                if (!(labelData && isPointLabelDatum(labelData[0]))) {
                    continue;
                }
                data.push(labelData);
                visibleSeries.push(series);
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_6) throw e_6.error; }
        }
        var seriesRect = this.seriesRect;
        var labels = seriesRect && data.length > 0
            ? placeLabels(data, { x: 0, y: 0, width: seriesRect.width, height: seriesRect.height })
            : [];
        return new Map(labels.map(function (l, i) { return [visibleSeries[i], l]; }));
    };
    Chart.prototype.attachLegend = function (legendType) {
        var _a;
        if (this.legendType === legendType) {
            return;
        }
        (_a = this.legend) === null || _a === void 0 ? void 0 : _a.destroy();
        this.legend = undefined;
        var ctx = this.getModuleContext();
        this.legend = getLegend(legendType, ctx);
        this.legend.attachLegend(this.scene.root);
        this.legendType = legendType;
    };
    Chart.prototype.setLegendInit = function (initLegend) {
        this.applyLegendOptions = initLegend;
    };
    Chart.prototype.updateLegend = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var legendData, legendType;
            return __generator(this, function (_b) {
                legendData = [];
                this.series
                    .filter(function (s) { return s.showInLegend; })
                    .forEach(function (series) {
                    var data = series.getLegendData();
                    legendData.push.apply(legendData, __spreadArray([], __read(data)));
                });
                legendType = legendData.length > 0 ? legendData[0].legendType : 'category';
                this.attachLegend(legendType);
                (_a = this.applyLegendOptions) === null || _a === void 0 ? void 0 : _a.call(this, this.legend);
                if (legendType === 'category') {
                    this.validateLegendData(legendData);
                }
                this.legend.data = legendData;
                return [2 /*return*/];
            });
        });
    };
    Chart.prototype.validateLegendData = function (legendData) {
        var _this = this;
        // Validate each series that shares a legend item label uses the same fill colour
        var labelMarkerFills = {};
        legendData.forEach(function (d) {
            var _a;
            var _b, _c, _d;
            var _e, _f;
            var seriesType = (_b = _this.series.find(function (s) { return s.id === d.seriesId; })) === null || _b === void 0 ? void 0 : _b.type;
            if (!seriesType)
                return;
            var dc = d;
            (_c = labelMarkerFills[seriesType]) !== null && _c !== void 0 ? _c : (labelMarkerFills[seriesType] = (_a = {}, _a[dc.label.text] = new Set(), _a));
            (_d = (_e = labelMarkerFills[seriesType])[_f = dc.label.text]) !== null && _d !== void 0 ? _d : (_e[_f] = new Set());
            if (dc.marker.fill != null) {
                labelMarkerFills[seriesType][dc.label.text].add(dc.marker.fill);
            }
        });
        Object.keys(labelMarkerFills).forEach(function (seriesType) {
            Object.keys(labelMarkerFills[seriesType]).forEach(function (name) {
                var fills = labelMarkerFills[seriesType][name];
                if (fills.size > 1) {
                    Logger.warnOnce("legend item '" + name + "' has multiple fill colors, this may cause unexpected behaviour.");
                }
            });
        });
    };
    Chart.prototype.performLayout = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, width, height, shrinkRect;
            return __generator(this, function (_b) {
                this.scene.root.visible = true;
                _a = this.scene, width = _a.width, height = _a.height;
                shrinkRect = new BBox(0, 0, width, height);
                (shrinkRect = this.layoutService.dispatchPerformLayout('start-layout', { shrinkRect: shrinkRect }).shrinkRect);
                (shrinkRect = this.layoutService.dispatchPerformLayout('before-series', { shrinkRect: shrinkRect }).shrinkRect);
                return [2 /*return*/, shrinkRect];
            });
        });
    };
    Chart.prototype.positionPadding = function (shrinkRect) {
        var padding = this.padding;
        shrinkRect.shrink(padding.left, 'left');
        shrinkRect.shrink(padding.top, 'top');
        shrinkRect.shrink(padding.right, 'right');
        shrinkRect.shrink(padding.bottom, 'bottom');
        return { shrinkRect: shrinkRect };
    };
    Chart.prototype.positionCaptions = function (shrinkRect) {
        var _a;
        var _b = this, title = _b.title, subtitle = _b.subtitle, footnote = _b.footnote;
        var newShrinkRect = shrinkRect.clone();
        var updateCaption = function (caption) {
            var _a;
            var defaultCaptionHeight = shrinkRect.height / 10;
            var captionLineHeight = (_a = caption.lineHeight) !== null && _a !== void 0 ? _a : caption.fontSize * Text.defaultLineHeightRatio;
            var maxWidth = shrinkRect.width;
            var maxHeight = Math.max(captionLineHeight, defaultCaptionHeight);
            caption.computeTextWrap(maxWidth, maxHeight);
        };
        var positionTopAndShrinkBBox = function (caption) {
            var _a;
            var baseY = newShrinkRect.y;
            caption.node.x = newShrinkRect.x + newShrinkRect.width / 2;
            caption.node.y = baseY;
            caption.node.textBaseline = 'top';
            updateCaption(caption);
            var bbox = caption.node.computeBBox();
            // As the bbox (x,y) ends up at a different location than specified above, we need to
            // take it into consideration when calculating how much space needs to be reserved to
            // accommodate the caption.
            var bboxHeight = Math.ceil(bbox.y - baseY + bbox.height + ((_a = caption.spacing) !== null && _a !== void 0 ? _a : 0));
            newShrinkRect.shrink(bboxHeight, 'top');
        };
        var positionBottomAndShrinkBBox = function (caption) {
            var _a;
            var baseY = newShrinkRect.y + newShrinkRect.height;
            caption.node.x = newShrinkRect.x + newShrinkRect.width / 2;
            caption.node.y = baseY;
            caption.node.textBaseline = 'bottom';
            updateCaption(caption);
            var bbox = caption.node.computeBBox();
            var bboxHeight = Math.ceil(baseY - bbox.y + ((_a = caption.spacing) !== null && _a !== void 0 ? _a : 0));
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
    };
    Chart.prototype.getSeriesRect = function () {
        return this.seriesRect;
    };
    // x/y are local canvas coordinates in CSS pixels, not actual pixels
    Chart.prototype.pickSeriesNode = function (point, exactMatchOnly, maxDistance) {
        var e_7, _a;
        var _b, _c;
        var start = performance.now();
        // Disable 'nearest match' options if looking for exact matches only
        var pickModes = exactMatchOnly ? [SeriesNodePickMode.EXACT_SHAPE_MATCH] : undefined;
        // Iterate through series in reverse, as later declared series appears on top of earlier
        // declared series.
        var reverseSeries = __spreadArray([], __read(this.series)).reverse();
        var result = undefined;
        try {
            for (var reverseSeries_1 = __values(reverseSeries), reverseSeries_1_1 = reverseSeries_1.next(); !reverseSeries_1_1.done; reverseSeries_1_1 = reverseSeries_1.next()) {
                var series = reverseSeries_1_1.value;
                if (!series.visible || !series.rootGroup.visible) {
                    continue;
                }
                var _d = (_b = series.pickNode(point, pickModes)) !== null && _b !== void 0 ? _b : {}, match = _d.match, distance = _d.distance;
                if (!match || distance == null) {
                    continue;
                }
                if ((!result || result.distance > distance) && distance <= (maxDistance !== null && maxDistance !== void 0 ? maxDistance : Infinity)) {
                    result = { series: series, distance: distance, datum: match };
                }
                if (distance === 0) {
                    break;
                }
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (reverseSeries_1_1 && !reverseSeries_1_1.done && (_a = reverseSeries_1.return)) _a.call(reverseSeries_1);
            }
            finally { if (e_7) throw e_7.error; }
        }
        this.extraDebugStats['pickSeriesNode'] = Math.round(((_c = this.extraDebugStats['pickSeriesNode']) !== null && _c !== void 0 ? _c : 0) + (performance.now() - start));
        return result;
    };
    Chart.prototype.onMouseMove = function (event) {
        this.lastInteractionEvent = event;
        this.pointerScheduler.schedule();
        this.extraDebugStats['mouseX'] = event.offsetX;
        this.extraDebugStats['mouseY'] = event.offsetY;
        this.update(ChartUpdateType.SCENE_RENDER);
    };
    Chart.prototype.onLeave = function (event) {
        if (this.tooltip.pointerLeftOntoTooltip(event)) {
            return;
        }
        this.disablePointer();
    };
    Chart.prototype.handlePointer = function (event) {
        var _this = this;
        var _a = this, lastPick = _a.lastPick, hoverRect = _a.hoverRect;
        var offsetX = event.offsetX, offsetY = event.offsetY;
        var disablePointer = function (highlightOnly) {
            if (highlightOnly === void 0) { highlightOnly = false; }
            if (lastPick) {
                // Cursor moved from a non-marker node to empty space.
                _this.disablePointer(highlightOnly);
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
    };
    Chart.prototype.handlePointerTooltip = function (event, disablePointer) {
        var _a, _b;
        var _c = this, lastPick = _c.lastPick, tooltip = _c.tooltip;
        var range = tooltip.range;
        var pageX = event.pageX, pageY = event.pageY, offsetX = event.offsetX, offsetY = event.offsetY;
        var pixelRange;
        if (typeof range === 'number' && Number.isFinite(range)) {
            pixelRange = range;
        }
        var pick = this.pickSeriesNode({ x: offsetX, y: offsetY }, range === 'exact', pixelRange);
        if (!pick) {
            this.tooltipManager.updateTooltip(this.id);
            if (this.highlight.range === 'tooltip')
                disablePointer(true);
            return;
        }
        var isNewDatum = this.highlight.range === 'node' || !lastPick || lastPick.datum !== pick.datum;
        var html;
        if (isNewDatum) {
            html = pick.series.getTooltipHtml(pick.datum);
            if (this.highlight.range === 'tooltip') {
                this.highlightManager.updateHighlight(this.id, pick.datum);
            }
        }
        else if (lastPick) {
            lastPick.event = event.sourceEvent;
        }
        var isPixelRange = pixelRange != null;
        var tooltipEnabled = this.tooltip.enabled && pick.series.tooltip.enabled;
        var exactlyMatched = range === 'exact' && pick.distance === 0;
        var rangeMatched = range === 'nearest' || isPixelRange || exactlyMatched;
        var shouldUpdateTooltip = tooltipEnabled && rangeMatched && (!isNewDatum || html !== undefined);
        var position = {
            xOffset: pick.datum.series.tooltip.position.xOffset,
            yOffset: pick.datum.series.tooltip.position.yOffset,
        };
        var meta = this.mergePointerDatum({ pageX: pageX, pageY: pageY, offsetX: offsetX, offsetY: offsetY, event: event, showArrow: pick.series.tooltip.showArrow, position: position }, pick.datum);
        meta.enableInteraction = (_b = (_a = pick.series.tooltip.interaction) === null || _a === void 0 ? void 0 : _a.enabled) !== null && _b !== void 0 ? _b : false;
        if (shouldUpdateTooltip) {
            this.tooltipManager.updateTooltip(this.id, meta, html);
        }
    };
    Chart.prototype.handlePointerNode = function (event) {
        var _this = this;
        var found = this.checkSeriesNodeRange(event, function (series, datum) {
            if (series.hasEventListener('nodeClick') || series.hasEventListener('nodeDoubleClick')) {
                _this.cursorManager.updateCursor('chart', 'pointer');
            }
            if (_this.highlight.range === 'node') {
                _this.highlightManager.updateHighlight(_this.id, datum);
            }
        });
        if (!found) {
            this.cursorManager.updateCursor('chart');
            if (this.highlight.range === 'node') {
                this.highlightManager.updateHighlight(this.id);
            }
        }
    };
    Chart.prototype.onClick = function (event) {
        if (this.checkSeriesNodeClick(event)) {
            this.update(ChartUpdateType.SERIES_UPDATE);
            return;
        }
        this.fireEvent({
            type: 'click',
            event: event.sourceEvent,
        });
    };
    Chart.prototype.onDoubleClick = function (event) {
        if (this.checkSeriesNodeDoubleClick(event)) {
            this.update(ChartUpdateType.SERIES_UPDATE);
            return;
        }
        this.fireEvent({
            type: 'doubleClick',
            event: event.sourceEvent,
        });
    };
    Chart.prototype.checkSeriesNodeClick = function (event) {
        return this.checkSeriesNodeRange(event, function (series, datum) {
            return series.fireNodeClickEvent(event.sourceEvent, datum);
        });
    };
    Chart.prototype.checkSeriesNodeDoubleClick = function (event) {
        return this.checkSeriesNodeRange(event, function (series, datum) {
            return series.fireNodeDoubleClickEvent(event.sourceEvent, datum);
        });
    };
    Chart.prototype.checkSeriesNodeRange = function (event, callback) {
        var nearestNode = this.pickSeriesNode({ x: event.offsetX, y: event.offsetY }, false);
        var datum = nearestNode === null || nearestNode === void 0 ? void 0 : nearestNode.datum;
        var nodeClickRange = datum === null || datum === void 0 ? void 0 : datum.series.nodeClickRange;
        // First check if we should trigger the callback based on nearest node
        if (datum && nodeClickRange === 'nearest') {
            callback(datum.series, datum);
            return true;
        }
        // Then check for an exact match or within the given range
        var pixelRange;
        if (typeof nodeClickRange === 'number' && Number.isFinite(nodeClickRange)) {
            pixelRange = nodeClickRange;
        }
        var pick = this.pickSeriesNode({ x: event.offsetX, y: event.offsetY }, nodeClickRange === 'exact', pixelRange);
        if (!pick)
            return false;
        // Then if we've picked a node within the pixel range, or exactly, trigger the callback
        var isPixelRange = pixelRange != null;
        var exactlyMatched = nodeClickRange === 'exact' && pick.distance === 0;
        if (isPixelRange || exactlyMatched) {
            callback(pick.series, pick.datum);
            return true;
        }
        return false;
    };
    Chart.prototype.mergePointerDatum = function (meta, datum) {
        var type = datum.series.tooltip.position.type;
        if (type === 'node' && datum.nodeMidPoint) {
            var _a = datum.nodeMidPoint, x = _a.x, y = _a.y;
            var canvas = this.scene.canvas;
            var point = datum.series.rootGroup.inverseTransformPoint(x, y);
            var canvasRect = canvas.element.getBoundingClientRect();
            return __assign(__assign({}, meta), { pageX: Math.round(canvasRect.left + window.scrollX + point.x), pageY: Math.round(canvasRect.top + window.scrollY + point.y), offsetX: Math.round(point.x), offsetY: Math.round(point.y) });
        }
        return meta;
    };
    Chart.prototype.changeHighlightDatum = function (event) {
        var _a, _b;
        var seriesToUpdate = new Set();
        var _c = (_a = event.currentHighlight) !== null && _a !== void 0 ? _a : {}, _d = _c.series, newSeries = _d === void 0 ? undefined : _d, newDatum = _c.datum;
        var _e = (_b = event.previousHighlight) !== null && _b !== void 0 ? _b : {}, _f = _e.series, lastSeries = _f === void 0 ? undefined : _f, lastDatum = _e.datum;
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
        var updateAll = newSeries == null || lastSeries == null;
        if (updateAll) {
            this.update(ChartUpdateType.SERIES_UPDATE);
        }
        else {
            this.update(ChartUpdateType.SERIES_UPDATE, { seriesToUpdate: seriesToUpdate });
        }
    };
    Chart.prototype.waitForUpdate = function (timeoutMs) {
        if (timeoutMs === void 0) { timeoutMs = 5000; }
        return __awaiter(this, void 0, void 0, function () {
            var start;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        start = performance.now();
                        _a.label = 1;
                    case 1:
                        if (!(this._pendingFactoryUpdates.length > 0 || this.updatePending)) return [3 /*break*/, 3];
                        if (performance.now() - start > timeoutMs) {
                            throw new Error('waitForUpdate() timeout reached.');
                        }
                        return [4 /*yield*/, sleep(5)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 1];
                    case 3: return [4 /*yield*/, this.awaitUpdateCompletion()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Chart.prototype.handleOverlays = function () {
        this.handleNoDataOverlay();
    };
    Chart.prototype.handleNoDataOverlay = function () {
        var shouldDisplayNoDataOverlay = !this.series.some(function (s) { return s.hasData(); });
        var rect = this.getSeriesRect();
        if (shouldDisplayNoDataOverlay && rect) {
            this.overlays.noData.show(rect);
        }
        else {
            this.overlays.noData.hide();
        }
    };
    __decorate([
        ActionOnSet({
            newValue: function (value) {
                this.scene.debug.consoleLog = value;
            },
        })
    ], Chart.prototype, "debug", void 0);
    __decorate([
        ActionOnSet({
            newValue: function (value) {
                var _a;
                (_a = this.series) === null || _a === void 0 ? void 0 : _a.forEach(function (series) { return (series.data = value); });
            },
        })
    ], Chart.prototype, "data", void 0);
    __decorate([
        ActionOnSet({
            newValue: function (value) {
                this.resize(value);
            },
        })
    ], Chart.prototype, "width", void 0);
    __decorate([
        ActionOnSet({
            newValue: function (value) {
                this.resize(undefined, value);
            },
        })
    ], Chart.prototype, "height", void 0);
    __decorate([
        ActionOnSet({
            changeValue: function (value) {
                this.autoSizeChanged(value);
            },
        }),
        Validate(BOOLEAN)
    ], Chart.prototype, "autoSize", void 0);
    __decorate([
        ActionOnSet({
            newValue: function (value) {
                var _a;
                (_a = this.scene.root) === null || _a === void 0 ? void 0 : _a.appendChild(value.node);
            },
            oldValue: function (oldValue) {
                var _a;
                (_a = this.scene.root) === null || _a === void 0 ? void 0 : _a.removeChild(oldValue.node);
            },
        })
    ], Chart.prototype, "title", void 0);
    __decorate([
        ActionOnSet({
            newValue: function (value) {
                var _a;
                (_a = this.scene.root) === null || _a === void 0 ? void 0 : _a.appendChild(value.node);
            },
            oldValue: function (oldValue) {
                var _a;
                (_a = this.scene.root) === null || _a === void 0 ? void 0 : _a.removeChild(oldValue.node);
            },
        })
    ], Chart.prototype, "subtitle", void 0);
    __decorate([
        ActionOnSet({
            newValue: function (value) {
                var _a;
                (_a = this.scene.root) === null || _a === void 0 ? void 0 : _a.appendChild(value.node);
            },
            oldValue: function (oldValue) {
                var _a;
                (_a = this.scene.root) === null || _a === void 0 ? void 0 : _a.removeChild(oldValue.node);
            },
        })
    ], Chart.prototype, "footnote", void 0);
    __decorate([
        Validate(STRING_UNION('standalone', 'integrated'))
    ], Chart.prototype, "mode", void 0);
    return Chart;
}(Observable));
export { Chart };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY2hhcnQvY2hhcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUN2QyxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDdkMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQzNDLE9BQU8sRUFBMkIsa0JBQWtCLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUM5RSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFMUMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNyQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFbEQsT0FBTyxFQUFFLFVBQVUsRUFBYyxNQUFNLG9CQUFvQixDQUFDO0FBRTVELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQzFELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDdEMsT0FBTyxFQUFFLGlCQUFpQixFQUFlLFdBQVcsRUFBbUIsTUFBTSx3QkFBd0IsQ0FBQztBQUV0RyxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUM1RSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFFckUsT0FBTyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDckUsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN0QyxPQUFPLEVBQUUsT0FBTyxFQUE4QixNQUFNLG1CQUFtQixDQUFDO0FBQ3hFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDbEMsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDbEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzVELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3BFLE9BQU8sRUFBd0IsZ0JBQWdCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUN4RixPQUFPLEVBQW9CLGtCQUFrQixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDeEYsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzlELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUV4RCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDdkQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM1QyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDaEQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRXBELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUN4QyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzVDLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUNsRCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDbEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBWXREO0lBQW9DLHlCQUFVO0lBK0oxQyxlQUNJLFFBQTBCLEVBQzFCLHdCQUFpQyxFQUNqQyxTQUFpQztRQUZqQyx5QkFBQSxFQUFBLFdBQVcsTUFBTSxDQUFDLFFBQVE7O1FBRDlCLFlBS0ksaUJBQU8sU0F1RlY7UUExUFEsUUFBRSxHQUFHLFFBQVEsQ0FBQyxLQUFJLENBQUMsQ0FBQztRQUU3QixzQkFBZ0IsR0FBbUIsRUFBRSxDQUFDO1FBQ3RDLGlCQUFXLEdBQW1CLEVBQUUsQ0FBQztRQUNqQyx1QkFBaUIsR0FBcUIsRUFBRSxDQUFDO1FBU2hDLGdCQUFVLEdBQUcsSUFBSSxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUssS0FBSSxDQUFDLEVBQUUsaUJBQWMsRUFBRSxDQUFDLENBQUM7UUFhNUQscUJBQWUsR0FBMkIsRUFBRSxDQUFDO1FBRTdDLGdCQUFVLEdBQXdCLFNBQVMsQ0FBQztRQXlCN0MsVUFBSSxHQUFRLEVBQUUsQ0FBQztRQStDdEIsYUFBTyxHQUFHLElBQUksT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRTFCLHVCQUFpQixHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBVTVCLFdBQUssR0FBYSxTQUFTLENBQUM7UUFVNUIsY0FBUSxHQUFhLFNBQVMsQ0FBQztRQVUvQixjQUFRLEdBQWEsU0FBUyxDQUFDO1FBR3RDLFVBQUksR0FBZ0MsWUFBWSxDQUFDO1FBRXpDLGdCQUFVLEdBQVksS0FBSyxDQUFDO1FBaUJqQixhQUFPLEdBQWlELEVBQUUsQ0FBQztRQUMzRCxtQkFBYSxHQUFpRCxFQUFFLENBQUM7UUFxTjVFLDRCQUFzQixHQUE0QixFQUFFLENBQUM7UUFpQ3JELGlDQUEyQixHQUFHLENBQUMsQ0FBQztRQUNoQyx3QkFBa0IsR0FBb0IsZUFBZSxDQUFDLElBQUksQ0FBQztRQVkzRCxvQkFBYyxHQUFnQixJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3hDLDBCQUFvQixHQUFHLGlCQUFpQixDQUFDLFVBQU8sRUFBUztnQkFBUCxLQUFLLFdBQUE7Ozs7Ozs0QkFDM0QsSUFBSSxJQUFJLENBQUMsVUFBVTtnQ0FBRSxzQkFBTzs7Ozs0QkFHeEIscUJBQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsRUFBQTs7NEJBQS9CLFNBQStCLENBQUM7Ozs7NEJBRWhDLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxPQUFjLENBQUM7NEJBQzlDLE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLE9BQUssQ0FBQyxDQUFDOzs7Ozs7U0FFM0MsQ0FBQyxDQUFDO1FBMkZPLFdBQUssR0FBZ0IsRUFBRSxDQUFDO1FBb0J4QixhQUFPLEdBQWEsRUFBRSxDQUFDO1FBaU56Qix3QkFBa0IsR0FBbUMsU0FBUyxDQUFDO1FBK00vRCwwQkFBb0IsR0FBK0IsU0FBUyxDQUFDO1FBQzdELHNCQUFnQixHQUFHLHVCQUF1QixDQUFDO1lBQy9DLElBQUksS0FBSSxDQUFDLG9CQUFvQixFQUFFO2dCQUMzQixLQUFJLENBQUMsYUFBYSxDQUFDLEtBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2FBQ2pEO1lBQ0QsS0FBSSxDQUFDLG9CQUFvQixHQUFHLFNBQVMsQ0FBQztRQUMxQyxDQUFDLENBQUMsQ0FBQztRQThLSyx1QkFBaUIsR0FBRyxVQUFDLEtBQWlCO1lBQzFDLElBQU0sb0JBQW9CLHlCQUNuQixLQUFLLEtBQ1IsSUFBSSxFQUFFLGlCQUFpQixHQUMxQixDQUFDO1lBQ0YsTUFBTSxDQUFDLGNBQWMsQ0FBQyxvQkFBb0IsRUFBRSxRQUFRLEVBQUU7Z0JBQ2xELFVBQVUsRUFBRSxLQUFLO2dCQUNqQix5Q0FBeUM7Z0JBQ3pDLEdBQUcsRUFBRSxjQUFNLE9BQUMsS0FBYSxDQUFDLE1BQU0sRUFBckIsQ0FBcUI7YUFDbkMsQ0FBQyxDQUFDO1lBQ0gsS0FBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQ3pDLENBQUMsQ0FBQztRQUVNLDZCQUF1QixHQUFHLFVBQUMsS0FBaUI7WUFDaEQsSUFBTSxxQkFBcUIseUJBQ3BCLEtBQUssS0FDUixJQUFJLEVBQUUsdUJBQXVCLEdBQ2hDLENBQUM7WUFDRixLQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDMUMsQ0FBQyxDQUFDO1FBejlCRSxJQUFNLEtBQUssR0FBRyxTQUFTLGFBQVQsU0FBUyx1QkFBVCxTQUFTLENBQUUsS0FBSyxDQUFDO1FBQy9CLElBQU0sT0FBTyxHQUFHLE1BQUEsU0FBUyxhQUFULFNBQVMsdUJBQVQsU0FBUyxDQUFFLE9BQU8sbUNBQUksUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNwRSxJQUFNLFNBQVMsR0FBRyxTQUFTLGFBQVQsU0FBUyx1QkFBVCxTQUFTLENBQUUsU0FBUyxDQUFDO1FBRXZDLElBQU0sSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDekMsd0VBQXdFO1FBQ3hFLHNDQUFzQztRQUN0QyxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztRQUNyQixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUU3QixLQUFJLENBQUMsU0FBUyxHQUFHLElBQUksS0FBSyxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUN0RixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVqQyxLQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQzFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQztRQUVwQyxLQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssYUFBTCxLQUFLLGNBQUwsS0FBSyxHQUFJLElBQUksS0FBSyxDQUFDLEVBQUUsUUFBUSxVQUFBLEVBQUUsd0JBQXdCLDBCQUFBLEVBQUUsQ0FBQyxDQUFDO1FBQ3hFLEtBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLEtBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7UUFDcEMsS0FBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ3ZCLEtBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQztRQUMvQixLQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUVyQixLQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO1FBQ2pELEtBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDaEQsS0FBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksZ0JBQWdCLEVBQUUsQ0FBQztRQUMvQyxLQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMxRCxLQUFJLENBQUMsV0FBVyxHQUFHLElBQUksV0FBVyxFQUFFLENBQUM7UUFDckMsS0FBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLFdBQVcsQ0FBQyxjQUFNLE9BQUEsS0FBSSxDQUFDLE1BQU0sRUFBWCxDQUFXLENBQUMsQ0FBQztRQUN0RCxLQUFJLENBQUMsYUFBYSxHQUFHLElBQUksYUFBYSxFQUFFLENBQUM7UUFDekMsS0FBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLGFBQWEsQ0FBQyxVQUFDLElBQTJCLEVBQUUsRUFBd0I7WUFBckQscUJBQUEsRUFBQSxPQUFPLGVBQWUsQ0FBQyxJQUFJO2dCQUFJLG9CQUFvQiwwQkFBQTtZQUN2RixPQUFBLEtBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUUsb0JBQW9CLHNCQUFBLEVBQUUsQ0FBQztRQUEzQyxDQUEyQyxDQUM5QyxDQUFDO1FBQ0YsS0FBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLGFBQWEsRUFBRSxDQUFDO1FBRXpDLEtBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLGdCQUFnQixDQUFDLEtBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3RFLEtBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO1FBQzVDLEtBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUU3QixLQUFJLENBQUMsT0FBTyxHQUFHLElBQUksT0FBTyxDQUFDLEtBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9FLEtBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxjQUFjLENBQUMsS0FBSSxDQUFDLE9BQU8sRUFBRSxLQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUNoRixLQUFJLENBQUMsUUFBUSxHQUFHLElBQUksYUFBYSxDQUFDLEtBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNoRCxLQUFJLENBQUMsU0FBUyxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7UUFDdEMsS0FBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFFM0IsV0FBVyxDQUFDLE9BQU8sQ0FBQyxLQUFJLENBQUMsT0FBTyxFQUFFLFVBQUMsSUFBSTs7WUFDM0IsSUFBQSxLQUFLLEdBQWEsSUFBSSxNQUFqQixFQUFFLE1BQU0sR0FBSyxJQUFJLE9BQVQsQ0FBVTtZQUUvQixJQUFJLENBQUMsS0FBSSxDQUFDLFFBQVEsRUFBRTtnQkFDaEIsT0FBTzthQUNWO1lBRUQsSUFBSSxLQUFLLEtBQUssQ0FBQyxJQUFJLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQzdCLE9BQU87YUFDVjtZQUVLLElBQUEsS0FBQSxPQUFrQyxNQUFBLEtBQUksQ0FBQyxhQUFhLG1DQUFJLEVBQUUsSUFBQSxFQUF6RCxVQUFhLEVBQWIsU0FBUyxtQkFBRyxDQUFDLEtBQUEsRUFBRSxVQUFjLEVBQWQsVUFBVSxtQkFBRyxDQUFDLEtBQTRCLENBQUM7WUFDakUsSUFBSSxTQUFTLEtBQUssS0FBSyxJQUFJLFVBQVUsS0FBSyxNQUFNLEVBQUU7Z0JBQzlDLE9BQU87YUFDVjtZQUVELEtBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDckMsS0FBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2xCLENBQUMsQ0FBQyxDQUFDO1FBQ0gsS0FBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsS0FBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEVBQWxDLENBQWtDLENBQUMsQ0FBQztRQUMxRixLQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQUUsVUFBQyxDQUFDLElBQUssT0FBQSxLQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFuQyxDQUFtQyxDQUFDLENBQUM7UUFFM0YsMkVBQTJFO1FBQzNFLEtBQUksQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBbkIsQ0FBbUIsQ0FBQyxDQUFDO1FBQzdFLEtBQUksQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsRUFBekIsQ0FBeUIsQ0FBQyxDQUFDO1FBQ3RGLEtBQUksQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsRUFBdkIsQ0FBdUIsQ0FBQyxDQUFDO1FBQ2pGLEtBQUksQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBbkIsQ0FBbUIsQ0FBQyxDQUFDO1FBQzdFLEtBQUksQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLGNBQU0sT0FBQSxLQUFJLENBQUMsT0FBTyxFQUFFLEVBQWQsQ0FBYyxDQUFDLENBQUM7UUFDdkUsS0FBSSxDQUFDLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsY0FBTSxPQUFBLEtBQUksQ0FBQyxjQUFjLEVBQUUsRUFBckIsQ0FBcUIsQ0FBQyxDQUFDO1FBRTFFLEtBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLEVBQUUsVUFBQyxDQUFDO1lBQ25ELEtBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzlDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsS0FBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsRUFBRSxVQUFDLEtBQUssSUFBSyxPQUFBLEtBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsRUFBaEMsQ0FBZ0MsQ0FBQyxDQUFDO1FBQ25HLEtBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLGFBQWEsRUFBRSxVQUFDLENBQUM7WUFDMUMsT0FBQSxLQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsRUFBRSxvQkFBb0IsRUFBRSxJQUFJLEVBQUUsQ0FBQztRQUF6RSxDQUF5RSxDQUM1RSxDQUFDO1FBRUYsS0FBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQzs7SUFDbEMsQ0FBQztJQXBQRCwwQkFBVSxHQUFWOztRQUNZLElBQUEsaUJBQWlCLEdBQUssSUFBSSxrQkFBVCxDQUFVO1FBQ25DLElBQU0saUJBQWlCLEdBQUcsTUFBQSxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLG1DQUFJLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDOUYsT0FBTyxTQUFTLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQW1CRCxzQkFBSSw0QkFBUzthQWViO1lBQ0ksT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQzNCLENBQUM7YUFqQkQsVUFBYyxLQUEwQjtZQUNwQyxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssS0FBSyxFQUFFO2dCQUNuQixJQUFBLFVBQVUsR0FBSyxJQUFJLENBQUMsT0FBTyxXQUFqQixDQUFrQjtnQkFFcEMsSUFBSSxVQUFVLElBQUksSUFBSSxFQUFFO29CQUNwQixVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztpQkFDeEM7Z0JBRUQsSUFBSSxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO29CQUMxQixLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztpQkFDbkM7Z0JBRUQsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7YUFDM0I7UUFDTCxDQUFDOzs7T0FBQTtJQW1DTywrQkFBZSxHQUF2QixVQUF3QixLQUFjO1FBQzFCLElBQUEsS0FBSyxHQUFLLElBQUksQ0FBQyxPQUFPLE1BQWpCLENBQWtCO1FBQy9CLElBQUksS0FBSyxFQUFFO1lBQ1AsS0FBSyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7WUFDeEIsS0FBSyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUM7WUFDckIsS0FBSyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7WUFFdEIsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQ3JCLE9BQU87YUFDVjtZQUNELElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUNqQjthQUFNO1lBQ0gsS0FBSyxDQUFDLE9BQU8sR0FBRyxjQUFjLENBQUM7WUFDL0IsS0FBSyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUM7WUFDckIsS0FBSyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7U0FDekI7SUFDTCxDQUFDO0lBRUQsd0JBQVEsR0FBUixVQUFTLFFBQWlCLEVBQUUsVUFBbUI7UUFDM0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUF3Q0Qsc0JBQUksNEJBQVM7YUFBYjtZQUNJLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUMzQixDQUFDOzs7T0FBQTtJQWdIRCx5QkFBUyxHQUFULFVBQVUsTUFBa0I7UUFDeEIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxJQUFJLEVBQUU7WUFDekMsTUFBTSxJQUFJLEtBQUssQ0FBQywwQ0FBMEMsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDbkY7UUFFRCxJQUFNLGNBQWMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO1FBQy9FLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxDQUFDO1FBRTlELElBQVksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsY0FBYyxDQUFDO0lBQ3RELENBQUM7SUFFRCw0QkFBWSxHQUFaLFVBQWEsTUFBa0I7O1FBQzNCLE1BQUEsTUFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsMENBQUUsUUFBUSwwQ0FBRSxPQUFPLEVBQUUsQ0FBQztRQUNyRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3ZDLE9BQVEsSUFBWSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRUQsK0JBQWUsR0FBZixVQUFnQixNQUFjO1FBQzFCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksSUFBSSxDQUFDO0lBQ25ELENBQUM7SUFFRCxnQ0FBZ0IsR0FBaEI7UUFDVSxJQUFBLEtBY0YsSUFBSSxFQWJKLEtBQUssV0FBQSxFQUNMLGdCQUFnQixzQkFBQSxFQUNoQixpQkFBaUIsdUJBQUEsRUFDakIsYUFBYSxtQkFBQSxFQUNiLGdCQUFnQixzQkFBQSxFQUNoQixrQkFBa0Isd0JBQUEsRUFDbEIsY0FBYyxvQkFBQSxFQUNkLFdBQVcsaUJBQUEsRUFDWCxXQUFXLGlCQUFBLEVBQ1gsYUFBYSxtQkFBQSxFQUNiLGFBQWEsbUJBQUEsRUFDYixJQUFJLFVBQUEsRUFDSixhQUFhLG1CQUNULENBQUM7UUFDVCxPQUFPO1lBQ0gsS0FBSyxPQUFBO1lBQ0wsZ0JBQWdCLGtCQUFBO1lBQ2hCLGlCQUFpQixtQkFBQTtZQUNqQixhQUFhLGVBQUE7WUFDYixnQkFBZ0Isa0JBQUE7WUFDaEIsa0JBQWtCLG9CQUFBO1lBQ2xCLGNBQWMsZ0JBQUE7WUFDZCxXQUFXLGFBQUE7WUFDWCxXQUFXLGFBQUE7WUFDWCxhQUFhLGVBQUE7WUFDYixhQUFhLGVBQUE7WUFDYixJQUFJLE1BQUE7WUFDSixhQUFhLGVBQUE7U0FDaEIsQ0FBQztJQUNOLENBQUM7SUFFRCx1QkFBTyxHQUFQLFVBQVEsSUFBNkM7OztRQUNqRCxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDakIsT0FBTztTQUNWO1FBRUQsSUFBTSx5QkFBeUIsR0FBRyxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUseUJBQXlCLENBQUM7UUFDbEUsSUFBSSxNQUFNLEdBQXNDLFNBQVMsQ0FBQztRQUUxRCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQztRQUMvQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXRDLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDOUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN2QixNQUFBLElBQUksQ0FBQyxNQUFNLDBDQUFFLE9BQU8sRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzVCLFdBQVcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDOztZQUVwQyxLQUE0QixJQUFBLEtBQUEsU0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQSxnQkFBQSw0QkFBRTtnQkFBL0MsSUFBQSxLQUFBLG1CQUFhLEVBQVosR0FBRyxRQUFBLEVBQUUsTUFBTSxRQUFBO2dCQUNuQixNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUMxQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3pCLE9BQVEsSUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQzdCOzs7Ozs7Ozs7UUFFRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFbEMsSUFBSSx5QkFBeUIsRUFBRTtZQUMzQixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ25CLE1BQU0sR0FBRyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDcEY7YUFBTTtZQUNILElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDckIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7U0FDOUI7UUFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFDLENBQUMsSUFBSyxPQUFBLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBWCxDQUFXLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUVqQixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFDLENBQUMsSUFBSyxPQUFBLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBWCxDQUFXLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUVmLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxFQUFFLENBQUM7UUFFckMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFFdkIsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVELG1CQUFHLEdBQUgsVUFBSSxJQUFTO1FBQ1QsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ1osTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN0QjtJQUNMLENBQUM7SUFFRCw4QkFBYyxHQUFkLFVBQWUsYUFBcUI7UUFBckIsOEJBQUEsRUFBQSxxQkFBcUI7UUFDaEMsSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUNoQixJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDOUM7UUFDRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMvQyxJQUFJLElBQUksQ0FBQyxvQkFBb0IsRUFBRTtZQUMzQixJQUFJLENBQUMsb0JBQW9CLEdBQUcsU0FBUyxDQUFDO1NBQ3pDO0lBQ0wsQ0FBQztJQUlELG9DQUFvQixHQUFwQixVQUFxQixFQUF1QjtRQUN4QyxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUM7UUFDOUMsSUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQztRQUMvQixJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7WUFDYixTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ25CLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEtBQUssQ0FBQyxVQUFDLENBQUMsSUFBSyxPQUFBLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQW5CLENBQW1CLENBQUMsQ0FBQztTQUM5RDthQUFNO1lBQ0gseUZBQXlGO1lBQ3pGLGlGQUFpRjtZQUNqRixTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ3RDO0lBQ0wsQ0FBQztJQUVhLGlDQUFpQixHQUEvQjs7Ozs7O3dCQUNVLFNBQVMsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUM7Ozs2QkFDdkMsQ0FBQSxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQTs2QkFDbkIsSUFBSSxDQUFDLGFBQWEsRUFBbEIsd0JBQWtCO3dCQUNsQixxQkFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUE7O3dCQUFkLFNBQWMsQ0FBQzt3QkFDZix3QkFBUyxDQUFDLDBEQUEwRDs7O3dCQUdwRSxxQkFBTSxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQTs7d0JBQXBCLFNBQW9CLENBQUM7d0JBQ3JCLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxFQUFFLENBQUM7Ozs7d0JBRXJDLE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLEdBQUMsQ0FBQyxDQUFDOzs7d0JBR3BDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7Ozs7O0tBRXpCO0lBSUQsc0JBQUksb0NBQWlCO2FBQXJCO1lBQ0ksT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUM7UUFDbkMsQ0FBQzs7O09BQUE7SUFDRCxzQkFBSSxnQ0FBYTthQUFqQjtZQUNJLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixLQUFLLGVBQWUsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLG9CQUFvQixJQUFJLElBQUksQ0FBQztRQUNqRyxDQUFDOzs7T0FBQTtJQUVELHNCQUFJLHlDQUFzQjthQUExQjtZQUNJLE9BQU8sSUFBSSxDQUFDLHVCQUF1QixDQUFDO1FBQ3hDLENBQUM7OztPQUFBO0lBYVkscUNBQXFCLEdBQWxDOzs7OzRCQUNJLHFCQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsRUFBQTs7d0JBQXZDLFNBQXVDLENBQUM7Ozs7O0tBQzNDO0lBQ00sc0JBQU0sR0FBYixVQUNJLElBQTJCLEVBQzNCLElBQTRFOztRQUQ1RSxxQkFBQSxFQUFBLE9BQU8sZUFBZSxDQUFDLElBQUk7UUFHckIsSUFBQSxLQUFpRSxJQUFJLGFBQUosSUFBSSxjQUFKLElBQUksR0FBSSxFQUFFLEVBQXpFLDRCQUE0QixFQUE1QixvQkFBb0IsbUJBQUcsS0FBSyxLQUFBLEVBQUUsc0JBQTRCLEVBQTVCLGNBQWMsbUJBQUcsSUFBSSxDQUFDLE1BQU0sS0FBZSxDQUFDO1FBRWxGLElBQUksb0JBQW9CLEVBQUU7WUFDdEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBQyxNQUFNLElBQUssT0FBQSxNQUFNLENBQUMsaUJBQWlCLEVBQUUsRUFBMUIsQ0FBMEIsQ0FBQyxDQUFDO1NBQy9EOztZQUVELEtBQXFCLElBQUEsbUJBQUEsU0FBQSxjQUFjLENBQUEsOENBQUEsMEVBQUU7Z0JBQWhDLElBQU0sTUFBTSwyQkFBQTtnQkFDYixJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUNuQzs7Ozs7Ozs7O1FBRUQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFO1lBQ2hDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUM7WUFDL0IsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQ3hDO0lBQ0wsQ0FBQztJQUNhLDZCQUFhLEdBQTNCLFVBQTRCLEtBQWE7Ozs7Ozs7d0JBQy9CLEtBQTZELElBQUksRUFBM0MsaUJBQWlCLHdCQUFBLEVBQUUsZUFBZSxxQkFBQSxDQUFVO3dCQUNsRSxNQUFNLEdBQUcsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQzt3QkFFM0IsS0FBQSxpQkFBaUIsQ0FBQTs7aUNBQ2hCLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBckIsd0JBQW9CO2lDQUNwQixlQUFlLENBQUMsWUFBWSxDQUFDLENBQTdCLHdCQUE0QjtpQ0FLNUIsZUFBZSxDQUFDLGNBQWMsQ0FBQyxDQUEvQix3QkFBOEI7aUNBc0I5QixlQUFlLENBQUMsYUFBYSxDQUFDLENBQTlCLHdCQUE2QjtpQ0FRN0IsZUFBZSxDQUFDLHFCQUFxQixDQUFDLENBQXRDLHdCQUFxQztpQ0FPckMsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUE3Qix3QkFBNEI7aUNBSTVCLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBckIseUJBQW9COzs7NEJBN0NyQixxQkFBTSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUE7O3dCQUF4QixTQUF3QixDQUFDO3dCQUN6QixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUMxQixNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDOzs7d0JBRy9CLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7NEJBQ2hDLFVBQVEsSUFBSSxDQUFDLDJCQUEyQixFQUFFLENBQUM7NEJBRWpELElBQUksT0FBSyxHQUFHLENBQUMsRUFBRTtnQ0FDWCxpRUFBaUU7Z0NBQ2pFLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxlQUFlLENBQUMsY0FBYyxDQUFDO2dDQUN6RCxJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxFQUFFLENBQUM7Z0NBQ3JDLHlCQUFNOzZCQUNUOzRCQUVELDJFQUEyRTs0QkFDM0UsdUVBQXVFOzRCQUN2RSwwRUFBMEU7eUJBQzdFO3dCQUNELElBQUksQ0FBQywyQkFBMkIsR0FBRyxDQUFDLENBQUM7d0JBRXJDLHFCQUFNLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBQTs7d0JBQTFCLFNBQTBCLENBQUM7d0JBQzNCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQzt3QkFDdEIsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQzs7O3dCQUl2QixlQUFlLElBQUksV0FBVCxDQUFVO3dCQUN0QixhQUFhLEdBQUcseUJBQUksSUFBSSxDQUFDLGNBQWMsR0FBRSxHQUFHLENBQUMsVUFBQyxNQUFNLElBQUssT0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsVUFBVSxjQUFBLEVBQUUsQ0FBQyxFQUE3QixDQUE2QixDQUFDLENBQUM7d0JBQzlGLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUM7d0JBQzVCLHFCQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEVBQUE7O3dCQUFoQyxTQUFnQyxDQUFDO3dCQUVqQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDOzs7d0JBR3pCLFdBQVcsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBQ2hFLElBQUksaUJBQWlCLEdBQUcsZUFBZSxDQUFDLGFBQWEsSUFBSSxDQUFBLE1BQUEsV0FBVyxhQUFYLFdBQVcsdUJBQVgsV0FBVyxDQUFFLEtBQUssMENBQUUsSUFBSSxNQUFLLE9BQU8sRUFBRTs0QkFDM0YsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsS0FBa0MsQ0FBQyxDQUFDO3lCQUN0RTs7NEJBSUQscUJBQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxlQUFlLEVBQUUsTUFBTSxFQUFFLGVBQWUsaUJBQUEsRUFBRSxDQUFDLEVBQUE7O3dCQUFyRSxTQUFxRSxDQUFDO3dCQUN0RSxJQUFJLENBQUMsZUFBZSxHQUFHLEVBQUUsQ0FBQzs7O3dCQUcxQixjQUFjO3dCQUNkLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFDOzs7d0JBR2pELEdBQUcsR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7d0JBQzlCLElBQUksQ0FBQyxHQUFHLENBQUM7NEJBQ0wsS0FBSyxFQUFFLElBQUk7NEJBQ1gsVUFBVSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRzs0QkFDckQsS0FBSyxPQUFBOzRCQUNMLGlCQUFpQixFQUFFLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQzt5QkFDeEQsQ0FBQyxDQUFDOzs7OztLQUNOO0lBS0Qsc0JBQUksdUJBQUk7YUFlUjtZQUNJLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN0QixDQUFDO2FBakJELFVBQVMsTUFBbUI7WUFBNUIsaUJBY0M7WUFiRyxJQUFNLFdBQVcsR0FBRyxJQUFJLEdBQUcsRUFBYSxDQUFDO1lBQ3pDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBSTtnQkFDcEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ2hDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDMUIsQ0FBQyxDQUFDLENBQUM7WUFDSCw0RkFBNEY7WUFDNUYsSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQUMsQ0FBQyxJQUFLLE9BQUEsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFYLENBQVcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQUMsQ0FBQyxJQUFLLE9BQUEsQ0FBQyxDQUFDLFFBQVEsRUFBVixDQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBSTtnQkFDcEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ2hDLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0IsQ0FBQyxDQUFDLENBQUM7WUFFSCxXQUFXLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBSSxJQUFLLE9BQUEsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFkLENBQWMsQ0FBQyxDQUFDO1FBQ2xELENBQUM7OztPQUFBO0lBTUQsc0JBQUkseUJBQU07YUFJVjtZQUNJLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUN4QixDQUFDO2FBTkQsVUFBVyxNQUFnQjtZQUEzQixpQkFHQztZQUZHLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUN2QixNQUFNLENBQUMsT0FBTyxDQUFDLFVBQUMsTUFBTSxJQUFLLE9BQUEsS0FBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBdEIsQ0FBc0IsQ0FBQyxDQUFDO1FBQ3ZELENBQUM7OztPQUFBO0lBS0QseUJBQVMsR0FBVCxVQUFVLE1BQW1CLEVBQUUsTUFBb0I7UUFDekMsSUFBQSxLQUFvQyxJQUFJLEVBQTlCLFNBQVMsWUFBQSxFQUFFLFVBQVUsZ0JBQVMsQ0FBQztRQUMvQyxJQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUU3QyxJQUFJLE1BQU0sRUFBRTtZQUNSLElBQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFNUQsSUFBSSxXQUFXLElBQUksQ0FBQyxFQUFFO2dCQUNsQixTQUFTLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ3pDLFVBQVUsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxNQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDaEU7aUJBQU07Z0JBQ0gsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDdkIsVUFBVSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDdkM7WUFDRCxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRXhCLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRVMsMEJBQVUsR0FBcEIsVUFBcUIsTUFBbUI7UUFDcEMsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDcEIsTUFBTSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztRQUNoRCxNQUFNLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDO1FBQ2hELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFO1lBQ2QsTUFBTSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1NBQzNCO1FBQ0QsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRWhDLE1BQU0sQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUM7UUFDbEQsTUFBTSxDQUFDLHNCQUFzQixFQUFFLENBQUM7SUFDcEMsQ0FBQztJQUVTLDBCQUFVLEdBQXBCLFVBQXFCLE1BQW1CO1FBQ3BDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDO1FBQ3pCLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDaEUsTUFBTSxDQUFDLG1CQUFtQixDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBQ2hGLENBQUM7SUFFRCwrQkFBZSxHQUFmO1FBQUEsaUJBTUM7UUFMRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFDLE1BQU07WUFDdkIsS0FBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN4QixLQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDbEQsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQyxDQUFDLG9FQUFvRTtJQUMzRixDQUFDO0lBRVMsa0NBQWtCLEdBQTVCLFVBQTZCLE1BQW1CO1FBQzVDLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLGlCQUFpQixDQUFDLEVBQUU7WUFDMUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztTQUNoRTtRQUVELElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLHVCQUF1QixDQUFDLEVBQUU7WUFDaEQsTUFBTSxDQUFDLGdCQUFnQixDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1NBQzVFO0lBQ0wsQ0FBQztJQUVELHdDQUF3QixHQUF4QjtRQUFBLGlCQU9DO1FBTkcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBQyxNQUFNO1lBQ3ZCLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsS0FBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDaEUsTUFBTSxDQUFDLG1CQUFtQixDQUFDLGlCQUFpQixFQUFFLEtBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1lBRTVFLEtBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNwQyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFUyxrQ0FBa0IsR0FBNUI7UUFBQSxpQkFPQztRQU5HLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBSTtZQUNuQixJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQUMsQ0FBQztnQkFDcEMsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsS0FBSyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7Z0JBQy9FLE9BQU8sVUFBVSxLQUFLLElBQUksQ0FBQztZQUMvQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVTLGtDQUFrQixHQUE1QixVQUE2QixLQUFzQjtRQUFuRCxpQkF1Q0M7UUF2QzRCLHNCQUFBLEVBQUEsYUFBc0I7UUFDL0Msc0RBQXNEO1FBQ3RELElBQU0sa0JBQWtCLEdBQWtELEVBQUUsQ0FBQztRQUU3RSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFDLElBQUk7O1lBQ25CLElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDakMsSUFBTSxhQUFhLEdBQUcsT0FBQyxrQkFBa0IsQ0FBQyxTQUFTLHFDQUE1QixrQkFBa0IsQ0FBQyxTQUFTLElBQU0sRUFBRSxFQUFDLENBQUM7WUFDN0QsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQUMsTUFBTTtZQUN2QixNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFDLFNBQVM7Z0JBQ2hDLElBQU0sV0FBVyxHQUFHLFNBQVMsS0FBSyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7Z0JBQ3JGLElBQUksV0FBVyxJQUFJLENBQUMsS0FBSyxFQUFFO29CQUN2QixPQUFPO2lCQUNWO2dCQUVELElBQU0sYUFBYSxHQUFHLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUNwRCxJQUFJLENBQUMsYUFBYSxFQUFFO29CQUNoQixNQUFNLENBQUMsSUFBSSxDQUFDLHNDQUFvQyxTQUFTLDRDQUF5QyxDQUFDLENBQUM7b0JBQ3BHLE9BQU87aUJBQ1Y7Z0JBRUQsSUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDN0MsSUFBTSxPQUFPLEdBQUcsS0FBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hGLElBQUksQ0FBQyxPQUFPLEVBQUU7b0JBQ1YsTUFBTSxDQUFDLElBQUksQ0FDUCxxQ0FBbUMsU0FBUyxvQkFBZSxVQUFVLDRDQUF5QyxDQUNqSCxDQUFDO29CQUNGLE9BQU87aUJBQ1Y7Z0JBRUQsSUFBSSxTQUFTLEtBQUssa0JBQWtCLENBQUMsQ0FBQyxFQUFFO29CQUNwQyxNQUFNLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQztpQkFDMUI7cUJBQU07b0JBQ0gsTUFBTSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUM7aUJBQzFCO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTyxnQ0FBZ0IsR0FBeEIsVUFBeUIsYUFBMEIsRUFBRSxhQUF3Qjs7O1lBQ3pFLEtBQW1CLElBQUEsa0JBQUEsU0FBQSxhQUFhLENBQUEsNENBQUEsdUVBQUU7Z0JBQTdCLElBQU0sSUFBSSwwQkFBQTtnQkFDWCxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUUzQixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRTtvQkFDbEIsT0FBTyxJQUFJLENBQUM7aUJBQ2Y7Z0JBRUQsSUFBSSxDQUFDLGFBQWEsRUFBRTtvQkFDaEIsU0FBUztpQkFDWjs7b0JBRUQsS0FBMkIsSUFBQSxpQ0FBQSxTQUFBLGFBQWEsQ0FBQSxDQUFBLDRDQUFBLHVFQUFFO3dCQUFyQyxJQUFNLFlBQVksMEJBQUE7d0JBQ25CLElBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUU7NEJBQ3JDLE9BQU8sSUFBSSxDQUFDO3lCQUNmO3FCQUNKOzs7Ozs7Ozs7YUFDSjs7Ozs7Ozs7O0lBQ0wsQ0FBQztJQUVPLHNCQUFNLEdBQWQsVUFBZSxLQUFjLEVBQUUsTUFBZTs7UUFDMUMsS0FBSyxhQUFMLEtBQUssY0FBTCxLQUFLLElBQUwsS0FBSyxHQUFLLE1BQUEsSUFBSSxDQUFDLEtBQUssbUNBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFBLElBQUksQ0FBQyxhQUFhLDBDQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBQztRQUM1RixNQUFNLGFBQU4sTUFBTSxjQUFOLE1BQU0sSUFBTixNQUFNLEdBQUssTUFBQSxJQUFJLENBQUMsTUFBTSxtQ0FBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQUEsSUFBSSxDQUFDLGFBQWEsMENBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFDO1FBQy9GLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7WUFBRSxPQUFPO1FBRXJGLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxFQUFFO1lBQ2xDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN0QixJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxjQUFjLEVBQUUsRUFBRSxvQkFBb0IsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1NBQy9FO0lBQ0wsQ0FBQztJQUVLLDJCQUFXLEdBQWpCOzs7Ozt3QkFDSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsSUFBSyxPQUFBLENBQUMsWUFBWSxlQUFlLEVBQTVCLENBQTRCLENBQUMsRUFBRTs0QkFDL0UsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDOzRCQUM5QixJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQzt5QkFDN0I7d0JBRUQscUJBQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFDLENBQUMsSUFBSyxPQUFBLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBZixDQUFlLENBQUMsQ0FBQyxFQUFBOzt3QkFBMUQsU0FBMEQsQ0FBQzt3QkFDM0QscUJBQU0sSUFBSSxDQUFDLFlBQVksRUFBRSxFQUFBOzt3QkFBekIsU0FBeUIsQ0FBQzs7Ozs7S0FDN0I7SUFFRCwyQkFBVyxHQUFYOztRQUNJLElBQU0sYUFBYSxHQUFhLEVBQUUsQ0FBQztRQUNuQyxJQUFNLElBQUksR0FBbUMsRUFBRSxDQUFDOztZQUNoRCxLQUFxQixJQUFBLEtBQUEsU0FBQSxJQUFJLENBQUMsTUFBTSxDQUFBLGdCQUFBLDRCQUFFO2dCQUE3QixJQUFNLE1BQU0sV0FBQTtnQkFDYixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRTtvQkFDakIsU0FBUztpQkFDWjtnQkFFRCxJQUFNLFNBQVMsR0FBc0IsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUUzRCxJQUFJLENBQUMsQ0FBQyxTQUFTLElBQUksaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDakQsU0FBUztpQkFDWjtnQkFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUVyQixhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzlCOzs7Ozs7Ozs7UUFFTyxJQUFBLFVBQVUsR0FBSyxJQUFJLFdBQVQsQ0FBVTtRQUM1QixJQUFNLE1BQU0sR0FDUixVQUFVLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDO1lBQ3pCLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxVQUFVLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDdkYsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNiLE9BQU8sSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssT0FBQSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBckIsQ0FBcUIsQ0FBQyxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUVPLDRCQUFZLEdBQXBCLFVBQXFCLFVBQWtCOztRQUNuQyxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssVUFBVSxFQUFFO1lBQ2hDLE9BQU87U0FDVjtRQUVELE1BQUEsSUFBSSxDQUFDLE1BQU0sMENBQUUsT0FBTyxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUM7UUFFeEIsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDcEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7SUFDakMsQ0FBQztJQUlELDZCQUFhLEdBQWIsVUFBYyxVQUF5QztRQUNuRCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsVUFBVSxDQUFDO0lBQ3pDLENBQUM7SUFFYSw0QkFBWSxHQUExQjs7Ozs7Z0JBQ1UsVUFBVSxHQUF1QixFQUFFLENBQUM7Z0JBQzFDLElBQUksQ0FBQyxNQUFNO3FCQUNOLE1BQU0sQ0FBQyxVQUFDLENBQUMsSUFBSyxPQUFBLENBQUMsQ0FBQyxZQUFZLEVBQWQsQ0FBYyxDQUFDO3FCQUM3QixPQUFPLENBQUMsVUFBQyxNQUFNO29CQUNaLElBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQztvQkFDcEMsVUFBVSxDQUFDLElBQUksT0FBZixVQUFVLDJCQUFTLElBQUksSUFBRTtnQkFDN0IsQ0FBQyxDQUFDLENBQUM7Z0JBQ0QsVUFBVSxHQUFHLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7Z0JBQ2pGLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQzlCLE1BQUEsSUFBSSxDQUFDLGtCQUFrQiwrQ0FBdkIsSUFBSSxFQUFzQixJQUFJLENBQUMsTUFBTyxDQUFDLENBQUM7Z0JBRXhDLElBQUksVUFBVSxLQUFLLFVBQVUsRUFBRTtvQkFDM0IsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUN2QztnQkFFRCxJQUFJLENBQUMsTUFBTyxDQUFDLElBQUksR0FBRyxVQUFVLENBQUM7Ozs7S0FDbEM7SUFFUyxrQ0FBa0IsR0FBNUIsVUFBNkIsVUFBOEI7UUFBM0QsaUJBMEJDO1FBekJHLGlGQUFpRjtRQUNqRixJQUFNLGdCQUFnQixHQUFzRCxFQUFFLENBQUM7UUFFL0UsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFDLENBQUM7Ozs7WUFDakIsSUFBTSxVQUFVLEdBQUcsTUFBQSxLQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsSUFBSyxPQUFBLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLFFBQVEsRUFBbkIsQ0FBbUIsQ0FBQywwQ0FBRSxJQUFJLENBQUM7WUFDdEUsSUFBSSxDQUFDLFVBQVU7Z0JBQUUsT0FBTztZQUV4QixJQUFNLEVBQUUsR0FBRyxDQUF3QixDQUFDO1lBQ3BDLE1BQUEsZ0JBQWdCLENBQUMsVUFBVSxxQ0FBM0IsZ0JBQWdCLENBQUMsVUFBVSxjQUFRLEdBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUcsSUFBSSxHQUFHLEVBQUUsT0FBRztZQUNoRSxZQUFBLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxPQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSw4Q0FBTSxJQUFJLEdBQUcsRUFBRSxFQUFDO1lBQzFELElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFO2dCQUN4QixnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ25FO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUMsVUFBVTtZQUM3QyxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBSTtnQkFDbkQsSUFBTSxLQUFLLEdBQUcsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2pELElBQUksS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUU7b0JBQ2hCLE1BQU0sQ0FBQyxRQUFRLENBQ1gsa0JBQWdCLElBQUkscUVBQWtFLENBQ3pGLENBQUM7aUJBQ0w7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVlLDZCQUFhLEdBQTdCOzs7O2dCQUNJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7Z0JBRzVCLEtBQ0EsSUFBSSxNQURvQixFQUFmLEtBQUssV0FBQSxFQUFFLE1BQU0sWUFBQSxDQUNqQjtnQkFFTCxVQUFVLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQy9DLENBQUcsVUFBVSxHQUFLLElBQUksQ0FBQyxhQUFhLENBQUMscUJBQXFCLENBQUMsY0FBYyxFQUFFLEVBQUUsVUFBVSxZQUFBLEVBQUUsQ0FBQyxXQUE3RSxDQUE4RSxDQUFDO2dCQUM1RixDQUFHLFVBQVUsR0FBSyxJQUFJLENBQUMsYUFBYSxDQUFDLHFCQUFxQixDQUFDLGVBQWUsRUFBRSxFQUFFLFVBQVUsWUFBQSxFQUFFLENBQUMsV0FBOUUsQ0FBK0UsQ0FBQztnQkFFN0Ysc0JBQU8sVUFBVSxFQUFDOzs7S0FDckI7SUFFTywrQkFBZSxHQUF2QixVQUF3QixVQUFnQjtRQUM1QixJQUFBLE9BQU8sR0FBSyxJQUFJLFFBQVQsQ0FBVTtRQUV6QixVQUFVLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDeEMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3RDLFVBQVUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMxQyxVQUFVLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFNUMsT0FBTyxFQUFFLFVBQVUsWUFBQSxFQUFFLENBQUM7SUFDMUIsQ0FBQztJQUVPLGdDQUFnQixHQUF4QixVQUF5QixVQUFnQjs7UUFDL0IsSUFBQSxLQUFnQyxJQUFJLEVBQWxDLEtBQUssV0FBQSxFQUFFLFFBQVEsY0FBQSxFQUFFLFFBQVEsY0FBUyxDQUFDO1FBQzNDLElBQU0sYUFBYSxHQUFHLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUV6QyxJQUFNLGFBQWEsR0FBRyxVQUFDLE9BQWdCOztZQUNuQyxJQUFNLG9CQUFvQixHQUFHLFVBQVUsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1lBQ3BELElBQU0saUJBQWlCLEdBQUcsTUFBQSxPQUFPLENBQUMsVUFBVSxtQ0FBSSxPQUFPLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQztZQUMvRixJQUFNLFFBQVEsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDO1lBQ2xDLElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUNwRSxPQUFPLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNqRCxDQUFDLENBQUM7UUFFRixJQUFNLHdCQUF3QixHQUFHLFVBQUMsT0FBZ0I7O1lBQzlDLElBQU0sS0FBSyxHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUM7WUFDOUIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsYUFBYSxDQUFDLENBQUMsR0FBRyxhQUFhLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztZQUMzRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7WUFDdkIsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1lBQ2xDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN2QixJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBRXhDLHFGQUFxRjtZQUNyRixxRkFBcUY7WUFDckYsMkJBQTJCO1lBQzNCLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLE1BQUEsT0FBTyxDQUFDLE9BQU8sbUNBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVwRixhQUFhLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM1QyxDQUFDLENBQUM7UUFDRixJQUFNLDJCQUEyQixHQUFHLFVBQUMsT0FBZ0I7O1lBQ2pELElBQU0sS0FBSyxHQUFHLGFBQWEsQ0FBQyxDQUFDLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQztZQUNyRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxhQUFhLENBQUMsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQzNELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUN2QixPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUM7WUFDckMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZCLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFFeEMsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQUEsT0FBTyxDQUFDLE9BQU8sbUNBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV0RSxhQUFhLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUMvQyxDQUFDLENBQUM7UUFFRixJQUFJLEtBQUssRUFBRTtZQUNQLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUM7WUFDbkMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDcEIsd0JBQXdCLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDbkM7U0FDSjtRQUVELElBQUksUUFBUSxFQUFFO1lBQ1YsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBQSxDQUFDLENBQUEsS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLE9BQU8sS0FBSSxRQUFRLENBQUMsT0FBTyxDQUFDLG1DQUFJLEtBQUssQ0FBQztZQUN0RSxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUN2Qix3QkFBd0IsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUN0QztTQUNKO1FBRUQsSUFBSSxRQUFRLEVBQUU7WUFDVixRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDO1lBQ3pDLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ3ZCLDJCQUEyQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ3pDO1NBQ0o7UUFFRCxPQUFPLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxDQUFDO0lBQ3pDLENBQUM7SUFNRCw2QkFBYSxHQUFiO1FBQ0ksT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQzNCLENBQUM7SUFFRCxvRUFBb0U7SUFDNUQsOEJBQWMsR0FBdEIsVUFBdUIsS0FBWSxFQUFFLGNBQXVCLEVBQUUsV0FBb0I7OztRQUM5RSxJQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7UUFFaEMsb0VBQW9FO1FBQ3BFLElBQU0sU0FBUyxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFFdEYsd0ZBQXdGO1FBQ3hGLG1CQUFtQjtRQUNuQixJQUFNLGFBQWEsR0FBRyx5QkFBSSxJQUFJLENBQUMsTUFBTSxHQUFFLE9BQU8sRUFBRSxDQUFDO1FBRWpELElBQUksTUFBTSxHQUFrRixTQUFTLENBQUM7O1lBQ3RHLEtBQXFCLElBQUEsa0JBQUEsU0FBQSxhQUFhLENBQUEsNENBQUEsdUVBQUU7Z0JBQS9CLElBQU0sTUFBTSwwQkFBQTtnQkFDYixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFO29CQUM5QyxTQUFTO2lCQUNaO2dCQUNLLElBQUEsS0FBc0IsTUFBQSxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsbUNBQUksRUFBRSxFQUEzRCxLQUFLLFdBQUEsRUFBRSxRQUFRLGNBQTRDLENBQUM7Z0JBQ3BFLElBQUksQ0FBQyxLQUFLLElBQUksUUFBUSxJQUFJLElBQUksRUFBRTtvQkFDNUIsU0FBUztpQkFDWjtnQkFDRCxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsSUFBSSxRQUFRLElBQUksQ0FBQyxXQUFXLGFBQVgsV0FBVyxjQUFYLFdBQVcsR0FBSSxRQUFRLENBQUMsRUFBRTtvQkFDbEYsTUFBTSxHQUFHLEVBQUUsTUFBTSxRQUFBLEVBQUUsUUFBUSxVQUFBLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDO2lCQUMvQztnQkFDRCxJQUFJLFFBQVEsS0FBSyxDQUFDLEVBQUU7b0JBQ2hCLE1BQU07aUJBQ1Q7YUFDSjs7Ozs7Ozs7O1FBRUQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQy9DLENBQUMsTUFBQSxJQUFJLENBQUMsZUFBZSxDQUFDLGdCQUFnQixDQUFDLG1DQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUM5RSxDQUFDO1FBRUYsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQU9TLDJCQUFXLEdBQXJCLFVBQXNCLEtBQWdDO1FBQ2xELElBQUksQ0FBQyxvQkFBb0IsR0FBRyxLQUFLLENBQUM7UUFDbEMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRWpDLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztRQUMvQyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUM7UUFDL0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVTLHVCQUFPLEdBQWpCLFVBQWtCLEtBQWdDO1FBQzlDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUM1QyxPQUFPO1NBQ1Y7UUFFRCxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDMUIsQ0FBQztJQVNTLDZCQUFhLEdBQXZCLFVBQXdCLEtBQWdDO1FBQXhELGlCQXFCQztRQXBCUyxJQUFBLEtBQTBCLElBQUksRUFBNUIsUUFBUSxjQUFBLEVBQUUsU0FBUyxlQUFTLENBQUM7UUFDN0IsSUFBQSxPQUFPLEdBQWMsS0FBSyxRQUFuQixFQUFFLE9BQU8sR0FBSyxLQUFLLFFBQVYsQ0FBVztRQUVuQyxJQUFNLGNBQWMsR0FBRyxVQUFDLGFBQXFCO1lBQXJCLDhCQUFBLEVBQUEscUJBQXFCO1lBQ3pDLElBQUksUUFBUSxFQUFFO2dCQUNWLHNEQUFzRDtnQkFDdEQsS0FBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsQ0FBQzthQUN0QztRQUNMLENBQUMsQ0FBQztRQUVGLElBQUksQ0FBQyxDQUFBLFNBQVMsYUFBVCxTQUFTLHVCQUFULFNBQVMsQ0FBRSxhQUFhLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFBLEVBQUU7WUFDN0MsY0FBYyxFQUFFLENBQUM7WUFDakIsT0FBTztTQUNWO1FBRUQsb0ZBQW9GO1FBQ3BGLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFFakQsMkZBQTJGO1FBQzNGLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRVMsb0NBQW9CLEdBQTlCLFVBQ0ksS0FBZ0MsRUFDaEMsY0FBaUQ7O1FBRTNDLElBQUEsS0FBd0IsSUFBSSxFQUExQixRQUFRLGNBQUEsRUFBRSxPQUFPLGFBQVMsQ0FBQztRQUMzQixJQUFBLEtBQUssR0FBSyxPQUFPLE1BQVosQ0FBYTtRQUNsQixJQUFBLEtBQUssR0FBOEIsS0FBSyxNQUFuQyxFQUFFLEtBQUssR0FBdUIsS0FBSyxNQUE1QixFQUFFLE9BQU8sR0FBYyxLQUFLLFFBQW5CLEVBQUUsT0FBTyxHQUFLLEtBQUssUUFBVixDQUFXO1FBRWpELElBQUksVUFBVSxDQUFDO1FBQ2YsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNyRCxVQUFVLEdBQUcsS0FBSyxDQUFDO1NBQ3RCO1FBQ0QsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxFQUFFLEtBQUssS0FBSyxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFFNUYsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNQLElBQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUMzQyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxLQUFLLFNBQVM7Z0JBQUUsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdELE9BQU87U0FDVjtRQUVELElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxLQUFLLE1BQU0sSUFBSSxDQUFDLFFBQVEsSUFBSSxRQUFRLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDakcsSUFBSSxJQUFJLENBQUM7UUFFVCxJQUFJLFVBQVUsRUFBRTtZQUNaLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFOUMsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUU7Z0JBQ3BDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDOUQ7U0FDSjthQUFNLElBQUksUUFBUSxFQUFFO1lBQ2pCLFFBQVEsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQztTQUN0QztRQUVELElBQU0sWUFBWSxHQUFHLFVBQVUsSUFBSSxJQUFJLENBQUM7UUFDeEMsSUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO1FBQzNFLElBQU0sY0FBYyxHQUFHLEtBQUssS0FBSyxPQUFPLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxDQUFDLENBQUM7UUFDaEUsSUFBTSxZQUFZLEdBQUcsS0FBSyxLQUFLLFNBQVMsSUFBSSxZQUFZLElBQUksY0FBYyxDQUFDO1FBQzNFLElBQU0sbUJBQW1CLEdBQUcsY0FBYyxJQUFJLFlBQVksSUFBSSxDQUFDLENBQUMsVUFBVSxJQUFJLElBQUksS0FBSyxTQUFTLENBQUMsQ0FBQztRQUVsRyxJQUFNLFFBQVEsR0FBRztZQUNiLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU87WUFDbkQsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTztTQUN0RCxDQUFDO1FBRUYsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUMvQixFQUFFLEtBQUssT0FBQSxFQUFFLEtBQUssT0FBQSxFQUFFLE9BQU8sU0FBQSxFQUFFLE9BQU8sU0FBQSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxRQUFRLFVBQUEsRUFBRSxFQUNwRyxJQUFJLENBQUMsS0FBSyxDQUNiLENBQUM7UUFDRixJQUFJLENBQUMsaUJBQWlCLEdBQUcsTUFBQSxNQUFBLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsMENBQUUsT0FBTyxtQ0FBSSxLQUFLLENBQUM7UUFFM0UsSUFBSSxtQkFBbUIsRUFBRTtZQUNyQixJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztTQUMxRDtJQUNMLENBQUM7SUFFUyxpQ0FBaUIsR0FBM0IsVUFBNEIsS0FBZ0M7UUFBNUQsaUJBa0JDO1FBakJHLElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsVUFBQyxNQUFjLEVBQUUsS0FBVTtZQUN0RSxJQUFJLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsSUFBSSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsaUJBQWlCLENBQUMsRUFBRTtnQkFDcEYsS0FBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2FBQ3ZEO1lBRUQsSUFBSSxLQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssS0FBSyxNQUFNLEVBQUU7Z0JBQ2pDLEtBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsS0FBSSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQzthQUN6RDtRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNSLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRXpDLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEtBQUssTUFBTSxFQUFFO2dCQUNqQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUNsRDtTQUNKO0lBQ0wsQ0FBQztJQUVTLHVCQUFPLEdBQWpCLFVBQWtCLEtBQWdDO1FBQzlDLElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ2xDLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQzNDLE9BQU87U0FDVjtRQUNELElBQUksQ0FBQyxTQUFTLENBQW9CO1lBQzlCLElBQUksRUFBRSxPQUFPO1lBQ2IsS0FBSyxFQUFFLEtBQUssQ0FBQyxXQUFXO1NBQzNCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFUyw2QkFBYSxHQUF2QixVQUF3QixLQUFtQztRQUN2RCxJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUN4QyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUMzQyxPQUFPO1NBQ1Y7UUFDRCxJQUFJLENBQUMsU0FBUyxDQUEwQjtZQUNwQyxJQUFJLEVBQUUsYUFBYTtZQUNuQixLQUFLLEVBQUUsS0FBSyxDQUFDLFdBQVc7U0FDM0IsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLG9DQUFvQixHQUE1QixVQUE2QixLQUFnQztRQUN6RCxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsVUFBQyxNQUFjLEVBQUUsS0FBVTtZQUMvRCxPQUFBLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQztRQUFuRCxDQUFtRCxDQUN0RCxDQUFDO0lBQ04sQ0FBQztJQUVPLDBDQUEwQixHQUFsQyxVQUFtQyxLQUFtQztRQUNsRSxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsVUFBQyxNQUFjLEVBQUUsS0FBVTtZQUMvRCxPQUFBLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQztRQUF6RCxDQUF5RCxDQUM1RCxDQUFDO0lBQ04sQ0FBQztJQUVPLG9DQUFvQixHQUE1QixVQUNJLEtBQXVELEVBQ3ZELFFBQThDO1FBRTlDLElBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXZGLElBQU0sS0FBSyxHQUFHLFdBQVcsYUFBWCxXQUFXLHVCQUFYLFdBQVcsQ0FBRSxLQUFLLENBQUM7UUFDakMsSUFBTSxjQUFjLEdBQUcsS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLE1BQU0sQ0FBQyxjQUFjLENBQUM7UUFFcEQsc0VBQXNFO1FBQ3RFLElBQUksS0FBSyxJQUFJLGNBQWMsS0FBSyxTQUFTLEVBQUU7WUFDdkMsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDOUIsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUVELDBEQUEwRDtRQUMxRCxJQUFJLFVBQVUsQ0FBQztRQUNmLElBQUksT0FBTyxjQUFjLEtBQUssUUFBUSxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLEVBQUU7WUFDdkUsVUFBVSxHQUFHLGNBQWMsQ0FBQztTQUMvQjtRQUVELElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQzVCLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFDdEMsY0FBYyxLQUFLLE9BQU8sRUFDMUIsVUFBVSxDQUNiLENBQUM7UUFFRixJQUFJLENBQUMsSUFBSTtZQUFFLE9BQU8sS0FBSyxDQUFDO1FBRXhCLHVGQUF1RjtRQUN2RixJQUFNLFlBQVksR0FBRyxVQUFVLElBQUksSUFBSSxDQUFDO1FBQ3hDLElBQU0sY0FBYyxHQUFHLGNBQWMsS0FBSyxPQUFPLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxDQUFDLENBQUM7UUFFekUsSUFBSSxZQUFZLElBQUksY0FBYyxFQUFFO1lBQ2hDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNsQyxPQUFPLElBQUksQ0FBQztTQUNmO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQXVCTyxpQ0FBaUIsR0FBekIsVUFBMEIsSUFBaUIsRUFBRSxLQUFzQjtRQUN2RCxJQUFBLElBQUksR0FBSyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEtBQWxDLENBQW1DO1FBRS9DLElBQUksSUFBSSxLQUFLLE1BQU0sSUFBSSxLQUFLLENBQUMsWUFBWSxFQUFFO1lBQ2pDLElBQUEsS0FBVyxLQUFLLENBQUMsWUFBWSxFQUEzQixDQUFDLE9BQUEsRUFBRSxDQUFDLE9BQXVCLENBQUM7WUFDNUIsSUFBQSxNQUFNLEdBQUssSUFBSSxDQUFDLEtBQUssT0FBZixDQUFnQjtZQUM5QixJQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDakUsSUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBQzFELDZCQUNPLElBQUksS0FDUCxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUM3RCxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUM1RCxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQzVCLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFDOUI7U0FDTDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxvQ0FBb0IsR0FBcEIsVUFBcUIsS0FBMkI7O1FBQzVDLElBQU0sY0FBYyxHQUFnQixJQUFJLEdBQUcsRUFBVSxDQUFDO1FBQ2hELElBQUEsS0FBcUQsTUFBQSxLQUFLLENBQUMsZ0JBQWdCLG1DQUFJLEVBQUUsRUFBL0UsY0FBNkIsRUFBckIsU0FBUyxtQkFBRyxTQUFTLEtBQUEsRUFBUyxRQUFRLFdBQWlDLENBQUM7UUFDbEYsSUFBQSxLQUF1RCxNQUFBLEtBQUssQ0FBQyxpQkFBaUIsbUNBQUksRUFBRSxFQUFsRixjQUE4QixFQUF0QixVQUFVLG1CQUFHLFNBQVMsS0FBQSxFQUFTLFNBQVMsV0FBa0MsQ0FBQztRQUUzRixJQUFJLFVBQVUsRUFBRTtZQUNaLGNBQWMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDbEM7UUFFRCxJQUFJLFNBQVMsRUFBRTtZQUNYLGNBQWMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDakM7UUFFRCwrRUFBK0U7UUFDL0UsSUFBSSxDQUFBLFVBQVUsYUFBVixVQUFVLHVCQUFWLFVBQVUsQ0FBRSxNQUFNLEtBQUksU0FBUyxFQUFFO1lBQ2pDLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNsRDtRQUNELElBQUksQ0FBQSxTQUFTLGFBQVQsU0FBUyx1QkFBVCxTQUFTLENBQUUsTUFBTSxLQUFJLFFBQVEsRUFBRTtZQUMvQixJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNuRTtRQUVELElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRXZGLElBQU0sU0FBUyxHQUFHLFNBQVMsSUFBSSxJQUFJLElBQUksVUFBVSxJQUFJLElBQUksQ0FBQztRQUMxRCxJQUFJLFNBQVMsRUFBRTtZQUNYLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1NBQzlDO2FBQU07WUFDSCxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxhQUFhLEVBQUUsRUFBRSxjQUFjLGdCQUFBLEVBQUUsQ0FBQyxDQUFDO1NBQ2xFO0lBQ0wsQ0FBQztJQUVLLDZCQUFhLEdBQW5CLFVBQW9CLFNBQWdCO1FBQWhCLDBCQUFBLEVBQUEsZ0JBQWdCOzs7Ozs7d0JBQzFCLEtBQUssR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7Ozs2QkFFekIsQ0FBQSxJQUFJLENBQUMsc0JBQXNCLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFBO3dCQUMvRCxJQUFJLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLEdBQUcsU0FBUyxFQUFFOzRCQUN2QyxNQUFNLElBQUksS0FBSyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7eUJBQ3ZEO3dCQUNELHFCQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBQTs7d0JBQWQsU0FBYyxDQUFDOzs0QkFFbkIscUJBQU0sSUFBSSxDQUFDLHFCQUFxQixFQUFFLEVBQUE7O3dCQUFsQyxTQUFrQyxDQUFDOzs7OztLQUN0QztJQUVTLDhCQUFjLEdBQXhCO1FBQ0ksSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7SUFDL0IsQ0FBQztJQUVTLG1DQUFtQixHQUE3QjtRQUNJLElBQU0sMEJBQTBCLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsSUFBSyxPQUFBLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBWCxDQUFXLENBQUMsQ0FBQztRQUN6RSxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFFbEMsSUFBSSwwQkFBMEIsSUFBSSxJQUFJLEVBQUU7WUFDcEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ25DO2FBQU07WUFDSCxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztTQUMvQjtJQUNMLENBQUM7SUFwckNEO1FBTEMsV0FBVyxDQUFRO1lBQ2hCLFFBQVEsWUFBQyxLQUFLO2dCQUNWLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7WUFDeEMsQ0FBQztTQUNKLENBQUM7d0NBQ1c7SUE2QmI7UUFMQyxXQUFXLENBQVE7WUFDaEIsUUFBUSxZQUFDLEtBQUs7O2dCQUNWLE1BQUEsSUFBSSxDQUFDLE1BQU0sMENBQUUsT0FBTyxDQUFDLFVBQUMsTUFBTSxJQUFLLE9BQUEsQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxFQUFyQixDQUFxQixDQUFDLENBQUM7WUFDNUQsQ0FBQztTQUNKLENBQUM7dUNBQ29CO0lBT3RCO1FBTEMsV0FBVyxDQUFRO1lBQ2hCLFFBQVEsWUFBQyxLQUFLO2dCQUNWLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdkIsQ0FBQztTQUNKLENBQUM7d0NBQ2E7SUFPZjtRQUxDLFdBQVcsQ0FBUTtZQUNoQixRQUFRLFlBQUMsS0FBSztnQkFDVixJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNsQyxDQUFDO1NBQ0osQ0FBQzt5Q0FDYztJQVFoQjtRQU5DLFdBQVcsQ0FBUTtZQUNoQixXQUFXLFlBQUMsS0FBSztnQkFDYixJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2hDLENBQUM7U0FDSixDQUFDO1FBQ0QsUUFBUSxDQUFDLE9BQU8sQ0FBQzsyQ0FDRjtJQXFDaEI7UUFSQyxXQUFXLENBQVE7WUFDaEIsUUFBUSxZQUFDLEtBQUs7O2dCQUNWLE1BQUEsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLDBDQUFFLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0MsQ0FBQztZQUNELFFBQVEsWUFBQyxRQUFROztnQkFDYixNQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSwwQ0FBRSxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hELENBQUM7U0FDSixDQUFDO3dDQUNpQztJQVVuQztRQVJDLFdBQVcsQ0FBUTtZQUNoQixRQUFRLFlBQUMsS0FBSzs7Z0JBQ1YsTUFBQSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksMENBQUUsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM3QyxDQUFDO1lBQ0QsUUFBUSxZQUFDLFFBQVE7O2dCQUNiLE1BQUEsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLDBDQUFFLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaEQsQ0FBQztTQUNKLENBQUM7MkNBQ29DO0lBVXRDO1FBUkMsV0FBVyxDQUFRO1lBQ2hCLFFBQVEsWUFBQyxLQUFLOztnQkFDVixNQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSwwQ0FBRSxXQUFXLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdDLENBQUM7WUFDRCxRQUFRLFlBQUMsUUFBUTs7Z0JBQ2IsTUFBQSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksMENBQUUsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNoRCxDQUFDO1NBQ0osQ0FBQzsyQ0FDb0M7SUFHdEM7UUFEQyxRQUFRLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQzt1Q0FDRjtJQXNrQ3JELFlBQUM7Q0FBQSxBQTlzQ0QsQ0FBb0MsVUFBVSxHQThzQzdDO1NBOXNDcUIsS0FBSyJ9