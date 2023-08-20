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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartesianSeriesMarker = exports.CartesianSeries = exports.CartesianSeriesNodeDoubleClickEvent = exports.CartesianSeriesNodeClickEvent = exports.CartesianSeriesNodeBaseClickEvent = void 0;
var series_1 = require("../series");
var seriesMarker_1 = require("../seriesMarker");
var value_1 = require("../../../util/value");
var path_1 = require("../../../scene/shape/path");
var selection_1 = require("../../../scene/selection");
var group_1 = require("../../../scene/group");
var text_1 = require("../../../scene/shape/text");
var changeDetectable_1 = require("../../../scene/changeDetectable");
var categoryAxis_1 = require("../../axis/categoryAxis");
var layers_1 = require("../../layers");
var validation_1 = require("../../../util/validation");
var json_1 = require("../../../util/json");
var chartAxisDirection_1 = require("../../chartAxisDirection");
var util_1 = require("../../marker/util");
var states_1 = require("../../../motion/states");
var logger_1 = require("../../../util/logger");
var DEFAULT_DIRECTION_KEYS = (_a = {},
    _a[chartAxisDirection_1.ChartAxisDirection.X] = ['xKey'],
    _a[chartAxisDirection_1.ChartAxisDirection.Y] = ['yKey'],
    _a);
var DEFAULT_DIRECTION_NAMES = (_b = {},
    _b[chartAxisDirection_1.ChartAxisDirection.X] = ['xName'],
    _b[chartAxisDirection_1.ChartAxisDirection.Y] = ['yName'],
    _b);
