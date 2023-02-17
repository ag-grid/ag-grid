var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
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
import { doOnce } from '../util/function';
import { Tooltip } from './tooltip/tooltip';
import { InteractionManager } from './interaction/interactionManager';
import { jsonMerge } from '../util/json';
import { ClipRect } from '../scene/clipRect';
import { Layers } from './layers';
import { CursorManager } from './interaction/cursorManager';
import { HighlightManager } from './interaction/highlightManager';
import { TooltipManager } from './interaction/tooltipManager';
import { ZoomManager } from './interaction/zoomManager';
import { LayoutService } from './layout/layoutService';
import { ChartUpdateType } from './chartUpdateType';
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
        _this.seriesRoot = new ClipRect();
        _this.background = new Background();
        _this._debug = false;
        _this.extraDebugStats = {};
        _this._container = undefined;
        _this._data = [];
        _this._autoSize = false;
        _this.padding = new Padding(20);
        _this._title = undefined;
        _this._subtitle = undefined;
        _this.mode = 'standalone';
        _this._destroyed = false;
        _this.modules = {};
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
                            console.error(error_1);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        });
        _this._axes = [];
        _this._series = [];
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
        var scene = resources === null || resources === void 0 ? void 0 : resources.scene;
        var element = (_a = resources === null || resources === void 0 ? void 0 : resources.element) !== null && _a !== void 0 ? _a : document.createElement('div');
        var container = resources === null || resources === void 0 ? void 0 : resources.container;
        var root = new Group({ name: 'root' });
        // Prevent the scene from rendering chart components in an invalid state
        // (before first layout is performed).
        root.visible = false;
        root.append(_this.seriesRoot);
        var background = _this.background;
        background.fill = 'white';
        root.appendChild(background.node);
        _this.axisGroup = new Group({ name: 'Axes', layer: true, zIndex: Layers.AXIS_ZINDEX });
        root.appendChild(_this.axisGroup);
        _this.element = element;
        element.classList.add('ag-chart-wrapper');
        element.style.position = 'relative';
        _this.scene = scene !== null && scene !== void 0 ? scene : new Scene({ document: document, overrideDevicePixelRatio: overrideDevicePixelRatio });
        _this.scene.debug.consoleLog = _this._debug;
        _this.scene.root = root;
        _this.scene.container = element;
        _this.autoSize = true;
        _this.interactionManager = new InteractionManager(element);
        _this.cursorManager = new CursorManager(element);
        _this.highlightManager = new HighlightManager();
        _this.zoomManager = new ZoomManager();
        _this.layoutService = new LayoutService();
        background.width = _this.scene.width;
        background.height = _this.scene.height;
        SizeMonitor.observe(_this.element, function (size) {
            var width = size.width, height = size.height;
            if (!_this.autoSize) {
                return;
            }
            if (width === 0 && height === 0) {
                return;
            }
            if (width === _this.width && height === _this.height) {
                return;
            }
            _this._lastAutoSize = [width, height];
            _this.resize(width, height);
        });
        _this.tooltip = new Tooltip(_this.scene.canvas.element, document, document.body);
        _this.tooltipManager = new TooltipManager(_this.tooltip);
        _this.legend = new Legend(_this, _this.interactionManager, _this.cursorManager, _this.highlightManager, _this.tooltipManager);
        _this.container = container;
        // Add interaction listeners last so child components are registered first.
        _this.interactionManager.addListener('click', function (event) { return _this.onClick(event); });
        _this.interactionManager.addListener('hover', function (event) { return _this.onMouseMove(event); });
        _this.interactionManager.addListener('leave', function () { return _this.disablePointer(); });
        _this.interactionManager.addListener('page-left', function () { return _this.destroy(); });
        _this.zoomManager.addListener('zoom-change', function (_) {
            return _this.update(ChartUpdateType.PROCESS_DATA, { forceNodeDataRefresh: true });
        });
        _this.highlightManager.addListener('highlight-change', function (event) { return _this.changeHighlightDatum(event); });
        return _this;
    }
    Chart.prototype.getOptions = function () {
        var _a;
        var queuedUserOptions = this.queuedUserOptions;
        var lastUpdateOptions = (_a = queuedUserOptions[queuedUserOptions.length - 1]) !== null && _a !== void 0 ? _a : this.userOptions;
        return jsonMerge([lastUpdateOptions]);
    };
    Object.defineProperty(Chart.prototype, "debug", {
        get: function () {
            return this._debug;
        },
        set: function (value) {
            this._debug = value;
            this.scene.debug.consoleLog = value;
        },
        enumerable: false,
        configurable: true
    });
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
    Object.defineProperty(Chart.prototype, "data", {
        get: function () {
            return this._data;
        },
        set: function (data) {
            this._data = data;
            this.series.forEach(function (series) { return (series.data = data); });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Chart.prototype, "width", {
        get: function () {
            return this.scene.width;
        },
        set: function (value) {
            this.autoSize = false;
            if (this.width !== value) {
                this.resize(value, this.height);
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Chart.prototype, "height", {
        get: function () {
            return this.scene.height;
        },
        set: function (value) {
            this.autoSize = false;
            if (this.height !== value) {
                this.resize(this.width, value);
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Chart.prototype, "autoSize", {
        get: function () {
            return this._autoSize;
        },
        set: function (value) {
            if (this._autoSize === value) {
                return;
            }
            this._autoSize = value;
            var style = this.element.style;
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
        },
        enumerable: false,
        configurable: true
    });
    Chart.prototype.download = function (fileName, fileFormat) {
        this.scene.download(fileName, fileFormat);
    };
    Object.defineProperty(Chart.prototype, "title", {
        get: function () {
            return this._title;
        },
        set: function (caption) {
            var root = this.scene.root;
            if (this._title != null) {
                root === null || root === void 0 ? void 0 : root.removeChild(this._title.node);
            }
            this._title = caption;
            if (this._title != null) {
                root === null || root === void 0 ? void 0 : root.appendChild(this._title.node);
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Chart.prototype, "subtitle", {
        get: function () {
            return this._subtitle;
        },
        set: function (caption) {
            var root = this.scene.root;
            if (this._subtitle != null) {
                root === null || root === void 0 ? void 0 : root.removeChild(this._subtitle.node);
            }
            this._subtitle = caption;
            if (this._subtitle != null) {
                root === null || root === void 0 ? void 0 : root.appendChild(this._subtitle.node);
            }
        },
        enumerable: false,
        configurable: true
    });
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
        var _a = this, scene = _a.scene, interactionManager = _a.interactionManager, zoomManager = _a.zoomManager, cursorManager = _a.cursorManager, highlightManager = _a.highlightManager, tooltipManager = _a.tooltipManager, layoutService = _a.layoutService;
        var moduleMeta = module.initialiseModule({
            scene: scene,
            interactionManager: interactionManager,
            zoomManager: zoomManager,
            cursorManager: cursorManager,
            highlightManager: highlightManager,
            tooltipManager: tooltipManager,
            layoutService: layoutService,
        });
        this.modules[module.optionsKey] = moduleMeta;
        this[module.optionsKey] = moduleMeta.instance;
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
    Chart.prototype.destroy = function (opts) {
        var e_1, _a;
        if (this._destroyed) {
            return;
        }
        var keepTransferableResources = opts === null || opts === void 0 ? void 0 : opts.keepTransferableResources;
        var result = undefined;
        this._performUpdateType = ChartUpdateType.NONE;
        this._pendingFactoryUpdates.splice(0);
        this.tooltip.destroy();
        SizeMonitor.unobserve(this.element);
        try {
            for (var _b = __values(Object.entries(this.modules)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), key = _d[0], module = _d[1];
                module.instance.destroy();
                delete this.modules[key];
                delete this[key];
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
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
        this._destroyed = true;
        return result;
    };
    Chart.prototype.log = function (opts) {
        if (this.debug) {
            console.log(opts);
        }
    };
    Chart.prototype.disablePointer = function (highlightOnly) {
        if (highlightOnly === void 0) { highlightOnly = false; }
        if (!highlightOnly) {
            this.tooltipManager.updateTooltip(this.id);
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
            this._processCallbacks();
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
                        return [3 /*break*/, 6];
                    case 5:
                        e_2 = _a.sent();
                        console.error(e_2);
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
        var _b = opts || {}, _c = _b.forceNodeDataRefresh, forceNodeDataRefresh = _c === void 0 ? false : _c, _d = _b.seriesToUpdate, seriesToUpdate = _d === void 0 ? this.series : _d;
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
        return __awaiter(this, void 0, void 0, function () {
            var _a, performUpdateType, extraDebugStats, splits, _b, count_1, seriesRect_1, seriesUpdates, tooltipMeta, end;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this, performUpdateType = _a._performUpdateType, extraDebugStats = _a.extraDebugStats;
                        splits = [performance.now()];
                        _b = performUpdateType;
                        switch (_b) {
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
                        _c.sent();
                        this.disablePointer(true);
                        splits.push(performance.now());
                        _c.label = 3;
                    case 3:
                        if (this._autoSize && !this._lastAutoSize) {
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
                        _c.sent();
                        splits.push(performance.now());
                        _c.label = 5;
                    case 5:
                        seriesRect_1 = this.seriesRect;
                        seriesUpdates = __spread(this.seriesToUpdate).map(function (series) { return series.update({ seriesRect: seriesRect_1 }); });
                        this.seriesToUpdate.clear();
                        return [4 /*yield*/, Promise.all(seriesUpdates)];
                    case 6:
                        _c.sent();
                        splits.push(performance.now());
                        _c.label = 7;
                    case 7:
                        tooltipMeta = this.tooltipManager.getTooltipMeta(this.id);
                        if (performUpdateType < ChartUpdateType.SERIES_UPDATE && tooltipMeta != null) {
                            this.handlePointer(tooltipMeta);
                        }
                        _c.label = 8;
                    case 8: return [4 /*yield*/, this.scene.render({ debugSplitTimes: splits, extraDebugStats: extraDebugStats })];
                    case 9:
                        _c.sent();
                        this.extraDebugStats = {};
                        _c.label = 10;
                    case 10:
                        // Do nothing.
                        this._performUpdateType = ChartUpdateType.NONE;
                        _c.label = 11;
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
            this._axes.forEach(function (axis) { return axis.detachAxis(_this.axisGroup); });
            // make linked axes go after the regular ones (simulates stable sort by `linkedTo` property)
            this._axes = values.filter(function (a) { return !a.linkedTo; }).concat(values.filter(function (a) { return a.linkedTo; }));
            this._axes.forEach(function (axis) { return axis.attachAxis(_this.axisGroup); });
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
        if (!series.data) {
            series.data = this.data;
        }
        series.addEventListener('nodeClick', this.onSeriesNodeClick);
    };
    Chart.prototype.freeSeries = function (series) {
        series.chart = undefined;
        series.removeEventListener('nodeClick', this.onSeriesNodeClick);
    };
    Chart.prototype.removeAllSeries = function () {
        var _this = this;
        this.series.forEach(function (series) {
            _this.freeSeries(series);
            _this.seriesRoot.removeChild(series.rootGroup);
        });
        this._series = []; // using `_series` instead of `series` to prevent infinite recursion
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
            var direction = axis.direction;
            var directionAxes = directionToAxesMap[direction] || (directionToAxesMap[direction] = []);
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
                    console.warn("AG Charts - no available axis for direction [" + direction + "]; check series and axes configuration.");
                    return;
                }
                var seriesKeys = series.getKeys(direction);
                var newAxis = _this.findMatchingAxis(directionAxes, series.getKeys(direction));
                if (!newAxis) {
                    console.warn("AG Charts - no matching axis for direction [" + direction + "] and keys [" + seriesKeys + "]; check series and axes configuration.");
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
        if (this.scene.resize(width, height)) {
            this.background.width = this.width;
            this.background.height = this.height;
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
    Chart.prototype.updateLegend = function () {
        return __awaiter(this, void 0, void 0, function () {
            var legendData, formatter;
            return __generator(this, function (_a) {
                legendData = [];
                this.series
                    .filter(function (s) { return s.showInLegend; })
                    .forEach(function (series) {
                    legendData.push.apply(legendData, __spread(series.getLegendData()));
                });
                formatter = this.legend.item.label.formatter;
                if (formatter) {
                    legendData.forEach(function (datum) {
                        return (datum.label.text = formatter({
                            get id() {
                                doOnce(function () {
                                    return console.warn("AG Charts - LegendLabelFormatterParams.id is deprecated, use seriesId instead", datum);
                                }, "LegendLabelFormatterParams.id deprecated");
                                return datum.seriesId;
                            },
                            itemId: datum.itemId,
                            value: datum.label.text,
                            seriesId: datum.seriesId,
                        }));
                    });
                }
                this.legend.data = legendData;
                return [2 /*return*/];
            });
        });
    };
    Chart.prototype.positionCaptions = function (shrinkRect) {
        var _a = this, title = _a._title, subtitle = _a._subtitle;
        var newShrinkRect = shrinkRect.clone();
        var positionAndShrinkBBox = function (caption) {
            var _a;
            var baseY = newShrinkRect.y;
            caption.node.x = newShrinkRect.x + newShrinkRect.width / 2;
            caption.node.y = baseY;
            var bbox = caption.node.computeBBox();
            // As the bbox (x,y) ends up at a different location than specified above, we need to
            // take it into consideration when calculating how much space needs to be reserved to
            // accommodate the caption.
            var bboxHeight = Math.ceil(bbox.y - baseY + bbox.height + ((_a = caption.spacing) !== null && _a !== void 0 ? _a : 0));
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
    };
    Chart.prototype.positionLegend = function (shrinkRect) {
        var legend = this.legend;
        var newShrinkRect = shrinkRect.clone();
        if (!legend.enabled || !legend.data.length) {
            return newShrinkRect;
        }
        var _a = __read(this.calculateLegendDimensions(shrinkRect), 2), legendWidth = _a[0], legendHeight = _a[1];
        var translationX = 0;
        var translationY = 0;
        legend.translationX = 0;
        legend.translationY = 0;
        legend.performLayout(legendWidth, legendHeight);
        var legendBBox = legend.computePagedBBox();
        var calculateTranslationPerpendicularDimension = function () {
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
    };
    Chart.prototype.calculateLegendDimensions = function (shrinkRect) {
        var legend = this.legend;
        var width = shrinkRect.width, height = shrinkRect.height;
        var aspectRatio = width / height;
        var maxCoefficient = 0.5;
        var minHeightCoefficient = 0.2;
        var minWidthCoefficient = 0.25;
        var legendWidth = 0;
        var legendHeight = 0;
        switch (legend.position) {
            case 'top':
            case 'bottom':
                // A horizontal legend should take maximum between 20 to 50 percent of the chart height if height is larger than width
                // and maximum 20 percent of the chart height if height is smaller than width.
                var heightCoefficient = aspectRatio < 1
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
                var widthCoefficient = aspectRatio > 1 ? Math.min(maxCoefficient, minWidthCoefficient * aspectRatio) : minWidthCoefficient;
                legendWidth = legend.maxWidth ? Math.min(legend.maxWidth, width) : Math.round(width * widthCoefficient);
                legendHeight = legend.maxHeight ? Math.min(legend.maxHeight, height) : height;
        }
        return [legendWidth, legendHeight];
    };
    Chart.prototype.getSeriesRect = function () {
        return this.seriesRect;
    };
    // x/y are local canvas coordinates in CSS pixels, not actual pixels
    Chart.prototype.pickSeriesNode = function (point) {
        var e_7, _a;
        var _b, _c;
        var tracking = this.tooltip.tracking;
        var start = performance.now();
        // Disable 'nearest match' options if tooltip.tracking is enabled.
        var pickModes = tracking ? undefined : [SeriesNodePickMode.EXACT_SHAPE_MATCH];
        // Iterate through series in reverse, as later declared series appears on top of earlier
        // declared series.
        var reverseSeries = __spread(this.series).reverse();
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
                if (!result || result.distance > distance) {
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
    Chart.prototype.handlePointer = function (event) {
        var _this = this;
        var lastPick = this.lastPick;
        var pageX = event.pageX, pageY = event.pageY, offsetX = event.offsetX, offsetY = event.offsetY;
        var disablePointer = function () {
            if (lastPick) {
                // Cursor moved from a non-marker node to empty space.
                _this.disablePointer();
            }
        };
        if (!(this.seriesRect && this.seriesRect.containsPoint(offsetX, offsetY))) {
            disablePointer();
            return;
        }
        var pick = this.pickSeriesNode({ x: offsetX, y: offsetY });
        if (!pick) {
            disablePointer();
            return;
        }
        var meta = { pageX: pageX, pageY: pageY, offsetX: offsetX, offsetY: offsetY, event: event.sourceEvent };
        if (!lastPick || lastPick.datum !== pick.datum) {
            this.onSeriesDatumPick(meta, pick.datum);
            return;
        }
        lastPick.event = event.sourceEvent;
        if (this.tooltip.enabled && pick.series.tooltip.enabled) {
            this.tooltipManager.updateTooltip(this.id, this.mergePointerDatum(meta, pick.datum));
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
    Chart.prototype.checkSeriesNodeClick = function (event) {
        var lastPick = this.lastPick;
        if (lastPick === null || lastPick === void 0 ? void 0 : lastPick.datum) {
            var datum = lastPick.datum;
            datum.series.fireNodeClickEvent(event.sourceEvent, datum);
            return true;
        }
        else if (event.sourceEvent.type.startsWith('touch')) {
            var pick = this.pickSeriesNode({ x: event.offsetX, y: event.offsetY });
            if (pick) {
                pick.series.fireNodeClickEvent(event.sourceEvent, pick.datum);
                return true;
            }
        }
        return false;
    };
    Chart.prototype.onSeriesDatumPick = function (meta, datum) {
        var lastPick = this.lastPick;
        if (lastPick) {
            if (lastPick.datum === datum) {
                return;
            }
        }
        this.highlightManager.updateHighlight(this.id, datum);
        if (datum) {
            meta = this.mergePointerDatum(meta, datum);
        }
        var tooltipEnabled = this.tooltip.enabled && datum.series.tooltip.enabled;
        var html = tooltipEnabled && datum.series.getTooltipHtml(datum);
        if (html) {
            this.tooltipManager.updateTooltip(this.id, meta, html);
        }
    };
    Chart.prototype.mergePointerDatum = function (meta, datum) {
        if (datum.point) {
            var _a = datum.point, x = _a.x, y = _a.y;
            var canvas = this.scene.canvas;
            var point = datum.series.rootGroup.inverseTransformPoint(x, y);
            var canvasRect = canvas.element.getBoundingClientRect();
            return __assign(__assign({}, meta), { pageX: Math.round(canvasRect.left + window.scrollX + point.x), pageY: Math.round(canvasRect.top + window.scrollY + point.y), offsetX: Math.round(point.x), offsetY: Math.round(point.y) });
        }
        return meta;
    };
    Chart.prototype.changeHighlightDatum = function (event) {
        var seriesToUpdate = new Set();
        var _a = event.currentHighlight || {}, _b = _a.series, newSeries = _b === void 0 ? undefined : _b, newDatum = _a.datum;
        var _c = event.previousHighlight || {}, _d = _c.series, lastSeries = _d === void 0 ? undefined : _d, lastDatum = _c.datum;
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
    __decorate([
        Validate(BOOLEAN)
    ], Chart.prototype, "_autoSize", void 0);
    __decorate([
        Validate(STRING_UNION('standalone', 'integrated'))
    ], Chart.prototype, "mode", void 0);
    return Chart;
}(Observable));
export { Chart };
