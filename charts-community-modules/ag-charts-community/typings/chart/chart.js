"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chart = void 0;
var scene_1 = require("../scene/scene");
var group_1 = require("../scene/group");
var text_1 = require("../scene/shape/text");
var series_1 = require("./series/series");
var padding_1 = require("../util/padding");
var bbox_1 = require("../scene/bbox");
var sizeMonitor_1 = require("../util/sizeMonitor");
var observable_1 = require("../util/observable");
var id_1 = require("../util/id");
var labelPlacement_1 = require("../util/labelPlacement");
var render_1 = require("../util/render");
var validation_1 = require("../util/validation");
var async_1 = require("../util/async");
var tooltip_1 = require("./tooltip/tooltip");
var chartOverlays_1 = require("./overlay/chartOverlays");
var json_1 = require("../util/json");
var layers_1 = require("./layers");
var animationManager_1 = require("./interaction/animationManager");
var cursorManager_1 = require("./interaction/cursorManager");
var chartEventManager_1 = require("./interaction/chartEventManager");
var highlightManager_1 = require("./interaction/highlightManager");
var interactionManager_1 = require("./interaction/interactionManager");
var tooltipManager_1 = require("./interaction/tooltipManager");
var zoomManager_1 = require("./interaction/zoomManager");
var layoutService_1 = require("./layout/layoutService");
var dataService_1 = require("./dataService");
var updateService_1 = require("./updateService");
var chartUpdateType_1 = require("./chartUpdateType");
var logger_1 = require("../util/logger");
var proxy_1 = require("../util/proxy");
var chartHighlight_1 = require("./chartHighlight");
var legendTypes_1 = require("./factory/legendTypes");
var callbackCache_1 = require("../util/callbackCache");
var dataController_1 = require("./data/dataController");
var seriesStateManager_1 = require("./series/seriesStateManager");
var seriesLayerManager_1 = require("./series/seriesLayerManager");
var Chart = /** @class */ (function (_super) {
    __extends(Chart, _super);
    function Chart(document, overrideDevicePixelRatio, resources) {
        if (document === void 0) { document = window.document; }
        var _a;
        var _this = _super.call(this) || this;
        _this.id = id_1.createId(_this);
        _this.processedOptions = {};
        _this.userOptions = {};
        _this.queuedUserOptions = [];
        _this.seriesRoot = new group_1.Group({ name: _this.id + "-Series-root" });
        _this.extraDebugStats = {};
        _this.container = undefined;
        _this.data = [];
        _this.padding = new padding_1.Padding(20);
        _this.seriesAreaPadding = new padding_1.Padding(0);
        _this.title = undefined;
        _this.subtitle = undefined;
        _this.footnote = undefined;
        _this.mode = 'standalone';
        _this._destroyed = false;
        _this.modules = {};
        _this.legendModules = {};
        _this._pendingFactoryUpdates = [];
        _this._performUpdateNoRenderCount = 0;
        _this._performUpdateType = chartUpdateType_1.ChartUpdateType.NONE;
        _this.seriesToUpdate = new Set();
        _this.performUpdateTrigger = render_1.debouncedCallback(function (_a) {
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
                            logger_1.Logger.error('update error', error_1);
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
        _this.pointerScheduler = render_1.debouncedAnimationFrame(function () {
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
        var root = new group_1.Group({ name: 'root' });
        // Prevent the scene from rendering chart components in an invalid state
        // (before first layout is performed).
        root.visible = false;
        root.append(_this.seriesRoot);
        _this.axisGroup = new group_1.Group({ name: 'Axes', layer: true, zIndex: layers_1.Layers.AXIS_ZINDEX });
        root.appendChild(_this.axisGroup);
        _this.element = element;
        element.classList.add('ag-chart-wrapper');
        element.style.position = 'relative';
        _this.scene = scene !== null && scene !== void 0 ? scene : new scene_1.Scene({ document: document, overrideDevicePixelRatio: overrideDevicePixelRatio });
        _this.scene.debug.consoleLog = false;
        _this.scene.root = root;
        _this.scene.container = element;
        _this.autoSize = true;
        _this.chartEventManager = new chartEventManager_1.ChartEventManager();
        _this.cursorManager = new cursorManager_1.CursorManager(element);
        _this.highlightManager = new highlightManager_1.HighlightManager();
        _this.interactionManager = new interactionManager_1.InteractionManager(element);
        _this.zoomManager = new zoomManager_1.ZoomManager();
        _this.dataService = new dataService_1.DataService(function () { return _this.series; });
        _this.layoutService = new layoutService_1.LayoutService();
        _this.updateService = new updateService_1.UpdateService(function (type, _a) {
            if (type === void 0) { type = chartUpdateType_1.ChartUpdateType.FULL; }
            var forceNodeDataRefresh = _a.forceNodeDataRefresh;
            return _this.update(type, { forceNodeDataRefresh: forceNodeDataRefresh });
        });
        _this.seriesStateManager = new seriesStateManager_1.SeriesStateManager();
        _this.seriesLayerManager = new seriesLayerManager_1.SeriesLayerManager(_this.seriesRoot);
        _this.callbackCache = new callbackCache_1.CallbackCache();
        _this.animationManager = new animationManager_1.AnimationManager(_this.interactionManager);
        _this.animationManager.skipAnimations = true;
        _this.animationManager.play();
        _this.tooltip = new tooltip_1.Tooltip(_this.scene.canvas.element, document, document.body);
        _this.tooltipManager = new tooltipManager_1.TooltipManager(_this.tooltip, _this.interactionManager);
        _this.overlays = new chartOverlays_1.ChartOverlays(_this.element);
        _this.highlight = new chartHighlight_1.ChartHighlight();
        _this.container = container;
        _this.debug = false;
        sizeMonitor_1.SizeMonitor.observe(_this.element, function (size) {
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
            _this.update(chartUpdateType_1.ChartUpdateType.SCENE_RENDER);
        });
        _this.highlightManager.addListener('highlight-change', function (event) { return _this.changeHighlightDatum(event); });
        _this.zoomManager.addListener('zoom-change', function (_) {
            return _this.update(chartUpdateType_1.ChartUpdateType.PROCESS_DATA, { forceNodeDataRefresh: true });
        });
        _this.attachLegend('category');
        return _this;
    }
    Chart.prototype.getOptions = function () {
        var _a;
        var queuedUserOptions = this.queuedUserOptions;
        var lastUpdateOptions = (_a = queuedUserOptions[queuedUserOptions.length - 1]) !== null && _a !== void 0 ? _a : this.userOptions;
        return json_1.jsonMerge([lastUpdateOptions]);
    };
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
        var _a = this, scene = _a.scene, animationManager = _a.animationManager, chartEventManager = _a.chartEventManager, cursorManager = _a.cursorManager, highlightManager = _a.highlightManager, interactionManager = _a.interactionManager, tooltipManager = _a.tooltipManager, zoomManager = _a.zoomManager, dataService = _a.dataService, layoutService = _a.layoutService, updateService = _a.updateService, seriesStateManager = _a.seriesStateManager, seriesLayerManager = _a.seriesLayerManager, mode = _a.mode, callbackCache = _a.callbackCache;
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
            seriesStateManager: seriesStateManager,
            seriesLayerManager: seriesLayerManager,
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
        this._performUpdateType = chartUpdateType_1.ChartUpdateType.NONE;
        this._pendingFactoryUpdates.splice(0);
        this.tooltipManager.destroy();
        this.tooltip.destroy();
        (_b = this.legend) === null || _b === void 0 ? void 0 : _b.destroy();
        this.overlays.noData.hide();
        sizeMonitor_1.SizeMonitor.unobserve(this.element);
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
        this.axes.forEach(function (a) { return a.destroy(); });
        this.axes = [];
        this.callbackCache.invalidateCache();
        this._destroyed = true;
        return result;
    };
    Chart.prototype.log = function () {
        var opts = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            opts[_i] = arguments[_i];
        }
        if (this.debug) {
            logger_1.Logger.debug.apply(logger_1.Logger, __spreadArray([], __read(opts)));
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
            this._processCallbacks().catch(function (e) { return logger_1.Logger.errorOnce(e); });
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
                        return [4 /*yield*/, async_1.sleep(1)];
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
                        logger_1.Logger.error('update error', e_2);
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
            return this._performUpdateType !== chartUpdateType_1.ChartUpdateType.NONE || this.lastInteractionEvent != null;
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
        if (type === void 0) { type = chartUpdateType_1.ChartUpdateType.FULL; }
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
            var _b, performUpdateType, extraDebugStats, splits, _c, seriesRect_1, seriesUpdates, tooltipMeta, end;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _b = this, performUpdateType = _b._performUpdateType, extraDebugStats = _b.extraDebugStats;
                        this.log('Chart.performUpdate() - start', chartUpdateType_1.ChartUpdateType[performUpdateType]);
                        splits = [performance.now()];
                        _c = performUpdateType;
                        switch (_c) {
                            case chartUpdateType_1.ChartUpdateType.FULL: return [3 /*break*/, 1];
                            case chartUpdateType_1.ChartUpdateType.PROCESS_DATA: return [3 /*break*/, 1];
                            case chartUpdateType_1.ChartUpdateType.PERFORM_LAYOUT: return [3 /*break*/, 3];
                            case chartUpdateType_1.ChartUpdateType.SERIES_UPDATE: return [3 /*break*/, 5];
                            case chartUpdateType_1.ChartUpdateType.TOOLTIP_RECALCULATION: return [3 /*break*/, 7];
                            case chartUpdateType_1.ChartUpdateType.SCENE_RENDER: return [3 /*break*/, 8];
                            case chartUpdateType_1.ChartUpdateType.NONE: return [3 /*break*/, 10];
                        }
                        return [3 /*break*/, 11];
                    case 1: return [4 /*yield*/, this.processData()];
                    case 2:
                        _d.sent();
                        this.disablePointer(true);
                        splits.push(performance.now());
                        _d.label = 3;
                    case 3:
                        if (!this.checkFirstAutoSize())
                            return [3 /*break*/, 11];
                        return [4 /*yield*/, this.performLayout()];
                    case 4:
                        _d.sent();
                        this.handleOverlays();
                        this.log('Chart.performUpdate() - seriesRect', this.seriesRect);
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
                        if (performUpdateType < chartUpdateType_1.ChartUpdateType.SERIES_UPDATE && ((_a = tooltipMeta === null || tooltipMeta === void 0 ? void 0 : tooltipMeta.event) === null || _a === void 0 ? void 0 : _a.type) === 'hover') {
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
                        this._performUpdateType = chartUpdateType_1.ChartUpdateType.NONE;
                        _d.label = 11;
                    case 11:
                        end = performance.now();
                        this.log('Chart.performUpdate() - end', {
                            chart: this,
                            durationMs: Math.round((end - splits[0]) * 100) / 100,
                            count: count,
                            performUpdateType: chartUpdateType_1.ChartUpdateType[performUpdateType],
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    Chart.prototype.checkFirstAutoSize = function () {
        if (this.autoSize && !this._lastAutoSize) {
            var count = this._performUpdateNoRenderCount++;
            var backOffMs = (count ^ 2) * 10;
            if (count < 5) {
                // Reschedule if canvas size hasn't been set yet to avoid a race.
                this._performUpdateType = chartUpdateType_1.ChartUpdateType.PERFORM_LAYOUT;
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
            this.zoomManager.updateAxes(this._axes);
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
    Chart.prototype.addSeries = function (series) {
        var allSeries = this.series;
        var canAdd = allSeries.indexOf(series) < 0;
        if (canAdd) {
            allSeries.push(series);
            if (series.rootGroup.parent == null) {
                this.seriesLayerManager.requestGroup(series);
            }
            this.initSeries(series);
            return true;
        }
        return false;
    };
    Chart.prototype.initSeries = function (series) {
        series.chart = this;
        if (!series.data) {
            series.data = this.data;
        }
        this.addSeriesListeners(series);
        series.addChartEventListeners();
    };
    Chart.prototype.removeAllSeries = function () {
        var _this = this;
        this.series.forEach(function (series) {
            series.removeEventListener('nodeClick', _this.onSeriesNodeClick);
            series.removeEventListener('nodeDoubleClick', _this.onSeriesNodeDoubleClick);
            series.destroy();
            series.chart = undefined;
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
                var seriesAxis = s.axes[axis.direction];
                return seriesAxis === axis;
            });
        });
    };
    Chart.prototype.assignAxesToSeries = function () {
        var _this = this;
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
                var directionAxes = directionToAxesMap[direction];
                if (!directionAxes) {
                    logger_1.Logger.warn("no available axis for direction [" + direction + "]; check series and axes configuration.");
                    return;
                }
                var seriesKeys = series.getKeys(direction);
                var newAxis = _this.findMatchingAxis(directionAxes, series.getKeys(direction));
                if (!newAxis) {
                    logger_1.Logger.warn("no matching axis for direction [" + direction + "] and keys [" + seriesKeys + "]; check series and axes configuration.");
                    return;
                }
                series.axes[direction] = newAxis;
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
        this.log('Chart.resize()', { width: width, height: height });
        if (!width || !height || !Number.isFinite(width) || !Number.isFinite(height))
            return;
        if (this.scene.resize(width, height)) {
            this.disablePointer();
            this.update(chartUpdateType_1.ChartUpdateType.PERFORM_LAYOUT, { forceNodeDataRefresh: true });
        }
    };
    Chart.prototype.processData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dataController, seriesPromises;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.axes.length > 0) {
                            this.assignAxesToSeries();
                            this.assignSeriesToAxes();
                        }
                        dataController = new dataController_1.DataController();
                        seriesPromises = this.series.map(function (s) { return s.processData(dataController); });
                        return [4 /*yield*/, dataController.execute()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, Promise.all(seriesPromises)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.updateLegend()];
                    case 3:
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
                if (!(labelData && labelPlacement_1.isPointLabelDatum(labelData[0]))) {
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
            ? labelPlacement_1.placeLabels(data, { x: 0, y: 0, width: seriesRect.width, height: seriesRect.height })
            : [];
        return new Map(labels.map(function (l, i) { return [visibleSeries[i], l]; }));
    };
    Chart.prototype.attachLegend = function (legendType) {
        var _a;
        if (this.legendType === legendType && this.legend) {
            return this.legend;
        }
        (_a = this.legend) === null || _a === void 0 ? void 0 : _a.destroy();
        this.legend = undefined;
        var ctx = this.getModuleContext();
        var legend = legendTypes_1.getLegend(legendType, ctx);
        legend.attachLegend(this.scene.root);
        this.legend = legend;
        this.legendType = legendType;
        return legend;
    };
    Chart.prototype.setLegendInit = function (initLegend) {
        this.applyLegendOptions = initLegend;
    };
    Chart.prototype.updateLegend = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var legendData, legendType, legend;
            return __generator(this, function (_b) {
                legendData = [];
                this.series
                    .filter(function (s) { return s.showInLegend; })
                    .forEach(function (series) {
                    var data = series.getLegendData();
                    legendData.push.apply(legendData, __spreadArray([], __read(data)));
                });
                legendType = legendData.length > 0 ? legendData[0].legendType : 'category';
                legend = this.attachLegend(legendType);
                (_a = this.applyLegendOptions) === null || _a === void 0 ? void 0 : _a.call(this, legend);
                if (legendType === 'category') {
                    this.validateLegendData(legendData);
                }
                legend.data = legendData;
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
                    logger_1.Logger.warnOnce("legend item '" + name + "' has multiple fill colors, this may cause unexpected behaviour.");
                }
            });
        });
    };
    Chart.prototype.performLayout = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, width, height, shrinkRect;
            return __generator(this, function (_b) {
                if (this.scene.root != null) {
                    this.scene.root.visible = true;
                }
                _a = this.scene, width = _a.width, height = _a.height;
                shrinkRect = new bbox_1.BBox(0, 0, width, height);
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
            var captionLineHeight = (_a = caption.lineHeight) !== null && _a !== void 0 ? _a : caption.fontSize * text_1.Text.defaultLineHeightRatio;
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
        var pickModes = exactMatchOnly ? [series_1.SeriesNodePickMode.EXACT_SHAPE_MATCH] : undefined;
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
        this.update(chartUpdateType_1.ChartUpdateType.SCENE_RENDER);
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
            this.update(chartUpdateType_1.ChartUpdateType.SERIES_UPDATE);
            return;
        }
        this.fireEvent({
            type: 'click',
            event: event.sourceEvent,
        });
    };
    Chart.prototype.onDoubleClick = function (event) {
        if (this.checkSeriesNodeDoubleClick(event)) {
            this.update(chartUpdateType_1.ChartUpdateType.SERIES_UPDATE);
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
            var point = datum.series.contentGroup.inverseTransformPoint(x, y);
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
            this.update(chartUpdateType_1.ChartUpdateType.SERIES_UPDATE);
        }
        else {
            this.update(chartUpdateType_1.ChartUpdateType.SERIES_UPDATE, { seriesToUpdate: seriesToUpdate });
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
                        return [4 /*yield*/, async_1.sleep(5)];
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
        proxy_1.ActionOnSet({
            newValue: function (value) {
                this.scene.debug.consoleLog = value;
                if (this.animationManager) {
                    this.animationManager.debug = value;
                }
            },
        })
    ], Chart.prototype, "debug", void 0);
    __decorate([
        proxy_1.ActionOnSet({
            newValue: function (value) {
                if (this.destroyed)
                    return;
                value.appendChild(this.element);
            },
            oldValue: function (value) {
                value.removeChild(this.element);
            },
        })
    ], Chart.prototype, "container", void 0);
    __decorate([
        proxy_1.ActionOnSet({
            newValue: function (value) {
                var _a;
                (_a = this.series) === null || _a === void 0 ? void 0 : _a.forEach(function (series) { return (series.data = value); });
            },
        })
    ], Chart.prototype, "data", void 0);
    __decorate([
        proxy_1.ActionOnSet({
            newValue: function (value) {
                this.resize(value);
            },
        })
    ], Chart.prototype, "width", void 0);
    __decorate([
        proxy_1.ActionOnSet({
            newValue: function (value) {
                this.resize(undefined, value);
            },
        })
    ], Chart.prototype, "height", void 0);
    __decorate([
        proxy_1.ActionOnSet({
            changeValue: function (value) {
                this.autoSizeChanged(value);
            },
        }),
        validation_1.Validate(validation_1.BOOLEAN)
    ], Chart.prototype, "autoSize", void 0);
    __decorate([
        proxy_1.ActionOnSet({
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
        proxy_1.ActionOnSet({
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
        proxy_1.ActionOnSet({
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
        validation_1.Validate(validation_1.STRING_UNION('standalone', 'integrated'))
    ], Chart.prototype, "mode", void 0);
    return Chart;
}(observable_1.Observable));
exports.Chart = Chart;
//# sourceMappingURL=chart.js.map