var CartesianSeriesNodeBaseClickEvent = /** @class */ (function (_super) {
    __extends(CartesianSeriesNodeBaseClickEvent, _super);
    function CartesianSeriesNodeBaseClickEvent(xKey, yKey, nativeEvent, datum, series) {
        var _this = _super.call(this, nativeEvent, datum, series) || this;
        _this.xKey = xKey;
        _this.yKey = yKey;
        return _this;
    }
    return CartesianSeriesNodeBaseClickEvent;
}(series_1.SeriesNodeBaseClickEvent));
exports.CartesianSeriesNodeBaseClickEvent = CartesianSeriesNodeBaseClickEvent;
var CartesianSeriesNodeClickEvent = /** @class */ (function (_super) {
    __extends(CartesianSeriesNodeClickEvent, _super);
    function CartesianSeriesNodeClickEvent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'nodeClick';
        return _this;
    }
    return CartesianSeriesNodeClickEvent;
}(CartesianSeriesNodeBaseClickEvent));
exports.CartesianSeriesNodeClickEvent = CartesianSeriesNodeClickEvent;
var CartesianSeriesNodeDoubleClickEvent = /** @class */ (function (_super) {
    __extends(CartesianSeriesNodeDoubleClickEvent, _super);
    function CartesianSeriesNodeDoubleClickEvent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'nodeDoubleClick';
        return _this;
    }
    return CartesianSeriesNodeDoubleClickEvent;
}(CartesianSeriesNodeBaseClickEvent));
exports.CartesianSeriesNodeDoubleClickEvent = CartesianSeriesNodeDoubleClickEvent;
var CartesianStateMachine = /** @class */ (function (_super) {
    __extends(CartesianStateMachine, _super);
    function CartesianStateMachine() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return CartesianStateMachine;
}(states_1.StateMachine));
var CartesianSeries = /** @class */ (function (_super) {
    __extends(CartesianSeries, _super);
    function CartesianSeries(opts) {
        var _this = _super.call(this, __assign(__assign({}, opts), { useSeriesGroupLayer: true, directionKeys: DEFAULT_DIRECTION_KEYS, directionNames: DEFAULT_DIRECTION_NAMES })) || this;
        _this.legendItemName = undefined;
        _this._contextNodeData = [];
        _this.nodeDataDependencies = {};
        _this.highlightSelection = selection_1.Selection.select(_this.highlightNode, function () {
            return _this.opts.hasMarkers ? _this.markerFactory() : _this.nodeFactory();
        });
        _this.highlightLabelSelection = selection_1.Selection.select(_this.highlightLabel, text_1.Text);
        _this.subGroups = [];
        _this.subGroupId = 0;
        _this.datumSelectionGarbageCollection = true;
        var _a = opts.pathsPerSeries, pathsPerSeries = _a === void 0 ? 1 : _a, _b = opts.hasMarkers, hasMarkers = _b === void 0 ? false : _b, _c = opts.hasHighlightedLabels, hasHighlightedLabels = _c === void 0 ? false : _c, _d = opts.pathsZIndexSubOrderOffset, pathsZIndexSubOrderOffset = _d === void 0 ? [] : _d;
        _this.opts = { pathsPerSeries: pathsPerSeries, hasMarkers: hasMarkers, hasHighlightedLabels: hasHighlightedLabels, pathsZIndexSubOrderOffset: pathsZIndexSubOrderOffset };
        _this.animationState = new CartesianStateMachine('empty', {
            empty: {
                on: {
                    update: {
                        target: 'ready',
                        action: function (data) { return _this.animateEmptyUpdateReady(data); },
                    },
                },
            },
            ready: {
                on: {
                    updateData: {
                        target: 'waiting',
                        action: function () { },
                    },
                    update: {
                        target: 'ready',
                        action: function (data) { return _this.animateReadyUpdate(data); },
                    },
                    highlight: {
                        target: 'ready',
                        action: function (data) { return _this.animateReadyHighlight(data); },
                    },
                    highlightMarkers: {
                        target: 'ready',
                        action: function (data) { return _this.animateReadyHighlightMarkers(data); },
                    },
                    resize: {
                        target: 'ready',
                        action: function (data) { return _this.animateReadyResize(data); },
                    },
                },
            },
            waiting: {
                on: {
                    update: {
                        target: 'ready',
                        action: function (data) { return _this.animateWaitingUpdateReady(data); },
                    },
                },
            },
        });
        return _this;
    }
    Object.defineProperty(CartesianSeries.prototype, "contextNodeData", {
        get: function () {
            var _a;
            return (_a = this._contextNodeData) === null || _a === void 0 ? void 0 : _a.slice();
        },
        enumerable: false,
        configurable: true
    });
    CartesianSeries.prototype.addChartEventListeners = function () {
        var _this = this;
        var _a, _b;
        (_a = this.ctx.chartEventManager) === null || _a === void 0 ? void 0 : _a.addListener('legend-item-click', function (event) { return _this.onLegendItemClick(event); });
        (_b = this.ctx.chartEventManager) === null || _b === void 0 ? void 0 : _b.addListener('legend-item-double-click', function (event) {
            return _this.onLegendItemDoubleClick(event);
        });
    };
    CartesianSeries.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this._contextNodeData.splice(0, this._contextNodeData.length);
        this.subGroups.splice(0, this.subGroups.length);
    };
    /**
     * Note: we are passing `isContinuousX` and `isContinuousY` into this method because it will
     *       typically be called inside a loop and this check only needs to happen once.
     * @param x A domain value to be plotted along the x-axis.
     * @param y A domain value to be plotted along the y-axis.
     * @param isContinuousX Typically this will be the value of `xAxis.scale instanceof ContinuousScale`.
     * @param isContinuousY Typically this will be the value of `yAxis.scale instanceof ContinuousScale`.
     * @returns `[x, y]`, if both x and y are valid domain values for their respective axes/scales, or `undefined`.
     */
    CartesianSeries.prototype.checkDomainXY = function (x, y, isContinuousX, isContinuousY) {
        var isValidDatum = ((isContinuousX && value_1.isContinuous(x)) || (!isContinuousX && value_1.isDiscrete(x))) &&
            ((isContinuousY && value_1.isContinuous(y)) || (!isContinuousY && value_1.isDiscrete(y)));
        return isValidDatum ? [x, y] : undefined;
    };
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
    CartesianSeries.prototype.checkRangeXY = function (x, y, xAxis, yAxis) {
        return !isNaN(x) && !isNaN(y) && xAxis.inRange(x) && yAxis.inRange(y);
    };
    CartesianSeries.prototype.update = function (_a) {
        var _b, _c;
        var seriesRect = _a.seriesRect;
        return __awaiter(this, void 0, void 0, function () {
            var visible, series, seriesHighlighted, newNodeDataDependencies, resize;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        visible = this.visible;
                        series = ((_c = (_b = this.ctx.highlightManager) === null || _b === void 0 ? void 0 : _b.getActiveHighlight()) !== null && _c !== void 0 ? _c : {}).series;
                        seriesHighlighted = series ? series === this : undefined;
                        newNodeDataDependencies = {
                            seriesRectWidth: seriesRect === null || seriesRect === void 0 ? void 0 : seriesRect.width,
                            seriesRectHeight: seriesRect === null || seriesRect === void 0 ? void 0 : seriesRect.height,
                        };
                        resize = json_1.jsonDiff(this.nodeDataDependencies, newNodeDataDependencies) != null;
                        if (resize) {
                            this.nodeDataDependencies = newNodeDataDependencies;
                            this.markNodeDataDirty();
                        }
                        return [4 /*yield*/, this.updateSelections(seriesHighlighted, visible)];
                    case 1:
                        _d.sent();
                        return [4 /*yield*/, this.updateNodes(seriesHighlighted, visible)];
                    case 2:
                        _d.sent();
                        if (resize) {
                            this.animationState.transition('resize', {
                                datumSelections: this.subGroups.map(function (_a) {
                                    var datumSelection = _a.datumSelection;
                                    return datumSelection;
                                }),
                                markerSelections: this.subGroups.map(function (_a) {
                                    var markerSelection = _a.markerSelection;
                                    return markerSelection;
                                }),
                                contextData: this._contextNodeData,
                                paths: this.subGroups.map(function (_a) {
                                    var paths = _a.paths;
                                    return paths;
                                }),
                            });
                        }
                        this.animationState.transition('update', {
                            datumSelections: this.subGroups.map(function (_a) {
                                var datumSelection = _a.datumSelection;
                                return datumSelection;
                            }),
                            markerSelections: this.subGroups.map(function (_a) {
                                var markerSelection = _a.markerSelection;
                                return markerSelection;
                            }),
                            labelSelections: this.subGroups.map(function (_a) {
                                var labelSelection = _a.labelSelection;
                                return labelSelection;
                            }),
                            contextData: this._contextNodeData,
                            paths: this.subGroups.map(function (_a) {
                                var paths = _a.paths;
                                return paths;
                            }),
                            seriesRect: seriesRect,
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    CartesianSeries.prototype.updateSelections = function (seriesHighlighted, anySeriesItemEnabled) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.updateHighlightSelection(seriesHighlighted)];
                    case 1:
                        _c.sent();
                        if (!anySeriesItemEnabled) {
                            return [2 /*return*/];
                        }
                        if (!this.nodeDataRefresh && !this.isPathOrSelectionDirty()) {
                            return [2 /*return*/];
                        }
                        if (!this.nodeDataRefresh) return [3 /*break*/, 4];
                        this.nodeDataRefresh = false;
                        if ((_a = this.chart) === null || _a === void 0 ? void 0 : _a.debug) {
                            logger_1.Logger.debug("CartesianSeries.updateSelections() - calling createNodeData() for", this.id);
                        }
                        _b = this;
                        return [4 /*yield*/, this.createNodeData()];
                    case 2:
                        _b._contextNodeData = _c.sent();
                        return [4 /*yield*/, this.updateSeriesGroups()];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4: return [4 /*yield*/, Promise.all(this.subGroups.map(function (g, i) { return _this.updateSeriesGroupSelections(g, i); }))];
                    case 5:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CartesianSeries.prototype.updateSeriesGroupSelections = function (subGroup, seriesIdx) {
        return __awaiter(this, void 0, void 0, function () {
            var datumSelection, labelSelection, markerSelection, contextData, nodeData, labelData, _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        datumSelection = subGroup.datumSelection, labelSelection = subGroup.labelSelection, markerSelection = subGroup.markerSelection;
                        contextData = this._contextNodeData[seriesIdx];
                        nodeData = contextData.nodeData, labelData = contextData.labelData;
                        _a = subGroup;
                        return [4 /*yield*/, this.updateDatumSelection({ nodeData: nodeData, datumSelection: datumSelection, seriesIdx: seriesIdx })];
                    case 1:
                        _a.datumSelection = _d.sent();
                        _b = subGroup;
                        return [4 /*yield*/, this.updateLabelSelection({ labelData: labelData, labelSelection: labelSelection, seriesIdx: seriesIdx })];
                    case 2:
                        _b.labelSelection = _d.sent();
                        if (!markerSelection) return [3 /*break*/, 4];
                        _c = subGroup;
                        return [4 /*yield*/, this.updateMarkerSelection({
                                nodeData: nodeData,
                                markerSelection: markerSelection,
                                seriesIdx: seriesIdx,
                            })];
                    case 3:
                        _c.markerSelection = _d.sent();
                        _d.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CartesianSeries.prototype.nodeFactory = function () {
        return new group_1.Group();
    };
    CartesianSeries.prototype.markerFactory = function () {
        var MarkerShape = util_1.getMarker();
        return new MarkerShape();
    };
    CartesianSeries.prototype.updateSeriesGroups = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, contextNodeData, contentGroup, subGroups, _b, pathsPerSeries, hasMarkers, totalGroups, layer, subGroupId, dataNodeGroup, markerGroup, labelGroup, paths, index;
            var _this = this;
            return __generator(this, function (_c) {
                _a = this, contextNodeData = _a._contextNodeData, contentGroup = _a.contentGroup, subGroups = _a.subGroups, _b = _a.opts, pathsPerSeries = _b.pathsPerSeries, hasMarkers = _b.hasMarkers;
                if (contextNodeData.length === subGroups.length) {
                    return [2 /*return*/];
                }
                if (contextNodeData.length < subGroups.length) {
                    subGroups.splice(contextNodeData.length).forEach(function (_a) {
                        var e_1, _b;
                        var dataNodeGroup = _a.dataNodeGroup, markerGroup = _a.markerGroup, labelGroup = _a.labelGroup, paths = _a.paths;
                        contentGroup.removeChild(dataNodeGroup);
                        if (markerGroup) {
                            contentGroup.removeChild(markerGroup);
                        }
                        if (labelGroup) {
                            contentGroup.removeChild(labelGroup);
                        }
                        try {
                            for (var paths_1 = __values(paths), paths_1_1 = paths_1.next(); !paths_1_1.done; paths_1_1 = paths_1.next()) {
                                var path = paths_1_1.value;
                                contentGroup.removeChild(path);
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (paths_1_1 && !paths_1_1.done && (_b = paths_1.return)) _b.call(paths_1);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                    });
                }
                totalGroups = contextNodeData.length;
                while (totalGroups > subGroups.length) {
                    layer = false;
                    subGroupId = this.subGroupId++;
                    dataNodeGroup = new group_1.Group({
                        name: this.id + "-series-sub" + subGroupId + "-dataNodes",
                        layer: layer,
                        zIndex: layers_1.Layers.SERIES_LAYER_ZINDEX,
                        zIndexSubOrder: this.getGroupZIndexSubOrder('data', subGroupId),
                    });
                    markerGroup = hasMarkers
                        ? new group_1.Group({
                            name: this.id + "-series-sub" + this.subGroupId++ + "-markers",
                            layer: layer,
                            zIndex: layers_1.Layers.SERIES_LAYER_ZINDEX,
                            zIndexSubOrder: this.getGroupZIndexSubOrder('marker', subGroupId),
                        })
                        : undefined;
                    labelGroup = new group_1.Group({
                        name: this.id + "-series-sub" + this.subGroupId++ + "-labels",
                        layer: layer,
                        zIndex: layers_1.Layers.SERIES_LABEL_ZINDEX,
                        zIndexSubOrder: this.getGroupZIndexSubOrder('labels', subGroupId),
                    });
                    contentGroup.appendChild(dataNodeGroup);
                    contentGroup.appendChild(labelGroup);
                    if (markerGroup) {
                        contentGroup.appendChild(markerGroup);
                    }
                    paths = [];
                    for (index = 0; index < pathsPerSeries; index++) {
                        paths[index] = new path_1.Path();
                        paths[index].zIndex = layers_1.Layers.SERIES_LAYER_ZINDEX;
                        paths[index].zIndexSubOrder = this.getGroupZIndexSubOrder('paths', index);
                        contentGroup.appendChild(paths[index]);
                    }
                    subGroups.push({
                        paths: paths,
                        dataNodeGroup: dataNodeGroup,
                        markerGroup: markerGroup,
                        labelGroup: labelGroup,
                        labelSelection: selection_1.Selection.select(labelGroup, text_1.Text),
                        datumSelection: selection_1.Selection.select(dataNodeGroup, function () { return _this.nodeFactory(); }, this.datumSelectionGarbageCollection),
                        markerSelection: markerGroup ? selection_1.Selection.select(markerGroup, function () { return _this.markerFactory(); }) : undefined,
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    CartesianSeries.prototype.getGroupZIndexSubOrder = function (type, subIndex) {
        var _a;
        if (subIndex === void 0) { subIndex = 0; }
        var result = _super.prototype.getGroupZIndexSubOrder.call(this, type, subIndex);
        if (type === 'paths') {
            var pathOffset_1 = (_a = this.opts.pathsZIndexSubOrderOffset[subIndex]) !== null && _a !== void 0 ? _a : 0;
            var superFn_1 = result[0];
            if (typeof superFn_1 === 'function') {
                result[0] = function () { return +superFn_1() + pathOffset_1; };
            }
            else {
                result[0] = +superFn_1 + pathOffset_1;
            }
        }
        return result;
    };
    CartesianSeries.prototype.updateNodes = function (seriesHighlighted, anySeriesItemEnabled) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, highlightSelection, highlightLabelSelection, contextNodeData, _c, hasMarkers, hasHighlightedLabels, visible, subGroupOpacities;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _b = this, highlightSelection = _b.highlightSelection, highlightLabelSelection = _b.highlightLabelSelection, contextNodeData = _b._contextNodeData, _c = _b.opts, hasMarkers = _c.hasMarkers, hasHighlightedLabels = _c.hasHighlightedLabels;
                        visible = this.visible && ((_a = this._contextNodeData) === null || _a === void 0 ? void 0 : _a.length) > 0 && anySeriesItemEnabled;
                        this.rootGroup.visible = visible;
                        this.contentGroup.visible = visible;
                        this.highlightGroup.visible = visible && !!seriesHighlighted;
                        subGroupOpacities = this.subGroups.map(function (_, index) {
                            var itemId = contextNodeData[index].itemId;
                            return _this.getOpacity({ itemId: itemId });
                        });
                        if (!hasMarkers) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.updateMarkerNodes({
                                markerSelection: highlightSelection,
                                isHighlight: true,
                                seriesIdx: -1,
                            })];
                    case 1:
                        _d.sent();
                        this.animationState.transition('highlightMarkers', highlightSelection);
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.updateDatumNodes({ datumSelection: highlightSelection, isHighlight: true, seriesIdx: -1 })];
                    case 3:
                        _d.sent();
                        this.animationState.transition('highlight', highlightSelection);
                        _d.label = 4;
                    case 4:
                        if (!hasHighlightedLabels) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.updateLabelNodes({ labelSelection: highlightLabelSelection, seriesIdx: -1 })];
                    case 5:
                        _d.sent();
                        _d.label = 6;
                    case 6: return [4 /*yield*/, Promise.all(this.subGroups.map(function (subGroup, seriesIdx) { return __awaiter(_this, void 0, void 0, function () {
                            var dataNodeGroup, markerGroup, datumSelection, labelSelection, markerSelection, paths, labelGroup, subGroupVisible, subGroupOpacity, paths_2, paths_2_1, path;
                            var e_2, _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        dataNodeGroup = subGroup.dataNodeGroup, markerGroup = subGroup.markerGroup, datumSelection = subGroup.datumSelection, labelSelection = subGroup.labelSelection, markerSelection = subGroup.markerSelection, paths = subGroup.paths, labelGroup = subGroup.labelGroup;
                                        subGroupVisible = visible;
                                        subGroupOpacity = subGroupOpacities[seriesIdx];
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
                                        try {
                                            for (paths_2 = __values(paths), paths_2_1 = paths_2.next(); !paths_2_1.done; paths_2_1 = paths_2.next()) {
                                                path = paths_2_1.value;
                                                path.opacity = subGroupOpacity;
                                                path.visible = subGroupVisible;
                                            }
                                        }
                                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                                        finally {
                                            try {
                                                if (paths_2_1 && !paths_2_1.done && (_a = paths_2.return)) _a.call(paths_2);
                                            }
                                            finally { if (e_2) throw e_2.error; }
                                        }
                                        if (!dataNodeGroup.visible) {
                                            return [2 /*return*/];
                                        }
                                        return [4 /*yield*/, this.updateDatumNodes({ datumSelection: datumSelection, isHighlight: false, seriesIdx: seriesIdx })];
                                    case 1:
                                        _b.sent();
                                        return [4 /*yield*/, this.updateLabelNodes({ labelSelection: labelSelection, seriesIdx: seriesIdx })];
                                    case 2:
                                        _b.sent();
                                        if (!(hasMarkers && markerSelection)) return [3 /*break*/, 4];
                                        return [4 /*yield*/, this.updateMarkerNodes({ markerSelection: markerSelection, isHighlight: false, seriesIdx: seriesIdx })];
                                    case 3:
                                        _b.sent();
                                        _b.label = 4;
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); }))];
                    case 7:
                        _d.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CartesianSeries.prototype.updateHighlightSelection = function (seriesHighlighted) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, highlightSelection, highlightLabelSelection, contextNodeData, highlightedDatum, item, _c, labelItem, _d, itemId_1, contextNodeData_1, contextNodeData_1_1, labelData, _e;
            var e_3, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _b = this, highlightSelection = _b.highlightSelection, highlightLabelSelection = _b.highlightLabelSelection, contextNodeData = _b._contextNodeData;
                        highlightedDatum = (_a = this.ctx.highlightManager) === null || _a === void 0 ? void 0 : _a.getActiveHighlight();
                        item = seriesHighlighted && (highlightedDatum === null || highlightedDatum === void 0 ? void 0 : highlightedDatum.datum) ? highlightedDatum : undefined;
                        _c = this;
                        return [4 /*yield*/, this.updateHighlightSelectionItem({ item: item, highlightSelection: highlightSelection })];
                    case 1:
                        _c.highlightSelection = _g.sent();
                        if (this.isLabelEnabled() && item != null) {
                            _d = item.itemId, itemId_1 = _d === void 0 ? undefined : _d;
                            try {
                                for (contextNodeData_1 = __values(contextNodeData), contextNodeData_1_1 = contextNodeData_1.next(); !contextNodeData_1_1.done; contextNodeData_1_1 = contextNodeData_1.next()) {
                                    labelData = contextNodeData_1_1.value.labelData;
                                    labelItem = labelData.find(function (ld) { return ld.datum === item.datum && ld.itemId === itemId_1; });
                                    if (labelItem != null) {
                                        break;
                                    }
                                }
                            }
                            catch (e_3_1) { e_3 = { error: e_3_1 }; }
                            finally {
                                try {
                                    if (contextNodeData_1_1 && !contextNodeData_1_1.done && (_f = contextNodeData_1.return)) _f.call(contextNodeData_1);
                                }
                                finally { if (e_3) throw e_3.error; }
                            }
                        }
                        _e = this;
                        return [4 /*yield*/, this.updateHighlightSelectionLabel({
                                item: labelItem,
                                highlightLabelSelection: highlightLabelSelection,
                            })];
                    case 2:
                        _e.highlightLabelSelection = _g.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CartesianSeries.prototype.pickNodeExactShape = function (point) {
        var e_4, _a;
        var result = _super.prototype.pickNodeExactShape.call(this, point);
        if (result) {
            return result;
        }
        var x = point.x, y = point.y;
        var hasMarkers = this.opts.hasMarkers;
        try {
            for (var _b = __values(this.subGroups), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = _c.value, dataNodeGroup = _d.dataNodeGroup, markerGroup = _d.markerGroup;
                var match = dataNodeGroup.pickNode(x, y);
                if (!match && hasMarkers) {
                    match = markerGroup === null || markerGroup === void 0 ? void 0 : markerGroup.pickNode(x, y);
                }
                if (match) {
                    return { datum: match.datum, distance: 0 };
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
    };
    CartesianSeries.prototype.pickNodeClosestDatum = function (point) {
        var e_5, _a, e_6, _b;
        var _c, _d;
        var x = point.x, y = point.y;
        var _e = this, axes = _e.axes, rootGroup = _e.rootGroup, contextNodeData = _e._contextNodeData;
        var xAxis = axes[chartAxisDirection_1.ChartAxisDirection.X];
        var yAxis = axes[chartAxisDirection_1.ChartAxisDirection.Y];
        var hitPoint = rootGroup.transformPoint(x, y);
        var minDistance = Infinity;
        var closestDatum;
        try {
            for (var contextNodeData_2 = __values(contextNodeData), contextNodeData_2_1 = contextNodeData_2.next(); !contextNodeData_2_1.done; contextNodeData_2_1 = contextNodeData_2.next()) {
                var context = contextNodeData_2_1.value;
                try {
                    for (var _f = (e_6 = void 0, __values(context.nodeData)), _g = _f.next(); !_g.done; _g = _f.next()) {
                        var datum = _g.value;
                        var _h = datum.point, _j = _h === void 0 ? {} : _h, _k = _j.x, datumX = _k === void 0 ? NaN : _k, _l = _j.y, datumY = _l === void 0 ? NaN : _l;
                        if (isNaN(datumX) || isNaN(datumY)) {
                            continue;
                        }
                        var isInRange = (xAxis === null || xAxis === void 0 ? void 0 : xAxis.inRange(datumX)) && (yAxis === null || yAxis === void 0 ? void 0 : yAxis.inRange(datumY));
                        if (!isInRange) {
                            continue;
                        }
                        // No need to use Math.sqrt() since x < y implies Math.sqrt(x) < Math.sqrt(y) for
                        // values > 1
                        var distance = Math.max(Math.pow((hitPoint.x - datumX), 2) + Math.pow((hitPoint.y - datumY), 2), 0);
                        if (distance < minDistance) {
                            minDistance = distance;
                            closestDatum = datum;
                        }
                    }
                }
                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                    }
                    finally { if (e_6) throw e_6.error; }
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (contextNodeData_2_1 && !contextNodeData_2_1.done && (_a = contextNodeData_2.return)) _a.call(contextNodeData_2);
            }
            finally { if (e_5) throw e_5.error; }
        }
        if (closestDatum) {
            var distance = Math.max(Math.sqrt(minDistance) - ((_d = (_c = closestDatum.point) === null || _c === void 0 ? void 0 : _c.size) !== null && _d !== void 0 ? _d : 0), 0);
            return { datum: closestDatum, distance: distance };
        }
    };
    CartesianSeries.prototype.pickNodeMainAxisFirst = function (point, requireCategoryAxis) {
        var e_7, _a, e_8, _b;
        var _c, _d;
        var x = point.x, y = point.y;
        var _e = this, axes = _e.axes, rootGroup = _e.rootGroup, contextNodeData = _e._contextNodeData;
        var xAxis = axes[chartAxisDirection_1.ChartAxisDirection.X];
        var yAxis = axes[chartAxisDirection_1.ChartAxisDirection.Y];
        // Prefer to start search with any available category axis.
        var directions = [xAxis, yAxis]
            .filter(function (a) { return a instanceof categoryAxis_1.CategoryAxis; })
            .map(function (a) { return a.direction; });
        if (requireCategoryAxis && directions.length === 0) {
            return;
        }
        // Default to X-axis unless we found a suitable category axis.
        var _f = __read(directions, 1), _g = _f[0], primaryDirection = _g === void 0 ? chartAxisDirection_1.ChartAxisDirection.X : _g;
        var hitPoint = rootGroup.transformPoint(x, y);
        var hitPointCoords = primaryDirection === chartAxisDirection_1.ChartAxisDirection.X ? [hitPoint.x, hitPoint.y] : [hitPoint.y, hitPoint.x];
        var minDistance = [Infinity, Infinity];
        var closestDatum = undefined;
        try {
            for (var contextNodeData_3 = __values(contextNodeData), contextNodeData_3_1 = contextNodeData_3.next(); !contextNodeData_3_1.done; contextNodeData_3_1 = contextNodeData_3.next()) {
                var context = contextNodeData_3_1.value;
                try {
                    for (var _h = (e_8 = void 0, __values(context.nodeData)), _j = _h.next(); !_j.done; _j = _h.next()) {
                        var datum = _j.value;
                        var _k = datum.point, _l = _k === void 0 ? {} : _k, _m = _l.x, datumX = _m === void 0 ? NaN : _m, _o = _l.y, datumY = _o === void 0 ? NaN : _o;
                        if (isNaN(datumX) || isNaN(datumY)) {
                            continue;
                        }
                        var isInRange = (xAxis === null || xAxis === void 0 ? void 0 : xAxis.inRange(datumX)) && (yAxis === null || yAxis === void 0 ? void 0 : yAxis.inRange(datumY));
                        if (!isInRange) {
                            continue;
                        }
                        var point_1 = primaryDirection === chartAxisDirection_1.ChartAxisDirection.X ? [datumX, datumY] : [datumY, datumX];
                        // Compare distances from most significant dimension to least.
                        var newMinDistance = true;
                        for (var i = 0; i < point_1.length; i++) {
                            var dist = Math.abs(point_1[i] - hitPointCoords[i]);
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
                catch (e_8_1) { e_8 = { error: e_8_1 }; }
                finally {
                    try {
                        if (_j && !_j.done && (_b = _h.return)) _b.call(_h);
                    }
                    finally { if (e_8) throw e_8.error; }
                }
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (contextNodeData_3_1 && !contextNodeData_3_1.done && (_a = contextNodeData_3.return)) _a.call(contextNodeData_3);
            }
            finally { if (e_7) throw e_7.error; }
        }
        if (closestDatum) {
            var distance = Math.max(Math.sqrt(Math.pow(minDistance[0], 2) + Math.pow(minDistance[1], 2)) - ((_d = (_c = closestDatum.point) === null || _c === void 0 ? void 0 : _c.size) !== null && _d !== void 0 ? _d : 0), 0);
            return { datum: closestDatum, distance: distance };
        }
    };
    CartesianSeries.prototype.onLegendItemClick = function (event) {
        var enabled = event.enabled, itemId = event.itemId, series = event.series, legendItemName = event.legendItemName;
        var matchedLegendItemName = this.legendItemName != null && this.legendItemName === legendItemName;
        if (series.id === this.id) {
            this.toggleSeriesItem(itemId, enabled);
        }
        else if (matchedLegendItemName) {
            this.toggleSeriesItem(itemId, enabled);
        }
    };
    CartesianSeries.prototype.onLegendItemDoubleClick = function (event) {
        var enabled = event.enabled, itemId = event.itemId, series = event.series, numVisibleItems = event.numVisibleItems, legendItemName = event.legendItemName;
        var totalVisibleItems = Object.values(numVisibleItems).reduce(function (p, v) { return p + v; }, 0);
        var matchedLegendItemName = this.legendItemName != null && this.legendItemName === legendItemName;
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
    };
    CartesianSeries.prototype.isPathOrSelectionDirty = function () {
        // Override point to allow more sophisticated dirty selection detection.
        return false;
    };
    CartesianSeries.prototype.getLabelData = function () {
        return [];
    };
    CartesianSeries.prototype.updateHighlightSelectionItem = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var hasMarkers, item, highlightSelection, nodeData, markerSelection;
            return __generator(this, function (_a) {
                hasMarkers = this.opts.hasMarkers;
                item = opts.item, highlightSelection = opts.highlightSelection;
                nodeData = item ? [item] : [];
                if (hasMarkers) {
                    markerSelection = highlightSelection;
                    return [2 /*return*/, this.updateMarkerSelection({ nodeData: nodeData, markerSelection: markerSelection, seriesIdx: -1 })];
                }
                else {
                    return [2 /*return*/, this.updateDatumSelection({ nodeData: nodeData, datumSelection: highlightSelection, seriesIdx: -1 })];
                }
                return [2 /*return*/];
            });
        });
    };
    CartesianSeries.prototype.updateHighlightSelectionLabel = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            var item, highlightLabelSelection, labelData;
            return __generator(this, function (_a) {
                item = opts.item, highlightLabelSelection = opts.highlightLabelSelection;
                labelData = item ? [item] : [];
                return [2 /*return*/, this.updateLabelSelection({ labelData: labelData, labelSelection: highlightLabelSelection, seriesIdx: -1 })];
            });
        });
    };
    CartesianSeries.prototype.updateDatumSelection = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Override point for sub-classes.
                return [2 /*return*/, opts.datumSelection];
            });
        });
    };
    CartesianSeries.prototype.updateDatumNodes = function (_opts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    CartesianSeries.prototype.updateMarkerSelection = function (opts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Override point for sub-classes.
                return [2 /*return*/, opts.markerSelection];
            });
        });
    };
    CartesianSeries.prototype.updateMarkerNodes = function (_opts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    CartesianSeries.prototype.animateEmptyUpdateReady = function (_data) {
        // Override point for sub-classes.
    };
    CartesianSeries.prototype.animateReadyUpdate = function (_data) {
        // Override point for sub-classes.
    };
    CartesianSeries.prototype.animateWaitingUpdateReady = function (_data) {
        // Override point for sub-classes.
    };
    CartesianSeries.prototype.animateReadyHighlight = function (_data) {
        // Override point for sub-classes.
    };
    CartesianSeries.prototype.animateReadyHighlightMarkers = function (_data) {
        // Override point for sub-classes.
    };
    CartesianSeries.prototype.animateReadyResize = function (_data) {
        // Override point for sub-classes.
    };
    __decorate([
        validation_1.Validate(validation_1.OPT_STRING)
    ], CartesianSeries.prototype, "legendItemName", void 0);
    return CartesianSeries;
}(series_1.Series));
exports.CartesianSeries = CartesianSeries;
var CartesianSeriesMarker = /** @class */ (function (_super) {
    __extends(CartesianSeriesMarker, _super);
    function CartesianSeriesMarker() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.formatter = undefined;
        return _this;
    }
    __decorate([
        validation_1.Validate(validation_1.OPT_FUNCTION),
        changeDetectable_1.SceneChangeDetection({ redraw: changeDetectable_1.RedrawType.MAJOR })
    ], CartesianSeriesMarker.prototype, "formatter", void 0);
    return CartesianSeriesMarker;
}(seriesMarker_1.SeriesMarker));
exports.CartesianSeriesMarker = CartesianSeriesMarker;
//# sourceMappingURL=cartesianSeries.js.map