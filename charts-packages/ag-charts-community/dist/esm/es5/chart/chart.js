var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var Chart = /** @class */ (function (_super) {
    __extends(Chart, _super);
    function Chart(document, overrideDevicePixelRatio) {
        if (document === void 0) { document = window.document; }
        var _this = _super.call(this) || this;
        _this.id = createId(_this);
        _this.options = {};
        _this.userOptions = {};
        _this.background = new Background();
        _this.legend = new Legend();
        _this.legendAutoPadding = new Padding();
        _this._debug = false;
        _this.extraDebugStats = {};
        _this._container = undefined;
        _this._data = [];
        _this._autoSize = false;
        _this.padding = new Padding(20);
        _this._title = undefined;
        _this._subtitle = undefined;
        _this._destroyed = false;
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
                            _b.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.performUpdate(count)];
                        case 1:
                            _b.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            error_1 = _b.sent();
                            this._lastPerformUpdateError = error_1;
                            console.error(error_1);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        });
        _this._axes = [];
        _this._series = [];
        _this.legendBBox = new BBox(0, 0, 0, 0);
        _this._onMouseDown = _this.onMouseDown.bind(_this);
        _this._onMouseMove = _this.onMouseMove.bind(_this);
        _this._onMouseUp = _this.onMouseUp.bind(_this);
        _this._onMouseOut = _this.onMouseOut.bind(_this);
        _this._onClick = _this.onClick.bind(_this);
        _this.lastPointerMeta = undefined;
        _this.pointerScheduler = debouncedAnimationFrame(function () {
            _this.handlePointer(_this.lastPointerMeta);
            _this.lastPointerMeta = undefined;
        });
        _this.pointerInsideLegend = false;
        _this.pointerOverLegendDatum = false;
        var root = new Group({ name: 'root' });
        var background = _this.background;
        background.fill = 'white';
        root.appendChild(background.node);
        var element = (_this.element = document.createElement('div'));
        element.classList.add('ag-chart-wrapper');
        element.style.position = 'relative';
        _this.scene = new Scene({ document: document, overrideDevicePixelRatio: overrideDevicePixelRatio });
        _this.scene.debug.consoleLog = _this._debug;
        _this.scene.root = root;
        _this.scene.container = element;
        _this.autoSize = true;
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
        _this.tooltip = new Tooltip(function () { return _this.scene.canvas.element; }, document, function () { return _this.container; });
        _this.setupDomListeners(_this.scene.canvas.element);
        return _this;
    }
    Object.defineProperty(Chart.prototype, "debug", {
        get: function () {
            return this._debug;
        },
        set: function (value) {
            this._debug = value;
            this.scene.debug.consoleLog = value;
        },
        enumerable: true,
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
        enumerable: true,
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
        enumerable: true,
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
        enumerable: true,
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
        enumerable: true,
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
        enumerable: true,
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
            var _a, _b;
            var root = this.scene.root;
            if (this._title != null) {
                (_a = root) === null || _a === void 0 ? void 0 : _a.removeChild(this._title.node);
            }
            this._title = caption;
            if (this._title != null) {
                (_b = root) === null || _b === void 0 ? void 0 : _b.appendChild(this._title.node);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Chart.prototype, "subtitle", {
        get: function () {
            return this._subtitle;
        },
        set: function (caption) {
            var _a, _b;
            var root = this.scene.root;
            if (this._subtitle != null) {
                (_a = root) === null || _a === void 0 ? void 0 : _a.removeChild(this._subtitle.node);
            }
            this._subtitle = caption;
            if (this._subtitle != null) {
                (_b = root) === null || _b === void 0 ? void 0 : _b.appendChild(this._subtitle.node);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Chart.prototype, "destroyed", {
        get: function () {
            return this._destroyed;
        },
        enumerable: true,
        configurable: true
    });
    Chart.prototype.destroy = function () {
        this._performUpdateType = ChartUpdateType.NONE;
        this._pendingFactoryUpdates.splice(0);
        this.tooltip.destroy();
        SizeMonitor.unobserve(this.element);
        this.container = undefined;
        this.cleanupDomListeners(this.scene.canvas.element);
        this.scene.destroy();
        this.series.forEach(function (s) { return s.destroy(); });
        this.series = [];
        this._destroyed = true;
    };
    Chart.prototype.log = function (opts) {
        if (this.debug) {
            console.log(opts);
        }
    };
    Chart.prototype.togglePointer = function (visible) {
        if (this.tooltip.enabled) {
            this.tooltip.toggle(visible);
        }
        else if (this.lastPick) {
            this.changeHighlightDatum();
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
            var callbacks, e_1;
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
                        e_1 = _a.sent();
                        console.error(e_1);
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
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Chart.prototype, "updatePending", {
        get: function () {
            return this._performUpdateType !== ChartUpdateType.NONE || this.lastPointerMeta != null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Chart.prototype, "lastPerformUpdateError", {
        get: function () {
            return this._lastPerformUpdateError;
        },
        enumerable: true,
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
        var e_2, _a;
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
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (seriesToUpdate_1_1 && !seriesToUpdate_1_1.done && (_a = seriesToUpdate_1.return)) _a.call(seriesToUpdate_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        if (type < this._performUpdateType) {
            this._performUpdateType = type;
            this.performUpdateTrigger.schedule();
        }
    };
    Chart.prototype.performUpdate = function (count) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, performUpdateType, extraDebugStats, splits, _b, count_1, seriesRect_1, seriesUpdates, end;
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
                            case ChartUpdateType.SCENE_RENDER: return [3 /*break*/, 7];
                            case ChartUpdateType.NONE: return [3 /*break*/, 9];
                        }
                        return [3 /*break*/, 10];
                    case 1: return [4 /*yield*/, this.processData()];
                    case 2:
                        _c.sent();
                        splits.push(performance.now());
                        // Disable tooltip/highlight if the data fundamentally shifted.
                        this.disablePointer({ updateProcessing: false });
                        _c.label = 3;
                    case 3:
                        if (this._autoSize && !this._lastAutoSize) {
                            count_1 = this._performUpdateNoRenderCount++;
                            if (count_1 < 5) {
                                // Reschedule if canvas size hasn't been set yet to avoid a race.
                                this._performUpdateType = ChartUpdateType.PERFORM_LAYOUT;
                                this.performUpdateTrigger.schedule();
                                return [3 /*break*/, 10];
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
                    case 7: return [4 /*yield*/, this.scene.render({ debugSplitTimes: splits, extraDebugStats: extraDebugStats })];
                    case 8:
                        _c.sent();
                        this.extraDebugStats = {};
                        _c.label = 9;
                    case 9:
                        // Do nothing.
                        this._performUpdateType = ChartUpdateType.NONE;
                        _c.label = 10;
                    case 10:
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
            this._axes.forEach(function (axis) { return _this.detachAxis(axis); });
            // make linked axes go after the regular ones (simulates stable sort by `linkedTo` property)
            this._axes = values.filter(function (a) { return !a.linkedTo; }).concat(values.filter(function (a) { return a.linkedTo; }));
            this._axes.forEach(function (axis) { return _this.attachAxis(axis); });
        },
        enumerable: true,
        configurable: true
    });
    Chart.prototype.attachAxis = function (axis) {
        this.scene.root.insertBefore(axis.gridlineGroup, this.seriesRoot);
        this.scene.root.insertBefore(axis.axisGroup, this.seriesRoot);
        this.scene.root.insertBefore(axis.crossLineGroup, this.seriesRoot);
    };
    Chart.prototype.detachAxis = function (axis) {
        this.scene.root.removeChild(axis.axisGroup);
        this.scene.root.removeChild(axis.gridlineGroup);
        this.scene.root.removeChild(axis.crossLineGroup);
    };
    Object.defineProperty(Chart.prototype, "series", {
        get: function () {
            return this._series;
        },
        set: function (values) {
            var _this = this;
            this.removeAllSeries();
            values.forEach(function (series) { return _this.addSeries(series); });
        },
        enumerable: true,
        configurable: true
    });
    Chart.prototype.addSeries = function (series, before) {
        var _a = this, allSeries = _a.series, seriesRoot = _a.seriesRoot;
        var canAdd = allSeries.indexOf(series) < 0;
        if (canAdd) {
            var beforeIndex = before ? allSeries.indexOf(before) : -1;
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
    };
    Chart.prototype.initSeries = function (series) {
        series.chart = this;
        if (!series.data) {
            series.data = this.data;
        }
        series.addEventListener('nodeClick', this.onSeriesNodeClick, this);
    };
    Chart.prototype.freeSeries = function (series) {
        series.chart = undefined;
        series.removeEventListener('nodeClick', this.onSeriesNodeClick, this);
    };
    Chart.prototype.addSeriesAfter = function (series, after) {
        var _a = this, allSeries = _a.series, seriesRoot = _a.seriesRoot;
        var canAdd = allSeries.indexOf(series) < 0;
        if (canAdd) {
            var afterIndex = after ? this.series.indexOf(after) : -1;
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
    };
    Chart.prototype.removeSeries = function (series) {
        var index = this.series.indexOf(series);
        if (index >= 0) {
            this.series.splice(index, 1);
            this.freeSeries(series);
            this.seriesRoot.removeChild(series.group);
            return true;
        }
        return false;
    };
    Chart.prototype.removeAllSeries = function () {
        var _this = this;
        this.series.forEach(function (series) {
            _this.freeSeries(series);
            _this.seriesRoot.removeChild(series.group);
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
        var e_3, _a, e_4, _b;
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
                    for (var directionKeys_1 = (e_4 = void 0, __values(directionKeys)), directionKeys_1_1 = directionKeys_1.next(); !directionKeys_1_1.done; directionKeys_1_1 = directionKeys_1.next()) {
                        var directionKey = directionKeys_1_1.value;
                        if (axisKeys.indexOf(directionKey) >= 0) {
                            return axis;
                        }
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (directionKeys_1_1 && !directionKeys_1_1.done && (_b = directionKeys_1.return)) _b.call(directionKeys_1);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (directionAxes_1_1 && !directionAxes_1_1.done && (_a = directionAxes_1.return)) _a.call(directionAxes_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
    };
    Chart.prototype.resize = function (width, height) {
        if (this.scene.resize(width, height)) {
            this.background.width = this.width;
            this.background.height = this.height;
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
        var e_5, _a;
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
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_5) throw e_5.error; }
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
    Chart.prototype.positionCaptions = function () {
        var _a = this, title = _a._title, subtitle = _a._subtitle;
        var spacing = 10;
        var paddingTop = spacing;
        if (!title) {
            return {};
        }
        title.node.visible = title.enabled;
        if (title.enabled) {
            title.node.x = this.width / 2;
            title.node.y = paddingTop;
            var titleBBox = title.node.computeBBox(); // make sure to set node's x/y, then computeBBox
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
            var subtitleBBox = subtitle.node.computeBBox();
            if (subtitleBBox) {
                paddingTop = subtitleBBox.y + subtitleBBox.height;
            }
        }
        return { captionAutoPadding: Math.floor(paddingTop) };
    };
    Chart.prototype.positionLegend = function (captionAutoPadding) {
        var _a = this, legend = _a.legend, legendAutoPadding = _a.legendAutoPadding;
        legendAutoPadding.clear();
        if (!legend.enabled || !legend.data.length) {
            return;
        }
        var width = this.width;
        var height = this.height - captionAutoPadding;
        var legendGroup = legend.group;
        var legendSpacing = legend.spacing;
        var translationX = 0;
        var translationY = 0;
        var legendBBox;
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
    };
    Chart.prototype.setupDomListeners = function (chartElement) {
        chartElement.addEventListener('mousedown', this._onMouseDown);
        chartElement.addEventListener('mousemove', this._onMouseMove);
        chartElement.addEventListener('mouseup', this._onMouseUp);
        chartElement.addEventListener('mouseout', this._onMouseOut);
        chartElement.addEventListener('click', this._onClick);
    };
    Chart.prototype.cleanupDomListeners = function (chartElement) {
        chartElement.removeEventListener('mousedown', this._onMouseDown);
        chartElement.removeEventListener('mousemove', this._onMouseMove);
        chartElement.removeEventListener('mouseup', this._onMouseUp);
        chartElement.removeEventListener('mouseout', this._onMouseOut);
        chartElement.removeEventListener('click', this._onClick);
    };
    Chart.prototype.getSeriesRect = function () {
        return this.seriesRect;
    };
    // x/y are local canvas coordinates in CSS pixels, not actual pixels
    Chart.prototype.pickSeriesNode = function (point) {
        var e_6, _a;
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
                if (!series.visible || !series.group.visible) {
                    continue;
                }
                var _d = (_b = series.pickNode(point, pickModes), (_b !== null && _b !== void 0 ? _b : {})), match = _d.match, distance = _d.distance;
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
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (reverseSeries_1_1 && !reverseSeries_1_1.done && (_a = reverseSeries_1.return)) _a.call(reverseSeries_1);
            }
            finally { if (e_6) throw e_6.error; }
        }
        this.extraDebugStats['pickSeriesNode'] = Math.round((_c = this.extraDebugStats['pickSeriesNode'], (_c !== null && _c !== void 0 ? _c : 0)) + (performance.now() - start));
        return result;
    };
    Chart.prototype.onMouseMove = function (event) {
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
            event: event,
        };
        this.pointerScheduler.schedule();
        this.extraDebugStats['mouseX'] = event.offsetX;
        this.extraDebugStats['mouseY'] = event.offsetY;
        this.update(ChartUpdateType.SCENE_RENDER);
    };
    Chart.prototype.disablePointer = function (_a) {
        var _b = (_a === void 0 ? {} : _a).updateProcessing, updateProcessing = _b === void 0 ? true : _b;
        this.changeHighlightDatum(undefined, { updateProcessing: updateProcessing });
        this.togglePointer(false);
    };
    Chart.prototype.handlePointer = function (meta) {
        var _this = this;
        var lastPick = this.lastPick;
        var offsetX = meta.offsetX, offsetY = meta.offsetY;
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
        if (!lastPick || lastPick.datum !== pick.datum) {
            this.onSeriesDatumPick(meta, pick.datum);
            return;
        }
        lastPick.event = meta.event;
        if (this.tooltip.enabled && pick.series.tooltip.enabled) {
            this.tooltip.show(this.mergePointerDatum(meta, pick.datum));
        }
    };
    Chart.prototype.onMouseDown = function (_event) {
        // Override point for subclasses.
    };
    Chart.prototype.onMouseUp = function (_event) {
        // Override point for subclasses.
    };
    Chart.prototype.onMouseOut = function (_event) {
        this.togglePointer(false);
    };
    Chart.prototype.onClick = function (event) {
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
            event: event,
        });
    };
    Chart.prototype.checkSeriesNodeClick = function () {
        var lastPick = this.lastPick;
        if (lastPick && lastPick.event) {
            var event_1 = lastPick.event, datum = lastPick.datum;
            datum.series.fireNodeClickEvent(event_1, datum);
            return true;
        }
        return false;
    };
    Chart.prototype.onSeriesNodeClick = function (event) {
        var seriesNodeClickEvent = __assign(__assign({}, event), { type: 'seriesNodeClick' });
        Object.defineProperty(seriesNodeClickEvent, 'series', {
            enumerable: false,
            // Should display the deprecation warning
            get: function () { return event.series; },
        });
        this.fireEvent(seriesNodeClickEvent);
    };
    Chart.prototype.checkLegendClick = function (event) {
        var _a;
        var _b = this, legend = _b.legend, legendItemClick = _b.legend.listeners.legendItemClick;
        var datum = legend.getDatumForPoint(event.offsetX, event.offsetY);
        if (!datum) {
            return false;
        }
        var id = datum.id, itemId = datum.itemId, enabled = datum.enabled;
        var series = find(this.series, function (s) { return s.id === id; });
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
                series: series,
                itemId: itemId,
                datum: undefined,
            };
        }
        legendItemClick({ enabled: !enabled, itemId: itemId, seriesId: series.id });
        return true;
    };
    Chart.prototype.handleLegendMouseMove = function (event) {
        if (!this.legend.enabled) {
            return;
        }
        var offsetX = event.offsetX, offsetY = event.offsetY;
        var datum = this.legend.getDatumForPoint(offsetX, offsetY);
        var pointerInsideLegend = this.legendBBox.containsPoint(offsetX, offsetY);
        var pointerOverLegendDatum = pointerInsideLegend && datum !== undefined;
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
        var oldHighlightedDatum = this.highlightedDatum;
        if (datum) {
            var id_1 = datum.id, itemId = datum.itemId, enabled = datum.enabled;
            if (enabled) {
                var series = find(this.series, function (series) { return series.id === id_1; });
                if (series) {
                    this.highlightedDatum = {
                        series: series,
                        itemId: itemId,
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
    };
    Chart.prototype.onSeriesDatumPick = function (meta, datum) {
        var lastPick = this.lastPick;
        if (lastPick) {
            if (lastPick.datum === datum) {
                return;
            }
        }
        this.changeHighlightDatum({
            datum: datum,
            event: meta.event,
        });
        if (datum) {
            meta = this.mergePointerDatum(meta, datum);
        }
        var tooltipEnabled = this.tooltip.enabled && datum.series.tooltip.enabled;
        var html = tooltipEnabled && datum.series.getTooltipHtml(datum);
        if (html) {
            this.tooltip.show(meta, html);
        }
    };
    Chart.prototype.mergePointerDatum = function (meta, datum) {
        if (datum.point) {
            var _a = datum.point, x = _a.x, y = _a.y;
            var canvas = this.scene.canvas;
            var point = datum.series.group.inverseTransformPoint(x, y);
            var canvasRect = canvas.element.getBoundingClientRect();
            return __assign(__assign({}, meta), { pageX: Math.round(canvasRect.left + window.scrollX + point.x), pageY: Math.round(canvasRect.top + window.scrollY + point.y), offsetX: Math.round(canvasRect.left + point.y), offsetY: Math.round(canvasRect.top + point.y) });
        }
        return meta;
    };
    Chart.prototype.changeHighlightDatum = function (newPick, opts) {
        var _a = (opts !== null && opts !== void 0 ? opts : {}).updateProcessing, updateProcessing = _a === void 0 ? true : _a;
        var seriesToUpdate = new Set();
        var _b = newPick || {}, _c = _b.datum, _d = (_c === void 0 ? {} : _c).series, newSeries = _d === void 0 ? undefined : _d, _e = _b.datum, datum = _e === void 0 ? undefined : _e;
        var _f = this.lastPick, _g = (_f === void 0 ? {} : _f).datum, _h = (_g === void 0 ? {} : _g).series, lastSeries = _h === void 0 ? undefined : _h;
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
    return Chart;
}(Observable));
export { Chart };
